'use client';
// ── JoinModal — Únete Page ──
// Modal form that handles musician registration requests.

import React, { useState } from 'react';
import type { Group } from './types';

interface Props {
  group: Group;
  onClose: () => void;
}

export default function JoinModal({ group: g, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [showOther, setShowOther] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    let selectedInstrument = formData.get('instrument')?.toString() || g.name;
    const otherVal = formData.get('instrument_other')?.toString();
    if ((selectedInstrument.includes('Otro') || selectedInstrument === 'otro') && otherVal) {
      selectedInstrument = otherVal;
    }

    const data = {
      name: `${formData.get('first_name')} ${formData.get('last_name')}`,
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: `${formData.get('phone_prefix')} ${formData.get('phone')}`,
      experience: formData.get('experience'),
      birthDate: formData.get('birthDate'),
      isla: formData.get('isla'),
      hasCertificate: formData.get('hasCertificate') === 'on',
      group: g.name,
      instrument: selectedInstrument,
      fax_number: formData.get('fax_number'),
    };

    try {
      const res = await fetch('/api/unete', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      let resData;
      try { resData = await res.json(); } catch { resData = { error: 'Respuesta inesperada del servidor.' }; }
      if (res.ok) {
        setStatus({ success: true, msg: `¡Solicitud para ${g.name} enviada con éxito!` });
      } else {
        setStatus({ success: false, msg: resData.error || `Error al enviar (Código: ${res.status})` });
      }
    } catch {
      setStatus({ success: false, msg: 'Error de conexión o fallo del servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(13,27,42,0.8)', backdropFilter: 'blur(6px)', zIndex: 2000, alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="form-modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <button className="close-modal" onClick={() => { onClose(); setStatus(null); }} aria-label="Cerrar modal" style={{ zIndex: 10 }}>✕</button>

        <div className="modal-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-10)' }}>
          {status?.success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--clr-success-lt)', color: 'var(--clr-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>✓</div>
              <h3 style={{ color: 'var(--clr-navy)', marginBottom: '1rem' }}>{status.msg}</h3>
              <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>
                Hemos recibido tu interés para entrar en {g.name}. Nuestro equipo revisará tu perfil y te contactaremos lo antes posible.
              </p>
              <button onClick={() => { onClose(); setStatus(null); }} className="btn btn-primary" style={{ width: '100%', maxWidth: '200px' }}>
                Entendido
              </button>
            </div>
          ) : (
            <>
              <h3 id="modal-title">Inscripción: {g.name}</h3>
              {status && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                  {status.msg}
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement | HTMLSelectElement;
                  if (target.name === 'instrument') setShowOther(target.value.includes('Otro'));
                }}
              >
                {/* Honeypot anti-spam */}
                <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true">
                  <input type="text" name="fax_number" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label htmlFor="fi-name" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Nombre *</label>
                    <input id="fi-name" name="first_name" placeholder="Ej: Juan" required className="form-control" />
                  </div>
                  <div>
                    <label htmlFor="fi-last" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Apellidos *</label>
                    <input id="fi-last" name="last_name" placeholder="Apellido(s)" required className="form-control" />
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <label htmlFor="fi-instr" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Instrumento / Voz *</label>
                  {g.formExtra || (
                    <input id="fi-instr" name="instrument" placeholder="Tu instrumento" required className="form-control" />
                  )}
                  {showOther && (
                    <input name="instrument_other" placeholder="Especifica tu instrumento..." required className="form-control" style={{ marginTop: '-0.5rem' }} />
                  )}
                </div>

                <div className="form-grid-2">
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <label htmlFor="fi-email" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Email *</label>
                    <input id="fi-email" name="email" type="email" placeholder="tu@email.com" required className="form-control" />
                  </div>
                  <div>
                    <label htmlFor="fi-tel" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Teléfono *</label>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <select name="phone_prefix" className="form-control" style={{ width: '90px', paddingInline: '0.4rem', borderRadius: '8px 0 0 8px', borderRight: 'none', background: '#f8f9fa', fontSize: '13px' }}>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input id="fi-tel" name="phone" type="tel" placeholder="600 000 000" required className="form-control" style={{ borderRadius: '0 8px 8px 0', flex: 1 }} />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label htmlFor="fi-dob" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Fecha de Nacimiento *</label>
                    <input id="fi-dob" name="birthDate" type="date" required className="form-control" />
                  </div>
                  <div>
                    <label htmlFor="fi-isla" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Isla de Residencia *</label>
                    <select id="fi-isla" name="isla" required className="form-control" defaultValue="Gran Canaria">
                      <option value="" disabled>-- Elige Isla --</option>
                      {['Gran Canaria', 'Tenerife', 'Lanzarote', 'Fuerteventura', 'La Palma', 'La Gomera', 'El Hierro', 'La Graciosa', 'Fuera de Islas'].map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--clr-navy-mid)', cursor: 'pointer' }}>
                    <input type="checkbox" name="hasCertificate" style={{ width: '18px', height: '18px' }} />
                    Tengo Certificado de Residente para viajes.
                  </label>
                </div>

                <label htmlFor="fi-exp" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--clr-navy-mid)' }}>Experiencia musical (Opcional)</label>
                <textarea id="fi-exp" name="experience" placeholder="Cuéntanos un poco sobre tu trayectoria musical..." rows={3} className="form-control" />

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--sp-2)' }} disabled={loading}>
                  {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
