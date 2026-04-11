"use client";

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";

export default function RepositorioPageClient() {
  const { isLoaded } = useUser();
  const [scores, setScores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | 'todas' | 'documentos'>('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      Promise.all([
        fetch("/api/scores").then(res => res.json()),
        fetch("/api/categories").then(res => res.json())
      ])
      .then(([scoresData, catsData]) => {
        setScores(Array.isArray(scoresData) ? scoresData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando repositorio:", err);
        setLoading(false);
      });
    }
  }, [isLoaded]);

  const forceDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  if (!isLoaded || loading) return <div className="p-10 text-center">Cargando archivo...</div>;

  const filteredScores = activeCategoryId === 'documentos' 
    ? scores.filter(s => s.isDocument)
    : activeCategoryId === 'todas' 
      ? scores.filter(s => !s.isDocument)
      : scores.filter(s => s.categoryId === activeCategoryId && !s.isDocument);

  return (
    <div className="repositorio-fixed-view">
      <div className="repo-grid-container">
        
        {/* SIDEBAR REHECHO (Vertical y claro) */}
        <aside className="repo-sidebar-nav">
          <div className="sidebar-brand">
            <h4>Archivos</h4>
          </div>
          
          <nav className="filter-group">
            <button 
              className={`filter-btn ${activeCategoryId === 'todas' ? 'active' : ''}`}
              onClick={() => setActiveCategoryId('todas')}
            >
              <i className="fa-solid fa-music"></i> Partituras
            </button>
            <button 
              className={`filter-btn ${activeCategoryId === 'documentos' ? 'active' : ''}`}
              onClick={() => setActiveCategoryId('documentos')}
            >
              <i className="fa-solid fa-file-lines"></i> Documentos
            </button>
          </nav>

          <div className="sidebar-divider">Programas</div>

          <nav className="filter-group">
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    className={`filter-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategoryId(cat.id)}
                  >
                    <i className="fa-solid fa-compact-disc"></i> 
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span>{cat.name}</span>
                       {cat.eventDate && (
                         <span style={{ fontSize: '0.65rem', color: '#478AC9', fontWeight: 800 }}>
                           {new Date(cat.eventDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' })}
                         </span>
                       )}
                    </div>
                  </button>
                ))}
             </nav>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className="repo-content-pane">
            <div className="pane-title-row">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2>
                  {activeCategoryId === 'todas' ? 'Partituras' 
                    : activeCategoryId === 'documentos' ? 'Documentación' 
                    : categories.find(c => c.id === activeCategoryId)?.name}
                </h2>
                {activeCategoryId !== 'todas' && activeCategoryId !== 'documentos' && (
                  <p style={{ color: '#478AC9', fontWeight: 800, margin: 0 }}>
                    CONCIERTO: {new Date(categories.find(c => c.id === activeCategoryId)?.eventDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                  </p>
                )}
              </div>
              <span className="results-chip">{filteredScores.length} Archivos</span>
            </div>

          <div className="inventory-stack">
            {filteredScores.length === 0 ? (
              <div className="inventory-empty">No hay archivos en esta categoría.</div>
            ) : (
              filteredScores.map(score => (
                <div key={score.id} className="inventory-card">
                  <div className="card-main">
                    <div className="card-doc-icon">PDF</div>
                    <div className="card-text">
                      <h4>{score.title}</h4>
                      <div className="card-tags">
                        <span className="tag-category">{score.category?.name || "REPERTORIO"}</span>
                        {score.allowedRoles?.length > 0 && <span className="tag-roles">{score.allowedRoles.join(" • ")}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card-actions-group">
                    <a href={score.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-action-s">ABRIR</a>
                    <button onClick={() => forceDownload(score.fileUrl, `${score.title}.pdf`)} className="btn-action-p">BAJAR</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

    </div>
  );
}
