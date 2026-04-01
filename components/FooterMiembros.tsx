import Link from 'next/link';

export default function FooterMiembros() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-col">
          <h4>Área de Miembros</h4>
          <Link href="/miembros/tablon">Tablón</Link>
          <Link href="/miembros/repositorio">Repositorio</Link>
          <Link href="/miembros/agenda">Agenda</Link>
        </div>
        <div className="footer-col">
          <h4>Web Pública</h4>
          <Link href="/">Inicio</Link>
          <Link href="/nosotros">Nosotros</Link>
          <Link href="/conciertos">Conciertos</Link>
          <Link href="/unete">Únete</Link>
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
          <Link href="/" title="Volver a la web pública" style={{ opacity: 0.8, transition: 'opacity 0.3s', display: 'inline-flex' }}>
            <img src="/assets/images/logo_ocgc.png" alt="Web OCGC" style={{ height: '22px', filter: 'brightness(0) invert(1)' }} />
          </Link>
          <a href="https://www.instagram.com/orquestacomunitariagc/"><i className="fab fa-instagram"></i></a>
          <a href="https://www.tiktok.com/@orquestacomunitariagc"><i className="fab fa-tiktok"></i></a>
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
        </div>
      </div>
    </footer>
  );
}
