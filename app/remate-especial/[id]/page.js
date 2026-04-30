'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import Navbar from '../../Navbar'

const LABELS_EXTRA = { material:'Material', anio:'Año', autor:'Autor', lugar_origen:'Lugar de origen', periodo:'Período', marca:'Marca', estilo:'Estilo' }

function TiempoRestante({ fechaInicio, fechaFin }) {
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('proximo')

  useEffect(() => {
    function calcular() {
      const ahora = Date.now()
      const inicio = new Date(fechaInicio).getTime()
      const fin = new Date(fechaFin).getTime()
      const pad = n => String(n).padStart(2, '0')

      if (ahora < inicio) {
        const diff = inicio - ahora
        const d = Math.floor(diff / 86400000)
        const h = Math.floor((diff % 86400000) / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setEstado('proximo')
        setTexto(d > 0 ? `Inicia en ${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `Inicia en ${pad(h)}:${pad(m)}:${pad(s)}`)
      } else if (ahora < fin) {
        const diff = fin - ahora
        const d = Math.floor(diff / 86400000)
        const h = Math.floor((diff % 86400000) / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setEstado('activo')
        setTexto(d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`)
      } else {
        setEstado('finalizado')
        setTexto('Finalizado')
      }
    }
    calcular()
    const tick = setInterval(calcular, 1000)
    return () => clearInterval(tick)
  }, [fechaInicio, fechaFin])

  const colores = { proximo: '#185FA5', activo: '#A32D2D', finalizado: '#999' }
  const bg = { proximo: '#E6F1FB', activo: '#FCEBEB', finalizado: '#f5f5f5' }
  return (
    <div style={{ background: bg[estado], borderRadius:'8px', padding:'12px', textAlign:'center', marginBottom:'16px' }}>
      <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>
        {estado === 'proximo' ? 'Próximamente' : estado === 'activo' ? 'Tiempo restante' : 'Remate'}
      </p>
      <p style={{ fontSize:'22px', fontWeight:'700', color: colores[estado], fontFamily:'monospace' }}>{texto}</p>
    </div>
  )
}

export default function RemateEspecialPage() {
  const [remate, setRemate] = useState(null)
  const [organizador, setOrganizador] = useState(null)
  const [session, setSession] = useState(null)
  const [tieneAcceso, setTieneAcceso] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [fotoActiva, setFotoActiva] = useState(0)
  const [monto, setMonto] = useState('')
  const [pujas, setPujas] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const id = window.location.pathname.split('/').pop()
    async function cargar() {
      const { data: r } = await supabase.from('remates_especiales')
        .select('*, organizadores_especiales(id, nombre_organizacion, whatsapp, email)')
        .eq('id', id).single()
      if (!r) { setCargando(false); return }
      setRemate(r)
      setOrganizador(r.organizadores_especiales)

      const { data: { session: s } } = await supabase.auth.getSession()
      setSession(s)

      if (s) {
        const { data: acceso } = await supabase.from('accesos_especiales')
          .select('id').eq('usuario_id', s.user.id).eq('organizador_id', r.organizadores_especiales.id).maybeSingle()
        setTieneAcceso(!!acceso)

        const { data: admin } = await supabase.from('admins').select('email').eq('email', s.user.email).maybeSingle()
        if (admin) setTieneAcceso(true)
      }

      const { data: pujasData } = await supabase.from('pujas')
        .select('monto, usuarios(nickname)')
        .eq('remate_id', id)
        .order('monto', { ascending: false })
        .limit(10)
      setPujas(pujasData || [])

      setCargando(false)
    }
    cargar()
  }, [])

  async function hacerPuja() {
    setError(''); setMensaje('')
    const montoNum = Number(monto)
    const precioActual = pujas[0]?.monto || remate.precio_base
    if (montoNum <= precioActual) { setError(`La puja debe ser mayor a S/ ${precioActual.toLocaleString()}`); return }
    setEnviando(true)
    const { error: err } = await supabase.from('pujas').insert({
      remate_id: remate.id,
      usuario_id: session.user.id,
      monto: montoNum
    })
    if (err) { setError('Error al registrar puja.'); setEnviando(false); return }
    setMensaje('¡Puja registrada!')
    setMonto('')
    const { data } = await supabase.from('pujas').select('monto, usuarios(nickname)').eq('remate_id', remate.id).order('monto', { ascending: false }).limit(10)
    setPujas(data || [])
    setEnviando(false)
  }

  if (cargando) return <main style={{ fontFamily:'sans-serif' }}><Navbar /><div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando...</div></main>
  if (!remate) return <main style={{ fontFamily:'sans-serif' }}><Navbar /><div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Remate no encontrado.</div></main>

  const precioActual = pujas[0]?.monto || remate.precio_base
  const ahora = Date.now()
  const estaActivo = ahora >= new Date(remate.fecha_inicio).getTime() && ahora < new Date(remate.fecha_fin).getTime()

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'16px' }}>
        <p style={{ fontSize:'12px', color:'#999', marginBottom:'12px' }}>
          <a href='/' style={{ color:'#1D9E75', textDecoration:'none' }}>Inicio</a> ›
          <span style={{ color:'#C9A84C' }}> 🏛️ Remates Especiales</span> › {remate.titulo}
        </p>

        {/* Badge organización */}
        <div style={{ background:'linear-gradient(135deg, #1a1a2e, #2d2d44)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🏛️</span>
          <div>
            <p style={{ color:'#C9A84C', fontSize:'11px', fontWeight:'600', letterSpacing:'1px' }}>REMATE ESPECIAL</p>
            <p style={{ color:'white', fontSize:'14px', fontWeight:'500' }}>{organizador?.nombre_organizacion}</p>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'16px' }} className='remate-grid'>
          {/* GALERÍA */}
          <div className='galeria-col'>
            <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden' }}>
              <div style={{ height:'320px', background:'#f5f5f5', overflow:'hidden' }}>
                {remate.imagenes_url?.[fotoActiva] && (
                  <img src={remate.imagenes_url[fotoActiva]} alt={remate.titulo} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                )}
              </div>
              {remate.imagenes_url?.length > 1 && (
                <div style={{ display:'flex', gap:'6px', padding:'10px', overflowX:'auto' }}>
                  {remate.imagenes_url.map((url, i) => (
                    <img key={i} src={url} alt='' onClick={() => setFotoActiva(i)}
                      style={{ width:'60px', height:'60px', objectFit:'cover', borderRadius:'6px', cursor:'pointer', border: i === fotoActiva ? '2px solid #C9A84C' : '2px solid transparent', flexShrink:0 }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CAJA DE PUJA */}
          <div className='pujabox-col'>
            <div style={{ background:'#fff', border:'2px solid #C9A84C', borderRadius:'12px', padding:'20px', position:'sticky', top:'24px' }}>
              <h1 style={{ fontSize:'17px', fontWeight:'500', marginBottom:'16px', lineHeight:'1.4' }}>{remate.titulo}</h1>

              <TiempoRestante fechaInicio={remate.fecha_inicio} fechaFin={remate.fecha_fin} />

              <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>Precio actual</p>
              <p style={{ fontSize:'28px', fontWeight:'700', color:'#C9A84C', marginBottom:'4px' }}>S/ {Number(precioActual).toLocaleString()}</p>
              <p style={{ fontSize:'12px', color:'#999', marginBottom:'16px' }}>{pujas.length} puja{pujas.length !== 1 ? 's' : ''}</p>

              {/* Historial pujas */}
              {pujas.length > 0 && (
                <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'10px', marginBottom:'16px' }}>
                  <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>Últimas pujas</p>
                  {pujas.slice(0, 5).map((p, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'3px 0' }}>
                      <span style={{ color:'#666' }}>{p.usuarios?.nickname || 'Usuario'}</span>
                      <span style={{ fontWeight:'500', color: i === 0 ? '#C9A84C' : '#333' }}>S/ {Number(p.monto).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>{error}</div>}
              {mensaje && <div style={{ background:'#E1F5EE', color:'#085041', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>{mensaje}</div>}

              {tieneAcceso && estaActivo && session && (
                <>
                  <p style={{ fontSize:'12px', color:'#666', marginBottom:'6px' }}>Tu puja — mínimo S/ {(precioActual + 1).toLocaleString()}</p>
                  <input type='number' value={monto} onChange={e => setMonto(e.target.value)} min={precioActual + 1}
                    placeholder={String(precioActual + 1)}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #C9A84C', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box' }} />
                  <button onClick={hacerPuja} disabled={enviando}
                    style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: enviando ? '#C9A84C88' : '#C9A84C', color:'white', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
                    {enviando ? 'Registrando...' : '🏛️ Pujar ahora'}
                  </button>
                </>
              )}

              {!tieneAcceso && (
                <div style={{ background:'#f9f9f9', borderRadius:'10px', padding:'16px', textAlign:'center' }}>
                  <p style={{ fontSize:'13px', color:'#666', marginBottom:'12px' }}>Solo usuarios invitados pueden pujar en este remate.</p>
                  <a href='/acceso-especial' style={{ display:'block', padding:'10px', background:'#1a1a2e', color:'#C9A84C', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'600', marginBottom:'8px' }}>
                    🔐 Ingresar código de acceso
                  </a>
                  {organizador?.whatsapp && (
                    <a href={`https://wa.me/${organizador.whatsapp.replace(/\D/g,'')}`} target='_blank'
                      style={{ display:'block', padding:'10px', background:'#25D366', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'600', marginBottom:'8px' }}>
                      💬 Solicitar invitación por WhatsApp
                    </a>
                  )}
                  {organizador?.email && (
                    <a href={`mailto:${organizador.email}`}
                      style={{ display:'block', padding:'10px', border:'1px solid #ddd', color:'#666', borderRadius:'8px', textDecoration:'none', fontSize:'13px' }}>
                      ✉️ Contactar por email
                    </a>
                  )}
                </div>
              )}

              {!session && (
                <a href='/login' style={{ display:'block', padding:'11px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500', textAlign:'center' }}>
                  Inicia sesión para participar
                </a>
              )}
            </div>
          </div>

          {/* INFO */}
          <div className='info-col'>
            <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px' }}>Descripción</h2>
              <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.7' }}>{remate.descripcion || 'Sin descripción.'}</p>
            </div>

            {/* Campos especiales */}
            {Object.keys(LABELS_EXTRA).some(k => remate[k]) && (
              <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
                <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px' }}>Ficha técnica</h2>
                {Object.entries(LABELS_EXTRA).map(([k, lbl]) => remate[k] ? (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5f5f5', fontSize:'14px' }}>
                    <span style={{ color:'#999' }}>{lbl}</span>
                    <span style={{ fontWeight:'500' }}>{remate[k]}</span>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .remate-grid {
            grid-template-columns: 1fr 340px !important;
            grid-template-areas: 'galeria pujabox' 'info pujabox' !important;
          }
          .galeria-col { grid-area: galeria; }
          .pujabox-col { grid-area: pujabox; }
          .info-col { grid-area: info; }
        }
        @media (max-width: 767px) {
          .remate-grid { display: flex !important; flex-direction: column !important; }
          .galeria-col { order: 1; } .pujabox-col { order: 2; } .info-col { order: 3; }
        }
      `}</style>
    </main>
  )
}
