"use client";

import { useState, useEffect } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';
import '@/css/miembros.css';
import { Save, Loader2 } from 'lucide-react';

// Sub-components (now in shared components/perfil/)
import { PersonalInfoForm } from '@/components/perfil/PersonalInfoForm';
import { ResidencyOccupationForm } from '@/components/perfil/ResidencyOccupationForm';
import { AuthCredentialsForm } from '@/components/perfil/AuthCredentialsForm';
import { ArtisticProfileCard } from '@/components/perfil/ArtisticProfileCard';
import { SpecialPermissionsCard } from '@/components/perfil/SpecialPermissionsCard';

export default function ProfileClient() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '', surname: '', dni: '', phone: '', birthDate: '',
    hasCertificate: false, username: '', currentPassword: '',
    password: '', repeatPassword: '', isla: '', municipio: '',
    empadronamiento: '', trabajo: '', estudios: ''
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '', surname: data.surname || '',
          dni: data.dni || '', phone: data.phone || '',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          hasCertificate: data.hasCertificate || false,
          username: data.username || '', currentPassword: '',
          password: '', repeatPassword: '',
          isla: data.residencia?.isla || '', municipio: data.residencia?.municipio || '',
          empadronamiento: data.residencia?.empadronamiento || '',
          trabajo: data.empleo?.trabajo || '', estudios: data.empleo?.estudios || ''
        });
      } else {
        showToast('Error cargando perfil', 'error');
      }
    } catch { showToast('Error de conexión', 'error'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password) {
      if (formData.password.length < 8) return showToast('La nueva contraseña debe tener al menos 8 caracteres', 'warning');
      if (formData.password !== formData.repeatPassword) return showToast('Las contraseñas no coinciden', 'warning');
      if (!formData.currentPassword) return showToast('Se requiere la contraseña actual para establecer una nueva', 'warning');
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('✅ Perfil actualizado correctamente');
        setFormData(prev => ({ ...prev, currentPassword: '', password: '', repeatPassword: '' }));
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Error al actualizar', 'error');
      }
    } catch { showToast('Error de conexión', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  const initials = `${profile?.name?.[0] || ''}${profile?.surname?.[0] || ''}`.toUpperCase();

  return (
    <div className="profile-page">
      
      {/* Page Header */}
      <div className="profile-page__header">
        <div className="user-avatar">{initials || '?'}</div>
        <div>
          <h1 className="admin-page-title" style={{ margin: 0 }}>
            {profile?.name} {profile?.surname}
          </h1>
          <p className="admin-page-subtitle" style={{ margin: '2px 0 0' }}>
            {profile?.email} · @{profile?.username || profile?.dni}
          </p>
        </div>
      </div>

      {/* Main grid layout */}
      <div className="profile-page__grid">
        
        {/* Left: Editable form */}
        <form onSubmit={handleSave} className="profile-form">
          
          <section className="profile-section">
            <div className="profile-section__header">
              <h2 className="profile-section__title">Información Personal</h2>
            </div>
            <div className="profile-section__body">
              <PersonalInfoForm formData={formData} setFormData={setFormData} />
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section__header">
              <h2 className="profile-section__title">Residencia y Ocupación</h2>
            </div>
            <div className="profile-section__body">
              <ResidencyOccupationForm formData={formData} setFormData={setFormData} />
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section__header">
              <h2 className="profile-section__title">Credenciales de Acceso</h2>
            </div>
            <div className="profile-section__body">
              <AuthCredentialsForm formData={formData} setFormData={setFormData} email={profile?.email} />
            </div>
          </section>

          <div className="profile-save-row">
            <button
              type="submit"
              className="btn-main-admin profile-save-btn"
              disabled={saving}
            >
              {saving ? <Loader2 size={18} className="profile-save-btn__spinner" /> : <Save size={18} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Right: Read-only sidebar */}
        <aside className="profile-sidebar">
          <ArtisticProfileCard estructuras={profile?.estructuras} />
          <SpecialPermissionsCard profile={profile} />
        </aside>
      </div>
    </div>
  );
}
