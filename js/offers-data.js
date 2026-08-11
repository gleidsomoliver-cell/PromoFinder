const promoFinderOffers = [
    {
        id: 'notebook-gamer-acer-nitro-5',
        name: 'Notebook Gamer Acer Nitro 5',
        store: ['Amazon', 'Magalu'],
        category: 'Informática',
        price: 'R$ 3.999,00',
        oldPrice: 'R$ 4.999,00',
        discount: '-20%',
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop',
        productUrl: null,
        affiliateUrl: null,
        couponCode: null,
        couponExpiry: null,
        available: true
    },
    {
        id: 'iphone-15-128gb',
        name: 'iPhone 15 128GB',
        store: ['Mercado Livre', 'Amazon'],
        category: 'Celulares',
        price: 'R$ 5.599,00',
        oldPrice: 'R$ 6.599,00',
        discount: '-15%',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop',
        productUrl: null,
        affiliateUrl: null,
        couponCode: null,
        couponExpiry: null,
        available: true
    },
    {
        id: 'headphone-sony-wh-1000xm5',
        name: 'Headphone Sony WH-1000XM5',
        store: ['Amazon', 'KaBuM!'],
        category: 'Eletrônicos',
        price: 'R$ 1.259,00',
        oldPrice: 'R$ 1.799,00',
        discount: '-30%',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop',
        productUrl: null,
        affiliateUrl: null,
        couponCode: null,
        couponExpiry: null,
        available: true
    },
    {
        id: 'smartwatch-galaxy-watch-6',
        name: 'Smartwatch Galaxy Watch 6',
        store: ['Magalu', 'Amazon'],
        category: 'Eletrônicos',
        price: 'R$ 1.049,00',
        oldPrice: 'R$ 1.399,00',
        discount: '-25%',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
        productUrl: null,
        affiliateUrl: null,
        couponCode: null,
        couponExpiry: null,
        available: true
    },
    {
        id: 'kit-gamer-acer-nitro-5-ryzen-5-rtx-3050',
        name: 'Kit Gamer Completo Notebook Acer Nitro 5 AMD Ryzen 5 RTX 3050 Linux Gutta 8GB 512GB SSD 15,6" Full HD',
        store: ['Shopee'],
        category: 'Informática',
        price: 'R$ 7.999,00',
        oldPrice: null,
        discount: null,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop',
        productUrl: null,
        affiliateUrl: 'https://s.shopee.com.br/4qElodtdS1',
        couponCode: null,
        couponExpiry: null,
        available: true
    }
];

if (typeof window !== 'undefined') {
    window.PromoFinderOffers = promoFinderOffers;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = promoFinderOffers;
}
