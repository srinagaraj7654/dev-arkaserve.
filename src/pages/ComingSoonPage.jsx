import { useState } from 'react'
import { supabase } from '../supabase.js'

const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const _IcClip   = ({s=52,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const _IcTrain  = ({s=52,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M4 16l-2 4h20l-2-4"/><line x1="12" y1="3" x2="12" y2="16"/><line x1="4" y1="9" x2="20" y2="9"/><circle cx="8" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="13" r="1" fill="currentColor" stroke="none"/></svg>
const _IcGear   = ({s=52,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const _IcMed    = ({s=52,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
const _IcBook   = ({s=52,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const _IcCheck  = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const _IcBell   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const _IcBank   = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 21h18M3 10h18M3 10l9-7 9 7"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></svg>

const COMING_EXAMS = {
  ssc:        { label:'SSC',         icon:<_IcClip s={52} c='#3B5BDB'/>, exams:['SSC CGL','SSC CHSL','SSC MTS','SSC Stenographer','SSC CPO'] },
  railway:    { label:'Railway',     icon:<_IcTrain s={52} c='#3B5BDB'/>, exams:['RRB NTPC','RRB Group D','RRB ALP','RRB JE','RRB MI'] },
  engineering:{ label:'Engineering', icon:<_IcGear s={52} c='#3B5BDB'/>, exams:['JEE Main','JEE Advanced','GATE CS','GATE ECE','GATE ME'] },
  medical:    { label:'Medical',     icon:<_IcMed s={52} c='#3B5BDB'/>,  exams:['NEET UG','NEET PG','AIIMS','JIPMER','FMGE'] },
}

export default function ComingSoonPage({ user, category, onNav }) {
  const [email,   setEmail]   = useState(user?.email || '')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const cat = COMING_EXAMS[category] || { label: category, icon:<_IcBook s={52} c='#3B5BDB'/>, exams:[] }
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Student'

  const notify = async () => {
    if (!email) return
    setLoading(true)
    // Save interest — store in user metadata
    await supabase.auth.updateUser({ data: { notify_category: category, notify_email: email } })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#ffffff',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* Nav */}
      <nav style={{background:'linear-gradient(135deg,#1e3a8a,#3B5BDB,#7048E8)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>onNav('home')}>
          <div style={{width:34,height:34,background:'rgba(255,255,255,.18)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800,border:'1.5px solid rgba(255,255,255,.3)'}}>MT</div>
          <span style={{fontSize:16,fontWeight:800,color:'#fff'}}>MockTest</span>
        </div>
        <button onClick={()=>onNav('dashboard')} style={{fontSize:12,fontWeight:600,color:'#fff',background:'rgba(255,255,255,.12)',border:'1.5px solid rgba(255,255,255,.3)',borderRadius:8,padding:'7px 16px',cursor:'pointer'}}>
          Go to Dashboard
        </button>
      </nav>

      <div style={{maxWidth:700,margin:'0 auto',padding:'52px 24px',textAlign:'center'}}>
        {/* Coming soon card */}
        <div style={{marginBottom:16,display:'flex',justifyContent:'center'}}>{cat.icon}</div>
        <div style={{display:'inline-block',background:'#FFF4E6',color:'#D4721B',border:'1px solid #FDDCB0',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700,marginBottom:16}}>Coming Soon</div>
        <h1 style={{fontSize:30,fontWeight:800,color:'#0f172a',marginBottom:10,letterSpacing:'-0.3px'}}>
          {cat.label} Exams are almost here!
        </h1>
        <p style={{fontSize:14,color:'#475569',lineHeight:1.7,marginBottom:28,maxWidth:480,margin:'0 auto 28px'}}>
          We're building expert-crafted mock tests for {cat.label} exams. Every question will be unique and at exam level — just like our Banking platform.
        </p>

        {/* Exams list */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:36}}>
          {cat.exams.map(e=>(
            <span key={e} style={{fontSize:12,fontWeight:600,background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:20,padding:'5px 14px',color:'#374151'}}>{e}</span>
          ))}
        </div>

        {/* Notify form */}
        {!sent ? (
          <div style={{background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:16,padding:24,maxWidth:440,margin:'0 auto 32px'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:6,display:'flex',alignItems:'center',gap:6}}><_IcBell s={14} c='#3B5BDB'/> Get notified when {cat.label} launches</div>
            <p style={{fontSize:12,color:'#64748b',marginBottom:14}}>We'll email you the moment {cat.label} exams go live.</p>
            <div style={{display:'flex',gap:8}}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address"
                style={{flex:1,padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13,outline:'none'}}/>
              <button onClick={notify} disabled={loading}
                style={{padding:'10px 18px',background:'linear-gradient(135deg,#3B5BDB,#7048E8)',color:'#fff',border:'none',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                {loading ? '...' : 'Notify Me'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{background:'#DCFCE7',border:'1.5px solid #86EFAC',borderRadius:14,padding:20,maxWidth:440,margin:'0 auto 32px'}}>
            <div style={{marginBottom:6,display:'flex',justifyContent:'center'}}><_IcCheck s={20} c='#15803D'/></div>
            <div style={{fontSize:14,fontWeight:700,color:'#15803D',marginBottom:4}}>You're on the list!</div>
            <div style={{fontSize:12,color:'#166534'}}>We'll email you at {email} when {cat.label} exams launch.</div>
          </div>
        )}

        {/* Banking CTA */}
        <div style={{background:'linear-gradient(135deg,#EEF0FF,#F3F0FF)',border:'1.5px solid #C5CAF0',borderRadius:16,padding:24,maxWidth:480,margin:'0 auto'}}>
          <div style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:6,display:'flex',alignItems:'center',gap:6}}><_IcBank s={14} c='#3B5BDB'/> Try Banking — it's fully live!</div>
          <p style={{fontSize:12,color:'#475569',lineHeight:1.6,marginBottom:14}}>
            While we build {cat.label} exams, our Banking platform is 100% live — IBPS PO, Clerk, SBI PO, Clerk, RRB exams with expert-crafted questions. Free for 7 days — no credit card required.
          </p>
          <button onClick={()=>onNav('dashboard')}
            style={{width:'100%',padding:'11px 0',background:'linear-gradient(135deg,#3B5BDB,#7048E8)',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer'}}>
            Explore Banking Mock Tests →
          </button>
        </div>
      </div>
    </div>
  )
}
