import Navbar from '../Navbar'

export default function Terminos() {
  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'48px 24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'500', marginBottom:'8px' }}>Términos y Condiciones</h1>
        <p style={{ fontSize:'13px', color:'#999', marginBottom:'32px' }}>Última actualización: Abril 2026</p>

        {[
          ['1. Aceptación', 'Al usar Puja.pe, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses nuestra plataforma.'],
          ['2. Uso de la plataforma', 'Puja.pe es una plataforma de remates online para el mercado peruano. Los usuarios pueden publicar artículos para subasta o venta directa, y otros usuarios pueden pujar o comprar.'],
          ['3. Registro', 'Para usar Puja.pe debes registrarte con información verídica. Eres responsable de mantener la confidencialidad de tu cuenta.'],
          ['4. Publicaciones', 'Los vendedores son responsables de la veracidad de sus publicaciones. Está prohibido publicar artículos ilegales, falsificaciones o artículos que no sean de tu propiedad.'],
          ['5. Pujas y compras', 'Una puja es un compromiso de compra. Si ganas un remate, estás obligado a completar la transacción con el vendedor. Puja.pe no procesa los pagos entre compradores y vendedores.'],
          ['6. Créditos', 'Para publicar en Puja.pe, los vendedores necesitan créditos. Durante el período BETA, los créditos son gratuitos. Posteriormente, los créditos deberán adquirirse mediante paquetes.'],
          ['7. Prohibiciones', 'Está prohibido: usar la plataforma para actividades ilegales, publicar contenido falso o engañoso, crear múltiples cuentas, manipular precios o pujas.'],
          ['8. Responsabilidad', 'Puja.pe actúa como intermediario y no es responsable de las transacciones entre compradores y vendedores. Los usuarios deben resolver sus disputas directamente.'],
          ['9. Modificaciones', 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a los usuarios.'],
          ['10. Contacto', 'Para consultas sobre estos términos, contáctanos a través de la sección de Soporte.'],
        ].map(([titulo, contenido]) => (
          <div key={titulo} style={{ marginBottom:'28px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'8px' }}>{titulo}</h2>
            <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.8' }}>{contenido}</p>
          </div>
        ))}
      </div>
    </main>
  )
}