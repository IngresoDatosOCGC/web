"use client";

import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <main className="nosotros-page">
      <section className="nosotros-hero">
        <div className="hero-content">
          <h1>NOSOTROS</h1>
          <p>La Orquesta Comunitaria de Gran Canaria (OCGC) es un proyecto único que une a la sociedad a través de la música.</p>
        </div>
      </section>

      <section className="story-section">
        <div className="container">
          <h2>Nuestra Historia</h2>
          <p>Nace de la ilusión de crear un espacio de encuentro musical para músicos aficionados, estudiantes y profesionales...</p>
        </div>
      </section>

      <section className="groups-grid-section">
        <div className="container">
          <h2>Agrupaciones y Ensembles</h2>
          <div className="groups-grid">
             <Link href="/nosotros/orquesta" className="group-card orquesta-card"><h3>ORQUESTA</h3></Link>
             <Link href="/nosotros/coro" className="group-card coro-card"><h3>CORO</h3></Link>
             <Link href="/nosotros/big-band" className="group-card bigband-card"><h3>BIG BAND</h3></Link>
             <Link href="/nosotros/ensemble-de-flautas" className="group-card flautas-card"><h3>FLAUTAS</h3></Link>
             <Link href="/nosotros/ensemble-de-metales" className="group-card metales-card"><h3>METALES</h3></Link>
             <Link href="/nosotros/ensemble-de-violonchelos" className="group-card chelos-card"><h3>CHELLOS</h3></Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .nosotros-hero { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 10rem 5%; color: white; text-align: center; }
        .nosotros-hero h1 { font-size: 4rem; letter-spacing: 0.2em; font-weight: 800; }
        .story-section { padding: 4rem 10%; background: white; text-align: center; line-height: 2; }
        .groups-grid-section { padding: 5rem 5%; background: #f9f9f9; }
        .groups-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .group-card { height: 250px; display: flex; align-items: center; justify-content: center; text-decoration: none; border-radius: 15px; transition: 0.4s; position: relative; overflow: hidden; }
        .group-card h3 { color: white; position: relative; z-index: 2; font-size: 1.5rem; letter-spacing: 0.1em; }
        .group-card::after { content: ''; position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.4); transition: 0.3s; }
        .group-card:hover::after { background: rgba(0,0,0,0.6); }
        .group-card:hover { transform: scale(1.02); }
        .orquesta-card { background: linear-gradient(135deg, #2c3e50, #2980b9); }
        .coro-card { background: linear-gradient(135deg, #8e44ad, #9b59b6); }
        .bigband-card { background: linear-gradient(135deg, #d35400, #e67e22); }
        .flautas-card { background: linear-gradient(135deg, #16a085, #1abc9c); }
        .metales-card { background: linear-gradient(135deg, #c0392b, #e74c3c); }
        .chelos-card { background: linear-gradient(135deg, #27ae60, #2ecc71); }
      `}</style>
    </main>
  );
}
