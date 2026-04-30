'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

const PALABRAS_BLOQUEADAS = [
  'mierda','puta','puto','concha','culo','perra','perro','idiota','imbecil',
  'estupido','estupida','pendejo','pendeja','carajo','marica','huevon',
  'cabron','cabrona','coño','joder','polla','verga','sexo','porn','xxx',
  'insulto','hdp','ctm','ptm','cstm','weon','weona','culiao','conchetumare'
]

function contienePalabrasBloqueadas(texto) {
  const lower = texto.toLowerCase()
  return PALABRAS_BLOQUEADAS.some(p => lower.includes(p))
}

export default function PreguntasYRespuestas({ remateId, vendedorId }) {
  const [preguntas, setPreguntas] = useState([])
  const [nuevaPregunta, setNuevaPregunta] = useState('')
  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [respondiendo, setRespondiendo] = useState(null)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [esVendedor, setEsVendedor] = useState(false)
  const [esAdmin, setEsAdmin] = useState(false)
  const [usuarioVerificado, setUsuarioVerificado] = useState(false)

  useEffect(() => {
    cargarPreguntas()
    async function verificarUsuario() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) return
      setSession(s)
      setEsVendedor(s.user.id === vendedorId)
      const { data: admin } = await supabase.from('admins').select('email').eq('email', s.user.email).maybeSingle()
      setEsAdmin(!!admin)
      const { data: perfil } = await supabase.from('usuarios').select('celular_verificado').eq('id', s.user.id).single()
      setUsuarioVerificado(!!perfil?.celular_verificado)
    }
    verificarUsuario()

    const canal = supabase.channel('preguntas-' + remateId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas', filter: `remate_id=eq.${remateId}` },
        () => cargarPreguntas())
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [remateId])

  async function cargarPreguntas() {
    const { data } = await supabase
      .from('preguntas')
      .select('*')
      .eq('remate_id', remateId)
      .eq('activa', true)
      .order('created_at', { ascending: true })
    setPreguntas(data || [])
  }

  async function enviarPregunta() {
    setError('')
    if (!nuevaPregunta.trim()) return
    if (contienePalabrasBloqueadas(nuevaPregunta)) {
      setError('Tu pregunta contiene palabras no permitidas. Por favor revisa nuestras políticas de uso.')
      return
    }
    setEnviando(true)
    const { data: perfil } = await supabase.from('usuarios').select('nickname').eq('id', session.user.id).single()
    const { error: err } = await supabase.from('preguntas').insert({
      remate_id: remateId,
      usuario_id: session.user.id,
      nickname: perfil?.nickname || 'Usuario',
      pregunta: nuevaPregunta.trim()
    })
    if (err) { setError('Error al enviar la pregunta.') }
    else { setNuevaPregunta('') }
    setEnviando(false)
  }

  async function enviarRespuesta(preguntaId) {
    setError('')
    const texto = respuestas[preguntaId]?.trim()
    if (!texto) return
    if (contienePalabrasBloqueadas(texto)) {
      setError('Tu respuesta contiene palabras no permitidas.')
      return
    }
    await supabase.from('preguntas').update({ respuesta: texto }).eq('id', preguntaId)
    setRespondiendo(null)
    setRespuestas({ ...respuestas, [preguntaId]: '' })
  }

  async function eliminarPregunta(preguntaId) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await fetch('/api/admin/eliminar-pregunta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preguntaId, adminEmail: session.user.email })
    })
    cargarPreguntas()
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginTop:'16px' }}>
      <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'16px' }}>
        Preguntas y respuestas ({preguntas.length})
      </h2>

      {/* Lista de preguntas */}
      {preguntas.length === 0 && (
        <p style={{ fontSize:'13px', color:'#999', marginBottom:'16px' }}>Aún no hay preguntas. ¡Sé el primero en preguntar!</p>
      )}

      {preguntas.map(p => (
        <div key={p.id} style={{ borderBottom:'1px solid #f5f5f5', paddingBottom:'12px', marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'13px', marginBottom:'4px' }}>
                <span style={{ fontWeight:'500', color:'#1D9E75' }}>{p.nickname}</span>
                <span style={{ color:'#999', fontSize:'11px', marginLeft:'8px' }}>
                  {new Date(p.created_at).toLocaleDateString('es-PE')}
                </span>
              </p>
              <p style={{ fontSize:'14px', color:'#333', marginBottom:'8px' }}>❓ {p.pregunta}</p>
              {p.respuesta ? (
                <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'10px', borderLeft:'3px solid #1D9E75' }}>
                  <p style={{ fontSize:'11px', color:'#1D9E75', fontWeight:'500', marginBottom:'4px' }}>Respuesta del vendedor</p>
                  <p style={{ fontSize:'13px', color:'#444' }}>{p.respuesta}</p>
                </div>
              ) : esVendedor ? (
                respondiendo === p.id ? (
                  <div style={{ marginTop:'8px' }}>
                    <textarea value={respuestas[p.id] || ''} onChange={e => setRespuestas({ ...respuestas, [p.id]: e.target.value })}
                      placeholder='Escribe tu respuesta...'
                      style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', resize:'vertical', height:'70px', boxSizing:'border-box' }} />
                    <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
                      <button onClick={() => setRespondiendo(null)}
                        style={{ padding:'6px 12px', borderRadius:'6px', border:'1px solid #ddd', background:'transparent', fontSize:'12px', cursor:'pointer', color:'#666' }}>
                        Cancelar
                      </button>
                      <button onClick={() => enviarRespuesta(p.id)}
                        style={{ padding:'6px 12px', borderRadius:'6px', border:'none', background:'#1D9E75', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:'500' }}>
                        Responder
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRespondiendo(p.id)}
                    style={{ fontSize:'12px', color:'#1D9E75', background:'none', border:'1px solid #1D9E75', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', marginTop:'4px' }}>
                    Responder
                  </button>
                )
              ) : (
                <p style={{ fontSize:'12px', color:'#bbb', marginTop:'4px' }}>Sin respuesta aún</p>
              )}
            </div>
            {esAdmin && (
              <button onClick={() => eliminarPregunta(p.id)}
                style={{ background:'none', border:'none', color:'#E24B4A', cursor:'pointer', fontSize:'18px', marginLeft:'8px', flexShrink:0 }}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Formulario nueva pregunta */}
      {error && (
        <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>
          {error}
        </div>
      )}

      {session && usuarioVerificado && !esVendedor && (
        <div style={{ marginTop:'8px' }}>
          <textarea value={nuevaPregunta} onChange={e => setNuevaPregunta(e.target.value)}
            placeholder='Escribe tu pregunta sobre el producto...'
            style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', resize:'vertical', height:'70px', boxSizing:'border-box' }} />
          <button onClick={enviarPregunta} disabled={enviando || !nuevaPregunta.trim()}
            style={{ marginTop:'8px', padding:'9px 20px', borderRadius:'8px', border:'none', background: enviando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'14px', fontWeight:'500', cursor:'pointer' }}>
            {enviando ? 'Enviando...' : 'Enviar pregunta'}
          </button>
        </div>
      )}

      {!session && (
        <p style={{ fontSize:'13px', color:'#999', marginTop:'8px' }}>
          <a href='/login' style={{ color:'#1D9E75' }}>Inicia sesión</a> para hacer una pregunta.
        </p>
      )}

      {session && !usuarioVerificado && !esVendedor && (
        <p style={{ fontSize:'13px', color:'#999', marginTop:'8px' }}>
          Debes verificar tu cuenta para hacer preguntas.
        </p>
      )}
    </div>
  )
}
