import { useState, useMemo, useEffect } from 'react'
import { getPrediction } from '../api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

const _sv = c => ({ fill:'none', stroke:c||'currentColor', strokeWidth:'1.75', strokeLinecap:'round', strokeLinejoin:'round' })
const IcBolt   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IcTarget = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IcTrend  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const IcShield = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IcCheck  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="20 6 9 17 4 12"/></svg>
const IcWarn   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

/* ── Semicircle gauge ── */
function GaugeSVG({ probability = 0, dark }) {
  const R = 78, CX = 105, CY = 100
  const ARC = Math.PI * R
  const fill = (probability / 100) * ARC
  const color = probability >= 70 ? '#10b981' : probability >= 45 ? '#f59e0b' : '#ef4444'
  const arc = (cx, cy, r) => `M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`

  return (
    <svg width="210" height="124" viewBox="0 0 210 124">
      <defs>
        <linearGradient id="gTrack2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ef4444" stopOpacity=".2"/>
          <stop offset="45%"  stopColor="#f59e0b" stopOpacity=".2"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity=".2"/>
        </linearGradient>
        <linearGradient id="gFill2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ef4444"/>
          <stop offset="45%"  stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* track */}
      <path d={arc(CX,CY,R)} fill="none" stroke="url(#gTrack2)" strokeWidth="14" strokeLinecap="round"/>
      {/* fill */}
      <path d={arc(CX,CY,R)} fill="none" stroke="url(#gFill2)" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${fill} ${ARC}`} filter="url(#glow2)"/>
      {/* zone labels */}
      <text x="22"  y="118" fontSize="9" fill="rgba(255,255,255,.3)" fontFamily="Inter,sans-serif" fontWeight="600">LOW</text>
      <text x={CX}  y="18"  fontSize="9" fill="rgba(255,255,255,.3)" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">MID</text>
      <text x="186" y="118" fontSize="9" fill="rgba(255,255,255,.3)" fontFamily="Inter,sans-serif" textAnchor="end" fontWeight="600">HIGH</text>
      {/* probability number */}
      <text x={CX} y={CY-6} textAnchor="middle" fontSize="34" fontWeight="900" fill="#fff" fontFamily="Plus Jakarta Sans,sans-serif" letterSpacing="-1">{probability}%</text>
      <text x={CX} y={CY+14} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.35)" fontFamily="Inter,sans-serif" letterSpacing=".06em">CLEARANCE PROB.</text>
      {/* center dot */}
      <circle cx={CX} cy={CY} r="6" fill="rgba(255,255,255,.15)"/>
      <circle cx={CX} cy={CY} r="3" fill="#F06535"/>
    </svg>
  )
}

/* ── What-If Simulator ── */
function WhatIfSimulator({ sections, cutoff = 65, dark }) {
  const [vals, setVals] = useState(
    Object.fromEntries(sections.map(s => [s.key, s.current]))
  )
  const projected = useMemo(() =>
    sections.reduce((sum, s) => sum + (vals[s.key] / 100) * s.weight, 0)
  , [vals, sections])
  const delta   = (projected - cutoff).toFixed(1)
  const above   = projected >= cutoff
  const vColor  = projected >= cutoff+3 ? '#10b981' : projected >= cutoff ? '#f59e0b' : '#ef4444'
  const verdict = projected >= cutoff+3 ? `+${delta} above cutoff ✓`
                : projected >= cutoff   ? `+${delta} — narrow margin ⚡`
                : `${delta} below cutoff ⚠`
  const card    = dark ? '#1a2236' : '#fff'
  const border  = dark ? 'rgba(255,255,255,.07)' : '#e8ecf2'
  const txt     = dark ? '#e8edf5' : '#0d1117'
  const muted   = dark ? '#8899b4' : '#64748b'

  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {sections.map(s => {
          const val      = vals[s.key]
          const onTrack  = val >= s.cutoff
          const nearLine = val >= s.cutoff - 10
          const fillGrad = onTrack
            ? 'linear-gradient(90deg,#059669,#10b981,#34d399)'
            : nearLine
              ? 'linear-gradient(90deg,#d97706,#f59e0b,#fbbf24)'
              : 'linear-gradient(90deg,#dc2626,#ef4444,#f87171)'
          const barCol   = onTrack ? '#10b981' : nearLine ? '#f59e0b' : '#ef4444'
          return (
            <div key={s.key}>
              {/* Label row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12.5, fontWeight:700, color:txt }}>{s.label}</span>
                <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 9px', borderRadius:99,
                  background: onTrack ? (dark?'rgba(16,185,129,.15)':'rgba(16,185,129,.1)') : (dark?'rgba(239,68,68,.15)':'rgba(239,68,68,.09)'),
                  color:barCol }}>
                  {onTrack ? `+${val - s.cutoff}% above` : `${s.cutoff - val}% gap`}
                </span>
              </div>
              {/* Premium bar */}
              <div style={{ position:'relative', height:28, borderRadius:10, background:dark?'rgba(255,255,255,.07)':'#eef2f7', overflow:'hidden' }}>
                <div style={{
                  position:'absolute', height:'100%', width:`${val}%`,
                  background: fillGrad, borderRadius:10,
                  transition:'width .3s cubic-bezier(.4,0,.2,1)',
                  display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:10,
                }}>
                  {val > 20 && (
                    <span style={{ fontSize:12, fontWeight:900, color:'#fff', letterSpacing:'-.01em', textShadow:'0 1px 3px rgba(0,0,0,.3)' }}>{val}%</span>
                  )}
                </div>
                {/* Cutoff marker line */}
                <div style={{ position:'absolute', left:`${s.cutoff}%`, top:0, bottom:0, width:2,
                  background:'rgba(255,255,255,.8)', transform:'translateX(-50%)', zIndex:2 }}/>
              </div>
              {/* Gap label + slider */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <input type="range" min={20} max={100} value={val}
                  onChange={e => setVals(v => ({ ...v, [s.key]: Number(e.target.value) }))}
                  style={{ flex:1, accentColor:barCol, cursor:'pointer', height:3, opacity:.5 }}
                />
                <span style={{ fontSize:10, color:muted, fontWeight:600, whiteSpace:'nowrap' }}>goal {s.cutoff}%</span>
              </div>
            </div>
          )
        })}
      </div>
      {/* Result box */}
      <div style={{ marginTop:14, padding:'12px 16px', borderRadius:14,
        background: above ? (dark?'rgba(16,185,129,.08)':'#f0fdf4') : (dark?'rgba(239,68,68,.08)':'#fef2f2'),
        border:`1.5px solid ${above?(dark?'rgba(16,185,129,.2)':'#bbf7d0'):(dark?'rgba(239,68,68,.2)':'#fecaca')}`,
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:muted }}>Projected overall score</div>
          <div style={{ fontSize:11, color:muted, marginTop:2 }}>vs. est. cutoff {cutoff}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:24, fontWeight:900, color:vColor, letterSpacing:'-.04em', lineHeight:1 }}>
            {Math.round(projected * 10) / 10}
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:vColor, marginTop:3 }}>{verdict}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Projection chart data ── */
function buildProjection(history) {
  const chrono = [...history].reverse().slice(-8)
  const past   = chrono.map((r,i) => ({
    name: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
      : `T${i+1}`,
    score: Math.round(Number(r.percentage)||0),
  }))
  if (!past.length) return []
  const last   = past[past.length-1].score
  const growth = past.length > 1 ? (last - past[0].score) / Math.max(1, past.length-1) : 1
  const future = ['Week 2','Week 3','Week 4','Exam Day'].map((n,i) => ({
    name: n,
    projected: Math.min(100, Math.round(last + (i+1) * growth * 1.2)),
  }))
  return [...past.map(p=>({...p,projected:null})), ...future.map(f=>({...f,score:null}))]
}

export default function PredictionPage({ history = [], user, savedPlan, darkMode = false, onNav }) {
  const dark   = darkMode
  const bg     = dark ? '#0b0f1a' : '#eef1f8'
  const card   = dark ? '#161d2e' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,.07)' : '#e2e8f0'
  const txt    = dark ? '#e8edf5' : '#0d1117'
  const muted  = dark ? '#8899b4' : '#64748b'
  const accent = '#F06535'

  const [mlData, setMlData] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setMlLoading(true)
    getPrediction(user.id)
      .then(data => setMlData(data?.data_source === 'ml' ? data : false))
      .catch(() => setMlData(false))
      .finally(() => setMlLoading(false))
  }, [user?.id])

  const usingML = !!(mlData && mlData.data_source === 'ml')
  const hasData = history.length >= 2

  const avgScore = history.length
    ? Math.round(history.reduce((s,r)=>s+Number(r.percentage||0),0)/history.length) : 0
  const probability    = usingML ? mlData.probability
                       : hasData ? Math.min(95, Math.max(10, Math.round(avgScore*1.05-5))) : 0
  const projectedScore = usingML ? mlData.projected_score
                       : hasData ? Math.min(100, Math.round(avgScore*1.08)) : 0
  const cutoff = 65

  const sectionMetrics = useMemo(() => {
    const agg = {}
    history.forEach(r => Object.entries(r.section_scores||{}).forEach(([sec,v])=>{
      const LBL = { english:'English', quantitative_aptitude:'Quant', reasoning:'Reasoning',
        general_awareness:'Gen. Awareness', numerical_ability:'Numerical',
        general_financial_awareness:'Gen. Awareness' }
      const lbl = LBL[sec] || sec.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
      const acc = v?.accuracy!=null ? v.accuracy : (v?.total ? (v.correct/v.total*100) : 0)
      if (!agg[lbl]) agg[lbl]={sum:0,n:0,key:sec}
      agg[lbl].sum+=acc; agg[lbl].n+=1
    }))
    return Object.entries(agg).map(([lbl,a])=>({
      label:lbl, key:a.key, current:Math.round(a.sum/a.n), cutoff:65, weight:25,
    })).slice(0,4)
  }, [history])

  const emptySections = [
    { label:'Reasoning',      key:'reasoning', current:0, cutoff:65, weight:25 },
    { label:'Quant',          key:'quant',     current:0, cutoff:65, weight:30 },
    { label:'Gen. Awareness', key:'ga',        current:0, cutoff:60, weight:20 },
    { label:'English',        key:'english',   current:0, cutoff:65, weight:25 },
  ]

  const sections = usingML
    ? mlData.sections.map(s=>({ ...s, current:s.accuracy }))
    : (sectionMetrics.length>=2 ? sectionMetrics : emptySections).map((s,i,arr)=>({
        ...s, weight: Math.round(100/arr.length)
      }))

  const mlTopActions  = usingML ? mlData.top_actions  : []
  const mlRiskFactors = usingML ? mlData.risk_factors : []
  const projectionData = buildProjection(history)

  const sectionCards = sections.map(s => {
    const cur    = s.current ?? 0
    const pct    = usingML ? cur : Math.min(95, Math.max(10, Math.round(cur * 1.05)))
    const above  = cur >= s.cutoff + 5
    const below  = cur < s.cutoff - 5
    const status = above ? 'On Track' : below ? 'At Risk' : 'Borderline'
    const scColor= above ? '#10b981' : below ? '#ef4444' : '#f59e0b'
    const fillGrad = above ? 'linear-gradient(90deg,#10b981,#34d399)'
                   : below ? 'linear-gradient(90deg,#ef4444,#f87171)'
                   : 'linear-gradient(90deg,#f59e0b,#fbbf24)'
    const scBg   = above ? (dark?'rgba(16,185,129,.12)':'#f0fdf4')
                 : below ? (dark?'rgba(239,68,68,.12)':'#fef2f2')
                 : (dark?'rgba(245,158,11,.12)':'#fffbeb')
    const gap    = Math.max(0, s.cutoff - cur)
    const action = above ? `${cur - s.cutoff}% buffer · stay consistent`
                 : below ? `Need +${gap}% · Priority focus`
                 : `+${gap}% to cutoff · 1 quiz/day`
    return { ...s, pct, status, scColor, fillGrad, scBg, action }
  })

  const atRisk   = sectionCards.filter(s=>s.status==='At Risk')
  const onTrack  = sectionCards.filter(s=>s.status==='On Track')
  const daysLeft = savedPlan?.exam_date
    ? Math.max(0, Math.ceil((new Date(savedPlan.exam_date) - new Date()) / 86400000))
    : null

  const improvementRate = useMemo(() => {
    const chrono = [...history].reverse()
    if (chrono.length < 2) return 0
    const scores = chrono.map(r=>Number(r.percentage||0))
    return ((scores[scores.length-1] - scores[0]) / Math.max(1, scores.length-1)).toFixed(1)
  }, [history])

  return (
    <div style={{ color:txt, fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif", background:bg, minHeight:'100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .pd-card{background:${card};border:1px solid ${border};border-radius:20px;box-shadow:0 1px 0 rgba(0,0,0,.04),0 4px 16px rgba(0,0,0,${dark?.1:.05}),0 16px 40px rgba(0,0,0,${dark?.08:.03})}
        .pd-card-head{padding:14px 20px 12px;border-bottom:1px solid ${border};display:flex;align-items:flex-start;justify-content:space-between;gap:10}
        .pd-card-title{font-size:14px;font-weight:800;color:${txt};font-family:'Plus Jakarta Sans','Inter',sans-serif;letter-spacing:-.02em}
        .pd-card-sub{font-size:11px;color:${muted};margin-top:2px}
        .pd-card-body{padding:14px 20px}
        .pd-sec-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .pd-two-col{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}
        .pd-action-num{width:28px;height:28px;border-radius:50%;background:rgba(232,90,44,.12);border:1.5px solid rgba(232,90,44,.25);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:${accent};flex-shrink:0}
        @media(max-width:860px){.pd-sec-grid{grid-template-columns:1fr 1fr!important}.pd-two-col{grid-template-columns:1fr!important}.pd-sec-grid>div:last-child:nth-child(odd){grid-column:1/-1}}
        @media(max-width:560px){.pd-hero-proj{display:none!important}.pd-hero{flex-direction:column!important;gap:20px!important;align-items:center!important}}
      `}</style>

      <div style={{ paddingBottom:56 }}>

        {/* ── Empty state ── */}
        {!hasData && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, padding:60, textAlign:'center', marginBottom:20 }}>
            <div style={{ width:72, height:72, borderRadius:22, background:dark?'rgba(255,255,255,.05)':'#f4f6fa', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <IcTrend s={36} c={muted}/>
            </div>
            <div style={{ fontSize:18, fontWeight:900, color:txt, marginBottom:8 }}>Unlock Your AI Prediction</div>
            <div style={{ fontSize:13, color:muted, maxWidth:380, margin:'0 auto 24px', lineHeight:1.7 }}>
              Take at least 2 mock tests to unlock your AI prediction, score projection, and personalised action plan.
            </div>
            {onNav && (
              <button onClick={()=>onNav('explore')} style={{ background:accent, color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 4px 20px rgba(232,90,44,.35)' }}>
                Start a Test →
              </button>
            )}
          </div>
        )}

        {/* ════ 1. HERO VERDICT CARD ════ */}
        <div className="pd-hero" style={{
          background:'linear-gradient(145deg,#0d1117 0%,#161b2e 60%,#0f1322 100%)',
          borderRadius:24, padding:'32px 36px', marginBottom:18,
          display:'flex', alignItems:'center', gap:36, flexWrap:'wrap',
          position:'relative', overflow:'hidden',
          opacity: hasData ? 1 : .45, pointerEvents: hasData ? 'auto' : 'none',
          boxShadow:'0 12px 48px rgba(0,0,0,.32)',
        }}>
          {/* glow orbs */}
          <div style={{ position:'absolute',left:-40,top:-40,width:280,height:280,background:'radial-gradient(circle,rgba(232,90,44,.14) 0%,transparent 65%)',pointerEvents:'none' }}/>
          <div style={{ position:'absolute',right:60,bottom:-60,width:240,height:240,background:'radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 65%)',pointerEvents:'none' }}/>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(232,90,44,.2),transparent)',pointerEvents:'none' }}/>

          {/* Gauge */}
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
            <GaugeSVG probability={probability} dark={dark}/>
            <div style={{ textAlign:'center', marginTop:-4 }}>
              <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'.06em',
                color: probability>=70 ? '#10b981' : probability>=45 ? '#f59e0b' : '#ef4444' }}>
                {probability>=70 ? '✓ Likely to Clear' : probability>=45 ? '⚡ Borderline' : '⚠ Below Cutoff'}
              </div>
            </div>
          </div>

          {/* Verdict text */}
          <div style={{ flex:1, minWidth:260, position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              <div style={{ width:7, height:7, background: mlLoading ? '#f59e0b' : '#10b981', borderRadius:'50%', boxShadow:`0 0 8px ${mlLoading?'#f59e0b':'#10b981'}` }}/>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.3)' }}>
                AI Prediction · {history.length} test{history.length!==1?'s':''}{usingML ? ` · ${mlData.topic_count} topics` : ''}
              </span>
              {mlLoading && <span style={{ fontSize:10, color:'#f59e0b', fontWeight:700 }}>Syncing ML…</span>}
              {usingML && (
                <span style={{ fontSize:10, fontWeight:800, background:'rgba(16,185,129,.18)', color:'#34d399', padding:'2px 10px', borderRadius:99, border:'1px solid rgba(16,185,129,.25)', letterSpacing:'.05em' }}>
                  LIVE ML
                </span>
              )}
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff', lineHeight:1.25, marginBottom:12, letterSpacing:'-.03em' }}>
              On track to score{' '}
              <span style={{ color:accent, textShadow:'0 0 20px rgba(232,90,44,.4)' }}>{projectedScore} marks</span>
              {' '}on exam day
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.7, marginBottom:18, maxWidth:480 }}>
              {hasData
                ? `Cutoff est. ${cutoff}–${cutoff+3} marks. At ${improvementRate > 0 ? '+' : ''}${improvementRate} marks/test, ${probability>=70 ? 'you\'ll clear the cutoff.' : 'increase your practice frequency.'}`
                : 'Complete more tests to see a personalised forecast.'}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {onTrack.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:99, background:'rgba(16,185,129,.14)', border:'1px solid rgba(16,185,129,.25)', color:'#34d399' }}>
                  <IcCheck s={12} c='#34d399'/>
                  {onTrack.length}/{sectionCards.length} sections on track
                </div>
              )}
              {atRisk.map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:99, background:'rgba(239,68,68,.14)', border:'1px solid rgba(239,68,68,.25)', color:'#f87171' }}>
                  <IcWarn s={12} c='#f87171'/>
                  {s.label}: {Math.max(0,s.cutoff-s.current)}% below
                </div>
              ))}
              {atRisk.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:99, background:'rgba(232,90,44,.14)', border:'1px solid rgba(232,90,44,.25)', color:'#ff9a7a' }}>
                  {daysLeft != null ? `${daysLeft} days to close the gap` : 'Set exam date in planner'}
                </div>
              )}
            </div>
          </div>

          {/* Score box */}
          <div className="pd-hero-proj" style={{ flexShrink:0, position:'relative', zIndex:1 }}>
            <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'20px 24px', textAlign:'center', minWidth:150 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:'rgba(255,255,255,.28)', marginBottom:10 }}>Projected Score</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, justifyContent:'center', marginBottom:6 }}>
                <span style={{ fontSize:44, fontWeight:900, lineHeight:1, color:'#fff', letterSpacing:'-.04em' }}>{projectedScore}</span>
                <span style={{ fontSize:15, fontWeight:600, color:'rgba(255,255,255,.3)' }}>/100</span>
              </div>
              <div style={{ height:1, background:'rgba(255,255,255,.08)', margin:'12px 0' }}/>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,.4)' }}>
                Cutoff <strong style={{ color:'#10b981' }}>{cutoff}–{cutoff+3}</strong>
              </div>
              <div style={{ fontSize:11, fontWeight:800, color:projectedScore>=cutoff?'#10b981':'#f87171', marginTop:4 }}>
                {projectedScore>=cutoff ? `+${projectedScore-cutoff} above` : `${projectedScore-cutoff} below`} cutoff
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'center', marginTop:10 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,.28)' }}>Confidence</span>
              <div style={{ display:'flex', gap:4 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width:9, height:9, borderRadius:'50%',
                    background: i <= Math.round(Math.min(5, Math.max(1, probability/20))) ? '#10b981' : 'rgba(255,255,255,.12)'
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════ 2. SECTION CLEARANCE ════ */}
        <div style={{ marginBottom:18, opacity:hasData?1:.45, pointerEvents:hasData?'auto':'none' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:txt, letterSpacing:'-.02em' }}>Section Clearance</div>
              <div style={{ fontSize:12, color:muted, marginTop:3 }}>Per-section accuracy vs cutoff target</div>
            </div>
          </div>
          <div className="pd-sec-grid">
            {sectionCards.map(s => (
              <div key={s.label} style={{
                background:card,
                border:`1.5px solid ${s.status==='At Risk' ? (dark?'rgba(239,68,68,.28)':'rgba(239,68,68,.18)') : border}`,
                borderTopWidth:'3px', borderTopColor:s.scColor,
                borderRadius:18, padding:20, position:'relative', overflow:'hidden',
                boxShadow:`0 1px 0 rgba(0,0,0,.04),0 4px 16px rgba(0,0,0,${dark?.1:.05}),0 16px 40px rgba(0,0,0,${dark?.08:.03})`,
              }}>
                <div style={{ position:'absolute', inset:0, background:s.scColor, opacity:.04, pointerEvents:'none' }}/>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:muted }}>{s.label}</span>
                    <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em',
                      padding:'3px 10px', borderRadius:99, background:s.scBg, color:s.scColor }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize:34, fontWeight:900, lineHeight:1, color:s.scColor, letterSpacing:'-.04em', marginBottom:4 }}>
                    {s.pct}%
                  </div>
                  <div style={{ fontSize:11, color:muted, marginBottom:12, lineHeight:1.4 }}>
                    {s.status==='On Track' ? `Clearing ${s.cutoff}% cutoff`
                    : s.status==='At Risk'  ? `Below ${s.cutoff}% cutoff`
                    : `Borderline for ${s.cutoff}%`}
                  </div>
                  <div style={{ height:6, borderRadius:99, background:dark?'rgba(255,255,255,.06)':'#eef2f7', overflow:'hidden', marginBottom:10 }}>
                    <div style={{ height:'100%', width:`${s.pct}%`, background:s.fillGrad, borderRadius:99, transition:'width .9s cubic-bezier(.4,0,.2,1)' }}/>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:s.scColor }}>{s.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ 3. PROJECTION CHART + WHAT-IF ════ */}
        <div className="pd-two-col" style={{ marginBottom:18 }}>
          {/* Score projection */}
          <div className="pd-card" style={{ opacity:hasData?1:.45, pointerEvents:hasData?'auto':'none' }}>
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">Score Projection</div>
                <div className="pd-card-sub">Orange = your actual scores · Indigo = AI projected scores</div>
              </div>
            </div>
            <div className="pd-card-body" style={{ paddingBottom:10 }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={projectionData} margin={{top:6,right:10,left:-28,bottom:2}} barCategoryGap="35%" barGap={4}>
                  <defs>
                    <linearGradient id="actBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F06535" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#ff9a6c" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="projBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.55}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?'rgba(255,255,255,.05)':'#e8edf5'} vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:10.5,fill:muted,fontFamily:'Plus Jakarta Sans,sans-serif'}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,100]} ticks={[0,25,50,65,75,100]} tick={{fontSize:10.5,fill:muted,fontFamily:'Plus Jakarta Sans,sans-serif'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ background:dark?'#1e293b':'#fff', border:`1px solid ${border}`, borderRadius:12, fontSize:12, fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 8px 24px rgba(0,0,0,.12)' }} cursor={{fill:dark?'rgba(255,255,255,.04)':'rgba(0,0,0,.03)',radius:6}}/>
                  <ReferenceLine y={cutoff} stroke='#10b981' strokeDasharray="5 3" strokeOpacity={0.65}
                    label={{value:`${cutoff}% Cutoff`,fontSize:10,fill:'#10b981',position:'insideTopRight',dy:-4}}/>
                  <Bar dataKey="score" fill="url(#actBarGrad)" radius={[6,6,0,0]} maxBarSize={40} name="Actual Score" minPointSize={3}/>
                  <Bar dataKey="projected" fill="url(#projBarGrad)" radius={[6,6,0,0]} maxBarSize={40} name="AI Projected" minPointSize={3}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:18, marginTop:10 }}>
                {[{color:'#F06535',label:'Actual'},{color:'#6366f1',label:'AI Projected',opacity:.8}].map(l=>(
                  <div key={l.label} style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:muted, fontWeight:600 }}>
                    <span style={{ width:14, height:10, display:'inline-block', background:l.color, borderRadius:3, opacity:l.opacity||1 }}/>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What-If */}
          <div className="pd-card" style={{ opacity:hasData?1:.45, pointerEvents:hasData?'auto':'none' }}>
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">What-If Simulator</div>
                <div className="pd-card-sub">Drag any section score — see how it shifts your prediction</div>
              </div>
              <IcBolt s={18} c={accent}/>
            </div>
            <div className="pd-card-body">
              <WhatIfSimulator sections={sections} cutoff={cutoff} dark={dark}/>
            </div>
          </div>
        </div>

        {/* ════ 4. GAP TO CLEAR + TOP ACTIONS ════ */}
        <div className="pd-two-col" style={{ marginBottom:18 }}>
          {/* Gap to Clear */}
          <div className="pd-card" style={{ opacity:hasData?1:.45, pointerEvents:hasData?'auto':'none' }}>
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">Gap to Clear</div>
                <div className="pd-card-sub">What needs to improve and estimated time to close it</div>
              </div>
              <IcTarget s={18} c={accent}/>
            </div>
            <div className="pd-card-body">
              {sectionCards.filter(s=>s.status!=='On Track').map((s,i,arr) => {
                const gap  = Math.max(0, s.cutoff - s.current)
                const days = s.status==='At Risk' ? gap * 2 : gap * 3
                const isLast = i === arr.length - 1 + sectionCards.filter(x=>x.status==='On Track').length
                return (
                  <div key={s.label} style={{ display:'flex', alignItems:'flex-start', gap:14,
                    paddingBottom:16, borderBottom:`1px solid ${border}`, marginBottom:16 }}>
                    <div style={{ width:38, height:38, borderRadius:11, flexShrink:0,
                      background:s.status==='At Risk'?(dark?'rgba(239,68,68,.12)':'#fef2f2'):(dark?'rgba(245,158,11,.12)':'#fffbeb'),
                      display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${s.status==='At Risk'?(dark?'rgba(239,68,68,.2)':'rgba(239,68,68,.15)'):(dark?'rgba(245,158,11,.2)':'rgba(245,158,11,.15)')}` }}>
                      {s.status==='At Risk' ? <IcWarn s={17} c='#ef4444'/> : <IcBolt s={17} c='#f59e0b'/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:txt, marginBottom:4 }}>
                        {s.label}: need +{gap}% to reach cutoff
                      </div>
                      <div style={{ fontSize:11.5, color:muted, lineHeight:1.6 }}>
                        {s.status==='At Risk'
                          ? `Practice 2 sets daily. You'll reach ${s.cutoff}% in ~${days} days.`
                          : `1 quiz/day (10 min) closes this in ~${days} days.`}
                      </div>
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      <div style={{ fontSize:22, fontWeight:900, color:s.scColor, letterSpacing:'-.03em', lineHeight:1 }}>{days}</div>
                      <div style={{ fontSize:10, color:muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>days</div>
                    </div>
                  </div>
                )
              })}
              {sectionCards.filter(s=>s.status==='On Track').map((s,i,arr) => (
                <div key={s.label} style={{ display:'flex', alignItems:'flex-start', gap:14,
                  paddingBottom: i<arr.length-1?16:0, borderBottom:i<arr.length-1?`1px solid ${border}`:'none',
                  marginBottom: i<arr.length-1?16:0 }}>
                  <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:dark?'rgba(16,185,129,.12)':'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${dark?'rgba(16,185,129,.2)':'rgba(16,185,129,.15)'}` }}>
                    <IcCheck s={17} c='#10b981'/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:txt, marginBottom:4 }}>
                      {s.label}: +{s.current-s.cutoff}% buffer — protect this lead
                    </div>
                    <div style={{ fontSize:11.5, color:muted, lineHeight:1.6 }}>
                      Keep 1 full {s.label} section per week to maintain your advantage.
                    </div>
                  </div>
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <div style={{ fontSize:22, fontWeight:900, color:'#10b981', letterSpacing:'-.03em', lineHeight:1 }}>✓</div>
                    <div style={{ fontSize:10, color:muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>clear</div>
                  </div>
                </div>
              ))}
              {sectionCards.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px 0', color:muted, fontSize:13 }}>Complete a test to see gap analysis</div>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="pd-card">
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
                  Top Actions This Week
                  {usingML && <span style={{ fontSize:10, fontWeight:800, background:'rgba(16,185,129,.14)', color:'#10b981', padding:'2px 8px', borderRadius:99, letterSpacing:'.05em' }}>ML</span>}
                </div>
                <div className="pd-card-sub">Ranked by predicted score impact</div>
              </div>
              <IcBolt s={18} c={accent}/>
            </div>
            <div className="pd-card-body">
              <div style={{ opacity:hasData?1:.45, pointerEvents:hasData?'auto':'none' }}>
                {(usingML && mlTopActions.length > 0
                  ? mlTopActions.map((a,i) => ({
                      title: `${a.topic}${a.section ? ` (${a.section})` : ''} — improve accuracy`,
                      detail: a.reason || `Current ${a.accuracy}%. Build consistency.`,
                      impact: `+${a.impact || '2–4'}`,
                    }))
                  : [
                      { title:'Focus on weakest topic this week', detail:'15-min timed practice daily on your lowest-accuracy topic.', impact:'+4' },
                      { title:'Take a full mock test', detail:'Each mock adds ~1.3 marks to your projection on average.', impact:'+1.3' },
                      { title:'Review wrong answers same day', detail:'Preventing repeated mistakes is the fastest score gain.', impact:'+0.8' },
                    ]
                ).map((a,i,arr) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14,
                    paddingBottom: i<arr.length-1?16:0, borderBottom: i<arr.length-1?`1px solid ${border}`:'none',
                    marginBottom: i<arr.length-1?16:0 }}>
                    <div className="pd-action-num">{i+1}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:txt, marginBottom:4 }}>{a.title}</div>
                      {a.detail && <div style={{ fontSize:11.5, color:muted, lineHeight:1.6 }}>{a.detail}</div>}
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      <div style={{ fontSize:16, fontWeight:900, color:'#10b981', letterSpacing:'-.02em', lineHeight:1 }}>{a.impact}</div>
                      <div style={{ fontSize:9.5, color:muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>marks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════ 5. RISK FACTORS ════ */}
        <div className="pd-card">
          <div className="pd-card-head">
            <div>
              <div className="pd-card-title">Risk Factors</div>
              <div className="pd-card-sub">Signals that could lower your score if not addressed</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {usingML && <span style={{ fontSize:10, fontWeight:800, background:'rgba(16,185,129,.14)', color:'#10b981', padding:'3px 10px', borderRadius:99, flexShrink:0, letterSpacing:'.05em' }}>ML</span>}
              <IcShield s={18} c={accent}/>
            </div>
          </div>
          <div className="pd-card-body">
            {(usingML && mlRiskFactors.length > 0
              ? mlRiskFactors.map(r => ({
                  title: r.factor, detail: r.detail,
                  sev: r.severity==='high' ? 'Critical' : r.severity==='medium' ? 'Watch' : 'Note',
                  color: r.severity==='high' ? '#ef4444' : r.severity==='medium' ? '#f59e0b' : '#3b82f6',
                  icon: r.severity==='high' ? <IcWarn s={16} c='#ef4444'/> : r.severity==='medium' ? <IcBolt s={16} c='#f59e0b'/> : <IcCheck s={16} c='#3b82f6'/>,
                  bg:   r.severity==='high' ? (dark?'rgba(239,68,68,.1)':'#fef2f2')
                      : r.severity==='medium' ? (dark?'rgba(245,158,11,.1)':'#fffbeb')
                      : (dark?'rgba(59,130,246,.1)':'#eff6ff'),
                  bor:  r.severity==='high' ? (dark?'rgba(239,68,68,.2)':'rgba(239,68,68,.15)')
                      : r.severity==='medium' ? (dark?'rgba(245,158,11,.2)':'rgba(245,158,11,.15)')
                      : (dark?'rgba(59,130,246,.2)':'rgba(59,130,246,.15)'),
                }))
              : atRisk.length > 0
              ? atRisk.map(s => ({
                  title: `${s.label} is ${s.current < s.cutoff - 10 ? 'critically' : ''} below cutoff`,
                  detail: `Current ${s.current}% vs ${s.cutoff}% cutoff. ${s.current < s.cutoff - 10 ? 'Needs urgent focus.' : 'Needs steady improvement.'}`,
                  sev: s.current < s.cutoff - 10 ? 'Critical' : 'Watch',
                  color: s.current < s.cutoff - 10 ? '#ef4444' : '#f59e0b',
                  icon: s.current < s.cutoff - 10 ? <IcWarn s={16} c='#ef4444'/> : <IcBolt s={16} c='#f59e0b'/>,
                  bg: s.current < s.cutoff - 10 ? (dark?'rgba(239,68,68,.1)':'#fef2f2') : (dark?'rgba(245,158,11,.1)':'#fffbeb'),
                  bor: s.current < s.cutoff - 10 ? (dark?'rgba(239,68,68,.2)':'rgba(239,68,68,.15)') : (dark?'rgba(245,158,11,.2)':'rgba(245,158,11,.15)'),
                })).concat([{
                  title: 'Cutoff uncertainty: aim for +5 marks above estimate',
                  detail: 'Cutoff predictions have ±3 mark variance. Buffer is your safety net.',
                  sev: 'Note', color: '#3b82f6', icon: <IcCheck s={16} c='#3b82f6'/>,
                  bg: dark?'rgba(59,130,246,.1)':'#eff6ff', bor: dark?'rgba(59,130,246,.2)':'rgba(59,130,246,.15)',
                }])
              : [{
                  title: 'No major risk factors detected',
                  detail: 'Keep up the momentum. Take tests regularly to maintain accuracy.',
                  sev: 'Good', color: '#10b981', icon: <IcCheck s={16} c='#10b981'/>,
                  bg: dark?'rgba(16,185,129,.1)':'#f0fdf4', bor: dark?'rgba(16,185,129,.2)':'rgba(16,185,129,.15)',
                }]
            ).map((r,i,arr) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12,
                paddingBottom: i<arr.length-1?16:0, borderBottom: i<arr.length-1?`1px solid ${border}`:'none',
                marginBottom: i<arr.length-1?16:0 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:r.bg, border:`1px solid ${r.bor}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {r.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em',
                      padding:'2px 8px', borderRadius:99, background:r.bg, color:r.color, border:`1px solid ${r.bor}` }}>
                      {r.sev}
                    </span>
                    <span style={{ fontSize:13, fontWeight:700, color:txt }}>{r.title}</span>
                  </div>
                  {r.detail && <div style={{ fontSize:11.5, color:muted, lineHeight:1.6 }}>{r.detail}</div>}
                </div>
              </div>
            ))}
            {usingML && mlRiskFactors.length === 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 0', color:'#10b981', fontSize:13, fontWeight:700 }}>
                <IcCheck s={18} c='#10b981'/>
                No critical risk factors detected by ML model
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
