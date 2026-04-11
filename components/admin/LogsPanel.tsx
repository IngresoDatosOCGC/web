"use client";

import { useEffect, useState } from 'react';

export default function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/logs')
      .then(r => r.json())
      .then(data => setLogs(data))
      .catch(console.error);
  }, []);

  const handleExport = () => {
    window.location.href = '/api/admin/logs/export';
  };

  return (
    <div className="logs-panel" style={{ padding: '2rem', background: 'var(--clr-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>📝 Logs de Auditoría</h2>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: '0.5rem' }}>Historial inmutable de las acciones administrativas recientes.</p>
        </div>
        <button onClick={handleExport} className="btn-main-admin" style={{ background: 'var(--clr-navy)', color: 'var(--clr-bg)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
          📄 Exportar CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--clr-bg)', borderBottom: '2px solid var(--clr-border)' }}>
              <th style={{ padding: '1rem' }}>Fecha y Hora</th>
              <th style={{ padding: '1rem' }}>Acción</th>
              <th style={{ padding: '1rem' }}>Detalles</th>
              <th style={{ padding: '1rem' }}>Admin ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--clr-border)', background: index % 2 === 0 ? 'var(--clr-surface)' : 'var(--clr-bg-alt)' }}>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--clr-text)' }}>{log.action}</td>
                <td style={{ padding: '1rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                  {typeof log.details === 'string' ? log.details : (
                    <pre style={{ margin: 0, fontSize: '0.75rem', background: 'var(--clr-bg)', padding: '0.4rem', borderRadius: '4px' }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                  <code style={{ background: 'var(--clr-bg-alt)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{log.userClerkId}</code>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No hay registros de actividad.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
