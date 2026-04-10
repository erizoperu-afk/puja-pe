import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { titulo, precio, categoria, imagen_url, remate_id, tipo } = await request.json()

    const PAGE_ID = process.env.FACEBOOK_PAGE_ID
    const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN

    const tipoTexto = tipo === 'subasta' ? '🔨 NUEVA SUBASTA' : '🏷️ NUEVO ARTÍCULO'
    const mensaje = `${tipoTexto} en Puja.pe!\n\n📦 ${titulo}\n💰 Precio ${tipo === 'subasta' ? 'inicial' : 'fijo'}: S/ ${Number(precio).toLocaleString()}\n📂 Categoría: ${categoria}\n\n👉 ${tipo === 'subasta' ? 'Puja' : 'Compra'} ahora: https://puja.pe/remate/${remate_id}\n\n#Puja #Remates #Peru #${categoria.replace(/ /g, '')}`

    let url = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`
    let body = { message: mensaje, access_token: PAGE_TOKEN }

    if (imagen_url) {
      url = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`
      body = { message: mensaje, url: imagen_url, access_token: PAGE_TOKEN }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 400 })
    return NextResponse.json({ success: true, post_id: data.id })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}