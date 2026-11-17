import { useState } from 'react'

const isNative = import.meta.env.VITE_IS_NATIVE === 'true'

/* ─── SVG icons ─── */
const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const PIcHome    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const PIcEdit    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const PIcTarget  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const PIcTimer   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 2h5M12 2v3"/></svg>
const PIcChart   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>
const PIcCal     = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const PIcCard    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
const PIcUser    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const PIcGear    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const PIcBook    = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const PIcHash    = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
const PIcPuzzle  = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>

/* ─── DATA ─────────────────────────────────────────────────── */

const EXAM_GROUPS = [
  { id:'ibps', label:'IBPS Exams', color:'#F06535', exams:[
    { id:'bank_clerk_prelims', name:'Clerk Prelims', meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_clerk_mains',   name:'Clerk Mains',   meta:'175Q · 160 min' },
    { id:'bank_po_prelims',    name:'PO Prelims',    meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_po_mains',      name:'PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'sbi', label:'SBI Exams', color:'#1a1a2e', exams:[
    { id:'sbi_clerk_prelims', name:'Clerk Prelims', meta:'100Q · 60 min'  },
    { id:'sbi_clerk_mains',   name:'Clerk Mains',   meta:'170Q · 160 min' },
    { id:'sbi_po_prelims',    name:'PO Prelims',    meta:'100Q · 60 min'  },
    { id:'sbi_po_mains',      name:'PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'rrb', label:'RRB Exams', color:'#e5512f', exams:[
    { id:'rrb_office_assistant_prelims', name:'Office Assistant Prelims', meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_office_assistant_mains',   name:'Office Assistant Mains',   meta:'200Q · 120 min' },
    { id:'rrb_officer_scale1_prelims',   name:'Officer Scale-I Prelims',  meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_officer_scale1_mains',     name:'Officer Scale-I Mains',    meta:'200Q · 120 min' },
  ]},
  { id:'psu', label:'PSU Exams', color:'#374151', exams:[
    { id:'coal_india_mt', name:'Coal India MT', meta:'100Q · 120 min', tag:'New' },
  ]},
  { id:'eamcet', label:'EAMCET Exams', color:'#7c3aed', exams:[
    { id:'ap_eamcet_engg', name:'AP EAMCET Engineering', meta:'160Q · 180 min', tag:'New' },
    { id:'ts_eamcet_engg', name:'TS EAMCET Engineering', meta:'160Q · 180 min', tag:'New' },
  ]},
]

// Always visible to all users regardless of registration
const FREE_OPEN_EXAM_IDS = new Set(['ap_eamcet_engg', 'ts_eamcet_engg'])

const TOPICS = [
  { section:'Quantitative Aptitude', color:'text-orange-700', bg:'bg-orange-50', border:'border-orange-200', items:[
    { label:'Simplification',          topic:'simplification'          },
    { label:'Number Series',           topic:'number_series'           },
    { label:'Data Interpretation',     topic:'data_interpretation'     },
    { label:'Quadratic Equations',     topic:'quadratic_equations'     },
    { label:'Percentage',              topic:'percentage'              },
    { label:'Profit & Loss',           topic:'profit_loss'             },
    { label:'Simple & Compound Interest', topic:'simple_compound_interest' },
    { label:'Time & Work',             topic:'time_work'               },
    { label:'Time, Speed & Distance',  topic:'time_speed_distance'     },
    { label:'Ratio & Proportion',      topic:'ratio_proportion'        },
    { label:'Average',                 topic:'average'                 },
    { label:'Problems on Ages',        topic:'problems_on_ages'        },
    { label:'Mixture & Alligation',    topic:'mixture_alligation'      },
    { label:'Partnership',             topic:'partnership'             },
    { label:'Mensuration',             topic:'mensuration_2d'          },
    { label:'Boats & Streams',         topic:'boat_stream'             },
    { label:'Pipes & Cisterns',        topic:'pipes_cisterns'          },
    { label:'Probability',             topic:'probability'             },
    { label:'Permutation & Combination', topic:'permutation_combination' },
  ]},
  { section:'Reasoning Ability', color:'text-purple-700', bg:'bg-purple-50', border:'border-purple-200', items:[
    { label:'Syllogisms',              topic:'syllogisms'              },
    { label:'Inequalities',            topic:'inequalities'            },
    { label:'Coding-Decoding',         topic:'coding_decoding'         },
    { label:'Blood Relations',         topic:'blood_relations'         },
    { label:'Direction Sense',         topic:'direction_sense'         },
    { label:'Alphanumeric Series',     topic:'alphanumeric_series'     },
    { label:'Circular Seating',        topic:'seating_arrangement_circular' },
    { label:'Linear Seating',          topic:'seating_arrangement_linear'   },
    { label:'Floor / Box Puzzle',      topic:'puzzle_box_floor'        },
    { label:'Order & Ranking',         topic:'order_ranking'           },
  ]},
  { section:'English Language', color:'text-green-700', bg:'bg-green-50', border:'border-green-200', items:[
    { label:'Reading Comprehension',   topic:'reading_comprehension'   },
    { label:'Cloze Test',              topic:'cloze_test'              },
    { label:'Error Detection',         topic:'error_detection'         },
    { label:'Fill in the Blanks',      topic:'fill_in_the_blanks'      },
    { label:'Para Jumbles',            topic:'para_jumbles'            },
    { label:'Vocabulary',              topic:'vocabulary'              },
  ]},
]

const SECTIONS = [
  { id:'english',           label:'English Language',   icon:<PIcBook s={28}/>,   bg:'bg-green-600',  light:'bg-green-50',  text:'text-green-700',  desc:'30Q · 20 min' },
  { id:'numerical_ability', label:'Numerical Ability',  icon:<PIcHash s={28}/>,   bg:'bg-orange-500', light:'bg-orange-50', text:'text-orange-700', desc:'35Q · 20 min' },
  { id:'reasoning',         label:'Reasoning Ability',  icon:<PIcPuzzle s={28}/>, bg:'bg-purple-600', light:'bg-purple-50', text:'text-purple-700', desc:'35Q · 20 min' },
]

const NAV_ITEMS = [
  { id:'dashboard',     label:'Dashboard',      icon:<PIcHome s={16}/> },
  { id:'mock',          label:'Full Mock Test',  icon:<PIcEdit s={16}/>,   isPractice:true },
  { id:'topic',         label:'Topic Practice',  icon:<PIcTarget s={16}/>, isPractice:true },
  { id:'section',       label:'Section Test',    icon:<PIcTimer s={16}/>,  isPractice:true },
  { id:'performance',   label:'My Performance',  icon:<PIcChart s={16}/> },
  { id:'planner',       label:'Study Planner',   icon:<PIcCal s={16}/> },
  { id:'subscriptions', label:'Subscriptions',   icon:<PIcCard s={16}/> },
  { id:'profile',       label:'Profile',         icon:<PIcUser s={16}/> },
  { id:'settings',      label:'Settings',        icon:<PIcGear s={16}/> },
]

const ALL_PRODUCTS = [
  { cat:'BANKING',     items:[{t:'Bank Clerk Prelims',active:true},'Bank PO','RRB Clerk','RRB PO','Blog'] },
  { cat:'GOVERNMENT',  items:['UPSC Prelims','SSC CGL','SSC CHSL','State PSC','Blog'] },
  { cat:'ENGINEERING', items:['GATE CS','GATE ECE','JEE Mains','JEE Advanced','Blog'] },
  { cat:'MANAGEMENT',  items:['CAT','GMAT','MAT','XAT','Blog'] },
  { cat:'LANGUAGES',   items:['IELTS','TOEFL','PTE','Blog'] },
  { cat:'MEDICAL',     items:['NEET UG','NEET PG','AIIMS','Blog'] },
]

/* ─── TAG STYLES ────────────────────────────────────────────── */
const TAG = { Popular:'bg-amber-100 text-amber-700', New:'bg-emerald-100 text-emerald-700' }

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
export default function PracticePage({ user, isAdmin = false, onStartTest, onLogout, onNav }) {
  const [activeNav,    setActiveNav]    = useState(() => { try { const t=sessionStorage.getItem('mt-practice-tab'); if(t){sessionStorage.removeItem('mt-practice-tab');return t} } catch{} return 'mock' })
  const [mobileSide,   setMobileSide]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const raw     = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const skip    = ['admin','test','user','testuser','administrator']
  const uName   = skip.includes(raw.toLowerCase()) ? (user?.email?.split('@')[0] || raw) : raw
  const initials= uName.slice(0,2).toUpperCase()
  // isAdmin is passed as a prop from App.jsx (resolved via user_access DB table)

  /* registration + subscription → which exams the user may see */
  const plan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
  const isPro = !['free','','none'].includes(plan)
  const registeredExamIds = (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length)
    ? user.user_metadata.selected_exams
    : (user?.user_metadata?.target_exam ? [user.user_metadata.target_exam] : [])
  const hasReg = registeredExamIds.length > 0
  // Category filter — maps selected_categories to PracticePage group ids
  const PRACTICE_CAT_TO_GROUP = {
    banking: ['ibps','sbi','rrb','psu'],
    engineering: ['eamcet'],
  }
  const _selCatsPrac = Array.isArray(user?.user_metadata?.selected_categories) ? user.user_metadata.selected_categories : []
  const visibleGroups = (() => {
    if (_selCatsPrac.length > 0) {
      const allowed = new Set(_selCatsPrac.flatMap(c => PRACTICE_CAT_TO_GROUP[c] || []))
      const filtered = EXAM_GROUPS.filter(g => allowed.has(g.id))
      if (!filtered.length) return []
      if (isPro || !hasReg) return filtered
      return filtered
        .map(g => ({ ...g, exams: g.exams.filter(e => registeredExamIds.includes(e.id) || FREE_OPEN_EXAM_IDS.has(e.id)) }))
        .filter(g => g.exams.length > 0)
    }
    const base = EXAM_GROUPS
    if (isPro || !hasReg) return base
    return base
      .map(g => ({ ...g, exams: g.exams.filter(e => registeredExamIds.includes(e.id) || FREE_OPEN_EXAM_IDS.has(e.id)) }))
      .filter(g => g.exams.length > 0)
  })()

  function handleNav(id) {
    setMobileSide(false)
    if (id === 'dashboard')  { onNav?.('dashboard'); return }
    if (id === 'performance'){ onNav?.('performance'); return }
    if (id === 'planner')    { onNav?.('planner');   return }
    if (id === 'subscriptions'){ onNav?.('subscriptions'); return }
    if (id === 'profile')    { onNav?.('profile');   return }
    if (id === 'settings')   { onNav?.('settings');  return }
    setActiveNav(id)
  }

  function handleLaunch(examId) { onStartTest?.('mock', examId) }
  function handleTopic(topic)   { onStartTest?.('topic', topic) }
  function handleSection(secId) { onStartTest?.('section', secId) }

  return (
    <div className="h-screen overflow-hidden flex flex-col text-sm" style={{background:'#ffffff'}}>

      {/* ── TOPBAR ── */}
      <header className="sticky top-0 z-50 shadow-md flex-shrink-0" style={{background:'#111', paddingTop:'env(safe-area-inset-top,0px)'}}>
      <div className="h-14 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#F06535'}}>
            <span className="text-white text-xs font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-white font-bold text-sm">MockTest</div>
            <div style={{fontSize:8.5,fontWeight:700,color:'#F06535',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={()=>onNav?.('admin')} className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 transition-colors"><PIcGear s={14}/></button>
          )}

          {/* User avatar dropdown — desktop */}
          <div className="relative hidden sm:block">
            {userMenuOpen && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setUserMenuOpen(false)}/>}
            <button
              onClick={()=>setUserMenuOpen(o=>!o)}
              style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:999,padding:'4px 10px 4px 4px',cursor:'pointer',position:'relative',zIndex:50}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#F06535,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#fff',flexShrink:0}}>
                {(uName[0]||'U').toUpperCase()}
              </div>
              <span style={{fontSize:12,fontWeight:700,color:'#fff',maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {(uName||'').split(' ')[0]}
              </span>
              <svg width="10" height="10" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"
                style={{transform:userMenuOpen?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {userMenuOpen && (
              <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,boxShadow:'0 8px 28px rgba(0,0,0,.15)',minWidth:210,zIndex:50,overflow:'hidden'}}>
                <style>{`@keyframes dd-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <div style={{padding:'12px 14px 10px',borderBottom:'1px solid #f5f5f5',display:'flex',alignItems:'center',gap:10,animation:'dd-in .15s ease-out'}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#F06535,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,color:'#fff',flexShrink:0}}>
                    {(uName[0]||'U').toUpperCase()}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:800,color:'#111827',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{uName}</div>
                    <div style={{fontSize:11,color:'#9ca3af',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email}</div>
                  </div>
                </div>
                <button onClick={()=>{setUserMenuOpen(false);onLogout()}}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 14px 12px',fontSize:13,fontWeight:600,color:'#ef4444',background:'none',border:'none',cursor:'pointer',textAlign:'left',transition:'background .1s'}}
                  onMouseOver={e=>e.currentTarget.style.background='#fff5f5'}
                  onMouseOut={e=>e.currentTarget.style.background='none'}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile: avatar only (taps open sidebar) */}
          <button onClick={()=>setMobileSide(true)} className="sm:hidden flex items-center justify-center rounded-full"
            style={{width:34,height:34,background:'linear-gradient(135deg,#F06535,#ff8a5f)',border:'none',cursor:'pointer',flexShrink:0}}>
            <span style={{color:'#fff',fontSize:12,fontWeight:900}}>{(uName[0]||'U').toUpperCase()}</span>
          </button>
        </div>
      </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <>
          {mobileSide && (
            <div className="fixed inset-0 bg-black/40 z-30 sm:hidden" onClick={()=>setMobileSide(false)} />
          )}
          <aside className={`
            w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0
            fixed sm:relative inset-y-0 left-0 z-30
            transform transition-transform duration-200 ease-in-out
            ${mobileSide ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          `}>

            {/* Mobile close */}
            <div className="flex items-center justify-between px-4 py-3 sm:hidden border-b border-gray-100" style={{paddingTop:'calc(env(safe-area-inset-top,0px) + 12px)'}}>
              <span className="text-gray-900 font-bold text-sm">Menu</span>
              <button onClick={()=>setMobileSide(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2 overflow-y-auto">

              {/* Dashboard */}
              <button
                onClick={()=>handleNav('dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors mb-0.5"
              >
                <span className="inline-flex"><PIcHome s={16}/></span><span className="text-sm">Dashboard</span>
              </button>

              {/* Practice section header */}
              <div className="px-3 pt-4 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Practice</div>

              {/* 3 practice modes — grouped segmented block */}
              <div className="mx-1 p-1 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
                {[
                  { id:'mock',    icon:<PIcEdit s={15}/>,   label:'Full Mock Test'  },
                  { id:'topic',   icon:<PIcTarget s={15}/>, label:'Topic Practice'  },
                  { id:'section', icon:<PIcTimer s={15}/>,  label:'Section Test'    },
                ].map(m => {
                  const active = activeNav === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={()=>handleNav(m.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                        active ? 'text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 font-medium'
                      }`}
                      style={active ? {background:'#F06535'} : {}}
                    >
                      <span>{m.icon}</span>
                      <span className="text-sm">{m.label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white/70" />}
                    </button>
                  )
                })}
              </div>

              {/* Other section */}
              <div className="px-3 pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Account</div>

              {[
                { id:'performance',   icon:<PIcChart s={15}/>, label:'My Performance' },
                { id:'planner',       icon:<PIcCal s={15}/>,   label:'Study Planner' },
                { id:'subscriptions', icon:<PIcCard s={15}/>,  label:'Subscriptions' },
                { id:'profile',       icon:<PIcUser s={15}/>,  label:'Profile'       },
                { id:'settings',      icon:<PIcGear s={15}/>,  label:'Settings'      },
              ].map(n => (
                <button
                  key={n.id}
                  onClick={()=>handleNav(n.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors mb-0.5"
                >
                  <span>{n.icon}</span><span className="text-sm">{n.label}</span>
                </button>
              ))}

            </nav>

            {/* Bottom: compact user info + logout (mobile sidebar) */}
            <div className="border-t border-gray-100 p-3 sm:hidden">
              <div className="flex items-center gap-3 px-1 py-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'linear-gradient(135deg,#F06535,#ff8a5f)'}}>
                  <span className="text-white text-sm font-bold">{(uName[0]||'U').toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-gray-900 text-sm font-semibold truncate">{uName}</div>
                  <div className="text-gray-400 text-xs truncate">{user?.email||''}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold border border-red-200"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Sign Out</span>
              </button>
            </div>

          </aside>
        </>

        {/* ── MAIN ── */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{paddingBottom:'env(safe-area-inset-bottom,0px)'}}>

          {/* Page header */}
          <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10">
            <h1 className="text-lg font-bold text-gray-900">
              { activeNav==='mock'    ? 'Full Mock Test'
              : activeNav==='topic'   ? 'Topic Practice'
              : activeNav==='section' ? 'Section Test'
              : 'Practice' }
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              { activeNav==='mock'    ? 'Choose an exam and launch a full 100-question mock test'
              : activeNav==='topic'   ? 'Select any topic for focused practice — any difficulty, any count'
              : activeNav==='section' ? 'Practice a single section — 20 minutes, full scoring'
              : 'Choose a mode to start practising' }
            </p>
          </div>

          <div className="p-6">

            {/* ── FULL MOCK TEST ── */}
            {activeNav === 'mock' && (
              <div className="space-y-6">
                {!isPro && hasReg && (
                  <div className="rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3" style={{background:'#1a1a2e'}}>
                    <div className="text-center sm:text-left">
                      <div className="text-sm font-bold text-white">You're on the Free plan</div>
                      <div className="text-xs text-gray-300 mt-0.5">Showing only your registered exam. Upgrade to Pro to unlock all exams.</div>
                    </div>
                    <button onClick={()=>onNav?.('subscriptions')}
                      className="text-white text-xs font-bold px-5 py-2.5 rounded-xl flex-shrink-0"
                      style={{background:'#F06535'}}>⭐ Upgrade to Pro</button>
                  </div>
                )}
                {visibleGroups.length === 0 && _selCatsPrac.length > 0 && (
                  <div className="text-center py-16">
                    <div style={{width:48,height:48,borderRadius:'50%',background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-500">No practice tests for your selected categories</div>
                    <div className="text-xs text-gray-400 mt-1">Select Banking or Engineering to see available tests</div>
                  </div>
                )}
                {visibleGroups.map(g => (
                  <div key={g.id}>
                    <div
                      className="flex items-center px-4 py-2.5 rounded-xl mb-3 text-white text-sm font-bold"
                      style={{ background: g.color }}
                    >
                      {g.label}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {g.exams.map(e => (
                        <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 hover:border-blue-300 hover:shadow-sm transition-all">
                          {e.tag && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${TAG[e.tag]||'bg-gray-100 text-gray-600'}`}>{e.tag}</span>
                          )}
                          <div className="font-semibold text-gray-800">{e.name}</div>
                          <div className="text-xs text-gray-400">{e.meta}</div>
                          <button
                            onClick={()=>handleLaunch(e.id)}
                            className="mt-auto text-xs font-bold rounded-lg py-1.5 transition-all"
                            style={{color:'#F06535',border:'1px solid #fec9b0'}}
                            onMouseOver={e=>{e.currentTarget.style.background='#F06535';e.currentTarget.style.color='#fff'}}
                            onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#F06535'}}
                          >
                            Launch
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TOPIC PRACTICE ── */}
            {activeNav === 'topic' && (
              <div className="space-y-6">
                {/* Exam context banner (native only) */}
                {isNative && (() => {
                  const targetId = user?.user_metadata?.target_exam || ''
                  if (!targetId) return null
                  const allGroups = [...EXAM_GROUPS, {id:'eamcet',label:'EAMCET Exams',color:'#7c3aed',exams:[{id:'ap_eamcet_engg',name:'AP EAMCET Engineering'},{id:'ts_eamcet_engg',name:'TS EAMCET Engineering'}]}]
                  const grp = allGroups.find(g=>g.exams.some(e=>e.id===targetId))
                  const examName = grp?.exams.find(e=>e.id===targetId)?.name || ''
                  if (!examName) return null
                  const isEngineering = targetId.includes('eamcet')
                  return (
                    <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                      style={{background:'#f8f9fa',border:'1px solid #e5e7eb'}}>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Preparing for</div>
                        <div className="text-sm font-bold text-gray-900">{examName}</div>
                        {isEngineering && <div className="text-xs text-amber-600 mt-0.5">Banking topics shown — EAMCET-specific topics coming soon</div>}
                      </div>
                      <button onClick={()=>handleNav('mock')}
                        className="text-xs font-bold px-4 py-2 rounded-lg flex-shrink-0"
                        style={{background:'#F06535',color:'#fff'}}>
                        Full Mock →
                      </button>
                    </div>
                  )
                })()}
                {TOPICS.map(sec => (
                  <div key={sec.section}>
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border mb-3 ${sec.bg} ${sec.color} ${sec.border}`}>
                      {sec.section}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {sec.items.map(t => (
                        <button
                          key={t.topic}
                          onClick={()=>handleTopic(t.topic)}
                          className="text-left px-3 py-2.5 bg-white rounded-lg border border-gray-200 text-gray-700 font-medium transition-all"
                          onMouseOver={e=>{e.currentTarget.style.borderColor='#F06535';e.currentTarget.style.background='#FFF3EE';e.currentTarget.style.color='#F06535'}}
                          onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.background='#fff';e.currentTarget.style.color='#374151'}}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION TEST ── */}
            {activeNav === 'section' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={()=>handleSection(s.id)}
                    className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform`}>
                      {s.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">{s.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
                    </div>
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${s.light} ${s.text}`}>
                      Start Test →
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>


        </main>
      </div>
    </div>
  )
}
