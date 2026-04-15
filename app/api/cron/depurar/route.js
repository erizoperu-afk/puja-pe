import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  // Verificar que viene de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hace20dias = new Date()
    hace20dias.setDate(hace20dias.getDate() - 20)
    const fecha20 = hace20dias.toISOString()

    const hace15dias = new Date()
    hace15dias.setDate(hace15dias.getDate() - 15)
    const fecha15 = hace15dias.toISOString()

    // Buscar remates finalizados hace más de 20 días
    const { data: rematesAEliminar } = await supabase
      .from('remates')
      .select('id, titulo, vendedor_id')
      .eq('activo', false)
      .lt('fecha_fin', fecha20)

    if (!rematesAEliminar || rematesAEliminar.length === 0) {
      return Response.json({ mensaje: 'No hay remates para eliminar', eliminados: 0 })
    }

    const ids = rematesAEliminar.map(r => r.id)

    // Eliminar en orden para respetar foreign keys
    await supabase.from('notificaciones').delete().in('remate_id', ids)
    await supabase.from('favoritos').delete().in('remate_id', ids)
    await supabase.from('pujas').delete().in('remate_id', ids)
    await supabase.from('remates').delete().in('id', ids)

    // Buscar remates que vencen en 5 días (finalizados hace 15 días) para notificar
    const { data: rematesANotificar } = await supabase
      .from('remates')
      .select('id, titulo, vendedor_id')
      .eq('activo', false)
      .gte('fecha_fin', fecha15)
      .lt('fecha_fin', new Date(hace15dias.getTime() + 24 * 60 * 60 * 1000).toISOString())

    // Insertar notificaciones de aviso
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
      mensaje: 'Depuración completada',
      eliminados: ids.length,
      notificados: rematesANotificar?.length || 0
    })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}