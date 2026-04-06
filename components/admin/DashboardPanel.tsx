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
    <div className="dashboard-panel" style={{ padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '2rem' }}>📊 Dashboard en tiempo real</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #478AC9' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#666' }}>Músicos Totales</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalUsers}</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#666' }}>Partituras General</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalScores}</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #27ae60' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#666' }}>Eventos Activos</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalEvents}</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#666' }}>Bajas / Inactivos</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>
            {members.filter(m => m.isBanned).length}
          </p>
        </div>
      </div>

      <div style={{ height: '400px', width: '100%' }}>
        <h3 style={{ marginBottom: '1rem' }}>Desglose por Agrupación</h3>
        <ResponsiveContainer>
          <BarChart data={stats.agrupacionesStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#478AC9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
