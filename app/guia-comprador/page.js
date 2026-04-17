'use client'

import { useState } from 'react'
import Navbar from '../Navbar'

const SECCIONES = [
  {
    titulo: 'Como comprar en Puja.pe',
    contenido: [
      {
        subtitulo: '1. Crear tu cuenta',
        texto: 'Haz clic en "Ingresar" y luego en "Crear cuenta". Necesitas ingresar tu nombre, apellido, nickname, numero de celular peruano, correo electronico y una contrasena. Tu celular sera verificado por SMS antes de poder usar la plataforma. Tu nombre real y celular solo se comparten con el vendedor cuando ganas un remate.'
      },
      {
        subtitulo: '2. Buscar articulos',
        texto: 'Usa el buscador en la pagina principal para encontrar lo que buscas, o navega por categorias como Antiguedades, Coleccionables, Electronica, Relojes, entre otras. Tambien puedes ver los articulos mas populares en "LOS REMATES MAS HOT" o los mas recientes en "LO NUEVO".'
      },
      {
        subtitulo: '3. Hacer una puja',
        texto: 'Entra al remate que te interesa y escribe un monto mayor al minimo indicado. Haz clic en "Pujar ahora". Si alguien supera tu puja recibiras una notificacion en tu panel. Gana quien tenga la puja mas alta al terminar el tiempo.'
      },
      {
        subtitulo: '4. Compra directa',
        texto: 'Algunos articulos tienen precio fijo. Haz clic en "Comprar ahora" para adquirirlo de inmediato sin esperar el fin del remate. Los datos del vendedor apareceran en tu panel de comprador para coordinar la entrega.'
      },
      {
        subtitulo: '5. Cuando ganas un remate',
        texto: 'Si tu puja es la ganadora al terminar el tiempo, aparecera en tu panel de comprador en la seccion "Ganados". Veras los datos de contacto del vendedor (nombre completo y celular) para coordinar el pago y la entrega directamente con el. Recuerda que tienes 20 dias desde el cierre del remate para coordinar — despues de ese plazo la publicacion se elimina automaticamente.'
      },
      {
        subtitulo: '6. Calificar al vendedor',
        texto: 'Una vez concretada la transaccion, podras calificar al vendedor desde tu panel de comprador. Las calificaciones son permanentes y ayudan a la comunidad a identificar vendedores confiables.'
      },
    ]
  },
  {
    titulo: 'Preguntas frecuentes — Compradores',
    contenido: [
      { subtitulo: '¿Necesito cuenta para ver los remates?', texto: 'No, puedes ver todos los remates sin registrarte. Solo necesitas una cuenta verificada para pujar, comprar o guardar favoritos.' },
      { subtitulo: '¿Como se si estoy ganando un remate?', texto: 'En tu panel de comprador, en la seccion "Mis pujas", veras el estado de cada puja. Si aparece en verde dice "Ganando". Si alguien te supero aparecera en rojo como "Superado".' },
      { subtitulo: '¿Puja.pe procesa los pagos?', texto: 'Actualmente no. Los compradores y vendedores coordinan el pago directamente entre ellos. Puja.pe actua como intermediario para conectarlos.' },
      { subtitulo: '¿Puedo cancelar una puja?', texto: 'Las pujas son compromisos de compra y no pueden cancelarse. Asegurate de pujar solo si estas dispuesto a pagar el monto.' },
      { subtitulo: '¿Como guardo un articulo en favoritos?', texto: 'En la pagina de cada articulo encontraras el boton "Guardar en favoritos". Luego puedes verlos en tu panel de comprador en la seccion "Favoritos".' },
      { subtitulo: '¿Por cuanto tiempo puedo ver un remate ganado?', texto: 'Los remates finalizados se eliminan automaticamente a los 20 dias de su cierre. Te recomendamos coordinar la entrega con el vendedor dentro de ese plazo.' },
      { subtitulo: '¿Que pasa con mis pujas si se elimina un remate?', texto: 'Al eliminarse una publicacion, tambien se eliminan las pujas asociadas. Las calificaciones que otorgaste se conservan permanentemente.' },
      { subtitulo: '¿Puedo compartir un articulo?', texto: 'Si. En cada articulo encontraras un boton "Compartir" con opciones para WhatsApp, Facebook y copiar enlace.' },
      { subtitulo: '¿Que pasa si olvide mi contrasena?', texto: 'En la pagina de ingreso haz clic en "Olvidaste tu contrasena?" e ingresa tu correo. Te enviaremos un enlace para restablecerla.' },
      { subtitulo: '¿Puedo ingresar con mi nickname?', texto: 'Si. Puedes ingresar usando tu correo electronico o tu nickname, junto con tu contrasena.' },
    ]
  }
]

export default function GuiaComprador() {
  const [abierto, setAbierto] = useState(null)

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'24px 16px' }}>

        <div style={{ background:'#1D9E75', borderRadius:'16px', padding:'32px 24px', marginBottom:'28px', color:'white', textAlign:'center' }}>
          <h1 style={{ fontSize:'26px', fontWeight:'700', marginBottom:'8px' }}>Guia del Comprador</h1>
          <p style={{ fontSize:'15px', opacity:0.9 }}>Todo lo que necesitas saber para comprar en Puja.pe</p>
        </div>

        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <a href='/guia-comprador' style={{ padding:'8px 18px', borderRadius:'20px', background:'#1D9E75', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Guia Comprador</a>
          <a href='/guia-vendedor' style={{ padding:'8px 18px', borderRadius:'20px', background:'#f5f5f5', color:'#666', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Guia Vendedor</a>
        </div>

        {SECCIONES.map((seccion, si) => (
          <div key={si} style={{ marginBottom:'24px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'14px', color:'#1D9E75', borderBottom:'2px solid #E1F5EE', paddingBottom:'8px' }}>{seccion.titulo}</h2>
            {seccion.contenido.map((item, ii) => {
              const key = `${si}-${ii}`
              const isOpen = abierto === key
              return (
                <div key={key} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', marginBottom:'8px', overflow:'hidden' }}>
                  <button onClick={() => setAbierto(isOpen ? null : key)}
                    style={{ width:'100%', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:'12px' }}>
                    <span style={{ fontSize:'14px', fontWeight:'500', color:'#333' }}>{item.subtitulo}</span>
                    <span style={{ fontSize:'18px', color:'#1D9E75', flexShrink:0 }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding:'0 16px 14px', fontSize:'14px', color:'#555', lineHeight:'1.7', borderTop:'1px solid #f5f5f5' }}>
                      {item.texto}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'24px', textAlign:'center', marginTop:'8px' }}>
          <p style={{ fontSize:'15px', color:'#085041', marginBottom:'12px', fontWeight:'500' }}>¿Tienes alguna consulta adicional?</p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href='/mensajes' style={{ padding:'10px 20px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500' }}>Contactar soporte</a>
            <a href='/' style={{ padding:'10px 20px', background:'transparent', color:'#1D9E75', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500', border:'1px solid #1D9E75' }}>Ver remates</a>
          </div>
        </div>
      </div>
    </main>
  )
}