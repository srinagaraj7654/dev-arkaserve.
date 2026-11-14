export default function DashBillingTab({ cd, _t, _m, _s, _b, _a, isPro, plan, trialActive, trialDaysLeft, setActiveTab }) {
  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-black mb-1" style={{color:_t}}>Billing</h2>
      <p className="text-sm mb-6" style={{color:_m}}>Your payment details and transaction history</p>

      {/* Plan summary */}
      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'20px 22px',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Current Plan</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:_t}}>{isPro ? plan.charAt(0).toUpperCase()+plan.slice(1)+' Plan' : 'Free Trial'}</div>
            <div style={{fontSize:12.5,color:_m,marginTop:3}}>{isPro ? 'Billed monthly' : trialActive ? `${trialDaysLeft} days remaining in trial` : 'Trial period has ended'}</div>
          </div>
          <button onClick={()=>setActiveTab('subscriptions')}
            style={{background:_a,color:'#fff',border:'none',borderRadius:10,padding:'9px 18px',fontWeight:800,fontSize:12.5,cursor:'pointer',flexShrink:0}}>
            {isPro ? 'Manage' : 'Upgrade'}
          </button>
        </div>
      </div>

      {/* Payment method placeholder */}
      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'20px 22px',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12}}>Payment Method</div>
        {isPro ? (
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:44,height:30,borderRadius:6,background:cd?'rgba(255,255,255,.1)':'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="22" height="16" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#1a1f71"/><rect y="5" width="32" height="5" fill="#f7b600"/></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:_t}}>Card ending ••••</div>
              <div style={{fontSize:11.5,color:_m,marginTop:2}}>Update your payment method below</div>
            </div>
          </div>
        ) : (
          <div style={{fontSize:13,color:_m}}>No payment method on file. Add one when you upgrade.</div>
        )}
      </div>

      {/* Transaction history */}
      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${_b}`,fontSize:11,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em'}}>Transaction History</div>
        <div style={{padding:'32px 20px',textAlign:'center'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={_m} strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 12px',display:'block'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
          <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:4}}>No transactions yet</div>
          <div style={{fontSize:12,color:_m}}>Your payment history will appear here once you subscribe.</div>
        </div>
      </div>
    </div>
  )
}
