const {
    getCategoryHighlights,
    getUserProduct
} = require('../services/mercadoLivreApiService.js');

const SUPPORTED_TYPES = new Set(['ITEM', 'PRODUCT', 'USER_PRODUCT']);
const MAX_USER_PRODUCTS_PER_CATEGORY = 3;

function createUserProductDiagnostics() {
    return {
        userProductLookupAttempts: 0,
        userProductLookupSuccess: 0,
        userProductLookupHttp400: 0,
        userProductLookupHttp401: 0,
        userProductLookupHttp403: 0,
        userProductLookupHttp404: 0,
        userProductLookupOtherError: 0,
        userProductsActive: 0,
        userProductsWithUserId: 0,
        userProductsWithName: 0,
        userProductsWithPictures: 0,
        firstUserProductLookupHttp403: null
    };
}

function captureFirstForbidden(userProductDiagnostics, sharedState, error) {
    if (error?.statusCode !== 403 || sharedState.firstForbiddenCaptured) return;

    sharedState.firstForbiddenCaptured = true;
    userProductDiagnostics.firstUserProductLookupHttp403 = error.safeResponse || {
        status: null,
        error: null,
        message: null,
        code: null,
        cause: null
    };
}

async function diagnoseCategoryHighlights(categoryId, sharedState = { firstForbiddenCaptured: false }) {
    if (!/^MLB\d+$/.test(categoryId)) {
        throw new TypeError('categoryId deve ter o formato MLB seguido de números.');
    }

    const content = await getCategoryHighlights(categoryId);
    const grouped = { ITEM: [], PRODUCT: [], USER_PRODUCT: [] };

    for (const entry of content) {
        if (entry && SUPPORTED_TYPES.has(entry.type)) grouped[entry.type].push(entry);
    }

    const userProductDiagnostics = createUserProductDiagnostics();
    for (const entry of grouped.USER_PRODUCT.slice(0, MAX_USER_PRODUCTS_PER_CATEGORY)) {
        userProductDiagnostics.userProductLookupAttempts += 1;
        try {
            const userProduct = await getUserProduct(entry.id);
            userProductDiagnostics.userProductLookupSuccess += 1;

            if (userProduct.status === 'active') userProductDiagnostics.userProductsActive += 1;
            if (userProduct.user_id !== null && userProduct.user_id !== undefined) {
                userProductDiagnostics.userProductsWithUserId += 1;
            }
            if (typeof userProduct.name === 'string' && userProduct.name.trim().length > 0) {
                userProductDiagnostics.userProductsWithName += 1;
            }
            if (Array.isArray(userProduct.pictures) && userProduct.pictures.length > 0) {
                userProductDiagnostics.userProductsWithPictures += 1;
            }
        } catch (error) {
            const statusCounter = {
                400: 'userProductLookupHttp400',
                401: 'userProductLookupHttp401',
                403: 'userProductLookupHttp403',
                404: 'userProductLookupHttp404'
            }[error?.statusCode];

            if (statusCounter) userProductDiagnostics[statusCounter] += 1;
            else userProductDiagnostics.userProductLookupOtherError += 1;
            captureFirstForbidden(userProductDiagnostics, sharedState, error);
        }
    }

    const diagnostics = {
        categoryId,
        highlightsTotal: content.length,
        itemCount: grouped.ITEM.length,
        productCount: grouped.PRODUCT.length,
        userProductCount: grouped.USER_PRODUCT.length,
        userProductDiagnostics
    };

    console.info('Diagnóstico seguro de highlights do Mercado Livre.', diagnostics);

    return { diagnostics };
}

async function diagnoseCategoriesHighlights(categoryIds) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new TypeError('categoryIds deve ser uma lista não vazia.');
    }

    const results = [];
    const sharedState = { firstForbiddenCaptured: false };
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
    captureFirstForbidden,
    createUserProductDiagnostics,
    diagnoseCategoriesHighlights,
    diagnoseCategoryHighlights
};
