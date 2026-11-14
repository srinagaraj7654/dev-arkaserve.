export default function CookiesPage() {
  const updated = '01 Oct 2026'
  const S = { page:{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#fff', color:'#111' }, inner:{ maxWidth:760, margin:'0 auto', padding:'0 24px' } }
  const sections = [
    { title:'1. What are cookies?', body:`Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how you use the platform so we can improve it.` },
    { title:'2. Cookies we use', list:[
      'Session cookies — keep you signed in during your visit (deleted when you close the browser)',
      'Preference cookies — remember your exam category, dark/light mode, and display settings',
      'Analytics cookies — help us understand which features are most used (aggregated, anonymous data)',
      'Security cookies — protect against cross-site request forgery (CSRF) and other attacks',
    ]},
    { title:'3. What we do NOT use', list:[
      'Third-party advertising cookies',
      'Cross-site tracking pixels',
      'Fingerprinting or device profiling tools',
    ]},
    { title:'4. Third-party services', body:`We use Supabase for authentication (session management) and may use Cloudflare for CDN and DDoS protection. These services may set their own cookies governed by their respective privacy policies.` },
    { title:'5. Managing cookies', body:`You can control or delete cookies via your browser settings. Disabling session cookies will prevent you from staying signed in. Disabling preference cookies means your settings won't be saved between visits. Most browsers let you block third-party cookies without affecting core functionality.` },
    { title:'6. Changes to this policy', body:`We may update this Cookie Policy as the platform evolves. Material changes will be announced on the platform and the "Last updated" date above will be revised.` },
    { title:'7. Contact', contact: true },
  ]
  return (
    <div style={S.page}>
      <section style={{ background:'#111', padding:'48px 32px' }}>
        <div style={{ ...S.inner, textAlign:'center' }}>
          <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-1px', marginBottom:8 }}>Cookie Policy</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>Last updated: {updated} · Effective immediately</p>
        </div>
      </section>
      <section style={{ padding:'48px 32px' }}>
        <div style={S.inner}>
          <div style={{ background:'#FFF3EE', border:'1.5px solid #fec9b0', borderRadius:11, padding:'14px 18px', marginBottom:32, fontSize:13, color:'#111', lineHeight:1.6 }}>
            We only use cookies essential to the platform's function. We do not use advertising or tracking cookies.
          </div>
          {sections.map(sec => (
            <div key={sec.title} style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:16, fontWeight:800, marginBottom:8, color:'#111' }}>{sec.title}</h2>
              {sec.body && <p style={{ fontSize:14, color:'#374151', lineHeight:1.75 }}>{sec.body}</p>}
              {sec.list && <ul style={{ margin:0, paddingLeft:0, listStyle:'none' }}>{sec.list.map(item => (
                <li key={item} style={{ fontSize:14, color:'#374151', lineHeight:1.75, paddingLeft:20, position:'relative', marginBottom:4 }}>
                  <span style={{ position:'absolute', left:0, color:'#F06535' }}>—</span>{item}
                </li>
              ))}</ul>}
              {sec.contact && <p style={{ fontSize:14, color:'#374151', lineHeight:1.75 }}>Email: <a href="mailto:support@arkaserve.com" style={{ color:'#F06535' }}>support@arkaserve.com</a> · Phone: +91 94902 84208</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
