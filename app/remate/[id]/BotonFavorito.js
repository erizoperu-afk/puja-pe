'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function BotonFavorito({ remateId }) {
  const [esFavorito, setEsFavorito] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [favoritoId, setFavoritoId] = useState(null)

  useEffect(() => {
    async function verificar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', session.user.id)
        .eq('remate_id', remateId)
        .single()
      if (data) {
        setEsFavorito(true)
        setFavoritoId(data.id)
      }
    }
    verificar()
  }, [remateId])

  async function toggleFavorito() {
    setCargando(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    if (esFavorito) {
      await supabase.from('favoritos').delete().eq('id', favoritoId)
      setEsFavorito(false)
      setFavoritoId(null)
    } else {
      const { data } = await supabase.from('favoritos').insert({
        usuario_id: session.user.id,
        remate_id: remateId
      }).select().single()
      setEsFavorito(true)
      setFavoritoId(data.id)
    }
    setCargando(false)
  }

  return (
    <button onClick={toggleFavorito} disabled={cargando}
      style={{ width:'100%', padding:'10px', borderRadius:'8px', border: esFavorito ? '1px solid #E24B4A' : '1px solid #ddd', background: esFavorito ? '#FCEBEB' : 'transparent', color: esFavorito ? '#A32D2D' : '#666', fontSize:'14px', cursor:'pointer', marginTop:'8px', fontWeight:'500' }}>
      {cargando ? '...' : esFavorito ? '❤ Guardado en favoritos' : '♡ Guardar en favoritos'}
    </button>
  )
}