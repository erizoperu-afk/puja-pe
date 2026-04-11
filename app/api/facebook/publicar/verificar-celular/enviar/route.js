import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request) {
  try {
    const { celular } = await request.json()

    if (!celular) {
      return Response.json({ error: 'Celular requerido.' }, { status: 400 })
    }

    const numero = '+51' + celular.trim()

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: numero, channel: 'sms' })

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}