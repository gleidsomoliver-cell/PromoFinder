import { Tag } from 'lucide-react';

export default function Logo() {
  return <a href={import.meta.env.BASE_URL} className="logo" aria-label="PromoFinder — Início">
    <span className="logo-icon"><Tag size={24} aria-hidden="true" /></span>
    <span className="logo-text">Promo<span>Finder</span></span>
  </a>;
}
