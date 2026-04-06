import { createClient } from '@supabase/supabase-js'
import Navbar from './Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function Home() {
  const { data: remates } = await supabase
    .from('remates')
    .select('*')

  return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <section style={{ background:'#f9f9f9', padding:'48px 24px', textAlign:'center', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'500', marginBottom:'10px' }}>Remata y compra en todo el Peru</h1>
        <p style={{ color:'#666', marginBottom:'24px' }}>Encuentra las mejores ofertas o publica lo que ya no usas</p>
        <div style={{ display:'flex', gap:'10px', maxWidth:'480px', margin:'0 auto' }}>
          <input type='text' placeholder='Busca laptops, celulares, autos...' style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }} />
          <button style={{ padding:'10px 20px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500' }}>Buscar</button>
        </div>
      </section>
      <section style={{ padding:'24px' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'16px' }}>Remates activos ({remates?.length || 0})</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
          {remates?.map((remate) => (
            <a key={remate.id} href={'/remate/' + remate.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', textDecoration:'none', color:'black', display:'block' }}>
              <div style={{ height:'140px', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
  {remate.imagen_url ? (
    <img src={remate.imagen_url} alt={remate.titulo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
  ) : (
    <div style={{ width:'60px', height:'60px', background:'#e0e0e0', borderRadius:'8px' }}></div>
  )}
</div>
              <div style={{ padding:'12px' }}>
                <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'4px' }}>{remate.titulo}</p>
                <p style={{ fontSize:'11px', color:'#999', marginBottom:'6px' }}>{remate.categoria}</p>
                <p style={{ fontSize:'18px', fontWeight:'500' }}>S/ {Number(remate.precio_actual).toLocaleString()}</p>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                  <span style={{ fontSize:'11px', color:'#999' }}>Inicio: S/ {Number(remate.precio_inicial).toLocaleString()}</span>
                  <span style={{ fontSize:'11px', background:'#FCEBEB', color:'#A32D2D', padding:'2px 8px', borderRadius:'20px' }}>En vivo</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}