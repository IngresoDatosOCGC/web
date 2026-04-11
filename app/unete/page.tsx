'use client';

import { useState } from 'react';
import '../../css/unete.css';
import { GROUPS } from '@/components/unete/groups';
import { GroupId } from '@/components/unete/types';
import JoinModal from '@/components/unete/JoinModal';

export default function UnetePage() {
  const [activeForm, setActiveForm] = useState<GroupId | null>(null);

  const activeGroup = GROUPS.find(g => g.id === activeForm);

  return (
    <>
      {/* Hero */}
      <section className="unete-header" aria-labelledby="unete-main-title">
        <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--clr-gold)', marginBottom: 'var(--sp-4)' }}>
          Forma parte de algo grande
        </span>
        <h1 id="unete-main-title">Haz música con nosotros</h1>
        <p>Elige la agrupación que más te guste e inscríbete para formar parte de la OCGC.</p>
      </section>

      {/* Groups section */}
      <section className="section bg-white" aria-labelledby="groups-heading">
        <div className="text-center" style={{ marginBottom: 'var(--sp-12)' }}>
          <span className="section-eyebrow">Nuestras agrupaciones</span>
          <h2 id="groups-heading" className="section-title">¿Con qué grupo vibras más?</h2>
          <p className="section-subtitle">Cada agrupación tiene su propia personalidad. Encuentra la que más conecta contigo.</p>
        </div>

        <div className="unete-grid">
          {GROUPS.map((g) => (
            <article key={g.id} className="join-card" aria-labelledby={`${g.id}-title`}>
              <div className="card-content">
                <div className="join-icon" style={{ background: `${g.color}18`, color: g.color }}>
                  {g.icon}
                </div>
                <h3 id={`${g.id}-title`} style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--clr-navy)' }}>{g.name}</h3>
                <p>{g.description}</p>
              </div>
              <div className="join-btn-container">
                <button
                  onClick={() => setActiveForm(g.id)}
                  className="btn btn-outline"
                  style={{ width: '100%', cursor: 'pointer' }}
                  aria-haspopup="dialog"
                  aria-label={`Inscribirse en ${g.name}`}
                >
                  Quiero unirme
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section-full bg-light" style={{ paddingBlock: 'var(--sp-20)' }} aria-labelledby="process-heading">
        <div style={{ maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--sp-8)' }}>
          <div className="text-center" style={{ marginBottom: 'var(--sp-12)' }}>
            <span className="section-eyebrow">El proceso</span>
            <h2 id="process-heading" className="section-title">¿Cómo funciona?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-6)' }}>
            {[
              { num: '01', title: 'Solicita tu plaza',          desc: 'Rellena el formulario de la agrupación que te interese.' },
              { num: '02', title: 'Te contactamos',             desc: 'Nuestro equipo se pondrá en contacto contigo en menos de 48h.' },
              { num: '03', title: 'Prueba de nivel',            desc: 'Realizarás una pequeña audición informal para conocerte.' },
              { num: '04', title: '¡Bienvenido a la familia!',  desc: 'Te incorporas a los ensayos regulares de tu agrupación.' },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', color: 'var(--clr-primary)', opacity: 0.3, lineHeight: 1, fontWeight: 700 }}>{num}</span>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--clr-navy)' }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeGroup && (
        <JoinModal group={activeGroup} onClose={() => setActiveForm(null)} />
      )}
    </>
  );
}
