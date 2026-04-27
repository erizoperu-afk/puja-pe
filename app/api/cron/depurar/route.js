import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  // Seguridad: solo Vercel puede llamar este endpoint
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // ← cambiado de ANON_KEY
  )

  try {
    const ahora = new Date().toISOString()

    // ✅ NUEVO: Cerrar remates vencidos
    const { data: rematesCerrados, error: errorCierre } = await supabase
      .from('remates')
      .update({ activo: false })
      .lt('fecha_fin', ahora)
      .eq('activo', true)
      .select('id, titulo, vendedor_id')

    if (errorCierre) throw new Error('Error cerrando remates: ' + errorCierre.message)

    // Notificar a vendedores cuyos remates vencieron
    if (rematesCerrados && rematesCerrados.length > 0) {
      const notifVencidos = rematesCerrados.map(r => ({
        usuario_id: r.vendedor_id,
        remate_id: r.id,
        mensaje: `Tu remate "${r.titulo}" ha finalizado.`,
        leida: false
      }))
      await supabase.from('notificaciones').insert(notifVencidos)
    }

    // EXISTENTE: Eliminar remates vencidos hace más de 20 días
    const hace20dias = new Date()
    hace20dias.setDate(hace20dias.getDate() - 20)
    const fecha20 = hace20dias.toISOString()

    const hace15dias = new Date()
    hace15dias.setDate(hace15dias.getDate() - 15)
    const fecha15 = hace15dias.toISOString()

    const { data: rematesAEliminar } = await supabase
      .from('remates')
      .select('id, titulo, vendedor_id')
      .eq('activo', false)
      .lt('fecha_fin', fecha20)

    let eliminados = 0
    if (rematesAEliminar && rematesAEliminar.length > 0) {
      const ids = rematesAEliminar.map(r => r.id)
      await supabase.from('notificaciones').delete().in('remate_id', ids)
      await supabase.from('favoritos').delete().in('remate_id', ids)
      await supabase.from('pujas').delete().in('remate_id', ids)
      await supabase.from('remates').delete().in('id', ids)
      eliminados = ids.length
    }

    // EXISTENTE: Notificar remates próximos a eliminarse (15 días vencidos)
    const { data: rematesANotificar } = await supabase
      .from('remates')
      .select('id, titulo, vendedor_id')
      .eq('activo', false)
      .gte('fecha_fin', fecha15)
      .lt('fecha_fin', new Date(hace15dias.getTime() + 24 * 60 * 60 * 1000).toISOString())

    if (rematesANotificar && rematesANotificar.length > 0) {
      const notificaciones = rematesANotificar.map(r => ({
        usuario_id: r.vendedor_id,
        remate_id: r.id,
        mensaje: `Tu publicación "${r.titulo}" será eliminada en 5 días. Republícala si aún quieres venderla.`,
        leida: false
      }))
      await supabase.from('notificaciones').insert(notificaciones)
    }

    return Response.json({
      ok: true,
      cerrados: rematesCerrados?.length || 0,
      eliminados,
      notificados: rematesANotificar?.length || 0
    })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}