import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * PROXY CRÍTICO: Punto de entrada OAuth 2.1 para aplicaciones externas.
 *
 * POR QUÉ EXISTE ESTE PROXY:
 * Supabase exige que la llamada a /authorize incluya el Bearer token del usuario
 * para que el authorization_id quede vinculado a su sesión. Sin esto, el
 * authorization_id se crea de forma anónima y Supabase devuelve validation_failed
 * en la pantalla de consentimiento, haciendo imposible completar el flujo.
 *
 * CONFIGURACIÓN REQUERIDA EN LA APP SECUNDARIA:
 * El endpoint de autorización OAuth debe apuntar a ESTE proxy:
 *   https://<tu-app>.vercel.app/api/oauth/authorize
 * NO a: https://<ref>.supabase.co/auth/v1/oauth/authorize
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
  const oauthParams = searchParams.toString()

  if (!session) {
    // Sin sesión: guardar los params OAuth y redirigir al login.
    // Tras el login, sign-in redirige de vuelta aquí con los mismos params
    // y esta vez SÍ habrá sesión para llamar a Supabase con Bearer token.
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('next', `/api/oauth/authorize?${oauthParams}`)
    console.log('[OAuth Proxy] No session — redirecting to sign-in. Params saved:', oauthParams)
    return NextResponse.redirect(signInUrl)
  }

  // Con sesión: construir la URL de Supabase /authorize con los mismos params
  const authorizeUrl = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/oauth/authorize`)
  searchParams.forEach((value, key) => {
    authorizeUrl.searchParams.set(key, value)
  })

  console.log('[OAuth Proxy] User:', session.user.email, '— Calling Supabase authorize with Bearer token')

  // Llamar a Supabase /authorize server-to-server con el Bearer token.
  // Supabase vinculará el authorization_id al usuario autenticado.
  const response = await fetch(authorizeUrl.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    redirect: 'manual',
  })

  const location = response.headers.get('location') || ''

  console.log('[OAuth Proxy] Supabase status:', response.status, '— Location:', location)

  if (!location) {
    const body = await response.text()
    console.error('[OAuth Proxy] No location header. Body:', body)
    return NextResponse.json(
      { error: 'Supabase no devolvió URL de redirección', status: response.status, body },
      { status: 502 }
    )
  }

  // Si Supabase nos redirige al sign-in, no aceptó el Bearer token
  if (location.includes('/sign-in') || location.includes('sign_in')) {
    console.error('[OAuth Proxy] Supabase rechazó el Bearer token y redirigió a sign-in')
    return NextResponse.json(
      { error: 'Supabase no aceptó el Bearer token en /authorize. Verifica la configuración del cliente OAuth.' },
      { status: 502 }
    )
  }

  // Éxito: redirigir al usuario a donde Supabase diga (normalmente la pantalla de consentimiento)
  console.log('[OAuth Proxy] Redirecting to:', location)
  return NextResponse.redirect(location)
}
