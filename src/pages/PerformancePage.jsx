import { useState, useMemo } from 'react'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine,
} from 'recharts'

const _sv = c => ({ fill:'none', stroke:c||'currentColor', strokeWidth:'1.75', strokeLinecap:'round', strokeLinejoin:'round' })
const IcChart  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const IcTarget = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IcTrophy = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const IcStar   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IcZap    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IcCheck  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="20 6 9 17 4 12"/></svg>

const SEC_LABEL = {
  english:'English', numerical_ability:'Numerical Ability', quantitative_aptitude:'Quant',
  reasoning:'Reasoning', reasoning_computer_aptitude:'Reasoning',
  general_financial_awareness:'General Awareness', general_awareness:'General Awareness',
  data_analysis_interpretation:'Data Analysis', general_economy_banking:'General Awareness',
  general_english:'English',
}
const SEC_CUTOFF = {
  'English':70, 'Numerical Ability':65, 'Quant':65,
  'Reasoning':68, 'General Awareness':60, 'Data Analysis':60,
}
const RANGE_OPTIONS = [{ label:'7D', days:7 }, { label:'30D', days:30 }, { label:'All', days:0 }]

function ScoreTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1e293b', borderRadius:12, padding:'12px 16px', fontSize:12, color:'#fff', boxShadow:'0 8px 32px rgba(0,0,0,.35)', border:'1px solid rgba(255,255,255,.08)' }}>
      <div style={{ fontWeight:700, marginBottom:8, color:'#94a3b8', fontSize:11, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, display:'inline-block', flexShrink:0 }}/>
          {p.name === 'score' ? 'Score' : 'Readiness'}: {p.value}%
        </div>
      ))}
    </div>
  )
}

export default function PerformancePage({ history = [], user, darkMode = false, onNav, onOpenResult = null }) {
  const [rangeIdx, setRangeIdx] = useState(2)

  const filteredHistory = useMemo(() => {
    const days = RANGE_OPTIONS[rangeIdx].days
    if (!days) return history
    const cutoff = Date.now() - days * 86400000
    return history.filter(r => r.created_at && new Date(r.created_at).getTime() >= cutoff)
  }, [history, rangeIdx])

  const stats = useMemo(() => {
    const h = filteredHistory
    const totalTests  = h.length
    const avgScore    = totalTests ? Math.round(h.reduce((s,r)=>s+Number(r.percentage||0),0)/totalTests) : 0
    const totCorrect  = h.reduce((s,r)=>s+Number(r.correct_count||0),0)
    const totAnswered = h.reduce((s,r)=>s+Number(r.correct_count||0)+Number(r.wrong_count||0),0)
    const accuracy    = totAnswered ? Math.round(totCorrect/totAnswered*100) : 0
    const bestScore   = totalTests ? Math.round(Math.max(...h.map(r=>Number(r.percentage||0)))) : 0
    const improvement = h.length > 1
      ? Math.round(Number(h[0].percentage||0) - Number(h[h.length-1].percentage||0))
      : 0
    return { totalTests, avgScore, accuracy, bestScore, improvement }
  }, [filteredHistory])

  const scoreTrend = useMemo(() => {
    return [...filteredHistory].reverse().map((r,i) => ({
      name: r.created_at
        ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
        : `T${i+1}`,
      score:     Math.round(Number(r.percentage)||0),
      readiness: Math.round(Number(r.exam_readiness)||0),
    }))
  }, [filteredHistory])

  const sectionData = useMemo(() => {
    const secAgg = {}
    filteredHistory.forEach(r => Object.entries(r.section_scores||{}).forEach(([sec,v])=>{
      const lbl = SEC_LABEL[sec] || sec.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
      const acc = v?.accuracy!=null ? v.accuracy : (v?.total ? (v.correct/v.total*100) : 0)
      if (!secAgg[lbl]) secAgg[lbl]={sum:0,n:0}
      secAgg[lbl].sum+=acc; secAgg[lbl].n+=1
    }))
    return Object.entries(secAgg)
      .map(([sec,a])=>({ section:sec, accuracy:Math.round(a.sum/a.n), cutoff:SEC_CUTOFF[sec]||65 }))
      .sort((a,b)=>b.accuracy-a.accuracy)
  }, [filteredHistory])

  const answerBreak = useMemo(() => {
    const correct = filteredHistory.reduce((s,r)=>s+Number(r.correct_count||0),0)
    const wrong   = filteredHistory.reduce((s,r)=>s+Number(r.wrong_count||0),0)
    const skipped = filteredHistory.reduce((s,r)=>s+Number(r.skipped_count||0),0)
    const total   = correct + wrong + skipped
    return [
      { name:'Correct', value:correct, pct:total ? Math.round(correct/total*100):0, color:'#10b981' },
      { name:'Wrong',   value:wrong,   pct:total ? Math.round(wrong/total*100):0,   color:'#ef4444' },
      { name:'Skipped', value:skipped, pct:total ? Math.round(skipped/total*100):0, color:'#94a3b8' },
    ]
  }, [filteredHistory])

  const historyRows = useMemo(() => {
    const toTitle = s => (s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    return [...filteredHistory].map(r => ({
      ...r,
      displayName: r.test_type==='topic_diagnostic' ? `${toTitle(r.topic||'')}` :
                   (r.test_type==='mini'||r.test_type==='concept_mini') ? `${toTitle(r.topic||r.section||'')}` :
                   `${toTitle(r.exam||'Bank Exam')}`,
      pct:  Math.round(Number(r.percentage)||0),
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'}) : '—',
      badge: r.test_type==='topic_diagnostic' ? { label:'Topic',    bg:'rgba(112,72,232,.12)', col:'#7048E8' } :
             (r.test_type==='mini'||r.test_type==='concept_mini') ? { label:'Practice', bg:'rgba(22,163,74,.12)', col:'#16a34a' } :
             { label:'Mock', bg:'rgba(234,88,12,.12)', col:'#ea580c' },
    }))
  }, [filteredHistory])

  const dark   = darkMode
  const bg     = dark ? '#0b0f1a' : '#eef1f8'
  const card   = dark ? '#161d2e' : '#ffffff'
  const card2  = dark ? '#1a2236' : '#f8fafc'
  const border = dark ? 'rgba(255,255,255,.07)' : '#e2e8f0'
  const txt    = dark ? '#e8edf5' : '#0d1117'
  const muted  = dark ? '#8899b4' : '#64748b'
  const accent = '#F06535'
  const hasData = filteredHistory.length > 0
  const impDir  = stats.improvement > 0 ? '▲' : stats.improvement < 0 ? '▼' : '—'
  const impColor= stats.improvement > 0 ? '#10b981' : stats.improvement < 0 ? '#ef4444' : muted

  const kpis = [
    {
      label:'Tests Taken', value: hasData ? stats.totalTests : '—',
      icon:<IcChart s={20} c='#fff'/>, gradient:'linear-gradient(135deg,#3b82f6,#6366f1)',
      sub:'total attempts', glow:'rgba(99,102,241,.25)'
    },
    {
      label:'Best Score', value: hasData ? `${stats.bestScore}%` : '—',
      icon:<IcTrophy s={20} c='#fff'/>, gradient:'linear-gradient(135deg,#f59e0b,#ef4444)',
      sub:'highest ever', glow:'rgba(245,158,11,.25)'
    },
    {
      label:'Avg Score', value: hasData ? `${stats.avgScore}%` : '—',
      icon:<IcStar s={20} c='#fff'/>, gradient:'linear-gradient(135deg,#F06535,#ff9a6c)',
      sub:'across all tests', glow:'rgba(232,90,44,.25)'
    },
    {
      label:'Accuracy', value: hasData ? `${stats.accuracy}%` : '—',
      icon:<IcTarget s={20} c='#fff'/>, gradient:'linear-gradient(135deg,#10b981,#14b8a6)',
      sub:'correct / answered', glow:'rgba(16,185,129,.25)'
    },
  ]

  return (
    <div style={{ color:txt, fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif", background:bg, minHeight:'100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .pp-card{background:${card};border:1px solid ${border};border-radius:20px;padding:24px;box-shadow:0 1px 0 rgba(0,0,0,.04),0 4px 16px rgba(0,0,0,${dark?.1:.05}),0 16px 40px rgba(0,0,0,${dark?.08:.03})}
        .pp-range-pill{padding:7px 18px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid ${border};background:transparent;color:${muted};transition:all .15s;font-family:inherit;letter-spacing:.03em}
        .pp-range-pill.active{background:${accent};color:#fff;border-color:${accent};box-shadow:0 4px 16px rgba(232,90,44,.3)}
        .pp-range-pill:not(.active):hover{border-color:${accent};color:${accent}}
        .pp-sec-track{height:8px;border-radius:99px;background:${dark?'rgba(255,255,255,.06)':'#eef2f7'};position:relative;overflow:visible;margin:6px 0 4px}
        .pp-sec-fill{height:8px;border-radius:99px;transition:width .8s cubic-bezier(.4,0,.2,1)}
        .pp-hist-row{display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:14px;margin-bottom:6px;transition:all .15s;border:1px solid transparent;cursor:default}
        .pp-hist-row:hover{background:${card2};border-color:${border}}
        .pp-view-btn{padding:5px 14px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${border};background:transparent;color:${muted};transition:all .12s;font-family:inherit;white-space:nowrap;flex-shrink:0}
        .pp-view-btn:hover{border-color:${accent};color:${accent}}
        .pp-kpi-card{border-radius:20px;padding:22px;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden}
        @media(max-width:640px){
          .pp-kpi-grid{grid-template-columns:1fr 1fr!important}
          .pp-two-col{flex-direction:column!important}
        }
      `}</style>

      <div style={{ padding:'0 0 56px' }}>

        {/* ── Hero header ── */}
        <div style={{
          position:'relative', borderRadius:24, overflow:'hidden', marginBottom:20,
          background: dark
            ? 'linear-gradient(145deg,#111827 0%,#0d1520 60%,#0a1128 100%)'
            : 'linear-gradient(145deg,#1a1d2e 0%,#0f1623 100%)',
          boxShadow:'0 8px 40px rgba(0,0,0,.28)',
        }}>
          {/* decorative orbs */}
          <div style={{ position:'absolute',right:-60,top:-60,width:300,height:300,background:'radial-gradient(circle,rgba(232,90,44,.12) 0%,transparent 65%)',pointerEvents:'none' }}/>
          <div style={{ position:'absolute',left:100,bottom:-80,width:240,height:240,background:'radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 65%)',pointerEvents:'none' }}/>

          <div style={{ position:'relative', zIndex:1, padding:'28px 32px 24px' }}>
            {/* top row */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'rgba(232,90,44,.8)', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:8 }}>Analytics Dashboard</div>
              <h1 style={{ fontSize:26, fontWeight:900, margin:0, letterSpacing:'-.03em', color:'#fff', lineHeight:1.1 }}>My Performance</h1>
              <p style={{ margin:'6px 0 0', fontSize:13, color:'rgba(255,255,255,.4)', letterSpacing:'.01em' }}>Cutoff-aware section tracking &amp; trend analysis</p>
            </div>

            {/* KPI tiles */}
            <div className="pp-kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {kpis.map(k => (
                <div key={k.label} className="pp-kpi-card" style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', padding:'16px 18px', gap:0 }}>
                  <div style={{ position:'absolute', inset:0, background:k.gradient, opacity:.08, pointerEvents:'none' }}/>
                  <div style={{ position:'relative', zIndex:1 }}>
                    {/* icon + value on same row */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:36, height:36, borderRadius:11, background:k.gradient, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 14px ${k.glow}` }}>
                        {k.icon}
                      </div>
                      <div style={{ fontSize:28, fontWeight:900, color:'#fff', letterSpacing:'-.04em', lineHeight:1 }}>
                        {k.value}
                      </div>
                    </div>
                    {/* label + sub below */}
                    <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>{k.label}</div>
                    <div style={{ fontSize:10.5, color:'rgba(255,255,255,.3)' }}>{k.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trend badge */}
            {hasData && (
              <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:99, padding:'6px 14px' }}>
                  <span style={{ fontSize:13, fontWeight:900, color:impColor }}>{impDir} {Math.abs(stats.improvement)}%</span>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontWeight:600 }}>trend vs first test</span>
                </div>
                {stats.improvement > 0 && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.2)', borderRadius:99, padding:'6px 14px' }}>
                    <IcCheck s={12} c='#10b981'/>
                    <span style={{ fontSize:11, fontWeight:700, color:'#10b981' }}>You're improving!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Score Journey ── */}
        <div className="pp-card" style={{ marginBottom:18, padding:0, overflow:'hidden' }}>
          {/* Narrative banner */}
          <div style={{
            background: dark
              ? 'linear-gradient(135deg,rgba(232,90,44,.15) 0%,rgba(99,102,241,.09) 100%)'
              : 'linear-gradient(135deg,#fff8f5 0%,#f5f7ff 100%)',
            padding:'20px 24px 18px',
            borderBottom:`1px solid ${border}`,
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
              <div style={{ flex:'1 1 200px', minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:accent, marginBottom:6 }}>Score Journey</div>
                {hasData && scoreTrend.length > 0 ? (
                  <>
                    <div style={{ fontSize:20, fontWeight:800, color:txt, lineHeight:1.25, marginBottom:5 }}>
                      {scoreTrend.length === 1
                        ? `You scored ${scoreTrend[0].score}% in your first test`
                        : stats.improvement > 0
                          ? `Your score went up by +${stats.improvement}% across ${scoreTrend.length} tests`
                          : stats.improvement < 0
                            ? `Score dipped ${Math.abs(stats.improvement)}% — time to turn it around!`
                            : `Consistent at ${stats.avgScore}% across ${scoreTrend.length} tests`
                      }
                    </div>
                    <div style={{ fontSize:12.5, color:muted, lineHeight:1.5 }}>
                      {scoreTrend.length === 1
                        ? 'Take more tests to see your score trend over time.'
                        : stats.bestScore >= 65
                          ? `You've crossed the 65% cutoff — now maintain it consistently!`
                          : `You need ${Math.max(0, 65 - Math.round(stats.avgScore))}% more on average to clear the 65% cutoff.`
                      }
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:20, fontWeight:800, color:txt, marginBottom:5 }}>No tests yet</div>
                    <div style={{ fontSize:12.5, color:muted }}>Take your first test to start tracking your journey.</div>
                  </>
                )}
              </div>
              {hasData && scoreTrend.length > 1 && (
                <div style={{ display:'flex', gap:10, flexShrink:0, flexWrap:'wrap' }}>
                  {[
                    { label:'First Test', val:`${scoreTrend[0].score}%`, c:muted, bg:dark?'rgba(255,255,255,.06)':'rgba(100,116,139,.08)' },
                    { label:'Latest', val:`${scoreTrend[scoreTrend.length-1].score}%`, c:accent, bg:dark?'rgba(232,90,44,.14)':'rgba(232,90,44,.09)' },
                    { label:'Best Score', val:`${stats.bestScore}%`, c:'#10b981', bg:dark?'rgba(16,185,129,.14)':'rgba(16,185,129,.09)' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign:'center', background:m.bg, borderRadius:14, padding:'10px 18px', minWidth:82 }}>
                      <div style={{ fontSize:22, fontWeight:900, color:m.c, lineHeight:1, letterSpacing:'-.03em' }}>{m.val}</div>
                      <div style={{ fontSize:10.5, color:muted, marginTop:5, fontWeight:600 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div style={{ padding:'16px 16px 8px' }}>
            {hasData && scoreTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={scoreTrend} margin={{top:10,right:8,left:-18,bottom:0}}>
                  {(() => {
                    const yMax = Math.min(100, Math.max(75, stats.bestScore + 20))
                    const yTicks = [...new Set([0, 25, 50, 65, yMax].filter(t => t <= yMax))].sort((a,b)=>a-b)
                    return <>
                  <defs>
                    <linearGradient id="scoreAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F06535" stopOpacity={dark ? 0.45 : 0.28}/>
                      <stop offset="85%" stopColor="#F06535" stopOpacity={dark ? 0.06 : 0.03}/>
                      <stop offset="100%" stopColor="#F06535" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="scoreLineFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F06535"/>
                      <stop offset="100%" stopColor="#ff9a6c"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?'rgba(255,255,255,.05)':'#e8edf5'} vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:11,fill:muted,fontFamily:'Plus Jakarta Sans,sans-serif'}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0, yMax]} ticks={yTicks} tick={{fontSize:11,fill:muted,fontFamily:'Plus Jakarta Sans,sans-serif'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ScoreTooltip/>}/>
                  <ReferenceLine y={65} strokeDasharray="6 3" stroke='#10b981' strokeOpacity={0.5} label={{value:'65% Cutoff',fontSize:10,fill:'#10b981',position:'insideTopRight',dy:-5}}/>
                  <Area type="monotone" dataKey="score" stroke="url(#scoreLineFill)" strokeWidth={3} fill="url(#scoreAreaFill)" dot={{r:6,fill:accent,strokeWidth:2.5,stroke:dark?'#161d2e':'#fff'}} activeDot={{r:8,fill:accent,stroke:'#fff',strokeWidth:2}} name="Your Score"/>
                    </>
                  })()}
                </AreaChart>
              </ResponsiveContainer>
            ) : hasData && scoreTrend.length === 1 ? (
              <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:100 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:accent }}>{scoreTrend[0].score}%</div>
                    <div style={{ width:44, borderRadius:'6px 6px 0 0', background:'linear-gradient(180deg,#F06535,#ff9a6c)', height:`${scoreTrend[0].score}px` }}/>
                    <div style={{ fontSize:11, color:muted }}>You</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#10b981' }}>65%</div>
                    <div style={{ width:44, borderRadius:'6px 6px 0 0', background:dark?'rgba(16,185,129,.2)':'rgba(16,185,129,.15)', border:`2px dashed #10b981`, height:'65px' }}/>
                    <div style={{ fontSize:11, color:muted }}>Cutoff</div>
                  </div>
                </div>
                <div style={{ fontSize:12.5, color:muted, textAlign:'center' }}>Take more tests to see your score trend over time</div>
              </div>
            ) : (
              <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
                <div style={{ width:56, height:56, borderRadius:16, background:dark?'rgba(255,255,255,.05)':'#f4f6fa', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <IcChart s={24} c={muted}/>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:txt, marginBottom:4 }}>No test history yet</div>
                  <div style={{ color:muted, fontSize:12 }}>Take 2+ tests to see your score journey</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pp-two-col" style={{ display:'flex', gap:16, marginBottom:18 }}>

          {/* ── Section Performance ── */}
          <div className="pp-card" style={{ flex:'1 1 340px', minWidth:0 }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-.02em', color:txt }}>Section Performance</div>
              <div style={{ fontSize:12, color:muted, marginTop:3 }}>Avg accuracy vs cutoff · On Track / At Risk / Borderline</div>
            </div>
            {hasData && sectionData.length ? sectionData.map(s => {
              const above = s.accuracy >= s.cutoff + 5
              const below = s.accuracy < s.cutoff - 5
              const color  = above ? '#10b981' : below ? '#ef4444' : '#f59e0b'
              const badge  = above ? 'On Track' : below ? 'At Risk' : 'Borderline'
              const fillGrad = above ? 'linear-gradient(90deg,#10b981,#34d399)'
                             : below ? 'linear-gradient(90deg,#ef4444,#f87171)'
                             : 'linear-gradient(90deg,#f59e0b,#fbbf24)'
              const badgeBg  = above ? (dark?'rgba(16,185,129,.15)':'#f0fdf4')
                             : below ? (dark?'rgba(239,68,68,.15)':'#fef2f2')
                             : (dark?'rgba(245,158,11,.15)':'#fffbeb')
              return (
                <div key={s.section} style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:txt }}>{s.section}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:99, background:badgeBg, color }}>{badge}</span>
                      <span style={{ fontSize:16, fontWeight:900, color, letterSpacing:'-.03em', minWidth:42, textAlign:'right' }}>{s.accuracy}%</span>
                    </div>
                  </div>
                  <div className="pp-sec-track">
                    <div className="pp-sec-fill" style={{ width:`${s.accuracy}%`, background:fillGrad }}/>
                    <div style={{ position:'absolute', left:`${Math.min(s.cutoff,100)}%`, top:-4, width:2.5, height:16, background:dark?'rgba(255,255,255,.3)':'#94a3b8', borderRadius:2, transform:'translateX(-50%)' }}/>
                  </div>
                  <div style={{ fontSize:10.5, color:muted, marginTop:2 }}>
                    {above ? `${s.accuracy - s.cutoff}% above cutoff ✓` : below ? `${s.cutoff - s.accuracy}% below cutoff — focus needed` : `${s.cutoff - s.accuracy}% from cutoff`}
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding:'40px 0', textAlign:'center', color:muted, fontSize:13 }}>
                <IcTarget s={32} c={muted}/>
                <div style={{ marginTop:12 }}>Complete a test to see section analysis</div>
              </div>
            )}
          </div>

          {/* ── Answer Breakdown ── */}
          <div className="pp-card" style={{ flex:'0 0 240px', minWidth:0 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-.02em', color:txt }}>Answer Breakdown</div>
              <div style={{ fontSize:12, color:muted, marginTop:3 }}>Across all tests in range</div>
            </div>
            {hasData ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={answerBreak} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" strokeWidth={0} paddingAngle={2}>
                      {answerBreak.map(e => <Cell key={e.name} fill={e.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[`${v} (${answerBreak.find(a=>a.name===n)?.pct}%)`,n]} contentStyle={{ background:dark?'#1e293b':'#fff', border:`1px solid ${border}`, borderRadius:10, fontSize:12 }}/>
                  </PieChart>
                </ResponsiveContainer>
                {/* Accuracy label in center - simulate with absolute trick */}
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:12 }}>
                  {answerBreak.map(e => (
                    <div key={e.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:e.color, flexShrink:0 }}/>
                        <span style={{ fontSize:12.5, color:muted, fontWeight:500 }}>{e.name}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:muted }}>{e.value}</span>
                        <span style={{ fontSize:15, fontWeight:800, color:e.color, letterSpacing:'-.03em', minWidth:36, textAlign:'right' }}>{e.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Accuracy highlight */}
                {answerBreak[0].pct > 0 && (
                  <div style={{ marginTop:14, padding:'12px 16px', borderRadius:12, background:dark?'rgba(16,185,129,.08)':'#f0fdf4', border:`1px solid ${dark?'rgba(16,185,129,.2)':'#bbf7d0'}` }}>
                    <div style={{ fontSize:11, color:'#10b981', fontWeight:700 }}>
                      {answerBreak[0].pct}% answer accuracy
                    </div>
                    <div style={{ fontSize:10.5, color:muted, marginTop:2 }}>
                      {answerBreak[0].pct >= 70 ? 'Great accuracy! Maintain this.' : answerBreak[0].pct >= 50 ? 'Average — focus on quality.' : 'Low — attempt fewer, get more right.'}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding:'40px 0', textAlign:'center', color:muted, fontSize:13 }}>No data yet</div>
            )}
          </div>
        </div>

        {/* ── Confidence Analysis coming soon ── */}
        <div className="pp-card" style={{ marginBottom:18, position:'relative', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-.02em', color:txt }}>Confidence Analysis</div>
              <div style={{ fontSize:12, color:muted, marginTop:3 }}>6-state breakdown: how you answered each question (timing-based)</div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, background:dark?'rgba(255,255,255,.06)':'#f1f5f9', color:muted, padding:'5px 14px', borderRadius:99, letterSpacing:'.04em', border:`1px solid ${border}` }}>
              Coming Soon
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, opacity:.35, pointerEvents:'none', userSelect:'none' }}>
            {[
              { label:'Confident',    color:'#10b981', pct:38, desc:'Right on first instinct' },
              { label:'Slow-Correct', color:'#3b82f6', pct:18, desc:'Took time, got it right' },
              { label:'Careless',     color:'#f59e0b', pct:12, desc:'Should have known this' },
              { label:'Concept Gap',  color:'#8b5cf6', pct:14, desc:'Lacked the knowledge' },
              { label:'Guessing',     color:'#6b7280', pct:10, desc:'Without confidence' },
              { label:'Struggling',   color:'#ef4444', pct: 8, desc:'Needs focused revision' },
            ].map(c => (
              <div key={c.label} style={{ background:dark?'rgba(255,255,255,.03)':'#f8fafc', borderRadius:14, padding:'16px', border:`1px solid ${border}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }}/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:txt }}>{c.label}</span>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:c.color, letterSpacing:'-.03em', marginBottom:3 }}>{c.pct}%</div>
                <div style={{ fontSize:10.5, color:muted }}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:dark?'rgba(11,15,26,.78)':'rgba(244,246,250,.82)', backdropFilter:'blur(4px)' }}>
            <div style={{ textAlign:'center', background:card, borderRadius:18, padding:'20px 32px', border:`1px solid ${border}`, boxShadow:'0 8px 32px rgba(0,0,0,.1)' }}>
              <div style={{ width:44, height:44, borderRadius:14, background:dark?'rgba(232,90,44,.12)':'#fff8f5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                <IcZap s={22} c={accent}/>
              </div>
              <div style={{ fontSize:14, fontWeight:800, color:txt, marginBottom:4 }}>Confidence tagging coming soon</div>
              <div style={{ fontSize:12, color:muted }}>Requires per-question timing from future tests</div>
            </div>
          </div>
        </div>

        {/* ── Test History ── */}
        <div className="pp-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-.02em', color:txt }}>Test History</div>
              <div style={{ fontSize:12, color:muted, marginTop:3 }}>{hasData ? `${historyRows.length} test${historyRows.length!==1?'s':''} taken` : 'No tests yet'}</div>
            </div>
          </div>
          {hasData ? (
            <div>
              {/* Column headers */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 18px 10px', borderBottom:`1px solid ${border}`, marginBottom:8 }}>
                <span style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:'uppercase', letterSpacing:'.07em', flex:1 }}>Test</span>
                <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:'uppercase', letterSpacing:'.07em', minWidth:40, textAlign:'right' }}>Score</span>
                  <span style={{ fontSize:10.5, fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:'.07em', minWidth:32, textAlign:'right' }}>Cor</span>
                  <span style={{ fontSize:10.5, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:'.07em', minWidth:32, textAlign:'right' }}>Wrg</span>
                  <span style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:'uppercase', letterSpacing:'.07em', minWidth:36, textAlign:'right' }}>Acc</span>
                  {onOpenResult && <span style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:'uppercase', letterSpacing:'.07em', minWidth:44, textAlign:'right' }}></span>}
                </div>
              </div>
              {historyRows.map((r,i) => {
                const acc = (r.correct_count||0)+(r.wrong_count||0) > 0
                  ? Math.round(r.correct_count/(r.correct_count+r.wrong_count)*100) : 0
                const pctColor = r.pct>=70 ? '#10b981' : r.pct>=50 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} className="pp-hist-row">
                    <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:99, background:r.badge.bg, color:r.badge.col, whiteSpace:'nowrap', flexShrink:0 }}>
                      {r.badge.label}
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:txt, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.displayName}</div>
                      <div style={{ fontSize:11, color:muted, marginTop:2 }}>{r.date}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
                      <span style={{ fontWeight:900, color:pctColor, fontSize:16, letterSpacing:'-.03em', minWidth:40, textAlign:'right' }}>{r.pct}%</span>
                      <span style={{ color:'#10b981', fontWeight:700, fontSize:12, minWidth:32, textAlign:'right' }}>{r.correct_count||0}</span>
                      <span style={{ color:'#ef4444', fontWeight:700, fontSize:12, minWidth:32, textAlign:'right' }}>{r.wrong_count||0}</span>
                      <span style={{ color:muted, fontSize:12, minWidth:36, textAlign:'right' }}>{acc}%</span>
                      {onOpenResult && (
                        <button className="pp-view-btn" onClick={() => onOpenResult(r)}>View</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding:'60px 0', textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:22, background:dark?'rgba(255,255,255,.04)':'#f4f6fa', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <IcChart s={36} c={muted}/>
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:txt, marginBottom:6 }}>No tests yet</div>
              <div style={{ fontSize:13, color:muted }}>Complete your first test to unlock performance analytics</div>
              {onNav && (
                <button onClick={()=>onNav('explore')} style={{ marginTop:20, background:accent, color:'#fff', border:'none', borderRadius:12, padding:'11px 24px', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,90,44,.3)' }}>
                  Start a Test →
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
