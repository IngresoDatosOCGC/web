import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-col">
          <h4>Entidades Patrocinadoras</h4>
          <div className="sponsor-grid">
            <img src="/assets/images/sponsors/caja_siete.png" alt="Fundación CajaSiete" />
            <img src="/assets/images/sponsors/cabildo.png" alt="Cabildo de Gran Canaria" />
            <img src="/assets/images/sponsors/gob_canarias.png" alt="Gobierno de Canarias" />
            <img src="/assets/images/sponsors/philip.png" alt="Philip Morris Spain" />
            <img src="/assets/images/sponsors/disa.png" alt="Fundación DISA" />
          </div>
        </div>
        <div className="footer-col">
          <h4>Con la colaboración de</h4>
          <div className="collabs-grid">
            <img src="/assets/images/collabs/telde.png" alt="Telde Cultura" />
            <img src="/assets/images/collabs/binter.png" alt="Binter" />
            <img src="/assets/images/collabs/sta_catalina.png" alt="Santa Catalina" />
            <img src="/assets/images/collabs/corte_ingles.png" alt="El Corte Inglés" />
            <img src="/assets/images/collabs/gabinete.png" alt="Gabinete Literario" />
            <img src="/assets/images/collabs/emem.png" alt="EMEM" />
            <img src="/assets/images/collabs/jaime_balmes.png" alt="Colegio Jaime Balmes" />
          </div>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#">Aviso Legal</a>
          <a href="#">Políticas de privacidad</a>
          <a href="#">Políticas de cookies</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div>
          <p>&copy; 2025 Orquesta Comunitaria Gran Canaria. Todos los derechos reservados.</p>
        </div>
        <div className="social-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/miembros" title="Acceso a Miembros" style={{ marginRight: 'auto', opacity: 0.8, transition: 'opacity 0.3s', display: 'inline-flex' }}>
            <img src="/assets/images/violin.png" alt="Acceso Miembros" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
          </Link>
          <a href="https://www.instagram.com/orquestacomunitariagc/"><i className="fab fa-instagram"></i></a>
          <a href="https://www.tiktok.com/@orquestacomunitariagc"><i className="fab fa-tiktok"></i></a>
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
        </div>
      </div>
    </footer>
  );
}
