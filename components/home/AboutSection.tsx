// ── AboutSection — Home Page ──
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="section bg-white" aria-labelledby="about-heading">
      <div className="about-grid">
        <div className="about-content">
          <span className="section-eyebrow">Quiénes somos</span>
          <h2 id="about-heading">Una orquesta nacida<br />de la pasión colectiva</h2>
          <p>
            La Orquesta Comunitaria de Gran Canaria (OCGC) nace como respuesta a la necesidad de los músicos
            de la comunidad grancanaria de tener un espacio donde compartir su pasión por la música sinfónica.
          </p>
          <p>
            Nuestro principal motor es la unión social a través del lenguaje universal de la música, ofreciendo
            oportunidades de aprendizaje y disfrute a todos sus componentes.
          </p>
          <div className="nosotros-actions">
            <Link href="/nosotros" className="btn btn-primary">Nuestra historia</Link>
            <Link href="/conciertos" className="btn btn-outline">Ver próximos conciertos</Link>
          </div>
        </div>
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            title="Orquesta Comunitaria de Gran Canaria — Actuación"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
