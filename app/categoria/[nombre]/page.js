'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import Navbar from '../../Navbar'

const CATEGORIAS = ['Antiguedades','Coleccionables','Electronica','Filatelia','Juguetes','Numismatica','Relojes','Ropa y accesorios','Otros']

export default function PaginaCategoria() {
  const [remates, setRemates] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const segmentos = window.location.pathname.split('/')
    const cat = decodeURIComponent(segmentos[segmentos.length - 1])
    setNombre(cat)
    async function cargar() {
      const { data } = await supabase
        .from('remates')
        .select('*')
        .eq('categoria', cat)
        .eq('activo', true)
        .order('created_at', { ascending: false })
      setRemates(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'0 24px', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'4px', maxWidth:'1200px', margin:'0 auto' }}>
          {CATEGORIAS.map(cat => (
            <a key={cat} href={'/categoria/' + cat}
              style={{ padding:'12px 16px', fontSize:'13px', textDecoration:'none', whiteSpace:'nowrap', borderBottom: cat === nombre ? '2px solid #1D9E75' : '2px solid transparent', color: cat === nombre ? '#1D9E75' : '#666', fontWeight: cat === nombre ? '500' : '400' }}>
              {cat}
            </a>
          ))}
        </div>
      </div>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px' }}>
        <h1 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'20px' }}>
          {nombre} <span style={{ fontSize:'14px', color:'#999', fontWeight:'400' }}>({cargando ? '...' : remates.length} remates)</span>
        </h1>
        {cargando && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>Cargando...</div>}
        {!cargando && remates.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px', background:'#fff', borderRadius:'12px', border:'1px solid #eee', color:'#999' }}>
            No hay remates activos en esta categoría aún.
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
          {remates.map((remate) => (
            <a key={remate.id} href={'/remate/' + remate.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', textDecoration:'none', color:'black', display:'block' }}>
              <div style={{ height:'140px', background:'#f5f5f5', overflow:'hidden' }}>
                {remate.imagen_url
                  ? <img src={remate.imagen_url} alt={remate.titulo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', background:'#e0e0e0' }}></div>
                }
              </div>
              <div style={{ padding:'12px' }}>
                <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{remate.titulo}</p>
                <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>{remate.ubicacion}</p>
                <p style={{ fontSize:'18px', fontWeight:'500' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                  <span style={{ fontSize:'11px', color:'#999' }}>Inicio: S/ {Number(remate.precio_inicial).toLocaleString()}</span>
                  <span style={{ fontSize:'11px', background:'#FCEBEB', color:'#A32D2D', padding:'2px 8px', borderRadius:'20px' }}>En vivo</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}