"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, Settings, User, ChevronDown, ExternalLink } from 'lucide-react';
import '@/css/miembros.css';

export default function HeaderMiembros() {
  const { user, session, isMaster, isArchiver, isSeller, isSectionLeader, signOut } = useSupabaseAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const isAdmin = isMaster || isArchiver;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const firstName = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleExternalRedirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    const externalUrl = process.env.NEXT_PUBLIC_EXTERNAL_SERVER_URL;

    if (session?.access_token && session?.refresh_token) {
      // WARNING: Tokens are passed in URL fragment. This is visible in browser history.
      // TODO: Migrate to server-to-server token exchange flow.
      const targetUrl = `${externalUrl}/callback#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const navItems = [
    { href: '/miembros/tablon', label: 'Tablón' },
    { href: '/miembros/repositorio', label: 'Repositorio' },
    { href: '/miembros/agenda', label: 'Agenda' },
  ];

  return (
    <header className="header-miembros-v2" style={{ position: 'sticky', top: 0, zIndex: 3000 }}>
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

          {(isAdmin || isSeller) && (
            <li>
              <a href="#" onClick={handleExternalRedirect} className="miembros-link" title="Abrir panel en servidor externo"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                App Butacas <ExternalLink size={12} />
              </a>
            </li>
          )}
          
          {(isSectionLeader || isMaster) && (
            <li>
              <Link href="/miembros/seccion"
                className={`miembros-link highlight-admin ${pathname.startsWith('/miembros/seccion') ? 'active' : ''}`}
                style={{ color: '#bae6fd' }}>
                Mi Sección
              </Link>
            </li>
          )}
          
          {isAdmin && (
            <li>
              <Link href="/miembros/gestion"
                className={`miembros-link highlight-admin ${pathname.startsWith('/miembros/gestion') ? 'active' : ''}`}>
                Gestión
              </Link>
            </li>
          )}

          {/* User avatar button */}
          <li className="miembros-user-area" style={{ position: 'relative' }}>
            {firstName && (
              <button 
                onClick={() => setUserMenuOpen(v => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label={`Menú de usuario: ${firstName}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: userMenuOpen ? 'rgba(71, 138, 201, 0.14)' : 'rgba(71, 138, 201, 0.07)',
                  border: `1px solid ${userMenuOpen ? 'rgba(71, 138, 201, 0.3)' : 'rgba(71, 138, 201, 0.15)'}`,
                  borderRadius: '999px',
                  padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit', color: '#1a2a4b', fontSize: '0.88rem', fontWeight: 600,
                }}
              >
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9a84c, #e8c870)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.68rem', fontWeight: 700, color: '#1a2a4b', flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {initials || <User size={13} />}
                </span>
                <span>{firstName}</span>
                <ChevronDown size={14} style={{ opacity: 0.8, color: '#1a2a4b', transition: 'transform 0.2s ease', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
            )}
            
            {/* Click-away backdrop */}
            {userMenuOpen && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 3999 }} onClick={() => setUserMenuOpen(false)} />
            )}

            {/* Dropdown */}
            <div role="menu" style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'rgba(12, 22, 50, 0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
              minWidth: '230px',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              zIndex: 4000,
              transformOrigin: 'top right',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
              opacity: userMenuOpen ? 1 : 0,
              transform: userMenuOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-6px)',
              pointerEvents: userMenuOpen ? 'all' : 'none',
            }}>
              {/* User info header */}
              <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{fullName}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', marginTop: '2px', lineHeight: 1.4 }}>{user?.email}</p>
              </div>
              
              <Link href="/miembros/perfil" role="menuitem" onClick={() => setUserMenuOpen(false)}
                style={{ padding: '0.8rem 1.1rem', color: 'rgba(255,255,255,0.82)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.65rem', transition: 'background 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <Settings size={15} style={{ opacity: 0.65 }} />
                Ajustes de Perfil
              </Link>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              
              <button role="menuitem" onClick={() => { signOut(); setUserMenuOpen(false); }}
                style={{ padding: '0.8rem 1.1rem', background: 'none', border: 'none', color: '#c9a84c', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'inherit', transition: 'background 0.15s ease', width: '100%' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <LogOut size={15} />
                Cerrar Sesión
              </button>
            </div>
          </li>
        </ul>
      </nav>

      {/* Mobile hamburger */}
      <button className="mobile-menu-btn show-mobile-only" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menú"
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
        {mobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
          <nav className="mobile-drawer-nav">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className="mobile-drawer-link" onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link href="/miembros/gestion" className="mobile-drawer-link" style={{ color: 'var(--clr-gold)' }} onClick={() => setMobileOpen(false)}>
                  Panel de Gestión
                </Link>
                <a href="#" onClick={(e) => { handleExternalRedirect(e); setMobileOpen(false); }} className="mobile-drawer-link" style={{ color: '#bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  App Butacas <ExternalLink size={14} />
                </a>
              </>
            )}
            {(isSectionLeader || isMaster) && (
              <Link href="/miembros/seccion" className="mobile-drawer-link" style={{ color: '#bae6fd' }} onClick={() => setMobileOpen(false)}>
                Mi Sección
              </Link>
            )}
            
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #e8c870)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#1a2a4b', flexShrink: 0 }}>
                  {initials || <User size={16} />}
                </span>
                <div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{fullName}</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem' }}>{user?.email}</p>
                </div>
              </div>
              <Link href="/miembros/perfil" onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', textDecoration: 'none', fontSize: '1rem' }}>
                <Settings size={17} /> Ajustes de Perfil
              </Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-gold)', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
