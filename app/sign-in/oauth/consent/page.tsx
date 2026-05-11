'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Componente principal que envuelve el contenido en Suspense
export default function ConsentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: 'var(--clr-navy)', fontWeight: 600 }}>Cargando...</p>
      </div>
    }>
      <ConsentContent />
    </Suspense>
  )
}

function ConsentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authorizationId = searchParams.get('authorization_id')
  
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function init() {
      if (!authorizationId) {
        setError('Falta el ID de autorización.')
        setLoading(false)
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        const currentUrl = encodeURIComponent(window.location.href)
        router.push(`/sign-in?next=${currentUrl}`)
        return
      }
      setUser(user)

      try {
        const { data, error: detailsError } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId)
        if (detailsError) throw detailsError
        setDetails(data)
      } catch (err: any) {
        console.error('Error fetching details:', err)
        setError(err.message || 'No se pudieron obtener los detalles de la aplicación.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [authorizationId, router, supabase])

  const handleApprove = async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase.auth as any).oauth.approveAuthorization(authorizationId)
      if (error) throw error
      window.location.href = data.redirect_to
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase.auth as any).oauth.denyAuthorization(authorizationId)
      if (error) throw error
      window.location.href = data.redirect_to
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: 'var(--clr-navy)', fontWeight: 600 }}>Cargando autorización...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ color: '#e11d48', marginBottom: '1rem' }}>Error de Autorización</h2>
          <p style={{ color: 'var(--clr-navy-md)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => router.push('/')} className="btn" style={{ backgroundColor: 'var(--clr-navy)', color: 'white', width: '100%' }}>Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f1f5f9',
      padding: '1rem' 
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)', 
          padding: '2.5rem 2rem', 
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>OCGC Identity</h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>Servicio de Autenticación Centralizada</p>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#f1f5f9', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--clr-navy)'
            }}>
              {details?.client_name?.charAt(0) || 'A'}
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>
              {details?.client_name || 'Una aplicación externa'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-navy-md)' }}>
              quiere acceder a tu cuenta de OCGC
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            border: '1px solid var(--clr-border)'
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-navy-md)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Permisos solicitados:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(details?.scopes || ['email', 'profile']).map((scope: string) => (
                <li key={scope} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {scope === 'email' ? 'Dirección de correo electrónico' : scope === 'profile' ? 'Información de perfil público' : scope}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-navy-md)' }}>
              Sesión iniciada como <strong>{user?.email}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={handleApprove}
              style={{ 
                padding: '0.875rem', 
                borderRadius: '10px', 
                backgroundColor: 'var(--clr-navy)', 
                color: 'white', 
                fontWeight: 700, 
                border: 'none', 
                cursor: 'pointer',
                transition: 'transform 0.1s'
              }}
            >
              Permitir acceso
            </button>
            <button 
              onClick={handleDeny}
              style={{ 
                padding: '0.875rem', 
                borderRadius: '10px', 
                backgroundColor: 'transparent', 
                color: 'var(--clr-navy-md)', 
                fontWeight: 600, 
                border: '1px solid var(--clr-border)', 
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--clr-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-navy-md)', margin: 0 }}>
            Al permitir el acceso, autorizas a esta aplicación a utilizar tu información de acuerdo con sus términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}
