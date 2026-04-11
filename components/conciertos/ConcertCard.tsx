// ── ConcertCard — Conciertos Page ──
import { IconCalendar, IconPin, IconMusic } from '@/components/ui/Icons';

interface Concert {
  id: string;
  title: string;
  date: string;
  venue?: string;
  description: string;
  ticketUrl?: string;
  gradient: string;
}

interface Props {
  concert: Concert;
  showVenue?: boolean;
}

export default function ConcertCard({ concert: c, showVenue = false }: Props) {
  return (
    <article className="concert-card" aria-label={`Concierto: ${c.title}`}>
      <div
        className="concert-img-placeholder"
        style={{
          background: c.gradient,
          ...(showVenue
            ? { color: 'rgba(255,255,255,0.5)' }
            : {
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                padding: 'var(--sp-6)',
                textAlign: 'center' as const,
                color: 'rgba(255,255,255,0.9)',
              }),
        }}
      >
        {showVenue ? <IconMusic /> : c.title}
      </div>
      <div className="concert-info">
        <span className="concert-date">
          {showVenue && <IconCalendar />} {c.date}
        </span>
        <h3>{c.title}</h3>
        {showVenue && c.venue && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--clr-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-3)' }}>
            <IconPin /> {c.venue}
          </p>
        )}
        <p>{c.description}</p>
        {c.ticketUrl && (
          <a
            href={c.ticketUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', marginTop: 'var(--sp-4)' }}
          >
            Comprar Entradas
          </a>
        )}
      </div>
    </article>
  );
}
