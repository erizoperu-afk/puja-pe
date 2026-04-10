'use client'

import { useState } from 'react'

export default function BotonCompartir({ url, texto, titulo }) {
  const [copiado, setCopiado] = useState(false)

  const redes = [
    {
      nombre: 'WhatsApp',
      color: '#25D366',
      icono: '💬',
      href: 'https://wa.me/?text=' + encodeURIComponent(texto + '\n' + url)
    },
    {
      nombre: 'Facebook',
      color: '#1877F2',
      icono: '📘',
      href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)
    },
    {
      nombre: 'Twitter/X',
      color: '#1DA1F2',
      icono: '🐦',
      href: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto) + '&url=' + encodeURIComponent(url)
    },
  ]

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginTop:'12px' }}>
      <p style={{ fontSize:'13px', fontWeight:'500', color:'#444', marginBottom:'12px' }}>Compartir este artículo</p>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {redes.map(red => (
          <a key={red.nombre} href={red.href} target='_blank' rel='noopener noreferrer'
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'8px', border:'1px solid #eee', textDecoration:'none', fontSize:'13px', color:'#444', background:'#f9f9f9', fontWeight:'500' }}>
            <span style={{ fontSize:'16px' }}>{red.icono}</span>
            {red.nombre}
          </a>
        ))}
        <button onClick={copiarEnlace}
          style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'8px', border:'1px solid #eee', fontSize:'13px', cursor:'pointer', background: copiado ? '#E1F5EE' : '#f9f9f9', color: copiado ? '#085041' : '#444', fontWeight:'500' }}>
          <span style={{ fontSize:'16px' }}>{copiado ? '✅' : '🔗'}</span>
          {copiado ? '¡Copiado!' : 'Copiar enlace'}
        </button>
      </div>
    </div>
  )
}