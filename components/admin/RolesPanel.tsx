"use client";

import React, { useState } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';

const DEFAULT_FAMILIAS = ["Cuerda", "Viento Madera", "Viento Metal", "Teclados", "Percusión", "Coro", "Tuttis", "Generales", "Otros"];

interface RolesPanelProps {
  tagsDict: Record<string, any[]>;
  onRefresh: () => void;
}

export default function RolesPanel({ tagsDict, onRefresh }: RolesPanelProps) {
  const { showToast, confirmAction } = useNotifications();
  
  const [newTagName, setNewTagName] = useState('');
  const [newTagFamily, setNewTagFamily] = useState('Otros');
  const [searchRole, setSearchRole] = useState('');
  const [editingTag, setEditingTag] = useState<any | null>(null);

  const createTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName, familia: newTagFamily })
      });
      if (res.ok) {
        showToast("✅ Etiqueta añadida");
        setNewTagName('');
        onRefresh();
      }
    } catch (error) {
      showToast("Error al crear etiqueta", "error");
    }
  };

  const deleteTag = (id: number) => {
    confirmAction("¿Eliminar esta etiqueta? Se desvinculará de todas las partituras.", async () => {
      try {
        const res = await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Etiqueta eliminada");
          onRefresh();
        }
      } catch (error) {
        showToast("Error al eliminar", "error");
      }
    });
  };

  const updateTag = async () => {
    if (!editingTag) return;
    try {
      const res = await fetch(`/api/secciones`, { // The API endpoint for tags seems to be shared or named sections in some places
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingTag.id, 
          seccion: editingTag.name,
          familia: editingTag.familia,
          isVisibleInPublic: editingTag.isVisible !== false
        })
      });
      if (res.ok) {
        showToast("✅ Cambios guardados");
        setEditingTag(null);
        onRefresh();
      }
    } catch (error) {
      showToast("Error al actualizar", "error");
    }
  };

  return (
    <>
      <div className="admin-content-grid">
        <section className="admin-form-card">
          <h2>Nuevo Instrumento / Etiqueta</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <input
              type="text"
              placeholder="Nombre (ej: Violín)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <select value={newTagFamily} onChange={(e) => setNewTagFamily(e.target.value)} style={{padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px'}}>
              {DEFAULT_FAMILIAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button onClick={createTag} className="btn-main-admin">Añadir Etiqueta</button>
          </div>
        </section>

        <section className="admin-list-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a2a4b' }}>Diccionario de Instrumentos</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>Asigna estos instrumentos a las partituras para filtrar el acceso.</p>
            </div>
            <input 
              type="text" 
              placeholder="🔍 Buscar instrumento..." 
              value={searchRole} 
              onChange={(e) => setSearchRole(e.target.value)} 
              style={{ padding: '0.8rem 1.2rem', border: '1px solid #e2e8f0', borderRadius: '12px', minWidth: '300px', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} 
            />
          </div>
          
          <div className="dictionary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(tagsDict).map(([familia, instrumentos]) => {
               if (familia === 'Tuttis' && instrumentos.length === 0) return null;
               const matchInst = instrumentos.filter(i => i.name.toLowerCase().includes(searchRole.toLowerCase()));
               if (matchInst.length === 0 && searchRole !== '') return null;
               
               return (
                <div key={familia} className="family-block-premium">
                  <h4 style={{ margin: '0 0 1.2rem 0', color: '#478AC9', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '16px', background: '#478AC9', borderRadius: '4px' }}></span>
                    {familia}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {matchInst.map(inst => (
                      <div key={inst.id} className="tag-bubble-premium">
                        <span>{inst.name}</span>
                        <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid #e2e8f0', paddingLeft: '8px', marginLeft: '4px' }}>
                          <button 
                            onClick={() => setEditingTag(inst)} 
                            className="btn-edit"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={() => deleteTag(inst.id)} 
                            className="btn-del"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    {matchInst.length === 0 && <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>Sin resultados</span>}
                  </div>
                </div>
               )
            })}
          </div>
        </section>
      </div>

      {/* Modal Edit */}
      {editingTag && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Editar Etiqueta</h2>
              <button onClick={() => setEditingTag(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Nombre</label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  style={{ padding: '0.8rem', width: '100%', border: '1px solid #ccc', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Familia</label>
                <select 
                  value={editingTag.familia || 'Otros'} 
                  onChange={(e) => setEditingTag({ ...editingTag, familia: e.target.value })} 
                  style={{ padding: '0.8rem', width: '100%', border: '1px solid #ccc', borderRadius: '6px' }}
                >
                  {DEFAULT_FAMILIAS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input 
                  type="checkbox" 
                  checked={editingTag.isVisible !== false} 
                  onChange={(e) => setEditingTag({...editingTag, isVisible: e.target.checked})} 
                  id="visTagEdit" 
                />
                <label htmlFor="visTagEdit" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Visible en Web Pública</label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditingTag(null)} className="btn-cancel">Cancelar</button>
              <button onClick={updateTag} className="btn-save">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
