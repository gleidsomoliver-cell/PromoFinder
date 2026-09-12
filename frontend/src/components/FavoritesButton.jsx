import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { legacyUrl } from '../utils/legacyUrl.js';

function readCount() {
  try {
    const values = JSON.parse(localStorage.getItem('favorites'));
    return Array.isArray(values) ? new Set(values.filter(value => typeof value === 'string')).size : 0;
  } catch { return 0; }
}

export default function FavoritesButton() {
  const [count, setCount] = useState(readCount);
  useEffect(() => {
    const sync = () => setCount(readCount());
    window.addEventListener('storage', sync);
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);
  const label = count ? `Favoritos (${count})` : 'Favoritos';
  return <a href={legacyUrl('favoritos.html')} className="icon-btn favorites-btn" title={label} aria-label={label}>
    <Heart size={20} aria-hidden="true" /><span className="favorites-label">{label}</span>
  </a>;
}
