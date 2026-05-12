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
  const [errorType, setErrorType] = useState<'anonymous_auth' | 'generic' | null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      if (!authorizationId) {
        setError('No se ha proporcionado un ID de autorización válido.')
        setErrorType('generic')
        setLoading(false)
        return
      }

      console.log('Iniciando validación de ID:', authorizationId)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        // Sin sesión: guardar la URL actual y mandar al login
        const supabaseAuthorizeUrl = document.referrer && document.referrer.includes('/auth/v1/oauth/authorize')
          ? document.referrer
          : sessionStorage.getItem('oauth_authorize_url') || ''
        
        if (supabaseAuthorizeUrl) {
          sessionStorage.setItem('oauth_authorize_url', supabaseAuthorizeUrl)
          router.push(`/sign-in?next=${encodeURIComponent(supabaseAuthorizeUrl)}`)
        } else {
          router.push(`/sign-in?next=${encodeURIComponent(window.location.href)}`)
        }
        return
      }
      setUser(user)

      try {
        // Obtener los detalles del authorization vía nuestro proxy server-side
        const res = await fetch(`/api/oauth/details?authorization_id=${authorizationId}`)
        const data = await res.json()
        
        if (!res.ok) {
          // validation_failed = el authorization_id fue creado sin sesión de usuario.
          // La app secundaria debe usar /api/oauth/authorize como endpoint, no Supabase directamente.
          if (res.status === 400 || data?.error?.includes('validation')) {
            setErrorType('anonymous_auth')
            setError('El ID de autorización no es válido porque fue generado sin una sesión de usuario activa.')
          } else {
            setErrorType('generic')
            setError(data.error || 'Error al obtener los detalles de la autorización.')
          }
        } else {
          console.log('[OAuth Frontend] Detalles cargados:', JSON.stringify(data, null, 2))
          setDetails(data)
        }
      } catch (err: any) {
        console.error('Error al obtener detalles OAuth:', err)
        setErrorType('generic')
        setError('Error de conexión al servidor. Inténtalo de nuevo.')
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
      console.log('Aprobando autorización para:', authorizationId)
      
      const res = await fetch('/api/oauth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authorizationId,
          // Enviamos los detalles para que el servidor pueda reconstruir el flujo si el ID original falla
          details: {
            client_id: details.client_id || details.clientId,
            redirect_uri: details.redirect_uri || details.redirectUri,
            scope: details.scope || (details.scopes ? details.scopes.join(' ') : 'openid'),
            code_challenge: details.code_challenge || details.codeChallenge,
            code_challenge_method: details.code_challenge_method || details.codeChallengeMethod || 'S256',
            state: details.state
          }
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Error del servidor OAuth:', data)
        throw new Error(data.error || 'Error al procesar la aprobación.')
      }

      if (!data.redirect_to) {
        throw new Error('Supabase no devolvió una URL de redirección.')
      }

      console.log('Redirigiendo a la app externa:', data.redirect_to)
      window.location.assign(data.redirect_to)

    } catch (err: any) {
      console.error('Error fatal en handleApprove:', err)
      setError(err.message || 'Error al procesar la aprobación.')
      setErrorType('generic')
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/oauth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationId, action: 'deny' }),
      })
      const data = await res.json()
      
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

  // Panel de error para authorization_id anónimo (app secundaria mal configurada)
  if (errorType === 'anonymous_auth') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '1rem' }}>
        <div style={{ maxWidth: '520px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', padding: '2rem', textAlign: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Error de Configuración OAuth</h1>
          </div>
          <div style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h2 style={{ fontSize: '1rem', color: 'var(--clr-navy)', marginBottom: '0.75rem' }}>
                La solicitud no puede procesarse
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--clr-navy-md)', lineHeight: 1.6 }}>
                La aplicación externa inició el flujo OAuth directamente con Supabase en lugar de usar el punto de entrada correcto.
              </p>
            </div>

            <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#854d0e', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                La app secundaria debe usar:
              </p>
              <code style={{ display: 'block', fontSize: '0.75rem', color: '#1e293b', wordBreak: 'break-all', backgroundColor: '#fefce8', padding: '0.5rem', borderRadius: '6px' }}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/authorize
              </code>
              <p style={{ fontSize: '0.75rem', color: '#854d0e', marginTop: '0.5rem' }}>
                En lugar de la URL directa de Supabase.
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', backgroundColor: 'var(--clr-navy)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Volver al inicio
            </button>
          </div>
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
