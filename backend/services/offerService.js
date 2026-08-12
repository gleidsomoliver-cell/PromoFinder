const { normalizeOffer } = require('../utils/normalizeOffer.js');

async function getOffers(adapters) {
    const offersBySource = await Promise.all(
        adapters.map(adapter => adapter.getOffers())
    );

    return offersBySource
        .flat()
        .map(normalizeOffer)
        .filter(Boolean);
}

async function getOffersWithFallback(primaryAdapters, fallbackAdapters) {
    try {
        const offers = await getOffers(primaryAdapters);
        if (offers.length > 0) return offers;

        console.warn('Fallback local de ofertas ativado.', {
            category: 'empty_response',
            resource: '/products/search',
            stage: 'offer_selection',
            status: 200
        });
    } catch (error) {
        console.error('Fallback local de ofertas ativado.', {
            category: error.category || 'unexpected_error',
            resource: error.resource || null,
            stage: error.stage || 'external_offer_source',
            status: error.statusCode || null
        });
    }

    return getOffers(fallbackAdapters);
}

module.exports = {
    getOffers,
    getOffersWithFallback
};
