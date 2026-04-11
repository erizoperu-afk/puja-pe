import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request) {
  try {
    const { celular, codigo } = await request.json()

    if (!celular || !codigo) {
      return Response.json({ error: 'Celular y código requeridos.' }, { status: 400 })
    }

    const numero = '+51' + celular.trim()

    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: numero, code: codigo.trim() })

    if (result.status === 'approved') {
      return Response.json({ ok: true })
    } else {
      return Response.json({ error: 'Código incorrecto o expirado.' }, { status: 400 })
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}