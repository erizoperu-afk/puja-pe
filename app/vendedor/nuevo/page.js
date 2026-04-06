'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../../Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function NuevoRemate() {
  const [form, setForm] = useState({
    titulo: '', descripcion: '', precio_inicial: '',
    precio_directo: '', incremento_minimo: '20',
    categoria: '', condicion: 'Como nuevo',
    ubicacion: '', duracion: '3'
  })
  const [fotos, setFotos] = useState([])
  const [fotosUrl, setFotosUrl] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function publicar() {
    setCargando(true)
    setError('')
    setMensaje('')
    if (!form.titulo || !form.precio_inicial || !form.categoria || fotos.length === 0) {
      setError('Completa los campos obligatorios y agrega al menos 1 foto.')
      setCargando(false)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para publicar.'); setCargando(false); return }
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + Number(form.duracion))
    let imagen_url = null
    if (fotos.length > 0) {
      const nombreArchivo = session.user.id + '_' + Date.now() + '_' + fotos[0].name
      const { error: uploadError } = await supabase.storage
        .from('fotos-remates')
        .upload(nombreArchivo, fotos[0])
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('fotos-remates')
          .getPublicUrl(nombreArchivo)
        imagen_url = urlData.publicUrl
      }
    }
    const { error: err } = await supabase.from('remates').insert({
      titulo: form.titulo,
      descripcion: form.descripcion,
      precio_inicial: Number(form.precio_inicial),
      precio_actual: Number(form.precio_inicial),
      precio_directo: form.precio_directo ? Number(form.precio_directo) : null,
      incremento_minimo: Number(form.incremento_minimo),
      categoria: form.categoria,
      condicion: form.condicion,
      ubicacion: form.ubicacion,
      vendedor_id: session.user.id,
      fecha_fin: fechaFin.toISOString(),
      activo: true,
      imagen_url: imagen_url,
    })
    if (err) { setError('Error al publicar: ' + err.message); setCargando(false); return }
    setMensaje('Remate publicado exitosamente!')
    setTimeout(() => { window.location.href = '/vendedor' }, 1500)
    setCargando(false)
  }

  const campo = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginTop:'5px', boxSizing:'border-box' }

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
          <a href='/vendedor' style={{ color:'#1D9E75', textDecoration:'none', fontSize:'13px' }}>Mi panel</a>
          <h1 style={{ fontSize:'20px', fontWeight:'500' }}>Publicar nuevo remate</h1>
        </div>
        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
        {mensaje && <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{mensaje}</div>}

        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'4px' }}>Fotos del producto</h2>
          <p style={{ fontSize:'12px', color:'#999', marginBottom:'12px' }}>Minimo 1, maximo 3 fotos</p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {fotosUrl.map((url, i) => (
              <div key={i} style={{ position:'relative' }}>
                <img src={url} alt='foto' style={{ width:'100px', height:'100px', objectFit:'cover', borderRadius:'8px', border:'1px solid #eee' }} />
                <button onClick={() => {
                  setFotos(fotos.filter((_, j) => j !== i))
                  setFotosUrl(fotosUrl.filter((_, j) => j !== i))
                }} style={{ position:'absolute', top:'-8px', right:'-8px', width:'22px', height:'22px', borderRadius:'50%', background:'#E24B4A', color:'white', border:'none', cursor:'pointer', fontSize:'12px' }}>x</button>
              </div>
            ))}
            {fotos.length < 3 && (
              <label style={{ width:'100px', height:'100px', border:'1px dashed #ddd', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'#f9f9f9', fontSize:'12px', color:'#999' }}>
                <span style={{ fontSize:'24px', marginBottom:'4px' }}>+</span>
                Agregar
                <input type='file' accept='image/*' style={{ display:'none' }} onChange={(e) => {
                  const archivo = e.target.files[0]
                  if (!archivo || fotos.length >= 3) return
                  setFotos([...fotos, archivo])
                  setFotosUrl([...fotosUrl, URL.createObjectURL(archivo)])
                }} />
              </label>
            )}
          </div>
          {fotos.length === 0 && <p style={{ fontSize:'12px', color:'#A32D2D', marginTop:'10px' }}>Agrega al menos 1 foto.</p>}
        </div>

        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'14px' }}>Informacion del producto</h2>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#666' }}>Titulo *</label>
            <input name='titulo' value={form.titulo} onChange={handleChange} placeholder='Ej: Laptop Dell XPS 13' style={campo} />
          </div>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#666' }}>Descripcion</label>
            <textarea name='descripcion' value={form.descripcion} onChange={handleChange} placeholder='Describe el estado, que incluye...' style={{ ...campo, height:'80px', resize:'vertical' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Categoria *</label>
              <select name='categoria' value={form.categoria} onChange={handleChange} style={campo}>
                <option value=''>Selecciona</option>
                <option>Electronica</option>
                <option>Vehiculos</option>
                <option>Hogar</option>
                <option>Ropa</option>
                <option>Deportes</option>
                <option>Inmuebles</option>
                <option>Arte</option>
                <option>Otros</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Condicion</label>
              <select name='condicion' value={form.condicion} onChange={handleChange} style={campo}>
                <option>Nuevo</option>
                <option>Como nuevo</option>
                <option>Buen estado</option>
                <option>Usado</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#666' }}>Ubicacion</label>
            <input name='ubicacion' value={form.ubicacion} onChange={handleChange} placeholder='Ej: Lima, Miraflores' style={campo} />
          </div>
        </div>

        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'14px' }}>Configuracion de la subasta</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Precio inicial (S/) *</label>
              <input name='precio_inicial' type='number' value={form.precio_inicial} onChange={handleChange} placeholder='500' style={campo} />
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Incremento minimo (S/)</label>
              <input name='incremento_minimo' type='number' value={form.incremento_minimo} onChange={handleChange} placeholder='20' style={campo} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Compra directa (opcional)</label>
              <input name='precio_directo' type='number' value={form.precio_directo} onChange={handleChange} placeholder='3500' style={campo} />
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Duracion</label>
              <select name='duracion' value={form.duracion} onChange={handleChange} style={campo}>
                <option value='1'>1 dia</option>
                <option value='3'>3 dias</option>
                <option value='5'>5 dias</option>
                <option value='7'>7 dias</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={publicar} disabled={cargando} style={{ width:'100%', padding:'12px', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
          {cargando ? 'Publicando...' : 'Publicar remate'}
        </button>
      </div>
    </main>
  )
}