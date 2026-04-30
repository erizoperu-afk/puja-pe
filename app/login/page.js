'use client'

import { useState } from 'react'
import { supabase } from '../supabase'

const campo = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }

function CampoPassword({ value, onChange, placeholder, ver, setVer }) {
  return (
    <div style={{ position:'relative' }}>
      <input
        type={ver ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...campo, paddingRight:'44px' }}
      />
      <button
        type='button'
        onMouseDown={e => e.preventDefault()}
        onClick={() => setVer(v => !v)}
        style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:'4px', color:'#999', fontSize:'18px', lineHeight:1 }}>
        👁
      </button>
    </div>
  )
}

export default function Login() {
  const [tab, setTab] = useState('login')
  const [emailONickname, setEmailONickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [nickname, setNickname] = useState('')
  const [celular, setCelular] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [recuperando, setRecuperando] = useState(false)
  const [emailRecuperacion, setEmailRecuperacion] = useState('')
  const [recuperacionEnviada, setRecuperacionEnviada] = useState(false)
  const [verPass, setVerPass] = useState(false)
  const [verPassReg, setVerPassReg] = useState(false)
  const [registroExitoso, setRegistroExitoso] = useState(false)
  const [paso, setPaso] = useState('formulario')
  const [codigo, setCodigo] = useState('')
  const [userId, setUserId] = useState(null)

  async function handleLogin() {
    setCargando(true)
    setError('')
    let emailFinal = emailONickname.trim()
    if (!emailFinal.includes('@')) {
      const { data, error: err } = await supabase.rpc('get_email_by_nickname', { p_nickname: emailFinal })
      if (err || !data) { setError('Nickname no encontrado.'); setCargando(false); return }
      emailFinal = data
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailFinal, password })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada.')
      } else {
        setError('Correo/nickname o contraseña incorrectos.')
      }
      setCargando(false)
      return
    }

    const { data: esAdmin } = await supabase
      .from('admins').select('email').eq('email', data.user.email).maybeSingle()
    if (esAdmin) { window.location.href = '/'; return }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('celular_verificado, nombre, apellido, celular')
      .eq('id', data.user.id)
      .single()

    if (perfil && !perfil.celular_verificado) {
      window.location.href = '/verificar-celular-pendiente'
    } else if (!perfil || !perfil.nombre || !perfil.apellido) {
      window.location.href = '/completar-perfil'
    } else {
      window.location.href = '/'
    }
    setCargando(false)
  }

  async function handleRegistro() {
    setCargando(true)
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); setCargando(false); return }
    if (!apellido.trim()) { setError('El apellido es obligatorio.'); setCargando(false); return }
    if (!nickname.trim()) { setError('El nickname es obligatorio.'); setCargando(false); return }
    if (!celular.trim() || celular.length < 9) { setError('El celular es obligatorio (9 dígitos).'); setCargando(false); return }
    if (!email.trim()) { setError('El correo es obligatorio.'); setCargando(false); return }
    if (password.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres.'); setCargando(false); return }

    const { data: nickExiste } = await supabase.from('usuarios').select('id').eq('nickname', nickname.trim()).maybeSingle()
    if (nickExiste) { setError('El nickname "' + nickname.trim() + '" no está disponible.'); setCargando(false); return }

    const { data, error: errAuth } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, apellido, nickname, celular } }
    })

    if (errAuth) {
      if (errAuth.message.includes('already registered')) {
        setError('Este correo ya tiene una cuenta registrada.')
      } else {
        setError('Error: ' + errAuth.message)
      }
      setCargando(false)
      return
    }

    if (data?.user) {
      await supabase.from('usuarios').upsert({
        id: data.user.id,
        nickname: nickname.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        celular: celular.trim(),
        celular_verificado: false
      })
      setUserId(data.user.id)

      // Enviar código SMS para validar identidad
      await fetch('/api/verificar-celular/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celular: celular.trim() })
      })
      setPaso('verificando')
    }
    setCargando(false)
  }

  async function handleVerificarCodigo() {
    setCargando(true)
    setError('')
    if (!codigo.trim() || codigo.length < 4) {
      setError('Ingresa el código que recibiste por SMS.')
      setCargando(false)
      return
    }
    const res = await fetch('/api/verificar-celular/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celular: celular.trim(), codigo: codigo.trim() })
    })
    if (!res.ok) {
      setError('Código incorrecto o expirado. Intenta de nuevo.')
      setCargando(false)
      return
    }
    // SMS confirmado = identidad validada = acceso directo
    if (userId) {
      await supabase.from('usuarios').update({ celular_verificado: true }).eq('id', userId)
    }
    fetch('/api/push/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: '👤 Nuevo usuario registrado',
        mensaje: `${nombre.trim()} ${apellido.trim()} (@${nickname.trim()}) se registró y verificó su celular`
      })
    })
    window.location.href = '/'
    setCargando(false)
  }

  async function reenviarCodigo() {
    setCargando(true)
    setError('')
    await fetch('/api/verificar-celular/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celular: celular.trim() })
    })
    setError('Código reenviado ✅')
    setCargando(false)
  }

  async function handleRecuperacion() {
    setCargando(true)
    setError('')
    if (!emailRecuperacion.trim()) { setError('Ingresa tu correo electrónico.'); setCargando(false); return }
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacion, {
      redirectTo: 'https://www.puja.pe/reset-password'
    })
    if (error) {
      setError('Error al enviar el correo. Verifica que el email sea correcto.')
    } else {
      setRecuperacionEnviada(true)
    }
    setCargando(false)
  }

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9' }}>
      <nav style={{ display:'flex', alignItems:'center', padding:'14px 24px', borderBottom:'1px solid #eee', background:'#fff' }}>
        <a href="/" style={{ fontSize:'22px', fontWeight:'500', textDecoration:'none', color:'black' }}>
          puja<span style={{ color:'#1D9E75' }}>.pe</span>
        </a>
      </nav>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 16px' }}>
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'400px' }}>

          {recuperando ? (
            recuperacionEnviada ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>✉️</div>
                <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>¡Correo enviado!</h2>
                <p style={{ fontSize:'14px', color:'#666', marginBottom:'24px' }}>Revisa tu bandeja de entrada y sigue las instrucciones.</p>
                <button onClick={() => { setRecuperando(false); setRecuperacionEnviada(false); setEmailRecuperacion('') }}
                  style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'14px', cursor:'pointer', color:'#444' }}>
                  Volver al ingreso
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => setRecuperando(false)} style={{ background:'none', border:'none', color:'#1D9E75', cursor:'pointer', fontSize:'13px', marginBottom:'16px', padding:0 }}>← Volver</button>
                <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>Recuperar contraseña</h2>
                <p style={{ fontSize:'14px', color:'#666', marginBottom:'20px' }}>Te enviaremos un link a tu correo para restablecer tu contraseña.</p>
                {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Correo electrónico</label>
                  <input type="email" placeholder="tu@correo.com" value={emailRecuperacion} onChange={e => setEmailRecuperacion(e.target.value)} style={campo} />
                </div>
                <button onClick={handleRecuperacion} disabled={cargando}
                  style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
                  {cargando ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </div>
            )

          ) : paso === 'verificando' ? (
            <div>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>📱</div>
                <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>Confirma tu celular</h2>
                <p style={{ fontSize:'14px', color:'#666' }}>Te enviamos un código SMS al número <strong>+51 {celular}</strong></p>
              </div>
              {error && <div style={{ background: error.includes('✅') ? '#E1F5EE' : '#FCEBEB', color: error.includes('✅') ? '#085041' : '#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
              <div style={{ marginBottom:'16px' }}>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Código de verificación</label>
                <input type='text' placeholder='Ej: 482931' value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ ...campo, textAlign:'center', fontSize:'24px', letterSpacing:'8px', fontWeight:'500' }} />
              </div>
              <button onClick={handleVerificarCodigo} disabled={cargando}
                style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginBottom:'12px' }}>
                {cargando ? 'Verificando...' : 'Confirmar código'}
              </button>
              <p style={{ textAlign:'center', fontSize:'12px', color:'#999' }}>
                ¿No recibiste el código?{' '}
                <span onClick={reenviarCodigo} style={{ color:'#1D9E75', cursor:'pointer' }}>Reenviar</span>
              </p>
            </div>

          ) : registroExitoso ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>✉️</div>
              <h2 style={{ fontSize:'18px', fontWeight:'600', marginBottom:'8px' }}>¡Cuenta creada!</h2>
              <p style={{ fontSize:'14px', color:'#666', marginBottom:'8px' }}>
                Te enviamos un correo de confirmación a <strong>{email}</strong>.
              </p>
              <p style={{ fontSize:'13px', color:'#999', marginBottom:'24px' }}>
                Confírmalo y luego ingresa — nuestro equipo aprobará tu cuenta en minutos.
              </p>
              <button onClick={() => setRegistroExitoso(false)}
                style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'14px', cursor:'pointer', color:'#444' }}>
                Ir al ingreso
              </button>
            </div>

          ) : (
            <>
              <div style={{ display:'flex', borderBottom:'1px solid #eee', marginBottom:'24px' }}>
                {['login','registro'].map(t => (
                  <button key={t} onClick={() => { setTab(t); setError('') }}
                    style={{ flex:1, padding:'10px', border:'none', background:'transparent', fontWeight:'500', fontSize:'14px', cursor:'pointer', color: tab === t ? '#1D9E75' : '#999', borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent' }}>
                    {t === 'login' ? 'Ingresar' : 'Crear cuenta'}
                  </button>
                ))}
              </div>

              {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}

              {tab === 'login' && (
                <>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Correo electrónico o nickname</label>
                    <input type="text" placeholder="tu@correo.com o tu_nickname" value={emailONickname}
                      onChange={e => setEmailONickname(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      style={campo} />
                  </div>
                  <div style={{ marginBottom:'8px' }}>
                    <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Contraseña</label>
                    <CampoPassword value={password} onChange={e => setPassword(e.target.value)} placeholder='Tu contraseña' ver={verPass} setVer={setVerPass} />
                  </div>
                  <div style={{ textAlign:'right', marginBottom:'16px' }}>
                    <span onClick={() => { setRecuperando(true); setError('') }} style={{ fontSize:'12px', color:'#1D9E75', cursor:'pointer' }}>
                      ¿Olvidaste tu contraseña?
                    </span>
                  </div>
                  <button onClick={handleLogin} disabled={cargando}
                    style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
                    {cargando ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </>
              )}

              {tab === 'registro' && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                    <div>
                      <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Nombre *</label>
                      <input type="text" placeholder="Carlos" value={nombre} onChange={e => setNombre(e.target.value)} style={campo} />
                    </div>
                    <div>
                      <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Apellido *</label>
                      <input type="text" placeholder="Mamani" value={apellido} onChange={e => setApellido(e.target.value)} style={campo} />
                    </div>
                  </div>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Nickname *</label>
                    <input type="text" placeholder="Ej: coleccionista99" value={nickname} onChange={e => setNickname(e.target.value)} style={campo} />
                    <p style={{ fontSize:'11px', color:'#999', marginTop:'4px' }}>Aparecerá en tus pujas y publicaciones.</p>
                  </div>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Celular *</label>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <span style={{ padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', background:'#f9f9f9', color:'#666', whiteSpace:'nowrap' }}>+51</span>
                      <input type="tel" placeholder="999 999 999" value={celular}
                        onChange={e => setCelular(e.target.value.replace(/\D/g,''))}
                        maxLength={9} style={{ ...campo, flex:1 }} />
                    </div>
                  </div>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Correo electrónico *</label>
                    <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} style={campo} />
                  </div>
                  <div style={{ marginBottom:'20px' }}>
                    <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Contraseña *</label>
                    <CampoPassword value={password} onChange={e => setPassword(e.target.value)} placeholder='Mínimo 6 caracteres' ver={verPassReg} setVer={setVerPassReg} />
                  </div>
                  <button onClick={handleRegistro} disabled={cargando}
                    style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
                    {cargando ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                  </button>
                </>
              )}

              <p style={{ textAlign:'center', fontSize:'12px', color:'#999', marginTop:'16px' }}>
                {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <span onClick={() => setTab(tab === 'login' ? 'registro' : 'login')} style={{ color:'#1D9E75', cursor:'pointer' }}>
                  {tab === 'login' ? 'Regístrate gratis' : 'Ingresa aquí'}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
