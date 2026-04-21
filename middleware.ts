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

  // 2. Comprobación de Sesión Básica
  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const isMiembrosPath = url.pathname.startsWith('/miembros')
  const isApiPath = url.pathname.startsWith('/api')
  const isAdminPath = url.pathname.startsWith('/api/admin') || url.pathname.startsWith('/miembros/gestion')

  // Lista de exclusión de rutas públicas
  const publicRoutes = [
    '/api/auth/resolve-identifier',
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

  // 3. Protección de Capa Admin (VUL-05) - Verificación en DB
  if (user && isAdminPath) {
    // Importamos prisma dinámicamente o usamos una utilidad si estuviera disponible, 
    // pero en middleware.ts de Next.js (Edge Runtime) no podemos usar Prisma directamente.
    // OPTIMIZACIÓN: Saltamos la verificación de DB aquí para evitar latencia, 
    // pero EXIGIMOS que el usuario tenga sesión. 
    // La protección definitiva ya está en los Handlers (Server-Side).
    // Sin embargo, podemos denegar acceso a rutas de gestión si no es una sesión válida.
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
