"use client";

import React from 'react';

export type TabType = 'dashboard' | 'scores' | 'categories' | 'roles' | 'sections' | 'personal' | 'calendar' | 'logs' | 'requests';

interface TabNavigationProps {
  activeTab: TabType | null;
  setActiveTab: (tab: TabType) => void;
  isMaster: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  /** Vista estrecha: barra lateral como drawer desde la izquierda */
  isMobileViewport?: boolean;
  mobileDrawerOpen?: boolean;
  onMobileDrawerClose?: () => void;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
  isMaster,
  isExpanded,
  onToggle,
  isMobileViewport = false,
  mobileDrawerOpen = false,
  onMobileDrawerClose,
}: TabNavigationProps) {
  const showLabels = isMobileViewport || isExpanded;

  return (
    <>
      {isMobileViewport && mobileDrawerOpen && (
        <button
          type="button"
          className="admin-nav-backdrop"
          aria-label="Cerrar menú de gestión"
          onClick={onMobileDrawerClose}
        />
      )}

      <aside
        id="admin-sidebar-nav"
        className={`admin-sidebar ${isExpanded ? "expanded" : "collapsed"} ${isMobileViewport ? "admin-sidebar-mobile" : ""} ${isMobileViewport && mobileDrawerOpen ? "admin-mobile-drawer-open" : ""}`}
        aria-hidden={isMobileViewport && !mobileDrawerOpen}
      >
        {!isMobileViewport && (
          <button type="button" className="sidebar-toggle-btn" onClick={onToggle} aria-label={isExpanded ? "Contraer menú" : "Expandir menú"}>
            {isExpanded ? "◀" : "▶"}
          </button>
        )}

        {isMobileViewport && (
          <div className="admin-mobile-drawer-header">
            <span className="admin-mobile-drawer-title">Panel de gestión</span>
            <button
              type="button"
              className="admin-mobile-drawer-close"
              onClick={onMobileDrawerClose}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
        )}

        <div className="sidebar-group">
          <label>{showLabels ? "General" : "GEN"}</label>
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? "active" : ""}
            title="Dashboard"
          >
            <span className="sidebar-icon">📊</span>
            {showLabels && <span className="sidebar-text">Dashboard</span>}
          </button>
          {isMaster && (
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={activeTab === "personal" ? "active" : ""}
              title="Gestión de Miembros"
            >
              <span className="sidebar-icon">👥</span>
              {showLabels && <span className="sidebar-text">Gestión de Miembros</span>}
            </button>
          )}
          {isMaster && (
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={activeTab === "requests" ? "active" : ""}
              title="Solicitudes"
            >
              <span className="sidebar-icon">📩</span>
              {showLabels && <span className="sidebar-text">Solicitudes</span>}
            </button>
          )}
        </div>

        <div className="sidebar-group">
          <label>{showLabels ? "Archivo Musical" : "ARC"}</label>
          <button
            type="button"
            onClick={() => setActiveTab("scores")}
            className={activeTab === "scores" ? "active" : ""}
            title="Partituras"
          >
            <span className="sidebar-icon">🎼</span>
            {showLabels && <span className="sidebar-text">Partituras y Docs</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={activeTab === "roles" ? "active" : ""}
            title="Diccionario"
          >
            <span className="sidebar-icon">🏷️</span>
            {showLabels && <span className="sidebar-text">Diccionario Técnico</span>}
          </button>
          {isMaster && (
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={activeTab === "sections" ? "active" : ""}
              title="Estructuras"
            >
              <span className="sidebar-icon">🎺</span>
              {showLabels && <span className="sidebar-text">Secciones y Grupos</span>}
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={activeTab === "categories" ? "active" : ""}
            title="Programas"
          >
            <span className="sidebar-icon">📂</span>
            {showLabels && <span className="sidebar-text">Programas / Conciertos</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={activeTab === "calendar" ? "active" : ""}
            title="Agenda"
          >
            <span className="sidebar-icon">📅</span>
            {showLabels && <span className="sidebar-text">Agenda y Ensayos</span>}
          </button>
          {isMaster && (
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={activeTab === "logs" ? "active" : ""}
              title="Auditoría"
            >
              <span className="sidebar-icon">📜</span>
              {showLabels && <span className="sidebar-text">Registros</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
