"use client";

import Link from 'next/link';
import '../../css/conciertos.css';
import ConcertCard from '@/components/conciertos/ConcertCard';

const UPCOMING_CONCERTS = [
  {
    id: 'proximo',
    title: 'Próximo Gran Concierto',
    date: 'Próximamente',
    venue: 'Auditorio Alfredo Kraus',
    description: 'Próximamente anunciaremos los detalles de nuestro siguiente gran evento. ¡Mantente atento!',
    ticketUrl: 'https://auditorioalfredokraus.janto.es/janto/main.php?Nivel=Evento&idEvento=OCGC0326',
    gradient: 'linear-gradient(135deg, var(--clr-navy), var(--clr-navy-mid))',
  },
];

const PAST_CONCERTS = [
  { id: 'cuerdas',   title: 'Cuerdas que unen',              date: '2024', description: 'Un concierto muy especial con nuestros músicos de cuerda. Una tarde inolvidable de emoción y virtuosismo.',         gradient: 'linear-gradient(135deg, var(--clr-primary), var(--clr-navy-mid))' },
  { id: 'rach',      title: 'Rachmaninov · Misisipi · Héroes', date: '2023', description: 'Homenaje a los grandes clásicos junto a piezas épicas que dejaron huella entre nuestro público.',               gradient: 'linear-gradient(135deg, #1a2a4b, #2d3561)' },
  { id: 'clasicos',  title: 'Clásicos de Cuento',            date: '2023', description: 'Las historias de siempre contadas a través de la música. Un viaje mágico para toda la familia.',                   gradient: 'linear-gradient(135deg, #5b2d8e, #8e44ad)' },
  { id: 'navidad',   title: 'Concierto de Navidad',          date: '2022', description: 'La magia de la Navidad puesta en música sinfónica. Tradición y emoción en un solo acto.',                          gradient: 'linear-gradient(135deg, #c0392b, #a93226)' },
  { id: 'primavera', title: 'Primavera Musical',             date: '2022', description: 'Un recorrido por las grandes obras del clasicismo y el romanticismo en el Auditorio Alfredo Kraus.',               gradient: 'linear-gradient(135deg, #27ae60, #1e8449)' },
];

export default function ConciertosPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="concert-header"
        style={{ backgroundImage: "url('/assets/images/concert.jpg')" }}
        aria-label="Encabezado de Conciertos"
      >
        <div>
          <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--clr-gold)', marginBottom: 'var(--sp-3)' }}>
            OCGC · Programación
          </span>
          <h1>Temporada 2025–2026</h1>
          <p>Descubre nuestros próximos eventos y acompáñanos en la música</p>
        </div>
      </section>

      {/* Próximos conciertos */}
      <section className="section bg-white" aria-labelledby="upcoming-heading">
        <span className="section-eyebrow">Agenda</span>
        <h2 id="upcoming-heading" className="section-title">Próximos Conciertos</h2>
        <div className="concert-grid">
          {UPCOMING_CONCERTS.map((c) => (
            <ConcertCard key={c.id} concert={c} showVenue />
          ))}
        </div>
      </section>

      {/* Historial */}
      <section className="section-full bg-light" style={{ paddingBlock: 'var(--sp-20)' }} aria-labelledby="past-heading">
        <div style={{ maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--sp-8)' }}>
          <span className="section-eyebrow">Archivo</span>
          <h2 id="past-heading" className="section-title">Histórico de Conciertos</h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--sp-10)' }}>
            Todos los momentos que hemos vivido juntos sobre el escenario.
          </p>
          <div className="concert-grid">
            {PAST_CONCERTS.map((c) => (
              <ConcertCard key={c.id} concert={c} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--clr-navy)', padding: 'var(--sp-16) var(--sp-8)', textAlign: 'center' }} aria-labelledby="cta-heading">
        <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--clr-gold)', marginBottom: 'var(--sp-4)' }}>
          ¿Eres músico?
        </span>
        <h2 id="cta-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: '#fff', marginBottom: 'var(--sp-4)' }}>
          Sube al escenario con nosotros
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--text-lg)', maxWidth: 520, marginInline: 'auto', marginBottom: 'var(--sp-8)' }}>
          La OCGC siempre tiene las puertas abiertas para músicos de todos los niveles y estilos.
        </p>
        <Link href="/unete" className="btn btn-gold">Únete a la familia</Link>
      </section>
    </>
  );
}
