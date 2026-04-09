'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

export default function PanelAdmin() {
  const [tab, setTab] = useState('stats')
  const [usuarios, setUsuarios] = useState([])
  const [remates, setRemates] = useState([])
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
    { id: 1, nombre: 'Básico', creditos: 5, precio: 25 },
    { id: 2, nombre: 'Standard', creditos: 15, precio: 60 },
    { id: 3, nombre: 'Premium', creditos: 30, precio: 100 },
  ])
  const [editandoPaquete, setEditandoPaquete] = useState(null)
  const [sessionUser, setSessionUser] = useState(null)

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setSessionUser(session.user)
      const { data: admin } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email)
        .single()
      if (!admin) { window.location.href = '/'; return }
      setAutorizado(true)
      cargarDatos()
    }
    verificarAdmin()
  }, [])

  async function cargarDatos() {
    const { data: usuariosData } = await supabase
      .from('usuarios').select('*').order('created_at', { ascending: false })
    const { data: creditosData } = await supabase
      .from('creditos').select('*')
    const { data: rematesData } = await supabase
      .from('remates').select('*').order('created_at', { ascending: false })
    const { data: pujasData } = await supabase
      .from('pujas').select('*')

    const usuariosConCreditos = (usuariosData || []).map(u => ({
      ...u,
      creditos: creditosData?.find(c => c.usuario_id === u.id)?.saldo ?? 0,
      totalPujas: pujasData?.filter(p => p.usuario_id === u.id).length || 0,
      totalRemates: rematesData?.filter(r => r.vendedor_id === u.id).length || 0,
    }))

    setUsuarios(usuariosConCreditos)
    setRemates(rematesData || [])
    setStats({
      totalUsuarios: usuariosData?.length || 0,
      totalRemates: rematesData?.length || 0,
      rematesActivos: rematesData?.filter(r => r.activo).length || 0,
      totalPujas: pujasData?.length || 0,
    })
    setCargando(false)
  }

  async function verDetalleUsuario(usuario, tipo) {
    setUsuarioDetalle(usuario)
    setModoDetalle(tipo)
    if (tipo === 'pujas') {
      const { data } = await supabase
        .from('pujas').select('*, remates(titulo, precio_actual)')
        .eq('usuario_id', usuario.id)
        .order('created_at', { ascending: false })
      setPujasPorUsuario(data || [])
    } else {
      const { data } = await supabase
        .from('remates').select('*')
        .eq('vendedor_id', usuario.id)
        .order('created_at', { ascending: false })
      setRematesPorUsuario(data || [])
    }
  }

  async function actualizarCreditos(usuarioId, nuevoSaldo) {
    await supabase.from('creditos')
      .update({ saldo: Number(nuevoSaldo) })
      .eq('usuario_id', usuarioId)
    cargarDatos()
  }

  async function suspenderUsuario(usuarioId) {
    await supabase.from('remates')
      .update({ activo: false })
      .eq('vendedor_id', usuarioId)
    await supabase.from('creditos')
      .update({ saldo: 0 })
      .eq('usuario_id', usuarioId)
    alert('Usuario suspendido — sus remates han sido desactivados y créditos en 0.')
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

  function guardarPaquete(id) {
    setPaquetes(paquetes.map(p => p.id === id ? { ...p, ...editandoPaquete } : p))
    setEditandoPaquete(null)
  }

  const estilo = {
    tab: (activo) => ({ padding:'8px 18px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'500', background: activo ? '#1D9E75' : '#f5f5f5', color: activo ? '#fff' : '#666' }),
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
            {pujasPorUsuario.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No tiene pujas.</div>}
            {pujasPorUsuario.map(p => (
              <div key={p.id} style={estilo.card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{p.remates?.titulo}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>{new Date(p.created_at).toLocaleDateString('es-PE')}</p>
                  </div>
                  <p style={{ fontSize:'16px', fontWeight:'500', color:'#1D9E75' }}>S/ {Number(p.monto).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {modoDetalle === 'remates' && (
          <div>
            {rematesPorUsuario.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No tiene remates.</div>}
            {rematesPorUsuario.map(r => (
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
            ))}
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

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'28px' }}>
          {[
            ['Usuarios', stats.totalUsuarios],
            ['Remates activos', stats.rematesActivos],
            ['Total remates', stats.totalRemates],
            ['Total pujas', stats.totalPujas],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'12px', color:'#999', marginBottom:'6px' }}>{lbl}</div>
              <div style={{ fontSize:'24px', fontWeight:'500' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          <button style={estilo.tab(tab === 'usuarios')} onClick={() => setTab('usuarios')}>Usuarios</button>
          <button style={estilo.tab(tab === 'remates')} onClick={() => setTab('remates')}>Remates</button>
          <button style={estilo.tab(tab === 'beta')} onClick={() => setTab('beta')}>Modo BETA</button>
          <button style={estilo.tab(tab === 'paquetes')} onClick={() => setTab('paquetes')}>Paquetes</button>
        </div>

        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <div>
            {usuarios.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay usuarios.</div>}
            {usuarios.map(u => (
              <div key={u.id} style={estilo.card}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'500', color:'#085041', flexShrink:0 }}>
                    {u.nickname?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'2px' }}>{u.nickname}</p>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REMATES */}
        {tab === 'remates' && (
          <div>
            {remates.map(r => (
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
                  {r.activo ? (
                    <button onClick={() => suspenderRemate(r.id)}
                      style={{ padding:'6px 12px', background:'#FCEBEB', color:'#A32D2D', border:'1px solid #E24B4A', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                      Suspender
                    </button>
                  ) : (
                    <button onClick={() => activarRemate(r.id)}
                      style={{ padding:'6px 12px', background:'#E1F5EE', color:'#085041', border:'1px solid #1D9E75', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))}
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
                <p style={{ fontSize:'13px', color:'#085041' }}>
                  Durante el BETA los nuevos usuarios reciben 999 créditos gratis automáticamente.
                </p>
              </div>
            )}
            {!configBeta && (
              <div style={{ background:'#FCEBEB', border:'1px solid #E24B4A', borderRadius:'8px', padding:'12px' }}>
                <p style={{ fontSize:'13px', color:'#A32D2D' }}>
                  Fuera del BETA los usuarios deben comprar paquetes de créditos para publicar.
                </p>
              </div>
            )}
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