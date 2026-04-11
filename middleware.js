import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión, dejar pasar
  if (!session) return res

  // Rutas que no necesitan verificación
  const url = req.nextUrl.pathname
  const rutasLibres = ['/login', '/api', '/verificar-celular-pendiente', '/_next', '/favicon']
  if (rutasLibres.some(r => url.startsWith(r))) return res

  // Verificar si el celular está verificado
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('celular_verificado')
    .eq('id', session.user.id)
    .single()

  if (usuario && !usuario.celular_verificado) {
    return NextResponse.redirect(new URL('/verificar-celular-pendiente', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}