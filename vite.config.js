import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.svg', 'icon-512.svg', 'robots.txt'],
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'MockTest – AI-Powered Exam Prep',
        short_name: 'MockTest',
        description: 'Ace your banking, insurance, and SSC exams with AI-generated mock tests.',
        theme_color: '#FF653F',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
        shortcuts: [
          { name: 'Start Mock Test', short_name: 'Mock Test', url: '/?start=mock', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
          { name: 'Topic Practice',  short_name: 'Practice',  url: '/?start=topic', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // Cache-first for all static assets (JS/CSS/fonts/images)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            // Network-first for backend API — always want fresh questions
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10, expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
          },
          {
            // Navigation requests: network-first, fall back to offline.html only when truly offline
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'navigation-cache',
              networkTimeoutSeconds: 10,
              plugins: [{
                handlerDidError: async () => caches.match('/offline.html'),
              }],
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // Split heavy vendors into separate chunks so the initial JS is smaller and
    // big libraries (charts) cache independently across deploys.
    rollupOptions: {
      output: {
        manualChunks: {
          charts:   ['recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
