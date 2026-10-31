import { useState, useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../supabase.js'
import { Browser } from '@capacitor/browser'
import { App as CapApp } from '@capacitor/app'
import { toast } from '../toast.js'

const isNative = import.meta.env.VITE_IS_NATIVE === 'true'

// HTTPS relay: Chrome Custom Tab does NOT reliably forward HTTP 302 redirects to
// custom schemes as Android intents — it silently closes instead. HTTPS loads fine.
// The relay page at /login-callback fires an intent:// URL (which Chrome CT does
// forward), so the app receives the PKCE code via appUrlOpen as a custom-scheme URL.
const NATIVE_REDIRECT = 'https://prep.arkaserve.com/login-callback'

// Show Apple Sign In only on iOS native or Apple web browsers — never on Android
const isApplePlatform = (() => {
  if (typeof window === 'undefined') return false
  if (isNative) return Capacitor.getPlatform() === 'ios'
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/.test(ua)) return true
  return /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua)
})()

const SvgBrain  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3C7 3 5 5 5 8c0 1.5.5 2.5 1 3.5C7 13 7 14 7 15h6c0-1 0-2 1-3.5.5-1 1-2 1-3.5 0-3-2-5-5-5z"/><path d="M7 15h6M8 17h4"/></svg>
const SvgChart  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgTarget = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>
const SvgTimer  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="11" r="7"/><path d="M10 7v4l2.5 2.5"/><path d="M7.5 2h5M10 2v2"/></svg>

const Spinner = () => (
  <span style={{ width: 16, height: 16, border: '2px solid rgba(107,114,128,.3)', borderTopColor: '#374151', borderRadius: '50%', display: 'inline-block', animation: 'auth-spin .65s linear infinite', flexShrink: 0 }} />
)

export default function AuthScreen({ onAuth, onBack, onNav }) {
  const handleNav = (id) => { if (onNav) onNav(id); else onBack() }
  const [googleLoad, setGoogleLoad] = useState(false)
  const [appleLoad,  setAppleLoad]  = useState(false)
  const [mode,       setMode]       = useState('login')

  const switchMode = (m) => setMode(m)

  /* ── Native Google OAuth deep-link callback ── */
  // Keep a stable ref so listener churn doesn't happen on every render
  const onAuthRef = useRef(onAuth)
  useEffect(() => { onAuthRef.current = onAuth }, [onAuth])

  // Tracks whether a browser-based OAuth is in flight and whether any handler already
  // processed the callback. Prevents the three native listeners from racing each other.
  const oauthRef = useRef({ inProgress: false, handled: false })

  useEffect(() => {
    if (!isNative) return
    let urlHandle, resumeHandle, browserHandle

    // PRIMARY: fires when Android delivers the OAuth callback URL.
    // App Links (HTTPS): Android intercepts https://prep.arkaserve.com/login-callback
    //   before Chrome CT loads it and fires it here directly — most reliable path.
    // Custom scheme fallback: intent:// relay on the website fires com.arkaserve.prep://
    //   for devices where App Links verification hasn't completed yet.
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      const isAppLink = url.startsWith('https://prep.arkaserve.com/login-callback')
      const isCustomScheme = url.startsWith('com.arkaserve.prep://login-callback')
      if (!isAppLink && !isCustomScheme) {
        toast(`[DBG] URL ignored: ${url.slice(0,40)}`, 'info')
        return
      }
      toast(`[DBG] URL received (${isAppLink ? 'AppLink' : 'scheme'})`, 'success')
      if (oauthRef.current.handled) { toast('[DBG] already handled', 'info'); return }
      oauthRef.current.handled    = true
      oauthRef.current.inProgress = false
      Browser.close()
      setGoogleLoad(false)
      setAppleLoad(false)
      const code = new URL(url).searchParams.get('code')
      if (code) {
        toast('[DBG] exchanging code…', 'info')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.user) {
          toast(`[DBG] exchange OK: ${data.user.email}`, 'success')
          onAuthRef.current(data.user); return
        }
        toast(`[DBG] exchange FAIL: ${error?.message || 'no user'}`, 'error')
      } else {
        toast('[DBG] no code in URL', 'error')
      }
      // code missing or exchange failed — release lock so the user can retry
      oauthRef.current.handled = false
    }).then(h => { urlHandle = h })

    // FALLBACK A: fires when app comes to foreground. Only acts when OAuth was started
    // by this screen (inProgress=true) and the primary handler hasn't finished yet.
    // Waits 2 s to give appUrlOpen priority — it fires on the same foreground transition.
    CapApp.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive || !oauthRef.current.inProgress || oauthRef.current.handled) return
      await new Promise(r => setTimeout(r, 2000))
      if (oauthRef.current.handled) return
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        oauthRef.current.handled    = true
        oauthRef.current.inProgress = false
        setGoogleLoad(false)
        setAppleLoad(false)
        onAuthRef.current(data.session.user)
      } else {
        // No session found — OAuth callback didn't arrive (e.g. MIUI blocked the intent).
        // Reset loading state so the user can tap the button again.
        oauthRef.current.inProgress = false
        setGoogleLoad(false)
        setAppleLoad(false)
        toast('[DBG] fallbackA: no session — reset', 'error')
      }
    }).then(h => { resumeHandle = h })

    // FALLBACK B: fires when the browser tab closes for any reason (cancel or success).
    // Only polls when OAuth was in progress and the primary handler hasn't claimed it.
    Browser.addListener('browserFinished', async () => {
      const wasOAuthPending = oauthRef.current.inProgress && !oauthRef.current.handled
      oauthRef.current.inProgress = false
      setGoogleLoad(false)
      setAppleLoad(false)
      toast(`[DBG] browserFinished (pending=${wasOAuthPending})`, 'info')
      if (!wasOAuthPending) return
      // Short delay — appUrlOpen fires before browserFinished in the App Link flow
      await new Promise(r => setTimeout(r, 800))
      if (oauthRef.current.handled) { toast('[DBG] fallbackB: already handled', 'info'); return }
      const { data } = await supabase.auth.getSession()
      toast(`[DBG] fallbackB getSession: ${data?.session?.user?.email || 'no session'}`, data?.session ? 'success' : 'error')
      if (data?.session?.user) {
        oauthRef.current.handled = true
        onAuthRef.current(data.session.user)
      }
    }).then(h => { browserHandle = h })

    return () => { urlHandle?.remove(); resumeHandle?.remove(); browserHandle?.remove() }
  }, [])  // stable — uses refs, never needs to re-register

  const handleGoogle = async () => {
    oauthRef.current = { inProgress: false, handled: false }  // reset for fresh attempt
    setGoogleLoad(true)
    if (isNative) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
      })
      if (error || !data?.url) { setGoogleLoad(false); return }
      oauthRef.current.inProgress = true   // browser is open — handlers may now act

      // Safety net: if no handler claims the flow within 120 s, reset the button.
      const safetyTimer = setTimeout(() => {
        if (oauthRef.current.inProgress && !oauthRef.current.handled) {
          oauthRef.current.inProgress = false
          setGoogleLoad(false)
          toast('[DBG] timeout — reset', 'error')
        }
      }, 120_000)

      await Browser.open({ url: data.url, toolbarColor: '#FF653F' })
      clearTimeout(safetyTimer)
    } else {
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    }
  }

  const [appleErr, setAppleErr] = useState('')

  const handleApple = async () => {
    oauthRef.current = { inProgress: false, handled: false }  // reset for fresh attempt
    setAppleLoad(true)
    setAppleErr('')
    if (isNative) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
      })
      if (error || !data?.url) {
        setAppleLoad(false)
        setAppleErr(error?.message || 'Apple Sign In unavailable. Please try Google.')
        return
      }
      oauthRef.current.inProgress = true   // browser is open — handlers may now act
      await Browser.open({ url: data.url, toolbarColor: '#000000' })
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: window.location.origin },
      })
      if (error) {
        setAppleLoad(false)
        setAppleErr('Apple Sign In is not configured yet. Please use Google to sign in.')
      }
    }
  }

  const stats = [
    { value: '99+',  label: 'Exam Questions' },
    { value: '3',    label: 'Exam Sections' },
    { value: '100%', label: 'Free to Start' },
    { value: '24/7', label: 'Available' },
  ]
  const features = [
    { Svg: SvgBrain,  text: 'Expert-crafted questions — unique every test' },
    { Svg: SvgChart,  text: 'Personalised weakness analysis' },
    { Svg: SvgTarget, text: 'Category-aware cut-off tracking (SC/ST/OBC)' },
    { Svg: SvgTimer,  text: 'Real exam simulation with timed sections' },
  ]

  /* ── Native full-screen auth UI (white / light theme) ── */
  if (isNative) return (
    <div style={{
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      background: '#f0f2f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      <style>{`@keyframes auth-spin { to { transform: rotate(360deg) } }`}</style>

      {/* Brand hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px 32px' }}>
        <div style={{
          width: 88, height: 88,
          background: '#FF653F',
          borderRadius: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 36px rgba(255,101,63,.35)',
          marginBottom: 22,
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 30, letterSpacing: -1 }}>MT</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: -0.5, margin: '0 0 6px', textAlign: 'center' }}>MockTest</h1>
        <p style={{ fontSize: 12, color: '#FF653F', letterSpacing: '.12em', textTransform: 'uppercase', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>Your World of Mock Tests</p>

        <div style={{ display: 'flex', gap: 32, marginTop: 36 }}>
          {[{ v: '99+', l: 'Questions' }, { v: '3', l: 'Sections' }, { v: '100%', l: 'Free' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FF653F', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign-in card pinned to bottom */}
      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '32px 28px',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -4px 32px rgba(0,0,0,.08)',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 6px', textAlign: 'center' }}>Welcome back</h2>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', margin: '0 0 24px' }}>Sign in to continue your prep journey</p>

        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoad || appleLoad}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16,
            padding: '15px 20px', fontSize: 15, fontWeight: 600, color: '#111',
            cursor: 'pointer', marginBottom: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            opacity: (googleLoad || appleLoad) ? 0.6 : 1,
          }}>
          {googleLoad ? <Spinner /> : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M46.145 24.503c0-1.633-.138-3.205-.397-4.712H24v8.924h12.441a10.6 10.6 0 01-4.602 6.958v5.782h7.45c4.358-4.013 6.856-9.924 6.856-16.952z"/>
              <path fill="#34A853" d="M24 47c6.237 0 11.466-2.07 15.29-5.592l-7.45-5.782c-2.073 1.391-4.72 2.211-7.84 2.211-6.027 0-11.131-4.07-12.951-9.535H3.38v5.974C7.189 42.018 15.02 47 24 47z"/>
              <path fill="#FBBC05" d="M11.049 28.302a13.71 13.71 0 01-.716-4.302c0-1.493.257-2.944.716-4.302v-5.974H3.38A23.986 23.986 0 001 24c0 3.868.924 7.527 2.38 10.276l7.669-5.974z"/>
              <path fill="#EA4335" d="M24 9.8c3.397 0 6.444 1.168 8.84 3.461l6.624-6.624C35.462 2.973 30.234.8 24 .8 15.02.8 7.189 5.782 3.38 13.724l7.669 5.974C12.869 14.132 17.973 9.8 24 9.8z"/>
            </svg>
          )}
          <span>{googleLoad ? 'Signing in…' : 'Continue with Google'}</span>
        </button>

        {/* Apple (iOS/macOS only) */}
        {isApplePlatform && (
          <>
            <button onClick={handleApple} disabled={appleLoad || googleLoad}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: '#000', border: '1.5px solid #000', borderRadius: 16,
                padding: '15px 20px', fontSize: 15, fontWeight: 600, color: '#fff',
                cursor: 'pointer', marginBottom: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                opacity: (appleLoad || googleLoad) ? 0.6 : 1,
              }}>
              {appleLoad ? <Spinner /> : (
                <svg width="18" height="18" viewBox="0 0 814 1000" fill="white">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.3 46 341.4 46 339.2c0-157.3 98.4-240.5 195-240.5 57.8 0 106.9 38.2 143.4 38.2 35.2 0 89.1-38.2 154.2-38.2 27.1 0 108.2 2.6 168.2 75.8zm-295-10.3c6.4-28.8 10.3-56.3 10.3-82.9 0-32.1-5.8-63.5-16.8-91.7-41.5 7.7-81.4 46.3-101.8 91.7-14.7 35.7-21 70.7-21 105.3 0 28.2 4.5 56.3 15.6 80.5 49.3 4.5 100.5-28.2 113.7-103z"/>
                </svg>
              )}
              <span>{appleLoad ? 'Signing in…' : 'Continue with Apple'}</span>
            </button>
            {appleErr && <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', marginBottom: 8 }}>{appleErr}</p>}
          </>
        )}

        <p style={{ fontSize: 11, color: '#b0b8c4', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <button onClick={() => handleNav('terms')} style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Terms</button>
          {' '}and{' '}
          <button onClick={() => handleNav('privacy')} style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Privacy Policy</button>.
        </p>

      </div>
    </div>
  )

  /* ── Auth UI (web layout) ── */
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: '#ffffff', height: '100vh' }}
      className="flex flex-col md:flex-row overflow-hidden">

      <style>{`@keyframes auth-spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex md:w-[46%] flex-col justify-center p-10 relative overflow-y-auto h-full"
        style={{ background: '#ffffff', borderRight: '1px solid #e8eaed' }}>

        {onBack && (
          <button onClick={onBack} style={{
            position: 'absolute', top: 24, left: 32,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid #e5e7eb',
            borderRadius: 8, padding: '6px 12px',
            cursor: 'pointer', color: '#6b7280',
            fontSize: 13, fontWeight: 500, transition: 'all .15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor='#FF653F'; e.currentTarget.style.color='#FF653F'; e.currentTarget.style.background='rgba(255,101,63,.04)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#6b7280'; e.currentTarget.style.background='none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Home
          </button>
        )}

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${180 + i * 100}px`, height: `${180 + i * 100}px`,
              top: `${-60 + i * 15}px`, right: `${-80 + i * 10}px`,
              background: i % 2 === 0 ? 'rgba(255,101,63,.04)' : 'rgba(255,101,63,.02)',
              border: '1px solid rgba(255,101,63,.06)',
            }} />
          ))}
        </div>

        <div className="relative z-10">
          <div className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: '#FF653F', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>MT</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#111', fontSize: 16, lineHeight: 1 }}>MockTest</div>
              <div style={{ fontSize: 9, color: '#FF653F', letterSpacing: '.10em', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 2 }}>Your World of Mock Tests</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1.25, marginBottom: 12, marginTop: 28 }}>
            Ace your next<br />
            <span style={{ color: '#FF653F' }}>competitive exam</span>
          </h1>

          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, marginBottom: 32, maxWidth: 430 }}>
            India's first fully expert-crafted competitive exam platform.
            Category-aware cut-off tracking for UR, OBC, SC, ST, EWS and PwBD candidates.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#FF653F' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map(({ Svg, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div style={{ width: 28, height: 28, background: '#fff', border: '1px solid #e8eaed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FF653F' }}>
                  <Svg />
                </div>
                <span style={{ color: '#444', fontSize: 13 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-10" style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <p style={{ color: '#555', fontSize: 13, fontStyle: 'italic', lineHeight: 1.7 }}>
            "The only platform where the system tells you exactly what to study next — not just your score."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div style={{ width: 28, height: 28, background: '#FF653F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>AK</span>
            </div>
            <span style={{ color: '#888', fontSize: 11 }}>Arkaserve Team</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-0 h-full" style={{ background: '#ffffff' }}>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: '#ffffff' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, background: '#FF653F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 11 }}>MT</span>
            </div>
            <span style={{ color: '#111', fontWeight: 700, fontSize: 14 }}>MockTest</span>
          </div>
          {!isNative && onBack && <button onClick={onBack} style={{ color: '#999', fontSize: 13 }}>Back</button>}
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5 sm:px-8 py-8 w-full">
          <div className="w-full max-w-[400px]">

            <div className="bg-white rounded-2xl border border-gray-200"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,.06)', padding: '28px 28px 24px' }}>

              {/* MockTest wordmark */}
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, background: '#FF653F', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>MT</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: '#111', fontSize: 18, lineHeight: 1 }}>MockTest</div>
                    <div style={{ fontSize: 9, color: '#FF653F', letterSpacing: '.09em', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 3 }}>Your World of Mock Tests</div>
                  </div>
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111', marginBottom: 4 }}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>
                  {mode === 'login' ? 'Sign in to continue.' : 'Start your exam prep journey today.'}
                </p>
              </div>

              {/* Login / Sign Up tab toggle */}
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3, marginBottom: 20 }}>
                {['login', 'signup'].map(m => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    style={{
                      flex: 1, padding: '7px 0', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 8, transition: 'all .18s',
                      background: mode === m ? '#fff' : 'transparent',
                      color: mode === m ? '#111' : '#6b7280',
                      boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.10)' : 'none',
                    }}>
                    {m === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Social sign-in buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Google */}
                <button onClick={handleGoogle} disabled={googleLoad || appleLoad}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3.5 text-sm font-semibold text-gray-700 bg-white disabled:opacity-60"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'background .15s' }}
                  onMouseOver={e => !googleLoad && (e.currentTarget.style.background = '#f9fafb')}
                  onMouseOut={e => !googleLoad && (e.currentTarget.style.background = '#fff')}>
                  {googleLoad ? <Spinner /> : (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#4285F4" d="M46.145 24.503c0-1.633-.138-3.205-.397-4.712H24v8.924h12.441a10.6 10.6 0 01-4.602 6.958v5.782h7.45c4.358-4.013 6.856-9.924 6.856-16.952z"/>
                      <path fill="#34A853" d="M24 47c6.237 0 11.466-2.07 15.29-5.592l-7.45-5.782c-2.073 1.391-4.72 2.211-7.84 2.211-6.027 0-11.131-4.07-12.951-9.535H3.38v5.974C7.189 42.018 15.02 47 24 47z"/>
                      <path fill="#FBBC05" d="M11.049 28.302a13.71 13.71 0 01-.716-4.302c0-1.493.257-2.944.716-4.302v-5.974H3.38A23.986 23.986 0 001 24c0 3.868.924 7.527 2.38 10.276l7.669-5.974z"/>
                      <path fill="#EA4335" d="M24 9.8c3.397 0 6.444 1.168 8.84 3.461l6.624-6.624C35.462 2.973 30.234.8 24 .8 15.02.8 7.189 5.782 3.38 13.724l7.669 5.974C12.869 14.132 17.973 9.8 24 9.8z"/>
                    </svg>
                  )}
                  <span>{googleLoad ? 'Redirecting…' : (mode === 'login' ? 'Continue with Google' : 'Sign up with Google')}</span>
                </button>

                {/* Apple — only shown on Apple platforms (iOS native, iPhone/iPad browsers, macOS Safari) */}
                {isApplePlatform && (
                  <>
                    <button onClick={handleApple} disabled={appleLoad || googleLoad}
                      className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: '#000', border: '1px solid #000', boxShadow: '0 1px 4px rgba(0,0,0,.15)', cursor: 'pointer', transition: 'background .15s' }}
                      onMouseOver={e => !appleLoad && (e.currentTarget.style.background = '#1a1a1a')}
                      onMouseOut={e => !appleLoad && (e.currentTarget.style.background = '#000')}>
                      {appleLoad ? <Spinner /> : (
                        <svg width="17" height="17" viewBox="0 0 814 1000" fill="white">
                          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.3 46 341.4 46 339.2c0-157.3 98.4-240.5 195-240.5 57.8 0 106.9 38.2 143.4 38.2 35.2 0 89.1-38.2 154.2-38.2 27.1 0 108.2 2.6 168.2 75.8zm-295-10.3c6.4-28.8 10.3-56.3 10.3-82.9 0-32.1-5.8-63.5-16.8-91.7-41.5 7.7-81.4 46.3-101.8 91.7-14.7 35.7-21 70.7-21 105.3 0 28.2 4.5 56.3 15.6 80.5 49.3 4.5 100.5-28.2 113.7-103z"/>
                        </svg>
                      )}
                      <span>{appleLoad ? 'Redirecting…' : (mode === 'login' ? 'Continue with Apple' : 'Sign up with Apple')}</span>
                    </button>
                    {appleErr && (
                      <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', marginTop: -2 }}>{appleErr}</p>
                    )}
                  </>
                )}
              </div>

              {/* Bottom mode switch */}
              <p style={{ textAlign: 'center', fontSize: 12.5, color: '#6b7280', marginTop: 18 }}>
                {mode === 'login' ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 'inherit' }}>Sign up free</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 'inherit' }}>Sign in</button>
                  </>
                )}
              </p>

              <p style={{ fontSize: 10.5, color: '#b0b8c4', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                By continuing you agree to our{' '}
                <button onClick={() => handleNav('terms')} style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Terms</button>
                {' '}and{' '}
                <button onClick={() => handleNav('privacy')} style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Privacy Policy</button>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
