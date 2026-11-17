/* ══════════════════════════════════════════════════════════════════════════
   UI: custom pop-ups that replace the browser's built-in date picker and <select>
   menus (those can't be styled with CSS). Used in Study Planner.
   • DateField  — typeable date input + MockTest-styled calendar pop-up
   • SelectField — button + styled option list (listbox)
   Pop-ups are rendered into <body> (portal) with fixed positioning, so cards with
   overflow:hidden can't clip them; they flip above the field when there's no room below.
   Styles: "UI: Custom calendar & dropdown" block in src/index.css (dp-* classes).
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* ── shared: position a pop-up under (or above) an anchor, close on outside click / Esc ── */
function usePopover(open, setOpen, anchorRef, popRef, { width, height }) {
  const [pos, setPos] = useState(null)
  useLayoutEffect(() => {
    if (!open) { setPos(null); return }
    const place = () => {
      const a = anchorRef.current?.getBoundingClientRect()
      if (!a) return
      const w = width === 'anchor' ? a.width : width
      const vw = window.innerWidth, vh = window.innerHeight
      const left = Math.min(Math.max(8, a.left), vw - w - 8)
      const h = popRef.current?.offsetHeight || height
      const below = a.bottom + 8
      const top = below + h > vh - 8 && a.top - h - 8 > 8 ? a.top - h - 8 : below
      setPos({ top, left, width: w })
    }
    place()
    const raf = requestAnimationFrame(place)            // re-measure once the pop-up has its real height
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)       // any scrolling container
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (popRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey, true) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  return pos
}

/* ══════════════ DATE FIELD ══════════════ */
const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => { const t = new Date(y, m, d); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}` }
const parse = (s) => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return { y, m: m - 1, d }
}
const todayIso = () => { const t = new Date(); return iso(t.getFullYear(), t.getMonth(), t.getDate()) }
const addDaysIso = (s, n) => { const p = parse(s); return iso(p.y, p.m, p.d + n) }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>
  </svg>
)
const Chev = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}/>
  </svg>
)

/**
 * Typeable date input (mm/dd/yyyy) with a custom calendar pop-up.
 * value / min / max are 'yyyy-mm-dd' strings; onChange receives a 'yyyy-mm-dd' string ('' when cleared).
 * yearPicker: month + year dropdowns in the calendar header (for far-away dates such as a date of birth).
 */
export function DateField({ value, min, max, onChange, className = '', label = 'date', yearPicker = false }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null), popRef = useRef(null), btnRef = useRef(null), gridRef = useRef(null)
  const startFrom = () => value || (min && min > todayIso() ? min : max && max < todayIso() ? max : todayIso())
  const [focus, setFocus] = useState(startFrom)
  const [view, setView] = useState(() => { const p = parse(startFrom()); return { y: p.y, m: p.m } })
  const pos = usePopover(open, setOpen, wrapRef, popRef, { width: 296, height: 360 })

  const inRange = (s) => (!min || s >= min) && (!max || s <= max)
  const openIt = () => {
    const f = startFrom(); const p = parse(f)
    setFocus(f); setView({ y: p.y, m: p.m }); setOpen(true)
  }
  const close = (refocus = true) => { setOpen(false); if (refocus) setTimeout(() => btnRef.current?.focus(), 0) }
  const pick = (s) => { if (!inRange(s)) return; onChange(s); close() }
  const moveFocus = (s) => { const p = parse(s); setFocus(s); setView({ y: p.y, m: p.m }) }

  // keep keyboard focus on the focused day while the calendar is open
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => gridRef.current?.querySelector(`[data-iso="${focus}"]`)?.focus(), 0)
    return () => clearTimeout(t)
  }, [open, focus])

  const onGridKey = (e) => {
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (map[e.key] !== undefined) { e.preventDefault(); moveFocus(addDaysIso(focus, map[e.key])) }
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault(); const p = parse(focus); moveFocus(iso(p.y, p.m + (e.key === 'PageUp' ? -1 : 1), Math.min(p.d, 28)))
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault(); const p = parse(focus); const wd = new Date(p.y, p.m, p.d).getDay()
      moveFocus(addDaysIso(focus, e.key === 'Home' ? -wd : 6 - wd))
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(focus) }
  }

  // 6 × 7 grid starting on the Sunday before the 1st
  const first = new Date(view.y, view.m, 1)
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(view.y, view.m, 1 - first.getDay() + i)
    return { s: iso(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), inMonth: d.getMonth() === view.m }
  })
  const prevDisabled = min && iso(view.y, view.m, 0) < min           // last day of previous month
  const nextDisabled = max && iso(view.y, view.m + 1, 1) > max       // first day of next month
  const tIso = todayIso()

  return (
    <span className="dp-field" ref={wrapRef}>
      <input type="date" value={value || ''} min={min} max={max} onChange={(e) => onChange(e.target.value)} className={className}/>
      <button type="button" ref={btnRef} className={`dp-btn${open ? ' is-open' : ''}`}
        aria-label={`Open calendar to choose ${label}`} aria-haspopup="dialog" aria-expanded={open}
        onClick={() => (open ? close(false) : openIt())}>
        <CalIcon/>
      </button>

      {open && createPortal(
        <div ref={popRef} className="dp-pop dp-cal" role="dialog" aria-label={`Choose ${label}`}
          style={pos ? { top: pos.top, left: pos.left, width: pos.width } : { visibility: 'hidden', top: 0, left: 0 }}>
          <div className="dp-cal-head">
            <button type="button" className="dp-nav" disabled={!!prevDisabled} aria-label="Previous month"
              onClick={() => setView((v) => ({ y: v.m ? v.y : v.y - 1, m: v.m ? v.m - 1 : 11 }))}><Chev dir="left"/></button>
            {yearPicker ? (
              <div className="dp-cal-title dp-cal-pick">
                <select className="dp-head-sel" aria-label="Month" value={view.m} onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))}>
                  {MONTHS.map((mn, i) => <option key={mn} value={i}>{mn.slice(0, 3)}</option>)}
                </select>
                <select className="dp-head-sel" aria-label="Year" value={view.y} onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}>
                  {(() => { const lo = parse(min || '1900-01-01').y, hi = parse(max || todayIso()).y
                    return Array.from({ length: hi - lo + 1 }, (_, i) => hi - i).map((y) => <option key={y} value={y}>{y}</option>) })()}
                </select>
              </div>
            ) : (
              <div className="dp-cal-title" aria-live="polite">{MONTHS[view.m]} <span>{view.y}</span></div>
            )}
            <button type="button" className="dp-nav" disabled={!!nextDisabled} aria-label="Next month"
              onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }))}><Chev dir="right"/></button>
          </div>
          <div className="dp-week" aria-hidden="true">{WEEK.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="dp-grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
            {cells.map((c) => {
              const ok = inRange(c.s)
              const cls = ['dp-day', !c.inMonth && 'is-out', c.s === value && 'is-sel', c.s === tIso && 'is-today', !ok && 'is-off'].filter(Boolean).join(' ')
              return (
                <button key={c.s} type="button" role="gridcell" data-iso={c.s} className={cls}
                  tabIndex={c.s === focus ? 0 : -1} aria-disabled={!ok} aria-selected={c.s === value}
                  aria-label={new Date(parse(c.s).y, parse(c.s).m, c.day).toDateString()}
                  onClick={() => pick(c.s)}>
                  {c.day}
                </button>
              )
            })}
          </div>
          <div className="dp-foot">
            <button type="button" className="dp-link is-muted" onClick={() => { onChange(''); close() }}>Clear</button>
            <button type="button" className="dp-link" disabled={!inRange(tIso)} onClick={() => pick(tIso)}>Today</button>
          </div>
        </div>,
        document.body
      )}
    </span>
  )
}

/* ══════════════ SELECT FIELD ══════════════ */
const Check = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
)

/**
 * Styled replacement for <select>. options: [{ value, label }]. onChange receives the option's value.
 */
export function SelectField({ value, options, onChange, className = '', ariaLabel }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null), popRef = useRef(null)
  const [active, setActive] = useState(0)
  const pos = usePopover(open, setOpen, btnRef, popRef, { width: 'anchor', height: options.length * 40 + 12 })
  const cur = options.find((o) => o.value === value) || options[0]

  const openIt = () => { setActive(Math.max(0, options.findIndex((o) => o.value === value))); setOpen(true) }
  const choose = (o) => { onChange(o.value); setOpen(false); setTimeout(() => btnRef.current?.focus(), 0) }
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => popRef.current?.querySelector(`[data-idx="${active}"]`)?.focus(), 0)
    return () => clearTimeout(t)
  }, [open, active])

  const onBtnKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openIt() }
  }
  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active]) }
    else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <>
      <button type="button" ref={btnRef} className={`dp-select ${className}${open ? ' is-open' : ''}`}
        aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel ? `${ariaLabel}: ${cur?.label}` : undefined}
        onClick={() => (open ? setOpen(false) : openIt())} onKeyDown={onBtnKey}>
        <span>{cur?.label}</span>
        <svg className="dp-select-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && createPortal(
        <ul ref={popRef} className="dp-pop dp-list" role="listbox" aria-label={ariaLabel} onKeyDown={onListKey}
          style={pos ? { top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 160) } : { visibility: 'hidden', top: 0, left: 0 }}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value} tabIndex={i === active ? 0 : -1} data-idx={i}
              className={`dp-opt${o.value === value ? ' is-sel' : ''}`}
              onMouseEnter={() => setActive(i)} onClick={() => choose(o)}>
              <span>{o.label}</span>{o.value === value && <Check/>}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </>
  )
}
