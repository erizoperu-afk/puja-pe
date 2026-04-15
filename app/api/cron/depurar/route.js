import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
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

    if (!rematesAEliminar || rematesAEliminar.length === 0) {
      return Response.json({ mensaje: 'No hay remates para eliminar', eliminados: 0 })
    }

    const ids = rematesAEliminar.map(r => r.id)

    await supabase.from('notificaciones').delete().in('remate_id', ids)
    await supabase.from('favoritos').delete().in('remate_id', ids)
    await supabase.from('pujas').delete().in('remate_id', ids)
    await supabase.from('remates').delete().in('id', ids)

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
      mensaje: 'Depuración completada',
      eliminados: ids.length,
      notificados: rematesANotificar?.length || 0
    })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}