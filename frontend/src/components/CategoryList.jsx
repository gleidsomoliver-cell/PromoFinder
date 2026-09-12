import { Tv, Laptop, Smartphone, House, Shirt, Sparkles, Dumbbell } from 'lucide-react';
import '../styles/categories.css';

const categories = [[Tv, 'Eletrônicos'], [Laptop, 'Informática'], [Smartphone, 'Celulares'], [House, 'Casa e Decoração'], [Shirt, 'Moda'], [Sparkles, 'Beleza e Saúde'], [Dumbbell, 'Esportes']];

export default function CategoryList({ selected, onSelect }) {
  return <section className="card-categories" aria-label="Categorias">
    <h2>Categorias</h2>
    <ul className="category-list">{categories.map(([Icon, name]) => <li key={name}>
      <button type="button" className={selected === name ? 'active' : ''} aria-pressed={selected === name} onClick={() => onSelect(name)}><Icon size={18} aria-hidden="true" /><span>{name}</span></button>
    </li>)}</ul>
    <button type="button" className="btn-all-categories" aria-pressed={selected === null} onClick={() => onSelect(null)}>Ver todas</button>
  </section>;
}
