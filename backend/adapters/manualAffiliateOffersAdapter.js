const {
    manualAffiliateOffers
} = require('../data/manualAffiliateOffers.js');

async function getOffers() {
    return manualAffiliateOffers;
}

module.exports = {
    getOffers
};
