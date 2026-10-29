import { useState, useEffect } from 'react'
import ChartQuestion from '../components/ChartQuestion'

const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const RSIcMsg    = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const RSIcWarn   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const RSIcArrow  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const RSIcClip   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const RSIcBulb   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
const RSIcChart  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const RSIcTarget = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const RSIcBrain  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.15A3 3 0 0 1 4 11.5a3 3 0 0 1 1.5-2.6 2.5 2.5 0 0 1 4-2.9z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.15A3 3 0 0 0 20 11.5a3 3 0 0 0-1.5-2.6 2.5 2.5 0 0 0-4-2.9z"/></svg>
const RSIcHome   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const RSIcTrophy = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const RSIcRobot  = ({s=12,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><line x1="9" y1="13" x2="9.01" y2="13"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
const RSIcStar   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const RSIcDoc    = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const RSIcBolt   = ({s=12,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const RSIcBook   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const RSIcClock  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const RSIcFile   = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
const RSIcSeat   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 3v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3"/><path d="M4 15v4"/><path d="M20 15v4"/><path d="M8 19h8"/></svg>
import QuestionContent from '../components/QuestionContent'
import { generateMiniTest, generateTest } from '../api.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/* ── KaTeX helpers ── */

// Convert common arithmetic notation found in DI explanations → LaTeX
function _toKaTeX(s) {
  return s
    .replace(/HCF\((\d[\d,]*),(\d[\d,]*)\)(=\d+)?/g,
             (_, a, b, eq) => `\\gcd(${a},${b})${eq || ''}`)
    .replace(/\((\d[\d,]*)\s*\/\s*(\d[\d,]*)\)\s*[×x]\s*(\d+)(\s*=\s*[\d.]+)?/gi,
             (_, a, b, c, eq) => `\\frac{${a}}{${b}} \\times ${c}${eq || ''}`)
    .replace(/(\d[\d,]*)\s*÷\s*(\d[\d,]*)(\s*=\s*[\d.]+)?/g,
             (_, a, b, eq) => `\\frac{${a}}{${b}}${eq || ''}`)
    .replace(/(\d[\d,]*)\s*\/\s*(\d[\d,]*)(\s*=\s*[\d.]+)?/g,
             (_, a, b, eq) => `\\frac{${a}}{${b}}${eq || ''}`)
    .replace(/×/g, '\\times')
    .replace(/\|([^|]{1,40})\|/g, '\\left|$1\\right|')
}

// Pattern that identifies math-like substrings worth rendering
const _MATH_RE = /HCF\(\d[\d,]*,\d[\d,]*\)(?:=\d+)?|\(\d[\d,]*\/\d[\d,]*\)\s*[×x]\s*\d+(?:\s*=\s*[\d.]+)?|\d[\d,]*\s*÷\s*\d[\d,]*(?:\s*=\s*[\d.]+)?|\d[\d,]*\s*\/\s*\d[\d,]*(?:\s*=\s*[\d.]+)?/gi

// Renders text with inline KaTeX for arithmetic patterns; plain text otherwise
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
          const html = katex.renderToString(_toKaTeX(p.val), {
            throwOnError: false, displayMode: false, output: 'html'
          })
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        } catch {
          return <span key={i}>{p.val}</span>
        }
      })}
    </>
  )
}

/* ── helpers ── */
const tName    = t => (t||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
const subLabel = s => (s||'').replace(/\bPct\b/g,'Percentage')

const EXAM_DISPLAY = {
  bank_clerk_prelims:'IBPS Clerk Prelims', bank_clerk_mains:'IBPS Clerk Mains',
  bank_po_prelims:'IBPS PO Prelims',       bank_po_mains:'IBPS PO Mains',
  sbi_clerk_prelims:'SBI Clerk Prelims',   sbi_clerk_mains:'SBI Clerk Mains',
  sbi_po_prelims:'SBI PO Prelims',         sbi_po_mains:'SBI PO Mains',
  rrb_office_assistant_prelims:'RRB Office Assistant Prelims',
  rrb_office_assistant_mains:'RRB Office Assistant Mains',
  rrb_officer_scale1_prelims:'RRB Officer Scale-I Prelims',
  rrb_officer_scale1_mains:'RRB Officer Scale-I Mains',
  rbi_assistant_pre:'RBI Assistant Prelims', rbi_gradeb_p1:'RBI Grade B Phase 1',
  lic_aao_pre:'LIC AAO Prelims',            lic_assistant_pre:'LIC Assistant Prelims',
  niacl_assistant_pre:'NIACL Assistant Prelims', nicl_ao_pre:'NICL AO Prelims',
  coal_india_mt:'Coal India MT',
}
const examDisplay = id => EXAM_DISPLAY[id] || (id||'Mock Test').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())

/* ── WhatsApp share card ── */
function ShareModal({ result, studentName, onClose }) {
  const [copied, setCopied] = useState(false)
  const pct      = result.percentage ?? 0
  const score    = result.score ?? 0
  const maxScore = result.max_score ?? 100
  const correct  = result.correct_count ?? 0
  const wrong    = result.wrong_count ?? 0
  const skipped  = result.skipped_count ?? 0
  const readiness= result.exam_readiness ?? 0
  const examName = examDisplay(result.exam)
  const name     = (studentName || 'Student').replace(/\b\w/g, c => c.toUpperCase())

  const scoreColor = pct >= 60 ? '#10b981' : pct >= 35 ? '#f59e0b' : '#FF653F'
  const grade = pct >= 80 ? 'A+' : pct >= 60 ? 'A' : pct >= 40 ? 'B' : 'C'
  const gradeMsg = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Great Score!' : pct >= 40 ? 'Good Effort' : 'Keep Practising'

  const waText = [
    `🎯 I scored *${pct.toFixed(1)}%* on *${examName}* Mock Test!`,
    ``,
    `✅ ${correct} correct  ❌ ${wrong} wrong  ⏭ ${skipped} skipped`,
    `📊 Marks: ${score.toFixed(1)} / ${maxScore}`,
    readiness ? `🏆 Exam Readiness: ${readiness.toFixed(1)}%` : '',
    ``,
    `Take free mock tests 👉 https://prep.arkaserve.com`,
    `#MockTest #BankingExam #IBPS #SBI #FreeStudy`,
  ].filter(l => l !== null).join('\n')

  const shareWA = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(waText), '_blank', 'noopener')
  }
  const copyText = async () => {
    try { await navigator.clipboard.writeText(waText) } catch { }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ fontFamily:"'Inter',system-ui,sans-serif" }}
      >
        {/* Card — designed to look great when screenshotted */}
        <div style={{ background:'linear-gradient(145deg,#111 0%,#1a1a2e 100%)', padding:'32px 24px 24px' }}>
          {/* Branding */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'#FF653F' }}>
              <span className="text-white font-black text-xs">MT</span>
            </div>
            <span className="text-white/60 text-sm font-semibold">MockTest by Arkaserve</span>
          </div>

          {/* Score ring + grade */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{examName}</div>
              <div className="text-white text-3xl font-black leading-none mb-1">{pct.toFixed(1)}%</div>
              <div className="text-sm font-bold" style={{ color: scoreColor }}>{gradeMsg}</div>
            </div>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3.5"/>
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" strokeLinecap="round"
                  stroke={scoreColor}
                  strokeDasharray={`${Math.min(pct,100)} ${100-Math.min(pct,100)}`}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">{grade}</span>
                <span className="text-white/50 text-[10px]">grade</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label:'Correct', value:correct, color:'#10b981', icon:'✓' },
              { label:'Wrong',   value:wrong,   color:'#ef4444', icon:'✗' },
              { label:'Skipped', value:skipped, color:'#94a3b8', icon:'—' },
            ].map(s => (
              <div key={s.label} className="rounded-xl py-3 text-center" style={{ background:'rgba(255,255,255,.07)' }}>
                <div className="text-xl font-black" style={{ color:s.color }}>{s.value}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Marks + readiness */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-2" style={{ background:'rgba(255,255,255,.07)' }}>
            <div className="text-center">
              <div className="text-white text-lg font-black">{score.toFixed(1)}<span className="text-white/40 text-sm font-medium">/{maxScore}</span></div>
              <div className="text-white/50 text-[10px]">Marks</div>
            </div>
            {readiness > 0 && (
              <div className="text-center">
                <div className="text-lg font-black" style={{ color: readiness>=70?'#10b981':readiness>=40?'#f59e0b':'#FF653F' }}>{readiness.toFixed(0)}%</div>
                <div className="text-white/50 text-[10px]">Exam Readiness</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-white/60 text-[11px] font-semibold">prep.arkaserve.com</div>
              <div className="text-white/30 text-[9px]">Free Mock Tests</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-white p-4 space-y-3">
          <p className="text-xs text-gray-500 text-center">Screenshot the card above, then share it — or share directly:</p>
          <button onClick={shareWA}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-white text-sm transition-all"
            style={{ background:'#25D366' }}
            onMouseOver={e=>e.currentTarget.style.background='#1ebe5e'}
            onMouseOut={e=>e.currentTarget.style.background='#25D366'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Share on WhatsApp
          </button>
          <button onClick={copyText}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            {copied ? '✓ Copied!' : 'Copy text'}
          </button>
          <button onClick={onClose} className="w-full text-xs text-gray-400 py-1 hover:text-gray-600">Close</button>
        </div>
      </div>
    </div>
  )
}
const fmt   = n  => (n??0).toFixed(1)
const SEC   = { english:'English', numerical_ability:'Numerical Ability', reasoning:'Reasoning', quantitative_aptitude:'Quant' }
const CUTOFF_CLS = {
  safe:          {wrap:'border-green-200 bg-green-50',  num:'text-green-600', badge:'✓ Safe Zone'  },
  borderline_high:{wrap:'border-amber-200 bg-amber-50', num:'text-amber-600', badge:'⚠ Close'      },
  borderline_low: {wrap:'border-amber-200 bg-amber-50', num:'text-amber-600', badge:'⚠ Borderline'},
  below:         {wrap:'border-orange-200 bg-orange-50',num:'text-orange-600',badge:'Needs work'   },
  critical:      {wrap:'border-orange-200 bg-orange-50',num:'text-orange-600',badge:'Priority'     },
  failing:       {wrap:'border-orange-200 bg-orange-50',num:'text-orange-600',badge:'Below cut-off'},
  borderline:    {wrap:'border-amber-200 bg-amber-50',  num:'text-amber-600', badge:'⚠ Borderline' },
  passing:       {wrap:'border-green-200 bg-green-50',  num:'text-green-600', badge:'✓ Passing'    },
  no_data:       {wrap:'border-gray-200 bg-gray-50',    num:'text-gray-400',  badge:'—'            },
}
const DIFF_CL = { easy:'bg-green-100 text-green-700', medium:'bg-amber-100 text-amber-700', hard:'bg-red-100 text-red-700' }

/* Visual seating / arrangement diagram for reasoning solutions.
   Reads metadata.arrangement emitted by linear / circular / floor engines. */
function SeatingDiagram({ meta }) {
  const arr = meta?.arrangement
  if (!arr) return null
  const topic = (meta.topic || '').toLowerCase()
  const Seat = ({name, sub}) => (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 bg-white px-3 py-2 whitespace-nowrap"
      style={{ borderColor:'#fec9b0' }}>
      <span className="font-black text-gray-900 text-sm">{name}</span>
      {sub!=null && <span className="text-[10px] text-gray-400 leading-none mt-0.5">{sub}</span>}
    </div>
  )

  // ── CIRCULAR — arrangement is an ordered list around the circle ──
  if (topic.includes('circular') && Array.isArray(arr)) {
    const n = arr.length, R = 110, cx = 160, cy = 160
    return (
      <div className="rounded-2xl border border-gray-200 p-3 mb-4" style={{background:'#FFF8F4'}}>
        <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{color:'#FF653F'}}><RSIcSeat s={11} c='#FF653F'/> Arrangement</div>
        <div className="relative mx-auto" style={{width:320, height:320}}>
          <div className="absolute rounded-full border-2 border-dashed border-gray-300"
            style={{ left:cx-R, top:cy-R, width:2*R, height:2*R }}/>
          <div className="absolute text-[10px] text-gray-400" style={{left:cx-26, top:cy-6}}>facing center</div>
          {arr.map((name,i)=>{
            const ang = (-90 + i*360/n) * Math.PI/180
            const x = cx + R*Math.cos(ang), y = cy + R*Math.sin(ang)
            return <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left:x, top:y}}>
              <Seat name={name} sub={i+1}/>
            </div>
          })}
        </div>
      </div>
    )
  }

  // ── FLOOR — arrangement is {name: floorNumber}, higher = top ──
  if (topic.includes('floor') && !Array.isArray(arr)) {
    const rows = Object.entries(arr).sort((a,b)=>b[1]-a[1])
    return (
      <div className="rounded-2xl border border-gray-200 p-3 mb-4" style={{background:'#FFF8F4'}}>
        <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{color:'#FF653F'}}><RSIcSeat s={11} c='#FF653F'/> Arrangement</div>
        <div className="space-y-1.5">
          {rows.map(([name,fl])=>(
            <div key={name} className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400 w-12 flex-shrink-0">Floor {fl}</span>
              <Seat name={name}/>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── LINEAR / default — arrangement is {name: index}, left → right ──
  const seats = Array.isArray(arr)
    ? arr.map((name,i)=>[name,i])
    : Object.entries(arr).sort((a,b)=>a[1]-b[1])
  return (
    <div className="rounded-2xl border border-gray-200 p-3 mb-4" style={{background:'#FFF8F4'}}>
      <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{color:'#FF653F'}}><RSIcSeat s={11} c='#FF653F'/> Arrangement (facing North ↑)</div>
      <div className="flex items-end gap-2 overflow-x-auto pb-1">
        {seats.map(([name],i)=>(
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <Seat name={name} sub={`#${i+1}`}/>
            <span className="text-base leading-none">↑</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Highlight({text}) {
  if (!text) return null
  const parts = text.split(/(\d+\s*correct|\d+\s*wrong|cut.?off|disqualif\w+|\d+\.?\d*%|priority|recommended|warning)/gi)
  return (
    <p className="text-sm text-gray-700 leading-relaxed">
      {parts.map((p,i)=>{
        if (/\d+\s*correct/i.test(p))      return <strong key={i} className="text-green-700">{p}</strong>
        if (/\d+\s*wrong/i.test(p))        return <strong key={i} className="text-red-600">{p}</strong>
        if (/cut.?off|disqualif/i.test(p)) return <strong key={i} className="text-orange-600">{p}</strong>
        if (/warning/i.test(p))            return <strong key={i} className="text-red-600">{p}</strong>
        if (/priority|recommended/i.test(p)) return <strong key={i} style={{color:"#FF653F"}}>{p}</strong>
        if (/\d+\.?\d*%/.test(p))         return <strong key={i} className="text-indigo-600">{p}</strong>
        return p
      })}
    </p>
  )
}

/* ── Alternate / Shortcut method body ── */
function ShortcutBody({ q }) {
  const e = q?.explanation
  if (!e || typeof e !== 'object' || !e.shortcut) {
    return (
      <p className="text-[15px] text-gray-400 italic">
        No shortcut available for this question type.
      </p>
    )
  }
  const sc = e.shortcut
  return (
    <div className="text-[15px] text-gray-700 leading-relaxed space-y-4">
      {sc.title && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
          style={{ background: '#FFF3EE', color: '#FF653F', border: '1px solid #fec9b0' }}>
          <RSIcBolt s={12} c='#FF653F'/> {sc.title}
        </div>
      )}

      {Array.isArray(sc.steps) && sc.steps.length > 0 && (
        <div>
          <ExplSection label="Quick Steps" />
          <ol className="space-y-2.5 mt-1">
            {sc.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#FF653F' }}>{i + 1}</span>
                <span className="text-gray-700 leading-relaxed">
                  <MathText text={typeof s === 'string' ? s : (s.value || String(s))} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {sc.vs_standard && (
        <div className="rounded-xl px-4 py-3 mt-1"
          style={{ background: '#F0F9FF', border: '1px solid #BFDBFE' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5 text-blue-600">
            vs Standard Method
          </div>
          <p className="text-sm text-blue-900 leading-relaxed">
            <MathText text={sc.vs_standard} />
          </p>
        </div>
      )}

      {sc.tip && (
        <div className="rounded-xl px-4 py-3"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5 text-amber-700">
            Exam Tip
          </div>
          <p className="text-sm text-amber-900 italic leading-relaxed">
            <MathText text={sc.tip} />
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Key Formulas body ── */
/* Render a numbered list of formula rows */
function FormulaList({ rows, startIndex = 1 }) {
  return (
    <ol className="space-y-1.5">
      {rows.map((row, i) => (
        <li key={i} className="flex items-baseline gap-2 text-[15px]">
          <span className="shrink-0 w-5 text-right text-[11px] font-semibold text-gray-400">
            {startIndex + i}.
          </span>
          <span className="text-gray-500 shrink-0 min-w-[120px] leading-snug">{row.label}</span>
          <span className="font-mono font-semibold leading-snug" style={{ color: '#FF653F' }}>
            {row.expr}
          </span>
        </li>
      ))}
    </ol>
  )
}

function FormulasBody({ q }) {
  const e = q?.explanation
  const kf = e?.key_formulas
  if (!kf) return (
    <p className="text-[15px] text-gray-400 italic">No formulas available for this question type.</p>
  )

  // count total rows for continuous numbering across sections
  let counter = 1
  return (
    <div>
      {kf.title && (
        <p className="font-bold text-[15px] mb-3" style={{ color: '#CC3D00' }}>{kf.title}</p>
      )}
      {Array.isArray(kf.sections)
        ? kf.sections.map((sec, si) => {
            const start = counter
            counter += sec.rows.length
            return (
              <div key={si} className="mb-4">
                {sec.heading && (
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: '#FF653F' }}>{sec.heading}</p>
                )}
                <FormulaList rows={sec.rows} startIndex={start} />
              </div>
            )
          })
        : Array.isArray(kf.rows) && <FormulaList rows={kf.rows} startIndex={1} />
      }
      {kf.note && (
        <div className="mt-3 rounded-xl p-3 text-xs text-amber-900 leading-relaxed"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <span className="font-bold">Note: </span>{kf.note}
        </div>
      )}
    </div>
  )
}

/* ── Explanation card with Explanation / Alternate Method / Key Formulas tabs ── */
function ExplanationWithTabs({ q }) {
  const [tab, setTab] = useState('explanation')
  const e = q?.explanation
  const hasShortcut  = e && typeof e === 'object' && e.shortcut
  const hasFormulas  = e && typeof e === 'object' && e.key_formulas

  const tabs = [
    { id: 'explanation', label: 'Explanation' },
    ...(hasShortcut ? [{ id: 'alternate', label: 'Alternate Method' }] : []),
    ...(hasFormulas ? [{ id: 'formulas',  label: 'Key Formulas' }]    : []),
  ]
  const showTabs = tabs.length > 1

  return (
    <div>
      {showTabs && (
        <div className="flex gap-0 mb-4 border-b border-gray-200">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-[15px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-[#FF653F] text-[#FF653F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {tab === 'explanation' && <ExplanationBody q={q} />}
      {tab === 'alternate'   && <ShortcutBody   q={q} />}
      {tab === 'formulas'    && <FormulasBody   q={q} />}
    </div>
  )
}

/* ── Section label — plain text, no box ── */
function ExplSection({ label }) {
  return (
    <p className="text-[12px] font-bold uppercase tracking-widest mt-5 mb-2"
       style={{ color: '#FF653F' }}>
      {label}
    </p>
  )
}

/* ── Main explanation renderer ──
   Teacher-style prose layout — no colored boxes, just clean readable text.
   Handles:
   1. Structured engine dict  { hint, concept, formula, steps, wrong_traps, remember }
   2. Uworldified dict        { approach, formula, steps, correct_reason, distractors, remember_tips }
   3. Plain string fallback
*/
function ExplanationBody({ q }) {
  const e   = q?.explanation
  const cor = q?.correct_answer
  const optText = (lbl) => q?.[`option_${String(lbl).toLowerCase()}`] || ''

  if (e && typeof e === 'object' && !Array.isArray(e)) {
    const concept    = e.approach || e.concept || e.hint || ''
    const formula    = e.formula  || ''
    const steps      = e.steps    || e.working || []
    const verify     = e.correct_reason || e.verify || ''

    const rawDist    = e.distractors || e.wrong_traps || {}
    const distractors = Object.fromEntries(
      Object.entries(rawDist).filter(([k, v]) => v && k !== cor)
    )

    const tips = (
      Array.isArray(e.remember_tips) && e.remember_tips.length ? e.remember_tips :
      Array.isArray(e.remember)      && e.remember.length      ? e.remember :
      e.remember ? [e.remember] : []
    ).filter(Boolean)

    return (
      <div className="text-[15px] text-gray-700 leading-relaxed">

        {/* ── APPROACH ── */}
        {(concept || formula) && (
          <>
            <ExplSection label="Approach" />
            {concept && <p className="text-gray-800"><MathText text={concept} /></p>}
            {formula && (
              <p className="mt-1 font-semibold" style={{ color: '#CC3D00' }}>
                Formula: <MathText text={formula} />
              </p>
            )}
          </>
        )}

        {/* ── SOLUTION ── */}
        {steps.length > 0 && (
          <>
            <ExplSection label="Solution" />
            <div className="rounded-xl overflow-hidden border border-gray-100 mt-1">
              {steps.map((s, i) => {
                const label = typeof s === 'string' ? null : (s.label || null)
                const value = typeof s === 'string' ? s    : (s.value || s.text || '')
                return (
                  <div key={i}
                    className="px-3.5 py-2 border-b border-gray-50 last:border-0 text-gray-800 font-semibold"
                    style={{ background: i % 2 === 0 ? '#FAFAFA' : '#FFFFFF' }}>
                    <MathText text={value} />
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── CORRECT ANSWER ── */}
        {cor && (
          <>
            <ExplSection label="Correct Answer" />
            <p>
              <span className="font-bold" style={{ color: '#16a34a' }}>
                Option {cor}{optText(cor) ? ` — ${optText(cor)}` : ''}
              </span>
              {verify && (
                <span className="text-gray-500 ml-1">
                  (<MathText text={verify} />)
                </span>
              )}
            </p>
          </>
        )}

        {/* ── WHY OTHERS ARE WRONG ── */}
        {Object.keys(distractors).length > 0 && (
          <>
            <ExplSection label="Why Other Options Are Wrong" />
            <div className="space-y-2">
              {Object.entries(distractors).map(([k, v]) => (
                <p key={k} className="text-gray-700">
                  <span className="font-bold text-gray-900">Option {k}</span>
                  {optText(k) && (
                    <span className="font-semibold text-gray-600"> ({optText(k)})</span>
                  )}
                  <span className="text-gray-500"> — <MathText text={v} /></span>
                </p>
              ))}
            </div>
          </>
        )}

        {/* ── TIPS ── */}
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

  // ── plain string fallback ──────────────────────────────────────────
  const txt = typeof e === 'string' ? e : (e?.hint || e?.verify || '')
  return (
    <div className="text-[15px] text-gray-700 leading-relaxed">
      {cor && (
        <p className="font-bold mb-2" style={{ color: '#16a34a' }}>
          Correct Answer: Option {cor}{optText(cor) ? ` — ${optText(cor)}` : ''}
        </p>
      )}
      {txt
        ? <p>{txt}</p>
        : <p className="text-gray-400 italic">A detailed explanation for this question is coming soon.</p>}
    </div>
  )
}

const ALL_TABS = [
  {id:'feedback',     icon:<RSIcMsg s={13}/>,   label:'Feedback',       fullOnly: false},
  {id:'weak',         icon:<RSIcWarn s={13}/>,  label:'Weak Areas',     fullOnly: true },
  {id:'time',         icon:<RSIcClock s={13}/>, label:'Time Analysis',  fullOnly: true },
  {id:'steps',        icon:<RSIcArrow s={13}/>, label:'Next Steps',     fullOnly: true },
  {id:'topics',       icon:<RSIcClip s={13}/>,  label:'All Topics',     fullOnly: false},
  {id:'explanations', icon:<RSIcBulb s={13}/>,  label:'Explanations',   fullOnly: false},
]

const TAB_COLORS = [
  'text-blue-400','text-purple-400','text-rose-400',
  'text-fuchsia-400','text-orange-400','text-yellow-400'
]

function Card({title, icon, badge, children}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      style={{ boxShadow:'0 4px 16px -4px rgba(17,17,17,.08), 0 2px 4px -2px rgba(17,17,17,.04)' }}>
      {title && (
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100" style={{background:'#fafafa'}}>
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className="font-bold text-gray-800 text-sm">{title}</span>
          {badge && <span className="ml-auto">{badge}</span>}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

function TopicBreakdown({ questionResults }) {
  const toLabel = s => s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
  const isGeneric = s => !s || s.toLowerCase().startsWith('pattern_')

  // Group questions by sub_type (descriptive) or fall back to difficulty level
  const groups = {}
  for (const qr of questionResults) {
    const sub = qr.metadata?.sub_type
    const key = isGeneric(sub) ? `${(qr.difficulty||'medium')} level` : sub
    if (!groups[key]) groups[key] = { correct: 0, total: 0 }
    groups[key].total++
    if (qr.status === 'correct') groups[key].correct++
  }

  const strong = [], weak = []
  for (const [key, g] of Object.entries(groups)) {
    const pct = g.total ? g.correct / g.total : 0
    const item = { label: toLabel(key), correct: g.correct, total: g.total, pct }
    if (pct >= 0.6) strong.push(item)
    else weak.push(item)
  }

  if (strong.length === 0 && weak.length === 0)
    return <p className="text-xs text-gray-400 text-center py-4">No sub-topic data available.</p>

  const Row = ({item, isStrong}) => (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs" style={{color: isStrong ? '#16a34a' : '#dc2626'}}>{isStrong ? '✓' : '✗'}</span>
      <span className="text-xs text-gray-700 flex-1 leading-snug">{item.label}</span>
      <span className="text-[11px] font-semibold shrink-0"
        style={{color: isStrong ? '#16a34a' : '#dc2626'}}>
        {item.correct}/{item.total}
      </span>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-1.5">
          Strong ✓
        </div>
        {strong.length > 0
          ? strong.map((it,i) => <Row key={i} item={it} isStrong />)
          : <p className="text-xs text-gray-400 italic">None yet — keep practising!</p>}
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-red-600 mb-1.5">
          Needs Work ✗
        </div>
        {weak.length > 0
          ? weak.map((it,i) => <Row key={i} item={it} isStrong={false} />)
          : <p className="text-xs text-gray-400 italic">All sub-topics looking good!</p>}
      </div>
    </div>
  )
}

function FlagItem({flag}) {
  // Split a leading emoji if present; otherwise keep the full sentence.
  const m    = (flag||'').match(/^(\p{Extended_Pictographic}[️]?)\s*([\s\S]*)$/u)
  const icon = m ? m[1] : '•'
  const text = m ? m[2] : (flag||'')
  // Colour by sentiment so the boxes read at a glance.
  const low = text.toLowerCase()
  const neg = /(below|prioritise|wrong|skipped|run out|lost focus|disqualif|warning|weak|needs|slow|rushed|guess|fail)/.test(low)
  const pos = /(great|strong|well done|excellent|on track|good|nicely|consistent|accuracy|kept|steady|impressive)/.test(low)
  const tone = neg ? {c:'#dc2626', bg:'#fef2f2', bd:'#fecaca'}
             : pos ? {c:'#16a34a', bg:'#f0fdf4', bd:'#bbf7d0'}
                   : {c:'#FF653F', bg:'#FFF3EE', bd:'#fed7c2'}
  const split = text.match(/^(.+?[.:])\s*([\s\S]*)$/)
  const head  = split ? split[1].replace(/[.:]$/,'') : text
  const rest  = split ? split[2] : ''
  return (
    <div className="flex gap-3 px-4 py-3 rounded-2xl border hover:shadow-sm transition-all"
      style={{ background:tone.bg, borderColor:tone.bd, borderLeftColor:tone.c, borderLeftWidth:4 }}>
      <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-white shadow-sm"
        style={{ color:tone.c }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-bold leading-snug" style={{ color:tone.c }}>{head}</div>
        {rest && <div className="text-[11px] text-gray-600 leading-snug mt-0.5">{rest}</div>}
      </div>
    </div>
  )
}

/* Compact tile for a single behaviour insight — scannable at a glance.
   Uses the leading sentence (before . or :) as a bold headline. */
function FlagBox({flag}) {
  const m    = (flag||'').match(/^(\p{Extended_Pictographic}[️]?)\s*([\s\S]*)$/u)
  const icon = m ? m[1] : '•'
  const body = m ? m[2] : (flag||'')
  const split = body.match(/^(.+?[.:])\s*([\s\S]*)$/)
  const head = split ? split[1].replace(/[.:]$/,'') : body
  const rest = split ? split[2] : ''
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 flex flex-col gap-1.5">
      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background:'#FFF3EE', color:'#FF653F' }}>{icon}</span>
      <span className="text-xs font-bold text-gray-900 leading-snug">{head}</span>
      {rest && <span className="text-[11px] text-gray-500 leading-snug">{rest}</span>}
    </div>
  )
}

/* Highlighted "what to do next" banner shown at the top of analysis tabs. */
function RecoBanner({ children }) {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
      style={{ background:'#FFF9F7', border:'1px solid #fed7c2', borderLeft:'4px solid #FF653F' }}>
      <span className="flex-shrink-0 mt-0.5"><RSIcBulb s={18} c='#FF653F'/></span>
      <p className="text-sm text-gray-700 leading-relaxed">
        <b style={{ color:'#FF653F' }}>Tip: </b>{children}
      </p>
    </div>
  )
}

/* ══ MAIN COMPONENT ══ */
export default function ResultScreen({ result, studentName, onRetry, onHome, onStartTest = null, user = null }) {
  const [tab, setTab] = useState('feedback')
  const [expIdx, setExpIdx] = useState(0)   // selected question in the Explanations viewer
  const [shareOpen, setShareOpen] = useState(false)
  const [ringFill, setRingFill] = useState(0)   // animated ring: 0 → pct

  // Animate score ring: start at 0, fill to actual pct after 300ms
  const pctForRing = result?.percentage ?? 0
  useEffect(() => {
    const t = setTimeout(() => setRingFill(pctForRing), 300)
    return () => clearTimeout(t)
  }, [pctForRing])

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">No result data.</p>
    </div>
  )

  const correct    = result.correct_count          ?? 0
  const wrong      = result.wrong_count            ?? 0
  const skipped    = result.skipped_count          ?? 0
  const score      = result.score                  ?? 0
  const maxScore   = result.max_score              ?? 100
  const pct        = result.percentage             ?? 0
  const readiness  = result.exam_readiness         ?? 0
  const improve    = result.predicted_score_if_fixed ?? 0
  const weakTopics = result.weak_topics            || []
  const strongTopics=result.strong_topics          || []
  const nextSteps  = result.next_steps             || []
  const [stepLoading, setStepLoading] = useState(null)  // index of step being launched

  const launchNextStep = async (step, idx) => {
    if (!onStartTest) return
    const p = step.mini_test_params || {}
    setStepLoading(idx)
    try {
      let data
      if (p.mode === 'mock' || step.type === 'full_test') {
        data = await generateTest(studentName, p.exam_id || 'bank_clerk_prelims')
      } else {
        const sec   = p.section || 'numerical_ability'
        const topic = p.pre_selected_topic || 'all'
        const diff  = user?.id ? 'adaptive' : (p.difficulty || 'mixed')
        data = await generateMiniTest(sec, topic, p.question_count || 10, diff, user?.id || null)
      }
      onStartTest(data)
    } catch (e) {
      console.error('Failed to launch next step:', e)
    } finally {
      setStepLoading(null)
    }
  }
  const qResults   = result.question_results       || []
  const secStats   = result.section_stats          || {}
  const flags      = result.behaviour_flags        || []
  const cutoffSt   = result.section_cutoff_status  || {}
  const timeA      = result.time_analysis          || {}
  const peer       = result.peer_comparison        || null
  const topicR     = result.topic_results          || {}
  const name       = (studentName || 'Student').replace(/\b\w/g, c => c.toUpperCase())
  const isFullMock    = (result.test_type ?? 'full') === 'full'
  const isDiagnostic  = result.test_type === 'topic_diagnostic'

  // Rank data from peer comparison (full mock only)
  const peerPct    = peer?.peer_percentile || null
  const rankNum    = peerPct?.rank         || null
  const rankTotal  = peerPct?.total_candidates || null

  // Difficulty progression data (mini tests only)
  const curDiff     = result.current_difficulty  || null
  const nextDiff    = result.next_difficulty     || null
  const levelUp     = result.level_up            || false
  const levelMsg    = result.level_message       || null
  const DIFF_BADGE  = { easy: {label:'Easy', bg:'#e8f5e9', color:'#2e7d32'}, medium: {label:'Medium', bg:'#fff8e1', color:'#f57f17'}, hard: {label:'Hard', bg:'#fce4ec', color:'#c62828'} }

  /* ── PDF GENERATION ── */
  const generatePDF = () => {
    const examName  = examDisplay(result.exam)
    const now       = new Date()
    const dateStr   = now.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })
    const timeStr   = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
    const pctColor  = pct >= 60 ? '#16a34a' : pct >= 35 ? '#d97706' : '#dc2626'
    const grade     = pct >= 80 ? 'A+' : pct >= 60 ? 'A' : pct >= 40 ? 'B' : 'C'

    const secRows = Object.entries(secStats).map(([sec, st]) => {
      const p       = st.total > 0 ? ((st.correct || 0) / st.total * 100).toFixed(1) : '0.0'
      const timeMins= st.time_ms ? (st.time_ms / 60000).toFixed(1) : '—'
      const lbl     = getSectionLabel(sec)
      const ok      = parseFloat(p) >= 35
      return `<tr>
        <td>${lbl}</td>
        <td class="num">${st.total || 0}</td>
        <td class="num green">${st.correct || 0}</td>
        <td class="num red">${st.wrong || 0}</td>
        <td class="num gray">${st.skipped || 0}</td>
        <td class="num"><span class="${ok ? 'tag-green' : 'tag-red'}">${p}%</span></td>
        <td class="num">${timeMins} min</td>
      </tr>`
    }).join('')

    const toLabel = t => typeof t === 'string' ? t : (t.topic || t.name || '')
    const strongRows = strongTopics.slice(0, 10).map(t =>
      `<li class="topic-item strong">✓ ${toLabel(t)}</li>`
    ).join('') || '<li class="topic-item gray">Keep practising!</li>'
    const weakRows = weakTopics.slice(0, 10).map(t =>
      `<li class="topic-item weak">↑ ${toLabel(t)}</li>`
    ).join('') || '<li class="topic-item gray">No weak topics identified</li>'
    const flagsHtml = flags.slice(0, 8).map(f =>
      `<li class="flag-item">${typeof f === 'string' ? f : (f.message || '')}</li>`
    ).join('')
    const stepsHtml = nextSteps.slice(0, 5).map((s, i) =>
      `<li class="step-item"><span class="step-num">${i + 1}</span>${typeof s === 'string' ? s : (s.title || s.description || '')}</li>`
    ).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Score Report — ${name} — ${examName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;color:#1a1a2e;font-size:13px;line-height:1.5;background:#fff}
.lh{background:linear-gradient(135deg,#111 0%,#1a1a2e 100%);color:#fff;padding:26px 36px 22px;display:flex;justify-content:space-between;align-items:flex-start}
.lh-left{display:flex;align-items:center;gap:14px}
.lh-badge{width:52px;height:52px;border-radius:14px;background:#FF653F;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;letter-spacing:-1px;flex-shrink:0;line-height:1}
.lh-name{font-size:20px;font-weight:800;letter-spacing:-0.5px}
.lh-sub{font-size:11px;color:rgba(255,255,255,.5);margin-top:3px}
.lh-url{font-size:11px;color:#FF653F;margin-top:5px;font-weight:700}
.lh-right{text-align:right}
.lh-doc{font-size:14px;font-weight:700;color:rgba(255,255,255,.85)}
.lh-meta{font-size:10.5px;color:rgba(255,255,255,.4);margin-top:4px}
.accent-bar{height:4px;background:linear-gradient(90deg,#FF653F 0%,#ff9c7a 55%,transparent 100%)}
.cand-bar{background:#FFF3EE;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #fde8d8}
.cand-name{font-size:16px;font-weight:800;color:#1a1a2e}
.cand-exam{font-size:12px;color:#666;margin-top:2px}
.cand-right{text-align:right;font-size:11px;color:#888}
.grade-badge{display:inline-block;padding:4px 14px;border-radius:20px;font-weight:900;font-size:15px;background:#FF653F;color:#fff;margin-bottom:4px}
.s-wrap{padding:22px 36px;border-bottom:1px solid #f0f0f0}
.s-head{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.s-head::after{content:'';flex:1;height:1px;background:#e5e5e5}
.score-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.tile{border-radius:12px;padding:14px 10px;text-align:center;border:1.5px solid #e5e7eb}
.tile .v{font-size:22px;font-weight:900;letter-spacing:-1px}
.tile .l{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-top:3px}
.t-pct{border-color:#fed7c2;background:#FFF3EE} .t-pct .v{color:${pctColor}}
.t-scr .v{color:#1a1a2e}
.t-ok{border-color:#bbf7d0;background:#f0fdf4} .t-ok .v{color:#16a34a}
.t-wr{border-color:#fecaca;background:#fef2f2} .t-wr .v{color:#dc2626}
.t-rd{border-color:#bfdbfe;background:#eff6ff} .t-rd .v{color:#2563eb}
.t-sk .v{color:#888}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#111;color:#fff;padding:9px 12px;text-align:left;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
th.num{text-align:center}
td{padding:9px 12px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
td.num{text-align:center;font-variant-numeric:tabular-nums}
td.green{color:#16a34a;font-weight:700} td.red{color:#dc2626;font-weight:700} td.gray{color:#888}
tr:nth-child(even) td{background:#fafafa}
.tag-green{background:#dcfce7;color:#16a34a;padding:2px 9px;border-radius:20px;font-weight:700;font-size:11px}
.tag-red{background:#fee2e2;color:#dc2626;padding:2px 9px;border-radius:20px;font-weight:700;font-size:11px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:20px 36px;border-bottom:1px solid #f0f0f0}
.topic-list{list-style:none;display:flex;flex-direction:column;gap:5px}
.topic-item{padding:7px 12px;border-radius:8px;font-size:11.5px;font-weight:500;border:1px solid}
.topic-item.strong{background:#f0fdf4;border-color:#bbf7d0;color:#166534}
.topic-item.weak{background:#fff7ed;border-color:#fed7aa;color:#9a3412}
.topic-item.gray{background:#f9fafb;border-color:#e5e7eb;color:#9ca3af;font-style:italic}
.flag-list{list-style:none;display:flex;flex-direction:column;gap:6px}
.flag-item{padding:8px 12px 8px 14px;border-radius:8px;font-size:12px;background:#FFF3EE;border-left:3px solid #FF653F;color:#444;line-height:1.5}
.step-list{list-style:none;display:flex;flex-direction:column;gap:8px}
.step-item{display:flex;align-items:flex-start;gap:10px;font-size:12px;color:#444;line-height:1.5}
.step-num{width:22px;height:22px;border-radius:50%;background:#FF653F;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:10px;flex-shrink:0;margin-top:1px}
.footer{background:#111;color:rgba(255,255,255,.4);font-size:10px;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.footer-brand{color:#FF653F;font-weight:700;font-size:11px}
@media print{
  body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{margin:0;size:A4}
}
</style>
</head>
<body>

<div class="lh">
  <div class="lh-left">
    <div class="lh-badge">AS</div>
    <div>
      <div class="lh-name">ArkaServe</div>
      <div class="lh-sub">MockTest Platform · Banking Exam Preparation</div>
      <div class="lh-url">prep.arkaserve.com</div>
    </div>
  </div>
  <div class="lh-right">
    <div class="lh-doc">Official Score Report</div>
    <div class="lh-meta">${dateStr} at ${timeStr}</div>
    <div class="lh-meta" style="margin-top:4px;font-size:9.5px;color:rgba(255,255,255,.2)">For personal study use only · Not for submission to IBPS / SBI</div>
  </div>
</div>
<div class="accent-bar"></div>

<div class="cand-bar">
  <div>
    <div class="cand-name">${name}</div>
    <div class="cand-exam">${examName}</div>
  </div>
  <div class="cand-right">
    <div class="grade-badge">${grade}</div>
    <div>${dateStr}</div>
  </div>
</div>

<div class="s-wrap">
  <div class="s-head">Score Summary</div>
  <div class="score-grid">
    <div class="tile t-pct"><div class="v">${pct.toFixed(1)}%</div><div class="l">Percentage</div></div>
    <div class="tile t-scr"><div class="v">${score.toFixed(1)}<span style="font-size:13px;font-weight:500;color:#aaa">/${maxScore}</span></div><div class="l">Marks</div></div>
    <div class="tile t-ok"><div class="v">${correct}</div><div class="l">Correct</div></div>
    <div class="tile t-wr"><div class="v">${wrong}</div><div class="l">Wrong</div></div>
    ${readiness > 0
      ? `<div class="tile t-rd"><div class="v">${readiness.toFixed(0)}%</div><div class="l">Exam Readiness</div></div>`
      : `<div class="tile t-sk"><div class="v">${skipped}</div><div class="l">Skipped</div></div>`}
  </div>
</div>

${secRows ? `<div class="s-wrap">
  <div class="s-head">Section-wise Performance</div>
  <table>
    <thead><tr>
      <th>Section</th><th class="num">Total</th><th class="num">Correct</th>
      <th class="num">Wrong</th><th class="num">Skipped</th>
      <th class="num">Accuracy</th><th class="num">Time</th>
    </tr></thead>
    <tbody>${secRows}</tbody>
  </table>
</div>` : ''}

<div class="two-col">
  <div>
    <div class="s-head">Strong Topics</div>
    <ul class="topic-list">${strongRows}</ul>
  </div>
  <div>
    <div class="s-head">Weak Topics — Prioritise</div>
    <ul class="topic-list">${weakRows}</ul>
  </div>
</div>

${flagsHtml ? `<div class="s-wrap">
  <div class="s-head">AI Performance Insights</div>
  <ul class="flag-list">${flagsHtml}</ul>
</div>` : ''}

${stepsHtml ? `<div class="s-wrap">
  <div class="s-head">Recommended Next Steps</div>
  <ul class="step-list">${stepsHtml}</ul>
</div>` : ''}

<div class="footer">
  <div><span class="footer-brand">ArkaServe MockTest</span> · Results are AI-engine scored and intended for personal study use only.</div>
  <div>prep.arkaserve.com</div>
</div>

<script>window.onload=function(){window.print()}<\/script>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      alert('Popup blocked. Please allow popups for prep.arkaserve.com and try again.')
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  // Only show analysis tabs for full mock tests
  const TABS = ALL_TABS.filter(t =>
    (!t.fullOnly || isFullMock) &&
    !(isDiagnostic && (t.id === 'topics' || t.id === 'time'))
  )

  return (
    <div className="min-h-screen bg-[#ffffff]" style={{fontFamily:"'Inter',system-ui,sans-serif"}}>
      {shareOpen && <ShareModal result={result} studentName={studentName} onClose={() => setShareOpen(false)} />}

      {/* ── HEADER ── */}
      <header style={{background:'#111'}}
        className="sticky top-0 z-40 shadow-md">
        <div className="w-full px-3 sm:px-5 h-14 flex items-center justify-between gap-2 sm:gap-4">

          {/* LEFT — brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:'#FF653F'}}>
              <span className="text-white font-black text-xs">MT</span>
            </div>
            <div className="leading-none min-w-0">
              <div className="text-white font-bold text-sm truncate">MockTest</div>
              <div className="text-xs hidden sm:block" style={{color:'#888'}}>IBPS / SBI · Result Analysis</div>
            </div>
          </div>

          {/* RIGHT — actions (labels condense on mobile so Dashboard always fits) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button onClick={generatePDF}
              className="text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg text-white border border-white/25 hover:bg-white/10 transition-colors whitespace-nowrap">
              <span className="sm:hidden">PDF</span><span className="hidden sm:inline">Download PDF</span>
            </button>
            {onStartTest && weakTopics.length > 0 && (
              <button
                onClick={() => launchNextStep({ mini_test_params: { pre_selected_topic: weakTopics[0], section: 'numerical_ability', question_count: 15 } }, -1)}
                disabled={stepLoading === -1}
                className="text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg text-white transition-colors shadow-sm whitespace-nowrap disabled:opacity-60"
                style={{background:'#7c3aed'}}
                onMouseOver={e=>{ if(stepLoading !== -1) e.currentTarget.style.background='#6d28d9' }}
                onMouseOut={e=>e.currentTarget.style.background='#7c3aed'}>
                {stepLoading === -1 ? '…' : <><span className="sm:hidden">Retry</span><span className="hidden sm:inline">Practice Wrong Topics</span></>}
              </button>
            )}
            <button onClick={onRetry}
              className="text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg text-white transition-colors shadow-sm whitespace-nowrap"
              style={{background:'#FF653F'}}
              onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
              onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
              <span className="sm:hidden">New</span><span className="hidden sm:inline">Take Another Test</span>
            </button>
            <button onClick={onHome}
              className="text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg text-white border border-white/25 hover:bg-white/10 transition-colors whitespace-nowrap">
              <span className="sm:hidden"><RSIcHome s={13} c='#fff'/></span><span className="hidden sm:inline">← Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY: full-height sidebar + right column ── */}
      <div className="flex flex-col md:flex-row" style={{height:'calc(100vh - 64px)'}}>

        {/* ── LEFT SIDEBAR (full height) ── */}
        <aside className="w-full md:w-52 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col overflow-y-auto" style={{background:'#fafafa'}}>

          {/* Nav tabs */}
          <div className="flex md:block overflow-x-auto border-b border-gray-100 p-2 gap-1 md:gap-0">
            {TABS.map((t)=>{
              const isActive = tab === t.id
              return (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:w-full mb-0 md:mb-0.5 ${
                    isActive ? 'text-white' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                  style={isActive ? {background:'#FF653F', boxShadow:'0 2px 8px rgba(255,101,63,.35)'} : {}}>
                  <span className="w-4 text-center text-sm">{t.icon}</span>
                  <span>{t.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0 hidden md:block"/>}
                </button>
              )
            })}
          </div>

          {/* Section accuracy bars */}
          <div className="p-4 hidden md:block">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Section Performance</div>
            {Object.entries(secStats).map(([sec,st])=>{
              const p = st.total>0 ? Math.round((st.correct||0)/st.total*100) : 0
              const need = cutoffSt[sec]?.cutoff
              const ok   = need!=null ? p>=need : p>=35
              return (
                <div key={sec} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-semibold truncate">{SEC[sec]||sec}</span>
                    <span className={`font-bold text-xs ${ok?'text-green-600':'text-red-500'}`}>{p}%</span>
                  </div>
                  {need!=null && (
                    <div className="text-[10px] mb-1" style={{color: ok?'#16a34a':'#ef4444'}}>
                      {ok?'✓ above':'↓ below'} cut-off (~{need}%)
                    </div>
                  )}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${p}%`, background:ok?'#10b981':'#ef4444'}}/>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{st.correct||0}/{st.total||0} correct</div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── RIGHT COLUMN: hero + scrolling content ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto nice-scroll" style={{background:'#f5f6f8'}}>

          {/* ── SCORE HERO — always first on the Feedback tab ── */}
          {tab==='feedback' && (
          <div className="border-b border-gray-100 p-4" style={{background:'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)'}}>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,0.85fr)] gap-3 items-stretch">

              {/* Score ring + name + stats */}
              <div className="flex items-center gap-4 min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3.5" style={{boxShadow:'0 2px 8px rgba(17,17,17,.06)'}}>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef0f3" strokeWidth="3.5"/>
                    {pct > 0 && (
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" strokeLinecap="round"
                        stroke={pct>=60?"#10b981":pct>=35?"#f59e0b":"#ef4444"}
                        strokeDasharray={`${Math.min(ringFill,100)} ${100-Math.min(ringFill,100)}`}
                        style={{transition:'stroke-dasharray 1s ease-out'}}/>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black leading-none" style={{color: pct>=60?'#10b981':pct>=35?'#d97706':'#ef4444'}}>{pct.toFixed(0)}%</span>
                    <span className="text-[9px] text-gray-400 leading-none mt-0.5 uppercase tracking-wider">score</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-black text-gray-900 leading-tight truncate">
                    {pct>=60?'Well done':'Keep going'}, {name}!
                  </div>
                  <div className="text-sm mb-2 mt-0.5">
                    <span className="font-black text-gray-800">{score.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs"> / {maxScore} marks</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">✓ {correct} correct</span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">✗ {wrong} wrong</span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">— {skipped} skipped</span>
                  </div>
                  {isFullMock && rankNum && rankTotal && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
                      style={{background:'linear-gradient(135deg,#FF653F,#cc3d00)'}}>
                      <RSIcTrophy s={14} c='#fff'/>
                      <span>Rank #{rankNum} of {rankTotal} students</span>
                    </div>
                  )}
                  <button onClick={() => setShareOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold transition-all"
                    style={{ background:'#25D366' }}
                    onMouseOver={e=>e.currentTarget.style.background='#1ebe5e'}
                    onMouseOut={e=>e.currentTarget.style.background='#25D366'}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Share Result
                  </button>
                  {!isFullMock && curDiff && DIFF_BADGE[curDiff] && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{background: DIFF_BADGE[curDiff].bg, color: DIFF_BADGE[curDiff].color}}>
                        Level: {DIFF_BADGE[curDiff].label}
                      </span>
                      {nextDiff && nextDiff !== curDiff && DIFF_BADGE[nextDiff] && (
                        <span className="text-xs text-gray-400">
                          → Next: <span style={{color: DIFF_BADGE[nextDiff].color}}>{DIFF_BADGE[nextDiff].label}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expert Feedback — CENTER (full mock only) */}
              {isFullMock && result.ai_feedback ? (
                <div className="rounded-2xl min-w-0 overflow-hidden" style={{background:'#FFFAF7', border:'1px solid #fde8d8', boxShadow:'0 2px 8px rgba(17,17,17,.06)'}}>
                  <div className="flex items-center gap-2 px-4 py-3" style={{background:'#FFF3EE', borderBottom:'1px solid #fde8d8'}}>
                    <RSIcRobot s={13} c='#FF653F'/>
                    <span className="text-sm font-bold" style={{color:'#FF653F'}}>Expert Feedback</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto" style={{background:'#fff', color:'#FF653F', border:'1px solid #fec9b0'}}>AI Analysis</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 leading-relaxed" style={{maxHeight:130, overflowY:'auto'}}>
                    <Highlight text={
                      (result.ai_feedback||'')
                        .replace(/^[^.]*\.\s*/, '')
                        .replace(/You scored[^.]*\.\s*/i, '')
                        .trim() || result.ai_feedback
                    }/>
                  </div>
                </div>
              ) : null}

              {/* Readiness ring — RIGHT (full mock only) */}
              {!isFullMock ? null :
              <div className="flex flex-row lg:flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5" style={{boxShadow:'0 2px 8px rgba(17,17,17,.06)'}}>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef0f3" strokeWidth="3.5"/>
                    {readiness > 0 && (
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke={readiness>=70?'#10b981':readiness>=40?'#f59e0b':'#ef4444'}
                        strokeDasharray={`${Math.min(readiness,100)} ${100-Math.min(readiness,100)}`}/>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black leading-none" style={{color: readiness>=70?'#10b981':readiness>=40?'#d97706':'#ef4444'}}>{readiness.toFixed(0)}%</span>
                    <span className="text-[9px] text-gray-400 leading-none mt-0.5 uppercase tracking-wider">ready</span>
                  </div>
                </div>
                <div className="text-center lg:text-center">
                  <div className="text-xs font-bold text-gray-600 mb-0.5">Exam Readiness</div>
                  <div className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{ color: readiness>=70?'#16a34a':readiness>=40?'#d97706':'#dc2626',
                      background: readiness>=70?'#f0fdf4':readiness>=40?'#fffbeb':'#fef2f2' }}>
                    {readiness>=70 ? 'Exam ready' : readiness>=40 ? 'Almost there' : 'Needs work'}
                  </div>
                  {improve > pct && (
                    <div className="text-[11px] font-semibold text-green-600 mt-1.5 whitespace-nowrap">
                      Fix topics → +{(improve-pct).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>}

            </div>
          </div>
          )}

          {/* ── LEVEL-UP / LEVEL FEEDBACK BANNER — mini tests only ── */}
          {!isFullMock && tab === 'feedback' && levelMsg && (
            <div className="mx-4 mt-4 mb-0 rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
              style={{background: levelUp ? '#f0fdf4' : '#fff8e1', border: levelUp ? '1px solid #86efac' : '1px solid #fcd34d'}}>
              <span className="mt-0.5">{levelUp ? <RSIcStar s={18} c='#16a34a'/> : <RSIcArrow s={18} c='#b45309'/>}</span>
              <div>
                <p className="font-bold text-gray-800 mb-0.5">{levelUp ? 'Level Up!' : 'Keep Going!'}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{levelMsg}</p>
              </div>
            </div>
          )}

          {/* ── TOPIC DIAGNOSTIC VERDICT ── */}
          {isDiagnostic && result.topic_diagnostic && tab === 'feedback' && (() => {
            const td = result.topic_diagnostic
            const topicLabel = (td.topic||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
            const bands = [
              { label:'Easy',   acc:td.easy_accuracy,   count:td.easy_count,   color:'#16a34a', bg:'#f0fdf4', border:'#86efac' },
              { label:'Medium', acc:td.medium_accuracy, count:td.medium_count, color:'#d97706', bg:'#fffbeb', border:'#fcd34d' },
              { label:'Hard',   acc:td.hard_accuracy,   count:td.hard_count,   color:'#dc2626', bg:'#fff5f5', border:'#fca5a5' },
            ]
            return (
              <div className="mx-4 mt-4 space-y-3">
                {/* Level badge removed — level label not needed */}
                {/* Difficulty accuracy bars */}
                <div className="grid grid-cols-3 gap-2">
                  {bands.map(b => (
                    <div key={b.label} className="rounded-xl border p-3 text-center"
                      style={{background: b.bg, borderColor: b.border}}>
                      <div className="text-xs font-bold mb-1" style={{color: b.color}}>{b.label}</div>
                      <div className="text-xl font-black" style={{color: b.color}}>
                        {b.acc != null ? `${b.acc}%` : '—'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{b.count} question{b.count!==1?'s':''}</div>
                      {b.acc != null && (
                        <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${b.acc}%`, background: b.color}}/>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Passed / failed sub-types */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {td.passed_subtypes?.length > 0 && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                      <div className="text-xs font-bold text-green-700 mb-2">What you got right</div>
                      <div className="flex flex-wrap gap-1">
                        {td.passed_subtypes.map((s,i) => (
                          <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">{subLabel(s)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {td.failed_subtypes?.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <div className="text-xs font-bold text-red-700 mb-2">Where you dropped marks</div>
                      <div className="flex flex-wrap gap-1">
                        {td.failed_subtypes.map((s,i) => (
                          <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">{subLabel(s)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* 3-step action plan */}
                <div className="rounded-xl border overflow-hidden" style={{borderColor:'#93C5FD'}}>
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{background:'#EFF6FF'}}>
                    <RSIcTarget s={13} c='#1e40af'/>
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Your Action Plan</span>
                  </div>
                  <div className="divide-y divide-blue-100">
                    {[
                      { step:1, text: td.next_step },
                      { step:2, text: td.failed_subtypes?.length > 0
                          ? `Practise these model types: ${td.failed_subtypes.slice(0,2).map(subLabel).join(', ')} — 10 focused questions each until accuracy crosses 70%`
                          : 'Continue with mixed practice to maintain accuracy across all model types in this topic' },
                      { step:3, text: `Predicted ${td.mock_score_current}/${td.mock_score_potential} marks in the real exam — target the full ${td.mock_score_potential} marks by clearing every sub-type` },
                    ].map(({step, text}) => (
                      <div key={step} className="flex gap-3 px-4 py-3" style={{background:'#F0F9FF'}}>
                        <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{background:'#3B82F6'}}>{step}</span>
                        <p className="text-sm text-blue-900 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── MINI TEST NOTICE — shown for regular practice tests only (not diagnostic) ── */}
          {!isFullMock && !isDiagnostic && tab === 'feedback' && (
            <div className="mx-4 mt-4 mb-0 rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
              style={{background:'#FFF8F0', border:'1px solid #fec9b0'}}>
              <span className="mt-0.5"><RSIcDoc s={18} c='#FF653F'/></span>
              <div>
                <p className="font-bold text-gray-800 mb-0.5">Practice Test Result</p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Detailed analysis (Weak Areas, Time Analysis, Next Steps) is available only after a <strong>Full Mock Test</strong>.
                  Take a full mock from the Dashboard to get your complete performance report and rank.
                </p>
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 p-4 sm:p-5 space-y-3">

          {/* ══ FEEDBACK TAB ══ */}
          {tab==='feedback' && (
            <div className="space-y-4">
              {/* 2-column row: how you approached (wider) | cut-off comparison (smaller)
                  (section cut-off lives in the left sidebar already) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* Col 1: diagnostic → sub-type weakness detail; regular → behaviour flags */}
                {isDiagnostic && result.topic_diagnostic ? (() => {
                  const td = result.topic_diagnostic
                  const topicLabel = (td.topic||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
                  const weakPoints = []
                  if (td.easy_accuracy != null && td.easy_accuracy < 60)
                    weakPoints.push({ icon:<span style={{color:'#ef4444',fontWeight:700,fontSize:11}}>E</span>, head:`Easy questions need work`, body:`${td.easy_accuracy}% accuracy on ${td.easy_count} easy questions. These are scoring opportunities — every easy question dropped is a mark lost in the actual exam.` })
                  if (td.medium_accuracy != null && td.medium_accuracy < 50)
                    weakPoints.push({ icon:<span style={{color:'#f97316',fontWeight:700,fontSize:11}}>M</span>, head:`Medium questions below target`, body:`${td.medium_accuracy}% on ${td.medium_count} medium questions. Medium Qs make up ~40% of the test — closing this gap will move your level up significantly.` })
                  if (td.hard_accuracy != null && td.hard_accuracy < 40)
                    weakPoints.push({ icon:<span style={{color:'#eab308',fontWeight:700,fontSize:11}}>H</span>, head:`Hard questions — expected, but fixable`, body:`${td.hard_accuracy}% on ${td.hard_count} hard questions. These don't need mastery yet, but cracking 1–2 extra hard Qs per test can separate you at the cut-off.` })
                  if (td.failed_subtypes?.length > 0)
                    td.failed_subtypes.slice(0,3).forEach(s =>
                      weakPoints.push({ icon:<span style={{color:'#dc2626',fontWeight:700}}>✗</span>, head:`Gap: ${subLabel(s)}`, body:`You missed questions on "${subLabel(s)}" — learn this model type with 5–8 focused practice questions until it becomes automatic.` })
                    )
                  if (weakPoints.length === 0)
                    weakPoints.push({ icon:<span style={{color:'#16a34a',fontWeight:700}}>✓</span>, head:'Strong all-round performance', body:`You handled all difficulty bands well on ${topicLabel}. Keep it warm with occasional mixed practice before the exam.` })
                  return (
                    <Card title={`${topicLabel} — What to fix`} icon={<RSIcTarget s={13}/>}>
                      <div className="space-y-2">
                        {weakPoints.map((p,i) => (
                          <div key={i} className="flex gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
                            <span className="flex-shrink-0 mt-0.5 w-5 flex items-center justify-center">{p.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-gray-800 mb-0.5">{p.head}</div>
                              <div className="text-xs text-gray-500 leading-snug">{p.body}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })() : (
                <Card title="How you approached this exam" icon={<RSIcBrain s={13}/>}
                  badge={
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {flags.length} insights
                    </span>
                  }>
                  <div className="space-y-2">
                    {flags.length === 0
                      ? <p className="text-xs text-gray-400">No behaviour data yet.</p>
                      : flags.map((flag,i) => <FlagItem key={i} flag={flag}/>)
                    }
                  </div>
                </Card>
                )}

                {/* Col 2: Topic Breakdown (mini/diagnostic) OR Cut-off comparison (full mock) */}

                {!isFullMock && !isDiagnostic && (
                  <Card title="Topic Breakdown" icon={<RSIcChart s={13}/>}>
                    <TopicBreakdown questionResults={result.question_results || []} />
                  </Card>
                )}
                {isFullMock && peer && (
                  <Card title="Cut-off comparison" icon={<RSIcTarget s={13}/>}
                    badge={
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        peer.badge_color==='green' ?'bg-green-100 text-green-700':
                        peer.badge_color==='amber' ?'bg-amber-100 text-amber-700':
                        peer.badge_color==='orange'?'bg-orange-100 text-orange-700':
                        'bg-red-100 text-red-700'}`}>
                        {peer.summary_badge}
                      </span>
                    }>
                    {peer.cutoff_analysis && (()=>{
                      const ca = peer.cutoff_analysis
                      return (
                        <>
                          <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden mb-1.5">
                            <div className="absolute inset-0 flex">
                              <div className="bg-red-100"   style={{width:`${ca.cutoff_min}%`}}/>
                              <div className="bg-amber-100" style={{width:`${ca.cutoff_typical-ca.cutoff_min}%`}}/>
                              <div className="bg-green-100" style={{flex:1}}/>
                            </div>
                            <div className="absolute top-0 h-full border-l-2 border-dashed border-amber-500"
                              style={{left:`${ca.cutoff_typical}%`}}/>
                            <div className="absolute top-0 h-full border-l-2 border-dashed border-green-600"
                              style={{left:`${Math.min(ca.cutoff_max,99)}%`}}/>
                            <div className="absolute top-0 h-full border-l-4"
                              style={{left:`${Math.min(ca.student_score,99)}%`, borderColor:'#FF653F'}}/>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>0</span>
                            <span className="text-amber-600 font-semibold">Typical {ca.cutoff_typical}</span>
                            <span className="text-green-600 font-semibold">Safe {ca.cutoff_max}</span>
                            <span>100</span>
                          </div>
                          <div className="text-xs font-bold mb-2" style={{color:'#FF653F'}}>▲ Your score: {ca.student_score}</div>
                          <div className={`text-xs rounded-lg px-2.5 py-2 leading-relaxed mb-2 ${
                            peer.badge_color==='green' ?'bg-green-50 text-green-800 border border-green-200':
                            peer.badge_color==='amber' ?'bg-amber-50 text-amber-800 border border-amber-200':
                            peer.badge_color==='orange'?'bg-orange-50 text-orange-800 border border-orange-200':
                            'bg-red-50 text-red-800 border border-red-200'}`}>
                            {ca.overall_message}
                          </div>
                          {ca.category_context && (
                            <div className="space-y-1.5">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                All cut-offs
                              </div>
                              {Object.entries(ca.category_context).map(([cat,data])=>(
                                <div key={cat} className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs
                                  ${cat===peer.category?'bg-blue-50 border border-blue-200':'bg-gray-50'}`}>
                                  <span className={`font-bold w-10 flex-shrink-0 ${cat===peer.category?'text-orange-500':'text-gray-500'}`}>
                                    {cat}{cat===peer.category?' ✓':''}
                                  </span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400 rounded-full" style={{width:`${data.typical}%`}}/>
                                  </div>
                                  <span className="text-gray-500 w-24 text-right text-xs">{data.range}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </Card>
                )}
                {isFullMock && !peer && null}
              </div>{/* end grid */}

            </div>
          )}

          {/* ══ WEAK AREAS TAB ══ */}
          {tab==='weak' && (
            <div className="space-y-4">
            <RecoBanner>
              {weakTopics.length === 0
                ? 'No critical weak areas — keep revising your strong topics so they stay automatic under exam pressure.'
                : <>Start with <b>{weakTopics.slice(0,2).map(w=>tName(w.topic)).join(' and ')}</b>. These are exactly the topics most likely to cost you marks on exam day — left unfixed, they can be the difference between clearing the cut-off and missing the whole exam. Fixing them could add about <b className="text-green-700">+{Math.round(weakTopics.reduce((s,w)=>s+(Number(w.exam_impact)||0),0))} marks</b> next attempt. Practise 10–15 questions each in <b>Practice Topics</b> until your accuracy crosses 70%.</>}
            </RecoBanner>
            <Card title="Weak Areas" icon={<RSIcWarn s={13}/>}
              badge={<span className="text-xs text-gray-400">{weakTopics.length} topics need attention</span>}>
              {weakTopics.length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No critical weak areas — great consistency!</p>
                : <div className="space-y-3">
                    {weakTopics.map((w,i)=>{
                      const sc = w.severity||'moderate'
                      const scStyle = sc==='critical'
                        ? {dot:'#dc2626', pill:'#fef2f2', pillText:'#dc2626', bar:'#ef4444', border:'#fca5a5'}
                        : sc==='moderate'
                        ? {dot:'#d97706', pill:'#fffbeb', pillText:'#92400e', bar:'#f59e0b', border:'#fcd34d'}
                        : {dot:'#FF653F', pill:'#FFF3EE', pillText:'#9a3412', bar:'#fb923c', border:'#fed7aa'}
                      const acc = w.accuracy||0
                      return (
                        <div key={i} className="rounded-xl overflow-hidden"
                          style={{border:`1px solid ${scStyle.border}`, borderLeft:`4px solid ${scStyle.dot}`}}>
                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-3 mb-2.5">
                              <span className="font-bold text-gray-900 text-sm leading-tight">{tName(w.topic)}</span>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{background:scStyle.pill, color:scStyle.pillText}}>
                                  {sc}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 mb-2">
                              <span className="text-xs text-gray-400 w-14 flex-shrink-0">Accuracy</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{width:`${acc}%`, background:scStyle.bar}}/>
                              </div>
                              <span className="text-xs font-bold w-10 text-right flex-shrink-0" style={{color:scStyle.dot}}>{fmt(acc)}%</span>
                            </div>
                            {w.root_cause && <p className="text-xs text-gray-500 mb-2 leading-relaxed">{w.root_cause}</p>}
                            <div className="flex flex-wrap items-center gap-2">
                              {w.exam_impact > 0 && (
                                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  +{w.exam_impact} marks if fixed
                                </span>
                              )}
                              {w.suggested_action && <span className="text-xs text-gray-400 leading-snug">{w.suggested_action}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
              {strongTopics.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Strong Topics ✓</div>
                  <div className="grid grid-cols-2 gap-2">
                    {strongTopics.slice(0,6).map((s,i)=>(
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
          {tab==='time' && (
            <div className="space-y-4">
              <RecoBanner>
                {(timeA.silly_mistake_count||0) > 0
                  ? <>You made <b>{timeA.silly_mistake_count} silly mistake{(timeA.silly_mistake_count>1?'s':'')}</b> on questions you answered too fast — even <b>5–10 extra seconds</b> to re-read prevents errors that cost negative marks. Target ~<b>25–30s</b> for easy questions and <b>60–75s</b> for calculation-heavy ones.</>
                  : (timeA.slowest_vs_target||[])[0]
                    ? <>You spend the most time on <b>{tName(timeA.slowest_vs_target[0].topic)}</b> ({timeA.slowest_vs_target[0].ratio}× the ideal time). Bring it under ~<b>{timeA.slowest_vs_target[0].target}s</b> with timed practice, and reinvest that saved time into high-mark questions like DI &amp; RC.</>
                    : <>Your pacing looks healthy. Spend a little more on high-value topics (<b>Data Interpretation, Reading Comprehension — ~60–75s</b> each) and move fast through easy ones (<b>Simplification, Number Series — ~25–30s</b>). Always bank <b>2–3 minutes per section</b> for a final review.</>}
              </RecoBanner>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {label:'Avg per Q',     val:`${(timeA.avg_time_per_q||0).toFixed(0)}s`, target:'<60s', ok:(timeA.avg_time_per_q||999)<60},
                  {label:'Silly mistakes',val:timeA.silly_mistake_count||0, target:'0', ok:(timeA.silly_mistake_count||0)===0},
                  {label:'Concept gaps', val:timeA.concept_gap_count||0,   target:'0', ok:(timeA.concept_gap_count||0)===0},
                  {label:'Sunk on skips',val:`${((timeA.sunk_time||{}).total_sunk_secs||0).toFixed(0)}s`,target:'0s',
                   ok:((timeA.sunk_time||{}).total_sunk_secs||0)<10},
                ].map(c=>(
                  <div key={c.label} className="p-4 rounded-xl border border-gray-200 bg-white"
                    style={{borderTop:`3px solid ${c.ok?'#10b981':'#ef4444'}`}}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-medium">{c.label}</span>
                      <span className={`text-xs font-bold ${c.ok?'text-green-600':'text-red-500'}`}>{c.ok?'✓':'!'}</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 leading-none mb-1">{c.val}</div>
                    <div className="text-xs" style={{color: c.ok?'#10b981':'#6b7280'}}>target {c.target}</div>
                  </div>
                ))}
              </div>

              {(timeA.slowest_vs_target||[]).length > 0 && (
                <Card title="Slowest topics vs ideal time" icon="⏱">
                  <div className="space-y-3">
                    {timeA.slowest_vs_target.map((s,i)=>(
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700">{tName(s.topic)}</span>
                          <span className="text-red-600 font-bold">{s.student_avg}s vs {s.target}s ideal ({s.ratio}x)</span>
                        </div>
                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute h-full bg-red-400 rounded-full"
                            style={{width:`${Math.min(s.student_avg/2,100)}%`}}/>
                          <div className="absolute top-0 h-full border-l-2 border-green-600 border-dashed"
                            style={{left:`${Math.min(s.target/2,100)}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card title="Time distribution">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {label:'Fast (<30s)',    val:timeA.fast_count||0,       color:'#10b981'},
                    {label:'Normal',         val:timeA.normal_count||0,     color:'#3b82f6'},
                    {label:'Slow',           val:timeA.slow_count||0,       color:'#f59e0b'},
                    {label:'Very slow (90s+)',val:timeA.very_slow_count||0, color:'#ef4444'},
                  ].map(c=>(
                    <div key={c.label} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-black" style={{color:c.color}}>{c.val}</div>
                      <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ NEXT STEPS TAB ══ */}
          {tab==='steps' && (
            <div className="space-y-4">
            <RecoBanner>
              {improve > pct
                ? <>These steps are personalised from your attempt and ranked by exam impact — <b>step 1 is your single biggest score leak</b>. Acting on them could lift your readiness to about <b className="text-green-700">{improve.toFixed(1)}%</b>. Clear one weak topic a day, take a full mock every <b>2–3 days</b>, and review every wrong answer in Explanations — consistency beats cramming.</>
                : <>These steps are personalised from your attempt and ranked by exam impact. Do <b>step 1 first</b>, then re-test with a fresh mock to measure your gain. Aim to clear one weak topic a day and review every wrong answer to lock in the improvement.</>}
            </RecoBanner>
            <Card title="Recommended Next Steps" icon={<RSIcArrow s={13}/>}
              badge={<span className="text-xs text-gray-400">ranked by exam impact</span>}>
              {nextSteps.length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No steps generated.</p>
                : <div className="space-y-3">
                    {nextSteps.map((step,i)=>(
                      <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-sm flex-shrink-0" style={{background:'#FF653F'}}>
                          {step.priority}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-sm mb-1">{step.title}</div>
                          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{step.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              {step.impact}
                            </span>
                            {step.mini_test_params?.difficulty && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${DIFF_CL[step.mini_test_params.difficulty]||'bg-gray-100 text-gray-600'}`}>
                                {step.mini_test_params.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                        {onStartTest && (
                          <button
                            onClick={() => launchNextStep(step, i)}
                            disabled={stepLoading === i}
                            className="flex-shrink-0 text-xs font-bold border px-3 py-1.5 rounded-lg self-center disabled:opacity-50 transition-all hover:bg-orange-50"
                            style={{color:'#FF653F', borderColor:'#fec9b0'}}>
                            {stepLoading === i
                              ? <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/>...</span>
                              : 'Start →'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
              }
            </Card>

            {/* ── Negative Marking Insight (full mock with wrong answers) ── */}
            {isFullMock && wrong > 0 && (() => {
              const negPenalty = result.negative_marks ?? (wrong * 0.25)
              const hypotheticalScore = (score + negPenalty).toFixed(1)
              return (
                <div className="rounded-2xl border-2 px-4 py-3 flex items-start gap-3" style={{background:'#fff7ed',borderColor:'#fde8d8'}}>
                  <span style={{fontSize:22,flexShrink:0,marginTop:1}}>⚠️</span>
                  <div>
                    <div className="font-bold text-sm text-orange-800 mb-0.5">Negative Marking Impact</div>
                    <div className="text-xs text-orange-700 leading-relaxed">
                      <b>{wrong} wrong answer{wrong>1?'s':''}</b> cost you <b>{negPenalty.toFixed(1)} mark{negPenalty!==1?'s':''}</b> in penalties.
                      Had you skipped them, your score would have been <b>{hypotheticalScore}</b> instead of <b>{score.toFixed(1)}</b>.
                      Focus on attempting only when confidence is ≥ 70%.
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Question Heatmap ── */}
            {qResults.length > 0 && (() => {
              const secs = [...new Set(qResults.map(q => q.section || 'General'))].filter(Boolean)
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-4" style={{boxShadow:'0 2px 8px rgba(17,17,17,.05)'}}>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <RSIcChart s={13}/>
                    Question Heatmap
                    <span className="font-normal text-gray-400 normal-case tracking-normal">· {qResults.length} questions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {qResults.map((q,i)=>{
                      const s = q.status || 'skipped'
                      return (
                        <div key={i} title={`Q${q.question_number||i+1} · ${s}${q.section?` · ${q.section}`:''}`}
                          className="rounded"
                          style={{
                            width:16, height:16, flexShrink:0, cursor:'default',
                            background: s==='correct'?'#10b981' : s==='wrong'?'#ef4444' : '#e5e7eb',
                            opacity: s==='skipped'?0.6:1,
                          }}/>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-5 mt-3">
                    {[{color:'#10b981',label:`${qResults.filter(q=>(q.status||'skipped')==='correct').length} Correct`},
                      {color:'#ef4444',label:`${qResults.filter(q=>(q.status||'skipped')==='wrong').length} Wrong`},
                      {color:'#e5e7eb',label:`${qResults.filter(q=>!(q.status||'skipped').match(/correct|wrong/)).length} Skipped`},
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{background:l.color}}/>
                        <span className="text-xs text-gray-500">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            </div>
          )}

          {/* ══ ALL TOPICS TAB ══ */}
          {tab==='topics' && (
            <div className="space-y-4">
            <RecoBanner>
              Your full topic-by-topic scorecard across every section. Scan for the <b className="text-red-600">red</b> and <b className="text-amber-600">amber</b> bars — those are the exact chapters to practise next. <b className="text-green-700">Green</b> topics are solid; just keep them warm with occasional revision.
            </RecoBanner>
            <Card title="All Topics" icon={<RSIcClip s={13}/>}>
              {Object.keys(topicR).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No topic-level breakdown available for this attempt.
                </p>
              ) : (
              <>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{background:'#10b981'}}/>Strong (≥60%)</span>
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{background:'#f59e0b'}}/>Needs work (35–59%)</span>
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{background:'#ef4444'}}/>Weak (&lt;35%)</span>
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-gray-300"/>Not attempted</span>
              </div>

              <div className="space-y-8">
                {Object.entries(secStats).map(([sec])=>{
                  const secTopics = Object.entries(topicR).filter(([_,v])=>v.section===sec)
                  if (!secTopics.length) return null
                  const sTotal = secTopics.reduce((a,[_,v])=> a + (v.total ?? ((v.correct||0)+(v.wrong||0)+(v.skipped||0))), 0)
                  const sCorr  = secTopics.reduce((a,[_,v])=> a + (v.correct||0), 0)
                  const sAcc   = sTotal>0 ? Math.round(sCorr/sTotal*100) : 0
                  const sCol   = sAcc>=60?'#10b981':sAcc>=35?'#f59e0b':'#ef4444'
                  return (
                    <div key={sec}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-extrabold text-gray-700 uppercase tracking-wide">{SEC[sec]||sec}</span>
                        <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ color:sCol, background:`${sCol}1a` }}>
                          {sAcc}% · {sCorr}/{sTotal}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {secTopics.map(([topic,ts])=>{
                          const corr  = ts.correct||0
                          const wrng  = ts.wrong||0
                          const total = ts.total ?? (corr + wrng + (ts.skipped||0))
                          const skip  = Math.max(0, total - corr - wrng)
                          const attempted = corr + wrng
                          const acc   = total>0 ? Math.round(corr/total*100) : 0
                          const col   = attempted===0 ? '#9ca3af' : acc>=60?'#10b981':acc>=35?'#f59e0b':'#ef4444'
                          const status= attempted===0 ? 'Not attempted' : acc>=60?'Strong' : acc>=35?'Needs work' : 'Weak'
                          return (
                            <div key={topic} className="rounded-2xl bg-white border-2 overflow-hidden"
                              style={{ borderColor:`${col}44`, borderLeftColor:col, borderLeftWidth:6 }}>
                              <div className="flex items-center gap-3 px-3 pt-3 pb-1.5">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-gray-900 truncate">{tName(topic)}</div>
                                  <div className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color:col }}>{status}</div>
                                </div>
                                <span className="text-base font-black flex-shrink-0" style={{ color:col }}>
                                  {attempted===0 ? '—' : `${acc}%`}
                                </span>
                              </div>
                              <div className="px-3 pb-3 space-y-1">
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width:`${acc}%`, background:col }}/>
                                </div>
                                <div className="text-[11px] text-gray-500">
                                  <span className="font-bold text-green-600">{corr} correct</span>
                                  {' · '}
                                  <span className="font-bold text-red-500">{wrng} wrong</span>
                                  {skip > 0 && <span className="text-gray-400"> · {skip} skipped</span>}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              </>
              )}
            </Card>
            </div>
          )}

          {/* ══ EXPLANATIONS TAB — UWorld-style two-pane viewer ══ */}
          {tab==='explanations' && (() => {
            if (!qResults.length) return (
              <Card title="Question Explanations" icon={<RSIcBulb s={13}/>}>
                <div className="text-center py-10">
                  <div className="mb-3 flex justify-center"><RSIcFile s={32} c='#9ca3af'/></div>
                  <div className="text-sm font-bold text-gray-900 mb-1">Detailed review isn't available for this attempt</div>
                  <div className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                    This test was taken before per-question review was enabled, so its questions weren't saved.
                    New attempts are fully reviewable here — questions, your answers and step-by-step explanations.
                  </div>
                  <button onClick={onRetry}
                    className="text-white text-sm font-bold px-5 py-2.5 rounded-xl" style={{ background:'#FF653F' }}>
                    Take a fresh test →
                  </button>
                </div>
              </Card>
            )
            const idx = Math.min(expIdx, qResults.length - 1)
            const q   = qResults[idx]
            const st  = q.status || 'skipped'
            const passage = (q.question_text||'').includes('[PASSAGE]')
              ? q.question_text.split('[PASSAGE]')[1]?.split('[/PASSAGE]')[0]?.trim()
              : ''
            const qLine = (q.question_text||'').includes('[PASSAGE]')
              ? (q.question_text.split('[/PASSAGE]')[1]?.trim() || '')
              : (q.question_text || '')
            return (
              <div>
                {/* Two panes — LEFT: passage + question · RIGHT: explanation */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-3 items-start">

                  {/* LEFT — passage (if RC) + the question */}
                  <Card>
                    {passage && (
                      <div className="mb-4">
                        <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{color:'#FF653F'}}><RSIcBook s={11} c='#FF653F'/> Passage</div>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 lg:max-h-[38vh] lg:overflow-y-auto nice-scroll">
                          {passage}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        st==='correct'?'text-green-700 border-green-300 bg-green-50':
                        st==='wrong'?'text-red-700 border-red-300 bg-red-50':
                        'text-gray-500 border-gray-300 bg-gray-50'}`}>
                        Q{q.question_number} · {st==='correct'?'Correct ✓':st==='wrong'?'Incorrect ✗':'Skipped —'}
                      </span>
                      <span className="text-xs text-gray-500">{tName(q.topic)}{q.difficulty?` · ${q.difficulty}`:''}</span>
                    </div>

                    <ChartQuestion question={q} />

                    <QuestionContent text={qLine} className="mb-4" />

                    <div className="space-y-2">
                      {['a','b','c','d','e'].map(opt=>{
                        const val = q[`option_${opt}`]; if (!val) return null
                        const lbl = opt.toUpperCase()
                        const isCor = q.correct_answer?.toUpperCase()===lbl
                        const isGiv = q.given_answer?.toUpperCase()===lbl
                        return (
                          <div key={opt} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 text-sm ${
                            isCor ? 'bg-green-50 border-green-300' : isGiv&&!isCor ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isCor?'bg-green-500 text-white':isGiv&&!isCor?'bg-red-500 text-white':'bg-gray-100 text-gray-600'}`}>{lbl}</span>
                            <span className={`flex-1 ${isCor?'text-green-800 font-semibold':isGiv&&!isCor?'text-red-700':'text-gray-700'}`}>{val}</span>
                            {isCor && <span className="text-xs font-bold text-green-600">Correct</span>}
                            {isGiv && !isCor && <span className="text-xs font-bold text-red-600">Your answer</span>}
                          </div>
                        )
                      })}
                    </div>
                  </Card>

                  {/* RIGHT — the explanation */}
                  <Card title="Explanation" icon={<RSIcBulb s={13}/>} badge={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setExpIdx(Math.max(0, expIdx - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={expIdx === 0}
                        className="px-2 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ borderColor: '#FF653F', color: '#FF653F' }}>
                        ← Prev
                      </button>
                      <span className="text-xs text-gray-400 font-medium">{expIdx + 1}/{qResults.length}</span>
                      <button
                        onClick={() => { setExpIdx(Math.min(qResults.length - 1, expIdx + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={expIdx === qResults.length - 1}
                        className="px-2 py-1 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                        style={{ background: '#FF653F', borderColor: '#FF653F' }}>
                        Next →
                      </button>
                    </div>
                  }>
                    <SeatingDiagram meta={q.metadata} />
                    <ExplanationWithTabs q={q} />
                  </Card>
                </div>

                {/* Quick jump grid — numbered, tap to review */}
                <div className="mt-3 bg-white border border-gray-100 rounded-2xl p-3" style={{ boxShadow:'0 2px 10px rgba(17,17,17,.05)' }}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Jump to question</div>
                  <div className="flex flex-wrap gap-1.5">
                    {qResults.map((qq,i)=>{
                      const s = qq.status||'skipped'
                      const active = i===idx
                      return (
                        <button key={i} onClick={()=>{setExpIdx(i); window.scrollTo({top:0,behavior:'smooth'})}}
                          title={`Question ${qq.question_number} · ${s}`}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border-2 transition-all ${
                            active ? 'text-white' :
                            s==='correct'?'bg-green-50 border-green-300 text-green-700':
                            s==='wrong'?'bg-red-50 border-red-300 text-red-700':
                            'bg-gray-50 border-gray-200 text-gray-500'}`}
                          style={active?{background:'#FF653F',borderColor:'#FF653F'}:{}}>
                          {qq.question_number}
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
