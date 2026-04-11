// ── Step3Artistico — Registro Step 3 ──
import { FormData, ChangeHandler } from './types';

interface Props {
  formData: FormData;
  onChange: ChangeHandler;
  agrupaciones: string[];
  secciones: string[];
}

export default function Step3Artistico({ formData, onChange, agrupaciones, secciones }: Props) {
  const AgrupSelect = ({ name, label, value }: { name: string; label: string; value: string }) => (
    <div className="form-group">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        <option value="">-- {label} --</option>
        {agrupaciones.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );

  const SeccionSelect = ({ name, label, value, required }: { name: string; label: string; value: string; required?: boolean }) => (
    <div className="form-group">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange} required={required}>
        <option value="">-- Elige --</option>
        {secciones.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );

  return (
    <div className="step-content">
      <h3>Perfil Artístico</h3>
      <p className="help-text" style={{ marginBottom: '1.5rem' }}>Específica en qué agrupaciones participas y tu instrumento.</p>

      <div className="artistic-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group-row">
          <AgrupSelect name="agrupacion" label="Agrupación Principal" value={formData.agrupacion} />
          <SeccionSelect name="instrument" label="Instrumento / Voz" value={formData.instrument} required />
        </div>
        <div style={{ borderTop: '1px solid #eee', padding: '1rem' }} />
        <div className="form-group-row">
          <AgrupSelect name="agrupacion2" label="Segunda Agrupación" value={formData.agrupacion2} />
          <SeccionSelect name="instrument2" label="Segundo Instrumento" value={formData.instrument2} />
        </div>
        <div style={{ borderTop: '1px solid #eee', padding: '1rem' }} />
        <div className="form-group-row">
          <AgrupSelect name="agrupacion3" label="Tercera Agrupación" value={formData.agrupacion3} />
          <SeccionSelect name="instrument3" label="Tercer Instrumento" value={formData.instrument3} />
        </div>
      </div>
    </div>
  );
}
