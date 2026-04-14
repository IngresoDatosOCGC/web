'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const supabase = useMemo(() => createClient(), []);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Resolver identificador a Email (por si pusieron el username)
      let finalEmail = identifier;
      
      const res = await fetch('/api/auth/resolve-identifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        finalEmail = data.email;
      }

      // 2. Intentar login en Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (signInError) throw signInError;

      router.push('/miembros/tablon');
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      // Ocultamos si el error es de Supabase para no dar pistas de qué falló exactamente (seguridad)
      setError('Credenciales incorrectas. Revisa tu email/usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'var(--clr-light)',
      backgroundImage: 'radial-gradient(circle at 20% 20%, var(--clr-primary-lt) 0%, transparent 25%), radial-gradient(circle at 80% 80%, #d0ebff 0%, transparent 25%)',
      padding: 'var(--sp-4)'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '2.5rem', 
        boxShadow: '0 20px 48px rgba(0,0,0,0.08)',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>
            Bienvenido
          </h1>
          <p style={{ color: 'var(--clr-navy-md)' }}>Portal de Miembros OCGC</p>
        </div>

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="identifier" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>Email o Nombre de Usuario</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ej: tu@email.com o mi_usuario"
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--clr-border)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--clr-gold)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>Contraseña</label>
              <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--clr-gold)', textDecoration: 'none', fontWeight: 600 }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--clr-border)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--clr-gold)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#fff5f5', 
              color: 'var(--clr-error)', 
              borderRadius: '8px', 
              fontSize: '0.875rem',
              border: '1px solid #feb2b2'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.1s active'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}
