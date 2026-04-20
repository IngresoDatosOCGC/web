'use client';
// ── MiniCalendar — Agenda Component ──
// Interactive calendar widget showing event dots and tooltips.

import { useState, useMemo } from 'react';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const TYPE_COLORS: Record<string, { bg: string; accent: string; dot: string }> = {
  Ensayo:    { bg: '#e3f2fd', accent: '#2e86de', dot: '#2e86de' },
  Concierto: { bg: '#fff5f5', accent: '#ff4757', dot: '#ff4757' },
  Reunión:   { bg: '#f0f9f4', accent: '#27ae60', dot: '#27ae60' },
};

interface Props {
  events: any[];
  year: number;
  month: number;
  onMonthChange: (y: number, m: number) => void;
}

export default function MiniCalendar({ events, year, month, onMonthChange }: Props) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    events.forEach(ev => {
      const d = new Date(ev.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(ev);
      }
    });
    return map;
  }, [events, year, month]);

  const today = new Date();
  const prev = () => { const d = new Date(year, month - 1); onMonthChange(d.getFullYear(), d.getMonth()); };
  const next = () => { const d = new Date(year, month + 1); onMonthChange(d.getFullYear(), d.getMonth()); };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eef2f5', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: '#1a2a4b', color: '#fff' }}>
        <button onClick={prev} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <strong style={{ fontSize: '1rem', letterSpacing: '0.03em' }}>{MONTHS_ES[month]} {year}</strong>
        <button onClick={next} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0.8rem 0.5rem 0.5rem' }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', paddingBottom: '0.5rem' }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = eventsByDay[day] || [];
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const hasEvent = dayEvents.length > 0;
          const dots = dayEvents.slice(0, 3).map(ev => TYPE_COLORS[ev.type]?.dot || '#999');
          return (
            <div
              key={day}
              className="calendar-day-cell"
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{ textAlign: 'center', padding: '0.3rem 0.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', position: 'relative' }}
            >
              <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: hasEvent ? 700 : 400, background: isToday ? '#1a2a4b' : hasEvent ? '#e8f4ff' : 'transparent', color: isToday ? '#fff' : hasEvent ? '#1a2a4b' : '#555', cursor: 'pointer', transition: '0.2s' }}>
                {day}
              </span>
              {dots.length > 0 && (
                <div style={{ display: 'flex', gap: '2px' }}>
                  {dots.map((color, di) => <div key={di} style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />)}
                </div>
              )}
              {hoveredDay === day && hasEvent && (
                <div className="calendar-tooltip">
                  {dayEvents.map((ev, ei) => (
                    <div key={ei} className="tooltip-event-item">
                      <span className="tooltip-dot" style={{ background: TYPE_COLORS[ev.type]?.dot }} />
                      <div className="tooltip-info">
                        <strong>{ev.title}</strong>
                        <span>{new Date(ev.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {ev.location || 'Sede'}</span>
                      </div>
                    </div>
                  ))}
                  <div className="tooltip-arrow" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', padding: '0.8rem 1.2rem', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
        {Object.entries(TYPE_COLORS).map(([type, c]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#666' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} /> {type}
          </div>
        ))}
      </div>
    </div>
  );
}
