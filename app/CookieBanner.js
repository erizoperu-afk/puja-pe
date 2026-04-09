'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const aceptado = localStorage.getItem('cookies_aceptadas')
    if (!aceptado) setVisible(true)
  }, [])

  function aceptar() {
    localStorage.setItem('cookies_aceptadas', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ position:'fixed', bottom:'0', left:'0', right:'0', background:'#fff', borderTop:'1px solid #eee', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', zIndex:1000, flexWrap:'wrap', boxShadow:'0 -4px 12px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize:'13px', color:'#555', margin:0, flex:1 }}>
        Usamos cookies técnicas necesarias para el funcionamiento del sitio. Consulta nuestra{' '}
        <a href='/privacidad' style={{ color:'#1D9E75' }}>política de privacidad</a>.
      </p>
      <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
        <button onClick={aceptar}
          style={{ padding:'8px 20px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500' }}>
          Aceptar
        </button>
      </div>
    </div>
  )
}