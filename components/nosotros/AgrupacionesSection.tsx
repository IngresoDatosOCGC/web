// ── AgrupacionesSection — Nosotros Page ──
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  short: string;
  desc: string;
  color: string;
}

const GROUPS: Group[] = [
  { id: 'orquesta', name: 'Orquesta Sinfónica', short: 'Orquesta',
    desc: 'Nuestro corazón artístico. Repertorio sinfónico de todas las épocas para músicos de cuerda, viento y percusión.',
    color: 'linear-gradient(135deg, var(--clr-navy), var(--clr-navy-mid))' },
  { id: 'coro', name: 'Coro (COCGC)', short: 'Coro',
    desc: 'Voces que elevan el espíritu. Música coral clásica, contemporánea y popular con todo el corazón.',
    color: 'linear-gradient(135deg, #5b2d8e, #8e44ad)' },
  { id: 'bigband', name: 'Big Band', short: 'Big Band',
    desc: 'Jazz, swing y blues en estado puro. Saxofones, metales y base rítmica para aportar energía vital.',
    color: 'linear-gradient(135deg, #1a2a4b, #2c3561)' },
  { id: 'flautas', name: 'Ensemble de Flautas', short: 'Flautas',
    desc: 'La delicadeza del viento madera. Desde el piccolo hasta la flauta bajo, en pequeño formato de cámara.',
    color: 'linear-gradient(135deg, #16a085, #1abc9c)' },
  { id: 'metales', name: 'Ensemble de Metales', short: 'Metales',
    desc: 'Potencia y brillo. Trompetas, trompas, trombones y tubas en perfecta armonía sinfónica.',
    color: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  { id: 'chelos', name: 'Ensemble de Violonchelos', short: 'Violonchelos',
    desc: 'Un espacio exclusivo dedicado al hermoso y cálido timbre del violonchelo. Una formación única en Canarias.',
    color: 'linear-gradient(135deg, #27ae60, #2ecc71)' },
];

export default function AgrupacionesSection() {
  return (
    <section className="section bg-white" aria-labelledby="agrupaciones-heading">
      <div className="text-center" style={{ marginBottom: 'var(--sp-12)' }}>
        <span className="section-eyebrow">La familia OCGC</span>
        <h2 id="agrupaciones-heading" className="section-title">Nuestras Agrupaciones</h2>
        <p className="section-subtitle">Seis voces, un mismo corazón. Cada agrupación tiene su identidad y personalidad únicas.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-5)' }}>
        {GROUPS.map(({ id, name, short, desc, color }) => (
          <article
            key={id}
            aria-labelledby={`group-${id}`}
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--clr-border)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'transform var(--ease-mid), box-shadow var(--ease-mid)',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)';
            }}
          >
            <div style={{ background: color, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
                {short}
              </span>
            </div>
            <div style={{ padding: 'var(--sp-6)', background: 'var(--clr-surface)' }}>
              <h3 id={`group-${id}`} style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--clr-navy)', marginBottom: 'var(--sp-3)' }}>
                {name}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', lineHeight: 1.7, marginBottom: 'var(--sp-5)' }}>{desc}</p>
              <Link
                href="/unete"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--clr-primary)', textDecoration: 'none', transition: 'gap var(--ease-fast)' }}
              >
                Apuntarse
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
