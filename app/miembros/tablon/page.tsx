"use client";

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from "@/lib/supabase-auth-context";

export default function TablonPage() {
  const { user, isLoading: isAuthLoading } = useSupabaseAuth();
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch("/api/scores?limit=5")
        .then(res => { if (!res.ok) throw new Error("Failed to fetch scores"); return res.json(); })
        .then(data => setRecentScores(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error loading scores:", err));

      fetch("/api/events?upcoming=true&limit=4")
        .then(res => { if (!res.ok) throw new Error("Failed to fetch events"); return res.json(); })
        .then(data => {
            if (!Array.isArray(data)) return;
            setUpcomingEvents(data);
        })
        .catch(err => console.error("Error loading events:", err));
    }
  }, [user]);

  const forceDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  if (isAuthLoading) return null;

  return (
    <div className="tablon-full-container">
      <div className="dashboard-grid">
        
        {/* COLUMNA IZQUIERDA: PARTITURAS */}
        <section className="dashboard-column">
          <div className="column-header">
            <span className="icon-circ">🎼</span>
            <h3>Últimas partituras</h3>
          </div>

          <div className="cards-stack">
            {recentScores.length === 0 ? (
              <div className="empty-card">No hay partituras nuevas.</div>
            ) : (
              recentScores.map(score => (
                <div key={score.id} className="item-row-card">
                  <div className="item-body">
                    <div className="item-meta">
                       <h4>{score.title}</h4>
                       <span className="item-label">{score.category?.name || "General"}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <a href={score.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-action-outline">ABRIR</a>
                    <button onClick={() => forceDownload(score.fileUrl, `${score.title}.pdf`)} className="btn-action-solid">DESCARGAR</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* COLUMNA DERECHA: AGENDA */}
        <section className="dashboard-column">
          <div className="column-header">
            <span className="icon-circ accent">📅</span>
            <h3>Próximos eventos</h3>
          </div>

          <div className="cards-stack">
            {upcomingEvents.length === 0 ? (
              <div className="empty-card">No hay eventos próximos.</div>
            ) : (
              upcomingEvents.map(event => {
                const evDate = new Date(event.date);
                const isConcert = event.type?.toLowerCase().includes("concierto");
                return (
                  <div key={event.id} className={`event-card-item ${isConcert ? 'is-concert' : ''}`}>
                    <div className="ev-date-box">
                      <span className="day">{evDate.getDate()}</span>
                      <span className="month">{evDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div className="ev-info-details">
                       <h5>{event.title}</h5>
                       <p>
                         {evDate.toLocaleDateString('es-ES', { weekday: 'long' })} • {evDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                       </p>
                       <span className="ev-loc">{event.location || "Sede OCGC"}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
