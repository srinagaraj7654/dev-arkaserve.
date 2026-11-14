import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Native (Capacitor APK) build config.
// - No VitePWA plugin → no service worker, no manifest.json injected
// - VITE_IS_NATIVE=true baked in at build time (replaces import.meta.env.VITE_IS_NATIVE)
// - index.html stripped of all SEO / Open Graph / PWA / structured-data markup
// Output still goes to dist/ so `npx cap sync android` picks it up unchanged.

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'native-html-strip',
      transformIndexHtml(html) {
        return html
          // Remove HTML comments (e.g. "<!-- Crawlable H1 -->")
          .replace(/<!--[\s\S]*?-->/g, ' ')
          // Remove PWA manifest link
          .replace(/<link\s[^>]*rel=["']manifest["'][^>]*>/gi, '')
          // Remove service-worker registration script
          .replace(/<script[^>]*registerSW[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<script[^>]*id=["']vite-plugin-pwa[^>]*>[\s\S]*?<\/script>/gi, '')
          // Remove SEO meta tags (description, keywords, robots, geo, twitter:*, apple-mobile-web-app-*)
          .replace(/<meta\s[^>]*name=["'](description|keywords|author|robots|language|geo\.[^"']*|mobile-web-app-capable|apple-mobile-web-app[^"']*|twitter:[^"']*)["'][^>]*>/gi, '')
          // Remove Open Graph (property="og:*")
          .replace(/<meta\s[^>]*property=["']og:[^"']*["'][^>]*>/gi, '')
          // Remove canonical, apple-touch-startup-image links
          .replace(/<link\s[^>]*rel=["'](canonical|apple-touch-startup-image)["'][^>]*>/gi, '')
          // Remove JSON-LD structured data
          .replace(/<script\s[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
          // Remove the hidden crawlable H1
          .replace(/<h1\s[^>]*>[\s\S]*?<\/h1>/gi, '')
          // Clean up the title
          .replace(/<title>[^<]*<\/title>/i, '<title>MockTest</title>')
          // Dark status-bar theme for native
          .replace(/content="#FF653F"/i, 'content="#0f172a"')
      },
    },
  ],

  // Force VITE_IS_NATIVE=true at build time — overrides any env var value
  define: {
    'import.meta.env.VITE_IS_NATIVE': JSON.stringify('true'),
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('tesseract.js') || id.includes('tesseract')) return 'ocr'
          if (id.includes('katex'))       return 'katex'
          if (id.includes('recharts'))    return 'charts'
          if (id.includes('@supabase'))   return 'supabase'
        },
      },
    },
  },
})
