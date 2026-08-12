const {
    getOAuthConfiguration,
    refreshAccessToken
} = require('./mercadoLivreAuthService.js');
const { loadTokenData, saveTokenData } = require('./tokenStore.js');

const API_BASE_URL = 'https://api.mercadolibre.com';
const EXPIRY_MARGIN_MS = 60_000;
const MAX_RATE_LIMIT_RETRIES = 2;
let refreshInProgress = null;

class MercadoLivreApiError extends Error {
    constructor(category, { resource = null, stage, statusCode = null } = {}) {
        super(category);
        this.name = 'MercadoLivreApiError';
        this.category = category;
        this.resource = resource;
        this.stage = stage;
        this.statusCode = statusCode;
        this.type = category;
    }
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function renewToken(tokenData) {
    if (!tokenData.refreshToken) {
        throw new MercadoLivreApiError('reauthorization_required', { stage: 'token_refresh' });
    }

    if (!refreshInProgress) {
        refreshInProgress = (async () => {
            const configuration = getOAuthConfiguration();
            if (configuration.missingVariables.length > 0) {
                throw new MercadoLivreApiError('missing_oauth_configuration', {
                    stage: 'token_refresh'
                });
            }

            try {
                const renewedToken = await refreshAccessToken(
                    tokenData.refreshToken,
                    configuration
                );
                await saveTokenData(renewedToken);
                return renewedToken;
            } catch (error) {
                if (error instanceof MercadoLivreApiError) throw error;
                throw new MercadoLivreApiError(error.type || 'token_refresh_error', {
                    resource: '/oauth/token',
                    stage: 'token_refresh'
                });
            }
        })().finally(() => {
            refreshInProgress = null;
        });
    }

    return refreshInProgress;
}

async function getValidToken(forceRefresh = false) {
    let tokenData;
    try {
        tokenData = await loadTokenData();
    } catch {
        throw new MercadoLivreApiError('token_store_error', { stage: 'token_load' });
    }

    if (!tokenData?.accessToken) {
        throw new MercadoLivreApiError('missing_token', { stage: 'token_load' });
    }

    if (forceRefresh || !tokenData.expiresAt || Date.now() >= tokenData.expiresAt - EXPIRY_MARGIN_MS) {
        if (!tokenData.refreshToken) {
            throw new MercadoLivreApiError('reauthorization_required', {
                stage: 'token_validation'
            });
        }
        return renewToken(tokenData);
    }

    return tokenData;
}

async function authenticatedFetch(pathname, options = {}, allowTokenRefresh = true) {
    const tokenData = await getValidToken();
    const resourcePath = new URL(pathname, API_BASE_URL).pathname;
    const resource = /^\/products\/(?!search$)[^/]+$/.test(resourcePath)
        ? '/products/{product_id}'
        : resourcePath;
    let response;

    for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
        try {
            response = await fetch(`${API_BASE_URL}${pathname}`, {
                ...options,
                headers: {
                    Accept: 'application/json',
                    ...options.headers,
                    Authorization: `Bearer ${tokenData.accessToken}`
                },
                signal: AbortSignal.timeout(10000)
            });
        } catch {
            throw new MercadoLivreApiError('network_error', {
                resource,
                stage: 'api_request'
            });
        }

        if (response.status !== 429 || attempt === MAX_RATE_LIMIT_RETRIES) break;
        await response.body?.cancel();
        const retryAfter = Number.parseInt(response.headers.get('retry-after'), 10);
        const backoff = Number.isFinite(retryAfter)
            ? Math.min(retryAfter * 1000, 5000)
            : (250 * (2 ** attempt)) + Math.floor(Math.random() * 200);
        await wait(backoff);
    }

    if (response.status === 401 && allowTokenRefresh) {
        if (!tokenData.refreshToken) {
            throw new MercadoLivreApiError('reauthorization_required', {
                resource,
                stage: 'api_authentication',
                statusCode: 401
            });
        }
        await getValidToken(true);
        return authenticatedFetch(pathname, options, false);
    }

    if (response.status === 429) {
        throw new MercadoLivreApiError('rate_limited', {
            resource,
            stage: 'api_request',
            statusCode: 429
        });
    }
    if (!response.ok) {
        throw new MercadoLivreApiError('http_error', {
            resource,
            stage: response.status === 401 || response.status === 403
                ? 'api_authentication'
                : 'api_request',
            statusCode: response.status
        });
    }

    try {
        return JSON.parse(await response.text());
    } catch {
        throw new MercadoLivreApiError('invalid_json', {
            resource,
            stage: 'response_parse',
            statusCode: response.status
        });
    }
}

async function searchCatalogProducts(query, limit = 3) {
    const searchParameters = new URLSearchParams({
        site_id: 'MLB',
        status: 'active',
        q: query,
        limit: String(limit)
    });
    const search = await authenticatedFetch(`/products/search?${searchParameters}`);

    if (!Array.isArray(search.results)) {
        throw new MercadoLivreApiError('invalid_items_response', {
            resource: '/products/search',
            stage: 'response_validation',
            statusCode: 200
        });
    }

    return search.results;
}

async function getCatalogProduct(productId) {
    const product = await authenticatedFetch(`/products/${encodeURIComponent(productId)}`);

    if (!product || product.id !== productId) {
        throw new MercadoLivreApiError('invalid_product_response', {
            resource: '/products/{product_id}',
            stage: 'response_validation',
            statusCode: 200
        });
    }

    return product;
}

module.exports = {
    getCatalogProduct,
    MercadoLivreApiError,
    searchCatalogProducts
};
