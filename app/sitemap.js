import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const CATEGORIAS = [
  'Antiguedades', 'Coleccionables', 'Electronica', 'Filatelia',
  'Juguetes', 'Numismatica', 'Relojes', 'Ropa y accesorios', 'Otros'
]

export default async function sitemap() {
  const { data: remates } = await supabase
    .from('remates')
    .select('id, updated_at')
    .eq('activo', true)

  const paginasEstaticas = [
    { url: 'https://www.puja.pe', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://www.puja.pe/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const paginasCategorias = CATEGORIAS.map(cat => ({
    url: `https://www.puja.pe/categoria/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const paginasRemates = (remates || []).map(r => ({
    url: `https://www.puja.pe/remate/${r.id}`,
    lastModified: new Date(r.updated_at || Date.now()),
    changeFrequency: 'hourly',
    priority: 0.9,
  }))

  return [...paginasEstaticas, ...paginasCategorias, ...paginasRemates]
}
