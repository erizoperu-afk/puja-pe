<script dangerouslySetInnerHTML={{
  __html: `
    async function verificarCelular() {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
      const supabase = createClient('${process.env.NEXT_PUBLIC_SUPABASE_URL}', '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const path = window.location.pathname
      if (path.startsWith('/login') || path.startsWith('/verificar-celular-pendiente') || path.startsWith('/completar-perfil') || path.startsWith('/reset-password') || path.startsWith('/api')) return
      const { data: usuario } = await supabase.from('usuarios').select('celular_verificado').eq('id', session.user.id).single()
      if (usuario && !usuario.celular_verificado) {
        window.location.href = '/verificar-celular-pendiente'
      }
    }
    verificarCelular()
  `
}} />