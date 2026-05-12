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

    // Intento 1: procesar la acción (aprobar o denegar)
    const attempt1 = await callConsent(authorizationId, session.access_token, anonKey, supabaseUrl, action)
    console.log('[Consent] Attempt 1:', attempt1.status, JSON.stringify(attempt1.data))

    if (attempt1.ok) return NextResponse.json(attempt1.data)

    if (attempt1.data?.error_code !== 'validation_failed') {
      return NextResponse.json(
        { error: attempt1.data?.msg || 'Consent failed', details: attempt1.data },
        { status: attempt1.status }
      )
    }

    // Intento 2: el authorization_id no tiene user_id.
    // Obtener los parámetros originales para reconstruir el flujo con Bearer token.
    console.log('[Consent] Fetching authorization details to reconstruct flow...')
    const detailsRes = await fetch(
      `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
      }
    )
    const details = await detailsRes.json()
    console.log('[Consent] Authorization details:', JSON.stringify(details))

    // Si tenemos los parámetros PKCE, llamar a /authorize con Bearer token
    // para crear un nuevo authorization_id vinculado al usuario autenticado
    if (details.code_challenge) {
      const authorizeParams = new URLSearchParams({
        response_type: 'code',
        client_id: details.client_id || '',
        redirect_uri: details.redirect_uri || '',
        scope: Array.isArray(details.scope) ? details.scope.join(' ') : (details.scope || 'openid'),
        code_challenge: details.code_challenge,
        code_challenge_method: details.code_challenge_method || 'S256',
        state: details.state || '',
      })

      const authorizeRes = await fetch(
        `${supabaseUrl}/auth/v1/oauth/authorize?${authorizeParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey,
          },
          redirect: 'manual',
        }
      )

      const newLocation = authorizeRes.headers.get('location') || ''
      console.log('[Consent] New authorize status:', authorizeRes.status, 'Location:', newLocation)

      // Extraer el nuevo authorization_id del redirect
      const newIdMatch = newLocation.match(/authorization_id=([^&]+)/)
      if (newIdMatch) {
        const newAuthorizationId = newIdMatch[1]
        console.log('[Consent] New authorization_id:', newAuthorizationId)

        const attempt2 = await callConsent(newAuthorizationId, session.access_token, anonKey, supabaseUrl, action)
        console.log('[Consent] Attempt 2:', attempt2.status, JSON.stringify(attempt2.data))

        if (attempt2.ok) return NextResponse.json(attempt2.data)
        return NextResponse.json(
          { error: attempt2.data?.msg || 'Consent failed with new authorization', details: attempt2.data },
          { status: attempt2.status }
        )
      }
    }

    // Fallback: devolver todos los detalles para diagnóstico
    return NextResponse.json(
      {
        error: attempt1.data?.msg || 'Consent failed',
        details: attempt1.data,
        authorizationDetails: details
      },
      { status: attempt1.status }
    )

  } catch (err: any) {
    console.error('[Consent] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
