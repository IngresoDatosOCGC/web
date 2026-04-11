"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from 'react';
import TabNavigation, { TabType } from '@/components/admin/TabNavigation';
import DashboardPanel from '@/components/admin/DashboardPanel';
import ScoresPanel from '@/components/admin/ScoresPanel';
import CategoriesPanel from '@/components/admin/CategoriesPanel';
import RolesPanel from '@/components/admin/RolesPanel';
import SectionsPanel from '@/components/admin/SectionsPanel';
import PersonalPanel from '@/components/admin/PersonalPanel';
import RequestsPanel from '@/components/admin/RequestsPanel';
import CalendarPanel from '@/components/admin/CalendarPanel';
import LogsPanel from '@/components/admin/LogsPanel';
import AdminGuideModal from '@/components/admin/AdminGuideModal';
import { useNotifications } from '@/components/ui/NotificationContext';
import '@/css/miembros.css';

export default function AdminOCGCPartituras() {
  const { isLoaded, user } = useUser();
  const { showToast } = useNotifications();
  
  const isMaster = !!user?.publicMetadata?.isMaster;
  const isArchiver = !!user?.publicMetadata?.isArchiver || isMaster;

  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Data states
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agrupaciones, setAgrupaciones] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [papeles, setPapeles] = useState([]);
  const [tagsDict, setTagsDict] = useState({});
  const [predefinedTags, setPredefinedTags] = useState<string[]>([]);
  
  // Members data (master only)
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const loadData = async (silent = false) => {
    try {
      if (!silent) console.log("Cargando catálogos...");
      
      const [scoresRes, catRes, agrRes, secRes, papRes, tagsRes] = await Promise.all([
        fetch("/api/scores"),
        fetch("/api/categories"),
        fetch("/api/agrupaciones"),
        fetch("/api/secciones"),
        fetch("/api/papeles"),
        fetch("/api/roles")
      ]);

      const [scoresData, catData, agrData, secData, papData, tagsData] = await Promise.all([
        scoresRes.json(),
        catRes.json(),
        agrRes.json(),
        secRes.json(),
        papRes.json(),
        tagsRes.json()
      ]);

      setScores(scoresData);
      setCategories(catData);
      setAgrupaciones(agrData);
      setSecciones(secData);
      setPapeles(papData);
      // tagsData de /api/roles es un objeto familias -> secciones[]
      const flatTags = Object.values(tagsData).flat().map((t: any) => t.name);
      setPredefinedTags(flatTags);
      setTagsDict(tagsData);

      if (silent) showToast("✓ Catálogos actualizados");
    } catch (error) {
      showToast("Error al cargar datos", "error");
    }
  };

  const loadMembersData = async (silent = false) => {
    if (!isMaster) return;
    try {
      const [usersRes, invRes, joinRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/invitations"),
        fetch("/api/admin/join-requests")
      ]);

      const [usersData, invData, joinData] = await Promise.all([
        usersRes.json(),
        invRes.json(),
        joinRes.json()
      ]);

      setMembers(usersData);
      setInvitations(invData);
      setJoinRequests(joinData);

      if (silent) showToast("✓ Lista de miembros actualizada");
    } catch (error) {
      showToast("Error al cargar miembros", "error");
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        window.location.href = "/sign-in";
      } else if (!isMaster && !isArchiver) {
        window.location.href = "/miembros/tablon";
      } else {
        if (activeTab === null) {
          setActiveTab(isMaster ? "dashboard" : "scores");
        }
        loadData();
        if (isMaster) loadMembersData();
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    return (
      <div className="admin-loading-screen">
        <div className="loader"></div>
        <p>Verificando credenciales administrativas...</p>
      </div>
    );
  }

  return (
    <div className="admin-orchestrator-page">
      <TabNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMaster={isMaster} 
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      <main className="admin-main-content">
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
              onRefresh={() => loadData(true)}
            />
          )}

          {activeTab === 'categories' && isMaster && (
            <CategoriesPanel 
              categories={categories} 
              onRefresh={() => loadData(true)} 
            />
          )}

          {activeTab === 'roles' && isMaster && (
            <RolesPanel 
              tagsDict={tagsDict} 
              onRefresh={() => loadData(true)} 
            />
          )}

          {activeTab === 'sections' && isMaster && (
            <SectionsPanel 
              agrupaciones={agrupaciones}
              papeles={papeles}
              secciones={secciones}
              onRefresh={() => loadData(true)}
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
              onRefreshMembers={() => loadMembersData(true)}
              onRefreshInvitations={() => loadMembersData(true)}
            />
          )}

          {activeTab === 'requests' && isMaster && (
            <RequestsPanel 
              joinRequests={joinRequests} 
              onRefresh={() => loadMembersData(true)} 
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
