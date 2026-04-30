'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import Navbar from '../../Navbar'

const CAMPOS_EXTRA = ['material', 'anio', 'autor', 'lugar_origen', 'periodo', 'marca', 'estilo']
const LABELS_EXTRA = { material:'Material', anio:'Año', autor:'Autor', lugar_origen:'Lugar de origen', periodo:'Período', marca:'Marca', estilo:'Estilo' }

function comprimirImagen(file, maxWidth = 1400, quality = 0.85) {
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

export default function PanelOrganizador({ params }) {
  const [organizadorId, setOrganizadorId] = useState(null)
  const [organizador, setOrganizador] = useState(null)
  const [remates, setRemates] = useState([])
  const [autorizado, setAutorizado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [publicando, setPublicando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [fotos, setFotos] = useState([])
  const [fotosUrl, setFotosUrl] = useState([])
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    titulo:'', descripcion:'', precio_base:'',
    fecha_inicio:'', hora_inicio:'', fecha_fin:'', hora_fin:'',
    material:'', anio:'', autor:'', lugar_origen:'', periodo:'', marca:'', estilo:''
  })

  useEffect(() => {
    async function init() {
      const { params: p } = await { params }
      const id = window.location.pathname.split('/').pop()
      setOrganizadorId(id)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const { data: org } = await supabase.from('organizadores_especiales').select('*').eq('id', id).single()
      if (!org) { setCargando(false); return }
      setOrganizador(org)

      const { data: admin } = await supabase.from('admins').select('email').eq('email', session.user.email).maybeSingle()
      const esAdmin = !!admin
      const esOrganizador = org.usuario_id === session.user.id
      if (!esAdmin && !esOrganizador) { window.location.href = '/'; return }
      setAutorizado(true)

      const { data: rematesData } = await supabase.from('remates_especiales').select('*').eq('organizador_id', id).order('created_at', { ascending: false })
      setRemates(rematesData || [])
      setCargando(false)
    }
    init()
  }, [])

  async function publicarRemate() {
    setError('')
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return }
    if (!form.precio_base || Number(form.precio_base) <= 0) { setError('El precio base debe ser mayor a 0.'); return }
    if (fotos.length === 0) { setError('Agrega al menos 1 foto.'); return }
    if (!form.fecha_inicio || !form.hora_inicio || !form.fecha_fin || !form.hora_fin) { setError('Las fechas de inicio y fin son obligatorias.'); return }

    setPublicando(true)
    const { data: { session } } = await supabase.auth.getSession()
    const imagenes_url = []

    for (let i = 0; i < fotos.length; i++) {
      const nombreArchivo = organizadorId + '_' + Date.now() + '_' + i + '.jpg'
      const comprimida = await comprimirImagen(fotos[i])
      const fd = new FormData()
      fd.append('file', comprimida, nombreArchivo)
      fd.append('key', nombreArchivo)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) { setError('Error al subir foto.'); setPublicando(false); return }
      const { url } = await res.json()
      imagenes_url.push(url)
    }

    const fechaInicio = new Date(form.fecha_inicio + 'T' + form.hora_inicio).toISOString()
    const fechaFin = new Date(form.fecha_fin + 'T' + form.hora_fin).toISOString()

    const res = await fetch('/api/organizador/publicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizadorId,
        userEmail: session.user.email,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        precio_base: Number(form.precio_base),
        imagenes_url,
        material: form.material.trim() || null,
        anio: form.anio.trim() || null,
        autor: form.autor.trim() || null,
        lugar_origen: form.lugar_origen.trim() || null,
        periodo: form.periodo.trim() || null,
        marca: form.marca.trim() || null,
        estilo: form.estilo.trim() || null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activo: true
      })
    })

    if (!res.ok) { const d = await res.json(); setError('Error al publicar: ' + d.error); setPublicando(false); return }

    const { data: rematesData } = await supabase.from('remates_especiales').select('*').eq('organizador_id', organizadorId).order('created_at', { ascending: false })
    setRemates(rematesData || [])
    setForm({ titulo:'', descripcion:'', precio_base:'', fecha_inicio:'', hora_inicio:'', fecha_fin:'', hora_fin:'', material:'', anio:'', autor:'', lugar_origen:'', periodo:'', marca:'', estilo:'' })
    setFotos([]); setFotosUrl([])
    setMostrarForm(false)
    setExito('¡Remate especial publicado!')
    setTimeout(() => setExito(''), 3000)
    setPublicando(false)
  }

  const campo = { width:'100%', padding:'9px 11px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', boxSizing:'border-box' }

  if (cargando) return <main style={{ fontFamily:'sans-serif' }}><Navbar /><div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando...</div></main>
  if (!autorizado) return <main style={{ fontFamily:'sans-serif' }}><Navbar /><div style={{ textAlign:'center', padding:'60px', color:'#999' }}>No autorizado.</div></main>

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'20px', fontWeight:'500' }}>Panel: {organizador?.nombre_organizacion}</h1>
            <p style={{ fontSize:'13px', color:'#999' }}>Código de acceso: <strong>{organizador?.codigo_acceso}</strong></p>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)}
            style={{ padding:'10px 18px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
            {mostrarForm ? 'Cancelar' : '+ Nueva publicación'}
          </button>
        </div>

        {exito && <div style={{ background:'#E1F5EE', color:'#085041', padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px' }}>{exito}</div>}
        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px' }}>{error}</div>}

        {/* FORMULARIO */}
        {mostrarForm && (
          <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'16px' }}>Nueva publicación especial</h2>

            {/* Fotos */}
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'6px' }}>Fotos (mínimo 1, máximo 10)</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {fotosUrl.map((url, i) => (
                  <div key={i} style={{ position:'relative' }}>
                    <img src={url} alt='' style={{ width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px', border:'1px solid #eee' }} />
                    <button onClick={() => { setFotos(f => f.filter((_,j) => j!==i)); setFotosUrl(u => u.filter((_,j) => j!==i)) }}
                      style={{ position:'absolute', top:'-6px', right:'-6px', width:'18px', height:'18px', borderRadius:'50%', background:'#E24B4A', color:'white', border:'none', cursor:'pointer', fontSize:'10px' }}>×</button>
                  </div>
                ))}
                {fotos.length < 10 && (
                  <label style={{ width:'80px', height:'80px', border:'1px dashed #ddd', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'11px', color:'#999' }}>
                    <span style={{ fontSize:'24px' }}>+</span>
                    Foto
                    <input type='file' accept='image/*' multiple style={{ display:'none' }} onChange={e => {
                      const archivos = Array.from(e.target.files).slice(0, 10 - fotos.length)
                      setFotos(f => [...f, ...archivos])
                      setFotosUrl(u => [...u, ...archivos.map(f => URL.createObjectURL(f))])
                    }} />
                  </label>
                )}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Título *</label>
                <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} style={campo} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={{ ...campo, height:'80px', resize:'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Precio base S/ *</label>
                <input type='number' min='1' value={form.precio_base} onChange={e => setForm({...form, precio_base: e.target.value})} style={campo} />
              </div>
            </div>

            {/* Fechas */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Fecha inicio *</label>
                <input type='date' value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})} style={campo} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Hora inicio *</label>
                <input type='time' value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})} style={campo} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Fecha fin *</label>
                <input type='date' value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})} style={campo} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>Hora fin *</label>
                <input type='time' value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})} style={campo} />
              </div>
            </div>

            {/* Campos especiales */}
            <p style={{ fontSize:'12px', color:'#999', marginBottom:'8px' }}>Campos adicionales (todos opcionales)</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {CAMPOS_EXTRA.map(c => (
                <div key={c}>
                  <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'3px' }}>{LABELS_EXTRA[c]}</label>
                  <input value={form[c]} onChange={e => setForm({...form, [c]: e.target.value})} style={campo} />
                </div>
              ))}
            </div>

            <button onClick={publicarRemate} disabled={publicando}
              style={{ padding:'11px 24px', background: publicando ? '#9FE1CB' : '#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer', fontWeight:'500' }}>
              {publicando ? 'Publicando...' : 'Publicar remate especial'}
            </button>
          </div>
        )}

        {/* LISTA DE REMATES */}
        <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px' }}>Publicaciones ({remates.length})</h2>
        {remates.length === 0 && <p style={{ color:'#999', fontSize:'13px' }}>No hay publicaciones aún.</p>}
        {remates.map(r => (
          <div key={r.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'14px', marginBottom:'10px', display:'flex', gap:'12px' }}>
            {r.imagenes_url?.[0] && <img src={r.imagenes_url[0]} alt='' style={{ width:'70px', height:'70px', objectFit:'cover', borderRadius:'8px', flexShrink:0 }} />}
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{r.titulo}</p>
              <p style={{ fontSize:'12px', color:'#999', marginBottom:'2px' }}>Precio base: S/ {Number(r.precio_base).toLocaleString()}</p>
              <p style={{ fontSize:'12px', color:'#999' }}>
                {new Date(r.fecha_inicio).toLocaleDateString('es-PE')} → {new Date(r.fecha_fin).toLocaleDateString('es-PE')}
              </p>
            </div>
            <a href={`/remate-especial/${r.id}`} style={{ fontSize:'12px', color:'#1D9E75', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px', textDecoration:'none', alignSelf:'center' }}>Ver</a>
          </div>
        ))}
      </div>
    </main>
  )
}
