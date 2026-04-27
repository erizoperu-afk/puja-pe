import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('file')
  const key = formData.get('key')

  if (!file || !key) {
    return Response.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  try {
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))
  } catch (err) {
    console.error('Error subiendo a R2:', err)
    return Response.json({ error: 'Error al subir la imagen' }, { status: 500 })
  }

  const url = `${process.env.R2_PUBLIC_URL}/${key}`
  return Response.json({ url })
}
