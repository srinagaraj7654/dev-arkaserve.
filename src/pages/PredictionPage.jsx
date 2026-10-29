import { useState, useMemo, useEffect } from 'react'
import { getPrediction } from '../api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

/* ── icons ── */
const _sv = c => ({ fill:'none', stroke:c||'currentColor', strokeWidth:'1.5', strokeLinecap:'round', strokeLinejoin:'round' })
const IcBolt  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IcInfo  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
const IcTrend = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>

/* ── Semicircle gauge with zone colours ── */
function GaugeSVG({ probability = 0 }) {
  const R  = 66, CX = 90, CY = 88
  const ARC = Math.PI * R
  const fill = (probability / 100) * ARC
  const color = probability >= 70 ? '#16a34a' : probability >= 45 ? '#d97706' : '#dc2626'

  const arc = (cx, cy, r) => `M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`

  return (
    <svg width="180" height="108" viewBox="0 0 180 108">
      <defs>
        <linearGradient id="gTrack" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#dc2626" stopOpacity=".3"/>
          <stop offset="40%"  stopColor="#d97706" stopOpacity=".3"/>
          <stop offset="70%"  stopColor="#16a34a" stopOpacity=".3"/>
          <stop offset="100%" stopColor="#16a34a" stopOpacity=".3"/>
        </linearGradient>
        <linearGradient id="gFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#dc2626"/>
          <stop offset="40%"  stopColor="#d97706"/>
          <stop offset="70%"  stopColor="#FF653F"/>
          <stop offset="100%" stopColor="#16a34a"/>
        </linearGradient>
      </defs>
      {/* zone track */}
      <path d={arc(CX,CY,R)} fill="none" stroke="url(#gTrack)" strokeWidth="13" strokeLinecap="round"/>
      {/* filled arc */}
      <path d={arc(CX,CY,R)} fill="none" stroke="url(#gFill)" strokeWidth="13" strokeLinecap="round"
        strokeDasharray={`${fill} ${ARC}`}/>
      {/* zone labels */}
      <text x="16"  y="104" fontSize="8" fill="rgba(255,255,255,.3)" fontFamily="Inter,sans-serif">Low</text>
      <text x="90"  y="16"  fontSize="8" fill="rgba(255,255,255,.3)" fontFamily="Inter,sans-serif" textAnchor="middle">Mid</text>
      <text x="162" y="104" fontSize="8" fill="rgba(255,255,255,.3)" fontFamily="Inter,sans-serif" textAnchor="end">High</text>
      {/* percentage */}
      <text x={CX} y={CY-8} textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff" fontFamily="Plus Jakarta Sans,sans-serif">{probability}%</text>
      <text x={CX} y={CY+10} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.35)" fontFamily="Inter,sans-serif">probability</text>
      {/* centre dot */}
      <circle cx={CX} cy={CY} r="5" fill="#fff"/>
      <circle cx={CX} cy={CY} r="2.5" fill="#FF653F"/>
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

  const delta = (projected - cutoff).toFixed(1)
  const vColor = projected >= cutoff+3 ? '#16a34a' : projected >= cutoff ? '#d97706' : '#dc2626'
  const verdict = projected >= cutoff+3 ? `+${delta} above cutoff ✓`
                : projected >= cutoff   ? `+${delta} — narrow margin`
                : `${delta} below cutoff ⚠`

  const bg     = dark ? '#0c0e14' : '#f9fafb'
  const border = dark ? '#232c3a' : '#e8eaed'
  const txt    = dark ? '#f1f5f9' : '#111827'
  const muted  = dark ? '#94a3b8' : '#6b7280'

  return (
    <div>
      {sections.map(s => (
        <div key={s.key} style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:muted }}>{s.label}</span>
            <span style={{ fontSize:13, fontWeight:800, color:
              vals[s.key] >= s.cutoff ? '#16a34a' : vals[s.key] >= s.cutoff-5 ? '#d97706' : '#dc2626'
            }}>{vals[s.key]}%</span>
          </div>
          <input type="range" min={30} max={100} value={vals[s.key]}
            onChange={e => setVals(v => ({ ...v, [s.key]: Number(e.target.value) }))}
            style={{ width:'100%', accentColor:'#FF653F', cursor:'pointer', height:5 }}
          />
        </div>
      ))}
      {/* result row */}
      <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:'13px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:muted }}>Projected overall score</div>
          <div style={{ fontSize:10, color:muted, marginTop:2 }}>vs. est. cutoff {cutoff}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:22, fontWeight:900, color:vColor, letterSpacing:'-.02em', lineHeight:1 }}>
            {Math.round(projected * 10) / 10}
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:vColor, marginTop:2 }}>{verdict}</div>
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

export default function PredictionPage({ history = [], user, darkMode = false, onNav }) {
  const dark   = darkMode
  const bg     = dark ? '#0c0e14' : '#f8fafc'
  const card   = dark ? '#161b24' : '#ffffff'
  const border = dark ? '#232c3a' : '#e8eaed'
  const txt    = dark ? '#f1f5f9' : '#0d0f12'
  const muted  = dark ? '#94a3b8' : '#6b7280'
  const accent = '#FF653F'

  /* ── ML state ── */
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

  /* ── derived metrics ── */
  const avgScore = history.length
    ? Math.round(history.reduce((s,r)=>s+Number(r.percentage||0),0)/history.length) : 0
  const probability    = usingML ? mlData.probability
                       : hasData ? Math.min(95, Math.max(10, Math.round(avgScore*1.05-5))) : 0
  const projectedScore = usingML ? mlData.projected_score
                       : hasData ? Math.min(100, Math.round(avgScore*1.08)) : 0
  const cutoff = 65

  /* ── section metrics ── */
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

  const fallbackSections = [
    { label:'Reasoning',      key:'reasoning', current:72, cutoff:65, weight:25 },
    { label:'Quant',          key:'quant',     current:58, cutoff:65, weight:30 },
    { label:'Gen. Awareness', key:'ga',        current:65, cutoff:60, weight:20 },
    { label:'English',        key:'english',   current:78, cutoff:65, weight:25 },
  ]

  const sections = usingML
    ? mlData.sections.map(s=>({ ...s, current:s.accuracy }))
    : (sectionMetrics.length>=2 ? sectionMetrics : fallbackSections).map((s,i,arr)=>({
        ...s, weight: Math.round(100/arr.length)
      }))

  const mlTopActions  = usingML ? mlData.top_actions  : []
  const mlRiskFactors = usingML ? mlData.risk_factors : []
  const projectionData = buildProjection(history)

  /* ── section card data ── */
  const sectionCards = sections.map(s => {
    const cur    = s.current ?? 0
    const pct    = usingML ? cur : Math.min(95, Math.max(10, Math.round(cur * 1.05)))
    const above  = cur >= s.cutoff + 5
    const below  = cur < s.cutoff - 5
    const status = above ? 'On Track' : below ? 'At Risk' : 'Borderline'
    const scColor= above ? '#16a34a' : below ? '#dc2626' : '#d97706'
    const scBg   = above ? (dark?'rgba(22,163,74,.14)':'#f0fdf4')
                 : below ? (dark?'rgba(220,38,38,.14)':'#fef2f2')
                 : (dark?'rgba(217,119,6,.14)':'#fffbeb')
    const gap    = Math.max(0, s.cutoff - cur)
    const action = above ? `✓ ${cur}% avg · ${cur-s.cutoff}% buffer`
                 : below ? `⚠ ${gap}% gap · Priority focus needed`
                 : `⚡ ${gap}% gap · 1 practice/day closes it`
    return { ...s, pct, status, scColor, scBg, action }
  })

  /* ── at-risk sections ── */
  const atRisk   = sectionCards.filter(s=>s.status==='At Risk')
  const onTrack  = sectionCards.filter(s=>s.status==='On Track')

  /* ── days to exam (placeholder) ── */
  const daysLeft = 34

  /* ── improvement rate ── */
  const improvementRate = useMemo(() => {
    const chrono = [...history].reverse()
    if (chrono.length < 2) return 0
    const scores = chrono.map(r=>Number(r.percentage||0))
    return ((scores[scores.length-1] - scores[0]) / Math.max(1, scores.length-1)).toFixed(1)
  }, [history])

  return (
    <div style={{ color:txt, fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif", background:bg, minHeight:'100%' }}>
      <style>{`
        .pd-card{background:${card};border:1px solid ${border};border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,${dark?.18:.05})}
        .pd-card-head{padding:14px 18px 12px;border-bottom:1px solid ${border};display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
        .pd-card-title{font-size:13px;font-weight:700;color:${txt};font-family:'Plus Jakarta Sans','Inter',sans-serif}
        .pd-card-sub{font-size:11px;color:${muted};margin-top:2px}
        .pd-card-body{padding:16px 18px}
        .pd-sec-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .pd-two-col{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}
        .pd-action-num{width:24px;height:24px;border-radius:50%;background:rgba(255,101,63,.12);border:1.5px solid rgba(255,101,63,.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${accent};flex-shrink:0;margin-top:1px}
        .pd-slider::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:${accent};border:2px solid ${card};box-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer}
        .pd-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:${accent};border:2px solid ${card};cursor:pointer}
        @media(max-width:860px){.pd-sec-grid{grid-template-columns:1fr 1fr!important}.pd-two-col{grid-template-columns:1fr!important}}
        @media(max-width:560px){.pd-hero-proj{display:none!important}.pd-hero{flex-direction:column!important;gap:20px!important;align-items:flex-start!important}}
      `}</style>

      <div style={{ maxWidth:960, margin:'0 auto', paddingBottom:48 }}>

        {/* ── Empty state ── */}
        {!hasData && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:48, textAlign:'center', marginBottom:24 }}>
            <IcTrend s={48} c={muted}/>
            <div style={{ fontSize:16, fontWeight:700, marginTop:16, color:txt }}>Not enough data yet</div>
            <div style={{ fontSize:13, color:muted, marginTop:6, maxWidth:360, margin:'8px auto 0' }}>
              Take at least 2 mock tests to unlock your AI prediction, score projection, and personalised action plan.
            </div>
            {onNav && (
              <button onClick={()=>onNav('explore')} style={{ marginTop:20, background:accent, color:'#fff', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Start a Test →
              </button>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            1. HERO VERDICT CARD
        ════════════════════════════════════════ */}
        <div className="pd-hero" style={{
          background:'linear-gradient(135deg,#0d0f14 0%,#1a1d2e 100%)',
          borderRadius:16, padding:'28px 32px', marginBottom:18,
          display:'flex', alignItems:'center', gap:40, flexWrap:'wrap',
          position:'relative', overflow:'hidden',
          opacity: hasData ? 1 : .4, pointerEvents: hasData ? 'auto' : 'none',
        }}>
          {/* glow orbs */}
          <div style={{ position:'absolute',left:-30,top:-30,width:220,height:220,background:'radial-gradient(circle,rgba(255,101,63,.15) 0%,transparent 65%)',pointerEvents:'none' }}/>
          <div style={{ position:'absolute',right:80,bottom:-50,width:200,height:200,background:'radial-gradient(circle,rgba(99,102,241,.1) 0%,transparent 65%)',pointerEvents:'none' }}/>

          {/* Gauge */}
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:8, position:'relative', zIndex:1 }}>
            <GaugeSVG probability={probability}/>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em',
                color: probability>=70?'#22c55e':probability>=45?'#f59e0b':'#ef4444' }}>
                {probability>=70 ? 'Likely to Clear ✓' : probability>=45 ? 'Borderline' : 'Below Cutoff'}
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginTop:2 }}>Clearance probability</div>
            </div>
          </div>

          {/* Verdict text */}
          <div style={{ flex:1, minWidth:0, position:'relative', zIndex:1 }}>
            {/* tag */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
              <div style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%' }}/>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)' }}>
                AI Prediction · Based on {history.length} test{history.length!==1?'s':''}
                {usingML && ` · ${mlData.topic_count} topics`}
              </span>
              {mlLoading && <span style={{ fontSize:9, color:'#f59e0b', fontWeight:700 }}>⟳ Loading…</span>}
              {usingML && <span style={{ fontSize:9, fontWeight:700, background:'rgba(22,163,74,.2)', color:'#22c55e', padding:'1px 7px', borderRadius:99, border:'1px solid rgba(22,163,74,.3)' }}>Live ML</span>}
            </div>
            {/* headline */}
            <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:10, letterSpacing:'-.02em' }}>
              You're on track to score{' '}
              <span style={{ color:accent }}>{projectedScore} marks</span>{' '}
              on exam day.
            </div>
            {/* sub */}
            <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.65, marginBottom:14, maxWidth:480 }}>
              {hasData
                ? `Estimated cutoff is ${cutoff}–${cutoff+3} marks based on trend. At your current rate of ${improvementRate>0?'+':''}${improvementRate} marks/test, ${probability>=70?'you\'ll clear the cutoff with a margin.':'you need to accelerate improvement.'}`
                : 'Complete more tests to see a personalised forecast.'}
            </div>
            {/* pills */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {onTrack.length > 0 && (
                <span style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:99, background:'rgba(22,163,74,.15)', border:'1px solid rgba(22,163,74,.3)', color:'#22c55e' }}>
                  ✓ {onTrack.length} of {sectionCards.length} sections on track
                </span>
              )}
              {atRisk.map(s => (
                <span key={s.label} style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:99, background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.3)', color:'#f87171' }}>
                  ⚠ {s.label} {Math.max(0,s.cutoff-s.current)}% below cutoff
                </span>
              ))}
              {atRisk.length > 0 && (
                <span style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:99, background:'rgba(255,101,63,.15)', border:'1px solid rgba(255,101,63,.3)', color:'#ff9a7a' }}>
                  {daysLeft} days to close the gap
                </span>
              )}
            </div>
          </div>

          {/* Score projection box */}
          <div className="pd-hero-proj" style={{ flexShrink:0, position:'relative', zIndex:1 }}>
            <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, padding:'16px 20px', textAlign:'right', minWidth:160 }}>
              <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.09em', color:'rgba(255,255,255,.3)', marginBottom:8 }}>Projected exam score</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, justifyContent:'flex-end' }}>
                <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'2rem', fontWeight:900, lineHeight:1, color:'#fff' }}>{projectedScore}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,.4)' }}>/ 100</span>
              </div>
              <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,.08)', margin:'10px 0 8px' }}/>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>
                Cutoff est. <strong style={{ color:'#22c55e' }}>{cutoff}–{cutoff+3}</strong>
              </div>
              <div style={{ fontSize:10, color: projectedScore>=cutoff?'#22c55e':'#f87171', fontWeight:700, marginTop:3 }}>
                {projectedScore>=cutoff ? `+${projectedScore-cutoff} to +${projectedScore-cutoff+2} above cutoff` : `${projectedScore-cutoff} below cutoff`}
              </div>
            </div>
            {/* confidence dots */}
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', marginTop:10 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>Model confidence</span>
              <div style={{ display:'flex', gap:3 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width:8, height:8, borderRadius:'50%',
                    background: i <= Math.round(Math.min(5, Math.max(1, probability/20))) ? '#22c55e' : 'rgba(255,255,255,.15)'
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            2. SECTION CLEARANCE PROBABILITY
        ════════════════════════════════════════ */}
        <div style={{ marginBottom:18, opacity:hasData?1:.4, pointerEvents:hasData?'auto':'none' }}>
          <div style={{ fontSize:13, fontWeight:700, color:txt, marginBottom:10, fontFamily:"'Plus Jakarta Sans','Inter',sans-serif" }}>
            Section Clearance Probability
          </div>
          <div className="pd-sec-grid">
            {sectionCards.map(s => (
              <div key={s.label} style={{
                background:card, border:`1px solid ${s.status==='At Risk'?(dark?'rgba(220,38,38,.3)':'rgba(220,38,38,.25)'):border}`,
                borderRadius:12, padding:16, position:'relative', overflow:'hidden',
                boxShadow:`0 1px 4px rgba(0,0,0,${dark?.18:.05})`,
              }}>
                {/* subtle tinted bg */}
                <div style={{ position:'absolute',inset:0,background:s.scColor,opacity:.04,borderRadius:12,pointerEvents:'none' }}/>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:muted }}>{s.label}</span>
                    <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em',
                      padding:'3px 8px', borderRadius:99, background:s.scBg, color:s.scColor }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize:28, fontWeight:900, lineHeight:1, color:s.scColor, letterSpacing:'-.03em', marginBottom:3, fontFamily:"'Plus Jakarta Sans','Inter',sans-serif" }}>
                    {s.pct}%
                  </div>
                  <div style={{ fontSize:10, color:muted, marginBottom:10 }}>
                    {s.status==='On Track' ? `Likely to clear ${s.cutoff}% cutoff`
                    : s.status==='At Risk'  ? `Unlikely to clear ${s.cutoff}% cutoff`
                    : `Borderline for ${s.cutoff}% cutoff`}
                  </div>
                  <div style={{ height:5, borderRadius:99, background:dark?'rgba(255,255,255,.07)':'#e8eaed', overflow:'hidden', marginBottom:9 }}>
                    <div style={{ height:'100%', width:`${s.pct}%`, background:s.scColor, borderRadius:99, transition:'width .8s' }}/>
                  </div>
                  <div style={{ fontSize:10, fontWeight:600, color:s.scColor }}>{s.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            3. SCORE PROJECTION + WHAT-IF
        ════════════════════════════════════════ */}
        <div className="pd-two-col" style={{ marginBottom:18 }}>
          {/* Score projection chart */}
          <div className="pd-card" style={{ opacity:hasData?1:.4, pointerEvents:hasData?'auto':'none' }}>
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">Score Projection to Exam Day</div>
                <div className="pd-card-sub">Solid = actual · Dashed = AI projection at current rate</div>
              </div>
            </div>
            <div className="pd-card-body" style={{ paddingBottom:8 }}>
              <ResponsiveContainer width="100%" height={168}>
                <LineChart data={projectionData} margin={{top:5,right:10,left:-20,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?'#232c3a':'#f1f5f9'} vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:muted}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,100]} tick={{fontSize:10,fill:muted}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ background:dark?'#1e293b':'#fff', border:`1px solid ${border}`, borderRadius:8, fontSize:12 }}/>
                  <ReferenceLine y={cutoff} strokeDasharray="5 3" stroke={dark?'#374151':'#d1d5db'}
                    label={{value:'Cutoff',fontSize:10,fill:muted,position:'right'}}/>
                  <Line type="monotone" dataKey="score" stroke={accent} strokeWidth={2.5}
                    dot={{r:3,fill:accent,strokeWidth:0}} connectNulls={false} name="Actual"/>
                  <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2}
                    strokeDasharray="6 3" dot={false} connectNulls={false} opacity={.8} name="Projected"/>
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:4 }}>
                {[
                  { color:accent, dash:false, label:'Actual' },
                  { color:'#3b82f6', dash:true, label:'Projected' },
                ].map(l => (
                  <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:muted }}>
                    <div style={{ width:14, height:l.dash?0:2, borderTop:l.dash?`2px dashed ${l.color}`:`2px solid ${l.color}`, opacity:l.dash?.7:1 }}/>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What-If Simulator */}
          <div className="pd-card" style={{ opacity:hasData?1:.4, pointerEvents:hasData?'auto':'none' }}>
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">What-If Simulator</div>
                <div className="pd-card-sub">Drag a section score — see how it moves your overall prediction</div>
              </div>
            </div>
            <div className="pd-card-body">
              <WhatIfSimulator sections={sections} cutoff={cutoff} dark={dark}/>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            4. GAP TO CLEAR + TOP ACTIONS
        ════════════════════════════════════════ */}
        <div className="pd-two-col" style={{ marginBottom:18 }}>
          {/* Gap to Clear */}
          <div className="pd-card" style={{ opacity:hasData?1:.4, pointerEvents:hasData?'auto':'none' }}>
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">Gap to Clear</div>
                <div className="pd-card-sub">What needs to improve and by when</div>
              </div>
            </div>
            <div className="pd-card-body">
              {sectionCards.filter(s=>s.status!=='On Track').map(s => {
                const gap = Math.max(0, s.cutoff - s.current)
                const days = s.status==='At Risk' ? gap * 2 : gap * 3
                const icon = s.status==='At Risk' ? '🎯' : '📰'
                const iconBg = s.status==='At Risk' ? (dark?'rgba(220,38,38,.14)':'#fef2f2') : (dark?'rgba(217,119,6,.14)':'#fffbeb')
                return (
                  <div key={s.label} style={{ display:'flex', alignItems:'flex-start', gap:12, paddingBottom:14, borderBottom:`1px solid ${border}`, marginBottom:14 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
                      {icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:txt, marginBottom:3 }}>
                        {s.label}: need +{gap}% to reach cutoff
                      </div>
                      <div style={{ fontSize:11, color:muted, lineHeight:1.5 }}>
                        {s.status==='At Risk'
                          ? `Practice 2 sets daily. At that pace you'll reach ${s.cutoff}% in ~${days} days based on your learning curve.`
                          : `Add 1 quiz per day (10 min). This gap is small and closeable within ${days} days.`}
                      </div>
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      <div style={{ fontSize:18, fontWeight:900, color:s.scColor, letterSpacing:'-.02em', lineHeight:1 }}>{days}</div>
                      <div style={{ fontSize:9, color:muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>days to close</div>
                    </div>
                  </div>
                )
              })}
              {sectionCards.filter(s=>s.status==='On Track').map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'flex-start', gap:12, paddingBottom:14, borderBottom:`1px solid ${border}`, marginBottom:14 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:dark?'rgba(22,163,74,.14)':'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>⚡</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:txt, marginBottom:3 }}>
                      {s.label}: {s.current-s.cutoff}% buffer — protect this lead
                    </div>
                    <div style={{ fontSize:11, color:muted, lineHeight:1.5 }}>
                      Keep doing 1 full {s.label} section per week. Don't drop this while focusing on weak areas.
                    </div>
                  </div>
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:900, color:'#16a34a', letterSpacing:'-.02em', lineHeight:1 }}>0</div>
                    <div style={{ fontSize:9, color:muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>gap (maintain)</div>
                  </div>
                </div>
              ))}
              {sectionCards.length === 0 && (
                <div style={{ textAlign:'center', padding:'20px 0', color:muted, fontSize:13 }}>Complete a test to see gap analysis</div>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="pd-card">
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title" style={{ display:'flex', alignItems:'center', gap:7 }}>
                  Top Actions This Week
                  {usingML && <span style={{ fontSize:9, fontWeight:700, background:'rgba(22,163,74,.14)', color:'#16a34a', padding:'2px 7px', borderRadius:99 }}>ML</span>}
                  {!hasData && <span style={{ fontSize:9, fontWeight:600, background:dark?'rgba(255,255,255,.07)':'#f3f4f6', color:muted, padding:'2px 7px', borderRadius:99 }}>Coming Soon</span>}
                </div>
                <div className="pd-card-sub">AI-ranked by predicted score impact</div>
              </div>
            </div>
            <div className="pd-card-body">
              <div style={{ opacity:hasData?1:.4, pointerEvents:hasData?'auto':'none' }}>
                {(usingML && mlTopActions.length > 0
                  ? mlTopActions.map((a,i) => ({
                      title: `${a.topic}${a.section ? ` (${a.section})` : ''} — improve accuracy`,
                      detail: a.reason || `Current accuracy ${a.accuracy}%. Practice sets to build consistency.`,
                      impact: `+${a.impact || '2–4'} marks`,
                    }))
                  : [
                      { title:'Focus on weakest topic this week', detail:'Daily 15-min timed practice on lowest-accuracy topic.', impact:'+4 marks' },
                      { title:'Take a full mock test', detail:"Each mock adds ~1.3 marks to your projection on average.", impact:'+1.3 marks' },
                      { title:'Review your wrong answers', detail:'Preventing repeated mistakes is the fastest score gain.', impact:'+0.8 marks' },
                    ]
                ).map((a,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, paddingBottom:14, borderBottom:`1px solid ${border}`, marginBottom:i<2?14:0 }}>
                    <div className="pd-action-num">{i+1}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:txt, marginBottom:3 }}>{a.title}</div>
                      {a.detail && <div style={{ fontSize:11, color:muted, lineHeight:1.5 }}>{a.detail}</div>}
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      <div style={{ fontSize:12, fontWeight:800, color:'#16a34a' }}>{a.impact}</div>
                      <div style={{ fontSize:9, color:muted, fontWeight:600 }}>pts predicted</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            5. RISK FACTORS
        ════════════════════════════════════════ */}
        <div className="pd-card">
          <div className="pd-card-head">
            <div>
              <div className="pd-card-title">Risk Factors</div>
              <div className="pd-card-sub">Signals that could lower your prediction if not addressed</div>
            </div>
            {usingML && <span style={{ fontSize:9, fontWeight:700, background:'rgba(22,163,74,.14)', color:'#16a34a', padding:'3px 9px', borderRadius:99, flexShrink:0, alignSelf:'flex-start' }}>ML</span>}
          </div>
          <div className="pd-card-body">
            {(usingML && mlRiskFactors.length > 0
              ? mlRiskFactors.map(r => ({
                  title: r.factor, detail: r.detail,
                  sev: r.severity==='high' ? 'Critical' : r.severity==='medium' ? 'Watch' : 'Note',
                  color: r.severity==='high' ? '#dc2626' : r.severity==='medium' ? '#d97706' : '#3b82f6',
                  bg:    r.severity==='high' ? (dark?'rgba(220,38,38,.14)':'#fef2f2')
                       : r.severity==='medium' ? (dark?'rgba(217,119,6,.14)':'#fffbeb')
                       : (dark?'rgba(59,130,246,.14)':'#eff6ff'),
                }))
              : atRisk.length > 0
              ? atRisk.map(s => ({
                  title: `${s.label} section is ${s.current < s.cutoff - 10 ? 'critically' : ''} below cutoff`,
                  detail: `Current accuracy ${s.current}% vs ${s.cutoff}% cutoff. ${s.current < s.cutoff - 10 ? 'Needs urgent focus.' : 'Needs steady improvement.'}`,
                  sev: s.current < s.cutoff - 10 ? 'Critical' : 'Watch',
                  color: s.current < s.cutoff - 10 ? '#dc2626' : '#d97706',
                  bg: s.current < s.cutoff - 10 ? (dark?'rgba(220,38,38,.14)':'#fef2f2') : (dark?'rgba(217,119,6,.14)':'#fffbeb'),
                })).concat([{
                  title: 'Cutoff estimate uncertainty: ±3 marks',
                  detail: 'Cutoff predictions are trend-based. Aim for 5+ marks above the estimated cutoff to stay safe.',
                  sev: 'Note',
                  color: '#3b82f6',
                  bg: dark?'rgba(59,130,246,.14)':'#eff6ff',
                }])
              : [{
                  title: 'No major risk factors detected',
                  detail: 'Complete more tests to unlock detailed risk analysis.',
                  sev: 'Note',
                  color: '#3b82f6',
                  bg: dark?'rgba(59,130,246,.14)':'#eff6ff',
                }]
            ).map((r,i,arr) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10,
                paddingBottom: i<arr.length-1?13:0, borderBottom: i<arr.length-1?`1px solid ${border}`:'none',
                marginBottom: i<arr.length-1?13:0 }}>
                <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em',
                  padding:'3px 9px', borderRadius:99, background:r.bg, color:r.color, flexShrink:0, marginTop:1, whiteSpace:'nowrap' }}>
                  {r.sev}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:txt, marginBottom:3 }}>{r.title}</div>
                  {r.detail && <div style={{ fontSize:11, color:muted, lineHeight:1.5 }}>{r.detail}</div>}
                </div>
              </div>
            ))}
            {usingML && mlRiskFactors.length === 0 && (
              <div style={{ textAlign:'center', padding:'16px 0', color:'#16a34a', fontSize:13, fontWeight:600 }}>
                ✓ No critical risk factors detected
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
