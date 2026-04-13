'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      setEsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null)
        setEsAdmin(session?.user?.email === ADMIN_EMAIL)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Estilo base para todos los botones del navbar
  function btnStyle(ruta) {
    const activo = pathname.startsWith(ruta)
    return {
      padding: '7px 16px',
      borderRadius: '8px',
      border: activo ? 'none' : '1px solid #ddd',
      background: activo ? '#1D9E75' : 'transparent',
      color: activo ? 'white' : '#444',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
    }
  }

  const linkStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    color: '#444',
    display: 'block',
    borderBottom: '1px solid #f5f5f5'
  }

  function linkStyleActivo(ruta) {
    const activo = pathname.startsWith(ruta)
    return {
      ...linkStyle,
      background: activo ? '#E1F5EE' : 'transparent',
      color: activo ? '#085041' : '#444',
      fontWeight: '700',
    }
  }

  return (
    <>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 24px', borderBottom:'1px solid #eee', background:'#fff', position:'relative', zIndex:100 }}>
        <Logo />

        {/* MENU DESKTOP */}
        <div className='desktop-menu' style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {!usuario ? (
            <>
              <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', textDecoration:'none', color:'black', fontSize:'13px', fontWeight:'700' }}>Ingresar</a>
              <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'700' }}>Publicar remate</a>
            </>
          ) : (
            <>
              <span style={{ fontSize:'13px', color:'#666', fontWeight:'700' }}>Hola, {usuario.user_metadata?.nombre || usuario.email}</span>
              <a href='/comprador' style={btnStyle('/comprador')}>Comprador</a>
              <a href='/vendedor' style={btnStyle('/vendedor')}>Vendedor</a>
              <a href='/mensajes' style={btnStyle('/mensajes')}>Soporte</a>
              {esAdmin && <a href='/admin' style={btnStyle('/admin')}>Admin</a>}
              <button onClick={cerrarSesion} style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>Cerrar sesion</button>
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
              <a href='/login' style={{ ...linkStyle, color:'#1D9E75' }}>Publicar remate</a>
            </>
          ) : (
            <>
              <div style={{ padding:'12px 16px', fontSize:'13px', fontWeight:'700', color:'#999', borderBottom:'1px solid #f5f5f5' }}>Hola, {usuario.user_metadata?.nombre || usuario.email}</div>
              <a href='/comprador' style={linkStyleActivo('/comprador')}>Comprador</a>
              <a href='/vendedor' style={linkStyleActivo('/vendedor')}>Vendedor</a>
              <a href='/mensajes' style={linkStyleActivo('/mensajes')}>Soporte</a>
              {esAdmin && <a href='/admin' style={linkStyleActivo('/admin')}>Admin</a>}
              <button onClick={cerrarSesion} style={{ ...linkStyle, background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', color:'#A32D2D' }}>Cerrar sesion</button>
            </>
          )}
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