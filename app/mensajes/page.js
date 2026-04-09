'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

export default function Mensajes() {
  const [mensajes, setMensajes] = useState([])
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('nuevo')

  useEffect(() => {
    cargarMensajes()
  }, [])

  async function cargarMensajes() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('usuario_id', session.user.id)
      .order('created_at', { ascending: false })
    setMensajes(data || [])
    setCargando(false)
  }

  async function enviarMensaje() {
    setEnviando(true)
    setError('')
    setExito('')
    if (!asunto.trim() || !mensaje.trim()) {
      setError('El asunto y el mensaje son obligatorios.')
      setEnviando(false)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para enviar un mensaje.'); setEnviando(false); return }
    const { error: err } = await supabase.from('mensajes').insert({
      usuario_id: session.user.id,
      asunto: asunto.trim(),
      mensaje: mensaje.trim()
    })
    if (err) { setError('Error al enviar el mensaje.'); setEnviando(false); return }
    setAsunto('')
    setMensaje('')
    setExito('¡Mensaje enviado! El equipo de Puja.pe te responderá pronto.')
    setTab('historial')
    cargarMensajes()
    setEnviando(false)
  }

  const estilo = {
    tab: (activo) => ({ padding:'8px 18px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'500', background: activo ? '#1D9E75' : '#f5f5f5', color: activo ? '#fff' : '#666' }),
  }

  if (cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando...</div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'500', marginBottom:'24px' }}>Contactar soporte</h1>

        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          <button style={estilo.tab(tab === 'nuevo')} onClick={() => setTab('nuevo')}>Nuevo mensaje</button>
          <button style={estilo.tab(tab === 'historial')} onClick={() => setTab('historial')}>
            Mis mensajes {mensajes.length > 0 && `(${mensajes.length})`}
          </button>
        </div>

        {/* NUEVO MENSAJE */}
        {tab === 'nuevo' && (
          <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'24px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'16px' }}>Enviar mensaje al soporte</h2>
            {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
            {exito && <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{exito}</div>}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Asunto *</label>
              <input value={asunto} onChange={e => setAsunto(e.target.value)}
                placeholder='Ej: Problema con mi publicación'
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Mensaje *</label>
              <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
                placeholder='Describe tu consulta o problema...'
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', height:'120px', resize:'vertical', boxSizing:'border-box' }} />
            </div>
            <button onClick={enviarMensaje} disabled={enviando}
              style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: enviando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        )}

        {/* HISTORIAL */}
        {tab === 'historial' && (
          <div>
            {mensajes.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px', background:'#fff', border:'1px solid #eee', borderRadius:'12px', color:'#999' }}>
                No has enviado ningún mensaje aún.
              </div>
            )}
            {mensajes.map(m => (
              <div key={m.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{m.asunto}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>{new Date(m.created_at).toLocaleDateString('es-PE', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                  <span style={{ fontSize:'11px', background: m.respondido ? '#E1F5EE' : '#f5f5f5', color: m.respondido ? '#085041' : '#999', padding:'2px 10px', borderRadius:'20px', flexShrink:0 }}>
                    {m.respondido ? 'Respondido' : 'Pendiente'}
                  </span>
                </div>
                <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px', marginBottom: m.respuesta ? '12px' : '0' }}>
                  <p style={{ fontSize:'12px', color:'#666', marginBottom:'4px', fontWeight:'500' }}>Tu mensaje:</p>
                  <p style={{ fontSize:'13px', color:'#444', lineHeight:'1.6' }}>{m.mensaje}</p>
                </div>
                {m.respuesta && (
                  <div style={{ background:'#E1F5EE', borderRadius:'8px', padding:'12px', border:'1px solid #9FE1CB' }}>
                    <p style={{ fontSize:'12px', color:'#085041', marginBottom:'4px', fontWeight:'500' }}>Respuesta de Puja.pe:</p>
                    <p style={{ fontSize:'13px', color:'#085041', lineHeight:'1.6' }}>{m.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}