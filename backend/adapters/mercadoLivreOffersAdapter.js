const { searchPublicItems } = require('../services/mercadoLivreApiService.js');

const DEFAULT_SEARCH_QUERIES = [
    'celular',
    'notebook',
    'smart tv',
    'fone de ouvido'
];

function getSearchQueries() {
    const configuredQueries = process.env.MERCADOLIVRE_SEARCH_QUERIES
        ?.split(',')
        .map(query => query.trim())
        .filter(Boolean);

    return configuredQueries?.length ? configuredQueries.slice(0, 6) : DEFAULT_SEARCH_QUERIES;
}

function formatPrice(value, currency) {
    if (!Number.isFinite(value)) return null;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL'
    }).format(value);
}

function calculateDiscount(price, originalPrice) {
    if (!Number.isFinite(price) || !Number.isFinite(originalPrice) || originalPrice <= price) {
        return null;
    }

    return `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`;
}

function mapItemToOffer(item) {
    return {
        id: item.id,
        name: item.title,
        store: 'Mercado Livre',
        category: item.category_id,
        price: formatPrice(item.price, item.currency_id),
        oldPrice: formatPrice(item.original_price, item.currency_id),
        discount: calculateDiscount(item.price, item.original_price),
        image: item.secure_thumbnail || item.thumbnail,
        productUrl: item.permalink,
        affiliateUrl: null,
        available: item.available_quantity > 0
    };
}

async function getOffers() {
    const itemsByQuery = [];
    for (const query of getSearchQueries()) {
        itemsByQuery.push(await searchPublicItems(query, 5));
    }
    const uniqueItems = new Map();

    itemsByQuery.flat().forEach(item => {
        if (item?.id && !uniqueItems.has(item.id)) uniqueItems.set(item.id, item);
    });

    return [...uniqueItems.values()].map(mapItemToOffer);
}

module.exports = {
    getOffers
};
