import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const { nombre_organizacion, codigo_acceso, whatsapp, email, usuario_id: usuarioIdDirecto, adminEmail } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: admin } = await supabase.from('admins').select('email').eq('email', adminEmail).maybeSingle()
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const usuario_id = usuarioIdDirecto || null

  const { data, error } = await supabase.from('organizadores_especiales').insert({
    nombre_organizacion: nombre_organizacion.trim(),
    codigo_acceso: codigo_acceso.trim().toUpperCase(),
    whatsapp: whatsapp?.trim() || null,
    email: email?.trim() || null,
    usuario_id
  }).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, organizador: data })
}
