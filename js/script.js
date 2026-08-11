const OFFERS_API_URL = 'https://promofinder-api.onrender.com/api/offers';
const OFFERS_API_TIMEOUT_MS = 8000;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. DADOS E INTERFACE DE OFERTAS
    const offersGrid = document.getElementById('offers-grid');

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        })[character]);
    }

    function getStoreBadgeClass(store) {
        const storeClasses = {
            Amazon: 'amazon',
            Magalu: 'magalu',
            'Mercado Livre': 'ml',
            'KaBuM!': 'kabum'
        };

        return storeClasses[store] || '';
    }

    function getOfferUrl(offer) {
        const url = offer.affiliateUrl || offer.productUrl;

        return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : '#';
    }

    function renderOffers(offersToRender) {
        if (!offersGrid) return;

        offersGrid.innerHTML = offersToRender.map(offer => {
            const stores = Array.isArray(offer.store) ? offer.store : [offer.store].filter(Boolean);
            const storeNames = stores.join(' ');
            const storeBadges = stores.map(store => `
                <span class="store-badge ${getStoreBadgeClass(store)}">${escapeHtml(store)}</span>
            `).join('');
            const offerUrl = getOfferUrl(offer);

            return `
                <div class="product-card" data-product-id="${escapeHtml(offer.id)}" data-store="${escapeHtml(storeNames)}" data-category="${escapeHtml(offer.category)}">
                    <div class="card-top">
                        <span class="discount-badge">${escapeHtml(offer.discount)}</span>
                        <button class="fav-btn" type="button" aria-label="Favoritar ${escapeHtml(offer.name)}"><i data-lucide="heart"></i></button>
                    </div>
                    <div class="product-img">
                        <img src="${escapeHtml(offer.image)}" alt="${escapeHtml(offer.name)}" />
                    </div>
                    <div class="product-info">
                        <h4>${escapeHtml(offer.name)}</h4>
                        <div class="store-tags">${storeBadges}</div>
                        <div class="price-box">
                            <div class="prices">
                                <span class="current-price">${escapeHtml(offer.price)}</span>
                                <span class="old-price">${escapeHtml(offer.oldPrice)}</span>
                            </div>
                            <span class="price-label">Menor preço encontrado</span>
                        </div>
                        <a href="${escapeHtml(offerUrl)}" class="btn-offer">
                            Ver oferta <i data-lucide="external-link"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getLocalOffers() {
        return Array.isArray(window.PromoFinderOffers) ? window.PromoFinderOffers : [];
    }

    async function loadOffers() {
        const requestController = new AbortController();
        const requestTimeout = setTimeout(() => requestController.abort(), OFFERS_API_TIMEOUT_MS);

        try {
            const response = await fetch(OFFERS_API_URL, {
                signal: requestController.signal
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const offers = await response.json();

            if (!Array.isArray(offers) || offers.length === 0 || offers.some(offer => !offer || typeof offer !== 'object')) {
                throw new Error('Formato de ofertas inesperado');
            }

            renderOffers(offers);
        } catch (error) {
            const localOffers = getLocalOffers();

            console.warn('A API de ofertas não respondeu. Os dados locais foram utilizados como fallback.', error);
            renderOffers(localOffers);
        } finally {
            clearTimeout(requestTimeout);
        }
    }

    // 2. ALTERNAR TEMA
    const themeBtn = document.getElementById('theme-btn');

    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }

    if (localStorage.getItem('theme') === 'light') {
        applyTheme(true);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isCurrentlyLight = document.body.classList.contains('light-mode');
            const nextLight = !isCurrentlyLight;
            localStorage.setItem('theme', nextLight ? 'light' : 'dark');
            applyTheme(nextLight);
        });
    }

    // 2. FAVORITAR PRODUTOS
    function getStoredFavorites() {
        try {
            const storedFavorites = JSON.parse(localStorage.getItem('favorites'));

            return Array.isArray(storedFavorites)
                ? [...new Set(storedFavorites.filter(item => typeof item === 'string'))]
                : [];
        } catch (error) {
            return [];
        }
    }

    function initializeFavorites() {
        let favorites = getStoredFavorites();
        const favHeaderCount = document.querySelector('.favorites-btn span');
        const favButtons = document.querySelectorAll('.fav-btn');

        function updateFavorites() {
            let favoritesWereMigrated = false;

            favButtons.forEach(btn => {
                const productCard = btn.closest('.product-card');
                const productId = productCard?.dataset.productId;
                const productName = productCard?.querySelector('h4')?.textContent;

                if (!productCard || !productName) return;

                // Mantém compatibilidade com favoritos antigos, que usavam o título do produto.
                if (productId && favorites.includes(productName)) {
                    favorites = favorites.map(item => item === productName ? productId : item);
                    favoritesWereMigrated = true;
                }

                const favoriteKey = productId || productName;
                btn.classList.toggle('active', favorites.includes(favoriteKey));
            });

            favorites = [...new Set(favorites)];

            if (favoritesWereMigrated) {
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }

            if (favHeaderCount) {
                favHeaderCount.textContent =
                    favorites.length > 0 ? `Favoritos (${favorites.length})` : 'Favoritos';
            }
        }

        favButtons.forEach(btn => {
            const productCard = btn.closest('.product-card');
            const productId = productCard?.dataset.productId;
            const productName = productCard?.querySelector('h4')?.textContent;

            if (!productCard || !productName) return;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const favoriteKey = productId || productName;
                const isFavorited = !favorites.includes(favoriteKey);

                if (isFavorited) {
                    favorites.push(favoriteKey);
                } else {
                    favorites = favorites.filter(item => item !== favoriteKey && item !== productName);
                }

                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavorites();
            });
        });

        updateFavorites();
    }

    // 3. FILTRO DE BUSCA
    function initializeSearch() {
        const searchInput = document.querySelector('.search-box input');
        const searchButton = document.querySelector('.search-box button');
        const productCards = document.querySelectorAll('.product-card');
        const noResultsMessage = document.getElementById('no-results');

        function filterProducts() {
            if (!searchInput) return;
            const searchTerm = searchInput.value.toLowerCase().trim();
            let hasMatches = false;

            productCards.forEach(card => {
                const titleElement = card.querySelector('h4');
                const title = titleElement ? titleElement.textContent : '';
                const store = card.dataset.store || '';
                const category = card.dataset.category || '';
                const searchableContent = `${title} ${store} ${category}`.toLowerCase();
                const matchesSearch = searchableContent.includes(searchTerm);

                card.style.display = matchesSearch ? 'flex' : 'none';
                hasMatches = hasMatches || matchesSearch;
            });

            if (noResultsMessage) {
                noResultsMessage.hidden = hasMatches;
            }
        }

        if (searchInput) searchInput.addEventListener('input', filterProducts);
        if (searchButton) searchButton.addEventListener('click', filterProducts);
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    filterProducts();
                }
            });
        }
    }

    await loadOffers();
    initializeFavorites();
    initializeSearch();

    // 4. COPIAR CUPONS
    const couponCopyButtons = document.querySelectorAll('.btn-copy[data-coupon]');

    couponCopyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const couponCode = button.dataset.coupon;
            const originalText = 'Copiar Cupom';

            if (!couponCode) return;

            button.disabled = true;

            try {
                if (!navigator.clipboard) {
                    throw new Error('Clipboard API indisponível');
                }

                await navigator.clipboard.writeText(couponCode);
                button.textContent = 'Copiado!';
                button.classList.add('copied');
            } catch (error) {
                console.error('Não foi possível copiar o cupom.', error);
                button.textContent = 'Erro ao copiar';
                button.classList.add('copy-error');
            }

            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied', 'copy-error');
                button.disabled = false;
            }, 2500);
        });
    });

    // 5. MENU CELULAR
    const menuToggleBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.menu');
    const sidebar = document.querySelector('.sidebar');
    const categoriesCard = document.querySelector('.card-categories');

    if (menuToggleBtn && navMenu) {
        function closeMobileMenu() {
            navMenu.classList.remove('mobile-open');
            menuToggleBtn.classList.remove('is-open');
            menuToggleBtn.setAttribute('aria-expanded', 'false');
            menuToggleBtn.setAttribute('aria-label', 'Abrir menu');
            menuToggleBtn.setAttribute('title', 'Abrir menu');
        }

        function syncCategoriesWithMobileMenu() {
            if (!sidebar || !categoriesCard) return;

            const isMobileLayout = window.innerWidth <= 768;

            if (isMobileLayout) {
                navMenu.append(categoriesCard);
                sidebar.classList.add('categories-in-menu');
                categoriesCard.classList.add('menu-categories');
            } else {
                sidebar.append(categoriesCard);
                sidebar.classList.remove('categories-in-menu');
                categoriesCard.classList.remove('menu-categories');
            }
        }

        syncCategoriesWithMobileMenu();

        menuToggleBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('mobile-open');

            menuToggleBtn.classList.toggle('is-open', isOpen);
            menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
            menuToggleBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
            menuToggleBtn.setAttribute('title', isOpen ? 'Fechar menu' : 'Abrir menu');
        });

        navMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            syncCategoriesWithMobileMenu();

            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
