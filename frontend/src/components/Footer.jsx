import Logo from './Logo.jsx';
import { legacyUrl } from '../utils/legacyUrl.js';
import '../styles/footer.css';

export default function Footer() {
  return <footer className="footer">
    <div className="container footer-container">
      <div className="footer-col main-col">
        <Logo />
        <p>O seu agregador de ofertas inteligente. Encontre descontos e economize em todas as suas compras online.</p>
      </div>
      <div className="footer-col">
        <h2>Navegação</h2>
        <ul>
          <li><a href={import.meta.env.BASE_URL}>Início</a></li>
          <li><a href={legacyUrl('lojas.html')}>Lojas com Ofertas</a></li>
          <li><a href={legacyUrl('cupons.html')}>Cupons de Desconto</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h2>Legal</h2>
        <ul>
          <li><a href={legacyUrl('termos.html')}>Termos de Uso</a></li>
          <li><a href={legacyUrl('privacidade.html')}>Política de Privacidade</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom container">
      <p className="affiliate-disclosure">Transparência: O PromoFinder participa de programas de afiliados. Podemos receber uma comissão por compras realizadas através de alguns links, sem custo adicional para você.</p>
      <p>© 2026 PromoFinder. Todos os direitos reservados.</p>
    </div>
  </footer>;
}
