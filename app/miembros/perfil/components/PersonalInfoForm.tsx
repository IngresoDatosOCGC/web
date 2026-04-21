import React from 'react';

interface PersonalInfoFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const fieldStyles = {
  wrapper: { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' },
  label: { fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
};

export const PersonalInfoForm = ({ formData, setFormData }: PersonalInfoFormProps) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Nombre *</label>
          <input type="text" className="premium-input" value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Apellidos</label>
          <input type="text" className="premium-input" value={formData.surname}
            onChange={e => setFormData({...formData, surname: e.target.value})} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>DNI / NIE *</label>
          <input type="text" className="premium-input" value={formData.dni}
            onChange={e => setFormData({...formData, dni: e.target.value})} required />
        </div>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Teléfono</label>
          <input type="tel" className="premium-input" value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Fecha de Nacimiento</label>
          <input type="date" className="premium-input" value={formData.birthDate}
            onChange={e => setFormData({...formData, birthDate: e.target.value})} />
        </div>
      </div>
    </>
  );
};
