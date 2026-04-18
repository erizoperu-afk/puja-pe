'use client'

import { useState } from 'react'

export default function GaleriaFotos({ imagenes, titulo }) {
  const [fotoActiva, setFotoActiva] = useState(0)
  const [zoom, setZoom] = useState(false)

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
      <div
        onClick={() => setZoom(true)}
        style={{ height:'300px', background:'#f5f5f5', borderRadius:'12px', border:'1px solid #e0e0e0', overflow:'hidden', marginBottom:'8px', cursor:'zoom-in', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <img
          src={imagenes[fotoActiva]}
          alt={titulo}
          style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }}
        />
        <div style={{ position:'absolute', bottom:'8px', right:'8px', background:'rgba(0,0,0,0.4)', borderRadius:'6px', padding:'4px 8px', fontSize:'11px', color:'white' }}>
          🔍 Ver ampliada
        </div>
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
                objectFit:'contain',
                background:'#f5f5f5',
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

      {/* Modal zoom */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out', padding:'16px' }}>
          <img
            src={imagenes[fotoActiva]}
            alt={titulo}
            style={{ maxWidth:'95vw', maxHeight:'95vh', objectFit:'contain', borderRadius:'8px' }}
          />
          <button
            onClick={() => setZoom(false)}
            style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,0.2)', border:'none', color:'white', fontSize:'24px', cursor:'pointer', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            ×
          </button>
          {imagenes.length > 1 && (
            <div style={{ position:'absolute', bottom:'16px', display:'flex', gap:'8px' }}>
              {imagenes.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={'foto ' + (i+1)}
                  onClick={e => { e.stopPropagation(); setFotoActiva(i) }}
                  style={{ width:'60px', height:'60px', objectFit:'contain', background:'rgba(255,255,255,0.1)', borderRadius:'6px', cursor:'pointer', border: fotoActiva === i ? '2px solid #1D9E75' : '2px solid transparent' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}