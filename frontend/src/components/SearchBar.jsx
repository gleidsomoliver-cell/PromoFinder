import { useState } from 'react';
import { Search } from 'lucide-react';
import '../styles/search.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(query.trim());
  }
  return <div className="search-area">
    <form className="search-box" role="search" onSubmit={handleSubmit}>
      <Search className="search-icon" size={20} aria-hidden="true" />
      <input type="search" aria-label="Buscar produtos" placeholder="Digite o produto que você procura..." value={query} onChange={event => { setQuery(event.target.value); setSubmitted(''); }} />
      <button type="submit">Buscar</button>
    </form>
    <p className="search-feedback" role="status">{submitted ? `Busca: ${submitted}` : ''}</p>
  </div>;
}
