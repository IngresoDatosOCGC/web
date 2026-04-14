'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
          <h1 style={{ color: '#ef4444', margin: '0 0 16px 0', fontSize: '2rem' }}>⚠️ Algo salió mal</h1>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            Ha ocurrido un error inesperado de software en nuestra plataforma. Nuestro equipo técnico ha sido notificado.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{ padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
            >
              Intentar de nuevo
            </button>
            <Link 
              href="/"
              style={{ padding: '12px 24px', background: '#e2e8f0', color: '#0f172a', textDecoration: 'none', borderRadius: '8px', fontWeight: 500, display: 'inline-block' }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
