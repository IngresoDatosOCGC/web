"use client";

import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Main Header Section */}
        <section className="main-header" style={{ backgroundImage: "url('/assets/images/concert.jpg')" }}>
          <div className="main-header-content">
            <h1>La orquesta de todos y para todos</h1>
            <p>Música sinfónica, coro y ensamble con pasión desde Gran Canaria.</p>
            <div className="main-header-actions">
              <Link href="/nosotros" className="btn btn-primary">CONÓCENOS</Link>
              <Link href="/unete" className="btn btn-outline btn-outline-white">ÚNETE</Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="section about-grid">
          <div className="about-content">
            <h2>¿Quiénes Somos?</h2>
            <p>La Orquesta Comunitaria de Gran Canaria (OCGC) nace como respuesta a la necesidad de los músicos de la comunidad grancanaria de tener un espacio donde compartir su pasión por la música sinfónica.</p>
            <p>Nuestro principal motor es la unión social a través del lenguaje universal de la música, ofreciendo oportunidades de aprendizaje, crecimiento y disfrute a todos sus componentes y al público.</p>
            <br />
            <Link href="/nosotros" className="btn btn-primary">Saber más sobre nosotros</Link>
          </div>
          <div className="video-container">
            {/* Embedded YouTube Video */}
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" 
              title="Partitura para orquesta única | 2022" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="section newsletter-section">
          <div className="newsletter-form">
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Newsletter</h2>
            <p>¿Quieres estar al tanto de las novedades y actividades de la OCGC? <br /> ¡Apúntate y recibe en tu correo todas nuestras noticias para que no te pierdas ningún detalle!</p>
            <form action="#" method="POST" onSubmit={(e) => { e.preventDefault(); alert('¡Gracias por suscribirte!'); }}>
              <input type="text" placeholder="Nombre completo" required className="form-control" />
              <input type="email" placeholder="Correo electrónico" required className="form-control newsletter-email" />
              
              <div className="checkbox-group privacy-group">
                <input type="checkbox" id="privacy" required />
                <label htmlFor="privacy">Estoy de acuerdo con la <a href="#">Política de privacidad</a></label>
              </div>
              
              <button type="submit" className="btn btn-primary btn-full-width">Me suscribo</button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
