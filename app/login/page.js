'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin() {
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      window.location.href = '/'
    }
    setCargando(false)
  }

  async function handleRegistro() {
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })
    if (error) {
      setError('Error al crear cuenta: ' + error.message)
    } else {
      setMensaje('¡Cuenta creada! Revisa tu correo para confirmar.')
    }
    setCargando(false)
  }

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9' }}>

      {/* Navbar */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
        <a href="/" style={{ fontSize:'22px', fontWeight:'500', textDecoration:'none', color:'black' }}>
          puja<span style={{ color:'#1D9E75' }}>.pe</span>
        </a>
      </nav>

      {/* Card */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 20px' }}>
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'380px' }}>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #eee', marginBottom:'24px' }}>
            {['login','registro'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setMensaje(''); }}
                style={{
                  flex:1, padding:'10px', border:'none', background:'transparent',
                  fontWeight:'500', fontSize:'14px', cursor:'pointer',
                  color: tab === t ? '#1D9E75' : '#999',
                  borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent'
                }}
              >
                {t === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Mensajes */}
          {error && (
            <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>
              {error}
            </div>
          )}
          {mensaje && (
            <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>
              {mensaje}
            </div>
          )}

          {/* Campos */}
          {tab === 'registro' && (
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Nombre completo</label>
              <input
                type="text"
                placeholder="Carlos Mamani"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }}
              />
            </div>
          )}

          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }}
            />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }}
            />
          </div>

          <button
            onClick={tab === 'login' ? handleLogin : handleRegistro}
            disabled={cargando}
            style={{
              width:'100%', padding:'11px', borderRadius:'8px', border:'none',
              background: cargando ? '#9FE1CB' : '#1D9E75',
              color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer'
            }}
          >
            {cargando ? 'Cargando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta gratis'}
          </button>

          <p style={{ textAlign:'center', fontSize:'12px', color:'#999', marginTop:'16px' }}>
            {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span
              onClick={() => setTab(tab === 'login' ? 'registro' : 'login')}
              style={{ color:'#1D9E75', cursor:'pointer' }}
            >
              {tab === 'login' ? 'Regístrate gratis' : 'Ingresa aquí'}
            </span>
          </p>

        </div>
      </div>
    </main>
  )
}