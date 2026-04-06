'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PanelComprador() {
  const [tab, setTab] = useState('pujas')
  const [usuario, setUsuario] = useState(null)
  const [pujas, setPujas] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [ganados, setGanados] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUsuario(session.user)
      const uid = session.user.id

      const { data: misPujas } = await supabase
        .from('pujas')
        .select('*, remates(*)')
        .eq('comprador_id', uid)
        .order('created_at', { ascending: false })
      setPujas(misPujas || [])

      const { data: misFavoritos } = await supabase
        .from('favoritos')
        .select('*, remates(*)')
        .eq('usuario_id', uid)
        .order('created_at', { ascending: false })
      setFavoritos(misFavoritos || [])

      const { data: misGanados } = await supabase
        .from('pujas')
        .select('*, remates(*)')
        .eq('comprador_id', uid)
        .eq('ganador', true)
        .order('created_at', { ascending: false })
      setGanados(misGanados || [])

      const { data: misNotis } = await supabase
        .from('notificaciones')
        .select('*, remates(*)')
        .eq('usuario_id', uid)
        .order('created_at', { ascending: false })
      setNotificaciones(misNotis || [])

      setCargando(false)
    }
    cargarDatos()
  }, [])

  async function quitarFavorito(favId) {
    await supabase.from('favoritos').delete().eq('id', favId)
    setFavoritos(favoritos.filter(f => f.id !== favId))
  }

  async function marcarLeida(notiId) {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', notiId)
    setNotificaciones(notificaciones.map(n => n.id === notiId ? { ...n, leida: true } : n))
  }

  const estilo = {
    tarjeta: { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'16px' },
    tab: (activo) => ({ padding:'8px 18px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'500', background: activo ? '#1D9E75' : '#f5f5f5', color: activo ? '#fff' : '#666' }),
    badge: (color) => ({ fontSize:'11px', background: color === 'verde' ? '#E1F5EE' : color === 'rojo' ? '#FCEBEB' : '#f5f5f5', color: color === 'verde' ? '#085041' : color === 'rojo' ? '#A32D2D' : '#999', padding:'2px 8px', borderRadius:'20px' }),
    vacio: { textAlign:'center', padding:'40px', background:'#f9f9f9', borderRadius:'12px', color:'#999', fontSize:'14px' }
  }

  const notisNoLeidas = notificaciones.filter(n => !n.leida).length

  if (cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando tu panel...</div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px' }}>

        <h1 style={{ fontSize:'22px', fontWeight:'500', marginBottom:'24px' }}>Mi panel</h1>

        {/* MÉTRICAS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'28px' }}>
          {[
            ['Pujas realizadas', pujas.length],
            ['Remates ganados', ganados.length],
            ['Favoritos', favoritos.length],
            ['Notificaciones', notisNoLeidas],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'#f9f9f9', border:'1px solid #eee', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'12px', color:'#999', marginBottom:'6px' }}>{lbl}</div>
              <div style={{ fontSize:'24px', fontWeight:'500' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          <button style={estilo.tab(tab === 'pujas')} onClick={() => setTab('pujas')}>Mis pujas</button>
          <button style={estilo.tab(tab === 'ganados')} onClick={() => setTab('ganados')}>Remates ganados</button>
          <button style={estilo.tab(tab === 'favoritos')} onClick={() => setTab('favoritos')}>Favoritos</button>
          <button style={estilo.tab(tab === 'notificaciones')} onClick={() => setTab('notificaciones')}>
            Notificaciones {notisNoLeidas > 0 && <span style={{ background:'#E24B4A', color:'white', borderRadius:'50%', padding:'1px 6px', fontSize:'11px', marginLeft:'4px' }}>{notisNoLeidas}</span>}
          </button>
        </div>

        {/* MIS PUJAS */}
        {tab === 'pujas' && (
          <div>
            {pujas.length === 0 && <div style={estilo.vacio}>Aún no has realizado ninguna puja.</div>}
            {pujas.map((puja) => {
              const remate = puja.remates
              const ganando = remate?.precio_actual === puja.monto
              return (
                <div key={puja.id} style={estilo.tarjeta}>
                  <div style={{ width:'56px', height:'56px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                    {remate?.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{remate?.titulo}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>Tu puja: S/ {Number(puja.monto).toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>S/ {Number(remate?.precio_actual).toLocaleString()}</p>
                    <span style={estilo.badge(ganando ? 'verde' : 'rojo')}>
                      {ganando ? 'Ganando' : 'Superado'}
                    </span>
                  </div>
                  <a href={'/remate/' + remate?.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>
                </div>
              )
            })}
          </div>
        )}

        {/* GANADOS */}
        {tab === 'ganados' && (
          <div>
            {ganados.length === 0 && <div style={estilo.vacio}>Aún no has ganado ningún remate.</div>}
            {ganados.map((puja) => {
              const remate = puja.remates
              return (
                <div key={puja.id} style={estilo.tarjeta}>
                  <div style={{ width:'56px', height:'56px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                    {remate?.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{remate?.titulo}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>{remate?.categoria}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>S/ {Number(puja.monto).toLocaleString()}</p>
                    <span style={estilo.badge('verde')}>Ganado</span>
                  </div>
                  <a href={'/remate/' + remate?.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>
                </div>
              )
            })}
          </div>
        )}

        {/* FAVORITOS */}
        {tab === 'favoritos' && (
          <div>
            {favoritos.length === 0 && <div style={estilo.vacio}>No tienes remates guardados como favoritos.</div>}
            {favoritos.map((fav) => {
              const remate = fav.remates
              return (
                <div key={fav.id} style={estilo.tarjeta}>
                  <div style={{ width:'56px', height:'56px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                    {remate?.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{remate?.titulo}</p>
                    <p style={{ fontSize:'12px', color:'#999' }}>S/ {Number(remate?.precio_actual).toLocaleString()} · {remate?.categoria}</p>
                  </div>
                  <span style={estilo.badge(remate?.activo ? 'verde' : 'gris')}>{remate?.activo ? 'Activo' : 'Finalizado'}</span>
                  <a href={'/remate/' + remate?.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>
                  <button onClick={() => quitarFavorito(fav.id)} style={{ fontSize:'12px', color:'#A32D2D', background:'none', border:'1px solid #E24B4A', borderRadius:'8px', padding:'6px 12px', cursor:'pointer' }}>Quitar</button>
                </div>
              )
            })}
          </div>
        )}

        {/* NOTIFICACIONES */}
        {tab === 'notificaciones' && (
          <div>
            {notificaciones.length === 0 && <div style={estilo.vacio}>No tienes notificaciones aún.</div>}
            {notificaciones.map((noti) => (
              <div key={noti.id} style={{ ...estilo.tarjeta, background: noti.leida ? '#fff' : '#F0FBF7', border: noti.leida ? '1px solid #eee' : '1px solid #9FE1CB' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', background: noti.leida ? '#ddd' : '#1D9E75', flexShrink:0 }}></div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'14px', marginBottom:'3px' }}>{noti.mensaje}</p>
                  <p style={{ fontSize:'12px', color:'#999' }}>{new Date(noti.created_at).toLocaleDateString('es-PE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                </div>
                {noti.remates && (
                  <a href={'/remate/' + noti.remate_id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver remate</a>
                )}
                {!noti.leida && (
                  <button onClick={() => marcarLeida(noti.id)} style={{ fontSize:'12px', color:'#666', background:'none', border:'1px solid #ddd', borderRadius:'8px', padding:'6px 12px', cursor:'pointer' }}>Marcar leída</button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}