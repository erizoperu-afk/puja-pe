'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

const POR_PAGINA = 12

export default function PanelVendedor() {
  const [remates, setRemates] = useState([])
  const [totalPujas, setTotalPujas] = useState(0)
  const [creditos, setCreditos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    async function cargarRemates() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const { data } = await supabase
        .from('remates')
        .select('*')
        .eq('vendedor_id', session.user.id)
        .order('created_at', { ascending: false })
      setRemates(data || [])

      if (data && data.length > 0) {
        const ids = data.map(r => r.id)
        const { count } = await supabase
          .from('pujas')
          .select('*', { count: 'exact', head: true })
          .in('remate_id', ids)
        setTotalPujas(count || 0)
      }

      const { data: cred } = await supabase
        .from('creditos')
        .select('saldo')
        .eq('usuario_id', session.user.id)
        .single()
      setCreditos(cred?.saldo ?? 0)

      setCargando(false)
    }
    cargarRemates()
  }, [])

  const totalPaginas = Math.ceil(remates.length / POR_PAGINA)
  const rematesPagina = remates.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const btnPag = { padding:'8px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:'13px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

  if (cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando tu panel...</div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h1 style={{ fontSize:'22px', fontWeight:'500' }}>Mi panel vendedor</h1>
          <a href='/vendedor/nuevo' style={{ padding:'9px 18px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500' }}>+ Publicar remate</a>
        </div>

        {/* CRÉDITOS */}
        <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'16px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:'13px', color:'#085041', marginBottom:'4px', fontWeight:'500' }}>Publicaciones disponibles</p>
            <p style={{ fontSize:'13px', color:'#0F6E56' }}>Cada publicación usa 1 crédito</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'32px', fontWeight:'500', color:'#085041' }}>{creditos}</div>
            <span style={{ fontSize:'11px', background:'#1D9E75', color:'white', padding:'2px 10px', borderRadius:'20px' }}>BETA — Gratis</span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'28px' }}>
          {[
            ['Remates activos', remates.filter(r => r.activo).length],
            ['Total publicados', remates.length],
            ['Pujas recibidas', totalPujas],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'12px', color:'#999', marginBottom:'6px' }}>{lbl}</div>
              <div style={{ fontSize:'24px', fontWeight:'500' }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'15px', fontWeight:'500' }}>Mis remates</h2>
          {totalPaginas > 1 && (
            <span style={{ fontSize:'13px', color:'#999' }}>Página {pagina} de {totalPaginas}</span>
          )}
        </div>

        {remates.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', background:'#fff', border:'1px solid #eee', borderRadius:'12px', color:'#999' }}>
            No tienes remates publicados aún. ¡Publica tu primer remate!
          </div>
        )}

        {rematesPagina.map((remate) => (
          <div key={remate.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ width:'56px', height:'56px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
              {remate.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{remate.titulo}</p>
              <p style={{ fontSize:'12px', color:'#999' }}>{remate.categoria} · {remate.ubicacion}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
              <span style={{ fontSize:'11px', background: remate.activo ? '#E1F5EE' : '#f5f5f5', color: remate.activo ? '#085041' : '#999', padding:'2px 8px', borderRadius:'20px' }}>
                {remate.activo ? 'Activo' : 'Finalizado'}
              </span>
            </div>
            <a href={'/remate/' + remate.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>
          </div>
        ))}

        {totalPaginas > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'24px', flexWrap:'wrap' }}>
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
              style={{ ...btnPag, opacity: pagina === 1 ? 0.4 : 1 }}>← Anterior</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPagina(n)} style={n === pagina ? btnPagActivo : btnPag}>{n}</button>
            ))}
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
              style={{ ...btnPag, opacity: pagina === totalPaginas ? 0.4 : 1 }}>Siguiente →</button>
          </div>
        )}
      </div>
    </main>
  )
}