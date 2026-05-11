'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
  const initialized = typeof window !== 'undefined' ? (window as any)._oauth_init : false

  const supabase = createClient()

  useEffect(() => {
    // Evitar doble ejecución en React Strict Mode
    if ((window as any)._oauth_init) return
    (window as any)._oauth_init = true

    async function init() {
      if (!authorizationId) {
        setError('No se ha proporcionado un ID de autorización válido.')
        setLoading(false)
        return
      }

      console.log('Iniciando validación de ID:', authorizationId)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        const currentUrl = encodeURIComponent(window.location.href)
        router.push(`/sign-in?next=${currentUrl}`)
        return
      }
      setUser(user)

      try {
        // Obtenemos los detalles de la petición de la app externa
        const { data, error: detailsError } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId)
        if (detailsError) throw detailsError
        setDetails(data)
      } catch (err: any) {
        console.error('Error al obtener detalles OAuth:', err)
        setError('Error al conectar con el servidor OAuth de Supabase. Verifica la configuración en el Dashboard.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [authorizationId, router, supabase])

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    try {
      // Aseguramos que la sesión está fresca antes de aprobar
      await supabase.auth.getSession()
      
      console.log('Aprobando autorización para:', authorizationId)
      const { data, error } = await (supabase.auth as any).oauth.approveAuthorization(authorizationId)
      
      if (error) {
        console.error('Error de Supabase al aprobar:', error)
        throw error
      }

      if (!data?.redirect_to) {
        throw new Error('Supabase no devolvió una URL de redirección.')
      }

      console.log('Redirigiendo a la app externa:', data.redirect_to)
      
      // IMPORTANTE: Asegurarnos de que la redirección sea exitosa
      window.location.assign(data.redirect_to)
      
    } catch (err: any) {
      console.error('Error fatal en handleApprove:', err)
      setError(err.message || 'Error al procesar la aprobación.')
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase.auth as any).oauth.denyAuthorization(authorizationId)
      if (error) throw error
      if (data?.redirect_to) {
        window.location.assign(data.redirect_to)
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading && !error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--clr-navy)', fontWeight: 600 }}>Procesando autorización...</p>
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
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Banner de Identidad */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)', 
          padding: '2rem', 
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>OCGC Identity</h1>
        </div>

        <div style={{ padding: '2rem' }}>
          {error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#e11d48', fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--clr-navy)', marginBottom: '1rem' }}>Algo salió mal</h2>
              <p style={{ color: 'var(--clr-navy-md)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--clr-navy)', color: 'white', cursor: 'pointer' }}>
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '56px', height: '56px', backgroundColor: '#e2e8f0', borderRadius: '12px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                  fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-navy)'
                }}>
                  {details?.client_name?.charAt(0) || 'A'}
                </div>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>
                  {details?.client_name || 'Aplicación Externa'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-navy-md)' }}>
                  solicita permiso para acceder a tu cuenta
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--clr-border)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-navy-md)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Podrá acceder a:
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(details?.scopes || ['email', 'profile']).map((scope: string) => (
                    <li key={scope} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--clr-navy)', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {scope === 'email' ? 'Correo electrónico' : scope === 'profile' ? 'Perfil público' : scope}
                    </li>
                  ))}
                </ul>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-navy-md)', marginBottom: '1.5rem' }}>
                Conectado como <strong>{user?.email}</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  style={{ 
                    padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--clr-navy)', 
                    color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Procesando...' : 'Autorizar'}
                </button>
                <button 
                  onClick={handleDeny}
                  disabled={loading}
                  style={{ 
                    padding: '1rem', borderRadius: '10px', backgroundColor: 'transparent', 
                    color: 'var(--clr-navy-md)', fontWeight: 600, border: '1px solid var(--clr-border)', 
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
