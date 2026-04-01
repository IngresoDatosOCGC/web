"use client";

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";

export default function RepositorioPageClient() {
  const { user, isLoaded } = useUser();
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

  if (!isLoaded || loading) {
    return (
      <main className="dashboard-content">
          <div className="repositorio-container">
              <aside className="repositorio-sidebar">
                  <div style={{padding:'1rem', color:'#666'}}>Cargando conjuntos...</div>
              </aside>
              <section className="repositorio-main">
                  <div className="file-list">
                      <p style={{padding:'1rem', color:'#666'}}><i className="fas fa-spinner fa-spin"></i> Cargando tus partituras...</p>
                  </div>
              </section>
          </div>
      </main>
    );
  }

  // Filtrar las partituras según la categoría activa
  const filteredScores = activeCategoryId === 'documentos' 
    ? scores.filter(s => s.isDocument)
    : activeCategoryId === 'todas' 
      ? scores.filter(s => !s.isDocument)
      : scores.filter(s => s.categoryId === activeCategoryId && !s.isDocument);

  return (
    <main className="dashboard-content">
      <div className="repositorio-container">
        <aside className="repositorio-sidebar">
           {/* Tab Todas */}
           <div 
             className={`repo-tab ${activeCategoryId === 'todas' ? 'active' : ''}`}
             onClick={() => setActiveCategoryId('todas')}
           >
             Todas las partituras
           </div>

           {/* Tab Documentos Generales */}
           <div 
             className={`repo-tab ${activeCategoryId === 'documentos' ? 'active' : ''}`}
             onClick={() => setActiveCategoryId('documentos')}
             style={{ borderBottom: '2px solid #ccc' }}
           >
             Documentos
           </div>
           
           {/* Tabs por Repertorios */}
           {categories.map(cat => (
             <div 
               key={cat.id} 
               className={`repo-tab ${activeCategoryId === cat.id ? 'active' : ''}`}
               onClick={() => setActiveCategoryId(cat.id)}
             >
               {cat.name}
             </div>
           ))}
        </aside>
        
        <section className="repositorio-main">
          <div className="repo-header">
            <h2>
              {activeCategoryId === 'todas' ? 'Todas las obras' 
                : activeCategoryId === 'documentos' ? 'Documentos Generales' 
                : categories.find(c => c.id === activeCategoryId)?.name}
            </h2>
            <span className="user-badge" id="repo-user-badge">{user?.firstName?.toUpperCase()}</span>
          </div>
          
          <div className="file-list">
             {filteredScores.length === 0 && (
               <div className="repo-empty">No hay partituras disponibles en este repertorio.</div>
             )}

             {filteredScores.map(score => (
               <div key={score.id} className="file-item">
                 <div className="file-icon">
                   <i className="fa-solid fa-file-pdf"></i>
                 </div>
                 <div className="file-info">
                   <h4>{score.title}</h4>
                   <div className="category">
                     {score.isDocument ? (
                       <span style={{color: '#e67e22', fontWeight: 600}}>DOCUMENTO GENERAL</span>
                     ) : (
                       <>
                         Repertorio: <span>{score.category?.name || "No asignado"}</span> | 
                         Secciones: <span>{score.allowedRoles?.length > 0 ? score.allowedRoles.join(", ") : "Todos"}</span>
                       </>
                     )}
                   </div>
                 </div>
                 <a href={score.fileUrl} target="_blank" className="login-btn" style={{ width: 'auto', padding: '0.6rem 2rem', marginTop: '0', textDecoration: 'none' }}>
                   Abrir PDF
                 </a>
               </div>
             ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .repositorio-container { display: flex; min-height: 80vh; }
        .repositorio-sidebar { width: 280px; background: #eef1f4; border-right: 1px solid #dee2e6; }
        .repo-tab { padding: 1.5rem 1.8rem; cursor: pointer; font-size: 0.95rem; color: #444; transition: all 0.3s; border-bottom: 1px solid #e1e5e9; font-weight: 500;}
        .repo-tab:hover { background: #e4e8ec; }
        .repo-tab.active { background: #fff; color: #478AC9; font-weight: bold; border-left: 4px solid #478AC9;}
        .repositorio-main { flex: 1; padding: 3rem 4rem; background: #fff; }
        .repo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding-left: 0.5rem; border-bottom: 2px solid #f9f9f9; padding-bottom: 1rem;}
        .repo-header h2 { font-size: 1.6rem; font-weight: 400; color: #333; margin: 0;}
        .repo-header .user-badge { font-size: 1rem; font-weight: bold; color: #478AC9; }
        .file-list { display: flex; flex-direction: column; gap: 1.2rem; }
        .file-item { background: #fff; padding: 1.2rem 2rem; border-radius: 6px; display: flex; align-items: center; gap: 1.5rem; border: 1px solid #eaedf0; transition: all 0.3s; }
        .file-item:hover { border-color: #ced4da; background: #fafbfc; box-shadow: 0 4px 12px rgba(0,0,0,0.02);}
        .file-icon { font-size: 2.2rem; color: #e74c3c; }
        .file-info { flex: 1; }
        .file-info h4 { margin: 0 0 0.4rem; font-size: 1.1rem; color: #333; font-weight: 700; }
        .file-info .category { font-size: 0.85rem; color: #888; }
        .file-info .category span { color: #478AC9; font-weight: 600;}
        .repo-empty { color: #999; text-align: center; padding: 3rem; font-size: 1rem; background: #fdfdfd; border: 2px dashed #eee; border-radius: 12px;}
        .login-btn { background-color: #478AC9; color: #fff; padding: 1rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s;}
        .login-btn:hover { background-color: #2e5982; }
      `}</style>
    </main>
  );
}
