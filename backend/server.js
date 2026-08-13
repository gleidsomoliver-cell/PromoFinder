const http = require('node:http');
const crypto = require('node:crypto');
const localOffersAdapter = require('./adapters/localOffersAdapter.js');
const mercadoLivreOffersAdapter = require('./adapters/mercadoLivreOffersAdapter.js');
const {
    diagnoseCategoryHighlights
} = require('./diagnostics/mercadoLivreHighlightsDiagnostic.js');
const {
    MercadoLivreAuthError,
    exchangeAuthorizationCode,
    getOAuthConfiguration
} = require('./services/mercadoLivreAuthService.js');
const { getOffersWithFallback } = require('./services/offerService.js');
const {
    getStoreConfiguration,
    logMemoryStoreWarning,
    saveTokenData
} = require('./services/tokenStore.js');

const port = Number.parseInt(process.env.PORT, 10) || 3000;
const HIGHLIGHTS_DIAGNOSTIC_CATEGORY_ID = 'MLB432825';
const HIGHLIGHTS_DIAGNOSTIC_HEADER = 'x-highlights-diagnostic-key';

function hasValidDiagnosticKey(request) {
    const configuredKey = process.env.HIGHLIGHTS_DIAGNOSTIC_KEY;
    const providedKey = request.headers[HIGHLIGHTS_DIAGNOSTIC_HEADER];

    if (!configuredKey || typeof providedKey !== 'string') return false;

    const configuredBuffer = Buffer.from(configuredKey, 'utf8');
    const providedBuffer = Buffer.from(providedKey, 'utf8');
    return configuredBuffer.length === providedBuffer.length
        && crypto.timingSafeEqual(configuredBuffer, providedBuffer);
}

function sendJson(response, statusCode, data) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });
    response.end(JSON.stringify(data));
}

function sendHtml(response, statusCode, message) {
    response.writeHead(statusCode, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
    });
    response.end(`<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Autorização do Mercado Livre</title>
</head>
<body>
    <main>
        <h1>PromoFinder</h1>
        <p>${message}</p>
    </main>
</body>
</html>`);
}

const server = http.createServer(async (request, response) => {
    try {
        const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

        if (request.method === 'OPTIONS') {
            response.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            response.end();
            return;
        }

        if (request.method === 'GET' && requestUrl.pathname === '/auth/mercadolivre/callback') {
            const authorizationError = requestUrl.searchParams.get('error');
            const authorizationCode = requestUrl.searchParams.get('code');

            if (authorizationError) {
                const message = authorizationError === 'access_denied'
                    ? 'A autorização do Mercado Livre foi cancelada ou negada.'
                    : 'A autorização do Mercado Livre não foi concluída.';

                sendHtml(response, 200, `${message} Você pode fechar esta janela.`);
                return;
            }

            if (authorizationCode) {
                const configuration = getOAuthConfiguration();
                const storeConfiguration = getStoreConfiguration();

                const missingVariables = [
                    ...configuration.missingVariables,
                    ...storeConfiguration.missingVariables
                ];

                if (missingVariables.length > 0) {
                    sendHtml(
                        response,
                        503,
                        `A autorização não pôde ser concluída porque a configuração do servidor está incompleta: ${missingVariables.join(', ')}.`
                    );
                    return;
                }

                if (storeConfiguration.invalidVariables) {
                    sendHtml(
                        response,
                        503,
                        `A autorização não pôde ser concluída porque a configuração do servidor é inválida: ${storeConfiguration.invalidVariables.join(', ')}.`
                    );
                    return;
                }

                try {
                    const tokenData = await exchangeAuthorizationCode(authorizationCode, configuration);
                    await saveTokenData(tokenData);
                    if (!tokenData.refreshToken) {
                        console.warn(
                            'Autorização do Mercado Livre recebida sem renovação automática; nova autorização será necessária após a expiração.'
                        );
                    }
                } catch (error) {
                    if (error instanceof MercadoLivreAuthError) {
                        console.error(`Falha segura na autenticação do Mercado Livre: ${error.type}.`);
                    } else {
                        console.error('Falha segura ao armazenar a autorização do Mercado Livre.');
                    }

                    sendHtml(
                        response,
                        502,
                        'Não foi possível concluir a autorização do Mercado Livre. Tente novamente.'
                    );
                    return;
                }

                sendHtml(
                    response,
                    200,
                    'Autorização do Mercado Livre concluída com sucesso. Você pode fechar esta janela.'
                );
                return;
            }

            sendHtml(
                response,
                400,
                'Nenhum código de autorização do Mercado Livre foi recebido.'
            );
            return;
        }

        if (request.method === 'GET' && requestUrl.pathname === '/api/offers') {
            const offers = await getOffersWithFallback(
                [mercadoLivreOffersAdapter],
                [localOffersAdapter]
            );

            sendJson(response, 200, offers);
            return;
        }

        if (
            request.method === 'GET'
            && requestUrl.pathname === '/api/diagnostics/mercadolivre/highlights'
        ) {
            if (!process.env.HIGHLIGHTS_DIAGNOSTIC_KEY) {
                response.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
                response.end();
                return;
            }

            if (!hasValidDiagnosticKey(request)) {
                response.writeHead(401, { 'Access-Control-Allow-Origin': '*' });
                response.end();
                return;
            }

            try {
                const { diagnostics } = await diagnoseCategoryHighlights(
                    HIGHLIGHTS_DIAGNOSTIC_CATEGORY_ID
                );
                sendJson(response, 200, diagnostics);
            } catch (error) {
                console.error('Falha segura na rota de diagnóstico de highlights.', {
                    category: error.category || error.name,
                    stage: error.stage || 'diagnostic'
                });
                response.writeHead(502, { 'Access-Control-Allow-Origin': '*' });
                response.end();
            }
            return;
        }

        sendJson(response, 404, { error: 'Rota não encontrada.' });
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        sendJson(response, 500, { error: 'Erro interno do servidor.' });
    }
});

server.on('error', error => {
    console.error('Não foi possível iniciar o servidor:', error.message);
    process.exitCode = 1;
});

server.listen(port, () => {
    if (getStoreConfiguration().mode === 'memory') logMemoryStoreWarning();
    console.log(`PromoFinder API disponível em http://localhost:${port}/api/offers`);
});
