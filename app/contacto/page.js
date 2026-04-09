'use client'

import { useState } from 'react'
import Navbar from '../Navbar'

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'48px 24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'500', marginBottom:'8px' }}>Contacto</h1>
        <p style={{ fontSize:'14px', color:'#666', marginBottom:'32px' }}>
          ¿Tienes alguna pregunta? Escríbenos y te responderemos a la brevedad.
          Si ya tienes cuenta, puedes usar también la sección de{' '}
          <a href='/mensajes' style={{ color:'#1D9E75' }}>Soporte</a> desde tu panel.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'32px' }}>
          {[
            ['📧 Email', 'soporte@puja.pe'],
            ['📍 Ubicación', 'Lima, Perú'],
          ].map(([titulo, valor]) => (
            <div key={titulo} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', textAlign:'center' }}>
              <p style={{ fontSize:'20px', marginBottom:'8px' }}>{titulo.split(' ')[0]}</p>
              <p style={{ fontSize:'13px', fontWeight:'500', marginBottom:'4px' }}>{titulo.slice(3)}</p>
              <p style={{ fontSize:'13px', color:'#666' }}>{valor}</p>
            </div>
          ))}
        </div>

        {enviado ? (
          <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'32px', textAlign:'center' }}>
            <p style={{ fontSize:'20px', marginBottom:'8px' }}>✅</p>
            <h2 style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px', color:'#085041' }}>¡Mensaje enviado!</h2>
            <p style={{ fontSize:'14px', color:'#0F6E56' }}>Te responderemos pronto al correo que nos indicaste.</p>
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'28px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Nombre</label>
                <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder='Tu nombre' style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder='tu@correo.com' style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Asunto</label>
              <input value={form.asunto} onChange={e => setForm({...form, asunto: e.target.value})}
                placeholder='¿En qué podemos ayudarte?' style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'5px' }}>Mensaje</label>
              <textarea value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})}
                placeholder='Escribe tu mensaje...' style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', height:'120px', resize:'vertical', boxSizing:'border-box' }} />
            </div>
            <button onClick={() => setEnviado(true)}
              style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#1D9E75', color:'white', fontSize:'15px', fontWeight:'500', cursor:'pointer' }}>
              Enviar mensaje
            </button>
          </div>
        )}
      </div>
    </main>
  )
}