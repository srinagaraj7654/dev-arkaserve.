const PLAN_TIERS = [
  { id:'basic',    name:'Basic',    price:'₹199',  validity:'1 month',  features:['5 mock tests / month','Topic practice','Basic analytics'] },
  { id:'pro',      name:'Pro',      price:'₹499',  validity:'1 month',  popular:true, features:['Unlimited mock tests','PDF solutions','personalised study plan','Priority support'] },
  { id:'ultimate', name:'Ultimate', price:'₹1199', validity:'3 months', features:['Everything in Pro','All exam categories','Performance trends','WhatsApp reminders'] },
]

export default function DashSubscriptionsTab({ cd, _t, _m, _s, _b, _a, isPro, plan, trialActive, trialDaysLeft, onNav }) {
  return (
    <div>
      <h2 className="text-xl font-black mb-1" style={{color:_t}}>Subscriptions</h2>
      <p className="text-sm mb-6" style={{color:_m}}>Choose a plan to unlock the full MockTest experience</p>

      {/* Current plan status */}
      <div style={{background:isPro?`${_a}10`:(cd?'rgba(255,255,255,.05)':'#f8fafc'),border:`1px solid ${isPro?`${_a}30`:_b}`,borderRadius:14,padding:'16px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:40,height:40,borderRadius:12,background:isPro?`${_a}18`:(cd?'rgba(255,255,255,.08)':'#e5e7eb'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isPro?_a:'#64748b'} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13.5,fontWeight:800,color:_t}}>
            {isPro ? `${plan.charAt(0).toUpperCase()+plan.slice(1)} Plan — Active` : trialActive ? `Free Trial — ${trialDaysLeft} days remaining` : 'Free Trial Expired'}
          </div>
          <div style={{fontSize:12,color:_m,marginTop:2}}>
            {isPro ? 'You have full access to all features.' : trialActive ? 'Upgrade to keep access after your trial ends.' : 'Your trial has ended. Upgrade to continue.'}
          </div>
        </div>
        {isPro && <div style={{fontSize:10.5,fontWeight:800,color:_a,background:`${_a}15`,borderRadius:99,padding:'4px 12px'}}>Active</div>}
      </div>

      {/* Plan cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
        {PLAN_TIERS.map(tier=>(
          <div key={tier.id} style={{background:_s,border:`2px solid ${tier.popular?_a:_b}`,borderRadius:16,padding:'22px 18px',position:'relative',display:'flex',flexDirection:'column',gap:12}}>
            {tier.popular && <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',background:_a,color:'#fff',fontSize:10,fontWeight:800,padding:'3px 14px',borderRadius:'0 0 10px 10px',letterSpacing:'.04em'}}>MOST POPULAR</div>}
            <div>
              <div style={{fontSize:13,fontWeight:800,color:_m,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{tier.name}</div>
              <div style={{fontSize:28,fontWeight:900,color:_t,lineHeight:1}}>{tier.price}<span style={{fontSize:13,fontWeight:600,color:_m}}>/{tier.validity}</span></div>
            </div>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8,flex:1}}>
              {tier.features.map(f=>(
                <li key={f} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:12.5,color:_t,lineHeight:1.4}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke='#16a34a' strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={()=>onNav?.('subscriptions')}
              style={{background:tier.popular?_a:'none',color:tier.popular?'#fff':_a,border:`2px solid ${_a}`,borderRadius:10,padding:'10px',fontWeight:800,fontSize:13,cursor:'pointer',transition:'all .15s',marginTop:'auto'}}
              onMouseOver={e=>{if(!tier.popular){e.currentTarget.style.background=_a;e.currentTarget.style.color='#fff'}}}
              onMouseOut={e=>{if(!tier.popular){e.currentTarget.style.background='none';e.currentTarget.style.color=_a}}}>
              {isPro && plan===tier.id ? 'Current Plan' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
