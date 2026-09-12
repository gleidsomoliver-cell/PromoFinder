const PRICE_VALIDITY_HOURS = 24;
const PRICE_VALIDITY_MS = PRICE_VALIDITY_HOURS * 60 * 60 * 1000;
const FULL_ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

function parseFullIsoTimestamp(value) {
    if (typeof value !== 'string' || !FULL_ISO_TIMESTAMP_PATTERN.test(value)) return null;

    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
}

function isAffiliatePriceVerified(offer, now = new Date()) {
    if (offer?.source !== 'mercadolivre-affiliate') return true;
    if (typeof offer.price !== 'string' || offer.price.trim().length === 0) return false;

    const verifiedAt = parseFullIsoTimestamp(offer.lastVerifiedAt);
    const nowTimestamp = now instanceof Date ? now.getTime() : new Date(now).getTime();
    if (verifiedAt === null || !Number.isFinite(nowTimestamp)) return false;

    const age = nowTimestamp - verifiedAt;
    return age >= 0 && age <= PRICE_VALIDITY_MS;
}

module.exports = {
    isAffiliatePriceVerified,
    parseFullIsoTimestamp,
    PRICE_VALIDITY_HOURS,
    PRICE_VALIDITY_MS
};
