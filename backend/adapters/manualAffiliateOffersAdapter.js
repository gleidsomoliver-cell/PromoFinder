const {
    listPublishableManualAffiliateOffers
} = require('../data/manualAffiliateOffers.js');

async function getOffers() {
    return listPublishableManualAffiliateOffers();
}

module.exports = {
    getOffers
};
