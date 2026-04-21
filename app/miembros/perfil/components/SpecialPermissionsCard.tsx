import React from 'react';
import { ShieldAlert, ShieldCheck, BookOpen, Users, ShoppingCart } from 'lucide-react';

interface SpecialPermissionsCardProps {
  profile: any;
}

const permissions = [
  { key: 'isMaster',        icon: ShieldCheck,    label: 'Master / Admin',     desc: 'Acceso total a la gestión del sistema',   color: '#6366f1' },
  { key: 'isArchiver',      icon: BookOpen,        label: 'Archivero',          desc: 'Gestión de partituras y repositorio',     color: '#0891b2' },
  { key: 'isSectionLeader', icon: Users,           label: 'Jefe de Sección',    desc: 'Gestión de plantillas de sus secciones',  color: '#059669' },
  { key: 'isSeller',        icon: ShoppingCart,    label: 'Ventas / Comercial', desc: 'Gestión de venta de entradas',            color: '#d97706' },
];

export const SpecialPermissionsCard = ({ profile }: SpecialPermissionsCardProps) => {
  const activePermissions = permissions.filter(p => profile?.[p.key]);
  if (activePermissions.length === 0) return null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #e8edf5',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #f0f4f8',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
      }}>
        <ShieldAlert size={17} color="#7c3aed" />
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Permisos Especiales
        </h3>
      </div>

      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {activePermissions.map(({ key, icon: Icon, label, desc, color }) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: `${color}18`,
              border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
