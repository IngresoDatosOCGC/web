import React, { useState, useEffect } from 'react';

interface Member {
  id: number;
  userId: string;
  name: string;
  email: string;
  agrupacion: string;
  seccion: string;
  familia: string;
  papel: string;
  activo: boolean;
  atril: number | null;
}

interface SeccionTableProps {
  filteredMembers: Member[];
  isReorderMode: boolean;
  draggedItemId: number | null;
  setDraggedItemId: (id: number | null) => void;
  localFilteredList: Member[];
  setLocalFilteredList: (list: Member[]) => void;
  toggleStatus: (id: number, current: boolean) => void;
  setHasMadeChanges?: (val: boolean) => void;
  conflictingIds?: Set<number>;
}

export default function SeccionTable({
  filteredMembers,
  isReorderMode,
  draggedItemId,
  setDraggedItemId,
  localFilteredList,
  setLocalFilteredList,
  toggleStatus,
  setHasMadeChanges,
  conflictingIds
}: SeccionTableProps) {
  
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const sourceIndex = localFilteredList.findIndex(m => m.id === draggedItemId);
    const targetIndex = localFilteredList.findIndex(m => m.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const sourceMember = localFilteredList[sourceIndex];
    if (!sourceMember.activo) return;

    const targetMember = localFilteredList[targetIndex];
    if (!targetMember.activo) return;

    const newList = [...localFilteredList];
    const [removed] = newList.splice(sourceIndex, 1);
    newList.splice(targetIndex, 0, removed);
    
    setLocalFilteredList(newList);
    setDraggedItemId(null);
    if (setHasMadeChanges) setHasMadeChanges(true);
  };

  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: `1px solid ${isReorderMode ? '#6366f1' : '#e2e8f0'}` }}>
      <table className="admin-data-table w-full">
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '1rem', width: '40px' }}></th>
            <th style={{ width: '40%', padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Nombre</th>
            <th style={{ width: '30%', padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sección</th>
            <th style={{ width: '15%', padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Atril</th>
            <th style={{ width: '15%', padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {localFilteredList.map((m, index) => {
            let visualAtril = m.atril;
            if (isReorderMode && m.activo) {
              const activosAntesDeMismaSeccion = localFilteredList.slice(0, index + 1).filter(x => x.activo && x.seccion === m.seccion).length;
              visualAtril = activosAntesDeMismaSeccion;
            }

            const hasConflict = conflictingIds && conflictingIds.has(m.id);

            return (
              <tr 
                key={m.id} 
                draggable={isReorderMode && m.activo}
                onDragStart={(e) => handleDragStart(e, m.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, m.id)}
                style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  cursor: isReorderMode && m.activo ? 'move' : 'default',
                  backgroundColor: m.id === draggedItemId ? '#f8fafc' : (hasConflict && !isReorderMode ? '#fff1f2' : 'transparent'),
                  opacity: (!m.activo && isReorderMode) ? 0.4 : 1
                }}
              >
                <td style={{ padding: '1rem', textAlign: 'center', color: m.activo ? '#cbd5e1' : 'transparent' }}>
                  {isReorderMode && m.activo ? '☰' : ''}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: 500, color: hasConflict && !isReorderMode ? '#be123c' : '#1e293b' }}>
                  {m.name} {hasConflict && !isReorderMode && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#ffe4e6', color: '#e11d48', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>⚠️ Conflicto</span>}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ fontWeight: 600 }}>{m.seccion}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{m.agrupacion}</div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: hasConflict && !isReorderMode ? '#e11d48' : '#0ea5e9', fontSize: '1.1rem' }}>
                  {m.activo ? visualAtril : "—"}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => !isReorderMode && toggleStatus(m.id, m.activo)}
                    className={`btn-access-status ${m.activo ? 'active' : ''}`}
                    title={m.activo ? "Desactivar" : "Activar"}
                    disabled={isReorderMode}
                    style={{ cursor: isReorderMode ? 'not-allowed' : 'pointer' }}
                  >
                    {m.activo ? '✓' : '🚫'}
                  </button>
                </td>
              </tr>
            );
          })}
          {localFilteredList.length === 0 && (
            <tr>
              <td colSpan={isReorderMode ? 5 : 4} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                No hay miembros para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
