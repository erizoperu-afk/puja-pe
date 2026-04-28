import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.puja.pe"),
  title: {
    default: "Puja.pe — Remates online en el Perú",
    template: "%s — Puja.pe",
  },
  description: "Puja.pe es el marketplace de remates y subastas online para el mercado peruano. Compra y vende antigüedades, coleccionables, electrónica, joyas y más. ¡Puja desde cualquier lugar del Perú!",
  keywords: ["remates online Peru", "subastas online Peru", "comprar remates Peru", "vender en remates", "marketplace Peru", "antigüedades Peru", "coleccionables Peru", "puja.pe"],
  authors: [{ name: "Puja.pe" }],
  creator: "Puja.pe",
  publisher: "Puja.pe",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Puja.pe — Remates online en el Perú",
    description: "El marketplace de remates y subastas online para el Perú. Compra antigüedades, coleccionables, electrónica y más.",
    url: "https://www.puja.pe",
    siteName: "Puja.pe",
    locale: "es_PE",
    images: [
      {
        url: "https://www.puja.pe/icon-512.png",
        width: 512,
        height: 512,
        alt: "Puja.pe — Remates online en el Perú",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puja.pe — Remates online en el Perú",
    description: "El marketplace de remates y subastas online para el Perú.",
    images: ["https://www.puja.pe/icon-512.png"],
  },
  alternates: {
    canonical: "https://www.puja.pe",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1D9E75" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Puja.pe" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Puja.pe",
          "url": "https://www.puja.pe",
          "logo": "https://www.puja.pe/icon-512.png",
          "description": "Marketplace de remates y subastas online para el Perú.",
          "address": { "@type": "PostalAddress", "addressCountry": "PE" },
          "sameAs": ["https://www.puja.pe"]
        })}} />
        {children}
        <Footer />
        <CookieBanner />
        <div id="pwa-banner" style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'#1D9E75', color:'white', padding:'14px 16px', zIndex:9999, alignItems:'center', justifyContent:'space-between', gap:'12px', boxShadow:'0 -2px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <img src="/icon-192.png" style={{ width:'36px', height:'36px', borderRadius:'8px' }} alt="Puja.pe" />
            <div>
              <div style={{ fontSize:'13px', fontWeight:'700' }}>Instala Puja.pe</div>
              <div style={{ fontSize:'11px', opacity:0.85 }}>Accede rapido desde tu celular</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
            <button id="pwa-cancel" style={{ padding:'7px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.4)', background:'transparent', color:'white', fontSize:'12px', cursor:'pointer' }}>
              Ahora no
            </button>
            <button id="pwa-install" style={{ padding:'7px 14px', borderRadius:'8px', border:'none', background:'white', color:'#1D9E75', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
              Instalar
            </button>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }

            let deferredPrompt;
            const banner = document.getElementById('pwa-banner');

            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              deferredPrompt = e;
              const dismissed = localStorage.getItem('pwa-dismissed');
              if (!dismissed) {
                banner.style.display = 'flex';
              }
            });

            document.getElementById('pwa-install').addEventListener('click', function() {
              banner.style.display = 'none';
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(result) {
                  deferredPrompt = null;
                });
              }
            });

            document.getElementById('pwa-cancel').addEventListener('click', function() {
              banner.style.display = 'none';
              localStorage.setItem('pwa-dismissed', '1');
            });

            window.addEventListener('appinstalled', function() {
              banner.style.display = 'none';
              deferredPrompt = null;
            });

            async function verificarCelular() {
              try {
                const path = window.location.pathname
                if (path.startsWith('/login') || path.startsWith('/verificar-celular-pendiente') || path.startsWith('/completar-perfil') || path.startsWith('/reset-password') || path.startsWith('/api')) return
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
                const supabase = createClient('${process.env.NEXT_PUBLIC_SUPABASE_URL}', '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}')
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return
                const { data: esAdmin } = await supabase.from('admins').select('email').eq('email', session.user.email).maybeSingle()
                if (esAdmin) return
                const { data: usuario } = await supabase.from('usuarios').select('celular_verificado').eq('id', session.user.id).single()
                if (usuario && !usuario.celular_verificado) {
                  window.location.href = '/verificar-celular-pendiente'
                }
              } catch(e) {
                console.log('Error verificar celular:', e)
              }
            }
            verificarCelular()
          `
        }} />
      </body>
    </html>
  );
}