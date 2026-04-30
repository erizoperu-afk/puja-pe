import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const body = await request.json()
  const { organizadorId, userEmail, ...datos } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Verificar que el usuario es admin o el organizador asignado
  const { data: admin } = await supabase.from('admins').select('email').eq('email', userEmail).maybeSingle()
  const { data: org } = await supabase.from('organizadores_especiales')
    .select('usuario_id')
    .eq('id', organizadorId)
    .eq('activo', true)
    .single()

  if (!org) return Response.json({ error: 'Organizador no encontrado' }, { status: 404 })

  const { data: usuario } = await supabase.from('usuarios').select('id').eq('id', org.usuario_id).maybeSingle()
  const esOrganizadorAsignado = usuario && org.usuario_id

  if (!admin && !esOrganizadorAsignado) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase.from('remates_especiales').insert({
    organizador_id: organizadorId,
    ...datos
  }).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, remate: data })
}
