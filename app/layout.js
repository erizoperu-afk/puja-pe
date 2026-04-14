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
  title: "Puja.pe — Remates online en el Perú",
  description: "El marketplace de remates online para el mercado peruano. Compra y vende artículos únicos, coleccionables y mucho más.",
  manifest: "/manifest.json",
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
          `
        }} />
      </body>
    </html>
  );
}