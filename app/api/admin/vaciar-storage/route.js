import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let totalBorrados = 0
  let continuar = true

  while (continuar) {
    const { data: archivos, error } = await supabase.storage
      .from('fotos-remates')
      .list('', { limit: 100 })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!archivos || archivos.length === 0) { continuar = false; break }

    const rutas = archivos.map(f => f.name)
    const { error: errorBorrado } = await supabase.storage
      .from('fotos-remates')
      .remove(rutas)

    if (errorBorrado) return Response.json({ error: errorBorrado.message }, { status: 500 })

    totalBorrados += rutas.length
    if (archivos.length < 100) continuar = false
  }

  return Response.json({ ok: true, archivos_borrados: totalBorrados })
}
