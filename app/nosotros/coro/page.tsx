"use client";

export default function CoroPage() {
  return (
    <main className="group-detail-view">
      <section className="hero-section coro-bg">
        <div className="hero-overlay">
          <h1>CORO OCGC</h1>
          <p>La unión de voces más vibrante de Gran Canaria</p>
        </div>
      </section>

      <section className="details-container">
        <div className="text-content">
          <h2>Sobre el Coro</h2>
          <p>Fundado por la Orquesta Comunitaria de Gran Canaria, el Coro OCGC nace de la ilusión de crear un espacio donde todas las voces tengan cabida.</p>
          <p>Bajo la dirección de profesionales de primer nivel, nuestro coro explora Repertorios desde lo clásico hasta lo contemporáneo, demostrando que la música coral no tiene fronteras.</p>
        </div>
        <div className="image-side">
          <img src="/assets/images/coro_detalle.jpg" alt="Ensayo Coro" />
        </div>
      </section>

      <style jsx>{`
        .group-detail-view { background: white; min-height: 100vh; }
        .hero-section { height: 60vh; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; position: relative; }
        .coro-bg { background-image: url('/assets/images/coro_hero_header.jpg'); }
        .hero-overlay { background: rgba(0,0,0,0.4); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 0 5%; }
        .hero-overlay h1 { font-size: 3.5rem; letter-spacing: 0.3em; font-weight: 800; margin-bottom: 1rem; }
        .details-container { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; padding: 5rem 10%; max-width: 1400px; margin: 0 auto; align-items: center; }
        .text-content h2 { font-size: 2.2rem; color: #1a2a4b; margin-bottom: 2rem; border-bottom: 3px solid #478AC9; display: inline-block; padding-bottom: 0.5rem; }
        .text-content p { font-size: 1.1rem; line-height: 2; color: #555; margin-bottom: 1.5rem; }
        .image-side img { width: 100%; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
      `}</style>
    </main>
  );
}
