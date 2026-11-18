import { createClient } from '@supabase/supabase-js'
import { serverAuth } from './auth/serverAuth.js'

/*
 * Auth / data mode
 *   SERVER_MODE (web build + VITE_AUTH_MODE=server + VITE_ACCESS_API_URL set):
 *     sign-in, sessions and all user data go through the Node server (server-for-admin-panel-).
 *     `supabase.auth` is the server-backed drop-in (src/auth/serverAuth.js); direct table access is off
 *     (src/data/userData.js calls the server instead).
 *   Otherwise (default, and ALWAYS in the Android/iOS app): supabase-js exactly as before.
 * The question/answer API (src/api.js) is not affected by either mode.
 */
export const IS_NATIVE_BUILD = import.meta.env.VITE_IS_NATIVE === 'true'
export const SERVER_MODE = !IS_NATIVE_BUILD && import.meta.env.VITE_AUTH_MODE === 'server' && !!import.meta.env.VITE_ACCESS_API_URL

function directClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars. Check your .env file.')
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { flowType: 'pkce' },
  })
}

const blocked = (what) => () => { throw new Error(`Direct Supabase ${what} is disabled (VITE_AUTH_MODE=server) — use src/data/userData.js`) }

export const supabase = SERVER_MODE
  ? { auth: serverAuth, from: blocked('table access'), storage: { from: blocked('storage access') }, rpc: blocked('rpc') }
  : directClient()
