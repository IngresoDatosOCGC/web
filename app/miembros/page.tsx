import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MiembrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const userRoles = (user.user_metadata?.roles as string[]) || [];
  const isMaster = !!user.user_metadata?.isMaster;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-navy)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Panel de Miembros
          </h1>
          <p style={{ color: 'var(--clr-navy-md)' }}>Orquesta Comunitaria de Gran Canaria</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--clr-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {user.user_metadata?.full_name?.[0] || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600 }}>{user.user_metadata?.full_name || 'Miembro'}</span>
            <Link href="/api/auth/sign-out" style={{ fontSize: '0.8rem', color: 'var(--clr-error)' }}>Cerrar sesión</Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <section className="card" style={{ padding: 'var(--sp-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Mis Permisos
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {userRoles.length > 0 ? (
              userRoles.map(role => (
                <li key={role} style={{ marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', background: 'var(--clr-ivory)', borderRadius: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--clr-success)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Instrumento: <strong>{role}</strong></span>
                </li>
              ))
            ) : (
              <li style={{ color: 'var(--clr-navy-md)', fontStyle: 'italic' }}>No tienes secciones asignadas actualmente.</li>
            )}
            {isMaster && (
              <li style={{ marginTop: 'var(--sp-4)', padding: '1rem', background: 'linear-gradient(135deg, #1a2b4b, #2a3b5b)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>👑</span>
                <div>
                  <div style={{ fontWeight: 700 }}>Administrador Master</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Acceso total a gestión</div>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="card" style={{ padding: 'var(--sp-8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--clr-navy)', color: 'white', border: 'none' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-gold)', marginBottom: 'var(--sp-4)' }}>Acceso Rápido</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <Link href="/miembros/tablon" className="btn btn-primary" style={{ background: 'var(--clr-gold)', color: 'var(--clr-navy)' }}>
              Ir al Tablón de Anuncios
            </Link>
            <Link href="/miembros/repositorio" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              Ver Repertorio Digital
            </Link>
          </div>
        </section>
      </div>

      <section 
        className="card" 
        style={{ 
          marginTop: "3rem", 
          padding: 'var(--sp-8)', 
          background: 'var(--clr-navy-lt)', 
          border: 'none' 
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-navy)', marginBottom: 'var(--sp-4)' }}>Bienvenido a la nueva plataforma</h2>
        <p style={{ lineHeight: '1.6' }}>
          Hemos completado la migración a nuestra nueva infraestructura. Ahora puedes gestionar tus partituras y asistencias de forma más rápida y segura. 
          Si notas algún error, contacta con el archivero de tu sección.
        </p>
      </section>
    </div>
  );
}
