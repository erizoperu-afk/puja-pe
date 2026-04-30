'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

function comprimirImagen(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

const POR_PAGINA = 6

const CATEGORIAS = [
  'Antiguedades', 'Coleccionables', 'Electronica', 'Filatelia',
  'Juguetes', 'Numismatica', 'Relojes', 'Ropa y accesorios', 'Otros'
]

export default function PanelVendedor() {
  const [remates, setRemates] = useState([])
  const [pujasXRemate, setPujasXRemate] = useState({})
  const [totalPujas, setTotalPujas] = useState(0)
  const [creditos, setCreditos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [session, setSession] = useState(null)
  const [contactos, setContactos] = useState({})
  const [tab, setTab] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [editandoActivo, setEditandoActivo] = useState(null)
  const [formEditarActivo, setFormEditarActivo] = useState({})
  const [guardandoActivo, setGuardandoActivo] = useState(false)
  const [fotosActivo, setFotosActivo] = useState([])
  const [fotosActivoUrl, setFotosActivoUrl] = useState([])
  const [fotosActivoExistentes, setFotosActivoExistentes] = useState([])

  useEffect(() => { cargarDatos() }, [])
  useEffect(() => { setPagina(1) }, [tab])

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

      const rematesVendidos = data.filter(r => r.comprador_id)
      const contactosData = {}
      for (const r of rematesVendidos) {
        const { data: contacto } = await supabase.rpc('get_datos_contacto', { p_usuario_id: r.comprador_id })
        if (contacto) contactosData[r.id] = contacto
        if (!r.comprador_id && r.precio_actual > r.precio_inicial) {
          const { data: pujaMayor } = await supabase
            .from('pujas').select('usuario_id')
            .eq('remate_id', r.id)
            .order('monto', { ascending: false })
            .limit(1).single()
          if (pujaMayor) {
            const { data: contactoPuja } = await supabase.rpc('get_datos_contacto', { p_usuario_id: pujaMayor.usuario_id })
            if (contactoPuja) contactosData[r.id] = contactoPuja
          }
        }
      }
      setContactos(contactosData)
    }

    const { data: cred } = await supabase.from('creditos').select('saldo').eq('usuario_id', session.user.id).single()
    setCreditos(cred?.saldo ?? 0)
    setCargando(false)
  }

  function estadoRemate(remate) {
    if (!remate.activo && remate.fecha_inicio && new Date(remate.fecha_inicio) > new Date()) return 'programado'
    if (remate.activo) return 'activo'
    if (remate.comprador_id) return 'vendido'
    if (remate.precio_actual > remate.precio_inicial) return 'vendido'
    return 'sin_oferta'
  }

  async function cancelarProgramacion(remateId) {
    if (!confirm('¿Cancelar esta publicación programada?')) return
    await supabase.from('remates').update({ activo: false, fecha_inicio: null }).eq('id', remateId)
    cargarDatos()
  }

  async function cancelarPublicacion(remateId, titulo) {
    if (!confirm(`¿Cancelar la publicación "${titulo}"? El remate se desactivará. El crédito no se reintegra.`)) return
    await supabase.from('remates').update({ activo: false }).eq('id', remateId)
    cargarDatos()
  }

  function abrirEditorActivo(r) {
    setEditandoActivo(r.id)
    setFormEditarActivo({ titulo: r.titulo, descripcion: r.descripcion, categoria: r.categoria, precio_inicial: r.precio_inicial })
    setFotosActivo([])
    setFotosActivoUrl([])
    setFotosActivoExistentes(r.imagenes_url || (r.imagen_url ? [r.imagen_url] : []))
  }

  async function guardarCambiosActivo(remateId) {
    const urlRegex = /(https?:\/\/|www\.)\S+/i
    if (urlRegex.test(formEditarActivo.titulo) || urlRegex.test(formEditarActivo.descripcion)) {
      alert('El título y la descripción no pueden contener enlaces web.')
      return
    }
    setGuardandoActivo(true)

    let imagenes_url = [...fotosActivoExistentes]
    let imagen_url = imagenes_url[0] || null

    if (fotosActivo.length > 0) {
      const { data: { session: s } } = await supabase.auth.getSession()
      for (let i = 0; i < fotosActivo.length; i++) {
        const nombreArchivo = s.user.id + '_' + Date.now() + '_' + i + '.jpg'
        const comprimida = await comprimirImagen(fotosActivo[i])
        const fd = new FormData()
        fd.append('file', comprimida, nombreArchivo)
        fd.append('key', nombreArchivo)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          imagenes_url.push(url)
        }
      }
      imagenes_url = imagenes_url.slice(0, 3)
      imagen_url = imagenes_url[0]
    }

    await supabase.from('remates').update({
      titulo: formEditarActivo.titulo,
      descripcion: formEditarActivo.descripcion,
      categoria: formEditarActivo.categoria,
      precio_inicial: Number(formEditarActivo.precio_inicial),
      precio_actual: Number(formEditarActivo.precio_inicial),
      imagen_url,
      imagenes_url,
    }).eq('id', remateId)

    setEditandoActivo(null)
    setFotosActivo([])
    setFotosActivoUrl([])
    setFotosActivoExistentes([])
    setGuardandoActivo(false)
    cargarDatos()
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
    const urlRegex = /(https?:\/\/|www\.)\S+/i
    if (urlRegex.test(formEditar.titulo) || urlRegex.test(formEditar.descripcion)) {
      alert('El título y la descripción no pueden contener enlaces web.')
      return
    }
    setGuardando(true)
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + 3)
    await supabase.from('remates').update({
      titulo: formEditar.titulo,
      descripcion: formEditar.descripcion,
      categoria: formEditar.categoria,
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

  const rematesProgramados = remates.filter(r => estadoRemate(r) === 'programado')
  const rematesActivos     = remates.filter(r => estadoRemate(r) === 'activo')
  const rematesVendidos    = remates.filter(r => estadoRemate(r) === 'vendido')
  const rematesSinOferta   = remates.filter(r => estadoRemate(r) === 'sin_oferta')

  const label = { fontSize:'11px', color:'#666', display:'block', marginBottom:'3px', fontWeight:'500' }
  const campo = { width:'100%', padding:'8px 10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', boxSizing:'border-box' }

  const badges = {
    activo:     { texto:'Activo',      bg:'#E1F5EE', color:'#085041' },
    programado: { texto:'Programado',  bg:'#FFF8E1', color:'#B8860B' },
    vendido:    { texto:'Vendido',     bg:'#E6F1FB', color:'#185FA5' },
    sin_oferta: { texto:'Sin ofertas', bg:'#f5f5f5', color:'#999'    },
  }

  const btnPag = { padding:'7px 12px', borderRadius:'8px', border:'1px solid #eee', background:'#fff', cursor:'pointer', fontSize:'12px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

  function Paginacion({ items }) {
    const total = Math.ceil(items.length / POR_PAGINA)
    if (total <= 1) return null
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px', marginTop:'20px', flexWrap:'wrap' }}>
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
          style={{ ...btnPag, opacity: pagina === 1 ? 0.4 : 1 }}>← Anterior</button>
        {Array.from({ length: total }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => setPagina(n)} style={n === pagina ? btnPagActivo : btnPag}>{n}</button>
        ))}
        <button onClick={() => setPagina(p => Math.min(total, p + 1))} disabled={pagina === total}
          style={{ ...btnPag, opacity: pagina === total ? 0.4 : 1 }}>Siguiente →</button>
      </div>
    )
  }

  const listaTab = {
    todos:      remates,
    activos:    [...rematesProgramados, ...rematesActivos],
    vendidos:   rematesVendidos,
    sin_oferta: rematesSinOferta,
  }[tab]

  const listaPaginada = listaTab.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const tabs = [
    { key:'todos',      label:'Todos',       count: remates.length },
    { key:'activos',    label:'Activos',     count: rematesActivos.length + rematesProgramados.length },
    { key:'vendidos',   label:'Vendidos',    count: rematesVendidos.length },
    { key:'sin_oferta', label:'Sin ofertas', count: rematesSinOferta.length },
  ]

  if (cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando tu panel...</div>
    </main>
  )

  const totalFotosActivo = fotosActivoExistentes.length + fotosActivo.length

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'16px' }}>
<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h1 style={{ fontSize:'20px', fontWeight:'500' }}>Mi panel vendedor</h1>
          <div style={{ display:'flex', gap:'8px' }}>
            <a href='/' style={{ padding:'8px 14px', background:'#f5f5f5', color:'#666', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500', border:'1px solid #eee' }}>
              Página Principal
            </a>
            <a href='/vendedor/nuevo' style={{ padding:'8px 14px', background: creditos > 0 ? '#1D9E75' : '#ccc', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500', pointerEvents: creditos > 0 ? 'auto' : 'none' }}>
              + Publicar
            </a>
          </div>
        </div>

        {rematesVendidos.length > 0 && (
          <div style={{ background:'#E6F1FB', border:'1.5px solid #378ADD', borderRadius:'12px', padding:'14px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <p style={{ fontSize:'13px', fontWeight:'500', color:'#185FA5', marginBottom:'2px' }}>
                {rematesVendidos.length === 1 ? 'Tienes 1 venta' : `Tienes ${rematesVendidos.length} ventas`} — coordina la entrega con {rematesVendidos.length === 1 ? 'el comprador' : 'los compradores'}
              </p>
              <p style={{ fontSize:'12px', color:'#378ADD' }}>Los datos de contacto aparecen en cada tarjeta de venta</p>
            </div>
            <button onClick={() => setTab('vendidos')}
              style={{ padding:'7px 14px', background:'#185FA5', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer', flexShrink:0 }}>
              Ver ventas
            </button>
          </div>
        )}

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

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginBottom:'20px' }}>
          {[
            ['Activos',     rematesActivos.length,   '#1D9E75'],
            ['Vendidos',    rematesVendidos.length,  '#185FA5'],
            ['Sin ofertas', rematesSinOferta.length, '#999'   ],
            ['Pujas total', totalPujas,              '#333'   ],
          ].map(([lbl, val, color]) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'12px' }}>
              <div style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>{lbl}</div>
              <div style={{ fontSize:'22px', fontWeight:'500', color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:'6px', marginBottom:'16px', overflowX:'auto', paddingBottom:'4px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding:'7px 14px', borderRadius:'20px', cursor:'pointer', fontSize:'12px', fontWeight:'500', whiteSpace:'nowrap',
                background: tab === t.key ? '#1D9E75' : '#fff',
                color:      tab === t.key ? '#fff'    : '#666',
                border:     tab === t.key ? '1px solid #1D9E75' : '1px solid #eee',
              }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {listaTab.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', background:'#fff', border:'1px solid #eee', borderRadius:'12px', color:'#999' }}>
            {tab === 'todos'      && 'No tienes remates publicados aún.'}
            {tab === 'activos'    && 'No tienes publicaciones activas en este momento.'}
            {tab === 'vendidos'   && 'Aún no has concretado ninguna venta.'}
            {tab === 'sin_oferta' && 'No tienes publicaciones sin ofertas.'}
          </div>
        ) : (
          <>
            <div style={{ fontSize:'12px', color:'#999', marginBottom:'10px' }}>
              Mostrando {((pagina - 1) * POR_PAGINA) + 1}–{Math.min(pagina * POR_PAGINA, listaTab.length)} de {listaTab.length}
            </div>
            {listaPaginada.map(r => {
              const estado     = estadoRemate(r)
              const numPujas   = pujasXRemate[r.id] || 0
              const contacto   = contactos[r.id]
              const badge      = badges[estado]
              const puedeEditar = estado === 'activo' && numPujas === 0
              const esEditandoEsteActivo = editandoActivo === r.id
              const esEditandoEsteSinOferta = editando === r.id

              const borderColor = estado === 'vendido'    ? '#378ADD'
                                : estado === 'activo'     ? '#1D9E75'
                                : estado === 'programado' ? '#FFD700'
                                : '#eee'

              return (
                <div key={r.id} style={{ background:'#fff', border:`1.5px solid ${borderColor}`, borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                    <div style={{ width:'52px', height:'52px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                      {r.imagen_url && <img src={r.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                    </div>
                    <div style={{ flex:1, minWidth:'120px' }}>
                      <div style={{ marginBottom:'3px' }}>
                        <span style={{ fontSize:'10px', background: badge.bg, color: badge.color, padding:'2px 8px', borderRadius:'20px', fontWeight:'500' }}>{badge.texto}</span>
                      </div>
                      <p style={{ fontWeight:'500', fontSize:'13px', marginBottom:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.titulo}</p>
                      <p style={{ fontSize:'11px', color:'#999' }}>{r.categoria}</p>
                    </div>
                    <div style={{ display:'flex', gap:'16px', alignItems:'center', flexShrink:0 }}>
                      <div style={{ textAlign:'center' }}>
                        <p style={{ fontSize:'10px', color:'#999', marginBottom:'2px' }}>Pujas</p>
                        <p style={{ fontSize:'20px', fontWeight:'500', color: numPujas > 0 ? '#1D9E75' : '#ccc' }}>{numPujas}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:'10px', color:'#999', marginBottom:'2px' }}>{estado === 'activo' ? 'Precio actual' : 'Precio final'}</p>
                        <p style={{ fontSize:'15px', fontWeight:'500' }}>S/ {Number(r.precio_actual).toLocaleString()}</p>
                      </div>
                      <a href={'/remate/' + r.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 10px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>
                    </div>
                  </div>

                  {/* ACTIVO SIN PUJAS — botones editar/cancelar */}
                  {puedeEditar && !esEditandoEsteActivo && (
                    <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid #f0f0f0', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <button onClick={() => abrirEditorActivo(r)}
                        style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #1D9E75', background:'transparent', fontSize:'12px', cursor:'pointer', color:'#1D9E75', minWidth:'140px' }}>
                        Modificar publicación
                      </button>
                      <button onClick={() => cancelarPublicacion(r.id, r.titulo)}
                        style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #E24B4A', background:'transparent', fontSize:'12px', cursor:'pointer', color:'#A32D2D', minWidth:'140px' }}>
                        Cancelar publicación
                      </button>
                    </div>
                  )}

                  {/* FORMULARIO EDITAR ACTIVO */}
                  {puedeEditar && esEditandoEsteActivo && (
                    <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid #f0f0f0' }}>
                      <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px' }}>
                        <p style={{ fontSize:'12px', fontWeight:'500', color:'#444', marginBottom:'12px' }}>Modificar publicación — sin costo de crédito</p>

                        {/* FOTOS */}
                        <div style={{ marginBottom:'12px' }}>
                          <label style={label}>Fotos (máximo 3)</label>
                          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'6px' }}>
                            {/* Fotos existentes */}
                            {fotosActivoExistentes.map((url, i) => (
                              <div key={'ex-' + i} style={{ position:'relative' }}>
                                <img src={url} alt='' style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'8px', border:'1px solid #eee' }} />
                                <button
                                  onClick={() => setFotosActivoExistentes(fotosActivoExistentes.filter((_, j) => j !== i))}
                                  style={{ position:'absolute', top:'-6px', right:'-6px', width:'18px', height:'18px', borderRadius:'50%', background:'#E24B4A', color:'white', border:'none', cursor:'pointer', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  ×
                                </button>
                              </div>
                            ))}
                            {/* Fotos nuevas */}
                            {fotosActivoUrl.map((url, i) => (
                              <div key={'new-' + i} style={{ position:'relative' }}>
                                <img src={url} alt='' style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'8px', border:'2px solid #1D9E75' }} />
                                <button
                                  onClick={() => {
                                    setFotosActivo(fotosActivo.filter((_, j) => j !== i))
                                    setFotosActivoUrl(fotosActivoUrl.filter((_, j) => j !== i))
                                  }}
                                  style={{ position:'absolute', top:'-6px', right:'-6px', width:'18px', height:'18px', borderRadius:'50%', background:'#E24B4A', color:'white', border:'none', cursor:'pointer', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  ×
                                </button>
                              </div>
                            ))}
                            {/* Botón agregar */}
                            {totalFotosActivo < 3 && (
                              <label style={{ width:'72px', height:'72px', border:'1px dashed #ddd', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'#fff', fontSize:'11px', color:'#999' }}>
                                <span style={{ fontSize:'20px', marginBottom:'2px' }}>+</span>
                                Agregar
                                <input type='file' accept='image/*' multiple style={{ display:'none' }} onChange={e => {
                                  const archivos = Array.from(e.target.files)
                                  const disponibles = 3 - totalFotosActivo
                                  const nuevos = archivos.slice(0, disponibles)
                                  if (nuevos.length === 0) return
                                  setFotosActivo(prev => [...prev, ...nuevos])
                                  setFotosActivoUrl(prev => [...prev, ...nuevos.map(f => URL.createObjectURL(f))])
                                }} />
                              </label>
                            )}
                          </div>
                          <p style={{ fontSize:'11px', color:'#999', marginTop:'4px' }}>Las fotos con borde verde son nuevas y se subirán al guardar.</p>
                        </div>

                        <div style={{ marginBottom:'10px' }}>
                          <label style={label}>Título</label>
                          <input value={formEditarActivo.titulo} onChange={e => setFormEditarActivo(prev => ({...prev, titulo: e.target.value}))} placeholder='Título del artículo' style={campo} />
                        </div>
                        <div style={{ marginBottom:'10px' }}>
                          <label style={label}>Descripción</label>
                          <textarea value={formEditarActivo.descripcion} onChange={e => setFormEditarActivo(prev => ({...prev, descripcion: e.target.value}))} placeholder='Descripción del artículo' style={{ ...campo, height:'60px', resize:'vertical' }} />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                          <div>
                            <label style={label}>Categoría</label>
                            <select value={formEditarActivo.categoria || ''} onChange={e => setFormEditarActivo(prev => ({...prev, categoria: e.target.value}))} style={campo}>
                              <option value=''>Selecciona categoría</option>
                              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={label}>Precio (S/)</label>
                            <input type='number' value={formEditarActivo.precio_inicial} onChange={e => setFormEditarActivo(prev => ({...prev, precio_inicial: e.target.value}))} placeholder='Precio' style={campo} />
                          </div>
                        </div>
                        <p style={{ fontSize:'11px', color:'#999', marginBottom:'10px' }}>La ubicación no puede modificarse una vez publicado.</p>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button onClick={() => { setEditandoActivo(null); setFotosActivo([]); setFotosActivoUrl([]); setFotosActivoExistentes([]) }}
                            style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>
                            Cancelar
                          </button>
                          <button onClick={() => guardarCambiosActivo(r.id)} disabled={guardandoActivo}
                            style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                            {guardandoActivo ? 'Guardando...' : 'Guardar cambios'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVO CON PUJAS */}
                  {estado === 'activo' && numPujas > 0 && (
                    <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #f0f0f0' }}>
                      <p style={{ fontSize:'11px', color:'#999' }}>Esta publicación tiene {numPujas} {numPujas === 1 ? 'puja' : 'pujas'} — no puede modificarse ni cancelarse.</p>
                    </div>
                  )}

                  {/* VENDIDO CON CONTACTO */}
                  {estado === 'vendido' && contacto && (
                    <div style={{ marginTop:'12px', background:'#E6F1FB', borderRadius:'10px', padding:'12px', border:'1px solid #B5D4F4' }}>
                      <p style={{ fontSize:'12px', fontWeight:'500', color:'#185FA5', marginBottom:'8px' }}>Contacta al comprador para coordinar la entrega</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'8px' }}>
                        <div>
                          <p style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>Nombre</p>
                          <p style={{ fontSize:'13px', fontWeight:'500', color:'#185FA5' }}>{contacto.nombre} {contacto.apellido}</p>
                        </div>
                        <div>
                          <p style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>Celular</p>
                          <p style={{ fontSize:'13px', fontWeight:'500', color:'#185FA5' }}>+51 {contacto.celular}</p>
                        </div>
                        <div>
                          <p style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>Nickname</p>
                          <p style={{ fontSize:'13px', fontWeight:'500', color:'#185FA5' }}>{contacto.nickname}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {estado === 'vendido' && !contacto && (
                    <div style={{ marginTop:'12px', background:'#FFF8E1', borderRadius:'10px', padding:'10px', border:'1px solid #FAC775' }}>
                      <p style={{ fontSize:'12px', color:'#854F0B' }}>Cargando datos del comprador...</p>
                    </div>
                  )}

                  {/* PROGRAMADO */}
                  {estado === 'programado' && (
                    <div style={{ marginTop:'12px', background:'#FFF8E1', borderRadius:'10px', padding:'12px', border:'1px solid #FAC775' }}>
                      <p style={{ fontSize:'12px', fontWeight:'500', color:'#B8860B', marginBottom:'4px' }}>
                        Se activará el {new Date(r.fecha_inicio).toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                      </p>
                      <button onClick={() => cancelarProgramacion(r.id)}
                        style={{ fontSize:'12px', color:'#A32D2D', background:'none', border:'1px solid #E24B4A', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', marginTop:'6px' }}>
                        Cancelar programación
                      </button>
                    </div>
                  )}

                  {/* SIN OFERTA */}
                  {estado === 'sin_oferta' && (
                    <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid #f0f0f0' }}>
                      <p style={{ fontSize:'12px', color:'#999', marginBottom:'8px' }}>Esta publicación concluyó sin recibir ofertas.</p>
                      {esEditandoEsteSinOferta ? (
                        <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px' }}>
                          <p style={{ fontSize:'12px', fontWeight:'500', color:'#444', marginBottom:'12px' }}>Editar y republicar — consume 1 crédito</p>
                          <div style={{ marginBottom:'10px' }}>
                            <label style={label}>Título</label>
                            <input value={formEditar.titulo} onChange={e => setFormEditar(prev => ({...prev, titulo: e.target.value}))} placeholder='Título del artículo' style={campo} />
                          </div>
                          <div style={{ marginBottom:'10px' }}>
                            <label style={label}>Descripción</label>
                            <textarea value={formEditar.descripcion} onChange={e => setFormEditar(prev => ({...prev, descripcion: e.target.value}))} placeholder='Descripción del artículo' style={{ ...campo, height:'60px', resize:'vertical' }} />
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                            <div>
                              <label style={label}>Categoría</label>
                              <select value={formEditar.categoria || ''} onChange={e => setFormEditar(prev => ({...prev, categoria: e.target.value}))} style={campo}>
                                <option value=''>Selecciona categoría</option>
                                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={label}>Nuevo precio (S/)</label>
                              <input type='number' value={formEditar.precio_inicial} onChange={e => setFormEditar(prev => ({...prev, precio_inicial: e.target.value}))} placeholder='Precio' style={campo} />
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:'8px' }}>
                            <button onClick={() => setEditando(null)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>Cancelar</button>
                            <button onClick={() => guardarYRepublicar(r.id)} disabled={guardando}
                              style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                              {guardando ? 'Publicando...' : 'Guardar y republicar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          <button onClick={() => { setEditando(r.id); setFormEditar({ titulo: r.titulo, descripcion: r.descripcion, categoria: r.categoria, precio_inicial: r.precio_inicial }) }}
                            style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'12px', cursor:'pointer', color:'#444', minWidth:'140px' }}>
                            Modificar y republicar (1 crédito)
                          </button>
                          <button onClick={() => republicar(r)}
                            style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:'500', minWidth:'140px' }}>
                            Republicar igual (1 crédito)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <Paginacion items={listaTab} />
          </>
        )}
      </div>
    </main>
  )
}