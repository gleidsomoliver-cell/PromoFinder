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

module.exports = {
    getOffers
};
