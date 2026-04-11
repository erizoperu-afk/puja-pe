'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function PujaBox({ remate }) {
  const [precio, setPrecio] = useState(Number(remate.precio_actual))
  const [pujas, setPujas] = useState([])
  const [miPuja, setMiPuja] = useState('')
  const [miAutobid, setMiAutobid] = useState('')
  const [miOferta, setMiOferta] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [mostrarOferta, setMostrarOferta] = useState(false)
  const [esVendedor, setEsVendedor] = useState(false)
  const [modoAutobid, setModoAutobid] = useState(false)
  const [autobidActivo, setAutobidActivo] = useState(null)

  const esPrecioFijo = remate.tipo_publicacion === 'precio_fijo'
  const vencido = segundos === 0 && !esPrecioFijo

  useEffect(() => {
    const fin = new Date(remate.fecha_fin).getTime()
    const diff = Math.max(0, Math.floor((fin - Date.now()) / 1000))
    setSegundos(diff)
    const tick = setInterval(() => {
      const d = Math.max(0, Math.floor((fin - Date.now()) / 1000))
      setSegundos(d)
    }, 1000)
    return () => clearInterval(tick)
  }, [remate.fecha_fin])

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.user.id === remate.vendedor_id) {
        setEsVendedor(true)
      }
      if (session && session.user.id !== remate.vendedor_id) {
        const { data: bid } = await supabase
          .from('autobids')
          .select('*')
          .eq('remate_id', remate.id)
          .eq('usuario_id', session.user.id)
          .eq('activo', true)
          .single()
        if (bid) setAutobidActivo(bid)
      }
      if (!esPrecioFijo) cargarPujas()
    }
    init()

    const canal = supabase
      .channel('pujas-' + remate.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pujas',
        filter: 'remate_id=eq.' + remate.id
      }, () => { cargarPujas() })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'remates',
        filter: 'id=eq.' + remate.id
      }, (payload) => { setPrecio(Number(payload.new.precio_actual)) })
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [])

  async function cargarPujas() {
    const { data } = await supabase
      .from('pujas')
      .select('*')
      .eq('remate_id', remate.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) {
      const pujasConNombre = await Promise.all(data.map(async (p) => {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nickname, reputation_score')
          .eq('id', p.usuario_id)
          .single()
        return { ...p, nickname: userData?.nickname || 'Anónimo', reputation_score: userData?.reputation_score ?? 0 }
      }))
      setPujas(pujasConNombre)
    }
  }

  async function verificarRestriccion(userId) {
    const { data: restricciones } = await supabase
      .from('seller_restrictions')
      .select('*')
      .eq('auction_id', remate.id)

    if (!restricciones || restricciones.length === 0) return null

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('reputation_score')
      .eq('id', userId)
      .single()

    const score = perfil?.reputation_score ?? 0

    const minRep = restricciones.find(r => r.min_reputation !== null)
    if (minRep && score < minRep.min_reputation) {
      return `Necesitas una calificación mínima de +${minRep.min_reputation} para pujar. Tu calificación actual es ${score >= 0 ? '+' : ''}${score}.`
    }

    const bloqueado = restricciones.some(r => r.blocked_user_id === userId)
    if (bloqueado) {
      return 'El vendedor ha restringido tu participación en este remate.'
    }

    return null
  }

  async function hacerPuja() {
    if (vencido) return
    setCargando(true)
    setError('')
    setMensaje('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para pujar.'); setCargando(false); return }
    if (session.user.id === remate.vendedor_id) { setError('No puedes pujar en tu propio remate.'); setCargando(false); return }

    const restriccion = await verificarRestriccion(session.user.id)
    if (restriccion) { setError(restriccion); setCargando(false); return }

    const monto = Number(miPuja)
    const minimo = precio + Number(remate.incremento_minimo)
    if (monto < minimo) { setError('Tu puja debe ser mayor a S/ ' + minimo); setCargando(false); return }
    const { error: errPuja } = await supabase
      .from('pujas')
      .insert({ remate_id: remate.id, usuario_id: session.user.id, monto })
    if (errPuja) { setError('Error al registrar puja: ' + errPuja.message); setCargando(false); return }
    await supabase.from('remates').update({ precio_actual: monto }).eq('id', remate.id)
    await supabase.rpc('procesar_autobid', { p_remate_id: remate.id, p_precio_actual: monto, p_ultimo_postor: session.user.id })
    setMiPuja('')
    setMensaje('¡Puja registrada! Vas ganando.')
    cargarPujas()
    setCargando(false)
  }

  async function configurarAutobid() {
    if (vencido) return
    setCargando(true)
    setError('')
    setMensaje('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para configurar una puja automática.'); setCargando(false); return }
    if (session.user.id === remate.vendedor_id) { setError('No puedes pujar en tu propio remate.'); setCargando(false); return }

    const restriccion = await verificarRestriccion(session.user.id)
    if (restriccion) { setError(restriccion); setCargando(false); return }

    const montoMax = Number(miAutobid)
    const minimo = precio + Number(remate.incremento_minimo)
    if (montoMax < minimo) { setError('Tu puja máxima debe ser mayor a S/ ' + minimo); setCargando(false); return }
    const { error: errBid } = await supabase.from('autobids').upsert({
      remate_id: remate.id,
      usuario_id: session.user.id,
      monto_maximo: montoMax,
      activo: true
    }, { onConflict: 'remate_id,usuario_id' })
    if (errBid) { setError('Error al configurar puja automática.'); setCargando(false); return }
    const primeraP = Math.min(montoMax, precio + Number(remate.incremento_minimo))
    await supabase.from('pujas').insert({ remate_id: remate.id, usuario_id: session.user.id, monto: primeraP })
    await supabase.from('remates').update({ precio_actual: primeraP }).eq('id', remate.id)
    setAutobidActivo({ monto_maximo: montoMax })
    setModoAutobid(false)
    setMiAutobid('')
    setMensaje('¡Puja automática activada! Pujaremos por ti hasta S/ ' + montoMax.toLocaleString())
    cargarPujas()
    setCargando(false)
  }

  async function cancelarAutobid() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('autobids').update({ activo: false })
      .eq('remate_id', remate.id)
      .eq('usuario_id', session.user.id)
    setAutobidActivo(null)
    setMensaje('Puja automática cancelada.')
  }

  async function comprarDirecto() {
    setCargando(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para comprar.'); setCargando(false); return }
    if (session.user.id === remate.vendedor_id) { setError('No puedes comprar tu propio artículo.'); setCargando(false); return }
    const { error: err } = await supabase.from('remates')
      .update({ activo: false, comprador_id: session.user.id })
      .eq('id', remate.id)
    if (err) { setError('Error al procesar la compra.'); setCargando(false); return }
    setMensaje('¡Compra realizada! El vendedor se pondrá en contacto contigo.')
    setCargando(false)
  }

  async function enviarOferta() {
    setCargando(true)
    setError('')
    setMensaje('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para enviar una oferta.'); setCargando(false); return }
    if (session.user.id === remate.vendedor_id) { setError('No puedes hacer una oferta en tu propio artículo.'); setCargando(false); return }
    const monto = Number(miOferta)
    if (monto <= 0) { setError('Ingresa un monto válido.'); setCargando(false); return }
    if (monto >= precio) { setError('Tu oferta debe ser menor al precio fijo de S/ ' + precio.toLocaleString()); setCargando(false); return }
    const { error: err } = await supabase.from('ofertas').insert({
      remate_id: remate.id,
      comprador_id: session.user.id,
      monto,
      estado: 'pendiente'
    })
    if (err) { setError('Error al enviar oferta: ' + err.message); setCargando(false); return }
    setMiOferta('')
    setMostrarOferta(false)
    setMensaje('¡Oferta enviada! El vendedor la revisará pronto.')
    setCargando(false)
  }

  // Formato de puntaje: +5 o -3
  function formatScore(score) {
    return score >= 0 ? `+${score}` : `${score}`
  }

  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  const pad = n => String(n).padStart(2, '0')

  return (
    <div style={{ position:'sticky', top:'24px' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>

        {/* BADGE */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background: esPrecioFijo ? '#E6F1FB' : vencido ? '#f5f5f5' : '#FCEBEB', color: esPrecioFijo ? '#185FA5' : vencido ? '#999' : '#A32D2D', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', marginBottom:'12px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background: esPrecioFijo ? '#378ADD' : vencido ? '#ccc' : '#E24B4A' }}></div>
          {esPrecioFijo ? 'Venta directa' : vencido ? 'Finalizado' : 'En vivo'}
        </div>

        <h1 style={{ fontSize:'17px', fontWeight:'500', marginBottom:'16px', lineHeight:'1.4' }}>{remate.titulo}</h1>

        {/* TEMPORIZADOR */}
        {!esPrecioFijo && (
          <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px', textAlign:'center', marginBottom:'16px' }}>
            <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>Tiempo restante</p>
            <div style={{ display:'flex', justifyContent:'center', gap:'8px' }}>
              {[['h', h], ['m', m], ['s', s]].map(([lbl, val], i, arr) => (
                <>
                  <div key={lbl} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:'500', color: vencido ? '#999' : '#A32D2D', fontFamily:'monospace' }}>{pad(val)}</div>
                    <div style={{ fontSize:'10px', color:'#999' }}>{lbl}</div>
                  </div>
                  {i < arr.length - 1 && <div style={{ fontSize:'24px', fontWeight:'500', color:'#999' }}>:</div>}
                </>
              ))}
            </div>
          </div>
        )}

        {/* PRECIO */}
        <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>
          {esPrecioFijo ? 'Precio' : 'Precio actual'}
        </p>
        <p style={{ fontSize:'28px', fontWeight:'500', marginBottom:'4px' }}>S/ {precio.toLocaleString()}</p>

        {!esPrecioFijo && (
          <p style={{ fontSize:'12px', color:'#999', marginBottom:'16px' }}>{pujas.length} pujas</p>
        )}

        {esPrecioFijo && (
          <p style={{ fontSize:'12px', color:'#999', marginBottom:'16px' }}>
            Vence: {new Date(remate.fecha_fin).toLocaleDateString('es-PE', { day:'numeric', month:'long', year:'numeric' })}
          </p>
        )}

        {/* HISTORIAL PUJAS */}
        {!esPrecioFijo && pujas.length > 0 && (
          <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'10px', marginBottom:'16px' }}>
            <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>Ultimas pujas</p>
            {pujas.map((p, i) => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'3px 0' }}>
                <span style={{ color:'#666' }}>
                  {p.nickname}
                  <span style={{ marginLeft:'4px', color: p.reputation_score > 0 ? '#1D9E75' : p.reputation_score < 0 ? '#A32D2D' : '#999', fontSize:'11px' }}>
                    ({formatScore(p.reputation_score)})
                  </span>
                </span>
                <span style={{ fontWeight:'500', color: i === 0 ? '#1D9E75' : '#333' }}>S/ {Number(p.monto).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>{error}</div>}
        {mensaje && <div style={{ background:'#E1F5EE', color:'#085041', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>{mensaje}</div>}

        {/* VENDEDOR */}
        {esVendedor && (
          <div style={{ background:'#f9f9f9', color:'#999', padding:'12px', borderRadius:'8px', fontSize:'13px', textAlign:'center' }}>
            Esta es tu publicación. No puedes pujar ni comprar tu propio artículo.
          </div>
        )}

        {/* ACCIONES SUBASTA */}
        {!esPrecioFijo && !esVendedor && (
          <>
            {vencido ? (
              <div style={{ background:'#f5f5f5', color:'#999', padding:'12px', borderRadius:'8px', fontSize:'13px', textAlign:'center' }}>
                Este remate ha finalizado. Ya no se aceptan pujas.
              </div>
            ) : (
              <>
                {autobidActivo && (
                  <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'8px', padding:'12px', marginBottom:'12px' }}>
                    <p style={{ fontSize:'13px', color:'#085041', fontWeight:'500', marginBottom:'4px' }}>🤖 Puja automática activa</p>
                    <p style={{ fontSize:'12px', color:'#0F6E56', marginBottom:'8px' }}>Pujaremos por ti hasta S/ {Number(autobidActivo.monto_maximo).toLocaleString()}</p>
                    <button onClick={cancelarAutobid}
                      style={{ fontSize:'12px', color:'#A32D2D', background:'none', border:'1px solid #E24B4A', borderRadius:'6px', padding:'4px 10px', cursor:'pointer' }}>
                      Cancelar puja automática
                    </button>
                  </div>
                )}

                {!autobidActivo && (
                  <div style={{ display:'flex', gap:'6px', marginBottom:'12px' }}>
                    <button onClick={() => setModoAutobid(false)}
                      style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background: !modoAutobid ? '#1D9E75' : '#f5f5f5', color: !modoAutobid ? 'white' : '#666', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                      Puja normal
                    </button>
                    <button onClick={() => setModoAutobid(true)}
                      style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background: modoAutobid ? '#1D9E75' : '#f5f5f5', color: modoAutobid ? 'white' : '#666', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                      🤖 Puja automática
                    </button>
                  </div>
                )}

                {!modoAutobid && !autobidActivo && (
                  <>
                    <p style={{ fontSize:'12px', color:'#666', marginBottom:'6px' }}>Tu puja — mínimo S/ {precio + Number(remate.incremento_minimo)}</p>
                    <input type='number' value={miPuja} onChange={e => setMiPuja(e.target.value)}
                      placeholder={String(precio + Number(remate.incremento_minimo))}
                      style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box' }} />
                    <button onClick={hacerPuja} disabled={cargando}
                      style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'8px' }}>
                      {cargando ? 'Registrando...' : 'Pujar ahora'}
                    </button>
                    {remate.precio_directo && (
                      <button style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'14px', cursor:'pointer' }}>
                        Comprar directo — S/ {Number(remate.precio_directo).toLocaleString()}
                      </button>
                    )}
                  </>
                )}

                {modoAutobid && !autobidActivo && (
                  <>
                    <div style={{ background:'#f9f9f9', borderRadius:'8px', padding:'12px', marginBottom:'12px', fontSize:'12px', color:'#666', lineHeight:'1.6' }}>
                      💡 Ingresa el máximo que estás dispuesto a pagar. El sistema pujará automáticamente por ti con el incremento mínimo hasta alcanzar tu límite.
                    </div>
                    <p style={{ fontSize:'12px', color:'#666', marginBottom:'6px' }}>Tu puja máxima — mínimo S/ {precio + Number(remate.incremento_minimo)}</p>
                    <input type='number' value={miAutobid} onChange={e => setMiAutobid(e.target.value)}
                      placeholder={'Ej: ' + (precio + Number(remate.incremento_minimo) * 5)}
                      style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #1D9E75', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box' }} />
                    <button onClick={configurarAutobid} disabled={cargando}
                      style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'8px' }}>
                      {cargando ? 'Activando...' : '🤖 Activar puja automática'}
                    </button>
                    <button onClick={() => setModoAutobid(false)}
                      style={{ width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>
                      Cancelar
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ACCIONES PRECIO FIJO */}
        {esPrecioFijo && !esVendedor && (
          <>
            <button onClick={comprarDirecto} disabled={cargando}
              style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'8px' }}>
              {cargando ? 'Procesando...' : 'Comprar ahora — S/ ' + precio.toLocaleString()}
            </button>
            {remate.permite_ofertas && !mostrarOferta && (
              <button onClick={() => setMostrarOferta(true)}
                style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #1D9E75', background:'transparent', color:'#1D9E75', fontSize:'14px', cursor:'pointer', fontWeight:'500' }}>
                Hacer una oferta
              </button>
            )}
            {remate.permite_ofertas && mostrarOferta && (
              <div style={{ marginTop:'8px' }}>
                <p style={{ fontSize:'12px', color:'#666', marginBottom:'6px' }}>Tu oferta debe ser menor a S/ {precio.toLocaleString()}</p>
                <input type='number' value={miOferta} onChange={e => setMiOferta(e.target.value)}
                  placeholder='Ej: 450'
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginBottom:'8px', boxSizing:'border-box' }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <button onClick={() => setMostrarOferta(false)}
                    style={{ padding:'10px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>
                    Cancelar
                  </button>
                  <button onClick={enviarOferta} disabled={cargando}
                    style={{ padding:'10px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
                    {cargando ? '...' : 'Enviar oferta'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}