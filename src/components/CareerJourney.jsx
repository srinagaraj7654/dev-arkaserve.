import { useEffect, useRef, useState } from 'react'

const _sv = (c,w) => ({fill:'none',stroke:c||'currentColor',strokeWidth:w||'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const _IcTarget   = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const _IcClipboard= ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const _IcBook     = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const _IcFlask    = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9 3h6M9 3v7l-5 11h16L15 10V3"/><line x1="6" y1="16" x2="18" y2="16"/></svg>
const _IcBrain    = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M9 2C6.5 2 4 4 4 7c-1.7.5-3 2-3 3.5 0 1.5.8 2.8 2 3.5C2.5 15 2.5 17 3.5 18.5S6 21 8 21h8c2 0 3.5-1 4.5-2.5s1-3.5.5-4.5c1.2-.7 2-2 2-3.5 0-1.5-1.3-3-3-3.5C20 4 17.5 2 15 2"/><line x1="12" y1="5" x2="12" y2="14"/><line x1="9" y1="9" x2="15" y2="9"/></svg>
const _IcRepeat   = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
const _IcTrendUp  = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const _IcMedal    = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="15" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><polyline points="7 3 12 7 17 3"/></svg>
const _IcStar     = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const _IcTrophy   = ({s=22,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H3V4h3M18 9h3V4h-3"/><path d="M6 4h12v8a6 6 0 0 1-12 0V4z"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
const _IcArrow    = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>

const STAGES = [
  {
    step: '01',
    icon: <_IcTarget s={22}/>,
    title: 'Set Your Goal',
    subtitle: 'Choose Your Dream Exam',
    desc: 'Pick from IBPS, SBI, RRB, SSC and more. Define the target that drives everything forward.',
    color: '#FF653F',
    glow: 'rgba(255,101,63,.35)',
    side: 'right',
  },
  {
    step: '02',
    icon: <_IcClipboard s={22}/>,
    title: 'Get Your Plan',
    subtitle: 'Personalised 10 / 20 / 30-Day Roadmap',
    desc: 'AI maps your current level and available time into a structured daily schedule — nothing left to chance.',
    color: '#D97706',
    glow: 'rgba(217,119,6,.32)',
    side: 'left',
  },
  {
    step: '03',
    icon: <_IcBook s={22}/>,
    title: 'Study Daily',
    subtitle: 'Follow Your Structured Schedule',
    desc: 'Topic-by-topic coverage with concept notes and sectional mini-tests. Short, focused sessions every day.',
    color: '#7C3AED',
    glow: 'rgba(124,58,237,.32)',
    side: 'right',
  },
  {
    step: '04',
    icon: <_IcFlask s={22}/>,
    title: 'Take Mock Tests',
    subtitle: 'Full-Length Timed Practice',
    desc: 'Exact IBPS/SBI format — per-section timers, negative marking, adaptive difficulty. Real exam conditions from Day 1.',
    color: '#0891B2',
    glow: 'rgba(8,145,178,.32)',
    side: 'left',
  },
  {
    step: '05',
    icon: <_IcBrain s={22}/>,
    title: 'AI Analyses You',
    subtitle: 'Deep Performance Insights',
    desc: 'After every test, the engine maps your accuracy per topic, flags time traps and ranks your weakest sections.',
    color: '#059669',
    glow: 'rgba(5,150,105,.32)',
    side: 'right',
  },
  {
    step: '06',
    icon: <_IcRepeat s={22}/>,
    title: 'Targeted Revision',
    subtitle: 'Drill Your Weak Spots',
    desc: 'Focus practice on only the topics that cost you marks. Repeat until accuracy hits 90%+.',
    color: '#DB2777',
    glow: 'rgba(219,39,119,.32)',
    side: 'left',
  },
  {
    step: '07',
    icon: <_IcTrendUp s={22}/>,
    title: 'Track Your Rise',
    subtitle: 'Watch Scores Climb Week Over Week',
    desc: 'Visual progress charts show every improvement. Compare against cut-offs for your category in real time.',
    color: '#FF653F',
    glow: 'rgba(255,101,63,.35)',
    side: 'right',
  },
  {
    step: '08',
    icon: <_IcMedal s={22}/>,
    title: 'Exam Day Ready',
    subtitle: 'Walk In With Full Confidence',
    desc: 'You\'ve done 20+ mocks, know your strong sections and have a clear time-management strategy. Nothing surprises you.',
    color: '#D97706',
    glow: 'rgba(217,119,6,.32)',
    side: 'left',
  },
  {
    step: '09',
    icon: <_IcStar s={22}/>,
    title: 'Career Success',
    subtitle: 'Your Dream Government Job — Achieved',
    desc: 'Results declared. Your name on the merit list. The preparation, the discipline, the sleepless nights — all worth it.',
    color: '#059669',
    glow: 'rgba(5,150,105,.45)',
    side: 'right',
    final: true,
  },
]

function StageCard({ stage, visible, index }) {
  const isLeft = stage.side === 'left'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isLeft ? 'flex-end' : 'flex-start',
        gap: 0,
        position: 'relative',
        marginBottom: 0,
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0)'
          : `translateY(40px)`,
        transition: `opacity .6s ease ${index * 0.12}s, transform .6s ease ${index * 0.12}s`,
      }}
    >
      {/* Card */}
      <div
        style={{
          width: '42%',
          background: '#0d1117',
          border: `1px solid ${stage.color}44`,
          borderRadius: 16,
          padding: '24px 28px',
          position: 'relative',
          order: isLeft ? 1 : 3,
          boxShadow: visible ? `0 8px 32px ${stage.glow}, 0 2px 8px rgba(0,0,0,.4)` : 'none',
          transition: `box-shadow .6s ease ${index * 0.12}s`,
        }}
      >
        {/* Step badge */}
        <div style={{
          position: 'absolute',
          top: -12,
          left: isLeft ? 'auto' : 20,
          right: isLeft ? 20 : 'auto',
          background: stage.color,
          color: '#fff',
          fontSize: 11,
          fontWeight: 800,
          padding: '3px 10px',
          borderRadius: 20,
          letterSpacing: '.06em',
        }}>
          STEP {stage.step}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Icon circle */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${stage.color}22`,
            border: `1.5px solid ${stage.color}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}>
            {stage.icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 3, lineHeight: 1.3 }}>
              {stage.title}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: stage.color, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {stage.subtitle}
            </div>
            <p style={{ fontSize: 13.5, color: '#9ca3af', lineHeight: 1.65, margin: 0 }}>
              {stage.desc}
            </p>
          </div>
        </div>

        {/* Connector arrow pointing to center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          [isLeft ? 'right' : 'left']: -12,
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          [isLeft ? 'borderLeft' : 'borderRight']: `12px solid ${stage.color}44`,
        }} />
      </div>

      {/* Center dot */}
      <div style={{
        flex: '0 0 auto',
        order: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 2,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: stage.final
            ? `radial-gradient(circle, #059669, #064e3b)`
            : `radial-gradient(circle, ${stage.color}, ${stage.color}88)`,
          border: `3px solid ${stage.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          boxShadow: visible ? `0 0 20px ${stage.glow}, 0 0 40px ${stage.glow}` : 'none',
          transition: `box-shadow .6s ease ${index * 0.12 + 0.3}s`,
          animation: visible && stage.final ? 'pulseGlow 2s ease-in-out infinite' : 'none',
        }}>
          {stage.final ? <_IcTrophy s={18} c='#fff'/> : stage.step}
        </div>
      </div>

      {/* Spacer on the other side */}
      <div style={{ width: '42%', order: isLeft ? 3 : 1 }} />
    </div>
  )
}

export default function CareerJourney({ onNav }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{ background: '#070b14', padding: '96px 24px', position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 20px rgba(5,150,105,.5), 0 0 40px rgba(5,150,105,.3); }
          50%      { box-shadow: 0 0 36px rgba(5,150,105,.8), 0 0 72px rgba(5,150,105,.5); }
        }
        @keyframes flowDown {
          0%   { stroke-dashoffset: 1600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes shimmerLine {
          0%   { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.03) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {/* Ambient glow blobs */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,101,63,.06) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,.06) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section header */}
        <div style={{
          textAlign: 'center', marginBottom: 72,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity .7s ease, transform .7s ease',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,101,63,.12)', border: '1px solid rgba(255,101,63,.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <_IcArrow s={13} c='#FF653F'/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#FF653F', textTransform: 'uppercase', letterSpacing: '.1em' }}>Student Success Journey</span>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 16 }}>
            From <span style={{ color: '#FF653F' }}>First Step</span> to{' '}
            <span style={{ background: 'linear-gradient(90deg,#059669,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Career</span>
          </h2>
          <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Every rank holder started exactly where you are. Here's the path that took them there.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>

          {/* Vertical center line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(180deg, #FF653F, #D97706, #7C3AED, #0891B2, #059669, #DB2777, #FF653F, #D97706, #059669)',
            opacity: visible ? 0.4 : 0,
            transition: 'opacity 1s ease .3s',
            zIndex: 1,
          }} />

          {/* Animated shimmer on the line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,.6) 50%, transparent 100%)',
            backgroundSize: '100% 40%',
            animation: visible ? 'shimmerLine 2.5s linear infinite' : 'none',
            zIndex: 2,
          }} />

          {/* Stage cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
            {STAGES.map((stage, i) => (
              <StageCard key={stage.step} stage={stage} visible={visible} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: 72,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity .7s ease 1.2s, transform .7s ease 1.2s',
        }}>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 24 }}>
            Step 1 starts today. The rest follows.
          </p>
          <button
            onClick={() => onNav('auth')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, #FF653F, #ff8c42)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '16px 36px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(255,101,63,.4)',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,101,63,.55)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,101,63,.4)' }}
          >
            Begin Your Journey — It's Free
          </button>
        </div>
      </div>
    </section>
  )
}
