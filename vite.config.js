import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env vars for the current mode so we can use them in this config
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const isProduction = mode === 'production'
  const isStaging = mode === 'staging'

return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 'robots.txt',
        'icon-192.svg', 'icon-512.svg',
        'icon-192.png', 'icon-512.png',
        'icon-maskable-192.png', 'icon-maskable-512.png',
        'screenshot-home.png', 'screenshot-mocktest.png',
      ],
      manifestFilename: 'manifest.json',
      manifest: {
        id: '/',
        name: 'MockTest – AI-Powered Exam Prep',
        short_name: 'MockTest',
        description: 'Ace your banking, SSC, railway and US exams with AI-generated mock tests and personalised study plans.',
        theme_color: '#FF653F',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/?source=pwa',
        scope: '/',
        lang: 'en',
        categories: ['education'],
        icons: [
          // Standard icons – browser bar, home screen, splash screen
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Maskable icons – Android adaptive icons (full-bleed, safe-zone respected)
          { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          // SVG fallbacks for desktop browsers
          { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
        screenshots: [
          {
            src: '/screenshot-home.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'MockTest home — choose your exam and start free trial',
          },
          {
            src: '/screenshot-mocktest.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Live mock test with per-section timers and AI questions',
          },
        ],
        shortcuts: [
          { name: 'Start Mock Test', short_name: 'Mock Test', url: '/?start=mock', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Topic Practice',  short_name: 'Practice',  url: '/?start=topic', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
        // Uncomment AFTER the TWA is live on Google Play Store to suppress the
        // PWA install banner in favour of the native Play Store app:
        // prefer_related_applications: true,
        // related_applications: [{
        //   platform: 'play',
        //   url: 'https://play.google.com/store/apps/details?id=com.arkaserve.prep',
        //   id: 'com.arkaserve.prep',
        // }],
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
        manualChunks(id) {
          // Each entry is a separate async chunk so the initial bundle stays small
          if (id.includes('tesseract.js') || id.includes('tesseract')) return 'ocr'
          if (id.includes('katex'))       return 'katex'
          if (id.includes('recharts'))    return 'charts'
          if (id.includes('@supabase'))   return 'supabase'
        },
      },
    },
    chunkSizeWarningLimit: 900,
    // Source maps in dev/staging for easier debugging; off in production for security
    sourcemap: !isProduction,
  },
}
})
