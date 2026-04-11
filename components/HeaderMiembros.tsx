"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useSupabaseUser } from '@/lib/supabase-auth-context';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import '@/css/miembros.css';

export default function HeaderMiembros() {
  const { user, signOut } = useSupabaseUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // En Supabase el metadata suele estar en user_metadata
  const isAdmin = !!user?.user_metadata?.isMaster || !!user?.user_metadata?.isArchiver;
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0];

  const navItems = [
    { href: '/miembros/tablon', label: 'Tablón' },
    { href: '/miembros/repositorio', label: 'Repositorio' },
    { href: '/miembros/agenda', label: 'Agenda' },
  ];

  return (
    <header className="header-miembros-v2" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Logo */}
      <div className="logo">
        <Link href="/" aria-label="Ir al sitio público">
          <img src="/assets/images/logo_ocgc.png" alt="OCGC" />
        </Link>
      </div>

      {/* Navigation (Desktop) */}
      <nav className="miembros-nav-bar hide-mobile" aria-label="Navegación de miembros">
        <ul className="miembros-menu">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`miembros-link ${pathname === href ? 'active' : ''}`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link
                href="/miembros/gestion"
                className={`miembros-link highlight-admin ${pathname.startsWith('/miembros/gestion') ? 'active' : ''}`}
              >
                Gestión
              </Link>
            </li>
          )}

          {/* User area */}
          <li className="miembros-user-area" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {firstName && (
              <span className="miembros-hola">Hola, {firstName}</span>
            )}
            <button 
              onClick={() => signOut()}
              className="btn-logout-icon"
              title="Cerrar sesión"
              style={{ background: 'none', border: 'none', color: 'var(--clr-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={20} />
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn show-mobile-only"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menú"
        style={{ background: 'none', border: 'none', color: '#fff' }}
      >
        {mobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Drawer Lateral Miembros */}
      <div className={`mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
          <nav className="mobile-drawer-nav">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className="mobile-drawer-link" onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/miembros/gestion" className="mobile-drawer-link" style={{ color: 'var(--clr-gold)' }} onClick={() => setMobileOpen(false)}>
                Panel de Gestión
              </Link>
            )}
            
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{firstName}</span>
              </div>
              <button 
                onClick={() => { signOut(); setMobileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-gold)', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: 0 }}
              >
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
