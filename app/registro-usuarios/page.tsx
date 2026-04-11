"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/css/onboarding.css';
import { FormData } from '@/components/registro/types';
import Step1Personal from '@/components/registro/Step1Personal';
import Step2Contacto from '@/components/registro/Step2Contacto';
import Step3Artistico from '@/components/registro/Step3Artistico';
import Step4Estudios from '@/components/registro/Step4Estudios';
import Step5Credenciales from '@/components/registro/Step5Credenciales';

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconLock = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary)" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const INITIAL_FORM: FormData = {
  firstName: '', surname: '', dni: '', dob: '',
  phone: '', email: '', isla: '', municipio: '', empadronamiento: '',
  hasCertificate: false,
  agrupacion: '', instrument: '',
  agrupacion2: '', instrument2: '',
  agrupacion3: '', instrument3: '',
  trabajo: '', estudios: '',
  username: '', password: '',
};

export default function PaginaRegistroSecreta() {
  const [step, setStep] = useState(0);
  const [inviteToken, setInviteToken] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [dbAgrupaciones, setDbAgrupaciones] = useState<string[]>([]);
  const [dbSecciones, setDbSecciones] = useState<string[]>([]);

  // Load catalogs
  useEffect(() => {
    fetch('/api/agrupaciones?public=true')
      .then(r => r.json())
      .then(data => setDbAgrupaciones(Array.isArray(data) ? data.map((d: any) => d.agrupacion) : []))
      .catch(console.error);

    fetch('/api/roles')
      .then(r => r.json())
      .then(data => {
        const flat = Object.values(data).flat()
          .filter((s: any) => s.isVisible !== false)
          .map((s: any) => s.name);
        setDbSecciones(flat);
      })
      .catch(console.error);
  }, []);

  // Auto-validate invite code from URL
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return;
    setInviteToken(code);
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/validate-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (res.ok) {
          applyInviteData(data);
        } else {
          setStatus({ success: false, msg: data.error || 'Código de invitación no válido.' });
        }
      } catch {
        setStatus({ success: false, msg: 'Error de conexión al validar código.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyInviteData = (data: any) => {
    setStep(1);
    setFormData(prev => ({
      ...prev,
      firstName: data.name ?? prev.firstName,
      surname: data.surname ?? prev.surname,
      email: data.email ?? prev.email,
      phone: data.phone ?? prev.phone,
      dob: data.birthDate ?? prev.dob,
      isla: data.isla ?? prev.isla,
      hasCertificate: !!data.hasCertificate,
      agrupacion: data.agrupacion ?? '',
      instrument: data.seccion ?? '',
      agrupacion2: data.agrupacion2 ?? '',
      instrument2: data.seccion2 ?? '',
      agrupacion3: data.agrupacion3 ?? '',
      instrument3: data.seccion3 ?? '',
    }));
    if (data.email) setConfirmEmail(data.email);
  };

  const validateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteToken }),
      });
      const data = await res.json();
      if (res.ok) applyInviteData(data);
      else setStatus({ success: false, msg: data.error || 'Código de invitación no válido o expirado.' });
    } catch {
      setStatus({ success: false, msg: 'Error al validar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/register-musician', {
        method: 'POST',
        body: JSON.stringify({ ...formData, inviteCode: inviteToken }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) { setStatus({ success: true, msg: '¡Bienvenido a la familia de la OCGC! Ya puedes acceder al área privada.' }); setStep(6); }
      else setStatus({ success: false, msg: data.error || 'Error en el registro.' });
    } catch {
      setStatus({ success: false, msg: 'Error inesperado del servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = formData.password.length >= 8 && /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password);
  const isEmailValid = formData.email !== '' && formData.email === confirmEmail;
  const isStep5Valid = isEmailValid && isPasswordValid && formData.password === confirmPassword && formData.username !== '';

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <center>
          <img src="/assets/images/logo_ocgc.png" width="80" alt="OCGC Logo" style={{ marginBottom: 'var(--sp-4)' }} />
        </center>
        <h1>Formulario de Alta</h1>
        {step > 0 && step < 6 && <p className="step-indicator">Paso {step} de 5</p>}
        {step === 0 && <p className="step-indicator">Validación de seguridad</p>}

        {status && step < 6 && (
          <div className={`alert ${status.success ? 'alert-success' : 'alert-error'}`} role="alert">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)' }}>
              {status.success ? <IconCheck /> : <IconAlert />}
              {status.msg}
            </div>
          </div>
        )}

        {step === 6 ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-6) 0' }}>
            <div style={{ width: 64, height: 64, background: 'var(--clr-success)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-6)' }}>
              <IconCheck />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-navy)', marginBottom: 'var(--sp-3)' }}>¡Músico Registrado!</h2>
            <p className="help-text" style={{ marginBottom: 'var(--sp-8)' }}>{status?.msg}</p>
            <Link href="/sign-in" className="btn btn-primary" style={{ display: 'inline-flex', padding: 'var(--sp-4) var(--sp-8)' }}>Iniciar Sesión</Link>
          </div>
        ) : (
          <div className="onboarding-form">
            {/* Step 0: Invite Code */}
            {step === 0 && (
              <form onSubmit={validateInvitation} style={{ textAlign: 'center' }}>
                <div style={{ margin: 'var(--sp-8) 0', display: 'flex', justifyContent: 'center' }}>
                  <IconLock />
                </div>
                <h3>Acceso Restringido</h3>
                <p className="help-text" style={{ marginBottom: 'var(--sp-8)' }}>
                  Por favor, introduce el código de invitación nominativo facilitado por los coordinadores.
                </p>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    placeholder="Escribir código..."
                    required
                    style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.1rem', fontWeight: 'bold' }}
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="btn-onboarding-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Validando...' : 'Verificar Código'}
                </button>
              </form>
            )}

            {/* Steps 1–5 */}
            {step > 0 && (
              <form onSubmit={handleSubmit}>
                {step === 1 && <Step1Personal formData={formData} onChange={handleChange} />}
                {step === 2 && <Step2Contacto formData={formData} onChange={handleChange} onCheckboxChange={(v) => setFormData(p => ({ ...p, hasCertificate: v }))} />}
                {step === 3 && <Step3Artistico formData={formData} onChange={handleChange} agrupaciones={dbAgrupaciones} secciones={dbSecciones} />}
                {step === 4 && <Step4Estudios formData={formData} onChange={handleChange} />}
                {step === 5 && (
                  <Step5Credenciales
                    formData={formData} onChange={handleChange}
                    confirmEmail={confirmEmail} onConfirmEmailChange={setConfirmEmail}
                    confirmPassword={confirmPassword} onConfirmPasswordChange={setConfirmPassword}
                  />
                )}

                <div className="form-actions">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)} className="btn-onboarding-secondary" disabled={loading}>
                      Atrás
                    </button>
                  )}
                  <button type="submit" className="btn-onboarding-primary" disabled={loading || (step === 5 && !isStep5Valid)}>
                    {step === 5 ? (loading ? 'Creando ficha...' : 'Finalizar Alta') : 'Siguiente'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
