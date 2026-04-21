import React from 'react';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthCredentialsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  email: string;
}

export const AuthCredentialsForm = ({ formData, setFormData, email }: AuthCredentialsFormProps) => {
  return (
    <>
      <div className="profile-form-grid profile-form-grid--2">
        {/* Email - read only */}
        <div className="profile-field">
          <label className="profile-label">Email</label>
          <div className="profile-input-icon-wrapper">
            <Mail size={15} className="profile-input-icon" />
            <input
              type="email"
              className="premium-input profile-input--with-icon profile-input--disabled"
              value={email || 'N/A'}
              disabled
            />
          </div>
          <span className="profile-hint">Contacta con soporte para cambiar tu email.</span>
        </div>

        {/* Username */}
        <div className="profile-field">
          <label className="profile-label">Nombre de Usuario</label>
          <div className="profile-input-icon-wrapper">
            <UserIcon size={15} className="profile-input-icon" />
            <input
              type="text"
              className="premium-input profile-input--with-icon"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              placeholder="Tu alias o DNI"
            />
          </div>
        </div>
      </div>

      {/* Password change notice */}
      <div className="profile-password-notice">
        <Lock size={14} className="profile-password-notice__icon" />
        <span>Para cambiar tu contraseña, rellena los tres campos de abajo. Déjalos vacíos si no deseas cambiarla.</span>
      </div>

      <div className="profile-form-grid profile-form-grid--3">
        <div className="profile-field">
          <label className="profile-label">Contraseña Actual</label>
          <div className="profile-input-icon-wrapper">
            <Lock size={15} className="profile-input-icon" />
            <input
              type="password"
              className="premium-input profile-input--with-icon"
              value={formData.currentPassword}
              onChange={e => setFormData({...formData, currentPassword: e.target.value})}
              placeholder="Tu contraseña actual"
            />
          </div>
        </div>
        <div className="profile-field">
          <label className="profile-label">Nueva Contraseña</label>
          <div className="profile-input-icon-wrapper">
            <Lock size={15} className="profile-input-icon" />
            <input
              type="password"
              className="premium-input profile-input--with-icon"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
          </div>
        </div>
        <div className="profile-field">
          <label className="profile-label">Repetir Nueva</label>
          <div className="profile-input-icon-wrapper">
            <Lock size={15} className="profile-input-icon" />
            <input
              type="password"
              className="premium-input profile-input--with-icon"
              value={formData.repeatPassword}
              onChange={e => setFormData({...formData, repeatPassword: e.target.value})}
              placeholder="Confirma la nueva clave"
              minLength={8}
            />
          </div>
        </div>
      </div>
    </>
  );
};
