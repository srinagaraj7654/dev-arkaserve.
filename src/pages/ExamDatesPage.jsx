import { useState, useEffect } from 'react'

/* ──────────────────────────────────────────────────────────────
   Exam Dates & Predictions Page
   Shows upcoming exam dates, notification releases and result
   announcements. Dates marked "Expected" are predictions based
   on historical patterns.
────────────────────────────────────────────────────────────── */

const STATUS_STYLE = {
  Confirmed:  { bg:'#f0fdf4', c:'#16a34a', dot:'#16a34a' },
  Expected:   { bg:'#fffbeb', c:'#d97706', dot:'#f59e0b' },
  Released:   { bg:'#eff6ff', c:'#2563eb', dot:'#2563eb' },
  TBD:        { bg:'#f8fafc', c:'#94a3b8', dot:'#cbd5e1' },
}

const CATEGORIES = [
  { key:'all',         label:'All' },
  { key:'banking',     label:'Banking' },
  { key:'insurance',   label:'Insurance' },
  { key:'ssc',         label:'SSC' },
  { key:'railway',     label:'Railway' },
  { key:'engineering', label:'Engineering' },
  { key:'medical',     label:'Medical' },
]

const EXAM_DATES = [
  // ── Banking ──
  { cat:'banking', exam:'IBPS PO 2026',       event:'Prelims Result',          date:'Oct 18, 2026', status:'Released'  },
  { cat:'banking', exam:'SBI PO 2026',         event:'Mains Admit Card',        date:'Oct 22, 2026', status:'Expected'  },
  { cat:'banking', exam:'IBPS Clerk 2026',     event:'Notification',            date:'Nov 05, 2026', status:'Expected'  },
  { cat:'banking', exam:'IBPS Clerk 2026',     event:'Prelims Exam',            date:'Dec 06, 2026', status:'Expected'  },
  { cat:'banking', exam:'IBPS Clerk 2026',     event:'Prelims Result',          date:'Jan 10, 2027', status:'Expected'  },
  { cat:'banking', exam:'RBI Grade B 2026',    event:'Phase 2 Exam',            date:'Nov 15, 2026', status:'Confirmed' },
  { cat:'banking', exam:'RBI Grade B 2026',    event:'Final Result',            date:'Dec 20, 2026', status:'Expected'  },
  { cat:'banking', exam:'SBI Clerk 2027',      event:'Notification',            date:'Jan 2027',     status:'Expected'  },
  { cat:'banking', exam:'IBPS PO 2027',        event:'Notification',            date:'Jul 2027',     status:'Expected'  },
  { cat:'banking', exam:'RRB Office Asst 2026',event:'Mains Exam',             date:'Nov 24, 2026', status:'Confirmed' },
  { cat:'banking', exam:'NABARD Grade A 2027', event:'Notification',            date:'Feb 2027',     status:'Expected'  },

  // ── Insurance ──
  { cat:'insurance', exam:'LIC ADO 2026',       event:'Mains Result',           date:'Oct 16, 2026', status:'Released'  },
  { cat:'insurance', exam:'NIACL Assistant 2026',event:'Notification',          date:'Oct 28, 2026', status:'Expected'  },
  { cat:'insurance', exam:'NIACL Assistant 2026',event:'Prelims Exam',          date:'Dec 14, 2026', status:'Expected'  },
  { cat:'insurance', exam:'LIC AAO 2027',       event:'Notification',           date:'Jan 2027',     status:'Expected'  },
  { cat:'insurance', exam:'UIIC Assistant 2027',event:'Notification',           date:'Feb 2027',     status:'Expected'  },
  { cat:'insurance', exam:'LIC HFL 2027',       event:'Recruitment Notice',     date:'Mar 2027',     status:'TBD'       },
  { cat:'insurance', exam:'NICL AO 2027',       event:'Notification',           date:'Apr 2027',     status:'Expected'  },

  // ── SSC ──
  { cat:'ssc', exam:'SSC CGL 2026',     event:'Tier I Result',               date:'Oct 19, 2026', status:'Released'  },
  { cat:'ssc', exam:'SSC CGL 2026',     event:'Tier II Exam',                date:'Nov 18, 2026', status:'Confirmed' },
  { cat:'ssc', exam:'SSC CGL 2026',     event:'Tier II Result',              date:'Jan 2027',     status:'Expected'  },
  { cat:'ssc', exam:'SSC CHSL 2026',    event:'Tier I Answer Key',           date:'Oct 13, 2026', status:'Released'  },
  { cat:'ssc', exam:'SSC CHSL 2026',    event:'Tier II Exam',                date:'Dec 01, 2026', status:'Confirmed' },
  { cat:'ssc', exam:'SSC MTS 2026',     event:'Admit Card',                  date:'Oct 25, 2026', status:'Expected'  },
  { cat:'ssc', exam:'SSC MTS 2026',     event:'Exam',                        date:'Nov 08, 2026', status:'Confirmed' },
  { cat:'ssc', exam:'SSC GD 2027',      event:'Notification',                date:'Oct 02, 2026', status:'Released'  },
  { cat:'ssc', exam:'SSC GD 2027',      event:'Exam',                        date:'Feb 2027',     status:'Expected'  },
  { cat:'ssc', exam:'SSC CPO 2027',     event:'Notification',                date:'Jan 2027',     status:'Expected'  },
  { cat:'ssc', exam:'SSC Steno 2027',   event:'Notification',                date:'Mar 2027',     status:'Expected'  },

  // ── Railway ──
  { cat:'railway', exam:'RRB NTPC 2026', event:'CBT 1 Result',              date:'Oct 17, 2026', status:'Released'  },
  { cat:'railway', exam:'RRB NTPC 2026', event:'CBT 2 Exam',                date:'Dec 10, 2026', status:'Confirmed' },
  { cat:'railway', exam:'RRB ALP 2026',  event:'Technician Admit Card',     date:'Oct 30, 2026', status:'Expected'  },
  { cat:'railway', exam:'RRB ALP 2026',  event:'CBT 1 Exam',                date:'Nov 20, 2026', status:'Confirmed' },
  { cat:'railway', exam:'RRB Group D 2026',event:'Notification',            date:'Oct 06, 2026', status:'Released'  },
  { cat:'railway', exam:'RRB Group D 2026',event:'CBT Exam',                date:'Mar 2027',     status:'Expected'  },
  { cat:'railway', exam:'RRB JE 2026',   event:'Exam Dates',                date:'Oct 01, 2026', status:'Released'  },
  { cat:'railway', exam:'RRB JE 2026',   event:'CBT 1 Exam',                date:'Jan 2027',     status:'Expected'  },

  // ── Engineering ──
  { cat:'engineering', exam:'JEE Main 2027',    event:'Session 1 Schedule',  date:'Oct 07, 2026', status:'Released'  },
  { cat:'engineering', exam:'JEE Main 2027',    event:'Session 1 Exam',      date:'Jan 22, 2027', status:'Confirmed' },
  { cat:'engineering', exam:'JEE Main 2027',    event:'Session 2 Exam',      date:'Apr 02, 2027', status:'Confirmed' },
  { cat:'engineering', exam:'JEE Advanced 2027',event:'Exam Date Notified',  date:'Oct 15, 2026', status:'Released'  },
  { cat:'engineering', exam:'JEE Advanced 2027',event:'Exam',                date:'May 18, 2027', status:'Confirmed' },
  { cat:'engineering', exam:'GATE 2027',        event:'Registration Opens',  date:'Oct 11, 2026', status:'Released'  },
  { cat:'engineering', exam:'GATE 2027',        event:'Exam',                date:'Feb 01, 2027', status:'Confirmed' },
  { cat:'engineering', exam:'GATE 2027',        event:'Result',              date:'Mar 15, 2027', status:'Expected'  },
  { cat:'engineering', exam:'BITSAT 2027',      event:'Application Form',    date:'Jan 2027',     status:'Expected'  },
  { cat:'engineering', exam:'BITSAT 2027',      event:'Exam',                date:'May 2027',     status:'Expected'  },

  // ── Medical ──
  { cat:'medical', exam:'NEET UG 2027',   event:'Notification',             date:'Oct 18, 2026', status:'Released'  },
  { cat:'medical', exam:'NEET UG 2027',   event:'Registration Opens',       date:'Nov 01, 2026', status:'Expected'  },
  { cat:'medical', exam:'NEET UG 2027',   event:'Exam',                     date:'May 04, 2027', status:'Confirmed' },
  { cat:'medical', exam:'NEET UG 2027',   event:'Result',                   date:'Jun 2027',     status:'Expected'  },
  { cat:'medical', exam:'NEET PG 2026',   event:'Final Result',             date:'Oct 13, 2026', status:'Released'  },
  { cat:'medical', exam:'NEET PG 2027',   event:'Exam',                     date:'Jul 2027',     status:'Expected'  },
  { cat:'medical', exam:'AIIMS PG 2027',  event:'Registration Opens',       date:'Oct 08, 2026', status:'Released'  },
  { cat:'medical', exam:'AIIMS PG 2027',  event:'Exam',                     date:'Jan 2027',     status:'Expected'  },
  { cat:'medical', exam:'JIPMER PG 2027', event:'Application Form',         date:'Oct 02, 2026', status:'Released'  },
  { cat:'medical', exam:'JIPMER PG 2027', event:'Exam',                     date:'Feb 2027',     status:'Expected'  },
]

const P = { fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }

export default function ExamDatesPage({ onNav }) {
  const [activeCat, setActiveCat] = useState('all')
  const [activeStatus, setActiveStatus] = useState('all')

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Exam Dates & Notifications 2026-27 | MockTest'
  }, [])

  const filtered = EXAM_DATES.filter(d =>
    (activeCat   === 'all' || d.cat    === activeCat) &&
    (activeStatus === 'all' || d.status === activeStatus)
  )

  const statusCounts = {}
  EXAM_DATES.filter(d => activeCat === 'all' || d.cat === activeCat).forEach(d => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
  })

  return (
    <div style={{ ...P, minHeight:'100vh', background:'#f8fafc' }}>

      {/* Page header */}
      <div style={{ background:'#0f172a', padding:'36px 24px 32px' }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <button onClick={() => onNav?.('exams-banking')} style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'none', border:'none', color:'rgba(255,255,255,.5)',
            fontSize:12.5, fontWeight:500, cursor:'pointer', marginBottom:14, padding:0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Exams
          </button>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.4px' }}>Exam Dates & Predictions</h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', margin:0 }}>
            Upcoming exam notifications, admit cards, results and predicted dates — updated regularly
          </p>

          {/* Stats strip */}
          <div style={{ display:'flex', gap:20, marginTop:20, flexWrap:'wrap' }}>
            {[
              { label:'Total Events', val: EXAM_DATES.length, c:'#fff' },
              { label:'Confirmed',    val: EXAM_DATES.filter(d=>d.status==='Confirmed').length,  c:'#4ade80' },
              { label:'Released',     val: EXAM_DATES.filter(d=>d.status==='Released').length,   c:'#60a5fa' },
              { label:'Expected',     val: EXAM_DATES.filter(d=>d.status==='Expected').length,   c:'#fbbf24' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.c, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10.5, color:'rgba(255,255,255,.4)', fontWeight:500, marginTop:3, textTransform:'uppercase', letterSpacing:'.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'28px 24px 60px' }}>

        {/* Category + Status filters */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:22, alignItems:'center' }}>
          {/* Category filter */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                style={{
                  padding:'6px 14px', borderRadius:99, border:'none', cursor:'pointer',
                  fontSize:12.5, fontWeight:600, transition:'background .12s, color .12s',
                  background: activeCat === c.key ? '#0f172a' : '#fff',
                  color: activeCat === c.key ? '#fff' : '#64748b',
                  boxShadow: activeCat === c.key ? 'none' : '0 1px 4px rgba(0,0,0,.08)',
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width:1, height:24, background:'#e2e8f0' }} />

          {/* Status filter */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all','Confirmed','Released','Expected','TBD'].map(s => {
              const style = s === 'all' ? { bg:'#fff', c:'#64748b' } : STATUS_STYLE[s] || {}
              const isActive = activeStatus === s
              return (
                <button key={s} onClick={() => setActiveStatus(s)}
                  style={{
                    padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer',
                    fontSize:12, fontWeight:600, transition:'all .12s',
                    background: isActive ? (s === 'all' ? '#0f172a' : style.bg) : '#fff',
                    color: isActive ? (s === 'all' ? '#fff' : style.c) : '#94a3b8',
                    boxShadow: isActive ? 'none' : '0 1px 3px rgba(0,0,0,.07)',
                    outline: isActive && s !== 'all' ? `1.5px solid ${style.c}` : 'none',
                  }}>
                  {s === 'all' ? 'All Status' : s}
                  {s !== 'all' && statusCounts[s] ? ` (${statusCounts[s]})` : ''}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results count */}
        <div style={{ fontSize:12.5, color:'#94a3b8', marginBottom:14, fontWeight:500 }}>
          Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          {activeCat !== 'all' ? ` · ${CATEGORIES.find(c=>c.key===activeCat)?.label}` : ''}
          {activeStatus !== 'all' ? ` · ${activeStatus}` : ''}
        </div>

        {/* Dates table */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>
          {/* Table header */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1.4fr 120px 110px',
            padding:'11px 20px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0',
            gap:12,
          }}>
            {['Exam', 'Event', 'Date', 'Status'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em' }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding:'48px 20px', textAlign:'center', color:'#94a3b8', fontSize:14 }}>
              No events match the selected filters.
            </div>
          ) : (
            filtered.map((d, i) => {
              const st = STATUS_STYLE[d.status] || STATUS_STYLE.TBD
              return (
                <div key={i} style={{
                  display:'grid', gridTemplateColumns:'1fr 1.4fr 120px 110px',
                  padding:'13px 20px', gap:12, alignItems:'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition:'background .1s',
                }}
                onMouseOver={e => e.currentTarget.style.background='#fafbfc'}
                onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', lineHeight:1.3 }}>{d.exam}</div>
                  <div style={{ fontSize:13, color:'#475569', fontWeight:500 }}>{d.event}</div>
                  <div style={{ fontSize:13, color:'#334155', fontWeight:600 }}>{d.date}</div>
                  <div>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5,
                      fontSize:11.5, fontWeight:600, padding:'3px 9px',
                      borderRadius:99, background:st.bg, color:st.c,
                    }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:st.dot, display:'inline-block' }} />
                      {d.status}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop:20, padding:'14px 18px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, display:'flex', gap:10, alignItems:'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ fontSize:12.5, color:'#92400e', margin:0, lineHeight:1.6 }}>
            <strong>Disclaimer:</strong> Dates marked "Expected" are predictions based on historical exam cycles and may change. Always verify with official websites (ssc.gov.in, rrbcdg.gov.in, ibps.in, nta.ac.in) before registration or exam preparation.
          </p>
        </div>

        {/* CTA */}
        <div style={{ marginTop:32, background:'#0f172a', borderRadius:16, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:4 }}>Prepare before your exam date</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.5)' }}>Attempt free full-length mock tests and track your readiness score.</div>
          </div>
          <button onClick={() => onNav?.('exams-banking')} style={{
            background:'#FF653F', color:'#fff', border:'none', borderRadius:10,
            padding:'11px 22px', fontSize:13.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
          }}
          onMouseOver={e => e.currentTarget.style.background='#e5512f'}
          onMouseOut={e => e.currentTarget.style.background='#FF653F'}>
            Take a Mock Test →
          </button>
        </div>
      </div>
    </div>
  )
}
