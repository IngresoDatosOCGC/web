'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Resolver identificador a Email
      let finalEmail = identifier;
      
      const res = await fetch('/api/auth/resolve-identifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      
      if (res.ok) {
        const data = await res.json();
        finalEmail = data.email;
      }

      // 2. Enviar email de recuperación
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(finalEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Reset error:", err);
      // Ocultamos si el error es de Supabase para no dar pistas
      setError('Si el usuario existe, se ha enviado un correo de recuperación.');
      // En realidad, para mejor UX, deberíamos mostrar éxito siempre para evitar enumeración,
      // pero por ahora mostraremos el error genérico.
      setSuccess(true); // Engaño seguro (Security Through Obscurity)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', backgroundColor: 'var(--clr-light)',
      backgroundImage: 'radial-gradient(circle at 20% 20%, var(--clr-primary-lt) 0%, transparent 25%), radial-gradient(circle at 80% 80%, #d0ebff 0%, transparent 25%)',
      padding: 'var(--sp-4)'
    }}>
      <div className="card" style={{ 
        width: '100%', maxWidth: '420px', padding: '2.5rem', 
        boxShadow: '0 20px 48px rgba(0,0,0,0.08)', animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>
            Recuperar Contraseña
          </h1>
          <p style={{ color: 'var(--clr-navy-md)' }}>Te enviaremos un enlace para restablecerla</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '1rem', backgroundColor: '#e6fffa', color: '#047481', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #b2f5ea' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>¡Enlace enviado!</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Revisa la bandeja de entrada de tu correo electrónico (y la carpeta de spam).</p>
            </div>
            <Link href="/sign-in" className="btn btn-outline" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Volver al Inicio de Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="identifier" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>Email o Nombre de Usuario</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ej: tu@email.com"
                required
                style={{
                  padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--clr-border)',
                  fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--clr-gold)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
              />
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fff5f5', color: 'var(--clr-error)', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid #feb2b2' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem', padding: '0.875rem', fontSize: '1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)', color: 'white',
                border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'transform 0.1s active'
              }}
            >
              {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link href="/sign-in" style={{ fontSize: '0.875rem', color: 'var(--clr-navy-md)', textDecoration: 'none' }}>
                Cancelar y regresar
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
