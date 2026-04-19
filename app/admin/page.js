'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

const POR_PAGINA = 6

export default function PanelAdmin() {
  const [tab, setTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [remates, setRemates] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [stats, setStats] = useState({})
  const [cargando, setCargando] = useState(true)
  const [autorizado, setAutorizado] = useState(false)
  const [creditosEditar, setCreditosEditar] = useState({})
  const [usuarioDetalle, setUsuarioDetalle] = useState(null)
  const [pujasPorUsuario, setPujasPorUsuario] = useState([])
  const [rematesPorUsuario, setRematesPorUsuario] = useState([])
  const [modoDetalle, setModoDetalle] = useState(null)
  const [configBeta, setConfigBeta] = useState(true)
  const [paquetes, setPaquetes] = useState([
    { id: 1, nombre: 'Básico',    creditos: 5,  precio: 25  },
    { id: 2, nombre: 'Standard',  creditos: 15, precio: 60  },
    { id: 3, nombre: 'Premium',   creditos: 30, precio: 100 },
  ])
  const [editandoPaquete, setEditandoPaquete] = useState(null)
  const [sessionUser, setSessionUser] = useState(null)
  const [respuesta, setRespuesta] = useState({})
  const [respondiendo, setRespondiendo] = useState(null)
  const [pendientesVerificacion, setPendientesVerificacion] = useState([])
  const [pagina, setPagina] = useState(1)

  useEffect(() => { verificarAdmin() }, [])
  useEffect(() => { setPagina(1) }, [tab])

  async function verificarAdmin() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    setSessionUser(session.user)
    const { data: admin } = await supabase
      .from('admins').select('email').eq('email', session.user.email).single()
    if (!admin) { window.location.href = '/'; return }
    setAutorizado(true)
    cargarDatos()
  }

  async function suscribirPush() {
    try {
      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BG4GwEVFLeJEiIj7bCse6-B7oeHVONoWiDjeRU7JMpCMGM7A6geqwS0qTL7NiLtPlxE3OtXimux4vg4JFKJeIyE'
      })
      await fetch('/api/push/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suscripcion, admin_email: sessionUser?.email })
      })
      alert('✅ Notificaciones push activadas')
    } catch (error) {
      alert('Error al activar notificaciones: ' + error.message)
    }
  }

  async function enviarPushAdmin(titulo, mensaje) {
    await fetch('/api/push/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, mensaje })
    })
  }

  async function cargarDatos() {
    const { data: usuariosData } = await supabase
      .from('usuarios').select('*').order('created_at', { ascending: false })
    const { data: creditosData } = await supabase.from('creditos').select('*')
    const { data: rematesData } = await supabase
      .from('remates').select('*').order('created_at', { ascending: false })
    const { data: pujasData } = await supabase.from('pujas').select('*')

    const { data: mensajesRaw } = await supabase
      .from('mensajes').select('*').order('created_at', { ascending: false })
    const userIdsMensajes = [...new Set((mensajesRaw || []).map(m => m.usuario_id))]
    const { data: usuariosMensajes } = await supabase
      .from('usuarios').select('id, nickname').in('id', userIdsMensajes)
    const mensajesConNick = (mensajesRaw || []).map(m => ({
      ...m,
      usuarios: { nickname: usuariosMensajes?.find(u => u.id === m.usuario_id)?.nickname || 'Usuario' }
    }))

    const usuariosConCreditos = (usuariosData || []).map(u => ({
      ...u,
      creditos: creditosData?.find(c => c.usuario_id === u.id)?.saldo ?? 0,
      totalPujas: pujasData?.filter(p => p.usuario_id === u.id).length || 0,
      totalRemates: rematesData?.filter(r => r.vendedor_id === u.id).length || 0,
    }))

    setUsuarios(usuariosConCreditos)
    setRemates(rematesData || [])
    setMensajes(mensajesConNick)
    setStats({
      totalUsuarios: usuariosData?.length || 0,
      totalRemates: rematesData?.length || 0,
      rematesActivos: rematesData?.filter(r => r.activo).length || 0,
      totalPujas: pujasData?.length || 0,
    })
    setPendientesVerificacion((usuariosData || []).filter(u => !u.celular_verificado))
    setCargando(false)
  }

  async function cargarMensajes() {
    const { data: mensajesRaw } = await supabase
      .from('mensajes').select('*').order('created_at', { ascending: false })
    if (!mensajesRaw) { setMensajes([]); return }
    const userIdsMensajes = [...new Set(mensajesRaw.map(m => m.usuario_id))]
    const { data: usuariosMensajes } = await supabase
      .from('usuarios').select('id, nickname').in('id', userIdsMensajes)
    setMensajes(mensajesRaw.map(m => ({
      ...m,
      usuarios: { nickname: usuariosMensajes?.find(u => u.id === m.usuario_id)?.nickname || 'Usuario' }
    })))
  }

  async function responderMensaje(mensajeId) {
    if (!respuesta[mensajeId]?.trim()) return
    await supabase.from('mensajes').update({
      respuesta: respuesta[mensajeId],
      respondido: true,
      respondido_at: new Date().toISOString()
    }).eq('id', mensajeId)
    setRespondiendo(null)
    cargarMensajes()
  }

  async function verDetalleUsuario(usuario, tipo) {
    setUsuarioDetalle(usuario)
    setModoDetalle(tipo)
    if (tipo === 'pujas') {
      const { data } = await supabase
        .from('pujas').select('*, remates(titulo, precio_actual)')
        .eq('usuario_id', usuario.id).order('created_at', { ascending: false })
      setPujasPorUsuario(data || [])
    } else {
      const { data } = await supabase
        .from('remates').select('*')
        .eq('vendedor_id', usuario.id).order('created_at', { ascending: false })
      setRematesPorUsuario(data || [])
    }
  }

  async function actualizarCreditos(usuarioId, nuevoSaldo) {
    await supabase.from('creditos').update({ saldo: Number(nuevoSaldo) }).eq('usuario_id', usuarioId)
    cargarDatos()
  }

  async function suspenderUsuario(usuarioId) {
    await supabase.from('remates').update({ activo: false }).eq('vendedor_id', usuarioId)
    await supabase.from('creditos').update({ saldo: 0 }).eq('usuario_id', usuarioId)
    alert('Usuario suspendido — sus remates han sido desactivados y créditos en 0.')
    cargarDatos()
  }

  async function eliminarUsuario(usuarioId, nickname) {
    if (!confirm(`¿Eliminar permanentemente al usuario "${nickname}"? Se eliminarán todos sus remates, pujas y datos. Esta acción no se puede deshacer.`)) return

    const { data: rematesUsuario } = await supabase.from('remates').select('id').eq('vendedor_id', usuarioId)
    const idsRemates = (rematesUsuario || []).map(r => r.id)

    if (idsRemates.length > 0) {
      await supabase.from('notificaciones').delete().in('remate_id', idsRemates)
      await supabase.from('favoritos').delete().in('remate_id', idsRemates)
      await supabase.from('pujas').delete().in('remate_id', idsRemates)
      await supabase.from('remates').delete().in('id', idsRemates)
    }
    await supabase.from('pujas').delete().eq('usuario_id', usuarioId)
    await supabase.from('favoritos').delete().eq('usuario_id', usuarioId)
    await supabase.from('notificaciones').delete().eq('usuario_id', usuarioId)
    await supabase.from('mensajes').delete().eq('usuario_id', usuarioId)
    await supabase.from('creditos').delete().eq('usuario_id', usuarioId)
    await supabase.from('usuarios').delete().eq('id', usuarioId)

    cargarDatos()
  }

  async function suspenderRemate(remateId) {
    await supabase.from('remates').update({ activo: false }).eq('id', remateId)
    cargarDatos()
  }

  async function activarRemate(remateId) {
    await supabase.from('remates').update({ activo: true }).eq('id', remateId)
    cargarDatos()
  }

  async function eliminarRemate(remateId, titulo) {
    if (!confirm(`¿Eliminar permanentemente "${titulo}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('notificaciones').delete().eq('remate_id', remateId)
    await supabase.from('favoritos').delete().eq('remate_id', remateId)
    await supabase.from('pujas').delete().eq('remate_id', remateId)
    await supabase.from('remates').delete().eq('id', remateId)
    cargarDatos()
  }

  async function aprobarVerificacion(usuarioId, nickname) {
    if (!confirm(`¿Aprobar manualmente la verificación de ${nickname}?`)) return
    const { error } = await supabase.from('usuarios').update({ celular_verificado: true }).eq('id', usuarioId)
    if (error) { alert('Error: ' + error.message) }
    else { alert(`Usuario ${nickname} verificado correctamente.`); cargarDatos() }
  }

  function guardarPaquete(id) {
    setPaquetes(paquetes.map(p => p.id === id ? { ...p, ...editandoPaquete } : p))
    setEditandoPaquete(null)
  }

  const mensajesPendientes = mensajes.filter(m => !m.respondido).length

  const btnPag = { padding:'7px 12px', borderRadius:'8px', border:'1px solid #eee', background:'#fff', cursor:'pointer', fontSize:'12px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

  function Paginacion({ items }) {
    const total = Math.ceil(items.length / POR_PAGINA)
    if (total <= 1) return null
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px', marginTop:'20px', flexWrap:'wrap' }}>
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
          style={{ ...btnPag, opacity: pagina === 1 ? 0.4 : 1 }}>← Anterior</button>
        {Array.from({ length: total }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => setPagina(n)} style={n === pagina ? btnPagActivo : btnPag}>{n}</button>
        ))}
        <button onClick={() => setPagina(p => Math.min(total, p + 1))} disabled={pagina === total}
          style={{ ...btnPag, opacity: pagina === total ? 0.4 : 1 }}>Siguiente →</button>
      </div>
    )
  }

  function ContadorItems({ items }) {
    if (items.length === 0) return null
    return (
      <div style={{ fontSize:'12px', color:'#999', marginBottom:'10px' }}>
        Mostrando {((pagina - 1) * POR_PAGINA) + 1}–{Math.min(pagina * POR_PAGINA, items.length)} de {items.length}
      </div>
    )
  }

  function paginar(items) {
    return items.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  }

  const estilo = {
    tab: (activo) => ({
      padding:'7px 16px', borderRadius:'20px', cursor:'pointer', fontSize:'12px', fontWeight:'500',
      background: activo ? '#1D9E75' : '#fff',
      color: activo ? '#fff' : '#666',
      border: activo ? '1px solid #1D9E75' : '1px solid #eee',
    }),
    card: { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'10px' },
  }

  if (!autorizado || cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando panel...</div>
    </main>
  )

  if (usuarioDetalle && modoDetalle) return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px' }}>
        <button onClick={() => { setUsuarioDetalle(null); setModoDetalle(null) }}
          style={{ fontSize:'13px', color:'#1D9E75', background:'none', border:'none', cursor:'pointer', marginBottom:'16px' }}>
          ← Volver al panel
        </button>
        <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'20px' }}>
          {modoDetalle === 'pujas' ? 'Pujas de' : 'Remates de'} {usuarioDetalle.nickname}
        </h2>
        {modoDetalle === 'pujas' && (
          <div>
            {pujasPorUsuario.length === 0
              ? <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No tiene pujas.</div>
              : pujasPorUsuario.map(p => (
                <div key={p.id} style={estilo.card}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{p.remates?.titulo}</p>
                      <p style={{ fontSize:'12px', color:'#999' }}>{new Date(p.created_at).toLocaleDateString('es-PE')}</p>
                    </div>
                    <p style={{ fontSize:'16px', fontWeight:'500', color:'#1D9E75' }}>S/ {Number(p.monto).toLocaleString()}</p>
                  </div>
                </div>
              ))
            }
          </div>
        )}
        {modoDetalle === 'remates' && (
          <div>
            {rematesPorUsuario.length === 0
              ? <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No tiene remates.</div>
              : rematesPorUsuario.map(r => (
                <div key={r.id} style={estilo.card}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                      <div style={{ width:'48px', height:'48px', background:'#f5f5f5', borderRadius:'8px', overflow:'hidden', flexShrink:0 }}>
                        {r.imagen_url && <img src={r.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                      </div>
                      <div>
                        <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{r.titulo}</p>
                        <p style={{ fontSize:'12px', color:'#999' }}>{r.categoria} · S/ {Number(r.precio_actual).toLocaleString()}</p>
                      </div>
                    </div>
                    <span style={{ fontSize:'11px', background: r.activo ? '#E1F5EE' : '#f5f5f5', color: r.activo ? '#085041' : '#999', padding:'2px 8px', borderRadius:'20px' }}>
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'24px' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
          <h1 style={{ fontSize:'22px', fontWeight:'500' }}>Panel de administrador</h1>
          <span style={{ fontSize:'12px', background:'#1D9E75', color:'white', padding:'4px 12px', borderRadius:'20px' }}>Admin</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'28px' }}>
          {[
            ['Usuarios',        stats.totalUsuarios,  '#333'   ],
            ['Remates activos', stats.rematesActivos, '#1D9E75'],
            ['Total remates',   stats.totalRemates,   '#185FA5'],
            ['Total pujas',     stats.totalPujas,     '#854F0B'],
          ].map(([lbl, val, color]) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'12px', color:'#999', marginBottom:'6px' }}>{lbl}</div>
              <div style={{ fontSize:'24px', fontWeight:'500', color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
          {[
            { key:'usuarios',       label:'Usuarios',       count: usuarios.length,               badge: false, href: null },
            { key:'remates',        label:'Remates',        count: remates.length,                badge: false, href: null },
            { key:'mensajes',       label:'Mensajes',       count: mensajesPendientes,            badge: true,  href: null },
            { key:'verificaciones', label:'Verificaciones', count: pendientesVerificacion.length, badge: true,  href: null },
            { key:'calificaciones', label:'Calificaciones', count: null,                          badge: false, href: '/admin/calificaciones' },
            { key:'beta',           label:'Modo BETA',      count: null,                          badge: false, href: null },
            { key:'paquetes',       label:'Paquetes',       count: null,                          badge: false, href: null },
          ].map(t => (
            t.href ? (
              <a key={t.key} href={t.href} style={{ ...estilo.tab(false), textDecoration:'none' }}>
                {t.label}
              </a>
            ) : (
              <button key={t.key}
                onClick={() => { setTab(t.key); if (t.key === 'mensajes') cargarMensajes() }}
                style={estilo.tab(tab === t.key)}>
                {t.label}
                {t.count !== null && t.badge && t.count > 0 && (
                  <span style={{ background: t.key === 'verificaciones' ? '#F59E0B' : '#E24B4A', color:'white', borderRadius:'50%', padding:'1px 6px', fontSize:'11px', marginLeft:'4px' }}>
                    {t.count}
                  </span>
                )}
                {t.count !== null && !t.badge && (
                  <span style={{ opacity:.7, marginLeft:'4px' }}>({t.count})</span>
                )}
              </button>
            )
          ))}
        </div>

        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <div>
            {usuarios.length === 0
              ? <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay usuarios.</div>
              : <>
                  <ContadorItems items={usuarios} />
                  {paginar(usuarios).map(u => (
                    <div key={u.id} style={estilo.card}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'500', color:'#085041', flexShrink:0 }}>
                          {u.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'2px' }}>
                            {u.nickname}
                            {!u.celular_verificado && (
                              <span style={{ fontSize:'10px', background:'#FFF8E1', color:'#7B5800', border:'1px solid #FFE082', padding:'2px 6px', borderRadius:'10px', marginLeft:'8px' }}>
                                Sin verificar
                              </span>
                            )}
                          </p>
                          <div style={{ display:'flex', gap:'12px' }}>
                            <button onClick={() => verDetalleUsuario(u, 'pujas')}
                              style={{ fontSize:'11px', color:'#1D9E75', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                              {u.totalPujas} pujas
                            </button>
                            <button onClick={() => verDetalleUsuario(u, 'remates')}
                              style={{ fontSize:'11px', color:'#1D9E75', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                              {u.totalRemates} remates
                            </button>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ textAlign:'center' }}>
                            <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>Créditos</p>
                            <input type='number' defaultValue={u.creditos}
                              onChange={e => setCreditosEditar({ ...creditosEditar, [u.id]: e.target.value })}
                              style={{ width:'70px', padding:'6px 8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', textAlign:'center' }} />
                          </div>
                          <button onClick={() => actualizarCreditos(u.id, creditosEditar[u.id] ?? u.creditos)}
                            style={{ padding:'6px 12px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                            Guardar
                          </button>
                          <button onClick={() => { if(confirm('¿Suspender a ' + u.nickname + '?')) suspenderUsuario(u.id) }}
                            style={{ padding:'6px 12px', background:'#FCEBEB', color:'#A32D2D', border:'1px solid #E24B4A', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                            Suspender
                          </button>
                          <button onClick={() => eliminarUsuario(u.id, u.nickname)}
                            style={{ padding:'6px 10px', background:'#A32D2D', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Paginacion items={usuarios} />
                </>
            }
          </div>
        )}

        {/* VERIFICACIONES */}
        {tab === 'verificaciones' && (
          <div>
            <p style={{ fontSize:'13px', color:'#999', marginBottom:'16px' }}>
              Usuarios que se registraron pero no completaron la verificación por SMS. Puedes aprobarlos manualmente.
            </p>
            {pendientesVerificacion.length === 0
              ? <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay usuarios pendientes de verificación.</div>
              : <>
                  <ContadorItems items={pendientesVerificacion} />
                  {paginar(pendientesVerificacion).map(u => (
                    <div key={u.id} style={{ ...estilo.card, border:'1px solid #FFE082', background:'#FFFDF0' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#FFF8E1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'500', color:'#7B5800', flexShrink:0 }}>
                          {u.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'2px' }}>{u.nickname}</p>
                          <p style={{ fontSize:'12px', color:'#999' }}>
                            Celular: +51 {u.celular} · Registrado: {new Date(u.created_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <button onClick={() => aprobarVerificacion(u.id, u.nickname)}
                          style={{ padding:'8px 16px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                          Aprobar manualmente
                        </button>
                      </div>
                    </div>
                  ))}
                  <Paginacion items={pendientesVerificacion} />
                </>
            }
          </div>
        )}

        {/* REMATES */}
        {tab === 'remates' && (
          <div>
            {remates.length === 0
              ? <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay remates.</div>
              : <>
                  <ContadorItems items={remates} />
                  {paginar(remates).map(r => (
                    <div key={r.id} style={estilo.card}>
                      <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                        <div style={{ width:'48px', height:'48px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                          {r.imagen_url && <img src={r.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'2px' }}>{r.titulo}</p>
                          <p style={{ fontSize:'12px', color:'#999' }}>{r.categoria} · S/ {Number(r.precio_actual).toLocaleString()}</p>
                        </div>
                        <span style={{ fontSize:'11px', background: r.activo ? '#E1F5EE' : '#f5f5f5', color: r.activo ? '#085041' : '#999', padding:'2px 8px', borderRadius:'20px', marginRight:'8px' }}>
                          {r.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        <a href={'/remate/' + r.id} target='_blank'
                          style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px', marginRight:'8px' }}>
                          Ver
                        </a>
                        {r.activo
                          ? <button onClick={() => suspenderRemate(r.id)}
                              style={{ padding:'6px 12px', background:'#FCEBEB', color:'#A32D2D', border:'1px solid #E24B4A', borderRadius:'8px', fontSize:'12px', cursor:'pointer', marginRight:'8px' }}>
                              Suspender
                            </button>
                          : <button onClick={() => activarRemate(r.id)}
                              style={{ padding:'6px 12px', background:'#E1F5EE', color:'#085041', border:'1px solid #1D9E75', borderRadius:'8px', fontSize:'12px', cursor:'pointer', marginRight:'8px' }}>
                              Activar
                            </button>
                        }
                        <button onClick={() => eliminarRemate(r.id, r.titulo)}
                          style={{ padding:'6px 10px', background:'#A32D2D', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                  <Paginacion items={remates} />
                </>
            }
          </div>
        )}

        {/* MENSAJES */}
        {tab === 'mensajes' && (
          <div>
            {mensajes.length === 0
              ? <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay mensajes.</div>
              : <>
                  <ContadorItems items={mensajes} />
                  {paginar(mensajes).map(m => (
                    <div key={m.id} style={{ background:'#fff', border: !m.respondido ? '1px solid #9FE1CB' : '1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                        <div>
                          <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{m.asunto}</p>
                          <p style={{ fontSize:'12px', color:'#999' }}>
                            {m.usuarios?.nickname} · {new Date(m.created_at).toLocaleDateString('es-PE', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                        <span style={{ fontSize:'11px', background: m.respondido ? '#E1F5EE' : '#FCEBEB', color: m.respondido ? '#085041' : '#A32D2D', padding:'2px 10px', borderRadius:'20px' }}>
                          {m.respondido ? 'Respondido' : 'Pendiente'}
                        </span>
                      </div>
                      <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px', marginBottom:'12px' }}>
                        <p style={{ fontSize:'13px', color:'#444', lineHeight:'1.6' }}>{m.mensaje}</p>
                      </div>
                      {m.respuesta && (
                        <div style={{ background:'#E1F5EE', borderRadius:'8px', padding:'12px', marginBottom:'12px', border:'1px solid #9FE1CB' }}>
                          <p style={{ fontSize:'12px', color:'#085041', marginBottom:'4px', fontWeight:'500' }}>Tu respuesta:</p>
                          <p style={{ fontSize:'13px', color:'#085041', lineHeight:'1.6' }}>{m.respuesta}</p>
                        </div>
                      )}
                      {!m.respondido && (
                        respondiendo === m.id ? (
                          <div>
                            <textarea value={respuesta[m.id] || ''} onChange={e => setRespuesta({...respuesta, [m.id]: e.target.value})}
                              placeholder='Escribe tu respuesta...'
                              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', height:'80px', resize:'vertical', boxSizing:'border-box', marginBottom:'8px' }} />
                            <div style={{ display:'flex', gap:'8px' }}>
                              <button onClick={() => setRespondiendo(null)}
                                style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>
                                Cancelar
                              </button>
                              <button onClick={() => responderMensaje(m.id)}
                                style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                                Enviar respuesta
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setRespondiendo(m.id)}
                            style={{ padding:'8px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                            Responder
                          </button>
                        )
                      )}
                    </div>
                  ))}
                  <Paginacion items={mensajes} />
                </>
            }
          </div>
        )}

        {/* MODO BETA */}
        {tab === 'beta' && (
          <div style={estilo.card}>
            <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'16px' }}>Configuración del modo BETA</h2>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'#f9f9f9', borderRadius:'8px', marginBottom:'16px' }}>
              <div>
                <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>Modo BETA activo</p>
                <p style={{ fontSize:'12px', color:'#999' }}>
                  {configBeta ? 'Los usuarios reciben créditos gratis automáticamente.' : 'Los usuarios deben comprar créditos para publicar.'}
                </p>
              </div>
              <button onClick={() => setConfigBeta(!configBeta)}
                style={{ padding:'8px 20px', borderRadius:'8px', border:'none', background: configBeta ? '#1D9E75' : '#f5f5f5', color: configBeta ? 'white' : '#666', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                {configBeta ? 'BETA Activo' : 'BETA Inactivo'}
              </button>
            </div>
            {configBeta && (
              <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'8px', padding:'12px' }}>
                <p style={{ fontSize:'13px', color:'#085041' }}>Durante el BETA los nuevos usuarios reciben 999 créditos gratis automáticamente.</p>
              </div>
            )}
            {!configBeta && (
              <div style={{ background:'#FCEBEB', border:'1px solid #E24B4A', borderRadius:'8px', padding:'12px' }}>
                <p style={{ fontSize:'13px', color:'#A32D2D' }}>Fuera del BETA los usuarios deben comprar paquetes de créditos para publicar.</p>
              </div>
            )}
            <div style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', color:'#666', marginBottom:'10px' }}>
                Activa las notificaciones push para recibir alertas cuando lleguen mensajes o verificaciones pendientes.
              </p>
              <button onClick={suscribirPush}
                style={{ padding:'10px 20px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                🔔 Activar notificaciones push
              </button>
            </div>
          </div>
        )}

        {/* PAQUETES */}
        {tab === 'paquetes' && (
          <div>
            <p style={{ fontSize:'13px', color:'#999', marginBottom:'16px' }}>Define los precios de los paquetes de créditos que los vendedores pueden comprar.</p>
            {paquetes.map(p => (
              <div key={p.id} style={estilo.card}>
                {editandoPaquete?.id === p.id ? (
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'12px' }}>
                      <div>
                        <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'4px' }}>Nombre</label>
                        <input value={editandoPaquete.nombre} onChange={e => setEditandoPaquete({...editandoPaquete, nombre: e.target.value})}
                          style={{ width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', boxSizing:'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'4px' }}>Créditos</label>
                        <input type='number' value={editandoPaquete.creditos} onChange={e => setEditandoPaquete({...editandoPaquete, creditos: Number(e.target.value)})}
                          style={{ width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', boxSizing:'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'4px' }}>Precio (S/)</label>
                        <input type='number' value={editandoPaquete.precio} onChange={e => setEditandoPaquete({...editandoPaquete, precio: Number(e.target.value)})}
                          style={{ width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', boxSizing:'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={() => setEditandoPaquete(null)}
                        style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>
                        Cancelar
                      </button>
                      <button onClick={() => guardarPaquete(p.id)}
                        style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontWeight:'500', fontSize:'15px', marginBottom:'4px' }}>Paquete {p.nombre}</p>
                      <p style={{ fontSize:'13px', color:'#666' }}>{p.creditos} créditos — S/ {p.precio}</p>
                      <p style={{ fontSize:'12px', color:'#999' }}>S/ {(p.precio / p.creditos).toFixed(2)} por crédito</p>
                    </div>
                    <button onClick={() => setEditandoPaquete({...p})}
                      style={{ padding:'8px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#444' }}>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}