"use client";

import '@/css/miembros.css';

export default function MiembrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="members-content-wrapper">
      <main className="members-main-body">
        <div className="container-white-ocgc">
           {children}
        </div>
      </main>

    </div>
  );
}
