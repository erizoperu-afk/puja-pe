'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const ADMIN_EMAIL = 'paulq@hotmail.com'

function Logo() {
  return (
    <a href='/' style={{ textDecoration:'none', display:'flex', alignItems:'center' }}>
      <svg width="200" height="44" viewBox="0 0 230 44" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="2" width="40" height="40" rx="10" fill="#1D9E75"/>
        <g transform="translate(4,4)">
          <rect x="18" y="6" width="20" height="7" rx="3" fill="white" transform="rotate(-40 18 6)"/>
          <rect x="2" y="22" width="7" height="16" rx="3" fill="white" transform="rotate(-40 2 22)"/>
          <rect x="21" y="4" width="9" height="5" rx="2" fill="#9FE1CB" transform="rotate(-40 21 4)"/>
        </g>
        <text x="50" y="22" style={{fontSize:'22px', fontWeight:'700', fill:'#1a1a1a', fontFamily:'sans-serif'}}>
          puja<tspan fill="#1D9E75">.pe</tspan>
        </text>
        <text x="51" y="38" style={{fontSize:'11px', fill:'#888', fontFamily:'sans-serif', letterSpacing:'2px'}}>
          REMATES ONLINE
        </text>
        <rect x="188" y="6" width="38" height="16" rx="8" fill="#E1F5EE"/>
        <text x="207" y="18" textAnchor="middle" style={{fontSize:'9px', fontWeight:'700', fill:'#085041', fontFamily:'sans-serif', letterSpacing:'1px'}}>
          BETA
        </text>
      </svg>
    </a>
  )
}

export default function Navbar() {
  const [usuario, setUsuario] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [celularVerificado, setCelularVerificado] = useState(true)
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajeVerif, setMensajeVerif] = useState('')
  const [celular, setCelular] = useState('')

  useEffect(() => {
    async function cargarUsuario(session) {
      setUsuario(session?.user ?? null)
      setEsAdmin(session?.user?.email === ADMIN_EMAIL)
      if (session?.user) {
        const { data } = await supabase
          .from('usuarios')
          .select('celular_verificado, celular')
          .eq('id', session.user.id)
          .single()
        if (data) {
          setCelularVerificado(data.celular_verificado)
          setCelular(data.celular)
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => cargarUsuario(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => cargarUsuario(session))
    return () => subscription.unsubscribe()
  }, [])

  async function enviarCodigo() {
    setEnviando(true)
    setMensajeVerif('')
    const res = await fetch('/api/verificar-celular/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celular })
    })
    if (res.ok) {
      setMostrarVerificacion(true)
      setMensajeVerif('Código enviado ✅')
    } else {
      setMensajeVerif('Error al enviar el SMS. Intenta de nuevo.')
    }
    setEnviando(false)
  }

  async function confirmarCodigo() {
    setEnviando(true)
    setMensajeVerif('')
    const res = await fetch('/api/verificar-celular/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celular, codigo })
    })
    if (res.ok) {
      await supabase.from('usuarios').update({ celular_verificado: true }).eq('id', usuario.id)
      setCelularVerificado(true)
      setMensajeVerif('¡Celular verificado! ✅')
    } else {
      setMensajeVerif('Código incorrecto o expirado.')
    }
    setEnviando(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const linkStyle = { padding:'12px 16px', fontSize:'14px', textDecoration:'none', color:'#444', display:'block', borderBottom:'1px solid #f5f5f5' }

  return (
    <>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 24px', borderBottom:'1px solid #eee', background:'#fff', position:'relative', zIndex:100 }}>
        <Logo />

        {/* MENU DESKTOP */}
        <div className='desktop-menu' style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {!usuario ? (
            <>
              <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', textDecoration:'none', color:'black', fontSize:'13px' }}>Ingresar</a>
              <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Publicar remate</a>
            </>
          ) : (
            <>
              <span style={{ fontSize:'13px', color:'#666' }}>Hola, {usuario.user_metadata?.nombre || usuario.email}</span>
              <a href='/comprador' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', color:'#444', textDecoration:'none', fontSize:'13px' }}>Comprador</a>
              <a href='/vendedor' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #1D9E75', color:'#1D9E75', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Vendedor</a>
              <a href='/mensajes' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', color:'#444', textDecoration:'none', fontSize:'13px' }}>Soporte</a>
              {esAdmin && <a href='/admin' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Admin</a>}
              <button onClick={cerrarSesion} style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', cursor:'pointer', fontSize:'13px' }}>Cerrar sesion</button>
            </>
          )}
        </div>

        {/* BOTON HAMBURGUESA MOBILE */}
        <button className='mobile-menu-btn' onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ display:'none', background:'none', border:'none', cursor:'pointer', padding:'8px', flexDirection:'column', gap:'5px' }}>
          <span style={{ display:'block', width:'22px', height:'2px', background:'#333', borderRadius:'2px' }}></span>
          <span style={{ display:'block', width:'22px', height:'2px', background:'#333', borderRadius:'2px' }}></span>
          <span style={{ display:'block', width:'22px', height:'2px', background:'#333', borderRadius:'2px' }}></span>
        </button>
      </nav>

      {/* MENU MOBILE DESPLEGABLE */}
      {menuAbierto && (
        <div style={{ background:'#fff', borderBottom:'1px solid #eee', zIndex:99, position:'relative' }}>
          {!usuario ? (
            <>
              <a href='/login' style={linkStyle}>Ingresar</a>
              <a href='/login' style={{ ...linkStyle, color:'#1D9E75', fontWeight:'500' }}>Publicar remate</a>
            </>
          ) : (
            <>
              <div style={{ padding:'12px 16px', fontSize:'13px', color:'#999', borderBottom:'1px solid #f5f5f5' }}>Hola, {usuario.user_metadata?.nombre || usuario.email}</div>
              <a href='/comprador' style={linkStyle}>Comprador</a>
              <a href='/vendedor' style={{ ...linkStyle, color:'#1D9E75', fontWeight:'500' }}>Vendedor</a>
              <a href='/mensajes' style={linkStyle}>Soporte</a>
              {esAdmin && <a href='/admin' style={{ ...linkStyle, color:'#1D9E75', fontWeight:'500' }}>Admin</a>}
              <button onClick={cerrarSesion} style={{ ...linkStyle, background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', color:'#A32D2D' }}>Cerrar sesion</button>
            </>
          )}
        </div>
      )}

      {/* BANNER: CELULAR NO VERIFICADO */}
      {usuario && !celularVerificado && (
        <div style={{ background:'#FFF8E1', borderBottom:'1px solid #FFE082', padding:'12px 24px' }}>
          <div style={{ maxWidth:'600px', margin:'0 auto' }}>
            {!mostrarVerificacion ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
                <p style={{ fontSize:'13px', color:'#7B5800', margin:0 }}>
                  📱 Tu número de celular <strong>+51 {celular}</strong> aún no está verificado.
                </p>
                <button onClick={enviarCodigo} disabled={enviando}
                  style={{ padding:'6px 14px', borderRadius:'8px', border:'none', background:'#F59E0B', color:'white', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}>
                  {enviando ? 'Enviando...' : 'Verificar ahora'}
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                <p style={{ fontSize:'13px', color:'#7B5800', margin:0 }}>Ingresa el código que llegó a tu celular:</p>
                <input
                  type='text'
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder='000000'
                  style={{ width:'100px', padding:'6px 10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'16px', textAlign:'center', letterSpacing:'4px' }}
                />
                <button onClick={confirmarCodigo} disabled={enviando}
                  style={{ padding:'6px 14px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}>
                  {enviando ? 'Verificando...' : 'Confirmar'}
                </button>
                {mensajeVerif && <span style={{ fontSize:'13px', color: mensajeVerif.includes('✅') ? '#085041' : '#A32D2D' }}>{mensajeVerif}</span>}
              </div>
            )}
            {mensajeVerif && !mostrarVerificacion && (
              <p style={{ fontSize:'12px', color: mensajeVerif.includes('✅') ? '#085041' : '#A32D2D', margin:'6px 0 0' }}>{mensajeVerif}</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}