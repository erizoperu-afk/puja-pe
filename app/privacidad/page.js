import Navbar from '../Navbar'

export default function Privacidad() {
  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'24px 16px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'500', marginBottom:'8px' }}>Política de Privacidad</h1>
        <p style={{ fontSize:'13px', color:'#999', marginBottom:'32px' }}>Última actualización: Abril 2026</p>
        {[
          ['1. Información que recopilamos', 'Recopilamos información que nos proporcionas al registrarte, como nombre, nickname, correo electrónico. También recopilamos información sobre tus actividades en la plataforma, como las pujas que realizas y los artículos que publicas.'],
          ['2. Cómo usamos tu información', 'Usamos tu información para operar y mejorar Puja.pe, procesar tus transacciones, enviarte notificaciones relacionadas con tus pujas y publicaciones, y brindarte soporte al cliente.'],
          ['3. Compartir información', 'No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para operar el servicio o cuando la ley lo requiera.'],
          ['4. Seguridad', 'Implementamos medidas de seguridad para proteger tu información. Usamos Supabase como proveedor de base de datos con encriptación de datos en reposo y en tránsito.'],
          ['5. Cookies', 'Usamos cookies técnicas necesarias para el funcionamiento del sitio. No usamos cookies de seguimiento publicitario.'],
          ['6. Tus derechos', 'Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos derechos, contáctanos a través de nuestra sección de Soporte.'],
          ['7. Contacto', 'Si tienes preguntas sobre esta política, puedes contactarnos a través de la sección de Soporte en nuestra plataforma.'],
        ].map(([titulo, contenido]) => (
          <div key={titulo} style={{ marginBottom:'24px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'8px' }}>{titulo}</h2>
            <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.8' }}>{contenido}</p>
          </div>
        ))}
      </div>
    </main>
  )
}