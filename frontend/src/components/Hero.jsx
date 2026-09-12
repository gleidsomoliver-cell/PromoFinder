import { Flame, Store, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import cartImage from '../assets/carrinho.png';
import '../styles/hero.css';

const benefits = [[Store, 'As melhores lojas'], [Sparkles, 'Menor preço'], [Zap, 'Ofertas atualizadas'], [ShieldCheck, '100% Gratuito']];

export default function Hero() {
  return <section className="hero" aria-labelledby="home-title">
    <div className="container hero-container">
      <div className="hero-text">
        <span className="badge"><Flame size={16} aria-hidden="true" />Promoções Atualizadas Todos os Dias</span>
        <h1 id="home-title">Encontre as melhores <span>promoções</span> em um só lugar!</h1>
        <p>Buscamos nas principais lojas para você economizar tempo e dinheiro. Aproveite as ofertas do dia, cupons exclusivos e os menores preços.</p>
        <SearchBar />
        <div className="beneficios">{benefits.map(([Icon, text]) => <div key={text}><Icon size={16} aria-hidden="true" />{text}</div>)}</div>
      </div>
      <div className="hero-image"><img src={cartImage} alt="Carrinho de Ofertas PromoFinder" /></div>
    </div>
  </section>;
}
