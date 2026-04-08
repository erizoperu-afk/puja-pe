import { supabase } from '../../supabase'
import Navbar from '../../Navbar'
import PujaBox from './PujaBox'
import GaleriaFotos from './galeriaFotos'
import BotonFavorito from './BotonFavorito'

export default async function PaginaRemate({ params }) {
  const { id } = await params
  const { data: remate } = await supabase
    .from('remates')
    .select('*')
    .eq('id', id)
    .single()

  if (!remate) return (
    <div style={{ padding:'40px', fontFamily:'sans-serif' }}>Remate no encontrado.</div>
  )

  return (
    <main style={{ fontFamily:'sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'24px', display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px' }}>
        <div>
          <p style={{ fontSize:'12px', color:'#999', marginBottom:'12px' }}>
            <a href='/' style={{ color:'#1D9E75', textDecoration:'none' }}>Inicio</a> › {remate.categoria} › {remate.titulo}
          </p>
          <GaleriaFotos imagenes={remate.imagenes_url || (remate.imagen_url ? [remate.imagen_url] : [])} titulo={remate.titulo} />
          <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px' }}>Descripcion</h2>
            <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.7' }}>{remate.descripcion}</p>
          </div>
          <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px' }}>Detalles</h2>
            {[
              ['Categoria', remate.categoria],
              ['Condicion', remate.condicion],
              ['Ubicacion', remate.ubicacion],
              ['Precio inicial', 'S/ ' + Number(remate.precio_inicial).toLocaleString()],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5f5f5', fontSize:'14px' }}>
                <span style={{ color:'#999' }}>{lbl}</span>
                <span style={{ fontWeight:'500' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <PujaBox remate={remate} />
          <BotonFavorito remateId={remate.id} />
        </div>
      </div>
    </main>
  )
}