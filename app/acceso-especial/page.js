'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

export default function AccesoEspecial() {
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [accesos, setAccesos] = useState([])
  const [session, setSession] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) { window.location.href = '/login'; return }
      setSession(s)
      const { data } = await supabase
        .from('accesos_especiales')
        .select('organizador_id, organizadores_especiales(nombre_organizacion, codigo_acceso)')
        .eq('usuario_id', s.user.id)
      setAccesos(data || [])
    }
    init()
  }, [])

  async function validarCodigo() {
    setError(''); setExito('')
    if (!codigo.trim()) { setError('Ingresa el código de acceso.'); return }
    setCargando(true)

    const { data: org } = await supabase
      .from('organizadores_especiales')
      .select('id, nombre_organizacion')
      .eq('codigo_acceso', codigo.trim().toUpperCase())
      .eq('activo', true)
      .maybeSingle()

    if (!org) { setError('Código inválido o expirado.'); setCargando(false); return }

    const { error: errAcceso } = await supabase.from('accesos_especiales').upsert({
      usuario_id: session.user.id,
      organizador_id: org.id
    }, { onConflict: 'usuario_id,organizador_id' })

    if (errAcceso) { setError('Error al registrar acceso.'); setCargando(false); return }

    setExito(`¡Acceso concedido a los remates de ${org.nombre_organizacion}!`)
    setCodigo('')
    const { data } = await supabase
      .from('accesos_especiales')
      .select('organizador_id, organizadores_especiales(nombre_organizacion, codigo_acceso)')
      .eq('usuario_id', session.user.id)
    setAccesos(data || [])
    setCargando(false)
  }

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9' }}>
      <Navbar />
      <div style={{ maxWidth:'500px', margin:'40px auto', padding:'0 16px' }}>
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'32px' }}>
          <div style={{ textAlign:'center', marginBottom:'24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔐</div>
            <h1 style={{ fontSize:'20px', fontWeight:'500', marginBottom:'8px' }}>Acceso a Remates Especiales</h1>
            <p style={{ fontSize:'14px', color:'#666' }}>Ingresa el código que te envió el organizador para acceder a sus remates exclusivos.</p>
          </div>

          {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
          {exito && <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{exito}</div>}

          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'6px' }}>Código de invitación</label>
            <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && validarCodigo()}
              placeholder='Ej: MALI2025'
              style={{ width:'100%', padding:'12px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'16px', letterSpacing:'3px', textAlign:'center', fontWeight:'500', boxSizing:'border-box' }} />
          </div>
          <button onClick={validarCodigo} disabled={cargando}
            style={{ width:'100%', padding:'12px', background: cargando ? '#9FE1CB' : '#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
            {cargando ? 'Verificando...' : 'Validar código'}
          </button>

          {accesos.length > 0 && (
            <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'500', color:'#444', marginBottom:'10px' }}>Tus accesos activos:</p>
              {accesos.map((a, i) => (
                <div key={i} style={{ background:'#E1F5EE', borderRadius:'8px', padding:'10px 14px', marginBottom:'8px' }}>
                  <p style={{ fontSize:'13px', color:'#085041', fontWeight:'500' }}>✅ {a.organizadores_especiales?.nombre_organizacion}</p>
                </div>
              ))}
              <a href='/' style={{ display:'block', textAlign:'center', marginTop:'12px', fontSize:'13px', color:'#1D9E75' }}>Ver remates especiales →</a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
