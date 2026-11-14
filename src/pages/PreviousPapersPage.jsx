import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import Footer from '../components/Footer.jsx'

/* ──────────────────────────────────────────────────────────────
   Public "Previous Year Papers" — left dropdown rail + right list.
   Browsing is public; attempting requires sign-up. Add new exams
   to FAMILIES below (future-proof).
────────────────────────────────────────────────────────────── */

// Most-recent-year papers for every bank exam. Each has a `pdf` slot
// (null for now) — insert real PDFs via the `previous_papers` table later.
const YR = 2025
const FAMILIES = [
  { group:'IBPS', id:'ibps_clerk', name:'IBPS Clerk', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:190, mins:160, neg:0.25, pdf:null },
  ]},
  { group:'IBPS', id:'ibps_po', name:'IBPS PO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:155, mins:180, neg:0.25, pdf:null },
  ]},
  { group:'SBI', id:'sbi_clerk', name:'SBI Clerk', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:190, mins:160, neg:0.25, pdf:null },
  ]},
  { group:'SBI', id:'sbi_po', name:'SBI PO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:155, mins:180, neg:0.25, pdf:null },
  ]},
  { group:'RRB', id:'rrb_clerk', name:'RRB Office Assistant', papers:[
    { year:YR, stage:'Prelims', q:80,  mins:45,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'RRB', id:'rrb_po', name:'RRB Officer Scale I', papers:[
    { year:YR, stage:'Prelims', q:80,  mins:45,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'RBI', id:'rbi_assistant', name:'RBI Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:200, mins:135, neg:0.25, pdf:null },
  ]},
  { group:'RBI', id:'rbi_gradeb', name:'RBI Grade B', papers:[
    { year:YR, stage:'Phase 1', q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'NABARD', id:'nabard_gradeA', name:'NABARD Grade A', papers:[
    { year:YR, stage:'Prelims', q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'NABARD', id:'nabard_da', name:'NABARD Development Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'LIC', id:'lic_aao', name:'LIC AAO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'LIC', id:'lic_assistant', name:'LIC Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'LIC', id:'lic_ado', name:'LIC ADO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'Insurance', id:'niacl_assistant', name:'NIACL Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'Insurance', id:'nicl_ao', name:'NICL AO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'India Post', id:'ippb_officer', name:'IPPB Officer (Scale I)', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},

  // ── SSC ──
  { group:'SSC', id:'ssc_cgl', name:'SSC CGL', papers:[
    { year:2024, stage:'Tier I',  q:100, mins:60,  neg:0.5,  pdf:null },
    { year:2024, stage:'Tier II', q:130, mins:135, neg:1.0,  pdf:null },
  ]},
  { group:'SSC', id:'ssc_chsl', name:'SSC CHSL', papers:[
    { year:2024, stage:'Tier I',  q:100, mins:60,  neg:0.5,  pdf:null },
  ]},
  { group:'SSC', id:'ssc_mts', name:'SSC MTS', papers:[
    { year:2024, stage:'Tier I',  q:90,  mins:90,  neg:1.0,  pdf:null },
  ]},
  { group:'SSC', id:'ssc_cpo', name:'SSC CPO', papers:[
    { year:2024, stage:'Tier I',  q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'SSC', id:'ssc_gd', name:'SSC GD Constable', papers:[
    { year:2024, stage:'CBT',     q:80,  mins:60,  neg:0.5,  pdf:null },
  ]},
  { group:'SSC', id:'ssc_steno', name:'SSC Stenographer', papers:[
    { year:2024, stage:'Tier I',  q:200, mins:120, neg:0.25, pdf:null },
  ]},

  // ── Railway ──
  { group:'Railway', id:'rrb_ntpc', name:'RRB NTPC', papers:[
    { year:2024, stage:'CBT 1',   q:100, mins:90,  neg:0.33, pdf:null },
    { year:2024, stage:'CBT 2',   q:120, mins:90,  neg:0.33, pdf:null },
  ]},
  { group:'Railway', id:'rrb_groupd', name:'RRB Group D', papers:[
    { year:2022, stage:'CBT',     q:100, mins:90,  neg:0.33, pdf:null },
  ]},
  { group:'Railway', id:'rrb_alp', name:'RRB ALP', papers:[
    { year:2024, stage:'Stage 1', q:75,  mins:60,  neg:0.33, pdf:null },
    { year:2024, stage:'Stage 2', q:175, mins:135, neg:0.33, pdf:null },
  ]},
  { group:'Railway', id:'rrb_je', name:'RRB JE', papers:[
    { year:2024, stage:'CBT 1',   q:100, mins:90,  neg:0.33, pdf:null },
  ]},

  // ── Engineering ──
  { group:'Engineering', id:'jee_main_p', name:'JEE Main', papers:[
    { year:2024, stage:'B.E./B.Tech', q:90, mins:180, neg:1.0, pdf:null },
  ]},
  { group:'Engineering', id:'jee_advanced', name:'JEE Advanced', papers:[
    { year:2024, stage:'Paper 1', q:54, mins:180, neg:2.0, pdf:null },
    { year:2024, stage:'Paper 2', q:54, mins:180, neg:2.0, pdf:null },
  ]},
  { group:'Engineering', id:'gate', name:'GATE', papers:[
    { year:2025, stage:'CS/IT',   q:65, mins:180, neg:0.67, pdf:null },
    { year:2025, stage:'ECE',     q:65, mins:180, neg:0.67, pdf:null },
    { year:2025, stage:'ME',      q:65, mins:180, neg:0.67, pdf:null },
  ]},
  { group:'Engineering', id:'bitsat_p', name:'BITSAT', papers:[
    { year:2024, stage:'Full Test', q:130, mins:180, neg:1.0, pdf:null },
  ]},

  // ── Medical ──
  { group:'Medical', id:'neet_ug_p', name:'NEET UG', papers:[
    { year:2024, stage:'Phase 1', q:200, mins:200, neg:1.0, pdf:null },
  ]},
  { group:'Medical', id:'neet_pg_p', name:'NEET PG', papers:[
    { year:2024, stage:'Full Paper', q:200, mins:210, neg:1.0, pdf:null },
  ]},
  { group:'Medical', id:'aiims_pg_p', name:'AIIMS PG', papers:[
    { year:2024, stage:'Entrance', q:200, mins:210, neg:0.33, pdf:null },
  ]},
]

const GROUPS = ['IBPS', 'SBI', 'RRB', 'RBI', 'NABARD', 'LIC', 'Insurance', 'India Post', 'SSC', 'Railway', 'Engineering', 'Medical']

const GROUP_ICONS = {
  IBPS:        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M8 9V6a4 4 0 018 0v3"/></svg>,
  SBI:         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>,
  RRB:         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M8 9V6a4 4 0 018 0v3"/></svg>,
  RBI:         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
  NABARD:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>,
  LIC:         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Insurance:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'India Post':<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>,
  SSC:         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  Railway:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M8 19l-2 2M16 19l2 2"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  Engineering: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  Medical:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>,
}

const GROUP_COLORS = {
  IBPS: '#F06535', SBI: '#1d4ed8', RRB: '#7c3aed', RBI: '#e11d48',
  NABARD: '#16a34a', LIC: '#2563eb', Insurance: '#0891b2',
  'India Post': '#b45309', SSC: '#d97706', Railway: '#0369a1',
  Engineering: '#7c3aed', Medical: '#dc2626',
}

const STAGE_COLORS = {
  Prelims: { bg:'#eff6ff', color:'#2563eb', label:'Prelims' },
  Mains:   { bg:'#faf5ff', color:'#7c3aed', label:'Mains'   },
  'Phase 1':{ bg:'#ecfdf5', color:'#059669', label:'Phase 1' },
  'Phase 2':{ bg:'#fef3c7', color:'#b45309', label:'Phase 2' },
  'Tier I': { bg:'#eff6ff', color:'#2563eb', label:'Tier I'  },
  'Tier II':{ bg:'#faf5ff', color:'#7c3aed', label:'Tier II' },
  'CBT 1':  { bg:'#eff6ff', color:'#2563eb', label:'CBT 1'   },
  'CBT 2':  { bg:'#faf5ff', color:'#7c3aed', label:'CBT 2'   },
  CBT:      { bg:'#ecfdf5', color:'#059669', label:'CBT'     },
  'Stage 1':{ bg:'#eff6ff', color:'#2563eb', label:'Stage 1' },
  'Stage 2':{ bg:'#faf5ff', color:'#7c3aed', label:'Stage 2' },
  'Paper 1':{ bg:'#eff6ff', color:'#2563eb', label:'Paper 1' },
  'Paper 2':{ bg:'#faf5ff', color:'#7c3aed', label:'Paper 2' },
}

// Build the {group → families} tree from whichever paper list is active.
const buildTree = fams =>
  GROUPS.map(g => ({ group: g, families: fams.filter(f => f.group === g) }))
        .filter(node => node.families.length)

// Turn DB rows from `previous_papers` into the FAMILIES shape used here.
function rowsToFamilies(rows) {
  const byExam = {}
  rows.forEach(r => {
    const key = r.exam_id
    if (!byExam[key]) byExam[key] = { group: r.exam_group, id: r.exam_id, name: r.exam_name, papers: [] }
    byExam[key].papers.push({
      year: r.year, stage: r.stage, q: r.total_questions,
      mins: r.duration_mins, neg: r.negative_mark, pdf: r.pdf_url || null,
    })
  })
  return Object.values(byExam)
}

export default function PreviousPapersPage({ onNav, user, onLogout, isNative }) {
  // Start with the built-in list; replace with DB rows if any exist.
  const [families, setFamilies] = useState(FAMILIES)
  const [sel, setSel] = useState(FAMILIES[0].id)
  const [openGroups, setOpenGroups] = useState({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('previous_papers')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('year', { ascending: false })
        if (error || !data?.length || cancelled) return   // keep built-in list
        // MERGE per exam: if the DB has papers for an exam, use them (real years +
        // pdf links); otherwise keep the built-in catalog entry. This avoids any
        // brittle year/stage matching — the DB is the source of truth per exam.
        const dbFams  = rowsToFamilies(data)
        const dbById  = Object.fromEntries(dbFams.map(f => [f.id, f]))
        const merged  = FAMILIES.map(f => (dbById[f.id] ? { ...f, papers: dbById[f.id].papers } : f))
        const known   = new Set(FAMILIES.map(f => f.id))
        const extra   = dbFams.filter(f => !known.has(f.id))   // DB-only exams
        if (!cancelled) setFamilies([...merged, ...extra])
      } catch { /* offline / table missing → keep built-in list */ }
    })()
    return () => { cancelled = true }
  }, [])

  const [stageFilter, setStageFilter] = useState('')
  const [yearFilter, setYearFilter]   = useState('')
  const [search, setSearch]           = useState('')

  // Filter families by selected categories
  const PAPERS_CAT_TO_GROUP = {
    banking: ['IBPS','SBI','RRB','RBI','NABARD','LIC','Insurance','India Post'],
    ssc: ['SSC'],
    railway: ['Railway'],
    engineering: ['Engineering'],
  }
  const _selCatsPapers = Array.isArray(user?.user_metadata?.selected_categories) ? user.user_metadata.selected_categories : []
  const visibleFamilies = (() => {
    if (!_selCatsPapers.length) return families
    const allowed = new Set(_selCatsPapers.flatMap(c => PAPERS_CAT_TO_GROUP[c] || []))
    const filtered = families.filter(f => allowed.has(f.group))
    return filtered.length ? filtered : families
  })()

  const TREE = buildTree(visibleFamilies)
  const fam  = visibleFamilies.find(f => f.id === sel) || visibleFamilies[0]
  const toggle = g => setOpenGroups(p => ({ [g]: !p[g] }))

  // Auto-open the active group in the sidebar
  useEffect(() => {
    const active = families.find(f => f.id === sel)
    if (active) setOpenGroups(p => ({ ...p, [active.group]: true }))
  }, [sel, families])

  // Cleanup body scroll on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = ''; document.documentElement.style.overflow = '' }
  }, [])

  // Reset stage/year/search when exam changes
  const pickExam = id => { setSel(id); setStageFilter(''); setYearFilter(''); setSearch('') }

  const allPapers      = fam?.papers || []
  const availStages    = [...new Set(allPapers.map(p => p.stage))]
  const availYears     = [...new Set(allPapers.map(p => p.year))].sort((a, b) => b - a)
  const filteredPapers = allPapers.filter(p => {
    if (stageFilter && p.stage !== stageFilter) return false
    if (yearFilter  && String(p.year) !== String(yearFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${fam.name} ${p.year} ${p.stage}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Mobile group/exam helpers
  const groupFamilies = families.filter(f => f.group === fam?.group)
  const onPickGroup   = g => { const first = families.find(f => f.group === g); if (first) pickExam(first.id) }

  const selCls = { border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:13, background:'#fff', outline:'none', cursor:'pointer', color:'#374151' }

  const stageBadge = stage => {
    const s = STAGE_COLORS[stage] || { bg:'#f1f5f9', color:'#475569', label: stage }
    return (
      <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, letterSpacing:'.01em', whiteSpace:'nowrap' }}>
        {s.label}
      </span>
    )
  }

  return (
    <>
    <style>{`
      .pp-logo-text{display:block}
      @media(max-width:480px){.pp-logo-text{display:none}.pp-login-btn{display:none!important}}
      .pp-sidebar::-webkit-scrollbar{width:4px}.pp-sidebar::-webkit-scrollbar-track{background:transparent}.pp-sidebar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
      .pp-main::-webkit-scrollbar{width:6px}.pp-main::-webkit-scrollbar-track{background:#f1f5f9}.pp-main::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      .pp-grp-btn:hover{background:rgba(255,255,255,.07)!important}
      .pp-fam-btn:hover{background:rgba(255,255,255,.09)!important}
      .pp-content{padding:24px 32px 48px}
      @media(max-width:900px){.pp-content{padding:20px 20px 40px}}
      @media(max-width:600px){.pp-content{padding:16px 16px 36px}}
    `}</style>

    {!isNative && (
    <header style={{ background:'#0f172a', height:58, display:'flex', alignItems:'center', padding:'0 20px', gap:16, position:'sticky', top:0, zIndex:100, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onNav?.('home')}>
        <div style={{ width:36, height:36, background:'#F06535', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:15, color:'#fff', letterSpacing:'-0.5px' }}>MT</div>
        <div className="pp-logo-text">
          <div style={{ color:'#fff', fontWeight:800, fontSize:14, lineHeight:1.1 }}>MockTest</div>
          <div style={{ color:'rgba(255,255,255,.45)', fontSize:9.5, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase' }}>Your world of mock tests</div>
        </div>
      </div>
      <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
        {user ? (
          <button onClick={onLogout} style={{ background:'none', border:'1px solid rgba(255,255,255,.25)', borderRadius:8, color:'rgba(255,255,255,.85)', fontSize:13, fontWeight:600, padding:'6px 14px', cursor:'pointer' }}>Logout</button>
        ) : (
          <>
            <button onClick={() => onNav?.('auth')} className="pp-login-btn" style={{ background:'none', border:'none', color:'rgba(255,255,255,.82)', fontSize:13, fontWeight:500, padding:'6px 10px', cursor:'pointer' }}>Login</button>
            <button onClick={() => onNav?.('auth')} style={{ background:'#F06535', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:700, padding:'7px 16px', cursor:'pointer', whiteSpace:'nowrap' }}>Start Free →</button>
          </>
        )}
      </div>
    </header>
    )}

    <div style={{ display:'flex', fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* ── DARK NAVY SIDEBAR ── */}
      <aside className="pp-sidebar hidden md:flex" style={{ width:256, flexShrink:0, background:'#0f172a', flexDirection:'column', overflowY:'auto', borderRight:'1px solid rgba(255,255,255,.07)', position:'sticky', top: isNative ? 0 : 58, height: isNative ? '100vh' : 'calc(100vh - 58px)', alignSelf:'flex-start' }}>
        <div style={{ padding:'16px 12px 12px' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', padding:'0 8px 10px' }}>Exam Categories</div>
          {TREE.map(({ group, families: grpFams }) => {
            const open     = !!openGroups[group]
            const hasActive = grpFams.some(f => f.id === sel)
            return (
              <div key={group} style={{ marginBottom:2 }}>
                {(() => { const gc = GROUP_COLORS[group] || '#F06535'; return (
                <button className="pp-grp-btn" onClick={() => toggle(group)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', background: open || hasActive ? `${gc}18` : 'transparent', transition:'background .15s', textAlign:'left' }}>
                  <span style={{ width:26, height:26, borderRadius:7, background: open || hasActive ? gc : 'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff', transition:'background .15s' }}>{GROUP_ICONS[group]}</span>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color: open || hasActive ? '#fff' : 'rgba(255,255,255,.65)' }}>{group} Exams</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,.3)', transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▼</span>
                </button>
                )})()}
                {open && (
                  <div style={{ paddingLeft:8, paddingBottom:4, paddingTop:2 }}>
                    {grpFams.map(f => {
                      const active = f.id === sel
                      return (
                        <button key={f.id} className="pp-fam-btn" onClick={() => pickExam(f.id)}
                          style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer', background: active ? 'rgba(232,90,44,.2)' : 'transparent', marginBottom:2, transition:'background .12s', textAlign:'left' }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background: active ? '#F06535' : 'rgba(255,255,255,.2)', flexShrink:0 }}/>
                          <span style={{ fontSize:12.5, fontWeight: active ? 700 : 400, color: active ? '#fff' : 'rgba(255,255,255,.6)', flex:1 }}>{f.name}</span>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,.25)', fontWeight:500 }}>{f.papers.length}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="pp-main" style={{ flex:1, minWidth:0, background:'#f8fafc' }}>
        <div className="pp-content">

          {/* Breadcrumb */}
          <nav style={{ display:'flex', alignItems:'center', gap:6, marginBottom:18, flexWrap:'wrap' }}>
            <button onClick={() => onNav?.('home')} style={{ background:'none', border:'none', padding:0, cursor:'pointer', fontSize:12.5, color:'#64748b', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}
              onMouseOver={e => e.currentTarget.style.color = '#F06535'}
              onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              Home
            </button>
            <span style={{ color:'#94a3b8', fontSize:12 }}>/</span>
            <span style={{ fontSize:12.5, color:'#1e293b', fontWeight:600 }}>Previous Year Papers</span>
          </nav>

          {/* Page heading */}
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', margin:0, lineHeight:1.2 }}>
              Bank Exam <span style={{ color:'#F06535' }}>Previous Year Papers</span>
            </h1>
            <p style={{ fontSize:13.5, color:'#64748b', marginTop:6 }}>
              Real exam patterns from past years — full sectional structure, timing and negative marking. Pick an exam on the left.
            </p>
          </div>

          {/* ── Filter bar ── */}
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            {/* Mobile: group selector */}
            <select className="md:hidden" value={fam?.group || ''} onChange={e => onPickGroup(e.target.value)} style={selCls}>
              {GROUPS.filter(g => families.some(f => f.group === g)).map(g => <option key={g} value={g}>{g} Exams</option>)}
            </select>
            {/* Exam */}
            <select value={sel} onChange={e => pickExam(e.target.value)} style={{ ...selCls, minWidth:140 }}>
              {(TREE.find(t => t.group === fam?.group)?.families || []).map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {/* Stage */}
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ ...selCls, minWidth:130 }}>
              <option value="">All stages</option>
              {availStages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {/* Year */}
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ ...selCls, minWidth:110 }}>
              <option value="">All years</option>
              {availYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {/* Search */}
            <div style={{ position:'relative', flex:1, minWidth:160 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers by year or exam..."
                style={{ ...selCls, width:'100%', boxSizing:'border-box', paddingLeft:32 }}/>
            </div>
          </div>

          {/* Paper section heading */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:0 }}>{fam.name} Papers</h2>
            {filteredPapers.length > 0 && (
              <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${GROUP_COLORS[fam.group]||'#F06535'}18`, color:GROUP_COLORS[fam.group]||'#F06535', flexShrink:0 }}>
                {filteredPapers.length} Paper{filteredPapers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Paper cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filteredPapers.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#94a3b8', fontSize:14 }}>No papers match the selected filters.</div>
            ) : filteredPapers.map((p, i) => {
              const grpColor = GROUP_COLORS[fam.group] || '#F06535'
              return (
              <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', boxShadow:'0 1px 8px rgba(15,23,42,.05)' }}>
                {/* Icon — solid group-color background */}
                <div style={{ width:46, height:46, borderRadius:12, background:grpColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${grpColor}40` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
                </div>
                {/* Title + meta */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:5 }}>
                    {fam.name} – {p.stage}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6, flexWrap:'wrap' }}>
                    {stageBadge(p.stage)}
                    <span style={{ background:'#f1f5f9', color:'#475569', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>{p.year}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'nowrap' }}>
                    <span style={{ fontSize:11.5, color:'#64748b', display:'flex', alignItems:'center', gap:3, whiteSpace:'nowrap' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      {p.q}Q
                    </span>
                    <span style={{ color:'#d1d5db', fontSize:10 }}>·</span>
                    <span style={{ fontSize:11.5, color:'#64748b', display:'flex', alignItems:'center', gap:3, whiteSpace:'nowrap' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {p.mins} min
                    </span>
                    <span style={{ color:'#d1d5db', fontSize:10 }}>·</span>
                    <span style={{ fontSize:11.5, color:'#64748b', whiteSpace:'nowrap' }}>-{p.neg} neg</span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  {p.pdf ? (
                    <a href={p.pdf} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:5, background:'#F06535', border:'none', borderRadius:8, color:'#fff', fontSize:12.5, fontWeight:700, padding:'8px 14px', cursor:'pointer', textDecoration:'none', whiteSpace:'nowrap' }}
                      onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                      onMouseOut={e => e.currentTarget.style.background = '#F06535'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      PDF
                    </a>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(232,90,44,.12)', border:'none', borderRadius:8, color:'#F06535', fontSize:12.5, fontWeight:700, padding:'8px 14px', whiteSpace:'nowrap', opacity:.7 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      PDF
                    </span>
                  )}
                  <button onClick={() => onNav?.('auth')}
                    style={{ background:'none', border:'1.5px solid #fec9b0', borderRadius:8, color:'#F06535', fontSize:12.5, fontWeight:700, padding:'7px 14px', cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#F06535'; e.currentTarget.style.color = '#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#F06535' }}>
                    Sign up to attempt
                  </button>
                </div>
              </div>
            )})}
          </div>

          {/* Footer note */}
          <p style={{ fontSize:12, color:'#94a3b8', marginTop:14, marginBottom:32, display:'flex', alignItems:'center', gap:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Attempting papers, full solutions and PDF downloads are free after sign-up.
          </p>

          {/* CTA */}
          <div style={{ borderRadius:18, overflow:'hidden', background:'#0f172a', display:'flex', alignItems:'stretch', flexWrap:'wrap' }}>
            {/* Illustration */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 20px 28px 28px', flexShrink:0 }} className="pp-cta-illus">
              <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="88" height="88" rx="14" fill="rgba(232,90,44,.12)"/>
                <rect x="18" y="16" width="34" height="46" rx="3" fill="#fff" fillOpacity=".08" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
                <line x1="25" y1="26" x2="44" y2="26" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="25" y1="33" x2="44" y2="33" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="25" y1="40" x2="38" y2="40" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="46" y="46" width="24" height="20" rx="4" fill="rgba(232,90,44,.15)" stroke="rgba(232,90,44,.35)" strokeWidth="1"/>
                <rect x="50" y="57" width="4" height="7" rx="1" fill="#F06535" fillOpacity=".7"/>
                <rect x="56" y="53" width="4" height="11" rx="1" fill="#F06535"/>
                <rect x="62" y="50" width="4" height="14" rx="1" fill="#F06535" fillOpacity=".85"/>
                <circle cx="64" cy="28" r="11" fill="rgba(232,90,44,.2)" stroke="#F06535" strokeWidth="1.5"/>
                <polyline points="59,28 63,32 70,24" stroke="#F06535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Text */}
            <div style={{ flex:'1 1 260px', padding:'28px 24px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 10px', lineHeight:1.3 }}>
                Attempt any paper <span style={{ color:'#F06535' }}>free</span>
              </h2>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.6)', margin:'0 0 22px', lineHeight:1.65 }}>
                Create a free account to attempt previous-year papers as timed mocks with instant step-by-step explanations and category-wise cut-off comparison.
              </p>
              <div>
                <button onClick={() => onNav?.('auth')}
                  style={{ background:'#F06535', border:'none', borderRadius:9, color:'#fff', fontSize:13.5, fontWeight:700, padding:'11px 24px', cursor:'pointer', whiteSpace:'nowrap' }}
                  onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                  onMouseOut={e => e.currentTarget.style.background = '#F06535'}>
                  Start Free →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer onNav={onNav} />
    <style>{`.pp-cta-illus{display:flex}@media(max-width:640px){.pp-cta-illus{display:none!important}}`}</style>
    </>
  )
}
