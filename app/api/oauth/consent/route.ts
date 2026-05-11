import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { authorizationId } = await request.json()

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

    // Intentar aprobación directa
    const response = await fetch(
      `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}/consent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ action: 'approve' }),
      }
    )

    const responseData = await response.json()
    console.log('[OAuth Consent] Status:', response.status, 'Body:', JSON.stringify(responseData))

    if (response.ok) {
      return NextResponse.json(responseData)
    }

    // Si falla por validation_failed, intentar refresco de sesión
    if (responseData.error_code === 'validation_failed') {
      console.warn('[OAuth Consent] validation_failed - intentando con token refrescado')
      
      const { data: refreshed } = await supabase.auth.refreshSession()
      if (refreshed.session) {
        const retry = await fetch(
          `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}/consent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshed.session.access_token}`,
              'apikey': anonKey,
            },
            body: JSON.stringify({ action: 'approve' }),
          }
        )
        const retryData = await retry.json()
        console.log('[OAuth Consent] Retry status:', retry.status, 'Body:', JSON.stringify(retryData))
        if (retry.ok) return NextResponse.json(retryData)
        return NextResponse.json(
          { error: retryData.msg || 'Consent failed after refresh', details: retryData },
          { status: retry.status }
        )
      }
    }

    return NextResponse.json(
      { error: responseData.msg || 'Consent failed', details: responseData },
      { status: response.status }
    )
  } catch (err: any) {
    console.error('[OAuth Consent] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
