// ── NosotrosHero — Nosotros Page ──

export default function NosotrosHero() {
  return (
    <section
      className="main-header"
      style={{ height: '70vh', minHeight: 480 }}
      aria-labelledby="nosotros-heading"
    >
      <div
        className="hero-bg"
        style={{ backgroundImage: "url('/assets/images/concert.jpg')" }}
        role="img"
        aria-label="Fotografía de la OCGC en concierto"
      />
      <div className="main-header-content">
        <span className="hero-eyebrow">Gran Canaria · Desde 2018</span>
        <h1 id="nosotros-heading">Quiénes Somos</h1>
        <p>Una orquesta nacida de la pasión compartida<br />por la música y la comunidad.</p>
      </div>
    </section>
  );
}
