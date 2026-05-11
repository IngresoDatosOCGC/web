'use client';

import { useState, useMemo, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--clr-light)' }}>
        <p>Cargando sesión...</p>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const supabase = useMemo(() => createClient(), []);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalEmail = identifier.includes('@') ? identifier.toLowerCase().trim() : identifier.trim();

      if (!identifier.includes('@')) {
        const res = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim() }),
        });

        if (res.ok) {
          const data = await res.json();
          finalEmail = data.email;
        }
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (signInError) throw signInError;

      const next = searchParams.get('next') || '/miembros/tablon';
      
      // Usamos window.location.href para permitir redirecciones a dominios externos
      window.location.href = next;
    } catch (err: any) {
      console.error("Login error:", err);
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

        {error && (
          <div style={{ 
            backgroundColor: '#fff1f2', 
            color: '#e11d48', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            border: '1px solid #ffe4e6',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            {error}
          </div>
        )}

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
              onFocus={(e) => e.target.style.borderColor = 'var(--clr-navy)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>Contraseña</label>
              <Link href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--clr-navy-md)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
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
              onFocus={(e) => e.target.style.borderColor = 'var(--clr-navy)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
            />
          </div>

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

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--clr-border)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-navy-md)', fontWeight: 500 }}>O continuar con</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--clr-border)' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ 
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback` }
            })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--clr-border)',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--clr-navy)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <button
            onClick={() => supabase.auth.signInWithOAuth({ 
              provider: 'github',
              options: { redirectTo: `${window.location.origin}/auth/callback` }
            })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--clr-border)',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--clr-navy)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
            </svg>
            GitHub
          </button>
        </div>


      </div>
    </div>
  );
}
