"use client";

import { useEffect, useState } from 'react';

export default function DashboardPanel({ members, scores }: { members: any[], scores: any[] }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Cargando estadísticas...</p>;

  // Only show musical agrupaciones in the breakdown
  const SHOW_AGRUPACIONES = ["Orquesta", "Coro", "Ensemble Flautas", "Ensemble Metales", "Ensemble Chelos", "Big Band"];
  const musicalStats = stats.agrupacionesStats?.filter((a: any) => SHOW_AGRUPACIONES.includes(a.name)) ?? [];
  const otherStats = stats.agrupacionesStats?.filter((a: any) => !SHOW_AGRUPACIONES.includes(a.name)) ?? [];

  return (
    <div className="dashboard-panel">
      {/* Top KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card-premium blue">
          <h3>Músicos (Activos / Totales)</h3>
          <p className="value">
            {stats.activeUsers ?? 0} <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 'normal' }}>/ {stats.totalUsers ?? 0}</span>
          </p>
        </div>
        <div className="stat-card-premium gold">
          <h3>Partituras General</h3>
          <p className="value">{stats.totalScores}</p>
        </div>
        <div className="stat-card-premium green">
          <h3>Eventos Activos</h3>
          <p className="value">{stats.totalEvents}</p>
        </div>
        <div className="stat-card-premium red">
          <h3>Bajas / Inactivos</h3>
          <p className="value">{stats.totalBanned}</p>
        </div>
      </div>

      {/* Musical Agrupaciones Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {musicalStats.map((agrup: any) => (
          <div key={agrup.name} style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {/* Agrupación header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a2a4b' }}>{agrup.name}</span>
              <span style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#15803d', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                {agrup.activeCount ?? 0}
              </span>
            </div>

            {/* Section rows */}
            {agrup.sections && agrup.sections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {agrup.sections
                  .sort((a: any, b: any) => a.name.localeCompare(b.name))
                  .map((sec: any) => {
                    const pct = sec.count > 0 ? Math.round((sec.activeCount / sec.count) * 100) : 0;
                    return (
                      <div key={sec.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}>
                        <span style={{ flex: 1, fontSize: '0.82rem', color: '#475569', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', minWidth: '20px', textAlign: 'right' }}>{sec.activeCount}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', margin: '0.5rem 0' }}>Sin secciones registradas</p>
            )}
          </div>
        ))}
      </div>

      {/* Other agrupaciones summary row */}
      {otherStats.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: '#f8fafc', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Otras Agrupaciones</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {otherStats.map((a: any) => (
              <span key={a.name} style={{ fontSize: '0.82rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.3rem 0.8rem', color: '#64748b' }}>
                <strong style={{ color: '#1a2a4b' }}>{a.name}</strong>: <span style={{ color: '#10b981', fontWeight: 700 }}>{a.activeCount ?? 0}</span> / {a.count ?? 0}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
