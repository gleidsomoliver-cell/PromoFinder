document.addEventListener('DOMContentLoaded', () => {
    // 1. ALTERNAR TEMA
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
    let favoritesCount = 0;
    const favHeaderCount = document.querySelector('.favorites-btn span');
    const favButtons = document.querySelectorAll('.fav-btn');

    favButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isFavorited = btn.classList.toggle('active');

            if (isFavorited) {
                favoritesCount++;
                btn.style.color = '#EF4444';
            } else {
                favoritesCount--;
                btn.style.color = '#71717A';
            }

            if (favHeaderCount) {
                favHeaderCount.textContent =
                    favoritesCount > 0 ? `Favoritos (${favoritesCount})` : 'Favoritos';
            }
        });
    });

    // 3. FILTRO DE BUSCA
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    const productCards = document.querySelectorAll('.product-card');

    function filterProducts() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.toLowerCase().trim();

        productCards.forEach(card => {
            const titleElement = card.querySelector('h4');
            const title = titleElement ? titleElement.textContent.toLowerCase() : '';
            card.style.display = title.includes(searchTerm) ? 'flex' : 'none';
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (searchButton) searchButton.addEventListener('click', filterProducts);

    // 4. MENU CELULAR
    const menuToggleBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.menu');

    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
        });
    }

    // 5. MODAL DE LOGIN
    const loginBtn = document.querySelector('.btn-login');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.querySelector('.modal-close');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }

    if (closeModalBtn && loginModal) {
        closeModalBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    // 6. FORMULÁRIOS
    const newsletterForm = document.getElementById('newsletter-form');
    const loginForm = document.getElementById('login-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Inscrição realizada com sucesso!');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Login efetuado com sucesso!');
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
