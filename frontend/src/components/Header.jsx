import { useEffect, useId, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import FavoritesButton from './FavoritesButton.jsx';
import MobileMenu from './MobileMenu.jsx';
import '../styles/header.css';

export default function Header({ category, onCategoryChange }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    const closeOutside = event => {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnResize = () => setOpen(false);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    window.addEventListener('resize', closeOnResize);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [open]);

  return <header className="header" ref={headerRef}>
    <div className="container header-container">
      <Logo />
      <div className="header-actions">
        <ThemeToggle />
        <FavoritesButton />
        <button ref={toggleRef} type="button" className={`icon-btn mobile-menu-btn${open ? ' is-open' : ''}`} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={menuId} aria-label={open ? 'Fechar menu' : 'Abrir menu'} title={open ? 'Fechar menu' : 'Abrir menu'}>
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>
    </div>
    <MobileMenu id={menuId} open={open} onClose={() => setOpen(false)} category={category} onCategoryChange={onCategoryChange} />
  </header>;
}
