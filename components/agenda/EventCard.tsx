// ── EventCard — Agenda Component ──
import { TYPE_COLORS } from './MiniCalendar';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

interface Props {
  event: any;
  past?: boolean;
}

export default function EventCard({ event, past = false }: Props) {
  const d = new Date(event.date);
  const colors = TYPE_COLORS[event.type] || { bg: '#f0f4f8', accent: '#999', dot: '#999' };

  return (
    <div className="event-card" style={{ opacity: past ? 0.65 : 1, borderLeft: `4px solid ${colors.accent}` }}>
      <div className="event-date-box" style={{ background: colors.bg, color: colors.accent }}>
        <span className="event-date-day">{d.getDate()}</span>
        <span className="event-date-mon">{MONTHS_ES[d.getMonth()].slice(0, 3)}</span>
      </div>
      <div className="event-body">
        <div className="event-meta">
          <span className="event-badge" style={{ background: colors.bg, color: colors.accent }}>{event.type}</span>
          {event.category && <span className="event-program-tag">📂 {event.category.name}</span>}
        </div>
        <div className="event-title">{event.title}</div>
        <div className="event-detail-row">
          <span className="event-detail">🕒 {d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          {event.location && <span className="event-detail">📍 {event.location}</span>}
          <span className="event-detail">📅 {d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        {event.description && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#888', lineHeight: 1.5 }}>{event.description}</p>
        )}
      </div>
    </div>
  );
}
