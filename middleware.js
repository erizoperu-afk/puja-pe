import { NextResponse } from 'next/server'

export async function middleware(req) {
  const url = req.nextUrl.pathname
  
  if (url === '/') {
    const cookies = req.cookies.getAll()
    console.log('COOKIES:', JSON.stringify(cookies.map(c => c.name)))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}