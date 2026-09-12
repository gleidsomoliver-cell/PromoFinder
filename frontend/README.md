# PromoFinder — frontend React

Etapa 2: Home visual com Hero, ilustração original, busca em estado local, sete categorias e Footer compartilhado. Ofertas, API e demais páginas ainda não foram migradas. A busca exibe o termo enviado por botão ou Enter, sem simular resultados. Categorias têm seleção visual; no mobile ficam no menu. Links para páginas ainda não migradas abrem o site antigo local.

## Executar

Dentro de `frontend/`:

```sh
npm install
npm run dev
npm run build
npm run preview
```

No PowerShell com execução de scripts desabilitada, use `npm.cmd`.
Desenvolvimento: http://127.0.0.1:5173/.

## Convivência com o site atual

Os arquivos antigos e o backend não são modificados. Um middleware de desenvolvimento/preview oferece somente uma lista explícita de arquivos públicos antigos em `/legacy/`, em modo de leitura. Favoritos e links do menu apontam para essas páginas. A logo retorna à entrada React.

O Header lê `favorites` para mostrar o contador, sem alterar seu conteúdo. O tema mantém a chave `theme` (`light`/`dark`). Como as páginas antigas locais usam a mesma origem, compartilham essas preferências. Dados de produção não são compartilhados com localhost.

O build fica em `dist/`. O middleware não faz parte do build estático: antes de publicar, configurar `VITE_LEGACY_BASE_URL` com o endereço do site antigo e revisar a base de hospedagem. Esta etapa não publica o site. `noindex` identifica a versão provisória de validação.
