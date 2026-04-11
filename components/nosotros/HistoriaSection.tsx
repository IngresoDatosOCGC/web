// ── HistoriaSection — Nosotros Page ──
import Link from 'next/link';

export default function HistoriaSection() {
  return (
    <section className="section bg-white" aria-labelledby="historia-heading">
      <div className="about-grid">
        <div className="about-content">
          <span className="section-eyebrow">Nuestra Historia</span>
          <h2 id="historia-heading">Un proyecto que nació<br />de la ilusión colectiva</h2>
          <p>
            La Orquesta Comunitaria de Gran Canaria (OCGC) nace en 2018 como respuesta a la necesidad
            de los músicos de la comunidad grancanaria de tener un espacio donde compartir su pasión
            por la música sinfónica.
          </p>
          <p>
            Lo que comenzó como reunión de amigos con un instrumento, se ha convertido hoy en un
            proyecto cultural de referencia en las Islas Canarias, con más de 150 músicos activos
            distribuidos en seis agrupaciones.
          </p>
          <p>
            Nuestro principal motor es la unión social a través del lenguaje universal de la música,
            ofreciendo oportunidades de aprendizaje, crecimiento y disfrute a todos sus componentes
            y al público asistente.
          </p>
          <div className="nosotros-actions">
            <Link href="/unete" className="btn btn-primary">Únete a la familia</Link>
            <Link href="/conciertos" className="btn btn-outline">Ver conciertos</Link>
          </div>
        </div>
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            title="OCGC — Presentación de la Orquesta"
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
