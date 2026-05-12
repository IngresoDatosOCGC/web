import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Proxy server-side para obtener los detalles de la autorización pendiente.
 * Ahora incluye lógica de fallback para IDs generados de forma anónima.
 */
export async function GET(request: NextRequest) {
  const authorizationId = request.nextUrl.searchParams.get('authorization_id')
  
  if (!authorizationId) {
    return NextResponse.json({ error: 'Missing authorization_id' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  try {
    // Intento 1: Con el token del usuario (lo ideal)
    let res = await fetch(
      `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}`,
      {
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : '',
          'apikey': anonKey,
        },
      }
    )

    // Intento 2: Fallback anónimo si el ID no deja leerse con el token del usuario
    if (!res.ok) {
      console.log('[OAuth Details] Fetch failed with token, trying anonymous fallback...')
      res = await fetch(
        `${supabaseUrl}/auth/v1/oauth/authorizations/${authorizationId}`,
        { headers: { 'apikey': anonKey } }
      )
    }

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch authorization details', details: data },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[OAuth Details] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
