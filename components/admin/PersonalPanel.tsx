"use client";

import React, { useState, useMemo } from 'react';
import CSVImportUsers from './CSVImportUsers';
import { useNotifications } from '@/components/ui/NotificationContext';

interface PersonalPanelProps {
  members: any[];
  invitations: any[];
  agrupaciones: any[];
  secciones: any[];
  papeles: any[];
  predefinedTags: string[];
  onRefreshMembers: () => void;
  onRefreshInvitations: () => void;
}

export default function PersonalPanel({
  members,
  invitations,
  agrupaciones,
  secciones,
  papeles,
  predefinedTags,
  onRefreshMembers,
  onRefreshInvitations
}: PersonalPanelProps) {
  const { showToast, confirmAction } = useNotifications();

  // Invitation Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteSurname, setInviteSurname] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteBirthDate, setInviteBirthDate] = useState('');
  const [inviteIsla, setInviteIsla] = useState('');
  const [inviteHasCertificate, setInviteHasCertificate] = useState(false);
  const [inviteAgrupacion, setInviteAgrupacion] = useState('');
  const [inviteSection, setInviteSection] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [lastGeneratedLink, setLastGeneratedLink] = useState('');

  // Member List Filters
  const [searchMember, setSearchMember] = useState('');
  const [filterPersonalRole, setFilterPersonalRole] = useState('all');
  const [filterPersonalInstrument, setFilterPersonalInstrument] = useState('all');

  // Modals visibility
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [isManualCreateOpen, setIsManualCreateOpen] = useState(false);
  const [editingMemberData, setEditingMemberData] = useState<any | null>(null);
  const [upgradingMember, setUpgradingMember] = useState<any | null>(null);
  const [upgradeData, setUpgradeData] = useState({ email: '', username: '', password: '' });
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Manual User Creation State
  const [manualUser, setManualUser] = useState({
    firstName: '',
    surname: '',
    email: '',
    dni: '',
    matricula: '',
    phone: '',
    username: '',
    password: '',
    isMaster: false,
    isArchiver: false,
    isExternal: false,
    artisticProfiles: [{ agrupacion: '', seccion: '', papel: 'Músico' }]
  });

  // Handlers
  const createInvitation = async (sendEmail: boolean) => {
    if (sendEmail && !inviteEmail) return showToast("Se requiere email para enviar la invitación", "warning");
    
    setIsGeneratingInvite(true);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          surname: inviteSurname,
          email: inviteEmail || null,
          phone: invitePhone,
          birthDate: inviteBirthDate,
          isla: inviteIsla,
          hasCertificate: inviteHasCertificate,
          agrupacion: inviteAgrupacion,
          seccion: inviteSection,
          sendEmail
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(sendEmail ? "✓ Invitación enviada por email" : "✓ Enlace generado correctamente");
        setLastGeneratedLink(`${window.location.origin}/registro-usuarios?code=${data.code}`);
        onRefreshInvitations();
        if (sendEmail) {
          setInviteName(''); setInviteSurname(''); setInviteEmail(''); setInvitePhone('');
        }
      } else {
        showToast(data.error || "Error al generar invitación", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const deleteInvitation = async (id: number) => {
    confirmAction("¿Revocar esta invitación?", async () => {
      try {
        const res = await fetch(`/api/admin/invitations?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Invitación revocada");
          onRefreshInvitations();
        }
      } catch { showToast("Error al revocar", "error"); }
    });
  };

  const toggleMasterStatus = async (userId: string, current: boolean) => {
    if (!current) {
      const member = members.find(m => m.id === userId);
      if (member && member.isExternal) {
        setUpgradingMember({ ...member, targetRole: 'master' });
        setUpgradeData({ ...upgradeData, email: member.email || '' });
        return;
      }
    }
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ userId, action: "toggle-master", status: !current }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        showToast(`Permisos Master ${!current ? 'activados' : 'desactivados'}`);
        onRefreshMembers();
      }
    } catch { showToast("Error al actualizar", "error"); }
  };

  const toggleArchiverStatus = async (userId: string, current: boolean) => {
    if (!current) {
      const member = members.find(m => m.id === userId);
      if (member && member.isExternal) {
        setUpgradingMember({ ...member, targetRole: 'archiver' });
        setUpgradeData({ ...upgradeData, email: member.email || '' });
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ userId, action: "toggle-archiver", status: !current }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        showToast(`Permisos Archivero ${!current ? 'activados' : 'desactivados'}`);
        onRefreshMembers();
      }
    } catch { showToast("Error al actualizar", "error"); }
  };

  const toggleBanStatus = async (userId: string, current: boolean) => {
    confirmAction(current ? "¿Quitar bloqueo a este usuario?" : "¿Bloquear acceso a este usuario?", async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          body: JSON.stringify({ userId, action: "toggle-ban", status: !current }),
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
          showToast(current ? "Usuario desbloqueado" : "Usuario bloqueado");
          onRefreshMembers();
        }
      } catch { showToast("Error al actualizar", "error"); }
    });
  };

  const upgradeToPlatform = async () => {
    if (!upgradeData.email || !upgradeData.username || upgradeData.password.length < 8) {
      return alert("Por favor completa los campos. Contraseña min. 8 caracteres.");
    }
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ 
          userId: upgradingMember.id, 
          action: "upgrade-to-platform", 
          ...upgradeData,
          role: upgradingMember.targetRole
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        showToast("✓ Usuario activado en plataforma");
        setUpgradingMember(null);
        setUpgradeData({ email: '', username: '', password: '' });
        onRefreshMembers();
      } else {
        const d = await res.json();
        alert(d.error || "Error al activar");
      }
    } catch { alert("Error de conexión"); }
    finally { setIsUpgrading(false); }
  };

  const createManualUser = async () => {
    if (!manualUser.firstName || (!manualUser.isExternal && (!manualUser.email || !manualUser.username || manualUser.password.length < 8))) {
      return alert("Faltan campos obligatorios o la contraseña es demasiado corta.");
    }
    setIsCreatingManual(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        body: JSON.stringify(manualUser),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        showToast("✓ Usuario creado con éxito");
        setIsManualCreateOpen(false);
        setManualUser({
          firstName: '', surname: '', email: '', dni: '', matricula: '', phone: '',
          username: '', password: '', isMaster: false, isArchiver: false, isExternal: false,
          artisticProfiles: [{ agrupacion: '', seccion: '', papel: 'Músico' }]
        });
        onRefreshMembers();
      } else {
        const d = await res.json();
        alert(d.error || "Error al crear usuario");
      }
    } catch { alert("Error de conexión"); }
    finally { setIsCreatingManual(false); }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = (m.name + " " + m.email).toLowerCase().includes(searchMember.toLowerCase());
      const matchesRole = filterPersonalRole === 'all' || 
        (filterPersonalRole === 'master' && m.isMaster) ||
        (filterPersonalRole === 'archiver' && m.isArchiver) ||
        (filterPersonalRole === 'banned' && m.isBanned) ||
        (filterPersonalRole === 'external' && m.isExternal) ||
        (filterPersonalRole === 'normal' && !m.isMaster && !m.isArchiver && !m.isBanned && !m.isExternal);
      
      const matchesInstrument = filterPersonalInstrument === 'all' || (m.roles && m.roles.includes(filterPersonalInstrument));
      
      return matchesSearch && matchesRole && matchesInstrument;
    });
  }, [members, searchMember, filterPersonalRole, filterPersonalInstrument]);

  return (
    <div className="personal-panel-grid">
      {/* Left Column: List and Management */}
      <section className="admin-list-card" style={{ minWidth: 0 }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Gestión de Personal ({members.length})</h3>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={() => setIsCSVImportOpen(true)} className="btn-main-admin btn-success-sm">📤 CSV</button>
            <button onClick={() => setIsManualCreateOpen(true)} className="btn-main-admin btn-navy-sm">👤 Nuevo</button>
          </div>
        </div>

        <div className="member-filters-bar">
          <select value={filterPersonalRole} onChange={(e) => setFilterPersonalRole(e.target.value)}>
            <option value="all">Filtro permisos</option>
            <option value="normal">Músicos (Sin admin)</option>
            <option value="archiver">Archiveros</option>
            <option value="master">Masters</option>
            <option value="external">Externos</option>
            <option value="banned">Bloqueados</option>
          </select>
          <select value={filterPersonalInstrument} onChange={(e) => setFilterPersonalInstrument(e.target.value)}>
            <option value="all">Filtro instrumento</option>
            {predefinedTags.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="text" placeholder="Buscar músico..." value={searchMember} onChange={(e) => setSearchMember(e.target.value)} />
        </div>

        <div className="table-scroll">
          <table className="personal-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th className="th-center" style={{ width: '50px' }}>Mst</th>
                <th className="th-center" style={{ width: '50px' }}>Arc</th>
                <th className="th-center" style={{ width: '50px' }}>Edo</th>
                <th className="th-center" style={{ width: '50px' }}>Acc</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => (
                <tr key={m.id} className={`${m.isBanned ? 'tr-banned' : ''} ${m.isExternal ? 'tr-external' : ''}`}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--clr-navy)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>{m.email || '(Sin email)'}</div>
                    {m.isExternal && <span className="badge-external" style={{ marginTop: '4px', display: 'inline-block' }}>Externo</span>}
                  </td>
                  <td className="td-center">
                    <button onClick={() => toggleMasterStatus(m.id, m.isMaster)} className={`btn-status-toggle ${m.isMaster ? 'on' : 'off'}`}>{m.isMaster ? "✓" : "🚫"}</button>
                  </td>
                  <td className="td-center">
                    <button onClick={() => toggleArchiverStatus(m.id, m.isArchiver)} className={`btn-status-toggle ${m.isArchiver ? 'on' : 'off'}`}>{m.isArchiver ? "✓" : "🚫"}</button>
                  </td>
                  <td className="td-center">
                    <button onClick={() => toggleBanStatus(m.id, m.isBanned)} className={`btn-status-toggle ${m.isBanned ? 'banned' : 'on'}`}>{m.isBanned ? "🚫" : "✓"}</button>
                  </td>
                  <td className="td-center">
                    <button onClick={() => setEditingMemberData(m)} className="btn-edit-sm">✎</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Column: Invitations */}
      <section className="admin-form-card" style={{ height: 'fit-content' }}>
        <h3>🎫 Generar Invitación</h3>
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.2rem' }}>Los datos rellenos aquí se autocompletarán en el formulario de registro del músico.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="invitation-fields-row">
            <input type="text" placeholder="Nombre" value={inviteName} onChange={e => setInviteName(e.target.value)} className="premium-input" />
            <input type="text" placeholder="Apellidos" value={inviteSurname} onChange={e => setInviteSurname(e.target.value)} className="premium-input" />
          </div>
          
          <input type="email" placeholder="Email (opcional)" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="premium-input" />
          
          <div className="invitation-fields-row">
            <input type="text" placeholder="Teléfono" value={invitePhone} onChange={e => setInvitePhone(e.target.value)} className="premium-input" style={{ flex: '1 1 100px' }} />
            <input type="date" value={inviteBirthDate} onChange={e => setInviteBirthDate(e.target.value)} className="premium-input" style={{ flex: '1 1 140px' }} />
          </div>

          <div className="invitation-fields-row" style={{ alignItems: 'center' }}>
            <select value={inviteIsla} onChange={e => setInviteIsla(e.target.value)} className="premium-input" style={{ flex: 1.5 }}>
              <option value="">Isla...</option>
              <option value="Gran Canaria">Gran Canaria</option>
              <option value="Tenerife">Tenerife</option>
              <option value="Lanzarote">Lanzarote</option>
              <option value="Fuerteventura">Fuerteventura</option>
              <option value="La Palma">La Palma</option>
              <option value="La Gomera">La Gomera</option>
              <option value="El Hierro">El Hierro</option>
              <option value="Fuera de Canarias">Fuera de Canarias</option>
            </select>
            <label className="checkbox-label-admin" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#666', lineHeight: 1.1 }}>
              <input type="checkbox" checked={inviteHasCertificate} onChange={e => setInviteHasCertificate(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              Resid. canaria
            </label>
          </div>
          
          <div className="invitation-fields-row">
            <select value={inviteAgrupacion} onChange={e => setInviteAgrupacion(e.target.value)} className="premium-input">
              <option value="">Agrupación...</option>
              {agrupaciones.map(a => <option key={a.id} value={a.agrupacion}>{a.agrupacion}</option>)}
            </select>
            <select value={inviteSection} onChange={e => setInviteSection(e.target.value)} className="premium-input">
              <option value="">Sección...</option>
              {secciones.sort((a,b)=>a.seccion.localeCompare(b.seccion)).map(s => <option key={s.id} value={s.seccion}>{s.seccion}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
            <button onClick={() => createInvitation(true)} className="btn-invitation-email" style={{ flex: 1 }} disabled={isGeneratingInvite || !inviteEmail}>
              {isGeneratingInvite ? "..." : "Email"}
            </button>
            <button onClick={() => createInvitation(false)} className="btn-invitation-link" style={{ flex: 1 }} disabled={isGeneratingInvite}>
              {isGeneratingInvite ? "..." : "Link"}
            </button>
          </div>
        </div>

        {lastGeneratedLink && (
          <div className="generated-link-box" style={{ marginTop: '1rem', padding: '0.8rem', background: '#f1f2f6', borderRadius: '8px', fontSize: '0.8rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>Link generado:</p>
            <code style={{ wordBreak: 'break-all' }}>{lastGeneratedLink}</code>
            <button onClick={() => { navigator.clipboard.writeText(lastGeneratedLink); showToast("Copiado"); }} className="btn-save btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>Copiar</button>
          </div>
        )}

        <h4 style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>Invitaciones Pendientes ({invitations.length})</h4>
        <div className="invitation-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {invitations.map(inv => (
            <div key={inv.id} className="invitation-item-compact">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inv.name} {inv.surname}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>{inv.sentToEmail || 'Sin email'}</div>
              </div>
              <button onClick={() => deleteInvitation(inv.id)} className="btn-delete-small">×</button>
            </div>
          ))}
        </div>
      </section>

      {/* MODALS */}
      {isManualCreateOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsManualCreateOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '750px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2.5rem 0.5rem' }}>
              <div>
                <h2 className="modal-header-text" style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Crear Usuario Manualmente</h2>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>Ideal para administradores, archiveros o músicos que no pueden usar el enlace.</p>
              </div>
              <button onClick={() => setIsManualCreateOpen(false)} className="btn-close-modal">✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem 2.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
                <div className="admin-form-group-premium">
                  <label>Nombre de pila *</label>
                  <input type="text" placeholder="Ej: Juan" value={manualUser.firstName} onChange={e => setManualUser({...manualUser, firstName: e.target.value})} className="premium-input" />
                </div>
                <div className="admin-form-group-premium">
                  <label>Apellidos</label>
                  <input type="text" placeholder="Ej: Pérez García" value={manualUser.surname} onChange={e => setManualUser({...manualUser, surname: e.target.value})} className="premium-input" />
                </div>
                <div className="admin-form-group-premium">
                  <label style={{ opacity: manualUser.isExternal ? 0.5 : 1 }}>Email {manualUser.isExternal ? "" : "*"}</label>
                  <input 
                    type="email" 
                    placeholder={manualUser.isExternal ? "No requerido (Externo)" : "ejemplo@correo.com"} 
                    value={manualUser.isExternal ? "" : manualUser.email} 
                    onChange={e => setManualUser({...manualUser, email: e.target.value})} 
                    className="premium-input" 
                    disabled={manualUser.isExternal}
                    style={{ backgroundColor: manualUser.isExternal ? '#f1f5f9' : 'transparent', cursor: manualUser.isExternal ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div className="admin-form-group-premium">
                  <label>DNI / NIE *</label>
                  <input type="text" placeholder="12345678X" value={manualUser.dni} onChange={e => setManualUser({...manualUser, dni: e.target.value})} className="premium-input" />
                </div>
                <div className="admin-form-group-premium">
                  <label>Teléfono</label>
                  <input type="text" placeholder="+34 600 000 000" value={manualUser.phone} onChange={e => setManualUser({...manualUser, phone: e.target.value})} className="premium-input" />
                </div>
                <div className="admin-form-group-premium">
                  <label>Matrícula de Coche (Opcional)</label>
                  <input type="text" placeholder="Ej: 1234 ABC" value={manualUser.matricula} onChange={e => setManualUser({...manualUser, matricula: e.target.value})} className="premium-input" />
                </div>
                <div className="admin-form-group-premium">
                  <label style={{ opacity: manualUser.isExternal ? 0.5 : 1 }}>Nombre de Usuario *</label>
                  <input 
                    type="text" 
                    placeholder={manualUser.isExternal ? "No generado" : "usuario_ocgc"} 
                    value={manualUser.isExternal ? "" : manualUser.username} 
                    onChange={e => setManualUser({...manualUser, username: e.target.value})} 
                    className="premium-input" 
                    disabled={manualUser.isExternal}
                    style={{ backgroundColor: manualUser.isExternal ? '#f1f5f9' : 'transparent', cursor: manualUser.isExternal ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div className="admin-form-group-premium">
                  <label style={{ opacity: manualUser.isExternal ? 0.5 : 1 }}>Contraseña *</label>
                  <input 
                    type="password" 
                    placeholder={manualUser.isExternal ? "Sin contraseña" : "Mínimo 8 caract."} 
                    value={manualUser.isExternal ? "" : manualUser.password} 
                    onChange={e => setManualUser({...manualUser, password: e.target.value})} 
                    className="premium-input" 
                    disabled={manualUser.isExternal}
                    style={{ backgroundColor: manualUser.isExternal ? '#f1f5f9' : 'transparent', cursor: manualUser.isExternal ? 'not-allowed' : 'text' }}
                  />
                </div>
              </div>

              {/* Permisos Box */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.2rem' }}>Configuración de Acceso y Permisos</h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                    <input type="checkbox" checked={manualUser.isExternal} onChange={e => setManualUser({...manualUser, isExternal: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    🚫 Externo (Sin acceso al sistema)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                    <input type="checkbox" checked={manualUser.isMaster} onChange={e => setManualUser({...manualUser, isMaster: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    Administrador (Master)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                    <input type="checkbox" checked={manualUser.isArchiver} onChange={e => setManualUser({...manualUser, isArchiver: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    Archivero
                  </label>
                </div>
              </div>

              {/* Perfiles Artísticos */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.2rem' }}>Perfiles Artísticos (Si es músico)</h3>
                
                {manualUser.artisticProfiles.map((p, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr auto', gap: '0.8rem', marginBottom: '0.8rem', alignItems: 'center' }}>
                    <select 
                      value={p.papel} 
                      onChange={e => {
                        const newP = [...manualUser.artisticProfiles];
                        newP[idx].papel = e.target.value;
                        setManualUser({...manualUser, artisticProfiles: newP});
                      }}
                      className="premium-input"
                    >
                      {papeles.map(papel => <option key={papel.id} value={papel.papel}>{papel.papel}</option>)}
                    </select>
                    <select 
                      value={p.agrupacion} 
                      onChange={e => {
                        const newP = [...manualUser.artisticProfiles];
                        newP[idx].agrupacion = e.target.value;
                        setManualUser({...manualUser, artisticProfiles: newP});
                      }}
                      className="premium-input"
                    >
                      <option value="">-- Agrupación --</option>
                      {agrupaciones.map(a => <option key={a.id} value={a.agrupacion}>{a.agrupacion}</option>)}
                    </select>
                    <select 
                      value={p.seccion} 
                      onChange={e => {
                        const newP = [...manualUser.artisticProfiles];
                        newP[idx].seccion = e.target.value;
                        setManualUser({...manualUser, artisticProfiles: newP});
                      }}
                      className="premium-input"
                    >
                      <option value="">-- Sección --</option>
                      {secciones.sort((a,b)=>a.seccion.localeCompare(b.seccion)).map(s => <option key={s.id} value={s.seccion}>{s.seccion}</option>)}
                    </select>
                    {manualUser.artisticProfiles.length > 1 && (
                      <button onClick={() => {
                        const newP = manualUser.artisticProfiles.filter((_, i) => i !== idx);
                        setManualUser({...manualUser, artisticProfiles: newP});
                      }} className="btn-close-modal" style={{ fontSize: '1.2rem', color: '#ef4444' }}>×</button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={() => setManualUser({
                    ...manualUser, 
                    artisticProfiles: [...manualUser.artisticProfiles, { agrupacion: '', seccion: '', papel: 'Músico' }]
                  })}
                  className="btn-add-profile" 
                  style={{ marginTop: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Añadir otra agrupación
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2.5rem 2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setIsManualCreateOpen(false)} className="btn-modal-cancel">Cancelar</button>
              <button 
                onClick={createManualUser} 
                className="btn-modal-save" 
                style={{ background: '#e8f5e9', color: '#2e7d32' }}
                disabled={isCreatingManual}
              >
                {isCreatingManual ? 'Procesando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCSVImportOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Importar desde CSV</h2>
              <button onClick={() => setIsCSVImportOpen(false)} className="btn-close-modal">✕</button>
            </div>
            <div className="modal-body">
              <CSVImportUsers onImportSuccess={() => { onRefreshMembers(); setIsCSVImportOpen(false); }} />
            </div>
          </div>
        </div>
      )}

      {editingMemberData && (
        <div className="admin-modal-overlay" onClick={() => setEditingMemberData(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '850px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ border: 'none', padding: '1.5rem 2.5rem 0.5rem' }}>
              <div>
                <h2 className="modal-header-text" style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Editar Perfil: {editingMemberData.name}</h2>
                <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>{editingMemberData.email}</p>
              </div>
              <button onClick={() => setEditingMemberData(null)} className="btn-close-modal">✕</button>
            </div>

            <div className="modal-body" style={{ padding: '1rem 2.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              <section style={{ marginBottom: '2rem' }}>
                <h3 className="section-title-small" style={{ marginBottom: '1.2rem', color: '#1a2a4b' }}>Perfil Artístico y Ubicación (Base de Datos)</h3>
                
                <div style={{ background: '#fff', border: '1px solid #eef2f6', borderRadius: '12px', overflow: 'hidden' }}>
                  <table className="mini-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #eef2f6' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Agrupación</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Sección</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Papel</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Atril</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingMemberData.estructuras?.map((est: any) => (
                        <tr key={est.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.8rem 0.5rem' }}>
                            <select className="premium-input-sm" defaultValue={est.agrupacion} style={{ width: '100%', maxWidth: '140px' }}>
                              {agrupaciones.map(a => <option key={a.id} value={a.agrupacion}>{a.agrupacion}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '0.8rem 0.5rem' }}>
                            <select className="premium-input-sm" defaultValue={est.seccion} style={{ width: '100%', maxWidth: '160px' }}>
                              {secciones.map(s => <option key={s.id} value={s.seccion}>{s.seccion}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '0.8rem 0.5rem' }}>
                            <select className="premium-input-sm" defaultValue={est.papel} style={{ width: '100%', maxWidth: '120px' }}>
                              {papeles.map(p => <option key={p.id} value={p.papel}>{p.papel}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '0.8rem 0.5rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => {
                                confirmAction(`¿${est.activo ? 'Desactivar' : 'Activar'} este perfil artístico?`, async () => {
                                  const res = await fetch("/api/admin/users", { 
                                    method: "POST", 
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ userId: editingMemberData.id, action: "update-estructura", estructuraId: est.id, activo: !est.activo }) 
                                  });
                                  if(res.ok) { onRefreshMembers(); setEditingMemberData(null); }
                                });
                              }}
                              className={`btn-status-circle ${est.activo ? 'active' : ''}`}
                            >
                              {est.activo ? "✓" : "×"}
                            </button>
                          </td>
                          <td style={{ padding: '0.8rem 0.5rem', textAlign: 'center' }}>
                            <input 
                              type="number" 
                              defaultValue={est.atril || ""} 
                              className="premium-input-sm" 
                              style={{ width: '45px', textAlign: 'center' }} 
                              onBlur={async (e) => {
                                if(e.target.value === String(est.atril)) return;
                                await fetch("/api/admin/users", { 
                                  method: "POST", 
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ userId: editingMemberData.id, action: "update-estructura", estructuraId: est.id, atril: e.target.value }) 
                                });
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.8rem 0.5rem', textAlign: 'center' }}>
                            <button onClick={() => {
                              confirmAction("¿Eliminar perfil artistico?", async () => {
                                const res = await fetch("/api/admin/users", { 
                                  method: "POST", 
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ userId: editingMemberData.id, action: "delete-estructura", estructuraId: est.id }) 
                                });
                                if(res.ok) { onRefreshMembers(); setEditingMemberData(null); }
                              });
                            }} className="btn-action-delete">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New Profile Dashed Box */}
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '1.2rem', color: '#6366f1' }}>+</span>
                    <span style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.9rem' }}>Añadir Nuevo Perfil Artístico</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="admin-form-group-sm" style={{ flex: '1 1 140px' }}>
                      <label>Agrupación</label>
                      <select id="newAgr" className="premium-input" style={{ width: '100%' }}>
                        <option value="">Seleccionar...</option>
                        {agrupaciones.map(a => <option key={a.id} value={a.id}>{a.agrupacion}</option>)}
                      </select>
                    </div>
                    <div className="admin-form-group-sm" style={{ flex: '1 1 140px' }}>
                      <label>Sección / Instrumento</label>
                      <select id="newSec" className="premium-input" style={{ width: '100%' }}>
                        <option value="">Seleccionar...</option>
                        {secciones.map(s => <option key={s.id} value={s.id}>{s.seccion}</option>)}
                      </select>
                    </div>
                    <div className="admin-form-group-sm" style={{ flex: '1 1 120px' }}>
                      <label>Papel</label>
                      <select id="newPap" className="premium-input" style={{ width: '100%' }} defaultValue={1}>
                        {papeles.map(p => <option key={p.id} value={p.id}>{p.papel}</option>)}
                      </select>
                    </div>
                    <button 
                      onClick={async () => {
                        const agr = (document.getElementById("newAgr") as HTMLSelectElement).value;
                        const sec = (document.getElementById("newSec") as HTMLSelectElement).value;
                        const pap = (document.getElementById("newPap") as HTMLSelectElement).value;
                        if(!agr || !sec) return showToast("Selecciona Agrupación y Sección", "warning");
                        const res = await fetch("/api/admin/users", { 
                          method: "POST", 
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: editingMemberData.id, action: "add-estructura", agrupacionId: agr, seccionId: sec, papelId: pap }) 
                        });
                        if (res.ok) { showToast("Perfil añadido"); onRefreshMembers(); setEditingMemberData(null); }
                      }}
                      className="btn-vincular"
                      style={{ flex: '0 0 auto' }}
                    >
                      Vincular
                    </button>
                  </div>
                </div>
              </section>

              {/* Acceso Box */}
              <section style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Gestión de Accesos:</h3>
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => toggleMasterStatus(editingMemberData.id, editingMemberData.isMaster)}
                      className={`btn-access-status ${editingMemberData.isMaster ? 'active' : ''}`}
                    >
                      {editingMemberData.isMaster ? '✓' : '🚫'}
                    </button>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Master</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Acceso total</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => toggleArchiverStatus(editingMemberData.id, editingMemberData.isArchiver)}
                      className={`btn-access-status ${editingMemberData.isArchiver ? 'active' : ''}`}
                    >
                      {editingMemberData.isArchiver ? '✓' : '🚫'}
                    </button>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Archivero</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Gestión doc.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => {
                        confirmAction(`¿${editingMemberData.isBanned ? 'Activar' : 'Desactivar'} este usuario?`, async () => {
                          const res = await fetch("/api/admin/users", { 
                            method: "POST", 
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: editingMemberData.id, action: "toggle-ban", isBanned: !editingMemberData.isBanned }) 
                          });
                          if(res.ok) { onRefreshMembers(); setEditingMemberData(null); }
                        });
                      }}
                      className={`btn-access-status ${!editingMemberData.isBanned ? 'active' : ''}`}
                    >
                      {!editingMemberData.isBanned ? '✓' : '🚫'}
                    </button>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Estado</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{!editingMemberData.isBanned ? 'Activo' : 'Inactivo'}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Perfil Data */}
              <section style={{ border: '2px solid #eef2f6', borderRadius: '16px', padding: '1.5rem', borderLeft: '4px solid #478AC9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#4b5563' }}>Datos de Perfil y Residencia Canaria</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                   <div className="admin-form-group-premium">
                     <label style={{ fontSize: '0.75rem', color: '#64748b' }}>FECHA DE NACIMIENTO</label>
                     <input 
                       type="date" 
                       defaultValue={editingMemberData.birthDate?.split('T')[0] || ""} 
                       className="premium-input" 
                       onChange={(e) => setEditingMemberData({...editingMemberData, birthDate: e.target.value})}
                     />
                   </div>
                   <div className="admin-form-group-premium">
                     <label style={{ fontSize: '0.75rem', color: '#64748b' }}>VIAJES / SUBSIDIO (Residencia Canaria)</label>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                       <input 
                         type="checkbox" 
                         checked={editingMemberData.hasCertificate} 
                         onChange={(e) => setEditingMemberData({...editingMemberData, hasCertificate: e.target.checked})}
                         style={{ width: '20px', height: '20px' }}
                       />
                       <span style={{ fontSize: '0.85rem', color: '#475569' }}>Tiene certificado de residencia activo</span>
                     </div>
                   </div>
                </div>
              </section>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <button onClick={async () => {
                  confirmAction("¿Eliminar usuario permanentemente de la Base de Datos?", async () => {
                    const res = await fetch(`/api/admin/users?id=${editingMemberData.id}`, { method: "DELETE" });
                    if (res.ok) { showToast("Usuario eliminado"); onRefreshMembers(); setEditingMemberData(null); }
                  });
                }} className="btn-delete-link" style={{ fontSize: '0.8rem', color: '#ef4444', opacity: 0.7 }}>ELIMINAR DE BASE DE DATOS</button>
              </div>
            </div>

            <div className="modal-footer" style={{ border: 'none', padding: '1.5rem 2.5rem 2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setEditingMemberData(null)} className="btn-modal-cancel">Cancelar</button>
              <button 
                onClick={async () => {
                   const res = await fetch("/api/admin/users", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ 
                       userId: editingMemberData.id, 
                       action: "update-user-profile", 
                       birthDate: editingMemberData.birthDate, 
                       hasCertificate: editingMemberData.hasCertificate 
                     })
                   });
                   if(res.ok) { showToast("✅ Cambios guardados"); onRefreshMembers(); setEditingMemberData(null); }
                }} 
                className="btn-modal-save"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
