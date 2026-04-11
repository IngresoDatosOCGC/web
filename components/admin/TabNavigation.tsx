"use client";

import React from 'react';

export type TabType = 'dashboard' | 'scores' | 'categories' | 'roles' | 'sections' | 'personal' | 'calendar' | 'logs' | 'requests';

interface TabNavigationProps {
  activeTab: TabType | null;
  setActiveTab: (tab: TabType) => void;
  isMaster: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TabNavigation({ activeTab, setActiveTab, isMaster, isExpanded, onToggle }: TabNavigationProps) {
  return (
    <aside className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="sidebar-toggle-btn" onClick={onToggle}>
        {isExpanded ? '◀' : '▶'}
      </button>

      <div className="sidebar-group">
        <label>{isExpanded ? 'General' : 'GEN'}</label>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={activeTab === 'dashboard' ? 'active' : ''}
          title="Dashboard"
        >
          <span className="sidebar-icon">📊</span>
          {isExpanded && <span className="sidebar-text">Dashboard</span>}
        </button>
        {isMaster && (
          <button 
            onClick={() => setActiveTab('personal')} 
            className={activeTab === 'personal' ? 'active' : ''}
            title="Gestión de Miembros"
          >
            <span className="sidebar-icon">👥</span>
            {isExpanded && <span className="sidebar-text">Gestión de Miembros</span>}
          </button>
        )}
        {isMaster && (
          <button 
            onClick={() => setActiveTab('requests')} 
            className={activeTab === 'requests' ? 'active' : ''}
            title="Solicitudes"
          >
            <span className="sidebar-icon">📩</span>
            {isExpanded && <span className="sidebar-text">Solicitudes</span>}
          </button>
        )}
      </div>

      <div className="sidebar-group">
        <label>{isExpanded ? 'Archivo Musical' : 'ARC'}</label>
        <button 
          onClick={() => setActiveTab('scores')} 
          className={activeTab === 'scores' ? 'active' : ''}
          title="Partituras"
        >
          <span className="sidebar-icon">🎼</span>
          {isExpanded && <span className="sidebar-text">Partituras y Docs</span>}
        </button>
        <button 
          onClick={() => setActiveTab('roles')} 
          className={activeTab === 'roles' ? 'active' : ''}
          title="Diccionario"
        >
          <span className="sidebar-icon">🏷️</span>
          {isExpanded && <span className="sidebar-text">Diccionario Técnico</span>}
        </button>
        {isMaster && (
          <button 
            onClick={() => setActiveTab('sections')} 
            className={activeTab === 'sections' ? 'active' : ''}
            title="Estructuras"
          >
            <span className="sidebar-icon">🎺</span>
            {isExpanded && <span className="sidebar-text">Secciones y Grupos</span>}
          </button>
        )}
        <button 
          onClick={() => setActiveTab('categories')} 
          className={activeTab === 'categories' ? 'active' : ''}
          title="Programas"
        >
          <span className="sidebar-icon">📂</span>
          {isExpanded && <span className="sidebar-text">Programas / Conciertos</span>}
        </button>
        <button 
          onClick={() => setActiveTab('calendar')} 
          className={activeTab === 'calendar' ? 'active' : ''}
          title="Agenda"
        >
          <span className="sidebar-icon">📅</span>
          {isExpanded && <span className="sidebar-text">Agenda y Ensayos</span>}
        </button>
        {isMaster && (
          <button 
            onClick={() => setActiveTab('logs')} 
            className={activeTab === 'logs' ? 'active' : ''}
            title="Auditoría"
          >
            <span className="sidebar-icon">📜</span>
            {isExpanded && <span className="sidebar-text">Registros</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
