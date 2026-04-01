"use client";

import Link from 'next/link';
import { UserButton, useUser } from "@clerk/nextjs";
import '@/css/miembros.css';

export default function HeaderMiembros() {
  const { user, isLoaded } = useUser();
  const isAdmin = !!user?.publicMetadata?.isMaster || !!user?.publicMetadata?.isArchiver;

  return (
    <header className="header-miembros-v2">
      <div className="logo">
        <Link href="/">
          <img src="/assets/images/logo_ocgc.png" alt="OCGC Logo" style={{ height: '50px' }} />
        </Link>
      </div>

      <nav className="miembros-nav-bar">
        <ul className="miembros-menu">
          <li><Link href="/miembros/tablon" className="miembros-link">TABLÓN</Link></li>
          <li><Link href="/miembros/repositorio" className="miembros-link">REPOSITORIO</Link></li>
          <li><Link href="/miembros/agenda" className="miembros-link">AGENDA</Link></li>
          
          {isAdmin && (
            <li><Link href="/miembros/gestion" className="miembros-link highlight-admin">GESTIÓN</Link></li>
          )}
          <li className="miembros-user-area">
             <span className="miembros-hola">HOLA, {user?.firstName?.toUpperCase()}</span>
             <div className="clerk-btn-wrapper">
               <UserButton appearance={{ elements: { avatarBox: { width: 34, height: 34 }}}} />
             </div>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        .header-miembros-v2 { background: #ffffff; border-bottom: 2px solid #478AC9; padding: 0.8rem 5%; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header-miembros-inner { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; height: 50px; }
        .miembros-logo img { height: 45px; width: auto; }
        .miembros-menu { list-style: none; display: flex; gap: 2.5rem; align-items: center; margin: 0; padding: 0; }
        .miembros-link { text-decoration: none; color: #1a2a4b; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.12rem; transition: 0.3s; }
        .miembros-link:hover { color: #478AC9; }
        .highlight-admin { background: #f82b60; color: white !important; padding: 0.4rem 1.2rem; border-radius: 8px; font-size: 0.75rem; box-shadow: 0 4px 8px rgba(248, 43, 96, 0.2); }
        .miembros-user-area { display: flex; align-items: center; gap: 1rem; border-left: 1px solid #f0f0f0; padding-left: 2rem; margin-top: 2px; }
        .miembros-hola { color: #478AC9; font-weight: 900; font-size: 0.65rem; letter-spacing: 0.05rem; }
      `}</style>
    </header>
  );
}

