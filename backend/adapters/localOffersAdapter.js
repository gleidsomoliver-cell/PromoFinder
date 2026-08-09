const localOffers = require('../../js/offers-data.js');

async function getOffers() {
    return localOffers;
}

module.exports = {
    getOffers
};
