const {
    getCatalogProduct,
    getCatalogProductItems,
    getItem,
    searchCatalogProducts
} = require('../services/mercadoLivreApiService.js');

const DEFAULT_SEARCH_QUERIES = [
    'celular',
    'notebook',
    'televisao'
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

function mapAssociatedItemToOffer(product, item) {
    return {
        id: item.id,
        name: item.title || product.name,
        store: 'Mercado Livre',
        category: item.category_id || product.domain_id,
        price: formatPrice(item.price, item.currency_id),
        oldPrice: formatPrice(item.original_price, item.currency_id),
        discount: calculateDiscount(item.price, item.original_price),
        image: item.secure_thumbnail || item.thumbnail || product.pictures?.[0]?.url,
        productUrl: item.permalink,
        affiliateUrl: null,
        available: item.status === 'active' && item.available_quantity > 0
    };
}

async function findAssociatedOffer(product, diagnostics) {
    diagnostics.associatedItemsLookups += 1;
    const candidates = await getCatalogProductItems(product.id, 3);
    diagnostics.associatedItemsFound += candidates.length;

    for (const candidate of candidates) {
        if (!candidate?.item_id) continue;
        const item = await getItem(candidate.item_id);
        diagnostics.associatedItemDetailsFetched += 1;

        if (
            item.status === 'active' &&
            item.available_quantity > 0 &&
            Number.isFinite(item.price) &&
            (item.secure_thumbnail || item.thumbnail || product.pictures?.[0]?.url) &&
            typeof item.permalink === 'string' &&
            item.permalink
        ) {
            diagnostics.recoveredFromAssociatedItems += 1;
            return mapAssociatedItemToOffer(product, item);
        }

        diagnostics.discardedAssociatedItems += 1;
    }

    return null;
}

async function getOffers() {
    const productsByQuery = [];
    for (const query of getSearchQueries()) {
        productsByQuery.push(await searchCatalogProducts(query, 3));
    }
    const productIds = new Set();
    const diagnostics = {
        accepted: 0,
        associatedItemDetailsFetched: 0,
        associatedItemsFound: 0,
        associatedItemsLookups: 0,
        detailsFetched: 0,
        discardedAssociatedItems: 0,
        discardedInactive: 0,
        discardedMissingBuyBoxWinner: 0,
        discardedMissingImage: 0,
        discardedMissingPermalink: 0,
        discardedMissingPrice: 0,
        searchResults: productsByQuery.flat().length,
        uniqueProducts: 0,
        recoveredFromAssociatedItems: 0
    };

    productsByQuery.flat().forEach(product => {
        if (product?.id) productIds.add(product.id);
    });
    diagnostics.uniqueProducts = productIds.size;

    const products = [];
    for (const productId of productIds) {
        const product = await getCatalogProduct(productId);
        diagnostics.detailsFetched += 1;

        if (product.status !== 'active') {
            diagnostics.discardedInactive += 1;
            continue;
        }
        if (!product.buy_box_winner?.item_id) {
            const associatedOffer = await findAssociatedOffer(product, diagnostics);
            if (associatedOffer) {
                products.push(associatedOffer);
                continue;
            }

            diagnostics.discardedMissingBuyBoxWinner += 1;
            continue;
        }
        if (!Number.isFinite(product.buy_box_winner.price)) {
            diagnostics.discardedMissingPrice += 1;
            continue;
        }
        if (!product.pictures?.[0]?.url) {
            diagnostics.discardedMissingImage += 1;
            continue;
        }
        if (typeof product.permalink !== 'string' || !product.permalink) {
            diagnostics.discardedMissingPermalink += 1;
            continue;
        }

        products.push(mapProductToOffer(product));
    }

    diagnostics.accepted = products.length;
    console.info('Diagnóstico seguro da seleção de ofertas do Mercado Livre.', diagnostics);

    return products;
}

module.exports = {
    getOffers
};
