'use client'

import { useState } from 'react'
import { supabase } from '../../supabase'
import Navbar from '../../Navbar'

export default function NuevoRemate() {
  const [tipo, setTipo] = useState('subasta')
  const [permiteOfertas, setPermiteOfertas] = useState(false)
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
  const [errores, setErrores] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errores[e.target.name]) setErrores({ ...errores, [e.target.name]: '' })
  }

  function validar() {
    const nuevosErrores = {}
    if (!form.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio.'
    if (!form.categoria) nuevosErrores.categoria = 'La categoría es obligatoria.'
    if (!form.precio_inicial) nuevosErrores.precio_inicial = 'El precio inicial es obligatorio.'
    if (fotos.length === 0) nuevosErrores.fotos = 'Agrega al menos 1 foto.'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function publicar() {
    setError('')
    setMensaje('')
    if (!validar()) return
    setCargando(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para publicar.'); setCargando(false); return }

    const { data: cred } = await supabase
      .from('creditos')
      .select('saldo')
      .eq('usuario_id', session.user.id)
      .single()
    if (!cred || cred.saldo <= 0) {
      setError('No tienes créditos disponibles para publicar.')
      setCargando(false)
      return
    }

    const fechaFin = new Date()
    if (tipo === 'subasta') {
      fechaFin.setDate(fechaFin.getDate() + Number(form.duracion))
    } else {
      fechaFin.setDate(fechaFin.getDate() + 30)
    }

    let imagen_url = null
    let imagenes_url = []
    for (let i = 0; i < fotos.length; i++) {
      const nombreArchivo = session.user.id + '_' + Date.now() + '_' + i + '_' + fotos[i].name
      const { error: uploadError } = await supabase.storage
        .from('fotos-remates')
        .upload(nombreArchivo, fotos[i])
      if (uploadError) { setError('Error al subir foto: ' + uploadError.message); setCargando(false); return }
      const { data: urlData } = supabase.storage.from('fotos-remates').getPublicUrl(nombreArchivo)
      imagenes_url.push(urlData.publicUrl)
    }
    if (imagenes_url.length > 0) imagen_url = imagenes_url[0]

    const { error: err } = await supabase.from('remates').insert({
      titulo: form.titulo, descripcion: form.descripcion,
      precio_inicial: Number(form.precio_inicial), precio_actual: Number(form.precio_inicial),
      precio_directo: form.precio_directo ? Number(form.precio_directo) : null,
      incremento_minimo: tipo === 'subasta' ? Number(form.incremento_minimo) : null,
      categoria: form.categoria, condicion: form.condicion,
      ubicacion: form.ubicacion, vendedor_id: session.user.id,
      fecha_fin: fechaFin.toISOString(), activo: true,
      imagen_url, imagenes_url,
      tipo_publicacion: tipo,
      permite_ofertas: tipo === 'precio_fijo' ? permiteOfertas : false,
    })
    if (err) { setError('Error al publicar: ' + err.message); setCargando(false); return }

    await supabase
      .from('creditos')
      .update({ saldo: cred.saldo - 1 })
      .eq('usuario_id', session.user.id)

    setMensaje('¡Publicación creada exitosamente!')
    setTimeout(() => { window.location.href = '/vendedor' }, 1500)
    setCargando(false)
  }

  const campo = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginTop:'5px', boxSizing:'border-box' }
  const campoError = { ...campo, border:'1px solid #E24B4A' }
  const textoError = { fontSize:'12px', color:'#A32D2D', marginTop:'4px' }
  const btnTipo = (activo) => ({
    flex:1, padding:'12px', borderRadius:'8px', border: activo ? '2px solid #1D9E75' : '1px solid #ddd',
    background: activo ? '#E1F5EE' : '#fff', cursor:'pointer', fontSize:'13px',
    fontWeight:'500', color: activo ? '#085041' : '#666'
  })

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
          <a href='/vendedor' style={{ color:'#1D9E75', textDecoration:'none', fontSize:'13px' }}>Mi panel</a>
          <h1 style={{ fontSize:'20px', fontWeight:'500' }}>Publicar</h1>
        </div>

        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
        {mensaje && <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{mensaje}</div>}

        {/* TIPO DE PUBLICACION */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'14px' }}>Tipo de publicación</h2>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => setTipo('subasta')} style={btnTipo(tipo === 'subasta')}>
              Subasta
            </button>
            <button onClick={() => setTipo('precio_fijo')} style={btnTipo(tipo === 'precio_fijo')}>
              Precio fijo
            </button>
          </div>
          <p style={{ fontSize:'12px', color:'#999', marginTop:'10px' }}>
            {tipo === 'subasta'
              ? 'Los compradores pujan por tu artículo. Gana quien ofrezca más al terminar el tiempo.'
              : 'Tu artículo se vende al precio que estableces. Vigencia de 30 días.'}
          </p>
          {tipo === 'precio_fijo' && (
            <div style={{ marginTop:'12px', display:'flex', alignItems:'center', gap:'10px' }}>
              <input type='checkbox' id='ofertas' checked={permiteOfertas} onChange={e => setPermiteOfertas(e.target.checked)}
                style={{ width:'16px', height:'16px', cursor:'pointer', accentColor:'#1D9E75' }} />
              <label htmlFor='ofertas' style={{ fontSize:'13px', color:'#444', cursor:'pointer' }}>
                Permitir que los compradores envíen ofertas por debajo del precio
              </label>
            </div>
          )}
        </div>

        {/* FOTOS */}
        <div style={{ background:'#fff', border: errores.fotos ? '1px solid #E24B4A' : '1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'4px' }}>Fotos del producto</h2>
          <p style={{ fontSize:'12px', color:'#999', marginBottom:'12px' }}>Minimo 1, maximo 3 fotos</p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {fotosUrl.map((url, i) => (
              <div key={i} style={{ position:'relative' }}>
                <img src={url} alt='foto' style={{ width:'100px', height:'100px', objectFit:'cover', borderRadius:'8px', border:'1px solid #eee' }} />
                <button onClick={() => { setFotos(fotos.filter((_, j) => j !== i)); setFotosUrl(fotosUrl.filter((_, j) => j !== i)) }}
                  style={{ position:'absolute', top:'-8px', right:'-8px', width:'22px', height:'22px', borderRadius:'50%', background:'#E24B4A', color:'white', border:'none', cursor:'pointer', fontSize:'12px' }}>x</button>
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
                  if (errores.fotos) setErrores({ ...errores, fotos: '' })
                }} />
              </label>
            )}
          </div>
          {errores.fotos && <p style={textoError}>{errores.fotos}</p>}
        </div>

        {/* INFO PRODUCTO */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'14px' }}>Informacion del producto</h2>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color: errores.titulo ? '#A32D2D' : '#666' }}>Titulo *</label>
            <input name='titulo' value={form.titulo} onChange={handleChange} placeholder='Ej: Moneda Peru 1900' style={errores.titulo ? campoError : campo} />
            {errores.titulo && <p style={textoError}>{errores.titulo}</p>}
          </div>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#666' }}>Descripcion</label>
            <textarea name='descripcion' value={form.descripcion} onChange={handleChange} placeholder='Describe el estado, que incluye...' style={{ ...campo, height:'80px', resize:'vertical' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'12px', color: errores.categoria ? '#A32D2D' : '#666' }}>Categoria *</label>
              <select name='categoria' value={form.categoria} onChange={handleChange} style={errores.categoria ? campoError : campo}>
                <option value=''>Selecciona</option>
                <option>Antiguedades</option>
                <option>Coleccionables</option>
                <option>Electronica</option>
                <option>Filatelia</option>
                <option>Juguetes</option>
                <option>Numismatica</option>
                <option>Relojes</option>
                <option>Ropa y accesorios</option>
                <option>Otros</option>
              </select>
              {errores.categoria && <p style={textoError}>{errores.categoria}</p>}
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Condicion</label>
              <select name='condicion' value={form.condicion} onChange={handleChange} style={campo}>
                <option>Nuevo</option><option>Como nuevo</option><option>Buen estado</option><option>Usado</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#666' }}>Ubicacion</label>
            <input name='ubicacion' value={form.ubicacion} onChange={handleChange} placeholder='Ej: Lima, Miraflores' style={campo} />
          </div>
        </div>

        {/* CONFIGURACION */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'14px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'14px' }}>
            {tipo === 'subasta' ? 'Configuracion de la subasta' : 'Configuracion del precio'}
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom: tipo === 'subasta' ? '14px' : '0' }}>
            <div>
              <label style={{ fontSize:'12px', color: errores.precio_inicial ? '#A32D2D' : '#666' }}>
                {tipo === 'subasta' ? 'Precio inicial (S/) *' : 'Precio fijo (S/) *'}
              </label>
              <input name='precio_inicial' type='number' value={form.precio_inicial} onChange={handleChange}
                placeholder='500' style={errores.precio_inicial ? campoError : campo} />
              {errores.precio_inicial && <p style={textoError}>{errores.precio_inicial}</p>}
            </div>
            {tipo === 'subasta' && (
              <div>
                <label style={{ fontSize:'12px', color:'#666' }}>Incremento minimo (S/)</label>
                <input name='incremento_minimo' type='number' value={form.incremento_minimo} onChange={handleChange} placeholder='20' style={campo} />
              </div>
            )}
          </div>
          {tipo === 'subasta' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#666' }}>Compra directa (opcional)</label>
                <input name='precio_directo' type='number' value={form.precio_directo} onChange={handleChange} placeholder='3500' style={campo} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666' }}>Duracion</label>
                <select name='duracion' value={form.duracion} onChange={handleChange} style={campo}>
                  <option value='1'>1 dia</option><option value='3'>3 dias</option>
                  <option value='5'>5 dias</option><option value='7'>7 dias</option>
                </select>
              </div>
            </div>
          )}
          {tipo === 'precio_fijo' && (
            <p style={{ fontSize:'12px', color:'#999', marginTop:'10px' }}>
              La publicación tendrá una vigencia de 30 días o hasta que alguien compre el artículo.
            </p>
          )}
        </div>

        <button onClick={publicar} disabled={cargando} style={{ width:'100%', padding:'12px', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
          {cargando ? 'Publicando...' : tipo === 'subasta' ? 'Publicar subasta' : 'Publicar a precio fijo'}
        </button>
      </div>
    </main>
  )
}