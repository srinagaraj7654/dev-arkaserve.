/* ══════════════════════════════════════════════════════════════════════════
   License & User Management — FRONT-END PREVIEW (hardcoded sample data)
   Rendered in Dashboard → Settings → "License management" for super admins
   (and the preview account listed in Dashboard.jsx LICENSE_PREVIEW_EMAILS).
   • No backend calls. State lives in this component and is saved to
     localStorage['mt-dev-license-mock'] so edits survive a refresh.
   • "Reset demo data" restores the hardcoded set from licenseMockData.js.
   Styles: "UI: License management" block in src/index.css (lm-* classes).
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { toast } from '../../toast.js'
import { LICENSE_PLANS, MOCK_USERS, PLAN_COLORS, isoFromToday } from './licenseMockData.js'
// LIVE mode: when the admin access server is configured (VITE_ACCESS_API_URL), the Subscribers list
// comes from Supabase via GET /api/subscriptions and changes go through PATCH /api/subscriptions/:id.
// Without it, this screen stays the sample-data preview below.
import { ACCESS_API_ENABLED, accessApi, accessError } from '../../access/accessApi.js'
const LIVE = ACCESS_API_ENABLED

/* ── date helpers (all dates are yyyy-mm-dd, local time) ── */
const parse = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1) }
const toISO = (d) => { const p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` }
const addDays = (iso, n) => { const d = parse(iso); d.setDate(d.getDate() + Number(n || 0)); return toISO(d) }
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000)
const fmt = (iso) => iso ? parse(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const today = () => isoFromToday(0)

export function statusOf(u) {
  if (u.status === 'suspended') return 'suspended'
  const left = diffDays(today(), u.expiryDate)
  if (left < 0) return 'expired'
  if (left <= 7) return 'expiring'
  return 'active'
}
const daysLeft = (u) => Math.max(0, diffDays(today(), u.expiryDate))
const totalDays = (u) => Math.max(1, diffDays(u.startDate, u.expiryDate))
const STATUS_LABEL = { active: 'Active', expiring: 'Expiring soon', expired: 'Expired', suspended: 'Suspended' }
const initials = (n) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
const relTime = (iso) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 45) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/* server row → the user shape this screen uses (dates as local yyyy-mm-dd) */
const dayOf = (ts) => (ts ? toISO(new Date(ts)) : '')
const fromLive = (r) => ({
  id: r.id, name: r.name || r.email, email: r.email, phone: r.phone || '', role: 'student', notes: '',
  plan: r.plan, status: r.status, source: r.source,
  startDate: dayOf(r.startAt) || today(), expiryDate: dayOf(r.endAt) || today(), lastActive: dayOf(r.lastActive),
})

/* ── state ── */
const STORE_KEY = 'mt-dev-license-mock'
const freshState = () => ({ users: MOCK_USERS, plans: LICENSE_PLANS, log: [] })
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && Array.isArray(s.users) && Array.isArray(s.plans)) {
        // fill fields added later (desc, popular, builtIn) from the defaults so older saved data still works
        const plans = s.plans.map((p) => ({ desc: '', popular: false, features: [], ...(LICENSE_PLANS.find((b) => b.id === p.id) || {}), ...p }))
        return { log: [], ...s, plans }
      }
    }
  } catch {}
  return freshState()
}

function reducer(state, a) {
  const planName = (id) => state.plans.find((p) => p.id === id)?.name || id
  const names = (ids) => {
    const list = state.users.filter((u) => ids.includes(u.id)).map((u) => u.name)
    return list.length > 2 ? `${list.length} users` : list.join(' & ')
  }
  const withLog = (next, text) => ({
    ...next,
    log: [{ id: `${Date.now()}-${Math.random()}`, text, at: new Date().toISOString() }, ...state.log].slice(0, 200),
  })
  const mapUsers = (ids, fn) => state.users.map((u) => (ids.includes(u.id) ? fn(u) : u))

  switch (a.type) {
    case 'update':
      return withLog({ ...state, users: mapUsers([a.user.id], () => a.user) }, a.logText || `Updated ${a.user.name}`)
    // (No add/delete user actions: this screen only manages existing subscribers' subscriptions.)
    case 'extend':
      return withLog({
        ...state,
        users: mapUsers(a.ids, (u) => {
          const base = statusOf(u) === 'expired' ? today() : u.expiryDate     // expired → extend from today
          return { ...u, expiryDate: addDays(base, a.days), startDate: statusOf(u) === 'expired' ? today() : u.startDate }
        }),
      }, `Extended ${names(a.ids)} by ${a.days} days`)
    case 'plan': {
      const plan = state.plans.find((p) => p.id === a.planId)
      return withLog({
        ...state,
        users: mapUsers(a.ids, (u) => ({ ...u, plan: a.planId, startDate: today(), expiryDate: addDays(today(), plan?.days || 30), status: 'active' })),
      }, `Changed plan of ${names(a.ids)} → ${planName(a.planId)} (${plan?.days || 30} days)`)
    }
    case 'status':
      return withLog({ ...state, users: mapUsers(a.ids, (u) => ({ ...u, status: a.status })) },
        `${a.status === 'suspended' ? 'Suspended' : 'Reactivated'} ${names(a.ids)}`)
    case 'trial': {
      const t = state.plans.find((p) => p.id === 'trial')?.days || 7
      return withLog({
        ...state,
        users: mapUsers(a.ids, (u) => ({ ...u, plan: 'trial', startDate: today(), expiryDate: addDays(today(), t), status: 'active' })),
      }, `Reset ${names(a.ids)} to a ${t}-day free trial`)
    }
    case 'plan_update':   // only one plan can carry the "Most popular" badge
      return withLog({
        ...state,
        plans: state.plans.map((p) => (p.id === a.plan.id ? a.plan : (a.plan.popular ? { ...p, popular: false } : p))),
      }, a.logText)
    case 'plan_add':
      return withLog({
        ...state,
        plans: [...state.plans.map((p) => (a.plan.popular ? { ...p, popular: false } : p)), a.plan],
      }, `Added plan "${a.plan.name}" · ₹${a.plan.price} · ${a.plan.days} days`)
    case 'plan_delete':
      return withLog({ ...state, plans: state.plans.filter((p) => p.id !== a.id) }, `Deleted plan "${planName(a.id)}"`)
    case 'reset':
      return withLog(freshState(), 'Reset all demo data to the original sample set')
    default:
      return state
  }
}

/* ── tiny icons ── */
const I = ({ d, s = 16, sw = 2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const IcUsers = (p) => <I {...p} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>}/>
const IcCheck = (p) => <I {...p} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10.01-3-3"/></>}/>
const IcClock = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>}/>
const IcBan = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></>}/>
const IcSearch = (p) => <I {...p} d={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>}/>
const IcPlus = (p) => <I {...p} d={<path d="M12 5v14M5 12h14"/>}/>
const IcDownload = (p) => <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>}/>
const IcReset = (p) => <I {...p} d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>}/>
const IcDots = (p) => <I {...p} d={<><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>}/>
const IcEdit = (p) => <I {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>}/>
const IcX = (p) => <I {...p} d={<path d="M18 6 6 18M6 6l12 12"/>}/>
const IcInfo = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>}/>
const IcLog = (p) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>}/>

/* ── shared dialog behaviour: Esc closes, focus first field, restore focus on close ── */
function useDialog(open, onClose, firstRef) {
  const prevFocus = useRef(null)
  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement
    const t = setTimeout(() => firstRef?.current?.focus(), 30)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      try { prevFocus.current?.focus?.() } catch {}
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
}

function PlanBadge({ plan }) {
  if (!plan) return <span className="lm-plan">—</span>
  return <span className="lm-plan" style={{ '--c': plan.color }}><span className="lm-dot"/>{plan.name}</span>
}
function StatusPill({ status }) {
  return <span className={`lm-status is-${status}`}>{STATUS_LABEL[status]}</span>
}
function DaysLeft({ u }) {
  const st = statusOf(u)
  const left = daysLeft(u)
  const pct = Math.min(100, Math.max(0, Math.round((left / totalDays(u)) * 100)))
  return (
    <div className="lm-days">
      <div className="lm-days-num">{st === 'expired' ? <span className="lm-muted">0 days</span> : <><b>{left}</b> day{left === 1 ? '' : 's'}</>}</div>
      <div className="lm-bar"><span className={`is-${st}`} style={{ width: `${st === 'expired' ? 0 : pct}%` }}/></div>
    </div>
  )
}

/* ══════════════ MAIN ══════════════ */
export default function LicenseManager({ isSuperAdmin = false }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)) } catch {} }, [state])

  const [tab, setTab] = useState('users')
  const [q, setQ] = useState('')
  const [planF, setPlanF] = useState('all')
  const [statusF, setStatusF] = useState('all')
  const [sort, setSort] = useState('expiry')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [menuFor, setMenuFor] = useState(null)
  const [editId, setEditId] = useState(null)
  const [confirm, setConfirm] = useState(null)   // { title, body, label, danger, run }
  const [bulkDays, setBulkDays] = useState(30)
  const [bulkPlan, setBulkPlan] = useState('pro')
  const PER_PAGE = 10

  /* LIVE data (Supabase via the admin server) */
  const [live, setLive] = useState({ loading: LIVE, error: '', users: [], writable: false, orphans: 0 })
  const [liveLog, setLiveLog] = useState([])
  const loadLive = async () => {
    setLive((s) => ({ ...s, loading: true, error: '' }))
    try {
      const { data } = await accessApi.get('/api/subscriptions')
      setLive({ loading: false, error: '', users: (data.subscribers || []).map(fromLive), writable: !!data.writable, orphans: data.orphanSubscriptions || 0 })
    } catch (e) {
      setLive((s) => ({ ...s, loading: false, error: accessError(e) }))
    }
  }
  useEffect(() => { if (LIVE) loadLive() }, [])
  const users = LIVE ? live.users : state.users
  const menuPlans = state.plans.filter((p) => p.active && !(LIVE && p.id === 'trial'))   // live: paid plans only

  const planById = (id) => state.plans.find((p) => p.id === id)

  /* KPIs */
  const kpi = useMemo(() => {
    const c = { total: users.length, active: 0, expiring: 0, expired: 0, suspended: 0 }
    users.forEach((u) => { c[statusOf(u)]++ })
    return c
  }, [users])

  /* filter + sort */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = users.filter((u) => {
      if (term && !(`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(term))) return false
      if (planF !== 'all' && u.plan !== planF) return false
      const st = statusOf(u)
      if (statusF === 'inactive') return st === 'expired' || st === 'suspended'
      if (statusF !== 'all' && st !== statusF) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'recent') return b.lastActive.localeCompare(a.lastActive)
      return a.expiryDate.localeCompare(b.expiryDate)
    })
    return list
  }, [users, q, planF, statusF, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const curPage = Math.min(page, pages)
  const pageRows = filtered.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE)
  useEffect(() => { setPage(1) }, [q, planF, statusF, sort])

  /* close row menu on outside click / Esc */
  useEffect(() => {
    if (!menuFor) return
    const close = (e) => { if (!e.target.closest?.('.lm-menu-wrap')) setMenuFor(null) }
    const esc = (e) => { if (e.key === 'Escape') setMenuFor(null) }
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', esc) }
  }, [menuFor])

  const allOnPage = pageRows.length > 0 && pageRows.every((u) => selected.includes(u.id))
  const toggleAllOnPage = () => setSelected((s) => allOnPage ? s.filter((id) => !pageRows.some((u) => u.id === id)) : [...new Set([...s, ...pageRows.map((u) => u.id)])])
  const toggleOne = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const ask = (cfg) => setConfirm(cfg)
  const done = (msg) => toast(LIVE ? `${msg} — saved to Supabase` : `${msg} — sample data only, not synced`, 'success')

  /* LIVE: send each user's changed fields to the server, then reload the list.
     `fn(u)` returns the new values (same rules as the preview reducer). Free-trial users have no
     subscription row yet, so they get the full set (plan + dates) and the server creates a ₹0 row. */
  const pushLive = async (ids, fn, logText, okMsg) => {
    let ok = 0; const errors = []
    for (const id of ids) {
      const u = users.find((x) => x.id === id); if (!u) continue
      const n = { ...u, ...fn(u) }
      const body = {}
      if (n.plan !== 'trial' && (n.plan !== u.plan || u.source === 'trial')) body.plan = n.plan
      if (n.startDate !== u.startDate || u.source === 'trial') body.startDate = n.startDate
      if (n.expiryDate !== u.expiryDate || u.source === 'trial') body.expiryDate = n.expiryDate
      if (n.status !== u.status) body.status = n.status
      try { await accessApi.patch(`/api/subscriptions/${id}`, body); ok++ } catch (e) { errors.push(`${u.name}: ${accessError(e)}`) }
    }
    if (ok) {
      setLiveLog((l) => [{ id: `${Date.now()}-${Math.random()}`, text: logText, at: new Date().toISOString() }, ...l].slice(0, 200))
      done(ids.length > 1 ? `${okMsg} (${ok}/${ids.length})` : okMsg)
    }
    if (errors.length) toast(errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : ''), 'error')
    await loadLive()
  }
  const liveNames = (ids) => { const l = users.filter((u) => ids.includes(u.id)).map((u) => u.name); return l.length > 2 ? `${l.length} users` : l.join(' & ') }

  const act = {
    extend: (ids, days) => {
      if (LIVE) return pushLive(ids, (u) => (statusOf(u) === 'expired'
        ? { startDate: today(), expiryDate: addDays(today(), days) } : { expiryDate: addDays(u.expiryDate, days) }),
        `Extended ${liveNames(ids)} by ${days} days`, `Extended by ${days} days`)
      dispatch({ type: 'extend', ids, days }); done(`Extended by ${days} days`)
    },
    plan: (ids, planId) => ask({
      title: 'Change plan?', label: 'Change plan',
      body: `${ids.length > 1 ? `${ids.length} users` : 'This user'} will move to ${planById(planId)?.name} starting today (${planById(planId)?.days} days).`
        + (LIVE ? ' Users on the free trial get this plan free of charge (₹0).' : ''),
      run: () => {
        if (LIVE) return pushLive(ids, () => ({ plan: planId, startDate: today(), expiryDate: addDays(today(), planById(planId)?.days || 30), status: 'active' }),
          `Changed plan of ${liveNames(ids)} → ${planById(planId)?.name}`, 'Plan changed')
        dispatch({ type: 'plan', ids, planId }); done('Plan changed')
      },
    }),
    suspend: (ids) => ask({
      title: ids.length > 1 ? `Suspend ${ids.length} users?` : 'Suspend this user?', label: 'Suspend', danger: true,
      body: LIVE ? 'Their subscription is marked suspended — they drop to the free plan on their next sign-in until reactivated.'
        : 'They keep their remaining days but cannot use the app until reactivated.',
      run: () => {
        if (LIVE) return pushLive(ids, () => ({ status: 'suspended' }), `Suspended ${liveNames(ids)}`, 'Suspended')
        dispatch({ type: 'status', ids, status: 'suspended' }); done('Suspended')
      },
    }),
    reactivate: (ids) => {
      if (LIVE) return pushLive(ids, () => ({ status: 'active' }), `Reactivated ${liveNames(ids)}`, 'Reactivated')
      dispatch({ type: 'status', ids, status: 'active' }); done('Reactivated')
    },
    trial: (ids) => ask({
      title: 'Reset to free trial?', label: 'Reset to trial',
      body: `The current plan is replaced with a ${planById('trial')?.days || 7}-day free trial starting today.`,
      run: () => { dispatch({ type: 'trial', ids }); done('Reset to free trial') },
    }),
  }

  const exportCsv = () => {
    const head = ['Name', 'Email', 'Phone', 'Plan', 'Status', 'Start', 'Expiry', 'Days left', 'Notes']
    const rows = filtered.map((u) => [u.name, u.email, u.phone, planById(u.plan)?.name || u.plan,
      STATUS_LABEL[statusOf(u)], u.startDate, u.expiryDate, daysLeft(u), u.notes])
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `mocktest-subscribers-${today()}.csv` })
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    toast(`Exported ${rows.length} subscribers to CSV`, 'success')
  }

  const kpiTiles = [
    { key: 'all',      label: 'Total subscribers',    value: kpi.total,                    Icon: IcUsers, tone: 'slate' },
    { key: 'active',   label: 'Active licences',      value: kpi.active,                   Icon: IcCheck, tone: 'green' },
    { key: 'expiring', label: 'Expiring in ≤ 7 days', value: kpi.expiring,                 Icon: IcClock, tone: 'amber' },
    { key: 'inactive', label: 'Expired / suspended',  value: kpi.expired + kpi.suspended,  Icon: IcBan,   tone: 'red' },
  ]

  const editing = users.find((u) => u.id === editId) || null
  const log = LIVE ? liveLog : state.log

  /* row actions menu (shared by table + cards) */
  const RowMenu = ({ u }) => {
    const st = statusOf(u)
    return (
      <div className="lm-menu-wrap">
        <button type="button" className="lm-icon-btn" aria-label={`More actions for ${u.name}`} aria-haspopup="menu"
          aria-expanded={menuFor === u.id} onClick={() => setMenuFor(menuFor === u.id ? null : u.id)}><IcDots/></button>
        {menuFor === u.id && (
          <div className="lm-menu" role="menu">
            <button role="menuitem" onClick={() => { setMenuFor(null); act.extend([u.id], 7) }}>Extend +7 days</button>
            <button role="menuitem" onClick={() => { setMenuFor(null); act.extend([u.id], 30) }}>Extend +30 days</button>
            <div className="lm-menu-sep"/>
            {menuPlans.filter((p) => p.id !== u.plan).map((p) => (
              <button key={p.id} role="menuitem" onClick={() => { setMenuFor(null); act.plan([u.id], p.id) }}>
                Change to {p.name}
              </button>
            ))}
            <div className="lm-menu-sep"/>
            {st === 'suspended'
              ? <button role="menuitem" onClick={() => { setMenuFor(null); act.reactivate([u.id]) }}>Reactivate</button>
              : <button role="menuitem" onClick={() => { setMenuFor(null); act.suspend([u.id]) }}>Suspend</button>}
            {!LIVE && <button role="menuitem" onClick={() => { setMenuFor(null); act.trial([u.id]) }}>Reset to free trial</button>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="lm">
      {/* Info strip */}
      <div className="lm-info"><IcInfo s={15}/>
        {!LIVE ? (
          <span>Front-end preview with <b>sample data</b> — changes are saved only in this browser and are not connected to the backend yet.</span>
        ) : live.error ? (
          <span>Could not load subscribers: <b>{live.error}</b> <button type="button" className="lm-link" onClick={loadLive}>Retry</button></span>
        ) : (
          <span>
            <b>Live data from Supabase</b> — paid subscribers plus users still in their {planById('trial')?.days || 7}-day free trial.{' '}
            {live.writable ? 'Changes are saved to the database and apply on the student’s next sign-in.'
              : <>View only — changes are turned off on the admin server (<code>ALLOW_SUBSCRIPTION_WRITES</code>).</>}
            {live.orphans > 0 && <> {live.orphans} subscription record{live.orphans === 1 ? '' : 's'} belong to deleted accounts and {live.orphans === 1 ? 'is' : 'are'} not listed.</>}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="lm-head">
        <div>
          <div className="lm-badges">
            {isSuperAdmin
              ? <span className="lm-badge is-admin">Super admin</span>
              : <span className="lm-badge is-preview">Preview · mock data</span>}
            {LIVE && <span className="lm-badge is-admin">Live · Supabase</span>}
          </div>
        </div>
        <div className="lm-head-actions">
          {LIVE ? (
            <button type="button" className="lm-btn is-ghost" disabled={live.loading} onClick={loadLive}><IcReset s={15}/> {live.loading ? 'Loading…' : 'Refresh'}</button>
          ) : (
            <button type="button" className="lm-btn is-ghost" onClick={() => ask({
              title: 'Reset demo data?', label: 'Reset', danger: true,
              body: 'All your changes are discarded and the original sample subscribers and plans are restored.',
              run: () => { dispatch({ type: 'reset' }); setSelected([]); toast('Demo data restored', 'info') },
            })}><IcReset s={15}/> Reset demo data</button>
          )}
        </div>
      </div>

      {/* Sub-tabs: Subscribers · Subscription plans · Activity log */}
      <div className="lm-tabs" role="tablist">
        {[['users', 'Subscribers', IcUsers], ['plans', 'Subscription plans', IcClock], ['log', 'Activity log', IcLog]].map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`lm-tab${tab === id ? ' is-on' : ''}`} onClick={() => setTab(id)}>
            <Icon s={15}/> {label}
            {id === 'log' && log.length > 0 && <span className="lm-count">{log.length}</span>}
          </button>
        ))}
      </div>

      {/* ══ SUBSCRIBERS ══ (everyone on a paid plan or the free trial) */}
      {tab === 'users' && (<>
        <div className="lm-section-head">
          <div className="lm-section-txt">
            <h3>Subscribers <span className="lm-count is-lg">{kpi.total}</span></h3>
            <p>Everyone on a paid plan or the free trial — extend access, change plans or suspend.</p>
          </div>
          <div className="lm-head-actions">
            <button type="button" className="lm-btn is-ghost" onClick={exportCsv}><IcDownload s={15}/> Export CSV</button>
          </div>
        </div>

        {/* KPI tiles — click to filter */}
        <div className="lm-kpis">
          {kpiTiles.map(({ key, label, value, Icon, tone }) => (
            <button key={key} type="button" className={`lm-kpi is-${tone}${statusF === key ? ' is-on' : ''}`}
              onClick={() => setStatusF(key)} aria-pressed={statusF === key}>
              <span className="lm-kpi-ic"><Icon s={18}/></span>
              <span className="lm-kpi-val">{value}</span>
              <span className="lm-kpi-lbl">{label}</span>
            </button>
          ))}
        </div>

        <div className="lm-card">
          {/* Toolbar */}
          <div className="lm-toolbar">
            <label className="lm-search">
              <IcSearch s={16}/>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone" aria-label="Search users"/>
            </label>
            <select className="lm-select" value={planF} onChange={(e) => setPlanF(e.target.value)} aria-label="Filter by plan">
              <option value="all">All plans</option>
              {state.plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="lm-select" value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring soon</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Expired or suspended</option>
            </select>
            <select className="lm-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort users">
              <option value="expiry">Sort: Expiry (soonest)</option>
              <option value="name">Sort: Name (A–Z)</option>
              <option value="recent">Sort: Recently active</option>
            </select>
          </div>

          {/* Bulk bar */}
          {selected.length > 0 && (
            <div className="lm-bulk" role="region" aria-label="Bulk actions">
              <b>{selected.length} selected</b>
              <span className="lm-bulk-group">
                Extend by
                <input type="number" min="1" max="3650" value={bulkDays} onChange={(e) => setBulkDays(e.target.value)} aria-label="Days to extend"/>
                days
                <button type="button" className="lm-btn is-sm is-primary" onClick={() => {
                  const n = Math.round(Number(bulkDays)); if (!(n >= 1 && n <= 3650)) { toast('Enter 1–3650 days', 'error'); return }
                  act.extend(selected, n)
                }}>Apply</button>
              </span>
              <span className="lm-bulk-group">
                <select className="lm-select is-sm" value={bulkPlan} onChange={(e) => setBulkPlan(e.target.value)} aria-label="Plan for selected users">
                  {menuPlans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="button" className="lm-btn is-sm" onClick={() => act.plan(selected, bulkPlan)}>Change plan</button>
              </span>
              <button type="button" className="lm-btn is-sm is-danger" onClick={() => act.suspend(selected)}>Suspend</button>
              <button type="button" className="lm-link" onClick={() => setSelected([])}>Clear</button>
            </div>
          )}

          {LIVE && live.loading && users.length === 0 ? (
            <div className="lm-empty"><IcUsers s={28}/><b>Loading subscribers…</b></div>
          ) : LIVE && users.length === 0 ? (
            <div className="lm-empty"><IcUsers s={28}/><b>No subscribers yet</b><span>Paid users and users in their free trial will appear here.</span></div>
          ) : filtered.length === 0 ? (
            <div className="lm-empty">
              <IcSearch s={28}/>
              <b>No subscribers match these filters</b>
              <button type="button" className="lm-link" onClick={() => { setQ(''); setPlanF('all'); setStatusF('all') }}>Clear filters</button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="lm-table-wrap">
                <table className="lm-table">
                  <thead>
                    <tr>
                      <th className="lm-col-check"><input type="checkbox" checked={allOnPage} onChange={toggleAllOnPage} aria-label="Select all on this page"/></th>
                      <th aria-sort={sort === 'name' ? 'ascending' : 'none'}>Subscriber</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Start</th>
                      <th aria-sort={sort === 'expiry' ? 'ascending' : 'none'}>Expiry</th>
                      <th>Days left</th>
                      <th className="lm-col-actions"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((u) => (
                      <tr key={u.id} className={selected.includes(u.id) ? 'is-selected' : ''}>
                        <td className="lm-col-check"><input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} aria-label={`Select ${u.name}`}/></td>
                        <td>
                          <div className="lm-user">
                            <span className="lm-avatar" style={{ '--c': planById(u.plan)?.color || '#64748b' }}>{initials(u.name)}</span>
                            <span className="lm-user-txt"><b>{u.name}</b><span>{u.email}</span></span>
                          </div>
                        </td>
                        <td><PlanBadge plan={planById(u.plan)}/></td>
                        <td><StatusPill status={statusOf(u)}/></td>
                        <td className="lm-nowrap">{fmt(u.startDate)}</td>
                        <td className="lm-nowrap">{fmt(u.expiryDate)}</td>
                        <td><DaysLeft u={u}/></td>
                        <td className="lm-col-actions">
                          <div className="lm-row-actions">
                            <button type="button" className="lm-btn is-sm" onClick={() => setEditId(u.id)}><IcEdit s={14}/> Edit</button>
                            <RowMenu u={u}/>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="lm-cards">
                {pageRows.map((u) => (
                  <div key={u.id} className={`lm-ucard${selected.includes(u.id) ? ' is-selected' : ''}`}>
                    <div className="lm-ucard-top">
                      <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} aria-label={`Select ${u.name}`}/>
                      <span className="lm-avatar" style={{ '--c': planById(u.plan)?.color || '#64748b' }}>{initials(u.name)}</span>
                      <span className="lm-user-txt"><b>{u.name}</b><span>{u.email}</span></span>
                      <RowMenu u={u}/>
                    </div>
                    <div className="lm-ucard-meta">
                      <PlanBadge plan={planById(u.plan)}/><StatusPill status={statusOf(u)}/>
                    </div>
                    <div className="lm-ucard-dates"><span>{fmt(u.startDate)} → {fmt(u.expiryDate)}</span><DaysLeft u={u}/></div>
                    <button type="button" className="lm-btn is-sm is-block" onClick={() => setEditId(u.id)}><IcEdit s={14}/> Edit subscription</button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="lm-pager">
                <span>Showing {(curPage - 1) * PER_PAGE + 1}–{Math.min(curPage * PER_PAGE, filtered.length)} of {filtered.length}</span>
                <div>
                  <button type="button" className="lm-btn is-sm" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}>‹ Prev</button>
                  <span className="lm-pager-num">Page {curPage} / {pages}</span>
                  <button type="button" className="lm-btn is-sm" disabled={curPage >= pages} onClick={() => setPage(curPage + 1)}>Next ›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </>)}

      {/* ══ SUBSCRIPTION PLANS ══ */}
      {tab === 'plans' && (<>
        {LIVE && (
          <div className="lm-info"><IcInfo s={15}/>
            <span><b>Preview only</b> — editing plans here does not change the real prices or checkout. Plan lengths are used when you change a subscriber's plan.</span>
          </div>
        )}
        <PlansTab plans={state.plans} users={users} dispatch={dispatch} ask={ask}
          done={(msg) => toast(`${msg} — preview only, not synced`, 'success')}/>
      </>)}

      {/* ══ ACTIVITY LOG ══ */}
      {tab === 'log' && (
        <div className="lm-card">
          {log.length === 0 ? (
            <div className="lm-empty"><IcLog s={28}/><b>No changes yet</b><span>{LIVE ? 'Changes you make to subscribers in this session appear here (the admin server also logs every change).' : 'Changes you make to subscribers and plans will appear here.'}</span></div>
          ) : (
            <ul className="lm-log">
              {log.map((e) => (
                <li key={e.id}><span className="lm-log-dot"/><span className="lm-log-txt">{e.text}</span><time dateTime={e.at}>{relTime(e.at)}</time></li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <EditDrawer user={editing} plans={state.plans} onClose={() => setEditId(null)}
          onSave={(next, logText) => {
            setEditId(null)
            if (LIVE) return pushLive([next.id], () => next, logText, 'Changes saved')
            dispatch({ type: 'update', user: next, logText }); done('Changes saved')
          }}/>
      )}
      {confirm && (
        <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} onConfirm={() => { confirm.run(); setConfirm(null) }}/>
      )}
    </div>
  )
}

/* ══════════════ EDIT DRAWER ══════════════ */
function EditDrawer({ user, plans, onClose, onSave }) {
  const [f, setF] = useState({ ...user })
  const firstRef = useRef(null)
  useDialog(true, onClose, firstRef)
  const days = diffDays(f.startDate, f.expiryDate)
  const left = Math.max(0, diffDays(today(), f.expiryDate))
  const valid = days >= 1 && days <= 3650
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const setDays = (n) => { const d = Math.round(Number(n)); if (d >= 1 && d <= 3650) set('expiryDate', addDays(f.startDate, d)) }
  const plan = plans.find((p) => p.id === f.plan)

  const save = () => {
    if (!valid) return
    const changes = []
    if (f.plan !== user.plan) changes.push(`plan → ${plan?.name}`)
    if (f.expiryDate !== user.expiryDate || f.startDate !== user.startDate) changes.push(`${days} days access, expires ${fmt(f.expiryDate)}`)
    if (f.status !== user.status) changes.push(f.status === 'suspended' ? 'suspended' : 'reactivated')
    if (f.notes !== user.notes) changes.push('notes updated')
    onSave(f, `Edited ${f.name}${changes.length ? ': ' + changes.join(', ') : ' (no changes)'}`)
  }

  return (
    <>
      <div className="lm-scrim" onClick={onClose}/>
      <aside className="lm-drawer" role="dialog" aria-modal="true" aria-labelledby="lm-edit-title">
        <div className="lm-drawer-head">
          <div>
            <div className="lm-eyebrow">Edit subscription</div>
            <h3 id="lm-edit-title">{user.name}</h3>
          </div>
          <button type="button" className="lm-icon-btn" onClick={onClose} aria-label="Close"><IcX/></button>
        </div>

        <div className="lm-drawer-body">
          <div className="lm-summary">
            <span className="lm-avatar is-lg" style={{ '--c': plan?.color || '#64748b' }}>{initials(user.name)}</span>
            <div><b>{user.email}</b><span>{user.phone} · last active {fmt(user.lastActive)}</span></div>
            <StatusPill status={statusOf(f)}/>
          </div>

          <label className="lm-field">
            <span>Plan</span>
            <select ref={firstRef} className="lm-select" value={f.plan} onChange={(e) => {
              const p = plans.find((x) => x.id === e.target.value)
              setF((s) => ({ ...s, plan: e.target.value, expiryDate: addDays(s.startDate, p?.days || days) }))
            }}>
              {plans.map((p) => <option key={p.id} value={p.id} disabled={LIVE && p.id === 'trial'}>{p.name} — {p.days} days{p.price ? ` · ₹${p.price}` : ''}</option>)}
            </select>
            <small>Picking a plan fills its default duration — you can still change the days below.
              {LIVE && user.source === 'trial' && ' This user is on the free trial — picking a plan gives it to them free of charge (₹0).'}</small>
          </label>

          <div className="lm-field">
            <span>Access duration</span>
            <div className="lm-chips">
              {[7, 30, 90, 180, 365].map((n) => (
                <button key={n} type="button" className={`lm-chip${days === n ? ' is-on' : ''}`} onClick={() => setDays(n)}>{n} days</button>
              ))}
              <label className="lm-chip-input">
                <input type="number" min="1" max="3650" value={days > 0 ? days : ''} onChange={(e) => setDays(e.target.value)} aria-label="Custom number of days"/>
                <span>days</span>
              </label>
            </div>
          </div>

          <div className="lm-grid2">
            <label className="lm-field">
              <span>Start date</span>
              <input type="date" className="lm-input" value={f.startDate} onChange={(e) => {
                const ns = e.target.value; if (!ns) return
                setF((s) => ({ ...s, startDate: ns, expiryDate: addDays(ns, Math.max(1, days)) }))
              }}/>
            </label>
            <label className="lm-field">
              <span>Expiry date</span>
              <input type="date" className="lm-input" min={addDays(f.startDate, 1)} value={f.expiryDate} onChange={(e) => e.target.value && set('expiryDate', e.target.value)}/>
            </label>
          </div>

          <div className="lm-field">
            <span>Quick extend</span>
            <div className="lm-chips">
              {[7, 30, 90].map((n) => (
                <button key={n} type="button" className="lm-chip is-add" onClick={() => set('expiryDate', addDays(f.expiryDate, n))}>+{n} days</button>
              ))}
            </div>
          </div>

          <div className="lm-field">
            <span>Subscription status</span>
            <div className="lm-seg" role="radiogroup" aria-label="Subscription status">
              {['active', 'suspended'].map((s) => (
                <button key={s} type="button" role="radio" aria-checked={f.status === s} className={f.status === s ? 'is-on' : ''} onClick={() => set('status', s)}>
                  {s === 'active' ? 'Active' : 'Suspended'}
                </button>
              ))}
            </div>
          </div>

          {!LIVE && (   /* no notes column in Supabase — preview only */
            <label className="lm-field">
              <span>Admin notes</span>
              <textarea className="lm-input" rows="3" value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal note — e.g. payment reference, reason for extension"/>
            </label>
          )}

          <div className={`lm-preview${valid ? '' : ' is-error'}`}>
            {valid
              ? <>New expiry <b>{fmt(f.expiryDate)}</b> · <b>{days}</b> days access · <b>{left}</b> day{left === 1 ? '' : 's'} left</>
              : <>Expiry must be after the start date (1–3650 days).</>}
          </div>
        </div>

        <div className="lm-drawer-foot">
          <button type="button" className="lm-btn is-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="lm-btn is-primary" disabled={!valid} onClick={save}>Save changes</button>
        </div>
      </aside>
    </>
  )
}

/* ══════════════ CONFIRM ══════════════ */
function ConfirmDialog({ title, body, label = 'Confirm', danger, onClose, onConfirm }) {
  const firstRef = useRef(null)
  useDialog(true, onClose, firstRef)
  return (
    <>
      <div className="lm-scrim is-top" onClick={onClose}/>
      <div className="lm-modal is-confirm" role="alertdialog" aria-modal="true" aria-labelledby="lm-confirm-title" aria-describedby="lm-confirm-body">
        <div className="lm-modal-body">
          <h3 id="lm-confirm-title">{title}</h3>
          <p id="lm-confirm-body">{body}</p>
        </div>
        <div className="lm-drawer-foot">
          <button type="button" ref={firstRef} className="lm-btn is-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className={`lm-btn ${danger ? 'is-danger-solid' : 'is-primary'}`} onClick={onConfirm}>{label}</button>
        </div>
      </div>
    </>
  )
}

/* ══════════════ PLANS TAB — full subscription-plan editor ══════════════
   Edit name, price, validity (days), description, features (add / edit / reorder / remove),
   "Most popular" badge, visibility and colour, with a live preview of the user-facing card.
   Built-in plans (trial/basic/pro/ultimate) can be edited but not deleted; custom plans can
   be deleted only when no users are on them. */
const BUILT_IN = ['trial', 'basic', 'pro', 'ultimate']
const isBuiltIn = (p) => p.builtIn || BUILT_IN.includes(p.id)
const IcUp = (p) => <I {...p} d={<path d="m18 15-6-6-6 6"/>}/>
const IcDown = (p) => <I {...p} d={<path d="m6 9 6 6 6-6"/>}/>
const IcTrash = (p) => <I {...p} d={<><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>}/>

/* How the plan card looks to users (Subscriptions-page style) */
function PlanPreview({ plan }) {
  const feats = (plan.features || []).filter((f) => f.trim())
  return (
    <div className={`lm-pv${plan.popular ? ' is-popular' : ''}${plan.active ? '' : ' is-hidden'}`} style={{ '--c': plan.color }}>
      {plan.popular && <span className="lm-pv-badge">Most popular</span>}
      <div className="lm-pv-name">{plan.name?.trim() || 'Plan name'}</div>
      {plan.desc?.trim() && <div className="lm-pv-desc">{plan.desc}</div>}
      <div className="lm-pv-price">
        <b>{plan.price > 0 ? `₹${plan.price}` : 'Free'}</b>
        <span>/ {plan.days || 0} day{plan.days === 1 ? '' : 's'}</span>
      </div>
      {feats.length > 0 && <ul className="lm-pv-feats">{feats.map((f, i) => <li key={i}>{f}</li>)}</ul>}
      <div className="lm-pv-cta">{plan.price > 0 ? 'Choose plan' : 'Start free trial'}</div>
      {!plan.active && <div className="lm-pv-hidden">Hidden — users won't see this plan</div>}
    </div>
  )
}

function PlansTab({ plans, users, dispatch, ask, done }) {
  const [editId, setEditId] = useState(null)   // plan id, or 'new'
  const [draftNew, setDraftNew] = useState(null)
  const count = (id) => users.filter((u) => u.plan === id).length
  const editing = editId === 'new' ? draftNew : plans.find((p) => p.id === editId) || null

  const openNew = () => {
    setDraftNew({ id: `custom${Date.now()}`, name: '', days: 60, price: 0, color: '#0f766e', active: true,
      popular: false, desc: '', features: ['Custom access period'], isNew: true })
    setEditId('new')
  }
  const toggle = (p) => dispatch({ type: 'plan_update', plan: { ...p, active: !p.active },
    logText: `Plan "${p.name}": ${p.active ? 'hidden from users' : 'shown to users'}` })
  const remove = (p) => {
    const n = count(p.id)
    if (n) { toast(`Move the ${n} user${n > 1 ? 's' : ''} on "${p.name}" to another plan first`, 'error'); return }
    ask({
      title: `Delete "${p.name}"?`, label: 'Delete plan', danger: true,
      body: 'This plan is removed from the catalog. No users are on it.',
      run: () => { dispatch({ type: 'plan_delete', id: p.id }); done('Plan deleted') },
    })
  }

  const visible = plans.filter((p) => p.active).length
  const popular = plans.find((p) => p.popular)
  return (
    <div>
      {/* Section header — dedicated to subscription plans */}
      <div className="lm-section-head">
        <div className="lm-section-txt">
          <h3>Subscription plans <span className="lm-count is-lg">{plans.length}</span></h3>
          <p>The plans users can buy — price, validity, features and which one is highlighted.</p>
          <div className="lm-summary-chips">
            <span className="lm-tag">{plans.length} plan{plans.length === 1 ? '' : 's'}</span>
            <span className="lm-tag">{visible} visible</span>
            {plans.length - visible > 0 && <span className="lm-tag">{plans.length - visible} hidden</span>}
            {popular && <span className="lm-tag is-popular">★ Most popular: {popular.name}</span>}
          </div>
        </div>
        <div className="lm-head-actions">
          <button type="button" className="lm-btn is-primary" onClick={openNew}><IcPlus s={15}/> New plan</button>
        </div>
      </div>

      <div className="lm-note"><IcInfo s={15}/>
        <span>Changing a plan's validity applies to <b>new subscriptions only</b> — existing subscribers keep their current expiry.</span>
      </div>
      <div className="lm-plans">
        {plans.map((p) => {
          const n = count(p.id)
          return (
            <div key={p.id} className={`lm-plan-card${p.active ? '' : ' is-off'}`} style={{ '--c': p.color }}>
              <div className="lm-plan-top">
                <span className="lm-plan-name"><span className="lm-dot"/>{p.name}</span>
                <label className="lm-switch" title={p.active ? 'Visible to users — click to hide' : 'Hidden — click to show'}>
                  <input type="checkbox" checked={p.active} onChange={() => toggle(p)} aria-label={`${p.name} visible to users`}/>
                  <span/>
                </label>
              </div>
              <div className="lm-plan-tags">
                {p.popular && <span className="lm-tag is-popular">★ Most popular</span>}
                {!p.active && <span className="lm-tag">Hidden</span>}
                {!isBuiltIn(p) && <span className="lm-tag">Custom</span>}
              </div>
              <div className="lm-plan-price"><b>{p.price > 0 ? `₹${p.price}` : 'Free'}</b><span>/ {p.days} days</span></div>
              {p.desc && <p className="lm-plan-desc">{p.desc}</p>}
              <div className="lm-plan-users">{n} user{n === 1 ? '' : 's'} on this plan</div>
              {(p.features || []).length > 0 && <ul className="lm-features">{p.features.map((ft, i) => <li key={i}>{ft}</li>)}</ul>}
              <div className="lm-plan-actions">
                <button type="button" className="lm-btn is-sm" onClick={() => setEditId(p.id)}><IcEdit s={14}/> Edit plan</button>
                {!isBuiltIn(p) && (
                  <button type="button" className="lm-btn is-sm is-danger" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><IcTrash s={14}/> Delete</button>
                )}
              </div>
            </div>
          )
        })}
        <button type="button" className="lm-plan-add" onClick={openNew}>
          <IcPlus s={22}/><b>Add custom plan</b><span>e.g. a 6-month deal or a coaching-centre licence</span>
        </button>
      </div>

      {editing && (
        <PlanEditor
          key={editing.id}
          plan={editing}
          usersOnPlan={editing.isNew ? 0 : count(editing.id)}
          onClose={() => { setEditId(null); setDraftNew(null) }}
          onSave={(np, logText) => {
            if (np.isNew) { const { isNew, ...rest } = np; dispatch({ type: 'plan_add', plan: rest }); done(`Plan "${rest.name}" created`) }
            else { dispatch({ type: 'plan_update', plan: np, logText }); done('Plan saved') }
            setEditId(null); setDraftNew(null)
          }}
        />
      )}
    </div>
  )
}

function PlanEditor({ plan, usersOnPlan, onClose, onSave }) {
  const [f, setF] = useState({ ...plan, desc: plan.desc || '', features: [...(plan.features || [])] })
  const [tried, setTried] = useState(false)   // show validation errors only after the first Save attempt
  const firstRef = useRef(null)
  useDialog(true, onClose, firstRef)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const days = Math.round(Number(f.days))
  const price = Math.round(Number(f.price))
  const errors = []
  if (!f.name.trim()) errors.push('Enter a plan name.')
  if (!(days >= 1 && days <= 3650)) errors.push('Validity must be between 1 and 3650 days.')
  if (!(price >= 0 && price <= 100000)) errors.push('Price must be between ₹0 and ₹1,00,000.')
  if (!f.features.some((x) => x.trim())) errors.push('Add at least one feature.')

  const feats = f.features
  const setFeat = (i, v) => set('features', feats.map((x, j) => (j === i ? v : x)))
  const moveFeat = (i, d) => { const j = i + d; if (j < 0 || j >= feats.length) return; const n = [...feats]; [n[i], n[j]] = [n[j], n[i]]; set('features', n) }
  const removeFeat = (i) => set('features', feats.filter((_, j) => j !== i))
  const addFeat = () => set('features', [...feats, ''])

  const save = () => {
    if (errors.length) { setTried(true); return }
    const clean = { ...f, name: f.name.trim(), desc: f.desc.trim(), days, price, features: feats.map((x) => x.trim()).filter(Boolean) }
    const ch = []
    if (!plan.isNew) {
      if (clean.name !== plan.name) ch.push(`renamed to "${clean.name}"`)
      if (price !== plan.price) ch.push(`price ₹${plan.price} → ₹${price}`)
      if (days !== plan.days) ch.push(`validity ${plan.days} → ${days} days`)
      if (clean.desc !== (plan.desc || '')) ch.push('description updated')
      if (JSON.stringify(clean.features) !== JSON.stringify(plan.features || [])) ch.push('features updated')
      if (!!clean.popular !== !!plan.popular) ch.push(clean.popular ? 'marked Most popular' : 'Most popular removed')
      if (clean.active !== plan.active) ch.push(clean.active ? 'shown to users' : 'hidden from users')
      if (clean.color !== plan.color) ch.push('colour changed')
    }
    onSave(clean, `Plan "${plan.name}": ${ch.length ? ch.join(', ') : 'no changes'}`)
  }

  return (
    <>
      <div className="lm-scrim" onClick={onClose}/>
      <aside className="lm-drawer is-wide" role="dialog" aria-modal="true" aria-labelledby="lm-plan-title">
        <div className="lm-drawer-head">
          <div>
            <div className="lm-eyebrow">{plan.isNew ? 'New subscription plan' : 'Edit subscription plan'}</div>
            <h3 id="lm-plan-title">{plan.isNew ? (f.name.trim() || 'Untitled plan') : plan.name}</h3>
          </div>
          <button type="button" className="lm-icon-btn" onClick={onClose} aria-label="Close"><IcX/></button>
        </div>

        <div className="lm-drawer-body">
          <div className="lm-pv-wrap">
            <div className="lm-pv-label">Live preview — how users see this plan</div>
            <PlanPreview plan={{ ...f, days: days || 0, price: price > 0 ? price : 0 }}/>
          </div>

          {usersOnPlan > 0 && (
            <div className="lm-note"><IcInfo s={15}/>
              <span><b>{usersOnPlan}</b> user{usersOnPlan === 1 ? ' is' : 's are'} on this plan. A new validity applies to new assignments only.</span>
            </div>
          )}

          <label className="lm-field">
            <span>Plan name</span>
            <input ref={firstRef} className="lm-input" value={f.name} maxLength={40} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Pro"/>
          </label>
          <label className="lm-field">
            <span>Short description</span>
            <input className="lm-input" value={f.desc} maxLength={120} onChange={(e) => set('desc', e.target.value)} placeholder="One line shown under the plan name"/>
          </label>

          <div className="lm-grid2">
            <label className="lm-field"><span>Price</span>
              <div className="lm-suffix is-pre"><span>₹</span>
                <input type="number" min="0" max="100000" className="lm-input" value={f.price} onChange={(e) => set('price', e.target.value)}/>
              </div>
              <small>0 = free</small>
            </label>
            <label className="lm-field"><span>Validity</span>
              <div className="lm-suffix">
                <input type="number" min="1" max="3650" className="lm-input" value={f.days} onChange={(e) => set('days', e.target.value)}/>
                <span>days</span>
              </div>
            </label>
          </div>
          <div className="lm-chips lm-mb">
            {[7, 30, 90, 180, 365].map((n) => (
              <button key={n} type="button" className={`lm-chip${days === n ? ' is-on' : ''}`} onClick={() => set('days', n)}>
                {n === 30 ? '1 month' : n === 90 ? '3 months' : n === 180 ? '6 months' : n === 365 ? '1 year' : `${n} days`}
              </button>
            ))}
          </div>

          <div className="lm-field">
            <span>Features <small>(shown as a ✓ list on the plan card)</small></span>
            <div className="lm-feat-list">
              {feats.map((ft, i) => (
                <div key={i} className="lm-feat-row">
                  <span className="lm-feat-num">{i + 1}</span>
                  <input className="lm-input" value={ft} maxLength={80} onChange={(e) => setFeat(i, e.target.value)}
                    placeholder="e.g. Unlimited mock tests" aria-label={`Feature ${i + 1}`}/>
                  <button type="button" className="lm-icon-btn" onClick={() => moveFeat(i, -1)} disabled={i === 0} aria-label={`Move feature ${i + 1} up`}><IcUp s={15}/></button>
                  <button type="button" className="lm-icon-btn" onClick={() => moveFeat(i, 1)} disabled={i === feats.length - 1} aria-label={`Move feature ${i + 1} down`}><IcDown s={15}/></button>
                  <button type="button" className="lm-icon-btn is-danger" onClick={() => removeFeat(i)} aria-label={`Remove feature ${i + 1}`}><IcX s={15}/></button>
                </div>
              ))}
            </div>
            <button type="button" className="lm-link lm-add-feat" onClick={addFeat}>+ Add feature</button>
          </div>

          <div className="lm-field">
            <span>Accent colour</span>
            <div className="lm-swatches" role="radiogroup" aria-label="Accent colour">
              {PLAN_COLORS.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={f.color === c} aria-label={c}
                  className={`lm-swatch${f.color === c ? ' is-on' : ''}`} style={{ '--c': c }} onClick={() => set('color', c)}/>
              ))}
            </div>
          </div>

          <div className="lm-toggle-row">
            <div><b>Most popular badge</b><span>Highlights this plan. Only one plan can have it — others lose it.</span></div>
            <label className="lm-switch"><input type="checkbox" checked={!!f.popular} onChange={(e) => set('popular', e.target.checked)} aria-label="Most popular badge"/><span/></label>
          </div>
          <div className="lm-toggle-row">
            <div><b>Visible to users</b><span>Hidden plans can't be chosen by users; existing users keep them.</span></div>
            <label className="lm-switch"><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} aria-label="Visible to users"/><span/></label>
          </div>

          {tried && errors.length > 0 && (
            <ul className="lm-errors" role="alert">{errors.map((er) => <li key={er}>{er}</li>)}</ul>
          )}
        </div>

        <div className="lm-drawer-foot">
          <button type="button" className="lm-btn is-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="lm-btn is-primary" onClick={save}>{plan.isNew ? 'Create plan' : 'Save plan'}</button>
        </div>
      </aside>
    </>
  )
}
