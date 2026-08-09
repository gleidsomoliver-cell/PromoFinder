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

const server = http.createServer(async (request, response) => {
    try {
        if (request.method === 'OPTIONS') {
            response.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            response.end();
            return;
        }

        if (request.method === 'GET' && request.url === '/api/offers') {
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
