'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from './supabase'

const ADMIN_EMAIL = 'paulq@hotmail.com'

function Logo() {
  return (
    <a href='/' style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}>
      <img src='/icon-192.png' alt='Puja.pe' style={{ width:'40px', height:'40px', borderRadius:'10px' }} />
      <div>
        <div style={{ fontSize:'20px', fontWeight:'700', color:'#1a1a1a', lineHeight:'1.1' }}>
          puja<span style={{ color:'#1D9E75' }}>.pe</span>
        </div>
        <div style={{ fontSize:'10px', color:'#888', letterSpacing:'2px' }}>REMATES ONLINE</div>
      </div>
      <div style={{ background:'#E1F5EE', borderRadius:'8px', padding:'2px 8px', marginLeft:'4px' }}>
        <span style={{ fontSize:'9px', fontWeight:'700', color:'#085041', letterSpacing:'1px' }}>BETA</span>
      </div>
    </a>
  )
}

export default function Navbar() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [panelOrganizador, setPanelOrganizador] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    async function cargarUsuario(session) {
      setUsuario(session?.user ?? null)
      setEsAdmin(session?.user?.email === ADMIN_EMAIL)
      if (session?.user) {
        const { data } = await supabase
          .from('usuarios')
          .select('nombre, nickname')
          .eq('id', session.user.id)
          .single()
        setPerfil(data)
        const { data: org } = await supabase
          .from('organizadores_especiales')
          .select('id, nombre_organizacion')
          .eq('usuario_id', session.user.id)
          .eq('activo', true)
          .maybeSingle()
        setPanelOrganizador(org || null)
      } else {
        setPerfil(null)
        setPanelOrganizador(null)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      cargarUsuario(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { cargarUsuario(session) }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  function nombreMostrar() {
    if (perfil?.nombre) return perfil.nombre
    if (perfil?.nickname) return perfil.nickname
    return usuario?.email || ''
  }

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

        <div className='desktop-menu' style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {!usuario ? (
            <>
              <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', textDecoration:'none', color:'black', fontSize:'13px', fontWeight:'700' }}>Ingresar</a>
              <a href='/login' style={{ padding:'7px 16px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'700' }}>Publicar remate</a>
            </>
          ) : (
            <>
              <span style={{ fontSize:'13px', color:'#666', fontWeight:'700' }}>Hola, {nombreMostrar()}</span>
              <a href='/comprador' style={btnStyle('/comprador')}>Comprador</a>
              <a href='/vendedor' style={btnStyle('/vendedor')}>Vendedor</a>
              <a href='/mensajes' style={btnStyle('/mensajes')}>Soporte</a>
              {panelOrganizador && <a href={`/organizador/${panelOrganizador.id}`} style={{ ...btnStyle('/organizador'), background:'#1a1a2e', color:'#C9A84C', border:'none' }}>🏛️ {panelOrganizador.nombre_organizacion}</a>}
              {esAdmin && <a href='/admin' style={btnStyle('/admin')}>Admin</a>}
              <button onClick={cerrarSesion} style={{ padding:'7px 16px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>Cerrar sesion</button>
            </>
          )}
        </div>

        <button className='mobile-menu-btn' onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ display:'none', background:'none', border:'none', cursor:'pointer', padding:'8px', flexDirection:'column', gap:'5px' }}>
          <span style={{ display:'block', width:'22px', height:'2px', background:'#333', borderRadius:'2px' }}></span>
          <span style={{ display:'block', width:'22px', height:'2px', background:'#333', borderRadius:'2px' }}></span>
          <span style={{ display:'block', width:'22px', height:'2px', background:'#333', borderRadius:'2px' }}></span>
        </button>
      </nav>

      {menuAbierto && (
        <div style={{ background:'#fff', borderBottom:'1px solid #eee', zIndex:99, position:'relative' }}>
          {!usuario ? (
            <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'8px', padding:'12px 16px' }}>
              <a href='/login' style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid #1D9E75', textDecoration:'none', color:'#1D9E75', fontSize:'12px', fontWeight:'700' }}>
                Ingresar
              </a>
              <a href='/login' style={{ padding:'7px 14px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'12px', fontWeight:'700' }}>
                Publicar remate
              </a>
            </div>
          ) : (
            <>
              <div style={{ padding:'12px 16px', fontSize:'13px', fontWeight:'700', color:'#999', borderBottom:'1px solid #f5f5f5' }}>Hola, {nombreMostrar()}</div>
              <a href='/comprador' style={linkStyleActivo('/comprador')}>Comprador</a>
              <a href='/vendedor' style={linkStyleActivo('/vendedor')}>Vendedor</a>
              <a href='/mensajes' style={linkStyleActivo('/mensajes')}>Soporte</a>
              {panelOrganizador && <a href={`/organizador/${panelOrganizador.id}`} style={{ ...linkStyleActivo('/organizador'), color:'#C9A84C', fontWeight:'700' }}>🏛️ {panelOrganizador.nombre_organizacion}</a>}
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