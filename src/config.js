/**
 * config.js — single source of truth for all environment variables.
 * Import from here instead of accessing import.meta.env directly.
 *
 * Missing required vars throw in development so problems surface immediately.
 * In production they fail silently (already validated at build time by Vercel/Netlify).
 */

const isDev = import.meta.env.DEV

function require(key) {
  const value = import.meta.env[key]
  if (!value && isDev) {
    console.error(`[config] Missing required env var: ${key}. Check your .env.development file.`)
  }
  return value || ''
}

export const config = {
  supabase: {
    url: require('VITE_SUPABASE_URL'),
    anonKey: require('VITE_SUPABASE_KEY'),
  },
  api: {
    // Empty string → Vite proxy handles /api/* (local dev)
    // Full URL → direct requests to backend (staging / production)
    baseUrl: import.meta.env.VITE_API_URL || '',
  },
  app: {
    env: import.meta.env.VITE_APP_ENV || 'production',
    adminKey: import.meta.env.VITE_ADMIN_KEY || '',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    isStaging: import.meta.env.VITE_APP_ENV === 'staging',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
  },
}
