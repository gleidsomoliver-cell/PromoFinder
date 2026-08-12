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
    constructor(type, statusCode) {
        super(type);
        this.name = 'MercadoLivreApiError';
        this.statusCode = statusCode;
        this.type = type;
    }
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function renewToken(tokenData) {
    if (!refreshInProgress) {
        refreshInProgress = (async () => {
            const configuration = getOAuthConfiguration();
            if (configuration.missingVariables.length > 0) {
                throw new MercadoLivreApiError('missing_oauth_configuration');
            }

            const renewedToken = await refreshAccessToken(tokenData.refreshToken, configuration);
            await saveTokenData(renewedToken);
            return renewedToken;
        })().finally(() => {
            refreshInProgress = null;
        });
    }

    return refreshInProgress;
}

async function getValidToken(forceRefresh = false) {
    const tokenData = await loadTokenData();
    if (!tokenData?.accessToken || !tokenData?.refreshToken) {
        throw new MercadoLivreApiError('missing_token');
    }

    if (forceRefresh || !tokenData.expiresAt || Date.now() >= tokenData.expiresAt - EXPIRY_MARGIN_MS) {
        return renewToken(tokenData);
    }

    return tokenData;
}

async function authenticatedFetch(pathname, options = {}, allowTokenRefresh = true) {
    const tokenData = await getValidToken();
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
            throw new MercadoLivreApiError('network_error');
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
        await getValidToken(true);
        return authenticatedFetch(pathname, options, false);
    }

    if (response.status === 429) throw new MercadoLivreApiError('rate_limited', 429);
    if (!response.ok) throw new MercadoLivreApiError('invalid_response', response.status);

    try {
        return JSON.parse(await response.text());
    } catch {
        throw new MercadoLivreApiError('invalid_json', response.status);
    }
}

async function searchPublicItems(query, limit = 5) {
    const searchParameters = new URLSearchParams({
        q: query,
        limit: String(limit)
    });
    const search = await authenticatedFetch(`/sites/MLB/search?${searchParameters}`);

    if (!Array.isArray(search.results)) {
        throw new MercadoLivreApiError('invalid_items_response');
    }

    return search.results;
}

module.exports = {
    MercadoLivreApiError,
    searchPublicItems
};
