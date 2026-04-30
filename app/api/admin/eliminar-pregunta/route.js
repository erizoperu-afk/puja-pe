import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const { preguntaId, adminEmail } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: admin } = await supabase.from('admins').select('email').eq('email', adminEmail).maybeSingle()
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 401 })

  await supabase.from('preguntas').update({ activa: false }).eq('id', preguntaId)
  return Response.json({ ok: true })
}
