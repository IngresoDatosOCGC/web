// ── HeroSection — Home Page ──
import Link from 'next/link';
import { IconArrowDown } from '@/components/ui/Icons';

export default function HeroSection() {
  return (
    <section className="main-header" aria-label="Sección principal">
      <div
        className="hero-bg"
        style={{ backgroundImage: "url('/assets/images/concert.jpg')" }}
        role="img"
        aria-label="Fotografía de concierto de la OCGC"
      />
      <div className="main-header-content">
        <span className="hero-eyebrow">Gran Canaria · Desde 2018</span>
        <h1>La orquesta de todos<br />y para todos</h1>
        <p>Música sinfónica, coro y ensamble con pasión<br />desde el corazón de Gran Canaria.</p>
        <div className="main-header-actions">
          <Link href="/nosotros" className="btn btn-gold">Conócenos</Link>
          <Link href="/unete" className="btn btn-outline-white">Únete a nosotros</Link>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span>Descubre</span>
        <IconArrowDown />
      </div>
    </section>
  );
}
