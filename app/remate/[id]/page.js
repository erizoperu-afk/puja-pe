import { supabase } from '../../supabase'
import Navbar from '../../Navbar'
import PujaBox from './PujaBox'
import GaleriaFotos from './galeriaFotos'
import BotonFavorito from './BotonFavorito'
import BotonCompartir from './BotonCompartir'
import PreguntasYRespuestas from './PreguntasYRespuestas'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: remate } = await supabase
    .from('remates')
    .select('*')
    .eq('id', id)
    .single()

  if (!remate) return { title: 'Remate no encontrado — Puja.pe' }

  const descripcion = remate.descripcion
    ? remate.descripcion.slice(0, 155) + (remate.descripcion.length > 155 ? '...' : '')
    : `Remate de ${remate.categoria} en Puja.pe. Precio actual: S/ ${Number(remate.precio_actual).toLocaleString()}`

  return {
    title: remate.titulo,
    description: descripcion,
    alternates: { canonical: `https://www.puja.pe/remate/${remate.id}` },
    openGraph: {
      title: `${remate.titulo} — S/ ${Number(remate.precio_actual).toLocaleString()}`,
      description: descripcion,
      url: `https://www.puja.pe/remate/${remate.id}`,
      images: remate.imagen_url ? [{ url: remate.imagen_url, width: 1200, height: 630, alt: remate.titulo }] : [],
      type: 'website',
      siteName: 'Puja.pe',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${remate.titulo} — S/ ${Number(remate.precio_actual).toLocaleString()}`,
      description: descripcion,
      images: remate.imagen_url ? [remate.imagen_url] : [],
    }
  }
}

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

  const url = 'https://www.puja.pe/remate/' + remate.id
  const texto = '¡Mira este artículo en Puja.pe! ' + remate.titulo + ' — S/ ' + Number(remate.precio_actual).toLocaleString()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': remate.tipo_publicacion === 'precio_fijo' ? 'Product' : 'Product',
    name: remate.titulo,
    description: remate.descripcion || '',
    image: remate.imagenes_url || (remate.imagen_url ? [remate.imagen_url] : []),
    url,
    offers: {
      '@type': remate.tipo_publicacion === 'precio_fijo' ? 'Offer' : 'AggregateOffer',
      priceCurrency: 'PEN',
      price: Number(remate.precio_actual),
      availability: remate.activo ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@type': 'Organization', name: 'Puja.pe', url: 'https://www.puja.pe' },
    },
    category: remate.categoria,
  }

  return (
    <main style={{ fontFamily:'sans-serif', overflowX:'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'16px' }}>
        <p style={{ fontSize:'12px', color:'#999', marginBottom:'12px' }}>
          <a href='/' style={{ color:'#1D9E75', textDecoration:'none' }}>Inicio</a> › {remate.categoria} › {remate.titulo}
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'16px' }} className='remate-grid'>

          <div className='galeria-col'>
            <GaleriaFotos imagenes={remate.imagenes_url || (remate.imagen_url ? [remate.imagen_url] : [])} titulo={remate.titulo} />
          </div>

          <div className='pujabox-col'>
            <PujaBox remate={remate} />
            <BotonFavorito remateId={remate.id} />
            <BotonCompartir url={url} texto={texto} titulo={remate.titulo} />
          </div>

          <div className='info-col'>
            <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px' }}>Descripcion</h2>
              <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.7' }}>{remate.descripcion || 'Sin descripción.'}</p>
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
            <PreguntasYRespuestas remateId={remate.id} vendedorId={remate.vendedor_id} />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .remate-grid {
            grid-template-columns: 1fr 340px !important;
            grid-template-areas:
              'galeria pujabox'
              'info pujabox' !important;
          }
          .galeria-col { grid-area: galeria; }
          .pujabox-col { grid-area: pujabox; }
          .info-col { grid-area: info; }
        }
        @media (max-width: 767px) {
          .remate-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .galeria-col { order: 1; }
          .pujabox-col { order: 2; }
          .info-col { order: 3; }
        }
      `}</style>
    </main>
  )
}