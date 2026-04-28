import CategoriaClient from './CategoriaClient'

export async function generateMetadata({ params }) {
  const { nombre } = await params
  const cat = decodeURIComponent(nombre)
  return {
    title: `Remates de ${cat} en Perú`,
    description: `Encuentra los mejores remates y subastas de ${cat} en Perú. Compra artículos únicos al mejor precio en Puja.pe.`,
    alternates: { canonical: `https://www.puja.pe/categoria/${nombre}` },
    openGraph: {
      title: `Remates de ${cat} — Puja.pe`,
      description: `Los mejores remates de ${cat} en Perú. ¡Puja ahora!`,
      url: `https://www.puja.pe/categoria/${nombre}`,
      siteName: 'Puja.pe',
      type: 'website',
    },
  }
}

export default async function PaginaCategoria({ params }) {
  const { nombre } = await params
  const cat = decodeURIComponent(nombre)
  return <CategoriaClient nombre={cat} />
}
