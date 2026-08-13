const {
    getCategoryHighlights,
    getItem
} = require('../services/mercadoLivreApiService.js');

const SUPPORTED_TYPES = new Set(['ITEM', 'PRODUCT', 'USER_PRODUCT']);

function toItemOffer(item) {
    const image = item.thumbnail || item.pictures?.[0]?.secure_url || item.pictures?.[0]?.url;
    const availability = Number.isFinite(item.available_quantity)
        ? item.available_quantity
        : null;

    return {
        title: typeof item.title === 'string' ? item.title : null,
        price: Number.isFinite(item.price) ? item.price : null,
        image: typeof image === 'string' ? image : null,
        status: typeof item.status === 'string' ? item.status : null,
        availableQuantity: availability,
        permalink: typeof item.permalink === 'string' ? item.permalink : null
    };
}

function isValidOffer(offer) {
    return Boolean(
        Number.isFinite(offer.price)
        && offer.price > 0
        && offer.image
        && offer.status === 'active'
        && Number.isFinite(offer.availableQuantity)
        && offer.availableQuantity > 0
        && offer.permalink
    );
}

function getDiscardReasons(offer) {
    return {
        inactive: offer.status !== 'active',
        missingPrice: !Number.isFinite(offer.price) || offer.price <= 0,
        missingImage: !offer.image,
        unavailable: !Number.isFinite(offer.availableQuantity)
            || offer.availableQuantity <= 0,
        missingPermalink: !offer.permalink
    };
}

async function diagnoseCategoryHighlights(categoryId) {
    if (!/^MLB\d+$/.test(categoryId)) {
        throw new TypeError('categoryId deve ter o formato MLB seguido de números.');
    }

    const content = await getCategoryHighlights(categoryId);
    const grouped = { ITEM: [], PRODUCT: [], USER_PRODUCT: [] };

    for (const entry of content) {
        if (entry && SUPPORTED_TYPES.has(entry.type)) grouped[entry.type].push(entry);
    }

    const itemOffers = [];
    const itemDiagnostics = {
        itemLookupAttempts: 0,
        itemLookupSuccess: 0,
        itemLookupHttp400: 0,
        itemLookupHttp401: 0,
        itemLookupHttp403: 0,
        itemLookupHttp404: 0,
        itemLookupOtherError: 0,
        discardedInactive: 0,
        discardedMissingPrice: 0,
        discardedMissingImage: 0,
        discardedUnavailable: 0,
        discardedMissingPermalink: 0,
        invalidItems: 0
    };

    for (const entry of grouped.ITEM) {
        itemDiagnostics.itemLookupAttempts += 1;
        try {
            const item = await getItem(entry.id);
            itemDiagnostics.itemLookupSuccess += 1;
            const offer = toItemOffer(item);
            const discardReasons = getDiscardReasons(offer);

            if (discardReasons.inactive) itemDiagnostics.discardedInactive += 1;
            if (discardReasons.missingPrice) itemDiagnostics.discardedMissingPrice += 1;
            if (discardReasons.missingImage) itemDiagnostics.discardedMissingImage += 1;
            if (discardReasons.unavailable) itemDiagnostics.discardedUnavailable += 1;
            if (discardReasons.missingPermalink) {
                itemDiagnostics.discardedMissingPermalink += 1;
            }

            if (isValidOffer(offer)) {
                itemOffers.push(offer);
            } else {
                itemDiagnostics.invalidItems += 1;
            }
        } catch (error) {
            const statusCounter = {
                400: 'itemLookupHttp400',
                401: 'itemLookupHttp401',
                403: 'itemLookupHttp403',
                404: 'itemLookupHttp404'
            }[error?.statusCode];

            if (statusCounter) itemDiagnostics[statusCounter] += 1;
            else itemDiagnostics.itemLookupOtherError += 1;
        }
    }

    const diagnostics = {
        categoryId,
        highlightsTotal: content.length,
        itemCount: grouped.ITEM.length,
        productCount: grouped.PRODUCT.length,
        userProductCount: grouped.USER_PRODUCT.length,
        itemDetailsFetched: itemDiagnostics.itemLookupSuccess,
        itemLookupAttempts: itemDiagnostics.itemLookupAttempts,
        itemLookupSuccess: itemDiagnostics.itemLookupSuccess,
        itemLookupHttp400: itemDiagnostics.itemLookupHttp400,
        itemLookupHttp401: itemDiagnostics.itemLookupHttp401,
        itemLookupHttp403: itemDiagnostics.itemLookupHttp403,
        itemLookupHttp404: itemDiagnostics.itemLookupHttp404,
        itemLookupOtherError: itemDiagnostics.itemLookupOtherError,
        discardedInactive: itemDiagnostics.discardedInactive,
        discardedMissingPrice: itemDiagnostics.discardedMissingPrice,
        discardedMissingImage: itemDiagnostics.discardedMissingImage,
        discardedUnavailable: itemDiagnostics.discardedUnavailable,
        discardedMissingPermalink: itemDiagnostics.discardedMissingPermalink,
        validItems: itemOffers.length,
        invalidItems: itemDiagnostics.invalidItems
    };

    console.info('Diagnóstico seguro de highlights do Mercado Livre.', diagnostics);

    return { diagnostics, itemOffers };
}

async function diagnoseCategoriesHighlights(categoryIds) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new TypeError('categoryIds deve ser uma lista não vazia.');
    }

    const results = [];
    for (const categoryId of categoryIds) {
        const { diagnostics } = await diagnoseCategoryHighlights(categoryId);
        results.push(diagnostics);
    }

    return results;
}

if (require.main === module) {
    const categoryId = process.argv[2] || process.env.MERCADOLIVRE_HIGHLIGHTS_CATEGORY_ID;
    diagnoseCategoryHighlights(categoryId)
        .catch(error => {
            console.error('Falha segura no diagnóstico de highlights do Mercado Livre.', {
                category: error.category || error.name,
                stage: error.stage || 'diagnostic'
            });
            process.exitCode = 1;
        });
}

module.exports = {
    diagnoseCategoriesHighlights,
    diagnoseCategoryHighlights,
    getDiscardReasons,
    isValidOffer,
    toItemOffer
};
