import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { titulo, mensaje } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )

    const { data: suscripciones } = await supabase
      .from('push_suscripciones')
      .select('suscripcion')

    for (const row of suscripciones || []) {
      const suscripcion = JSON.parse(row.suscripcion)
      await webpush.sendNotification(suscripcion, JSON.stringify({ titulo, mensaje }))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
