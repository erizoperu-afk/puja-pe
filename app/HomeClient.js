'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'

const CATEGORIAS = [
  'ANTIGUEDADES', 'COLECCIONABLES', 'ELECTRONICA', 'FILATELIA',
  'JUGUETES', 'NUMISMATICA', 'RELOJES', 'ROPA Y ACCESORIOS', 'OTROS'
]

const CATEGORIAS_URL = [
  'Antiguedades', 'Coleccionables', 'Electronica', 'Filatelia',
  'Juguetes', 'Numismatica', 'Relojes', 'Ropa y accesorios', 'Otros'
]

const POR_PAGINA = 12
const BASE_URL = 'https://puja.pe'

function TiempoRestante({ fechaFin, tipoPub }) {
  const [texto, setTexto] = useState('')
  useEffect(() => {
    function calcular() {
      const fin = new Date(fechaFin).getTime()
      const diff = Math.max(0, fin - Date.now())
      if (diff === 0) { setTexto('Finalizado'); return }
      if (tipoPub === 'precio_fijo') {
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
        setTexto(dias === 1 ? '1 dia restante' : `${dias} dias restantes`)
      } else {
        const d = Math.floor(diff / 86400000)
        const h = Math.floor((diff % 86400000) / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        const pad = n => String(n).padStart(2, '0')
        if (d > 0) {
          setTexto(`${d}d ${pad(h)}:${pad(m)}:${pad(s)}`)
        } else {
          setTexto(`${pad(h)}:${pad(m)}:${pad(s)}`)
        }
      }
    }
    calcular()
    const tick = setInterval(calcular, 1000)
    return () => clearInterval(tick)
  }, [fechaFin, tipoPub])
  return <span style={{ fontSize:'11px', color: texto === 'Finalizado' ? '#999' : '#A32D2D', fontWeight:'500' }}>{texto}</span>
}

function BotonCompartirTarjeta({ remate }) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const url = BASE_URL + '/remate/' + remate.id
  const texto = 'Mira este articulo en Puja.pe! ' + remate.titulo + ' — S/ ' + Number(remate.precio_actual).toLocaleString()

  async function copiar(e) {
    e.preventDefault(); e.stopPropagation()
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => { setCopiado(false); setAbierto(false) }, 1500)
  }

  function compartir(e, href) {
    e.preventDefault(); e.stopPropagation()
    window.open(href, '_blank')
    setAbierto(false)
  }

  return (
    <div style={{ position:'relative' }} onClick={e => e.preventDefault()}>
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); setAbierto(!abierto) }}
        style={{ background:'white', border:'1px solid #eee', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', color:'#666', display:'flex', alignItems:'center', gap:'4px' }}>
        🔗 Compartir
      </button>
      {abierto && (
        <div style={{ position:'absolute', bottom:'32px', right:0, background:'white', border:'1px solid #eee', borderRadius:'10px', padding:'8px', zIndex:10, width:'180px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
          <button onClick={e => compartir(e, 'https://wa.me/?text=' + encodeURIComponent(texto + '\n' + url))}
            style={{ width:'100%', padding:'7px 10px', border:'none', background:'none', cursor:'pointer', fontSize:'12px', textAlign:'left', borderRadius:'6px', display:'flex', alignItems:'center', gap:'8px' }}>
            💬 WhatsApp
          </button>
          <button onClick={e => compartir(e, 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url))}
            style={{ width:'100%', padding:'7px 10px', border:'none', background:'none', cursor:'pointer', fontSize:'12px', textAlign:'left', borderRadius:'6px', display:'flex', alignItems:'center', gap:'8px' }}>
            📘 Facebook
          </button>
          <button onClick={e => compartir(e, 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto) + '&url=' + encodeURIComponent(url))}
            style={{ width:'100%', padding:'7px 10px', border:'none', background:'none', cursor:'pointer', fontSize:'12px', textAlign:'left', borderRadius:'6px', display:'flex', alignItems:'center', gap:'8px' }}>
            🐦 Twitter/X
          </button>
          <button onClick={copiar}
            style={{ width:'100%', padding:'7px 10px', border:'none', background: copiado ? '#E1F5EE' : 'none', cursor:'pointer', fontSize:'12px', textAlign:'left', borderRadius:'6px', display:'flex', alignItems:'center', gap:'8px', color: copiado ? '#085041' : '#444' }}>
            {copiado ? '✅ Copiado!' : '🔗 Copiar enlace'}
          </button>
        </div>
      )}
    </div>
  )
}

function TarjetaRemate({ remate }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', display:'block', position:'relative' }}>
      <a href={'/remate/' + remate.id} style={{ textDecoration:'none', color:'black', display:'block' }}>
        <div style={{ height:'140px', background:'#f5f5f5', overflow:'hidden' }}>
          {remate.imagen_url
            ? <img src={remate.imagen_url} alt={remate.titulo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', background:'#e0e0e0' }}></div>}
        </div>
        <div style={{ padding:'12px 12px 8px' }}>
          <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{remate.titulo}</p>
          <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>{remate.categoria}</p>
          <p style={{ fontSize:'18px', fontWeight:'500', marginBottom:'6px' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px' }}>
            <TiempoRestante fechaFin={remate.fecha_fin} tipoPub={remate.tipo_publicacion} />
            <span style={{ fontSize:'11px', background: remate.tipo_publicacion === 'precio_fijo' ? '#E6F1FB' : '#FCEBEB', color: remate.tipo_publicacion === 'precio_fijo' ? '#185FA5' : '#A32D2D', padding:'2px 8px', borderRadius:'20px' }}>
              {remate.tipo_publicacion === 'precio_fijo' ? 'Venta directa' : 'En vivo'}
            </span>
          </div>
        </div>
      </a>
      <div style={{ padding:'0 12px 10px', display:'flex', justifyContent:'flex-end' }}>
        <BotonCompartirTarjeta remate={remate} />
      </div>
    </div>
  )
}

export default function HomeClient({ q }) {
  const [remates, setRemates] = useState([])
  const [hot, setHot] = useState([])
  const [nuevos, setNuevos] = useState([])
  const [inputBusqueda, setInputBusqueda] = useState(q)
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [catHover, setCatHover] = useState(null)

  const busqueda = q

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

  const busquedaActiva = busqueda.trim().length > 0
  const rematesFiltrados = busquedaActiva
    ? remates.filter(r =>
        r.titulo?.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
        r.categoria?.toLowerCase().includes(busqueda.trim().toLowerCase())
      )
    : remates
  const totalPaginas = Math.ceil(rematesFiltrados.length / POR_PAGINA)
  const rematesPagina = rematesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function buscar() {
    const val = inputBusqueda.trim()
    if (val) {
      window.location.href = '/?q=' + encodeURIComponent(val)
    } else {
      window.location.href = '/'
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') buscar()
  }

  const btnPag = { padding:'8px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:'13px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

  return (
    <main style={{ fontFamily:'sans-serif', overflowX:'hidden' }}>
      <Navbar />

      {/* CATEGORIAS */}
      <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'12px 16px' }}>
        <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', maxWidth:'1200px', margin:'0 auto', gap:'6px' }}>
          {CATEGORIAS.map((cat, i) => (
            <a key={cat} href={'/categoria/' + CATEGORIAS_URL[i]}
              onMouseEnter={() => setCatHover(cat)}
              onMouseLeave={() => setCatHover(null)}
              style={{
                padding:'8px 16px', borderRadius:'20px',
                border: catHover === cat ? '1px solid #1D9E75' : '1px solid #ddd',
                textDecoration:'none', fontSize:'13px', fontWeight:'700',
                color: catHover === cat ? '#085041' : '#444',
                background: catHover === cat ? '#E1F5EE' : '#f9f9f9',
                whiteSpace:'nowrap', letterSpacing:'0.5px',
                transition:'all 0.15s'
              }}>
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section style={{ background:'#f9f9f9', padding:'32px 16px', textAlign:'center', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'500', marginBottom:'8px' }}>Remata y compra en todo el Peru</h1>
        <p style={{ color:'#666', marginBottom:'20px', fontSize:'14px' }}>Encuentra las mejores ofertas o publica lo que ya no usas</p>
        <div style={{ display:'flex', gap:'8px', maxWidth:'480px', margin:'0 auto' }}>
          <input type='text' placeholder='Busca articulos...' value={inputBusqueda}
            onChange={e => setInputBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', minWidth:0 }} />
          <button onClick={buscar} style={{ padding:'10px 16px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500', whiteSpace:'nowrap' }}>Buscar</button>
        </div>
      </section>

      {/* LOS REMATES MAS HOT */}
      {!cargando && hot.length > 0 && !busquedaActiva && (
        <section style={{ padding:'24px 16px', maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
            <h2 style={{ fontSize:'18px', fontWeight:'700', letterSpacing:'0.5px' }}>LOS REMATES MAS HOT</h2>
            <span style={{ fontSize:'18px' }}>🔥🔥🔥🔥</span>
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
      {!cargando && nuevos.length > 0 && !busquedaActiva && (
        <section style={{ padding:'24px 16px', maxWidth:'1200px', margin:'0 auto', borderTop:'1px solid #eee' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'18px' }}>✨</span>
            <h2 style={{ fontSize:'18px', fontWeight:'700', letterSpacing:'0.5px' }}>LO NUEVO</h2>
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
            {busquedaActiva ? `Resultados para "${busqueda}"` : 'Todos los remates'} ({cargando ? '...' : rematesFiltrados.length})
          </h2>
          {totalPaginas > 1 && <span style={{ fontSize:'13px', color:'#999' }}>Pagina {pagina} de {totalPaginas}</span>}
        </div>
        {cargando && <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>Cargando remates...</div>}
        {!cargando && rematesFiltrados.length === 0 && busquedaActiva && (
          <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>
            <p style={{ fontSize:'16px', marginBottom:'8px' }}>No se encontraron resultados para "{busqueda}"</p>
            <p style={{ fontSize:'13px' }}>Intenta con otro término de búsqueda</p>
          </div>
        )}
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
