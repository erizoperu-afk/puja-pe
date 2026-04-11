import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => req.cookies.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return res

  const url = req.nextUrl.pathname
  const rutasLibres = ['/login', '/api', '/verificar-celular-pendiente', '/_next', '/favicon']
  if (rutasLibres.some(r => url.startsWith(r))) return res

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