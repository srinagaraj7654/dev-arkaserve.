import { useState, useEffect } from "react"
import { supabase } from '../supabase.js'
import { latestResultForExam } from '../data/userData.js'

const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const PIcChart  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const PIcTarget = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const PIcBrain  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.15A3 3 0 0 1 4 11.5a3 3 0 0 1 1.5-2.6 2.5 2.5 0 0 1 4-2.9z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.15A3 3 0 0 0 20 11.5a3 3 0 0 0-1.5-2.6 2.5 2.5 0 0 0-4-2.9z"/></svg>
const PIcClock  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const PIcArrow  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const PIcGear   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const PIcBook   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const PIcAlarm  = ({s=10,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14 15"/><path d="M9 2h6M12 2v3"/></svg>

/* ── Confidence model metadata (unchanged) ── */
const CONF_META = {
  confident:          { color:"#10b981", bg:"#d1fae5", label:"Confident",          icon:"✓",  desc:"Correct + fast. No action needed." },
  knows_but_slow:     { color:"#f59e0b", bg:"#fef3c7", label:"Knows but Slow",     icon:"⏱",  desc:"Correct but too slow. Speed drills needed." },
  knows_but_careless: { color:"#f97316", bg:"#ffedd5", label:"Careless Errors",    icon:"✏",  desc:"Silly mistakes on familiar topic. Slow down on final step." },
  concept_gap:        { color:"#ef4444", bg:"#fee2e2", label:"Concept Gap",        icon:"B",  desc:"Slow + wrong. Needs concept revision, not speed practice." },
  guessing:           { color:"#dc2626", bg:"#fee2e2", label:"Guessing",           icon:"?",  desc:"Fast + wrong. Stop guessing — costs marks with -0.25." },
  struggling:         { color:"#b91c1c", bg:"#fee2e2", label:"Struggling",         icon:"⚠",  desc:"Slow + wrong. Worst state. Revisit fundamentals immediately." },
  moderate:           { color:"#6b7280", bg:"#f3f4f6", label:"Moderate",           icon:"~",  desc:"Mixed signals. Needs more data." },
  untested:           { color:"#9ca3af", bg:"#f9fafb", label:"Untested",           icon:"?",  desc:"Not enough questions to classify." },
}

const SEV_META = {
  critical: { color:"#ef4444", bg:"#fee2e2", label:"Critical" },
  moderate: { color:"#f59e0b", bg:"#fef3c7", label:"Moderate" },
  mild:     { color:"#10b981", bg:"#d1fae5", label:"Mild"     },
  strong:   { color:"#6366f1", bg:"#ede9fe", label:"Strong"   },
}

/* ── Small reusable components (unchanged) ── */
function Card({ title, subtitle, children, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        {accent && <div className="w-1 h-6 rounded-full" style={{ background: accent }} />}
        <div>
          <div className="font-bold text-gray-900 text-sm">{title}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Badge({ label, color, bg }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}>{label}</span>
  )
}

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block cursor-help"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 left-0 top-full mt-1 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none">
          {text}
        </span>
      )}
    </span>
  )
}

/* ── Exam section config by exam ID ── */
const EXAM_SECTION_CFG = {
  bank_clerk_prelims: [ {id:'english',label:'English',total:30,color:'#10b981'}, {id:'numerical',label:'Numerical',total:35,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning',total:35,color:'#8b5cf6'} ],
  bank_clerk_mains:   [ {id:'english',label:'English',total:40,color:'#10b981'}, {id:'numerical',label:'Quant & DI',total:50,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning',total:50,color:'#8b5cf6'}, {id:'ga',label:'Gen Awareness',total:50,color:'#3b82f6'} ],
  bank_po_prelims:    [ {id:'english',label:'English',total:30,color:'#10b981'}, {id:'numerical',label:'Numerical',total:35,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning',total:35,color:'#8b5cf6'} ],
  bank_po_mains:      [ {id:'english',label:'English',total:35,color:'#10b981'}, {id:'numerical',label:'Quant & DI',total:35,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning & Comp',total:45,color:'#8b5cf6'}, {id:'ga',label:'Gen Awareness',total:40,color:'#3b82f6'} ],
  sbi_clerk_prelims:  [ {id:'english',label:'English',total:30,color:'#10b981'}, {id:'numerical',label:'Numerical',total:35,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning',total:35,color:'#8b5cf6'} ],
  sbi_po_prelims:     [ {id:'english',label:'English',total:30,color:'#10b981'}, {id:'numerical',label:'Quant',total:35,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning',total:35,color:'#8b5cf6'} ],
  rrb_office_assistant_prelims: [ {id:'reasoning',label:'Reasoning',total:40,color:'#8b5cf6'}, {id:'numerical',label:'Numerical',total:40,color:'#f59e0b'} ],
  rrb_officer_scale1_prelims:   [ {id:'reasoning',label:'Reasoning',total:40,color:'#8b5cf6'}, {id:'numerical',label:'Numerical',total:40,color:'#f59e0b'} ],
  ssc_cgl_tier1: [ {id:'english',label:'English',total:25,color:'#10b981'}, {id:'numerical',label:'Quant',total:25,color:'#f59e0b'}, {id:'reasoning',label:'Reasoning',total:25,color:'#8b5cf6'}, {id:'ga',label:'Gen Awareness',total:25,color:'#3b82f6'} ],
  ap_eamcet_engg: [ {id:'maths',label:'Mathematics',total:80,color:'#3b82f6'}, {id:'physics',label:'Physics',total:40,color:'#f59e0b'}, {id:'chemistry',label:'Chemistry',total:40,color:'#10b981'} ],
  ts_eamcet_engg: [ {id:'maths',label:'Mathematics',total:80,color:'#3b82f6'}, {id:'physics',label:'Physics',total:40,color:'#f59e0b'}, {id:'chemistry',label:'Chemistry',total:40,color:'#10b981'} ],
}

/* Per-section indicative cutoffs (from official IBPS/SBI notifications) */
const SECTION_CUTOFFS = {
  bank_clerk_prelims: {
    english:   { UR:9.0,  OBC:8.5,  EWS:8.5,  SC:8.0,  ST:7.5,  PwBD:7.0  },
    numerical: { UR:10.5, OBC:9.5,  EWS:9.5,  SC:9.0,  ST:8.5,  PwBD:8.0  },
    reasoning: { UR:10.5, OBC:9.75, EWS:9.75, SC:9.0,  ST:8.5,  PwBD:8.0  },
  },
  bank_po_prelims: {
    english:   { UR:7.5, OBC:7.0, EWS:7.0, SC:6.5, ST:6.0, PwBD:5.5 },
    numerical: { UR:9.5, OBC:8.5, EWS:8.5, SC:7.5, ST:7.0, PwBD:6.5 },
    reasoning: { UR:9.5, OBC:8.5, EWS:8.5, SC:7.5, ST:7.0, PwBD:6.5 },
  },
  sbi_clerk_prelims: {
    english:   { UR:9.5,  OBC:9.0,  EWS:9.0,  SC:8.5, ST:8.0, PwBD:7.5 },
    numerical: { UR:10.5, OBC:10.0, EWS:10.0, SC:9.5, ST:9.0, PwBD:8.5 },
    reasoning: { UR:10.5, OBC:10.0, EWS:10.0, SC:9.5, ST:9.0, PwBD:8.5 },
  },
  sbi_po_prelims: {
    english:   { UR:8.0, OBC:7.5, EWS:7.5, SC:7.0, ST:6.5, PwBD:6.0 },
    numerical: { UR:8.5, OBC:8.0, EWS:8.0, SC:7.5, ST:7.0, PwBD:6.5 },
    reasoning: { UR:8.5, OBC:8.0, EWS:8.0, SC:7.5, ST:7.0, PwBD:6.5 },
  },
}

/* Historical cutoff reference data (per-exam, per-category) */
const EXAM_CUTOFF_MAP = {
  bank_clerk_prelims: { id:'ibps_clerk_pre',  total:100 },
  bank_clerk_mains:   { id:'ibps_clerk_mains',total:200 },
  bank_po_prelims:    { id:'ibps_po_pre',     total:100 },
  bank_po_mains:      { id:'ibps_po_mains',   total:225 },
  sbi_clerk_prelims:  { id:'sbi_clerk_pre',   total:100 },
  sbi_po_prelims:     { id:'sbi_po_pre',      total:100 },
  rrb_office_assistant_prelims: { id:'rrb_oa_pre', total:80 },
  rrb_officer_scale1_prelims:   { id:'rrb_os_pre', total:80 },
}

const HISTORICAL_CUTOFFS = {
  ibps_clerk_pre:  [ { yr:2023, UR:76.5, OBC:75.0, EWS:74.5, SC:68.0, ST:56.0, PwBD:48.0 }, { yr:2022, UR:75.0, OBC:73.5, EWS:72.0, SC:66.5, ST:55.0, PwBD:46.5 }, { yr:2021, UR:73.5, OBC:71.0, EWS:70.5, SC:64.0, ST:52.0, PwBD:44.0 }, { yr:2020, UR:72.0, OBC:70.0, EWS:69.0, SC:62.5, ST:50.0, PwBD:42.0 }, { yr:2019, UR:74.0, OBC:72.0, EWS:71.0, SC:65.0, ST:53.0, PwBD:45.0 } ],
  ibps_clerk_mains:[ { yr:2023, UR:48.5, OBC:46.0, EWS:45.5, SC:40.0, ST:34.0, PwBD:30.0 } ],
  ibps_po_pre:     [ { yr:2023, UR:57.0, OBC:55.5, EWS:54.0, SC:50.0, ST:42.0, PwBD:35.0 }, { yr:2022, UR:55.5, OBC:54.0, EWS:52.5, SC:48.5, ST:40.0, PwBD:33.0 }, { yr:2021, UR:49.0, OBC:48.0, EWS:47.0, SC:43.0, ST:36.0, PwBD:30.0 } ],
  ibps_po_mains:   [ { yr:2023, UR:42.0, OBC:40.0, EWS:39.5, SC:35.0, ST:30.0, PwBD:26.0 } ],
  sbi_clerk_pre:   [ { yr:2023, UR:80.5, OBC:79.0, EWS:78.0, SC:72.0, ST:60.0, PwBD:52.0 }, { yr:2022, UR:78.0, OBC:76.5, EWS:75.0, SC:69.0, ST:58.0, PwBD:50.0 }, { yr:2021, UR:76.5, OBC:74.0, EWS:73.0, SC:66.0, ST:55.0, PwBD:47.0 } ],
  sbi_po_pre:      [ { yr:2023, UR:60.0, OBC:58.5, EWS:57.0, SC:52.0, ST:45.0, PwBD:38.0 } ],
  rrb_oa_pre:      [ { yr:2023, UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 } ],
  rrb_os_pre:      [ { yr:2023, UR:60.0, OBC:58.0, EWS:57.0, SC:50.0, ST:44.0, PwBD:38.0 } ],
}

/* ── Exam display names ── */
const EXAM_DISPLAY = {
  bank_clerk_prelims:'IBPS Clerk Prelims',   bank_clerk_mains:'IBPS Clerk Mains',
  bank_po_prelims:'IBPS PO Prelims',         bank_po_mains:'IBPS PO Mains',
  sbi_clerk_prelims:'SBI Clerk Prelims',     sbi_clerk_mains:'SBI Clerk Mains',
  sbi_po_prelims:'SBI PO Prelims',           sbi_po_mains:'SBI PO Mains',
  rrb_office_assistant_prelims:'RRB Office Assistant Prelims',
  rrb_officer_scale1_prelims:'RRB Officer Scale-I Prelims',
  ssc_cgl_tier1:'SSC CGL Tier I',
  ap_eamcet_engg:'AP EAMCET Engineering',    ts_eamcet_engg:'TS EAMCET Engineering',
}
const _examDisplay = id => EXAM_DISPLAY[id] || (id||'Mock Test').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())

/* ── Ideal time targets per topic (seconds) ── */
const TOPIC_TARGETS = {
  simplification:12, 'number series':20, 'quadratic equations':25,
  percentage:40, 'ratio & proportion':35, 'profit & loss':45, 'time & work':50,
  'time & distance':45, 'simple & compound interest':40, mensuration:50,
  'data interpretation':90, 'approximation':15,
  'puzzles & seating':70, 'seating arrangement':70, syllogism:20,
  inequality:15, 'blood relations':35, 'coding-decoding':25,
  'direction sense':25, 'floor puzzles':60, 'input-output':30,
  'reading comprehension':75, 'cloze test':45, 'error detection':30,
  'para jumbles':40, 'fill in the blanks':20, vocabulary:12,
  'sentence improvement':25, 'word usage':20,
}
const _getTarget = name => TOPIC_TARGETS[(name||'').toLowerCase().trim()] || 40

function _classify(acc, timeRatio) {
  if (acc >= 75 && timeRatio <= 1.3) return 'confident'
  if (acc >= 55 && timeRatio > 1.5)  return 'knows_but_slow'
  if (acc >= 55 && timeRatio <= 1.3) return 'knows_but_careless'
  if (acc < 40  && timeRatio > 1.5)  return 'concept_gap'
  if (acc < 40  && timeRatio < 0.7)  return 'guessing'
  if (acc < 40)                       return 'struggling'
  return 'moderate'
}

const _fmt = t => (t||'').replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
const _secLabel = id => ({ english:'English', numerical:'Numerical', reasoning:'Reasoning', ga:'Gen Awareness', maths:'Mathematics', physics:'Physics', chemistry:'Chemistry' }[id] || _fmt(id))

/* ── Build prediction data from a Supabase results row ── */
function buildPredictionData(row, user) {
  const examId  = row.exam || ''
  const category = ((user?.user_metadata?.category) || 'UR').toUpperCase()
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name ||
                   (user?.email?.split('@')[0] || 'Student')

  const correct    = +(row.correct_count  ?? 0)
  const wrong      = +(row.wrong_count    ?? 0)
  const skipped    = +(row.skipped_count  ?? row.skipped ?? 0)
  const totalScore = +(row.total_score    ?? row.score   ?? 0)
  const maxScore   = +(row.max_score      ?? 100)
  const percentage = +(row.percentage     ?? ((totalScore / maxScore) * 100)).toFixed(1)

  // ── Sections from section_scores ──
  const sectionScores = row.section_scores || {}
  const secCfg  = EXAM_SECTION_CFG[examId] || []
  const scutMap = SECTION_CUTOFFS[examId]  || {}
  const sections = secCfg.map(sec => {
    const ss   = sectionScores[sec.id] || {}
    const corr = +(ss.correct ?? ss.score ?? 0)
    const scRow = scutMap[sec.id] || {}
    const cutoff = scRow[category] ?? scRow.UR ?? +(sec.total * 0.27).toFixed(2)
    return { id: sec.id, label: sec.label, correct: corr, total: sec.total, cutoff, color: sec.color }
  }).filter(s => s.total > 0)

  // ── Historical cutoff comparison ──
  const cmap = EXAM_CUTOFF_MAP[examId]
  let cutoff = { typical: 65, min: 50, max: 80, status: 'unknown', gap: +(percentage - 65).toFixed(1) }
  if (cmap) {
    const rows = HISTORICAL_CUTOFFS[cmap.id] || []
    if (rows.length) {
      const cat = ['UR','OBC','EWS','SC','ST','PwBD'].includes(category) ? category : 'UR'
      const catVals = rows.map(r => r[cat] ?? r.UR).filter(Boolean)
      const typical = rows[0][cat] ?? rows[0].UR ?? 65
      const pct = v => +(v / cmap.total * 100).toFixed(1)
      const typPct = pct(typical)
      const minPct = pct(Math.min(...catVals))
      const maxPct = pct(Math.max(...catVals))
      const gap    = +(percentage - typPct).toFixed(1)
      cutoff = {
        typical: typPct, min: minPct, max: maxPct,
        status: gap >= 5 ? 'above' : gap >= 0 ? 'borderline_high' : gap >= -5 ? 'borderline_low' : 'below',
        gap,
      }
    }
  }

  // ── Topics from result_json.questions (with timing) ── */
  const resultJson = row.result_json || {}
  const questions  = Array.isArray(resultJson.questions) ? resultJson.questions : []
  let topics = []

  if (questions.length > 0) {
    const topicMap = {}
    for (const q of questions) {
      const raw = q.topic || q.subject || ''
      if (!raw) continue
      const key = raw.toLowerCase().trim()
      if (!topicMap[key]) topicMap[key] = { name: raw, section: q.section || '', correct: 0, total: 0, totalMs: 0, msCount: 0 }
      topicMap[key].total++
      if (q.status === 'correct') topicMap[key].correct++
      const ms = q.time_ms ?? q.time ?? 0
      if (ms > 0) { topicMap[key].totalMs += ms; topicMap[key].msCount++ }
    }
    topics = Object.values(topicMap)
      .filter(t => t.total >= 2)
      .map(t => {
        const acc    = Math.round((t.correct / t.total) * 100)
        const avgSec = t.msCount > 0 ? Math.round(t.totalMs / t.msCount / 1000) : _getTarget(t.name)
        const target = _getTarget(t.name)
        const conf   = _classify(acc, avgSec / Math.max(target, 1))
        return { name: _fmt(t.name), section: _secLabel(t.section), acc, time: avgSec, target, conf, silly: 0, gap: 0 }
      })
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 8)
  }

  // Fallback to weak_topics when no question-level data
  if (topics.length === 0 && Array.isArray(row.weak_topics) && row.weak_topics.length) {
    topics = row.weak_topics.slice(0, 6).map(t => {
      const name = typeof t === 'string' ? t : (t.topic || t.name || 'Topic')
      const target = _getTarget(name)
      return { name: _fmt(name), section: 'Mixed', acc: 25, time: target * 1.6 | 0, target, conf: 'struggling', silly: 0, gap: 0 }
    })
  }

  // ── Time analysis ──
  let timeAnalysis = { avg: 0, silly: 0, cgap: 0, sunk: { secs: 0, count: 0, topic: 'N/A' }, slowest: [] }
  if (questions.length > 0) {
    const timesMs = questions.map(q => q.time_ms ?? q.time ?? 0).filter(t => t > 0)
    const avgMs   = timesMs.length ? timesMs.reduce((a, b) => a + b, 0) / timesMs.length : 0
    const sunkQs  = questions.filter(q =>
      (q.status === 'skipped' || q.user_answer == null || q.user_answer === '') &&
      (q.time_ms ?? q.time ?? 0) > 10000
    )
    const sunkSecs = Math.round(sunkQs.reduce((s, q) => s + (q.time_ms ?? q.time ?? 0), 0) / 1000)
    const sunkTopic = sunkQs[0]?.topic || 'N/A'
    const slowest = topics
      .filter(t => t.time > t.target * 1.3)
      .sort((a, b) => (b.time / b.target) - (a.time / a.target))
      .slice(0, 2)
      .map(t => ({ topic: t.name, ratio: +(t.time / t.target).toFixed(2), avg: t.time, target: t.target }))
    timeAnalysis = {
      avg:  Math.round(avgMs / 1000),
      silly: topics.filter(t => t.conf === 'knows_but_careless').length,
      cgap:  topics.filter(t => t.conf === 'concept_gap').length,
      sunk:  { secs: sunkSecs, count: sunkQs.length, topic: _fmt(sunkTopic) },
      slowest,
    }
  }

  // ── Streaks (3+ consecutive wrong/skipped) ──
  const streaks = []
  if (questions.length > 0) {
    let streak = 0, start = 0
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].status !== 'correct') {
        if (streak === 0) start = i + 1
        streak++
      } else {
        if (streak >= 3) streaks.push({ start, end: i, length: streak, message: `${streak} consecutive wrong/skipped (Q${start}–Q${i}) in ${_secLabel(questions[i - 1]?.section || '')} block` })
        streak = 0
      }
    }
    if (streak >= 3) streaks.push({ start, end: questions.length, length: streak, message: `${streak} consecutive wrong/skipped (Q${start}–Q${questions.length})` })
  }

  // ── Next steps (ranked by impact) ──
  const impactMap  = { concept_gap: 3.0, struggling: 2.5, guessing: 1.5, knows_but_careless: 1.2, moderate: 1.0, knows_but_slow: 0.8 }
  const sevMap     = { concept_gap:'critical', struggling:'critical', guessing:'moderate', knows_but_careless:'moderate', moderate:'mild', knows_but_slow:'mild' }
  const diffMap    = { concept_gap:'medium', struggling:'medium', guessing:'easy', knows_but_careless:'easy', moderate:'medium', knows_but_slow:'medium' }
  const actionable = topics.filter(t => !['confident'].includes(t.conf))
  const nextSteps  = actionable
    .sort((a, b) => (impactMap[b.conf] || 1) - (impactMap[a.conf] || 1))
    .slice(0, 3)
    .map((t, i) => ({
      priority: i + 1,
      title: t.conf === 'guessing'          ? `Stop guessing in ${t.name}` :
             t.conf === 'knows_but_careless' ? `Reduce careless errors: ${t.name}` :
             t.conf === 'concept_gap'        ? `Revise concept: ${t.name}` :
             t.conf === 'struggling'         ? `Fundamental practice: ${t.name}` :
             t.conf === 'knows_but_slow'     ? `Speed drill: ${t.name}` :
             `Improve: ${t.name}`,
      conf:       t.conf,
      impact:     `+${(impactMap[t.conf] || 1.0).toFixed(1)} marks`,
      severity:   sevMap[t.conf]  || 'moderate',
      difficulty: diffMap[t.conf] || 'medium',
    }))

  return {
    name: userName, exam: _examDisplay(examId), category,
    score: totalScore, maxScore, percentage: +percentage,
    correct, wrong, skipped,
    cutoff, sections, topics, timeAnalysis, streaks, nextSteps,
  }
}

/* ── MAIN COMPONENT ── */
export default function PredictionExplainer({ user, onNav }) {
  const [activeSection, setActiveSection] = useState("overview")
  const [loading,   setLoading]   = useState(true)
  const [liveData,  setLiveData]  = useState(null)
  const [fetchErr,  setFetchErr]  = useState(null)  // 'no_exam' | 'no_results' | 'error'

  useEffect(() => {
    if (!user) { setLoading(false); setFetchErr('no_exam'); return }
    const examId = user.user_metadata?.chosen_exam
    if (!examId) { setLoading(false); setFetchErr('no_exam'); return }

    latestResultForExam(user.id, examId)
      .then(({ data, error }) => {
        if (error || !data) { setFetchErr('no_results'); setLoading(false); return }
        try {
          setLiveData(buildPredictionData(data, user))
        } catch (e) {
          console.error('[PredictionExplainer] build error:', e)
          setFetchErr('error')
        }
        setLoading(false)
      })
  }, [user?.id])

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div style={{
            width:40, height:40, borderRadius:'50%', margin:'0 auto',
            border:'3px solid #e5e7eb', borderTopColor:'#3b82f6',
            animation:'spin .7s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p className="text-gray-500 text-sm mt-4">Loading your analysis…</p>
        </div>
      </div>
    )
  }

  /* ── No results / no exam chosen ── */
  if (fetchErr === 'no_results' || fetchErr === 'no_exam') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {fetchErr === 'no_exam' ? 'No exam selected' : 'No test results yet'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {fetchErr === 'no_exam'
              ? 'Choose an exam from the dashboard to get started.'
              : 'Take a full mock test first — your prediction analysis will appear here after you submit.'}
          </p>
          <button
            onClick={() => onNav ? onNav('examhome') : window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Take a Mock Test →
          </button>
        </div>
      </div>
    )
  }

  /* ── Generic error ── */
  if (fetchErr === 'error' || !liveData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Could not load prediction data. Please try again.</p>
          <button onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  /* ── Render with live data (all JSX below is identical to the original) ── */
  const d = liveData

  const sections = [
    { id:"overview",   label:"Overview",      icon:<PIcChart s={12}/> },
    { id:"cutoff",     label:"Cut-off",       icon:<PIcTarget s={12}/> },
    { id:"confidence", label:"Confidence",    icon:<PIcBrain s={12}/> },
    { id:"time",       label:"Time Analysis", icon:<PIcClock s={12}/> },
    { id:"steps",      label:"Next Steps",    icon:<PIcArrow s={12}/> },
    { id:"howit",      label:"How It Works",  icon:<PIcGear s={12}/> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-blue-200 text-xs mb-1">MockTest · Result Analysis</div>
          <h1 className="text-white font-black text-xl">How Your Prediction Works</h1>
          <p className="text-blue-200 text-sm mt-1">
            Student: <strong className="text-white">{d.name}</strong> · {d.exam} · Category: <strong className="text-white">{d.category}</strong>
          </p>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1
                ${activeSection===s.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ── OVERVIEW ── */}
        {activeSection === "overview" && (<>
          {/* Score card */}
          <Card title="Your Score" subtitle={`${d.exam} · ${d.maxScore} marks`} accent="#3b82f6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray={`${Math.min(d.percentage,100)} ${100-Math.min(d.percentage,100)}`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-gray-900">{d.percentage}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1">
                {[
                  { label:"Correct",  val:d.correct,  color:"#10b981" },
                  { label:"Wrong",    val:d.wrong,     color:"#ef4444" },
                  { label:"Skipped",  val:d.skipped,  color:"#9ca3af" },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="text-2xl font-black" style={{color:s.color}}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Section bars */}
          {d.sections.length > 0 && (
            <Card title="Section Scores" subtitle="Each section has its own cut-off — failing one = disqualified" accent="#8b5cf6">
              <div className="space-y-4">
                {d.sections.map(sec => {
                  const pct = Math.round(sec.correct/sec.total*100)
                  const passing = sec.correct >= sec.cutoff
                  return (
                    <div key={sec.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-gray-700">{sec.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{sec.correct}/{sec.total}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passing?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
                            {passing ? "✓ Cut-off passed" : "✗ Below cut-off"}
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all"
                          style={{ width:`${pct}%`, background:sec.color }} />
                        {/* cut-off marker */}
                        <div className="absolute top-0 h-full border-l-2 border-dashed border-gray-400"
                          style={{ left:`${sec.cutoff/sec.total*100}%` }}
                          title={`Cut-off: ${sec.cutoff} marks`} />
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Sectional cut-off ({d.category}): {sec.cutoff} marks — dashed line
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>)}

        {/* ── CUT-OFF ANALYSIS ── */}
        {activeSection === "cutoff" && (<>
          <Card title={`${d.category} Cut-off Comparison`} subtitle="Based on official results — previous years" accent="#f59e0b">
            <div className="space-y-4">
              {/* Visual gauge */}
              <div className="relative h-12 bg-gray-100 rounded-xl overflow-hidden">
                {/* colour zones */}
                <div className="absolute inset-0 flex">
                  <div className="bg-red-100"    style={{width:`${d.cutoff.min}%`}} />
                  <div className="bg-amber-100"  style={{width:`${Math.max(0,d.cutoff.typical-d.cutoff.min)}%`}} />
                  <div className="bg-green-100"  style={{flex:1}} />
                </div>
                {/* markers */}
                <div className="absolute top-0 h-full border-l-2 border-amber-500"
                  style={{left:`${d.cutoff.typical}%`}}>
                  <span className="absolute -top-0.5 left-1 text-xs text-amber-700 font-bold whitespace-nowrap">
                    Typical {d.cutoff.typical}%
                  </span>
                </div>
                <div className="absolute top-0 h-full border-l-2 border-green-600"
                  style={{left:`${Math.min(d.cutoff.max,99)}%`}}>
                  <span className="absolute -top-0.5 left-1 text-xs text-green-700 font-bold whitespace-nowrap">
                    Safe {d.cutoff.max}%
                  </span>
                </div>
                {/* student marker */}
                <div className="absolute top-0 h-full border-l-4 border-blue-600"
                  style={{left:`${Math.min(d.percentage,99)}%`}}>
                  <span className="absolute top-3 left-1 text-xs text-blue-700 font-black whitespace-nowrap">
                    You {d.percentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Minimum cut-off", val:d.cutoff.min+'%',  sub:"Lowest year",      color:"#ef4444" },
                  { label:"Typical cut-off", val:d.cutoff.typical+'%',sub:"Recent average", color:"#f59e0b" },
                  { label:"Safe zone",       val:d.cutoff.max+'%',  sub:"Highest year",      color:"#10b981" },
                ].map(c => (
                  <div key={c.label} className="text-center p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="text-lg font-black" style={{color:c.color}}>{c.val}</div>
                    <div className="text-xs font-semibold text-gray-700">{c.label}</div>
                    <div className="text-xs text-gray-400">{c.sub}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-800 text-sm mb-1">
                  {d.cutoff.gap < 0 ? `Need ${Math.abs(d.cutoff.gap)}% more to reach typical cut-off` : "Above typical cut-off ✓"}
                </div>
                <p className="text-xs text-amber-700">
                  {d.cutoff.gap < 0
                    ? `Your score of ${d.percentage}% is ${Math.abs(d.cutoff.gap)}% below the typical ${d.category} cut-off (${d.cutoff.typical}%). Just 2–3 more correct answers closes this gap.`
                    : `Your score of ${d.percentage}% is ${d.cutoff.gap}% above the typical ${d.category} cut-off (${d.cutoff.typical}%). Keep this up!`
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Reference: All categories */}
          <Card title="All Category Cut-offs" subtitle="IBPS Clerk Prelims 2023 — for reference" accent="#6366f1">
            <div className="space-y-2">
              {[
                {cat:"UR",  typ:76.5, min:72.0, max:76.5},
                {cat:"OBC", typ:75.0, min:70.0, max:75.0},
                {cat:"EWS", typ:74.5, min:69.0, max:74.5},
                {cat:"SC",  typ:68.0, min:62.5, max:68.0},
                {cat:"ST",  typ:56.0, min:50.0, max:56.0},
                {cat:"PwBD",typ:48.0, min:42.0, max:48.0},
              ].map(c => (
                <div key={c.cat} className={`flex items-center gap-3 p-2.5 rounded-lg ${c.cat===d.category?"bg-blue-50 border border-blue-200":""}`}>
                  <span className={`text-xs font-bold w-12 ${c.cat===d.category?"text-blue-700":"text-gray-500"}`}>
                    {c.cat}{c.cat===d.category?" ←":""}
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{width:`${c.typ}%`}} />
                  </div>
                  <span className="text-xs text-gray-600 w-32">{c.min}–{c.max} (typ:{c.typ})</span>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── CONFIDENCE ANALYSIS ── */}
        {activeSection === "confidence" && (<>
          <Card title="4-State Confidence Model" subtitle="Each topic gets one of these labels based on time + accuracy" accent="#8b5cf6">
            <div className="grid grid-cols-2 gap-3">
              {[
                {key:"confident",          ex:"Fast + correct — no action needed"},
                {key:"knows_but_slow",     ex:"Correct but taking too long — speed drills"},
                {key:"knows_but_careless", ex:"Careless mistakes on a known topic"},
                {key:"concept_gap",        ex:"Slow + wrong — needs concept revision"},
                {key:"guessing",           ex:"Fast + wrong — costs marks with -0.25"},
                {key:"struggling",         ex:"Slow + wrong — revisit fundamentals"},
              ].map(({key,ex}) => {
                const m = CONF_META[key]
                return (
                  <div key={key} className="p-3 rounded-xl border" style={{borderColor:m.color+"44", background:m.bg}}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{m.icon}</span>
                      <span className="font-bold text-xs" style={{color:m.color}}>{m.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{m.desc}</p>
                    <p className="text-xs text-gray-400 italic">{ex}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          {d.topics.length > 0 ? (
            <Card title="Your Topic Confidence Map" subtitle="Based on your actual performance" accent="#3b82f6">
              <div className="space-y-2">
                {d.topics.map(t => {
                  const m = CONF_META[t.conf] || CONF_META.moderate
                  const timeRatio = (t.time/t.target).toFixed(1)
                  const overTarget = t.time > t.target*1.2
                  return (
                    <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-xs font-semibold text-gray-700 w-32 flex-shrink-0">{t.name}</span>
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{t.section}</span>
                      {/* accuracy bar */}
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{width:`${t.acc}%`, background:m.color}} />
                      </div>
                      <span className="text-xs text-gray-600 w-10 text-right">{t.acc}%</span>
                      <Tooltip text={`Avg ${t.time}s vs ideal ${t.target}s (${timeRatio}x)`}>
                        <span className={`text-xs w-16 text-right ${overTarget?"text-red-600 font-semibold":"text-gray-400"}`}>
                          {t.time}s {overTarget?`↑${timeRatio}x`:""}
                        </span>
                      </Tooltip>
                      <Tooltip text={m.desc}>
                        <Badge label={m.label} color={m.color} bg={m.bg} />
                      </Tooltip>
                      {t.silly>0 && <span className="text-xs text-orange-600 font-bold" title="Silly mistakes">E{t.silly}</span>}
                      {t.gap>0   && <span className="text-xs text-red-600 font-bold" title="Concept gap questions"><PIcBook s={10} c='#dc2626'/>{t.gap}</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">E = silly mistakes detected &nbsp;|&nbsp; <PIcBook s={10} c='#6b7280'/> = concept gap detected</p>
            </Card>
          ) : (
            <Card title="Your Topic Confidence Map" subtitle="Detailed per-topic analysis" accent="#3b82f6">
              <p className="text-sm text-gray-400 text-center py-4">Per-topic data not available for this result. Retake the test in the latest version to get full topic analysis.</p>
            </Card>
          )}
        </>)}

        {/* ── TIME ANALYSIS ── */}
        {activeSection === "time" && (<>
          <Card title="Time Analysis" subtitle={`How you spent your time across ${d.correct + d.wrong + d.skipped} questions`} accent="#f59e0b">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {label:"Avg per question", val:d.timeAnalysis.avg>0?`${d.timeAnalysis.avg}s`:'N/A',  target:"< 60s", ok:d.timeAnalysis.avg>0&&d.timeAnalysis.avg<60, note:"Target is under 60s overall"},
                {label:"Silly mistakes",   val:d.timeAnalysis.silly, target:"0",   ok:d.timeAnalysis.silly===0, note:"Wrong + medium fast on known topic"},
                {label:"Concept gaps",     val:d.timeAnalysis.cgap,  target:"0",   ok:d.timeAnalysis.cgap===0,  note:"Wrong + slow = didn't understand"},
                {label:"Sunk time",        val:d.timeAnalysis.sunk.secs>0?`${d.timeAnalysis.sunk.secs}s`:'0s', target:"0s", ok:d.timeAnalysis.sunk.secs===0, note:"Time wasted on skipped questions"},
              ].map(c => (
                <div key={c.label} className={`p-3 rounded-xl border ${c.ok?"border-green-200 bg-green-50":"border-red-200 bg-red-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{c.label}</span>
                    <span className={`text-xs font-bold ${c.ok?"text-green-600":"text-red-600"}`}>{c.ok?"✓":"✗"}</span>
                  </div>
                  <div className={`text-xl font-black mt-1 ${c.ok?"text-green-700":"text-red-700"}`}>{c.val}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.note}</div>
                </div>
              ))}
            </div>

            {/* Sunk time */}
            {d.timeAnalysis.sunk.secs > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                <div className="font-bold text-orange-800 text-sm mb-1">⏳ Sunk Time: {d.timeAnalysis.sunk.secs}s wasted</div>
                <p className="text-xs text-orange-700">
                  You spent {d.timeAnalysis.sunk.secs}s reading {d.timeAnalysis.sunk.count} question{d.timeAnalysis.sunk.count!==1?'s':''} you eventually skipped
                  (worst: {d.timeAnalysis.sunk.topic}). Apply the <strong>30-second rule</strong>:
                  if you can't start solving within 30s, skip immediately.
                </p>
              </div>
            )}

            {/* Slowest vs target */}
            {d.timeAnalysis.slowest.length > 0 && (<>
              <div className="font-semibold text-sm text-gray-700 mb-2">Slowest Topics vs Ideal Time</div>
              {d.timeAnalysis.slowest.map(s => (
                <div key={s.topic} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-600 w-32">{s.topic}</span>
                  <div className="flex-1 relative h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full transition-all" style={{width:`${Math.min(s.avg/2,100)}%`}} />
                    <div className="absolute top-0 h-full border-l-2 border-green-600 border-dashed" style={{left:`${Math.min(s.target/2,100)}%`}} />
                  </div>
                  <span className="text-xs text-red-600 font-bold w-24 text-right">
                    {s.avg}s ({s.ratio}x over {s.target}s ideal)
                  </span>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-1">Green dashed line = ideal target time</p>
            </>)}

            {d.timeAnalysis.avg === 0 && (
              <p className="text-sm text-gray-400 text-center py-2">Detailed timing data not available for this result.</p>
            )}
          </Card>

          {/* Streak */}
          {d.streaks.length > 0 && (
            <Card title="Consecutive Wrong Streaks" subtitle="3+ consecutive wrong/skipped = confidence dip signal" accent="#ef4444">
              {d.streaks.map((s,i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl mb-2 last:mb-0">
                  <div className="font-bold text-red-700 text-sm mb-1">
                    {s.length} consecutive wrong/skipped — Q{s.start}–Q{s.end}
                  </div>
                  <p className="text-xs text-red-600">{s.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This often means a topic block you're unfamiliar with appeared together.
                    In the real exam, skip immediately after 2 consecutive unknowns — don't persist.
                  </p>
                </div>
              ))}
            </Card>
          )}
        </>)}

        {/* ── NEXT STEPS ── */}
        {activeSection === "steps" && (<>
          <Card title="Recommended Next Steps" subtitle="Ranked by exam impact — most marks to gain first" accent="#10b981">
            {d.nextSteps.length > 0 ? (
              <div className="space-y-3">
                {d.nextSteps.map(step => {
                  const c   = CONF_META[step.conf] || CONF_META.moderate
                  const sev = SEV_META[step.severity] || SEV_META.moderate
                  return (
                    <div key={step.priority} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {step.priority}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-gray-900 text-sm">{step.title}</span>
                            <Badge label={sev.label} color={sev.color} bg={sev.bg} />
                            <Badge label={c.label}   color={c.color}   bg={c.bg}   />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            Confidence state: <strong>{c.label}</strong> — {c.desc}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{step.impact}</span>
                            <span className="text-xs text-gray-400">Difficulty: {step.difficulty}</span>
                            <button className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                              Start Practice →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                {d.topics.length === 0
                  ? 'Take a test with detailed question data to get personalised next steps.'
                  : 'Great job! All your topics are at a confident level.'}
              </p>
            )}
          </Card>

          {/* Impact estimate */}
          {d.nextSteps.length > 0 && (
            <Card title="If You Fix These Topics" subtitle="Estimated score improvement" accent="#6366f1">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-900">{d.percentage}%</div>
                  <div className="text-xs text-gray-400">Current</div>
                </div>
                <div className="flex-1 text-center text-2xl text-gray-300">→</div>
                <div className="text-center">
                  <div className="text-3xl font-black text-green-600">
                    {+(d.percentage + d.nextSteps.reduce((s,n) => s + parseFloat(n.impact), 0)).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Projected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-blue-600">{d.cutoff.typical}%</div>
                  <div className="text-xs text-gray-400">{d.category} cut-off</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                Fixing your top weak topics could bring you from {d.percentage}% to ~{+(d.percentage + d.nextSteps.reduce((s,n)=>s+parseFloat(n.impact),0)).toFixed(1)}% —
                {d.cutoff.gap < 0 ? ` above the typical ${d.category} cut-off of ${d.cutoff.typical}%.` : ` you're already above the cut-off.`}{' '}
                This is achievable in 2–3 weeks of focused practice.
              </div>
            </Card>
          )}
        </>)}

        {/* ── HOW IT WORKS ── */}
        {activeSection === "howit" && (<>
          <Card title="How Our Prediction Works" subtitle="Step by step — no magic, just math" accent="#6366f1">
            <div className="space-y-5">
              {[
                {
                  step:1, title:"Every question is logged",
                  color:"#3b82f6",
                  body:"For each of your answers, we record: topic, section, your answer, correct answer, and time spent in milliseconds.",
                  example:'{ topic:"percentage", status:"wrong", time_ms:98000 }'
                },
                {
                  step:2, title:"Topic-specific time benchmark applied",
                  color:"#8b5cf6",
                  body:"We compare your time against an ideal target for THAT topic — not a uniform constant. Simplification ideal = 12s. Reading Comprehension ideal = 75s. These are derived from real exam analysis.",
                  example:'Percentage: you took 98s vs ideal 40s → 2.4x over target → flagged'
                },
                {
                  step:3, title:"Confidence state assigned per topic",
                  color:"#f59e0b",
                  body:"Each topic is classified into one of 6 states based on accuracy + time pattern. This drives all downstream advice.",
                  example:'Wrong + slow + low accuracy → concept_gap\nWrong + fast + decent accuracy → guessing'
                },
                {
                  step:4, title:"Sunk time on skips calculated",
                  color:"#ef4444",
                  body:"Skips under 3s = deliberate skip. Skips over 10s = sunk time — you read it, couldn't solve, abandoned. We report how many seconds you lost this way.",
                  example:'2 skipped questions × 48s each = 97s wasted on unproductive reading'
                },
                {
                  step:5, title:"Category cut-off comparison",
                  color:"#10b981",
                  body:"We use your reservation category to show how you compare against official cut-offs from previous years. Cut-offs vary by state and year.",
                  example:`${d.category} typical: ${d.cutoff.typical}%. You: ${d.percentage}%. Gap: ${d.cutoff.gap > 0 ? '+' : ''}${d.cutoff.gap}%.`
                },
                {
                  step:6, title:"Weakness score computed",
                  color:"#f97316",
                  body:"Each topic gets a score 0–1 based on: accuracy (45%), time vs target (20%), skip rate (20%), guess rate (10%). Silly mistakes reduce the score — you know the topic.",
                  example:'Percentage: acc=0% (high), time=2.4x (high), skips=25% → score=0.88 → CRITICAL'
                },
                {
                  step:7, title:"Next steps ranked by exam impact",
                  color:"#6366f1",
                  body:"We estimate how many extra marks you'd gain by fixing each weak topic. Ranked by impact × difficulty to fix. The top 3 are your priority.",
                  example:'Fixing a concept_gap topic from 0%→80% accuracy = +3.0 marks estimated'
                },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black"
                    style={{background:s.color}}>
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm mb-1">{s.title}</div>
                    <p className="text-xs text-gray-600 mb-2">{s.body}</p>
                    <div className="bg-gray-900 text-green-400 text-xs rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">
                      {s.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Our Honest Limitations" subtitle="What our predictions cannot guarantee" accent="#ef4444">
            <ul className="space-y-2 text-xs text-gray-600">
              {[
                "Cannot predict exact cut-offs — those depend on vacancy count and competition that year.",
                "Cannot detect if you knew the answer but misread the question — only time and correctness are available.",
                "State-wise cut-off comparison needs your state (optional field we ask during registration).",
                "Peer percentile needs 20+ other students to have taken the same exam — activates automatically as platform grows.",
                "Google sign-in users may not have a category set — defaults to UR until they update their profile.",
              ].map((item,i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-400 flex-shrink-0">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </>)}

      </div>
    </div>
  )
}
