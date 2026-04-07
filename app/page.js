'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'

const CATEGORIAS = ['Electronica','Vehiculos','Hogar','Ropa','Deportes','Inmuebles','Arte','Otros']

export default function Home() {
  const [remates, setRemates] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarRemates() {
      const { data } = await supabase
        .from('remates')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
      setRemates(data || [])
      setCargando(false)
    }
    cargarRemates()
  }, [])

  const rematesFiltrados = remates.filter(r =>
    r.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />

      <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'0 24px', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'4px', maxWidth:'1200px', margin:'0 auto' }}>
          {CATEGORIAS.map(cat => (
            <a key={cat} href={'/categoria/' + cat}
              style={{ padding:'12px 16px', fontSize:'13px', textDecoration:'none', whiteSpace:'nowrap', borderBottom:'2px solid transparent', color:'#666', fontWeight:'400' }}>
              {cat}
            </a>
          ))}
        </div>
      </div>

      <section style={{ background:'#f9f9f9', padding:'48px 24px', textAlign:'center', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'500', marginBottom:'10px' }}>Remata y compra en todo el Peru</h1>
        <p style={{ color:'#666', marginBottom:'24px' }}>Encuentra las mejores ofertas o publica lo que ya no usas</p>
        <div style={{ display:'flex', gap:'10px', maxWidth:'480px', margin:'0 auto' }}>
          <input type='text' placeholder='Busca laptops, celulares, autos...' value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }} />
          <button style={{ padding:'10px 20px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500' }}>Buscar</button>
        </div>
      </section>

      <section style={{ padding:'24px', maxWidth:'1200px', margin:'0 auto' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'16px' }}>
          Remates activos ({cargando ? '...' : rematesFiltrados.length})
        </h2>
        {cargando && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>Cargando remates...</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
          {rematesFiltrados.map((remate) => (
            <a key={remate.id} href={'/remate/' + remate.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', textDecoration:'none', color:'black', display:'block' }}>
              <div style={{ height:'140px', background:'#f5f5f5', overflow:'hidden' }}>
                {remate.imagen_url
                  ? <img src={remate.imagen_url} alt={remate.titulo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', background:'#e0e0e0' }}></div>
                }
              </div>
              <div style={{ padding:'12px' }}>
                <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{remate.titulo}</p>
                <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>{remate.categoria}</p>
                <p style={{ fontSize:'18px', fontWeight:'500' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                  <span style={{ fontSize:'11px', color:'#999' }}>Inicio: S/ {Number(remate.precio_inicial).toLocaleString()}</span>
                  <span style={{ fontSize:'11px', background:'#FCEBEB', color:'#A32D2D', padding:'2px 8px', borderRadius:'20px' }}>En vivo</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}