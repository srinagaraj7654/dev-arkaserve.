import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase.js'
import { currentAffairs, currentAffairsCount } from '../data/userData.js'

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const _sv = (c,w) => ({fill:'none',stroke:c||'currentColor',strokeWidth:w||'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const IcNews    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="12" y1="6" x2="18" y2="6"/><line x1="12" y1="10" x2="18" y2="10"/><line x1="12" y1="14" x2="18" y2="14"/></svg>
const IcBank    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 21h18M3 10h18M3 10l9-7 9 7"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></svg>
const IcTrend   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IcBuild2  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>
const IcCard    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
const IcWallet  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H4a2 2 0 0 0-2 2v2"/><circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/></svg>
const IcGlobe   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IcSearch  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IcWarn    = ({s=30,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IcEmpty   = ({s=48,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
const IcPin     = ({s=11,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IcBookmark= ({s=14,c,fill}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill||'none'} stroke={c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
const IcChevron = ({s=14,c,dir='down'}) => { const pts = dir==='up'?'18 15 12 9 6 15':dir==='right'?'9 18 15 12 9 6':'6 9 12 15 18 9'; return <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points={pts}/></svg> }
const IcArrow   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IcSort    = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>
const IcRefresh = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
const IcCalendar= ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcPlay    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c||'currentColor'} stroke="none"><circle cx="12" cy="12" r="10" fill="none" stroke={c||'currentColor'} strokeWidth="1.5"/><polygon points="10 8 16 12 10 16 10 8" fill={c||'currentColor'}/></svg>
const IcChart   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IcFile    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>

/* ─── Banking categories ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',              label: 'All',                  icon: <IcNews s={14}/>    },
  { id: 'banking',         label: 'Banking & Finance',    icon: <IcBank s={14}/>    },
  { id: 'economy',         label: 'Economy',              icon: <IcTrend s={14}/>   },
  { id: 'rbi_regulations', label: 'RBI & Regulations',    icon: <IcBuild2 s={14}/>  },
  { id: 'digital_banking', label: 'Digital Banking',      icon: <IcCard s={14}/>    },
  { id: 'banking_schemes', label: 'Banking Schemes',      icon: <IcWallet s={14}/>  },
  { id: 'international',   label: 'International (Banking)', icon: <IcGlobe s={14}/> },
]

/* Banking exam tags only */
const EXAM_TAGS = ['IBPS', 'SBI', 'RBI', 'RRB', 'NABARD']

const CAT_META = {
  banking:          { color:'#F06535', bg:'#FFF3EE', g1:'#fde8df', g2:'#fdb99e', label:'Banking & Finance'     },
  economy:          { color:'#D97706', bg:'#fffbeb', g1:'#fef3c7', g2:'#fcd34d', label:'Economy'               },
  rbi_regulations:  { color:'#7C3AED', bg:'#f5f3ff', g1:'#ede9fe', g2:'#c4b5fd', label:'RBI & Regulations'     },
  digital_banking:  { color:'#0891B2', bg:'#ecfeff', g1:'#cffafe', g2:'#67e8f9', label:'Digital Banking'       },
  banking_schemes:  { color:'#059669', bg:'#ecfdf5', g1:'#d1fae5', g2:'#6ee7b7', label:'Banking Schemes'       },
  international:    { color:'#2563EB', bg:'#eff6ff', g1:'#dbeafe', g2:'#93c5fd', label:'International (Banking)'},
  government:       { color:'#7C3AED', bg:'#f5f3ff', g1:'#ede9fe', g2:'#c4b5fd', label:'Govt & Policy'         },
  science:          { color:'#0891B2', bg:'#ecfeff', g1:'#cffafe', g2:'#67e8f9', label:'Science & Tech'        },
  sports:           { color:'#DC2626', bg:'#fff1f2', g1:'#fee2e2', g2:'#fca5a5', label:'Sports'                },
}
const catMeta = (id) => CAT_META[id] || { color:'#F06535', bg:'#FFF3EE', g1:'#fde8df', g2:'#fdb99e', label: id }
const catIcon = (id) => CATEGORIES.find(c => c.id === id)?.icon || <IcNews s={20} c='#fff'/>

const PER_PAGE = 9

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
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

/* ─── Bank Building Illustration (SVG) ───────────────────────────────────── */
function BankIllustration() {
  return (
    <svg viewBox="0 0 320 240" width="320" height="240" aria-hidden="true"
      style={{ display:'block', maxWidth:'100%', height:'auto' }}>

      {/* Sky gradient background */}
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#0d1b2a" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8d8f0"/>
          <stop offset="100%" stopColor="#8faad0"/>
        </linearGradient>
        <linearGradient id="arrowGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background glow circle */}
      <circle cx="160" cy="110" r="95" fill="url(#bgGrad)"/>

      {/* Ground */}
      <ellipse cx="160" cy="210" rx="130" ry="12" fill="#1a3356" opacity="0.4"/>

      {/* ── Bank Building ── */}
      {/* Main body */}
      <rect x="80" y="115" width="100" height="85" fill="url(#buildingGrad)" rx="1"/>
      {/* Columns */}
      {[92, 108, 124, 140, 156, 164].map((x, i) => (
        <rect key={i} x={x + i * 0} y="85" width="8" height="115" fill="#a8c0e0" rx="2"/>
      ))}
      {/* Front steps */}
      <rect x="72" y="195" width="116" height="6" fill="#9bb3d4" rx="1"/>
      <rect x="68" y="200" width="124" height="5" fill="#8aabc8" rx="1"/>
      {/* Pediment (triangle roof) */}
      <polygon points="75,115 185,115 130,70" fill="#adc3e0"/>
      <polygon points="80,115 180,115 130,76" fill="#c5d8ed"/>
      {/* Frieze bar */}
      <rect x="78" y="112" width="104" height="8" fill="#b8cde3"/>
      {/* Architrave */}
      <rect x="76" y="108" width="108" height="7" fill="#9cb8d6"/>

      {/* Emblem/Seal on pediment */}
      <circle cx="130" cy="92" r="12" fill="#d4aa30" stroke="#f5d060" strokeWidth="1"/>
      <circle cx="130" cy="92" r="9" fill="#c9981e" stroke="#f0c040" strokeWidth="0.5"/>
      {/* Lion silhouette in seal */}
      <path d="M125 96c0 0 1-5 5-5s5 5 5 5" fill="#a07010" stroke="none"/>
      <ellipse cx="130" cy="90" rx="3" ry="2.5" fill="#a07010"/>

      {/* Engraving text area */}
      <rect x="90" y="140" width="80" height="4" fill="#8aabc8" rx="1" opacity="0.6"/>
      <rect x="95" y="148" width="70" height="3" fill="#8aabc8" rx="1" opacity="0.4"/>

      {/* Door */}
      <rect x="118" y="170" width="24" height="30" fill="#6a90b8" rx="2"/>
      <rect x="120" y="172" width="10" height="14" fill="#517aab" rx="1"/>
      <rect x="130.5" y="172" width="10" height="14" fill="#517aab" rx="1"/>
      {/* Door knob */}
      <circle cx="129" cy="186" r="1.5" fill="#f5d060"/>

      {/* Windows */}
      {[90, 150].map(x => (
        <g key={x}>
          <rect x={x} y="135" width="14" height="20" fill="#6a90b8" rx="1"/>
          <rect x={x+1} y="136" width="5.5" height="9" fill="#517aab" rx="0.5"/>
          <rect x={x+7.5} y="136" width="5.5" height="9" fill="#517aab" rx="0.5"/>
        </g>
      ))}

      {/* ── Coins stack (right side) ── */}
      {[0,1,2,3].map(i => (
        <g key={i} transform={`translate(0,${-i*6})`}>
          <ellipse cx="216" cy="193" rx="20" ry="6" fill={i===0?"#d97706":"#b45309"} opacity={1-i*0.08}/>
          <ellipse cx="216" cy="191" rx="20" ry="6" fill="#fbbf24" opacity={1-i*0.08}/>
        </g>
      ))}
      {/* Coin shine */}
      <ellipse cx="210" cy="168" rx="7" ry="2.5" fill="#fde68a" opacity="0.5"/>

      {/* ── Upward graph / arrow ── */}
      {/* Bar chart mini */}
      <rect x="225" y="165" width="8" height="22" fill="#1e40af" opacity="0.8" rx="1"/>
      <rect x="237" y="155" width="8" height="32" fill="#1e40af" opacity="0.8" rx="1"/>
      <rect x="249" y="145" width="8" height="42" fill="#2563eb" opacity="0.8" rx="1"/>

      {/* Upward arrow/trend line */}
      <polyline points="224,170 240,155 256,140 272,120" stroke="url(#arrowGrad)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#glow)"/>
      {/* Arrow head */}
      <polygon points="272,120 262,122 268,112" fill="#f97316" filter="url(#glow)"/>

      {/* Star/sparkle accents */}
      {[[67,75],[245,80],[195,105]].map(([x,y], i) => (
        <g key={i} opacity={0.6 + i * 0.1}>
          <line x1={x} y1={y-5} x2={x} y2={y+5} stroke="#f5d060" strokeWidth="1.5"/>
          <line x1={x-5} y1={y} x2={x+5} y2={y} stroke="#f5d060" strokeWidth="1.5"/>
        </g>
      ))}

      {/* Floating coin */}
      <ellipse cx="75" cy="150" rx="12" ry="12" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="75" cy="148" rx="10" ry="10" fill="#fde68a" opacity="0.7"/>
      <text x="75" y="152" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400e">₹</text>
    </svg>
  )
}

/* ─── Article Card ──────────────────────────────────────────────────────── */
function ArticleCard({ item, index, expanded, onToggle, bookmarked, onBookmark }) {
  const meta     = catMeta(item.category)
  const rawCat   = item.category || ''
  const catLabel = CATEGORIES.find(c => c.id === rawCat)?.label
    || (rawCat ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : 'General')
  const catIc    = CATEGORIES.find(c => c.id === item.category)?.icon || <IcNews s={16} c={meta.color}/>
  const key      = item.id || `${item.date}-${index}`
  const isOpen   = expanded === key
  const isSaved  = bookmarked.has(key)
  const today    = isToday(item.date)

  const thumb = item.image_url ? (
    <img src={item.image_url} alt={item.headline}
      style={{ width:'100%', height:168, objectFit:'cover', display:'block', flexShrink:0 }}
      loading="lazy"
      onError={e => { e.target.style.display = 'none' }}/>
  ) : (
    <div style={{
      height:112, flexShrink:0, position:'relative', overflow:'hidden',
      background:`linear-gradient(135deg, ${meta.g1} 0%, ${meta.g2} 100%)`,
    }}>
      <div style={{ position:'absolute', inset:0, opacity:1,
        backgroundImage:`repeating-linear-gradient(-45deg,${meta.color}0a 0px,${meta.color}0a 1px,transparent 1px,transparent 10px)` }}/>
      <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', opacity:0.18, display:'flex', color:meta.color }}>
        {React.cloneElement(catIc, { s:52 })}
      </div>
      {/* Category pill */}
      <div style={{ position:'absolute', bottom:10, left:12,
        display:'inline-flex', alignItems:'center', gap:5,
        background:meta.color, color:'#fff', padding:'4px 10px', borderRadius:20,
        fontSize:10, fontWeight:700, letterSpacing:'.04em', boxShadow:`0 2px 8px ${meta.color}50` }}>
        <span style={{ display:'flex', opacity:.9 }}>{React.cloneElement(catIc, { s:11, c:'#fff' })}</span>
        {catLabel}
      </div>
      {/* Date chip */}
      <div style={{ position:'absolute', top:10, right:10,
        background:'rgba(255,255,255,.88)', backdropFilter:'blur(4px)',
        padding:'3px 9px', borderRadius:8, fontSize:10, fontWeight:700,
        color: today ? '#F06535' : '#374151' }}>
        {today ? 'Today' : formatDate(item.date)}
      </div>
    </div>
  )

  /* When image is present, overlay the category badge on top of image */
  const imageOverlay = item.image_url ? (
    <div style={{ position:'relative' }}>
      {thumb}
      <div style={{ position:'absolute', top:10, left:12,
        display:'inline-flex', alignItems:'center', gap:5,
        background:meta.color, color:'#fff', padding:'4px 10px', borderRadius:20,
        fontSize:10, fontWeight:700, letterSpacing:'.04em', boxShadow:`0 2px 8px ${meta.color}50` }}>
        <span style={{ display:'flex', opacity:.9 }}>{React.cloneElement(catIc, { s:11, c:'#fff' })}</span>
        {catLabel}
      </div>
      <div style={{ position:'absolute', top:10, right:10,
        background:'rgba(255,255,255,.88)', backdropFilter:'blur(4px)',
        padding:'3px 9px', borderRadius:8, fontSize:10, fontWeight:700,
        color: today ? '#F06535' : '#374151' }}>
        {today ? 'Today' : formatDate(item.date)}
      </div>
    </div>
  ) : thumb

  return (
    <div className="ca-card">
      {imageOverlay}
      <div style={{ padding:'14px 15px 12px', display:'flex', flexDirection:'column', flex:1 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.55, marginBottom:7,
          display:'-webkit-box', WebkitLineClamp:isOpen?'unset':2, WebkitBoxOrient:'vertical',
          overflow:isOpen?'visible':'hidden' }}>
          {item.headline}
        </div>
        {item.detail && (
          <div style={{ fontSize:12.5, color:'#6b7280', lineHeight:1.65, marginBottom:10,
            display:isOpen?'block':'-webkit-box',
            WebkitLineClamp:isOpen?'unset':2, WebkitBoxOrient:'vertical',
            overflow:isOpen?'visible':'hidden' }}>
            {item.detail}
          </div>
        )}
        {(item.tags || []).length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
            {(item.tags || []).map(tag => (
              <span key={tag} style={{ fontSize:10, fontWeight:600, padding:'2px 8px',
                background:'#f3f4f6', color:'#4b5563', borderRadius:6 }}>{tag}</span>
            ))}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop:'auto', paddingTop:10, borderTop:'1px solid #f0f0f0' }}>
          {item.source ? (
            <span style={{ fontSize:11, color:'#b0b7c3', fontWeight:500, maxWidth:120,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              display:'inline-flex', alignItems:'center', gap:3 }}>
              <IcPin s={9} c='#b0b7c3'/>{item.source}
            </span>
          ) : <span/>}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {item.detail && (
              <button onClick={() => onToggle(key)}
                style={{ fontSize:12, fontWeight:700, color:'#F06535',
                  background:'none', border:'none', cursor:'pointer', padding:0,
                  display:'inline-flex', alignItems:'center', gap:3, letterSpacing:'.01em' }}>
                {isOpen ? 'Less ↑' : <><span>Read More</span><IcArrow s={11} c='#F06535'/></>}
              </button>
            )}
            <button onClick={() => onBookmark(key)} title={isSaved ? 'Remove bookmark' : 'Bookmark'}
              style={{ background:'none', border:'none', cursor:'pointer',
                padding:'3px 4px', display:'inline-flex', alignItems:'center' }}>
              <IcBookmark s={15} c={isSaved?'#F06535':'#d1d5db'} fill={isSaved?'#F06535':'none'}/>
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
  let visible = pages
  if (total > 5) {
    const start = Math.max(1, Math.min(page - 2, total - 4))
    visible = pages.slice(start - 1, start + 4)
  }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:48, flexWrap:'wrap' }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="ca-pg-btn" style={{ opacity: page===1 ? .35 : 1 }}>← Prev</button>
      {visible[0] > 1 && <>
        <button className="ca-pg-btn" onClick={() => onChange(1)}>1</button>
        {visible[0] > 2 && <span style={{ color:'#9ca3af', padding:'0 2px' }}>…</span>}
      </>}
      {visible.map(p => (
        <button key={p} className="ca-pg-btn" onClick={() => onChange(p)}
          style={{ background:p===page?'#F06535':'#fff', color:p===page?'#fff':'#374151',
            borderColor:p===page?'#F06535':'#e5e7eb', fontWeight:p===page?700:500 }}>
          {p}
        </button>
      ))}
      {visible[visible.length-1] < total && <>
        {visible[visible.length-1] < total - 1 && <span style={{ color:'#9ca3af', padding:'0 2px' }}>…</span>}
        <button className="ca-pg-btn" onClick={() => onChange(total)}>{total}</button>
      </>}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        className="ca-pg-btn" style={{ opacity: page===total ? .35 : 1 }}>Next →</button>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function CurrentAffairsPage({ onNav }) {
  /* ── filter / view state ── */
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [category,   setCategory]   = useState('all')
  const [examFilter, setExamFilter] = useState('all')
  const [search,     setSearch]     = useState('')
  const [expanded,   setExpanded]   = useState(null)
  const [dateRange,  setDateRange]  = useState('today')
  const [page,       setPage]       = useState(1)
  const [sort,       setSort]       = useState('newest')
  const [sortOpen,   setSortOpen]   = useState(false)
  const [viewSaved,  setViewSaved]  = useState(false)

  /* ── snapshot state ── */
  const [snapArticles,  setSnapArticles]  = useState(null)
  const [snapQuestions, setSnapQuestions] = useState(null)

  const articlesRef = useRef(null)

  const [bookmarked, setBookmarked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ca_bookmarks') || '[]')) } catch { return new Set() }
  })

  /* ── fetch articles ── */
  useEffect(() => {
    async function load() {
      setLoading(true); setError(null)
      try {
        let from = new Date()
        if (dateRange === 'today')     from.setHours(0, 0, 0, 0)
        else if (dateRange === 'week') from.setDate(from.getDate() - 7)
        else                           from.setDate(from.getDate() - 30)

        const { data, error: err } = await currentAffairs({
          from: from.toISOString().split('T')[0],
          category: category !== 'all' ? category : undefined,
          exam: examFilter !== 'all' ? examFilter : undefined,
        })
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

  /* ── fetch snapshot counts ── */
  useEffect(() => {
    async function fetchSnap() {
      const todayStr = new Date().toISOString().split('T')[0]
      try {
        const { count } = await currentAffairsCount(todayStr)
        setSnapArticles(count ?? 0)
        // Approximate: 2 practice questions per article
        setSnapQuestions(count ? count * 2 : 0)
      } catch {}
    }
    fetchSnap()
  }, [])

  /* ── reset page on filter change ── */
  useEffect(() => { setPage(1) }, [category, examFilter, search, dateRange, sort, viewSaved])

  /* ── filter / sort / paginate ── */
  let filtered = viewSaved
    ? items.filter(it => bookmarked.has(it.id || `${it.date}-0`))
    : search.trim()
      ? items.filter(it =>
          (it.headline || '').toLowerCase().includes(search.toLowerCase()) ||
          (it.detail   || '').toLowerCase().includes(search.toLowerCase())
        )
      : items

  const sorted    = sort === 'oldest' ? [...filtered].reverse() : filtered
  const totalPages= Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleExpand   = useCallback((key) => setExpanded(prev => prev === key ? null : key), [])
  const toggleBookmark = useCallback((key) => {
    setBookmarked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      try { localStorage.setItem('ca_bookmarks', JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const clearAll  = () => { setCategory('all'); setExamFilter('all'); setSearch(''); setDateRange('today'); setViewSaved(false) }
  const hasFilters= viewSaved || category !== 'all' || examFilter !== 'all' || search.trim() !== '' || dateRange !== 'today'

  const scrollToArticles = () => {
    articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ── section heading ── */
  const sectionTitle = dateRange === 'today'
    ? "Today's Banking Current Affairs"
    : dateRange === 'week'
      ? "This Week's Banking Current Affairs"
      : "This Month's Banking Current Affairs"

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#f8fafc', minHeight:'100vh', color:'#111827' }}
      onClick={() => sortOpen && setSortOpen(false)}>

      <style>{`
        *{box-sizing:border-box}
        .ca-card{
          background:#fff; border:1.5px solid #e5e7eb; border-radius:16px;
          overflow:hidden; transition:border-color .15s,box-shadow .18s,transform .15s;
          display:flex; flex-direction:column;
        }
        .ca-card:hover{ border-color:#F06535; box-shadow:0 8px 28px rgba(232,90,44,.12); transform:translateY(-2px) }
        .ca-chip{
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 13px; border-radius:22px; border:1.5px solid;
          font-size:13px; font-weight:600; cursor:pointer;
          white-space:nowrap; transition:all .12s; flex-shrink:0;
        }
        .ca-pill{
          padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;
          cursor:pointer; border:1.5px solid; transition:all .12s; white-space:nowrap;
        }
        .ca-pg-btn{
          min-width:36px; height:36px; padding:0 10px; border-radius:9px;
          font-size:13px; font-weight:600; cursor:pointer;
          background:#fff; color:#374151; border:1.5px solid #e5e7eb;
          transition:all .12s; display:inline-flex; align-items:center;
          justify-content:center; gap:4px;
        }
        .ca-pg-btn:hover:not(:disabled){ border-color:#F06535; color:#F06535 }
        .ca-pg-btn:disabled{ cursor:default }
        .ca-scroll::-webkit-scrollbar{ display:none }
        .ca-scroll{ -ms-overflow-style:none; scrollbar-width:none }
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

        /* Article grid */
        .ca-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px }
        @media(max-width:1024px){ .ca-grid{ grid-template-columns:repeat(2,1fr); gap:16px } }
        @media(max-width:540px){  .ca-grid{ grid-template-columns:1fr; gap:14px } }

        /* Shortcut cards */
        .ca-shortcuts{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px }
        @media(max-width:900px){ .ca-shortcuts{ grid-template-columns:repeat(2,1fr) } }
        @media(max-width:480px){ .ca-shortcuts{ grid-template-columns:repeat(2,1fr); gap:10px } }

        /* Hero layout */
        .ca-hero-inner{ display:grid; grid-template-columns:1fr auto auto; gap:24px; align-items:center }
        @media(max-width:1024px){ .ca-hero-inner{ grid-template-columns:1fr auto; } .ca-hero-snap{ display:none } }
        @media(max-width:720px){  .ca-hero-inner{ grid-template-columns:1fr; } .ca-hero-illus{ display:none } }

        /* Shortcut card hover */
        .ca-short-card{ transition:box-shadow .18s, transform .15s, border-color .15s }
        .ca-short-card:hover{ box-shadow:0 8px 24px rgba(232,90,44,.13); transform:translateY(-2px); border-color:#F06535!important }

        /* Filter rows */
        @media(max-width:640px){
          .ca-exam-row{ flex-wrap:wrap!important }
          .ca-date-row{ margin-left:0!important; flex-shrink:0 }
        }

        input[type=search]::placeholder{ color:rgba(255,255,255,.3) }
        input[type=search]::-webkit-search-cancel-button{ -webkit-appearance:none }
        .ca-hero-search::placeholder{ color:rgba(255,255,255,.35)!important }
      `}</style>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <div style={{
        background:'linear-gradient(135deg, #060e1f 0%, #0b1830 45%, #0d1e3c 100%)',
        padding:'24px 24px 20px', position:'relative', overflow:'hidden',
      }}>
        {/* Background glow blobs */}
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'#3b82f6', opacity:.05, top:-100, right:'10%', filter:'blur(70px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'#F06535', opacity:.07, bottom:-70, left:'4%', filter:'blur(50px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'#f59e0b', opacity:.05, top:20, left:'30%', filter:'blur(40px)', pointerEvents:'none' }}/>

        <div className="ca-hero-inner" style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* ── Left: Content ── */}
          <div>
            {/* Badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:7,
              background:'rgba(232,90,44,.14)', border:'1px solid rgba(232,90,44,.30)',
              color:'#F06535', borderRadius:22, padding:'5px 14px',
              fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:'.07em', textTransform:'uppercase',
            }}>
              <span style={{ width:7, height:7, background:'#F06535', borderRadius:'50%', display:'inline-block', animation:'ca-pulse 2s infinite', flexShrink:0 }}/>
              Updated Daily
            </div>

            <h1 style={{ fontSize:'clamp(24px,2.4vw,40px)', fontWeight:900, color:'#fff', margin:'0 0 8px', letterSpacing:'-0.6px', lineHeight:1.12, whiteSpace:'nowrap' }}>
              Banking Current Affairs
            </h1>
            <p style={{ fontSize:16, fontWeight:700, color:'#F06535', margin:'0 0 10px', letterSpacing:'.01em' }}>
              Read. Revise. Practice. Succeed.
            </p>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.52)', maxWidth:440, lineHeight:1.6, margin:'0 0 14px' }}>
              Stay updated with important banking, financial, economic and regulatory news for IBPS, SBI, RBI, RRB and other Banking exams.
            </p>

            {/* Search */}
            <div style={{ position:'relative', maxWidth:460, marginBottom:14 }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', display:'inline-flex', pointerEvents:'none' }}>
                <IcSearch s={16} c='rgba(255,255,255,.35)'/>
              </span>
              <input
                type="search"
                className="ca-hero-search"
                placeholder="Search banking current affairs (e.g., RBI, Monetary Policy, UPI…)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width:'100%', padding:'12px 16px 12px 42px',
                  background:'rgba(255,255,255,.09)', border:'1.5px solid rgba(255,255,255,.14)',
                  borderRadius:12, color:'#fff', fontSize:13.5, outline:'none',
                  transition:'border-color .15s', caretColor:'#F06535',
                }}
                onFocus={e  => e.target.style.borderColor = 'rgba(232,90,44,.5)'}
                onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,.14)'}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.4)', fontSize:16, lineHeight:1 }}>×</button>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={() => { onNav && onNav('practice') }}
                style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'#F06535', color:'#fff',
                  border:'none', borderRadius:11, padding:'11px 22px',
                  fontSize:14, fontWeight:700, cursor:'pointer',
                  boxShadow:'0 4px 16px rgba(240,101,53,.4)',
                  transition:'background .15s, transform .1s',
                }}
                onMouseOver={e => e.currentTarget.style.background='#e55a2b'}
                onMouseOut={e  => e.currentTarget.style.background='#F06535'}>
                <IcPlay s={16} c='#fff'/>
                <span>Practice Daily Quiz</span>
                <IcArrow s={14} c='#fff'/>
              </button>
              <button onClick={() => { setDateRange('month'); scrollToArticles() }}
                style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'transparent', color:'#fff',
                  border:'1.5px solid rgba(255,255,255,.3)', borderRadius:11, padding:'11px 22px',
                  fontSize:14, fontWeight:600, cursor:'pointer',
                  transition:'border-color .15s, background .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.6)'; e.currentTarget.style.background='rgba(255,255,255,.05)' }}
                onMouseOut={e  => { e.currentTarget.style.borderColor='rgba(255,255,255,.3)';  e.currentTarget.style.background='transparent' }}>
                <IcCalendar s={15} c='#fff'/>
                <span>Monthly Revision</span>
              </button>
            </div>
          </div>

          {/* ── Center: Bank Illustration ── */}
          <div className="ca-hero-illus" style={{ display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <BankIllustration />
          </div>

          {/* ── Right: Today's Snapshot ── */}
          <div className="ca-hero-snap" style={{ flexShrink:0, minWidth:200 }}>
            <div style={{
              background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)',
              borderRadius:16, padding:'18px 20px', backdropFilter:'blur(8px)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <IcCalendar s={15} c='#f59e0b'/>
                <span style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'.01em' }}>Today's Snapshot</span>
              </div>
              {[
                { icon: <IcFile s={16} c='#60a5fa'/>,  label:'New Articles',       val: snapArticles  },
                { icon: <IcChart s={16} c='#34d399'/>,  label:'Practice Questions', val: snapQuestions },
                { icon: <IcBookmark s={15} c='#fb923c' fill='none'/>, label:'Saved for Revision', val: bookmarked.size },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {icon}
                    <span style={{ fontSize:12.5, color:'rgba(255,255,255,.65)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize:18, fontWeight:800, color:'#fff', minWidth:28, textAlign:'right' }}>
                    {val === null ? '—' : val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════ SHORTCUT CARDS ══════════════════════ */}
      <div style={{ background:'#fff', borderBottom:'1px solid #f0f0f0', padding:'20px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="ca-shortcuts">
            {[
              {
                icon: <IcNews s={22} c='#F06535'/>,
                title: 'Daily News',
                desc: 'Latest banking updates',
                onClick: () => { setDateRange('today'); setViewSaved(false); scrollToArticles() },
              },
              {
                icon: <IcBookmark s={20} c='#F06535' fill='none'/>,
                title: 'My Saved Items',
                desc: 'Read and revise later',
                onClick: () => { setViewSaved(v => !v); scrollToArticles() },
                active: viewSaved,
              },
              {
                icon: <IcCalendar s={20} c='#F06535'/>,
                title: 'Monthly Capsule',
                desc: 'Complete monthly summary',
                onClick: () => { setDateRange('month'); setViewSaved(false); scrollToArticles() },
                active: dateRange === 'month',
              },
              {
                icon: <IcChart s={20} c='#F06535'/>,
                title: 'Practice & Analysis',
                desc: 'Attempt quizzes and track progress',
                onClick: () => onNav && onNav('practice'),
              },
            ].map(({ icon, title, desc, onClick, active }) => (
              <button key={title} onClick={onClick} className="ca-short-card"
                style={{
                  display:'flex', alignItems:'center', gap:14,
                  background: active ? '#FFF3EE' : '#fff',
                  border:`1.5px solid ${active ? '#F06535' : '#e5e7eb'}`,
                  borderRadius:14, padding:'16px 18px',
                  cursor:'pointer', textAlign:'left', width:'100%',
                }}>
                <div style={{
                  width:46, height:46, borderRadius:12, flexShrink:0,
                  background:'#FFF3EE', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {icon}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
                  <div style={{ fontSize:12, color:'#9ca3af', lineHeight:1.4 }}>{desc}</div>
                </div>
                <IcChevron s={14} c='#d1d5db' dir='right' style={{ marginLeft:'auto', flexShrink:0 }}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ STICKY FILTER BAR ══════════════════════ */}
      <div style={{
        background:'#fff', borderBottom:'1px solid #e5e7eb',
        padding:'12px 24px 10px', position:'sticky', top:58, zIndex:40,
        boxShadow:'0 1px 8px rgba(0,0,0,.06)',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', flexDirection:'column', gap:8 }}>

          {/* Category row */}
          <div className="ca-scroll" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} className="ca-chip" onClick={() => { setCategory(c.id); setViewSaved(false) }}
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
              style={{ borderColor:examFilter==='all'?'#111':'#e5e7eb', background:examFilter==='all'?'#111':'#f9fafb', color:examFilter==='all'?'#fff':'#4b5563' }}>
              All Exams
            </button>
            {EXAM_TAGS.map(t => (
              <button key={t} className="ca-pill" onClick={() => setExamFilter(t)}
                style={{ borderColor:examFilter===t?'#111':'#e5e7eb', background:examFilter===t?'#111':'#f9fafb', color:examFilter===t?'#fff':'#4b5563' }}>
                {t}
              </button>
            ))}

            <div className="ca-date-row" style={{ marginLeft:'auto', display:'flex', gap:4, flexShrink:0 }}>
              {[['today','Today'],['week','This Week'],['month','This Month']].map(([v,l]) => (
                <button key={v} className="ca-pill" onClick={() => setDateRange(v)}
                  style={{ borderColor:dateRange===v?'#F06535':'#e5e7eb', background:dateRange===v?'#FFF3EE':'#f9fafb', color:dateRange===v?'#F06535':'#4b5563' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════ CONTENT ══════════════════════ */}
      <div ref={articlesRef} style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px 72px' }}>

        {/* Section header */}
        {!loading && !error && (
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:4, height:22, borderRadius:2, background:'#F06535', flexShrink:0 }}/>
                <h2 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:0, letterSpacing:'-.3px' }}>
                  {viewSaved ? 'My Saved Items' : sectionTitle}
                </h2>
              </div>
              <div style={{ marginTop:6, marginLeft:14, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                {filtered.length > 0 && (
                  <span style={{ display:'inline-flex', alignItems:'center',
                    padding:'2px 10px', background:'#f3f4f6', color:'#374151',
                    borderRadius:20, fontSize:12, fontWeight:600 }}>
                    {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                  </span>
                )}
                {!viewSaved && (
                  <span style={{ fontSize:12, color:'#9ca3af' }}>• Exam-focused summaries</span>
                )}
                {hasFilters && (
                  <button onClick={clearAll}
                    style={{ fontSize:12, color:'#F06535', background:'none', border:'1px solid #ffd0be',
                      borderRadius:20, cursor:'pointer', fontWeight:600, padding:'2px 10px', lineHeight:1.4 }}>
                    Clear filters ×
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            {filtered.length > 1 && (
              <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setSortOpen(o => !o)}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                    background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:10,
                    fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', transition:'border-color .12s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='#F06535'}
                  onMouseOut={e  => e.currentTarget.style.borderColor='#e5e7eb'}>
                  <IcSort s={13} c='#6b7280'/>
                  <span style={{ color:'#9ca3af', fontWeight:500 }}>Sort:</span>&nbsp;
                  <span style={{ color:'#F06535' }}>{sort === 'newest' ? 'Latest First' : 'Oldest First'}</span>
                  <IcChevron s={12} c='#9ca3af' dir={sortOpen?'up':'down'}/>
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
            <div style={{ marginBottom:12, display:'flex', justifyContent:'center' }}><IcWarn s={32} c='#dc2626'/></div>
            <div style={{ fontWeight:700, color:'#dc2626', marginBottom:6, fontSize:16 }}>Could not load current affairs</div>
            <div style={{ color:'#9ca3af', fontSize:13, marginBottom:20 }}>{error}</div>
            <button onClick={() => window.location.reload()}
              style={{ padding:'9px 20px', background:'#F06535', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
              <IcRefresh s={13} c='#fff'/> Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:20, padding:'64px 24px', textAlign:'center', maxWidth:420, margin:'0 auto' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <IcEmpty s={32} c='#9ca3af'/>
            </div>
            <div style={{ fontSize:18, fontWeight:800, color:'#111827', marginBottom:8 }}>
              {viewSaved ? 'No saved items yet' : 'No articles found'}
            </div>
            <p style={{ color:'#6b7280', fontSize:14, lineHeight:1.65, marginBottom:28 }}>
              {viewSaved
                ? 'Bookmark articles to save them for later revision.'
                : search
                  ? <>No results for <strong>"{search}"</strong>. Try different keywords.</>
                  : 'No current affairs for the selected filters. Try a different category or date range.'}
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
    </div>
  )
}
