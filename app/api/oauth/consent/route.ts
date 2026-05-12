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
    const body = await request.json()
    const { authorizationId, action = 'approve', details: providedDetails } = body
    
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

    // INTENTO 1: Aprobar el ID original
    const attempt1 = await callConsent(authorizationId, session.access_token, anonKey, supabaseUrl, action)
    console.log('[OAuth Debug] Attempt 1 Status:', attempt1.status)
    
    if (attempt1.ok) return NextResponse.json(attempt1.data)

    // INTENTO 2: Reconstrucción agresiva
    console.log('[OAuth Debug] Starting reconstruction...')

    // Helper para buscar parámetros en cualquier nivel del objeto
    const getParam = (obj: any, keys: string[]) => {
      if (!obj) return undefined
      for (const key of keys) {
        if (obj[key]) return obj[key]
      }
      // Búsqueda en primer nivel de objetos anidados (ej: details.client.id)
      for (const k in obj) {
        if (typeof obj[k] === 'object') {
          for (const key of keys) {
            if (obj[k][key]) return obj[k][key]
          }
        }
      }
      return undefined
    }

    const clientId = getParam(providedDetails, ['client_id', 'clientId', 'id'])
    const redirectUri = getParam(providedDetails, ['redirect_uri', 'redirectUri', 'uri'])
    const scope = getParam(providedDetails, ['scope', 'scopes'])
    const codeChallenge = getParam(providedDetails, ['code_challenge', 'codeChallenge'])
    const codeChallengeMethod = getParam(providedDetails, ['code_challenge_method', 'codeChallengeMethod'])
    const state = getParam(providedDetails, ['state'])

    if (!clientId) {
      console.error('[OAuth Debug] Reconstruction failed: Missing Client ID in', providedDetails)
      return NextResponse.json({ 
        error: 'El ID de autorización es inválido y no pudo ser recuperado automágicamente.',
        details_received: providedDetails 
      }, { status: 400 })
    }

    const authorizeParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri || '',
      scope: Array.isArray(scope) ? scope.join(' ') : (scope || 'openid'),
      code_challenge: codeChallenge || '',
      code_challenge_method: codeChallengeMethod || 'S256',
      state: state || '',
    })

    console.log('[OAuth Debug] Re-authorizing with params:', authorizeParams.toString())

    const newAuthRes = await fetch(`${supabaseUrl}/auth/v1/oauth/authorize?${authorizeParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': anonKey },
      redirect: 'manual',
    })

    const location = newAuthRes.headers.get('location') || ''
    console.log('[OAuth Debug] New Authorize Location:', location)
    const newIdMatch = location.match(/authorization_id=([^&]+)/)
    
    if (!newIdMatch) {
      return NextResponse.json({ error: 'No se pudo generar un nuevo ID tras reconstrucción.', location }, { status: 502 })
    }

    const newId = newIdMatch[1]
    const attempt2 = await callConsent(newId, session.access_token, anonKey, supabaseUrl, action)
    return NextResponse.json(attempt2.data, { status: attempt2.status })

  } catch (err: any) {
    console.error('[OAuth Debug] Fatal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
