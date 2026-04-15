'use client'

import { useState } from 'react'
import Navbar from '../Navbar'

const FAQS = [
  {
    categoria: 'Compradores',
    preguntas: [
      { p: '¿Cómo hago una puja?', r: 'Entra a cualquier remate activo, ingresa un monto mayor al mínimo indicado y haz clic en "Pujar ahora". Necesitas tener una cuenta registrada y el celular verificado.' },
      { p: '¿Qué pasa si gano un remate?', r: 'Si tu puja es la más alta al terminar el tiempo, ganas el remate. Los datos de contacto del vendedor aparecerán automáticamente en tu panel de comprador para que coordinen la entrega directamente.' },
      { p: '¿Puedo comprar a precio fijo?', r: 'Sí, algunos artículos tienen opción de "Venta directa". Haz clic en "Comprar ahora" para adquirirlo al precio fijo sin esperar el fin del remate.' },
      { p: '¿Puedo hacer una oferta por debajo del precio?', r: 'Si el vendedor habilitó la opción de ofertas, verás el botón "Hacer una oferta". Puedes proponer un precio menor y el vendedor decidirá si acepta.' },
      { p: '¿Cómo guardo un artículo en favoritos?', r: 'En la página de cada artículo, haz clic en el botón "Guardar en favoritos". Lo encontrarás en tu panel de comprador.' },
      { p: '¿Por cuánto tiempo puedo ver un remate ganado?', r: 'Los remates finalizados se eliminan automáticamente a los 20 días de su cierre. Te recomendamos coordinar la entrega con el vendedor dentro de ese plazo.' },
    ]
  },
  {
    categoria: 'Vendedores',
    preguntas: [
      { p: '¿Cómo publico un artículo?', r: 'Ve a tu panel de vendedor y haz clic en "+ Publicar". Completa el formulario con fotos, descripción, precio y duración. Necesitas tener créditos disponibles.' },
      { p: '¿Qué son los créditos?', r: 'Cada publicación consume 1 crédito al momento de activarse. Durante el período BETA, los créditos son gratuitos. Los créditos no son reembolsables una vez utilizados, independientemente del resultado del remate.' },
      { p: '¿Cuánto dura un remate?', r: 'Puedes elegir entre 1, 3, 5 o 7 días para subastas. Las publicaciones a precio fijo tienen vigencia de 30 días.' },
      { p: '¿Qué pasa si mi artículo no recibe pujas?', r: 'Si tu publicación concluye sin recibir ofertas, aparecerá en tu panel como "Sin ofertas". Podrás republicarlo o modificarlo consumiendo 1 crédito adicional.' },
      { p: '¿Puedo subir varias fotos?', r: 'Sí, puedes subir hasta 3 fotos por publicación.' },
      { p: '¿Qué pasa con mi publicación después de finalizar?', r: 'Las publicaciones finalizadas — con venta, sin venta o por compra directa — se eliminan automáticamente a los 20 días de su cierre. Recibirás una notificación de recordatorio 5 días antes de la eliminación.' },
      { p: '¿Se me devuelven los créditos si el remate no se vende?', r: 'No. Los créditos son por publicación, no por resultado. Una vez que una publicación es activada, el crédito queda consumido.' },
      { p: '¿Qué se elimina cuando se borra una publicación?', r: 'Al eliminarse una publicación se borran también todas las pujas asociadas a ella. Las calificaciones que recibiste de compradores se conservan permanentemente.' },
    ]
  },
  {
    categoria: 'Calificaciones',
    preguntas: [
      { p: '¿Cómo funciona el sistema de calificaciones?', r: 'Al concretarse una venta, tanto el comprador como el vendedor pueden calificarse mutuamente con una puntuación y un comentario. Las calificaciones son públicas y visibles en el perfil de cada usuario.' },
      { p: '¿Puedo eliminar una calificación que recibí?', r: 'No. Las calificaciones son permanentes y no pueden ser eliminadas por los usuarios. Puja.pe puede moderar calificaciones con contenido inapropiado o falso.' },
      { p: '¿Las calificaciones se eliminan con el remate?', r: 'No. Las calificaciones se conservan permanentemente aunque el remate haya sido eliminado de la plataforma.' },
    ]
  },
  {
    categoria: 'General',
    preguntas: [
      { p: '¿Es gratuito usar Puja.pe?', r: 'Actualmente estamos en período BETA, por lo que tanto compradores como vendedores pueden usar la plataforma de forma gratuita.' },
      { p: '¿Cómo me registro?', r: 'Haz clic en "Ingresar" y luego en "Crear cuenta". Necesitas nombre, apellido, nickname único, celular peruano y correo electrónico. Tu celular será verificado por SMS.' },
      { p: '¿Puja.pe procesa los pagos?', r: 'Actualmente Puja.pe no procesa pagos. Los compradores y vendedores coordinan el pago y entrega directamente entre ellos una vez concretada la venta.' },
      { p: '¿Cómo contacto al soporte?', r: 'Si tienes cuenta, ve a la sección "Soporte" en el menú superior. Si no tienes cuenta, usa el formulario en la página de Contacto.' },
      { p: '¿Cada cuánto tiempo se limpian las publicaciones viejas?', r: 'Las publicaciones finalizadas se eliminan automáticamente a los 20 días de su cierre. El vendedor recibe un aviso 5 días antes. Esta limpieza mantiene la plataforma actualizada con artículos vigentes.' },
    ]
  },
]

export default function Ayuda() {
  const [abierto, setAbierto] = useState(null)

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'24px 16px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'500', marginBottom:'8px' }}>Centro de ayuda</h1>
        <p style={{ fontSize:'14px', color:'#666', marginBottom:'32px' }}>Encuentra respuestas a las preguntas más frecuentes.</p>

        {FAQS.map((seccion, si) => (
          <div key={si} style={{ marginBottom:'28px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'12px', color:'#1D9E75', borderBottom:'2px solid #E1F5EE', paddingBottom:'8px' }}>
              {seccion.categoria}
            </h2>
            {seccion.preguntas.map((faq, fi) => {
              const key = `${si}-${fi}`
              const isOpen = abierto === key
              return (
                <div key={key} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', marginBottom:'6px', overflow:'hidden' }}>
                  <button onClick={() => setAbierto(isOpen ? null : key)}
                    style={{ width:'100%', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:'12px' }}>
                    <span style={{ fontSize:'14px', fontWeight:'500', color:'#333' }}>{faq.p}</span>
                    <span style={{ fontSize:'18px', color:'#1D9E75', flexShrink:0 }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding:'0 16px 14px', fontSize:'14px', color:'#555', lineHeight:'1.7', borderTop:'1px solid #f5f5f5' }}>
                      {faq.r}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'20px', textAlign:'center', marginTop:'8px' }}>
          <p style={{ fontSize:'15px', color:'#085041', marginBottom:'10px' }}>¿No encontraste lo que buscabas?</p>
          <a href='/contacto' style={{ padding:'10px 24px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500' }}>
            Contáctanos
          </a>
        </div>
      </div>
    </main>
  )
}