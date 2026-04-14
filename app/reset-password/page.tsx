'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Al llegar con un link de recuperación, Supabase inicia una sesión temporal
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        setError('El enlace de recuperación ha caducado o no se proporcionó. Por favor, solicita uno nuevo.');
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Tras unos segundos, redirigimos limpiamente
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);

    } catch (err: any) {
      console.error("Update password error:", err);
      setError(err.message || 'Hubo un problema al actualizar la contraseña');
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
            Nueva Contraseña
          </h1>
          <p style={{ color: 'var(--clr-navy-md)' }}>Escribe una contraseña segura para tu cuenta</p>
        </div>

        {!hasSession && !success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#fff5f5', color: 'var(--clr-error)', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid #feb2b2', marginBottom: '1.5rem' }}>
              {error}
            </div>
            <Link href="/forgot-password" style={{ display: 'inline-block', padding: '12px 24px', background: '#0f172a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 500 }}>
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '1rem', backgroundColor: '#e6fffa', color: '#047481', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #b2f5ea' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>¡Contraseña actualizada!</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Serás redirigido al inicio de sesión...</p>
            </div>
            <Link href="/sign-in" className="btn btn-outline" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Ir al Inicio de Sesión manualmente
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>Nueva Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                style={{
                  padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--clr-border)',
                  fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--clr-gold)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="confirmPassword" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>Repite la Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
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
              {loading ? 'Procesando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
