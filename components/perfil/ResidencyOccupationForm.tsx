import React from 'react';

interface ResidencyOccupationFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ResidencyOccupationForm = ({ formData, setFormData }: ResidencyOccupationFormProps) => {
  return (
    <>
      <div className="profile-form-grid profile-form-grid--2">
        <div className="profile-field">
          <label className="profile-label">Isla de Residencia</label>
          <select className="premium-input" value={formData.isla}
            onChange={e => setFormData({...formData, isla: e.target.value})}>
            <option value="">Seleccionar Isla...</option>
            <option value="Gran Canaria">Gran Canaria</option>
            <option value="Tenerife">Tenerife</option>
            <option value="Lanzarote">Lanzarote</option>
            <option value="Fuerteventura">Fuerteventura</option>
            <option value="La Palma">La Palma</option>
            <option value="La Gomera">La Gomera</option>
            <option value="El Hierro">El Hierro</option>
            <option value="Fuera de Canarias">Fuera de Canarias</option>
          </select>
        </div>
        <div className="profile-field">
          <label className="profile-label">Municipio</label>
          <input type="text" className="premium-input" value={formData.municipio}
            onChange={e => setFormData({...formData, municipio: e.target.value})} />
        </div>
      </div>

      <div className="profile-form-grid profile-form-grid--2">
        <div className="profile-field">
          <label className="profile-label">Dirección de Empadronamiento</label>
          <input type="text" className="premium-input" value={formData.empadronamiento}
            onChange={e => setFormData({...formData, empadronamiento: e.target.value})} />
        </div>
        <div className="profile-field profile-field--align-end">
          <label className={`profile-cert-label${formData.hasCertificate ? ' profile-cert-label--active' : ''}`}>
            <input
              type="checkbox"
              checked={formData.hasCertificate}
              onChange={e => setFormData({...formData, hasCertificate: e.target.checked})}
              className="profile-cert-checkbox"
            />
            <span>Tengo Certificado de Residencia Canaria</span>
          </label>
        </div>
      </div>

      <div className="profile-form-grid profile-form-grid--2">
        <div className="profile-field">
          <label className="profile-label">Profesión / Trabajo Actual</label>
          <input type="text" className="premium-input" value={formData.trabajo}
            onChange={e => setFormData({...formData, trabajo: e.target.value})} />
        </div>
        <div className="profile-field">
          <label className="profile-label">Nivel de Estudios Musicales</label>
          <input type="text" className="premium-input" value={formData.estudios}
            onChange={e => setFormData({...formData, estudios: e.target.value})} />
        </div>
      </div>
    </>
  );
};
