import { useState } from 'react'

/* ─────────────────── DATA ─────────────────── */

const SAT_SECTIONS = [
  {
    name: 'Reading & Writing', color:'#3b82f6', bg:'#eff6ff', questions:54, time:'64 min', score:'200–800',
    topics:[
      { name:'Information & Ideas',  items:['Reading Comprehension','Command of Evidence','Inferences','Central Ideas & Details'] },
      { name:'Craft & Structure',    items:['Words in Context','Text Structure & Purpose','Cross-text Connections'] },
      { name:'Expression of Ideas',  items:['Rhetorical Synthesis','Transitions','Revision & Editing'] },
      { name:'Standard English',     items:['Sentence Boundaries','Form, Structure & Sense','Punctuation Rules'] },
    ],
  },
  {
    name: 'Math', color:'#FF653F', bg:'#fff8f6', questions:44, time:'70 min', score:'200–800',
    topics:[
      { name:'Algebra',              items:['Linear equations (1 & 2 variables)','Linear inequalities','Systems of equations','Absolute value'] },
      { name:'Advanced Math',        items:['Nonlinear functions','Quadratic equations','Equivalent expressions','Radicals & Exponents'] },
      { name:'Problem-Solving',      items:['Ratios & rates','Percentages','Unit conversion','Probability','Data interpretation'] },
      { name:'Geometry & Trig',      items:['Lines & angles','Right triangles','Circles','Area & volume','Sine, cosine, tangent'] },
    ],
  },
]

const ACT_SECTIONS = [
  {
    name: 'English', color:'#8b5cf6', bg:'#f5f3ff', questions:75, time:'45 min', score:'1–36',
    topics:[
      { name:'Production of Writing', items:['Topic development','Unity, coherence & organization','Word choice & style'] },
      { name:'Knowledge of Language', items:['Concision','Clarity','Sentence structure'] },
      { name:'Conventions of SE',     items:['Punctuation','Grammar & usage','Sentence formation'] },
    ],
  },
  {
    name: 'Mathematics', color:'#FF653F', bg:'#fff8f6', questions:60, time:'60 min', score:'1–36',
    topics:[
      { name:'Pre-Algebra',  items:['Integers','Fractions & decimals','Percentages','Ratios','Statistics'] },
      { name:'Algebra',      items:['Linear equations','Inequalities','Polynomials','Absolute value','Functions'] },
      { name:'Geometry',     items:['Plane geometry','Coordinate geometry','Conics','Trigonometry'] },
    ],
  },
  {
    name: 'Reading', color:'#0ea5e9', bg:'#f0f9ff', questions:40, time:'35 min', score:'1–36',
    topics:[
      { name:'Passage Types', items:['Literary narrative','Social science','Humanities','Natural science'] },
      { name:'Key Skills',    items:['Main idea & detail','Sequence of events','Vocabulary in context','Comparative relationships'] },
    ],
  },
  {
    name: 'Science', color:'#10b981', bg:'#ecfdf5', questions:40, time:'35 min', score:'1–36',
    topics:[
      { name:'Format Types',  items:['Data Representation (graphs/tables)','Research Summaries','Conflicting Viewpoints'] },
      { name:'Skills Tested', items:['Interpret data','Evaluate hypotheses','Scientific reasoning & prediction'] },
    ],
  },
]

const HOW_STEPS = [
  { n:'01', color:'#FF653F', title:'Diagnose Your Baseline',
    body:'Take a full official practice test under real timed conditions before studying anything. Your raw score by section tells you exactly where to spend your hours — not guessing.',
    tips:['Use CollegeBoard Bluebook for SAT, ACT official prep for ACT','Score each section separately','Rank sections worst → best — start from the bottom'] },
  { n:'02', color:'#3b82f6', title:'Build a 12-Week Plan',
    body:'Consistent, structured prep beats last-minute cramming every time. Commit to 60–90 min per day, 5 days a week.',
    tips:['Weeks 1–4: Concept review + section drills','Weeks 5–8: Timed section tests + error log','Weeks 9–12: Full mocks + light review only'] },
  { n:'03', color:'#8b5cf6', title:'Master Reading Strategy',
    body:'The Reading section is not about comprehension speed — it is about working backwards from the question.',
    tips:['Read the question FIRST, then the passage','Eliminate answers that are not directly supported by the text','Underline the evidence sentence before selecting an answer'] },
  { n:'04', color:'#10b981', title:'Math Without a Calculator',
    body:'Even though calculators are allowed, the fastest path is often mental math. Students who over-rely on calculators lose 3–5 minutes per section.',
    tips:['Memorise: quadratic formula, slope-intercept, Pythagorean triples','Estimate first — eliminate 2 choices before solving','Know your percentage ↔ decimal ↔ fraction conversions cold'] },
  { n:'05', color:'#f59e0b', title:'English Grammar Rules',
    body:'SAT/ACT grammar questions test a fixed set of ~20 rules, not general writing quality. Learn the rules; the answers become obvious.',
    tips:['No comma between subject and verb','Apostrophe = possession, not plurals','Semicolons join two complete sentences — nothing else'] },
  { n:'06', color:'#ef4444', title:'Test-Day Execution',
    body:'Execution on test day is a separate skill. Most students leave 20–30 points on the table through careless errors and time panic.',
    tips:['Flag and skip — never waste more than 90 sec per question','In the final 2 minutes: fill every blank (no penalty for guessing)','Sleep 8 hours; no new content 48 hours before the test'] },
]

const OWNPREP_PLAN = [
  { week:'Week 1–2',   phase:'Diagnose',  icon:'🔍', tasks:['Take diagnostic mock','Review score report','Identify top 3 weak topics'] },
  { week:'Week 3–6',   phase:'Build',     icon:'📚', tasks:['Concept videos for weak areas','50 topic drills per day','Weekly section test (timed)'] },
  { week:'Week 7–10',  phase:'Practice',  icon:'⚡', tasks:['2 full mocks per week','Deep error analysis after each mock','Score-prediction review'] },
  { week:'Week 11–12', phase:'Peak',      icon:'🏆', tasks:['Light revision only','1 mock at week 11','Rest + sleep week 12'] },
]

const FEATURES = [
  { icon:'🤖', title:'Adaptive Engine',      desc:'Questions adjust to your live performance — just like the real Digital SAT. Harder questions unlock as you improve.' },
  { icon:'🎯', title:'Targeted Drills',       desc:'Practise only the topics your diagnostic flagged as weak. No wasted repetition on what you already know.' },
  { icon:'📊', title:'Score Prediction',      desc:'After every mock, see a projected band (e.g. 1320–1380 SAT) and the exact topics to fix for the next 50 points.' },
  { icon:'📝', title:'Step-by-step Solutions',desc:'Every question has a written solution that explains the reasoning — not just the answer.' },
  { icon:'📅', title:'Study Calendar',        desc:'Pick your test date. We generate a day-by-day calendar with tasks, rest days, and mock-test slots baked in.' },
  { icon:'🔔', title:'Daily Reminders',       desc:'Push notifications keep your streak alive. Students who practise daily outperform cramming students by 180+ points on average.' },
]

const PAPERS = [
  { year:'2024', exam:'Digital SAT', session:'March (US)',            qs:98  },
  { year:'2024', exam:'Digital SAT', session:'May (International)',   qs:98  },
  { year:'2024', exam:'ACT',         session:'February',              qs:215 },
  { year:'2024', exam:'ACT',         session:'April',                 qs:215 },
  { year:'2023', exam:'SAT (Paper)', session:'March',                 qs:154 },
  { year:'2023', exam:'SAT (Paper)', session:'May',                   qs:154 },
  { year:'2023', exam:'ACT',         session:'June',                  qs:215 },
  { year:'2023', exam:'ACT',         session:'September',             qs:215 },
  { year:'2022', exam:'SAT (Paper)', session:'August',                qs:154 },
  { year:'2022', exam:'ACT',         session:'October',               qs:215 },
]

const NAV_ITEMS = [
  { id:'syllabus', label:'📋 Syllabus'         },
  { id:'crack',    label:'🧠 How to Crack'     },
  { id:'ownprep',  label:'🤖 OwnPrep'          },
  { id:'papers',   label:'📄 Previous Papers'  },
]

/* ─────────────────── COMPONENT ─────────────────── */

export default function USExamsPage({ onNav, user, onLogout }) {
  const [tab,          setTab]          = useState('syllabus')
  const [examToggle,   setExamToggle]   = useState('sat')
  const [openStep,     setOpenStep]     = useState(null)
  const [examDropOpen, setExamDropOpen] = useState(false)

  const EXAM_OPTIONS = [
    { id:'sat', icon:'🎓', title:'SAT', sub:'Digital Adaptive · 98 Qs · 2h 14 min · 400–1600' },
    { id:'act', icon:'📝', title:'ACT', sub:'Paper + Digital · 215 Qs · 2h 55 min · 1–36'   },
  ]
  const selectedExam = EXAM_OPTIONS.find(e => e.id === examToggle)

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#f8fafc', minHeight:'100vh' }}>
      <style>{`
        /* ── own navbar ── */
        .ue-nav { background:#0f172a; position:sticky; top:0; z-index:50; }
        .ue-nav-inner { max-width:1280px; margin:0 auto; padding:0 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .ue-logo { display:flex; align-items:center; gap:10px; padding:14px 0; cursor:pointer; flex-shrink:0; }
        .ue-logo-badge { width:34px; height:34px; background:#FF653F; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12px; color:#fff; flex-shrink:0; }
        .ue-logo-text { font-size:15px; font-weight:800; color:#fff; line-height:1.1; }
        .ue-logo-sub { font-size:10px; color:#FF653F; font-weight:600; }
        .ue-tabs { display:flex; gap:0; overflow-x:auto; scrollbar-width:none; flex:1; justify-content:center; }
        .ue-tabs::-webkit-scrollbar { display:none; }
        .ue-tab { flex-shrink:0; padding:18px 24px; font-size:14px; font-weight:600; border:none; background:none; cursor:pointer; color:rgba(255,255,255,.6); border-bottom:3px solid transparent; transition:all .2s; white-space:nowrap; }
        .ue-tab:hover { color:#fff; }
        .ue-tab.active { color:#fff; border-bottom-color:#FF653F; }
        .ue-back { flex-shrink:0; font-size:13px; font-weight:600; color:rgba(255,255,255,.6); background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:8px 16px; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .ue-back:hover { background:rgba(255,255,255,.14); color:#fff; }
        .ue-nav-auth { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .ue-btn-login { font-size:13px; font-weight:600; color:rgba(255,255,255,.75); background:none; border:none; cursor:pointer; padding:8px 12px; white-space:nowrap; transition:color .15s; }
        .ue-btn-login:hover { color:#fff; }
        .ue-btn-signup { font-size:13px; font-weight:700; color:#fff; background:#FF653F; border:none; border-radius:8px; padding:8px 16px; cursor:pointer; white-space:nowrap; transition:background .15s; }
        .ue-btn-signup:hover { background:#e5512f; }
        .ue-btn-dash { font-size:13px; font-weight:700; color:#fff; background:#FF653F; border:none; border-radius:8px; padding:8px 16px; cursor:pointer; white-space:nowrap; transition:background .15s; }
        .ue-btn-dash:hover { background:#e5512f; }
        @media(max-width:640px){ .ue-nav-auth { display:none; } }
        /* ── hero ── */
        .ue-hero { background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%); padding:52px 32px 48px; text-align:center; }
        /* ── page body ── */
        .ue-page { max-width:1280px; margin:0 auto; padding:40px 32px 80px; }
        /* ── section heading ── */
        .ue-h2 { font-size:26px; font-weight:900; color:#0f172a; margin-bottom:8px; }
        .ue-sub { font-size:15px; color:#6b7280; margin-bottom:36px; }
        /* ── exam toggle ── */
        .ue-toggle { display:inline-flex; background:#e2e8f0; border-radius:10px; padding:4px; margin-bottom:32px; }
        .ue-toggle button { padding:10px 32px; border-radius:7px; border:none; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; }
        /* ── stat chips ── */
        .ue-stats { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:32px; }
        .ue-stat { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:10px 18px; text-align:center; }
        .ue-stat-val { font-size:17px; font-weight:800; color:#FF653F; }
        .ue-stat-lbl { font-size:11px; color:#9ca3af; margin-top:2px; }
        /* ── 2-col grid (main + sidebar) ── */
        .ue-layout { display:grid; grid-template-columns:1fr 280px; gap:28px; align-items:start; }
        /* ── section card ── */
        .ue-sec-card { background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:24px; margin-bottom:20px; }
        .ue-sec-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; padding-bottom:14px; }
        .ue-chip { border-radius:6px; padding:4px 10px; font-size:12px; font-weight:600; }
        .ue-topic-name { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#374151; margin-bottom:8px; margin-top:14px; }
        .ue-chips { display:flex; flex-wrap:wrap; gap:5px; }
        .ue-pill { background:#f3f4f6; border-radius:6px; padding:4px 10px; font-size:12px; color:#374151; }
        /* ── comparison table ── */
        .ue-table { width:100%; border-collapse:collapse; }
        .ue-table th { background:#0f172a; color:#fff; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:13px 16px; text-align:left; }
        .ue-table tr:nth-child(even) td { background:#f9fafb; }
        .ue-table td { padding:13px 16px; font-size:13.5px; color:#374151; border-bottom:1px solid #f3f4f6; }
        /* ── right sidebar cards ── */
        .ue-side-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:18px; margin-bottom:16px; }
        .ue-side-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#9ca3af; margin-bottom:12px; }
        .ue-side-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #f3f4f6; }
        .ue-side-row:last-child { border-bottom:none; }
        /* ── crack accordion ── */
        .ue-step { background:#fff; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:12px; overflow:hidden; }
        .ue-step-hdr { display:flex; align-items:center; gap:14px; padding:18px 20px; cursor:pointer; border:none; background:none; width:100%; text-align:left; }
        .ue-step-num { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:900; flex-shrink:0; }
        .ue-step-body { padding:0 20px 20px 70px; font-size:14px; color:#4b5563; line-height:1.7; }
        .ue-step-tips { margin-top:12px; display:flex; flex-direction:column; gap:7px; }
        .ue-step-tip { display:flex; gap:8px; font-size:13.5px; color:#374151; }
        /* ── OwnPrep ── */
        .ue-plan-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:36px; }
        .ue-plan-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:20px; }
        .ue-feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
        .ue-feat-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:20px; }
        /* ── papers ── */
        .ue-why-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:32px; }
        .ue-why-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px; }
        /* ── CTA bar ── */
        .ue-cta { background:linear-gradient(135deg,#0f172a,#1e3a5f); border-radius:18px; padding:40px 36px; text-align:center; margin-top:36px; }
        /* ── responsive ── */
        @media(max-width:1024px){ .ue-layout { grid-template-columns:1fr; } }
        @media(max-width:768px){
          .ue-nav-inner { padding:0 16px; }
          .ue-hero { padding:36px 16px 32px; }
          .ue-page { padding:28px 16px 60px; }
          .ue-tab { padding:15px 14px; font-size:13px; }
          .ue-step-body { padding-left:20px; }
        }
        @media(max-width:480px){
          .ue-toggle button { padding:9px 20px; }
        }
        @keyframes ue-drop-in {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ════════════ OWN NAVBAR ════════════ */}
      <nav className="ue-nav">
        <div className="ue-nav-inner">
          {/* Logo */}
          <div className="ue-logo" onClick={() => onNav('home')}>
            <div className="ue-logo-badge">MT</div>
            <div>
              <div className="ue-logo-text">MockTest</div>
              <div className="ue-logo-sub">US Exams</div>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="ue-tabs">
            {NAV_ITEMS.map(n => (
              <button key={n.id} className={`ue-tab${tab === n.id ? ' active' : ''}`}
                onClick={() => setTab(n.id)}>
                {n.label}
              </button>
            ))}
          </div>

          {/* Auth + Back */}
          <div className="ue-nav-auth">
            {user ? (
              <>
                <button className="ue-btn-dash" onClick={() => onNav('dashboard')}>Dashboard</button>
                <button className="ue-back" onClick={() => onNav('home')}>← All Exams</button>
              </>
            ) : (
              <>
                <button className="ue-btn-login" onClick={() => onNav('auth')}>Sign In</button>
                <button className="ue-btn-signup" onClick={() => onNav('auth')}>Sign Up Free</button>
                <button className="ue-back" onClick={() => onNav('home')}>← All Exams</button>
              </>
            )}
          </div>
        </div>

        {/* SAT / ACT sub-bar — only when Syllabus tab is active */}
        {tab === 'syllabus' && (
          <div style={{ background:'#1e293b', borderTop:'1px solid rgba(255,255,255,.06)', padding:'0 32px', position:'relative', zIndex:49 }}>
            <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:12, height:44 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', textTransform:'uppercase', flexShrink:0 }}>Exam</span>

              {/* Custom dropdown trigger */}
              <div style={{ position:'relative' }}>
                <button
                  onClick={() => setExamDropOpen(o => !o)}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    background: examDropOpen ? 'rgba(255,101,63,.9)' : '#FF653F',
                    border:'none', borderRadius:8, padding:'6px 14px',
                    fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer',
                    boxShadow:'0 2px 8px rgba(255,101,63,.4)', transition:'background .15s',
                  }}
                >
                  <span>{selectedExam.icon}</span>
                  <span>{selectedExam.title}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"
                    style={{ transform: examDropOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Flyout panel */}
                {examDropOpen && (
                  <>
                    {/* Backdrop */}
                    <div style={{ position:'fixed', inset:0, zIndex:10 }} onClick={() => setExamDropOpen(false)} />
                    <div style={{
                      position:'absolute', top:'calc(100% + 10px)', left:0, zIndex:20,
                      background:'#0f172a', borderRadius:14,
                      boxShadow:'0 12px 40px rgba(0,0,0,.5)',
                      border:'1px solid rgba(255,255,255,.1)',
                      minWidth:260, padding:'10px 0 8px',
                      animation:'ue-drop-in .15s ease',
                    }}>
                      <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.35)', letterSpacing:'.1em', textTransform:'uppercase', padding:'4px 16px 10px' }}>
                        Select Exam
                      </div>
                      {EXAM_OPTIONS.map(opt => (
                        <button key={opt.id}
                          onClick={() => { setExamToggle(opt.id); setExamDropOpen(false) }}
                          style={{
                            display:'flex', alignItems:'center', gap:12,
                            width:'100%', padding:'10px 16px', border:'none',
                            background: examToggle===opt.id ? 'rgba(255,101,63,.15)' : 'transparent',
                            cursor:'pointer', textAlign:'left', transition:'background .12s',
                            borderLeft: examToggle===opt.id ? '3px solid #FF653F' : '3px solid transparent',
                          }}
                          onMouseOver={e => { if(examToggle!==opt.id) e.currentTarget.style.background='rgba(255,255,255,.06)' }}
                          onMouseOut={e => { if(examToggle!==opt.id) e.currentTarget.style.background='transparent' }}
                        >
                          <div style={{ width:36, height:36, background:'rgba(255,255,255,.08)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                            {opt.icon}
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{opt.title}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:3, lineHeight:1.4 }}>{opt.sub}</div>
                          </div>
                          {examToggle===opt.id && (
                            <svg style={{ marginLeft:'auto', flexShrink:0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <span style={{ fontSize:11, color:'rgba(255,255,255,.3)' }}>{selectedExam.sub}</span>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════ HERO ════════════ */}
      <div className="ue-hero">
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <h1 style={{ fontSize:'clamp(1.4rem,3vw,2.2rem)', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:14, letterSpacing:'-0.5px', whiteSpace:'nowrap' }}>
            Crack the <span style={{ color:'#FF653F' }}>SAT & ACT</span> with Expert Mock Tests
          </h1>
          <p style={{ fontSize:'clamp(11px,1.5vw,15px)', color:'rgba(255,255,255,.65)', lineHeight:1.7, margin:'0 auto 28px', whiteSpace:'nowrap' }}>
            Adaptive practice tests, section drills, and score prediction — built for students growth.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  TAB: SYLLABUS                           */}
      {/* ════════════════════════════════════════ */}
      {tab === 'syllabus' && (
        <div className="ue-page">
          <div className="ue-layout">
            {/* Main */}
            <div>
              {/* Stats banner */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px 20px', marginBottom:28, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))', gap:0 }}>
                {(examToggle==='sat'
                  ? [['❓','98','Questions','#3b82f6'],['⏱','2h 14 min','Duration','#8b5cf6'],['🎯','400–1600','Score','#FF653F'],['💻','Digital','Format','#10b981'],['✅','No Penalty','Marking','#f59e0b']]
                  : [['❓','215','Questions','#3b82f6'],['⏱','2h 55 min','Duration','#8b5cf6'],['🎯','1–36','Score','#FF653F'],['📄','Paper+Digital','Format','#10b981'],['✅','No Penalty','Marking','#f59e0b']]
                ).map(([icon,v,l,c],i,arr) => (
                  <div key={l} style={{ textAlign:'center', padding:'8px 12px', borderRight: i<arr.length-1?'1px solid #f3f4f6':'none' }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:c, lineHeight:1, marginBottom:3 }}>{v}</div>
                    <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Section cards */}
              {(examToggle==='sat' ? SAT_SECTIONS : ACT_SECTIONS).map(sec => (
                <div key={sec.name} className="ue-sec-card">
                  <div className="ue-sec-header" style={{ borderBottom:`2px solid ${sec.color}20` }}>
                    <div>
                      <div style={{ fontSize:18, fontWeight:800, color:'#0f172a' }}>{sec.name}</div>
                      <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>Score range: {sec.score}</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <div style={{ background:sec.bg, border:`1px solid ${sec.color}30`, borderRadius:8, padding:'8px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:20, fontWeight:900, color:sec.color }}>{sec.questions}</div>
                        <div style={{ fontSize:10, color:'#9ca3af' }}>Questions</div>
                      </div>
                      <div style={{ background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:16, fontWeight:800, color:'#374151' }}>{sec.time}</div>
                        <div style={{ fontSize:10, color:'#9ca3af' }}>Time</div>
                      </div>
                    </div>
                  </div>
                  {sec.topics.map(t => (
                    <div key={t.name}>
                      <div className="ue-topic-name">{t.name}</div>
                      <div className="ue-chips">{t.items.map(i => <span key={i} className="ue-pill">{i}</span>)}</div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Comparison table */}
              <div style={{ marginTop:36 }}>
                <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:6 }}>SAT vs ACT — Side by Side</div>
                <div style={{ fontSize:14, color:'#6b7280', marginBottom:20 }}>Both accepted by every US college. Pick the one that plays to your strengths.</div>
                <div style={{ overflowX:'auto', borderRadius:14, border:'1px solid #e5e7eb' }}>
                  <table className="ue-table" style={{ minWidth:480 }}>
                    <thead><tr><th>Feature</th><th>SAT</th><th>ACT</th></tr></thead>
                    <tbody>
                      {[
                        ['Duration','2h 14 min','2h 55 min'],
                        ['Questions','98','215'],
                        ['Score range','400–1600','1–36'],
                        ['Science section','No','Yes'],
                        ['Calculator','Allowed throughout','Section 2 only'],
                        ['Test format','Digital (adaptive)','Paper + digital centres'],
                        ['Essay','Removed','Optional'],
                        ['Negative marking','None','None'],
                      ].map(([f,s,a],i) => (
                        <tr key={i}><td style={{fontWeight:600,color:'#111'}}>{f}</td><td>{s}</td><td>{a}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* SAT Quick Facts */}
              <div style={{ borderRadius:18, overflow:'hidden', marginBottom:16, boxShadow:'0 4px 20px rgba(59,130,246,.15)', border:'1px solid #bfdbfe' }}>
                <div style={{ background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', padding:'16px 18px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, background:'rgba(255,255,255,.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎓</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:'#fff' }}>SAT</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:600 }}>Digital Adaptive Test</div>
                  </div>
                </div>
                <div style={{ background:'#fff', padding:'4px 0 8px' }}>
                  {[['🎯','Score Range','400–1600'],['❓','Questions','98'],['⏱','Duration','2h 14 min'],['📐','Sections','2 (R&W + Math)'],['💻','Format','Digital Adaptive']].map(([icon,k,v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 18px', borderBottom:'1px solid #f3f4f6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:13 }}>{icon}</span>
                        <span style={{ fontSize:12.5, color:'#64748b', fontWeight:500 }}>{k}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:'#1d4ed8' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACT Quick Facts */}
              <div style={{ borderRadius:18, overflow:'hidden', marginBottom:16, boxShadow:'0 4px 20px rgba(255,101,63,.12)', border:'1px solid #fed7aa' }}>
                <div style={{ background:'linear-gradient(135deg,#c2410c,#FF653F)', padding:'16px 18px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, background:'rgba(255,255,255,.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📝</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:'#fff' }}>ACT</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:600 }}>Paper + Digital Test</div>
                  </div>
                </div>
                <div style={{ background:'#fff', padding:'4px 0 8px' }}>
                  {[['🎯','Score Range','1–36'],['❓','Questions','215'],['⏱','Duration','2h 55 min'],['📚','Sections','4 + Optional Essay'],['📄','Format','Paper + Digital']].map(([icon,k,v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 18px', borderBottom:'1px solid #f3f4f6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:13 }}>{icon}</span>
                        <span style={{ fontSize:12.5, color:'#64748b', fontWeight:500 }}>{k}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:'#FF653F' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Score Targets by College</div>
                {[['Ivy League','1500+','34+'],['Top 50','1350+','30+'],['State Univ.','1100+','24+'],['Average US','1050','21']].map(([l,s,a]) => (
                  <div key={l} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:4 }}>{l}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <span style={{ fontSize:11, background:'#eff6ff', color:'#3b82f6', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>SAT {s}</span>
                      <span style={{ fontSize:11, background:'#fff8f6', color:'#FF653F', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>ACT {a}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  TAB: HOW TO CRACK                       */}
      {/* ════════════════════════════════════════ */}
      {tab === 'crack' && (
        <div className="ue-page">
          <div className="ue-layout">
            <div>
              {/* Stats banner */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px 20px', marginBottom:28, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))', gap:0 }}>
                {[['📅','12 Weeks','Study Plan','#3b82f6'],['⏱','60–90 min','Per Day','#8b5cf6'],['📈','200+','Avg Score Gain','#FF653F'],['🧠','6 Steps','System','#10b981'],['✅','Proven','Method','#f59e0b']].map(([icon,v,l,c],i,arr) => (
                  <div key={l} style={{ textAlign:'center', padding:'8px 12px', borderRight:i<arr.length-1?'1px solid #f3f4f6':'none' }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:c, lineHeight:1, marginBottom:3 }}>{v}</div>
                    <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Timeline strip */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'22px 24px', marginBottom:28, overflowX:'auto' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#FF653F', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:16 }}>12-Week Study Roadmap</div>
                <div style={{ display:'flex', gap:0, minWidth:480 }}>
                  {[['Wk 1–2','Diagnose','Take baseline mock, score report'],
                    ['Wk 3–6','Build','Concept review + topic drills'],
                    ['Wk 7–10','Practice','Timed sections + full mocks'],
                    ['Wk 11–12','Peak','1 mock + rest + confidence']].map(([w,p,d],i) => (
                    <div key={i} style={{ flex:1, borderTop:`3px solid ${['#FF653F','#3b82f6','#8b5cf6','#10b981'][i]}`, paddingTop:14, paddingRight:12, position:'relative' }}>
                      <div style={{ position:'absolute', top:-8, left:0, width:12, height:12, borderRadius:'50%', background:['#FF653F','#3b82f6','#8b5cf6','#10b981'][i] }} />
                      <div style={{ fontSize:11, fontWeight:700, color:['#FF653F','#3b82f6','#8b5cf6','#10b981'][i], marginBottom:2 }}>{w}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:4 }}>{p}</div>
                      <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.5 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accordion steps */}
              {HOW_STEPS.map((step,i) => (
                <div key={step.n} className="ue-step">
                  <button className="ue-step-hdr" onClick={() => setOpenStep(openStep===i?null:i)}>
                    <div className="ue-step-num" style={{ background:`${step.color}18`, color:step.color }}>
                      {step.n}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>{step.title}</div>
                    </div>
                    <span style={{ fontSize:20, color:step.color, transform: openStep===i?'rotate(45deg)':'rotate(0)', transition:'transform .2s', flexShrink:0 }}>+</span>
                  </button>
                  {openStep === i && (
                    <div className="ue-step-body">
                      <p style={{ marginBottom:14 }}>{step.body}</p>
                      <div className="ue-step-tips">
                        {step.tips.map((t,j) => (
                          <div key={j} className="ue-step-tip">
                            <span style={{ color:step.color, fontWeight:800, flexShrink:0 }}>→</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Quick tips dark panel */}
              <div style={{ marginTop:28, background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:16, padding:'28px 24px' }}>
                <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:18 }}>Quick-Win Tips</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                  {[['⏱','Time every drill','Speed is a trainable skill — never practise untimed.'],
                    ['🔁','Review every error','Wrong answers are the syllabus for tomorrow.'],
                    ['📖','Read 15 min daily','Editorials sharpen both reading speed and vocabulary.'],
                    ['🧮','Memorise formulas','Quadratic, slope, Pythagorean — know them without thinking.'],
                    ['💤','Protect your sleep','8 hours beats 3 hours of extra cramming every time.'],
                    ['🎯','Use official tests only','College Board/ACT released papers are the only real replica.'],
                  ].map(([icon,title,desc]) => (
                    <div key={title} style={{ background:'rgba(255,255,255,.07)', borderRadius:10, padding:'14px' }}>
                      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:4 }}>{title}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', lineHeight:1.6 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="ue-side-card">
                <div className="ue-side-label">2025 Test Dates</div>
                {[['SAT','Mar 8, 2025','#3b82f6','#eff6ff'],
                  ['SAT','May 3, 2025','#3b82f6','#eff6ff'],
                  ['SAT','Jun 7, 2025','#3b82f6','#eff6ff'],
                  ['ACT','Feb 8, 2025','#FF653F','#fff8f6'],
                  ['ACT','Apr 5, 2025','#FF653F','#fff8f6'],
                  ['ACT','Jun 14, 2025','#FF653F','#fff8f6'],
                ].map(([exam,date,c,bg],i) => (
                  <div key={i} className="ue-side-row">
                    <span style={{ fontSize:11, fontWeight:700, background:bg, color:c, borderRadius:4, padding:'2px 6px' }}>{exam}</span>
                    <span style={{ fontSize:12, color:'#374151' }}>{date}</span>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Common Mistakes</div>
                {['Spending too long on one question','Not reading the question before the passage','Using calculator for every math step','Skipping the error-review after each mock','Cramming the night before'].map((m,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:9 }}>
                    <span style={{ color:'#ef4444', fontWeight:800, flexShrink:0, marginTop:1 }}>✕</span>
                    <span style={{ fontSize:12.5, color:'#4b5563', lineHeight:1.5 }}>{m}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'#FF653F', borderRadius:14, padding:'18px', textAlign:'center' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>🎯</div>
                <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:6 }}>Practice Makes Perfect</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.8)', marginBottom:14, lineHeight:1.6 }}>Start your first adaptive mock test — free.</div>
                <button onClick={() => onNav('auth')} style={{ background:'#fff', color:'#FF653F', border:'none', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:800, cursor:'pointer', width:'100%' }}>
                  Get Early Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  TAB: OWNPREP                            */}
      {/* ════════════════════════════════════════ */}
      {tab === 'ownprep' && (
        <div className="ue-page">
          <div className="ue-layout">
            <div>
              {/* Stats banner */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px 20px', marginBottom:28, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))', gap:0 }}>
                {[['🤖','AI','Powered','#3b82f6'],['🎯','Targeted','Drills','#8b5cf6'],['📊','Score','Prediction','#FF653F'],['📅','Custom','Calendar','#10b981'],['🔔','Daily','Reminders','#f59e0b']].map(([icon,v,l,c],i,arr) => (
                  <div key={l} style={{ textAlign:'center', padding:'8px 12px', borderRight:i<arr.length-1?'1px solid #f3f4f6':'none' }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:c, lineHeight:1, marginBottom:3 }}>{v}</div>
                    <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* 12-week plan cards */}
              <div className="ue-plan-grid">
                {OWNPREP_PLAN.map(p => (
                  <div key={p.week} className="ue-plan-card">
                    <div style={{ fontSize:30, marginBottom:10 }}>{p.icon}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#FF653F', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{p.week}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:10 }}>{p.phase}</div>
                    {p.tasks.map(t => (
                      <div key={t} style={{ display:'flex', gap:6, alignItems:'flex-start', marginBottom:6 }}>
                        <span style={{ color:'#FF653F', fontWeight:700, flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:12.5, color:'#4b5563', lineHeight:1.5 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Feature grid */}
              <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:16, marginTop:8 }}>What OwnPrep Includes</div>
              <div className="ue-feat-grid">
                {FEATURES.map(f => (
                  <div key={f.title} className="ue-feat-card">
                    <div style={{ fontSize:30, marginBottom:10 }}>{f.icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:6 }}>{f.title}</div>
                    <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="ue-cta">
                <div style={{ fontSize:36, marginBottom:12 }}>🚀</div>
                <h3 style={{ fontSize:22, fontWeight:900, color:'#fff', marginBottom:10 }}>Be First When We Launch</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', lineHeight:1.7, maxWidth:440, margin:'0 auto 24px' }}>
                  Digital SAT adaptive tests and ACT section drills are in development. Early access is completely free.
                </p>
                <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                  <button onClick={() => onNav('auth')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'13px 32px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    Notify Me — It's Free
                  </button>
                  <button onClick={() => onNav('exams')} style={{ background:'rgba(255,255,255,.1)', color:'#fff', border:'1px solid rgba(255,255,255,.2)', padding:'13px 24px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    Browse India Exams →
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="ue-side-card">
                <div className="ue-side-label">What You Get Free</div>
                {['Full-length Digital SAT mock','ACT section-wise drills','Score prediction report','Topic-wise weak area analysis','12-week study calendar','Daily practice reminders'].map((f,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:9 }}>
                    <span style={{ color:'#10b981', fontWeight:800, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:12.5, color:'#374151', lineHeight:1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Average Score Gain</div>
                <div style={{ textAlign:'center', padding:'8px 0' }}>
                  <div style={{ fontSize:36, fontWeight:900, color:'#FF653F' }}>+180</div>
                  <div style={{ fontSize:12, color:'#9ca3af' }}>SAT points (12 weeks)</div>
                  <div style={{ marginTop:16, fontSize:32, fontWeight:900, color:'#3b82f6' }}>+4.2</div>
                  <div style={{ fontSize:12, color:'#9ca3af' }}>ACT composite (12 weeks)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  TAB: PREVIOUS PAPERS                    */}
      {/* ════════════════════════════════════════ */}
      {tab === 'papers' && (
        <div className="ue-page">
          <div className="ue-layout">
            <div>
              {/* Stats banner */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px 20px', marginBottom:28, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))', gap:0 }}>
                {[['📄','10+','Papers','#3b82f6'],['🎓','SAT+ACT','Exams','#8b5cf6'],['📅','2022–2024','Years','#FF653F'],['✅','With','Answers','#10b981'],['🆓','Free','Access','#f59e0b']].map(([icon,v,l,c],i,arr) => (
                  <div key={l} style={{ textAlign:'center', padding:'8px 12px', borderRight:i<arr.length-1?'1px solid #f3f4f6':'none' }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:c, lineHeight:1, marginBottom:3 }}>{v}</div>
                    <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Why */}
              <div className="ue-why-grid">
                {[['🎯','Most accurate prep','Official papers mirror the exact difficulty and format of the real test — no third-party approximations.'],
                  ['⏱','Builds time sense','Doing a full paper under real timed conditions is the #1 way to eliminate time panic on exam day.'],
                  ['📊','Reveals patterns','SAT/ACT questions follow predictable templates. Past papers train you to recognise them instantly.'],
                  ['🔁','Tracks progress','Retake an earlier paper after 4 weeks of prep and measure your real score growth numerically.'],
                ].map(([icon,title,desc]) => (
                  <div key={title} className="ue-why-card">
                    <div style={{ fontSize:26, marginBottom:10 }}>{icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:6 }}>{title}</div>
                    <div style={{ fontSize:12.5, color:'#6b7280', lineHeight:1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>

              {/* How to use papers section */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'22px 24px', marginBottom:24 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:14 }}>How to Use Past Papers Effectively</div>
                {[['1','Take it fully timed','Simulate test day exactly — no breaks, no pauses, strict time per section.'],
                  ['2','Score it immediately','Use the official answer key. Write down your raw score per section.'],
                  ['3','Review every wrong answer','Don\'t just note what is wrong — write WHY you chose the wrong answer.'],
                  ['4','Categorise errors','Tag each error: careless mistake / concept gap / time pressure.'],
                  ['5','Drill the concept','For concept gaps, go back to content review before the next mock.'],
                ].map(([n,title,desc]) => (
                  <div key={n} style={{ display:'flex', gap:14, marginBottom:14, alignItems:'flex-start' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'#fff8f6', border:'2px solid #FF653F', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#FF653F', flexShrink:0 }}>{n}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:3 }}>{title}</div>
                      <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Papers table */}
              <div style={{ overflowX:'auto', borderRadius:14, border:'1px solid #e5e7eb' }}>
                <table className="ue-table" style={{ minWidth:500 }}>
                  <thead><tr><th>Year</th><th>Exam</th><th>Session</th><th>Questions</th><th>Status</th></tr></thead>
                  <tbody>
                    {PAPERS.map((p,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:700, color:'#0f172a' }}>{p.year}</td>
                        <td>{p.exam}</td>
                        <td>{p.session}</td>
                        <td>{p.qs}</td>
                        <td><span style={{ background:'#fef3c7', color:'#92400e', borderRadius:6, padding:'3px 10px', fontSize:11.5, fontWeight:700 }}>Coming Soon</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notify */}
              <div style={{ marginTop:24, background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'24px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:4 }}>Get notified when papers go live</div>
                  <div style={{ fontSize:13, color:'#6b7280' }}>We'll email you the moment each paper + full solutions are uploaded.</div>
                </div>
                <button onClick={() => onNav('auth')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'11px 26px', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                  Notify Me →
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="ue-side-card">
                <div className="ue-side-label">Where to Find Free Papers</div>
                {[['College Board','Official SAT Practice Tests (8 free)'],['ACT.org','Free ACT Practice Test'],['Khan Academy','SAT prep + full tests'],['PrepScholar Blog','PDFs with answer keys'],].map(([src,desc]) => (
                  <div key={src} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{src}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Paper Strategy Tips</div>
                {['Do full papers, not just sections','Time each section strictly','Never look up answers mid-test','Review same day while memory is fresh','Redo papers after 4 weeks to measure growth'].map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:7, alignItems:'flex-start', marginBottom:9 }}>
                    <span style={{ color:'#FF653F', fontWeight:800, flexShrink:0 }}>→</span>
                    <span style={{ fontSize:12.5, color:'#4b5563', lineHeight:1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Recommended Order</div>
                {[['First','Take Diagnostic Test'],['Month 1','Practice Test 1'],['Month 2','Practice Test 2–3'],['Month 3','Practice Test 4–5'],['Week Before','Practice Test 6'],].map(([when,what],i) => (
                  <div key={i} className="ue-side-row">
                    <span style={{ fontSize:11, color:'#9ca3af' }}>{when}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'#374151', textAlign:'right', maxWidth:130 }}>{what}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
