// ── Step2Contacto — Registro Step 2 ──
import { FormData, ChangeHandler } from './types';

const ISLAS = ['Gran Canaria','Tenerife','Lanzarote','Fuerteventura','La Palma','La Gomera','El Hierro','La Graciosa','Fuera de Islas'];

interface Props {
  formData: FormData;
  onChange: ChangeHandler;
  onCheckboxChange: (checked: boolean) => void;
}

export default function Step2Contacto({ formData, onChange, onCheckboxChange }: Props) {
  return (
    <div className="step-content">
      <h3>Contacto y Residencia</h3>
      <div className="form-group">
        <label htmlFor="phone">Teléfono Móvil</label>
        <input id="phone" type="tel" name="phone" value={formData.phone} onChange={onChange} required autoComplete="tel" />
      </div>
      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="isla">Isla de Residencia</label>
          <select id="isla" name="isla" value={formData.isla} onChange={onChange} required>
            <option value="">-- Isla --</option>
            {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="municipio">Municipio</label>
          <input id="municipio" type="text" name="municipio" value={formData.municipio} onChange={onChange} required />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="hasCertificate" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: '0.5rem 0' }}>
          <input
            id="hasCertificate"
            type="checkbox"
            name="hasCertificate"
            checked={formData.hasCertificate}
            onChange={(e) => onCheckboxChange(e.target.checked)}
          />
          <span>¿Posees el Certificado de Residencia Canaria para viajes?</span>
        </label>
      </div>
      <div className="form-group">
        <label htmlFor="empadronamiento">Lugar de Empadronamiento</label>
        <input id="empadronamiento" type="text" name="empadronamiento" value={formData.empadronamiento} onChange={onChange} required />
      </div>
    </div>
  );
}
