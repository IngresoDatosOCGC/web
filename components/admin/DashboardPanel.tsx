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
    <div className="dashboard-panel">
      <div className="stats-grid">
        <div className="stat-card-premium blue">
          <h3>Músicos Totales</h3>
          <p className="value">{stats.totalUsers}</p>
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
          <p className="value">
            {members.filter(m => m.isBanned).length}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        {stats.agrupacionesStats?.length > 0 ? stats.agrupacionesStats.map((agrup: any, index: number) => (
          <div key={index} className="chart-container-card">
            <h3 className="chart-title">
              {agrup.name} <span>({agrup.count} miembros registrados)</span>
            </h3>
            {agrup.sections && agrup.sections.length > 0 ? (
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={agrup.sections} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      interval={0} 
                      tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                      axisLine={{stroke: '#e2e8f0'}}
                    />
                    <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={{stroke: '#e2e8f0'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} 
                      cursor={{fill: '#f1f5f9'}}
                    />
                    <Bar dataKey="count" fill="#478AC9" radius={[6, 6, 0, 0]} name="Músicos" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
                <div className="empty-state-dash" style={{ padding: '2rem' }}>
                  No hay secciones registradas para esta agrupación.
                </div>
            )}
          </div>
        )) : (
          <div className="empty-state-dash">No hay agrupaciones registradas en el sistema.</div>
        )}
      </div>
    </div>
  );
}
