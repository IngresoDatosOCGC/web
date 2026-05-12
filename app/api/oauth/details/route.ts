import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Proxy server-side para obtener los detalles de la autorización pendiente (app name, scopes, etc).
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

  if (!session) {
    return NextResponse.json({ error: 'No authenticated session' }, { status: 401 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/oauth/authorizations/${authorizationId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.msg || 'Failed to fetch authorization details' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[OAuth Details] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
