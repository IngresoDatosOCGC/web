"use client";

export default function EnsembleFlautasPage() {
  return (
    <main className="group-detail-view">
      <section className="hero-section flautas-bg">
        <div className="hero-overlay">
          <h1>ENSEMBLE DE FLAUTAS</h1>
          <p>La elegancia del viento en la OCGC</p>
        </div>
      </section>

      <section className="details-container">
        <div className="text-content">
          <h2>Nuestro Ensemble</h2>
          <p>El Ensemble de Flautas de la OCGC es una formación versátil que explora las múltiples facetas de este instrumento.</p>
          <p>Desde la flauta flautín hasta la flauta baja, nuestro ensemble ofrece un espectro sonoro delicado y potente a la vez, con un repertorio que abarca desde arreglos de obras clásicas hasta piezas escritas específicamente para este tipo de formación.</p>
        </div>
        <div className="image-side">
          <img src="/assets/images/ensemble_flautas_detalle.jpg" alt="Ensemble de Flautas" />
        </div>
      </section>

      <style jsx>{`
        .group-detail-view { background: white; min-height: 100vh; }
        .hero-section { height: 55vh; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; position: relative; }
        .flautas-bg { background-image: url('/assets/images/flautas_hero_header.jpg'); }
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
