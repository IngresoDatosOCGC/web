import React from 'react';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthCredentialsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  email: string;
}

const fieldStyles = {
  wrapper: { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' },
  label: { fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
};

const inputWithIcon = {
  wrapper: { position: 'relative' as const },
  icon: {
    position: 'absolute' as const,
    left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    color: '#94a3b8', pointerEvents: 'none' as const,
  },
  input: { paddingLeft: '2.25rem' },
};

export const AuthCredentialsForm = ({ formData, setFormData, email }: AuthCredentialsFormProps) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Email - read only */}
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Email</label>
          <div style={inputWithIcon.wrapper}>
            <Mail size={15} style={inputWithIcon.icon} />
            <input
              type="email"
              className="premium-input"
              value={email || 'N/A'}
              disabled
              style={{ ...inputWithIcon.input, backgroundColor: '#f8fafc', cursor: 'not-allowed', color: '#94a3b8' }}
            />
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Contacta con soporte para cambiar tu email.
          </span>
        </div>

        {/* Username */}
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Nombre de Usuario</label>
          <div style={inputWithIcon.wrapper}>
            <UserIcon size={15} style={inputWithIcon.icon} />
            <input
              type="text"
              className="premium-input"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              placeholder="Tu alias o DNI"
              style={inputWithIcon.input}
            />
          </div>
        </div>
      </div>

      {/* Password change notice */}
      <div style={{
        padding: '0.85rem 1.1rem',
        background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
        borderRadius: '10px',
        border: '1px solid #fde68a',
        fontSize: '0.82rem',
        color: '#92400e',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
      }}>
        <Lock size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#d97706' }} />
        <span>Para cambiar tu contraseña, rellena los tres campos de abajo. Déjalos vacíos si no deseas cambiarla.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '1.25rem' }}>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Contraseña Actual</label>
          <div style={inputWithIcon.wrapper}>
            <Lock size={15} style={inputWithIcon.icon} />
            <input
              type="password"
              className="premium-input"
              value={formData.currentPassword}
              onChange={e => setFormData({...formData, currentPassword: e.target.value})}
              placeholder="Tu contraseña actual"
              style={inputWithIcon.input}
            />
          </div>
        </div>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Nueva Contraseña</label>
          <div style={inputWithIcon.wrapper}>
            <Lock size={15} style={inputWithIcon.icon} />
            <input
              type="password"
              className="premium-input"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              style={inputWithIcon.input}
            />
          </div>
        </div>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Repetir Nueva</label>
          <div style={inputWithIcon.wrapper}>
            <Lock size={15} style={inputWithIcon.icon} />
            <input
              type="password"
              className="premium-input"
              value={formData.repeatPassword}
              onChange={e => setFormData({...formData, repeatPassword: e.target.value})}
              placeholder="Confirma la nueva clave"
              minLength={8}
              style={inputWithIcon.input}
            />
          </div>
        </div>
      </div>
    </>
  );
};
