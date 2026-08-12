const http = require('node:http');
const localOffersAdapter = require('./adapters/localOffersAdapter.js');
const { getOffers } = require('./services/offerService.js');

const port = Number.parseInt(process.env.PORT, 10) || 3000;

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
                sendHtml(
                    response,
                    200,
                    'Autorização do Mercado Livre recebida com sucesso. Você pode fechar esta janela.'
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
            const offers = await getOffers([localOffersAdapter]);

            sendJson(response, 200, offers);
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
    console.log(`PromoFinder API disponível em http://localhost:${port}/api/offers`);
});
