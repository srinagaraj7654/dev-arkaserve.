export default function RefundPage() {
  const updated = '01 Oct 2026'
  const S = { page:{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#fff', color:'#111' }, inner:{ maxWidth:760, margin:'0 auto', padding:'0 24px' } }
  const sections = [
    { title:'1. Overview', body:`Arkaserve offers a 7-day refund policy on all Premium subscriptions purchased through MockTest (prep.arkaserve.com). If you are not satisfied with your purchase for any reason, you may request a full refund within 7 calendar days of the purchase date, subject to the conditions below.` },
    { title:'2. Eligibility for refund', list:['Refund request must be submitted within 7 days of the original purchase date','You must not have taken more than 3 full mock tests during the subscription period','The subscription must have been purchased directly through our platform','Free-tier conversions and promotional subscriptions are not eligible for refunds','Refunds are available only once per user account'] },
    { title:'3. Non-refundable items', list:['Institute / bulk-seat subscriptions (governed by a separate agreement)','Renewals — cancel before the renewal date to avoid future charges','Partial-period refunds after the 7-day window','Any subscription used beyond the 3-test limit'] },
    { title:'4. How to request a refund', body:`Email us at support@arkaserve.com with the subject line "Refund Request — [your registered email]". Include your order ID and the reason for your request. We aim to acknowledge all requests within 1 business day.` },
    { title:'5. Processing timeline', body:`Approved refunds are processed within 7 business days. The credit will appear in your original payment method within 5–10 business days depending on your bank or card issuer. Arkaserve is not responsible for delays caused by third-party payment processors.` },
    { title:'6. Cancellation (no refund required)', body:`You may cancel your subscription at any time from your Dashboard → Account Settings. Cancellation stops future billing; your premium access continues until the end of the current paid period. No refund is issued for the remaining days of a paid period unless you are within the 7-day refund window.` },
    { title:'7. Contact', contact: true },
  ]
  return (
    <div style={S.page}>
      <section style={{ background:'#111', padding:'48px 32px' }}>
        <div style={{ ...S.inner, textAlign:'center' }}>
          <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-1px', marginBottom:8 }}>Refund Policy</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>Last updated: {updated} · Effective immediately</p>
        </div>
      </section>
      <section style={{ padding:'48px 32px' }}>
        <div style={S.inner}>
          <div style={{ background:'#FFF3EE', border:'1.5px solid #fec9b0', borderRadius:11, padding:'14px 18px', marginBottom:32, fontSize:13, color:'#111', lineHeight:1.6 }}>
            We believe in fair pricing. If MockTest isn't right for you, we'll make it easy to get your money back within 7 days.
          </div>
          {sections.map(sec => (
            <div key={sec.title} style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:16, fontWeight:800, marginBottom:8, color:'#111' }}>{sec.title}</h2>
              {sec.body && <p style={{ fontSize:14, color:'#374151', lineHeight:1.75 }}>{sec.body}</p>}
              {sec.list && <ul style={{ margin:0, paddingLeft:0, listStyle:'none' }}>{sec.list.map(item => (
                <li key={item} style={{ fontSize:14, color:'#374151', lineHeight:1.75, paddingLeft:20, position:'relative', marginBottom:4 }}>
                  <span style={{ position:'absolute', left:0, color:'#FF653F' }}>—</span>{item}
                </li>
              ))}</ul>}
              {sec.contact && <p style={{ fontSize:14, color:'#374151', lineHeight:1.75 }}>Email: <a href="mailto:support@arkaserve.com" style={{ color:'#FF653F' }}>support@arkaserve.com</a> · Phone: +91 94902 84208</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
