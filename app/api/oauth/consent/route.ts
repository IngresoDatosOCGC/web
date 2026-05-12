import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function callConsent(authorizationId: string, token: string, anonKey: string, supabaseUrl: string, action: string = 'approve') {
  const res = await fetch(
    `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}/consent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ action }),
    }
  )
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export async function POST(request: NextRequest) {
  try {
    const { authorizationId, action = 'approve' } = await request.json()
    if (!authorizationId) {
      return NextResponse.json({ error: 'Missing authorizationId' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No authenticated session' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // INTENTO 1: Aprobar el ID tal cual viene
    const attempt1 = await callConsent(authorizationId, session.access_token, anonKey, supabaseUrl, action)
    
    if (attempt1.ok) return NextResponse.json(attempt1.data)

    // Si falló por algo que no sea "validation_failed", abortamos
    if (attempt1.data?.error_code !== 'validation_failed' && attempt1.status !== 400) {
      return NextResponse.json(attempt1.data, { status: attempt1.status })
    }

    // INTENTO 2: Auto-Reconstrucción (El ID es anónimo y Supabase no deja aprobarlo)
    console.log('[OAuth Consent] ID is anonymous. Attempting reconstruction...')

    // Paso A: Obtener detalles del ID original. 
    // Truco: Si falla con el Bearer token, probamos SIN token (algunos IDs anónimos solo se dejan leer así)
    let detailsRes = await fetch(`${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': anonKey }
    })
    
    if (!detailsRes.ok) {
      console.log('[OAuth Consent] Details failed with token, trying anonymous fetch...')
      detailsRes = await fetch(`${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}`, {
        headers: { 'apikey': anonKey }
      })
    }

    const details = await detailsRes.json()
    
    if (!detailsRes.ok || !details.client_id) {
      console.error('[OAuth Consent] Could not recover original params:', details)
      return NextResponse.json({ 
        error: 'El ID de autorización es inválido y no pudo ser recuperado. Por favor, reinicia el flujo desde la aplicación secundaria.',
        details 
      }, { status: 400 })
    }

    // Paso B: Crear un NUEVO ID de autorización vinculado al usuario actual
    console.log('[OAuth Consent] Re-authorizing for client:', details.client_id)
    const authorizeParams = new URLSearchParams({
      response_type: 'code',
      client_id: details.client_id,
      redirect_uri: details.redirect_uri,
      scope: Array.isArray(details.scope) ? details.scope.join(' ') : (details.scope || 'openid'),
      code_challenge: details.code_challenge || '',
      code_challenge_method: details.code_challenge_method || 'S256',
      state: details.state || '',
    })

    const newAuthRes = await fetch(`${supabaseUrl}/auth/v1/oauth/authorize?${authorizeParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': anonKey },
      redirect: 'manual',
    })

    const location = newAuthRes.headers.get('location') || ''
    const newIdMatch = location.match(/authorization_id=([^&]+)/)
    
    if (!newIdMatch) {
      return NextResponse.json({ error: 'No se pudo generar un nuevo ID de sesión.', location }, { status: 502 })
    }

    const newId = newIdMatch[1]
    console.log('[OAuth Consent] New ID generated:', newId)

    // Paso C: Aprobar el NUEVO ID automáticamente
    const attempt2 = await callConsent(newId, session.access_token, anonKey, supabaseUrl, action)
    return NextResponse.json(attempt2.data, { status: attempt2.status })

  } catch (err: any) {
    console.error('[OAuth Consent] Fatal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
