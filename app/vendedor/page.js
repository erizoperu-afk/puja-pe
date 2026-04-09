'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

export default function PanelVendedor() {
  const [remates, setRemates] = useState([])
  const [pujasXRemate, setPujasXRemate] = useState({})
  const [totalPujas, setTotalPujas] = useState(0)
  const [creditos, setCreditos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    setSession(session)

    const { data } = await supabase
      .from('remates').select('*')
      .eq('vendedor_id', session.user.id)
      .order('created_at', { ascending: false })
    setRemates(data || [])

    if (data && data.length > 0) {
      const ids = data.map(r => r.id)
      const { data: pujas } = await supabase.from('pujas').select('remate_id').in('remate_id', ids)
      const conteo = {}
      pujas?.forEach(p => { conteo[p.remate_id] = (conteo[p.remate_id] || 0) + 1 })
      setPujasXRemate(conteo)
      setTotalPujas(pujas?.length || 0)
    }

    const { data: cred } = await supabase.from('creditos').select('saldo').eq('usuario_id', session.user.id).single()
    setCreditos(cred?.saldo ?? 0)
    setCargando(false)
  }

  function estadoRemate(remate) {
    if (remate.activo) return 'activo'
    if (remate.comprador_id) return 'vendido'
    if (remate.precio_actual > remate.precio_inicial) return 'vendido'
    return 'sin_oferta'
  }

  async function republicar(remate) {
    if (creditos <= 0) { alert('No tienes créditos disponibles.'); return }
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + 3)
    await supabase.from('remates').update({
      activo: true, fecha_fin: fechaFin.toISOString(),
      precio_actual: remate.precio_inicial, comprador_id: null
    }).eq('id', remate.id)
    await supabase.from('creditos').update({ saldo: creditos - 1 }).eq('usuario_id', session.user.id)
    setCreditos(creditos - 1)
    cargarDatos()
  }

  async function guardarYRepublicar(remateId) {
    if (creditos <= 0) { alert('No tienes créditos disponibles.'); return }
    setGuardando(true)
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + 3)
    await supabase.from('remates').update({
      titulo: formEditar.titulo, descripcion: formEditar.descripcion,
      precio_inicial: Number(formEditar.precio_inicial),
      precio_actual: Number(formEditar.precio_inicial),
      activo: true, fecha_fin: fechaFin.toISOString(), comprador_id: null
    }).eq('id', remateId)
    await supabase.from('creditos').update({ saldo: creditos - 1 }).eq('usuario_id', session.user.id)
    setCreditos(creditos - 1)
    setEditando(null)
    setGuardando(false)
    cargarDatos()
  }

  const rematesActivos = remates.filter(r => estadoRemate(r) === 'activo')
  const rematesConcluidos = remates.filter(r => estadoRemate(r) !== 'activo')
  const campo = { width:'100%', padding:'8px 10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', boxSizing:'border-box', marginBottom:'8px' }

  function TarjetaRemate({ remate, concluido }) {
    const estado = estadoRemate(remate)
    const numPujas = pujasXRemate[remate.id] || 0
    const esEditando = editando === remate.id
    const esSinOferta = estado === 'sin_oferta'
    const badge = estado === 'activo'
      ? { texto:'Activo', bg:'#E1F5EE', color:'#085041' }
      : estado === 'vendido'
      ? { texto:'Vendido', bg:'#E6F1FB', color:'#185FA5' }
      : { texto:'Sin oferta', bg:'#FCEBEB', color:'#A32D2D' }

    return (
      <div style={{ background: concluido ? '#fafafa' : '#fff', border:'1px solid #eee', borderRadius:'12px', padding:'12px', marginBottom:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
          <div style={{ width:'48px', height:'48px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
            {remate.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
          </div>
          <div style={{ flex:1, minWidth:'120px' }}>
            <p style={{ fontWeight:'500', fontSize:'13px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{remate.titulo}</p>
            <p style={{ fontSize:'11px', color:'#999' }}>{remate.categoria}</p>
          </div>
          <div style={{ textAlign:'center', minWidth:'50px' }}>
            <p style={{ fontSize:'10px', color:'#999', marginBottom:'2px' }}>Pujas</p>
            <p style={{ fontSize:'20px', fontWeight:'500', color: numPujas > 0 ? '#1D9E75' : '#ccc' }}>{numPujas}</p>
          </div>
          <div style={{ textAlign:'right', minWidth:'90px' }}>
            <p style={{ fontSize:'10px', color:'#999', marginBottom:'2px' }}>{estado === 'activo' ? 'Precio actual' : 'Precio final'}</p>
            <p style={{ fontSize:'14px', fontWeight:'500', marginBottom:'3px' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
            <span style={{ fontSize:'10px', background: badge.bg, color: badge.color, padding:'2px 7px', borderRadius:'20px' }}>{badge.texto}</span>
          </div>
          <a href={'/remate/' + remate.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 10px', border:'1px solid #1D9E75', borderRadius:'8px', flexShrink:0 }}>Ver</a>
        </div>

        {esSinOferta && (
          <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #f0f0f0' }}>
            <p style={{ fontSize:'12px', color:'#999', marginBottom:'8px' }}>Esta publicación concluyó sin recibir ofertas.</p>
            {esEditando ? (
              <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px', marginBottom:'8px' }}>
                <p style={{ fontSize:'12px', fontWeight:'500', color:'#444', marginBottom:'8px' }}>Editar y republicar — consume 1 crédito</p>
                <input value={formEditar.titulo} onChange={e => setFormEditar({...formEditar, titulo: e.target.value})} placeholder='Título' style={campo} />
                <textarea value={formEditar.descripcion} onChange={e => setFormEditar({...formEditar, descripcion: e.target.value})} placeholder='Descripción' style={{ ...campo, height:'60px', resize:'vertical' }} />
                <input type='number' value={formEditar.precio_inicial} onChange={e => setFormEditar({...formEditar, precio_inicial: e.target.value})} placeholder='Nuevo precio (S/)' style={campo} />
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => setEditando(null)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>Cancelar</button>
                  <button onClick={() => guardarYRepublicar(remate.id)} disabled={guardando} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                    {guardando ? 'Publicando...' : 'Guardar y republicar'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <button onClick={() => { setEditando(remate.id); setFormEditar({ titulo: remate.titulo, descripcion: remate.descripcion, precio_inicial: remate.precio_inicial }) }}
                  style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'12px', cursor:'pointer', color:'#444', minWidth:'140px' }}>
                  Modificar y republicar (1 crédito)
                </button>
                <button onClick={() => republicar(remate)}
                  style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:'500', minWidth:'140px' }}>
                  Republicar igual (1 crédito)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando tu panel...</div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h1 style={{ fontSize:'20px', fontWeight:'500' }}>Mi panel vendedor</h1>
          <a href='/vendedor/nuevo' style={{ padding:'8px 14px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>+ Publicar</a>
        </div>

        {/* CRÉDITOS */}
        <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'14px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:'13px', color:'#085041', marginBottom:'2px', fontWeight:'500' }}>Publicaciones disponibles</p>
            <p style={{ fontSize:'12px', color:'#0F6E56' }}>Cada publicación usa 1 crédito</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'28px', fontWeight:'500', color:'#085041' }}>{creditos}</div>
            <span style={{ fontSize:'10px', background:'#1D9E75', color:'white', padding:'2px 8px', borderRadius:'20px' }}>BETA — Gratis</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginBottom:'20px' }}>
          {[
            ['Activos', rematesActivos.length],
            ['Total', remates.length],
            ['Pujas', totalPujas],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'12px' }}>
              <div style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>{lbl}</div>
              <div style={{ fontSize:'22px', fontWeight:'500' }}>{val}</div>
            </div>
          ))}
        </div>

        {rematesActivos.length > 0 && (
          <>
            <h2 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'12px' }}>Publicaciones activas</h2>
            {rematesActivos.map(r => <TarjetaRemate key={r.id} remate={r} concluido={false} />)}
          </>
        )}

        {rematesConcluidos.length > 0 && (
          <>
            <h2 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'12px', marginTop:'24px', color:'#999' }}>Publicaciones concluidas</h2>
            {rematesConcluidos.map(r => <TarjetaRemate key={r.id} remate={r} concluido={true} />)}
          </>
        )}

        {remates.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', background:'#fff', border:'1px solid #eee', borderRadius:'12px', color:'#999' }}>
            No tienes remates publicados aún. ¡Publica tu primer remate!
          </div>
        )}
      </div>
    </main>
  )
}