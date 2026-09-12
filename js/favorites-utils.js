(function exposeFavoritesUtils(root) {
    function normalizeFavoriteIds(value) {
        return Array.isArray(value)
            ? [...new Set(value.filter(item => typeof item === 'string'))]
            : [];
    }

    function filterFavoriteOffers(offers, favoriteIds) {
        const ids = new Set(normalizeFavoriteIds(favoriteIds));
        return Array.isArray(offers) ? offers.filter(offer => ids.has(offer?.id)) : [];
    }

    function removeFavoriteId(favoriteIds, offerId, legacyName = null) {
        return normalizeFavoriteIds(favoriteIds)
            .filter(item => item !== offerId && item !== legacyName);
    }

    const favoritesUtils = {
        filterFavoriteOffers,
        normalizeFavoriteIds,
        removeFavoriteId
    };

    if (root) root.PromoFinderFavorites = favoritesUtils;
    if (typeof module !== 'undefined' && module.exports) module.exports = favoritesUtils;
}(typeof window !== 'undefined' ? window : null));
