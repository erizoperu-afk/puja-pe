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

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
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
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: creditosData } = await supabase
      .from('creditos')
      .select('*')

    const { data: rematesData } = await supabase
      .from('remates')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: pujasData } = await supabase
      .from('pujas')
      .select('*')

    const usuariosConCreditos = (usuariosData || []).map(u => ({
      ...u,
      creditos: creditosData?.find(c => c.usuario_id === u.id)?.saldo ?? 0
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

  async function actualizarCreditos(usuarioId, nuevoSaldo) {
    await supabase.from('creditos')
      .update({ saldo: Number(nuevoSaldo) })
      .eq('usuario_id', usuarioId)
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
          <button style={estilo.tab(tab === 'stats')} onClick={() => setTab('stats')}>Usuarios</button>
          <button style={estilo.tab(tab === 'remates')} onClick={() => setTab('remates')}>Remates</button>
        </div>

        {/* USUARIOS */}
        {tab === 'stats' && (
          <div>
            {usuarios.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay usuarios.</div>}
            {usuarios.map(u => (
              <div key={u.id} style={estilo.card}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'500', color:'#085041', flexShrink:0 }}>
                    {u.nickname?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'2px' }}>{u.nickname}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>ID: {u.id.slice(0, 8)}...</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>Créditos</p>
                      <input
                        type='number'
                        defaultValue={u.creditos}
                        onChange={e => setCreditosEditar({ ...creditosEditar, [u.id]: e.target.value })}
                        style={{ width:'70px', padding:'6px 8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', textAlign:'center' }}
                      />
                    </div>
                    <button
                      onClick={() => actualizarCreditos(u.id, creditosEditar[u.id] ?? u.creditos)}
                      style={{ padding:'6px 12px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontWeight:'500' }}>
                      Guardar
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
            {remates.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>No hay remates.</div>}
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
      </div>
    </main>
  )
}