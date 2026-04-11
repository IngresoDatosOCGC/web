"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/css/onboarding.css'; // Reutilizamos estilos

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/miembros/tablon');
      router.refresh();
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <center>
          <img src="/assets/images/logo_ocgc.png" width="80" alt="OCGC Logo" style={{ marginBottom: '2rem' }} />
        </center>
        <h1>Acceso Miembros</h1>
        <p className="step-indicator">Bienvenido de nuevo</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {error === 'Invalid login credentials' ? 'Credenciales incorrectas' : error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="onboarding-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-onboarding-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          ¿Aún no tienes cuenta? <br />
          <Link href="/unete" style={{ color: 'var(--clr-gold)', fontWeight: 600 }}>Solicita unirte aquí</Link>
        </div>
      </div>
    </div>
  );
}
