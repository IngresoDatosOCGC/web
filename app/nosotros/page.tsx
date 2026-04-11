"use client";

import NosotrosHero from '@/components/nosotros/NosotrosHero';
import HistoriaSection from '@/components/nosotros/HistoriaSection';
import StatsBar from '@/components/shared/StatsBar';
import ValoresSection from '@/components/nosotros/ValoresSection';
import AgrupacionesSection from '@/components/nosotros/AgrupacionesSection';
import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <>
      <NosotrosHero />
      <HistoriaSection />
      <StatsBar />
      <ValoresSection />
      <AgrupacionesSection />

      {/* ── CTA ── */}
      <section
        className="newsletter-section"
        style={{ textAlign: 'center' }}
        aria-labelledby="cta-nosotros-heading"
      >
        <div style={{ maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--sp-8)' }}>
          <span className="hero-eyebrow" style={{ color: 'var(--clr-gold)' }}>¿Quieres ser parte?</span>
          <h2 id="cta-nosotros-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: '#fff', marginBottom: 'var(--sp-4)' }}>
            Tu instrumento tiene un sitio aquí
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-lg)', maxWidth: 540, marginInline: 'auto', marginBottom: 'var(--sp-8)' }}>
            La OCGC siempre tiene las puertas abiertas para músicos de todos los niveles, edades y estilos.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/unete" className="btn btn-gold">Únete ahora</Link>
            <Link href="/conciertos" className="btn btn-outline-white">Ver conciertos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
