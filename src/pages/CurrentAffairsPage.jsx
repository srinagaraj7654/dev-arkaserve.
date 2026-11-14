import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase.js'

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const _sv = (c,w) => ({fill:'none',stroke:c||'currentColor',strokeWidth:w||'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const _IcNews   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="12" y1="6" x2="18" y2="6"/><line x1="12" y1="10" x2="18" y2="10"/><line x1="12" y1="14" x2="18" y2="14"/></svg>
const _IcBank   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 21h18M3 10h18M3 10l9-7 9 7"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></svg>
const _IcGovt   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M3 11l9-8 9 8"/><line x1="9" y1="22" x2="9" y2="11"/><line x1="15" y1="22" x2="15" y2="11"/></svg>
const _IcTrend  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const _IcFlask  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9 3h6M9 3v7l-5 11h16L15 10V3"/><line x1="6" y1="16" x2="18" y2="16"/></svg>
const _IcTrophy = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H3V4h3M18 9h3V4h-3"/><path d="M6 4h12v8a6 6 0 0 1-12 0V4z"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
const _IcGlobe  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const _IcSearch = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const _IcWarn   = ({s=30,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const _IcEmpty  = ({s=48,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
const _IcPin    = ({s=11,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const _IcBookmark = ({s=14,c,fill}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill||'none'} stroke={c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
const _IcChevron = ({s=14,c,dir='down'}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points={dir==='up'?'18 15 12 9 6 15':'6 9 12 15 18 9'}/></svg>
const _IcArrow  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const _IcSort   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>
const _IcRefresh= ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>

/* ─── Data ───────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',           label: 'All',               icon: <_IcNews s={14}/>   },
  { id: 'banking',       label: 'Banking & Finance',  icon: <_IcBank s={14}/>   },
  { id: 'government',    label: 'Govt & Policy',      icon: <_IcGovt s={14}/>   },
  { id: 'economy',       label: 'Economy',            icon: <_IcTrend s={14}/>  },
  { id: 'science',       label: 'Science & Tech',     icon: <_IcFlask s={14}/>  },
  { id: 'sports',        label: 'Sports',             icon: <_IcTrophy s={14}/> },
  { id: 'international', label: 'International',      icon: <_IcGlobe s={14}/>  },
]

const EXAM_TAGS = ['Banking', 'SSC', 'UPSC', 'Railway', 'RBI', 'General']

const CAT_META = {
  banking:       { color:'#059669', bg:'#ecfdf5', g1:'#d1fae5', g2:'#6ee7b7', label:'Banking & Finance' },
  government:    { color:'#7C3AED', bg:'#f5f3ff', g1:'#ede9fe', g2:'#c4b5fd', label:'Govt & Policy'     },
  economy:       { color:'#D97706', bg:'#fffbeb', g1:'#fef3c7', g2:'#fcd34d', label:'Economy'           },
  science:       { color:'#0891B2', bg:'#ecfeff', g1:'#cffafe', g2:'#67e8f9', label:'Science & Tech'    },
  sports:        { color:'#DC2626', bg:'#fff1f2', g1:'#fee2e2', g2:'#fca5a5', label:'Sports'            },
  international: { color:'#2563EB', bg:'#eff6ff', g1:'#dbeafe', g2:'#93c5fd', label:'International'     },
}
const catMeta = (id) => CAT_META[id] || { color:'#F06535', bg:'#FFF3EE', g1:'#fde8df', g2:'#fdb99e', label: id }
const catIcon = (id) => CATEGORIES.find(c => c.id === id)?.icon || <_IcNews s={20} c='#fff'/>

const PER_PAGE = 9

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr), t = new Date()
  return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate()
}

/* ─── Globe SVG (decorative hero element) ───────────────────────────────── */
function GlobeDecor() {
  return (
    <svg viewBox="0 0 280 280" width="280" height="280" aria-hidden="true"
      style={{ position:'absolute', right: 0, top:'50%', transform:'translateY(-50%)', opacity:.18, pointerEvents:'none' }}>
      <circle cx="140" cy="140" r="130" fill="none" stroke="#60a5fa" strokeWidth="1.2"/>
      {[-70,-42,-14,14,42,70].map(lat => {
        const ry = 130, cy = 140 - (lat/90)*125
        const rx = Math.sqrt(Math.max(0, ry*ry - (cy-140)*(cy-140))) * 0.95
        return rx > 2 ? <ellipse key={lat} cx="140" cy={cy} rx={rx} ry={rx*0.28} fill="none" stroke="#93c5fd" strokeWidth="0.8"/> : null
      })}
      {[0,30,60,90,120,150].map(lon => (
        <ellipse key={lon} cx="140" cy="140" rx={Math.abs(Math.cos(lon*Math.PI/180))*128} ry="130"
          transform={`rotate(${lon} 140 140)`} fill="none" stroke="#93c5fd" strokeWidth="0.8"/>
      ))}
      {[[160,80],[200,130],[110,170],[180,200],[90,100],[230,80]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={2+i%2} fill="#60a5fa" opacity="0.7"/>
      ))}
    </svg>
  )
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
function ArticleCard({ item, index, expanded, onToggle, bookmarked, onBookmark }) {
  const meta     = catMeta(item.category)
  const rawCat  = item.category || ''
  const catLabel = CATEGORIES.find(c => c.id === rawCat)?.label
    || (rawCat ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : 'General')
  const catIc    = CATEGORIES.find(c => c.id === item.category)?.icon || <_IcNews s={16} c={meta.color}/>
  const key      = item.id || `${item.date}-${index}`
  const isOpen   = expanded === key
  const isSaved  = bookmarked.has(key)
  const today    = isToday(item.date)

  /* thumbnail: real image if available, else styled category header */
  const thumb = item.image_url ? (
    <img src={item.image_url} alt={item.headline}
      style={{ width:'100%', height:160, objectFit:'cover', display:'block', flexShrink:0 }}
      loading="lazy"
      onError={e => { e.target.style.display = 'none' }}/>
  ) : (
    <div style={{
      height: 96, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${meta.g1} 0%, ${meta.g2} 100%)`,
    }}>
      {/* Diagonal stripe texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 1,
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          ${meta.color}0a 0px, ${meta.color}0a 1px,
          transparent 1px, transparent 10px
        )`,
      }}/>
      {/* Large watermark icon — right side */}
      <div style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        opacity: 0.18, display: 'flex',
      }}>
        <span style={{ color: meta.color }}>
          {React.cloneElement(catIc, { s: 48 })}
        </span>
      </div>
      {/* Category pill — bottom left */}
      <div style={{
        position: 'absolute', bottom: 10, left: 12,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: meta.color, color: '#fff',
        padding: '4px 10px', borderRadius: 20,
        fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
        boxShadow: `0 2px 8px ${meta.color}50`,
      }}>
        <span style={{ display: 'flex', opacity: .9 }}>{React.cloneElement(catIc, { s: 11, c: '#fff' })}</span>
        {catLabel}
      </div>
      {/* Date chip — top right */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(4px)',
        padding: '3px 9px', borderRadius: 8,
        fontSize: 10, fontWeight: 700,
        color: today ? '#F06535' : '#374151',
      }}>
        {today ? 'Today' : formatDate(item.date)}
      </div>
    </div>
  )

  return (
    <div className="ca-card">
      {thumb}

      {/* Content */}
      <div style={{ padding: '14px 15px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Headline */}
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.55,
          marginBottom: 7,
          display: '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2, WebkitBoxOrient: 'vertical',
          overflow: isOpen ? 'visible' : 'hidden',
        }}>
          {item.headline}
        </div>

        {/* Detail */}
        {item.detail && (
          <div style={{
            fontSize: 12.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 10,
            display: isOpen ? 'block' : '-webkit-box',
            WebkitLineClamp: isOpen ? 'unset' : 2, WebkitBoxOrient: 'vertical',
            overflow: isOpen ? 'visible' : 'hidden',
          }}>
            {item.detail}
          </div>
        )}

        {/* Exam tags */}
        {(item.tags || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {(item.tags || []).map(tag => (
              <span key={tag} style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                background: '#f3f4f6', color: '#4b5563', borderRadius: 6,
              }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Footer: source | Read More | Bookmark */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #f0f0f0',
        }}>
          {item.source ? (
            <span style={{
              fontSize: 11, color: '#b0b7c3', fontWeight: 500, maxWidth: 120,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <_IcPin s={9} c='#b0b7c3'/>{item.source}
            </span>
          ) : <span/>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.detail && (
              <button onClick={() => onToggle(key)}
                style={{
                  fontSize: 12, fontWeight: 700, color: '#F06535',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  letterSpacing: '.01em',
                }}>
                {isOpen ? 'Less ↑' : <><span>Read More</span><_IcArrow s={11} c='#F06535'/></>}
              </button>
            )}
            <button onClick={() => onBookmark(key)} title={isSaved ? 'Remove bookmark' : 'Bookmark'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '3px 4px', display: 'inline-flex', alignItems: 'center',
              }}>
              <_IcBookmark s={15} c={isSaved ? '#F06535' : '#d1d5db'} fill={isSaved ? '#F06535' : 'none'}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ page, total, onChange }) {
  if (total <= 1) return null
  const pages = Array.from({ length: total }, (_, i) => i + 1)
  // Show max 5 page numbers
  let visible = pages
  if (total > 5) {
    const start = Math.max(1, Math.min(page - 2, total - 4))
    visible = pages.slice(start - 1, start + 4)
  }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:48, flexWrap:'wrap' }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="ca-pg-btn" style={{ opacity: page===1 ? .35 : 1 }}>
        ← Prev
      </button>
      {visible[0] > 1 && <>
        <button className="ca-pg-btn" onClick={() => onChange(1)}>1</button>
        {visible[0] > 2 && <span style={{ color:'#9ca3af', padding:'0 2px' }}>…</span>}
      </>}
      {visible.map(p => (
        <button key={p} className="ca-pg-btn" onClick={() => onChange(p)}
          style={{ background: p===page ? '#F06535' : '#fff', color: p===page ? '#fff' : '#374151',
            borderColor: p===page ? '#F06535' : '#e5e7eb', fontWeight: p===page ? 700 : 500 }}>
          {p}
        </button>
      ))}
      {visible[visible.length-1] < total && <>
        {visible[visible.length-1] < total - 1 && <span style={{ color:'#9ca3af', padding:'0 2px' }}>…</span>}
        <button className="ca-pg-btn" onClick={() => onChange(total)}>{total}</button>
      </>}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        className="ca-pg-btn" style={{ opacity: page===total ? .35 : 1 }}>
        Next →
      </button>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function CurrentAffairsPage({ onNav }) {
  /* ── existing state (unchanged) ── */
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [category,   setCategory]   = useState('all')
  const [examFilter, setExamFilter] = useState('all')
  const [search,     setSearch]     = useState('')
  const [expanded,   setExpanded]   = useState(null)
  const [dateRange,  setDateRange]  = useState('week')

  /* ── new UI state ── */
  const [page,       setPage]       = useState(1)
  const [sort,       setSort]       = useState('newest')
  const [sortOpen,   setSortOpen]   = useState(false)
  const [bookmarked, setBookmarked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ca_bookmarks') || '[]')) } catch { return new Set() }
  })

  /* ── existing data fetch (UNCHANGED logic) ── */
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let from = new Date()
        if (dateRange === 'today') {
          from.setHours(0, 0, 0, 0)
        } else if (dateRange === 'week') {
          from.setDate(from.getDate() - 7)
        } else {
          from.setDate(from.getDate() - 30)
        }

        let q = supabase
          .from('current_affairs')
          .select('*')
          .gte('date', from.toISOString().split('T')[0])
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(200)

        if (category !== 'all') q = q.eq('category', category)
        if (examFilter !== 'all') q = q.contains('tags', [examFilter])

        const { data, error: err } = await q
        if (err) throw err
        setItems(data || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category, examFilter, dateRange])

  /* ── reset page on any filter change ── */
  useEffect(() => { setPage(1) }, [category, examFilter, search, dateRange, sort])

  /* ── existing filter logic (unchanged) ── */
  const filtered = search.trim()
    ? items.filter(it =>
        (it.headline || '').toLowerCase().includes(search.toLowerCase()) ||
        (it.detail   || '').toLowerCase().includes(search.toLowerCase())
      )
    : items

  /* ── sort ── */
  const sorted = sort === 'oldest' ? [...filtered].reverse() : filtered

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleExpand = useCallback((key) => setExpanded(prev => prev === key ? null : key), [])

  const toggleBookmark = useCallback((key) => {
    setBookmarked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      try { localStorage.setItem('ca_bookmarks', JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const clearAll = () => { setCategory('all'); setExamFilter('all'); setSearch(''); setDateRange('week') }

  const hasFilters = category !== 'all' || examFilter !== 'all' || search.trim() !== '' || dateRange !== 'week'

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#f8fafc', minHeight:'100vh', color:'#111827' }}
      onClick={() => sortOpen && setSortOpen(false)}>

      <style>{`
        *{box-sizing:border-box}

        /* Card */
        .ca-card{
          background:#fff; border:1.5px solid #e5e7eb; border-radius:16px;
          overflow:hidden; transition:border-color .15s,box-shadow .18s,transform .15s;
          display:flex; flex-direction:column;
        }
        .ca-card:hover{
          border-color:#F06535; box-shadow:0 8px 28px rgba(232,90,44,.12);
          transform:translateY(-2px);
        }

        /* Category chip */
        .ca-chip{
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 13px; border-radius:22px; border:1.5px solid;
          font-size:13px; font-weight:600; cursor:pointer;
          white-space:nowrap; transition:all .12s; flex-shrink:0;
        }

        /* Exam/date pill */
        .ca-pill{
          padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;
          cursor:pointer; border:1.5px solid; transition:all .12s; white-space:nowrap;
        }

        /* Pagination button */
        .ca-pg-btn{
          min-width:36px; height:36px; padding:0 10px; border-radius:9px;
          font-size:13px; font-weight:600; cursor:pointer;
          background:#fff; color:#374151; border:1.5px solid #e5e7eb;
          transition:all .12s; display:inline-flex; align-items:center;
          justify-content:center; gap:4px;
        }
        .ca-pg-btn:hover:not(:disabled){ border-color:#F06535; color:#F06535 }
        .ca-pg-btn:disabled{ cursor:default }

        /* Scrollbar hidden on filter row */
        .ca-scroll::-webkit-scrollbar{ display:none }
        .ca-scroll{ -ms-overflow-style:none; scrollbar-width:none }

        /* Animations */
        @keyframes ca-spin{ to{ transform:rotate(360deg) } }
        @keyframes ca-pulse{ 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes ca-fade-up{
          from{ opacity:0; transform:translateY(14px) }
          to{   opacity:1; transform:translateY(0) }
        }
        .ca-fade-up{ animation:ca-fade-up .35s cubic-bezier(.22,1,.36,1) both }
        @media(prefers-reduced-motion:reduce){
          .ca-fade-up{ animation:none!important; opacity:1!important }
          .ca-card{ transition:border-color .1s!important; transform:none!important }
        }

        /* Sort dropdown */
        .ca-sort-dd{
          position:absolute; top:calc(100% + 6px); right:0; min-width:160px;
          background:#fff; border:1.5px solid #e5e7eb; border-radius:12px;
          box-shadow:0 8px 24px rgba(0,0,0,.1); z-index:100; overflow:hidden;
          animation:ca-fade-up .12s ease;
        }
        .ca-sort-opt{
          width:100%; padding:10px 14px; background:none; border:none;
          font-size:13px; font-weight:500; color:#374151; cursor:pointer;
          text-align:left; transition:background .1s;
        }
        .ca-sort-opt:hover{ background:#f9fafb }
        .ca-sort-opt.active{ color:#F06535; font-weight:700; background:#FFF3EE }

        /* Responsive grid */
        .ca-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
        }
        @media(max-width:900px){
          .ca-grid{ grid-template-columns:repeat(2,1fr); gap:16px }
        }
        @media(max-width:540px){
          .ca-grid{ grid-template-columns:1fr; gap:14px }
        }

        /* Filter row wrapping */
        @media(max-width:640px){
          .ca-exam-row{ flex-wrap:wrap!important }
          .ca-date-row{ margin-left:0!important; flex-shrink:0 }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <div style={{
        background:'linear-gradient(135deg, #070f20 0%, #0d1a35 55%, #0a2040 100%)',
        padding:'52px 24px 48px', position:'relative', overflow:'hidden',
      }}>
        {/* Glow blobs */}
        <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', background:'#3b82f6', opacity:.06, top:-80, right:'8%', filter:'blur(60px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'#F06535', opacity:.07, bottom:-60, left:'5%', filter:'blur(48px)', pointerEvents:'none' }}/>
        {/* Globe */}
        <div className="ca-globe" style={{ position:'absolute', right:'4%', top:0, bottom:0, display:'flex', alignItems:'center', overflow:'hidden' }}>
          <GlobeDecor/>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7,
            background:'rgba(232,90,44,.14)', border:'1px solid rgba(232,90,44,.28)',
            color:'#F06535', borderRadius:22, padding:'5px 14px',
            fontSize:11, fontWeight:700, marginBottom:18, letterSpacing:'.07em', textTransform:'uppercase',
          }}>
            <span style={{ width:6, height:6, background:'#F06535', borderRadius:'50%', display:'inline-block', animation:'ca-pulse 2s infinite', flexShrink:0 }}/>
            Updated Daily
          </div>

          <h1 style={{ fontSize:'clamp(26px,4.5vw,48px)', fontWeight:900, color:'#fff', marginBottom:10, letterSpacing:'-0.8px', lineHeight:1.15, maxWidth:600 }}>
            Current Affairs
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.5)', maxWidth:480, lineHeight:1.75, marginBottom:28 }}>
            Stay updated with the latest national, international, economic, and exam-focused current affairs.
          </p>

          {/* Search */}
          <div style={{ position:'relative', maxWidth:460 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', display:'inline-flex', pointerEvents:'none' }}>
              <_IcSearch s={16} c='rgba(255,255,255,.35)'/>
            </span>
            <input
              type="search"
              placeholder="Search current affairs (e.g., Budget, ISRO, RBI…)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px 12px 42px',
                background:'rgba(255,255,255,.09)', border:'1.5px solid rgba(255,255,255,.14)',
                borderRadius:12, color:'#fff', fontSize:14, outline:'none',
                transition:'border-color .15s', caretColor:'#F06535',
              }}
              onFocus={e  => e.target.style.borderColor = 'rgba(232,90,44,.5)'}
              onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,.14)'}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.4)', fontSize:16, lineHeight:1 }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ STICKY FILTER BAR ══ */}
      <div style={{
        background:'#fff', borderBottom:'1px solid #e5e7eb',
        padding:'12px 24px 10px', position:'sticky', top:58, zIndex:40,
        boxShadow:'0 1px 8px rgba(0,0,0,.06)',
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:8 }}>

          {/* Category row */}
          <div className="ca-scroll" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} className="ca-chip" onClick={() => setCategory(c.id)}
                style={{
                  borderColor: category===c.id ? '#F06535' : '#e5e7eb',
                  background:  category===c.id ? '#F06535' : '#f9fafb',
                  color:       category===c.id ? '#fff'    : '#4b5563',
                }}>
                <span style={{ display:'inline-flex', alignItems:'center', opacity:.85 }}>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Exam + date row */}
          <div className="ca-exam-row ca-scroll" style={{ display:'flex', gap:6, alignItems:'center', overflowX:'auto', paddingBottom:2 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', flexShrink:0, textTransform:'uppercase', letterSpacing:'.07em' }}>Exam:</span>
            <button className="ca-pill" onClick={() => setExamFilter('all')}
              style={{ borderColor: examFilter==='all'?'#111':'#e5e7eb', background: examFilter==='all'?'#111':'#f9fafb', color: examFilter==='all'?'#fff':'#4b5563' }}>
              All Exams
            </button>
            {EXAM_TAGS.map(t => (
              <button key={t} className="ca-pill" onClick={() => setExamFilter(t)}
                style={{ borderColor: examFilter===t?'#111':'#e5e7eb', background: examFilter===t?'#111':'#f9fafb', color: examFilter===t?'#fff':'#4b5563' }}>
                {t}
              </button>
            ))}

            <div className="ca-date-row" style={{ marginLeft:'auto', display:'flex', gap:4, flexShrink:0 }}>
              {[['today','Today'],['week','This Week'],['month','This Month']].map(([v,l]) => (
                <button key={v} className="ca-pill" onClick={() => setDateRange(v)}
                  style={{ borderColor: dateRange===v?'#F06535':'#e5e7eb', background: dateRange===v?'#FFF3EE':'#f9fafb', color: dateRange===v?'#F06535':'#4b5563' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 72px' }}>

        {/* Section header */}
        {!loading && !error && (
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:4, height:22, borderRadius:2, background:'#F06535', flexShrink:0 }}/>
                <h2 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:0, letterSpacing:'-.3px' }}>Latest Current Affairs</h2>
              </div>
              <div style={{ marginTop:6, marginLeft:14, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                {filtered.length > 0 && (
                  <span style={{
                    display:'inline-flex', alignItems:'center',
                    padding:'2px 10px', background:'#f3f4f6', color:'#374151',
                    borderRadius:20, fontSize:12, fontWeight:600,
                  }}>
                    {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                  </span>
                )}
                {hasFilters && (
                  <button onClick={clearAll}
                    style={{ fontSize:12, color:'#F06535', background:'none', border:'1px solid #ffd0be', borderRadius:20,
                      cursor:'pointer', fontWeight:600, padding:'2px 10px', lineHeight:1.4 }}>
                    Clear filters ×
                  </button>
                )}
              </div>
            </div>

            {/* Sort dropdown */}
            {filtered.length > 1 && (
              <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setSortOpen(o => !o)}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', transition:'border-color .12s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='#F06535'}
                  onMouseOut={e  => e.currentTarget.style.borderColor='#e5e7eb'}>
                  <_IcSort s={13} c='#6b7280'/>
                  <span style={{ color:'#9ca3af', fontWeight:500 }}>Sort:</span>&nbsp;<span style={{ color:'#F06535' }}>{sort === 'newest' ? 'Latest First' : 'Oldest First'}</span>
                  <_IcChevron s={12} c='#9ca3af' dir={sortOpen?'up':'down'}/>
                </button>
                {sortOpen && (
                  <div className="ca-sort-dd">
                    {[['newest','Latest First'],['oldest','Oldest First']].map(([v,l]) => (
                      <button key={v} className={`ca-sort-opt${sort===v?' active':''}`}
                        onClick={() => { setSort(v); setSortOpen(false) }}>
                        {sort===v && '✓ '}{l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:40, height:40, border:'3px solid #fde8df', borderTopColor:'#F06535', borderRadius:'50%', animation:'ca-spin .7s linear infinite', margin:'0 auto 16px' }}/>
            <p style={{ color:'#9ca3af', fontSize:14, fontWeight:500 }}>Loading current affairs…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'#fff5f5', border:'1.5px solid #fca5a5', borderRadius:16, padding:'32px 24px', textAlign:'center', maxWidth:480, margin:'0 auto' }}>
            <div style={{ marginBottom:12, display:'flex', justifyContent:'center' }}><_IcWarn s={32} c='#dc2626'/></div>
            <div style={{ fontWeight:700, color:'#dc2626', marginBottom:6, fontSize:16 }}>Could not load current affairs</div>
            <div style={{ color:'#9ca3af', fontSize:13, marginBottom:20 }}>{error}</div>
            <button onClick={() => window.location.reload()}
              style={{ padding:'9px 20px', background:'#F06535', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
              <_IcRefresh s={13} c='#fff'/> Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:20, padding:'64px 24px', textAlign:'center', maxWidth:420, margin:'0 auto' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <_IcEmpty s={32} c='#9ca3af'/>
            </div>
            <div style={{ fontSize:18, fontWeight:800, color:'#111827', marginBottom:8 }}>No items found</div>
            <p style={{ color:'#6b7280', fontSize:14, lineHeight:1.65, marginBottom:28 }}>
              {search
                ? <>No results for <strong>"{search}"</strong>. Try different keywords.</>
                : 'No current affairs for the selected filters yet. Try a different category or date range.'}
            </p>
            <button onClick={clearAll}
              style={{ padding:'11px 28px', background:'#F06535', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Article grid */}
        {!loading && !error && paginated.length > 0 && (
          <div className="ca-grid">
            {paginated.map((item, i) => (
              <div key={item.id || `${item.date}-${i}`} className="ca-fade-up"
                style={{ animationDelay:`${Math.min(i, 8) * 0.04}s` }}>
                <ArticleCard
                  item={item} index={i}
                  expanded={expanded} onToggle={toggleExpand}
                  bookmarked={bookmarked} onBookmark={toggleBookmark}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <Pagination page={page} total={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior:'smooth' }) }}/>
        )}
      </div>

      <style>{`
        /* Hide globe on narrow screens */
        @media(max-width:640px){ .ca-globe{ display:none!important } }
        /* Search input placeholder */
        input[type=search]::placeholder{ color:rgba(255,255,255,.3) }
        input[type=search]::-webkit-search-cancel-button{ -webkit-appearance:none }
      `}</style>
    </div>
  )
}
