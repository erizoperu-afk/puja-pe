'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PujaBox({ remate }) {
  const [precio, setPrecio] = useState(Number(remate.precio_actual))
  const [pujas, setPujas] = useState([])
  const [miPuja, setMiPuja] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const fin = new Date(remate.fecha_fin).getTime()
    const tick = setInterval(() => {
      const diff = Math.max(0, Math.floor((fin - Date.now()) / 1000))
      setSegundos(diff)
    }, 1000)
    return () => clearInterval(tick)
  }, [remate.fecha_fin])

  useEffect(() => {
    cargarPujas()
  }, [])

  async function cargarPujas() {
    const { data } = await supabase
      .from('pujas')
      .select('*')
      .eq('remate_id', remate.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setPujas(data)
  }

  async function hacerPuja() {
    setCargando(true)
    setError('')
    setMensaje('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Debes ingresar para pujar.')
      setCargando(false)
      return
    }
    const monto = Number(miPuja)
    const minimo = precio + Number(remate.incremento_minimo)
    if (monto < minimo) {
      setError('Tu puja debe ser mayor a S/ ' + minimo)
      setCargando(false)
      return
    }
    const { error: errPuja } = await supabase
      .from('pujas')
      .insert({ remate_id: remate.id, usuario_id: session.user.id, monto })
    if (errPuja) {
      setError('Error al registrar puja.')
      setCargando(false)
      return
    }
    await supabase.from('remates').update({ precio_actual: monto }).eq('id', remate.id)
    setPrecio(monto)
    setMiPuja('')
    setMensaje('Puja registrada! Vas ganando.')
    cargarPujas()
    setCargando(false)
  }

  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  const pad = n => String(n).padStart(2, '0')

  return (
    <div style={{ position:'sticky', top:'24px' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#FCEBEB', color:'#A32D2D', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', marginBottom:'12px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#E24B4A' }}></div>
          En vivo
        </div>
        <h1 style={{ fontSize:'17px', fontWeight:'500', marginBottom:'16px', lineHeight:'1.4' }}>{remate.titulo}</h1>
        <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px', textAlign:'center', marginBottom:'16px' }}>
          <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>Tiempo restante</p>
          <div style={{ display:'flex', justifyContent:'center', gap:'8px' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'24px', fontWeight:'500', color:'#A32D2D', fontFamily:'monospace' }}>{pad(h)}</div>
              <div style={{ fontSize:'10px', color:'#999' }}>h</div>
            </div>
            <div style={{ fontSize:'24px', fontWeight:'500', color:'#999' }}>:</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'24px', fontWeight:'500', color:'#A32D2D', fontFamily:'monospace' }}>{pad(m)}</div>
              <div style={{ fontSize:'10px', color:'#999' }}>m</div>
            </div>
            <div style={{ fontSize:'24px', fontWeight:'500', color:'#999' }}>:</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'24px', fontWeight:'500', color:'#A32D2D', fontFamily:'monospace' }}>{pad(s)}</div>
              <div style={{ fontSize:'10px', color:'#999' }}>s</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>Precio actual</p>
        <p style={{ fontSize:'28px', fontWeight:'500', marginBottom:'4px' }}>S/ {precio.toLocaleString()}</p>
        <p style={{ fontSize:'12px', color:'#999', marginBottom:'16px' }}>{pujas.length} pujas</p>
        {pujas.length > 0 && (
          <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'10px', marginBottom:'16px' }}>
            <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>Ultimas pujas</p>
            {pujas.map((p, i) => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'3px 0' }}>
                <span style={{ color:'#666' }}>Usuario {i + 1}</span>
                <span style={{ fontWeight:'500', color: i === 0 ? '#1D9E75' : '#333' }}>S/ {Number(p.monto).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>
            {error}
          </div>
        )}
        {mensaje && (
          <div style={{ background:'#E1F5EE', color:'#085041', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>
            {mensaje}
          </div>
        )}
        <p style={{ fontSize:'12px', color:'#666', marginBottom:'6px' }}>Tu puja - minimo S/ {precio + Number(remate.incremento_minimo)}</p>
        <input
          type='number'
          value={miPuja}
          onChange={e => setMiPuja(e.target.value)}
          placeholder={String(precio + Number(remate.incremento_minimo))}
          style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box' }}
        />
        <button
          onClick={hacerPuja}
          disabled={cargando}
          style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'8px' }}
        >
          {cargando ? 'Registrando...' : 'Pujar ahora'}
        </button>
        {remate.precio_directo && (
          <button style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'14px', cursor:'pointer' }}>
            Comprar directo - S/ {Number(remate.precio_directo).toLocaleString()}
          </button>
        )}
      </div>
    </div>
  )
}