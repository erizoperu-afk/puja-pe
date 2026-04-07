import { supabase } from '../supabase'
import Navbar from '../Navbar'

export default async function PanelVendedor() {
  const { data: remates } = await supabase
    .from('remates')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h1 style={{ fontSize:'22px', fontWeight:'500' }}>Mi panel</h1>
          <a href='/vendedor/nuevo' style={{ padding:'9px 18px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500' }}>+ Publicar remate</a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'28px' }}>
          {[
            ['Remates activos', remates?.filter(r => r.activo).length || 0],
            ['Total publicados', remates?.length || 0],
            ['Pujas recibidas', '—'],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'#f9f9f9', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'12px', color:'#999', marginBottom:'6px' }}>{lbl}</div>
              <div style={{ fontSize:'24px', fontWeight:'500' }}>{val}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'14px' }}>Mis remates</h2>
        {remates?.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', background:'#f9f9f9', borderRadius:'12px', color:'#999' }}>No tienes remates publicados aun.</div>
        )}
        {remates?.map((remate) => (
          <div key={remate.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ width:'56px', height:'56px', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #eee', flexShrink:0, overflow:'hidden' }}>
              {remate.imagen_url && <img src={remate.imagen_url} alt='' style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'3px' }}>{remate.titulo}</p>
              <p style={{ fontSize:'12px', color:'#999' }}>{remate.categoria} · {remate.ubicacion}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
              <span style={{ fontSize:'11px', background: remate.activo ? '#E1F5EE' : '#f5f5f5', color: remate.activo ? '#085041' : '#999', padding:'2px 8px', borderRadius:'20px' }}>
                {remate.activo ? 'Activo' : 'Finalizado'}
              </span>
            </div>
            <a href={'/remate/' + remate.id} style={{ fontSize:'12px', color:'#1D9E75', textDecoration:'none', padding:'6px 12px', border:'1px solid #1D9E75', borderRadius:'8px' }}>Ver</a>
          </div>
        ))}
      </div>
    </main>
  )
}