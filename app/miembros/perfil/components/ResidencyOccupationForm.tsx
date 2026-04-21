import React from 'react';

interface ResidencyOccupationFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const fieldStyles = {
  wrapper: { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' },
  label: { fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
};

export const ResidencyOccupationForm = ({ formData, setFormData }: ResidencyOccupationFormProps) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Isla de Residencia</label>
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
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Municipio</label>
          <input type="text" className="premium-input" value={formData.municipio}
            onChange={e => setFormData({...formData, municipio: e.target.value})} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Dirección de Empadronamiento</label>
          <input type="text" className="premium-input" value={formData.empadronamiento}
            onChange={e => setFormData({...formData, empadronamiento: e.target.value})} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            fontSize: '0.875rem', color: '#334155',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            padding: '0.65rem 1rem', borderRadius: '10px',
            border: `1px solid ${formData.hasCertificate ? '#38bdf8' : '#bae6fd'}`,
            width: '100%', transition: 'all 0.2s ease',
            boxShadow: formData.hasCertificate ? '0 0 0 3px rgba(56,189,248,0.15)' : 'none',
          }}>
            <input
              type="checkbox"
              checked={formData.hasCertificate}
              onChange={e => setFormData({...formData, hasCertificate: e.target.checked})}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
            <span style={{ fontWeight: 600 }}>Tengo Certificado de Residencia Canaria</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Profesión / Trabajo Actual</label>
          <input type="text" className="premium-input" value={formData.trabajo}
            onChange={e => setFormData({...formData, trabajo: e.target.value})} />
        </div>
        <div style={fieldStyles.wrapper}>
          <label style={fieldStyles.label}>Nivel de Estudios Musicales</label>
          <input type="text" className="premium-input" value={formData.estudios}
            onChange={e => setFormData({...formData, estudios: e.target.value})} />
        </div>
      </div>
    </>
  );
};
