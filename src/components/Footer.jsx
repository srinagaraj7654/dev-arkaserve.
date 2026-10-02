const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
)

const EXAM_CATS = [
  {
    head: 'Banking', live: true, dest: 'mocktest',
    items: ['IBPS Clerk','IBPS PO','SBI Clerk','SBI PO','RRB Assistant','Coal India MT'],
  },
  {
    head: 'RBI', live: true, dest: 'mocktest',
    items: ['RBI Assistant','RBI Grade B'],
  },
  {
    head: 'LIC', live: true, dest: 'mocktest',
    items: ['LIC AAO','LIC ADO','LIC Assistant'],
  },
  {
    head: 'NABARD', live: true, dest: 'mocktest',
    items: ['NABARD Grade A','NABARD Dev Asst'],
  },
  {
    head: 'SSC', live: true, dest: 'mocktest',
    items: ['SSC CGL','SSC CHSL','SSC MTS'],
    soonItems: ['SSC CPO','SSC Stenographer','SSC Selection Post'],
  },
  {
    head: 'Railway', live: true, dest: 'mocktest',
    items: ['RRB NTPC CBT1','RRB NTPC CBT2','RRB Group D','RRB ALP'],
  },
  {
    head: 'Insurance', live: false, dest: null,
    items: ['NICL AO','UIIC AO','NIACL AO','OICL AO'],
  },
  {
    head: 'Defence', live: false, dest: null,
    items: ['AFCAT','CDS','CAPF','Coast Guard AC','Indian Navy SSR','IAF X/Y Group'],
  },
  {
    head: 'Police', live: false, dest: null,
    items: ['Delhi Police SI','State Police SI','State Police Constable','CISF','CRPF','BSF','ITBP','SSB'],
  },
  {
    head: 'Government', live: false, dest: null,
    items: ['UPSC Prelims','State PSC'],
  },
  {
    head: 'Teaching', live: false, dest: null,
    items: ['DSSSB','KVS','NVS'],
  },
  {
    head: 'MBA', live: false, dest: null,
    items: ['ICET','MAT'],
  },
  {
    head: 'Law', live: false, dest: null,
    items: ['CLAT','AILET','SLAT'],
  },
  {
    head: 'Engineering', live: false, dest: null,
    items: ['GATE CS','GATE ECE','JEE Mains','JEE Advanced'],
  },
  {
    head: 'Medical', live: false, dest: null,
    items: ['NEET UG','NEET PG','AIIMS'],
  },
  {
    head: 'US Exams 🌎', live: false, dest: 'us-exams',
    items: ['SAT (Digital)','ACT','SAT Math','SAT Reading & Writing','ACT Science'],
    comingSoon: true,
  },
]

const COMPANY_LINKS = [
  ['About Us','about'],['Success Stories','success'],['Contact','contact'],
  ['Courses','courses'],
]

const PRACTICE_LINKS = [
  ['Full Mock Test','mock'],['Topic-wise Practice','mock'],
  ['Section Test','mock'],['Adaptive Mode','mock'],
]

const LEGAL_LINKS = [
  ['Privacy Policy','privacy'],['Terms of Use','terms'],
  ['Refund Policy','refund'],['Disclaimer','disclaimer'],
  ['Cookie Policy','cookies'],
]

const SOCIAL = [
  { Icon: IconWhatsApp,  label:'WhatsApp',  href:'https://wa.me/919490284208' },
  { Icon: IconLinkedIn,  label:'LinkedIn',  href:'https://www.linkedin.com/in/arkaserve-arka-49b69943b/' },
  { Icon: IconFacebook,  label:'Facebook',  href:'https://www.facebook.com/profile.php?id=61594130324404' },
  { Icon: IconX,         label:'X / Twitter', href:'https://x.com/home' },
  { Icon: IconInstagram, label:'Instagram', href:'https://www.instagram.com/arkaserve/' },
]

const CONTACT = [
  { num:'+91 82474 99605', wa:'918247499605' },
  { num:'+91 94902 84208', wa:'919490284208' },
]

import { useState, useEffect } from 'react'
import api from '../api'

export default function Footer({ onNav }) {
  const nav = (id) => id && onNav(id)
  const [visitorCount, setVisitorCount] = useState(null)

  useEffect(() => {
    api.get('/visitor/count').then(r => setVisitorCount(r.data.count)).catch(() => {})
  }, [])

  return (
    <footer style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

      <style>{`
        .ft-exam-grid {
          column-count: 8;
          column-gap: 24px;
        }
        .ft-exam-grid > div {
          break-inside: avoid;
          margin-bottom: 20px;
        }
        @media(max-width:1024px){
          .ft-exam-grid{ column-count: 5; }
        }
        @media(max-width:600px){
          .ft-exam-grid{ column-count: 3; column-gap: 14px; }
        }
        .ft-bottom-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        @media(max-width:900px){
          .ft-bottom-grid{ grid-template-columns: 1fr 1fr; gap:28px; }
          .ft-brand-col{ grid-column: span 2; }
        }
        @media(max-width:480px){
          .ft-bottom-grid{ grid-template-columns: 1fr 1fr; gap:24px 16px; }
        }
      `}</style>

      {/* ── TOP: Explore All Mock Tests ── */}
      <div style={{ background:'#0d1117', padding:'52px 32px 48px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <h3 style={{ textAlign:'center', fontSize:22, fontWeight:800, color:'#fff', marginBottom:6, letterSpacing:'-0.3px' }}>
            Explore All Mock Tests
          </h3>
          <p style={{ textAlign:'center', fontSize:13, color:'#6b7280', marginBottom:36 }}>
            Banking, SSC &amp; Railway are live — more will be coming soon
          </p>

          <div className="ft-exam-grid">
            {EXAM_CATS.map(cat => (
              <div key={cat.head}>
                <div style={{ fontSize:11.5, fontWeight:800, color: cat.live ? '#fff' : '#6b7280', marginBottom:7 }}>
                  {cat.head.replace(' 🌎','')}
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                  {cat.items.map(label => (
                    <li key={label} style={{ marginBottom:5 }}>
                      {cat.live
                        ? <button onClick={() => nav(cat.dest)}
                            style={{ background:'none', border:'none', padding:0, fontSize:11, color:'#FF653F', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                            onMouseOver={e => e.currentTarget.style.color='#ffa07a'}
                            onMouseOut={e => e.currentTarget.style.color='#FF653F'}
                          >{label}</button>
                        : cat.dest
                          ? <button onClick={() => nav(cat.dest)}
                              style={{ background:'none', border:'none', padding:0, fontSize:11, color:'#4b5563', cursor:'pointer', textAlign:'left', transition:'color .12s' }}
                              onMouseOver={e => e.currentTarget.style.color='#6b7280'}
                              onMouseOut={e => e.currentTarget.style.color='#4b5563'}
                            >{label}</button>
                          : <span style={{ fontSize:11, color:'#374151' }}>{label}</span>
                      }
                    </li>
                  ))}
                  {cat.soonItems?.map(label => (
                    <li key={label} style={{ marginBottom:5 }}>
                      <span style={{ fontSize:11, color:'#374151' }}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAND ── */}
      <div style={{ background:'#111', borderTop:'1px solid rgba(255,255,255,.06)', padding:'44px 32px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div className="ft-bottom-grid">

            {/* Brand */}
            <div className="ft-brand-col">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:34, height:34, background:'#FF653F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:800, flexShrink:0 }}>MT</div>
                <span style={{ fontSize:17, fontWeight:800, color:'#fff' }}>MockTest</span>
              </div>
              <p style={{ fontSize:12, color:'#374151', marginBottom:20 }}>by Arkaserve</p>

              {/* Social icons */}
              <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
                {SOCIAL.map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    style={{ width:38, height:38, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', transition:'background .15s,color .15s', textDecoration:'none' }}
                    onMouseOver={e => { e.currentTarget.style.background='#FF653F'; e.currentTarget.style.color='#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#9ca3af' }}
                  ><Icon /></a>
                ))}
              </div>

              {/* Contact numbers */}
              {CONTACT.map(({ num }) => (
                <div key={num} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
                  <IconPhone />
                  <span style={{ fontSize:13, color:'#FF653F', fontWeight:600 }}>{num}</span>
                </div>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Company</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {COMPANY_LINKS.map(([label, dest]) => (
                  <li key={label} style={{ marginBottom:10 }}>
                    <button onClick={() => nav(dest)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#6b7280', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                      onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color='#6b7280'}
                    >{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Modes */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Practice</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {PRACTICE_LINKS.map(([label, dest]) => (
                  <li key={label} style={{ marginBottom:10 }}>
                    <button onClick={() => nav(dest)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#6b7280', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                      onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color='#6b7280'}
                    >{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Legal</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {LEGAL_LINKS.map(([label, dest]) => (
                  <li key={label} style={{ marginBottom:10 }}>
                    <button onClick={() => nav(dest)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#6b7280', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                      onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color='#6b7280'}
                    >{label}</button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Copyright */}
        <div style={{ maxWidth:1280, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,.06)', padding:'18px 0', marginTop:36 }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:12, color:'#374151' }}>
                © {new Date().getFullYear()} Arkaserve · mocktest.arkaserve.com · All rights reserved
              </span>
              {visitorCount !== null && (
                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                  {String(visitorCount).padStart(6,'0').split('').map((d,i) => (
                    <div key={i} style={{ width:20, height:26, background:'#111', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,.08)' }}>
                      <span style={{ fontSize:13, fontWeight:800, color:'#FF653F', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{d}</span>
                    </div>
                  ))}
                  <span style={{ fontSize:11, color:'#6b7280', marginLeft:6 }}>total visitors</span>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[['privacy','Privacy'],['terms','Terms'],['contact','Contact']].map(([id,label]) => (
                <button key={id} onClick={() => nav(id)}
                  style={{ background:'none', border:'none', padding:0, fontSize:12, color:'#374151', cursor:'pointer', transition:'color .12s' }}
                  onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                  onMouseOut={e => e.currentTarget.style.color='#374151'}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
