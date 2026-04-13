export async function POST(request) {
  try {
    const { titulo, precio, categoria, imagen_url, remate_id, tipo } = await request.json()

    const pageToken = process.env.FACEBOOK_PAGE_TOKEN
    const pageId = process.env.FACEBOOK_PAGE_ID

    if (!pageToken || !pageId) {
      return Response.json({ ok: false, error: 'Token de Facebook no configurado.' })
    }

    const tipoTexto = tipo === 'subasta' ? '🔨 SUBASTA' : '🏷️ VENTA DIRECTA'
    const url = `https://www.puja.pe/remate/${remate_id}`

    const mensaje = `${tipoTexto} — ${titulo}

💰 Precio: S/ ${Number(precio).toLocaleString('es-PE')}
📦 Categoría: ${categoria}

👉 Ver y pujar aquí: ${url}

#PujaPe #RematesOnline #Peru #${categoria.replace(/\s/g, '')}`

    const params = new URLSearchParams({
      message: mensaje,
      access_token: pageToken,
    })

    if (imagen_url) {
      params.append('link', url)
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      body: params,
    })

    const data = await res.json()

    if (data.error) {
      return Response.json({ ok: false, error: data.error.message })
    }

    return Response.json({ ok: true, post_id: data.id })
  } catch (error) {
    return Response.json({ ok: false, error: error.message })
  }
}