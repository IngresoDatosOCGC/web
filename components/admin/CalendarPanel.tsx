"use client";

import { useEffect, useState } from 'react';

export default function CalendarPanel() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(data => setEvents(data))
      .catch(console.error);
  };

  const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries()))
      });
      if (res.ok) {
        fetchEvents();
        (e.target as HTMLFormElement).reset();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-panel" style={{ padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '2rem' }}>📅 Calendario de Eventos</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3>Añadir Nuevo Evento</h3>
          <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input name="title" type="text" placeholder="Título (ej: Ensayo General)" required className="input-field" />
            <input name="date" type="datetime-local" required className="input-field" />
            <input name="location" type="text" placeholder="Lugar" className="input-field" />
            <select name="type" className="input-field" required>
              <option value="Ensayo">Ensayo</option>
              <option value="Concierto">Concierto</option>
              <option value="Reunión">Reunión</option>
            </select>
            <textarea name="description" placeholder="Descripción breve..." className="input-field"></textarea>
            <button type="submit" disabled={loading} className="btn-main-admin">
              {loading ? "Guardando..." : "Programar Evento"}
            </button>
          </form>
        </div>

        <div style={{ flex: '2', minWidth: '300px' }}>
          <h3>Próximos Eventos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {events.length === 0 ? <p>No hay eventos programados.</p> : events.map(ev => (
              <div key={ev.id} style={{ padding: '1rem', borderLeft: `4px solid ${ev.type === 'Concierto' ? '#e74c3c' : '#478AC9'}`, background: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem' }}>{ev.title} <span style={{ fontSize: '0.8rem', background: '#eee', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{ev.type}</span></h4>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#666' }}>📍 {ev.location || 'Sin lugar especificado'}</p>
                    {ev.description && <p style={{ margin: 0, fontSize: '0.9rem' }}>{ev.description}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#333' }}>
                      {new Date(ev.date).toLocaleDateString()}
                    </strong>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      {new Date(ev.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
