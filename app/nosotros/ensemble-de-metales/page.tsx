"use client";

export default function EnsembleMetalesPage() {
  return (
    <main className="group-detail-view">
      <section className="hero-section metales-bg">
        <div className="hero-overlay">
          <h1>ENSEMBLE DE METALES</h1>
          <p>Potencia sonora y brillantez musical</p>
        </div>
      </section>

      <section className="details-container">
        <div className="image-side">
          <img src="/assets/images/ensemble_metales_detalle.jpg" alt="Ensemble de Metales" />
        </div>
        <div className="text-content">
          <h2>Brillantez y Potencia</h2>
          <p>Trompetas, trompas, trombones y tubas se unen en la OCGC para ofrecer un despliegue de energía sonora único en Gran Canaria.</p>
          <p>Nuestro ensemble de metales es famoso por su capacidad de llenar el espacio con una sonoridad majestuosa, interpretando obras desde el Renacimiento hasta bandas sonoras contemporáneas.</p>
        </div>
      </section>

      <style jsx>{`
        .group-detail-view { background: white; min-height: 100vh; }
        .hero-section { height: 55vh; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; position: relative; }
        .metales-bg { background-image: url('/assets/images/metales_hero_header.jpg'); }
        .hero-overlay { background: rgba(0,0,0,0.5); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 0 5%; }
        .hero-overlay h1 { font-size: 3rem; letter-spacing: 0.3em; font-weight: 800; margin-bottom: 1rem; }
        .details-container { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; padding: 5rem 10%; max-width: 1400px; margin: 0 auto; align-items: center; }
        .text-content h2 { font-size: 2rem; color: #1a2a4b; margin-bottom: 1.5rem; border-bottom: 3px solid #478AC9; display: inline-block; padding-bottom: 0.5rem; }
        .text-content p { font-size: 1.1rem; line-height: 1.8; color: #555; margin-bottom: 1.5rem; }
        .image-side img { width: 100%; border-radius: 15px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
      `}</style>
    </main>
  );
}
