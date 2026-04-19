import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { suscripcion, admin_email } = await request.json()

    await supabase.from('push_suscripciones').upsert({
      email: admin_email,
      suscripcion: JSON.stringify(suscripcion),
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}