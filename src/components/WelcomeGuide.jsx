/* ══════════════════════════════════════════════════════════════════════════
   WelcomeGuide — first-time guide for NEW web users (see welcomeGuideRules.js for when it shows).
   4 short "how to use MockTest" steps + a required mobile-number step. Saves the phone the same
   way as Edit Profile (user_metadata + profiles + student_onboarding) and marks welcome_guide_done.
   Same modal look as the "Complete your profile" pop-up in App.jsx.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase.js'
import { upsertProfile, upsertOnboarding } from '../data/userData.js'
import { phoneDigits, isValidIndianMobile, formatPhone } from './welcomeGuideRules.js'

const ORANGE = '#F06535'

const Icon = ({ d }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const STEPS = [
  {
    icon: <><path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.6 6.5 19.5l1-6.2L3 8.9 9 8z"/></>,
    title: (name) => `Welcome${name ? `, ${name}` : ''}!`,
    body: 'MockTest gives you full-length mock tests and practice for Banking, SSC, Railway, State and US exams — with a 7-day free trial to try everything.',
    points: ['Real exam pattern and timer', 'Instant results with solutions', 'Personal study plan'],
  },
  {
    icon: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    title: () => 'Take a mock test',
    body: 'Pick your exam on the dashboard and press Start Mock Test.',
    points: ['Timed, section-wise like the real exam', 'Your result appears right after you submit', 'Review every answer with its solution'],
  },
  {
    icon: <><path d="M3 4h18v16H3z"/><path d="M8 2v4M16 2v4M3 10h18"/></>,
    title: () => 'Practise & plan',
    body: 'Build your preparation around your weak areas.',
    points: ['Topic-wise practice for any subject', '7-day Study Planner with daily tasks', 'Daily Current Affairs'],
  },
  {
    icon: <><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></>,
    title: () => 'Track your progress',
    body: 'See where you stand and what to improve.',
    points: ['My Performance & AI Prediction unlock after 2 mock tests', 'Weak-topic analysis after every test', 'Upgrade any time in Subscriptions'],
  },
]
const PHONE_STEP = STEPS.length                     // last step = mobile number (required)

export default function WelcomeGuide({ user, onDone }) {
  const [step, setStep] = useState(0)
  const [digits, setDigits] = useState(() => phoneDigits(user?.user_metadata?.phone || user?.user_metadata?.mobile))
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const mainBtn = useRef(null), phoneInput = useRef(null)
  const firstName = String(user?.user_metadata?.full_name || '').trim().split(/\s+/)[0] || ''

  useEffect(() => {                                  // keyboard focus follows the step
    const t = setTimeout(() => (step === PHONE_STEP ? phoneInput.current : mainBtn.current)?.focus(), 30)
    return () => clearTimeout(t)
  }, [step])
  useEffect(() => {                                  // no background scrolling while the guide is open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const save = async () => {
    setErr('')
    if (!isValidIndianMobile(digits)) { setErr('Enter a valid 10-digit mobile number'); phoneInput.current?.focus(); return }
    setSaving(true)
    const phone = formatPhone(digits)
    const { data, error } = await supabase.auth.updateUser({ data: { phone, welcome_guide_done: true } })
    if (error) { setSaving(false); setErr('Could not save — please try again. ' + (error.message || '')); return }
    try {                                            // same tables as Edit Profile (best effort, like there)
      await upsertProfile({ id: user.id, phone })
      await upsertOnboarding({ student_id: user.id, phone, updated_at: new Date().toISOString() })
    } catch {}
    setSaving(false)
    onDone?.(data?.user || null)
  }

  const isPhone = step === PHONE_STEP
  const s = STEPS[step]
  const total = STEPS.length + 1

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="wg-title" style={{
      position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,.60)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      transform: 'translateZ(0)', willChange: 'transform',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '28px 24px 22px', maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)', fontFamily: "'Poppins','Inter','Segoe UI',system-ui,sans-serif",
        maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto',
      }}>
        {/* step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }} aria-label={`Step ${step + 1} of ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 99, background: i <= step ? ORANGE : '#e5e7eb', transition: 'all .2s' }}/>
          ))}
        </div>

        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          {isPhone
            ? <Icon d={<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>}/>
            : <Icon d={s.icon}/>}
        </div>

        <h2 id="wg-title" style={{ fontSize: 20, fontWeight: 800, color: '#111', textAlign: 'center', margin: '0 0 6px' }}>
          {isPhone ? 'Your mobile number' : s.title(firstName)}
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, textAlign: 'center', margin: '0 0 16px' }}>
          {isPhone ? 'We use it for important updates about your exams and account. It is required to continue.' : s.body}
        </p>

        {!isPhone && (
          <ul style={{ listStyle: 'none', padding: '12px 14px', margin: '0 0 20px', background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.points.map((p) => (
              <li key={p} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', lineHeight: 1.45 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6 9 17l-5-5"/></svg>
                {p}
              </li>
            ))}
          </ul>
        )}

        {isPhone && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="wg-phone" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Mobile number</label>
            <div style={{ display: 'flex', alignItems: 'center', height: 46, border: `1.5px solid ${err ? '#ef4444' : '#e5e7eb'}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
              <span style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', fontWeight: 700, color: '#374151', borderRight: '1px solid #e5e7eb', background: '#fafafa' }}>+91</span>
              <input id="wg-phone" ref={phoneInput} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10}
                value={digits} placeholder="10-digit mobile number"
                onChange={(e) => { setDigits(e.target.value.replace(/\D/g, '').slice(0, 10)); setErr('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                style={{ flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', padding: '0 12px', fontSize: 15, fontWeight: 600, letterSpacing: '.04em', fontFamily: 'inherit', color: '#111', background: 'transparent' }}/>
            </div>
            {err && <div role="alert" style={{ marginTop: 6, fontSize: 12.5, fontWeight: 600, color: '#ef4444' }}>{err}</div>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button type="button" onClick={() => { setErr(''); setStep(step - 1) }} disabled={saving}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Back
            </button>
          )}
          <button type="button" ref={mainBtn} onClick={() => (isPhone ? save() : setStep(step + 1))} disabled={saving}
            style={{ flex: 2, padding: '12px 14px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
            {isPhone ? (saving ? 'Saving…' : 'Save & start') : step === 0 ? 'Show me around' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
