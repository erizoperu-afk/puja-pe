import { NextResponse } from 'next/server'

export async function middleware(req) {
  const url = req.nextUrl.pathname

  // Rutas libres
  const rutasLibres = ['/login', '/api', '/verificar-celular-pendiente', '/_next', '/favicon']
  if (rutasLibres.some(r => url.startsWith(r))) return NextResponse.next()

  // Verificar cookie de sesión de Supabase
  const token = req.cookies.get('sb-access-token')?.value || 
                req.cookies.get('sb-jytrnevfpdvxpaherzub-auth-token')?.value

  if (!token) return NextResponse.next()

  // Verificar celular en Supabase via API
  const res = await fetch(`${req.nextUrl.origin}/api/verificar-sesion`, {
    headers: { 'Cookie': req.headers.get('cookie') || '' }
  })

  if (res.ok) {
    const data = await res.json()
    if (data.redirigir) {
      return NextResponse.redirect(new URL('/verificar-celular-pendiente', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}