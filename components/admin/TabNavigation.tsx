"use client";

import React from 'react';

export type TabType = 'dashboard' | 'scores' | 'categories' | 'sections' | 'personal' | 'calendar' | 'logs' | 'requests';

interface TabNavigationProps {
  activeTab: TabType | null;
  setActiveTab: (tab: TabType) => void;
  isMaster: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TabNavigation({ activeTab, setActiveTab, isMaster }: Omit<TabNavigationProps, 'isExpanded' | 'onToggle'>) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isShowExpanded = isHovered;

  return (
    <aside 
      className={`admin-sidebar ${isShowExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={() => setActiveTab('dashboard')} 
        className={activeTab === 'dashboard' ? 'active' : ''}
        title="Dashboard"
      >
        <span className="sidebar-icon">📊</span>
        {isShowExpanded && <span className="sidebar-text">Dashboard</span>}
      </button>
      {isMaster && (
        <button 
          onClick={() => setActiveTab('personal')} 
          className={activeTab === 'personal' ? 'active' : ''}
          title="Gestión de Usuarios"
        >
          <span className="sidebar-icon">👥</span>
          {isShowExpanded && <span className="sidebar-text">Gestión de Usuarios</span>}
        </button>
      )}
      {isMaster && (
        <button 
          onClick={() => setActiveTab('requests')} 
          className={activeTab === 'requests' ? 'active' : ''}
          title="Solicitudes"
        >
          <span className="sidebar-icon">📩</span>
          {isShowExpanded && <span className="sidebar-text">Solicitudes</span>}
        </button>
      )}
      <button 
        onClick={() => setActiveTab('scores')} 
        className={activeTab === 'scores' ? 'active' : ''}
        title="Partituras"
      >
        <span className="sidebar-icon">🎼</span>
        {isShowExpanded && <span className="sidebar-text">Partituras / Documentos</span>}
      </button>

      {isMaster && (
        <button 
          onClick={() => setActiveTab('sections')} 
          className={activeTab === 'sections' ? 'active' : ''}
          title="Estructuras"
        >
          <span className="sidebar-icon">🎺</span>
          {isShowExpanded && <span className="sidebar-text">Estructuras y Catálogos</span>}
        </button>
      )}
      <button 
        onClick={() => setActiveTab('categories')} 
        className={activeTab === 'categories' ? 'active' : ''}
        title="Programas"
      >
        <span className="sidebar-icon">📂</span>
        {isShowExpanded && <span className="sidebar-text">Programas / Conciertos</span>}
      </button>
      <button 
        onClick={() => setActiveTab('calendar')} 
        className={activeTab === 'calendar' ? 'active' : ''}
        title="Agenda"
      >
        <span className="sidebar-icon">📅</span>
        {isShowExpanded && <span className="sidebar-text">Agenda</span>}
      </button>
      {isMaster && (
        <button 
          onClick={() => setActiveTab('logs')} 
          className={activeTab === 'logs' ? 'active' : ''}
          title="Auditoría"
        >
          <span className="sidebar-icon">📜</span>
          {isShowExpanded && <span className="sidebar-text">Acciones del Sistema</span>}
        </button>
      )}
    </aside>
  );
}
