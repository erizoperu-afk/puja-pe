'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const ADMIN_EMAIL = 'paulq@hotmail.com'

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

  const Logo = () => (
    <a href='/' style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none', color:'black' }}>
      <span style={{ fontSize:'22px', fontWeight:'500' }}>
        puja<span style={{ color:'#1D9E75' }}>.pe</span>
      </span>
      <span style={{ fontSize:'10px', fontWeight:'700', background:'#1D9E75', color:'white', padding:'2px 7px', borderRadius:'20px', letterSpacing:'0.5px' }}>BETA</span>
    </a>
  )

  if (!usuario) {
    return (
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
        <Logo />
        <div style={{ display:'flex', gap:'10px' }}>
          <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', textDecoration:'none', color:'black', fontSize:'13px' }}>Ingresar</a>
          <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Publicar remate</a>
        </div>
      </nav>
    )
  }

  return (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
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