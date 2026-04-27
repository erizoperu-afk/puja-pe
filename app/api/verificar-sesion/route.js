import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    if (!session) return Response.json({ redirigir: false })

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('celular_verificado')
      .eq('id', session.user.id)
      .single()

    // Admins nunca redirigir
    const { data: esAdmin } = await supabase
      .from('admins')
      .select('email')
      .eq('email', session.user.email)
      .maybeSingle()

    if (esAdmin) return Response.json({ redirigir: false })

    return Response.json({ redirigir: usuario && !usuario.celular_verificado })
  } catch {
    return Response.json({ redirigir: false })
  }
}