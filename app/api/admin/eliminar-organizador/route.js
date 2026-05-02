import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const { organizadorId, adminEmail } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: admin } = await supabase.from('admins').select('email').eq('email', adminEmail).maybeSingle()
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data: rematesActivos } = await supabase
    .from('remates_especiales')
    .select('id')
    .eq('organizador_id', organizadorId)
    .eq('activo', true)

  if (rematesActivos && rematesActivos.length > 0) {
    return Response.json({
      error: `No se puede eliminar: el organizador tiene ${rematesActivos.length} remate(s) activo(s). Elimínalos primero desde su panel.`
    }, { status: 400 })
  }

  const { error } = await supabase.from('organizadores_especiales').delete().eq('id', organizadorId)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}
