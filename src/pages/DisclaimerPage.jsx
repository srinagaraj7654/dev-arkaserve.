export default function DisclaimerPage() {
  const updated = '01 Oct 2026'
  const S = { page:{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#fff', color:'#111' }, inner:{ maxWidth:760, margin:'0 auto', padding:'0 24px' } }
  const sections = [
    { title:'1. Educational purpose only', body:`MockTest (prep.arkaserve.com) is an educational preparation platform. All mock tests, questions, explanations, cut-off estimates, and performance insights are provided strictly for practice and learning purposes and do not constitute official examination material.` },
    { title:'2. No guarantee of exam success', body:`Performance on MockTest — including readiness scores, weakness predictions, and score forecasts — is generated algorithmically based on your practice data. These are educational estimates only and do not guarantee success in any actual government, banking, insurance, engineering, or other competitive examination.` },
    { title:'3. AI-generated content', body:`MockTest uses automated question generation and validation systems. While we employ multi-layer quality checks, some questions may contain inaccuracies. Users are advised to verify critical information against official syllabi and study materials published by the respective examining bodies.` },
    { title:'4. Accuracy of cut-offs and data', body:`Cut-off figures, vacancy counts, and exam pattern data shown on this platform are compiled from publicly available sources for indicative purposes only. Arkaserve does not guarantee their accuracy or completeness. Always refer to the official notification of the relevant examining authority for confirmed data.` },
    { title:'5. Third-party links', body:`Our platform may contain links to third-party websites (official exam boards, study resources, etc.). Arkaserve is not responsible for the content, accuracy, or privacy practices of any third-party sites.` },
    { title:'6. Liability limitation', body:`To the maximum extent permitted by applicable law, Arkaserve shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of MockTest, including but not limited to exam failure, reliance on inaccurate content, or service interruptions.` },
    { title:'7. Contact', contact: true },
  ]
  return (
    <div style={S.page}>
      <section style={{ background:'#111', padding:'48px 32px' }}>
        <div style={{ ...S.inner, textAlign:'center' }}>
          <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-1px', marginBottom:8 }}>Disclaimer</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>Last updated: {updated} · Effective immediately</p>
        </div>
      </section>
      <section style={{ padding:'48px 32px' }}>
        <div style={S.inner}>
          <div style={{ background:'#FFF3EE', border:'1.5px solid #fec9b0', borderRadius:11, padding:'14px 18px', marginBottom:32, fontSize:13, color:'#111', lineHeight:1.6 }}>
            Please read this disclaimer carefully. MockTest is a practice platform — it is not affiliated with any official examination authority.
          </div>
          {sections.map(sec => (
            <div key={sec.title} style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:16, fontWeight:800, marginBottom:8, color:'#111' }}>{sec.title}</h2>
              {sec.body && <p style={{ fontSize:14, color:'#374151', lineHeight:1.75 }}>{sec.body}</p>}
              {sec.contact && <p style={{ fontSize:14, color:'#374151', lineHeight:1.75 }}>Email: <a href="mailto:support@arkaserve.com" style={{ color:'#FF653F' }}>support@arkaserve.com</a> · Phone: +91 94902 84208</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
