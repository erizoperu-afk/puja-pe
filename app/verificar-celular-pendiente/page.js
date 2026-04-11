'use client'

import { useState } from 'react'
import { supabase } from '../supabase'

export default function VerificarCelularPendiente() {
  const [codigo, setCodigo] = useState('')
  const [celular, setCelular] = useState('')
  const [paso, setPaso] = useState('enviar') // 'enviar' | 'confirmar'
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function enviarCodigo() {
    setCargando(true)
    setError('')
    if (!celular.trim() || celular.length < 9) {
      setError('Ingresa tu número de celular.')
      setCargando(false)
      return
    }
    const res = await fetch('/api/verificar-celular/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celular: celular.trim() })
    })
    if (res.ok) {
      setPaso('confirmar')
      setMensaje('Código enviado a +51 ' + celular)
    } else {
      setError('No pudimos enviar el SMS. Intenta de nuevo.')
    }
    setCargando(false)
  }

  async function confirmarCodigo() {
    setCargando(true)
    setError('')
    const res = await fetch('/api/verificar-celular/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celular: celular.trim(), codigo: codigo.trim() })
    })
    if (res.ok) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('usuarios')
          .update({ celular_verificado: true, celular: celular.trim() })
          .eq('id', user.id)
      }
      window.location.href = '/'
    } else {
      setError('Código incorrecto o expirado. Intenta de nuevo.')
    }
    setCargando(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#FFF8E1', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'28px' }}>
            📱
          </div>
          <h2 style={{ fontSize:'20px', fontWeight:'600', marginBottom:'8px' }}>Verifica tu celular</h2>
          <p style={{ fontSize:'14px', color:'#666' }}>
            Necesitas verificar tu número de celular para continuar usando Puja.pe.
          </p>
        </div>

        {error && (
          <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px' }}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px' }}>
            {mensaje}
          </div>
        )}

        {paso === 'enviar' ? (
          <>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Tu número de celular</label>
              <div style={{ display:'flex', gap:'8px' }}>
                <span style={{ padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', background:'#f9f9f9', color:'#666' }}>+51</span>
                <input
                  type='tel'
                  placeholder='999 999 999'
                  value={celular}
                  onChange={e => setCelular(e.target.value.replace(/\D/g, ''))}
                  maxLength={9}
                  style={{ flex:1, padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }}
                />
              </div>
            </div>
            <button onClick={enviarCodigo} disabled={cargando}
              style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'12px' }}>
              {cargando ? 'Enviando...' : 'Enviar código SMS'}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Código de verificación</label>
              <input
                type='text'
                placeholder='000000'
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'24px', textAlign:'center', letterSpacing:'8px', fontWeight:'500', boxSizing:'border-box' }}
              />
            </div>
            <button onClick={confirmarCodigo} disabled={cargando}
              style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'12px' }}>
              {cargando ? 'Verificando...' : 'Confirmar código'}
            </button>
            <button onClick={() => setPaso('enviar')}
              style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#666' }}>
              ← Cambiar número
            </button>
          </>
        )}

        <button onClick={cerrarSesion}
          style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#A32D2D', marginTop:'8px' }}>
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}