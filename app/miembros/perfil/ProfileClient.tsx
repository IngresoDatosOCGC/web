"use client";

import { useState, useEffect } from 'react';
import { useNotifications } from '@/components/ui/NotificationContext';
import '@/css/miembros.css';
import { Save, Loader2 } from 'lucide-react';

// Sub-components
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { ResidencyOccupationForm } from './components/ResidencyOccupationForm';
import { AuthCredentialsForm } from './components/AuthCredentialsForm';
import { ArtisticProfileCard } from './components/ArtisticProfileCard';
import { SpecialPermissionsCard } from './components/SpecialPermissionsCard';

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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '5rem', color: 'var(--clr-navy)' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6 }}>Cargando tu perfil...</p>
      </div>
    );
  }

  const initials = `${profile?.name?.[0] || ''}${profile?.surname?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--clr-navy, #1a2a4b), #2a3f6f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-gold, #c9a84c)',
            flexShrink: 0, border: '3px solid var(--clr-gold, #c9a84c)',
            boxShadow: '0 4px 16px rgba(201,168,76,0.25)',
          }}>
            {initials || '?'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--clr-navy)' }}>
              {profile?.name} {profile?.surname}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
              {profile?.email} · @{profile?.username || profile?.dni}
            </p>
          </div>
        </div>
      </div>

      {/* Main grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Editable form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Personal Info section */}
          <section style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e8edf5',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f4f8', background: 'linear-gradient(135deg, #f8faff 0%, #f0f6ff 100%)' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--clr-navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Información Personal
              </h2>
            </div>
            <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <PersonalInfoForm formData={formData} setFormData={setFormData} />
            </div>
          </section>

          {/* Residency section */}
          <section style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e8edf5',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f4f8', background: 'linear-gradient(135deg, #f8fcff 0%, #eff8ff 100%)' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--clr-navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Residencia y Ocupación
              </h2>
            </div>
            <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ResidencyOccupationForm formData={formData} setFormData={setFormData} />
            </div>
          </section>

          {/* Credentials section */}
          <section style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e8edf5',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f4f8', background: 'linear-gradient(135deg, #fdfaf8 0%, #fef5e7 100%)' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--clr-navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Credenciales de Acceso
              </h2>
            </div>
            <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AuthCredentialsForm formData={formData} setFormData={setFormData} email={profile?.email} />
            </div>
          </section>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 2.25rem',
                background: saving ? '#94a3b8' : 'var(--clr-navy, #1a2a4b)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(26, 42, 75, 0.35)',
                letterSpacing: '0.01em',
              }}
            >
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Right: Read-only cards */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '6rem' }}>
          <ArtisticProfileCard estructuras={profile?.estructuras} />
          <SpecialPermissionsCard profile={profile} />
        </aside>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
