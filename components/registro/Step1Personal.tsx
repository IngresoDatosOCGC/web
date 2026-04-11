// ── Step1Personal — Registro Step 1 ──
import { FormData, ChangeHandler } from './types';

interface Props { formData: FormData; onChange: ChangeHandler; }

export default function Step1Personal({ formData, onChange }: Props) {
  return (
    <div className="step-content">
      <h3>Información Personal</h3>
      <div className="form-group">
        <label htmlFor="firstName">Nombre</label>
        <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={onChange} required autoComplete="given-name" />
      </div>
      <div className="form-group">
        <label htmlFor="surname">Apellidos</label>
        <input id="surname" type="text" name="surname" value={formData.surname} onChange={onChange} required autoComplete="family-name" />
      </div>
      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="dni">DNI / NIE</label>
          <input id="dni" type="text" name="dni" value={formData.dni} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="dob">Fecha de Nacimiento</label>
          <input id="dob" type="date" name="dob" value={formData.dob} onChange={onChange} required />
        </div>
      </div>
    </div>
  );
}
