const {
    getCategoryHighlights,
    getCatalogProduct
} = require('../services/mercadoLivreApiService.js');

const SUPPORTED_TYPES = new Set(['ITEM', 'PRODUCT', 'USER_PRODUCT']);
const MAX_PRODUCTS_PER_CATEGORY = 3;
const MAX_VALID_PRODUCT_SAMPLES = 5;

function isValidMercadoLivrePermalink(permalink) {
    if (typeof permalink !== 'string') return false;

    try {
        const url = new URL(permalink);
        return url.protocol === 'https:'
            && (
                url.hostname === 'mercadolivre.com.br'
                || url.hostname.endsWith('.mercadolivre.com.br')
            );
    } catch {
        return false;
    }
}

function createProductDiagnostics() {
    return {
        productLookupAttempts: 0,
        productLookupSuccess: 0,
        productLookupHttp400: 0,
        productLookupHttp401: 0,
        productLookupHttp403: 0,
        productLookupHttp404: 0,
        productLookupOtherError: 0,
        productsActive: 0,
        productsWithName: 0,
        productsWithPictures: 0,
        productsWithPermalink: 0,
        productsWithValidMercadoLivrePermalink: 0,
        validProductSamples: []
    };
}

async function diagnoseCategoryHighlights(categoryId, sharedState = { validProductSamples: 0 }) {
    if (!/^MLB\d+$/.test(categoryId)) {
        throw new TypeError('categoryId deve ter o formato MLB seguido de números.');
    }

    const content = await getCategoryHighlights(categoryId);
    const grouped = { ITEM: [], PRODUCT: [], USER_PRODUCT: [] };

    for (const entry of content) {
        if (entry && SUPPORTED_TYPES.has(entry.type)) grouped[entry.type].push(entry);
    }

    const productDiagnostics = createProductDiagnostics();
    for (const entry of grouped.PRODUCT.slice(0, MAX_PRODUCTS_PER_CATEGORY)) {
        productDiagnostics.productLookupAttempts += 1;
        try {
            const product = await getCatalogProduct(entry.id);
            productDiagnostics.productLookupSuccess += 1;

            const hasName = typeof product.name === 'string' && product.name.trim().length > 0;
            const hasPictures = Array.isArray(product.pictures) && product.pictures.length > 0;
            const hasPermalink = typeof product.permalink === 'string'
                && product.permalink.trim().length > 0;
            const hasValidPermalink = isValidMercadoLivrePermalink(product.permalink);
            const isActive = product.status === 'active';

            if (isActive) productDiagnostics.productsActive += 1;
            if (hasName) productDiagnostics.productsWithName += 1;
            if (hasPictures) productDiagnostics.productsWithPictures += 1;
            if (hasPermalink) productDiagnostics.productsWithPermalink += 1;
            if (hasValidPermalink) {
                productDiagnostics.productsWithValidMercadoLivrePermalink += 1;
            }

            if (
                isActive
                && hasName
                && hasPictures
                && hasValidPermalink
                && sharedState.validProductSamples < MAX_VALID_PRODUCT_SAMPLES
            ) {
                productDiagnostics.validProductSamples.push({
                    name: product.name,
                    permalink: product.permalink
                });
                sharedState.validProductSamples += 1;
            }
        } catch (error) {
            const statusCounter = {
                400: 'productLookupHttp400',
                401: 'productLookupHttp401',
                403: 'productLookupHttp403',
                404: 'productLookupHttp404'
            }[error?.statusCode];

            if (statusCounter) productDiagnostics[statusCounter] += 1;
            else productDiagnostics.productLookupOtherError += 1;
        }
    }

    const diagnostics = {
        categoryId,
        highlightsTotal: content.length,
        itemCount: grouped.ITEM.length,
        productCount: grouped.PRODUCT.length,
        userProductCount: grouped.USER_PRODUCT.length,
        productDiagnostics
    };

    console.info('Diagnóstico seguro de highlights do Mercado Livre.', diagnostics);

    return { diagnostics };
}

async function diagnoseCategoriesHighlights(categoryIds) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new TypeError('categoryIds deve ser uma lista não vazia.');
    }

    const results = [];
    const sharedState = { validProductSamples: 0 };
    for (const categoryId of categoryIds) {
        const { diagnostics } = await diagnoseCategoryHighlights(categoryId, sharedState);
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
    createProductDiagnostics,
    diagnoseCategoriesHighlights,
    diagnoseCategoryHighlights,
    isValidMercadoLivrePermalink
};
