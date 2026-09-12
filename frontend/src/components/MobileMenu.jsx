import { legacyUrl } from '../utils/legacyUrl.js';
import CategoryList from './CategoryList.jsx';

const links = [['Início', 'index.html'], ['Categorias', 'index.html#categorias'], ['Lojas', 'lojas.html'], ['Cupons', 'cupons.html']];

export default function MobileMenu({ open, onClose, id, category, onCategoryChange }) {
  return <nav id={id} className="navigation-panel" aria-label="Navegação principal" hidden={!open}>
    <div className="container navigation-links">
      {links.map(([label, page]) => <a key={page} href={page.startsWith('index.html') ? `${import.meta.env.BASE_URL}${page.includes('#') ? '#categorias' : ''}` : legacyUrl(page)} onClick={onClose}>{label}</a>)}
      <div className="menu-categories"><CategoryList selected={category} onSelect={onCategoryChange} /></div>
    </div>
  </nav>;
}
