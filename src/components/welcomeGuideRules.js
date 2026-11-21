// When to show the first-time welcome guide (WelcomeGuide.jsx). Pure — tested on its own.
// Web only (the Android/iOS app has its own OnboardingWizard), new accounts only (created in the last
// 7 days = free-trial period, so existing users aren't interrupted), and only until it has been completed.
export const WELCOME_NEW_ACCOUNT_DAYS = 7

export function shouldShowWelcome(user, { isNative = false, now = Date.now() } = {}) {
  if (isNative || !user?.id) return false
  if (user.user_metadata?.welcome_guide_done) return false
  const created = Date.parse(user.created_at || '')
  if (!Number.isFinite(created)) return false
  return now - created <= WELCOME_NEW_ACCOUNT_DAYS * 86_400_000
}

/** Phone → the 10 local digits (drops +91 / leading 0 / spaces) — same rule as Edit Profile. */
export function phoneDigits(p) {
  let d = String(p || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return d.slice(0, 10)
}
export const isValidIndianMobile = (digits) => /^[6-9]\d{9}$/.test(digits)
export const formatPhone = (digits) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
