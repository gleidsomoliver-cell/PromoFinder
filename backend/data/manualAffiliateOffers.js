const {
    isAffiliatePriceVerified,
    parseFullIsoTimestamp
} = require('../utils/priceVerification.js');

const REQUIRED_PUBLISHABLE_FIELDS = Object.freeze([
    'name',
    'price',
    'image',
    'productUrl',
    'affiliateUrl',
    'lastVerifiedAt'
]);
const BRL_PRICE_PATTERN = /^R\$ (?:0|[1-9]\d{0,2}(?:\.\d{3})*),\d{2}$/;
const URL_FIELDS = Object.freeze([
    'image',
    'productUrl',
    'affiliateUrl'
]);

function createPendingMercadoLivreSlot(sequence) {
    return Object.freeze({
        id: `mercadolivre-test-${String(sequence).padStart(3, '0')}`,
        name: '',
        store: Object.freeze(['Mercado Livre']),
        category: null,
        price: '',
        oldPrice: null,
        discount: null,
        image: '',
        productUrl: '',
        affiliateUrl: '',
        available: false,
        source: 'mercadolivre-affiliate',
        lastVerifiedAt: '',
        referencePrice: null,
        referencePriceCapturedAt: null,
        status: 'pendingVerification'
    });
}

const manualAffiliateOffers = Object.freeze(
    Array.from({ length: 10 }, (_, index) => createPendingMercadoLivreSlot(index + 1))
);

function hasNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isHttpUrl(value) {
    if (!hasNonEmptyString(value)) return false;

    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function getMissingCompletionFields(offer) {
    const missingFields = REQUIRED_PUBLISHABLE_FIELDS.filter(field => {
        return !hasNonEmptyString(offer?.[field]);
    });

    if (!BRL_PRICE_PATTERN.test(offer?.price || '')) missingFields.push('price:brl');
    URL_FIELDS.forEach(field => {
        if (!isHttpUrl(offer?.[field])) missingFields.push(`${field}:url`);
    });
    if (offer?.available !== true) missingFields.push('available');
    if (offer?.status !== 'active') missingFields.push('status');
    if (parseFullIsoTimestamp(offer?.lastVerifiedAt) === null) {
        missingFields.push('lastVerifiedAt:fullIsoTimestamp');
    }

    return Object.freeze([...new Set(missingFields)]);
}

function listCompleteManualAffiliateOffers() {
    return manualAffiliateOffers.filter(offer => getMissingCompletionFields(offer).length === 0);
}

function listPendingManualAffiliateOffers() {
    return manualAffiliateOffers.map(offer => ({
        offer,
        missingFields: getMissingCompletionFields(offer)
    })).filter(item => item.missingFields.length > 0);
}

function countPendingManualAffiliateOffers() {
    return listPendingManualAffiliateOffers().length;
}

function listPublishableManualAffiliateOffers(now = new Date()) {
    return listCompleteManualAffiliateOffers()
        .filter(offer => isAffiliatePriceVerified(offer, now));
}

function listExpiredManualAffiliateOffers(now = new Date()) {
    return listCompleteManualAffiliateOffers()
        .filter(offer => !isAffiliatePriceVerified(offer, now));
}

function countExpiredManualAffiliateOffers(now = new Date()) {
    return listExpiredManualAffiliateOffers(now).length;
}

function withUpdatedLastVerifiedAt(offerId, lastVerifiedAt) {
    if (parseFullIsoTimestamp(lastVerifiedAt) === null) {
        throw new TypeError('lastVerifiedAt deve ser um timestamp ISO completo com fuso horario.');
    }

    const offer = manualAffiliateOffers.find(item => item.id === offerId);
    if (!offer) throw new RangeError('Oferta manual nao encontrada.');

    return Object.freeze({ ...offer, lastVerifiedAt });
}

module.exports = {
    countExpiredManualAffiliateOffers,
    countPendingManualAffiliateOffers,
    getMissingCompletionFields,
    listCompleteManualAffiliateOffers,
    listExpiredManualAffiliateOffers,
    listPendingManualAffiliateOffers,
    listPublishableManualAffiliateOffers,
    manualAffiliateOffers,
    withUpdatedLastVerifiedAt
};
