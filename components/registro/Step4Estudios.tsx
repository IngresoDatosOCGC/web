// ── Step4Estudios — Registro Step 4 ──
import { FormData, ChangeHandler } from './types';

interface Props { formData: FormData; onChange: ChangeHandler; }

export default function Step4Estudios({ formData, onChange }: Props) {
  return (
    <div className="step-content">
      <h3>Estudios y Ocupación</h3>
      <div className="form-group">
        <label htmlFor="trabajo">Ocupación Actual</label>
        <input id="trabajo" type="text" name="trabajo" placeholder="Ej: Estudiante, Administrativo..." value={formData.trabajo} onChange={onChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="estudios">Estudios Realizados</label>
        <textarea id="estudios" name="estudios" rows={4} value={formData.estudios} onChange={onChange as any} placeholder="Ej: Grado en..., Bachillerato..." required />
      </div>
    </div>
  );
}
