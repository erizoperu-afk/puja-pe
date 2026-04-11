import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return Response.json({ redirigir: false })

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('celular_verificado')
      .eq('id', session.user.id)
      .single()

    return Response.json({ redirigir: usuario && !usuario.celular_verificado })
  } catch {
    return Response.json({ redirigir: false })
  }
}