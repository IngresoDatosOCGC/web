import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Proxy server-side para el endpoint /authorize de Supabase OAuth 2.1.
 * 
 * El browser no puede autenticarse en supabase.co directamente (cookies cross-domain).
 * Este proxy actúa como intermediario: lee la sesión SSR del usuario y llama a
 * Supabase /authorize con el Bearer token, obteniendo un authorization_id válido
 * vinculado al usuario autenticado.
 */
export async function GET(request: NextRequest) {
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

  // Recoger todos los query params originales del authorize request
  const searchParams = request.nextUrl.searchParams
  const authorizeUrl = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/oauth/authorize`)
  searchParams.forEach((value, key) => {
    authorizeUrl.searchParams.set(key, value)
  })

  if (!session) {
    // Sin sesión: redirigir al login, guardando la URL de Supabase para después
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('next', `/api/oauth/authorize?${searchParams.toString()}`)
    return NextResponse.redirect(signInUrl)
  }

  // Con sesión: llamar a Supabase /authorize server-to-server con el Bearer token.
  // Supabase creará un authorization_id vinculado al usuario autenticado.
  const response = await fetch(authorizeUrl.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    redirect: 'manual', // No seguir la redirección automáticamente
  })

  // Supabase devuelve un 302 con Location apuntando a nuestro consent
  const location = response.headers.get('location')

  if (!location) {
    return NextResponse.json(
      { error: 'No redirect location from Supabase authorize' },
      { status: 502 }
    )
  }

  // Redirigir al browser a la URL de consent con el authorization_id válido
  return NextResponse.redirect(location)
}
