import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import '../../css/conciertos.css';

export const metadata = {
  title: 'Conciertos | Orquesta Comunitaria Gran Canaria',
  description: 'Calendario de conciertos y eventos de la Orquesta Comunitaria de Gran Canaria.',
};

export default function ConciertosPage() {
  return (
    <>
      <Header />
      <main>
        <section className="concert-header">
          <div>
            <h1>Temporada 2025-2026</h1>
            <p>Descubre nuestros próximos eventos y acompáñanos</p>
          </div>
        </section>

        <section className="section animate-on-scroll">
          <h2 className="section-title">Próximos Conciertos</h2>
          <div className="concert-grid">
            <div className="concert-card">
              <div className="concert-img-placeholder" style={{ background: '#e0e0e0', color: '#888' }}><i className="fas fa-music fa-3x"></i></div>
              <div className="concert-info">
                <h3>Próximo Gran Concierto</h3>
                <p><i className="fas fa-calendar-alt"></i> Próximamente</p>
                <p><i className="fas fa-map-marker-alt"></i> Auditorio Alfredo Kraus</p>
                <Link href="#" className="btn btn-primary" style={{ display: 'block', width: '100%', marginTop: '1rem', textAlign: 'center' }}>Comprar Entradas</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-light animate-on-scroll">
          <h2 className="section-title">Histórico de Conciertos</h2>
          <div className="concert-grid">
            <div className="concert-card">
              <div className="concert-img-placeholder" style={{ background: '#478AC9', fontWeight: 'bold', fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cuerdas que unen</div>
              <div className="concert-info">
                <h3>Cuerdas que unen</h3>
                <p>2024</p>
                <p>Un concierto muy especial con nuestros músicos de cuerda.</p>
              </div>
            </div>
            <div className="concert-card">
              <div className="concert-img-placeholder" style={{ background: '#333', fontWeight: 'bold', fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Rachmaninov Misisipi Héroes</div>
              <div className="concert-info">
                <h3>Rachmaninov Misisipi Héroes</h3>
                <p>2023</p>
                <p>Homenaje a los clásicos y piezas épicas.</p>
              </div>
            </div>
            <div className="concert-card">
              <div className="concert-img-placeholder" style={{ background: '#8e44ad', fontWeight: 'bold', fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Clásicos de cuento</div>
              <div className="concert-info">
                <h3>Clásicos de cuento</h3>
                <p>2023</p>
                <p>Las historias de siempre contadas a través de la música.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
