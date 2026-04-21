import React from 'react';

interface PersonalInfoFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const PersonalInfoForm = ({ formData, setFormData }: PersonalInfoFormProps) => {
  return (
    <>
      <div className="profile-form-grid profile-form-grid--2">
        <div className="profile-field">
          <label className="profile-label">Nombre *</label>
          <input type="text" className="premium-input" value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="profile-field">
          <label className="profile-label">Apellidos</label>
          <input type="text" className="premium-input" value={formData.surname}
            onChange={e => setFormData({...formData, surname: e.target.value})} />
        </div>
      </div>

      <div className="profile-form-grid profile-form-grid--3">
        <div className="profile-field">
          <label className="profile-label">DNI / NIE *</label>
          <input type="text" className="premium-input" value={formData.dni}
            onChange={e => setFormData({...formData, dni: e.target.value})} required />
        </div>
        <div className="profile-field">
          <label className="profile-label">Teléfono</label>
          <input type="tel" className="premium-input" value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div className="profile-field">
          <label className="profile-label">Fecha de Nacimiento</label>
          <input type="date" className="premium-input" value={formData.birthDate}
            onChange={e => setFormData({...formData, birthDate: e.target.value})} />
        </div>
      </div>
    </>
  );
};
