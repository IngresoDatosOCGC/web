import React from 'react';
import { Music2, AlertCircle } from 'lucide-react';

interface ArtisticProfileCardProps {
  estructuras: any[];
}

export const ArtisticProfileCard = ({ estructuras }: ArtisticProfileCardProps) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #e8edf5',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #f0f4f8',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
      }}>
        <Music2 size={17} color="#b45309" />
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Perfil Artístico
        </h3>
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>
        {estructuras && estructuras.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {estructuras.map((est: any) => (
              <div key={est.id} style={{
                borderRadius: '12px',
                border: `1px solid ${est.activo ? '#e2e8f0' : '#f1f5f9'}`,
                overflow: 'hidden',
                opacity: est.activo ? 1 : 0.55,
                transition: 'opacity 0.2s',
              }}>
                {/* Card top bar */}
                <div style={{
                  padding: '0.65rem 1rem',
                  background: est.activo ? 'linear-gradient(135deg, #f8fafc, #f1f5f9)' : '#f8fafc',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid #f0f4f8',
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--clr-navy)', fontSize: '0.95rem' }}>
                    {est.seccion.seccion}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                    background: est.activo ? '#dcfce7' : '#f1f5f9',
                    color: est.activo ? '#166534' : '#64748b',
                    border: `1px solid ${est.activo ? '#86efac' : '#e2e8f0'}`,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {est.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Card details */}
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {est.atril && (
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Atril:</span> {est.atril}
                    </div>
                  )}
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Agrupación:</span> {est.agrupacion.agrupacion}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Papel:</span> {est.papel.papel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 0', textAlign: 'center' }}>
            <AlertCircle size={28} color="#cbd5e1" />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Sin perfil artístico asignado.<br />Contacta con tu administrador.
            </p>
          </div>
        )}

        {/* Read-only notice */}
        <p style={{ margin: '1rem 0 0', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
          Para modificar estos datos, contacta con tu jefe de sección o un administrador.
        </p>
      </div>
    </div>
  );
};
