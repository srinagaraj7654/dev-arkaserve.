/* ══════════════════════════════════════════════════════════════════════════
   Client for the admin access server (repo: server-for-admin-panel-).
   Enabled only when VITE_ACCESS_API_URL is set (e.g. http://localhost:4000 in a local
   .env.development). When it's NOT set, the app behaves exactly as before:
   roles come from Supabase `user_access`, and the admin panel calls the existing API directly.
   ══════════════════════════════════════════════════════════════════════════ */
import axios from 'axios'
import { supabase } from '../supabase.js'

export const ACCESS_API_URL = (import.meta.env.VITE_ACCESS_API_URL || '').replace(/\/+$/, '')
export const ACCESS_API_ENABLED = !!ACCESS_API_URL

export const accessApi = axios.create({ baseURL: ACCESS_API_URL, timeout: 120_000 })

// Send the signed-in user's Supabase access token — the server verifies it.
accessApi.interceptors.request.use(async (cfg) => {
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  } catch {}
  return cfg
})

/** { role, domains, modules } for the signed-in user, or null if the server is off/unreachable. */
export async function fetchMyAccess() {
  if (!ACCESS_API_ENABLED) return null
  try {
    const r = await accessApi.get('/api/me/access')
    return r.data
  } catch {
    return null
  }
}

/** Readable message from an access-server error. */
export const accessError = (e) => e?.response?.data?.error || e?.message || 'Something went wrong'
