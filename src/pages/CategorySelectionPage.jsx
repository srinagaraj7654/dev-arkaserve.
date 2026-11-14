import { useState } from 'react'

const ACCENT = '#F06535'

const ANIM_CSS = `
@keyframes lp-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lp-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.lp-fade-up {
  animation: lp-fade-up 0.38s cubic-bezier(.22,.68,0,1.08) both;
}
.lp-fade-in {
  animation: lp-fade-in 0.3s ease both;
}
.lp-card-press:active {
  transform: scale(0.96) !important;
  transition: transform 0.08s ease !important;
}
.lp-btn-press:active {
  transform: scale(0.98) !important;
  transition: transform 0.08s ease !important;
}`

const CATEGORIES = [
  {
    id: 'banking',
    label: 'Banking Exams',
    sub: 'IBPS, SBI, RRB, RBI',
    iconBg: '#F06535',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
      </svg>
    ),
  },
  {
    id: 'railway',
    label: 'Railway Exams',
    sub: 'Railway',
    iconBg: '#3B82F6',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="13" rx="2"/>
        <path d="M4 11h16M12 3v8"/>
        <path d="M4 16l-2 4M20 16l2 4M8 20h8"/>
        <circle cx="8" cy="17" r="1" fill="#fff"/><circle cx="16" cy="17" r="1" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'ssc',
    label: 'SSC Exams',
    sub: 'SSC Tier 1, SSC Tier 2',
    iconBg: '#7C3AED',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'engineering',
    label: 'Engineering Exams',
    sub: 'EAMCET, JEE',
    iconBg: '#10B981',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
]

function StepIndicator({ step = 1 }) {
  const steps = ['Select Category', 'Login', 'Get Started']
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:28, paddingTop:4 }}>
      {steps.map((label, i) => {
        const num   = i + 1
        const done  = num < step
        const active = num === step
        const isLast = i === steps.length - 1
        return (
          <div key={label} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14,
                background: active || done ? ACCENT : '#E5E7EB',
                color: active || done ? '#fff' : '#9CA3AF',
                boxShadow: active ? `0 2px 10px ${ACCENT}55` : 'none',
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : num
                }
              </div>
              <span style={{
                fontSize: 10.5, fontWeight: active ? 800 : 600,
                color: active ? ACCENT : '#9CA3AF',
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {!isLast && (
              <div style={{
                width: 48, height: 2, background: '#E5E7EB',
                margin: '0 4px', marginBottom: 18, flexShrink: 0,
              }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CategorySelectionPage({ onContinue, initialCategories = [], isChanging = false }) {
  const [selected, setSelected] = useState(initialCategories)
  const [saving,   setSaving]   = useState(false)

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
  )

  const handleContinue = async () => {
    if (!selected.length || saving) return
    setSaving(true)
    await onContinue(selected)
    setSaving(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <style>{ANIM_CSS}</style>

      {/* Header bar */}
      <div className="lp-fade-in" style={{
        width: '100%',
        background: '#fff',
        padding: `calc(env(safe-area-inset-top, 0px) + 10px) 20px 12px`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 1px 0 #E5E7EB',
        animationDelay: '0ms',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: ACCENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${ACCENT}44`,
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '-.01em' }}>MT</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 16, color: '#111' }}>
          Mock<span style={{ color: ACCENT }}>Test</span>
        </span>
      </div>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 440, padding: '24px 16px 32px', flex: 1, display:'flex', flexDirection:'column' }}>
        {/* Step indicator */}
        <div className="lp-fade-up" style={{ animationDelay: '60ms' }}>
          <StepIndicator step={1} />
        </div>

        {/* Title */}
        <div className="lp-fade-up" style={{ textAlign: 'center', marginBottom: 24, animationDelay: '100ms' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.02em', lineHeight: 1.2 }}>
            Choose Your Exam Category
          </h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 8, lineHeight: 1.5 }}>
            {isChanging
              ? 'Update your exam categories. Your test history is preserved.'
              : 'Select one or more categories to continue'}
          </p>
        </div>

        {/* 2-column category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {CATEGORIES.map((cat, i) => {
            const active = selected.includes(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className="lp-fade-up lp-card-press"
                style={{
                  animationDelay: `${160 + i * 70}ms`,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 12px 16px',
                  borderRadius: 16,
                  border: `2px solid ${active ? ACCENT : '#E5E7EB'}`,
                  background: active ? '#FFF5F0' : '#fff',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  boxShadow: active ? `0 2px 12px ${ACCENT}22` : '0 1px 3px rgba(0,0,0,.06)',
                  transition: 'border-color .12s, background .12s, box-shadow .12s, transform .12s',
                  minHeight: 130,
                }}
              >
                {/* Selected checkmark badge */}
                {active && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 22, height: 22, borderRadius: '50%',
                    background: ACCENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 2px 6px ${ACCENT}55`,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                {/* Icon circle */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: cat.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                  boxShadow: `0 3px 10px ${cat.iconBg}44`,
                }}>
                  {cat.icon}
                </div>

                {/* Label */}
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#111', textAlign: 'center', lineHeight: 1.3 }}>
                  {cat.label}
                </div>

                {/* Subtitle */}
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'center', lineHeight: 1.3 }}>
                  {cat.sub}
                </div>
              </button>
            )
          })}
        </div>

        {/* Continue button */}
        <button
          disabled={!selected.length || saving}
          onClick={handleContinue}
          className="lp-fade-up lp-btn-press"
          style={{
            animationDelay: '450ms',
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: selected.length > 0 ? ACCENT : '#E5E7EB',
            color: selected.length > 0 ? '#fff' : '#9CA3AF',
            fontWeight: 800,
            fontSize: 15.5,
            border: 'none',
            cursor: selected.length > 0 && !saving ? 'pointer' : 'not-allowed',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background .15s, transform .12s',
            letterSpacing: '-.01em',
            boxShadow: selected.length > 0 ? `0 4px 14px ${ACCENT}44` : 'none',
          }}
        >
          {saving ? 'Saving…' : isChanging ? 'Save Changes' : 'Continue →'}
        </button>

        {!isChanging && (
          <p className="lp-fade-up" style={{ textAlign: 'center', fontSize: 11.5, color: '#9CA3AF', marginTop: 10, animationDelay: '520ms' }}>
            You can change this later in Profile settings
          </p>
        )}
      </div>
    </div>
  )
}
