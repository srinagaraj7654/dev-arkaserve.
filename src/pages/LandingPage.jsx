import { useState, memo, useRef, useEffect } from 'react'
import api from '../api'

/* ─── SVG icon library ─── */
const _sv = (c,w) => ({fill:'none',stroke:c||'currentColor',strokeWidth:w||'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const IcInfinity  = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/></svg>
const IcBrain     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9 2C6.5 2 4 4 4 7c-1.7.5-3 2-3 3.5 0 1.5.8 2.8 2 3.5C2.5 15 2.5 17 3.5 18.5S6 21 8 21h8c2 0 3.5-1 4.5-2.5s1-3.5.5-4.5c1.2-.7 2-2 2-3.5 0-1.5-1.3-3-3-3.5C20 4 17.5 2 15 2"/><line x1="12" y1="5" x2="12" y2="14"/><line x1="9" y1="9" x2="15" y2="9"/></svg>
const IcTimer     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 2h5M12 2v3"/></svg>
const IcDocument  = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
const IcGrad      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const IcClipboard = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const IcCalendar  = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcBarChart  = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>
const IcTrophy    = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H3V4h3M18 9h3V4h-3"/><path d="M6 4h12v8a6 6 0 0 1-12 0V4z"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
const IcCompass   = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const IcHash      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
const IcPuzzle    = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
const IcEdit      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcClock     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcBank      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 21h18M3 10h18M3 10l9-7 9 7"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></svg>
const IcTarget    = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IcUser      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcGear      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IcCheck     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const IcTrain     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M4 16l-2 4h20l-2-4"/><line x1="12" y1="3" x2="12" y2="16"/><line x1="4" y1="9" x2="20" y2="9"/><circle cx="8" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="13" r="1" fill="currentColor" stroke="none"/></svg>
const IcMedical   = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
const IcBell      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IcChat      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IcTrendUp   = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IcBook      = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IcFlask     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9 3h6M9 3v7l-5 11h16L15 10V3"/><line x1="6" y1="16" x2="18" y2="16"/></svg>
const IcRepeat    = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
const IcMedal     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="15" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><polyline points="7 3 12 7 17 3"/></svg>
const IcParty     = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M15 22l5-10 5 10M15 22H8"/><path d="M2 8l8 8"/><path d="M2 2l8 8"/></svg>

/* ─── DATA — outside component, created once ─── */
const ALL_EXAMS = [
  { id:'banking',     org:<IcBank s={22}/>,     name:'Banking',    sub:'IBPS, SBI, RRB',      status:'live',  tag:'Live Now'    },
  { id:'ssc',         org:<IcClipboard s={22}/>, name:'SSC',         sub:'CGL, CHSL, MTS',      status:'live',  tag:'Live Now'    },
  { id:'railway',     org:<IcTrain s={22}/>,     name:'Railway',     sub:'NTPC, Group D, ALP',  status:'live',  tag:'Live Now'    },
  { id:'engineering', org:<IcGear s={22}/>,      name:'Engineering', sub:'JEE, GATE, BITSAT',   status:'soon',  tag:'Coming Soon' },
  { id:'medical',     org:<IcMedical s={22}/>,   name:'Medical',     sub:'NEET, AIIMS, JIPMER', status:'soon',  tag:'Coming Soon' },
]

const EXAM_GROUPS = [
  { id:'ibps', label:'IBPS', color:'#FF653F', exams:[
    { id:'bank_clerk_prelims', name:'IBPS Clerk Prelims', meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_clerk_mains',   name:'IBPS Clerk Mains',   meta:'175Q · 160 min' },
    { id:'bank_po_prelims',    name:'IBPS PO Prelims',    meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_po_mains',      name:'IBPS PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'sbi', label:'SBI', color:'#222', exams:[
    { id:'sbi_clerk_prelims', name:'SBI Clerk Prelims', meta:'100Q · 60 min'  },
    { id:'sbi_clerk_mains',   name:'SBI Clerk Mains',   meta:'170Q · 160 min' },
    { id:'sbi_po_prelims',    name:'SBI PO Prelims',    meta:'100Q · 60 min'  },
    { id:'sbi_po_mains',      name:'SBI PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'rrb', label:'RRB', color:'#059669', exams:[
    { id:'rrb_office_assistant_prelims', name:'RRB Office Assistant Prelims', meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_office_assistant_mains',   name:'RRB Office Assistant Mains',   meta:'200Q · 120 min' },
    { id:'rrb_officer_scale1_prelims',   name:'RRB Officer Scale-I Prelims',  meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_officer_scale1_mains',     name:'RRB Officer Scale-I Mains',    meta:'200Q · 120 min' },
  ]},
  { id:'psu', label:'PSU', color:'#5D4037', exams:[
    { id:'coal_india_mt', name:'Coal India MT', meta:'100Q · 120 min', tag:'New' },
  ]},
]

const AI_FEATURES = [
  { icon:<IcInfinity s={26}/>, title:'Infinite Unique Questions',   desc:'Every question is uniquely crafted — zero repetition, ever.',                         tag:'Only on MockTest', ic:'#FF653F', bg:'#FFF3EE' },
  { icon:<IcBrain s={26}/>,    title:'Adaptive Difficulty',         desc:'Tracks accuracy per topic. Starts easy, pushes to hard as you improve.',              tag:'Smart System',    ic:'#D97706', bg:'#FFFBEB' },
  { icon:<IcTimer s={26}/>,    title:'Per-Section Timers',          desc:'Each section has its own countdown. Auto-advances on expiry. Exact IBPS/SBI format.', tag:'Real Exam Feel',  ic:'#D97706', bg:'#FFFBEB' },
  { icon:<IcDocument s={26}/>, title:'PDF with Charts & Solutions', desc:'Download solutions with bar/pie charts, step-by-step working and all wrong answers.',  tag:'Post-Exam Review',ic:'#7C3AED', bg:'#F5F3FF' },
]

const PLANS = [
  { days:'10', label:'10 Days Plan', sub:'Quick revision & high-score boost',    points:['High-weightage topics only','Smart revision strategy','Mock tests & analysis','Daily targets'],          popular:false },
  { days:'20', label:'20 Days Plan', sub:'Structured tracking & full syllabus',  points:['Complete syllabus coverage','Practice + revision balance','Topic tests & mocks','Performance tracking'], popular:true  },
  { days:'30', label:'30 Days Plan', sub:'Strong foundation & top performance',  points:['In-depth topic learning','Concept clarity practice','Regular mock tests','Doubt solving & analysis'],    popular:false },
]

const HOW_IT_WORKS = [
  { n:'01', title:'Choose Your Exam',   desc:'Pick from IBPS, SBI, RRB and more.', icon:<IcGrad s={18} c='#fff'/> },
  { n:'02', title:'Select Your Plan',   desc:'Pick 10, 20 or 30 days prep plan.',  icon:<IcClipboard s={18} c='#fff'/> },
  { n:'03', title:'Follow Daily Plan',  desc:'Get your personalised schedule.',     icon:<IcCalendar s={18} c='#fff'/> },
  { n:'04', title:'Practice & Analyse', desc:'Attempt mocks, analyse & improve.',  icon:<IcBarChart s={18} c='#fff'/> },
  { n:'05', title:'Achieve Your Goal',  desc:'Succeed with confidence.',            icon:<IcTrophy s={18} c='#fff'/> },
]


const TESTIMONIALS = [
  { text:'The expert-crafted questions are genuinely at exam level. I took 12 tests and not a single question repeated. The section timers made the real exam feel familiar.', name:'Priya S.',   exam:'IBPS Clerk 2024 — Selected', init:'PS', c:'#FF653F' },
  { text:'MockTest mock tests are closest to the real exam. The adaptive difficulty kept pushing me harder each day. Cleared IBPS PO in my first attempt.',              name:'Rahul M.',   exam:'IBPS PO 2023',               init:'RM', c:'#059669' },
  { text:'I followed the 20-days plan and cleared RRB PO. I highly recommend MockTest for the DI charts — they look exactly like the real screen.',                      name:'Amit Singh', exam:'RRB PO 2023',                 init:'AS', c:'#0891B2' },
]

const CAREER_TIPS = [
  { category:'Exam Strategy',    icon:<IcCompass s={26}/>,  tips:['Attempt all easy questions first — go back to hard ones later','Never spend more than 90 seconds on a single question','80% accuracy beats 100% attempts — negative marking is real','Section cut-offs matter more than total score'] },
  { category:'Numerical Ability',icon:<IcHash s={26}/>,     tips:['Master simplification (BODMAS) — 10Q in Clerk, free marks','DI sets: read all 5 questions before you start calculating','Approximate to nearest 10 for percentage questions','Quadratic: always check both roots before comparing'] },
  { category:'Reasoning',        icon:<IcPuzzle s={26}/>,   tips:['Draw seating arrangements on paper — never in your head','Floor puzzles: make a 7-row table and fill clues one by one','Syllogism: draw Venn diagrams for each statement','Blood relations: always draw a family tree first'] },
  { category:'English Language', icon:<IcEdit s={26}/>,     tips:['Error detection: read each underlined part as a standalone sentence','Cloze test: read the full passage once before filling any blank','Para jumbles: find the opening sentence first','RC: factual questions first, inference questions last'] },
  { category:'Time Management',  icon:<IcClock s={26}/>,    tips:['Prelims split: English 12min · Quant 20min · Reasoning 18min','Practise with a timer from Day 1 — speed is a learnable skill','Take 2 full mocks per week — review wrong answers same day','Identify your safe topics (90%+ accuracy) — attempt these first'] },
  { category:'GK & Banking',     icon:<IcBank s={26}/>,     tips:['RBI policy: Repo Rate, Reverse Repo, CRR, SLR — must know','Current RBI Governor, Finance Minister, budget allocations','Key Acts: RBI Act 1934, Banking Regulation Act 1949','Last 6 months current affairs sufficient for Mains GK'] },
]

const JOURNEY_STEPS = [
  { title:'Choose Exam',        sub:'Select Your Goal',     icon:<IcTarget s={24}/>,   color:'#FF653F', bg:'#FFF3EE' },
  { title:'Tell Us About You',  sub:'Time, Date & Level',   icon:<IcUser s={24}/>,     color:'#D97706', bg:'#FFFBEB' },
  { title:'We Build Your Plan', sub:'Personalized Journey', icon:<IcGear s={24}/>,     color:'#7C3AED', bg:'#F5F3FF' },
  { title:'Daily Mission',      sub:'Stay On Track',        icon:<IcCalendar s={24}/>, color:'#0891B2', bg:'#ECFEFF' },
  { title:'Exam Ready',         sub:'Goal Achieved',        icon:<IcCheck s={24}/>,    color:'#059669', bg:'#ECFDF5', done:true },
]

const NAV_TABS = [
  ['about','About Us'],['home','Home'],['mock','Mock Tests'],
  ['success','Success Stories'],['career','Career'],['blog','Blog'],
]
// Items that navigate to dedicated public pages (not internal landing tabs)
const NAV_LINKS = [
  ['exams','Exams'],['cutoffs','Cut-offs'],['papers','Previous Papers'],
]

/* ─── Mega-menu overlay (Browse Exams) ────────────────────────── */
const MEGA_CATS = [
  {
    cat: 'BANKING', color: '#FF653F',
    items: [
      { label: 'IBPS Clerk',       dest: 'mocktest' },
      { label: 'IBPS PO',          dest: 'mocktest' },
      { label: 'IBPS RRB Asst.',   dest: 'mocktest' },
      { label: 'IBPS RRB Officer', dest: 'mocktest' },
      { label: 'SBI Clerk',        dest: 'mocktest' },
      { label: 'SBI PO',           dest: 'mocktest' },
      { label: 'RBI Grade B',      dest: 'mocktest' },
      { label: 'LIC AAO',          dest: 'mocktest' },
      { label: 'NABARD Grade A',   dest: 'mocktest' },
    ],
  },
  {
    cat: 'SSC', color: '#38bdf8',
    items: [
      { label: 'SSC CGL',  dest: 'exams-ssc' },
      { label: 'SSC CHSL', dest: 'exams-ssc' },
      { label: 'SSC MTS',  dest: 'exams-ssc' },
      { label: 'SSC CPO',  dest: 'exams-ssc' },
    ],
  },
  {
    cat: 'RAILWAY', color: '#a78bfa',
    items: [
      { label: 'RRB NTPC',    dest: 'exams-railway' },
      { label: 'RRB Group D', dest: 'exams-railway' },
      { label: 'RRB ALP',     dest: 'exams-railway' },
    ],
  },
  {
    cat: 'US EXAMS', color: '#34d399',
    items: [
      { label: 'SAT (Digital)',         dest: 'us-exams' },
      { label: 'SAT Math',              dest: 'us-exams' },
      { label: 'SAT Reading & Writing', dest: 'us-exams' },
      { label: 'ACT',                   dest: 'us-exams' },
      { label: 'AP Exams',              soon: true },
    ],
  },
  {
    cat: 'ENGINEERING', color: '#fbbf24',
    items: [
      { label: 'JEE Main',     soon: true },
      { label: 'JEE Advanced', soon: true },
      { label: 'GATE',         soon: true },
      { label: 'BITSAT',       soon: true },
    ],
  },
  {
    cat: 'MEDICAL', color: '#f472b6',
    items: [
      { label: 'NEET UG', soon: true },
      { label: 'AIIMS',   soon: true },
      { label: 'JIPMER',  soon: true },
    ],
  },
]

function ExamsMegaMenu({ onClose, onNav }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Invisible backdrop to catch outside clicks — sits between navbar and panel */}
      <div style={{ position:'fixed', inset:0, zIndex:298 }} onClick={onClose} />

      {/* Solid panel — compact dropdown below the navbar (58px) */}
      <div style={{
        position:'fixed', top:58, left:0, right:0,
        background:'#0f172a', zIndex:299,
        borderTop:'1px solid rgba(255,255,255,.08)',
        borderBottom:'1px solid rgba(255,255,255,.08)',
        boxShadow:'0 16px 48px rgba(0,0,0,.6)',
      }}>
        {/* Content wrapper */}
        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', padding:'36px 48px 40px', position:'relative' }}>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position:'absolute', top:20, right:48,
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
              color:'rgba(255,255,255,.6)', width:34, height:34, borderRadius:8,
              fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              lineHeight:1, transition:'all .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,.12)'; e.currentTarget.style.color='#fff' }}
            onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='rgba(255,255,255,.6)' }}
          >×</button>

          {/* Header */}
          <div style={{ marginBottom:40 }}>
            <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, letterSpacing:'-0.3px', margin:0 }}>
              Explore All Mock Tests
            </h2>
          </div>

          {/* Category grid — 6 equal columns, always one row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'0 32px' }}>
            {MEGA_CATS.map(cat => (
              <div key={cat.cat}>
                <div style={{ fontSize:11, fontWeight:800, color:cat.color, letterSpacing:'.12em', marginBottom:16, textTransform:'uppercase' }}>
                  {cat.cat}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {cat.items.map(item => (
                    <button
                      key={item.label}
                      onClick={() => { if (!item.soon && item.dest) { onNav(item.dest); onClose() } }}
                      style={{
                        background:'none', border:'none', padding:0, textAlign:'left',
                        cursor: item.soon ? 'default' : 'pointer',
                        color: item.soon ? 'rgba(255,255,255,.28)' : '#fff',
                        fontSize:14, fontWeight: item.soon ? 400 : 500,
                        display:'flex', alignItems:'center', gap:7, transition:'color .12s',
                      }}
                      onMouseOver={e => { if (!item.soon) e.currentTarget.style.color = '#FF653F' }}
                      onMouseOut={e => { if (!item.soon) e.currentTarget.style.color = '#fff' }}
                    >
                      <span>{item.label}</span>
                      {item.soon && (
                        <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.35)', background:'rgba(255,255,255,.06)', borderRadius:99, padding:'2px 6px', flexShrink:0, letterSpacing:'.04em' }}>
                          SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

/* ─── COMPONENT ─── */
function LandingPage({ onNav, initialTab='home' }) {
  const [tab,          setTab]         = useState(initialTab)
  const [openTip,      setOpenTip]     = useState(null)
  const [examTab,      setExamTab]     = useState(0)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const pageRef = useRef(null)
  const go = (examId) => examId ? onNav('mocktest', examId) : onNav('auth')

  useEffect(() => {
    // Ping visitor count on first session visit
    let sid = sessionStorage.getItem('_vsid')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('_vsid', sid)
      api.post('/visitor/ping', {}, { headers: { 'x-session-id': sid } }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (pageRef.current) pageRef.current.scrollTop = 0
  }, [tab])

  return (
    <div ref={pageRef} style={{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#111',minHeight:'100vh',color:'#1a1a1a',overflowY:'auto'}}>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
        /* NAV */
        .nav-link{font-size:14px;font-weight:500;color:#ffffff;background:transparent;border:none;padding:8px 14px;cursor:pointer;border-radius:6px;transition:color .12s,background .12s;white-space:nowrap}
        .nav-link:hover,.nav-link.active{color:#fff;background:rgba(255,255,255,.12)}
        /* BUTTONS */
        .btn-orange{display:inline-flex;align-items:center;gap:8px;background:#FF653F;color:#fff;border:none;border-radius:8px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:background .15s,transform .15s,box-shadow .15s;box-shadow:0 4px 16px rgba(255,107,53,.35)}
        .btn-orange:hover{background:#e5512f;transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,107,53,.45)}
        .btn-dark{display:inline-flex;align-items:center;gap:8px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:background .15s,transform .15s}
        .btn-dark:hover{background:#333;transform:translateY(-2px)}
        .btn-outline-dark{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1a1a1a;border:2px solid #1a1a1a;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
        .btn-outline-dark:hover{background:#1a1a1a;color:#fff}
        /* CARDS */
        .feat-card{background:#fff;border:1.5px solid #f0f0f0;border-radius:16px;padding:28px;transition:transform .15s,box-shadow .15s,border-color .15s}
        .feat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.08);border-color:#FF653F}
        /* MISC */
        .tip-acc{border:1.5px solid #f0f0f0;border-radius:12px;overflow:hidden;transition:border-color .12s}
        .tip-acc:hover{border-color:#FF653F}
        button:active{transform:translateY(0)!important;opacity:.9}
        section{contain:layout style}
        @media(max-width:900px){
          .hero-section{margin:0 12px!important;border-radius:16px!important}
          .hero-content{padding:100px 28px 64px 32px!important}
          .hero-content h1{font-size:clamp(30px,7vw,46px)!important}
          .hero-content p.hero-desc{font-size:16px!important}
        }
        .hero-overlay-mobile{display:none}
        @media(max-width:600px){
          .hero-overlay-desktop{display:none!important}
          .hero-overlay-mobile{display:block!important}
          .hero-section{margin:0 8px!important;border-radius:12px!important;min-height:88vh!important}
          .hero-content{padding:72px 20px 52px 20px!important}
          .hero-content h1{white-space:normal!important;font-size:clamp(26px,8vw,38px)!important;letter-spacing:-.5px!important}
          .hero-content p.hero-desc{font-size:15px!important;margin-bottom:28px!important}
          .hero-ctas{flex-direction:column!important;gap:10px!important}
          .hero-ctas button{width:100%!important;justify-content:center!important;padding:14px 24px!important;font-size:15px!important}
        }
        @media(max-width:390px){
          .hero-content{padding:64px 16px 44px 16px!important}
          .hero-content h1{font-size:clamp(22px,7vw,30px)!important}
        }
        @media(max-width:600px){
          section{padding-left:16px!important;padding-right:16px!important}
          .feat-card{padding:20px!important}
          .feat-grid-4{grid-template-columns:repeat(2,1fr)!important}
          .fu{animation-duration:.2s!important;animation-delay:0s!important}
        }
        @media(prefers-reduced-motion:reduce){.fu{animation:none!important;opacity:1!important}}
      `}</style>

      {/* NAV is now the shared <Navbar/> rendered by App.jsx (consistent across all pages) */}

      {/* ══ HOME ══ */}
      {tab==='home' && <>

        {/* HERO — Full-bleed photo background with text overlay */}
        <section className="hero-section" style={{position:'relative',overflow:'hidden',minHeight:'92vh',display:'flex',alignItems:'center',borderRadius:20,margin:'0 24px',background:'#050d1a'}}>

          {/* Background video — full bleed, student studying */}
          <video
            autoPlay muted loop playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            aria-hidden="true"
            ref={el => { if (el) el.playbackRate = 0.55 }}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'38% center',zIndex:0,transform:'scaleX(-1)'}}
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4"/>
          </video>

          {/* Gradient overlay — dark left+bottom on desktop, near-full on mobile */}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to right, rgba(5,13,26,.95) 0%, rgba(5,13,26,.8) 28%, rgba(5,13,26,.35) 60%, rgba(5,13,26,.05) 100%)',zIndex:1,pointerEvents:'none'}} className="hero-overlay-desktop"/>
          <div style={{position:'absolute',inset:0,background:'rgba(5,13,26,.72)',zIndex:1,pointerEvents:'none'}} className="hero-overlay-mobile"/>

          {/* Bottom fade for smooth section transition */}
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:140,background:'linear-gradient(to top, #050d1a 0%, transparent 100%)',zIndex:1,pointerEvents:'none'}}/>

          {/* Content — left-aligned, no centering */}
          <div className="hero-content" style={{position:'relative',zIndex:2,width:'100%',padding:'120px 56px 80px max(56px,6vw)'}}>
            <div style={{maxWidth:580}}>

              {/* Eyebrow */}
              <p style={{color:'#38bdf8',fontSize:13,fontWeight:800,marginBottom:16,letterSpacing:'.05em',textTransform:'uppercase'}}>
                Ace every competitive exam — IBPS, SSC, Railway &amp; more
              </p>

              {/* Headline */}
              <h1 style={{fontSize:'clamp(32px,3.8vw,56px)',fontWeight:900,color:'#fff',lineHeight:1.15,marginBottom:20,letterSpacing:'-1.5px'}}>
                Your Study Coach for
                <br/>
                <span style={{color:'#FF653F',fontSize:'clamp(22px,2.6vw,38px)',letterSpacing:'-1px'}}>Every Competitive Exam Goal</span>
              </h1>

              {/* Description */}
              <p className="hero-desc" style={{fontSize:18,color:'rgba(255,255,255,.7)',lineHeight:1.75,marginBottom:40,maxWidth:460}}>
                Personalised study plans, mock tests and performance insights.
              </p>

              {/* CTAs */}
              <div className="hero-ctas" style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'16px 36px',fontSize:16}}>
                  Start 7-Day Free Trial →
                </button>
                <button onClick={()=>setMegaMenuOpen(true)}
                  style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.88)',border:'1.5px solid rgba(255,255,255,.28)',borderRadius:8,padding:'15px 26px',fontSize:15,fontWeight:600,cursor:'pointer',transition:'background .12s'}}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.18)'}
                  onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}>
                  Browse Exams →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SMART FEATURES — clean white */}
        <section style={{padding:'80px 48px',background:'#fafafa'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>What Makes Us Different</div>
              <h2 style={{fontSize:38,fontWeight:800,color:'#111',marginBottom:12,letterSpacing:'-0.5px'}}>Study Smart with <span style={{color:'#FF653F'}}>Expert-Crafted</span> Features</h2>
              <p style={{fontSize:16,color:'#666',maxWidth:520,margin:'0 auto'}}>Not a question bank. Every question is uniquely crafted — fresh, exam-accurate, zero repetition.</p>
            </div>
            <div className="feat-grid-4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
              {AI_FEATURES.map((f,i)=>(
                <div key={i} className="feat-card">
                  <div style={{width:52,height:52,borderRadius:14,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',color:f.ic,marginBottom:18}}>{f.icon}</div>
                  <div style={{fontSize:17,fontWeight:700,color:'#111',marginBottom:8}}>{f.title}</div>
                  <div style={{fontSize:14,color:'#666',lineHeight:1.7,marginBottom:14}}>{f.desc}</div>
                  <span style={{fontSize:11,fontWeight:700,color:f.ic,background:f.bg,padding:'4px 10px',borderRadius:20}}>{f.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STUDY PLANS */}
        <section style={{padding:'80px 48px',background:'#fff'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>Study Plans</div>
              <h2 style={{fontSize:38,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Whether you have <span style={{color:'#FF653F'}}>10, 20 or 30 days</span>,<br/>we can create the perfect plan</h2>
              <p style={{fontSize:16,color:'#666'}}>Based on your target exam and available time</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {PLANS.map((p,i)=>(
                <div key={p.days} style={{border:'2px solid',borderColor:p.popular?'#FF653F':'#e5e5e5',borderRadius:18,overflow:'hidden',background:'#fff',boxShadow:p.popular?'0 12px 40px rgba(255,107,53,.15)':'none',position:'relative',transition:'transform .15s,box-shadow .15s'}}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=p.popular?'0 20px 48px rgba(255,107,53,.22)':'0 8px 28px rgba(0,0,0,.07)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=p.popular?'0 12px 40px rgba(255,107,53,.15)':'none'}}>
                  {p.popular && <div style={{position:'absolute',top:14,right:14,background:'#FF653F',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:12}}>Most Popular</div>}
                  <div style={{padding:'24px 24px 20px',background:p.popular?'#FF653F':'#fafafa',borderBottom:'1px solid',borderBottomColor:p.popular?'rgba(255,255,255,.15)':'#e5e5e5'}}>
                    <div style={{fontSize:32,fontWeight:900,color:p.popular?'#fff':'#FF653F',lineHeight:1}}>{p.days} Days</div>
                    <div style={{fontSize:15,fontWeight:700,color:p.popular?'rgba(255,255,255,.9)':'#111',marginTop:3}}>{p.label}</div>
                    <div style={{fontSize:13,color:p.popular?'rgba(255,255,255,.7)':'#888',marginTop:5,lineHeight:1.5}}>{p.sub}</div>
                  </div>
                  <div style={{padding:'20px 24px 24px'}}>
                    {p.points.map((pt,j)=>(
                      <div key={j} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                        <span style={{width:18,height:18,borderRadius:'50%',background:p.popular?'#FFF3EE':'#FFF3EE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{color:'#FF653F',fontSize:9,fontWeight:800}}>✓</span>
                        </span>
                        <span style={{fontSize:14,color:'#374151'}}>{pt}</span>
                      </div>
                    ))}
                    <button onClick={()=>onNav('auth')} style={{width:'100%',marginTop:12,padding:'12px 0',background:p.popular?'#111':'transparent',color:p.popular?'#fff':'#FF653F',border:p.popular?'none':'2px solid #FF653F',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',transition:'background .12s,color .12s'}}
                      onMouseOver={e=>{if(!p.popular){e.currentTarget.style.background='#FF653F';e.currentTarget.style.color='#fff'}}}
                      onMouseOut={e=>{if(!p.popular){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#FF653F'}}}>
                      {p.popular?'Get Started →':'Choose Plan →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{padding:'80px 48px',background:'#fafafa'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>How It Works</div>
              <h2 style={{fontSize:38,fontWeight:800,color:'#111',letterSpacing:'-0.5px'}}>5 Steps to Your Success</h2>
            </div>
            <div style={{display:'flex',position:'relative'}}>
              {HOW_IT_WORKS.map((s,i)=>(
                <div key={s.n} style={{flex:1,textAlign:'center',padding:'0 4px',position:'relative',minWidth:0}}>
                  {i < HOW_IT_WORKS.length-1 && (
                    <div style={{position:'absolute',top:20,left:'60%',width:'80%',height:2,background:'linear-gradient(90deg,#FF653F,#fec9b0)',zIndex:0}}/>
                  )}
                  <div style={{width:40,height:40,background:'#FF653F',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',position:'relative',zIndex:1,boxShadow:'0 4px 12px rgba(255,107,53,.3)'}}>
                    <span style={{display:'inline-flex'}}>{s.icon}</span>
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:'#FF653F',marginBottom:3}}>{s.n}</div>
                  <div style={{fontSize:11,fontWeight:700,color:'#111',marginBottom:3,lineHeight:1.3}}>{s.title}</div>
                  <div style={{fontSize:10,color:'#666',lineHeight:1.4,display:'none'}} className="sm-show">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{padding:'80px 48px',background:'#fff'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:36}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Success Stories</div>
                <h2 style={{fontSize:32,fontWeight:800,color:'#111',letterSpacing:'-0.4px'}}>What Aspirants Say</h2>
              </div>
              <button onClick={()=>setTab('success')} className="btn-outline-dark">View All Stories →</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {TESTIMONIALS.map((t,i)=>(
                <div key={i} className="feat-card">
                  <div style={{color:'#FF653F',fontSize:16,letterSpacing:3,marginBottom:14}}>★★★★★</div>
                  <p style={{fontSize:14,color:'#444',lineHeight:1.75,marginBottom:20}}>{t.text}</p>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:t.c,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0}}>{t.init}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{t.name}</div>
                      <div style={{fontSize:12,color:'#888'}}>{t.exam}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </>}

      {/* ══ EXAMS TAB ══ */}
      {tab==='exams' && (
        <section style={{padding:'56px 48px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <h2 style={{fontSize:32,fontWeight:800,color:'#111',marginBottom:6,letterSpacing:'-0.4px'}}>All Available Exams</h2>
            <p style={{fontSize:15,color:'#666',marginBottom:28}}>IBPS, SBI and Regional Rural Banks — Prelims and Mains</p>
            <div style={{display:'flex',gap:10,marginBottom:28,flexWrap:'wrap'}}>
              {EXAM_GROUPS.map((g,i)=>(
                <button key={g.id} onClick={()=>setExamTab(i)}
                  style={{
                    fontSize:13,fontWeight:700,padding:'9px 22px',borderRadius:22,border:'1.5px solid',
                    borderColor:examTab===i?g.color:'#e5e5e5',
                    background:examTab===i?g.color:'#fff',
                    color:examTab===i?'#fff':'#555',
                    cursor:'pointer',transition:'all .15s',
                    boxShadow:examTab===i?`0 4px 16px ${g.color}40`:'none',
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))',gap:14}}>
              {EXAM_GROUPS[examTab]?.exams.map(e=>(
                <div key={e.id} style={{border:'1.5px solid #e8e8e8',borderRadius:16,padding:'16px',background:'#fff',display:'flex',alignItems:'center',gap:14,transition:'all .15s',position:'relative'}}
                  onMouseOver={e2=>{e2.currentTarget.style.borderColor=EXAM_GROUPS[examTab].color;e2.currentTarget.style.boxShadow=`0 6px 22px ${EXAM_GROUPS[examTab].color}18`;e2.currentTarget.style.transform='translateY(-1px)'}}
                  onMouseOut={e2=>{e2.currentTarget.style.borderColor='#e8e8e8';e2.currentTarget.style.boxShadow='none';e2.currentTarget.style.transform='translateY(0)'}}>
                  <div style={{width:48,height:48,borderRadius:13,background:`${EXAM_GROUPS[examTab].color}12`,border:`1.5px solid ${EXAM_GROUPS[examTab].color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,flexShrink:0,color:EXAM_GROUPS[examTab].color,letterSpacing:'-.5px'}}>
                    {EXAM_GROUPS[examTab].id.toUpperCase().slice(0,3)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.3}}>{e.name}</span>
                      {e.tag && <span style={{fontSize:10,fontWeight:700,background:'#FFF3EE',color:'#FF653F',padding:'2px 9px',borderRadius:20,flexShrink:0,whiteSpace:'nowrap'}}>{e.tag}</span>}
                    </div>
                    <div style={{fontSize:12,color:'#999'}}>{e.meta} · −0.25 negative marking</div>
                  </div>
                  <button onClick={()=>go(e.id)}
                    style={{flexShrink:0,padding:'9px 18px',fontSize:13,fontWeight:700,background:EXAM_GROUPS[examTab].color,color:'#fff',border:'none',borderRadius:10,cursor:'pointer',whiteSpace:'nowrap',transition:'opacity .12s,transform .12s'}}
                    onMouseOver={e2=>{e2.currentTarget.style.opacity='.85';e2.currentTarget.style.transform='scale(1.03)'}}
                    onMouseOut={e2=>{e2.currentTarget.style.opacity='1';e2.currentTarget.style.transform='scale(1)'}}>
                    Start →
                  </button>
                </div>
              ))}
            </div>
            <div style={{marginTop:32,textAlign:'center'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'14px 32px',fontSize:15}}>Log in to start any exam →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ CAREER TAB ══ */}
      {tab==='career' && (
        <section style={{padding:'56px 48px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>

            {/* Hero */}
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#FFF3EE',color:'#FF653F',border:'1px solid #fec9b0',borderRadius:22,padding:'6px 16px',fontSize:13,fontWeight:700,marginBottom:14}}>Careers at MockTest</div>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Build the future of <span style={{color:'#FF653F'}}>exam prep</span> with us</h2>
              <p style={{fontSize:16,color:'#666',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>We're a small, fast-moving team working to make quality exam preparation free for every aspirant in India. Come help us scale it to millions.</p>
            </div>

            {/* What We Do */}
            <div style={{marginBottom:36}}>
              <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14}}>What We Do</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
                {[{icon:<IcGear s={26}/>,t:'Unique Questions Every Time',d:'Every question is freshly crafted — exam-accurate with zero repetition.'},{icon:<IcBarChart s={26}/>,t:'Smart analytics',d:'Automated weakness detection and category-aware cut-off prediction.'},{icon:<IcTarget s={26}/>,t:'Personalised prep',d:'Adaptive study planners that adjust to each student in real time.'}].map((c,i)=>(
                  <div key={i} className="feat-card" style={{textAlign:'left'}}>
                    <div style={{marginBottom:10}}>{c.icon}</div>
                    <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>{c.t}</div>
                    <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>{c.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Life + Benefits */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16,marginBottom:36}}>
              <div style={{background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:16,padding:24}}>
                <h3 style={{fontSize:18,fontWeight:800,color:'#111',marginBottom:12}}>Life at MockTest</h3>
                {['Small team, big ownership — your work ships fast','Remote-friendly with flexible hours','Direct impact on lakhs of aspirants','Learn across product & ed-tech'].map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10,fontSize:14,color:'#444'}}>
                    <span style={{color:'#FF653F',fontWeight:800}}>✓</span>{t}
                  </div>
                ))}
              </div>
              <div style={{background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:16,padding:24}}>
                <h3 style={{fontSize:18,fontWeight:800,color:'#111',marginBottom:12}}>Benefits & Perks</h3>
                {['Competitive pay + ESOPs','Annual learning & upskilling budget','Health coverage','Latest hardware & tools','Generous leave policy'].map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10,fontSize:14,color:'#444'}}>
                    <span style={{color:'#FF653F',fontWeight:800}}>★</span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* Open Roles */}
            <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14}}>Open Roles</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
              {[
                {role:'Frontend Engineer (React)', loc:'Remote / Hyderabad', type:'Full-time'},
                {role:'Backend Engineer (FastAPI/Python)', loc:'Remote / Hyderabad', type:'Full-time'},
                {role:'Software Engineer', loc:'Remote', type:'Full-time'},
                {role:'Banking Subject-Matter Expert', loc:'Remote', type:'Contract'},
                {role:'Growth & Content Marketer', loc:'Remote', type:'Full-time'},
              ].map((j,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,background:'#fff',border:'1.5px solid #e5e5e5',borderRadius:14,padding:'16px 20px'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{j.role}</div>
                    <div style={{fontSize:13,color:'#888',marginTop:2,display:'flex',alignItems:'center',gap:4}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {j.loc} · {j.type}</div>
                  </div>
                  <button onClick={()=>onNav('contact')} className="btn-orange" style={{padding:'10px 22px',fontSize:14,flexShrink:0,whiteSpace:'nowrap'}}>Apply →</button>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{background:'#111',borderRadius:18,padding:32,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:8}}>Don't see your role?</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.6)',marginBottom:22}}>We're always keen to meet talented people. Write to us and tell us how you can help.</div>
              <button onClick={()=>onNav('contact')} className="btn-orange" style={{padding:'14px 32px',fontSize:15}}>Get in touch →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ ABOUT TAB (now includes Mock Tests content) ══ */}
      {tab==='about' && (
        <section style={{padding:'56px 48px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            {/* Headline — single line */}
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{width:60,height:60,background:'#FF653F',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:22,fontWeight:900,margin:'0 auto 20px'}}>MT</div>
              <h2 style={{fontSize:44,fontWeight:800,color:'#111',lineHeight:1.15,letterSpacing:'-1px'}}>
                Study Coach for <span style={{color:'#FF653F'}}>Every Competitive Exam Goal</span>
              </h2>
              <p style={{fontSize:15,color:'#888',marginTop:14}}>India's first fully expert-crafted competitive exam platform · by Arkaserve</p>
            </div>

            {/* Two columns spread to the edges */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(360px,1fr))',gap:48,alignItems:'start'}}>

              {/* LEFT — Why / About */}
              <div>
                <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14,letterSpacing:'-0.3px'}}>Why <span style={{color:'#FF653F'}}>MockTest</span></h3>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[{t:'Our Mission',d:'To make quality competitive exam preparation accessible to every student — free, with no repeated questions and expert-crafted personalisation that was previously only available in expensive coaching centres.'},{t:'How It Works',d:'Our platform crafts mathematically valid, exam-accurate questions for every session. Every test is completely new. Same student, same exam: zero repetition guaranteed.'},{t:'Exams Covered',d:'IBPS Clerk & PO (Prelims + Mains), SBI Clerk & PO (Prelims + Mains), RRB Office Assistant & Officer Scale-I, and Coal India MT. More exams being added continuously.'},{t:'What Makes Us Unique',d:'No other platform delivers freshly crafted questions for every session. Our adaptive system tracks per-topic accuracy and adjusts in real time.'}].map((it,i)=>(
                    <div key={i} style={{background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:14,padding:18}}>
                      <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>{it.t}</div>
                      <div style={{fontSize:14,color:'#555',lineHeight:1.7}}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — mock tests */}
              <div>
                <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14,letterSpacing:'-0.3px'}}>Expert-Crafted <span style={{color:'#FF653F'}}>Mock Tests</span></h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
                  {[{icon:<IcInfinity s={22}/>,t:'Zero Repetition',d:'Every question is freshly crafted — no two sessions are ever the same.'},{icon:<IcBrain s={22}/>,t:'Adaptive Difficulty',d:'Starts easy, progresses to hard as your accuracy improves.'},{icon:<IcBarChart s={22}/>,t:'Real DI Charts',d:'Interactive bar, pie, line charts in exam and PDF.'},{icon:<IcTimer s={22}/>,t:'Section Timers',d:'Per-section 20-minute countdown — exact IBPS/SBI format.'},{icon:<IcDocument s={22}/>,t:'PDF Solutions',d:'Full solution PDF with charts and step-by-step working.'},{icon:<IcTarget s={22}/>,t:'Topic Practice',d:'35 topics. Practice 5–50 questions at any difficulty.'}].map((f,i)=>(
                    <div key={i} className="feat-card" style={{textAlign:'left',padding:18}}>
                      <div style={{marginBottom:8}}>{f.icon}</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:5}}>{f.t}</div>
                      <div style={{fontSize:12.5,color:'#666',lineHeight:1.55}}>{f.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{marginTop:48,background:'#111',borderRadius:18,padding:32,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:10}}>Ready to start?</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.6)',marginBottom:24}}>Create a free account and take your first expert-crafted mock test right now.</div>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'14px 32px',fontSize:15}}>Create Free Account →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ STUDY COACH TAB ══ */}
      {tab==='ai-coach' && (
        <section style={{padding:'64px 48px',minHeight:'70vh',background:'#fafafa'}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <div style={{marginBottom:18,display:'flex',justifyContent:'center'}}><IcBrain s={44} c='#374151'/></div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:12,letterSpacing:'-0.5px'}}>Study Coach</h2>
            <p style={{fontSize:16,color:'#555',lineHeight:1.75,maxWidth:520,margin:'0 auto 36px'}}>Your personal study coach tracks your performance, identifies weak areas, and builds a customised study plan that adapts as you improve.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginBottom:36}}>
              {[{icon:<IcBarChart s={28}/>,t:'Performance Tracking',d:'Detailed accuracy reports per topic, section and difficulty level after every test.'},{icon:<IcTarget s={28}/>,t:'Weak Area Detection',d:'The system pinpoints exactly which topics need more practice and generates targeted questions.'},{icon:<IcCalendar s={28}/>,t:'Smart Study Plan',d:'10, 20 or 30-day personalised plans that adjust based on your daily performance.'}].map((f,i)=>(
                <div key={i} className="feat-card" style={{textAlign:'left'}}>
                  <div style={{marginBottom:12}}>{f.icon}</div>
                  <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>{f.t}</div>
                  <div style={{fontSize:14,color:'#666',lineHeight:1.65}}>{f.d}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'16px 36px',fontSize:16}}>Get Your Free Study Plan →</button>
          </div>
        </section>
      )}

      {/* ══ MOCK TESTS TAB ══ */}
      {tab==='mock' && (
        <section style={{padding:'64px 48px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Expert-Crafted Mock Tests</h2>
              <p style={{fontSize:16,color:'#555'}}>Every question is uniquely crafted — no repeats, adaptive difficulty, real DI charts</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginBottom:36}}>
              {[
                {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,t:'Zero Repetition',d:'Every question is freshly crafted — no two sessions are ever the same.'},
                {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.15A3 3 0 0 1 4 11.5a3 3 0 0 1 1.5-2.6 2.5 2.5 0 0 1 4-2.9z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.15A3 3 0 0 0 20 11.5a3 3 0 0 0-1.5-2.6 2.5 2.5 0 0 0-4-2.9z"/></svg>,t:'Adaptive Difficulty',d:'Starts easy, progresses to hard as your accuracy improves.'},
                {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,t:'Real DI Charts',d:'Interactive bar, pie, line charts in exam and PDF.'},
                {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14 15"/><path d="M9 2h6M12 2v3"/></svg>,t:'Section Timers',d:'Per-section 20-minute countdown — exact IBPS/SBI format.'},
                {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,t:'PDF Solutions',d:'Full solution PDF with charts and step-by-step working.'},
                {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,t:'Topic Practice',d:'35 topics. Practice 5–50 questions at any difficulty.'},
              ].map((f,i)=>(
                <div key={i} className="feat-card" style={{textAlign:'left'}}>
                  <div style={{marginBottom:12}}>{f.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:7}}>{f.t}</div>
                  <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>{f.d}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'15px 36px',fontSize:16}}>Start Free Mock Test →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ COURSES TAB ══ */}
      {tab==='courses' && (
        <section style={{padding:'64px 48px',minHeight:'70vh',background:'#fafafa'}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Courses</h2>
            <p style={{fontSize:15,color:'#555',marginBottom:36}}>Comprehensive expert-led courses for every exam category</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
              {[{icon:<IcBank s={28}/>,t:'Banking Courses',d:'IBPS, SBI, RRB — Prelims & Mains complete prep',status:'Live'},{icon:<IcClipboard s={28}/>,t:'SSC Courses',d:'CGL, CHSL, MTS — complete syllabus coverage',status:'Live'},{icon:<IcTrain s={28}/>,t:'Railway Courses',d:'NTPC, Group D, ALP — all zones covered',status:'Live'},{icon:<IcGear s={28}/>,t:'Engineering',d:'JEE Main, JEE Advanced, GATE — all streams',status:'Soon'}].map((c,i)=>(
                <div key={i} style={{border:'2px solid',borderColor:c.status==='Live'?'#FF653F':'#e5e5e5',borderRadius:16,padding:22,background:'#fff',textAlign:'left',opacity:c.status==='Soon'?0.7:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <span style={{display:'inline-flex'}}>{c.icon}</span>
                    <span style={{fontSize:11,fontWeight:700,background:c.status==='Live'?'#FFF3EE':'#f5f5f5',color:c.status==='Live'?'#FF653F':'#888',padding:'3px 10px',borderRadius:10}}>{c.status}</span>
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:7}}>{c.t}</div>
                  <div style={{fontSize:13,color:'#666',marginBottom:16}}>{c.d}</div>
                  {c.status==='Live' && <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'9px 20px',fontSize:13}}>Explore →</button>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ FEATURES TAB ══ */}
      {tab==='features' && (
        <section style={{padding:'64px 48px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Platform Features</h2>
            <p style={{fontSize:15,color:'#555',marginBottom:36}}>Everything you need for complete exam preparation</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
              {[{icon:<IcGear s={24}/>,t:'Unique Questions Every Time',d:'Expertly crafted, exam-accurate questions for every topic and session'},{icon:<IcTarget s={24}/>,t:'Adaptive Learning',d:'Per-topic difficulty tracking with real-time adjustments'},{icon:<IcBarChart s={24}/>,t:'Data Interpretation Charts',d:'Interactive bar, pie, line charts in exam and PDF'},{icon:<IcTimer s={24}/>,t:'Exam Simulation',d:'Per-section timers, question palette, mark for review'},{icon:<IcTrendUp s={24}/>,t:'Performance Analytics',d:'Section-wise, topic-wise accuracy and time analysis'},{icon:<IcDocument s={24}/>,t:'Solution PDF',d:'Download full solutions with charts and explanations'},{icon:<IcBrain s={24}/>,t:'Study Planner',d:'10/20/30 day personalised study plans'},{icon:<IcBell s={24}/>,t:'Progress Tracking',d:'Daily targets, streaks and achievement badges'},{icon:<IcChat s={24}/>,t:'Step-by-Step Solutions',d:'Every question explained with working shown'}].map((f,i)=>(
                <div key={i} className="feat-card" style={{textAlign:'left'}}>
                  <div style={{marginBottom:10}}>{f.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:5}}>{f.t}</div>
                  <div style={{fontSize:13,color:'#666',lineHeight:1.55}}>{f.d}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'15px 36px',fontSize:16}}>Try All Features Free →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ SUCCESS STORIES TAB ══ */}
      {tab==='success' && (
        <section style={{padding:'64px 48px',minHeight:'70vh',background:'#fafafa'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:8,letterSpacing:'-0.5px'}}>Success Stories</h2>
              <p style={{fontSize:15,color:'#555'}}>Students who cracked their exams with MockTest</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>
              {[{n:'Priya S.',e:'IBPS Clerk 2024',t:'12 tests, zero repeated questions. The adaptive difficulty pushed me from easy to hard. Cleared cut-off in first attempt.',i:'PS',c:'#FF653F'},{n:'Rahul M.',e:'SBI PO 2024',t:'The section timers made the real exam feel very familiar. The DI charts look exactly like the actual SBI screen. Best free platform.',i:'RM',c:'#059669'},{n:'Deepa K.',e:'IBPS PO Mains',t:'The PDF solution is brilliant — actual bar charts with step-by-step working. I could identify every mistake before the real exam.',i:'DK',c:'#0891B2'},{n:'Amit S.',e:'RRB PO 2023',t:'I tried Adda247 and Oliveboard. MockTest questions are harder and more varied. It starts free — 7-day trial with full access.',i:'AS',c:'#D97706'},{n:'Neha V.',e:'SBI Clerk 2024',t:'Career Tan tips are gold. The 60-day plan kept me on track. The adaptive mode knew exactly when to push me harder.',i:'NV',c:'#7C3AED'},{n:'Kiran P.',e:'IBPS Clerk 2024',t:'The puzzle and syllogism questions are at actual IBPS level. This platform really prepares you for the hard questions.',i:'KP',c:'#059669'}].map((t,i)=>(
                <div key={i} className="feat-card">
                  <div style={{color:'#FF653F',fontSize:15,letterSpacing:3,marginBottom:12}}>★★★★★</div>
                  <p style={{fontSize:14,color:'#444',lineHeight:1.75,marginBottom:18}}>{t.t}</p>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:t.c,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{t.i}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{t.n}</div>
                      <div style={{fontSize:12,color:'#888'}}>{t.e}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:36,textAlign:'center'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'15px 36px',fontSize:16}}>Start Your Success Story →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ BLOG TAB ══ */}
      {tab==='blog' && (
        <section style={{padding:'64px 48px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:8,letterSpacing:'-0.5px'}}>Blog & Resources</h2>
              <p style={{fontSize:15,color:'#555'}}>Study tips, exam updates and strategy guides</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>
              {[{tag:'Strategy',t:'How to clear IBPS PO cut-off in Numerical Ability',d:'Section cut-offs are tougher than the overall cut-off. A topic-wise strategy that works.',date:'May 2026',c:'#FF653F'},{tag:'Exam Tips',t:'DI Sets: How to attempt 5 questions in under 4 minutes',d:'With the right approach, DI sets are free marks. Exactly how to tackle them.',date:'Apr 2026',c:'#059669'},{tag:'Smart Features',t:'How MockTest delivers unique questions every session',d:'Behind-the-scenes look at how MockTest ensures fresh, exam-accurate questions every time.',date:'Apr 2026',c:'#0891B2'},{tag:'Reasoning',t:'Floor puzzles solved: the 7-row table method',d:'Master floor puzzles in 10 minutes using this systematic approach.',date:'Mar 2026',c:'#D97706'},{tag:'GK',t:'RBI Monetary Policy 2026 — What you need to know',d:'Repo rate, reverse repo, CRR, SLR — complete update for IBPS Mains.',date:'Mar 2026',c:'#7C3AED'},{tag:'Career Tan',t:'60-day study plan for IBPS Clerk Prelims',d:'A day-by-day schedule with recommended question counts and revision checkpoints.',date:'Feb 2026',c:'#FF653F'}].map((p,i)=>(
                <div key={i} style={{border:'1.5px solid #e5e5e5',borderRadius:14,overflow:'hidden',background:'#fff',transition:'transform .15s,box-shadow .15s'}}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.08)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none'}}>
                  <div style={{height:5,background:p.c}}/>
                  <div style={{padding:20}}>
                    <span style={{fontSize:11,fontWeight:700,background:`${p.c}18`,color:p.c,padding:'3px 10px',borderRadius:8,display:'inline-block',marginBottom:10}}>{p.tag}</span>
                    <div style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.4,marginBottom:7}}>{p.t}</div>
                    <div style={{fontSize:12,color:'#666',lineHeight:1.6,marginBottom:10}}>{p.d}</div>
                    <div style={{fontSize:12,color:'#aaa'}}>{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {megaMenuOpen && (
        <ExamsMegaMenu onClose={() => setMegaMenuOpen(false)} onNav={onNav} />
      )}
    </div>
  )
}

export default memo(LandingPage)
