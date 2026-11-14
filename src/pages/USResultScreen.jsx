import { useState } from 'react'
import QuestionContent from '../components/QuestionContent'

const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const URIcChart  = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const URIcWarn   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const URIcClock  = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const URIcArrow  = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const URIcBook   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const URIcBulb   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
const URIcGrad   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const URIcBrain  = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.15A3 3 0 0 1 4 11.5a3 3 0 0 1 1.5-2.6 2.5 2.5 0 0 1 4-2.9z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.15A3 3 0 0 0 20 11.5a3 3 0 0 0-1.5-2.6 2.5 2.5 0 0 0-4-2.9z"/></svg>
const URIcTarget = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const URIcRobot  = ({s=12,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><line x1="9" y1="13" x2="9.01" y2="13"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
const URIcCal    = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const URIcDoc    = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const URIcTimer  = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14 15"/><path d="M9 2h6M12 2v3"/></svg>
const URIcPin    = ({s=11,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const URIcFile   = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
const URIcHome   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const URIcBolt   = ({s=12,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const URIcCalc   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>
import ChartQuestion from '../components/ChartQuestion'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import DOMPurify from 'dompurify'

/* ── KaTeX helpers (shared with ResultScreen) ── */
function _toKaTeX(s) {
  return s
    .replace(/\((\d[\d,]*)\s*\/\s*(\d[\d,]*)\)\s*[×x]\s*(\d+)(\s*=\s*[\d.]+)?/gi,
             (_, a, b, c, eq) => `\\frac{${a}}{${b}} \\times ${c}${eq || ''}`)
    .replace(/(\d[\d,]*)\s*÷\s*(\d[\d,]*)(\s*=\s*[\d.]+)?/g,
             (_, a, b, eq) => `\\frac{${a}}{${b}}${eq || ''}`)
    .replace(/×/g, '\\times')
}
const _MATH_RE = /\(\d[\d,]*\/\d[\d,]*\)\s*[×x]\s*\d+(?:\s*=\s*[\d.]+)?|\d[\d,]*\s*÷\s*\d[\d,]*(?:\s*=\s*[\d.]+)?/gi

function MathText({ text }) {
  if (!text || typeof text !== 'string') return <>{text}</>
  const parts = []
  let last = 0
  for (const m of text.matchAll(_MATH_RE)) {
    if (m.index > last) parts.push({ math: false, val: text.slice(last, m.index) })
    parts.push({ math: true, val: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ math: false, val: text.slice(last) })
  if (!parts.some(p => p.math)) return <>{text}</>
  return (
    <>
      {parts.map((p, i) => {
        if (!p.math) return <span key={i}>{p.val}</span>
        try {
          const raw  = katex.renderToString(_toKaTeX(p.val), { throwOnError: false, displayMode: false, output: 'html' })
          const html = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        } catch {
          return <span key={i}>{p.val}</span>
        }
      })}
    </>
  )
}

/* ── helpers ── */
const tName = t => (t || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const fmt   = v => typeof v === 'number' ? v.toFixed(1) : (v || 0)

/* ── US Exam display names ── */
const US_EXAM_DISPLAY = {
  sat_full: 'SAT Full Test',
  sat_math: 'SAT Math Section',
  sat_ebrw: 'SAT EBRW Section',
  act_full: 'ACT Full Test',
  act_english: 'ACT English',
  act_math: 'ACT Math',
  act_reading: 'ACT Reading',
  act_science: 'ACT Science',
}
const examDisplay = id => US_EXAM_DISPLAY[id] || (id || 'Mock Test').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

/* ── Score helpers ── */
const isSAT = examId => !examId || examId.startsWith('sat')
const isACT = examId => (examId || '').startsWith('act')

// SAT: total 400-1600, sections 200-800
// ACT: composite 1-36
function getScoreDisplay(result) {
  const exam = result.exam || ''
  if (isACT(exam)) {
    const composite = result.act_composite ?? result.composite_score ?? null
    const sections = result.act_sections || {}
    return {
      type: 'act',
      composite,
      sections,
      maxComposite: 36,
      label: composite != null ? `${composite}` : `${result.score ?? 0}`,
      sublabel: 'Composite Score',
      ring: composite != null ? Math.round((composite / 36) * 100) : (result.percentage ?? 0),
    }
  }
  // SAT
  const total = result.sat_total ?? result.composite_score ?? null
  const ebrw  = result.sat_ebrw ?? null
  const math  = result.sat_math ?? null
  return {
    type: 'sat',
    composite: total,
    sections: { EBRW: ebrw, Math: math },
    maxComposite: 1600,
    label: total != null ? `${total}` : `${result.score ?? 0}`,
    sublabel: 'SAT Total Score',
    ring: total != null ? Math.round((total / 1600) * 100) : (result.percentage ?? 0),
  }
}

/* ── College tiers ── */
const COLLEGE_TIERS = [
  { key: 'community',   label: 'Community College',   range: [0, 400],    actRange: [1, 16],   color: '#94a3b8', desc: 'Open admission' },
  { key: 'state',       label: 'State University',    range: [900, 1100], actRange: [17, 22],  color: '#3b82f6', desc: 'Competitive state schools' },
  { key: 'uc',          label: 'UC System',           range: [1100, 1300],actRange: [23, 27],  color: '#8b5cf6', desc: 'UC Davis, Santa Barbara, Irvine' },
  { key: 'top30',       label: 'Top 30 Nationals',    range: [1300, 1450],actRange: [28, 32],  color: '#f59e0b', desc: 'UCLA, Michigan, Georgetown' },
  { key: 'ivy',         label: 'Ivy League / MIT',    range: [1450, 1600],actRange: [33, 36],  color: '#10b981', desc: 'Harvard, MIT, Stanford, Yale' },
]

function getCollegeFit(score, examType) {
  if (!score) return { safety: [], target: [], reach: [] }
  const results = { safety: [], target: [], reach: [] }
  COLLEGE_TIERS.forEach(tier => {
    const [lo, hi] = examType === 'act' ? tier.actRange : tier.range
    if (score >= hi - (examType === 'act' ? 1 : 50)) results.safety.push(tier)
    else if (score >= lo - (examType === 'act' ? 2 : 100)) results.target.push(tier)
    else results.reach.push(tier)
  })
  return results
}

/* ── Percentile calculation ── */
function estimatePercentile(score, examType) {
  if (examType === 'act') {
    if (score >= 35) return 99
    if (score >= 33) return 98
    if (score >= 30) return 95
    if (score >= 27) return 87
    if (score >= 24) return 74
    if (score >= 21) return 57
    if (score >= 18) return 38
    if (score >= 15) return 22
    return 10
  }
  // SAT
  if (score >= 1550) return 99
  if (score >= 1500) return 98
  if (score >= 1450) return 96
  if (score >= 1400) return 94
  if (score >= 1350) return 91
  if (score >= 1300) return 87
  if (score >= 1250) return 81
  if (score >= 1200) return 74
  if (score >= 1150) return 65
  if (score >= 1100) return 56
  if (score >= 1050) return 47
  if (score >= 1000) return 40
  if (score >= 950)  return 32
  if (score >= 900)  return 26
  return 15
}

/* ── ShareModal ── */
function ShareModal({ result, studentName, onClose }) {
  const [copied, setCopied] = useState(false)
  const sd = getScoreDisplay(result)
  const name = (studentName || 'Student').replace(/\b\w/g, c => c.toUpperCase())
  const examName = examDisplay(result.exam)
  const percentile = estimatePercentile(sd.composite, sd.type)

  const waText = [
    `🎯 I scored *${sd.label}* on the *${examName}*!`,
    ``,
    `📊 Percentile: ~${percentile}th`,
    `✅ ${result.correct_count ?? 0} correct  ❌ ${result.wrong_count ?? 0} wrong  ⏭ ${result.skipped_count ?? 0} skipped`,
    ``,
    `Take free mock tests 👉 https://prep.arkaserve.com`,
    `#SAT #ACT #CollegePrep #MockTest #FreeStudy`,
  ].join('\n')

  const shareWA = () => window.open('https://wa.me/?text=' + encodeURIComponent(waText), '_blank', 'noopener')
  const copyText = async () => {
    try { await navigator.clipboard.writeText(waText) } catch { }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const ringPct = sd.ring
  const scoreColor = sd.composite != null
    ? (sd.type === 'act'
        ? (sd.composite >= 28 ? '#10b981' : sd.composite >= 20 ? '#f59e0b' : '#F06535')
        : (sd.composite >= 1200 ? '#10b981' : sd.composite >= 1000 ? '#f59e0b' : '#F06535'))
    : (result.percentage >= 60 ? '#10b981' : result.percentage >= 35 ? '#f59e0b' : '#F06535')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e3a5f 100%)', padding: '32px 24px 24px' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#3b82f6' }}>
              <span className="text-white font-black text-xs">MT</span>
            </div>
            <span className="text-white/60 text-sm font-semibold">MockTest by Arkaserve</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{examName}</div>
              <div className="text-white text-3xl font-black leading-none mb-1">{sd.label}</div>
              <div className="text-sm font-bold" style={{ color: scoreColor }}>~{percentile}th percentile</div>
            </div>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3.5"/>
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" strokeLinecap="round"
                  stroke={scoreColor}
                  strokeDasharray={`${Math.min(ringPct,100)} ${100-Math.min(ringPct,100)}`}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white leading-none">{sd.label}</span>
                <span className="text-white/50 text-[10px]">{sd.type.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Correct', value: result.correct_count ?? 0, color: '#10b981' },
              { label: 'Wrong',   value: result.wrong_count ?? 0,   color: '#ef4444' },
              { label: 'Skipped', value: result.skipped_count ?? 0, color: '#94a3b8' },
            ].map(s => (
              <div key={s.label} className="rounded-xl py-3 text-center" style={{ background: 'rgba(255,255,255,.07)' }}>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 space-y-3">
          <p className="text-xs text-gray-500 text-center">Screenshot the card above, or share directly:</p>
          <button onClick={shareWA}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: '#25D366' }}>
            Share on WhatsApp
          </button>
          <button onClick={copyText}
            className="w-full py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600">
            {copied ? '✓ Copied!' : 'Copy Text'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-xs text-gray-400">Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── UI primitives ── */
function Card({ title, icon, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-sm font-bold text-gray-800 flex-1">{title}</span>
        {badge}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function FlagItem({ flag }) {
  const m    = (flag || '').match(/^(\p{Extended_Pictographic}[️]?)\s*([\s\S]*)$/u)
  const icon = m ? m[1] : '•'
  const text = m ? m[2] : (flag || '')
  const low  = text.toLowerCase()
  const neg  = /(below|prioritise|wrong|skipped|run out|lost focus|warning|weak|needs|slow|rushed|guess)/.test(low)
  const pos  = /(great|strong|well done|excellent|on track|good|consistent|accuracy|kept|steady)/.test(low)
  const tone = neg ? { c: '#dc2626', bg: '#fef2f2', bd: '#fecaca' }
             : pos ? { c: '#16a34a', bg: '#f0fdf4', bd: '#bbf7d0' }
                   : { c: '#3b82f6', bg: '#eff6ff', bd: '#bfdbfe' }
  const split = text.match(/^(.+?[.:])\s*([\s\S]*)$/)
  const head  = split ? split[1].replace(/[.:]$/, '') : text
  const rest  = split ? split[2] : ''
  return (
    <div className="flex gap-3 px-4 py-3 rounded-2xl border hover:shadow-sm transition-all"
      style={{ background: tone.bg, borderColor: tone.bd, borderLeftColor: tone.c, borderLeftWidth: 4 }}>
      <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-white shadow-sm"
        style={{ color: tone.c }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-bold leading-snug" style={{ color: tone.c }}>{head}</div>
        {rest && <div className="text-[11px] text-gray-600 leading-snug mt-0.5">{rest}</div>}
      </div>
    </div>
  )
}

function RecoBanner({ children }) {
  return (
    <div className="rounded-2xl border-2 px-5 py-4 flex items-start gap-3"
      style={{ background: '#eff6ff', borderColor: '#3b82f6' }}>
      <span className="flex-shrink-0 mt-0.5"><URIcBulb s={20} c='#3b82f6'/></span>
      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
        <b style={{ color: '#3b82f6' }}>Recommended: </b>{children}
      </p>
    </div>
  )
}

/* ── TopicBreakdown ── */
function TopicBreakdown({ questionResults }) {
  const byTopic = {}
  ;(questionResults || []).forEach(q => {
    const t = q.topic || 'General'
    if (!byTopic[t]) byTopic[t] = { correct: 0, wrong: 0, skipped: 0, total: 0, subtopics: {} }
    byTopic[t].total++
    if (q.is_correct)       byTopic[t].correct++
    else if (q.user_answer) byTopic[t].wrong++
    else                    byTopic[t].skipped++
    if (q.subtopic) {
      const st = q.subtopic
      if (!byTopic[t].subtopics[st]) byTopic[t].subtopics[st] = { correct: 0, total: 0 }
      byTopic[t].subtopics[st].total++
      if (q.is_correct) byTopic[t].subtopics[st].correct++
    }
  })
  const entries = Object.entries(byTopic).sort((a,b) => {
    const pa = a[1].total>0 ? a[1].correct/a[1].total : 0
    const pb = b[1].total>0 ? b[1].correct/b[1].total : 0
    return pa - pb
  })
  if (entries.length === 0) return <p className="text-xs text-gray-400 text-center py-4">No topic data.</p>

  const strong = entries.filter(([,s]) => s.total>0 && s.correct/s.total>=0.7)
  const weak   = entries.filter(([,s]) => s.total>0 && s.correct/s.total<0.7)

  function Row({ item, isStrong }) {
    const [t, s] = item
    const p = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0
    return (
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isStrong ? 'bg-green-500' : 'bg-red-400'}`}/>
        <span className="text-xs text-gray-700 flex-1 truncate">{tName(t)}</span>
        <span className={`text-xs font-bold ${isStrong ? 'text-green-600' : 'text-red-500'}`}>{p}%</span>
        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${p}%`, background: isStrong ? '#16a34a' : '#ef4444' }}/>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-green-600 mb-1.5">Strong ✓</div>
        {strong.length > 0
          ? strong.map((it, i) => <Row key={i} item={it} isStrong={true} />)
          : <p className="text-xs text-gray-400 italic">Keep building!</p>}
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-red-600 mb-1.5">Needs Work ✗</div>
        {weak.length > 0
          ? weak.map((it, i) => <Row key={i} item={it} isStrong={false} />)
          : <p className="text-xs text-gray-400 italic">All topics looking good!</p>}
      </div>
    </div>
  )
}

/* ── Explanation helpers (full UWorld-style, same as ResultScreen) ── */

function ExplSection({ label }) {
  return (
    <p className="text-[12px] font-bold uppercase tracking-widest mt-5 mb-2" style={{ color: '#3b82f6' }}>
      {label}
    </p>
  )
}

function ExplanationBody({ q }) {
  const e   = q?.explanation
  const cor = q?.correct_answer || q?.correct_option
  const optText = lbl => q?.[`option_${String(lbl).toLowerCase()}`] || (q?.options && q.options[String(lbl).toUpperCase()]) || ''

  if (e && typeof e === 'object' && !Array.isArray(e)) {
    const concept    = e.approach || e.concept || e.hint || ''
    const formula    = e.formula  || ''
    const steps      = e.steps    || e.working || []
    const verify     = e.correct_reason || e.verify || ''
    const rawDist    = e.distractors || e.wrong_traps || {}
    const distractors = typeof rawDist === 'object' && !Array.isArray(rawDist)
      ? Object.fromEntries(Object.entries(rawDist).filter(([k, v]) => v && k !== cor))
      : {}
    const tips = (
      Array.isArray(e.remember_tips) && e.remember_tips.length ? e.remember_tips :
      Array.isArray(e.remember)      && e.remember.length      ? e.remember :
      e.remember ? [e.remember] : []
    ).filter(Boolean)

    return (
      <div className="text-[15px] text-gray-700 leading-relaxed">
        {(concept || formula) && (
          <>
            <ExplSection label="Approach" />
            {concept && <p className="text-gray-800"><MathText text={concept} /></p>}
            {formula && <p className="mt-1 font-semibold" style={{ color: '#1d4ed8' }}>Formula: <MathText text={formula} /></p>}
          </>
        )}
        {steps.length > 0 && (
          <>
            <ExplSection label="Solution" />
            <div className="rounded-xl overflow-hidden border border-gray-100 mt-1">
              {steps.map((s, i) => {
                const value = typeof s === 'string' ? s : (s.value || s.text || '')
                return (
                  <div key={i} className="px-3.5 py-2 border-b border-gray-50 last:border-0 text-gray-800 font-semibold"
                    style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                    <MathText text={value} />
                  </div>
                )
              })}
            </div>
          </>
        )}
        {cor && (
          <>
            <ExplSection label="Correct Answer" />
            <p>
              <span className="font-bold" style={{ color: '#16a34a' }}>
                Option {cor}{optText(cor) ? ` — ${optText(cor)}` : ''}
              </span>
              {verify && <span className="text-gray-500 ml-1">(<MathText text={verify} />)</span>}
            </p>
          </>
        )}
        {Object.keys(distractors).length > 0 && (
          <>
            <ExplSection label="Why Other Options Are Wrong" />
            <div className="space-y-2">
              {Object.entries(distractors).map(([k, v]) => (
                <p key={k} className="text-gray-700">
                  <span className="font-bold text-gray-900">Option {k}</span>
                  {optText(k) && <span className="font-semibold text-gray-600"> ({optText(k)})</span>}
                  <span className="text-gray-500"> — <MathText text={v} /></span>
                </p>
              ))}
            </div>
          </>
        )}
        {tips.length > 0 && (
          <>
            <ExplSection label="Key Points" />
            <ul className="space-y-0.5 list-disc list-inside text-gray-600">
              {tips.map((t, i) => <li key={i}><MathText text={t} /></li>)}
            </ul>
          </>
        )}
      </div>
    )
  }

  const txt = typeof e === 'string' ? e : (e?.hint || e?.verify || '')
  return (
    <div className="text-[15px] text-gray-700 leading-relaxed">
      {cor && <p className="font-bold mb-2" style={{ color: '#16a34a' }}>Correct Answer: Option {cor}{optText(cor) ? ` — ${optText(cor)}` : ''}</p>}
      {txt ? <p>{txt}</p> : <p className="text-gray-400 italic">A detailed explanation for this question is coming soon.</p>}
    </div>
  )
}

function ShortcutBody({ q }) {
  const e = q?.explanation
  if (!e || typeof e !== 'object' || !e.shortcut) {
    return <p className="text-[15px] text-gray-400 italic">No shortcut available for this question type.</p>
  }
  const sc = e.shortcut
  return (
    <div className="text-[15px] text-gray-700 leading-relaxed space-y-4">
      {sc.title && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
          style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
          <URIcBolt s={12} c='#3b82f6'/> {sc.title}
        </div>
      )}
      {Array.isArray(sc.steps) && sc.steps.length > 0 && (
        <div>
          <ExplSection label="Quick Steps" />
          <ol className="space-y-2.5 mt-1">
            {sc.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#3b82f6' }}>{i + 1}</span>
                <span className="text-gray-700 leading-relaxed">
                  <MathText text={typeof s === 'string' ? s : (s.value || String(s))} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {sc.vs_standard && (
        <div className="rounded-xl px-4 py-3 mt-1" style={{ background: '#f0f9ff', border: '1px solid #bfdbfe' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5 text-blue-600">vs Standard Method</div>
          <p className="text-sm text-blue-900 leading-relaxed"><MathText text={sc.vs_standard} /></p>
        </div>
      )}
      {sc.tip && (
        <div className="rounded-xl px-4 py-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5 text-amber-700">Exam Tip</div>
          <p className="text-sm text-amber-900 italic leading-relaxed"><MathText text={sc.tip} /></p>
        </div>
      )}
    </div>
  )
}

function FormulaList({ rows, startIndex = 1 }) {
  return (
    <ol className="space-y-1.5">
      {rows.map((row, i) => (
        <li key={i} className="flex items-baseline gap-2 text-[15px]">
          <span className="shrink-0 w-5 text-right text-[11px] font-semibold text-gray-400">{startIndex + i}.</span>
          <span className="text-gray-500 shrink-0 min-w-[120px] leading-snug">{row.label}</span>
          <span className="font-mono font-semibold leading-snug" style={{ color: '#3b82f6' }}>{row.expr}</span>
        </li>
      ))}
    </ol>
  )
}

function FormulasBody({ q }) {
  const e = q?.explanation
  const kf = e?.key_formulas
  if (!kf) return <p className="text-[15px] text-gray-400 italic">No formulas available for this question type.</p>
  let counter = 1
  return (
    <div>
      {kf.title && <p className="font-bold text-[15px] mb-3" style={{ color: '#1d4ed8' }}>{kf.title}</p>}
      {Array.isArray(kf.sections)
        ? kf.sections.map((sec, si) => {
            const start = counter; counter += sec.rows.length
            return (
              <div key={si} className="mb-4">
                {sec.heading && <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#3b82f6' }}>{sec.heading}</p>}
                <FormulaList rows={sec.rows} startIndex={start} />
              </div>
            )
          })
        : Array.isArray(kf.rows) && <FormulaList rows={kf.rows} startIndex={1} />
      }
      {kf.note && (
        <div className="mt-3 rounded-xl p-3 text-xs text-amber-900 leading-relaxed" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <span className="font-bold">Note: </span>{kf.note}
        </div>
      )}
    </div>
  )
}

function ExplanationWithTabs({ q }) {
  const [activeTab, setActiveTab] = useState('explanation')
  const e = q?.explanation
  const hasShortcut = e && typeof e === 'object' && e.shortcut
  const hasFormulas = e && typeof e === 'object' && e.key_formulas
  const tabs = [
    { id: 'explanation', label: 'Explanation' },
    ...(hasShortcut ? [{ id: 'alternate', label: 'Alternate Method' }] : []),
    ...(hasFormulas  ? [{ id: 'formulas',  label: 'Key Formulas' }]   : []),
  ]
  return (
    <div>
      {tabs.length > 1 && (
        <div style={{display:'flex',borderBottom:'1px solid #e5e7eb',marginBottom:16}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex:1,padding:'8px 4px',fontSize:11.5,fontWeight:700,
                whiteSpace:'nowrap',textAlign:'center',
                background:'none',cursor:'pointer',
                borderBottom: activeTab===t.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab===t.id ? '#2563eb' : '#9ca3af',
                transition:'all .12s',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {activeTab === 'explanation' && <ExplanationBody q={q} />}
      {activeTab === 'alternate'   && <ShortcutBody   q={q} />}
      {activeTab === 'formulas'    && <FormulasBody   q={q} />}
    </div>
  )
}

/* ── College Fit component ── */
function CollegeFitSection({ score, examType }) {
  if (!score) return <p className="text-xs text-gray-400 text-center py-4">Score data not available.</p>

  const percentile = estimatePercentile(score, examType)
  const isAct = examType === 'act'
  const maxScore = isAct ? 36 : 1600

  return (
    <div className="space-y-3">
      {/* Percentile bar */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 mb-2">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500 font-medium">Your Percentile</span>
          <span className="font-black text-indigo-700">~{percentile}th</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${percentile}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }}/>
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>0th</span><span>50th</span><span>99th</span>
        </div>
      </div>

      {/* Score position on tier scale */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">College Fit by Score</div>
        {COLLEGE_TIERS.map(tier => {
          const [lo, hi] = isAct ? tier.actRange : tier.range
          const isAbove = score >= hi - (isAct ? 1 : 50)
          const isInRange = !isAbove && score >= lo - (isAct ? 2 : 100)
          const isBelow = !isAbove && !isInRange
          const label = isAbove ? 'Safety' : isInRange ? 'Target' : 'Reach'
          const labelColor = isAbove ? '#16a34a' : isInRange ? '#f59e0b' : '#94a3b8'
          const labelBg = isAbove ? '#f0fdf4' : isInRange ? '#fffbeb' : '#f8fafc'
          const barFill = Math.max(0, Math.min(100, isAct
            ? Math.round(((score - 1) / 35) * 100)
            : Math.round(((score - 400) / 1200) * 100)))
          const tierFillLo = isAct
            ? Math.round(((lo - 1) / 35) * 100)
            : Math.round(((lo - 400) / 1200) * 100)
          const tierFillHi = isAct
            ? Math.round(((hi - 1) / 35) * 100)
            : Math.round(((hi - 400) / 1200) * 100)
          return (
            <div key={tier.key} className="rounded-xl border px-3 py-2.5"
              style={{ borderColor: isInRange ? tier.color : '#e5e7eb', background: isInRange ? `${tier.color}0a` : labelBg }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: tier.color }}/>
                  <span className="text-xs font-bold text-gray-800">{tier.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{isAct ? `${lo}–${hi}` : `${lo}–${hi}`}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: labelColor, background: labelBg, border: `1px solid ${labelColor}40` }}>
                    {label}
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute h-full rounded-full opacity-30"
                  style={{ left: `${tierFillLo}%`, width: `${tierFillHi - tierFillLo}%`, background: tier.color }}/>
                <div className="absolute top-0 h-full w-0.5 rounded-full"
                  style={{ left: `${Math.min(barFill, 99)}%`, background: '#1e3a5f' }}/>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">{tier.desc}</div>
            </div>
          )
        })}
      </div>

      <div className="text-[10px] text-gray-400 text-center mt-1">
        Score ranges are typical admission bands. Individual results vary by GPA, essays, and extracurriculars.
      </div>
    </div>
  )
}

/* ── ALL TABS ── */
const ALL_TABS = [
  { id: 'feedback',     label: 'Feedback',      icon: <URIcChart s={13}/>, fullOnly: false },
  { id: 'weak',         label: 'Weak Areas',    icon: <URIcWarn s={13}/>,  fullOnly: true  },
  { id: 'time',         label: 'Time',          icon: <URIcClock s={13}/>, fullOnly: true  },
  { id: 'steps',        label: 'Next Steps',    icon: <URIcArrow s={13}/>, fullOnly: true  },
  { id: 'topics',       label: 'Topics',        icon: <URIcBook s={13}/>,  fullOnly: false },
  { id: 'explanations', label: 'Explanations',  icon: <URIcBulb s={13}/>,  fullOnly: false },
]

/* ── SEC labels for US exams ── */
const SAT_SECTIONS = { ebrw: 'EBRW', math: 'Math', reading_writing: 'Reading & Writing', math_section: 'Math' }
const ACT_SECTIONS = { english: 'English', math: 'Math', reading: 'Reading', science: 'Science' }

/* ══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function USResultScreen({ result, studentName, onRetry, onHome, onStartTest = null, user = null }) {
  const [tab, setTab]         = useState('feedback')
  const [expIdx, setExpIdx]   = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">No result data.</p>
    </div>
  )

  const correct    = result.correct_count    ?? 0
  const wrong      = result.wrong_count      ?? 0
  const skipped    = result.skipped_count    ?? 0
  const pct        = result.percentage       ?? 0
  const readiness  = result.exam_readiness   ?? 0
  const improve    = result.predicted_score_if_fixed ?? 0
  const weakTopics = result.weak_topics      || []
  const strongTopics = result.strong_topics  || []
  const nextSteps  = result.next_steps       || []
  const qResults   = result.question_results || []
  const secStats   = result.section_stats    || {}
  const flags      = result.behaviour_flags  || []
  const timeA      = result.time_analysis    || {}
  const topicR     = result.topic_results    || {}

  const name       = (studentName || 'Student').replace(/\b\w/g, c => c.toUpperCase())
  const isFullMock = (result.test_type ?? 'full') === 'full'
  const sd         = getScoreDisplay(result)
  const examName   = examDisplay(result.exam)

  // Score color
  const scoreColor = sd.type === 'act'
    ? ((sd.composite ?? 0) >= 28 ? '#10b981' : (sd.composite ?? 0) >= 20 ? '#f59e0b' : '#3b82f6')
    : ((sd.composite ?? 0) >= 1200 ? '#10b981' : (sd.composite ?? 0) >= 1000 ? '#f59e0b' : '#3b82f6')

  const ringPct = sd.ring
  const percentile = sd.composite ? estimatePercentile(sd.composite, sd.type) : null

  const TABS = ALL_TABS.filter(t => !t.fullOnly || isFullMock)

  // Section labels
  const SEC_MAP = sd.type === 'act' ? ACT_SECTIONS : SAT_SECTIONS

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      {shareOpen && <ShareModal result={result} studentName={studentName} onClose={() => setShareOpen(false)} />}

      {/* ── HEADER ── */}
      <header style={{ background: '#0f172a' }} className="sticky top-0 z-40 shadow-md">
        <div className="w-full px-3 sm:px-5 h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#3b82f6' }}>
              <span className="text-white font-black text-xs">MT</span>
            </div>
            <div className="leading-none min-w-0">
              <div className="text-white font-bold text-sm truncate">MockTest</div>
              <div className="text-xs hidden sm:block" style={{ color: '#94a3b8' }}>{examName} · Result</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button onClick={onRetry}
              className="text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg text-white border border-white/25 hover:bg-white/10 transition-colors whitespace-nowrap">
              <span className="sm:hidden">Retry</span><span className="hidden sm:inline">Retake Test</span>
            </button>
            <button onClick={() => setShareOpen(true)}
              className="text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg text-white transition-colors shadow-sm whitespace-nowrap"
              style={{ background: '#3b82f6' }}>
              Share
            </button>
            <button onClick={onHome}
              className="text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg text-white border border-white/25 hover:bg-white/10 transition-colors whitespace-nowrap">
              <span className="sm:hidden"><URIcHome s={14} c='#fff'/></span><span className="hidden sm:inline">← Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-col md:flex-row" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-full md:w-52 flex-shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* Nav tabs */}
          <div className="flex md:block overflow-x-auto border-b border-gray-100 p-2 gap-1 md:gap-0">
            {TABS.map(t => {
              const isActive = tab === t.id
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:w-full mb-0 md:mb-0.5 ${
                    isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={isActive ? { background: '#3b82f6' } : {}}>
                  <span className="w-4 text-center text-sm">{t.icon}</span>
                  <span>{t.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0 hidden md:block"/>}
                </button>
              )
            })}
          </div>

          {/* Section accuracy bars */}
          <div className="p-4 hidden md:block">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sections</div>
            {Object.entries(secStats).map(([sec, st]) => {
              const p = st.total > 0 ? Math.round((st.correct || 0) / st.total * 100) : 0
              const ok = p >= 50
              return (
                <div key={sec} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-600 font-medium truncate">{SEC_MAP[sec] || tName(sec)}</span>
                    <span className={`font-bold ${ok ? 'text-green-600' : 'text-red-500'}`}>{p}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: ok ? '#16a34a' : '#ef4444' }}/>
                  </div>
                </div>
              )
            })}

            {/* Section scores (SAT/ACT raw scores if present) */}
            {sd.composite && Object.keys(sd.sections).filter(k => sd.sections[k] != null).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Scores</div>
                {Object.entries(sd.sections).filter(([, v]) => v != null).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs mb-2">
                    <span className="text-gray-600">{k}</span>
                    <span className="font-black text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">

          {/* ── SCORE HERO ── */}
          {tab === 'feedback' && (
            <div className="bg-white border-b border-gray-100 p-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] gap-4 items-stretch">

                {/* Score ring + name */}
                <div className="flex items-center gap-4 min-w-0 rounded-xl border border-gray-200 px-4 py-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef0f3" strokeWidth="4"/>
                      {ringPct > 0 && (
                        <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="4" strokeLinecap="round"
                          stroke={scoreColor}
                          strokeDasharray={`${Math.min(ringPct, 100)} ${100 - Math.min(ringPct, 100)}`}/>
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-black text-gray-900 leading-none">{sd.label}</span>
                      <span className="text-[9px] text-gray-400 leading-none mt-0.5 uppercase tracking-wide">{sd.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-900">
                      {ringPct >= 60 ? 'Well done' : 'Keep going'}, {name}!
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{sd.sublabel}: {sd.label}</div>
                    {percentile && (
                      <div className="text-xs text-indigo-600 font-semibold mb-2">~{percentile}th percentile nationally</div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">✓ {correct} correct</span>
                      <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">✗ {wrong} wrong</span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">— {skipped} skipped</span>
                    </div>
                    <button onClick={() => setShareOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold transition-all"
                      style={{ background: '#25D366' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Share Result
                    </button>
                  </div>
                </div>

                {/* Expert Feedback */}
                {isFullMock && result.ai_feedback ? (
                  <div className="rounded-xl px-4 py-3.5 min-w-0" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid #bfdbfe' }}>
                      <URIcRobot s={12} c='#3b82f6'/>
                      <span className="text-sm font-bold" style={{ color: '#3b82f6' }}>Expert Feedback</span>
                      <span className="text-white px-1.5 py-0.5 rounded-full" style={{ background: '#3b82f6', fontSize: 10 }}>Smart Analysis</span>
                    </div>
                    <p className="line-clamp-4 text-sm text-gray-700 leading-relaxed">
                      {(result.ai_feedback || '').replace(/^[^.]*\.\s*/, '').replace(/You scored[^.]*\.\s*/i, '').trim() || result.ai_feedback}
                    </p>
                  </div>
                ) : <div className="hidden lg:block" />}

                {/* Exam readiness ring */}
                {isFullMock && (
                  <div className="flex flex-row lg:flex-col items-center justify-center gap-2 flex-shrink-0 rounded-xl border border-gray-200 px-4 py-3">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef0f3" strokeWidth="4"/>
                        {readiness > 0 && (
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.min(readiness, 100)} ${100 - Math.min(readiness, 100)}`}/>
                        )}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-black" style={{ color: '#3b82f6' }}>{readiness.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-gray-600">Test Readiness</div>
                      <div className="text-[11px] font-semibold mt-0.5"
                        style={{ color: readiness >= 70 ? '#16a34a' : readiness >= 40 ? '#f59e0b' : '#3b82f6' }}>
                        {readiness >= 70 ? 'Test ready' : readiness >= 40 ? 'Almost there' : 'Needs more prep'}
                      </div>
                      {improve > pct && (
                        <div className="text-[11px] font-bold text-green-600 mt-0.5">
                          Fix weak areas → +{(improve - pct).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 p-4 sm:p-5 space-y-4">

          {/* ══ FEEDBACK TAB ══ */}
          {tab === 'feedback' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* Col 1: Behaviour flags */}
                <Card title="How you approached this test" icon={<URIcBrain s={14}/>}
                  badge={<span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{flags.length} insights</span>}>
                  <div className="space-y-2">
                    {flags.length === 0
                      ? <p className="text-xs text-gray-400">No behaviour data yet.</p>
                      : flags.map((flag, i) => <FlagItem key={i} flag={flag}/>)}
                  </div>
                </Card>

                {/* Col 2: College Fit (full mock) or Topic Breakdown (mini) */}
                {isFullMock ? (
                  <Card title="College Fit Comparison" icon={<URIcGrad s={14}/>}>
                    <CollegeFitSection score={sd.composite} examType={sd.type} />
                  </Card>
                ) : (
                  <Card title="Topic Breakdown" icon={<URIcChart s={14}/>}>
                    <TopicBreakdown questionResults={result.question_results || []} />
                  </Card>
                )}
              </div>

              {/* Section score breakdown (SAT/ACT specific) */}
              {sd.composite && Object.keys(sd.sections).filter(k => sd.sections[k] != null).length > 0 && (
                <Card title={`${sd.type.toUpperCase()} Section Scores`} icon={<URIcChart s={14}/>}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(sd.sections).filter(([, v]) => v != null).map(([k, v]) => {
                      const maxSec = sd.type === 'act' ? 36 : 800
                      const p = Math.round((v / maxSec) * 100)
                      const ok = p >= 50
                      return (
                        <div key={k} className={`rounded-xl border p-3 text-center ${ok ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                          <div className={`text-2xl font-black ${ok ? 'text-green-700' : 'text-amber-700'}`}>{v}</div>
                          <div className="text-xs text-gray-500 mt-1">{k}</div>
                          <div className="text-[10px] text-gray-400">out of {maxSec}</div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ WEAK AREAS TAB ══ */}
          {tab === 'weak' && (
            <div className="space-y-4">
              <RecoBanner>
                {weakTopics.length === 0
                  ? 'No critical weak areas — keep revising your strong topics so they stay automatic under test pressure.'
                  : <>Start with <b>{weakTopics.slice(0, 2).map(w => tName(w.topic)).join(' and ')}</b>. These are the topics most likely to cost you points on test day. Fixing them could add about <b className="text-green-700">+{Math.round(weakTopics.reduce((s, w) => s + (Number(w.exam_impact) || 0), 0))} pts</b> on your next attempt.</>}
              </RecoBanner>
              <Card title="Weak Areas" icon={<URIcWarn s={14}/>}
                badge={<span className="text-xs text-gray-400">{weakTopics.length} topics need attention</span>}>
                {weakTopics.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-8">No critical weak areas!</p>
                  : (
                    <div className="space-y-3">
                      {weakTopics.map((w, i) => {
                        const sc = w.severity || 'moderate'
                        const scCl = sc === 'critical' ? 'bg-red-100 text-red-700' : sc === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <span className="font-bold text-gray-900 text-sm">{tName(w.topic)}</span>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scCl}`}>{sc}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {(w.confidence_label || '').replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs text-gray-400 w-14">Accuracy</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-red-400" style={{ width: `${w.accuracy || 0}%` }}/>
                              </div>
                              <span className="text-xs font-bold text-red-600 w-10 text-right">{fmt(w.accuracy)}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2 leading-relaxed">{w.root_cause}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                +{w.exam_impact} pts if fixed
                              </span>
                              <span className="text-xs text-gray-400 leading-snug">{w.suggested_action}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                {strongTopics.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Strong Topics ✓</div>
                    <div className="grid grid-cols-2 gap-2">
                      {strongTopics.slice(0, 6).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span className="text-xs font-semibold text-green-800">{tName(s.topic)}</span>
                          <span className="text-xs text-green-600 ml-auto">{fmt(s.accuracy)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ══ TIME ANALYSIS TAB ══ */}
          {tab === 'time' && (
            <div className="space-y-4">
              <RecoBanner>
                {(timeA.silly_mistake_count || 0) > 0
                  ? <>You made <b>{timeA.silly_mistake_count} careless error{timeA.silly_mistake_count > 1 ? 's' : ''}</b> — even <b>5–10 extra seconds</b> to double-check prevents these. Target ~<b>60–90s</b> for harder questions and <b>30–45s</b> for straightforward ones.</>
                  : <>Your pacing looks solid. Spend more time on <b>harder question types</b> and move faster through your comfort zones. Always leave <b>2–3 minutes</b> at the end for review.</>}
              </RecoBanner>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Avg per Q',      val: `${(timeA.avg_time_per_q || 0).toFixed(0)}s`, target: '<75s', ok: (timeA.avg_time_per_q || 999) < 75 },
                  { label: 'Careless errors', val: timeA.silly_mistake_count || 0, target: '0', ok: (timeA.silly_mistake_count || 0) === 0 },
                  { label: 'Concept gaps',   val: timeA.concept_gap_count || 0,   target: '0', ok: (timeA.concept_gap_count || 0) === 0 },
                  { label: 'Sunk on skips',  val: `${((timeA.sunk_time || {}).total_sunk_secs || 0).toFixed(0)}s`, target: '0s', ok: ((timeA.sunk_time || {}).total_sunk_secs || 0) < 10 },
                ].map(c => (
                  <div key={c.label} className={`p-4 rounded-xl border ${c.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{c.label}</span>
                      <span className={`text-xs font-bold ${c.ok ? 'text-green-600' : 'text-red-600'}`}>{c.ok ? '✓' : '✗'}</span>
                    </div>
                    <div className={`text-2xl font-black ${c.ok ? 'text-green-700' : 'text-red-700'}`}>{c.val}</div>
                    <div className="text-xs text-gray-400 mt-0.5">target: {c.target}</div>
                  </div>
                ))}
              </div>
              {(timeA.slowest_vs_target || []).length > 0 && (
                <Card title="Slowest topics vs ideal time" icon="⏱">
                  <div className="space-y-3">
                    {timeA.slowest_vs_target.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700">{tName(s.topic)}</span>
                          <span className="text-red-600 font-bold">{s.student_avg}s vs {s.target}s ideal ({s.ratio}x)</span>
                        </div>
                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute h-full bg-red-400 rounded-full"
                            style={{ width: `${Math.min(s.student_avg / 2, 100)}%` }}/>
                          <div className="absolute top-0 h-full border-l-2 border-green-600 border-dashed"
                            style={{ left: `${Math.min(s.target / 2, 100)}%` }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              <Card title="Time distribution">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Fast (<30s)',     val: timeA.fast_count || 0,      color: '#10b981' },
                    { label: 'Normal',          val: timeA.normal_count || 0,    color: '#3b82f6' },
                    { label: 'Slow',            val: timeA.slow_count || 0,      color: '#f59e0b' },
                    { label: 'Very slow (90s+)', val: timeA.very_slow_count || 0, color: '#ef4444' },
                  ].map(c => (
                    <div key={c.label} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-black" style={{ color: c.color }}>{c.val}</div>
                      <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ NEXT STEPS TAB ══ */}
          {tab === 'steps' && (
            <div className="space-y-4">
              <RecoBanner>
                {nextSteps.length > 0
                  ? <>These steps are personalised from your attempt — <b>step 1 is your biggest score lever</b>. Acting on them could lift your score significantly. Clear one weak topic a day, take a practice test every <b>2–3 days</b>, and review every wrong answer in Explanations.</>
                  : <>Review every wrong answer in the Explanations tab and focus on your weakest topics. Consistent daily practice with timed conditions is the fastest path to score improvement.</>}
              </RecoBanner>
              {nextSteps.length > 0 && (
                <Card title="Your Personalised Plan" icon={<URIcArrow s={14}/>}>
                  <div className="space-y-3">
                    {nextSteps.map((step, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: '#3b82f6' }}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 mb-1">{step.action || step.title || `Step ${i + 1}`}</p>
                            {step.reason && <p className="text-xs text-gray-500 leading-relaxed mb-2">{step.reason}</p>}
                            <div className="flex flex-wrap gap-2">
                              {step.priority && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  step.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  step.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-600'}`}>
                                  {step.priority} priority
                                </span>
                              )}
                              {step.score_impact && (
                                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                  +{step.score_impact} pts potential
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {/* SAT/ACT prep tips */}
              <Card title="General Prep Tips" icon={<URIcBook s={14}/>}>
                <div className="space-y-2">
                  {[
                    { icon: <URIcCal s={14} c='#3b82f6'/>, tip: 'Take a full-length timed practice test every week to simulate real conditions.' },
                    { icon: <URIcDoc s={14} c='#3b82f6'/>, tip: 'Review every wrong answer — understand why you got it wrong, not just what the right answer is.' },
                    { icon: <URIcTimer s={14} c='#3b82f6'/>, tip: 'Practice with a stopwatch. Pacing is a skill that must be trained, not hoped for.' },
                    { icon: <URIcBook s={14} c='#3b82f6'/>, tip: 'Build reading stamina with 20-30 min of focused reading daily — especially non-fiction and science articles.' },
                    { icon: <URIcCalc s={14} c='#3b82f6'/>, tip: 'Math: know your formulas cold, then focus on the 10–15 question types that appear most often.' },
                  ].map((t, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="flex-shrink-0 mt-0.5">{t.icon}</span>
                      <p className="text-xs text-blue-900 leading-relaxed">{t.tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ TOPICS TAB ══ */}
          {tab === 'topics' && (
            <div className="space-y-4">
              <Card title="Topic Performance" icon={<URIcBook s={14}/>}>
                <TopicBreakdown questionResults={qResults} />
              </Card>
              {Object.keys(topicR).length > 0 && (
                <Card title="Detailed Topic Results" icon={<URIcChart s={14}/>}>
                  <div className="space-y-3">
                    {Object.entries(topicR).map(([topic, data]) => {
                      const p = data.total > 0 ? Math.round((data.correct || 0) / data.total * 100) : 0
                      const ok = p >= 70
                      return (
                        <div key={topic} className="border border-gray-200 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-800">{tName(topic)}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {p}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p}%`, background: ok ? '#16a34a' : '#ef4444' }}/>
                            </div>
                            <span className="text-xs text-gray-400">{data.correct}/{data.total}</span>
                          </div>
                          {data.subtopics && Object.keys(data.subtopics).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(data.subtopics).map(([sub, sd2]) => {
                                const sp = sd2.total > 0 ? Math.round((sd2.correct || 0) / sd2.total * 100) : 0
                                return (
                                  <span key={sub} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sp >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {tName(sub)}: {sp}%
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ EXPLANATIONS TAB — two-pane UWorld-style viewer ══ */}
          {tab === 'explanations' && (() => {
            if (!qResults.length) return (
              <Card title="Question Explanations" icon={<URIcBulb s={14}/>}>
                <div className="text-center py-10">
                  <div className="mb-3 flex justify-center"><URIcFile s={32} c='#9ca3af'/></div>
                  <div className="text-sm font-bold text-gray-900 mb-1">No question review available for this attempt</div>
                  <div className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                    New attempts are fully reviewable — questions, your answers and step-by-step explanations.
                  </div>
                  <button onClick={onRetry}
                    className="text-white text-sm font-bold px-5 py-2.5 rounded-xl" style={{ background: '#3b82f6' }}>
                    Take a fresh test →
                  </button>
                </div>
              </Card>
            )

            const idx = Math.min(expIdx, qResults.length - 1)
            const q   = qResults[idx]
            // Support both field naming conventions (ResultScreen vs API)
            const st  = q.status || (q.is_correct ? 'correct' : q.given_answer || q.user_answer ? 'wrong' : 'skipped')
            const correctAns = q.correct_answer || q.correct_option || ''
            const givenAns   = q.given_answer   || q.user_answer    || ''
            const qNum       = q.question_number ?? (idx + 1)

            // Passage support (for SAT reading passages embedded in question_text)
            const rawText = q.question_text || q.question || ''
            const passage = rawText.includes('[PASSAGE]')
              ? rawText.split('[PASSAGE]')[1]?.split('[/PASSAGE]')[0]?.trim()
              : ''
            const qLine = rawText.includes('[PASSAGE]')
              ? (rawText.split('[/PASSAGE]')[1]?.trim() || '')
              : rawText

            // Build options array supporting both formats
            const optKeys = ['a','b','c','d','e']
            const optEntries = optKeys.map(k => {
              const val = q[`option_${k}`] ?? (q.options && q.options[k.toUpperCase()])
              return val ? [k.toUpperCase(), val] : null
            }).filter(Boolean)

            return (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-3 items-start">

                  {/* LEFT — passage + question + options */}
                  <Card>
                    {passage && (
                      <div className="mb-4">
                        <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: '#3b82f6' }}><URIcBook s={11} c='#3b82f6'/> Passage</div>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 lg:max-h-[38vh] lg:overflow-y-auto">
                          {passage}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        st === 'correct' ? 'text-green-700 border-green-300 bg-green-50' :
                        st === 'wrong'   ? 'text-red-700 border-red-300 bg-red-50' :
                        'text-gray-500 border-gray-300 bg-gray-50'}`}>
                        Q{qNum} · {st === 'correct' ? 'Correct ✓' : st === 'wrong' ? 'Incorrect ✗' : 'Skipped —'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {tName(q.topic)}{q.difficulty ? ` · ${q.difficulty}` : ''}
                      </span>
                    </div>

                    <ChartQuestion question={q} />
                    <QuestionContent text={qLine} className="mb-4" />

                    <div className="space-y-2">
                      {optEntries.map(([lbl, val]) => {
                        const isCor = correctAns?.toUpperCase() === lbl
                        const isGiv = givenAns?.toUpperCase()   === lbl
                        return (
                          <div key={lbl} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 text-sm ${
                            isCor ? 'bg-green-50 border-green-300' :
                            isGiv && !isCor ? 'bg-red-50 border-red-300' :
                            'bg-white border-gray-200'}`}>
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isCor ? 'bg-green-500 text-white' :
                              isGiv && !isCor ? 'bg-red-500 text-white' :
                              'bg-gray-100 text-gray-600'}`}>{lbl}</span>
                            <span className={`flex-1 ${isCor ? 'text-green-800 font-semibold' : isGiv && !isCor ? 'text-red-700' : 'text-gray-700'}`}>
                              {val}
                            </span>
                            {isCor && <span className="text-xs font-bold text-green-600">Correct</span>}
                            {isGiv && !isCor && <span className="text-xs font-bold text-red-600">Your answer</span>}
                          </div>
                        )
                      })}
                    </div>
                    {q.time_taken && (
                      <p className="text-[11px] text-gray-400 mt-3">Time spent: {q.time_taken}s</p>
                    )}
                  </Card>

                  {/* RIGHT — tabbed explanation + nav */}
                  <Card title="Explanation" icon={<URIcBulb s={14}/>} badge={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setExpIdx(Math.max(0, expIdx - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        disabled={expIdx === 0}
                        className="px-2 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>
                        ← Prev
                      </button>
                      <span className="text-xs text-gray-400 font-medium">{expIdx + 1}/{qResults.length}</span>
                      <button
                        onClick={() => { setExpIdx(Math.min(qResults.length - 1, expIdx + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        disabled={expIdx === qResults.length - 1}
                        className="px-2 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                        style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>
                        Next →
                      </button>
                    </div>
                  }>
                    <ExplanationWithTabs q={q} />
                  </Card>
                </div>

                {/* Quick-jump grid */}
                <div className="mt-3 bg-white border border-gray-100 rounded-2xl p-3" style={{ boxShadow: '0 2px 10px rgba(17,17,17,.05)' }}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Jump to question</div>
                  <div className="flex flex-wrap gap-1.5">
                    {qResults.map((qq, i) => {
                      const s = qq.status || (qq.is_correct ? 'correct' : qq.given_answer || qq.user_answer ? 'wrong' : 'skipped')
                      const active = i === idx
                      return (
                        <button key={i}
                          onClick={() => { setExpIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          title={`Question ${qq.question_number ?? i + 1} · ${s}`}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border-2 transition-all ${
                            active ? 'text-white' :
                            s === 'correct' ? 'bg-green-50 border-green-300 text-green-700' :
                            s === 'wrong'   ? 'bg-red-50 border-red-300 text-red-700' :
                            'bg-gray-50 border-gray-200 text-gray-500'}`}
                          style={active ? { background: '#3b82f6', borderColor: '#3b82f6' } : {}}>
                          {qq.question_number ?? i + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}

          </main>
        </div>
      </div>
    </div>
  )
}
