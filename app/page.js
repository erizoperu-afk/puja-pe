'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'

const CATEGORIAS = ['Antiguedades', 'Coleccionables', 'Electronica', 'Filatelia', 'Juguetes', 'Numismatica', 'Relojes', 'Ropa y accesorios', 'Otros']
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

  return (
    <span style={{ fontSize:'11px', color: texto === 'Finalizado' ? '#999' : '#A32D2D', fontWeight:'500' }}>
      {texto}
    </span>
  )
}

export default function Home() {
  const [remates, setRemates] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState(1)

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

  const totalPaginas = Math.ceil(rematesFiltrados.length / POR_PAGINA)
  const rematesPagina = rematesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function handleBusqueda(e) {
    setBusqueda(e.target.value)
    setPagina(1)
  }

  const btnPag = { padding:'8px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:'13px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

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
          <input type='text' placeholder='Busca laptops, celulares, autos...' value={busqueda} onChange={handleBusqueda}
            style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }} />
          <button style={{ padding:'10px 20px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500' }}>Buscar</button>
        </div>
      </section>

      <section style={{ padding:'24px', maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'500' }}>
            Remates activos ({cargando ? '...' : rematesFiltrados.length})
          </h2>
          {totalPaginas > 1 && (
            <span style={{ fontSize:'13px', color:'#999' }}>Página {pagina} de {totalPaginas}</span>
          )}
        </div>

        {cargando && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>Cargando remates...</div>}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
          {rematesPagina.map((remate) => (
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
                <p style={{ fontSize:'18px', fontWeight:'500', marginBottom:'6px' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'4px' }}>
                  <TiempoRestante fechaFin={remate.fecha_fin} tipoPub={remate.tipo_publicacion} />
                  <span style={{ fontSize:'11px', background: remate.tipo_publicacion === 'precio_fijo' ? '#E6F1FB' : '#FCEBEB', color: remate.tipo_publicacion === 'precio_fijo' ? '#185FA5' : '#A32D2D', padding:'2px 8px', borderRadius:'20px' }}>
                    {remate.tipo_publicacion === 'precio_fijo' ? 'Venta directa' : 'En vivo'}
                  </span>
                </div>
              </div>
            </a>
          ))}
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
    </main>
  )
}