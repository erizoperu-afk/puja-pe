import { supabase } from '../../supabase'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('cookie') || ''
    
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