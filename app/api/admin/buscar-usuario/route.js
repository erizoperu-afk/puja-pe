import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const codigo = searchParams.get('codigo')?.toUpperCase().replace('#', '').trim()
  const adminEmail = searchParams.get('adminEmail')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: admin } = await supabase.from('admins').select('email').eq('email', adminEmail).maybeSingle()
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 401 })

  if (!codigo || codigo.length < 6) return Response.json({ error: 'Código inválido' }, { status: 400 })

  const { data: perfiles } = await supabase.from('usuarios').select('id, nombre, apellido, nickname, celular, celular_verificado')

  const match = (perfiles || []).find(u =>
    u.id.replace(/-/g, '').substring(0, 6).toUpperCase() === codigo
  )

  if (!match) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const authResult = await supabase.auth.admin.getUserById(match.id)
  const email = authResult.data?.user?.email || ''

  return Response.json({ usuario: { ...match, email } })
}
