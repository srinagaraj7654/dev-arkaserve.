import { useState } from 'react'

const FAQS = [
  {q:'How do I reset my password?',       a:'Tap "Forgot Password" on the login screen and enter your registered email. A reset link will be sent within a minute.'},
  {q:'Why is my score not updating?',     a:'Scores update after a test is fully submitted. Ensure you tap "Submit Test" and have an active internet connection.'},
  {q:'How do I cancel my subscription?',  a:'Go to Profile → Billing → Cancel Subscription. Your access continues until the end of your billing period.'},
  {q:'Can I use MockTest offline?',        a:'MockTest currently requires an internet connection. Offline mode with downloadable question sets is planned for a future update.'},
  {q:'How are weak areas detected?',      a:'Our AI analyses your performance across topics and flags areas with below-65% accuracy as weak areas to focus on.'},
  {q:'How do I create a study plan?',     a:'Go to the Planner tab and tap "Create Plan". Choose your exam, study dates, and daily hours to generate a personalised plan.'},
  {q:'Why is my test timer pausing?',     a:'The timer auto-pauses if you switch to another app. Return to the test to resume. This is a security feature to prevent cheating.'},
]

export default function DashHelpTab({ cd, isNative }) {
  const [helpSearch, setHelpSearch] = useState('')
  const [openFaq,    setOpenFaq]    = useState(null)

  const q        = helpSearch.trim().toLowerCase()
  const filtered = q ? FAQS.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)) : FAQS

  return (
    <div style={{margin:isNative?'-14px -16px':'-14px',minHeight:'100%',background:cd?'#000':'#f2f2f7'}}>
      {/* ── Blue gradient header ── */}
      <div style={{background:'linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#3b82f6 100%)',padding:'28px 20px 26px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-30,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,.06)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-30,left:-20,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,.04)',pointerEvents:'none'}}/>
        <h1 style={{fontSize:26,fontWeight:900,color:'#fff',margin:'0 0 5px',letterSpacing:'-.02em',position:'relative'}}>Help &amp; Support</h1>
        <p style={{fontSize:13.5,color:'rgba(255,255,255,.8)',margin:'0 0 14px',fontWeight:500,position:'relative'}}>How can we help you today?</p>
        <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.15)',borderRadius:99,padding:'5px 13px',marginBottom:18,position:'relative'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',flexShrink:0}}/>
          <span style={{fontSize:12,color:'#fff',fontWeight:600,letterSpacing:'.01em'}}>Support online • ~2 min reply</span>
        </div>
        {/* Search */}
        <div style={{position:'relative'}}>
          <svg style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={helpSearch} onChange={e=>{setHelpSearch(e.target.value);setOpenFaq(null)}} placeholder="Search help articles..." style={{width:'100%',boxSizing:'border-box',padding:'12px 16px 12px 38px',borderRadius:12,border:'none',background:'rgba(255,255,255,.96)',fontSize:14,color:'#111',outline:'none',fontFamily:'inherit',WebkitAppearance:'none'}}/>
          {helpSearch && <button onClick={()=>{setHelpSearch('');setOpenFaq(null)}} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',padding:0,lineHeight:1,touchAction:'manipulation'}}>✕</button>}
        </div>
      </div>

      <div style={{padding:'18px 14px 30px'}}>
        {/* Contact cards — hidden when searching */}
        {!q && (<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
            {[
              {label:'Live Chat', col:'#22c55e', icon:<svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
              {label:'Email Us',  col:'#3b82f6', icon:<svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>},
              {label:'Call Back', col:'#f59e0b', icon:<svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6.72 6.72l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>},
            ].map(c=>(
              <button key={c.label} style={{background:cd?'#1c1c1e':'#fff',border:`1px solid ${cd?'rgba(255,255,255,.07)':'#efefef'}`,borderRadius:16,padding:'18px 8px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:10,cursor:'pointer',touchAction:'manipulation',boxShadow:cd?'none':'0 2px 8px rgba(0,0,0,.05)'}}>
                <div style={{width:50,height:50,borderRadius:'50%',background:c.col,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 12px ${c.col}55`}}>{c.icon}</div>
                <span style={{fontSize:12,fontWeight:700,color:cd?'#fff':'#1a1a1a'}}>{c.label}</span>
              </button>
            ))}
          </div>
          {/* WhatsApp CTA */}
          <button style={{width:'100%',boxSizing:'border-box',background:'linear-gradient(90deg,#1fa84c,#25D366)',border:'none',borderRadius:16,padding:'16px 18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',marginBottom:22,touchAction:'manipulation',boxShadow:'0 4px 16px rgba(37,211,102,.35)'}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div style={{flex:1,textAlign:'left'}}>
              <div style={{fontSize:15,fontWeight:800,color:'#fff'}}>Chat on WhatsApp</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.85)',marginTop:2}}>We reply in under 2 minutes</div>
            </div>
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>)}

        {/* FAQ / Search results */}
        <h3 style={{fontSize:17,fontWeight:900,color:cd?'#fff':'#111',margin:'0 0 12px',letterSpacing:'-.01em'}}>
          {q ? `Results for "${helpSearch}"` : 'Frequently Asked'}
        </h3>
        {filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'32px 20px',color:cd?'rgba(255,255,255,.35)':'#b0b0b0',fontSize:13}}>No articles found for "{helpSearch}"</div>
        ) : (
          <div style={{background:cd?'#1c1c1e':'#fff',borderRadius:16,overflow:'hidden',border:`1px solid ${cd?'rgba(255,255,255,.07)':'#efefef'}`,boxShadow:cd?'none':'0 2px 12px rgba(0,0,0,.05)',marginBottom:20}}>
            {filtered.map((f,i)=>(
              <div key={i}>
                {i>0 && <div style={{height:1,background:cd?'rgba(255,255,255,.06)':'#f3f4f6',margin:'0 16px'}}/>}
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,background:'none',border:'none',cursor:'pointer',textAlign:'left',touchAction:'manipulation'}}>
                  <span style={{fontSize:13.5,fontWeight:600,color:cd?'#fff':'#1a1a1a',flex:1,lineHeight:1.4}}>{f.q}</span>
                  <svg style={{flexShrink:0,transition:'transform .2s',transform:openFaq===i?'rotate(180deg)':'none'}} width="16" height="16" fill="none" stroke={cd?'rgba(255,255,255,.35)':'#9ca3af'} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openFaq===i && (
                  <div style={{padding:'0 16px 16px',fontSize:13,color:cd?'rgba(255,255,255,.6)':'#6b7280',lineHeight:1.65}}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        {!q && (
          <div style={{background:cd?'#1c1c1e':'#fff',border:`1px solid ${cd?'rgba(255,255,255,.07)':'#efefef'}`,borderRadius:16,padding:'20px 16px',textAlign:'center',boxShadow:cd?'none':'0 2px 8px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:14,fontWeight:700,color:cd?'#fff':'#111',marginBottom:4}}>Still need help?</div>
            <div style={{fontSize:12.5,color:cd?'rgba(255,255,255,.45)':'#9ca3af',marginBottom:14,lineHeight:1.5}}>Our support team is always ready to assist you</div>
            <a href="mailto:support@arkaserve.com" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 24px',background:'#2563eb',color:'#fff',borderRadius:10,fontSize:13,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 12px rgba(37,99,235,.35)'}}>
              <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email Support
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
