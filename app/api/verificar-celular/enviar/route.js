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

    const numero = '+51' + celular.replace(/\D/g, '').trim()
    console.log('Enviando SMS a:', numero)

    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: numero, channel: 'sms' })

    console.log('Resultado Twilio:', result.status)
    return Response.json({ ok: true })
  } catch (error) {
    console.log('Error Twilio:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}