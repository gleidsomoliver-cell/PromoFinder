const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const ALGORITHM = 'aes-256-gcm';
let inMemoryTokenData = null;
let memoryWarningLogged = false;

function logMemoryStoreWarning() {
    if (memoryWarningLogged) return;
    console.warn(
        'Tokens do Mercado Livre estão somente em memória; uma nova autorização OAuth será necessária após restart ou redeploy.'
    );
    memoryWarningLogged = true;
}

function getStoreConfiguration() {
    const storePath = process.env.MERCADOLIVRE_TOKEN_STORE_PATH?.trim();
    const encodedKey = process.env.MERCADOLIVRE_TOKEN_ENCRYPTION_KEY?.trim();
    const missingVariables = [];

    if (!storePath && !encodedKey) {
        return { missingVariables: [], mode: 'memory' };
    }

    if (!storePath) missingVariables.push('MERCADOLIVRE_TOKEN_STORE_PATH');
    if (!encodedKey) missingVariables.push('MERCADOLIVRE_TOKEN_ENCRYPTION_KEY');

    if (missingVariables.length > 0) return { missingVariables };

    const encryptionKey = Buffer.from(encodedKey, 'base64');
    if (encryptionKey.length !== 32) {
        return { invalidVariables: ['MERCADOLIVRE_TOKEN_ENCRYPTION_KEY'], missingVariables: [] };
    }

    return { encryptionKey, missingVariables: [], mode: 'encrypted_file', storePath };
}

function encryptTokenData(tokenData, encryptionKey) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    const ciphertext = Buffer.concat([
        cipher.update(JSON.stringify(tokenData), 'utf8'),
        cipher.final()
    ]);

    return JSON.stringify({
        ciphertext: ciphertext.toString('base64'),
        iv: iv.toString('base64'),
        tag: cipher.getAuthTag().toString('base64'),
        version: 1
    });
}

function decryptTokenData(payload, encryptionKey) {
    const encrypted = JSON.parse(payload);
    if (encrypted.version !== 1) throw new Error('unsupported_token_store_version');

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        encryptionKey,
        Buffer.from(encrypted.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));

    return JSON.parse(Buffer.concat([
        decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
        decipher.final()
    ]).toString('utf8'));
}

async function saveTokenData(tokenData) {
    const configuration = getStoreConfiguration();
    if (configuration.mode === 'memory') {
        logMemoryStoreWarning();
        inMemoryTokenData = { ...tokenData };
        return;
    }

    if (configuration.missingVariables.length || configuration.invalidVariables) {
        throw new Error('invalid_token_store_configuration');
    }

    const directory = path.dirname(configuration.storePath);
    const temporaryPath = `${configuration.storePath}.${process.pid}.tmp`;
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(
        temporaryPath,
        encryptTokenData(tokenData, configuration.encryptionKey),
        { encoding: 'utf8', mode: 0o600 }
    );
    await fs.rename(temporaryPath, configuration.storePath);
}

async function loadTokenData() {
    const configuration = getStoreConfiguration();
    if (configuration.mode === 'memory') {
        logMemoryStoreWarning();
        return inMemoryTokenData ? { ...inMemoryTokenData } : null;
    }

    if (configuration.missingVariables.length || configuration.invalidVariables) return null;

    try {
        const payload = await fs.readFile(configuration.storePath, 'utf8');
        return decryptTokenData(payload, configuration.encryptionKey);
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

module.exports = {
    getStoreConfiguration,
    loadTokenData,
    logMemoryStoreWarning,
    saveTokenData
};
