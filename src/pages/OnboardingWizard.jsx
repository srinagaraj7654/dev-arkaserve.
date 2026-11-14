import { useState } from 'react'
import { supabase } from '../supabase.js'

const CUR_YEAR  = new Date().getFullYear()
const DOB_YEARS = Array.from({length: CUR_YEAR - 1949}, (_, i) => CUR_YEAR - i)
const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS  = ['S','M','T','W','T','F','S']
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function firstDow(y, m)    { return new Date(y, m, 1).getDay() }

export default function OnboardingWizard({ user, onDone, onSkip }) {
  const prefillName = user?.user_metadata?.full_name || ''

  const [name,     setName]    = useState(prefillName)
  const [dob,      setDob]     = useState('')
  const [saving,   setSaving]  = useState(false)

  const [dobPhase, setDobPhase] = useState(null)
  const [selYear,  setSelYear]  = useState(null)
  const [selMonth, setSelMonth] = useState(null)

  const todayRef   = new Date()
  const dobDisplay = dob
    ? (() => { const [y,m,d]=dob.split('-'); return `${d} ${MONTH_SHORT[+m-1]} ${y}` })()
    : null

  const pickYear  = (y) => { setSelYear(y); setDobPhase('month') }
  const pickMonth = (m) => { setSelMonth(m); setDobPhase('day') }
  const pickDay   = (d) => {
    const mm = String(selMonth + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    setDob(`${selYear}-${mm}-${dd}`)
    setDobPhase(null)
  }
  const clearDob = () => { setDob(''); setDobPhase(null); setSelYear(null); setSelMonth(null) }

  const monthDisabled = (m) => selYear === todayRef.getFullYear() && m > todayRef.getMonth()
  const dayDisabled   = (d) =>
    selYear === todayRef.getFullYear() &&
    selMonth === todayRef.getMonth() &&
    d > todayRef.getDate()

  const canDone = name.trim().length >= 2

  const handleDone = async () => {
    if (!canDone || saving) return
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: { onboarding_complete: true, full_name: name.trim(), dob: dob || null }
      })
    } catch {}
    setSaving(false)
    onDone({})
  }

  const handleSkipNow = async () => {
    try { await supabase.auth.updateUser({ data: { onboarding_complete: true } }) } catch {}
    onSkip()
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:100,
      background:'linear-gradient(160deg,#0f172a 0%,#1a1d3b 60%,#0d1520 100%)',
      display:'flex', flexDirection:'column', overflow:'hidden',
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
    }}>
      <style>{`
        @keyframes ob-fadein{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ob-spin{to{transform:rotate(360deg)}}
        .ob-field{width:100%;padding:14px 16px;border:1.5px solid rgba(255,255,255,.12);border-radius:14px;
          background:rgba(255,255,255,.06);color:#f1f5f9;font-size:16px;font-family:inherit;outline:none;
          -webkit-appearance:none;box-sizing:border-box}
        .ob-field:focus{border-color:rgba(232,90,44,.6);background:rgba(232,90,44,.06)}
        .ob-field::placeholder{color:rgba(255,255,255,.3)}
        .ob-scroll{overflow-y:auto;-webkit-overflow-scrolling:touch}
        .ob-scroll::-webkit-scrollbar{width:0}
        .ob-dob-yr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-height:220px;overflow-y:auto;padding:12px}
        .ob-dob-yr-grid::-webkit-scrollbar{width:0}
        .ob-dob-btn{padding:9px 4px;border-radius:9px;border:none;background:rgba(255,255,255,.07);color:rgba(255,255,255,.75);font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .12s}
        .ob-dob-btn.sel{background:#F06535;color:#fff}
        .ob-dob-btn.dis{opacity:.25;cursor:default}
        .ob-dob-day{aspect-ratio:1;border-radius:50%;border:none;background:transparent;color:rgba(255,255,255,.8);font-size:13px;font-weight:400;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;width:100%;padding:0}
        .ob-dob-day.sel{background:#F06535;color:#fff;font-weight:700}
        .ob-dob-day.dis{color:rgba(255,255,255,.2);cursor:default}
      `}</style>

      {/* TOP BAR */}
      <div style={{
        flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'env(safe-area-inset-top,0px) 20px 0',
        paddingTop: 'max(env(safe-area-inset-top,0px), 16px)',
        paddingBottom: 12,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,background:'#F06535',borderRadius:9,display:'flex',
            alignItems:'center',justifyContent:'center',color:'#fff',fontSize:11,fontWeight:800}}>MT</div>
          <span style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>MockTest</span>
        </div>
        <button onClick={handleSkipNow}
          style={{fontSize:13,color:'rgba(255,255,255,.4)',background:'none',border:'none',cursor:'pointer',padding:'6px 10px'}}>
          Skip
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="ob-scroll" style={{flex:1,padding:'24px 20px 32px',display:'flex',flexDirection:'column'}}>
        <div style={{animation:'ob-fadein .35s ease'}}>

          <div style={{marginBottom:28}}>
            <h1 style={{fontSize:28,fontWeight:900,color:'#f1f5f9',letterSpacing:'-.03em',
              lineHeight:1.1,margin:'0 0 8px'}}>
              Tell us about <span style={{color:'#F06535'}}>yourself</span>
            </h1>
            <p style={{fontSize:14,color:'rgba(255,255,255,.4)',margin:0,lineHeight:1.5}}>
              We'll personalise your experience
            </p>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:16}}>

            {/* Name */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,.6)',marginBottom:8}}>
                Your name
              </label>
              <input
                className="ob-field"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
              {prefillName && (
                <div style={{fontSize:11,color:'rgba(16,185,129,.7)',marginTop:6}}>
                  ✓ Pulled from your Google account
                </div>
              )}
            </div>

            {/* Date of birth */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,.6)',marginBottom:8}}>
                Date of birth <span style={{color:'rgba(255,255,255,.25)',fontWeight:400}}>(optional)</span>
              </label>
              <button
                onClick={() => setDobPhase(p => p ? null : selYear ? (selMonth!=null ? 'day' : 'month') : 'year')}
                style={{width:'100%',padding:'14px 16px',border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,
                  background:'rgba(255,255,255,.06)',color:dobDisplay?'#f1f5f9':'rgba(255,255,255,.3)',
                  fontSize:16,fontFamily:'inherit',textAlign:'left',cursor:'pointer',display:'flex',
                  alignItems:'center',justifyContent:'space-between',boxSizing:'border-box',
                  WebkitTapHighlightColor:'transparent'}}>
                <span>{dobDisplay || 'Select date of birth'}</span>
                <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>

              {dobPhase && (
                <div style={{marginTop:8,border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,overflow:'hidden',background:'rgba(255,255,255,.04)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.08)',flexWrap:'wrap'}}>
                    <button onClick={()=>setDobPhase('year')}
                      style={{background:'none',border:'none',padding:'2px 6px',borderRadius:6,cursor:'pointer',
                        fontSize:13,fontWeight:700,color:dobPhase==='year'?'#F06535':selYear?'rgba(255,255,255,.8)':'rgba(255,255,255,.35)'}}>
                      {selYear || 'Year'}
                    </button>
                    <span style={{color:'rgba(255,255,255,.2)',fontSize:12}}>›</span>
                    <button onClick={()=>selYear && setDobPhase('month')}
                      style={{background:'none',border:'none',padding:'2px 6px',borderRadius:6,
                        cursor:selYear?'pointer':'default',fontSize:13,fontWeight:700,
                        color:dobPhase==='month'?'#F06535':selMonth!=null?'rgba(255,255,255,.8)':'rgba(255,255,255,.35)'}}>
                      {selMonth!=null ? MONTH_SHORT[selMonth] : 'Month'}
                    </button>
                    <span style={{color:'rgba(255,255,255,.2)',fontSize:12}}>›</span>
                    <span style={{fontSize:13,fontWeight:700,color:dobPhase==='day'?'#F06535':'rgba(255,255,255,.35)',padding:'2px 6px'}}>Day</span>
                  </div>
                  {dobPhase === 'year' && (
                    <div className="ob-dob-yr-grid">
                      {DOB_YEARS.map(y => (
                        <button key={y} onClick={()=>pickYear(y)} className={`ob-dob-btn${selYear===y?' sel':''}`}>{y}</button>
                      ))}
                    </div>
                  )}
                  {dobPhase === 'month' && (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,padding:12}}>
                      {MONTH_SHORT.map((m,i) => (
                        <button key={m} onClick={()=>!monthDisabled(i) && pickMonth(i)}
                          className={`ob-dob-btn${selMonth===i?' sel':''}${monthDisabled(i)?' dis':''}`}>{m}</button>
                      ))}
                    </div>
                  )}
                  {dobPhase === 'day' && selYear != null && selMonth != null && (
                    <div style={{padding:12}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                        <span style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,.6)'}}>{MONTH_FULL[selMonth]} {selYear}</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:4}}>
                        {DAY_LABELS.map((d,i)=>(
                          <div key={i} style={{textAlign:'center',fontSize:10,color:'rgba(255,255,255,.3)',fontWeight:700,padding:'3px 0'}}>{d}</div>
                        ))}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
                        {Array.from({length:firstDow(selYear,selMonth)}).map((_,i)=><div key={`b${i}`}/>)}
                        {Array.from({length:daysInMonth(selYear,selMonth)},(_,i)=>i+1).map(d => {
                          const isSel = dob===`${selYear}-${String(selMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                          const dis   = dayDisabled(d)
                          return (
                            <button key={d} onClick={()=>!dis && pickDay(d)}
                              className={`ob-dob-day${isSel?' sel':''}${dis?' dis':''}`}>{d}</button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {dob && !dobPhase && (
                <div style={{display:'flex',justifyContent:'flex-end',marginTop:5}}>
                  <button onClick={clearDob}
                    style={{background:'none',border:'none',color:'rgba(255,100,100,.6)',fontSize:11,cursor:'pointer',padding:0}}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{marginTop:36}}>
            <button
              onClick={handleDone}
              disabled={!canDone || saving}
              style={{
                width:'100%', padding:'16px 0', borderRadius:16, border:'none',
                background: canDone && !saving ? '#F06535' : 'rgba(255,255,255,.08)',
                color: canDone && !saving ? '#fff' : 'rgba(255,255,255,.25)',
                fontSize:16, fontWeight:700,
                cursor: canDone && !saving ? 'pointer' : 'not-allowed',
                boxShadow: canDone && !saving ? '0 6px 24px rgba(232,90,44,.35)' : 'none',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                transition:'all .2s', WebkitTapHighlightColor:'transparent',
              }}>
              {saving
                ? <span style={{display:'inline-block',width:18,height:18,border:'2.5px solid rgba(255,255,255,.2)',
                    borderTopColor:'#fff',borderRadius:'50%',animation:'ob-spin .6s linear infinite'}}/>
                : 'Get Started →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
