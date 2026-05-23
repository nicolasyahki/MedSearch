import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Configuration de Vite pour le projet MedSearch
export default defineConfig({
  // Chemins relatifs requis pour le WebView Capacitor (APK Android)
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  preview: {
    host: true,
    port: 4174,
    strictPort: false,
    allowedHosts: true,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'inline', // Injecte l'inscription directement dans le HTML généré
      manifest: {
        name: 'MedSearch',
        short_name: 'MS',
        description: 'Application de recherche médicale et d\'aide au pré-diagnostic hors-ligne.',
        theme_color: '#1D9E75',
        background_color: '#0D1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        // SW en dev = cache de vieux chunks Vite → double React → écran noir sur localhost
        enabled: false,
        type: 'module',
      },
    })
  ],
})

