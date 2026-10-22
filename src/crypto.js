/**
 * crypto.js — Client-side password security utilities.
 *
 * WHY pre-hash?
 *   Supabase already bcrypt-hashes passwords server-side, but the raw password
 *   still travels over HTTPS. Pre-hashing with SHA-256 means the raw password
 *   never leaves the browser — only the hash is sent. Supabase then bcrypt-hashes
 *   the hash (double-hashing), so the original password is never stored anywhere.
 *
 * ⚠  APP_SALT must NEVER change after first deploy.
 *    Changing it would produce different hashes and lock all users out.
 */

const APP_SALT = 'mocktest-arkaserve-v1'

/**
 * Derives a SHA-256 hash of the password combined with a fixed app salt.
 * Uses the native Web Crypto API — no external libraries.
 * Returns a 64-character lowercase hex string.
 */
export async function hashPassword(password) {
  const input = `${password}||${APP_SALT}`
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── Password strength ─────────────────────────────────────────────────────────

/**
 * Returns a strength score (0–4) with label and color for password UI feedback.
 * Rules: length ≥8, length ≥12, has uppercase, has digit, has symbol.
 */
export function passwordStrength(password) {
  if (!password) return { score: 0, label: '', color: '#e5e7eb', bars: 0 }
  let score = 0
  if (password.length >= 8)          score++
  if (password.length >= 12)         score++
  if (/[A-Z]/.test(password))        score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  score = Math.min(score, 4)
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
  return { score, label: labels[score], color: colors[score], bars: score }
}

/**
 * Validates password requirements for registration.
 * Returns an error string or null if valid.
 */
export function validatePassword(password) {
  if (!password || password.length < 8)
    return 'Password must be at least 8 characters.'
  if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password))
    return 'Password must include at least one number or special character.'
  return null
}

// ── Login rate limiting ───────────────────────────────────────────────────────

const RATE_KEY    = 'mt_login_rl'
const MAX_TRIES   = 5
const WINDOW_MS   = 15 * 60 * 1000   // 15 minutes

/** Returns { blocked, attempts, secondsLeft } */
export function getRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_KEY)
    if (!raw) return { blocked: false, attempts: 0, secondsLeft: 0 }
    const { count, since } = JSON.parse(raw)
    const elapsed = Date.now() - since
    if (elapsed > WINDOW_MS) {
      localStorage.removeItem(RATE_KEY)
      return { blocked: false, attempts: 0, secondsLeft: 0 }
    }
    const blocked = count >= MAX_TRIES
    return {
      blocked,
      attempts: count,
      secondsLeft: blocked ? Math.ceil((WINDOW_MS - elapsed) / 1000) : 0,
    }
  } catch {
    return { blocked: false, attempts: 0, secondsLeft: 0 }
  }
}

/** Record one failed login attempt. */
export function recordFailedAttempt() {
  try {
    const raw = localStorage.getItem(RATE_KEY)
    if (!raw) {
      localStorage.setItem(RATE_KEY, JSON.stringify({ count: 1, since: Date.now() }))
      return
    }
    const state = JSON.parse(raw)
    if (Date.now() - state.since > WINDOW_MS) {
      localStorage.setItem(RATE_KEY, JSON.stringify({ count: 1, since: Date.now() }))
    } else {
      localStorage.setItem(RATE_KEY, JSON.stringify({ ...state, count: state.count + 1 }))
    }
  } catch {}
}

/** Clear rate-limit counter after successful login. */
export function clearRateLimit() {
  try { localStorage.removeItem(RATE_KEY) } catch {}
}

/** Format secondsLeft as "Xm Ys" */
export function formatLockout(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
