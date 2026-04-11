"use client";

import React, { useState, useMemo } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';

interface CategoriesPanelProps {
  categories: any[];
  onRefresh: () => void;
}

export default function CategoriesPanel({ categories, onRefresh }: CategoriesPanelProps) {
  const { showToast, confirmAction } = useNotifications();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName, eventDate: newEventDate || null })
      });
      if (res.ok) {
        showToast("✅ Programa creado");
        setNewCategoryName('');
        setNewEventDate('');
        onRefresh();
      }
    } catch (error) {
      showToast("Error al crear programa", "error");
    }
  };

  const deleteCategory = (id: number) => {
    confirmAction("¿Eliminar este programa y desvincular sus partituras?", async () => {
      try {
        const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Programa eliminado");
          onRefresh();
        }
      } catch (error) {
        showToast("Error al eliminar", "error");
      }
    });
  };

  const updateCategory = async () => {
    if (!editingCategory) return;
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory)
      });
      if (res.ok) {
        showToast("✅ Cambios guardados");
        setEditingCategory(null);
        onRefresh();
      }
    } catch (error) {
      showToast("Error al actualizar", "error");
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(searchCategory.toLowerCase()));
  }, [categories, searchCategory]);

  return (
    <>
      <div className="admin-content-grid">
        <section className="admin-form-card">
          <h2>Nuevo Programa / Concierto</h2>
          <input
            type="text"
            placeholder="Nombre del programa (ej: Concierto de Navidad)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            title="Fecha del evento o concierto"
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}
          />
          <button onClick={createCategory} className="btn-main-admin">Crear Programa</button>
        </section>

        <section className="admin-list-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Programas Registrados ({filteredCategories.length})</h3>
            <input 
              type="text" 
              placeholder="Buscar programa..." 
              value={searchCategory} 
              onChange={(e) => setSearchCategory(e.target.value)} 
              style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px', minWidth: '250px' }} 
            />
          </div>
          <div className="table-scroll">
            <table className="inventory-table">
              <tbody>
                {filteredCategories.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        {c.eventDate && (
                          <span style={{fontSize:'0.8rem', color:'#888', backgroundColor: '#eee', padding: '0.2rem 0.6rem', borderRadius: '12px'}}>
                            {new Date(c.eventDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => setEditingCategory(c)} className="btn-edit">Editar</button>
                      <button onClick={() => deleteCategory(c.id)} className="btn-delete">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editingCategory && (
        <div className="admin-modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2rem 0.5rem' }}>
              <h2 className="modal-header-text">Editar Programa</h2>
              <button onClick={() => setEditingCategory(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 2rem' }}>
              <div className="admin-form-group-premium" style={{ marginBottom: '1.5rem' }}>
                <label>Nombre del Programa</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="premium-input"
                  placeholder="Nombre del programa"
                />
              </div>
              <div className="admin-form-group-premium">
                <label>Fecha del evento</label>
                <input
                  type="date"
                  value={editingCategory.eventDate ? new Date(editingCategory.eventDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, eventDate: e.target.value })}
                  className="premium-input"
                />
              </div>
            </div>
            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2rem 2.5rem' }}>
              <button onClick={() => setEditingCategory(null)} className="btn-modal-cancel">Cancelar</button>
              <button onClick={updateCategory} className="btn-modal-save">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
