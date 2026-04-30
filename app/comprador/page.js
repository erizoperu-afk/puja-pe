'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

export default function PanelComprador() {
  const [session, setSession] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [pujas, setPujas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) { window.location.href = '/login'; return }
      setSession(s)

      const { data: favsData } = await supabase
        .from('favoritos')
        .select('remate_id, remates(id, titulo, precio_actual, imagen_url, activo)')
        .eq('usuario_id', s.user.id)
        .order('created_at', { ascending: false })
      setFavoritos(favsData || [])

      const { data: pujasData } = await supabase
        .from('pujas')
        .select('remate_id, monto, created_at, remates(id, titulo, precio_actual, imagen_url, activo)')
        .eq('usuario_id', s.user.id)
        .order('created_at', { ascending: false })
      setPujas(pujasData || [])

      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <main style={{ fontFamily:'sans-serif' }}><Navbar /><div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando...</div></main>

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px 16px' }}>
        <h1 style={{ fontSize:'20px', fontWeight:'500', marginBottom:'20px' }}>Mi panel comprador</h1>

        {/* BOTÓN REMATES ESPECIALES */}
        <a href='/acceso-especial' style={{ textDecoration:'none' }}>
          <div style={{ background:'linear-gradient(135deg, #1a1a2e, #C9A84C)', borderRadius:'12px', padding:'20px 24px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
            <div>
              <p style={{ color:'#C9A84C', fontSize:'12px', fontWeight:'600', letterSpacing:'1px', marginBottom:'4px' }}>EXCLUSIVO</p>
              <p style={{ color:'white', fontSize:'18px', fontWeight:'700', marginBottom:'4px' }}>🏛️ Acceso a Remates Especiales</p>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>Ingresa tu código de invitación para participar en subastas exclusivas</p>
            </div>
            <span style={{ color:'#C9A84C', fontSize:'24px' }}>→</span>
          </div>
        </a>

        {/* MIS PUJAS */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'16px' }}>Mis pujas ({pujas.length})</h2>
          {pujas.length === 0 ? (
            <p style={{ fontSize:'13px', color:'#999' }}>Aún no has hecho ninguna puja.</p>
          ) : (
            pujas.slice(0, 10).map((p, i) => (
              <a key={i} href={`/remate/${p.remate_id}`} style={{ textDecoration:'none', color:'black' }}>
                <div style={{ display:'flex', gap:'12px', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                  {p.remates?.imagen_url && <img src={p.remates.imagen_url} alt='' style={{ width:'48px', height:'48px', objectFit:'cover', borderRadius:'8px', flexShrink:0 }} />}
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{p.remates?.titulo}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>Tu puja: S/ {Number(p.monto).toLocaleString()}</p>
                  </div>
                  <span style={{ fontSize:'11px', background: p.remates?.activo ? '#E1F5EE' : '#f5f5f5', color: p.remates?.activo ? '#085041' : '#999', padding:'3px 8px', borderRadius:'20px' }}>
                    {p.remates?.activo ? 'Activo' : 'Finalizado'}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>

        {/* FAVORITOS */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
          <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'16px' }}>Mis favoritos ({favoritos.length})</h2>
          {favoritos.length === 0 ? (
            <p style={{ fontSize:'13px', color:'#999' }}>No tienes remates guardados como favoritos.</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px' }}>
              {favoritos.map((f, i) => f.remates && (
                <a key={i} href={`/remate/${f.remate_id}`} style={{ textDecoration:'none', color:'black' }}>
                  <div style={{ border:'1px solid #eee', borderRadius:'10px', overflow:'hidden' }}>
                    {f.remates.imagen_url && <img src={f.remates.imagen_url} alt='' style={{ width:'100%', height:'100px', objectFit:'cover' }} />}
                    <div style={{ padding:'8px' }}>
                      <p style={{ fontSize:'12px', fontWeight:'500', marginBottom:'2px' }}>{f.remates.titulo}</p>
                      <p style={{ fontSize:'13px', fontWeight:'500', color:'#1D9E75' }}>S/ {Number(f.remates.precio_actual).toLocaleString()}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
