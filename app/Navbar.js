'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const ADMIN_EMAIL = 'paulq@hotmail.com'

function Logo() {
  return (
    <a href='/' style={{ textDecoration:'none', display:'flex', alignItems:'center' }}>
      <svg width="230" height="44" viewBox="0 0 230 44" xmlns="http://www.w3.org/2000/svg">
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

  if (!usuario) {
    return (
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
        <Logo />
        <div style={{ display:'flex', gap:'10px' }}>
          <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', textDecoration:'none', color:'black', fontSize:'13px' }}>Ingresar</a>
          <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Publicar remate</a>
        </div>
      </nav>
    )
  }

  return (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
      <Logo />
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{ fontSize:'13px', color:'#666' }}>Hola, {usuario.user_metadata?.nombre || usuario.email}</span>
        <a href='/comprador' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', color:'#444', textDecoration:'none', fontSize:'13px' }}>Comprador</a>
        <a href='/vendedor' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #1D9E75', color:'#1D9E75', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Vendedor</a>
        <a href='/mensajes' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', color:'#444', textDecoration:'none', fontSize:'13px' }}>Soporte</a>
        {esAdmin && (
          <a href='/admin' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Admin</a>
        )}
        <button onClick={cerrarSesion} style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', cursor:'pointer', fontSize:'13px' }}>Cerrar sesion</button>
      </div>
    </nav>
  )
}