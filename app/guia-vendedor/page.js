'use client'

import { useState } from 'react'
import Navbar from '../Navbar'

const SECCIONES = [
  {
    titulo: 'Como vender en Puja.pe',
    contenido: [
      {
        subtitulo: '1. Crear tu cuenta de vendedor',
        texto: 'Registrate en Puja.pe con tu nombre, apellido, nickname, celular peruano y correo. Tu celular sera verificado por SMS. Una vez registrado, accede a tu panel de vendedor desde el menu superior. No necesitas un tipo de cuenta especial — cualquier usuario verificado puede vender.'
      },
      {
        subtitulo: '2. Los creditos de publicacion',
        texto: 'Cada publicacion consume 1 credito al momento de activarse. Durante el periodo BETA los creditos son gratuitos. Los creditos no son reembolsables una vez utilizados, independientemente del resultado del remate.'
      },
      {
        subtitulo: '3. Tipos de publicacion',
        texto: 'Tienes dos opciones: Subasta — los compradores pujan y gana quien ofrezca mas al terminar el tiempo. Precio fijo — publicas a un precio fijo y el primer comprador que lo pague se lo lleva. Ambos tipos consumen 1 credito.'
      },
      {
        subtitulo: '4. Crear una subasta',
        texto: 'Ve a tu panel de vendedor y haz clic en "+ Publicar". Selecciona "Subasta", sube hasta 3 fotos, completa la informacion del producto, establece el precio inicial, el incremento minimo, el precio de compra directa (opcional) y la duracion (1, 3, 5 o 7 dias).'
      },
      {
        subtitulo: '5. Publicar a precio fijo',
        texto: 'Selecciona "Precio fijo" y establece el precio. La publicacion tendra una vigencia de 30 dias. Puedes habilitar la opcion de "Permitir ofertas" para que los compradores puedan proponerte un precio menor.'
      },
      {
        subtitulo: '6. Modificar o cancelar una publicacion activa',
        texto: 'Si tu publicacion esta activa y aun no tiene pujas, puedes modificar el titulo, descripcion y precio, o cancelarla desde tu panel de vendedor. Una vez que recibe la primera puja, la publicacion ya no puede modificarse ni cancelarse. El credito no se reintegra en ninguno de los casos.'
      },
      {
        subtitulo: '7. Programar el inicio',
        texto: 'Puedes programar cuando se activa tu publicacion. Al final del formulario encontraras la opcion "Programar inicio". Activa el toggle y selecciona la fecha y hora. Tu publicacion aparecera como "Programada" en tu panel hasta esa fecha.'
      },
      {
        subtitulo: '8. Cuando vendes un articulo',
        texto: 'Al concluir una subasta o cuando alguien compra a precio fijo, el remate aparece como "Vendido" en tu panel. Veras los datos de contacto del comprador (nombre completo y celular) para coordinar el pago y la entrega directamente con el.'
      },
      {
        subtitulo: '9. Republicar un articulo sin ofertas',
        texto: 'Si tu publicacion concluye sin recibir ofertas, aparecera como "Sin oferta" en tu panel. Podras republicarla igual (consumiendo 1 credito adicional) o modificarla antes de republicar cambiando el titulo, descripcion o precio.'
      },
      {
        subtitulo: '10. Depuracion automatica de publicaciones',
        texto: 'Las publicaciones finalizadas se eliminan automaticamente a los 20 dias de su cierre. Recibiras una notificacion de aviso 5 dias antes. Al eliminarse una publicacion se borran tambien las pujas asociadas. Las calificaciones se conservan permanentemente.'
      },
    ]
  },
  {
    titulo: 'Preguntas frecuentes — Vendedores',
    contenido: [
      { subtitulo: '¿Cuantas fotos puedo subir?', texto: 'Puedes subir hasta 3 fotos por publicacion. Te recomendamos fotos claras y de buena calidad para atraer mas compradores.' },
      { subtitulo: '¿Puedo modificar una publicacion activa?', texto: 'Si, pero solo si la publicacion no tiene pujas. Ingresa a tu panel de vendedor, busca la publicacion activa y usa el boton "Modificar publicacion". Una vez que recibe la primera puja ya no puede modificarse.' },
      { subtitulo: '¿Puedo cancelar una publicacion activa?', texto: 'Si, pero solo si no tiene pujas. Usa el boton "Cancelar publicacion" en tu panel de vendedor. El credito utilizado no se reintegra.' },
      { subtitulo: '¿Que es el incremento minimo?', texto: 'Es la cantidad minima que debe superar cada nueva puja. Por ejemplo, si el incremento es S/ 20 y el precio actual es S/ 100, la siguiente puja debe ser al menos S/ 120.' },
      { subtitulo: '¿Que es el precio de compra directa?', texto: 'Es un precio opcional en subastas. Si un comprador paga ese precio, gana el remate de inmediato sin esperar que termine el tiempo.' },
      { subtitulo: '¿Se me devuelven los creditos si el remate no se vende?', texto: 'No. Los creditos son por publicacion, no por resultado. Una vez activada la publicacion, el credito queda consumido.' },
      { subtitulo: '¿Como recibo el pago?', texto: 'Puja.pe no procesa pagos. Coordinas el pago directamente con el comprador. Te recomendamos acordar el metodo de pago (transferencia, Yape, Plin, efectivo) antes de entregar el articulo.' },
      { subtitulo: '¿Por cuanto tiempo permanece mi publicacion?', texto: 'Las publicaciones finalizadas se eliminan automaticamente a los 20 dias de su cierre. Recibiras un aviso 5 dias antes para que puedas republicarla si lo deseas.' },
      { subtitulo: '¿Puedo vender en cualquier categoria?', texto: 'Si. Puedes publicar en Antiguedades, Coleccionables, Electronica, Filatelia, Juguetes, Numismatica, Relojes, Ropa y accesorios u Otros.' },
      { subtitulo: '¿Que pasa si el comprador no se contacta?', texto: 'Si el comprador no responde, contacta al soporte a traves de la seccion "Soporte" en el menu. Nuestro equipo te ayudara a resolver la situacion.' },
      { subtitulo: '¿Puedo tener varios remates activos a la vez?', texto: 'Si. No hay limite de publicaciones simultaneas mientras tengas creditos disponibles.' },
      { subtitulo: '¿Como comparto mis publicaciones?', texto: 'En cada articulo publicado encontraras un boton "Compartir" con opciones para WhatsApp, Facebook y copiar enlace.' },
    ]
  }
]

export default function GuiaVendedor() {
  const [abierto, setAbierto] = useState(null)

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'24px 16px' }}>

        <div style={{ background:'#185FA5', borderRadius:'16px', padding:'32px 24px', marginBottom:'28px', color:'white', textAlign:'center' }}>
          <h1 style={{ fontSize:'26px', fontWeight:'700', marginBottom:'8px' }}>Guia del Vendedor</h1>
          <p style={{ fontSize:'15px', opacity:0.9 }}>Todo lo que necesitas saber para vender en Puja.pe</p>
        </div>

        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <a href='/guia-comprador' style={{ padding:'8px 18px', borderRadius:'20px', background:'#f5f5f5', color:'#666', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Guia Comprador</a>
          <a href='/guia-vendedor' style={{ padding:'8px 18px', borderRadius:'20px', background:'#185FA5', color:'white', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Guia Vendedor</a>
        </div>

        {SECCIONES.map((seccion, si) => (
          <div key={si} style={{ marginBottom:'24px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'14px', color:'#185FA5', borderBottom:'2px solid #E6F1FB', paddingBottom:'8px' }}>{seccion.titulo}</h2>
            {seccion.contenido.map((item, ii) => {
              const key = `${si}-${ii}`
              const isOpen = abierto === key
              return (
                <div key={key} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'10px', marginBottom:'8px', overflow:'hidden' }}>
                  <button onClick={() => setAbierto(isOpen ? null : key)}
                    style={{ width:'100%', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:'12px' }}>
                    <span style={{ fontSize:'14px', fontWeight:'500', color:'#333' }}>{item.subtitulo}</span>
                    <span style={{ fontSize:'18px', color:'#185FA5', flexShrink:0 }}>{isOpen ? '−' : '+'}</span>
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

        <div style={{ background:'#E6F1FB', border:'1px solid #B5D4F4', borderRadius:'12px', padding:'24px', textAlign:'center', marginTop:'8px' }}>
          <p style={{ fontSize:'15px', color:'#185FA5', marginBottom:'12px', fontWeight:'500' }}>¿Listo para publicar tu primer remate?</p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href='/vendedor/nuevo' style={{ padding:'10px 20px', background:'#185FA5', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500' }}>Publicar ahora</a>
            <a href='/mensajes' style={{ padding:'10px 20px', background:'transparent', color:'#185FA5', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'500', border:'1px solid #185FA5' }}>Contactar soporte</a>
          </div>
        </div>
      </div>
    </main>
  )
}