import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Only these public frontend files are exposed. No backend or arbitrary paths.
const legacyFiles = new Map([
  ...['index', 'lojas', 'cupons', 'favoritos', 'privacidade', 'termos'].map(name => [`${name}.html`, 'text/html; charset=utf-8']),
  ['css/style.css', 'text/css; charset=utf-8'],
  ...['script', 'favorites-utils', 'offers-data'].map(name => [`js/${name}.js`, 'text/javascript; charset=utf-8']),
  ['imagens/carrinho.png', 'image/png'],
]);

function legacyMiddleware(req, res, next) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith('/legacy/')) return next();
  const relativePath = pathname.slice('/legacy/'.length) || 'index.html';
  if (!['GET', 'HEAD'].includes(req.method) || !legacyFiles.has(relativePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('Content-Type', legacyFiles.get(relativePath));
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'HEAD') return res.end();
  const stream = createReadStream(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)));
  stream.on('error', () => { res.statusCode = 404; res.end('Not found'); });
  stream.pipe(res);
}

export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'read-only-legacy-frontend',
    configureServer(server) { server.middlewares.use(legacyMiddleware); },
    configurePreviewServer(server) { server.middlewares.use(legacyMiddleware); },
  }],
  server: { port: 5173, strictPort: true },
});
