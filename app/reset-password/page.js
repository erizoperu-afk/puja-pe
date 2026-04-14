'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const campo = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [sesionLista, setSesionLista] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    async function verificarToken() {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')

      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        })
        if (error) {
          setTokenError(true)
        } else {
          setSesionLista(true)
        }
      } else {
        // Fallback hash
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.replace('#', ''))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const type = hashParams.get('type')
          if (type === 'recovery' && accessToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            if (error) { setTokenError(true) } else { setSesionLista(true) }
          } else {
            setTokenError(true)
          }
        } else {
          setTokenError(true)
        }
      }
    }
    verificarToken()
  }, [])

  async function handleReset() {
    setCargando(true)
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres.')
      setCargando(false); return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      setCargando(false); return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Error al cambiar la contraseña. El enlace puede haber expirado.')
    } else {
      setListo(true)
      await supabase.auth.signOut()
    }
    setCargando(false)
  }

  if (listo) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'400px', textAlign:'center' }}>
        <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>✓</div>
        <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>Contraseña actualizada</h2>
        <p style={{ fontSize:'14px', color:'#666', marginBottom:'24px' }}>Ya puedes ingresar con tu nueva contraseña.</p>
        <a href='/login' style={{ display:'block', padding:'11px', borderRadius:'8px', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'15px', fontWeight:'500', textAlign:'center' }}>
          Ir al login
        </a>
      </div>
    </main>
  )

  if (tokenError) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'400px', textAlign:'center' }}>
        <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>✕</div>
        <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>Enlace inválido o expirado</h2>
        <p style={{ fontSize:'14px', color:'#666', marginBottom:'24px' }}>El enlace de recuperación expiró o ya fue usado. Solicita uno nuevo.</p>
        <a href='/login' style={{ display:'block', padding:'11px', borderRadius:'8px', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'15px', fontWeight:'500', textAlign:'center' }}>
          Volver al login
        </a>
      </div>
    </main>
  )

  if (!sesionLista) return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#999' }}>
        <p>Verificando enlace...</p>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>
            🔑
          </div>
          <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>Nueva contraseña</h2>
          <p style={{ fontSize:'14px', color:'#666' }}>Ingresa tu nueva contraseña para continuar.</p>
        </div>

        {error && (
          <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom:'14px' }}>
          <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Nueva contraseña</label>
          <input type='password' placeholder='Mínimo 6 caracteres' value={password}
            onChange={e => setPassword(e.target.value)} style={campo} />
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Confirmar contraseña</label>
          <input type='password' placeholder='Repite tu contraseña' value={confirmar}
            onChange={e => setConfirmar(e.target.value)} style={campo} />
        </div>

        <button onClick={handleReset} disabled={cargando}
          style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
          {cargando ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </main>
  )
}