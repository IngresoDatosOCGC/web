import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { authorizationId } = await request.json()

    if (!authorizationId) {
      return NextResponse.json({ error: 'Missing authorizationId' }, { status: 400 })
    }

    // Crear cliente Supabase server-side para leer la sesión de las cookies
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

    // Obtener sesión del usuario autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No authenticated session' }, { status: 401 })
    }

    // Llamar al endpoint de Supabase server-to-server (sin restricciones CORS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const response = await fetch(
      `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}/consent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({}),
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error('[OAuth Consent API] Supabase error:', responseData)
      return NextResponse.json(
        { error: responseData.msg || responseData.message || 'Consent failed', details: responseData },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)
  } catch (err: any) {
    console.error('[OAuth Consent API] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
