import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
        <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '3rem', fontWeight: 800 }}>404</h1>
        <h2 style={{ color: '#475569', margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 600 }}>Página no encontrada</h2>
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
          Lo sentimos, no hemos podido encontrar la partitura o sección que estás buscando. Puede que el enlace esté roto o la página haya sido movida.
        </p>
        <Link 
          href="/"
          style={{ display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, var(--clr-navy, #0f172a), #2c3e50)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 500, transition: 'opacity 0.2s' }}
        >
          Regresar a Inicio
        </Link>
      </div>
    </div>
  );
}
