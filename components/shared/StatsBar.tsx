// ── StatsBar — Shared Component ──
// Displays OCGC key figures. Reused in Home and Nosotros pages.

interface Stat { num: string; label: string; }

const STATS: Stat[] = [
  { num: '+150', label: 'Músicos Activos' },
  { num: '+50',  label: 'Conciertos Ofrecidos' },
  { num: '6',    label: 'Agrupaciones' },
  { num: '2018', label: 'Año de Fundación' },
];

export default function StatsBar() {
  return (
    <div className="stats-bar" role="region" aria-label="Cifras destacadas de la OCGC">
      <div className="stats-grid">
        {STATS.map(({ num, label }) => (
          <div className="stat-item" key={label}>
            <span className="stat-num">{num}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
