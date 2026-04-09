export default function Footer() {
  return (
    <footer style={{ background:'#fff', borderTop:'1px solid #eee', padding:'32px 24px', marginTop:'48px', fontFamily:'sans-serif' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'24px', marginBottom:'24px' }}>
          <div>
            <p style={{ fontSize:'18px', fontWeight:'500', marginBottom:'12px' }}>
              puja<span style={{ color:'#1D9E75' }}>.pe</span>
            </p>
            <p style={{ fontSize:'13px', color:'#666', lineHeight:'1.6' }}>El marketplace de remates online para el mercado peruano.</p>
          </div>
          <div>
            <p style={{ fontSize:'13px', fontWeight:'500', marginBottom:'12px', color:'#333' }}>Plataforma</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <a href='/acerca' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Acerca de</a>
              <a href='/ayuda' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Centro de ayuda</a>
              <a href='/contacto' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Contacto</a>
            </div>
          </div>
          <div>
            <p style={{ fontSize:'13px', fontWeight:'500', marginBottom:'12px', color:'#333' }}>Legal</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <a href='/privacidad' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Política de privacidad</a>
              <a href='/terminos' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Términos y condiciones</a>
            </div>
          </div>
          <div>
            <p style={{ fontSize:'13px', fontWeight:'500', marginBottom:'12px', color:'#333' }}>Mi cuenta</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <a href='/comprador' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Panel comprador</a>
              <a href='/vendedor' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Panel vendedor</a>
              <a href='/mensajes' style={{ fontSize:'13px', color:'#666', textDecoration:'none' }}>Soporte</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop:'1px solid #eee', paddingTop:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'#999' }}>© 2026 Puja.pe — Todos los derechos reservados</p>
          <p style={{ fontSize:'12px', color:'#999' }}>Hecho con ❤️ en Lima, Perú</p>
        </div>
      </div>
    </footer>
  )
}