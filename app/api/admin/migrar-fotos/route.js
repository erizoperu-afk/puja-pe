import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })

  const { data: remates } = await supabase
    .from('remates')
    .select('id, imagen_url, imagenes_url')

  let migrados = 0
  let saltados = 0
  let errores = 0

  for (const remate of remates || []) {
    try {
      const urlsOriginales = remate.imagenes_url?.length
        ? remate.imagenes_url
        : remate.imagen_url ? [remate.imagen_url] : []

      if (urlsOriginales.length === 0) { saltados++; continue }

      // Si todas las URLs ya son de R2, saltar
      const todasEnR2 = urlsOriginales.every(u => !u.includes('supabase.co'))
      if (todasEnR2) { saltados++; continue }

      const nuevasUrls = []

      for (const url of urlsOriginales) {
        if (!url.includes('supabase.co')) {
          nuevasUrls.push(url)
          continue
        }

        const nombreArchivo = decodeURIComponent(url.split('/').pop())

        const res = await fetch(url)
        if (!res.ok) { errores++; nuevasUrls.push(url); continue }

        const buffer = Buffer.from(await res.arrayBuffer())
        const contentType = res.headers.get('content-type') || 'image/jpeg'

        await r2.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: nombreArchivo,
          Body: buffer,
          ContentType: contentType,
        }))

        nuevasUrls.push(`${process.env.R2_PUBLIC_URL}/${nombreArchivo}`)
      }

      await supabase.from('remates').update({
        imagen_url: nuevasUrls[0] || null,
        imagenes_url: nuevasUrls
      }).eq('id', remate.id)

      migrados++
    } catch (err) {
      console.error('Error migrando remate', remate.id, err.message)
      errores++
    }
  }

  return Response.json({ ok: true, migrados, saltados, errores, total: remates?.length || 0 })
}
