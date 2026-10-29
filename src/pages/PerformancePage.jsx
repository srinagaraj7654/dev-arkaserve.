import { useState, useMemo } from 'react'
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine,
} from 'recharts'

const _sv = c => ({ fill:'none', stroke:c||'currentColor', strokeWidth:'1.5', strokeLinecap:'round', strokeLinejoin:'round' })
const IcChart  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const IcTarget = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IcTrophy = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const IcStar   = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IcZap    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>

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
    <div style={{ background:'#1f2937', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,.25)' }}>
      <div style={{ fontWeight:700, marginBottom:6, color:'#e5e7eb' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color, fontWeight:600 }}>
          {p.name === 'score' ? 'Score' : 'Readiness'}: {p.value}%
        </div>
      ))}
    </div>
  )
}

export default function PerformancePage({ history = [], user, darkMode = false, onNav }) {
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
      badge: r.test_type==='topic_diagnostic' ? { label:'Topic',    bg:'#f3f0ff', col:'#7048E8' } :
             (r.test_type==='mini'||r.test_type==='concept_mini') ? { label:'Practice', bg:'#f0fdf4', col:'#16a34a' } :
             { label:'Mock', bg:'#fff7ed', col:'#ea580c' },
    }))
  }, [filteredHistory])

  const dark   = darkMode
  const bg     = dark ? '#0f172a' : '#f8fafc'
  const card   = dark ? '#1e293b' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,.08)' : '#eef0f3'
  const txt    = dark ? '#f1f5f9' : '#111827'
  const muted  = dark ? '#94a3b8' : '#6b7280'
  const accent = '#FF653F'
  const hasData = filteredHistory.length > 0
  const impDir  = stats.improvement > 0 ? '▲' : stats.improvement < 0 ? '▼' : '—'
  const impColor= stats.improvement > 0 ? '#10b981' : stats.improvement < 0 ? '#ef4444' : muted

  return (
    <div style={{ color:txt, fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif", background:bg, minHeight:'100%' }}>
      <style>{`
        .pp-card{background:${card};border:1.5px solid ${border};border-radius:20px;padding:22px;box-shadow:0 2px 16px rgba(0,0,0,${dark?.07:.04})}
        .pp-range-pill{padding:6px 15px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid ${border};background:transparent;color:${muted};transition:all .15s;font-family:inherit;letter-spacing:.03em}
        .pp-range-pill.active{background:${accent};color:#fff;border-color:${accent};box-shadow:0 3px 12px rgba(255,101,63,.28)}
        .pp-range-pill:not(.active):hover{border-color:${accent};color:${accent}}
        .pp-sec-track{height:10px;border-radius:5px;background:${dark?'rgba(255,255,255,.07)':'#f1f5f9'};position:relative;overflow:visible}
        .pp-sec-fill{height:10px;border-radius:5px;transition:width .7s cubic-bezier(.4,0,.2,1)}
        .pp-hist-row{display:flex;align-items:center;gap:12px;padding:13px 16px;background:${card};border:1.5px solid ${border};border-radius:14px;margin-bottom:8px;transition:box-shadow .12s,border-color .12s}
        .pp-hist-row:hover{box-shadow:0 2px 14px rgba(255,101,63,.1);border-color:#fec9b0}
        .pp-stat-card{background:${card};border:1.5px solid ${border};border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:8px;box-shadow:0 2px 12px rgba(0,0,0,${dark?.06:.03})}
        @media(max-width:640px){
          .pp-stats-grid{grid-template-columns:1fr 1fr!important}
          .pp-two-col{flex-direction:column!important}
        }
      `}</style>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'0 0 52px' }}>

        {/* ── Premium header card ── */}
        <div style={{
          position:'relative', borderRadius:22, overflow:'hidden',
          background: dark
            ? 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)'
            : 'linear-gradient(135deg,#fff8f5 0%,#fff3ee 55%,#fef2ef 100%)',
          border:`1.5px solid ${dark?'rgba(255,101,63,.18)':'#ffdece'}`,
          boxShadow:'0 4px 28px rgba(255,101,63,.08)',
          marginBottom:24,
        }}>
          <div style={{ position:'absolute',left:0,top:0,bottom:0,width:5,background:'linear-gradient(180deg,#FF653F 0%,#ff9c68 100%)' }}/>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,padding:'22px 24px 22px 30px' }}>
            <div>
              <div style={{ fontSize:10.5,fontWeight:800,color:accent,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:7 }}>Analytics</div>
              <h1 style={{ fontSize:20,fontWeight:900,margin:0,letterSpacing:'-.025em',color:txt }}>My Performance</h1>
              <p style={{ margin:'5px 0 0',fontSize:12.5,color:muted }}>Cutoff-aware section tracking &amp; trend analysis</p>
            </div>
            <div style={{ display:'flex',gap:6 }}>
              {RANGE_OPTIONS.map((o,i) => (
                <button key={o.label} className={`pp-range-pill${rangeIdx===i?' active':''}`} onClick={()=>setRangeIdx(i)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {hasData && (
            <div style={{ display:'flex',gap:10,padding:'12px 24px 14px 30px',borderTop:`1px solid ${dark?'rgba(255,255,255,.06)':'rgba(255,101,63,.08)'}`,flexWrap:'wrap' }}>
              {[
                { label:'Tests',     value:stats.totalTests },
                { label:'Best',      value:`${stats.bestScore}%` },
                { label:'Avg',       value:`${stats.avgScore}%` },
                { label:'Trend',     value:`${impDir} ${Math.abs(stats.improvement)}%`, color:impColor },
              ].map(c => (
                <div key={c.label} style={{ background:'rgba(255,255,255,.88)',backdropFilter:'blur(8px)',borderRadius:10,padding:'7px 14px',display:'flex',flexDirection:'column',alignItems:'center',gap:1 }}>
                  <div style={{ fontSize:16,fontWeight:900,color:c.color||txt,letterSpacing:'-.025em',lineHeight:1 }}>{c.value}</div>
                  <div style={{ fontSize:9.5,fontWeight:800,color:'#999',textTransform:'uppercase',letterSpacing:'.09em' }}>{c.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="pp-stats-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
          {[
            { label:'Tests Taken', value:stats.totalTests,     sub:'total attempts',    icon:<IcChart s={18} c='#3b82f6'/>,  accent:'#3b82f6', ibg:dark?'rgba(59,130,246,.14)':'#eff6ff' },
            { label:'Avg Score',   value:`${stats.avgScore}%`, sub:'across all tests',  icon:<IcTrophy s={18} c='#7c3aed'/>, accent:'#7c3aed', ibg:dark?'rgba(124,58,237,.14)':'#f5f3ff' },
            { label:'Accuracy',    value:`${stats.accuracy}%`, sub:'correct / answered',icon:<IcTarget s={18} c={accent}/>,  accent,           ibg:dark?'rgba(255,101,63,.14)':'#fff7ed' },
            { label:'Best Score',  value:`${stats.bestScore}%`,sub:'highest ever',      icon:<IcStar s={18} c='#10b981'/>,   accent:'#10b981', ibg:dark?'rgba(16,185,129,.14)':'#f0fdf4' },
          ].map(s => (
            <div key={s.label} className="pp-stat-card">
              <div style={{ width:34,height:34,borderRadius:10,background:s.ibg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                {s.icon}
              </div>
              <div style={{ fontSize:26,fontWeight:900,color:s.accent,letterSpacing:'-.035em',lineHeight:1 }}>
                {hasData ? s.value : '—'}
              </div>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:txt,textTransform:'uppercase',letterSpacing:'.06em' }}>{s.label}</div>
                <div style={{ fontSize:10.5,color:muted,marginTop:2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Score Trend ── */}
        <div className="pp-card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10 }}>
            <div>
              <div style={{ fontSize:14,fontWeight:800,letterSpacing:'-.015em' }}>Score Trend</div>
              <div style={{ fontSize:11.5,color:muted,marginTop:3 }}>Your progress over time · dashed line = 65% cutoff</div>
            </div>
            <div style={{ display:'flex',gap:14,fontSize:11,color:muted }}>
              <span style={{ display:'flex',alignItems:'center',gap:5 }}>
                <span style={{ width:18,height:3,background:accent,borderRadius:2,display:'inline-block' }}/>Score
              </span>
              <span style={{ display:'flex',alignItems:'center',gap:5 }}>
                <span style={{ width:18,height:3,background:'#3b82f6',borderRadius:2,display:'inline-block',opacity:.6 }}/>Readiness
              </span>
            </div>
          </div>
          {hasData && scoreTrend.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scoreTrend} margin={{top:5,right:16,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark?'rgba(255,255,255,.06)':'#f1f5f9'} vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:muted}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{fontSize:11,fill:muted}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ScoreTooltip/>}/>
                <ReferenceLine y={65} strokeDasharray="6 3" stroke={dark?'#475569':'#d1d5db'} label={{value:'Cutoff',fontSize:10,fill:muted,position:'right'}}/>
                <Line type="monotone" dataKey="score" stroke={accent} strokeWidth={2.5} dot={{r:3,fill:accent,strokeWidth:0}} activeDot={{r:5}} name="score"/>
                <Line type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="readiness" opacity={0.6}/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:10 }}>
              <IcChart s={36} c={muted}/>
              <div style={{ color:muted,fontSize:13 }}>Take 2+ tests to see your score trend</div>
            </div>
          )}
        </div>

        <div className="pp-two-col" style={{ display:'flex',gap:16,marginBottom:20 }}>

          {/* ── Section Performance ── */}
          <div className="pp-card" style={{ flex:'1 1 300px',minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:800,marginBottom:3,letterSpacing:'-.015em' }}>Section Performance</div>
            <div style={{ fontSize:11.5,color:muted,marginBottom:18 }}>Avg accuracy · tick = cutoff target</div>
            {hasData && sectionData.length ? sectionData.map(s => {
              const above = s.accuracy >= s.cutoff + 5
              const below = s.accuracy < s.cutoff - 5
              const color  = above ? '#10b981' : below ? '#ef4444' : '#f59e0b'
              const badge  = above ? 'On Track' : below ? 'At Risk' : 'Border'
              const badgeBg= above ? (dark?'rgba(16,185,129,.14)':'#f0fdf4')
                           : below ? (dark?'rgba(239,68,68,.14)':'#fef2f2')
                           : (dark?'rgba(245,158,11,.14)':'#fffbeb')
              return (
                <div key={s.section} style={{ marginBottom:16 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7 }}>
                    <span style={{ fontSize:12.5,fontWeight:700,color:txt }}>{s.section}</span>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:6,background:badgeBg,color }}>{badge}</span>
                      <span style={{ fontSize:14,fontWeight:900,color,letterSpacing:'-.02em' }}>{s.accuracy}%</span>
                    </div>
                  </div>
                  <div className="pp-sec-track">
                    <div className="pp-sec-fill" style={{ width:`${s.accuracy}%`,background:color }}/>
                    <div style={{ position:'absolute',left:`${Math.min(s.cutoff,100)}%`,top:-5,width:2.5,height:20,background:dark?'#64748b':'#94a3b8',borderRadius:2 }}/>
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding:'32px 0',textAlign:'center',color:muted,fontSize:13 }}>Complete a test to see section analysis</div>
            )}
          </div>

          {/* ── Answer Breakdown ── */}
          <div className="pp-card" style={{ flex:'0 0 220px',minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:800,marginBottom:3,letterSpacing:'-.015em' }}>Answer Breakdown</div>
            <div style={{ fontSize:11.5,color:muted,marginBottom:12 }}>Across all tests in range</div>
            {hasData ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={answerBreak} cx="50%" cy="50%" innerRadius={44} outerRadius={64} dataKey="value" strokeWidth={0}>
                      {answerBreak.map(e => <Cell key={e.name} fill={e.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[`${v} (${answerBreak.find(a=>a.name===n)?.pct}%)`,n]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex',flexDirection:'column',gap:9,marginTop:10 }}>
                  {answerBreak.map(e => (
                    <div key={e.name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ width:9,height:9,borderRadius:3,background:e.color,flexShrink:0 }}/>
                        <span style={{ fontSize:12,color:muted }}>{e.name}</span>
                      </div>
                      <span style={{ fontSize:14,fontWeight:900,color:e.color,letterSpacing:'-.02em' }}>{e.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding:'32px 0',textAlign:'center',color:muted,fontSize:13 }}>No data yet</div>
            )}
          </div>
        </div>

        {/* ── Confidence Analysis coming soon ── */}
        <div className="pp-card" style={{ marginBottom:20,position:'relative',overflow:'hidden' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8 }}>
            <div>
              <div style={{ fontSize:14,fontWeight:800,letterSpacing:'-.015em' }}>Confidence Analysis</div>
              <div style={{ fontSize:11.5,color:muted,marginTop:3 }}>6-state breakdown: how you answered each question</div>
            </div>
            <span style={{ fontSize:11,fontWeight:700,background:dark?'rgba(255,255,255,.07)':'#f3f4f6',color:muted,padding:'4px 12px',borderRadius:20,letterSpacing:'.04em' }}>
              Coming Soon
            </span>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,opacity:.38,pointerEvents:'none',userSelect:'none' }}>
            {[
              { label:'Confident',    color:'#10b981', pct:38, desc:'Right on first instinct' },
              { label:'Slow-Correct', color:'#3b82f6', pct:18, desc:'Took time, got it right' },
              { label:'Careless',     color:'#f59e0b', pct:12, desc:'Should have known this' },
              { label:'Concept Gap',  color:'#8b5cf6', pct:14, desc:'Lacked the knowledge' },
              { label:'Guessing',     color:'#6b7280', pct:10, desc:'Without confidence' },
              { label:'Struggling',   color:'#ef4444', pct: 8, desc:'Needs focused revision' },
            ].map(c => (
              <div key={c.label} style={{ background:dark?'rgba(255,255,255,.04)':'#f8fafc',borderRadius:12,padding:'14px 16px',border:`1.5px solid ${border}` }}>
                <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:6 }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:c.color }}/>
                  <span style={{ fontSize:11,fontWeight:700,color:txt }}>{c.label}</span>
                </div>
                <div style={{ fontSize:20,fontWeight:900,color:c.color,letterSpacing:'-.03em' }}>{c.pct}%</div>
                <div style={{ fontSize:10.5,color:muted,marginTop:3 }}>{c.desc}</div>
              </div>
            ))}
          </div>
          {/* overlay */}
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:dark?'rgba(15,23,42,.72)':'rgba(248,250,252,.76)',backdropFilter:'blur(3px)' }}>
            <div style={{ textAlign:'center',background:card,borderRadius:16,padding:'16px 28px',border:`1.5px solid ${border}`,boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
              <IcZap s={22} c={accent}/>
              <div style={{ fontSize:13,fontWeight:800,color:txt,marginTop:8,marginBottom:4 }}>Confidence tagging coming soon</div>
              <div style={{ fontSize:12,color:muted }}>Requires per-question timing data from future tests</div>
            </div>
          </div>
        </div>

        {/* ── Test History ── */}
        <div className="pp-card">
          <div style={{ fontSize:14,fontWeight:800,marginBottom:16,letterSpacing:'-.015em' }}>Test History</div>
          {hasData ? (
            <div>
              {historyRows.slice(0,15).map((r,i) => {
                const acc = (r.correct_count||0)+(r.wrong_count||0) > 0
                  ? Math.round(r.correct_count/(r.correct_count+r.wrong_count)*100) : 0
                const pctColor = r.pct>=70 ? '#10b981' : r.pct>=50 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} className="pp-hist-row">
                    <span style={{ fontSize:10.5,fontWeight:700,padding:'3px 9px',borderRadius:6,background:r.badge.bg,color:r.badge.col,whiteSpace:'nowrap',flexShrink:0 }}>
                      {r.badge.label}
                    </span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12.5,fontWeight:700,color:txt,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.displayName}</div>
                      <div style={{ fontSize:11,color:muted,marginTop:2 }}>{r.date}</div>
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:14,flexShrink:0 }}>
                      <span style={{ fontWeight:900,color:pctColor,fontSize:15,letterSpacing:'-.02em' }}>{r.pct}%</span>
                      <span style={{ color:'#10b981',fontWeight:700,fontSize:12 }}>✓{r.correct_count||0}</span>
                      <span style={{ color:'#ef4444',fontWeight:700,fontSize:12 }}>✗{r.wrong_count||0}</span>
                      <span style={{ color:muted,fontSize:12 }}>{acc}%</span>
                    </div>
                  </div>
                )
              })}
              {historyRows.length > 15 && (
                <div style={{ textAlign:'center',marginTop:14,fontSize:12,color:muted,paddingTop:6,borderTop:`1px solid ${border}` }}>
                  Showing 15 of {historyRows.length} tests
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding:'52px 0',textAlign:'center' }}>
              <IcChart s={40} c={muted}/>
              <div style={{ marginTop:12,fontSize:15,fontWeight:800,color:txt }}>No tests yet</div>
              <div style={{ fontSize:13,color:muted,marginTop:4 }}>Complete your first test to unlock performance analytics</div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
