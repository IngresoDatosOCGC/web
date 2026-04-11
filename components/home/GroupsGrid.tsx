// ── GroupsGrid — Home Page ──
import Link from 'next/link';
import { IconMusic, IconArrowRight } from '@/components/ui/Icons';

interface Group { name: string; desc: string; }

const GROUPS: Group[] = [
  { name: 'Orquesta Sinfónica',       desc: 'El corazón de la OCGC. Repertorio sinfónico de todas las épocas.' },
  { name: 'Coro (COCGC)',             desc: 'Voces que elevan el espíritu. Música coral clásica y contemporánea.' },
  { name: 'Ensemble de Flautas',      desc: 'La delicadeza del viento madera en pequeño formato de cámara.' },
  { name: 'Ensemble de Metales',      desc: 'Potencia y brillo de los metales en perfecta armonía sinfónica.' },
  { name: 'Ensemble de Violonchelos', desc: 'La calidez profunda de la cuerda grave. Una formación única.' },
  { name: 'Big Band',                 desc: 'Jazz, swing y blues en estado puro para aportar energía vital.' },
];

export default function GroupsGrid() {
  return (
    <section
      className="section-full bg-light"
      aria-labelledby="groups-heading"
      style={{ paddingBlock: 'var(--sp-20)' }}
    >
      <div style={{ maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--sp-8)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--sp-12)' }}>
          <span className="section-eyebrow">La familia OCGC</span>
          <h2 id="groups-heading" className="section-title">Seis voces, un mismo corazón</h2>
          <p className="section-subtitle">Descubre todos los grupos que forman parte de nuestro proyecto musical.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-5)' }}>
          {GROUPS.map(({ name, desc }) => (
            <Link
              key={name}
              href="/nosotros"
              className="card"
              style={{ padding: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', textDecoration: 'none' }}
            >
              <div style={{
                width: 52, height: 52,
                background: 'var(--clr-primary-lt)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--clr-primary)',
              }}>
                <IconMusic size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--clr-navy)', margin: 0 }}>{name}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-primary)', fontWeight: 700, marginTop: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Saber más
                <IconArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
