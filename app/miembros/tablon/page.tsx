"use client";

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";

export default function TablonPage() {
  const { user, isLoaded } = useUser();
  const [recentScores, setRecentScores] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded) {
      fetch("/api/scores")
        .then(res => res.json())
        .then(data => setRecentScores(data.slice(0, 5)))
        .catch(err => console.error("Error cargando el tablón:", err));
    }
  }, [isLoaded]);

  if (!isLoaded) return <p>Entrando en el área de miembros...</p>;

  const userRoles = (user?.publicMetadata?.roles as string[]) || [];

  return (
    <div className="tablon-view-django">
      <div className="tablon-header">
        <h1>Hola, {user?.firstName?.toUpperCase()}</h1>
      </div>

      {/*<div className="stats-box">
         <div className="stat-item">
            <span>Tu Agrupación:</span>
            <strong>{userRoles.length > 0 ? userRoles.join(", ") : "Invitado"}</strong>
         </div>
      </div>*/}

      <div className="recent-grid">
         <h3>Últimas partituras añadidas a tu sección:</h3>
         {recentScores.length === 0 ? (
           <p className="no-scores">No hay partituras nuevas para tu sección.</p>
         ) : (
           <div className="scores-list">
             {recentScores.map(score => (
               <div key={score.id} className="score-row">
                 <span className="score-title">{score.title}</span>
                 <a href={score.fileUrl} download className="btn-dl">DESCARGAR PDF</a>
               </div>
             ))}
           </div>
         )}
      </div>

      <style jsx>{`
        .tablon-view-django { padding: 1rem 0; width: 100%; border-radius: 12px; }
        .tablon-header h1 { color: #1a2a4b; font-size: 2.22rem; margin-bottom: 0.5rem; font-weight: 900; }
        .tablon-header h2 { color: #478AC9; font-size: 1.1rem; margin-bottom: 2rem; font-weight: 700; letter-spacing: 0.05em; }
        .stats-box { background: #f0f7ff; padding: 1.5rem; border-radius: 12px; margin-bottom: 3rem; border: 1px solid #d0e7ff; }
        .stat-item { display: flex; gap: 1rem; align-items: center; }
        .stat-item span { color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
        .stat-item strong { color: #0369a1; font-weight: 800; font-size: 1rem; }
        .scores-list { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .score-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; transition: 0.2s; }
        .score-row:hover { border-color: #478AC9; transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .score-title { font-weight: 700; color: #334155; font-size: 0.95rem; }
        .btn-dl { background: #478AC9; color: white !important; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-size: 0.75rem; font-weight: 800; box-shadow: 0 4px 6px rgba(71, 138, 201, 0.2); }
        .btn-dl:hover { background: #3b71a8; }
        .recent-grid h3 { color: #1e293b; font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
