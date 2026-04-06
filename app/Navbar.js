'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Navbar() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setUsuario(session?.user ?? null) }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!usuario) {
    return (
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
        <a href='/' style={{ fontSize:'22px', fontWeight:'500', textDecoration:'none', color:'black' }}>
          puja<span style={{ color:'#1D9E75' }}>.pe</span>
        </a>
        <div style={{ display:'flex', gap:'10px' }}>
          <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', textDecoration:'none', color:'black', fontSize:'13px' }}>Ingresar</a>
          <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Publicar remate</a>
        </div>
      </nav>
    )
  }

  return (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
      <a href='/' style={{ fontSize:'22px', fontWeight:'500', textDecoration:'none', color:'black' }}>
        puja<span style={{ color:'#1D9E75' }}>.pe</span>
      </a>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{ fontSize:'13px', color:'#666' }}>Hola, {usuario.user_metadata?.nombre || usuario.email}</span>
        <a href='/comprador' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', color:'#444', textDecoration:'none', fontSize:'13px' }}>
          Comprador
        </a>
        <a href='/vendedor' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #1D9E75', color:'#1D9E75', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>
          Vendedor
        </a>
        <button onClick={cerrarSesion} style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', cursor:'pointer', fontSize:'13px' }}>Cerrar sesion</button>
      </div>
    </nav>
  )
}