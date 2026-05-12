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
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      if (!authorizationId) {
        setError('No se ha proporcionado un ID de autorización válido.')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Si no hay sesión, guardamos la URL y mandamos al login
        router.push(`/sign-in?next=${encodeURIComponent(window.location.href)}`)
        return
      }
      setUser(user)

      try {
        const res = await fetch(`/api/oauth/details?authorization_id=${authorizationId}`)
        const data = await res.json()
        
        if (!res.ok) {
          setError(data.error || 'Error al obtener los detalles de la autorización.')
        } else {
          setDetails(data)
        }
      } catch (err: any) {
        setError('Error de conexión al servidor.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [authorizationId, router, supabase])

  const handleApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/oauth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al autorizar')

      window.location.assign(data.redirect_to)
    } catch (err: any) {
      setError(err.message)
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
      if (data?.redirect_to) window.location.assign(data.redirect_to)
      else router.push('/')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading && !error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Procesando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '1rem' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)', padding: '2rem', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>OCGC Identity</h1>
        </div>

        <div style={{ padding: '2rem' }}>
          {error ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#e11d48', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={() => router.push('/')} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--clr-navy)', color: 'white', cursor: 'pointer' }}>
                Volver al inicio
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--clr-navy)', marginBottom: '0.5rem' }}>
                  {details?.client_name || 'Aplicación Externa'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-navy-md)' }}>solicita permiso para acceder a tu cuenta</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--clr-border)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(details?.scopes || ['email', 'profile']).map((scope: string) => (
                    <li key={scope} style={{ fontSize: '0.85rem', color: 'var(--clr-navy)', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {scope}
                    </li>
                  ))}
                </ul>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-navy-md)', marginBottom: '1.5rem' }}>
                Conectado como <strong>{user?.email}</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={handleApprove} disabled={loading} style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--clr-navy)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Autorizar
                </button>
                <button onClick={handleDeny} disabled={loading} style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'transparent', color: 'var(--clr-navy-md)', fontWeight: 600, border: '1px solid var(--clr-border)', cursor: 'pointer' }}>
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
