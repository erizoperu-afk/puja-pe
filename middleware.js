import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const RUTAS_PROTEGIDAS = ['/vendedor', '/mensajes', '/comprador', '/favoritos', '/perfil']
const RUTAS_ADMIN = ['/admin']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const esProtegida = RUTAS_PROTEGIDAS.some(r => pathname.startsWith(r))
  const esAdmin = RUTAS_ADMIN.some(r => pathname.startsWith(r))

  if (!esProtegida && !esAdmin) return NextResponse.next()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si es admin, tiene acceso a todo
  const { data: admin } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session.user.email)
    .maybeSingle()

  if (admin) return response

  // Bloquear acceso a rutas de admin para no-admins
  if (esAdmin) return NextResponse.redirect(new URL('/', request.url))

  // Verificar celular para rutas protegidas
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('celular_verificado')
    .eq('id', session.user.id)
    .single()

  if (!usuario?.celular_verificado) {
    return NextResponse.redirect(new URL('/verificar-celular-pendiente', request.url))
  }

  return response
}

export const config = {
  matcher: ['/vendedor/:path*', '/mensajes/:path*', '/comprador/:path*', '/favoritos/:path*', '/perfil/:path*', '/admin/:path*'],
}
