"use client";

import Link from 'next/link';

const GROUPS = [
  { name: 'Orquesta Sinfónica', desc: 'El corazón de la OCGC. Repertorio sinfónico de todas las épocas.' },
  { name: 'Coro (COCGC)', desc: 'Voces que elevan el espíritu. Música coral clásica y contemporánea.' },
  { name: 'Ensemble de Flautas', desc: 'La delicadeza del viento madera en pequeño formato de cámara.' },
  { name: 'Ensemble de Metales', desc: 'Potencia y brillo de los metales en perfecta armonía sinfónica.' },
  { name: 'Ensemble de Violonchelos', desc: 'La calidez profunda de la cuerda grave. Una formación única.' },
  { name: 'Big Band', desc: 'Jazz, swing y blues en estado puro para aportar energía vital.' },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
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
        {/* Scroll indicator */}
        <div className="hero-scroll" aria-hidden="true">
          <span>Descubre</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-bar" role="region" aria-label="Cifras destacadas">
        <div className="stats-grid">
          {[
            { num: '+150', label: 'Músicos Activos' },
            { num: '+50', label: 'Conciertos Ofrecidos' },
            { num: '6', label: 'Agrupaciones' },
            { num: '2018', label: 'Año de Fundación' },
          ].map(({ num, label }) => (
            <div className="stat-item" key={label}>
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
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

      {/* ── AGRUPACIONES ── */}
      <section className="section-full bg-light" aria-labelledby="groups-heading" style={{ paddingBlock: 'var(--sp-20)' }}>
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--clr-navy)', margin: 0 }}>{name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-primary)', fontWeight: 700, marginTop: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Saber más
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section" aria-labelledby="newsletter-heading">
        <div style={{ maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--sp-8)' }}>
          <span className="hero-eyebrow" style={{ color: 'var(--clr-gold)' }}>Mantente al día</span>
          <h2 id="newsletter-heading">Suscríbete a nuestra Newsletter</h2>
          <p className="lead" style={{ maxWidth: 600, marginInline: 'auto' }}>
            Únete a nuestra lista de correo para recibir avisos de conciertos, eventos especiales y noticias de la orquesta.
          </p>
          <form
            action="#"
            method="POST"
            className="newsletter-form"
            onSubmit={(e) => { e.preventDefault(); alert('¡Gracias por suscribirte!'); }}
            aria-label="Formulario de suscripción al newsletter"
          >
            <input
              type="text"
              placeholder="Tu nombre"
              required
              className="form-control"
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              required
              className="form-control newsletter-email"
              autoComplete="email"
            />
            <div className="checkbox-group privacy-group" style={{ justifyContent: 'center' }}>
              <input type="checkbox" id="privacy" required />
              <label htmlFor="privacy" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-xs)' }}>
                Acepto la <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>Política de privacidad</a>
              </label>
            </div>
            <button type="submit" className="btn btn-gold btn-full-width" style={{ marginTop: 'var(--sp-4)' }}>
              Suscribirme ahora
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
