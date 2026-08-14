const MERCADO_LIVRE_AFFILIATE_URLS = Object.freeze([
    'https://meli.la/2CHMsbQ',
    'https://meli.la/2CjFrV3',
    'https://meli.la/2qP3MqZ',
    'https://meli.la/2quF9Nv',
    'https://meli.la/179RRix',
    'https://meli.la/1NgkLu1',
    'https://meli.la/2P7R2P6',
    'https://meli.la/2hheRwj',
    'https://meli.la/2q2VMHJ',
    'https://meli.la/2o9wjwJ',
    'https://meli.la/1DwvRsN',
    'https://meli.la/1VcTbi5',
    'https://meli.la/1PzGsqY',
    'https://meli.la/19mnC1y',
    'https://meli.la/2DaYNsz',
    'https://meli.la/2TvAhas',
    'https://meli.la/1uGGkYM',
    'https://meli.la/2Nsz2SX',
    'https://meli.la/2yoLSxu',
    'https://meli.la/18PRf3n',
    'https://meli.la/1PyBB5N',
    'https://meli.la/1Ji4JZa',
    'https://meli.la/1nizHwH',
    'https://meli.la/2ogMh6i',
    'https://meli.la/1CWajec',
    'https://meli.la/2PC8Ksh',
    'https://meli.la/2XpzRMu',
    'https://meli.la/2n9wFGp',
    'https://meli.la/2E8QztM',
    'https://meli.la/1FHq86c'
]);

const MANUAL_OFFER_DETAILS = Object.freeze([
    ['Apple iPhone 12 (128 GB) - Branco (Novo com caixa aberta)', 'R$ 2.155,00', 'https://http2.mlstatic.com/D_Q_NP_2X_772447-MLA95496070980_102025-AB.webp', 'https://www.mercadolivre.com.br/apple-iphone-12-128-gb-branco-novo-com-caixa-aberta/p/MLB2016193484'],
    ['Saco De Box 90 Cm Profissional + Luva Bate Saco Preto', 'R$ 148,00', 'https://http2.mlstatic.com/D_Q_NP_2X_783150-MLB91103824807_082025-AB.webp', 'https://www.mercadolivre.com.br/saco-de-box-90-cm-profissional--luva-bate-saco/up/MLBU1961377131'],
    ['Cacheador Philco Pec16vd Rotação Automática 230°c', 'R$ 286,00', 'https://http2.mlstatic.com/D_Q_NP_2X_871236-MLA99496132738_112025-AB.webp', 'https://www.mercadolivre.com.br/cacheador-philco-pec16vd-rotacao-automatica-230c/p/MLB32111503'],
    ['Varal Chao Com Abas Retrátil Slim Preto Mor', 'R$ 99,00', 'https://http2.mlstatic.com/D_Q_NP_2X_902547-MLA108912438390_032026-AB.webp', 'https://www.mercadolivre.com.br/varal-chao-com-abas-retratil-slim-preto-mor/p/MLB24672996'],
    ['Bicicleta Infantil Aro 12 Nathor C/ Rodinhas Menino Menina Cor Flower Tamanho Do Quadro 12', 'R$ 279,00', 'https://http2.mlstatic.com/D_Q_NP_2X_980403-MLA87775325252_072025-AB.webp', 'https://www.mercadolivre.com.br/bicicleta-infantil-aro-12-nathor-c-rodinhas-menino-menina-cor-flower-tamanho-do-quadro-12/p/MLB48353048'],
    ['Kit 2 Spray De Cozinha Epsilon Eps-412 Borrifador Pulverizador De Óleo Azeite 200ml', 'R$ 49,00', 'https://http2.mlstatic.com/D_Q_NP_2X_615843-MLA112333807961_052026-AB.webp', 'https://www.mercadolivre.com.br/kit-2-spray-de-cozinha-epsilon-eps-412-borrifador-pulverizador-de-oleo-azeite-200ml/p/MLB40554560'],
    ['Kit Jogo De Lençol Queen 3 Pçs 400 Fios C/ Elástico Detalhe Ponto Palito Fronha Super Macio Confortável Hotel Cor Branco Premium', 'R$ 78,00', 'https://http2.mlstatic.com/D_Q_NP_2X_883224-MLA99941610719_112025-AB.webp', 'https://www.mercadolivre.com.br/kit-jogo-de-lencol-queen-3-pcs-400-fios-c-elastico-detalhe-ponto-palito-fronha-super-macio-confortavel-hotel-cor-branco-premium/p/MLB53221269'],
    ['Suporte Aplicador De Fita Adesiva Larga Grande 50mm Com Cortador Dispensador Manual Durex Transparente Fechar Caixas Embalagem Logística Escritório Expedição Pacotes Bomvink Bom-1568', 'R$ 38,00', 'https://http2.mlstatic.com/D_Q_NP_2X_799875-MLA115779344697_082026-AB.webp', 'https://www.mercadolivre.com.br/suporte-aplicador-de-fita-adesiva-larga-grande-50mm-com-cortador-dispensador-manual-durex-transparente-fechar-caixas-embalagem-logistica-escritorio-expedicao-pacotes-bomvink-bom-1568/p/MLB63226528'],
    ['Microfone Sem Fio Headset Aula Conferencia Professor Show', 'R$ 187,00', 'https://http2.mlstatic.com/D_Q_NP_2X_699331-MLB106630193195_022026-AB.webp', 'https://www.mercadolivre.com.br/microfone-sem-fio-headset-aula-conferencia-professor-show/p/MLB2098619018'],
    ['Grade Portão Proteção Pet Cachorro Porta 68 A 83cm Branco Branco', 'R$ 78,00', 'https://http2.mlstatic.com/D_Q_NP_2X_716774-MLB111018014368_052026-AB.webp', 'https://www.mercadolivre.com.br/grade-portao-protecao-pet-cachorro-porta-68-a-83cm-branco/up/MLBU3991910826'],
    ['Diabo Verde Granulado 300g Desentupidor De Canos Pias - Kit 2 Und', 'R$ 52,00', 'https://http2.mlstatic.com/D_Q_NP_2X_943110-MLA99349423972_112025-AB.webp', 'https://www.mercadolivre.com.br/diabo-verde-granulado-300g-desentupidor-de-canos-pias-kit-2-und/p/MLB42242329'],
    ['Rampa Para Cachorro Não Desliza A Pata C Regulagem De Altura Cor Marrom-claro Tamanho G Vivemos Pet', 'R$ 99,00', 'https://http2.mlstatic.com/D_Q_NP_2X_667834-MLA95703742958_102025-AB.webp', 'https://www.mercadolivre.com.br/rampa-para-cachorro-nao-desliza-a-pata-c-regulagem-de-altura-cor-marrom-claro-tamanho-g-vivemos-pet/p/MLB43715084'],
    ['Mangueira de Jardim 30mts Duraflex Reforçada Ultra Resistente Laranja Siliconada AntiDobra', 'R$ 177,00', 'https://http2.mlstatic.com/D_Q_NP_2X_644466-MLA108028482180_032026-AB.webp', 'https://www.mercadolivre.com.br/mangueira-de-jardim-30mts-duraflex-reforcada-ultra-resistente-laranja-siliconada-antidobra/p/MLB24739370'],
    ['Cortina De Ar 120cm Agratto Acda120i-02 Alta Vazão Branco', 'R$ 782,00', 'https://http2.mlstatic.com/D_Q_NP_2X_909244-MLA107591025958_032026-AB.webp', 'https://www.mercadolivre.com.br/cortina-de-ar-120cm-agratto-acda120i-02-alta-vazao-branco/p/MLB66337046'],
    ['Jogo 6 Copos Altos Vidro 350ml Diamond Clear Borda Dourada Ke Home', 'R$ 140,00', 'https://http2.mlstatic.com/D_Q_NP_2X_809611-MLA96100117563_102025-AB.webp', 'https://www.mercadolivre.com.br/jogo-6-copos-altos-vidro-350ml-diamond-clear-borda-dourada-ke-home/p/MLB29136648'],
    ['Kit 10 Cadeiras Iso Fixa Escola Escritório Igreja Resistente Preto', 'R$ 997,00', 'https://http2.mlstatic.com/D_Q_NP_2X_966647-MLA102990613791_122025-AB.webp', 'https://www.mercadolivre.com.br/kit-10-cadeiras-iso-fixa-escola-escritorio-igreja-resistente-preto/p/MLB63650769'],
    ['Painel Digital Cg Titan 150 Sport Até 2008 Fan 150 Até 2013', 'R$ 179,00', 'https://http2.mlstatic.com/D_Q_NP_2X_932473-MLB89942498309_082025-AB.webp', 'https://www.mercadolivre.com.br/painel-digital-cg-titan-150-sport-ate-2008-fan-150-ate-2013/up/MLBU3128472453'],
    ['Ampliar E Aument Cadeira De Escritório Presidente Ergonômica Preto Couro Sintético', 'R$ 899,00', 'https://http2.mlstatic.com/D_Q_NP_2X_797753-MLA109556096386_042026-AB.webp', 'https://www.mercadolivre.com.br/ampliar-e-aument-cadeira-de-escritorio-presidente-ergonomica-preto-couro-sintetico/p/MLB67989650'],
    ['Placa De Proibido Estacionar Garagem Grande P/ Portão 40x32', 'R$ 25,00', 'https://http2.mlstatic.com/D_Q_NP_2X_639261-MLA109392215292_042026-AB.webp', 'https://www.mercadolivre.com.br/placa-de-proibido-estacionar-garagem-grande-p-portao-40x32/p/MLB67780904'],
    ['Kit Explosão de Azeite de Oliva | bn.Cachos', 'R$ 171,00', 'https://http2.mlstatic.com/D_Q_NP_2X_804356-MLA108025779139_032026-AB.webp', 'https://www.mercadolivre.com.br/kit-explosao-de-azeite-de-oliva-bncachos/p/MLB62357432'],
    ['Calibrador De Ar Digital Para Pneu Portátil Compressor Usb', 'R$ 67,00', 'https://http2.mlstatic.com/D_Q_NP_2X_780829-MLB113983348124_072026-AB.webp', 'https://www.mercadolivre.com.br/calibrador-de-ar-digital-para-pneu-portatil-compressor-usb/up/MLBU780769248'],
    ['Placa de Captura Externa Flysea HDMI USB 3.0 4K Para Streaming e Jogos', 'R$ 199,00', 'https://http2.mlstatic.com/D_Q_NP_2X_945987-MLA99945059691_112025-AB.webp', 'https://www.mercadolivre.com.br/placa-de-captura-externa-flysea-hdmi-usb-30-4k-para-streaming-e-jogos/p/MLB48950201'],
    ['Fogão de chão Atlas Coliseum Plus A Gás 4 queimadores Branco com Mesa de Inox Porta com visor e Forno de 50 Litros', 'R$ 890,00', 'https://http2.mlstatic.com/D_Q_NP_2X_640785-MLA99524614166_122025-AB.webp', 'https://www.mercadolivre.com.br/fogao-de-chao-atlas-coliseum-plus-a-gas-4-queimadores-branco-com-mesa-de-inox-porta-com-visor-e-forno-de-50-litros/p/MLB18926283'],
    ['Pedra Dolomita Branca N° 2 Para Jardim 4kg', 'R$ 22,00', 'https://http2.mlstatic.com/D_Q_NP_2X_667178-MLA99598103462_122025-AB.webp', 'https://www.mercadolivre.com.br/pedra-dolomita-branca-n-2-para-jardim-4kg/p/MLB48919369'],
    ['Rog Ally RC73ya-NH002w AMD Ryzen Z2 16 GB 512 GB 7 FHD', 'R$ 6.942,00', 'https://http2.mlstatic.com/D_Q_NP_2X_793083-MLA99126402146_112025-AB.webp', 'https://www.mercadolivre.com.br/rog-ally-rc73ya-nh002w-amd-ryzen-z2-16-gb-512-gb-7-fhd/p/MLB62548063'],
    ['Anilha Vazada 10kg Pintado Academia Musculação (unidade) Preto', 'R$ 124,00', 'https://http2.mlstatic.com/D_Q_NP_2X_781531-MLB115245650923_072026-AB.webp', 'https://www.mercadolivre.com.br/anilha-vazada-10kg-pintado-academia-musculacao-unidade/up/MLBU4287126688'],
    ['Produto Para Lavar Carro E Moto À Seco V-eco Fast + 2 Pano', 'R$ 45,00', 'https://http2.mlstatic.com/D_Q_NP_2X_762984-MLB114756397462_082026-AB.webp', 'https://www.mercadolivre.com.br/produto-para-lavar-carro-e-moto-seco-v-eco-fast-2-panos/p/MLB2068677298'],
    ['Colete Social Masculino Com Regulagem', 'R$ 39,00', 'https://http2.mlstatic.com/D_Q_NP_2X_767685-MLB110435077120_052026-AB-colete-social-masculino-com-regulagem.webp', 'https://produto.mercadolivre.com.br/MLB-4191407878-colete-social-masculino-com-regulagem-_JM'],
    ['Cadeira Escritório Oficial Diretor Mesh Ergonômica Office Preto Tela Mesh', 'R$ 389,00', 'https://http2.mlstatic.com/D_Q_NP_2X_987924-MLB113927067036_072026-AB.webp', 'https://www.mercadolivre.com.br/cadeira-escritorio-oficial-diretor-mesh-ergonomica-office/up/MLBU4304807429'],
    ['Termostato Digital Stc-1000 Controlador Temperatura 110/220v', 'R$ 52,00', 'https://http2.mlstatic.com/D_Q_NP_2X_828635-MLA109948541876_042026-AB.webp', 'https://www.mercadolivre.com.br/termostato-digital-stc-1000-controlador-temperatura-110220v/p/MLB68591453']
]);

const manualAffiliateOffers = Object.freeze(
    MERCADO_LIVRE_AFFILIATE_URLS.map((affiliateUrl, index) => Object.freeze({
        id: `mercadolivre-affiliate-${String(index + 1).padStart(3, '0')}`,
        name: MANUAL_OFFER_DETAILS[index][0],
        store: Object.freeze(['Mercado Livre']),
        category: null,
        price: MANUAL_OFFER_DETAILS[index][1],
        oldPrice: null,
        discount: null,
        image: MANUAL_OFFER_DETAILS[index][2],
        productUrl: MANUAL_OFFER_DETAILS[index][3],
        affiliateUrl,
        available: true,
        source: 'mercadolivre-affiliate',
        lastVerifiedAt: '2026-08-14'
    }))
);

const MANUAL_OFFER_COMPLETION_FIELDS = Object.freeze([
    'name',
    'price',
    'image',
    'productUrl',
    'available'
]);

function getMissingCompletionFields(offer) {
    return MANUAL_OFFER_COMPLETION_FIELDS.filter(field => {
        if (field === 'available') return typeof offer?.available !== 'boolean';

        return typeof offer?.[field] !== 'string' || offer[field].trim().length === 0;
    });
}

function listCompleteManualAffiliateOffers() {
    return manualAffiliateOffers.filter(offer => getMissingCompletionFields(offer).length === 0);
}

function listPendingManualAffiliateOffers() {
    return manualAffiliateOffers.map(offer => ({
        offer,
        missingFields: getMissingCompletionFields(offer)
    })).filter(item => item.missingFields.length > 0);
}

function countPendingManualAffiliateOffers() {
    return listPendingManualAffiliateOffers().length;
}

module.exports = {
    countPendingManualAffiliateOffers,
    getMissingCompletionFields,
    listCompleteManualAffiliateOffers,
    listPendingManualAffiliateOffers,
    manualAffiliateOffers
};
