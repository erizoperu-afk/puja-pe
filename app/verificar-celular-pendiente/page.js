'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function VerificarCelularPendiente() {
  const [verificado, setVerificado] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUserId(user.id)

      // Si ya fue verificado, redirigir
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('celular_verificado')
        .eq('id', user.id)
        .single()
      if (usuario?.celular_verificado) {
        window.location.href = '/'
        return
      }

      // Escuchar en tiempo real cuando el admin apruebe
      const canal = supabase
        .channel('verificacion-' + user.id)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.celular_verificado) {
            setVerificado(true)
            setTimeout(() => { window.location.href = '/' }, 3000)
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(canal) }
    }
    init()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f9f9f9', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'16px', padding:'40px 32px', width:'100%', maxWidth:'440px', textAlign:'center' }}>

        {verificado ? (
          <>
            <div style={{ fontSize:'56px', marginBottom:'20px' }}>🎉</div>
            <h2 style={{ fontSize:'22px', fontWeight:'700', color:'#085041', marginBottom:'12px' }}>
              ¡GRACIAS POR LA ESPERA!
            </h2>
            <p style={{ fontSize:'16px', color:'#1D9E75', fontWeight:'500', marginBottom:'8px' }}>
              SU CUENTA HA SIDO VERIFICADA
            </p>
            <p style={{ fontSize:'13px', color:'#999' }}>
              Redirigiendo a la plataforma...
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize:'56px', marginBottom:'20px' }}>⏳</div>
            <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#333', marginBottom:'16px', lineHeight:'1.4' }}>
              EN BREVE PODRÁS ACCEDER A LA MEJOR PLATAFORMA DE REMATES
            </h2>
            <p style={{ fontSize:'14px', color:'#666', marginBottom:'24px' }}>
              ESPERA UNOS MINUTOS — nuestro equipo está verificando tu cuenta.
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginBottom:'32px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:'10px', height:'10px', borderRadius:'50%', background:'#1D9E75',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
            <button onClick={cerrarSesion}
              style={{ padding:'8px 20px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#999' }}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
