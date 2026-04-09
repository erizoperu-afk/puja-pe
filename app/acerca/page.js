import Navbar from '../Navbar'

export default function Acerca() {
  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'48px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <h1 style={{ fontSize:'32px', fontWeight:'500', marginBottom:'16px' }}>
            puja<span style={{ color:'#1D9E75' }}>.pe</span>
          </h1>
          <p style={{ fontSize:'18px', color:'#555', lineHeight:'1.8', maxWidth:'600px', margin:'0 auto' }}>
            El marketplace de remates online para el mercado peruano. Compra y vende artículos únicos, coleccionables y mucho más.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'48px' }}>
          {[
            ['🎯 Nuestra misión', 'Democratizar el acceso a remates y subastas en el Perú, conectando compradores y vendedores de manera transparente y segura.'],
            ['👁 Nuestra visión', 'Ser la plataforma líder de remates online en Latinoamérica, reconocida por su confiabilidad y variedad de productos.'],
            ['💎 Nuestros valores', 'Transparencia, confianza y comunidad son los pilares de Puja.pe. Cada transacción es una oportunidad de conectar personas.'],
            ['🚀 Nuestra historia', 'Nacimos en 2026 con la idea de crear un espacio donde los peruanos puedan rematar y comprar artículos de forma simple y segura.'],
          ].map(([titulo, contenido]) => (
            <div key={titulo} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'24px' }}>
              <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'10px' }}>{titulo}</h2>
              <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.7' }}>{contenido}</p>
            </div>
          ))}
        </div>

        <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:'12px', padding:'32px', textAlign:'center' }}>
          <h2 style={{ fontSize:'20px', fontWeight:'500', marginBottom:'12px', color:'#085041' }}>¿Quieres unirte a Puja.pe?</h2>
          <p style={{ fontSize:'14px', color:'#0F6E56', marginBottom:'20px' }}>Regístrate gratis y empieza a comprar o vender hoy mismo.</p>
          <a href='/login' style={{ padding:'12px 32px', background:'#1D9E75', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'15px', fontWeight:'500' }}>
            Crear cuenta gratis
          </a>
        </div>
      </div>
    </main>
  )
}