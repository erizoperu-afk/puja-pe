import Navbar from '../Navbar'

export default function Privacidad() {
  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'24px 16px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'500', marginBottom:'8px' }}>Política de Privacidad y Condiciones de Uso</h1>
        <p style={{ fontSize:'13px', color:'#999', marginBottom:'32px' }}>Última actualización: Abril 2026</p>

        {[
          ['1. Información que recopilamos',
            'Recopilamos información que nos proporcionas al registrarte, como nombre, apellido, nickname, correo electrónico y número de celular verificado. También recopilamos información sobre tus actividades en la plataforma, como las pujas que realizas y los artículos que publicas.'],

          ['2. Cómo usamos tu información',
            'Usamos tu información para operar y mejorar Puja.pe, procesar tus transacciones, enviarte notificaciones relacionadas con tus pujas y publicaciones, y brindarte soporte al cliente.'],

          ['3. Compartir información',
            'No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para operar el servicio o cuando la ley lo requiera. Los datos de contacto del vendedor (nombre, celular) son visibles únicamente para el comprador que ganó el remate, con el fin de coordinar la entrega.'],

          ['4. Seguridad',
            'Implementamos medidas de seguridad para proteger tu información. Usamos Supabase como proveedor de base de datos con encriptación de datos en reposo y en tránsito. El acceso a la plataforma requiere verificación de celular por SMS.'],

          ['5. Cookies',
            'Usamos cookies técnicas necesarias para el funcionamiento del sitio. No usamos cookies de seguimiento publicitario.'],

          ['6. Depuración automática de publicaciones',
            'Las publicaciones finalizadas — ya sea por venta concretada, compra directa o sin recibir ofertas — son eliminadas automáticamente de la plataforma a los 20 días de su fecha de cierre. El vendedor recibirá una notificación de recordatorio 5 días antes de la eliminación. Al eliminarse una publicación, también se eliminan todas las pujas asociadas a ella. Las calificaciones otorgadas entre comprador y vendedor se conservan permanentemente. Los créditos utilizados para publicar no son reintegrados bajo ninguna circunstancia, independientemente del resultado del remate.'],

          ['7. Créditos de publicación',
            'Cada publicación consume 1 crédito al momento de ser activada. Los créditos no son reembolsables ni transferibles. Durante el período BETA, los usuarios reciben créditos gratuitos para probar la plataforma. Una vez finalizado el BETA, los créditos deberán adquirirse mediante los paquetes disponibles en la plataforma.'],

          ['8. Calificaciones',
            'Al concretarse una venta, tanto el comprador como el vendedor pueden calificarse mutuamente. Las calificaciones son permanentes y no pueden ser eliminadas por los usuarios. Puja.pe se reserva el derecho de moderar calificaciones que contengan contenido inapropiado, ofensivo o falso.'],

          ['9. Tus derechos',
            'Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos derechos, contáctanos a través de nuestra sección de Soporte.'],

          ['10. Contacto',
            'Si tienes preguntas sobre esta política, puedes contactarnos a través de la sección de Soporte en nuestra plataforma.'],
        ].map(([titulo, contenido]) => (
          <div key={titulo} style={{ marginBottom:'28px', paddingBottom:'28px', borderBottom:'1px solid #eee' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'8px', color:'#1D9E75' }}>{titulo}</h2>
            <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.8' }}>{contenido}</p>
          </div>
        ))}

        <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'16px', marginTop:'8px' }}>
          <p style={{ fontSize:'13px', color:'#085041', lineHeight:'1.7' }}>
            Al registrarte y usar Puja.pe aceptas estas políticas. Si tienes dudas, escríbenos desde la sección de <a href='/mensajes' style={{ color:'#1D9E75', fontWeight:'500' }}>Soporte</a>.
          </p>
        </div>

      </div>
    </main>
  )
}