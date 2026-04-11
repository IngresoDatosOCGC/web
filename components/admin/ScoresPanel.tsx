"use client";

import React, { useState, useMemo } from 'react';
import CSVImportScores from './CSVImportScores';
import { useNotifications } from '@/components/ui/NotificationContext';

interface ScoresPanelProps {
  scores: any[];
  categories: any[];
  agrupaciones: any[];
  tagsDict: Record<string, any[]>;
  predefinedTags: string[];
  isMaster: boolean;
  isArchiver: boolean;
  onRefresh: () => void;
}

export default function ScoresPanel({
  scores,
  categories,
  agrupaciones,
  tagsDict,
  predefinedTags,
  isMaster,
  isArchiver,
  onRefresh
}: ScoresPanelProps) {
  const { showToast, confirmAction } = useNotifications();
  
  // State for creation
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadIsDoc, setUploadIsDoc] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAgrupaciones, setSelectedAgrupaciones] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Filters
  const [searchScore, setSearchScore] = useState('');
  const [filterScoreCategory, setFilterScoreCategory] = useState<string>('all');
  const [filterScoreType, setFilterScoreType] = useState<string>('all');
  const [filterScoreInstrument, setFilterScoreInstrument] = useState<string>('all');

  // Editing state
  const [editingScore, setEditingScore] = useState<any | null>(null);

  const toggleTag = (r: string) => {
    setSelectedTags(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const toggleAgrupacion = (a: string) => {
    setSelectedAgrupaciones(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const deleteScore = (id: number) => {
    confirmAction("¿Eliminar esta partitura permanentemente?", async () => {
      try {
        const res = await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Partitura eliminada");
          onRefresh();
        }
      } catch (error) {
        showToast("Error al eliminar", "error");
      }
    });
  };

  const updateScore = async () => {
    if (!editingScore) return;
    try {
      const res = await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingScore)
      });
      if (res.ok) {
        showToast("✅ Cambios guardados");
        setEditingScore(null);
        onRefresh();
      }
    } catch (error) {
      showToast("Error al actualizar", "error");
    }
  };

  const filteredScores = useMemo(() => {
    return scores.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchScore.toLowerCase());
      const matchesCategory = filterScoreCategory === 'all' || s.categoryId?.toString() === filterScoreCategory;
      const matchesType = filterScoreType === 'all' || (filterScoreType === 'score' ? !s.isDocument : s.isDocument);
      const matchesInstrument = filterScoreInstrument === 'all' || 
          (s.allowedRoles && s.allowedRoles.includes(filterScoreInstrument)) ||
          (s.allowedAgrupaciones && s.allowedAgrupaciones.includes(filterScoreInstrument));
      
      return matchesSearch && matchesCategory && matchesType && matchesInstrument;
    });
  }, [scores, searchScore, filterScoreCategory, filterScoreType, filterScoreInstrument]);

  return (
    <>
      <CSVImportScores categories={categories} onImportSuccess={onRefresh} />
      
      <div className="admin-content-grid">
        <section className="admin-form-card">
          <h2>Añadir Partitura o Documento</h2>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const isDoc = (form.elements.namedItem("isDocument") as HTMLInputElement).checked;
              const catId = (form.elements.namedItem("categoryId") as HTMLSelectElement).value;
              
              if (!isDoc && !catId) {
                return showToast("Debes seleccionar un Programa para la partitura o marcarla como Documento.", "error");
              }
              if (!isDoc && (selectedAgrupaciones.length === 0 || selectedTags.length === 0)) {
                return showToast("Debes seleccionar al menos una Agrupación y un Instrumento.", "error");
              }

              setIsUploading(true);
              try {
                const fd = new FormData(form);
                const res = await fetch("/api/scores/create", {
                  method: "POST",
                  body: fd
                });
                if (res.ok) {
                  showToast("✅ Partitura publicada con éxito");
                  onRefresh();
                  setUploadTitle('');
                  setSelectedTags([]);
                  setSelectedAgrupaciones([]);
                  setUploadIsDoc(false);
                  form.reset();
                } else {
                  showToast("Error al publicar la partitura", "error");
                }
              } catch (error) {
                showToast("Error de conexión", "error");
              } finally {
                setIsUploading(false);
              }
            }}
            className="new-score-form"
          >
            <input 
              type="text" 
              name="title" 
              placeholder="Título (ej: Sinfonía 9)" 
              required 
              value={uploadTitle} 
              onChange={(e) => setUploadTitle(e.target.value)} 
            />
            <select name="categoryId" className="category-select">
              <option value="">Programa</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <input type="file" name="file" accept=".pdf" required />
            
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Panel Agrupaciones */}
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>1. Seleccionar Agrupaciones:</p>
                <div className="instrument-chips-grid">
                  {agrupaciones.map((a: any) => (
                    <label key={a.id} className={`instrument-chip ${selectedAgrupaciones.includes(a.agrupacion) ? 'selected' : ''}`}>
                      <input 
                        type="checkbox" 
                        name="agrupaciones" 
                        value={a.agrupacion} 
                        checked={selectedAgrupaciones.includes(a.agrupacion)} 
                        onChange={() => toggleAgrupacion(a.agrupacion)} 
                        style={{ display: 'none' }} 
                      />
                      {a.agrupacion}
                    </label>
                  ))}
                </div>
              </div>

              {/* Panel Secciones/Instrumentos */}
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#444', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>2. Seleccionar Secciones/Instrumentos:</p>
                {Object.keys(tagsDict).length > 0 ? (
                  Object.entries(tagsDict).map(([familia, instrumentos]) => (
                    instrumentos.length > 0 && (
                      <div key={familia} style={{ marginBottom: '1.2rem' }}>
                        <h4 style={{ fontSize: '0.75rem', color: '#478AC9', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem', borderLeft: '3px solid #478AC9', paddingLeft: '0.6rem' }}>{familia}</h4>
                        <div className="instrument-chips-grid">
                          {instrumentos.map((r: any) => (
                            <label key={r.name} className={`instrument-chip ${selectedTags.includes(r.name) ? 'selected' : ''}`}>
                              <input 
                                type="checkbox" 
                                name="roles" 
                                value={r.name} 
                                checked={selectedTags.includes(r.name)} 
                                onChange={() => toggleTag(r.name)} 
                                style={{ display: 'none' }} 
                              />
                              {r.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#999' }}>Cargando etiquetas de instrumentos...</p>
                )}
              </div>
            </div>

            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0 0 1rem', fontSize: '0.9rem', color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" name="isDocument" value="true" checked={uploadIsDoc} onChange={(e) => setUploadIsDoc(e.target.checked)} />
              Marcar como Documento General (Para Todos)
            </label>

            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '6px', fontSize: '0.9rem', color: '#555', marginBottom: '1rem', border: '1px solid #dee2e6' }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#333' }}>Nombre del archivo final:</strong>
              <code style={{ background: '#e9ecef', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#0984e3' }}>
                {uploadTitle ? `${uploadTitle.trim().replace(/[^a-zA-Z0-9_ -]/g, "_").replace(/\s+/g, "_")}_${uploadIsDoc ? "Documento" : (selectedTags.length > 0 ? selectedTags.map(r => r.replace(/[^a-zA-Z0-9]/g, "")).join("_") : "")}.pdf` : "esperando_datos.pdf"}
              </code>
            </div>

            <button type="submit" className="btn-main-admin" disabled={isUploading}>
              {isUploading ? "Subiendo archivo..." : "Publicar Ahora"}
            </button>
          </form>
        </section>

        <section className="admin-list-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Archivo Digital ({filteredScores.length})</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select value={filterScoreType} onChange={(e) => setFilterScoreType(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="all">Filtro por tipo</option>
                <option value="score">Partituras</option>
                <option value="document">Documentos</option>
              </select>
              <select value={filterScoreCategory} onChange={(e) => setFilterScoreCategory(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="all">Filtro por programa</option>
                {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
              </select>
              <select value={filterScoreInstrument} onChange={(e) => setFilterScoreInstrument(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="all">Filtro por etiqueta</option>
                {predefinedTags.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="text" placeholder="Buscar título..." value={searchScore} onChange={(e) => setSearchScore(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px', minWidth: '150px' }} />
            </div>
          </div>
          
          <div className="table-scroll">
            <table className="inventory-table">
              <tbody>
                {filteredScores.map(s => (
                  <tr key={s.id}>
                    <td className="score-title">{s.title}</td>
                    <td className="score-roles">
                      {s.isDocument ? <span style={{color: '#e67e22', fontWeight: 600}}>DOCUMENTO</span> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>[ {s.allowedAgrupaciones?.join(", ") || "No asig."} ]</span>
                          <span>{s.allowedRoles?.join(", ") || "Todos"}</span>
                        </div>
                      )}
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => setEditingScore(s)} className="btn-edit">Editar</button>
                      <button onClick={() => deleteScore(s.id)} className="btn-delete">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Edit */}
      {editingScore && (
        <div className="admin-modal-overlay" onClick={() => setEditingScore(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2rem 0.5rem' }}>
              <h2 className="modal-header-text">Editar: {editingScore.title}</h2>
              <button onClick={() => setEditingScore(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 2rem' }}>
              <div className="admin-form-group-premium" style={{ marginBottom: '1.2rem' }}>
                <label>Título</label>
                <input type="text" value={editingScore.title} onChange={(e) => setEditingScore({...editingScore, title: e.target.value})} className="premium-input" />
              </div>
              <div className="admin-form-group-premium" style={{ marginBottom: '1.2rem' }}>
                <label>Programa</label>
                <select value={editingScore.categoryId || ''} onChange={(e) => setEditingScore({...editingScore, categoryId: e.target.value ? parseInt(e.target.value) : null})} className="premium-input">
                  <option value="">-- Sin programa --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <label style={{ fontSize: '0.95rem', display: 'flex', gap: '0.8rem', alignItems: 'center', cursor: 'pointer', marginBottom: '1.5rem' }}>
                <input type="checkbox" checked={editingScore.isDocument} onChange={(e) => setEditingScore({...editingScore, isDocument: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Es Documento General (Para todos)
              </label>

              {!editingScore.isDocument && (
                <>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.6rem', color: '#1a2a4b' }}>Agrupaciones que pueden verla</label>
                    <div className="instrument-chips-grid">
                      {agrupaciones.map(a => {
                        const isSelected = editingScore.allowedAgrupaciones?.includes(a.agrupacion);
                        return (
                          <label key={a.id} className={`instrument-chip ${isSelected ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => {
                                const newAgrs = isSelected 
                                  ? editingScore.allowedAgrupaciones.filter((x:string) => x !== a.agrupacion)
                                  : [...(editingScore.allowedAgrupaciones || []), a.agrupacion];
                                setEditingScore({...editingScore, allowedAgrupaciones: newAgrs});
                              }}
                              style={{ display: 'none' }} 
                            />
                            {a.agrupacion}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.6rem', color: '#1a2a4b' }}>Instrumentos / Secciones</label>
                    <div className="instrument-chips-grid" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {predefinedTags.sort().map(r => {
                        const isSelected = editingScore.allowedRoles?.includes(r);
                        return (
                          <label key={r} className={`instrument-chip ${isSelected ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => {
                                const newRoles = isSelected 
                                  ? editingScore.allowedRoles.filter((ar:string) => ar !== r)
                                  : [...(editingScore.allowedRoles || []), r];
                                setEditingScore({...editingScore, allowedRoles: newRoles});
                              }}
                              style={{ display: 'none' }} 
                            />
                            {r}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2rem 2.5rem' }}>
              <button onClick={() => setEditingScore(null)} className="btn-modal-cancel">Cancelar</button>
              <button onClick={updateScore} className="btn-modal-save">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
