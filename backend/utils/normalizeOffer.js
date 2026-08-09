const OPTIONAL_FIELDS = [
    'oldPrice',
    'discount',
    'productUrl',
    'affiliateUrl',
    'couponCode',
    'couponExpiry'
];

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function normalizeStore(store) {
    if (isNonEmptyString(store)) {
        return store.trim();
    }

    if (Array.isArray(store)) {
        const stores = store
            .filter(isNonEmptyString)
            .map(item => item.trim());

        return stores.length > 0 ? stores : null;
    }

    return null;
}

function normalizeOffer(offer) {
    if (!offer || typeof offer !== 'object') {
        return null;
    }

    const store = normalizeStore(offer.store);
    const hasRequiredFields =
        isNonEmptyString(offer.id) &&
        isNonEmptyString(offer.name) &&
        store !== null &&
        isNonEmptyString(offer.category) &&
        isNonEmptyString(offer.price) &&
        isNonEmptyString(offer.image) &&
        typeof offer.available === 'boolean';

    if (!hasRequiredFields) {
        return null;
    }

    const normalizedOffer = {
        id: offer.id.trim(),
        name: offer.name.trim(),
        store,
        category: offer.category.trim(),
        price: offer.price.trim(),
        oldPrice: null,
        discount: null,
        image: offer.image.trim(),
        productUrl: null,
        affiliateUrl: null,
        couponCode: null,
        couponExpiry: null,
        available: offer.available
    };

    OPTIONAL_FIELDS.forEach(field => {
        if (offer[field] !== undefined) {
            normalizedOffer[field] = offer[field];
        }
    });

    return normalizedOffer;
}

module.exports = {
    normalizeOffer
};
