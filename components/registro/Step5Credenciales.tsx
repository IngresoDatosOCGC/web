// ── Step5Credenciales — Registro Step 5 ──
import { FormData, ChangeHandler } from './types';

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

interface Props {
  formData: FormData;
  onChange: ChangeHandler;
  confirmEmail: string;
  onConfirmEmailChange: (v: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (v: string) => void;
}

export default function Step5Credenciales({
  formData, onChange,
  confirmEmail, onConfirmEmailChange,
  confirmPassword, onConfirmPasswordChange,
}: Props) {
  const passOk = formData.password.length >= 8 && /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password);
  const passMatch = formData.password !== '' && formData.password === confirmPassword;
  const emailMismatch = formData.email !== '' && confirmEmail !== '' && formData.email !== confirmEmail;

  const reqColor = (ok: boolean) => ({ color: ok ? 'var(--clr-success)' : 'var(--clr-danger)' });

  return (
    <div className="step-content">
      <h3>Credenciales de Acceso</h3>
      <p className="help-text" style={{ marginBottom: 'var(--sp-6)' }}>Utiliza un correo activo; lo necesitarás para confirmar tu cuenta digital.</p>

      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={onChange} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="confirmEmail">Confirmar Correo</label>
          <input
            id="confirmEmail"
            type="email"
            value={confirmEmail}
            onChange={(e) => onConfirmEmailChange(e.target.value)}
            required
            autoComplete="off"
            onPaste={(e) => e.preventDefault()}
          />
        </div>
      </div>
      {emailMismatch && (
        <p style={{ color: 'var(--clr-danger)', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-4)' }}>Los correos no coinciden.</p>
      )}

      <div className="form-group">
        <label htmlFor="username">Nombre de Usuario (Alias para perfil / Login alternativo)</label>
        <input id="username" type="text" name="username" value={formData.username} onChange={onChange} required autoComplete="username" />
        <p style={{ fontSize: '0.75rem', color: 'var(--clr-navy-md)', marginTop: '0.25rem' }}>Podrás entrar a la plataforma usando tanto tu email como este nombre de usuario.</p>
      </div>

      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="password">Nueva Contraseña</label>
          <input id="password" type="password" name="password" value={formData.password} onChange={onChange} required autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)} required autoComplete="new-password" />
        </div>
      </div>

      <div className="password-requirements" style={{ padding: 'var(--sp-4)', background: 'var(--clr-light)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--clr-navy)', marginBottom: 'var(--sp-2)' }}>Criterios de seguridad (Clerk):</p>
        <div className="password-requirement-item" style={reqColor(formData.password.length >= 8)}><IconCheck /> Mínimo 8 caracteres</div>
        <div className="password-requirement-item" style={reqColor(passOk)}><IconCheck /> Al menos una letra y un número</div>
        <div className="password-requirement-item" style={reqColor(passMatch)}><IconCheck /> Las contraseñas coinciden</div>
      </div>
    </div>
  );
}
