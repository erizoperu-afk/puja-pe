'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Navbar from '../Navbar'

const POR_PAGINA = 6

export default function PanelComprador() {
  const [tab, setTab] = useState('pujas')
  const [usuario, setUsuario] = useState(null)
  const [pujas, setPujas] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [ganados, setGanados] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [contactosVendedor, setContactosVendedor] = useState({})

  useEffect(() => {
    async function cargarDatos() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUsuario(session.user)
      const uid = session.user.id

      const { data: misPujas } = await supabase.from('pujas').select('*, remates(*)').eq('usuario_id', uid).order('created_at', { ascending: false })
      setPujas(misPujas || [])

      const { data: misFavoritos } = await supabase.from('favoritos').select('*, remates(*)').eq('usuario_id', uid).order('created_at', { ascending: false })
      setFavoritos(misFavoritos || [])

      const { data: misGanados } = await supabase.from('pujas').select('*, remates(*)').eq('usuario_id', uid).eq('ganador', true).order('created_at', { ascending: false })
      setGanados(misGanados || [])

      const { data: misNotis } = await supabase.from('notificaciones').select('*, remates(*)').eq('usuario_id', uid).order('created_at', { ascending: false })
      setNotificaciones(misNotis || [])

      const { data: compras } = await supabase
        .from('remates')
        .select('*')
        .eq('comprador_id', uid)
        .eq('activo', false)

      const todosGanados = [...(misGanados || []), ...(compras || []).map(c => ({ remates: c }))]
      const contactos = {}
      for (const item of todosGanados) {
        const remate = item.remates
        if (remate?.vendedor_id && !contactos[remate.id]) {
          const { data: contacto } = await supabase.rpc('get_datos_contacto', { p_usuario_id: remate.vendedor_id })
          if (contacto) contactos[remate.id] = contacto
        }
      }
      setContactosVendedor(contactos)
      setCargando(false)
    }
    cargarDatos()
  }, [])

  useEffect(() => { setPagina(1) }, [tab])

  async function quitarFavorito(favId) {
    await supabase.from('favoritos').delete().eq('id', favId)
    setFavoritos(favoritos.filter(f => f.id !== favId))
  }

  async function marcarLeida(notiId) {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', notiId)
    setNotificaciones(notificaciones.map(n => n.id === notiId ? { ...n, leida: true } : n))
  }

  const notisNoLeidas = notificaciones.filter(n => !n.leida).length

  const btnPag = { padding:'7px 12px', borderRadius:'8px', border:'1px solid #eee', background:'#fff', cursor:'pointer', fontSize:'12px', color:'#666' }
  const btnPagActivo = { ...btnPag, background:'#1D9E75', color:'white', border:'1px solid #1D9E75', fontWeight:'500' }

  function Paginacion({ items }) {
    const total = Math.ceil(items.length / POR_PAGINA)
    if (total <= 1) return null
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px', marginTop:'20px', flexWrap:'wrap' }}>
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
          style={{ ...btnPag, opacity: pagina === 1 ? 0.4 : 1 }}>← Anterior</button>
        {Array.from({ length: total }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => setPagina(n)} style={n === pagina ? btnPagActivo : btnPag}>{n}</button>
        ))}
        <button onClick={() => setPagina(p => Math.min(total, p + 1))} disabled={pagina === total}
          style={{ ...btnPag, opacity: pagina === total ? 0.4 : 1 }}>Siguiente →</button>
      </div>
    )
  }

  function paginar(items) {
    return items.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  }

  function ContadorItems({ items }) {
    if (items.length === 0) return null
    return (
      <div style={{ fontSize:'12px', color:'#999', marginBottom:'10px' }}>
        Mostrando {((pagina - 1) * POR_PAGINA) + 1}–{Math.min(pagina * POR_PAGINA, items.length)} de {items.length}
      </div>
    )
  }

  function ContactoVendedor({ remateId }) {
    const contacto = contactosVendedor[remateId]
    if (!contacto) return null
    return (
      <div style={{ marginTop:'10px', background:'#E1F5EE', borderRadius:'8px', padding:'12px', border:'1px solid #9FE1CB' }}>
        <p style={{ fontSize:'12px', fontWeight:'500', color:'#085041', marginBottom:'8px' }}>Datos del vendedor</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'8px' }}>
          <div>
            <p style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>Nombre completo</p>
            <p style={{ fontSize:'13px', fontWeight:'500', color:'#085041' }}>{contacto.nombre} {contacto.apellido}</p>
          </div>
          <div>
            <p style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>Celular</p>
            <p style={{ fontSize:'13px', fontWeight:'500', color:'#085041' }}>+51 {contacto.celular}</p>
          </div>
          <div>
            <p style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>Nickname</p>
            <p style={{ fontSize:'13px', fontWeight:'500', color:'#085041' }}>{contacto.nickname}</p>
          </div>
        </div>
      </div>
    )
  }

  const estilo = {
    tarjeta: { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'12px', marginBottom:'10px' },
    tab: (activo) => ({
      padding:'7px 14px', borderRadius:'20px', border: activo ? '1px solid #1D9E75' : '1px solid #eee',
      cursor:'pointer', fontSize:'12px', fontWeight:'500',
      background: activo ? '#1D9E75' : '#fff',
      color: activo ? '#fff' : '#666', whiteSpace:'nowrap'
    }),
    badge: (color) => ({
      fontSize:'11px',
      background: color === 'verde' ? '#E1F5EE' : color === 'rojo' ? '#FCEBEB' : '#f5f5f5',
      color: color === 'verde' ? '#085041' : color === 'rojo' ? '#A32D2D' : '#999',
      padding:'2px 8px', borderRadius:'20px', flexShrink:0
    }),
    vacio: { textAlign:'center', padding:'40px', background:'#fff', border:'1px solid #eee', borderRadius:'12px', color:'#999', fontSize:'14px' }
  }

  const tabs = [
    { key:'pujas',          label:'Mis pujas',      count: pujas.length },
    { key:'ganados',        label:'Ganados',         count: ganados.length },
    { key:'favoritos',      label:'Favoritos',       count: favoritos.length },
    { key:'notificaciones', label:'Notificaciones',  count: notisNoLeidas },
  ]

  if (cargando) return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>Cargando tu panel...</div>
    </main>
  )

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'16px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h1 style={{ fontSize:'20px', fontWeight:'500' }}>Mi panel comprador</h1>
          <a href='/' style={{ padding:'8px 14px', background:'#f5f5f5', color:'#666', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500', border:'1px solid #eee' }}>
            Página Principal
          </a>
        </div>

        {/* BANNER GANADOS */}
        {ganados.length > 0 && (
          <div style={{ background:'#E1F5EE', border:'1.5px solid #1D9E75', borderRadius:'12px', padding:'14px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <p style={{ fontSize:'13px', fontWeight:'500', color:'#085041', marginBottom:'2px' }}>
                {ganados.length === 1 ? 'Ganaste 1 remate' : `Ganaste ${ganados.length} remates`} — coordina la entrega con {ganados.length === 1 ? 'el vendedor' : 'los vendedores'}
              </p>
              <p style={{ fontSize:'12px', color:'#1D9E75' }}>Los datos de contacto aparecen en cada tarjeta de ganado</p>
            </div>
            <button onClick={() => setTab('ganados')}
              style={{ padding:'7px 14px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer', flexShrink:0 }}>
              Ver ganados
            </button>
          </div>
        )}

        {/* MÉTRICAS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginBottom:'20px' }}>
          {[
            ['Pujas',         pujas.length,      '#333'   ],
            ['Ganados',       ganados.length,    '#1D9E75'],
            ['Favoritos',     favoritos.length,  '#185FA5'],
            ['Notificaciones', notisNoLeidas,    '#A32D2D'],
          ].map(([lbl, val, color]) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'12px' }}>
              <div style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>{lbl}</div>
              <div style={{ fontSize:'22px', fontWeight:'500', color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'16px', overflowX:'auto', paddingBottom:'4px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={estilo.tab(tab === t.key)}>
              {t.label}
              {t.key === 'notificaciones' && notisNoLeidas > 0
                ? <span style={{ background:'#E24B4A', color:'white', borderRadius:'50%', padding:'1px 5px', fontSize:'10px', marginLeft:'4px' }}>{notisNoLeidas}</span>
                : <span style={{ opacity:.7, marginLeft:'4px' }}>({t.count})</span>
              }
            </button>
          ))}
        </div>

        {/* PUJAS */}
        {tab === 'pujas' && (
          <div>
            {pujas.length === 0
              ? <div style={estilo.vacio}>Aún no has realizado ninguna puja.</div>
              : <>
                  <ContadorItems items={pujas} />
                  {paginar(pujas).map((puja) => {
                    const remate = puja.remates
                    const ganando = remate?.precio_actual === puja.monto
                    return (
                      <div key={puja.id} style={{ ...estilo.tarjeta, border: ganando ? '1.5px solid #1D9E75' : '1px solid #eee' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                          <div style={{ width:'48px', height:'48px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                            {remate?.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontWeight:'500', fontSize:'13px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{remate?.titulo}</p>
                            <p style={{ fontSize:'11px', color:'#999' }}>Tu puja: S/ {Number(puja.monto).toLocaleString()}</p>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <p style={{ fontSize:'14px', fontWeight:'500', marginBottom:'4px' }}>S/ {Number(remate?.precio_actual).toLocaleString()}</p>
                            <span style={estilo.badge(ganando ? 'verde' : 'rojo')}>{ganando ? 'Ganando' : 'Superado'}</span>
                          </div>
                          <a href={'/remate/' + remate?.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 10px', border:'1px solid #1D9E75', borderRadius:'8px', flexShrink:0 }}>Ver</a>
                        </div>
                      </div>
                    )
                  })}
                  <Paginacion items={pujas} />
                </>
            }
          </div>
        )}

        {/* GANADOS */}
        {tab === 'ganados' && (
          <div>
            {ganados.length === 0
              ? <div style={estilo.vacio}>Aún no has ganado ningún remate.</div>
              : <>
                  <ContadorItems items={ganados} />
                  {paginar(ganados).map((puja) => {
                    const remate = puja.remates
                    return (
                      <div key={puja.id} style={{ ...estilo.tarjeta, border:'1.5px solid #1D9E75' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                          <div style={{ width:'48px', height:'48px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                            {remate?.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontWeight:'500', fontSize:'13px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{remate?.titulo}</p>
                            <p style={{ fontSize:'11px', color:'#999' }}>{remate?.categoria}</p>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <p style={{ fontSize:'14px', fontWeight:'500', marginBottom:'4px' }}>S/ {Number(puja.monto).toLocaleString()}</p>
                            <span style={estilo.badge('verde')}>Ganado</span>
                          </div>
                          <a href={'/remate/' + remate?.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 10px', border:'1px solid #1D9E75', borderRadius:'8px', flexShrink:0 }}>Ver</a>
                        </div>
                        <ContactoVendedor remateId={remate?.id} />
                      </div>
                    )
                  })}
                  <Paginacion items={ganados} />
                </>
            }
          </div>
        )}

        {/* FAVORITOS */}
        {tab === 'favoritos' && (
          <div>
            {favoritos.length === 0
              ? <div style={estilo.vacio}>No tienes remates guardados como favoritos.</div>
              : <>
                  <ContadorItems items={favoritos} />
                  {paginar(favoritos).map((fav) => {
                    const remate = fav.remates
                    return (
                      <div key={fav.id} style={{ ...estilo.tarjeta, display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                        <div style={{ width:'48px', height:'48px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
                          {remate?.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:'500', fontSize:'13px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{remate?.titulo}</p>
                          <p style={{ fontSize:'11px', color:'#999' }}>S/ {Number(remate?.precio_actual).toLocaleString()} · {remate?.categoria}</p>
                        </div>
                        <span style={estilo.badge(remate?.activo ? 'verde' : 'gris')}>{remate?.activo ? 'Activo' : 'Finalizado'}</span>
                        <a href={'/remate/' + remate?.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 10px', border:'1px solid #1D9E75', borderRadius:'8px', flexShrink:0 }}>Ver</a>
                        <button onClick={() => quitarFavorito(fav.id)} style={{ fontSize:'12px', color:'#A32D2D', background:'none', border:'1px solid #E24B4A', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', flexShrink:0 }}>Quitar</button>
                      </div>
                    )
                  })}
                  <Paginacion items={favoritos} />
                </>
            }
          </div>
        )}

        {/* NOTIFICACIONES */}
        {tab === 'notificaciones' && (
          <div>
            {notificaciones.length === 0
              ? <div style={estilo.vacio}>No tienes notificaciones aún.</div>
              : <>
                  <ContadorItems items={notificaciones} />
                  {paginar(notificaciones).map((noti) => (
                    <div key={noti.id} style={{ ...estilo.tarjeta, display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', background: noti.leida ? '#fff' : '#F0FBF7', border: noti.leida ? '1px solid #eee' : '1px solid #9FE1CB' }}>
                      <div style={{ width:'10px', height:'10px', borderRadius:'50%', background: noti.leida ? '#ddd' : '#1D9E75', flexShrink:0 }}></div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:'13px', marginBottom:'3px' }}>{noti.mensaje}</p>
                        <p style={{ fontSize:'11px', color:'#999' }}>{new Date(noti.created_at).toLocaleDateString('es-PE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                      </div>
                      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                        {noti.remates && <a href={'/remate/' + noti.remate_id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 10px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>}
                        {!noti.leida && <button onClick={() => marcarLeida(noti.id)} style={{ fontSize:'12px', color:'#666', background:'none', border:'1px solid #ddd', borderRadius:'8px', padding:'6px 10px', cursor:'pointer' }}>Leída</button>}
                      </div>
                    </div>
                  ))}
                  <Paginacion items={notificaciones} />
                </>
            }
          </div>
        )}

      </div>
    </main>
  )
}