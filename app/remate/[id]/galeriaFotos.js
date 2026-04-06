'use client'

import { useState } from 'react'

export default function GaleriaFotos({ imagenes, titulo }) {
  const [fotoActiva, setFotoActiva] = useState(0)

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{ height:'300px', background:'#f5f5f5', borderRadius:'12px', border:'1px solid #e0e0e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:'80px', height:'80px', background:'#e0e0e0', borderRadius:'12px' }} />
      </div>
    )
  }

  return (
    <div style={{ marginBottom:'16px' }}>
      {/* Foto principal */}
      <div style={{ height:'300px', background:'#f5f5f5', borderRadius:'12px', border:'1px solid #e0e0e0', overflow:'hidden', marginBottom:'8px' }}>
        <img
          src={imagenes[fotoActiva]}
          alt={titulo}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
        />
      </div>

      {/* Miniaturas */}
      {imagenes.length > 1 && (
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {imagenes.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={'foto ' + (i+1)}
              onClick={() => setFotoActiva(i)}
              style={{
                width:'80px',
                height:'80px',
                objectFit:'cover',
                borderRadius:'8px',
                cursor:'pointer',
                border: fotoActiva === i ? '3px solid #1D9E75' : '3px solid transparent',
                opacity: fotoActiva === i ? 1 : 0.7,
                transition:'all 0.2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}