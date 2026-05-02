import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const adminEmail = searchParams.get('adminEmail')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: admin } = await supabase.from('admins').select('email').eq('email', adminEmail).maybeSingle()
  if (!admin) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const [authResult, { data: perfiles }, { data: creditosData }, { data: pujasData }, { data: rematesData }] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('usuarios').select('*').order('created_at', { ascending: false }),
    supabase.from('creditos').select('*'),
    supabase.from('pujas').select('usuario_id'),
    supabase.from('remates').select('vendedor_id'),
  ])

  const authUsers = authResult.data?.users || []

  const usuarios = (perfiles || []).map(p => {
    const authUser = authUsers.find(u => u.id === p.id)
    return {
      ...p,
      email: authUser?.email || '',
      creditos: creditosData?.find(c => c.usuario_id === p.id)?.saldo ?? 0,
      totalPujas: pujasData?.filter(pu => pu.usuario_id === p.id).length || 0,
      totalRemates: rematesData?.filter(r => r.vendedor_id === p.id).length || 0,
    }
  })

  return Response.json({ usuarios })
}
