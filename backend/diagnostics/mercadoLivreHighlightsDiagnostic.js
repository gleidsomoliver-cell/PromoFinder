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
        offer.title
        && Number.isFinite(offer.price)
        && offer.price >= 0
        && offer.image
        && offer.status === 'active'
        && Number.isFinite(offer.availableQuantity)
        && offer.availableQuantity > 0
        && offer.permalink
    );
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
    let itemDetailsFetched = 0;
    let invalidItems = 0;

    for (const entry of grouped.ITEM) {
        try {
            const item = await getItem(entry.id);
            itemDetailsFetched += 1;
            const offer = toItemOffer(item);
            if (isValidOffer(offer)) itemOffers.push(offer);
            else invalidItems += 1;
        } catch {
            invalidItems += 1;
        }
    }

    const diagnostics = {
        highlightsTotal: content.length,
        itemCount: grouped.ITEM.length,
        productCount: grouped.PRODUCT.length,
        userProductCount: grouped.USER_PRODUCT.length,
        itemDetailsFetched,
        validItems: itemOffers.length,
        invalidItems
    };

    console.info('Diagnóstico seguro de highlights do Mercado Livre.', diagnostics);

    return { diagnostics, itemOffers };
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
    diagnoseCategoryHighlights,
    isValidOffer,
    toItemOffer
};
