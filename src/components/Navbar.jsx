import { useState, useRef, useEffect } from 'react'

/* ─── Navigation data — Brand → Exam → Stage (with examId for direct launch) ── */
const NAV_GROUPS = [
  {
    id: 'banking', label: 'Banking', dest: 'exams-banking',
    brands: [
      {
        label: 'IBPS',
        exams: [
          { label: 'IBPS Clerk',       stages: [{ label:'Prelims', examId:'bank_clerk_prelims' }, { label:'Mains', examId:'bank_clerk_mains' }] },
          { label: 'IBPS PO',          stages: [{ label:'Prelims', examId:'bank_po_prelims' },   { label:'Mains', examId:'bank_po_mains' }] },
          { label: 'IBPS RRB Asst.',   stages: [{ label:'Prelims', examId:'rrb_office_assistant_prelims' }, { label:'Mains', examId:'rrb_office_assistant_mains' }] },
          { label: 'IBPS RRB Officer', stages: [{ label:'Prelims', examId:'rrb_officer_scale1_prelims' },   { label:'Mains', examId:'rrb_officer_scale1_mains' }] },
          { label: 'IBPS SO',          stages: [{ label:'Prelims', examId:null }, { label:'Mains', examId:null }] },
        ],
      },
      {
        label: 'SBI',
        exams: [
          { label: 'SBI Clerk', stages: [{ label:'Prelims', examId:'sbi_clerk_prelims' }, { label:'Mains', examId:'sbi_clerk_mains' }] },
          { label: 'SBI PO',    stages: [{ label:'Prelims', examId:'sbi_po_prelims' },    { label:'Mains', examId:'sbi_po_mains' }] },
        ],
      },
      {
        label: 'RBI',
        exams: [
          { label: 'RBI Assistant', stages: [{ label:'Prelims', examId:'rbi_assistant_pre' }, { label:'Mains', examId:'rbi_assistant_mains' }] },
          { label: 'RBI Grade B',   stages: [{ label:'Phase 1', examId:'rbi_gradeb_p1' },    { label:'Phase 2', examId:null }] },
        ],
      },
      {
        label: 'LIC',
        exams: [
          { label: 'LIC AAO',       stages: [{ label:'Prelims', examId:'lic_aao_pre' },       { label:'Mains', examId:'lic_aao_mains' }] },
          { label: 'LIC ADO',       stages: [{ label:'Prelims', examId:'lic_ado_pre' },       { label:'Mains', examId:'lic_ado_mains' }] },
          { label: 'LIC Assistant', stages: [{ label:'Prelims', examId:'lic_assistant_pre' }] },
        ],
      },
      {
        label: 'NABARD',
        exams: [
          { label: 'NABARD Grade A',   stages: [{ label:'Phase 1', examId:'nabard_gradeA_pre' }] },
          { label: 'NABARD Dev Asst.', stages: [{ label:'Prelims', examId:'nabard_da_pre' }] },
        ],
      },
      {
        label: 'Coal India',
        exams: [
          { label: 'Coal India MT', stages: [{ label:'Written Test', examId:'coal_india_mt' }] },
        ],
      },
      {
        label: 'Insurance',
        exams: [
          { label: 'NIACL Assistant', stages: [{ label:'Prelims', examId:'niacl_assistant_pre', dest:'exams-insurance' }] },
          { label: 'NICL AO',         stages: [{ label:'Prelims', examId:'nicl_ao_pre', dest:'exams-insurance' }] },
          { label: 'IPPB Officer',    soon: true, stages: [] },
        ],
      },
    ],
    allDest: 'exams-banking',
  },
  {
    id: 'ssc', label: 'SSC', dest: 'exams-ssc',
    brands: [
      {
        label: 'SSC',
        exams: [
          { label: 'SSC CGL',   stages: [{ label:'Tier I',  examId:'ssc_cgl_tier1' },  { label:'Tier II',  examId:null }] },
          { label: 'SSC CHSL',  stages: [{ label:'Tier I',  examId:'ssc_chsl_tier1' }, { label:'Tier II',  examId:null }] },
          { label: 'SSC MTS',   stages: [{ label:'Paper I', examId:'ssc_mts_paper1' }, { label:'Paper II', examId:null }] },
          { label: 'SSC CPO',   stages: [{ label:'Paper I', examId:null }] },
          { label: 'SSC Steno', stages: [{ label:'Written', examId:null }] },
          { label: 'SSC JHT',   stages: [{ label:'Paper I', examId:null }] },
        ],
      },
    ],
    allDest: 'exams-ssc',
  },
  {
    id: 'railway', label: 'Railway', dest: 'exams',
    brands: [
      {
        label: 'RRB',
        exams: [
          { label: 'RRB NTPC CBT 1', stages: [{ label:'CBT 1', examId:'rrb_ntpc_cbt1' }] },
          { label: 'RRB NTPC CBT 2', stages: [{ label:'CBT 2', examId:'rrb_ntpc_cbt2' }] },
          { label: 'RRB Group D',    stages: [{ label:'CBT',   examId:'rrb_group_d' }] },
          { label: 'RRB ALP',        stages: [{ label:'Stage 1', examId:'rrb_alp_cbt1' }] },
        ],
      },
    ],
    allDest: 'exams',
  },
  {
    id: 'engineering', label: 'Engineering', soon: true, dest: 'exams',
    brands: [
      { label: 'GATE', exams: [{ label:'GATE CS', soon:true, stages:[] }, { label:'GATE ECE', soon:true, stages:[] }, { label:'GATE ME', soon:true, stages:[] }] },
      { label: 'JEE',  exams: [{ label:'JEE Mains', soon:true, stages:[] }, { label:'JEE Advanced', soon:true, stages:[] }] },
    ],
    allDest: null,
  },
  {
    id: 'medical', label: 'Medical', soon: true, dest: 'exams',
    brands: [
      { label: 'NEET',  exams: [{ label:'NEET UG', soon:true, stages:[] }, { label:'NEET PG', soon:true, stages:[] }] },
      { label: 'AIIMS', exams: [{ label:'AIIMS', soon:true, stages:[] }, { label:'JIPMER', soon:true, stages:[] }] },
    ],
    allDest: null,
  },
]

const DIRECT = [{ id: 'about', label: 'About Us' }]

/* ─── Icons ── */
const Chevron = ({ open, size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const RightArrow = ({ color = 'rgba(255,255,255,.3)' }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

/* ─── Hover-driven 3-column dropdown ── */
function DropdownPanel({ group, onNavigate }) {
  const [selBrand, setSelBrand] = useState(null)
  const [selExam,  setSelExam]  = useState(null)

  const colStyle = { padding: '6px 0' }

  const sectionLabel = (text) => (
    <div style={{ padding:'8px 14px 5px', fontSize:9.5, fontWeight:800, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.10em' }}>
      {text}
    </div>
  )

  const itemStyle = (active, disabled) => ({
    display:'flex', alignItems:'center', justifyContent:'space-between',
    width:'100%', padding:'9px 14px', border:'none', textAlign:'left',
    background: active ? 'rgba(255,255,255,.09)' : 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? 'rgba(255,255,255,.45)' : active ? '#fff' : 'rgba(255,255,255,.92)',
    fontSize: 14.5, fontWeight: 400,
    transition: 'background .1s, color .1s',
  })

  const hl  = e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#fff' }
  const unhl = (active, disabled) => e => {
    e.currentTarget.style.background = active ? 'rgba(255,255,255,.09)' : 'transparent'
    e.currentTarget.style.color = disabled ? 'rgba(255,255,255,.45)' : active ? '#fff' : 'rgba(255,255,255,.92)'
  }

  return (
    <div style={{
      position:'absolute', top:'100%', left:0,
      background:'#1e293b', borderRadius:12,
      boxShadow:'0 24px 64px rgba(0,0,0,.55), 0 4px 20px rgba(0,0,0,.3)',
      border:'1px solid rgba(255,255,255,.09)',
      zIndex:9999, display:'flex', overflow:'hidden',
      animation:'ddFadeIn .14s ease',
    }}>

      {/* Column 1 — Brands (hover to reveal exams) */}
      <div style={{ ...colStyle, minWidth: 160, borderRight:'1px solid rgba(255,255,255,.07)' }}>
        {sectionLabel(group.label)}
        {group.brands.map(brand => {
          const active = selBrand?.label === brand.label
          return (
            <button key={brand.label}
              onMouseEnter={() => { setSelBrand(brand); setSelExam(null) }}
              style={itemStyle(active, false)}
              onMouseOver={e => { if (!active) hl(e) }}
              onMouseOut={unhl(active, false)}>
              {brand.label}
            </button>
          )
        })}
      </div>

      {/* Column 2 — Exams for hovered brand (hover exam to reveal stages) */}
      {selBrand && (
        <div style={{ ...colStyle, minWidth: 190, borderRight: selExam ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
          {sectionLabel(selBrand.label)}
          {selBrand.exams.map(exam => {
            const active  = selExam?.label === exam.label
            const hasMany = (exam.stages?.length || 0) > 1
            return (
              <button key={exam.label}
                onMouseEnter={() => hasMany && !exam.soon ? setSelExam(exam) : setSelExam(null)}
                onClick={() => {
                  if (exam.soon) return
                  if (!hasMany) {
                    const s = exam.stages?.[0]
                    if (s?.examId) onNavigate(s.dest || 'mocktest', s.examId)
                  }
                }}
                style={itemStyle(active, exam.soon)}
                onMouseOver={e => { if (!active && !exam.soon) hl(e) }}
                onMouseOut={unhl(active, exam.soon)}>
                <span>{exam.label}</span>
                {exam.soon && <span style={{ fontSize:9, color:'#f59e0b', fontWeight:800 }}>SOON</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Column 3 — Stages for hovered exam */}
      {selExam && (
        <div style={{ ...colStyle, minWidth: 130 }}>
          {sectionLabel(selExam.label)}
          {selExam.stages.map(stage => (
            <button key={stage.label}
              onClick={() => { if (stage.examId) onNavigate(stage.dest || 'mocktest', stage.examId) }}
              style={itemStyle(false, !stage.examId)}
              onMouseOver={e => { if (stage.examId) hl(e) }}
              onMouseOut={unhl(false, !stage.examId)}>
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background: stage.examId ? '#F06535' : 'rgba(255,255,255,.2)', flexShrink:0 }} />
                {stage.label}
              </span>
              {!stage.examId && <span style={{ fontSize:9, color:'rgba(255,255,255,.5)', fontWeight:700 }}>SOON</span>}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}

/* ─── Main Navbar ── */
export default function Navbar({ currentPage, onNav, user, onLogout, userRole, darkMode = false, onToggleDark }) {
  const [openGroupId,   setOpenGroupId]   = useState(null)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [mobBrand,      setMobBrand]      = useState(null)
  const [mobExam,       setMobExam]       = useState(null)
  const closeTimer = useRef(null)

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const openGroup  = (id) => { clearTimeout(closeTimer.current); setOpenGroupId(id) }
  const schedClose = ()   => { closeTimer.current = setTimeout(() => setOpenGroupId(null), 180) }

  const navigate = (dest, examId) => {
    if (!dest) return
    onNav(dest, examId)
    clearTimeout(closeTimer.current)
    setOpenGroupId(null)
    setMobileOpen(false)
    setOpenAccordion(null)
    setMobBrand(null)
    setMobExam(null)
  }

  return (
    <>
      <style>{`
        @keyframes ddFadeIn {
          from { opacity:0; transform:translateY(-6px) }
          to   { opacity:1; transform:translateY(0) }
        }
      `}</style>

      <nav className="sticky top-0 z-50"
        style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,.06)', paddingTop: 'env(safe-area-inset-top,0px)' }}>

        <div className="w-full px-5 flex items-stretch justify-between gap-4" style={{ minHeight: 58 }}>

          {/* ── Logo ── */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5 flex-shrink-0 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F06535,#e5512f)' }}>
              <span className="text-white font-black text-xs">MT</span>
            </div>
            <div className="text-left">
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 14, lineHeight: 1, letterSpacing: '-0.2px' }}>MockTest</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: '#F06535', letterSpacing: '.10em', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 3, lineHeight: 1 }}>
                Your World of Mock Tests
              </div>
            </div>
          </button>

          {/* ── Desktop nav ── */}
          <div className="hidden xl:flex items-stretch flex-1 justify-center">
            {DIRECT.map(item => {
              const active = currentPage === item.id
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  style={{
                    padding: '0 15px', background: 'none', border: 'none',
                    borderBottom: `2px solid ${active ? '#F06535' : 'transparent'}`,
                    cursor: 'pointer', fontSize: 15, fontWeight: 600,
                    color: active ? '#fff' : 'rgba(255,255,255,.92)', transition: 'all .15s', whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#fff'}
                  onMouseOut={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,.92)' }}>
                  {item.label}
                </button>
              )
            })}

            {NAV_GROUPS.map(group => {
              const open   = openGroupId === group.id
              const active = currentPage === group.id

              return (
                <div key={group.id} className="relative flex items-stretch"
                  onMouseEnter={() => openGroup(group.id)}
                  onMouseLeave={schedClose}>

                  <button onClick={() => !group.soon && openGroup(group.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '0 15px',
                    background: 'none', border: 'none',
                    borderBottom: `2px solid ${open || active ? '#F06535' : 'transparent'}`,
                    cursor: group.soon ? 'default' : 'pointer', fontSize: 15, fontWeight: 600,
                    color: open || active ? '#fff' : 'rgba(255,255,255,.92)',
                    transition: 'all .15s', whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => { if (!open && !active) e.currentTarget.style.color = '#fff' }}
                  onMouseOut={e => { if (!open && !active) e.currentTarget.style.color = 'rgba(255,255,255,.92)' }}>
                    {group.label}
                    {group.soon && <span style={{ fontSize: 7, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,.12)', borderRadius: 99, padding: '1px 4px', letterSpacing: '.06em', verticalAlign: 'super', lineHeight: 1 }}>SOON</span>}
                  </button>

                  {open && !group.soon && <DropdownPanel group={group} onNavigate={navigate} />}
                </div>
              )
            })}

            {userRole === 'super_admin' && (
              <button onClick={() => navigate('admin')}
                style={{
                  padding: '0 15px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${currentPage === 'admin' ? '#F06535' : 'transparent'}`,
                  cursor: 'pointer', fontSize: 15, fontWeight: 600,
                  color: currentPage === 'admin' ? '#fff' : 'rgba(255,255,255,.7)', transition: 'all .15s',
                }}>
                ⚙ Admin
              </button>
            )}
          </div>

          {/* ── Dark mode toggle ── */}
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ background:'none', border:'1px solid rgba(255,255,255,.18)', borderRadius:8, padding:'6px 8px', cursor:'pointer', color:'rgba(255,255,255,.75)', flexShrink:0, lineHeight:1 }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
              onMouseOut={e=>e.currentTarget.style.background='none'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          )}

          {/* ── Desktop auth ── */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('dashboard')}
                  className="text-white font-bold text-sm px-4 py-2 rounded-lg transition-all"
                  style={{ background: '#F06535' }}
                  onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                  onMouseOut={e => e.currentTarget.style.background = '#F06535'}>
                  Dashboard
                </button>
                <span className="text-sm hidden lg:inline" style={{ color: 'rgba(255,255,255,.6)' }}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button onClick={onLogout}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.18)', background: 'none', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('auth')}
                  style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}
                  onMouseOver={e => e.currentTarget.style.color = '#fff'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}>
                  Login
                </button>
                <button onClick={() => navigate('auth')}
                  className="text-white font-bold text-sm px-4 py-2 rounded-lg transition-all"
                  style={{ background: '#F06535' }}
                  onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                  onMouseOut={e => e.currentTarget.style.background = '#F06535'}>
                  Start Free →
                </button>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button onClick={() => { setMobileOpen(o => !o); setOpenAccordion(null); setMobBrand(null); setMobExam(null) }}
            className="xl:hidden flex items-center justify-center text-white flex-shrink-0"
            style={{ width: 40, background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {mobileOpen
                ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="xl:hidden" style={{ background: '#0d1525', borderTop: '1px solid rgba(255,255,255,.07)', maxHeight: '82vh', overflowY: 'auto' }}>

            {NAV_GROUPS.map(group => {
              const expanded = openAccordion === group.id
              return (
                <div key={group.id} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <button onClick={() => { setOpenAccordion(expanded ? null : group.id); setMobBrand(null); setMobExam(null) }}
                    className="w-full flex items-center justify-between px-5 py-4"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: expanded ? '#F06535' : '#e2e8f0' }}>
                    {group.label}
                    {group.soon
                      ? <span style={{ fontSize:9, color:'#f59e0b', fontWeight:800, background:'rgba(245,158,11,.15)', borderRadius:99, padding:'2px 6px' }}>SOON</span>
                      : <Chevron open={expanded} size={12} />}
                  </button>

                  {expanded && !group.soon && (
                    <div style={{ paddingBottom: 8 }}>
                      {group.brands.map(brand => {
                        const bKey  = `${group.id}:${brand.label}`
                        const bOpen = mobBrand === bKey
                        return (
                          <div key={brand.label}>
                            {/* Brand row */}
                            <button onClick={() => { setMobBrand(bOpen ? null : bKey); setMobExam(null) }}
                              className="w-full flex items-center justify-between px-9 py-3"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: bOpen ? '#F06535' : '#94a3b8' }}>
                              {brand.label}
                              <Chevron open={bOpen} size={11} />
                            </button>

                            {/* Exam rows */}
                            {bOpen && brand.exams.map(exam => {
                              const eKey  = `${bKey}:${exam.label}`
                              const eOpen = mobExam === eKey
                              return (
                                <div key={exam.label}>
                                  <button
                                    onClick={() => {
                                      if (exam.soon) return
                                      if (exam.stages?.length === 1) {
                                        const s = exam.stages[0]
                                        if (s.examId) navigate(s.dest || 'mocktest', s.examId)
                                        else navigate(s.dest || group.dest || 'exams')
                                      } else {
                                        setMobExam(eOpen ? null : eKey)
                                      }
                                    }}
                                    disabled={exam.soon}
                                    className="w-full flex items-center justify-between px-14 py-2.5"
                                    style={{ background: 'none', border: 'none', cursor: exam.soon ? 'default' : 'pointer', fontSize: 13, color: exam.soon ? '#475569' : eOpen ? '#F06535' : '#cbd5e1', textAlign: 'left' }}>
                                    <span>{exam.label}</span>
                                    {exam.soon
                                      ? <span style={{ fontSize:9, color:'#f59e0b', fontWeight:700, flexShrink:0 }}>SOON</span>
                                      : exam.stages?.length > 1
                                        ? <Chevron open={eOpen} size={10} />
                                        : <RightArrow color="#475569" />}
                                  </button>

                                  {/* Stage rows */}
                                  {eOpen && exam.stages.map(stage => (
                                    <button key={stage.label}
                                      onClick={() => {
                                        if (stage.examId) navigate(stage.dest || 'mocktest', stage.examId)
                                        else navigate(stage.dest || group.dest || 'exams')
                                      }}
                                      className="w-full flex items-center gap-3 text-left"
                                      style={{ background:'none', border:'none', cursor:'pointer', padding:'8px 16px 8px 56px', fontSize:12.5, color: stage.examId ? '#94a3b8' : '#475569' }}>
                                      <span style={{ width:5, height:5, borderRadius:'50%', background: stage.examId ? '#F06535' : 'rgba(255,255,255,.2)', flexShrink:0 }} />
                                      {stage.label}
                                      {!stage.examId && <span style={{ fontSize:9, color:'rgba(255,255,255,.3)', fontWeight:700, marginLeft:'auto' }}>SOON</span>}
                                    </button>
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                      {group.allDest && (
                        <button onClick={() => navigate(group.dest || group.allDest)}
                          className="w-full text-left px-9 py-2.5"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#F06535' }}>
                          View All {group.label} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {DIRECT.map(item => (
              <div key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <button onClick={() => navigate(item.id)}
                  className="w-full text-left px-5 py-4"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                  {item.label}
                </button>
              </div>
            ))}

            {userRole === 'super_admin' && (
              <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <button onClick={() => navigate('admin')}
                  className="w-full text-left px-5 py-4"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                  ⚙ Admin
                </button>
              </div>
            )}

            <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {user ? (
                <>
                  <button onClick={() => navigate('dashboard')}
                    className="w-full text-white text-sm py-3 rounded-xl font-bold"
                    style={{ background: '#F06535', border: 'none', cursor: 'pointer' }}>
                    My Dashboard
                  </button>
                  <button onClick={() => { onLogout(); setMobileOpen(false) }}
                    className="w-full text-sm py-3 rounded-xl font-semibold"
                    style={{ color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.18)', background: 'none', cursor: 'pointer' }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('auth')}
                    className="w-full text-white text-sm py-3 rounded-xl font-bold"
                    style={{ background: '#F06535', border: 'none', cursor: 'pointer' }}>
                    Start Free →
                  </button>
                  <button onClick={() => navigate('auth')}
                    className="w-full text-sm py-3 rounded-xl font-semibold"
                    style={{ color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.18)', background: 'none', cursor: 'pointer' }}>
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
