"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { useNotifications } from '@/components/ui/NotificationContext';
import { useRouter } from 'next/navigation';
import SeccionTable from '@/components/admin/SeccionTable';

export default function SeccionPage() {
  const { isMaster, isSectionLeader, isLoading: authLoading } = useSupabaseAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [filterFamilia, setFilterFamilia] = useState('all');
  const [filterSeccion, setFilterSeccion] = useState('all');

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/seccion");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        showToast("Error al cargar los miembros", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isMaster && !isSectionLeader) {
        router.push("/miembros/tablon");
      } else {
        fetchMembers();
      }
    }
  }, [authLoading, isMaster, isSectionLeader, router]);

  const toggleStatus = async (estructuraId: number, current: boolean) => {
    try {
      const res = await fetch("/api/admin/seccion", {
        method: "POST",
        body: JSON.stringify({ estructuraId, activo: !current }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        showToast(!current ? "Músico activado en la sección" : "Músico desactivado de la sección");
        fetchMembers();
      } else {
        showToast("Error al actualizar estado", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    }
  };

  // Derive filter options
  const familias = useMemo(() => Array.from(new Set(members.map(m => m.familia))), [members]);
  const secciones = useMemo(() => Array.from(new Set(members.filter(m => filterFamilia === 'all' || m.familia === filterFamilia).map(m => m.seccion))), [members, filterFamilia]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filterFamilia !== 'all' && m.familia !== filterFamilia) return false;
      if (filterSeccion !== 'all' && m.seccion !== filterSeccion) return false;
      return true;
    });
  }, [members, filterFamilia, filterSeccion]);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [localFilteredList, setLocalFilteredList] = useState<any[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
  const [hasMadeChanges, setHasMadeChanges] = useState(false);

  // Detect conflicts in the current saved state
  const hasConflicts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredMembers.forEach(m => {
      if (m.activo && m.atril) {
        const key = `${m.seccion}-${m.atril}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return filteredMembers.some(m => m.activo && m.atril && counts[`${m.seccion}-${m.atril}`] > 1);
  }, [filteredMembers]);

  // Sync localFilteredList initially or when filters/members change (outside of edit mode)
  useEffect(() => {
    if (!isReorderMode) {
      setLocalFilteredList(filteredMembers);
      setHasMadeChanges(false);
    } else {
      // Cuando entra en modo reordenar, agrupar activos al inicio y los inactivos al final
      const sorted = [...filteredMembers].sort((a, b) => {
        if (a.activo === b.activo) return 0;
        return a.activo ? -1 : 1;
      });
      setLocalFilteredList(sorted);
    }
  }, [filteredMembers, isReorderMode]);

  const saveReorder = async () => {
    setIsLoading(true);
    const atrilCounters: Record<string, number> = {};
    
    const updates = localFilteredList.map(m => {
      if (m.activo) {
        if (!atrilCounters[m.seccion]) atrilCounters[m.seccion] = 1;
        const atrilAsignado = atrilCounters[m.seccion]++;
        return { estructuraId: m.id, atril: atrilAsignado };
      }
      return null;
    }).filter(Boolean);

    try {
      const res = await fetch("/api/admin/seccion", {
        method: "POST",
        body: JSON.stringify({ action: "batch-update-atril", updates }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        showToast("Orden guardado correctamente", "success");
        setIsReorderMode(false);
        setHasMadeChanges(false);
        fetchMembers();
      } else {
        showToast("Error al guardar el orden", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const conflictingIds = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredMembers.forEach(m => {
      if (m.activo && m.atril) {
        const key = `${m.seccion}-${m.atril}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return new Set<number>(filteredMembers.filter(m => m.activo && m.atril && counts[`${m.seccion}-${m.atril}`] > 1).map(m => m.id));
  }, [filteredMembers]);

  if (authLoading) {
    return (
      <div className="loader-container"><div className="spinner"></div></div>
    );
  }

  return (
    <div className="seccion-management-page">
      <div className="admin-toolbar-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 0', borderBottom: '1px solid #eef2f6' }}>
        <div>
          <h1 className="admin-page-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#1a2a4b' }}>Gestión de Sección</h1>
          <p className="admin-page-subtitle" style={{ margin: '0.2rem 0 0', color: '#64748b' }}>Activa y ordena los atriles de los músicos de tu sección.</p>
          {hasConflicts && !isReorderMode && (
            <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>⚠️ Hay conflictos de atril. Reordena la sección para solucionarlo.</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {!isReorderMode && (
            <button 
              onClick={() => setIsReorderMode(true)} 
              className="btn-vincular"
              style={{ 
                backgroundColor: (filterSeccion === 'all' && secciones.length > 1) ? '#94a3b8' : '#6366f1', 
                cursor: (filterSeccion === 'all' && secciones.length > 1) ? 'not-allowed' : 'pointer',
                opacity: (filterSeccion === 'all' && secciones.length > 1) ? 0.6 : 1
              }}
              disabled={filterSeccion === 'all' && secciones.length > 1 || isLoading}
              title={(filterSeccion === 'all' && secciones.length > 1) ? "Selecciona una sección específica en los filtros para poder reordenar los atriles" : "Modo Reordenar"}
            >
              ⇕ Modo Reordenar
            </button>
          )}
          {isReorderMode && (
            <>
              <button 
                onClick={() => setIsReorderMode(false)} 
                className="btn-modal-cancel"
                disabled={isLoading}
              >
                Cancelar
              </button>
                <button 
                  onClick={saveReorder} 
                  className="btn-vincular"
                  style={{ backgroundColor: isLoading ? '#94a3b8' : '#10b981', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                  title="Guardar nuevo orden de atriles"
                  disabled={isLoading}
                >
                  ✓ Guardar Atriles
                </button>
            </>
          )}
          <button onClick={fetchMembers} className="btn-refresh" disabled={isReorderMode || isLoading}>↻ Recargar</button>
        </div>
      </div>

      <section className="panel-section-card shadow-lg p-6 bg-white rounded-xl border border-slate-200" style={{ position: 'relative', minHeight: '300px' }}>
        {isLoading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', opacity: isReorderMode ? 0.5 : 1, pointerEvents: isReorderMode ? 'none' : 'auto' }}>
          {familias.length > 1 && (
            <select className="premium-input-sm" value={filterFamilia} onChange={e => { setFilterFamilia(e.target.value); setFilterSeccion('all'); }}>
              <option value="all">Todas las Familias</option>
              {familias.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          {secciones.length > 1 && (
            <select className="premium-input-sm" value={filterSeccion} onChange={e => setFilterSeccion(e.target.value)}>
              <option value="all">Todas las Secciones</option>
              {secciones.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        <SeccionTable 
           filteredMembers={filteredMembers}
           isReorderMode={isReorderMode}
           draggedItemId={draggedItemId}
           setDraggedItemId={setDraggedItemId}
           localFilteredList={localFilteredList}
           setLocalFilteredList={setLocalFilteredList}
           toggleStatus={toggleStatus}
           setHasMadeChanges={setHasMadeChanges}
           conflictingIds={conflictingIds}
        />
      </section>
    </div>
  );
}
