import { useState, useEffect } from 'react'
import api from '../api.js'

/* ── Category icons for the explore grid ── */
const sv = (c) => ({ fill: 'none', stroke: c || 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' })
const IcBank    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
const IcLock    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IcShield  = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IcLeaf    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><path d="M17 8C8 10 5.9 16.17 3.82 19.36"/><path d="M22 2c-2.7 3-4.4 5.9-4.8 9.7"/><path d="M2 22c3.3-2 5.9-4.3 8-7"/><path d="M11 10c-4 4-5.2 9-4 12"/></svg>
const IcClip    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const IcTrain   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M8 19l-2 3M16 19l2 3M9 19h6"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/></svg>
const IcGear    = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IcHeart   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IcGlobe   = ({s=15,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {...sv(c)}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>

/* ── Other icons ── */
const IconFacebook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
const IconX        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const IconLinkedIn = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
const IconInstagram= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const IconWhatsApp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
const IconPhone    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
const IcChevRight  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconMail     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

/* ── Explore grid data ── */
const FLAT_GRID = [
  {
    cat: 'Banking', dest: 'mocktest', icon: <IcBank />,
    exams: [
      { label: 'IBPS Clerk' }, { label: 'IBPS PO' },
      { label: 'SBI Clerk' },  { label: 'SBI PO' },
      { label: 'RRB Assistant' }, { label: 'Coal India MT' },
    ],
  },
  {
    cat: 'RBI', dest: 'mocktest', icon: <IcLock />,
    exams: [{ label: 'RBI Assistant' }, { label: 'RBI Grade B' }],
  },
  {
    cat: 'LIC', dest: 'mocktest', icon: <IcShield />,
    exams: [{ label: 'LIC AAO' }, { label: 'LIC ADO' }, { label: 'LIC Assistant' }],
  },
  {
    cat: 'NABARD', dest: 'mocktest', icon: <IcLeaf />,
    exams: [{ label: 'NABARD Grade A' }, { label: 'NABARD Dev Asst' }],
  },
  {
    cat: 'SSC', dest: 'mocktest', icon: <IcClip />,
    exams: [
      { label: 'SSC CGL' }, { label: 'SSC CHSL' }, { label: 'SSC MTS' },
      { label: 'SSC CPO', soon: true }, { label: 'SSC Stenographer', soon: true }, { label: 'SSC Selection Post', soon: true },
    ],
  },
  {
    cat: 'Railway', dest: 'mocktest', icon: <IcTrain />,
    exams: [
      { label: 'RRB NTPC CBT1' }, { label: 'RRB NTPC CBT2' },
      { label: 'RRB Group D' },   { label: 'RRB ALP' },
    ],
  },
  {
    cat: 'Engineering', dest: null, soon: true, icon: <IcGear />,
    exams: [
      { label: 'GATE CS', soon: true }, { label: 'GATE ECE', soon: true },
      { label: 'JEE Mains', soon: true }, { label: 'JEE Advanced', soon: true },
    ],
  },
  {
    cat: 'Medical', dest: null, soon: true, icon: <IcHeart />,
    exams: [
      { label: 'NEET UG', soon: true }, { label: 'NEET PG', soon: true }, { label: 'AIIMS', soon: true },
    ],
  },
  {
    cat: 'US Exams', dest: 'us-exams', icon: <IcGlobe />,
    exams: [
      { label: 'SAT (Digital)' }, { label: 'ACT' },
      { label: 'SAT Math' }, { label: 'SAT Reading & Writing' }, { label: 'ACT Science' },
    ],
  },
]

const COMPANY_LINKS = [
  ['About Us', 'about'], ['Success Stories', 'success'],
  ['Contact', null, 'https://www.arkaserve.com/contact'],
  ['Courses', 'courses'],
]
const RESOURCE_LINKS = [
  ['Current Affairs', 'current-affairs'], ['US Exams', 'us-exams'],
  ['Blog', 'blog'], ['Exam Patterns', 'exams'], ['Cut-off Trends', 'cutoffs'],
  ['Past Papers', 'papers'], ['Full Mock Test', 'mocktest'], ['Topic-wise Practice', 'mocktest'],
]
const LEGAL_LINKS = [
  ['Privacy Policy', 'privacy'], ['Terms of Use', 'terms'],
  ['Refund Policy', 'refund'], ['Disclaimer', 'disclaimer'], ['Cookie Policy', 'cookies'],
]
const SOCIAL = [
  { Icon: IconWhatsApp,  label: 'WhatsApp',    href: 'https://wa.me/919490284208' },
  { Icon: IconLinkedIn,  label: 'LinkedIn',    href: 'https://www.linkedin.com/in/arkaserve-arka-49b69943b/' },
  { Icon: IconFacebook,  label: 'Facebook',    href: 'https://www.facebook.com/profile.php?id=61594130324404' },
  { Icon: IconX,         label: 'X / Twitter', href: 'https://x.com/home' },
  { Icon: IconInstagram, label: 'Instagram',   href: 'https://www.instagram.com/arkaserve/' },
]
const CONTACT = [
  { num: '+91 82474 99605' },
  { num: '+91 94902 84208' },
]

const LINK_STYLE = {
  background: 'none', border: 'none', padding: 0,
  fontSize: 13, color: '#94a3b8', cursor: 'pointer',
  transition: 'color .12s', textAlign: 'left', display: 'block', marginBottom: 10,
}

/* ── Main Footer ── */
export default function Footer({ onNav, compact = false }) {
  const nav = (id) => id && onNav(id)
  const [visitorCount, setVisitorCount] = useState(null)
  const [openCat, setOpenCat] = useState(null)
  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState('idle') // idle | done

  useEffect(() => {
    api.get('/visitor/count').then(r => setVisitorCount(r.data.count)).catch(() => {})
  }, [])

  const handleSubscribe = () => {
    if (email.trim().includes('@')) setSubState('done')
  }

  return (
    <footer style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>

      <style>{`
        /* ── Explore section ── */
        .ft-explore-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0;
        }
        .ft-explore-mobile { display: none; }
        .ft-link-chevron { display: none; }

        /* ── Bottom band grid: brand | company | resources | legal | stay-updated ── */
        .ft-bottom-grid {
          display: grid;
          grid-template-columns: 1.45fr 1fr 1.1fr 1fr 1.4fr;
          gap: 40px;
          align-items: start;
        }

        /* ── Responsive ── */
        @media(max-width:1200px) {
          .ft-bottom-grid { grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 28px; }
          .ft-stay-updated { grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,.07); padding-top: 28px; margin-top: 4px; }
          .ft-explore-grid { grid-template-columns: repeat(5, 1fr) !important; row-gap: 32px !important; }
        }
        @media(max-width:900px) {
          .ft-bottom-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
          .ft-brand-col { grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,.07); padding-top: 24px; margin-top: 4px; }
        }
        @media(max-width:700px) {
          .ft-explore-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media(max-width:640px) {
          /* Explore accordion */
          .ft-explore-section { padding: 36px 20px 32px !important; }
          .ft-explore-grid { display: none !important; }
          .ft-explore-mobile { display: block !important; }
          /* Bottom layout */
          .ft-bottom-section { padding: 28px 20px 0 !important; }
          .ft-bottom-grid { grid-template-columns: 1fr 1fr !important; gap: 0 !important; }
          /* Brand: full-width at top, no divider (it IS the top) */
          .ft-brand-col { grid-column: 1 / -1 !important; border-top: none !important; margin-top: 0 !important; padding-top: 0 !important; padding-bottom: 24px !important; }
          /* Social icons: larger touch targets */
          .ft-social-btn { width: 44px !important; height: 44px !important; border-radius: 10px !important; }
          /* Company + Resources: side-by-side with top divider */
          .ft-company-col { border-top: 1px solid rgba(255,255,255,.08) !important; padding-top: 22px !important; padding-bottom: 20px !important; padding-right: 14px !important; }
          .ft-resources-col { border-top: 1px solid rgba(255,255,255,.08) !important; padding-top: 22px !important; padding-bottom: 20px !important; padding-left: 14px !important; }
          /* Legal: full-width section */
          .ft-legal-col { grid-column: 1 / -1 !important; border-top: 1px solid rgba(255,255,255,.08) !important; padding-top: 22px !important; padding-bottom: 4px !important; }
          .ft-legal-links { display: flex !important; flex-direction: column !important; }
          /* Stay Updated: hidden on mobile */
          .ft-stay-updated { display: none !important; }
          /* Nav links: white text, flex row with chevron, per-item divider */
          .ft-nav-link { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 10px 0 !important; color: #e2e8f0 !important; border-bottom: 1px solid rgba(255,255,255,.06) !important; margin-bottom: 0 !important; font-size: 13.5px !important; width: 100% !important; text-align: left !important; }
          .ft-link-chevron { display: inline-flex !important; align-items: center !important; color: rgba(255,255,255,.55) !important; flex-shrink: 0; margin-left: 6px; }
          /* Section headers */
          .ft-link-heading { margin-bottom: 4px !important; }
          /* Contact: stacked vertically */
          .ft-contact-row { flex-direction: column !important; gap: 10px !important; }
          /* Copyright */
          .ft-copyright-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; padding-bottom: 80px !important; }
        }
        @media(max-width:320px) {
          .ft-bottom-grid { grid-template-columns: 1fr !important; }
          .ft-resources-col { border-top: none !important; padding-left: 0 !important; padding-top: 0 !important; }
          .ft-legal-links { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          UPPER: Explore All Mock Tests
      ══════════════════════════════════════════ */}
      {!compact && (
        <div className="ft-explore-section" style={{ background: '#0b1120', padding: '56px 0 48px' }}>
          <div style={{ width: '92%', maxWidth: 1440, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.4px' }}>
                Explore All{' '}
                <span style={{ color: '#FF653F' }}>Mock Tests</span>
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: '8px 0 0', letterSpacing: '.01em' }}>
                Banking, SSC &amp; Railway are live — more will be coming soon
              </p>
            </div>

            {/* Desktop 9-column grid */}
            <div className="ft-explore-grid">
              {FLAT_GRID.map((cat, ci) => (
                <div key={cat.cat} style={{
                  padding: '0 20px',
                  borderRight: ci < FLAT_GRID.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
                }}>
                  {/* Category header: icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                    <span style={{ color: cat.soon ? '#374151' : '#64748b', display: 'flex', alignItems: 'center' }}>
                      {cat.icon}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: cat.soon ? '#374151' : '#ffffff', letterSpacing: '.01em' }}>
                      {cat.cat}
                    </span>
                  </div>
                  {cat.exams.map(exam => (
                    <button key={exam.label}
                      onClick={() => !exam.soon && cat.dest && nav(cat.dest)}
                      disabled={!!exam.soon}
                      style={{
                        display: 'block', width: '100%', background: 'none', border: 'none',
                        padding: '4px 0', fontSize: 12.5, fontWeight: 500, textAlign: 'left',
                        color: exam.soon ? '#1e293b' : '#FF653F',
                        cursor: exam.soon ? 'default' : 'pointer', transition: 'color .12s',
                      }}
                      onMouseOver={e => { if (!exam.soon) e.currentTarget.style.color = '#ffa07a' }}
                      onMouseOut={e => { if (!exam.soon) e.currentTarget.style.color = '#FF653F' }}>
                      {exam.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile: accordion */}
            <div className="ft-explore-mobile">
              {FLAT_GRID.map(cat => {
                const isOpen = openCat === cat.cat
                return (
                  <div key={cat.cat} style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                    <button
                      onClick={() => setOpenCat(isOpen ? null : cat.cat)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '14px 4px', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                      }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: cat.soon ? '#374151' : '#64748b', display: 'flex' }}>{cat.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: cat.soon ? '#374151' : isOpen ? '#FF653F' : '#fff' }}>{cat.cat}</span>
                      </span>
                      <span style={{ fontSize: 18, color: isOpen ? '#FF653F' : 'rgba(255,255,255,.35)', lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ paddingBottom: 12 }}>
                        {cat.exams.map(exam => (
                          <button key={exam.label}
                            onClick={() => !exam.soon && cat.dest && nav(cat.dest)}
                            disabled={!!exam.soon}
                            style={{
                              display: 'block', width: '100%', background: 'none', border: 'none',
                              padding: '7px 4px', fontSize: 13.5, fontWeight: 500, textAlign: 'left',
                              color: exam.soon ? '#1e293b' : '#FF653F', cursor: exam.soon ? 'default' : 'pointer',
                            }}>
                            {exam.label}
                            {exam.soon && <span style={{ fontSize: 10, color: '#f59e0b', marginLeft: 6 }}>Soon</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* ── Divider ── */}
      {!compact && (
        <div style={{ background: '#0d1525' }}>
          <div style={{ width: '92%', maxWidth: 1440, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,.07)' }} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          LOWER: Brand + Links + Stay Updated
      ══════════════════════════════════════════ */}
      <div className="ft-bottom-section" style={{ background: '#0d1525', padding: '48px 0 0' }}>
        <div style={{ width: '92%', maxWidth: 1440, margin: '0 auto' }}>
          <div className="ft-bottom-grid">

            {/* ── Brand column ── */}
            <div className="ft-brand-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, flexShrink: 0,
                  background: 'linear-gradient(135deg,#FF653F,#e5512f)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(255,101,63,.35)',
                }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 900, letterSpacing: '-0.5px' }}>MT</span>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.3px' }}>MockTest</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#FF653F', fontStyle: 'italic', letterSpacing: '.09em', textTransform: 'uppercase', marginTop: 3, lineHeight: 1 }}>
                    Your World of Mock Tests
                  </div>
                </div>
              </div>

              <a href="https://www.arkaserve.com" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: 18, transition: 'color .12s' }}
                onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                by Arkaserve ↗
              </a>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {SOCIAL.map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="ft-social-btn"
                    style={{ width: 38, height: 38, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'background .15s,color .15s', textDecoration: 'none' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#FF653F'; e.currentTarget.style.color = '#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = '#94a3b8' }}>
                    <Icon />
                  </a>
                ))}
              </div>

              <div className="ft-contact-row" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {CONTACT.map(({ num }) => (
                  <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: '#FF653F' }}><IconPhone /></span>
                    <span style={{ fontSize: 13, color: '#FF653F', fontWeight: 600 }}>{num}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Company ── */}
            <div className="ft-link-col ft-company-col">
              <div className="ft-link-heading" style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 18 }}>Company</div>
              {COMPANY_LINKS.map(([label, dest, href]) => (
                href
                  ? <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="ft-nav-link"
                      style={{ ...LINK_STYLE, textDecoration: 'none' }}
                      onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                      <span>{label}</span><span className="ft-link-chevron"><IcChevRight /></span>
                    </a>
                  : <button key={label} onClick={() => nav(dest)} className="ft-nav-link" style={LINK_STYLE}
                      onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                      <span>{label}</span><span className="ft-link-chevron"><IcChevRight /></span>
                    </button>
              ))}
            </div>

            {/* ── Resources ── */}
            <div className="ft-link-col ft-resources-col">
              <div className="ft-link-heading" style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 18 }}>Resources</div>
              {RESOURCE_LINKS.map(([label, dest]) => (
                <button key={label} onClick={() => nav(dest)} className="ft-nav-link" style={LINK_STYLE}
                  onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                  onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                  <span>{label}</span><span className="ft-link-chevron"><IcChevRight /></span>
                </button>
              ))}
            </div>

            {/* ── Legal ── */}
            <div className="ft-link-col ft-legal-col">
              <div className="ft-link-heading" style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 18 }}>Legal</div>
              <div className="ft-legal-links">
                {LEGAL_LINKS.map(([label, dest]) => (
                  <button key={label} onClick={() => nav(dest)} className="ft-nav-link" style={LINK_STYLE}
                    onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                    onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                    <span>{label}</span><span className="ft-link-chevron"><IcChevRight /></span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Stay Updated ── */}
            <div className="ft-stay-updated">
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', marginBottom: 8 }}>Stay Updated</div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>
                Get latest exam updates, mock tests and preparation tips.
              </p>
              {subState === 'done' ? (
                <div style={{ padding: '14px 18px', background: 'rgba(255,101,63,.1)', border: '1px solid rgba(255,101,63,.3)', borderRadius: 10, color: '#FF653F', fontSize: 13.5, fontWeight: 600 }}>
                  ✓ You're subscribed! Watch your inbox.
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569', display: 'flex', pointerEvents: 'none' }}>
                      <IconMail />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                      placeholder="Enter your email"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '12px 14px 12px 40px',
                        background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                        borderRadius: 10, color: '#e2e8f0', fontSize: 13.5, outline: 'none',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,101,63,.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
                    />
                  </div>
                  <button onClick={handleSubscribe} style={{
                    width: '100%', padding: '12px', background: '#FF653F',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background .15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                  onMouseOut={e => e.currentTarget.style.background = '#FF653F'}>
                    Subscribe →
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Copyright */}
        <div style={{ width: '92%', maxWidth: 1440, margin: '36px auto 0', borderTop: '1px solid rgba(255,255,255,.06)', padding: '18px 0' }}>
          <div className="ft-copyright-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#475569' }}>
                © {new Date().getFullYear()} MockTest. All rights reserved.
              </span>
              {visitorCount !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {String(visitorCount).padStart(6, '0').split('').map((d, i) => (
                    <div key={i} style={{ width: 20, height: 26, background: 'rgba(255,255,255,.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.09)' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#FF653F', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{d}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: '#475569', marginLeft: 6 }}>total visitors</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['privacy', 'Privacy'], ['terms', 'Terms'], ['contact', 'Contact']].map(([id, label]) => (
                <button key={id} onClick={() => nav(id)}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#475569', cursor: 'pointer', transition: 'color .12s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                  onMouseOut={e => e.currentTarget.style.color = '#475569'}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
