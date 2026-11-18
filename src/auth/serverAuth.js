/* ══════════════════════════════════════════════════════════════════════════
   serverAuth — sign-in / session / sign-out through the Node server (server-for-admin-panel-,
   VITE_ACCESS_API_URL, /api/auth/*) instead of the browser talking to Supabase.
   It offers the SAME functions and events as `supabase.auth` that this app already uses
   (getSession, onAuthStateChange, signInWithPassword, signInWithOAuth, signOut, updateUser, …),
   so App.jsx / AuthScreen.jsx keep their flow. Used on the WEB build only, when VITE_AUTH_MODE=server
   (see src/supabase.js). The Android/iOS app keeps using supabase-js directly.
   Session in localStorage 'mt-auth-session': { session: {access_token, refresh_token, expires_at}, user }.
   ══════════════════════════════════════════════════════════════════════════ */
import axios from 'axios'
import { toast } from '../toast.js'

const KEY = 'mt-auth-session'
export const AUTH_API = (import.meta.env.VITE_ACCESS_API_URL || '').replace(/\/+$/, '')
const http = axios.create({ baseURL: AUTH_API, timeout: 30_000 })

let state = load()
const listeners = new Set()
let refreshing = null
let refreshTimer = null

function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s?.session?.access_token ? s : null } catch { return null } }
const sessionObj = () => (state ? { ...state.session, user: state.user } : null)
const errOf = (e) => ({ message: e?.response?.data?.error || e?.message || 'Something went wrong', status: e?.response?.status })
const bearer = () => ({ Authorization: `Bearer ${state?.session?.access_token || ''}` })

function emit(event) {
  const s = sessionObj()
  listeners.forEach((fn) => { try { fn(event, s) } catch {} })
}
function save(next, event) {
  state = next
  try { next ? localStorage.setItem(KEY, JSON.stringify(next)) : localStorage.removeItem(KEY) } catch {}
  scheduleRefresh()
  if (event) emit(event)
}
function scheduleRefresh() {
  clearTimeout(refreshTimer)
  const exp = Number(state?.session?.expires_at || 0) * 1000
  if (!exp || !state?.session?.refresh_token) return
  refreshTimer = setTimeout(() => { refresh().catch(() => {}) }, Math.max(5_000, exp - Date.now() - 60_000))
}

async function refresh() {
  if (!state?.session?.refresh_token) return null
  if (!refreshing) {
    refreshing = http.post('/api/auth/refresh', { refresh_token: state.session.refresh_token })
      .then(({ data }) => { save({ session: data.session, user: data.user?.id ? data.user : state?.user }, 'TOKEN_REFRESHED'); return state })
      .catch((e) => { if (e?.response?.status === 401) save(null, 'SIGNED_OUT'); throw e })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

/* ── Start-up: handle a sign-in that just came back in the URL, then refresh an old session ── */
async function init() {
  const h = window.location.hash || ''
  const params = new URLSearchParams(h.replace(/^#/, ''))
  const clearHash = () => { try { window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search) } catch {} }
  if (params.get('mt_auth')) {                                   // Google/Apple came back through the server
    clearHash()
    try { const { data } = await http.post('/api/auth/oauth/redeem', { code: params.get('mt_auth') }); save({ session: data.session, user: data.user }) }
    catch (e) { try { sessionStorage.setItem('mt-auth-error', errOf(e).message) } catch {} }
  } else if (params.get('mt_auth_error')) {
    clearHash()
    try { sessionStorage.setItem('mt-auth-error', params.get('mt_auth_error')) } catch {}
  } else if (params.get('access_token') && params.get('type') === 'recovery') {
    // "Forgot password?" link — keep the hash (App.jsx shows the reset page from it); just hold the session.
    const expires_at = Number(params.get('expires_at')) || Math.floor(Date.now() / 1000) + Number(params.get('expires_in') || 3600)
    save({ session: { access_token: params.get('access_token'), refresh_token: params.get('refresh_token') || '', expires_at }, user: null })
  }
  if (state) {
    const exp = Number(state.session.expires_at || 0) * 1000
    if (exp && exp - Date.now() < 60_000) { try { await refresh() } catch {} }
    if (state && !state.user) {                                  // e.g. recovery link: fetch the user once
      try { const { data } = await http.get('/api/auth/me', { headers: bearer() }); save({ ...state, user: data.user }) } catch {}
    }
  }
  scheduleRefresh()
  // A failed Google/Apple sign-in comes back to the site: tell the user why (after the page has mounted).
  const msg = takeAuthError()
  if (msg) setTimeout(() => toast(msg, 'error'), 1500)
}
// Start-up runs only when serverAuth is first used (never in the native app / Supabase mode).
let readyP = null
const ready = () => (readyP ||= init())

/** One-time message for the sign-in page (e.g. Google sign-in failed / expired). */
export function takeAuthError() { try { const m = sessionStorage.getItem('mt-auth-error'); sessionStorage.removeItem('mt-auth-error'); return m } catch { return null } }

/* ── supabase.auth-compatible API ─────────────────────────────────────── */
export const serverAuth = {
  async getSession() { await ready(); return { data: { session: sessionObj() }, error: null } },

  onAuthStateChange(cb) {
    listeners.add(cb)
    ready().then(() => { if (listeners.has(cb)) { try { cb('INITIAL_SESSION', sessionObj()) } catch {} } })
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
  },

  async getUser() {
    await ready()
    if (!state) return { data: { user: null }, error: { message: 'Not signed in' } }
    try { const { data } = await http.get('/api/auth/me', { headers: bearer() }); save({ ...state, user: data.user }); return { data: { user: data.user }, error: null } }
    catch (e) { return { data: { user: state.user }, error: errOf(e) } }
  },

  async signInWithPassword({ email, password }) {
    try {
      const { data } = await http.post('/api/auth/login', { email, password, app: 'student' })
      save({ session: data.session, user: data.user }, 'SIGNED_IN')
      return { data: { user: data.user, session: sessionObj() }, error: null }
    } catch (e) { return { data: { user: null, session: null }, error: errOf(e) } }
  },

  /** Web: the browser goes to the server, which talks to Supabase/Google and comes back with #mt_auth=… */
  async signInWithOAuth({ provider, options = {} }) {
    const back = options.redirectTo || window.location.origin
    const url = `${AUTH_API}/api/auth/oauth/${encodeURIComponent(provider)}/start?return=${encodeURIComponent(back)}`
    if (!options.skipBrowserRedirect) window.location.assign(url)
    return { data: { provider, url }, error: null }
  },

  async signOut(opts = {}) {
    const token = state?.session?.access_token
    save(null, 'SIGNED_OUT')
    if (token) { try { await http.post('/api/auth/logout', { scope: opts.scope === 'global' ? 'global' : 'local' }, { headers: { Authorization: `Bearer ${token}` } }) } catch {} }
    return { error: null }
  },

  async refreshSession() {
    try { await refresh(); return { data: { session: sessionObj(), user: state?.user || null }, error: state ? null : { message: 'Not signed in' } } }
    catch (e) { return { data: { session: null, user: null }, error: errOf(e) } }
  },

  /** { data } → saved on the server (allowed fields only); { password } → set on the server. */
  async updateUser(attrs = {}) {
    await ready()
    if (!state) return { data: { user: null }, error: { message: 'Not signed in' } }
    try {
      if (attrs.password) await http.post('/api/auth/password', { password: attrs.password }, { headers: bearer() })
      if (attrs.data && Object.keys(attrs.data).length) {
        const { data } = await http.patch('/api/me/metadata', attrs.data, { headers: bearer() })
        save({ ...state, user: data.user }, 'USER_UPDATED')
      }
      return { data: { user: state.user }, error: null }
    } catch (e) { return { data: { user: state?.user || null }, error: errOf(e) } }
  },

  async resetPasswordForEmail(email) {
    try { await http.post('/api/auth/forgot-password', { email, app: 'student' }); return { data: {}, error: null } }
    catch (e) { return { data: null, error: errOf(e) } }
  },

  /** Native-only flow in this app; on the web the server hands back #mt_auth (handled in init). */
  async exchangeCodeForSession(code) {
    try { const { data } = await http.post('/api/auth/oauth/redeem', { code }); save({ session: data.session, user: data.user }, 'SIGNED_IN'); return { data: { user: data.user, session: sessionObj() }, error: null } }
    catch (e) { return { data: { user: null, session: null }, error: errOf(e) } }
  },
}

/** Use the latest user object returned by the server (e.g. after an avatar upload or plan sync). */
export function setServerUser(user) { if (state && user?.id) save({ ...state, user }, 'USER_UPDATED') }
export const authHeader = bearer
