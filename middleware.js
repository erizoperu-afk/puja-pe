import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req) {
  const url = req.nextUrl.pathname

  const rutasLibres = ['/login', '/api', '/verificar-celular-pendiente', '/completar-perfil', '/_next', '/favicon', '/reset-password', '/sw.js', '/manifest.json', '/icon']
  if (rutasLibres.some(r => url.startsWith(r))) return NextResponse.next()

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res

  // Admins pasan siempre
  const { data: esAdmin } = await supabase
    .from('admins').select('email').eq('email', session.user.email).maybeSingle()
  if (esAdmin) return res

  const { data: usuario } = await supabase
    .from('usuarios').select('celular_verificado').eq('id', session.user.id).single()

  if (usuario && !usuario.celular_verificado) {
    return NextResponse.redirect(new URL('/verificar-celular-pendiente', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|sw.js|manifest.json).*)'],
}