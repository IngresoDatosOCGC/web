import React from 'react';
import { ShieldAlert, ShieldCheck, BookOpen, Users, ShoppingCart } from 'lucide-react';

interface SpecialPermissionsCardProps {
  profile: any;
}

const permissions = [
  { key: 'isMaster',        icon: ShieldCheck,  label: 'Master / Admin',     desc: 'Acceso total a la gestión del sistema',  color: '#6366f1' },
  { key: 'isArchiver',      icon: BookOpen,      label: 'Archivero',          desc: 'Gestión de partituras y repositorio',    color: '#0891b2' },
  { key: 'isSectionLeader', icon: Users,         label: 'Jefe de Sección',    desc: 'Gestión de plantillas de sus secciones', color: '#059669' },
  { key: 'isSeller',        icon: ShoppingCart,  label: 'Ventas / Comercial', desc: 'Gestión de venta de entradas',           color: '#d97706' },
];

export const SpecialPermissionsCard = ({ profile }: SpecialPermissionsCardProps) => {
  const activePermissions = permissions.filter(p => profile?.[p.key]);
  if (activePermissions.length === 0) return null;

  return (
    <div className="profile-card">
      <div className="profile-card__header profile-card__header--purple">
        <ShieldAlert size={17} />
        <h3 className="profile-card__title">Permisos Especiales</h3>
      </div>

      <div className="profile-card__body">
        <div className="profile-permissions-list">
          {activePermissions.map(({ key, icon: Icon, label, desc, color }) => (
            <div key={key} className="profile-permission-item">
              <div className="profile-permission-item__icon" style={{ '--perm-color': color } as React.CSSProperties}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <p className="profile-permission-item__label">{label}</p>
                <p className="profile-permission-item__desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
