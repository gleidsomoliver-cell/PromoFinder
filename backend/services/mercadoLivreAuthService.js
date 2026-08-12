const TOKEN_ENDPOINT = 'https://api.mercadolibre.com/oauth/token';
const REQUIRED_ENVIRONMENT_VARIABLES = [
    'MERCADOLIVRE_CLIENT_ID',
    'MERCADOLIVRE_CLIENT_SECRET',
    'MERCADOLIVRE_REDIRECT_URI'
];

class MercadoLivreAuthError extends Error {
    constructor(type) {
        super(type);
        this.name = 'MercadoLivreAuthError';
        this.type = type;
    }
}

function getOAuthConfiguration() {
    const missingVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter(
        variableName => !process.env[variableName]?.trim()
    );

    if (missingVariables.length > 0) {
        return { missingVariables };
    }

    return {
        clientId: process.env.MERCADOLIVRE_CLIENT_ID,
        clientSecret: process.env.MERCADOLIVRE_CLIENT_SECRET,
        redirectUri: process.env.MERCADOLIVRE_REDIRECT_URI,
        missingVariables: []
    };
}

async function exchangeAuthorizationCode(code, configuration) {
    const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code,
        redirect_uri: configuration.redirectUri
    });

    let tokenResponse;

    try {
        tokenResponse = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: requestBody,
            signal: AbortSignal.timeout(10000)
        });
    } catch {
        throw new MercadoLivreAuthError('network_error');
    }

    let tokenData;

    try {
        tokenData = JSON.parse(await tokenResponse.text());
    } catch {
        throw new MercadoLivreAuthError('invalid_json');
    }

    if (!tokenResponse.ok) {
        throw new MercadoLivreAuthError('invalid_response');
    }

    if (!tokenData || typeof tokenData.access_token !== 'string' || !tokenData.access_token) {
        throw new MercadoLivreAuthError('missing_access_token');
    }
}

module.exports = {
    MercadoLivreAuthError,
    exchangeAuthorizationCode,
    getOAuthConfiguration
};
