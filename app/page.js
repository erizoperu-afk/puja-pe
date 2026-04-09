'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'

const CATEGORIAS = [
  { nombre: 'Antiguedades', icono: '🏺' },
  { nombre: 'Coleccionables', icono: '⭐' },
  { nombre: 'Electronica', icono: '💻' },
  { nombre: 'Filatelia', icono: '✉️' },
  { nombre: 'Juguetes', icono: '🧸' },
  { nombre: 'Numismatica', icono: '🪙' },
  { nombre: 'Relojes', icono: '⌚' },
  { nombre: 'Ropa y accesorios', icono: '👗' },
  { nombre: 'Otros', icono: '📦' },
]

const POR_PAGINA = 12

function TiempoRestante({ fechaFin, tipoPub }) {
  const [texto, setTexto] = useState('')
  useEffect(() => {
    function calcular() {
      const fin = new Date(fechaFin).getTime()
      const diff = Math.max(0, fin - Date.now())
      if (diff === 0) { setTexto('Finalizado'); return }
      if (tipoPub === 'precio_fijo') {
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
        setTexto(dias === 1 ? '1 día restante' : `${dias} días restantes`)
      } else {
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        if (h > 24) {
          const dias = Math.floor(h / 24)
          setTexto(dias === 1 ? '1 día restante' : `${dias} días restantes`)
        } else {
          setTexto(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
        }
      }
    }
    calcular()
    const tick = setInterval(calcular, 1000)
    return () => clearInterval(tick)
  }, [fechaFin, tipoPub])
  return <span style={{ fontSize:'11px', color: texto === 'Finalizado' ? '#999' : '#A32D2D', fontWeight:'500' }}>{texto}</span>
}

function TarjetaRemate({ remate }) {
  return (
    <a href={'/remate/' + remate.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', textDecoration:'none', color:'black', display:'block' }}>
      <div style={{ height:'140px', background:'#f5f5f5', overflow:'hidden' }}>
        {remate.imagen_url
          ? <img src={remate.imagen_url} alt={remate.titulo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', background:'#e0e0e0' }}></div>}
      </div>
      <div style={{ padding:'12px' }}>
        <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{remate.titulo}</p>
        <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>{remate.categoria}</p>
        <p style={{ fontSize:'18px', fontWeight:'500', marginBottom:'6px' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'4px', flexWrap:'wrap', gap:'4px' }}>
          <TiempoRestante fechaFin={remate.fecha_fin} tipoPub={remate.tipo_publicacion} />
          <span style={{ fontSize:'11px', background: remate.tipo_publicacion === 'precio_fijo' ? '#E6F1FB' : '#FCEBEB', color: remate.tipo_publicacion === 'precio_fijo' ? '#185FA5' : '#A32D2D', padding:'2px 8px', borderRadius:'20px' }}>
            {remate.tipo_publicacion === 'precio_fijo' ? 'Venta directa' : 'En vivo'}
          </span>
        </div>
      </div>
    </a>
  )
}

export default function Home() {
  const [remates, setRemates] = useState([])
  const [hot, setHot] = useState([])
  const [nuevos, setNuevos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [catHover, setCatHover] = useState(null)

  useEffect(() => {
    async function cargarRemates() {
      const { data } = await supabase
        .from('remates').select('*').eq('activo', true)
        .order('created_at', { ascending: false })
      const rematesActivos = data || []
      setRemates(rematesActivos)
      const { data: pujasData } = await supabase.from('pujas').select('remate_id')
      const conteo = {}
      pujasData?.forEach(p => { conteo[p.remate_id] = (conteo[p.remate_id] || 0) + 1 })
      const conPujas = rematesActivos
        .map(r => ({ ...r, numPujas: conteo[r.id] || 0 }))
        .filter(r => r.numPujas > 0)
        .sort((a, b) => b.numPujas - a.numPujas)
        .slice(0, 6)
      setHot(conPujas)
      setNuevos(rematesActivos.slice(0, 20))
      setCargando(false)
    }
    cargarRemates()
  }, [])

  const rematesFiltrados = remates.filter(r =>
    r.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  )
  const totalPaginas = Math.ceil(rematesFiltrados.length / POR_PAGINA)
  const rematesPagina = rematesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  function handleBusqueda(e) { setBusqueda(e.target.value); setPagina(1) }

  const btnPag = { padding:'8px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:'13px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

  return (
    <main style={{ fontFamily:'sans-serif', overflowX:'hidden' }}>
      <Navbar />

      {/* CATEGORIAS */}
      <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'0 12px', overflowX:'auto' }}>
        <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', maxWidth:'1200px', margin:'0 auto', gap:'2px', padding:'8px 0' }}>
          {CATEGORIAS.map(cat => (
            <a key={cat.nombre} href={'/categoria/' + cat.nombre}
              onMouseEnter={() => setCatHover(cat.nombre)}
              onMouseLeave={() => setCatHover(null)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
                padding:'8px 10px', borderRadius:'10px', textDecoration:'none',
                minWidth:'70px', maxWidth:'90px',
                background: catHover === cat.nombre ? '#E1F5EE' : 'transparent',
                color: catHover === cat.nombre ? '#085041' : '#555',
                transition:'background 0.15s',
              }}>
              <span style={{ fontSize:'22px', lineHeight:1 }}>{cat.icono}</span>
              <span style={{ fontSize:'11px', fontWeight:'700', textAlign:'center', lineHeight:'1.2' }}>{cat.nombre}</span>
            </a>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section style={{ background:'#f9f9f9', padding:'32px 16px', textAlign:'center', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'500', marginBottom:'8px' }}>Remata y compra en todo el Peru</h1>
        <p style={{ color:'#666', marginBottom:'20px', fontSize:'14px' }}>Encuentra las mejores ofertas o publica lo que ya no usas</p>
        <div style={{ display:'flex', gap:'8px', maxWidth:'480px', margin:'0 auto' }}>
          <input type='text' placeholder='Busca articulos...' value={busqueda} onChange={handleBusqueda}
            style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', minWidth:0 }} />
          <button style={{ padding:'10px 16px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500', whiteSpace:'nowrap' }}>Buscar</button>
        </div>
      </section>

      {/* LOS REMATES MÁS HOT */}
      {!cargando && hot.length > 0 && (
        <section style={{ padding:'24px 16px', maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'22px' }}>🔥</span>
            <h2 style={{ fontSize:'18px', fontWeight:'700' }}>Los Remates Más Hot</h2>
            <span style={{ fontSize:'12px', color:'#999' }}>— Los que más pujas tienen</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px' }}>
            {hot.map(remate => (
              <div key={remate.id} style={{ position:'relative' }}>
                <div style={{ position:'absolute', top:'8px', left:'8px', zIndex:1, background:'#E24B4A', color:'white', fontSize:'10px', fontWeight:'500', padding:'2px 7px', borderRadius:'20px' }}>
                  🔥 {remate.numPujas} {remate.numPujas === 1 ? 'puja' : 'pujas'}
                </div>
                <TarjetaRemate remate={remate} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LO NUEVO */}
      {!cargando && nuevos.length > 0 && (
        <section style={{ padding:'24px 16px', maxWidth:'1200px', margin:'0 auto', borderTop:'1px solid #eee' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'22px' }}>✨</span>
            <h2 style={{ fontSize:'18px', fontWeight:'700' }}>Lo Nuevo</h2>
            <span style={{ fontSize:'12px', color:'#999' }}>— Las últimas 20 publicaciones</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px' }}>
            {nuevos.map(remate => (
              <div key={remate.id} style={{ position:'relative' }}>
                <div style={{ position:'absolute', top:'8px', left:'8px', zIndex:1, background:'#1D9E75', color:'white', fontSize:'10px', fontWeight:'500', padding:'2px 7px', borderRadius:'20px' }}>
                  ✨ Nuevo
                </div>
                <TarjetaRemate remate={remate} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TODOS LOS REMATES */}
      <section style={{ padding:'24px 16px', maxWidth:'1200px', margin:'0 auto', borderTop:'1px solid #eee' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:'700' }}>
            Todos los remates ({cargando ? '...' : rematesFiltrados.length})
          </h2>
          {totalPaginas > 1 && <span style={{ fontSize:'13px', color:'#999' }}>Página {pagina} de {totalPaginas}</span>}
        </div>
        {cargando && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>Cargando remates...</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px' }}>
          {rematesPagina.map(remate => <TarjetaRemate key={remate.id} remate={remate} />)}
        </div>
        {totalPaginas > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'32px', flexWrap:'wrap' }}>
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
              style={{ ...btnPag, opacity: pagina === 1 ? 0.4 : 1 }}>← Anterior</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPagina(n)} style={n === pagina ? btnPagActivo : btnPag}>{n}</button>
            ))}
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
              style={{ ...btnPag, opacity: pagina === totalPaginas ? 0.4 : 1 }}>Siguiente →</button>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 480px) {
          main { overflow-x: hidden; }
        }
      `}</style>
    </main>
  )
}