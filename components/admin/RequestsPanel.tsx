"use client";

import React, { useState } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar, 
  IconMapPin, 
  IconShieldCheck, 
  IconTrash, 
  IconCheck, 
  IconSearch, 
  IconExternalLink,
  IconClock
} from '@/components/ui/Icons';

interface RequestsPanelProps {
  joinRequests: any[];
  onRefresh: () => void;
}

export default function RequestsPanel({ joinRequests, onRefresh }: RequestsPanelProps) {
  const { showToast, confirmAction } = useNotifications();
  const [filterRequestStatus, setFilterRequestStatus] = useState<string>('Pendiente');

  const updateJoinRequestStatus = async (id: number, status: string, name?: string, surname?: string, email?: string) => {
    try {
      const res = await fetch("/api/admin/join-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, sendEmail: !!email })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Solicitud ${status}`);
        if (data.inviteLink) {
          const link = `${window.location.origin}/registro-usuarios?code=${data.inviteLink}`;
          navigator.clipboard.writeText(link);
          showToast(`Link de registro copiado: ${link}`, "success");
        }
        onRefresh();
      }
    } catch (error) {
      showToast("Error al actualizar solicitud", "error");
    }
  };

  const deleteJoinRequest = (id: number) => {
    confirmAction("¿Eliminar esta solicitud permanentemente?", async () => {
      try {
        const res = await fetch(`/api/admin/join-requests?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Registro eliminado");
          onRefresh();
        }
      } catch (error) {
        showToast("Error al eliminar", "error");
      }
    });
  };

  const [isExpanded, setIsExpanded] = useState(true);
  const filteredRequests = joinRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(r => filterRequestStatus === 'all' || r.status === filterRequestStatus);

  return (
    <section className="admin-list-card" style={{ padding: 'var(--sp-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-8)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => setIsExpanded(!isExpanded)}>
            <h2 style={{ color: 'var(--clr-navy)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>📩</span> Bandeja de Entrada
            </h2>
            <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--clr-primary)', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</button>
          </div>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Gestión de nuevas solicitudes de músicos desde el portal público.</p>
        </div>
        
        {isExpanded && (
          <div className="filter-group-premium">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--clr-primary)', display: 'block', marginBottom: '4px' }}>Ver solicitudes:</label>
            <select 
              value={filterRequestStatus} 
              onChange={(e) => setFilterRequestStatus(e.target.value)}
              className="premium-select-filter"
            >
              <option value="Pendiente">Solo Pendientes</option>
              <option value="Evaluando">En Evaluación</option>
              <option value="Aceptada">Aceptadas</option>
              <option value="Rechazada">Rechazadas</option>
              <option value="all">Ver Todas</option>
            </select>
          </div>
        )}
      </div>

      {isExpanded && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredRequests.map(r => (
          <div key={r.id} className="request-card-premium">
            {/* Header: Name and Status */}
            <div className="request-card-header">
              <div className="req-user-info">
                <div className="req-avatar">{(r.name?.[0] || 'U') + (r.surname?.[0] || '')}</div>
                <div>
                  <h3 className="req-name">{r.name} {r.surname}</h3>
                  <div className="req-meta-top">
                    <span className="req-date"><IconClock size={12}/> {new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className={`status-badge-premium status-${r.status.toLowerCase()}`}>
                      {r.status === 'Evaluando' ? 'En Evaluación' : r.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="req-interest-badge">
                <span className="interest-label">Interesado en:</span>
                <span className="interest-value">{r.group}</span>
                <span className="interest-sub">{r.instrument}</span>
              </div>
            </div>

            {/* Body: Contact and Bio */}
            <div className="request-card-body">
              <div className="req-contact-grid">
                <div className="req-contact-item">
                  <IconMail size={16}/> <span>{r.email}</span>
                </div>
                <div className="req-contact-item">
                  <IconPhone size={16}/> <span>{r.phone}</span>
                </div>
                {r.birthDate && (
                  <div className="req-contact-item">
                    <IconCalendar size={16}/> <span>{new Date(r.birthDate).toLocaleDateString()}</span>
                  </div>
                )}
                {r.isla && (
                  <div className="req-contact-item">
                    <IconMapPin size={16}/> <span>{r.isla}</span>
                  </div>
                )}
                <div className="req-contact-item">
                  <IconShieldCheck size={16} color={r.hasCertificate ? 'var(--clr-success)' : '#94a3b8'}/> 
                  <span style={{ color: r.hasCertificate ? 'var(--clr-success)' : 'inherit', fontWeight: r.hasCertificate ? 600 : 'inherit' }}>
                    {r.hasCertificate ? "Residente Canario" : "Sin Certificado"}
                  </span>
                </div>
              </div>

              <div className="req-experience-box">
                <div className="exp-label">Experiencia y Trayectoria:</div>
                <div className="exp-content">
                  {r.experience || "El candidato no ha proporcionado detalles sobre su trayectoria musical."}
                </div>
              </div>
            </div>

            {/* Footer: Actions */}
            <div className="request-card-footer">
              <div className="req-main-actions">
                {(r.status === 'Pendiente' || r.status === 'Evaluando') && (
                  <>
                    <button 
                      onClick={() => updateJoinRequestStatus(r.id, 'Aceptada', r.name, r.surname, r.email)}
                      className="btn-action-primary"
                    >
                      <IconCheck size={16}/> Aceptar y Notificar
                    </button>
                    <button 
                      onClick={() => updateJoinRequestStatus(r.id, 'Aceptada', r.name, r.surname)}
                      className="btn-action-outline"
                    >
                      <IconExternalLink size={16}/> Aceptar y ver link
                    </button>
                  </>
                )}
                {r.status === 'Pendiente' && (
                  <button 
                    onClick={() => updateJoinRequestStatus(r.id, 'Evaluando')}
                    className="btn-action-secondary"
                  >
                    <IconSearch size={16}/> Pasar a Evaluación
                  </button>
                )}
                {(r.status === 'Pendiente' || r.status === 'Evaluando') && (
                  <button 
                    onClick={() => updateJoinRequestStatus(r.id, 'Rechazada')}
                    className="btn-action-danger"
                  >
                    Rechazar
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => deleteJoinRequest(r.id)} 
                className="btn-delete-ghost"
              >
                <IconTrash size={14}/> Eliminar registro
              </button>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="empty-state-dash" style={{ background: 'var(--clr-surface)', border: '2px dashed var(--clr-border)', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📬</div>
            <h3 style={{ color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>No hay solicitudes pendientes</h3>
            <p style={{ color: 'var(--clr-text-muted)' }}>
              No se han encontrado solicitudes {filterRequestStatus !== 'all' ? `con estado '${filterRequestStatus}'` : ""} en este momento.
            </p>
          </div>
        )}
      </div>
      )}

      <style jsx>{`
        .premium-select-filter {
          padding: 0.8rem 2.5rem 0.8rem 1.2rem;
          border-radius: 12px;
          border: 1.5px solid var(--clr-border);
          background: #fff;
          font-weight: 600;
          color: var(--clr-navy-mid);
          cursor: pointer;
          transition: all 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23478AC9' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }

        .request-card-premium {
          background: var(--clr-surface);
          border: 1.5px solid var(--clr-border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(13, 27, 42, 0.05);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }

        .request-card-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(13, 27, 42, 0.1);
          border-color: var(--clr-primary);
        }

        .request-card-header {
          padding: 1.2rem 1.5rem;
          background: #fbfcfe;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .req-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .req-avatar {
          width: 48px;
          height: 48px;
          background: var(--clr-primary-lt);
          color: var(--clr-primary-dk);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
        }

        .req-name {
          margin: 0;
          color: var(--clr-navy);
          font-size: 1.2rem;
          font-weight: 700;
        }

        .req-meta-top {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 2px;
        }

        .req-date {
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge-premium {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }

        .req-interest-badge {
          background: #fff;
          border: 1px solid var(--clr-border);
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          min-width: 150px;
        }

        .interest-label { font-size: 0.65rem; color: var(--clr-gold); font-weight: 800; text-transform: uppercase; }
        .interest-value { font-size: 0.95rem; font-weight: 700; color: var(--clr-navy); line-height: 1.2; margin: 2px 0; }
        .interest-sub { font-size: 0.8rem; color: #64748b; }

        .request-card-body {
          padding: 1.5rem;
        }

        .req-contact-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .req-contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--clr-navy-mid);
        }

        .req-contact-item span { color: #555; }

        .req-experience-box {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 1rem 1.2rem;
        }

        .exp-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--clr-primary);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .exp-content {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #475569;
        }

        .request-card-footer {
          padding: 1rem 1.5rem;
          background: #fbfcfe;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .req-main-actions {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
        }

        .btn-action-primary {
          background: var(--clr-success);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .btn-action-primary:hover { transform: translateY(-1px); background: #219150; }

        .btn-action-outline {
          background: #fff;
          color: var(--clr-navy-mid);
          border: 1.5px solid var(--clr-navy-mid);
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-outline:hover { background: #f1f5f9; }

        .btn-action-secondary {
          background: #fff;
          color: var(--clr-primary-dk);
          border: 1.5px solid var(--clr-primary-lt);
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-secondary:hover { background: var(--clr-primary-lt); }

        .btn-action-danger {
          background: transparent;
          color: var(--clr-danger);
          border: 1.5px solid #fee2e2;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-danger:hover { background: #fee2e2; border-color: var(--clr-danger); }

        .btn-delete-ghost {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-delete-ghost:hover { color: var(--clr-danger); background: #fff1f1; }
      `}</style>
    </section>
  );
}
