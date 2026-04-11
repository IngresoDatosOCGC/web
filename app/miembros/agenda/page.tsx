"use client";

import { useEffect, useState, useMemo } from 'react';
import MiniCalendar, { TYPE_COLORS } from '@/components/agenda/MiniCalendar';
import EventCard from '@/components/agenda/EventCard';

export default function AgendaPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory !== 'all' ? `/api/events?categoryId=${selectedCategory}` : '/api/events';
    fetch(url)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCategory]);

  const filteredEvents = useMemo(() => events.filter(ev => typeFilter === 'all' || ev.type === typeFilter), [events, typeFilter]);
  const now = new Date();
  const upcomingEvents = useMemo(() => filteredEvents.filter(ev => new Date(ev.date) >= now), [filteredEvents]);
  const pastEvents = useMemo(() => filteredEvents.filter(ev => new Date(ev.date) < now).reverse(), [filteredEvents]);
  const selectedCatName = categories.find(c => String(c.id) === selectedCategory)?.name || 'Todos los programas';

  return (
    <main className="dashboard-content">
      <div className="agenda-wrapper">
        <div className="agenda-hero">
          <h1>📅 Agenda Musical</h1>
          <p>Consulta todos los ensayos, conciertos y reuniones de la OCGC.</p>
        </div>

        {/* Controles */}
        <div className="agenda-controls">
          <select className="agenda-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} aria-label="Filtrar por programa">
            <option value="all">Todos los programas</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          <div className="type-filter-group" role="group" aria-label="Filtrar por tipo de evento">
            {(['all', 'Ensayo', 'Concierto', 'Reunión'] as const).map(t => (
              <button key={t} className={`type-btn ${typeFilter === t ? `active-${t}` : ''}`} onClick={() => setTypeFilter(t)}>
                {t === 'all' ? 'Todos' : t === 'Ensayo' ? '🎵 Ensayo' : t === 'Concierto' ? '🎼 Concierto' : '📋 Reunión'}
              </button>
            ))}
          </div>
        </div>

        <div className="agenda-grid">
          {/* Lista de eventos */}
          <div className="events-section">
            {loading ? (
              <div className="events-empty">Cargando agenda...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="events-empty">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <strong>Sin eventos</strong>
                <p style={{ marginTop: '0.5rem' }}>No hay eventos para {selectedCatName.toLowerCase()}.</p>
              </div>
            ) : (
              <>
                {upcomingEvents.length > 0 && (
                  <>
                    <div className="section-divider">🗓 Próximos eventos ({upcomingEvents.length})</div>
                    {upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                  </>
                )}
                {pastEvents.length > 0 && (
                  <>
                    <div className="section-divider" style={{ marginTop: '2.5rem' }}>🕐 Eventos pasados</div>
                    {pastEvents.map(ev => <EventCard key={ev.id} event={ev} past />)}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar-sticky">
            <MiniCalendar events={filteredEvents} year={calYear} month={calMonth} onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }} />

            {!loading && filteredEvents.length > 0 && (
              <div className="stat-card">
                <h3>Resumen — {selectedCatName}</h3>
                {(['Ensayo', 'Concierto', 'Reunión'] as const).map(t => {
                  const count = filteredEvents.filter(e => e.type === t).length;
                  if (count === 0) return null;
                  const c = TYPE_COLORS[t];
                  return (
                    <div key={t} className="stat-row">
                      <span className="stat-label"><div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot }} />{t}s</span>
                      <span className="stat-value">{count}</span>
                    </div>
                  );
                })}
                <div className="stat-row" style={{ borderTop: '2px solid #eee', marginTop: '0.5rem', paddingTop: '0.8rem' }}>
                  <span className="stat-label" style={{ fontWeight: 700 }}>Total</span>
                  <span className="stat-value">{filteredEvents.length}</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
