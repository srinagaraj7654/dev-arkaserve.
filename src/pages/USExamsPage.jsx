import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase.js'

/* ─────────────────── ICONS ─────────────────── */
const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const UIcGrad   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const UIcDoc    = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const UIcClip   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const UIcBrain  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.15A3 3 0 0 1 4 11.5a3 3 0 0 1 1.5-2.6 2.5 2.5 0 0 1 4-2.9z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.15A3 3 0 0 0 20 11.5a3 3 0 0 0-1.5-2.6 2.5 2.5 0 0 0-4-2.9z"/></svg>
const UIcRobot  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 7V5M8 7h8M2 15h2M20 15h2"/><circle cx="9" cy="15.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="15.5" r="1" fill="currentColor" stroke="none"/><path d="M9 19h6"/></svg>
const UIcChart  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const UIcTarget = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const UIcTimer  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l-1 2M19 3l1 2M9 3h6"/></svg>
const UIcHelp   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const UIcBook   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const UIcLap    = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
const UIcRuler  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 3l18 18M3 7V3h4M7 3l-4 4M3 13v4h4M7 21H3v-4M13 3h4v4M17 3l4 4M13 21h4v-4M21 13v4"/></svg>
const UIcRepeat = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
const UIcCal    = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const UIcBell   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const UIcStar   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const UIcFree   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const UIcCons   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const UIcWarn   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
const UIcArrowUp   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="18 15 12 9 6 15"/></svg>
const UIcArrowDown = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="6 9 12 15 18 9"/></svg>
const UIcUser   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const UIcPlay   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c||'currentColor'} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
const UIcCheck  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="20 6 9 17 4 12"/></svg>
const UIcTrend  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>

/* ─────────────────── DATA ─────────────────── */
const SAT_SECTIONS = [
  {
    name: 'Reading & Writing', color:'#2563eb', bg:'#eff6ff', questions:54, time:'64 min', score:'200–800',
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
    name: 'English', color:'#7c3aed', bg:'#f5f3ff', questions:75, time:'45 min', score:'1–36',
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
    name: 'Science', color:'#059669', bg:'#ecfdf5', questions:40, time:'35 min', score:'1–36',
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
  { n:'02', color:'#2563eb', title:'Build a 12-Week Plan',
    body:'Consistent, structured prep beats last-minute cramming every time. Commit to 60–90 min per day, 5 days a week.',
    tips:['Weeks 1–4: Concept review + section drills','Weeks 5–8: Timed section tests + error log','Weeks 9–12: Full mocks + light review only'] },
  { n:'03', color:'#7c3aed', title:'Master Reading Strategy',
    body:'The Reading section is not about comprehension speed — it is about working backwards from the question.',
    tips:['Read the question FIRST, then the passage','Eliminate answers that are not directly supported by the text','Underline the evidence sentence before selecting an answer'] },
  { n:'04', color:'#059669', title:'Math Without a Calculator',
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
  { week:'Week 1–2',   phase:'Diagnose',  icon:<UIcHelp s={30} c='#FF653F'/>,   tasks:['Take diagnostic mock','Review score report','Identify top 3 weak topics'] },
  { week:'Week 3–6',   phase:'Build',     icon:<UIcBook s={30} c='#2563eb'/>,   tasks:['Concept videos for weak areas','50 topic drills per day','Weekly section test (timed)'] },
  { week:'Week 7–10',  phase:'Practice',  icon:<UIcCons s={30} c='#7c3aed'/>,   tasks:['2 full mocks per week','Deep error analysis after each mock','Score-prediction review'] },
  { week:'Week 11–12', phase:'Peak',      icon:<UIcStar s={30} c='#f59e0b'/>,   tasks:['Light revision only','1 mock at week 11','Rest + sleep week 12'] },
]

const FEATURES = [
  { icon:<UIcRobot s={30} c='#2563eb'/>, title:'Adaptive Engine',      desc:'Questions adjust to your live performance — just like the real Digital SAT. Harder questions unlock as you improve.' },
  { icon:<UIcTarget s={30} c='#7c3aed'/>, title:'Targeted Drills',     desc:'Practise only the topics your diagnostic flagged as weak. No wasted repetition on what you already know.' },
  { icon:<UIcChart s={30} c='#FF653F'/>, title:'Score Prediction',     desc:'After every mock, see a projected band (e.g. 1320–1380 SAT) and the exact topics to fix for the next 50 points.' },
  { icon:<UIcDoc s={30} c='#0891b2'/>, title:'Step-by-step Solutions', desc:'Every question has a written solution that explains the reasoning — not just the answer.' },
  { icon:<UIcCal s={30} c='#059669'/>, title:'Study Calendar',         desc:'Pick your test date. We generate a day-by-day calendar with tasks, rest days, and mock-test slots baked in.' },
  { icon:<UIcBell s={30} c='#f59e0b'/>, title:'Daily Reminders',       desc:'Push notifications keep your streak alive. Students who practise daily outperform cramming students by 180+ points on average.' },
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
  { id:'syllabus', label:'Syllabus'        },
  { id:'crack',    label:'How to Crack'    },
  { id:'ownprep',  label:'OwnPrep'         },
  { id:'papers',   label:'Previous Papers' },
]

/* ─────────────────── HELPERS ─────────────────── */
function fmtExam(key) {
  const map = { sat_full:'SAT Full', sat_math:'SAT Math', sat_reading_writing:'SAT R&W', act_full:'ACT Full', act_english:'ACT English', act_math:'ACT Math', act_reading:'ACT Reading', act_science:'ACT Science' }
  return map[key] || (key || '').toUpperCase().replace('_',' ')
}
function fmtDate(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'})
}
function isSAT(exam) { return (exam||'').startsWith('sat') }

/* ─────────────────── SCORE ARC ─────────────────── */
function ScoreArc({ score, max, color }) {
  const pct = Math.min((score || 0) / max, 1)
  const r = 52, cx = 64, cy = 68
  const toRad = d => d * Math.PI / 180
  const startX = cx - r, endX = cx + r
  const angle = -180 + pct * 180
  const px = cx + r * Math.cos(toRad(angle))
  const py = cy + r * Math.sin(toRad(angle))
  const la = pct > 0.5 ? 1 : 0
  return (
    <svg width="128" height="76" viewBox="0 0 128 76">
      <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
        fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round"/>
      {(score||0) > 0 && <path d={`M ${startX} ${cy} A ${r} ${r} 0 ${la} 1 ${px} ${py}`}
        fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 6px ${color}66)` }}/>}
      <text x={cx} y={cy-6} textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900" fontFamily="Inter,system-ui,sans-serif">{score||'–'}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Inter,system-ui,sans-serif">/{max}</text>
    </svg>
  )
}

/* ─────────────────── SHIMMER SKELETON ─────────────────── */
function Shimmer({ w='100%', h=18, r=8, style={} }) {
  return (
    <div style={{ width:w, height:h, borderRadius:r, background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize:'200% 100%', animation:'ue-shimmer 1.4s infinite', ...style }}/>
  )
}

/* ─────────────────── PROGRESS BAR ─────────────────── */
function ProgressBar({ value, max, color, animate }) {
  const pct = Math.min(((value||0)/(max||1))*100, 100)
  return (
    <div style={{ background:'#f1f5f9', borderRadius:99, height:8, overflow:'hidden' }}>
      <div style={{ height:'100%', width: animate ? `${pct}%` : '0%', background:color, borderRadius:99, transition:'width 0.9s cubic-bezier(.4,0,.2,1)', boxShadow:`0 0 8px ${color}55` }}/>
    </div>
  )
}

/* ─────────────────── STAT BANNER ─────────────────── */
function StatBanner({ items }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'14px 20px', marginBottom:28, display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)`, gap:0, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
      {items.map(([icon,v,l,c],i,arr) => (
        <div key={l} style={{ textAlign:'center', padding:'8px 12px', borderRight:i<arr.length-1?'1px solid #f1f5f9':'none' }}>
          <div style={{ marginBottom:4, display:'flex', justifyContent:'center', color:c }}>{icon}</div>
          <div style={{ fontSize:15, fontWeight:800, color:c, lineHeight:1, marginBottom:3 }}>{v}</div>
          <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────── PROGRESS DASHBOARD ─────────────────── */
function ProgressDashboard({ user, onNav }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [barAnim, setBarAnim] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('results')
      .select('exam,total_score,max_score,percentage,correct_count,wrong_count,section_scores,weak_topics,exam_readiness,created_at')
      .eq('student_id', user.id)
      .or('exam.like.sat%,exam.like.act%')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setResults(data || [])
        setLoading(false)
        setTimeout(() => setBarAnim(true), 150)
      })
  }, [user?.id])

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'

  if (loading) {
    return (
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:28, marginBottom:28, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.05)' }}>
        <Shimmer h={20} w="220px" style={{ marginBottom:20 }} />
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 1fr 1fr', gap:16, marginBottom:20 }}>
          {[260,1,1,1].map((_,i) => <Shimmer key={i} h={100} r={12} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <Shimmer h={120} r={12} /><Shimmer h={120} r={12} />
        </div>
        <Shimmer h={140} r={12} />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={{ background:'linear-gradient(135deg,#1e3a5f,#0f172a)', border:'1px solid rgba(255,255,255,.08)', borderRadius:20, padding:'32px 28px', marginBottom:28, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:36, height:36, background:'rgba(255,101,63,.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <UIcUser s={18} c='#FF653F'/>
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.06em' }}>Welcome, {name}</span>
          </div>
          <h3 style={{ fontSize:22, fontWeight:900, color:'#fff', marginBottom:8 }}>No tests yet</h3>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.55)', lineHeight:1.7, maxWidth:420 }}>
            Take your first SAT practice test to unlock your personalised progress dashboard — score tracking, weak area analysis, and score predictions.
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => onNav('mocktest','sat_full')}
            style={{ background:'#FF653F', color:'#fff', border:'none', padding:'13px 28px', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 16px rgba(255,101,63,.4)', whiteSpace:'nowrap' }}>
            Start Full SAT (Free) →
          </button>
          <button onClick={() => onNav('mocktest','sat_math')}
            style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.75)', border:'1px solid rgba(255,255,255,.15)', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
            Math Only — 44 Questions
          </button>
        </div>
      </div>
    )
  }

  // Compute stats
  const latest = results[0]
  const latestScore = latest.total_score || 0
  const latestMax   = isSAT(latest.exam) ? 1600 : 36
  const isSATExam   = isSAT(latest.exam)
  const arcColor    = isSATExam ? '#2563eb' : '#7c3aed'

  const bestScore = Math.max(...results.map(r => r.total_score || 0))
  const avgAcc    = Math.round(results.reduce((s,r) => s + (r.percentage||0), 0) / results.length)
  const trend     = results.length >= 2 ? (results[0].total_score||0) - (results[1].total_score||0) : 0

  // Section scores (SAT: Math, R&W)
  const secScores = {}
  const secCounts = {}
  results.forEach(r => {
    if (!r.section_scores) return
    Object.entries(r.section_scores).forEach(([k,v]) => {
      secScores[k] = (secScores[k]||0) + (v?.score||0)
      secCounts[k] = (secCounts[k]||0) + 1
    })
  })
  const avgSection = Object.fromEntries(Object.keys(secScores).map(k => [k, Math.round(secScores[k]/secCounts[k])]))

  // Weak topics frequency
  const topicFreq = {}
  results.forEach(r => (r.weak_topics||[]).forEach(t => { topicFreq[t] = (topicFreq[t]||0)+1 }))
  const topWeak = Object.entries(topicFreq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t])=>t)

  const avgReadiness = Math.round(results.reduce((s,r) => s + (r.exam_readiness||0), 0) / results.length)
  const recent5 = results.slice(0,5)

  const satSections = [
    { key:'Math', color:'#FF653F', max:800 },
    { key:'Reading & Writing', color:'#2563eb', max:800 },
  ]
  const actSections = [
    { key:'English', color:'#7c3aed', max:36 },
    { key:'Mathematics', color:'#FF653F', max:36 },
    { key:'Reading', color:'#0ea5e9', max:36 },
    { key:'Science', color:'#059669', max:36 },
  ]
  const displaySections = isSATExam ? satSections : actSections

  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:28, marginBottom:28, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.05)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>Your Progress</p>
          <h3 style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>Hi {name}, here's your {isSATExam ? 'SAT' : 'ACT'} journey</h3>
        </div>
        <button onClick={() => onNav('mocktest', isSATExam ? 'sat_full' : 'act_full')}
          style={{ background:'linear-gradient(135deg,#FF653F,#e5512f)', color:'#fff', border:'none', padding:'10px 22px', borderRadius:10, fontSize:13, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,101,63,.35)', whiteSpace:'nowrap' }}>
          + Take a New Test
        </button>
      </div>

      {/* Row 1: Score arc + KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr', gap:14, marginBottom:16, alignItems:'stretch' }}>
        {/* Score card */}
        <div style={{ background:`linear-gradient(135deg,${isSATExam?'#1d4ed8':'#6d28d9'},${isSATExam?'#2563eb':'#7c3aed'})`, borderRadius:16, padding:'20px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:200 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>Latest Score</p>
          <ScoreArc score={latestScore} max={latestMax} color="#fff" />
          <div style={{ display:'flex', gap:12, marginTop:10 }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', background:'rgba(255,255,255,.1)', borderRadius:6, padding:'3px 8px' }}>Best: {bestScore}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', background:'rgba(255,255,255,.1)', borderRadius:6, padding:'3px 8px' }}>Target: {isSATExam?'1500':'32'}</span>
          </div>
        </div>

        {/* KPI: Tests */}
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:'18px 16px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ width:32, height:32, background:'#eff6ff', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
            <UIcClip s={16} c='#2563eb'/>
          </div>
          <div>
            <div style={{ fontSize:28, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{results.length}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:4, fontWeight:600 }}>Tests Taken</div>
          </div>
        </div>

        {/* KPI: Best */}
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:'18px 16px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ width:32, height:32, background:'#fff8f6', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
            <UIcStar s={16} c='#FF653F'/>
          </div>
          <div>
            <div style={{ fontSize:28, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{bestScore}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:4, fontWeight:600 }}>Best Score</div>
          </div>
        </div>

        {/* KPI: Accuracy + Trend */}
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:'18px 16px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ width:32, height:32, background:'#ecfdf5', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <UIcTrend s={16} c='#059669'/>
            </div>
            {trend !== 0 && (
              <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700, color: trend>0?'#059669':'#ef4444', background: trend>0?'#ecfdf5':'#fef2f2', borderRadius:6, padding:'2px 7px' }}>
                {trend>0 ? <UIcArrowUp s={12} c='#059669'/> : <UIcArrowDown s={12} c='#ef4444'/>}
                {Math.abs(trend)}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontSize:28, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{avgAcc}%</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:4, fontWeight:600 }}>Avg Accuracy</div>
          </div>
        </div>
      </div>

      {/* Row 2: Section breakdown + Weak areas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
        {/* Section breakdown */}
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:16 }}>Section Breakdown</p>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {displaySections.map(sec => {
              const val = avgSection[sec.key] || 0
              return (
                <div key={sec.key}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12.5, fontWeight:600, color:'#334155' }}>{sec.key}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:sec.color }}>{val || '–'}<span style={{ color:'#94a3b8', fontWeight:400 }}>/{sec.max}</span></span>
                  </div>
                  <ProgressBar value={val} max={sec.max} color={sec.color} animate={barAnim} />
                </div>
              )
            })}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12.5, fontWeight:600, color:'#334155' }}>Exam Readiness</span>
                <span style={{ fontSize:12, fontWeight:800, color:'#f59e0b' }}>{avgReadiness}%</span>
              </div>
              <ProgressBar value={avgReadiness} max={100} color='#f59e0b' animate={barAnim} />
            </div>
          </div>
        </div>

        {/* Weak areas */}
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:16 }}>Top Weak Areas</p>
          {topWeak.length === 0 ? (
            <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7 }}>Not enough data yet. Complete more tests to see your weak area analysis.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {topWeak.map((topic, i) => (
                <div key={topic} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:24, height:24, borderRadius:7, background: i===0?'#fef2f2':i===1?'#fffbeb':'#f8fafc', border:`1px solid ${i===0?'#fecaca':i===1?'#fde68a':'#e2e8f0'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:i===0?'#ef4444':i===1?'#f59e0b':'#64748b', flexShrink:0 }}>
                    {i+1}
                  </div>
                  <span style={{ fontSize:13, color:'#334155', fontWeight:i<2?600:500, lineHeight:1.4 }}>{topic}</span>
                  {i < 2 && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:i===0?'#ef4444':'#f59e0b', background:i===0?'#fef2f2':'#fffbeb', borderRadius:5, padding:'2px 6px', whiteSpace:'nowrap', flexShrink:0 }}>{i===0?'Focus':'Review'}</span>}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => onNav('dashboard')} style={{ marginTop:16, width:'100%', background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 0', fontSize:12, fontWeight:700, color:'#64748b', cursor:'pointer', transition:'all .15s' }}
            onMouseOver={e => { e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.color='#0f172a' }}
            onMouseOut={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#64748b' }}>
            View Full Analysis →
          </button>
        </div>
      </div>

      {/* Row 3: Recent tests */}
      <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e2e8f0' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.07em' }}>Recent Tests</p>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:520 }}>
            <thead>
              <tr style={{ background:'#fff' }}>
                {['Date','Exam','Score','Accuracy','Readiness',''].map(h => (
                  <th key={h} style={{ padding:'10px 16px', fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent5.map((r,i) => {
                const sat = isSAT(r.exam)
                const scoreColor = sat ? '#2563eb' : '#7c3aed'
                return (
                  <tr key={i} style={{ borderTop:'1px solid #f1f5f9', transition:'background .12s' }}
                    onMouseOver={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'11px 16px', fontSize:12.5, color:'#64748b', fontWeight:500, whiteSpace:'nowrap' }}>{fmtDate(r.created_at)}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <span style={{ fontSize:12, fontWeight:700, background: sat?'#eff6ff':'#f5f3ff', color: sat?'#2563eb':'#7c3aed', borderRadius:6, padding:'3px 9px' }}>{fmtExam(r.exam)}</span>
                    </td>
                    <td style={{ padding:'11px 16px', fontSize:14, fontWeight:900, color:scoreColor }}>{r.total_score||'–'}</td>
                    <td style={{ padding:'11px 16px', fontSize:13, fontWeight:600, color:'#334155' }}>{r.percentage ? `${Math.round(r.percentage)}%` : '–'}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ flex:1, background:'#e2e8f0', borderRadius:99, height:5, minWidth:60 }}>
                          <div style={{ height:'100%', width:`${r.exam_readiness||0}%`, background:'#f59e0b', borderRadius:99 }}/>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:'#64748b', whiteSpace:'nowrap' }}>{r.exam_readiness||0}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 16px' }}>
                      <button onClick={() => onNav('dashboard')} style={{ fontSize:11, fontWeight:700, color:'#FF653F', background:'#fff8f6', border:'1px solid rgba(255,101,63,.2)', borderRadius:7, padding:'5px 10px', cursor:'pointer', whiteSpace:'nowrap' }}>
                        Review →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── GUEST CTA BANNER ─────────────────── */
function GuestProgressBanner({ onNav }) {
  return (
    <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)', borderRadius:20, padding:'28px 32px', marginBottom:28, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:20, boxShadow:'0 8px 32px rgba(15,23,42,.25)' }}>
      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
        <div style={{ width:48, height:48, background:'rgba(255,101,63,.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <UIcChart s={24} c='#FF653F'/>
        </div>
        <div>
          <h3 style={{ fontSize:18, fontWeight:900, color:'#fff', marginBottom:4 }}>Track Your SAT/ACT Progress</h3>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.55)', lineHeight:1.6, maxWidth:420 }}>
            Sign in to unlock your personal progress dashboard — score history, weak area analysis, and score predictions after every test.
          </p>
        </div>
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <button onClick={() => onNav('auth')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'11px 24px', borderRadius:10, fontSize:13, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,101,63,.4)', whiteSpace:'nowrap' }}>
          Sign In Free →
        </button>
        <button onClick={() => onNav('mocktest','sat_full')} style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.8)', border:'1px solid rgba(255,255,255,.15)', padding:'11px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          Try SAT Test
        </button>
      </div>
    </div>
  )
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function USExamsPage({ onNav, user, onLogout }) {
  const [tab,          setTab]          = useState('syllabus')
  const [examToggle,   setExamToggle]   = useState('sat')
  const [openStep,     setOpenStep]     = useState(null)
  const [examDropOpen, setExamDropOpen] = useState(false)
  const [showFloat,    setShowFloat]    = useState(false)

  useEffect(() => {
    const onScroll = () => setShowFloat(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const EXAM_OPTIONS = [
    { id:'sat', icon:<UIcGrad s={18} c='currentColor'/>, title:'SAT', sub:'Digital Adaptive · 98 Qs · 2h 14 min · 400–1600' },
    { id:'act', icon:<UIcDoc s={18} c='currentColor'/>,  title:'ACT', sub:'Paper + Digital · 215 Qs · 2h 55 min · 1–36'   },
  ]
  const selectedExam = EXAM_OPTIONS.find(e => e.id === examToggle)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#f0f4f8', minHeight:'100vh', overflowX:'hidden' }}>
      <style>{`
        @keyframes ue-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ue-drop-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ue-float-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ue-nav { background:#060d1f; position:sticky; top:0; z-index:50; }
        .ue-nav-inner { max-width:1280px; margin:0 auto; padding:0 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .ue-logo { display:flex; align-items:center; gap:10px; padding:14px 0; cursor:pointer; flex-shrink:0; }
        .ue-logo-badge { width:34px; height:34px; background:#FF653F; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12px; color:#fff; flex-shrink:0; box-shadow:0 2px 8px rgba(255,101,63,.4); }
        .ue-logo-text { font-size:15px; font-weight:800; color:#fff; line-height:1.1; }
        .ue-logo-sub { font-size:10px; color:#FF653F; font-weight:600; letter-spacing:.04em; }
        .ue-tabs { display:flex; gap:0; overflow-x:auto; scrollbar-width:none; flex:1; min-width:0; justify-content:center; }
        .ue-tabs::-webkit-scrollbar { display:none; }
        .ue-tab { flex-shrink:0; padding:18px 22px; font-size:13.5px; font-weight:600; border:none; background:none; cursor:pointer; color:rgba(255,255,255,.5); border-bottom:2px solid transparent; transition:all .2s; white-space:nowrap; letter-spacing:.01em; }
        .ue-tab:hover { color:rgba(255,255,255,.85); }
        .ue-tab.active { color:#fff; border-bottom-color:#FF653F; }
        .ue-nav-auth { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .ue-btn-login { font-size:13px; font-weight:600; color:rgba(255,255,255,.65); background:none; border:none; cursor:pointer; padding:8px 12px; white-space:nowrap; transition:color .15s; }
        .ue-btn-login:hover { color:#fff; }
        .ue-btn-signup { font-size:13px; font-weight:700; color:#fff; background:#FF653F; border:none; border-radius:9px; padding:8px 18px; cursor:pointer; white-space:nowrap; transition:background .15s; box-shadow:0 2px 8px rgba(255,101,63,.35); }
        .ue-btn-signup:hover { background:#e5512f; }
        .ue-btn-dash { font-size:13px; font-weight:700; color:#fff; background:#FF653F; border:none; border-radius:9px; padding:8px 18px; cursor:pointer; white-space:nowrap; transition:background .15s; box-shadow:0 2px 8px rgba(255,101,63,.35); }
        .ue-btn-dash:hover { background:#e5512f; }
        .ue-back { flex-shrink:0; font-size:13px; font-weight:600; color:rgba(255,255,255,.55); background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:8px; padding:7px 14px; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .ue-back:hover { background:rgba(255,255,255,.13); color:#fff; }
        @media(max-width:640px){ .ue-nav-auth { display:none; } }
        .ue-hero { background:linear-gradient(135deg,#060d1f 0%,#0f1f3d 50%,#060d1f 100%); padding:56px 32px 52px; text-align:center; position:relative; overflow:hidden; }
        .ue-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 80% at 50% 120%,rgba(37,99,235,.18),transparent); }
        .ue-page { max-width:1280px; margin:0 auto; padding:36px 32px 80px; }
        .ue-layout { display:grid; grid-template-columns:1fr 288px; gap:24px; align-items:start; }
        .ue-sec-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,.04); overflow:hidden; position:relative; transition:box-shadow .2s; }
        .ue-sec-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
        .ue-topic-name { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#64748b; margin-bottom:8px; margin-top:14px; }
        .ue-chips { display:flex; flex-wrap:wrap; gap:5px; }
        .ue-pill { background:#f8fafc; border:1px solid #e2e8f0; border-radius:7px; padding:4px 10px; font-size:12px; color:#334155; transition:all .15s; }
        .ue-pill:hover { background:#eff6ff; border-color:#bfdbfe; color:#2563eb; }
        .ue-table { width:100%; border-collapse:collapse; }
        .ue-table th { background:#0f172a; color:rgba(255,255,255,.7); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; text-align:left; }
        .ue-table td { padding:13px 16px; font-size:13.5px; color:#374151; border-bottom:1px solid #f1f5f9; }
        .ue-table tr:hover td { background:#f8fafc; }
        .ue-side-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .ue-side-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; color:#94a3b8; margin-bottom:14px; }
        .ue-side-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #f1f5f9; }
        .ue-side-row:last-child { border-bottom:none; }
        .ue-step { background:#fff; border:1px solid #e2e8f0; border-radius:16px; margin-bottom:10px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); transition:box-shadow .2s; }
        .ue-step:hover { box-shadow:0 4px 16px rgba(0,0,0,.07); }
        .ue-step-hdr { display:flex; align-items:center; gap:14px; padding:18px 22px; cursor:pointer; border:none; background:none; width:100%; text-align:left; }
        .ue-step-body { padding:0 22px 22px 76px; font-size:14px; color:#4b5563; line-height:1.75; }
        .ue-step-tips { margin-top:12px; display:flex; flex-direction:column; gap:8px; }
        .ue-step-tip { display:flex; gap:10px; font-size:13.5px; color:#374151; }
        .ue-plan-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:28px; position:relative; }
        .ue-plan-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; box-shadow:0 1px 3px rgba(0,0,0,.04); position:relative; overflow:hidden; }
        .ue-feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }
        .ue-feat-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; box-shadow:0 1px 3px rgba(0,0,0,.04); transition:box-shadow .2s,transform .2s; }
        .ue-feat-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.09); transform:translateY(-2px); }
        .ue-why-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:24px; }
        .ue-why-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.04); transition:box-shadow .2s; }
        .ue-why-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.07); }
        .ue-cta { background:linear-gradient(135deg,#060d1f,#0f1f3d); border-radius:20px; padding:44px 40px; text-align:center; margin-top:28px; box-shadow:0 8px 32px rgba(6,13,31,.25); }
        .ue-float { position:fixed; bottom:28px; right:28px; z-index:999; animation:ue-float-in .3s ease; }
        .ue-exam-sub { font-size:11px; color:rgba(255,255,255,.35); }
        @media(max-width:1024px){ .ue-layout{grid-template-columns:1fr} }
        @media(max-width:768px){
          .ue-nav-inner{padding:0 16px}
          .ue-hero{padding:40px 16px 36px}
          .ue-page{padding:24px 16px 60px}
          .ue-tab{padding:14px 14px;font-size:12.5px}
          .ue-step-body{padding-left:22px}
          .ue-float{bottom:18px;right:18px}
        }
        @media(max-width:480px){
          .ue-exam-sub{display:none}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="ue-nav">
        <div className="ue-nav-inner">
          <div className="ue-logo" onClick={() => onNav('home')}>
            <div className="ue-logo-badge">MT</div>
            <div>
              <div className="ue-logo-text">MockTest</div>
              <div className="ue-logo-sub">US Exams</div>
            </div>
          </div>

          <div className="ue-tabs">
            {NAV_ITEMS.map(n => (
              <button key={n.id} className={`ue-tab${tab===n.id?' active':''}`} onClick={() => setTab(n.id)}>
                {n.label}
              </button>
            ))}
          </div>

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

        {tab === 'syllabus' && (
          <div style={{ background:'#0a1628', borderTop:'1px solid rgba(255,255,255,.05)', padding:'0 32px', position:'relative', zIndex:49 }}>
            <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:12, height:44 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.07em', textTransform:'uppercase', flexShrink:0 }}>Exam</span>
              <div style={{ position:'relative' }}>
                <button onClick={() => setExamDropOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:8, background: examDropOpen?'rgba(255,101,63,.9)':'#FF653F', border:'none', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 2px 10px rgba(255,101,63,.4)', transition:'background .15s' }}>
                  {selectedExam.icon}
                  <span>{selectedExam.title}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ transform:examDropOpen?'rotate(180deg)':'rotate(0)', transition:'transform .2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {examDropOpen && (
                  <>
                    <div style={{ position:'fixed', inset:0, zIndex:10 }} onClick={() => setExamDropOpen(false)}/>
                    <div style={{ position:'absolute', top:'calc(100% + 10px)', left:0, zIndex:20, background:'#0f172a', borderRadius:14, boxShadow:'0 16px 48px rgba(0,0,0,.55)', border:'1px solid rgba(255,255,255,.1)', minWidth:270, padding:'10px 0 8px', animation:'ue-drop-in .15s ease' }}>
                      <div style={{ fontSize:9.5, fontWeight:800, color:'rgba(255,255,255,.3)', letterSpacing:'.1em', textTransform:'uppercase', padding:'4px 16px 10px' }}>Select Exam</div>
                      {EXAM_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => { setExamToggle(opt.id); setExamDropOpen(false) }}
                          style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 16px', border:'none', background:examToggle===opt.id?'rgba(255,101,63,.14)':'transparent', cursor:'pointer', textAlign:'left', transition:'background .12s', borderLeft:examToggle===opt.id?'3px solid #FF653F':'3px solid transparent' }}
                          onMouseOver={e => { if(examToggle!==opt.id) e.currentTarget.style.background='rgba(255,255,255,.06)' }}
                          onMouseOut={e => { if(examToggle!==opt.id) e.currentTarget.style.background='transparent' }}>
                          <div style={{ width:36, height:36, background:'rgba(255,255,255,.08)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{opt.icon}</div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{opt.title}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:3, lineHeight:1.4 }}>{opt.sub}</div>
                          </div>
                          {examToggle===opt.id && <svg style={{ marginLeft:'auto', flexShrink:0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <span className="ue-exam-sub">{selectedExam.sub}</span>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div className="ue-hero">
        <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
          {user ? (
            <>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,101,63,.15)', border:'1px solid rgba(255,101,63,.25)', borderRadius:99, padding:'5px 14px', marginBottom:16 }}>
                <UIcUser s={13} c='#FF653F'/>
                <span style={{ fontSize:12, fontWeight:600, color:'#FF653F' }}>Welcome back, {userName}</span>
              </div>
              <h1 style={{ fontSize:'clamp(1.5rem,4.5vw,2.4rem)', fontWeight:900, color:'#fff', lineHeight:1.18, marginBottom:14, letterSpacing:'-0.5px' }}>
                Your <span style={{ color:'#FF653F' }}>SAT & ACT</span> Command Centre
              </h1>
              <p style={{ fontSize:'clamp(13px,1.8vw,15px)', color:'rgba(255,255,255,.55)', lineHeight:1.7, margin:'0 auto 24px', maxWidth:520 }}>
                Track progress, analyse weak spots, and take targeted practice — all in one place.
              </p>
            </>
          ) : (
            <>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:99, padding:'5px 14px', marginBottom:16 }}>
                <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.6)' }}>Digital SAT · ACT · Score Prediction</span>
              </div>
              <h1 style={{ fontSize:'clamp(1.5rem,4.5vw,2.4rem)', fontWeight:900, color:'#fff', lineHeight:1.18, marginBottom:14, letterSpacing:'-0.5px' }}>
                Crack the <span style={{ color:'#FF653F' }}>SAT & ACT</span><br/>with Expert Mock Tests
              </h1>
              <p style={{ fontSize:'clamp(13px,1.8vw,15px)', color:'rgba(255,255,255,.55)', lineHeight:1.7, margin:'0 auto 24px', maxWidth:520 }}>
                Adaptive practice tests, section drills, and score prediction — built for student growth.
              </p>
            </>
          )}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => onNav('mocktest','sat_full')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'14px 32px', borderRadius:12, fontSize:15, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 20px rgba(255,101,63,.45)', transition:'all .15s' }}
              onMouseOver={e => { e.currentTarget.style.background='#e5512f'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseOut={e => { e.currentTarget.style.background='#FF653F'; e.currentTarget.style.transform='translateY(0)' }}>
              Start SAT Practice Test →
            </button>
            <button onClick={() => setTab('syllabus')} style={{ background:'rgba(255,255,255,.09)', color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.18)', padding:'14px 24px', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
              onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.15)'}
              onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,.09)'}>
              View Syllabus
            </button>
          </div>
        </div>
      </div>

      {/* ── PROGRESS SECTION (between hero and tabs) ── */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 32px 0' }}>
        {user ? <ProgressDashboard user={user} onNav={onNav}/> : <GuestProgressBanner onNav={onNav}/>}
      </div>

      {/* ════════════════ TAB: SYLLABUS ════════════════ */}
      {tab === 'syllabus' && (
        <div className="ue-page" style={{ paddingTop:16 }}>
          <div className="ue-layout">
            <div>
              <StatBanner items={examToggle==='sat'
                ? [[<UIcHelp s={16} c='#2563eb'/>,'98','Questions','#2563eb'],[<UIcTimer s={16} c='#7c3aed'/>,'2h 14 min','Duration','#7c3aed'],[<UIcTarget s={16} c='#FF653F'/>,'400–1600','Score','#FF653F'],[<UIcLap s={16} c='#059669'/>,'Digital','Format','#059669'],[<UIcStar s={16} c='#f59e0b'/>,'No Penalty','Marking','#f59e0b']]
                : [[<UIcHelp s={16} c='#2563eb'/>,'215','Questions','#2563eb'],[<UIcTimer s={16} c='#7c3aed'/>,'2h 55 min','Duration','#7c3aed'],[<UIcTarget s={16} c='#FF653F'/>,'1–36','Score','#FF653F'],[<UIcDoc s={16} c='#059669'/>,'Paper+Digital','Format','#059669'],[<UIcStar s={16} c='#f59e0b'/>,'No Penalty','Marking','#f59e0b']]}
              />

              {examToggle === 'sat' && (
                <div style={{ background:'linear-gradient(135deg,#0f1f3d,#060d1f)', borderRadius:16, padding:'22px 26px', marginBottom:20, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, boxShadow:'0 4px 20px rgba(6,13,31,.25)' }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:4 }}>Ready to practise? Jump straight in.</div>
                    <div style={{ fontSize:12.5, color:'rgba(255,255,255,.45)', lineHeight:1.5 }}>All options are free. No sign-up required to preview questions.</div>
                  </div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <button onClick={() => onNav('mocktest','sat_full')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'10px 20px', borderRadius:9, fontSize:13, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap', boxShadow:'0 3px 10px rgba(255,101,63,.4)' }}>Full SAT — 98 Qs</button>
                    <button onClick={() => onNav('mocktest','sat_math')} style={{ background:'rgba(255,101,63,.12)', color:'#FF653F', border:'1px solid rgba(255,101,63,.35)', padding:'10px 18px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>Math Only — 44 Qs</button>
                    <button onClick={() => onNav('mocktest','sat_reading_writing')} style={{ background:'rgba(37,99,235,.12)', color:'#93c5fd', border:'1px solid rgba(37,99,235,.3)', padding:'10px 18px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>R&W Only — 54 Qs</button>
                  </div>
                </div>
              )}
              {examToggle === 'act' && (
                <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'18px 22px', marginBottom:20, display:'flex', alignItems:'center', gap:14, boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
                  <UIcWarn s={26} c='#f59e0b'/>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:3 }}>ACT Practice Tests — Coming Soon</div>
                    <div style={{ fontSize:12.5, color:'#6b7280', lineHeight:1.5 }}>
                      ACT engines are in development. <button onClick={() => onNav('mocktest','sat_full')} style={{ background:'none', border:'none', color:'#FF653F', fontWeight:700, cursor:'pointer', padding:0, fontSize:'inherit' }}>Try the SAT full test →</button>
                    </div>
                  </div>
                </div>
              )}

              {(examToggle==='sat' ? SAT_SECTIONS : ACT_SECTIONS).map(sec => (
                <div key={sec.name} className="ue-sec-card" style={{ borderLeft:`4px solid ${sec.color}` }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${sec.color}40,transparent)` }}/>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, paddingBottom:14, borderBottom:`1px solid ${sec.color}18` }}>
                    <div>
                      <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:2 }}>{sec.name}</div>
                      <div style={{ fontSize:12.5, color:'#64748b' }}>Score range: <span style={{ fontWeight:700, color:sec.color }}>{sec.score}</span></div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <div style={{ background:sec.bg, border:`1px solid ${sec.color}25`, borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                        <div style={{ fontSize:20, fontWeight:900, color:sec.color }}>{sec.questions}</div>
                        <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>Questions</div>
                      </div>
                      <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                        <div style={{ fontSize:15, fontWeight:800, color:'#334155' }}>{sec.time}</div>
                        <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>Time</div>
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

              <div style={{ marginTop:32 }}>
                <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:6 }}>SAT vs ACT — Side by Side</div>
                <div style={{ fontSize:14, color:'#64748b', marginBottom:18 }}>Both accepted by every US college. Pick the one that plays to your strengths.</div>
                <div style={{ overflowX:'auto', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
                  <table className="ue-table" style={{ minWidth:480 }}>
                    <thead><tr><th>Feature</th><th>SAT</th><th>ACT</th></tr></thead>
                    <tbody>
                      {[['Duration','2h 14 min','2h 55 min'],['Questions','98','215'],['Score range','400–1600','1–36'],['Science section','No','Yes'],['Calculator','Allowed throughout','Section 2 only'],['Test format','Digital (adaptive)','Paper + digital centres'],['Essay','Removed','Optional'],['Negative marking','None','None']].map(([f,s,a],i) => (
                        <tr key={i}><td style={{ fontWeight:600,color:'#111' }}>{f}</td><td>{s}</td><td>{a}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <div style={{ borderRadius:18, overflow:'hidden', marginBottom:16, boxShadow:'0 4px 20px rgba(37,99,235,.15)', border:'1px solid #bfdbfe' }}>
                <div style={{ background:'linear-gradient(135deg,#1d4ed8,#2563eb)', padding:'16px 18px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, background:'rgba(255,255,255,.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}><UIcGrad s={18} c='#fff'/></div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:'#fff' }}>SAT</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.65)', fontWeight:600 }}>Digital Adaptive Test</div>
                  </div>
                </div>
                <div style={{ background:'#fff', padding:'4px 0 8px' }}>
                  {[[<UIcTarget s={13}/>, 'Score Range','400–1600'],[<UIcHelp s={13}/>,'Questions','98'],[<UIcTimer s={13}/>,'Duration','2h 14 min'],[<UIcRuler s={13}/>,'Sections','2 (R&W + Math)'],[<UIcLap s={13}/>,'Format','Digital Adaptive']].map(([icon,k,v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 18px', borderBottom:'1px solid #f1f5f9' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ display:'inline-flex', color:'#64748b' }}>{icon}</span>
                        <span style={{ fontSize:12.5, color:'#64748b', fontWeight:500 }}>{k}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:'#2563eb' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderRadius:18, overflow:'hidden', marginBottom:16, boxShadow:'0 4px 20px rgba(255,101,63,.1)', border:'1px solid #fed7aa' }}>
                <div style={{ background:'linear-gradient(135deg,#c2410c,#FF653F)', padding:'16px 18px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, background:'rgba(255,255,255,.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}><UIcDoc s={18} c='#fff'/></div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:'#fff' }}>ACT</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.65)', fontWeight:600 }}>Paper + Digital Test</div>
                  </div>
                </div>
                <div style={{ background:'#fff', padding:'4px 0 8px' }}>
                  {[[<UIcTarget s={13}/>,'Score Range','1–36'],[<UIcHelp s={13}/>,'Questions','215'],[<UIcTimer s={13}/>,'Duration','2h 55 min'],[<UIcBook s={13}/>,'Sections','4 + Optional Essay'],[<UIcDoc s={13}/>,'Format','Paper + Digital']].map(([icon,k,v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 18px', borderBottom:'1px solid #f1f5f9' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ display:'inline-flex', color:'#64748b' }}>{icon}</span>
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
                  <div key={l} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#334155', marginBottom:5 }}>{l}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <span style={{ fontSize:11, background:'#eff6ff', color:'#2563eb', borderRadius:5, padding:'2px 8px', fontWeight:700 }}>SAT {s}</span>
                      <span style={{ fontSize:11, background:'#fff8f6', color:'#FF653F', borderRadius:5, padding:'2px 8px', fontWeight:700 }}>ACT {a}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ TAB: HOW TO CRACK ════════════════ */}
      {tab === 'crack' && (
        <div className="ue-page" style={{ paddingTop:16 }}>
          <div className="ue-layout">
            <div>
              <StatBanner items={[[<UIcCal s={16} c='#2563eb'/>,'12 Weeks','Study Plan','#2563eb'],[<UIcTimer s={16} c='#7c3aed'/>,'60–90 min','Per Day','#7c3aed'],[<UIcChart s={16} c='#FF653F'/>,'200+','Avg Score Gain','#FF653F'],[<UIcBrain s={16} c='#059669'/>,'6 Steps','System','#059669'],[<UIcStar s={16} c='#f59e0b'/>,'Proven','Method','#f59e0b']]}/>

              {/* Roadmap */}
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'22px 24px', marginBottom:22, boxShadow:'0 1px 3px rgba(0,0,0,.04)', overflowX:'auto' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#FF653F', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:18 }}>12-Week Study Roadmap</div>
                <div style={{ display:'flex', gap:0, minWidth:480 }}>
                  {[['Wk 1–2','Diagnose','Take baseline mock, score report','#FF653F'],
                    ['Wk 3–6','Build','Concept review + topic drills','#2563eb'],
                    ['Wk 7–10','Practice','Timed sections + full mocks','#7c3aed'],
                    ['Wk 11–12','Peak','1 mock + rest + confidence','#059669']].map(([w,p,d,c],i) => (
                    <div key={i} style={{ flex:1, borderTop:`3px solid ${c}`, paddingTop:16, paddingRight:14, position:'relative' }}>
                      <div style={{ position:'absolute', top:-7, left:0, width:11, height:11, borderRadius:'50%', background:c, boxShadow:`0 0 8px ${c}80` }}/>
                      <div style={{ fontSize:11, fontWeight:700, color:c, marginBottom:3 }}>{w}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:5 }}>{p}</div>
                      <div style={{ fontSize:12, color:'#64748b', lineHeight:1.55 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accordion steps */}
              {HOW_STEPS.map((step,i) => (
                <div key={step.n} className="ue-step">
                  <button className="ue-step-hdr" onClick={() => setOpenStep(openStep===i?null:i)}>
                    <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${step.color}22,${step.color}11)`, border:`1px solid ${step.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:step.color, flexShrink:0 }}>
                      {step.n}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>{step.title}</div>
                    </div>
                    <div style={{ width:28, height:28, borderRadius:8, background: openStep===i?`${step.color}15`:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', flexShrink:0 }}>
                      <span style={{ fontSize:16, color:step.color, transform:openStep===i?'rotate(45deg)':'rotate(0)', transition:'transform .2s', display:'block', lineHeight:1 }}>+</span>
                    </div>
                  </button>
                  {openStep === i && (
                    <div className="ue-step-body">
                      <p style={{ marginBottom:14 }}>{step.body}</p>
                      <div className="ue-step-tips">
                        {step.tips.map((t,j) => (
                          <div key={j} className="ue-step-tip">
                            <span style={{ width:20, height:20, borderRadius:6, background:`${step.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                              <span style={{ color:step.color, fontSize:12, fontWeight:900 }}>→</span>
                            </span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Quick tips */}
              <div style={{ marginTop:24, background:'linear-gradient(135deg,#060d1f,#0f1f3d)', borderRadius:18, padding:'28px 24px', boxShadow:'0 8px 32px rgba(6,13,31,.2)' }}>
                <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:20 }}>Quick-Win Tips</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                  {[[<UIcTimer s={20} c='rgba(255,255,255,.65)'/>, 'Time every drill','Speed is a trainable skill — never practise untimed.'],
                    [<UIcRepeat s={20} c='rgba(255,255,255,.65)'/>, 'Review every error','Wrong answers are the syllabus for tomorrow.'],
                    [<UIcBook s={20} c='rgba(255,255,255,.65)'/>,   'Read 15 min daily','Editorials sharpen both reading speed and vocabulary.'],
                    [<UIcCons s={20} c='rgba(255,255,255,.65)'/>,   'Memorise formulas','Quadratic, slope, Pythagorean — know them without thinking.'],
                    [<UIcCal s={20} c='rgba(255,255,255,.65)'/>,    'Protect your sleep','8 hours beats 3 hours of extra cramming every time.'],
                    [<UIcTarget s={20} c='rgba(255,255,255,.65)'/>, 'Use official tests only','College Board/ACT released papers are the only real replica.'],
                  ].map(([icon,title,desc]) => (
                    <div key={title} style={{ background:'rgba(255,255,255,.06)', borderRadius:12, padding:'16px 14px', border:'1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ marginBottom:10 }}>{icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:5 }}>{title}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.65 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="ue-side-card">
                <div className="ue-side-label">2025 Test Dates</div>
                {[['SAT','Mar 8, 2025','#2563eb','#eff6ff'],['SAT','May 3, 2025','#2563eb','#eff6ff'],['SAT','Jun 7, 2025','#2563eb','#eff6ff'],['ACT','Feb 8, 2025','#FF653F','#fff8f6'],['ACT','Apr 5, 2025','#FF653F','#fff8f6'],['ACT','Jun 14, 2025','#FF653F','#fff8f6']].map(([exam,date,c,bg],i) => (
                  <div key={i} className="ue-side-row">
                    <span style={{ fontSize:11, fontWeight:700, background:bg, color:c, borderRadius:5, padding:'2px 7px' }}>{exam}</span>
                    <span style={{ fontSize:12, color:'#374151', fontWeight:500 }}>{date}</span>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Common Mistakes</div>
                {['Spending too long on one question','Not reading the question before the passage','Using calculator for every math step','Skipping the error-review after each mock','Cramming the night before'].map((m,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ width:18, height:18, borderRadius:5, background:'#fef2f2', border:'1px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <span style={{ color:'#ef4444', fontWeight:900, fontSize:10 }}>✕</span>
                    </div>
                    <span style={{ fontSize:12.5, color:'#4b5563', lineHeight:1.55 }}>{m}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'linear-gradient(135deg,#FF653F,#e5512f)', borderRadius:16, padding:'20px', textAlign:'center', boxShadow:'0 4px 16px rgba(255,101,63,.35)' }}>
                <div style={{ marginBottom:10, display:'flex', justifyContent:'center' }}><UIcTarget s={26} c='#fff'/></div>
                <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:6 }}>Practice Makes Perfect</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.75)', marginBottom:16, lineHeight:1.65 }}>Start your first adaptive SAT mock — free.</div>
                <button onClick={() => onNav('mocktest','sat_full')} style={{ background:'#fff', color:'#FF653F', border:'none', padding:'11px 20px', borderRadius:9, fontSize:13, fontWeight:800, cursor:'pointer', width:'100%', boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}>
                  Start SAT Test →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ TAB: OWNPREP ════════════════ */}
      {tab === 'ownprep' && (
        <div className="ue-page" style={{ paddingTop:16 }}>
          <div className="ue-layout">
            <div>
              <StatBanner items={[[<UIcRobot s={16} c='#2563eb'/>,'AI','Powered','#2563eb'],[<UIcTarget s={16} c='#7c3aed'/>,'Targeted','Drills','#7c3aed'],[<UIcChart s={16} c='#FF653F'/>,'Score','Prediction','#FF653F'],[<UIcCal s={16} c='#059669'/>,'Custom','Calendar','#059669'],[<UIcBell s={16} c='#f59e0b'/>,'Daily','Reminders','#f59e0b']]}/>

              <div className="ue-plan-grid">
                {OWNPREP_PLAN.map((p,i) => {
                  const colors = ['#FF653F','#2563eb','#7c3aed','#f59e0b']
                  const c = colors[i]
                  return (
                    <div key={p.week} className="ue-plan-card">
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:c, borderRadius:'16px 16px 0 0' }}/>
                      <div style={{ width:52, height:52, borderRadius:14, background:`${c}15`, border:`1px solid ${c}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>{p.icon}</div>
                      <div style={{ fontSize:10, fontWeight:800, color:c, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{p.week}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:'#0f172a', marginBottom:12 }}>{p.phase}</div>
                      {p.tasks.map(t => (
                        <div key={t} style={{ display:'flex', gap:7, alignItems:'flex-start', marginBottom:7 }}>
                          <div style={{ width:16, height:16, borderRadius:4, background:`${c}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                            <span style={{ color:c, fontSize:9, fontWeight:900 }}>✓</span>
                          </div>
                          <span style={{ fontSize:12.5, color:'#4b5563', lineHeight:1.55 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:16, marginTop:8 }}>What OwnPrep Includes</div>
              <div className="ue-feat-grid">
                {FEATURES.map(f => (
                  <div key={f.title} className="ue-feat-card">
                    <div style={{ width:48, height:48, borderRadius:13, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>{f.icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:7 }}>{f.title}</div>
                    <div style={{ fontSize:13, color:'#64748b', lineHeight:1.7 }}>{f.desc}</div>
                    {f.title === 'Score Prediction' && (
                      <button onClick={() => onNav('us-score-prediction')} style={{ marginTop:12, background:'none', border:'1px solid #2563eb', color:'#2563eb', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        See Sample Report →
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="ue-cta">
                <div style={{ marginBottom:14, display:'flex', justifyContent:'center' }}><UIcCons s={36} c='rgba(255,255,255,.8)'/></div>
                <h3 style={{ fontSize:22, fontWeight:900, color:'#fff', marginBottom:10 }}>SAT Practice Tests Are Live</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.55)', lineHeight:1.7, maxWidth:440, margin:'0 auto 28px' }}>
                  Digital SAT adaptive tests are ready. Take a full test, Math-only, or Reading & Writing — all free.
                </p>
                <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                  <button onClick={() => onNav('mocktest','sat_full')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'13px 32px', borderRadius:11, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(255,101,63,.4)' }}>Start Full SAT Test →</button>
                  <button onClick={() => onNav('mocktest','sat_math')} style={{ background:'rgba(255,255,255,.09)', color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.18)', padding:'13px 24px', borderRadius:11, fontSize:13, fontWeight:600, cursor:'pointer' }}>Math Only (44 Qs)</button>
                  <button onClick={() => onNav('exams')} style={{ background:'rgba(255,255,255,.05)', color:'rgba(255,255,255,.6)', border:'1px solid rgba(255,255,255,.1)', padding:'13px 20px', borderRadius:11, fontSize:13, fontWeight:600, cursor:'pointer' }}>Browse India Exams →</button>
                </div>
              </div>
            </div>

            <div>
              <div className="ue-side-card">
                <div className="ue-side-label">What You Get Free</div>
                {['Full-length Digital SAT mock','ACT section-wise drills','Score prediction report','Topic-wise weak area analysis','12-week study calendar','Daily practice reminders'].map((f,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ width:18, height:18, borderRadius:5, background:'#ecfdf5', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <span style={{ color:'#059669', fontSize:9, fontWeight:900 }}>✓</span>
                    </div>
                    <span style={{ fontSize:12.5, color:'#374151', lineHeight:1.55 }}>{f}</span>
                  </div>
                ))}
              </div>
              <div className="ue-side-card" style={{ textAlign:'center' }}>
                <div className="ue-side-label" style={{ textAlign:'left' }}>Average Score Gain</div>
                <div style={{ fontSize:40, fontWeight:900, color:'#FF653F', lineHeight:1 }}>+180</div>
                <div style={{ fontSize:12, color:'#94a3b8', marginBottom:20, marginTop:4 }}>SAT points (12 weeks)</div>
                <div style={{ fontSize:36, fontWeight:900, color:'#2563eb', lineHeight:1 }}>+4.2</div>
                <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>ACT composite (12 weeks)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ TAB: PAPERS ════════════════ */}
      {tab === 'papers' && (
        <div className="ue-page" style={{ paddingTop:16 }}>
          <div className="ue-layout">
            <div>
              <StatBanner items={[[<UIcDoc s={16} c='#2563eb'/>,'10+','Papers','#2563eb'],[<UIcGrad s={16} c='#7c3aed'/>,'SAT+ACT','Exams','#7c3aed'],[<UIcCal s={16} c='#FF653F'/>,'2022–2024','Years','#FF653F'],[<UIcStar s={16} c='#059669'/>,'With','Answers','#059669'],[<UIcFree s={16} c='#f59e0b'/>,'Free','Access','#f59e0b']]}/>

              <div className="ue-why-grid">
                {[[<UIcTarget s={26} c='#2563eb'/>, 'Most accurate prep','Official papers mirror the exact difficulty and format of the real test — no third-party approximations.'],
                  [<UIcTimer s={26} c='#7c3aed'/>,'Builds time sense','Doing a full paper under real timed conditions is the #1 way to eliminate time panic on exam day.'],
                  [<UIcChart s={26} c='#FF653F'/>,'Reveals patterns','SAT/ACT questions follow predictable templates. Past papers train you to recognise them instantly.'],
                  [<UIcRepeat s={26} c='#059669'/>,'Tracks progress','Retake an earlier paper after 4 weeks of prep and measure your real score growth numerically.'],
                ].map(([icon,title,desc]) => (
                  <div key={title} className="ue-why-card">
                    <div style={{ marginBottom:12 }}>{icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:7 }}>{title}</div>
                    <div style={{ fontSize:12.5, color:'#64748b', lineHeight:1.65 }}>{desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'22px 24px', marginBottom:20, boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:16 }}>How to Use Past Papers Effectively</div>
                {[['1','Take it fully timed','Simulate test day exactly — no breaks, no pauses, strict time per section.','#FF653F'],
                  ['2','Score it immediately','Use the official answer key. Write down your raw score per section.','#2563eb'],
                  ['3','Review every wrong answer',"Don't just note what is wrong — write WHY you chose the wrong answer.",'#7c3aed'],
                  ['4','Categorise errors','Tag each error: careless mistake / concept gap / time pressure.','#059669'],
                  ['5','Drill the concept','For concept gaps, go back to content review before the next mock.','#f59e0b'],
                ].map(([n,title,desc,c]) => (
                  <div key={n} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:`${c}15`, border:`1.5px solid ${c}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:c, flexShrink:0 }}>{n}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:3 }}>{title}</div>
                      <div style={{ fontSize:13, color:'#64748b', lineHeight:1.55 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ overflowX:'auto', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
                <table className="ue-table" style={{ minWidth:500 }}>
                  <thead><tr><th>Year</th><th>Exam</th><th>Session</th><th>Questions</th><th>Status</th></tr></thead>
                  <tbody>
                    {PAPERS.map((p,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:700, color:'#0f172a' }}>{p.year}</td>
                        <td style={{ fontWeight:500 }}>{p.exam}</td>
                        <td style={{ color:'#64748b' }}>{p.session}</td>
                        <td style={{ fontWeight:600 }}>{p.qs}</td>
                        <td><span style={{ background:'#fef9c3', color:'#854d0e', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, border:'1px solid #fde68a' }}>Coming Soon</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop:20, background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'24px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:4 }}>Get notified when papers go live</div>
                  <div style={{ fontSize:13, color:'#64748b' }}>We'll email you the moment each paper + full solutions are uploaded.</div>
                </div>
                <button onClick={() => onNav('auth')} style={{ background:'#FF653F', color:'#fff', border:'none', padding:'11px 26px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', boxShadow:'0 3px 10px rgba(255,101,63,.35)' }}>
                  Notify Me →
                </button>
              </div>
            </div>

            <div>
              <div className="ue-side-card">
                <div className="ue-side-label">Where to Find Free Papers</div>
                {[['College Board','Official SAT Practice Tests (8 free)'],['ACT.org','Free ACT Practice Test'],['Khan Academy','SAT prep + full tests'],['PrepScholar Blog','PDFs with answer keys']].map(([src,desc]) => (
                  <div key={src} style={{ marginBottom:13, paddingBottom:13, borderBottom:'1px solid #f1f5f9' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{src}</div>
                    <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Paper Strategy Tips</div>
                {['Do full papers, not just sections','Time each section strictly','Never look up answers mid-test','Review same day while memory is fresh','Redo papers after 4 weeks to measure growth'].map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                    <span style={{ color:'#FF653F', fontWeight:900, fontSize:13, flexShrink:0, marginTop:1 }}>→</span>
                    <span style={{ fontSize:12.5, color:'#4b5563', lineHeight:1.55 }}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="ue-side-card">
                <div className="ue-side-label">Recommended Order</div>
                {[['First','Take Diagnostic Test'],['Month 1','Practice Test 1'],['Month 2','Practice Test 2–3'],['Month 3','Practice Test 4–5'],['Week Before','Practice Test 6']].map(([when,what],i) => (
                  <div key={i} className="ue-side-row">
                    <span style={{ fontSize:11, color:'#94a3b8', fontWeight:500 }}>{when}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#374151', textAlign:'right', maxWidth:130 }}>{what}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING CTA (logged in, after scroll) ── */}
      {user && showFloat && (
        <div className="ue-float">
          <button onClick={() => onNav('mocktest','sat_full')}
            style={{ display:'flex', alignItems:'center', gap:10, background:'linear-gradient(135deg,#FF653F,#e5512f)', color:'#fff', border:'none', padding:'13px 22px', borderRadius:50, fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 24px rgba(255,101,63,.5)', whiteSpace:'nowrap' }}>
            <UIcPlay s={14} c='#fff'/>
            Take a Test
          </button>
        </div>
      )}
    </div>
  )
}
