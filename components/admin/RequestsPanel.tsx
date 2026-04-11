"use client";

import React, { useState } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';

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
          // Si se generó un link (porque fue aceptada), podemos mostrarlo o copiarlo
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

  const filteredRequests = joinRequests.filter(r => filterRequestStatus === 'all' || r.status === filterRequestStatus);

  return (
    <section className="admin-list-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--clr-navy)', margin: 0 }}>📩 Bandeja de Entrada</h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Gestión de nuevas solicitudes de músicos (Sección /unete)</p>
        </div>
        <select 
          value={filterRequestStatus} 
          onChange={(e) => setFilterRequestStatus(e.target.value)}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--clr-border)' }}
        >
          <option value="Pendiente">Solo Pendientes</option>
          <option value="Evaluando">En Evaluación</option>
          <option value="Aceptada">Aceptadas</option>
          <option value="Rechazada">Rechazadas</option>
          <option value="all">Todas</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {filteredRequests.map(r => (
          <div key={r.id} className="request-card-responsive">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--clr-navy)' }}>{r.name} {r.surname}</span>
                <span className={`status-badge status-${r.status.toLowerCase()}`}>
                  {r.status === 'Evaluando' ? '🔍 Evaluando' : r.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>📧 {r.email}</span>
                <span>📞 {r.phone}</span>
                {r.birthDate && <span>👶 {new Date(r.birthDate).toLocaleDateString()}</span>}
                {r.isla && <span>🏝️ {r.isla}</span>}
                <span>✈️ {r.hasCertificate ? "✓ Residente" : "Sin Cert."}</span>
              </p>
              <div style={{ marginTop: '0.8rem', padding: '1rem', background: 'var(--clr-light)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--clr-navy-mid)', border: '1px solid #e1e8ed' }}>
                <strong>Experiencia:</strong> {r.experience || "No especificada"}
              </div>
            </div>

            <div className="request-interest-info">
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-gold)', fontWeight: 800, textTransform: 'uppercase' }}>Interesado en:</p>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--clr-navy)' }}>{r.group}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{r.instrument}</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: '#999' }}>Recibida: {new Date(r.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="request-actions-area">
              {(r.status === 'Pendiente' || r.status === 'Evaluando') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button 
                    onClick={() => updateJoinRequestStatus(r.id, 'Aceptada', r.name, r.surname, r.email)}
                    className="btn-main-admin btn-success-sm"
                  >
                    Aceptar y Enviar Email ✅
                  </button>
                  <button 
                    onClick={() => updateJoinRequestStatus(r.id, 'Aceptada', r.name, r.surname)}
                    className="btn-main-admin btn-navy-sm"
                  >
                    Aceptar y ver link 🔗
                  </button>
                </div>
              )}
              {r.status === 'Pendiente' && (
                <button 
                  onClick={() => updateJoinRequestStatus(r.id, 'Evaluando')}
                  className="btn-outline-warning-sm"
                >
                  Pasar a Evaluación 🔍
                </button>
              )}
              {(r.status === 'Pendiente' || r.status === 'Evaluando') && (
                <button 
                  onClick={() => updateJoinRequestStatus(r.id, 'Rechazada')}
                  className="btn-outline-danger-sm"
                >
                  Rechazar ❌
                </button>
              )}
              <button onClick={() => deleteJoinRequest(r.id)} className="btn-delete-link">🗑️ Eliminar físicamente</button>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="empty-state-dash">
            No hay solicitudes {filterRequestStatus !== 'all' ? `con estado '${filterRequestStatus}'` : ""} en este momento.
          </div>
        )}
      </div>
    </section>
  );
}
