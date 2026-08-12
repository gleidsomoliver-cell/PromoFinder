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
    } catch (error) {
        console.error('Fonte externa de ofertas indisponível; usando fallback local.');
    }

    return getOffers(fallbackAdapters);
}

module.exports = {
    getOffers,
    getOffersWithFallback
};
