import { useState } from "react"

const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const UPIcSchool = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
const UPIcGrad   = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const UPIcStar   = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const UPIcTrophy = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const UPIcSearch = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const UPIcBook   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const UPIcBolt   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const UPIcDoc    = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const UPIcFlame  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const UPIcClock  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const UPIcDice   = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 8h.01M8 8h.01M8 16h.01M16 16h.01M12 12h.01"/></svg>

/* ─────────────────────────────────────────────────────────────────
   Sample student: SAT taker, 11th grade, aiming for UCs + possible Ivy
   ───────────────────────────────────────────────────────────────── */
const SAMPLE = {
  name:       "Jordan Lee",
  exam:       "SAT",
  grade:      "11th",
  testDate:   "March 2025",

  // Current composite
  score:      1240,
  scoreRange: [1200, 1600],

  // Section scores (SAT: EBRW + Math, each 200–800)
  sections: [
    { id:"ebrw",  label:"Reading & Writing", score:620, max:800, target:700, color:"#3b82f6",
      topics:[
        { name:"Standard English Conventions", acc:82, time:38, state:"confident",   impact:0 },
        { name:"Craft & Structure",             acc:64, time:55, state:"slow",        impact:18 },
        { name:"Information & Ideas",           acc:48, time:72, state:"concept_gap", impact:30 },
        { name:"Expression of Ideas",           acc:55, time:60, state:"moderate",    impact:22 },
      ]
    },
    { id:"math",  label:"Math", score:620, max:800, target:680, color:"#8b5cf6",
      topics:[
        { name:"Algebra",                acc:88, time:40, state:"confident",   impact:0  },
        { name:"Advanced Math",          acc:58, time:68, state:"slow",        impact:25 },
        { name:"Problem Solving & Data", acc:44, time:80, state:"concept_gap", impact:35 },
        { name:"Geometry & Trig",        acc:50, time:65, state:"moderate",    impact:20 },
      ]
    },
  ],

  // Projected score if top 3 issues fixed
  projected: 1360,
  projectedRange: "1320–1400",

  // College score benchmarks
  collegeTargets: [
    { name:"Community College",   range:"900–1100",  min:900,  max:1100, icon:<UPIcSchool s={20} c='#6b7280'/>, tier:"safety"    },
    { name:"State University",    range:"1050–1200", min:1050, max:1200, icon:<UPIcGrad   s={20} c='#6b7280'/>, tier:"safety"    },
    { name:"UC System (avg)",     range:"1200–1400", min:1200, max:1400, icon:<UPIcStar   s={20} c='#6b7280'/>, tier:"target"    },
    { name:"Top 30 Nationals",    range:"1350–1500", min:1350, max:1500, icon:<UPIcFlame  s={20} c='#6b7280'/>, tier:"reach"     },
    { name:"Ivy League / MIT",    range:"1500–1600", min:1500, max:1600, icon:<UPIcTrophy s={20} c='#6b7280'/>, tier:"reach"     },
  ],

  // Percentile context
  percentile:   74,     // approx for 1240 SAT
  projPercentile: 88,   // approx for 1360 SAT

  // Priority actions
  nextSteps: [
    { priority:1, section:"Math",           topic:"Problem Solving & Data", state:"concept_gap", gain:"+35 pts", why:"Slow + wrong — needs concept work on statistics and ratios" },
    { priority:2, section:"Reading/Writing",topic:"Information & Ideas",    state:"concept_gap", gain:"+30 pts", why:"Inference questions answered incorrectly — need passage strategy" },
    { priority:3, section:"Reading/Writing",topic:"Craft & Structure",      state:"slow",        gain:"+18 pts", why:"Correct but slow — timed drills will unlock 15+ extra seconds per Q" },
    { priority:4, section:"Math",           topic:"Advanced Math",          state:"slow",        gain:"+25 pts", why:"Function composition & quadratics need speed drilling" },
  ],

  // Time stats
  timeStats: {
    avgSecsPerQ:  68,
    targetSecs:   55,
    sunkTopics: [
      { name:"Problem Solving & Data", avg:80, target:50 },
      { name:"Information & Ideas",    avg:72, target:50 },
    ]
  },

  // Strengths
  strengths: [
    { topic:"Standard English Conventions", section:"Reading/Writing", acc:82 },
    { topic:"Algebra",                       section:"Math",           acc:88 },
  ],
}

/* ─────────────────────────────────────────────────────────────────
   State metadata (mirrors Indian engine's CONF_META)
   ───────────────────────────────────────────────────────────────── */
const STATE_META = {
  confident:   { color:"#10b981", bg:"#d1fae5", label:"Strong",         icon:"✓", desc:"Correct + fast. Maintain with mixed practice."             },
  slow:        { color:"#f59e0b", bg:"#fef3c7", label:"Knows But Slow", icon:"⏱", desc:"Getting it right but taking too long. Timed drills needed." },
  concept_gap: { color:"#ef4444", bg:"#fee2e2", label:"Concept Gap",    icon:"B", desc:"Slow and wrong. Needs concept review before speed work."   },
  moderate:    { color:"#6b7280", bg:"#f3f4f6", label:"Developing",     icon:"~",  desc:"Mixed results. More practice data needed."                },
  guessing:    { color:"#dc2626", bg:"#fee2e2", label:"Guessing",       icon:"?", desc:"Fast + wrong. Stop rushing — review the concept."         },
}

const TIER_META = {
  safety: { color:"#10b981", bg:"#d1fae5", label:"Safety" },
  target: { color:"#3b82f6", bg:"#dbeafe", label:"Target" },
  reach:  { color:"#ef4444", bg:"#fee2e2", label:"Reach"  },
}

/* ─────────────────────────────────────────────────────────────────
   Small shared components
   ───────────────────────────────────────────────────────────────── */
function Card({ title, subtitle, children, accent }) {
  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:12 }}>
        {accent && <div style={{ width:4, height:24, borderRadius:4, background:accent, flexShrink:0 }} />}
        <div>
          <div style={{ fontWeight:700, color:"#111", fontSize:14 }}>{title}</div>
          {subtitle && <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  )
}

function Badge({ label, color, bg, size = 11 }) {
  return (
    <span style={{ fontSize:size, fontWeight:700, padding:"2px 8px", borderRadius:20, color, background:bg, whiteSpace:"nowrap" }}>
      {label}
    </span>
  )
}

function ScoreGauge({ score, max, color, label }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ position:"relative", width:88, height:88, margin:"0 auto 8px" }}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="36" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2*Math.PI*36}`}
            strokeDashoffset={`${2*Math.PI*36*(1 - pct/100)}`}
            strokeLinecap="round"
            transform="rotate(-90 44 44)" />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:18, fontWeight:800, color:"#111" }}>{score}</div>
          <div style={{ fontSize:9, color:"#9ca3af" }}>/{max}</div>
        </div>
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{label}</div>
    </div>
  )
}

function ProgressBar({ value, max, color, height = 8 }) {
  return (
    <div style={{ background:"#f3f4f6", borderRadius:99, overflow:"hidden", height }}>
      <div style={{ width:`${Math.min(100, Math.round(value/max*100))}%`, height:"100%", background:color, borderRadius:99, transition:"width .4s" }} />
    </div>
  )
}

function ScoreBar({ score, projected, min, max, color }) {
  const toP = v => `${Math.round((v - min) / (max - min) * 100)}%`
  return (
    <div style={{ position:"relative", height:28, margin:"8px 0" }}>
      {/* track */}
      <div style={{ position:"absolute", top:10, left:0, right:0, height:8, background:"#f3f4f6", borderRadius:99 }} />
      {/* projected range fill */}
      <div style={{ position:"absolute", top:10, left:toP(SAMPLE.score-40), width:`${Math.round((projected+40 - (score-40))/(max-min)*100)}%`, height:8, background:color+"33", borderRadius:99 }} />
      {/* current score pin */}
      <div style={{ position:"absolute", top:6, left:toP(score), transform:"translateX(-50%)", width:16, height:16, borderRadius:99, background:color, border:"3px solid #fff", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
      {/* projected pin */}
      <div style={{ position:"absolute", top:6, left:toP(projected), transform:"translateX(-50%)", width:16, height:16, borderRadius:99, background:"#10b981", border:"3px solid #fff", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
      {/* labels */}
      <div style={{ position:"absolute", top:22, left:toP(score), transform:"translateX(-50%)", fontSize:9, fontWeight:700, color }}>NOW</div>
      <div style={{ position:"absolute", top:22, left:toP(projected), transform:"translateX(-50%)", fontSize:9, fontWeight:700, color:"#10b981" }}>GOAL</div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   NAV TABS
   ───────────────────────────────────────────────────────────────── */
const TABS = [
  { id:"overview",  label:"Overview"      },
  { id:"sections",  label:"By Section"    },
  { id:"colleges",  label:"College Fit"   },
  { id:"plan",      label:"Action Plan"   },
  { id:"howit",     label:"How It Works"  },
]

/* ─────────────────────────────────────────────────────────────────
   MAIN
   ───────────────────────────────────────────────────────────────── */
export default function USPredictionExplainer() {
  const [tab, setTab] = useState("overview")
  const d = SAMPLE

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── HERO HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 60%,#2563eb 100%)", color:"#fff", padding:"28px 16px 24px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
            MockTest · US Exams · Score Prediction
          </div>
          <h1 style={{ fontSize:"clamp(18px,4vw,26px)", fontWeight:900, margin:"0 0 4px", lineHeight:1.2 }}>
            Your SAT Score Prediction Report
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.65)", margin:"0 0 20px" }}>
            Student: <strong style={{ color:"#fff" }}>{d.name}</strong> · {d.exam} · {d.grade} Grade · Test Date: {d.testDate}
          </p>

          {/* Score headline */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
            {[
              { label:"Current Score",    val:d.score,    sub:`${d.percentile}th percentile`, color:"#93c5fd" },
              { label:"Projected Score",  val:d.projected, sub:`${d.projPercentile}th percentile`, color:"#86efac" },
              { label:"Score Gap",        val:`+${d.projected - d.score}`, sub:"potential gain", color:"#fcd34d" },
            ].map(({ label, val, sub, color }) => (
              <div key={label} style={{ background:"rgba(255,255,255,.1)", borderRadius:14, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:30, fontWeight:900, color }}>{val}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.5)" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", overflowX:"auto" }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:"0 0 auto", padding:"13px 18px", fontSize:12, fontWeight:600,
                color: tab === t.id ? "#1d4ed8" : "#6b7280",
                borderBottom: tab === t.id ? "2px solid #1d4ed8" : "2px solid transparent",
                background:"none", border:"none", borderBottom: tab === t.id ? "2px solid #1d4ed8" : "2px solid transparent",
                cursor:"pointer", whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 48px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (<>

          {/* Score visualiser */}
          <Card title="Your SAT Score Range" subtitle="Current vs. projected with consistent practice" accent="#1d4ed8">
            <div style={{ marginBottom:8 }}>
              <ScoreBar score={d.score} projected={d.projected} min={400} max={1600} color="#1d4ed8" />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#9ca3af", marginTop:4 }}>
                <span>400</span><span>800</span><span>1000</span><span>1200</span><span>1400</span><span>1600</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
              {d.sections.map(s => (
                <div key={s.id} style={{ background:"#f9fafb", borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:11, color:"#6b7280", marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.score}</div>
                  <div style={{ fontSize:10, color:"#9ca3af", marginBottom:8 }}>of 800 · target: {s.target}</div>
                  <ProgressBar value={s.score} max={800} color={s.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Percentile context */}
          <Card title="Percentile Context" subtitle="Where you stand among all SAT test-takers" accent="#6366f1">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ textAlign:"center", padding:16, background:"#f9fafb", borderRadius:12 }}>
                <div style={{ fontSize:32, fontWeight:900, color:"#1d4ed8" }}>{d.percentile}<span style={{ fontSize:16 }}>%ile</span></div>
                <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>Your current score ({d.score})</div>
                <div style={{ fontSize:10, color:"#9ca3af" }}>Better than {d.percentile}% of test-takers</div>
              </div>
              <div style={{ textAlign:"center", padding:16, background:"#f0fdf4", borderRadius:12 }}>
                <div style={{ fontSize:32, fontWeight:900, color:"#10b981" }}>{d.projPercentile}<span style={{ fontSize:16 }}>%ile</span></div>
                <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>Projected score ({d.projected})</div>
                <div style={{ fontSize:10, color:"#9ca3af" }}>+{d.projPercentile - d.percentile} percentile points</div>
              </div>
            </div>
            <div style={{ marginTop:14, padding:12, background:"#eff6ff", borderRadius:10, fontSize:12, color:"#1e40af", lineHeight:1.6 }}>
              <strong>Why does +{d.projected - d.score} points matter?</strong><br />
              Moving from {d.score} to ~{d.projected} lifts you from the <strong>{d.percentile}th</strong> to the <strong>{d.projPercentile}th</strong> percentile — a jump of {d.projPercentile - d.percentile} percentile points that opens UC-level admissions and qualifies you for merit scholarships at many schools.
            </div>
          </Card>

          {/* Strengths */}
          <Card title="Your Strengths" subtitle="Topics where you are already performing well" accent="#10b981">
            {d.strengths.map((s, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 12px", background:"#f0fdf4", borderRadius:10, marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.topic}</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>{s.section}</div>
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:"#10b981" }}>{s.acc}%</div>
              </div>
            ))}
            <div style={{ fontSize:11, color:"#6b7280", marginTop:8 }}>
              These are reliable scoring zones. Maintain them with 1–2 mixed questions daily.
            </div>
          </Card>

          {/* Quick next steps */}
          <Card title="Top 3 Moves to Gain Points" subtitle="Biggest gains, in order of priority" accent="#ef4444">
            {d.nextSteps.slice(0,3).map((s, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ width:28, height:28, borderRadius:99, background: i===0?"#fef2f2":i===1?"#fffbeb":"#f0fdf4",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  fontSize:13, fontWeight:800, color: i===0?"#ef4444":i===1?"#f59e0b":"#10b981" }}>
                  {i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{s.topic}</div>
                    <Badge label={s.gain} color="#10b981" bg="#d1fae5" />
                  </div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>{s.section} · {s.why}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:12, padding:12, background:"#eff6ff", borderRadius:10, fontSize:12, color:"#1e40af" }}>
              Fix all 4 topics → projected composite: <strong>{d.projected}</strong> ({d.projectedRange})
            </div>
          </Card>
        </>)}

        {/* ══ BY SECTION ══ */}
        {tab === "sections" && (<>
          {d.sections.map(sec => (
            <Card key={sec.id} title={`${sec.label}: ${sec.score}/800`}
              subtitle={`Target: ${sec.target}/800 · Gap: ${sec.target - sec.score} points`}
              accent={sec.color}>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b7280", marginBottom:4 }}>
                  <span>Current: {sec.score}</span><span>Target: {sec.target}</span>
                </div>
                <ProgressBar value={sec.score} max={800} color={sec.color} height={10} />
              </div>
              {sec.topics.map((t, i) => {
                const meta = STATE_META[t.state] || STATE_META.moderate
                return (
                  <div key={i} style={{ padding:"11px 0", borderBottom: i < sec.topics.length-1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div>
                        <span style={{ fontSize:13, fontWeight:600 }}>{t.name}</span>
                        <span style={{ marginLeft:8 }}><Badge label={meta.label} color={meta.color} bg={meta.bg} /></span>
                      </div>
                      {t.impact > 0 && (
                        <Badge label={`+${t.impact} pts`} color="#10b981" bg="#d1fae5" />
                      )}
                    </div>
                    <div style={{ display:"flex", gap:16, fontSize:11, color:"#6b7280", marginBottom:6 }}>
                      <span>Accuracy: <strong style={{ color:"#111" }}>{t.acc}%</strong></span>
                      <span>Avg time: <strong style={{ color:"#111" }}>{t.time}s/Q</strong></span>
                      {t.time > 55 && <span style={{ color:"#ef4444" }}>⏱ {t.time - 55}s over target</span>}
                    </div>
                    <ProgressBar value={t.acc} max={100} color={meta.color} height={5} />
                    <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>{meta.desc}</div>
                  </div>
                )
              })}
            </Card>
          ))}

          {/* Time analysis */}
          <Card title="Time Management" subtitle="Where you're spending too long per question" accent="#f59e0b">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div style={{ textAlign:"center", padding:14, background:"#fffbeb", borderRadius:10 }}>
                <div style={{ fontSize:26, fontWeight:800, color:"#f59e0b" }}>{d.timeStats.avgSecsPerQ}s</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>your avg per question</div>
              </div>
              <div style={{ textAlign:"center", padding:14, background:"#f0fdf4", borderRadius:10 }}>
                <div style={{ fontSize:26, fontWeight:800, color:"#10b981" }}>{d.timeStats.targetSecs}s</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>SAT target per question</div>
              </div>
            </div>
            {d.timeStats.sunkTopics.map((t, i) => (
              <div key={i} style={{ padding:"10px 12px", background:"#fef9c3", borderRadius:10, marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <strong style={{ fontSize:12 }}>{t.name}</strong>
                  <span style={{ fontSize:12, fontWeight:700, color:"#ef4444" }}>{t.avg}s avg</span>
                </div>
                <div style={{ fontSize:11, color:"#6b7280" }}>Target: {t.target}s — you're spending <strong style={{ color:"#ef4444" }}>{t.avg - t.target}s extra</strong> per question</div>
              </div>
            ))}
            <div style={{ fontSize:11, color:"#6b7280", marginTop:8, lineHeight:1.6 }}>
              On the Digital SAT, Module 1 has 27 questions in 32 minutes (~71s each). Module 2 (harder) has the same constraint. Saving 13s/question on your slow topics gives you an extra 2–3 questions at the end.
            </div>
          </Card>
        </>)}

        {/* ══ COLLEGE FIT ══ */}
        {tab === "colleges" && (<>
          <Card title="College Score Fit" subtitle="Where your current and projected scores sit" accent="#1d4ed8">
            <div style={{ fontSize:11, color:"#6b7280", marginBottom:16, lineHeight:1.6 }}>
              These ranges represent the <strong>middle 50% of admitted students</strong> (25th–75th percentile) at typical schools in each tier — not the minimum to apply.
            </div>
            {d.collegeTargets.map((c, i) => {
              const tierMeta = TIER_META[c.tier]
              const currentInRange  = d.score  >= c.min && d.score  <= c.max
              const projectedInRange= d.projected >= c.min && d.projected <= c.max
              const currentAbove    = d.score  > c.max
              const projectedAbove  = d.projected > c.max
              return (
                <div key={i} style={{ padding:"14px 0", borderBottom: i < d.collegeTargets.length-1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ flexShrink:0 }}>{c.icon}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:"#9ca3af" }}>SAT range: {c.range}</div>
                      </div>
                    </div>
                    <Badge label={tierMeta.label} color={tierMeta.color} bg={tierMeta.bg} />
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20,
                      background: currentAbove?"#d1fae5" : currentInRange?"#dbeafe":"#f3f4f6",
                      color: currentAbove?"#065f46" : currentInRange?"#1e40af":"#9ca3af",
                      fontWeight:600 }}>
                      Now {d.score}: {currentAbove?"✓ Above range":currentInRange?"✓ In range":"Below range"}
                    </span>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20,
                      background: projectedAbove?"#d1fae5" : projectedInRange?"#d1fae5":"#f3f4f6",
                      color: projectedAbove?"#065f46" : projectedInRange?"#065f46":"#9ca3af",
                      fontWeight:600 }}>
                      Target {d.projected}: {projectedAbove?"✓ Above range":projectedInRange?"✓ In range":"Still below"}
                    </span>
                  </div>
                </div>
              )
            })}
          </Card>

          <Card title="Your Score Trajectory" subtitle="What each improvement milestone unlocks" accent="#10b981">
            {[
              { score:1200, unlock:"Most community colleges and regional state universities",       reached: d.score >= 1200 },
              { score:1250, unlock:"State flagship universities (in-state applicants competitive)", reached: d.score >= 1250 },
              { score:1300, unlock:"Strong state schools; bottom range of UC system admissions",   reached: d.score >= 1300 },
              { score:1350, unlock:"UC system comfortably; merit scholarships at many schools",    reached: d.score >= 1350 },
              { score:1400, unlock:"Top 50 national universities; strong scholarship candidate",   reached: d.score >= 1400 },
              { score:1450, unlock:"Top 25 national universities; competitive at most schools",    reached: d.score >= 1450 },
              { score:1500, unlock:"Ivy League range; MIT / Caltech competitive range begins",     reached: d.score >= 1500 },
            ].map((m, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i < 6 ? "1px solid #f3f4f6":"none", alignItems:"flex-start" }}>
                <div style={{ width:44, flexShrink:0, textAlign:"center" }}>
                  <div style={{ fontSize:15, fontWeight:800, color: m.reached?"#10b981": m.score <= d.projected?"#3b82f6":"#d1d5db" }}>
                    {m.score}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color: m.reached?"#065f46": m.score <= d.projected?"#1e40af":"#9ca3af", lineHeight:1.5 }}>
                    {m.reached && "✓ "}{m.score <= d.projected && !m.reached && "→ "}{m.unlock}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:12, padding:12, background:"#eff6ff", borderRadius:10, fontSize:12, color:"#1e40af" }}>
              Your current score ({d.score}) already clears the first milestone. Your target ({d.projected}) unlocks UC admissions and merit scholarships.
            </div>
          </Card>
        </>)}

        {/* ══ ACTION PLAN ══ */}
        {tab === "plan" && (<>
          <Card title="Prioritised Fix List" subtitle="Sorted by score impact — fix these in order" accent="#ef4444">
            {d.nextSteps.map((s, i) => {
              const meta = STATE_META[s.state] || STATE_META.moderate
              return (
                <div key={i} style={{ display:"flex", gap:12, padding:"14px 0", borderBottom: i < d.nextSteps.length-1 ? "1px solid #f3f4f6":"none" }}>
                  <div style={{ width:28, height:28, borderRadius:99, flexShrink:0,
                    background:["#fef2f2","#fffbeb","#eff6ff","#f0fdf4"][i],
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:800, color:["#ef4444","#f59e0b","#3b82f6","#10b981"][i] }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4, flexWrap:"wrap", gap:4 }}>
                      <span style={{ fontSize:13, fontWeight:700 }}>{s.topic}</span>
                      <div style={{ display:"flex", gap:6 }}>
                        <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                        <Badge label={s.gain} color="#10b981" bg="#d1fae5" />
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:"#6b7280", marginBottom:6 }}>{s.section}</div>
                    <div style={{ fontSize:11, color:"#374151", lineHeight:1.5 }}>{s.why}</div>
                  </div>
                </div>
              )
            })}
          </Card>

          <Card title="12-Week Study Blueprint" subtitle="Week-by-week focus mapped to your weak areas" accent="#3b82f6">
            {[
              { weeks:"Week 1–2",  phase:"Diagnose",  icon:<UPIcSearch s={18} c='#FF653F'/>,
                tasks:["Take a timed full-length SAT diagnostic","Review your section scores against target","Confirm top 3 weakest topics from this report"] },
              { weeks:"Week 3–5",  phase:"Concept Fix", icon:<UPIcBook s={18} c='#FF653F'/>,
                tasks:["Problem Solving & Data: 30-min concept video daily","Information & Ideas: passage strategy framework","Craft & Structure: 20 timed drills per session"] },
              { weeks:"Week 6–8",  phase:"Speed Build", icon:<UPIcBolt s={18} c='#FF653F'/>,
                tasks:["Advanced Math: timed quadratic + function sets","All weak topics: max 55s per question, no exceptions","1 full section practice test each weekend"] },
              { weeks:"Week 9–10", phase:"Mock Tests",  icon:<UPIcDoc s={18} c='#FF653F'/>,
                tasks:["2 full SAT practice tests per week","Deep error log after each test","Re-check time per topic — staying under 55s?"] },
              { weeks:"Week 11",   phase:"Peak",       icon:<UPIcFlame s={18} c='#FF653F'/>,
                tasks:["1 final full mock under real conditions","Light concept refresh on weakest 1–2 topics only","No new material — consolidate what you know"] },
              { weeks:"Week 12",   phase:"Rest",       icon:<UPIcTrophy s={18} c='#FF653F'/>,
                tasks:["Light reading and mental math only","Sleep 8 hrs minimum the night before","Arrive at the test centre 20 min early"] },
            ].map((w, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom: i < 5 ? "1px solid #f3f4f6":"none" }}>
                <div style={{ width:56, flexShrink:0 }}>
                  <div style={{ marginBottom:4, display:"flex", justifyContent:"center" }}>{w.icon}</div>
                  <div style={{ fontSize:9, color:"#9ca3af", textAlign:"center", lineHeight:1.3 }}>{w.weeks}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:6 }}>{w.phase}</div>
                  {w.tasks.map((t, j) => (
                    <div key={j} style={{ display:"flex", gap:6, fontSize:11, color:"#374151", marginBottom:4, alignItems:"flex-start" }}>
                      <span style={{ color:"#3b82f6", flexShrink:0 }}>→</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          <Card title="Daily Drill Template" subtitle="What to do on a regular 45-minute practice day" accent="#8b5cf6">
            {[
              { time:"0–10 min",   task:"Timed section drill (your current weak topic, 10 questions)" },
              { time:"10–25 min",  task:"Error review — for every wrong answer: write the concept, not just the answer" },
              { time:"25–35 min",  task:"Concept reinforcement (video, textbook, or worked example)" },
              { time:"35–45 min",  task:"5 mixed questions across all topics at full speed" },
            ].map((r, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i < 3 ? "1px solid #f3f4f6":"none" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#8b5cf6", width:70, flexShrink:0 }}>{r.time}</div>
                <div style={{ fontSize:12, color:"#374151", lineHeight:1.5 }}>{r.task}</div>
              </div>
            ))}
          </Card>
        </>)}

        {/* ══ HOW IT WORKS ══ */}
        {tab === "howit" && (<>
          <Card title="How Score Prediction Works" subtitle="The math behind your projected score" accent="#6366f1">
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { step:"1", title:"Accuracy × Speed Analysis",
                  body:"For each topic, we look at two signals: your accuracy rate (% correct) and your average time per question. A student who is fast + correct is in a strong state. Slow + wrong means a concept gap — the two fixes are different." },
                { step:"2", title:"Topic-Level Score Allocation",
                  body:`The SAT allocates roughly 9–13% of your total score to each major topic. We calculate your current contribution per topic and compare it to the maximum. The gap is your score potential.` },
                { step:"3", title:"State Classification",
                  body:"Each topic gets a state label: Strong (fast + correct), Knows But Slow (correct but slow), Concept Gap (slow + wrong), or Guessing (fast + wrong). Each state has a different fix." },
                { step:"4", title:"Impact-Ordered Fix List",
                  body:"We multiply the gap size by your fix-difficulty rating to rank topics. The top items on your action plan are the ones with the largest point gains for the least additional effort." },
                { step:"5", title:"Projected Score Calculation",
                  body:`Your projected score assumes you bring each "Concept Gap" topic to 75%+ accuracy and each "Knows But Slow" topic to under 55s/question — realistic targets for an 8-week training block.` },
              ].map((s, i) => (
                <div key={i} style={{ display:"flex", gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:99, background:"#ede9fe", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:800, color:"#6366f1" }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.6 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Honest Limitations" subtitle="What our predictions cannot guarantee" accent="#ef4444">
            <ul style={{ padding:"0 0 0 4px", margin:0, display:"flex", flexDirection:"column", gap:8 }}>
              {[
                "This projection assumes consistent, deliberate practice — passive re-reading does not count.",
                "The College Board regularly changes which question types appear most. We update our models each released test cycle, but exact distribution can shift.",
                "Test-day conditions (nerves, fatigue, unfamiliar format) are not modeled and can affect performance ±50–80 points.",
                "Score ranges reflect typical outcomes for students who follow the action plan — they are not guarantees.",
                "College admission decisions depend on GPA, essays, extracurriculars, and holistic review — SAT score alone is one factor.",
              ].map((t, i) => (
                <li key={i} style={{ display:"flex", gap:8, fontSize:12, color:"#374151", lineHeight:1.6, listStyle:"none" }}>
                  <span style={{ color:"#ef4444", flexShrink:0, fontWeight:700 }}>!</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="SAT vs ACT: Which Should You Take?" subtitle="Quick decision guide" accent="#f59e0b">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { exam:"SAT", color:"#3b82f6", points:[
                  "2 sections: R&W and Math",
                  "No science section",
                  "Digital adaptive format",
                  "Math: heavier on data analysis",
                  "Strong evidence-based reading",
                ]},
                { exam:"ACT", color:"#8b5cf6", points:[
                  "4 sections + optional Writing",
                  "Science reasoning section",
                  "Paper-based (still changing)",
                  "Math: broader, includes trig",
                  "Higher time pressure overall",
                ]},
              ].map(e => (
                <div key={e.exam} style={{ background:"#f9fafb", borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:15, fontWeight:800, color:e.color, marginBottom:10 }}>{e.exam}</div>
                  {e.points.map((p, j) => (
                    <div key={j} style={{ fontSize:11, color:"#374151", marginBottom:5, display:"flex", gap:6 }}>
                      <span style={{ color:e.color, flexShrink:0 }}>·</span><span>{p}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:11, color:"#6b7280", lineHeight:1.6 }}>
              Take a diagnostic mock for both. Whichever produces a higher percentile score naturally is your better test. Most colleges accept both equally.
            </div>
          </Card>
        </>)}

      </div>
    </div>
  )
}
