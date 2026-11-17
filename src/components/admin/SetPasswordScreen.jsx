/* ══════════════════════════════════════════════════════════════════════════
   Set your password — shown (full screen, instead of any page) to an admin whose
   account was created by the super admin with a TEMPORARY password
   (Supabase app_metadata.must_change_password = true, set by the admin access server).
   The new password is saved by the server (POST /api/me/password), which also clears
   the flag; the admin access server blocks all admin endpoints until then.
   Styles: reuses the `lm-*` classes in src/index.css.
   ══════════════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { supabase } from '../../supabase.js'
import { accessApi, accessError } from '../../access/accessApi.js'

export default function SetPasswordScreen({ user, onDone, onLogout }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return setErr('Use at least 8 characters with letters and numbers.')
    if (pw !== pw2) return setErr('The two passwords don’t match.')
    setBusy(true)
    try {
      await accessApi.post('/api/me/password', { password: pw })
      // Saved. Don't WAIT for the session refresh — it could hang and leave this screen stuck on "Saving…".
      // The admin server is the source of truth for the flag; refresh the token in the background only.
      supabase.auth.refreshSession().catch(() => {})
      onDone()
    } catch (e2) {
      setErr(accessError(e2))
      setBusy(false)
    }
  }

  return (
    <div className="lm" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg, #f8fafc)' }}>
      <form onSubmit={submit} className="lm-card" style={{ width: '100%', maxWidth: 420, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="lm-eyebrow">Admin account</div>
          <h2 className="lm-title" style={{ margin: '4px 0 6px' }}>Set your password</h2>
          <p className="lm-sub" style={{ margin: 0 }}>
            You signed in as <b>{user?.email}</b> with a temporary password from your super admin.
            Choose your own permanent password to continue.
          </p>
        </div>
        <label className="lm-field">
          <span>New password</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <input className="lm-input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password" placeholder="At least 8 characters, letters + numbers" style={{ flex: 1 }} autoFocus/>
            <button type="button" className="lm-btn is-sm" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        <label className="lm-field">
          <span>Confirm new password</span>
          <input className="lm-input" type={show ? 'text' : 'password'} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password"/>
        </label>
        {err && <p className="lm-error" role="alert" style={{ margin: 0 }}>{err}</p>}
        <button type="submit" className="lm-btn is-primary" disabled={busy}>{busy ? 'Saving…' : 'Save password & continue'}</button>
        <button type="button" className="lm-link" onClick={onLogout} style={{ alignSelf: 'center' }}>Sign out</button>
      </form>
    </div>
  )
}
