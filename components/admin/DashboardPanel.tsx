"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPanel({ members, scores }: { members: any[], scores: any[] }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Cargando estadísticas...</p>;

  return (
    <div className="dashboard-panel" style={{ padding: '2rem', background: 'var(--clr-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ marginBottom: '2rem' }}>📊 Dashboard de Agrupaciones</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--clr-bg)', borderRadius: '8px', borderLeft: '4px solid var(--clr-primary)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--clr-text-muted)' }}>Músicos Totales</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--clr-text)' }}>{stats.totalUsers}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--clr-bg)', borderRadius: '8px', borderLeft: '4px solid var(--clr-gold)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--clr-text-muted)' }}>Partituras General</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--clr-text)' }}>{stats.totalScores}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--clr-bg)', borderRadius: '8px', borderLeft: '4px solid var(--clr-success)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--clr-text-muted)' }}>Eventos Activos</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--clr-text)' }}>{stats.totalEvents}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--clr-bg)', borderRadius: '8px', borderLeft: '4px solid var(--clr-danger)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--clr-text-muted)' }}>Bajas / Inactivos</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--clr-text)' }}>
            {members.filter(m => m.isBanned).length}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
        {stats.agrupacionesStats?.length > 0 ? stats.agrupacionesStats.map((agrup: any, index: number) => (
          <div key={index} style={{ border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--clr-text)' }}>
              {agrup.name} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', fontWeight: 'normal' }}>({agrup.count} miembros)</span>
            </h3>
            {agrup.sections && agrup.sections.length > 0 ? (
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={agrup.sections} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#478AC9" radius={[4, 4, 0, 0]} name="Músicos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
                <p style={{ color: 'var(--clr-text-muted)', fontStyle: 'italic', padding: '2rem 0' }}>No hay secciones registradas para esta agrupación.</p>
            )}
          </div>
        )) : (
          <p>No hay agrupaciones registradas en el sistema.</p>
        )}
      </div>
    </div>
  );
}
