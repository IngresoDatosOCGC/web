'use client';
// ── NewsletterSection — Home Page ──

export default function NewsletterSection() {
  return (
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
          <input type="text" placeholder="Tu nombre" required className="form-control" autoComplete="name" />
          <input type="email" placeholder="Tu correo electrónico" required className="form-control newsletter-email" autoComplete="email" />
          <div className="checkbox-group privacy-group" style={{ justifyContent: 'center' }}>
            <input type="checkbox" id="newsletter-privacy" required />
            <label htmlFor="newsletter-privacy" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-xs)' }}>
              Acepto la <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>Política de privacidad</a>
            </label>
          </div>
          <button type="submit" className="btn btn-gold btn-full-width" style={{ marginTop: 'var(--sp-4)' }}>
            Suscribirme ahora
          </button>
        </form>
      </div>
    </section>
  );
}
