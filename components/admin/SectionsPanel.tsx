"use client";

import React, { useState } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';

const DEFAULT_FAMILIAS = ["Cuerda", "Viento Madera", "Viento Metal", "Teclados", "Percusión", "Coro", "Tuttis", "Generales", "Otros"];

interface SectionsPanelProps {
  agrupaciones: any[];
  papeles: any[];
  secciones: any[];
  onRefresh: () => void;
}

export default function SectionsPanel({ agrupaciones, papeles, secciones, onRefresh }: SectionsPanelProps) {
  const { showToast, confirmAction } = useNotifications();
  
  // Creation states
  const [newAgrupacionName, setNewAgrupacionName] = useState('');
  const [newPapelName, setNewPapelName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  
  const [isCreatingAgrupacion, setIsCreatingAgrupacion] = useState(false);
  const [isCreatingPapel, setIsCreatingPapel] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Editing states
  const [editingAgrupacion, setEditingAgrupacion] = useState<any | null>(null);
  const [editingPapel, setEditingPapel] = useState<any | null>(null);
  const [editingSeccion, setEditingSeccion] = useState<any | null>(null);

  // Handlers
  const createAgrupacion = async () => {
    if (!newAgrupacionName.trim()) return;
    setIsCreatingAgrupacion(true);
    try {
      const res = await fetch("/api/agrupaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAgrupacionName })
      });
      if (res.ok) { setNewAgrupacionName(''); onRefresh(); showToast("Agrupación creada"); }
    } catch { showToast("Error al crear", "error"); }
    finally { setIsCreatingAgrupacion(false); }
  };

  const createPapel = async () => {
    if (!newPapelName.trim()) return;
    setIsCreatingPapel(true);
    try {
      const res = await fetch("/api/papeles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPapelName })
      });
      if (res.ok) { setNewPapelName(''); onRefresh(); showToast("Papel creado"); }
    } catch { showToast("Error al crear", "error"); }
    finally { setIsCreatingPapel(false); }
  };

  const createSection = async () => {
    if (!newSectionName.trim()) return;
    setIsCreatingSection(true);
    try {
      const res = await fetch("/api/secciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seccion: newSectionName })
      });
      if (res.ok) { setNewSectionName(''); onRefresh(); showToast("Sección creada"); }
    } catch { showToast("Error al crear", "error"); }
    finally { setIsCreatingSection(false); }
  };

  const updateAgrupacion = async () => {
    if (!editingAgrupacion) return;
    try {
      const res = await fetch("/api/agrupaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAgrupacion)
      });
      if (res.ok) { showToast("Cambios guardados"); setEditingAgrupacion(null); onRefresh(); }
    } catch { showToast("Error al guardar", "error"); }
  };

  const updatePapel = async () => {
    if (!editingPapel) return;
    try {
      const res = await fetch("/api/papeles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPapel)
      });
      if (res.ok) { showToast("Cambios guardados"); setEditingPapel(null); onRefresh(); }
    } catch { showToast("Error al guardar", "error"); }
  };

  const updateSection = async () => {
    if (!editingSeccion) return;
    try {
      const res = await fetch("/api/secciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSeccion)
      });
      if (res.ok) { showToast("Cambios guardados"); setEditingSeccion(null); onRefresh(); }
    } catch { showToast("Error al guardar", "error"); }
  };

  const deleteAgrupacion = (id: number) => {
    confirmAction("¿Eliminar esta agrupación?", async () => {
      try {
        const res = await fetch(`/api/agrupaciones?id=${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Agrupación eliminada"); onRefresh(); }
      } catch { showToast("Error al eliminar", "error"); }
    });
  };

  const deletePapel = (id: number) => {
    confirmAction("¿Eliminar este papel?", async () => {
      try {
        const res = await fetch(`/api/papeles?id=${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Papel eliminado"); onRefresh(); }
      } catch { showToast("Error al eliminar", "error"); }
    });
  };

  const deleteSection = (id: number) => {
    confirmAction("¿Eliminar esta sección?", async () => {
      try {
        const res = await fetch(`/api/secciones?id=${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Sección eliminada"); onRefresh(); }
      } catch { showToast("Error al eliminar", "error"); }
    });
  };

  return (
    <>
      <div className="admin-content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* AGRUPACIONES */}
        <section className="admin-form-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎭 Agrupaciones</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Nueva..." value={newAgrupacionName} onChange={(e) => setNewAgrupacionName(e.target.value)} style={{ flex: 1 }} />
            <button onClick={createAgrupacion} className="btn-main-admin" disabled={isCreatingAgrupacion} style={{ width: 'auto' }}>{isCreatingAgrupacion ? "..." : "+"}</button>
          </div>
          <div className="catalog-scroll-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {agrupaciones.map((a: any) => (
              <div key={a.id} className="catalog-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontWeight: 500 }}>{a.agrupacion}</span>
                  {a.isVisibleInPublic ? <span className="cat-badge-public">Público</span> : <span className="cat-badge-private">Privado</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setEditingAgrupacion(a)} className="btn-icon-edit">✎</button>
                  <button onClick={() => deleteAgrupacion(a.id)} className="btn-delete-small">×</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PAPELES */}
        <section className="admin-form-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👤 Papeles</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Nuevo..." value={newPapelName} onChange={(e) => setNewPapelName(e.target.value)} style={{ flex: 1 }} />
            <button onClick={createPapel} className="btn-main-admin" disabled={isCreatingPapel} style={{ width: 'auto' }}>{isCreatingPapel ? "..." : "+"}</button>
          </div>
          <div className="catalog-scroll-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {papeles.map((p: any) => (
              <div key={p.id} className="catalog-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontWeight: 500 }}>{p.papel}</span>
                  {p.isDirector && <span className="cat-badge-director">Dir.</span>}
                  {p.isVisibleInPublic ? <span className="cat-badge-public">Público</span> : <span className="cat-badge-private">Privado</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setEditingPapel(p)} className="btn-icon-edit">✎</button>
                  <button onClick={() => deletePapel(p.id)} className="btn-delete-small">×</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIONES */}
        <section className="admin-form-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎻 Secciones</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Nueva..." value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} style={{ flex: 1 }} />
            <button onClick={createSection} className="btn-main-admin" disabled={isCreatingSection} style={{ width: 'auto' }}>{isCreatingSection ? "..." : "+"}</button>
          </div>
          <div className="catalog-scroll-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {secciones.sort((a,b) => a.seccion.localeCompare(b.seccion)).map((s: any) => (
              <div key={s.id} className="catalog-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.seccion} {s.isVisibleInPublic ? <span className="cat-badge-public">Público</span> : <span className="cat-badge-private">Privado</span>}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{s.familia}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setEditingSeccion(s)} className="btn-icon-edit">✎</button>
                  <button onClick={() => deleteSection(s.id)} className="btn-delete-small">×</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modals for Edit */}
      {editingAgrupacion && (
        <div className="admin-modal-overlay" onClick={() => setEditingAgrupacion(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2rem 0.5rem' }}>
              <h2 className="modal-header-text">Editar Agrupación</h2>
              <button onClick={() => setEditingAgrupacion(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 2rem' }}>
              <input 
                type="text" 
                value={editingAgrupacion.agrupacion} 
                onChange={(e) => setEditingAgrupacion({...editingAgrupacion, agrupacion: e.target.value})} 
                className="premium-input"
                style={{ marginBottom: '1.2rem' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#444', fontSize: '0.95rem' }}>
                <input 
                  type="checkbox" 
                  checked={editingAgrupacion.isVisibleInPublic} 
                  onChange={(e) => setEditingAgrupacion({...editingAgrupacion, isVisibleInPublic: e.target.checked})} 
                  style={{ width: '18px', height: '18px' }}
                />
                Visible en Web Pública
              </label>
            </div>
            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2rem 2.5rem' }}>
              <button onClick={() => setEditingAgrupacion(null)} className="btn-modal-cancel">Cancelar</button>
              <button onClick={updateAgrupacion} className="btn-modal-save">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {editingPapel && (
        <div className="admin-modal-overlay" onClick={() => setEditingPapel(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2rem 0.5rem' }}>
              <h2 className="modal-header-text">Editar Papel</h2>
              <button onClick={() => setEditingPapel(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 2rem' }}>
              <input 
                type="text" 
                value={editingPapel.papel} 
                onChange={(e) => setEditingPapel({...editingPapel, papel: e.target.value})} 
                className="premium-input"
                style={{ marginBottom: '1.2rem' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#444', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={editingPapel.isDirector} 
                    onChange={(e) => setEditingPapel({...editingPapel, isDirector: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  Es Director
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#444', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={editingPapel.isVisibleInPublic} 
                    onChange={(e) => setEditingPapel({...editingPapel, isVisibleInPublic: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  Visible en Web Pública
                </label>
              </div>
            </div>
            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2rem 2.5rem' }}>
              <button onClick={() => setEditingPapel(null)} className="btn-modal-cancel">Cancelar</button>
              <button onClick={updatePapel} className="btn-modal-save">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {editingSeccion && (
        <div className="admin-modal-overlay" onClick={() => setEditingSeccion(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2rem 0.5rem' }}>
              <h2 className="modal-header-text">Editar Sección</h2>
              <button onClick={() => setEditingSeccion(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 2rem' }}>
              <input 
                type="text" 
                value={editingSeccion.seccion} 
                onChange={(e) => setEditingSeccion({...editingSeccion, seccion: e.target.value})} 
                className="premium-input"
                style={{ marginBottom: '1rem' }}
              />
              <select 
                value={editingSeccion.familia} 
                onChange={(e) => setEditingSeccion({...editingSeccion, familia: e.target.value})}
                className="premium-input"
                style={{ marginBottom: '1.2rem' }}
              >
                {DEFAULT_FAMILIAS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#444', fontSize: '0.95rem' }}>
                <input 
                  type="checkbox" 
                  checked={editingSeccion.isVisibleInPublic} 
                  onChange={(e) => setEditingSeccion({...editingSeccion, isVisibleInPublic: e.target.checked})} 
                  style={{ width: '18px', height: '18px' }}
                />
                Visible en Web Pública
              </label>
            </div>
            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2rem 2.5rem' }}>
              <button onClick={() => setEditingSeccion(null)} className="btn-modal-cancel">Cancelar</button>
              <button onClick={updateSection} className="btn-modal-save">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
