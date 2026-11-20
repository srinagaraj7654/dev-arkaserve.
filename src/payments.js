// payments.js — subscription checkout: Stripe (default) or Cashfree (VITE_PAYMENT_PROVIDER=cashfree, web only).
import { supabase, SERVER_MODE } from './supabase.js'
import { syncPlanOnServer } from './data/userData.js'
import { setServerUser } from './auth/serverAuth.js'
import { createCheckout, confirmCheckout } from './api.js'

/* ── Cashfree (through the Node server; price decided by the server) ──────────────────────────────
   Off unless VITE_PAYMENT_PROVIDER=cashfree on the WEB build (the Android/iOS app keeps Stripe).
   If Cashfree can't START a payment (server down/not configured, Cashfree error, SDK won't load),
   checkout falls back to Stripe below — the student can always pay. */
export const PAYMENT_PROVIDER = import.meta.env.VITE_IS_NATIVE !== 'true' && import.meta.env.VITE_PAYMENT_PROVIDER === 'cashfree' ? 'cashfree' : 'stripe'
const PAY_API = (import.meta.env.VITE_ACCESS_API_URL || '').replace(/\/+$/, '')
const CASHFREE_SDK = 'https://sdk.cashfree.com/js/v3/cashfree.js'

class NoFallback extends Error {}            // the student must fix something (sign in / plan) — don't switch to Stripe

async function payApi(path, body) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return fetch(PAY_API + path, {
    method: 'POST', signal: AbortSignal.timeout(20_000),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
}

function loadCashfreeSdk() {
  if (window.Cashfree) return Promise.resolve(window.Cashfree)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = CASHFREE_SDK; s.async = true
    const t = setTimeout(() => reject(new Error('Cashfree SDK timed out')), 10_000)
    s.onload = () => { clearTimeout(t); window.Cashfree ? resolve(window.Cashfree) : reject(new Error('Cashfree SDK missing')) }
    s.onerror = () => { clearTimeout(t); reject(new Error('Cashfree SDK failed to load')) }
    document.head.appendChild(s)
  })
}

async function startCashfree(planId) {
  const res = await payApi('/api/payments/cashfree/order', { plan: planId })
  if ([400, 401, 403].includes(res.status)) {
    const j = await res.json().catch(() => ({}))
    throw new NoFallback(res.status === 401 ? 'Please log in to subscribe.' : (j.error || 'Could not start checkout.'))
  }
  if (!res.ok) throw new Error(`payment server answered ${res.status}`)
  const { payment_session_id, mode } = await res.json()
  if (!payment_session_id) throw new Error('no payment session')
  const Cashfree = await loadCashfreeSdk()
  const result = await Cashfree({ mode: mode === 'production' ? 'production' : 'sandbox' })
    .checkout({ paymentSessionId: payment_session_id, redirectTarget: '_self' })   // leaves the site on success
  if (result?.error) throw new Error(result.error.message || 'Cashfree checkout error')
}

/**
 * startCheckout — Cashfree (when enabled, with Stripe fallback) or Stripe.
 * Stripe: creates a Checkout Session on the backend and redirects to Stripe's hosted page.
 * On success Stripe redirects back to `/?sub=success&plan=...&session_id=...`,
 * which is handled by handleCheckoutReturn() on load.
 */
export async function startCheckout({ user, plan }) {
  if (!user?.id) throw new Error('Please log in to subscribe.')
  const planId = (plan || '').toLowerCase()
  if (PAYMENT_PROVIDER === 'cashfree' && PAY_API) {
    try { await startCashfree(planId); return }
    catch (e) {
      if (e instanceof NoFallback) throw e
      console.warn('[payments] Cashfree unavailable — falling back to Stripe:', e?.message)
    }
  }
  const { url } = await createCheckout(user.id, planId)
  if (!url) throw new Error('Could not start checkout.')
  window.location.href = url   // leave the SPA → Stripe hosted checkout
}

/**
 * handleCheckoutReturn — call once on app load. If the URL carries a completed
 * Stripe session, verify it server-side, refresh the session so the new plan
 * applies app-wide, and clean the URL. Returns { ok, plan } or null.
 */
export async function handleCheckoutReturn(user) {
  const params = new URLSearchParams(window.location.search)
  const sub = params.get('sub')
  if (!sub) return null

  // Always strip the query params so a refresh/Back doesn't re-trigger.
  const clean = () => {
    try { window.history.replaceState(window.history.state, '', window.location.pathname) } catch {}
  }

  if (sub === 'cancel') { clean(); return { ok: false, cancelled: true } }

  // Back from Cashfree: the server asks Cashfree whether the order is PAID and activates the plan.
  if (sub === 'cf') {
    const orderId = params.get('order_id')
    clean()
    if (!orderId) return null
    try {
      const res = await payApi('/api/payments/cashfree/verify', { order_id: orderId })
      const j = await res.json().catch(() => ({}))
      if (res.ok && j.ok) {
        if (SERVER_MODE) setServerUser(j.user)
        else { try { await supabase.auth.refreshSession() } catch {} }
        return { ok: true, plan: j.plan }
      }
      if (res.ok && j.failed) return { ok: false, cancelled: true }        // not paid / expired — nothing charged
      return { ok: false, pending: true }
    } catch {
      return { ok: false, pending: true }      // the Cashfree webhook still activates the plan on the server
    }
  }

  const sessionId = params.get('session_id')
  const plan = (params.get('plan') || '').toLowerCase()
  if (sub !== 'success' || !sessionId || !user?.id) { clean(); return null }

  try {
    // 1) Server-side validation: backend retrieves the Stripe session and
    //    confirms payment_status === 'paid' before returning success.
    const res = await confirmCheckout(user.id, plan, sessionId)
    // 2) Activate using the user's OWN session (no backend service-role key
    //    required). The backend + webhook also record it authoritatively.
    try {
      if (SERVER_MODE) await syncPlanOnServer()            // server reads the confirmed subscription (browser can't set plan)
      else await supabase.auth.updateUser({ data: {
        plan,
        subscription: plan,
        plan_expires: res?.period_end || null,
      }})
    } catch {}
    try { await supabase.auth.refreshSession() } catch {}
    clean()
    return { ok: true, plan: res?.plan || plan }
  } catch (e) {
    // The payment may well have succeeded — the backend webhook activates plans
    // independently. Refresh the session (it may already be Pro) and, if so,
    // treat it as success; otherwise report a soft "activating" state rather
    // than a scary server error.
    let activated = false
    try {
      const { data } = SERVER_MODE ? { data: { user: await syncPlanOnServer() } } : await supabase.auth.refreshSession()
      const p = (data?.user?.user_metadata?.plan || '').toLowerCase()
      activated = !!p && !['free', '', 'none'].includes(p)
    } catch {}
    clean()
    if (activated) return { ok: true, plan }
    return { ok: false, pending: true }
  }
}
