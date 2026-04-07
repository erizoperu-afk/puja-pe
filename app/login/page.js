'use client'

import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('comprador')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin() {
    setCargando(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      const rolUsuario = data.user?.user_metadata?.rol || 'comprador'
      window.location.href = rolUsuario === 'vendedor' ? '/vendedor' : '/comprador'
    }
    setCargando(false)
  }

  async function handleRegistro() {
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, rol } }
    })
    if (error) {
      setError('Error al crear cuenta: ' + error.message)
    } else {
      setMensaje('¡Cuenta creada! Revisa tu correo para confirmar.')
    }
    setCargando(false)
  }

  const campo = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
        <a href="/" style={{ fontSize:'22px', fontWeight:'500', textDecoration:'none', color:'black' }}>
          puja<span style={{ color:'#1D9E75' }}>.pe</span>
        </a>
      </nav>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 20px' }}>
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'380px' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #eee', marginBottom:'24px' }}>
            {['login','registro'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setMensaje(''); }}
                style={{ flex:1, padding:'10px', border:'none', background:'transparent', fontWeight:'500', fontSize:'14px', cursor:'pointer', color: tab === t ? '#1D9E75' : '#999', borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent' }}>
                {t === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            ))}
          </div>
          {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
          {mensaje && <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{mensaje}</div>}
          {tab === 'registro' && (
            <>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Nombre completo</label>
                <input type="text" placeholder="Carlos Mamani" value={nombre} onChange={e => setNombre(e.target.value)} style={campo} />
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'8px' }}>¿Cómo usarás Puja.pe?</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <button onClick={() => setRol('comprador')} style={{ padding:'12px 8px', borderRadius:'8px', border: rol === 'comprador' ? '2px solid #1D9E75' : '1px solid #ddd', background: rol === 'comprador' ? '#E1F5EE' : '#fff', cursor:'pointer', fontSize:'13px', fontWeight:'500', color: rol === 'comprador' ? '#085041' : '#666' }}>Quiero comprar</button>
                  <button onClick={() => setRol('vendedor')} style={{ padding:'12px 8px', borderRadius:'8px', border: rol === 'vendedor' ? '2px solid #1D9E75' : '1px solid #ddd', background: rol === 'vendedor' ? '#E1F5EE' : '#fff', cursor:'pointer', fontSize:'13px', fontWeight:'500', color: rol === 'vendedor' ? '#085041' : '#666' }}>Quiero vender</button>
                </div>
              </div>
            </>
          )}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Correo electrónico</label>
            <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} style={campo} />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Contraseña</label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} style={campo} />
          </div>
          <button onClick={tab === 'login' ? handleLogin : handleRegistro} disabled={cargando}
            style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
            {cargando ? 'Cargando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta gratis'}
          </button>
          <p style={{ textAlign:'center', fontSize:'12px', color:'#999', marginTop:'16px' }}>
            {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span onClick={() => setTab(tab === 'login' ? 'registro' : 'login')} style={{ color:'#1D9E75', cursor:'pointer' }}>
              {tab === 'login' ? 'Regístrate gratis' : 'Ingresa aquí'}
            </span>
          </p>
        </div>
      </div>
    </main>
  )
}