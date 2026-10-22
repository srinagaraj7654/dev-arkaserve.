import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'

const _sv = (c,w) => ({fill:'none',stroke:c||'currentColor',strokeWidth:w||'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const _IcNews   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="12" y1="6" x2="18" y2="6"/><line x1="12" y1="10" x2="18" y2="10"/><line x1="12" y1="14" x2="18" y2="14"/></svg>
const _IcBank   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 21h18M3 10h18M3 10l9-7 9 7"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></svg>
const _IcGovt   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M3 11l9-8 9 8"/><line x1="9" y1="22" x2="9" y2="11"/><line x1="15" y1="22" x2="15" y2="11"/></svg>
const _IcTrend  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const _IcFlask  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9 3h6M9 3v7l-5 11h16L15 10V3"/><line x1="6" y1="16" x2="18" y2="16"/></svg>
const _IcTrophy = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H3V4h3M18 9h3V4h-3"/><path d="M6 4h12v8a6 6 0 0 1-12 0V4z"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
const _IcGlobe  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const _IcSearch = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const _IcWarn   = ({s=30,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const _IcEmpty  = ({s=44,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
const _IcPin    = ({s=11,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>

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

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

export default function CurrentAffairsPage({ onNav }) {
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [category,   setCategory]   = useState('all')
  const [examFilter, setExamFilter] = useState('all')
  const [search,     setSearch]     = useState('')
  const [expanded,   setExpanded]   = useState(null)
  const [dateRange,  setDateRange]  = useState('week') // today | week | month

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

  const filtered = search.trim()
    ? items.filter(it =>
        (it.headline || '').toLowerCase().includes(search.toLowerCase()) ||
        (it.detail   || '').toLowerCase().includes(search.toLowerCase())
      )
    : items

  // Group by date
  const grouped = filtered.reduce((acc, item) => {
    const d = item.date || 'Unknown'
    if (!acc[d]) acc[d] = []
    acc[d].push(item)
    return acc
  }, {})
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#fafafa', minHeight:'100vh', color:'#1a1a1a' }}>

      <style>{`
        *{box-sizing:border-box}
        .ca-card{background:#fff;border:1.5px solid #f0f0f0;border-radius:14px;overflow:hidden;transition:border-color .15s,box-shadow .15s}
        .ca-card:hover{border-color:#FF653F;box-shadow:0 4px 18px rgba(255,101,63,.1)}
        .ca-chip{padding:6px 14px;border-radius:22px;border:1.5px solid;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .12s}
        .tag-pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;gap:4px}
        @media(max-width:640px){
          .ca-filters{flex-wrap:wrap!important;gap:6px!important}
          .ca-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* Page header */}
      <div style={{ background:'#111', padding:'48px 24px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,101,63,.15)', border:'1px solid rgba(255,101,63,.3)', color:'#FF653F', borderRadius:22, padding:'5px 14px', fontSize:12, fontWeight:700, marginBottom:16, letterSpacing:'.06em', textTransform:'uppercase' }}>
            <span style={{ width:6, height:6, background:'#FF653F', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }}/>
            Updated Daily
          </div>
          <h1 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:900, color:'#fff', marginBottom:10, letterSpacing:'-0.5px', lineHeight:1.2 }}>
            Current Affairs
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.55)', maxWidth:520, lineHeight:1.7 }}>
            Daily current affairs for Banking, SSC, UPSC, Railway and more — curated every morning.
          </p>

          {/* Search */}
          <div style={{ marginTop:24, position:'relative', maxWidth:440 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', display:'inline-flex' }}><_IcSearch s={15} c='rgba(255,255,255,.35)'/></span>
            <input
              type="text"
              placeholder="Search headlines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width:'100%', padding:'11px 14px 11px 40px', background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.15)', borderRadius:10, color:'#fff', fontSize:14, outline:'none' }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', borderBottom:'1px solid #f0f0f0', padding:'14px 24px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Category tabs */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', paddingBottom:2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} className="ca-chip" onClick={() => setCategory(c.id)}
                style={{ borderColor: category===c.id ? '#FF653F':'#e5e5e5', background: category===c.id ? '#FF653F':'#fff', color: category===c.id ? '#fff':'#555' }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          {/* Row 2: exam filter + date range */}
          <div className="ca-filters" style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#888', flexShrink:0 }}>Exam:</span>
            {['all', ...EXAM_TAGS].map(t => (
              <button key={t} onClick={() => setExamFilter(t)}
                style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', borderColor: examFilter===t ? '#111':'#e5e5e5', background: examFilter===t ? '#111':'#fff', color: examFilter===t ? '#fff':'#555', transition:'all .12s' }}>
                {t === 'all' ? 'All Exams' : t}
              </button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
              {[['today','Today'],['week','This Week'],['month','This Month']].map(([v,l]) => (
                <button key={v} onClick={() => setDateRange(v)}
                  style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', borderColor: dateRange===v ? '#FF653F':'#e5e5e5', background: dateRange===v ? '#FFF3EE':'#fff', color: dateRange===v ? '#FF653F':'#555', transition:'all .12s' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 60px' }}>

        {loading && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:36, height:36, border:'3px solid #fec9b0', borderTopColor:'#FF653F', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 16px' }}/>
            <p style={{ color:'#888', fontSize:14 }}>Loading current affairs…</p>
          </div>
        )}

        {error && (
          <div style={{ background:'#fff5f5', border:'1.5px solid #fca5a5', borderRadius:14, padding:24, textAlign:'center' }}>
            <div style={{ marginBottom:10, display:'flex', justifyContent:'center' }}><_IcWarn s={30} c='#dc2626'/></div>
            <div style={{ fontWeight:700, color:'#dc2626', marginBottom:6 }}>Could not load current affairs</div>
            <div style={{ color:'#888', fontSize:13 }}>{error}</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ background:'#fff', border:'1.5px solid #f0f0f0', borderRadius:16, padding:'60px 24px', textAlign:'center' }}>
            <div style={{ marginBottom:16, display:'flex', justifyContent:'center' }}><_IcEmpty s={44} c='#ccc'/></div>
            <div style={{ fontSize:18, fontWeight:700, color:'#111', marginBottom:8 }}>No items found</div>
            <p style={{ color:'#888', fontSize:14, marginBottom:24 }}>
              {search ? `No results for "${search}"` : "No current affairs for the selected filters yet. Check back tomorrow!"}
            </p>
            <button onClick={() => { setCategory('all'); setExamFilter('all'); setSearch(''); setDateRange('week') }}
              style={{ padding:'10px 24px', background:'#FF653F', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && dates.map(date => (
          <div key={date} style={{ marginBottom:36 }}>
            {/* Date heading */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ height:1, background:'#f0f0f0', flex:1 }}/>
              <div style={{ display:'flex', alignItems:'center', gap:8, background: isToday(date) ? '#FF653F':'#111', color:'#fff', padding:'5px 16px', borderRadius:99, fontSize:13, fontWeight:700, flexShrink:0 }}>
                {isToday(date) && <span style={{ width:6, height:6, background:'#fff', borderRadius:'50%', display:'inline-block' }}/>}
                {isToday(date) ? 'Today — ' : ''}{formatDate(date)}
              </div>
              <div style={{ height:1, background:'#f0f0f0', flex:1 }}/>
            </div>

            {/* Cards grid */}
            <div className="ca-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap:14 }}>
              {grouped[date].map((item, i) => {
                const isOpen = expanded === `${date}-${i}`
                return (
                  <div key={i} className="ca-card">
                    {/* Category stripe */}
                    <div style={{ height:4, background: item.category === 'banking' ? '#059669' : item.category === 'government' ? '#7C3AED' : item.category === 'economy' ? '#D97706' : item.category === 'science' ? '#0891B2' : item.category === 'sports' ? '#DC2626' : item.category === 'international' ? '#2563EB' : '#FF653F' }}/>
                    <div style={{ padding:'14px 16px' }}>
                      {/* Tags row */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                        {item.category && (
                          <span className="tag-pill" style={{ background:'#FFF3EE', color:'#FF653F' }}>
                            {CATEGORIES.find(c => c.id === item.category)?.icon} {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                          </span>
                        )}
                        {(item.tags || []).map(tag => (
                          <span key={tag} className="tag-pill" style={{ background:'#f5f5f5', color:'#555' }}>{tag}</span>
                        ))}
                      </div>

                      {/* Headline */}
                      <div style={{ fontSize:14, fontWeight:700, color:'#111', lineHeight:1.5, marginBottom:isOpen?10:0 }}>
                        {item.headline}
                      </div>

                      {/* Detail — expanded */}
                      {isOpen && item.detail && (
                        <div style={{ fontSize:13, color:'#555', lineHeight:1.75, marginBottom:10, borderTop:'1px solid #f5f5f5', paddingTop:10 }}>
                          {item.detail}
                        </div>
                      )}

                      {/* Source + expand toggle */}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
                        {item.source && (
                          <span style={{ fontSize:11, color:'#aaa', fontWeight:500, display:'inline-flex', alignItems:'center', gap:3 }}><_IcPin s={10} c='#aaa'/>{item.source}</span>
                        )}
                        {item.detail && (
                          <button
                            onClick={() => setExpanded(isOpen ? null : `${date}-${i}`)}
                            style={{ fontSize:12, fontWeight:600, color:'#FF653F', background:'none', border:'none', cursor:'pointer', marginLeft:'auto', padding:0 }}>
                            {isOpen ? 'Show less ↑' : 'Read more ↓'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  )
}
