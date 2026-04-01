import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <div className="logo">
        <Link href="/">
          <img src="/assets/images/logo_ocgc.png" alt="OCGC Logo" style={{ height: '50px' }} />
        </Link>
      </div>
      <nav>
        <ul className="nav-links">
          <li><Link href="/">INICIO</Link></li>
          <li>
            <Link href="/nosotros">NOSOTROS <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem' }}></i></Link>
            <div className="dropdown-menu">
              <Link href="/nosotros">Quiénes somos</Link>
              <Link href="/nosotros/orquesta">Orquesta</Link>
              <Link href="/nosotros/coro">Coro</Link>
              <Link href="/nosotros/ensemble-de-flautas">Ensemble de Flautas</Link>
              <Link href="/nosotros/ensemble-de-metales">Ensemble de Metales</Link>
              <Link href="/nosotros/ensemble-de-violonchelos">Ensemble de Violonchelos</Link>
              <Link href="/nosotros/big-band">Big Band</Link>
            </div>
          </li>
          <li><Link href="/conciertos">CONCIERTOS</Link></li>
          <li><Link href="/unete">ÚNETE</Link></li>
          <li><a href="https://www.paypal.com/donate/?hosted_button_id=WQGTER7DPGGB6" target="_blank" rel="noreferrer" className="btn-donate">DONAR</a></li>
        </ul>
        <a href="https://auditorioalfredokraus.janto.es/janto/main.php?Nivel=Evento&idEvento=OCGC0326" target="_blank" rel="noreferrer" className="btn btn-outline">
          <i className="fas fa-ticket-alt"></i> ENTRADAS
        </a>
      </nav>
      <button className="mobile-menu-btn" style={{ display: 'none' }}><i className="fas fa-bars"></i></button>
    </header>
  );
}
