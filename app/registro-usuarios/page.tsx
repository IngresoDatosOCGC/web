"use client";

import { useState } from 'react';

const AGRUPACIONES = [
  "Orquesta", "Coro", "Ensemble Flautas", "Ensemble Metales",
  "Ensemble Chelos", "Big Band"
];

const SECCIONES = [
  "Dirección artística y musical (OCGC y Orquesta)",
  "Dirección musical (Ensemble Flautas)",
  "Dirección musical (Ensemble Metales)",
  "Dirección musical (Ensemble Violonchelos)",
  "Dirección musical (Coro)",
  "Violín primero", "Violín segundo", "Viola", "Violonchelo", "Contrabajo",
  "Flauta", "Oboe", "Clarinete", "Fagot",
  "Trompeta", "Trompa", "Trombón", "Tuba", "Bombardino",
  "Arpa", "Piano", "Órgano", "Percusión",
  "Alto (coro)", "Soprano (coro)", "Bajo (coro)", "Tenor (coro)"
];

export default function PaginaRegistroSecreta() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', surname: '', dni: '', dob: '',
    phone: '', email: '', isla: '', municipio: '', empadronamiento: '',
    agrupacion: '', instrument: '',
    agrupacion2: '', instrument2: '',
    agrupacion3: '', instrument3: '',
    trabajo: '', estudios: '',
    username: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      nextStep();
      return;
    }
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/register-musician", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus({ success: true, msg: "¡Bienvenido a la orquesta! Tu ficha se ha creado correctamente. Ya puedes iniciar sesión." });
        setStep(6);
      } else {
        let mensajeError = "Error en el registro";
        const errorStr = String(data.error || "").toLowerCase();
        
        if (errorStr.includes("email_address_exists") || (errorStr.includes("identifier") && errorStr.includes("email"))) {
          mensajeError = "Este correo electrónico ya está registrado.";
        } else if (errorStr.includes("username_exists") || (errorStr.includes("identifier") && errorStr.includes("username"))) {
          mensajeError = "Este nombre de usuario ya está en uso.";
        } else if (errorStr.includes("password_too_short")) {
          mensajeError = "La contraseña es demasiado corta (mínimo 8 caracteres).";
        } else if (errorStr.includes("dni") && errorStr.includes("unique")) {
          mensajeError = "Este DNI ya está registrado en nuestra base de datos.";
        } else {
          mensajeError = data.error || mensajeError;
        }
        
        setStatus({ success: false, msg: mensajeError });
      }
    } catch (err) {
      setStatus({ success: false, msg: "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <center><img src="/assets/images/logo_ocgc.png" width="100" alt="OCGC" style={{marginBottom: '1rem'}} /></center>
        <h1>Formulario de Alta: Miembros</h1>
        {step < 6 && <p className="step-indicator">Paso {step} de 5</p>}
        <hr />

        {status && step < 6 && (
          <div className={`alert ${status.success ? 'alert-success' : 'alert-error'}`}>
            {status.msg}
          </div>
        )}

        {step === 6 ? (
           <div style={{ textAlign: 'center', padding: '2rem 0' }}>
             <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>¡Registro Completado!</h2>
             <p>{status?.msg}</p>
             <a href="/sign-in" className="btn-onboarding" style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '1rem 2rem' }}>Ir a Iniciar Sesión</a>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="onboarding-form">
            
            {step === 1 && (
              <div className="step-content">
                <h3>Información Personal</h3>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Apellidos:</label>
                  <input type="text" name="surname" value={formData.surname} onChange={handleChange} required />
                </div>
                <div className="form-group-row">
                  <div>
                    <label>DNI / NIE:</label>
                    <input type="text" name="dni" value={formData.dni} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Fecha de Nacimiento:</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <h3>Contacto y Residencia</h3>
                <div className="form-group-row">
                  <div>
                    <label>Teléfono Múltiple/Móvil:</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Correo Electrónico:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group-row">
                  <div>
                    <label>Isla de Residencia:</label>
                    <select name="isla" value={formData.isla} onChange={handleChange} required>
                      <option value="">-- Seleccionar --</option>
                      <option value="Gran Canaria">Gran Canaria</option>
                      <option value="Tenerife">Tenerife</option>
                      <option value="Lanzarote">Lanzarote</option>
                      <option value="Fuerteventura">Fuerteventura</option>
                      <option value="La Palma">La Palma</option>
                      <option value="La Gomera">La Gomera</option>
                      <option value="El Hierro">El Hierro</option>
                      <option value="La Graciosa">La Graciosa</option>
                    </select>
                  </div>
                  <div>
                    <label>Municipio de Residencia:</label>
                    <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Lugar de Empadronamiento:</label>
                  <input type="text" name="empadronamiento" value={formData.empadronamiento} onChange={handleChange} required />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <h3>Perfil Artístico</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
                  Selecciona la agrupación y el instrumento/voz principal. Puedes añadir hasta 2 agrupaciones más si perteneces a varias.
                </p>
                
                {/* Agrupación 1 */}
                <div className="form-group-row">
                  <div>
                    <label>Agrupación Principal:</label>
                    <select name="agrupacion" value={formData.agrupacion} onChange={handleChange} required>
                      <option value="">-- Selecciona --</option>
                      {AGRUPACIONES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Sección / Instrumento Principal:</label>
                    <select name="instrument" value={formData.instrument} onChange={handleChange} required>
                      <option value="">-- Elige --</option>
                      {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <hr style={{ margin: '2rem 0', opacity: 0.2 }} />

                {/* Agrupación 2 (Opcional) */}
                <div className="form-group-row">
                  <div>
                    <label>Segunda Agrupación (Opcional):</label>
                    <select name="agrupacion2" value={formData.agrupacion2} onChange={handleChange}>
                      <option value="">-- Ninguna --</option>
                      {AGRUPACIONES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Segunda Sección (Opcional):</label>
                    <select name="instrument2" value={formData.instrument2} onChange={handleChange}>
                      <option value="">-- Ninguna --</option>
                      {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <hr style={{ margin: '2rem 0', opacity: 0.2 }} />

                {/* Agrupación 3 (Opcional) */}
                <div className="form-group-row">
                  <div>
                    <label>Tercera Agrupación (Opcional):</label>
                    <select name="agrupacion3" value={formData.agrupacion3} onChange={handleChange}>
                      <option value="">-- Ninguna --</option>
                      {AGRUPACIONES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Tercera Sección (Opcional):</label>
                    <select name="instrument3" value={formData.instrument3} onChange={handleChange}>
                      <option value="">-- Ninguna --</option>
                      {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step-content">
                <h3>Estudios y Ocupación</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
                   No tienen por qué ser estudios o trabajos musicales.
                </p>
                <div className="form-group">
                  <label>Trabajo Actual / Ocupación:</label>
                  <input type="text" name="trabajo" placeholder="Ej: Estudiante, Ingeniero, Administrativo..." value={formData.trabajo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Estudios Realizados:</label>
                  <textarea name="estudios" rows={3} value={formData.estudios} onChange={(e) => setFormData(prev => ({...prev, estudios: e.target.value}))} placeholder="Ej: Grado en..., Bachillerato, Master..." required style={{ width: '100%', padding: '0.9rem', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'inherit' }}></textarea>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="step-content">
                <h3>Crear Cuenta Digital</h3>
                <p className="help-text" style={{ marginBottom: '1.5rem', marginTop: 0 }}>Estos datos te servirán para iniciar sesión en el Archivo Digital y descargar pdfs.</p>
                <div className="form-group-row" style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <label>Usuario (nickname):</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Contraseña:</label>
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                
                {/* Visualizador de fortaleza de contraseña compatible con Clerk */}
                <div className="password-requirements" style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Requisitos de seguridad:</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    <li style={{ fontSize: '0.8rem', color: formData.password.length >= 8 ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {formData.password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                    </li>
                    <li style={{ fontSize: '0.8rem', color: /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? '✓' : '○'} Letras y números
                    </li>
                  </ul>
                  {formData.password && !(formData.password.length >= 8 && /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password)) && (
                    <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '0.8rem', fontStyle: 'italic' }}>
                      La contraseña es demasiado débil.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary" disabled={loading}>Atrás</button>
              )}
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || (step === 5 && !(formData.password.length >= 8 && /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password)))}
              >
                {step === 5 ? (loading ? "Guardando ficha..." : "Finalizar Registro") : "Siguiente"}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .onboarding-page { background: #f0f2f5; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 2rem; font-family: 'Inter', sans-serif; }
        .onboarding-card { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); width: 100%; max-width: 650px; }
        h1 { font-size: 1.8rem; margin: 0; text-align: center; color: #2c3e50; }
        h3 { font-size: 1.3rem; margin-bottom: 1.5rem; color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 0.5rem; }
        .step-indicator { text-align: center; font-size: 0.9rem; color: #95a5a6; margin-top: 0.5rem; margin-bottom: 1.5rem; font-weight: 600; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
        label { display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.9rem; color: #333; }
        input[type="text"], input[type="email"], input[type="password"], input[type="date"], input[type="tel"], select { width: 100%; padding: 0.9rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #478AC9; }
        .help-text { font-size: 0.85rem; color: #7f8c8d; }
        
        .form-actions { display: flex; gap: 1rem; margin-top: 2.5rem; }
        .btn-secondary { flex: 1; padding: 1.2rem; background: #ecf0f1; color: #7f8c8d; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-secondary:hover { background: #bdc3c7; color: #2c3e50; }
        .btn-primary { flex: 2; padding: 1.2rem; background: #478AC9; color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-primary:hover { background: #357ABD; transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; }
        .alert-success { background: #d4edda; color: #155724; }
        .alert-error { background: #f8d7da; color: #721c24; }
        
        /* Mobile responsivenes */
        @media (max-width: 600px) {
           .form-group-row { grid-template-columns: 1fr; gap: 1rem; }
           .onboarding-card { padding: 2rem; }
        }
      `}</style>
    </div>
  );
}
