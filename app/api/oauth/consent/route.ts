import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Procesa la aprobación o denegación de una autorización OAuth.
 * Ahora es simple y estándar: asume que el ID es válido porque el flujo
 * se inició correctamente a través del proxy /api/oauth/authorize.
 */
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

    // Llamada directa a Supabase para dar el consentimiento
    const res = await fetch(
      `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}/consent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ action }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('[OAuth Consent] Error from Supabase:', data)
      return NextResponse.json(
        { error: data.msg || 'Error al procesar el consentimiento', details: data },
        { status: res.status }
      )
    }

    return NextResponse.json(data)

  } catch (err: any) {
    console.error('[OAuth Consent] Fatal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
