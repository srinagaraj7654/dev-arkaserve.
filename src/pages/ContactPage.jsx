const _MailIc = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c||'#F06535'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

export default function ContactPage() {
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#fff', color:'#111' }}>
      <section style={{ background:'#111', padding:'48px 32px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <h1 style={{ fontSize:'clamp(28px,6vw,38px)', fontWeight:900, color:'#fff', letterSpacing:'-1px', marginBottom:10 }}>Get in Touch</h1>
          <p style={{ fontSize:'clamp(14px,3.5vw,16px)', color:'rgba(255,255,255,.55)' }}>We'd love to hear from you.</p>
        </div>
      </section>

      <section style={{ padding:'64px 24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ maxWidth:480, textAlign:'center' }}>
          <div style={{ width:64, height:64, background:'#FFF3EE', border:'2px solid #fec9b0', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <_MailIc s={28}/>
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#111', marginBottom:12 }}>Contact Arkaserve</h2>
          <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.75, marginBottom:32 }}>
            MockTest is a product of Arkaserve. For any questions, feedback, or support — visit our main contact page.
          </p>
          <a
            href="https://www.arkaserve.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display:'inline-block', background:'#F06535', color:'#fff', textDecoration:'none', borderRadius:10, padding:'13px 32px', fontSize:14, fontWeight:700 }}
          >
            Go to arkaserve.com/contact →
          </a>
          <p style={{ marginTop:40, fontSize:12, color:'#d1d5db' }}>by Arkaserve · prep.arkaserve.com</p>
        </div>
      </section>
    </div>
  )
}
