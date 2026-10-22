/* ──────────────────────────────────────────────────────────────
   PaymentComingSoon.jsx
   Shown when student clicks "Upgrade Now" from OnboardingWizard
   or from Dashboard → Subscriptions.

   Props:
     plan     — 'intermediate' | 'advanced'
     onBack   — go back to wizard / dashboard
──────────────────────────────────────────────────────────────── */
const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const PIcStar = ({s=32,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const PIcRocket = ({s=32,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
const PIcTool = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
const PIcBell = ({s=12,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>

export default function PaymentComingSoon({ plan = 'intermediate', onBack }) {
  const isAdv = plan === 'advanced'

  const details = {
    intermediate: {
      icon: <PIcStar s={32} c='#FF653F'/>,
      label: 'Intermediate Plan',
      price: '₹499',
      period: '/month',
      color: '#FF653F',
      bg: '#FFF3EE',
      border: '#fec9b0',
      features: [
        'Prepare for 2 exams simultaneously',
        'Combined day-by-day study schedule',
        'Dual-exam full mock tests',
        'Cross-exam performance analytics',
        'PDF solutions with charts',
        'Priority email support',
      ],
    },
    advanced: {
      icon: <PIcRocket s={32} c='#FF653F'/>,
      label: 'Advanced Plan',
      price: '₹1,199',
      period: '/3 months',
      color: '#FF653F',
      bg: '#FFF3EE',
      border: '#fec9b0',
      features: [
        'Unlimited exam combinations',
        'Full multi-exam study planner',
        'All exam mock tests included',
        'Priority coaching & weak analysis',
        'WhatsApp daily reminders',
        'Early access to all new exams',
        'Dedicated support',
      ],
    },
  }

  const d = details[plan] || details.intermediate

  return (
    <div style={{
      minHeight:'100vh',
      background:'#ffffff',
      fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif",
      display:'flex', flexDirection:'column',
    }}>

      {/* ── HEADER NAV BAR ── */}
      <div style={{background:'#111',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,background:'#FF653F',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800}}>MT</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.1}}>MockTest</div>
            <div style={{fontSize:8.5,fontWeight:700,color:'#FF653F',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
          </div>
        </div>
        <button onClick={onBack} style={{fontSize:13,fontWeight:600,color:'#fff',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:10,padding:'8px 16px',cursor:'pointer'}}>
          ← Back
        </button>
      </div>

      {/* Card area */}
      <style>{`
        @media(max-width:480px){
          .pcs-card{padding:28px 20px!important;margin:0!important}
          .pcs-notify-row{flex-direction:column!important}
          .pcs-notify-row input{border-radius:9px!important}
          .pcs-notify-row button{border-radius:9px!important;width:100%}
        }
      `}</style>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>

      {/* Card */}
      <div className="pcs-card" style={{
        background:'#fff', borderRadius:24, padding:'40px 36px',
        maxWidth:480, width:'100%',
        boxShadow:'0 16px 48px rgba(255,101,63,.14)',
        border:`2px solid ${d.border}`,
        textAlign:'center',
      }}>

        {/* Icon */}
        <div style={{
          width:72, height:72, borderRadius:20, background:d.bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 20px',
          border:`2px solid ${d.border}`,
        }}>{d.icon}</div>

        {/* Coming soon badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'#FFF4E6', border:'1.5px solid #FED7AA',
          color:'#D97706', borderRadius:20, padding:'4px 14px',
          fontSize:11, fontWeight:700, marginBottom:16,
        }}>
          <PIcTool s={14} c='#D97706'/> Payment Integration — Coming Soon
        </div>

        <h1 style={{fontSize:22, fontWeight:800, color:'#0f172a', marginBottom:6}}>
          {d.label}
        </h1>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'center', gap:4, marginBottom:8}}>
          <span style={{fontSize:32, fontWeight:800, color:d.color}}>{d.price}</span>
          <span style={{fontSize:13, color:'#94a3b8'}}>{d.period}</span>
        </div>
        <p style={{fontSize:13, color:'#64748b', lineHeight:1.65, marginBottom:24}}>
          We're integrating Razorpay / UPI payment gateway. You'll be notified as soon as it's live — it won't be long!
        </p>

        {/* Features */}
        <div style={{
          background:d.bg, border:`1.5px solid ${d.border}`,
          borderRadius:14, padding:'16px 20px', marginBottom:24, textAlign:'left',
        }}>
          <div style={{fontSize:12, fontWeight:700, color:d.color, marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em'}}>
            What you'll get
          </div>
          {d.features.map(f => (
            <div key={f} style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <span style={{width:18, height:18, borderRadius:'50%', background:d.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <span style={{color:'#fff', fontSize:10, fontWeight:700}}>✓</span>
              </span>
              <span style={{fontSize:12, color:'#374151'}}>{f}</span>
            </div>
          ))}
        </div>

        {/* Notify me form */}
        <div style={{
          background:'#f8faff', border:'1.5px solid #e2e8f0',
          borderRadius:12, padding:'16px 18px', marginBottom:24, textAlign:'left',
        }}>
          <div style={{fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:8}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:5}}><PIcBell s={12} c='#0f172a'/> Notify me when payment is live</span>
          </div>
          <div className="pcs-notify-row" style={{display:'flex', gap:8}}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex:1, padding:'9px 14px', border:'1.5px solid #e2e8f0',
                borderRadius:9, fontSize:12, color:'#0f172a', outline:'none',
              }}
            />
            <button style={{
              padding:'9px 16px', background:'#FF653F',
              color:'#fff', border:'none', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
            }}>
              Notify Me
            </button>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width:'100%', padding:'12px 0',
            background:'#fff', color:'#64748b',
            border:'1.5px solid #e2e8f0', borderRadius:12,
            fontSize:13, fontWeight:600, cursor:'pointer',
          }}
        >
          ← Go Back
        </button>

        <p style={{fontSize:11, color:'#94a3b8', marginTop:14}}>
          Your free plan is still active. You can upgrade anytime from the dashboard.
        </p>
      </div>
      </div>
    </div>
  )
}
