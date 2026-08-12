const {
    getCatalogProduct,
    searchCatalogProducts
} = require('../services/mercadoLivreApiService.js');

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

function mapProductToOffer(product) {
    const winningItem = product.buy_box_winner;

    return {
        id: winningItem.item_id,
        name: product.name,
        store: 'Mercado Livre',
        category: winningItem.category_id || product.domain_id,
        price: formatPrice(winningItem.price, winningItem.currency_id),
        oldPrice: formatPrice(winningItem.original_price, winningItem.currency_id),
        discount: calculateDiscount(winningItem.price, winningItem.original_price),
        image: product.pictures?.[0]?.url,
        productUrl: product.permalink,
        affiliateUrl: null,
        available: Number.isFinite(winningItem.available_quantity)
            ? winningItem.available_quantity > 0
            : true
    };
}

async function getOffers() {
    const productsByQuery = [];
    for (const query of getSearchQueries()) {
        productsByQuery.push(await searchCatalogProducts(query, 3));
    }
    const productIds = new Set();

    productsByQuery.flat().forEach(product => {
        if (product?.id) productIds.add(product.id);
    });

    const products = [];
    for (const productId of productIds) {
        const product = await getCatalogProduct(productId);
        if (
            product.status === 'active' &&
            product.buy_box_winner?.item_id &&
            Number.isFinite(product.buy_box_winner.price)
        ) {
            products.push(product);
        }
    }

    return products.map(mapProductToOffer);
}

module.exports = {
    getOffers
};
