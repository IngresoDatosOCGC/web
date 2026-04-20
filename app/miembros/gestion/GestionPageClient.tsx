"use client";

import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation, { TabType } from '@/components/admin/TabNavigation';
import DashboardPanel from '@/components/admin/DashboardPanel';
import ScoresPanel from '@/components/admin/ScoresPanel';
import CategoriesPanel from '@/components/admin/CategoriesPanel';
import SectionsPanel from '@/components/admin/SectionsPanel';
import PersonalPanel from '@/components/admin/PersonalPanel';
import RequestsPanel from '@/components/admin/RequestsPanel';
import CalendarPanel from '@/components/admin/CalendarPanel';
import LogsPanel from '@/components/admin/LogsPanel';
import AdminGuideModal from '@/components/admin/AdminGuideModal';
import { useNotifications } from '@/components/ui/NotificationContext';
import '@/css/miembros.css';

export default function AdminOCGCPartituras() {
  const { user, isLoading: isAuthLoading, isMaster, isArchiver } = useSupabaseAuth();
  const { showToast } = useNotifications();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Data states
  const [scores, setScores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [agrupaciones, setAgrupaciones] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [papeles, setPapeles] = useState<any[]>([]);
  const [tagsDict, setTagsDict] = useState<any>({});
  const [predefinedTags, setPredefinedTags] = useState<string[]>([]);
  
  // Members data (master only)
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);

  const loadedKeys = useRef<Set<string>>(new Set());

  const fetchEndpointsSafely = async (endpoints: Record<string, string>, force = false) => {
    const keysToFetch = force ? Object.keys(endpoints) : Object.keys(endpoints).filter(k => !loadedKeys.current.has(k));
    if (keysToFetch.length === 0) return;
    
    keysToFetch.forEach(k => loadedKeys.current.add(k));
    
    try {
      const resps = await Promise.all(keysToFetch.map(k => fetch(endpoints[k])));
      const data = await Promise.all(resps.map(r => r.json()));
      
      keysToFetch.forEach((k, i) => {
        const d = data[i];
        if (k === 'scores') setScores(Array.isArray(d) ? d : []);
        if (k === 'categories') setCategories(Array.isArray(d) ? d : []);
        if (k === 'agrupaciones') setAgrupaciones(Array.isArray(d) ? d : []);
        if (k === 'secciones') setSecciones(Array.isArray(d) ? d : []);
        if (k === 'papeles') setPapeles(Array.isArray(d) ? d : []);
        if (k === 'roles') {
          const flatTags = d ? Object.values(d).flat().map((t: any) => t.name) : [];
          setPredefinedTags(flatTags);
          setTagsDict(d || {});
        }
        if (k === 'users') setMembers(Array.isArray(d) ? d : []);
        if (k === 'invitations') setInvitations(Array.isArray(d) ? d : []);
        if (k === 'requests') setJoinRequests(Array.isArray(d) ? d : []);
      });
      
      if (force) showToast("✓ Datos actualizados");
    } catch (error) {
      keysToFetch.forEach(k => loadedKeys.current.delete(k));
      showToast("Error al cargar datos", "error");
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/sign-in");
      } else if (!isMaster && !isArchiver) {
        router.push("/miembros/tablon");
      } else {
        const tab = activeTab || (isMaster ? "dashboard" : "scores");
        if (activeTab === null) setActiveTab(tab);
        
        const endpoints: Record<string, string> = {};
        
        // Eager load metadata if Master (used in almost all panels)
        if (isMaster) {
          endpoints['agrupaciones'] = '/api/agrupaciones';
          endpoints['secciones'] = '/api/secciones';
          endpoints['papeles'] = '/api/papeles';
          endpoints['roles'] = '/api/roles';
        }

        if (tab === 'dashboard' && isMaster) {
          endpoints['scores'] = '/api/scores';
          endpoints['users'] = '/api/admin/users';
        } else if (tab === 'scores') {
          endpoints['scores'] = '/api/scores';
          endpoints['categories'] = '/api/categories';
          // Agrupaciones and roles already in master base
          if (!isMaster) {
            endpoints['agrupaciones'] = '/api/agrupaciones';
            endpoints['roles'] = '/api/roles';
          }
        } else if (tab === 'categories' && isMaster) {
          endpoints['categories'] = '/api/categories';
        } else if (tab === 'sections' && isMaster) {
          // Already in master base
        } else if (tab === 'personal' && isMaster) {
          endpoints['users'] = '/api/admin/users';
          endpoints['invitations'] = '/api/admin/invitations';
        } else if (tab === 'requests' && isMaster) {
          endpoints['requests'] = '/api/admin/join-requests';
        }
        
        fetchEndpointsSafely(endpoints);
      }
    }
  }, [isAuthLoading, user, isMaster, isArchiver, activeTab, router]);

  if (isAuthLoading || !user) {
    return (
      <div className="admin-loading-screen">
        <div className="loader"></div>
        <p>Verificando credenciales administrativas...</p>
      </div>
    );
  }

  const getTabTitle = (tab: TabType | null) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'scores': return 'Partituras y Documentos';
      case 'personal': return 'Usuarios';
      case 'requests': return 'Solicitudes';
      case 'categories': return 'Programas / Conciertos';
      case 'sections': return 'Estructuras y Catálogos';
      case 'calendar': return 'Agenda';
      case 'logs': return 'Acciones del Sistema';
      default: return 'Gestión OCGC';
    }
  };

  return (
    <div className="admin-orchestrator-page">
      <div className="admin-sidebar-wrapper">
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMaster={isMaster} 
        />
      </div>

      <main className="admin-main-content">
        <header className="admin-section-header-premium">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1>{getTabTitle(activeTab)}</h1>
            <button 
              onClick={() => setIsHelpOpen(true)}
              style={{ 
                background: '#eef2ff', 
                color: '#4338ca', 
                border: 'none', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ❓ Guía
            </button>
          </div>
          <div className="header-status-pill">
            <span className="pulse-dot"></span>
            {isMaster ? 'Administrador Master' : 'Archivero'}
          </div>
        </header>

        <div className="admin-view-container">
          {activeTab === 'dashboard' && isMaster && (
            <DashboardPanel members={members} scores={scores} />
          )}

          {activeTab === 'scores' && (
            <ScoresPanel 
              scores={scores}
              categories={categories}
              agrupaciones={agrupaciones}
              tagsDict={tagsDict}
              predefinedTags={predefinedTags}
              isMaster={isMaster}
              isArchiver={isArchiver}
              onRefresh={() => fetchEndpointsSafely({
                scores: '/api/scores',
                categories: '/api/categories',
                agrupaciones: '/api/agrupaciones',
                roles: '/api/roles'
              }, true)}
            />
          )}

          {activeTab === 'categories' && isMaster && (
            <CategoriesPanel 
              categories={categories} 
              onRefresh={() => fetchEndpointsSafely({ categories: '/api/categories' }, true)} 
            />
          )}



          {activeTab === 'sections' && isMaster && (
            <SectionsPanel 
              agrupaciones={agrupaciones}
              papeles={papeles}
              secciones={secciones}
              onRefresh={() => fetchEndpointsSafely({
                agrupaciones: '/api/agrupaciones',
                secciones: '/api/secciones',
                papeles: '/api/papeles'
              }, true)} 
            />
          )}

          {activeTab === 'personal' && isMaster && (
            <PersonalPanel 
              members={members}
              invitations={invitations}
              agrupaciones={agrupaciones}
              secciones={secciones}
              papeles={papeles}
              predefinedTags={predefinedTags}
              onRefreshMembers={() => fetchEndpointsSafely({ users: '/api/admin/users' }, true)}
              onRefreshInvitations={() => fetchEndpointsSafely({ invitations: '/api/admin/invitations' }, true)}
            />
          )}

          {activeTab === 'requests' && isMaster && (
            <RequestsPanel 
              joinRequests={joinRequests} 
              onRefresh={() => fetchEndpointsSafely({ requests: '/api/admin/join-requests' }, true)} 
            />
          )}

          {activeTab === 'calendar' && <CalendarPanel />}

          {activeTab === 'logs' && isMaster && <LogsPanel />}
        </div>
      </main>

      {isHelpOpen && activeTab && (
        <AdminGuideModal 
          activeTab={activeTab} 
          onClose={() => setIsHelpOpen(false)} 
        />
      )}
    </div>
  );
}
