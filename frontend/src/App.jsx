import Header from './components/Header.jsx';
import { useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [category, setCategory] = useState('Eletrônicos');
  return <>
    <Header category={category} onCategoryChange={setCategory} />
    <HomePage category={category} onCategoryChange={setCategory} />
    <Footer />
  </>;
}
