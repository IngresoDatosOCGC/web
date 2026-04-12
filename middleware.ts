import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Actualizar la sesión (refresh token si es necesario)
  let response = await updateSession(request)
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const isMiembrosPath = url.pathname.startsWith('/miembros')
  const isApiPath = url.pathname.startsWith('/api')
  
  // Lista de exclusión de rutas públicas (basado en el original)
  const publicRoutes = [
    '/api/auth/register-musician',
    '/api/auth/validate-invite',
    '/api/roles',
    '/api/agrupaciones',
    '/api/unete',
    '/unete',
    '/sign-in',
    '/sign-up'
  ]

  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  // Si requiere protección y no hay usuario, redirigir a sign-in
  if ((isMiembrosPath || isApiPath) && !isPublicRoute && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Redirección forzada de /miembros a /miembros/tablon
  if (user && url.pathname === "/miembros") {
    return NextResponse.redirect(new URL("/miembros/tablon", request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
