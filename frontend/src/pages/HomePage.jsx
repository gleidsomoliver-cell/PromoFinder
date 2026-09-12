import Hero from '../components/Hero.jsx';
import CategoryList from '../components/CategoryList.jsx';
import '../styles/home.css';

export default function HomePage({ category, onCategoryChange }) {
  return <main>
    <Hero />
    <div className="main-content container" id="categorias">
      <aside className="sidebar"><CategoryList selected={category} onSelect={onCategoryChange} /></aside>
      <section className="offers-section" aria-labelledby="offers-title">
        <h2 id="offers-title">Ofertas em destaque 🔥</h2>
      </section>
    </div>
  </main>;
}
