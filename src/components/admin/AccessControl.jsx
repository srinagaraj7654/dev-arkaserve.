/* ══════════════════════════════════════════════════════════════════════════
   Access Control — SUPER ADMIN ONLY (Admin panel → Access Control)
   Grant / change / revoke DOMAIN ADMIN access. Data lives in Supabase table
   `admin_access` and is managed by the admin access server (server-for-admin-panel-).
   Styles: reuses the License management `lm-*` classes in src/index.css.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from '../../toast.js'
import { ACCESS_API_ENABLED, accessApi, accessError } from '../../access/accessApi.js'
import { DOMAINS, domainById } from '../../access/domains.js'

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const initials = (s) => String(s || '?').split('@')[0].split(/[._-]/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

function DomainChips({ domains = [], all = false }) {
  if (all) return <span className="lm-tag is-popular">All domains</span>
  if (!domains.length) return <span className="lm-muted">—</span>
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
      {domains.map((id) => {
        const d = domainById(id)
        return <span key={id} className="lm-plan" style={{ '--c': d?.color || '#64748b' }}><span className="lm-dot"/>{d?.label || id}</span>
      })}
    </span>
  )
}

function DomainPicker({ value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  return (
    <div className="lm-chips" role="group" aria-label="Domains">
      {DOMAINS.map((d) => (
        <button key={d.id} type="button" className={`lm-chip${value.includes(d.id) ? ' is-on' : ''}`}
          aria-pressed={value.includes(d.id)} onClick={() => toggle(d.id)}>
          {value.includes(d.id) ? '✓ ' : ''}{d.label}
        </button>
      ))}
    </div>
  )
}

/* Drawer used for both "Grant access" (no admin) and "Edit domains" (existing admin) */
function AccessDrawer({ admin, onClose, onSaved }) {
  // Grant drawer has two ways: create a NEW admin account (super admin sets the password), or give access to an EXISTING account.
  const [mode, setMode] = useState('new')
  const isNew = !admin && mode === 'new'
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState(admin?.email || '')
  const [domains, setDomains] = useState(admin?.domains || [])
  const [matches, setMatches] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const firstRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => firstRef.current?.focus(), 30)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // email suggestions (grant mode only)
  useEffect(() => {
    if (admin || isNew || email.trim().length < 3) { setMatches([]); return }
    const t = setTimeout(async () => {
      try { const r = await accessApi.get('/api/access/users', { params: { q: email.trim() } }); setMatches(r.data.users || []) }
      catch { setMatches([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [email, admin, isNew])

  const save = async () => {
    setErr('')
    if (isNew && name.trim().length < 2) return setErr('Enter the admin’s name.')
    if (!admin && !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(email.trim())) return setErr('Enter a valid email address.')
    if (isNew && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) return setErr('Password must be at least 8 characters with letters and numbers.')
    if (!domains.length) return setErr('Pick at least one domain.')
    setBusy(true)
    try {
      if (admin) await accessApi.patch(`/api/access/admins/${admin.userId}`, { domains })
      else if (isNew) await accessApi.post('/api/access/admins/create', { name: name.trim(), email: email.trim(), password, domains })
      else await accessApi.post('/api/access/admins', { email: email.trim(), domains })
      toast(admin ? 'Domains updated'
        : isNew ? `Admin account created for ${email.trim()} — share the password with them securely`
        : `Access granted to ${email.trim()}`, 'success')
      onSaved()
    } catch (e) { setErr(accessError(e)) } finally { setBusy(false) }
  }

  return (
    <>
      <div className="lm-scrim" onClick={onClose}/>
      <aside className="lm-drawer" role="dialog" aria-modal="true" aria-labelledby="ac-title">
        <div className="lm-drawer-head">
          <div>
            <div className="lm-eyebrow">{admin ? 'Edit domain access' : 'Grant admin access'}</div>
            <h3 id="ac-title">{admin ? admin.email : isNew ? 'Create admin account' : 'New domain admin'}</h3>
          </div>
          <button type="button" className="lm-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="lm-drawer-body">
          {!admin && (
            <div className="lm-field">
              <span>Account</span>
              <div className="lm-seg" role="radiogroup" aria-label="Account type">
                {[['new', 'New admin account'], ['existing', 'Existing account']].map(([id, label]) => (
                  <button key={id} type="button" role="radio" aria-checked={mode === id} className={mode === id ? 'is-on' : ''}
                    onClick={() => { setMode(id); setErr('') }}>{label}</button>
                ))}
              </div>
            </div>
          )}
          {isNew && (
            <label className="lm-field">
              <span>Full name</span>
              <input ref={firstRef} className="lm-input" value={name} autoComplete="off"
                onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravi Kumar"/>
            </label>
          )}
          {!admin && (
            <label className="lm-field" style={{ position: 'relative' }}>
              <span>{isNew ? 'Email (used to sign in)' : 'User email'}</span>
              <input ref={isNew ? undefined : firstRef} className="lm-input" type="email" value={email} autoComplete="off"
                onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"/>
              <small>{isNew ? 'A new MockTest account is created with this email.' : 'The person must have signed in to MockTest at least once.'}</small>
              {!isNew && matches.length > 0 && (
                <ul className="lm-menu" style={{ top: 70, left: 0, right: 0, position: 'absolute', listStyle: 'none', margin: 0 }} role="listbox">
                  {matches.map((m) => (
                    <li key={m.id}><button type="button" onClick={() => { setEmail(m.email); setMatches([]) }}>
                      {m.email}{m.name ? ` · ${m.name}` : ''}
                    </button></li>
                  ))}
                </ul>
              )}
            </label>
          )}
          {isNew && (
            <label className="lm-field">
              <span>Password</span>
              <span style={{ display: 'flex', gap: 8 }}>
                <input className="lm-input" type={showPw ? 'text' : 'password'} value={password} autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters, letters + numbers" style={{ flex: 1 }}/>
                <button type="button" className="lm-btn is-sm" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}>{showPw ? 'Hide' : 'Show'}</button>
              </span>
              <small>Share it with the admin privately. They sign in with this email and password on the sign-in page and can change it with "Forgot password?".</small>
            </label>
          )}
          <div className="lm-field">
            <span>Domains this admin can manage</span>
            <DomainPicker value={domains} onChange={setDomains}/>
            <small>They'll only see Exam Management, Write Questions, Upload Syllabus and Review Flagged — for these domains only.</small>
          </div>
          {err && <p className="lm-error" role="alert">{err}</p>}
        </div>
        <div className="lm-drawer-foot">
          <button type="button" className="lm-btn is-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="lm-btn is-primary" disabled={busy} onClick={save}>
            {busy ? 'Saving…' : admin ? 'Save domains' : isNew ? 'Create admin' : 'Grant access'}
          </button>
        </div>
      </aside>
    </>
  )
}

function ConfirmRevoke({ admin, onClose, onDone }) {
  const [busy, setBusy] = useState(false)
  const revoke = async () => {
    setBusy(true)
    try { await accessApi.delete(`/api/access/admins/${admin.userId}`); toast(`Access revoked for ${admin.email}`, 'success'); onDone() }
    catch (e) { toast(accessError(e), 'error'); setBusy(false) }
  }
  return (
    <>
      <div className="lm-scrim is-top" onClick={onClose}/>
      <div className="lm-modal is-confirm" role="alertdialog" aria-modal="true" aria-labelledby="ac-rv-title">
        <div className="lm-modal-body">
          <h3 id="ac-rv-title">Revoke admin access?</h3>
          <p><b>{admin.email}</b> will lose access to the admin panel. Their normal MockTest account is not affected.</p>
        </div>
        <div className="lm-drawer-foot">
          <button type="button" className="lm-btn is-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="lm-btn is-danger-solid" disabled={busy} onClick={revoke}>{busy ? 'Revoking…' : 'Revoke access'}</button>
        </div>
      </div>
    </>
  )
}

export default function AccessControl() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [drawer, setDrawer] = useState(null)      // null | { admin?: row }
  const [revoking, setRevoking] = useState(null)

  const load = async () => {
    if (!ACCESS_API_ENABLED) { setLoading(false); return }
    setLoading(true); setError('')
    try { const r = await accessApi.get('/api/access/admins'); setAdmins(r.data.admins || []) }
    catch (e) { setError(accessError(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = t ? admins.filter((a) => `${a.email} ${(a.domains || []).join(' ')}`.toLowerCase().includes(t)) : admins
    return [...list].sort((a, b) => (a.role === b.role ? a.email.localeCompare(b.email) : a.role === 'super_admin' ? -1 : 1))
  }, [admins, q])
  const counts = { super: admins.filter((a) => a.role === 'super_admin').length, admin: admins.filter((a) => a.role === 'admin').length }

  return (
    <div className="lm">
      <div className="lm-head">
        <div>
          <div className="lm-badges"><span className="lm-badge is-admin">Super admin only</span></div>
        </div>
        {ACCESS_API_ENABLED && (
          <div className="lm-head-actions">
            <button type="button" className="lm-btn is-ghost" onClick={load}>↻ Refresh</button>
            <button type="button" className="lm-btn is-primary" onClick={() => setDrawer({})}>+ Grant access</button>
          </div>
        )}
      </div>

      {!ACCESS_API_ENABLED ? (
        <div className="lm-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800 }}>Admin access server not connected</h3>
          <p className="lm-sub" style={{ marginBottom: 12 }}>
            Access Control needs the <b>server-for-admin-panel-</b> Node server (runs locally for now). To enable it:
          </p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9, color: 'var(--lm-muted)' }}>
            <li>Run <code>sql/001_admin_access.sql</code> once in Supabase (creates only the <code>admin_access</code> table).</li>
            <li>In the server folder: copy <code>.env.example</code> → <code>.env</code>, fill it in, then <code>npm install</code> and <code>npm run dev</code>.</li>
            <li>In this project's local <code>.env.development</code> add <code>VITE_ACCESS_API_URL=http://localhost:4000</code> and restart <code>npm run dev</code>.</li>
          </ol>
        </div>
      ) : (<>
        <div className="lm-kpis" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
          <div className="lm-kpi is-red" style={{ cursor: 'default' }}><span className="lm-kpi-ic">★</span><span className="lm-kpi-val">{counts.super}</span><span className="lm-kpi-lbl">Super admins</span></div>
          <div className="lm-kpi is-green" style={{ cursor: 'default' }}><span className="lm-kpi-ic">⚑</span><span className="lm-kpi-val">{counts.admin}</span><span className="lm-kpi-lbl">Domain admins</span></div>
          <div className="lm-kpi" style={{ cursor: 'default' }}><span className="lm-kpi-ic">▦</span><span className="lm-kpi-val">{DOMAINS.length}</span><span className="lm-kpi-lbl">Exam domains</span></div>
        </div>

        <div className="lm-card">
          <div className="lm-toolbar">
            <label className="lm-search">
              <span aria-hidden="true">⌕</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or domain" aria-label="Search admins"/>
            </label>
          </div>
          {loading ? (
            <div className="lm-empty"><b>Loading…</b></div>
          ) : error ? (
            <div className="lm-empty"><b>Couldn't load admins</b><span>{error}</span><button type="button" className="lm-link" onClick={load}>Try again</button></div>
          ) : rows.length === 0 ? (
            <div className="lm-empty"><b>No admins yet</b><span>Use “Grant access” to add a domain admin.</span></div>
          ) : (
            <div className="lm-table-wrap" style={{ display: 'block' }}>
              <table className="lm-table">
                <thead><tr><th>Admin</th><th>Role</th><th>Domains</th><th>Granted</th><th className="lm-col-actions"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.userId || a.email}>
                      <td>
                        <div className="lm-user">
                          <span className="lm-avatar" style={{ '--c': a.role === 'super_admin' ? '#F06535' : '#475569' }}>{initials(a.email)}</span>
                          <span className="lm-user-txt"><b>{a.email}</b><span>{a.source === 'env' ? 'From server settings' : a.source === 'user_access' ? 'From user access' : 'Admin access'}</span></span>
                        </div>
                      </td>
                      <td><span className={`lm-status ${a.role === 'super_admin' ? 'is-expiring' : 'is-active'}`}>{a.role === 'super_admin' ? 'Super admin' : 'Domain admin'}</span></td>
                      <td><DomainChips domains={a.domains} all={a.role === 'super_admin'}/></td>
                      <td className="lm-nowrap">{fmt(a.grantedAt)}{a.grantedByEmail ? <div className="lm-muted" style={{ fontSize: 12 }}>by {a.grantedByEmail}</div> : null}</td>
                      <td className="lm-col-actions">
                        {a.editable ? (
                          <div className="lm-row-actions">
                            <button type="button" className="lm-btn is-sm" onClick={() => setDrawer({ admin: a })}>Edit domains</button>
                            <button type="button" className="lm-btn is-sm is-danger" onClick={() => setRevoking(a)}>Revoke</button>
                          </div>
                        ) : <span className="lm-muted" style={{ fontSize: 12 }}>Managed in database</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>)}

      {drawer && <AccessDrawer admin={drawer.admin} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load() }}/>}
      {revoking && <ConfirmRevoke admin={revoking} onClose={() => setRevoking(null)} onDone={() => { setRevoking(null); load() }}/>}
    </div>
  )
}
