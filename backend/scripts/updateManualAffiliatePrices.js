const fs = require('node:fs');
const path = require('node:path');
const {
    manualAffiliateOffers
} = require('../data/manualAffiliateOffers.js');

const DATA_FILE = path.resolve(__dirname, '../data/manualAffiliateOffers.js');
const BRL_PRICE_PATTERN = /^R\$ (?:0|[1-9]\d{0,2}(?:\.\d{3})*),\d{2}$/;
const CLI_HELP = `Uso:
  node backend/scripts/updateManualAffiliatePrices.js <arquivo.json> [--dry-run]
  Get-Content -Raw <arquivo.json> | node backend/scripts/updateManualAffiliatePrices.js [--dry-run]

Modo referência (não publica nem altera lastVerifiedAt):
  [{ "productUrl": "https://...", "referencePrice": "R$ 1.649,00" }]

Modo confirmado (atualiza price e lastVerifiedAt):
  [{ "productUrl": "https://...", "price": "R$ 1.649,00" }]

Cada objeto deve conter exatamente um dos campos price ou referencePrice.
`;

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeJavaScriptString(value) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function isValidPrice(value) {
    return typeof value === 'string' && BRL_PRICE_PATTERN.test(value);
}

function buildDuplicateSet(entries) {
    const counts = new Map();
    entries.forEach(entry => {
        if (typeof entry?.productUrl !== 'string' || !entry.productUrl) return;
        counts.set(entry.productUrl, (counts.get(entry.productUrl) || 0) + 1);
    });
    return new Set([...counts].filter(([, count]) => count > 1).map(([url]) => url));
}

function applyPriceUpdates(source, entries, verifiedAt = new Date().toISOString()) {
    if (!Array.isArray(entries)) throw new TypeError('O JSON de entrada deve ser um array.');
    if (!Number.isFinite(Date.parse(verifiedAt)) || !verifiedAt.includes('T')) {
        throw new TypeError('verifiedAt deve ser um timestamp ISO completo.');
    }

    const offersByProductUrl = new Map(
        manualAffiliateOffers.map(offer => [offer.productUrl, offer])
    );
    const duplicateUrls = buildDuplicateSet(entries);
    const summary = {
        updated: [],
        notFound: [],
        invalid: [],
        duplicates: [...duplicateUrls]
    };
    let updatedSource = source;

    entries.forEach((entry, index) => {
        const productUrl = entry?.productUrl;
        if (duplicateUrls.has(productUrl)) return;

        if (typeof productUrl !== 'string' || productUrl.length === 0) {
            summary.invalid.push({ index, productUrl: productUrl ?? null, reason: 'productUrl inválida' });
            return;
        }

        const hasPrice = Object.hasOwn(entry, 'price');
        const hasReferencePrice = Object.hasOwn(entry, 'referencePrice');
        if (hasPrice === hasReferencePrice) {
            summary.invalid.push({
                index,
                productUrl,
                reason: 'informe exatamente um campo: price ou referencePrice'
            });
            return;
        }

        const mode = hasPrice ? 'confirmed' : 'reference';
        const priceField = hasPrice ? 'price' : 'referencePrice';
        if (!isValidPrice(entry[priceField])) {
            summary.invalid.push({ index, productUrl, reason: `${priceField} inválido` });
            return;
        }

        const offer = offersByProductUrl.get(productUrl);
        if (!offer) {
            summary.notFound.push(productUrl);
            return;
        }

        if (mode === 'confirmed') {
            const oldTupleTail = `, '${escapeJavaScriptString(offer.price)}', '${escapeJavaScriptString(offer.image)}', '${escapeJavaScriptString(offer.productUrl)}']`;
            const newTupleTail = `, '${escapeJavaScriptString(entry.price)}', '${escapeJavaScriptString(offer.image)}', '${escapeJavaScriptString(offer.productUrl)}']`;
            if (!updatedSource.includes(oldTupleTail)) {
                throw new Error(`Não foi possível localizar o preço de ${offer.id} no arquivo de dados.`);
            }
            updatedSource = updatedSource.replace(oldTupleTail, newTupleTail);

            const timestampPattern = new RegExp(
                `^(\\s*'${escapeRegExp(offer.id)}':\\s*)'[^']*'(,?)$`,
                'm'
            );
            if (!timestampPattern.test(updatedSource)) {
                throw new Error(`Não foi possível localizar lastVerifiedAt de ${offer.id}.`);
            }
            updatedSource = updatedSource.replace(
                timestampPattern,
                `$1'${escapeJavaScriptString(verifiedAt)}'$2`
            );

            summary.updated.push({
                mode,
                id: offer.id,
                productUrl,
                previousPrice: offer.price,
                price: entry.price,
                lastVerifiedAt: verifiedAt
            });
            return;
        }

        const referencePattern = new RegExp(
            `^(\\s*'${escapeRegExp(offer.id)}':\\s*)\\{ referencePrice: (?:null|'[^']*'), referencePriceCapturedAt: (?:null|'[^']*') \\}(,?)$`,
            'm'
        );
        if (!referencePattern.test(updatedSource)) {
            throw new Error(`Não foi possível localizar os dados de referência de ${offer.id}.`);
        }
        updatedSource = updatedSource.replace(
            referencePattern,
            `$1{ referencePrice: '${escapeJavaScriptString(entry.referencePrice)}', referencePriceCapturedAt: '${escapeJavaScriptString(verifiedAt)}' }$2`
        );
        summary.updated.push({
            mode,
            id: offer.id,
            productUrl,
            previousReferencePrice: offer.referencePrice,
            referencePrice: entry.referencePrice,
            referencePriceCapturedAt: verifiedAt
        });
    });

    return { source: updatedSource, summary };
}

async function readStandardInput() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

async function run() {
    const argumentsList = process.argv.slice(2);
    if (argumentsList.includes('--help') || argumentsList.includes('-h')) {
        process.stdout.write(CLI_HELP);
        return;
    }
    const dryRun = argumentsList.includes('--dry-run');
    const inputPath = argumentsList.find(argument => !argument.startsWith('-'));
    const input = inputPath
        ? fs.readFileSync(path.resolve(process.cwd(), inputPath), 'utf8')
        : await readStandardInput();
    const entries = JSON.parse(input);
    const source = fs.readFileSync(DATA_FILE, 'utf8');
    const result = applyPriceUpdates(source, entries);

    if (!dryRun && result.summary.updated.length > 0) {
        const temporaryFile = `${DATA_FILE}.tmp`;
        fs.writeFileSync(temporaryFile, result.source, 'utf8');
        fs.renameSync(temporaryFile, DATA_FILE);
    }

    process.stdout.write(`${JSON.stringify(result.summary, null, 2)}\n`);
}

if (require.main === module) {
    run().catch(error => {
        process.stderr.write(`Falha ao atualizar preços: ${error.message}\n`);
        process.exitCode = 1;
    });
}

module.exports = {
    applyPriceUpdates,
    BRL_PRICE_PATTERN,
    CLI_HELP,
    isValidPrice
};
