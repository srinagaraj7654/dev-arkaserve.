import { useState, useEffect, useRef, useMemo } from 'react'
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

// QA FIX #4: new props — initialMode (open on Login or Sign Up), selectedPlan (plan chosen
// on the landing page), notice (why the user was redirected here; also QA FIX #2).
export default function AuthScreen({ onAuth, onBack, onNav, initialMode = 'login', selectedPlan = null, notice = '' }) {
  const handleNav = (id) => { if (onNav) onNav(id); else onBack() }
  const [googleLoad, setGoogleLoad] = useState(false)
  const [appleLoad,  setAppleLoad]  = useState(false)
  const [mode,       setMode]       = useState(initialMode === 'signup' ? 'signup' : 'login')

  // True only when redirected here from /admin
  const isAdminFlow = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('postAuthNav') || '{}')?.target === 'admin' } catch { return false }
  }, [])

  // Email / password login (for admin — web only)
  const showEmail = isAdminFlow   // email form only when coming from /admin (students: Google / Apple only)
  const [emailVal,   setEmailVal]   = useState('')
  const [passVal,    setPassVal]    = useState('')
  const [emailLoad,  setEmailLoad]  = useState(false)
  const [emailErr,   setEmailErr]   = useState('')
  const [resetSent,  setResetSent]  = useState(false)
  const [resetLoad,  setResetLoad]  = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setEmailErr('')
    if (!emailVal.trim() || !passVal) { setEmailErr('Enter your email and password.'); return }
    setEmailLoad(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailVal.trim(), password: passVal })
      if (error) { setEmailErr(error.message); return }
      if (data?.user) onAuth(data.user)
    } catch (err) {
      setEmailErr(err.message || 'Sign in failed.')
    } finally {
      setEmailLoad(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!emailVal.trim()) { setEmailErr('Enter your email address first.'); return }
    setEmailErr('')
    setResetLoad(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailVal.trim(), {
        redirectTo: window.location.origin,
      })
      if (error) { setEmailErr(error.message); return }
      setResetSent(true)
    } catch (err) {
      setEmailErr(err.message || 'Failed to send reset email.')
    } finally {
      setResetLoad(false)
    }
  }

  const switchMode = (m) => setMode(m)

  // QA FIX #4: new users arriving from "Choose Plan" / "Start Free" see Sign Up, not "Welcome back".
  // Re-sync when the screen is reopened with a different intent (e.g. "Login" vs "Choose Plan").
  useEffect(() => { setMode(initialMode === 'signup' ? 'signup' : 'login') }, [initialMode])

  // QA FIX #4: always open the auth screen at the very top (the global smooth-scroll
  // could otherwise leave it partially scrolled after navigating from a long page).
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])

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
      if (!isAppLink && !isCustomScheme) return
      if (oauthRef.current.handled) return
      oauthRef.current.handled    = true
      oauthRef.current.inProgress = false
      Browser.close()
      // Keep spinner showing during exchangeCodeForSession to prevent login page flash
      const code = new URL(url).searchParams.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.user) {
          onAuthRef.current(data.user); return
        }
      }
      // code missing or exchange failed — release lock and reset UI
      setGoogleLoad(false)
      setAppleLoad(false)
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
      }
    }).then(h => { resumeHandle = h })

    // FALLBACK B: fires when the browser tab closes for any reason (cancel or success).
    // Only polls when OAuth was in progress and the primary handler hasn't claimed it.
    Browser.addListener('browserFinished', async () => {
      // If appUrlOpen already claimed the flow, don't clear the spinner —
      // it stays up while exchangeCodeForSession runs, preventing the login page flash.
      if (oauthRef.current.handled) {
        oauthRef.current.inProgress = false
        return
      }
      const wasOAuthPending = oauthRef.current.inProgress
      oauthRef.current.inProgress = false
      setGoogleLoad(false)
      setAppleLoad(false)
      if (!wasOAuthPending) return
      // Short delay — appUrlOpen fires before browserFinished in the App Link flow
      await new Promise(r => setTimeout(r, 800))
      if (oauthRef.current.handled) return
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        oauthRef.current.handled = true
        onAuthRef.current(data.session.user)
      }
    }).then(h => { browserHandle = h })

    return () => { urlHandle?.remove(); resumeHandle?.remove(); browserHandle?.remove() }
  }, [])  // stable — uses refs, never needs to re-register

  const handleGoogle = async () => {
    // Mark inProgress=true BEFORE any async work so appStateChange can reset the button
    // if the app is backgrounded during the signInWithOAuth network round-trip.
    oauthRef.current = { inProgress: true, handled: false }
    setGoogleLoad(true)
    if (isNative) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
      })
      if (error || !data?.url) {
        oauthRef.current.inProgress = false
        setGoogleLoad(false)
        return
      }

      // Safety net: if no handler claims the flow within 120 s, reset the button.
      const safetyTimer = setTimeout(() => {
        if (oauthRef.current.inProgress && !oauthRef.current.handled) {
          oauthRef.current.inProgress = false
          setGoogleLoad(false)
        }
      }, 120_000)

      await Browser.open({ url: data.url, toolbarColor: '#F06535' })
      clearTimeout(safetyTimer)
    } else {
      oauthRef.current.inProgress = false
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

  /* ── Native full-screen auth UI ── */
  if (isNative) return (
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:'100vh',display:'flex',flexDirection:'column',paddingTop:'env(safe-area-inset-top,0px)',overflow:'hidden'}}>
      <style>{`@keyframes auth-spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── Upper: lavender→peach gradient with brand + illustration ── */}
      <div style={{flex:1,background:'linear-gradient(188deg,#ecedfc 0%,#f5eae0 68%,#fce8d6 100%)',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:28,overflow:'hidden'}}>

        {/* Brand */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
          <div style={{width:70,height:70,borderRadius:21,background:'linear-gradient(145deg,#ff7c58,#F06535,#f06030)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 28px rgba(232,90,44,.42),0 3px 10px rgba(232,90,44,.28)'}}>
            <span style={{color:'#fff',fontWeight:900,fontSize:26,letterSpacing:-.4}}>MT</span>
          </div>
          <div style={{fontSize:32,fontWeight:900,color:'#111827',letterSpacing:-.7,lineHeight:1}}>MockTest</div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
            <div style={{fontStyle:'italic',fontWeight:700,fontSize:10,color:'#F06535',letterSpacing:'.22em',textTransform:'uppercase'}}>Your world of mock tests</div>
            <div style={{width:44,height:1.5,background:'linear-gradient(90deg,transparent,#F06535,transparent)'}}/>
          </div>
        </div>

        {/* Illustration */}
        <svg width="100%" viewBox="0 0 318 192" style={{maxHeight:200,marginTop:4}}>
          <ellipse cx="159" cy="126" rx="132" ry="84" fill="#fddeca" opacity=".58"/>
          {/* left leaves */}
          <g transform="translate(26,68)"><g transform="rotate(-28 0 44)">
            <path d="M0 54C-15 40-15 14 0 0 15 14 15 40 0 54Z" fill="#f5b07a" opacity=".8"/>
            <line x1="0" y1="2" x2="0" y2="52" stroke="#e8905a" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="-8" y1="20" x2="0" y2="27" stroke="#e8905a" strokeWidth=".9" strokeLinecap="round" opacity=".7"/>
            <line x1="-8" y1="36" x2="0" y2="41" stroke="#e8905a" strokeWidth=".9" strokeLinecap="round" opacity=".7"/>
          </g></g>
          <g transform="translate(44,108)"><g transform="rotate(-10 0 32)">
            <path d="M0 38C-11 28-11 10 0 0 11 10 11 28 0 38Z" fill="#f5b07a" opacity=".55"/>
            <line x1="0" y1="2" x2="0" y2="36" stroke="#e8905a" strokeWidth="1" strokeLinecap="round"/>
          </g></g>
          {/* right leaves */}
          <g transform="translate(290,62)"><g transform="rotate(28 0 44)">
            <path d="M0 54C-15 40-15 14 0 0 15 14 15 40 0 54Z" fill="#f5b07a" opacity=".75"/>
            <line x1="0" y1="2" x2="0" y2="52" stroke="#e8905a" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="8" y1="20" x2="0" y2="27" stroke="#e8905a" strokeWidth=".9" strokeLinecap="round" opacity=".7"/>
            <line x1="8" y1="36" x2="0" y2="41" stroke="#e8905a" strokeWidth=".9" strokeLinecap="round" opacity=".7"/>
          </g></g>
          <g transform="translate(272,104)"><g transform="rotate(12 0 32)">
            <path d="M0 38C-11 28-11 10 0 0 11 10 11 28 0 38Z" fill="#f5b07a" opacity=".5"/>
            <line x1="0" y1="2" x2="0" y2="36" stroke="#e8905a" strokeWidth="1" strokeLinecap="round"/>
          </g></g>
          {/* clipboard shadow + body */}
          <rect x="73" y="80" width="70" height="88" rx="10" fill="rgba(0,0,0,.07)" transform="translate(2,4)"/>
          <rect x="73" y="80" width="70" height="88" rx="10" fill="#fff" stroke="#e5e7eb" strokeWidth="1.3"/>
          <rect x="90" y="71" width="36" height="20" rx="6" fill="#d1d5db"/>
          <rect x="93" y="66" width="30" height="18" rx="5" fill="#F06535"/>
          <rect x="97" y="60" width="14" height="8" rx="3" fill="#FF8060"/>
          <ellipse cx="108" cy="68" rx="6" ry="5" fill="rgba(0,0,0,.18)"/>
          <ellipse cx="108" cy="68" rx="4" ry="3.2" fill="#cc4a28"/>
          {/* checklist row 1 */}
          <rect x="83" y="100" width="15" height="15" rx="4" fill="rgba(232,90,44,.1)" stroke="#F06535" strokeWidth="1.3"/>
          <path d="M86.5 107.5L89.5 110.5L95 104" stroke="#F06535" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="104" y="103" width="29" height="3.5" rx="1.75" fill="#e5e7eb"/>
          <rect x="104" y="109.5" width="20" height="2.5" rx="1.25" fill="#f3f4f6"/>
          {/* checklist row 2 */}
          <rect x="83" y="123" width="15" height="15" rx="4" fill="rgba(232,90,44,.1)" stroke="#F06535" strokeWidth="1.3"/>
          <path d="M86.5 130.5L89.5 133.5L95 127" stroke="#F06535" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="104" y="126" width="32" height="3.5" rx="1.75" fill="#e5e7eb"/>
          <rect x="104" y="132.5" width="22" height="2.5" rx="1.25" fill="#f3f4f6"/>
          {/* checklist row 3 unchecked */}
          <rect x="83" y="146" width="15" height="15" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1.2"/>
          <rect x="104" y="149" width="26" height="3" rx="1.5" fill="#f3f4f6"/>
          <rect x="104" y="155" width="18" height="2.5" rx="1.25" fill="#f9fafb"/>
          {/* books ground shadow */}
          <ellipse cx="194" cy="163" rx="48" ry="6" fill="rgba(0,0,0,.09)"/>
          {/* bottom book navy */}
          <rect x="154" y="141" width="90" height="19" rx="3" fill="#1d40af"/>
          <rect x="154" y="139" width="90" height="8" rx="4" fill="#2563eb"/>
          <rect x="157" y="139" width="4.5" height="21" rx="2" fill="rgba(255,255,255,.18)"/>
          <rect x="240" y="141" width="3" height="19" rx="1.5" fill="rgba(255,255,255,.08)"/>
          {/* middle book orange */}
          <rect x="158" y="120" width="86" height="23" rx="3" fill="#F06535"/>
          <rect x="158" y="118" width="86" height="8" rx="4" fill="#ff7a5a"/>
          <rect x="161" y="118" width="4.5" height="25" rx="2" fill="rgba(255,255,255,.2)"/>
          <rect x="240" y="120" width="3" height="23" rx="1.5" fill="rgba(0,0,0,.08)"/>
          {/* top book light */}
          <rect x="162" y="102" width="78" height="20" rx="3" fill="#f3f4f6"/>
          <rect x="162" y="100" width="78" height="8" rx="4" fill="#fff"/>
          <rect x="165" y="100" width="4" height="22" rx="2" fill="rgba(0,0,0,.05)"/>
          <rect x="238" y="102" width="2.5" height="20" rx="1.2" fill="rgba(0,0,0,.04)"/>
          {/* graduation cap brim */}
          <polygon points="201,76 162,90 201,104 240,90" fill="#1e293b"/>
          {/* cap top */}
          <g transform="translate(201,60)"><rect x="-10" y="-10" width="20" height="20" rx="2.5" fill="#334155" transform="rotate(45)"/></g>
          {/* cap stem */}
          <rect x="197.5" y="86" width="7" height="28" rx="3.5" fill="#1e293b"/>
          {/* tassel */}
          <path d="M240 90 Q252 95 258 112" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" fill="none"/>
          <circle cx="258" cy="115" r="5.5" fill="#fbbf24"/>
          <line x1="254.5" y1="118" x2="253" y2="128" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="258" y1="120" x2="258" y2="130" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="261.5" y1="118" x2="263" y2="128" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── Wave: peach → orange ── */}
      <svg viewBox="0 0 375 50" preserveAspectRatio="none" width="100%" height="50" style={{display:'block',background:'#fce8d6'}}>
        <path d="M0 50L0 25Q94 2 188 25Q282 48 375 25L375 50Z" fill="#F06535"/>
      </svg>

      {/* ── Orange base + floating card ── */}
      <div style={{background:'#F06535',padding:'0 14px',paddingBottom:'calc(28px + env(safe-area-inset-bottom,0px))'}}>
        <div style={{background:'#fff',borderRadius:22,padding:'24px 22px 22px',boxShadow:'0 8px 32px rgba(0,0,0,.12)'}}>
          <div style={{fontSize:23,fontWeight:900,color:'#111827',letterSpacing:-.3,textAlign:'center',marginBottom:4}}>Welcome back</div>
          <div style={{fontSize:13,color:'#6b7280',fontWeight:500,textAlign:'center',marginBottom:18,lineHeight:1.5}}>Sign in to continue your prep journey</div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoad||appleLoad}
            style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#fff',border:'1.5px solid #e2e4e9',borderRadius:13,padding:'13px 16px',fontFamily:'inherit',fontSize:14.5,fontWeight:700,color:'#111827',cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,.06),0 4px 14px rgba(0,0,0,.07)',marginBottom:12,opacity:(googleLoad||appleLoad)?0.6:1}}>
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
          {isApplePlatform && (<>
            <button onClick={handleApple} disabled={appleLoad||googleLoad}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#000',border:'1.5px solid #000',borderRadius:13,padding:'13px 16px',fontFamily:'inherit',fontSize:14.5,fontWeight:700,color:'#fff',cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,.15)',marginBottom:12,opacity:(appleLoad||googleLoad)?0.6:1}}>
              {appleLoad ? <Spinner /> : (
                <svg width="18" height="18" viewBox="0 0 814 1000" fill="white">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.3 46 341.4 46 339.2c0-157.3 98.4-240.5 195-240.5 57.8 0 106.9 38.2 143.4 38.2 35.2 0 89.1-38.2 154.2-38.2 27.1 0 108.2 2.6 168.2 75.8zm-295-10.3c6.4-28.8 10.3-56.3 10.3-82.9 0-32.1-5.8-63.5-16.8-91.7-41.5 7.7-81.4 46.3-101.8 91.7-14.7 35.7-21 70.7-21 105.3 0 28.2 4.5 56.3 15.6 80.5 49.3 4.5 100.5-28.2 113.7-103z"/>
                </svg>
              )}
              <span>{appleLoad ? 'Signing in…' : 'Continue with Apple'}</span>
            </button>
            {appleErr && <p style={{fontSize:12,color:'#dc2626',textAlign:'center',marginBottom:8}}>{appleErr}</p>}
          </>)}

          <p style={{fontSize:10.5,color:'#9ca3af',textAlign:'center',marginTop:4,lineHeight:1.65}}>
            By continuing you agree to our{' '}
            <button onClick={()=>handleNav('terms')} style={{color:'#F06535',background:'none',border:'none',cursor:'pointer',fontSize:'inherit',textDecoration:'underline'}}>Terms</button>
            {' '}and{' '}
            <button onClick={()=>handleNav('privacy')} style={{color:'#F06535',background:'none',border:'none',cursor:'pointer',fontSize:'inherit',textDecoration:'underline'}}>Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  )

  /* ── Auth UI (web layout) ──
     UI: static split-screen sign-in. The page is exactly one screen tall (100dvh) and never
     scrolls on desktop/tablet: left = brand panel, right = sign-in form. Sizes use clamp()
     with vh so everything fits short laptop screens too. All sign-in logic (Google/Apple,
     Login/Sign Up toggle, selected plan, redirect notice) is unchanged. */
  return (
    <div className="auth-web" style={{ fontFamily: "'Poppins','Inter','Segoe UI',system-ui,sans-serif" }}>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg) } }
        .auth-web { display:flex; height:100vh; height:100dvh; overflow:hidden; background:#f8fafc; }
        .auth-left { position:relative; overflow:hidden; isolation:isolate; width:50%; flex-shrink:0;
          display:flex; flex-direction:column; justify-content:space-between;
          padding: clamp(24px,5.5vh,56px) clamp(32px,5.5vw,80px);
          background: linear-gradient(150deg,#050d1a 0%,#0b1120 45%,#0f1623 75%,#1a1d2e 100%); color:#fff; } /* MockTest navy (hero/footer palette) */
        .auth-right { position:relative; flex:1; min-width:0; display:flex; flex-direction:column;
          overflow-y:auto; scrollbar-width:none; }
        .auth-right::-webkit-scrollbar { display:none; }
        .auth-form { width:100%; max-width:420px; margin:auto; padding: clamp(20px,4vh,40px) 24px; }
        .auth-h1 { font-size: clamp(26px,4.8vh,38px); font-weight:800; letter-spacing:-.035em; line-height:1.1; color:#0f172a; margin:0; }
        .auth-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:12px;
          height: clamp(44px,6.6vh,50px); border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease; }
        .auth-btn:disabled { opacity:.6; cursor:default; }
        .auth-btn-google { background:#fff; color:#0f172a; border:1.5px solid #e2e8f0; box-shadow:0 1px 2px rgba(15,23,42,.05); }
        .auth-btn-google:not(:disabled):hover { border-color:#F06535; box-shadow:0 8px 20px -10px rgba(232,90,44,.45); transform:translateY(-1px); }
        .auth-btn-apple { background:#000; color:#fff; border:1.5px solid #000; }
        .auth-btn-apple:not(:disabled):hover { background:#1a1a1a; transform:translateY(-1px); }
        .auth-tab { flex:1; padding:8px 0; font-size:13px; font-weight:700; border:none; cursor:pointer; border-radius:9px; transition:all .18s; }
        .auth-home { position:absolute; top:20px; right:24px; z-index:2; display:flex; align-items:center; gap:6px;
          background:#fff; border:1px solid #e2e8f0; border-radius:999px; padding:7px 14px;
          font-size:12.5px; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; }
        .auth-home:hover { border-color:#F06535; color:#F06535; }
        .auth-link { color:#F06535; background:none; border:none; cursor:pointer; font-weight:700; font-size:inherit; padding:0; }
        .auth-link:hover { text-decoration:underline; }
        @media (max-width:767px) {
          .auth-web { height:auto; min-height:100dvh; overflow:visible; }
          .auth-left, .auth-home { display:none; }
        }
/* dark mode for the class-based colours above */        html.dark .auth-web { background: var(--bg); }        html.dark .auth-h1 { color: var(--fg); }        html.dark .auth-btn-google { background: var(--surface); color: var(--fg); border-color: var(--border); }        html.dark .auth-home { background: var(--surface); border-color: var(--border); color: var(--fg2); }        html.dark .auth-web [style*="background: rgb(238, 242, 246)"] { background: var(--surface-2) !important; }
        /* admin email/password sign-in */
        .auth-email { margin-top: 14px; }
        .auth-divider { display:flex; align-items:center; gap:10px; }
        .auth-divider > span { flex:1; height:1px; background:#e2e8f0; }
        .auth-divider-btn { font-size:11.5px; font-weight:600; color:#94a3b8; background:none; border:none; cursor:pointer; white-space:nowrap; padding:2px 4px; font-family:inherit; }
        .auth-divider-btn:hover { color:#F06535; }
        .auth-email-form { display:flex; flex-direction:column; gap:10px; margin-top:12px; }
        .auth-input { width:100%; height:44px; padding:0 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#fff; font-size:14px; color:#0f172a; outline:none; font-family:inherit; box-sizing:border-box; transition:border-color .15s, box-shadow .15s; }
        .auth-input:focus { border-color:#F06535; box-shadow:0 0 0 3px rgba(240,101,53,.15); }
        .auth-email-row { display:flex; justify-content:flex-end; }
        .auth-ok { margin:0; font-size:12px; color:#15803d; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:8px 10px; }
        .auth-err { margin:0; font-size:12px; color:#dc2626; font-weight:600; }
        .auth-btn-dark { background:#111827; color:#fff; border:1.5px solid #111827; }
        .auth-btn-dark:not(:disabled):hover { background:#1f2937; transform:translateY(-1px); }
        /* email sign-in polish: divider label, forgot link, brand-orange Sign in button */
        .auth-email { margin-top: 0; }
        .auth-email .auth-divider { margin: 18px 0 16px; }
        .auth-divider-txt { font-style:normal; font-size:11.5px; font-weight:600; color:#94a3b8; white-space:nowrap; letter-spacing:.02em; }
        .auth-email-form { gap: 12px; margin-top: 0; }
        .auth-email-row { margin-top:-4px; }
        .auth-forgot { font-size:12.5px; font-weight:600; }
        .auth-btn-primary { background:#F06535; color:#fff; border:1.5px solid #F06535; box-shadow:0 8px 20px -10px rgba(232,90,44,.55); }
        .auth-btn-primary:not(:disabled):hover { background:#e85a2c; border-color:#e85a2c; transform:translateY(-1px); box-shadow:0 12px 24px -10px rgba(232,90,44,.6); }
        .auth-input::placeholder { color:#94a3b8; }
        html.dark .auth-divider > span { background: var(--border); }
        html.dark .auth-input { background: var(--bg2); border-color: var(--border); color: var(--fg); }
      `}</style>

      {/* ── LEFT: brand panel (desktop/tablet only) ── */}
      <div className="auth-left">
        {/* decorative orbit rings + glows */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, zIndex:-1, pointerEvents:'none' }}>
          <div style={{ position:'absolute', left:'-10%', top:'-20%', width:'60%', paddingBottom:'60%', borderRadius:'50%', background:'radial-gradient(circle,rgba(232,90,44,.14) 0%,transparent 65%)' }}/>
          <div style={{ position:'absolute', right:'-20%', bottom:'-25%', width:'80%', paddingBottom:'80%', borderRadius:'50%', background:'radial-gradient(circle,rgba(232,90,44,.12) 0%,transparent 62%)' }}/>
          <div style={{ position:'absolute', right:'-38%', bottom:'-48%', width:'115%', paddingBottom:'115%', borderRadius:'50%', border:'1px solid rgba(255,255,255,.08)' }}/>
          <div style={{ position:'absolute', right:'-18%', bottom:'-28%', width:'75%', paddingBottom:'75%', borderRadius:'50%', border:'1px solid rgba(255,255,255,.10)' }}/>
          <div style={{ position:'absolute', right:'30%', bottom:'26%', width:12, height:12, borderRadius:'50%', background:'#F06535', boxShadow:'0 0 0 6px rgba(232,90,44,.18), 0 0 22px rgba(232,90,44,.8)' }}/>
          <div style={{ position:'absolute', right:'14%', bottom:'9%', width:9, height:9, borderRadius:'50%', background:'#ffb38a', boxShadow:'0 0 0 5px rgba(255,179,138,.15), 0 0 16px rgba(255,179,138,.6)' }}/>
        </div>

        {/* logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#F06535,#ff8a5f)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 22px -6px rgba(232,90,44,.65)' }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:14, letterSpacing:'-.02em' }}>MT</span>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:20, letterSpacing:'-.02em', lineHeight:1 }}>MockTest</div>
            <div style={{ fontSize:9, color:'#ff9a7a', letterSpacing:'.12em', textTransform:'uppercase', fontStyle:'italic', fontWeight:700, marginTop:4 }}>Your World of Mock Tests</div>
          </div>
        </div>

        {/* headline */}
        <div style={{ maxWidth:560 }}>
          <div style={{ fontSize:12, fontWeight:800, letterSpacing:'.16em', textTransform:'uppercase', color:'#ff9a7a', marginBottom:'clamp(10px,2.4vh,20px)' }}>
            Competitive exam prep platform
          </div>
          <h1 style={{ fontSize:'clamp(34px,7.4vh,66px)', fontWeight:800, lineHeight:1.03, letterSpacing:'-.045em', margin:0 }}>
            Ace your next<br/>
            <span style={{ background:'linear-gradient(90deg,#F06535,#ffb38a)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>competitive exam.</span>
          </h1>
          <p style={{ fontSize:'clamp(14px,2.3vh,17px)', lineHeight:1.65, color:'rgba(226,232,240,.78)', margin:'clamp(12px,2.6vh,22px) 0 0', maxWidth:440 }}>
            Expert-crafted mock tests, category-aware cut-off tracking and a study plan that tells you exactly what to study next.
          </p>
        </div>

        {/* stats */}
        <div style={{ display:'flex', gap:'clamp(24px,4vw,56px)', flexWrap:'wrap' }}>
          {stats.filter(s => s.label !== 'Exam Sections').map(s => (
            <div key={s.label}>
              <div style={{ fontSize:'clamp(20px,3.8vh,30px)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12.5, color:'#94a3b8', marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: sign-in form ── */}
      <div className="auth-right">

        {onBack && (
          <button className="auth-home" onClick={onBack}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Home
          </button>
        )}

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background:'#ffffff' }}>
          <div className="flex items-center gap-2">
            <div style={{ width:32, height:32, background:'#F06535', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontWeight:900, fontSize:11 }}>MT</span>
            </div>
            <span style={{ color:'#111', fontWeight:700, fontSize:14 }}>MockTest</span>
          </div>
          {!isNative && onBack && <button onClick={onBack} style={{ color:'#999', fontSize:13 }}>Back</button>}
        </div>

        <div className="auth-form">
          <div style={{ fontSize:11.5, fontWeight:800, letterSpacing:'.14em', textTransform:'uppercase', color:'#F06535', marginBottom:'clamp(8px,1.6vh,14px)' }}>
            Welcome to MockTest
          </div>
          <h2 className="auth-h1">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p style={{ color:'#64748b', fontSize:14, lineHeight:1.6, margin:'clamp(8px,1.4vh,12px) 0 clamp(16px,3vh,26px)' }}>
            {/* QA FIX #4: "New here?" link so new users aren't stuck on "Welcome back". */}
            {mode === 'login'
              ? <>Sign in to continue your prep journey. New here?{' '}
                  <button type="button" className="auth-link" onClick={() => switchMode('signup')}>Create an account</button>
                </>
              : 'Start your exam prep journey today — it’s free to begin.'}
          </p>

          {/* QA FIX #2: why the user landed here (protected page redirect, e.g. Topic-wise Practice) */}
          {notice && (
            <div role="status" style={{ display:'flex', gap:8, alignItems:'flex-start', background:'#FFF3EE', border:'1px solid #fec9b0', borderRadius:12, padding:'10px 12px', marginBottom:14, fontSize:12.5, color:'#9a3412', lineHeight:1.5 }}>
              <span aria-hidden="true">🔒</span>
              <span>{notice}</span>
            </div>
          )}

          {/* QA FIX #4: show the plan chosen on the landing page (was not displayed) */}
          {selectedPlan && (
            <div style={{ background:'#FFF3EE', border:'1.5px solid #F06535', borderRadius:14, padding:'10px 12px', marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,#F06535,#ff8a5f)', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1 }}>
                <span style={{ fontSize:15, fontWeight:900 }}>{selectedPlan.days}</span>
                <span style={{ fontSize:8.5, fontWeight:700, marginTop:2 }}>DAYS</span>
              </div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:10.5, fontWeight:700, color:'#F06535', textTransform:'uppercase', letterSpacing:'.06em' }}>Selected plan</div>
                <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>{selectedPlan.label}</div>
                {selectedPlan.sub && <div style={{ fontSize:12, color:'#64748b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{selectedPlan.sub}</div>}
              </div>
              <button type="button" className="auth-link" onClick={onBack} style={{ fontSize:12, flexShrink:0 }}>Change</button>
            </div>
          )}

          {/* Login / Sign Up tab toggle */}
          <div style={{ display:'flex', background:'#eef2f6', borderRadius:12, padding:4, marginBottom:'clamp(12px,2.4vh,18px)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} type="button" className="auth-tab" onClick={() => switchMode(m)}
                style={{
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#0f172a' : '#64748b',
                  boxShadow: mode === m ? '0 1px 3px rgba(15,23,42,.10)' : 'none',
                }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Email / password sign-in (logic from main: handleEmailLogin / handleForgotPassword, unchanged).
              Students: NOT shown — they sign in with Google (and Apple on Apple devices).
              Only when redirected here from the website's /admin (isAdminFlow); admins normally use the
              separate admin panel, which has its own email + password sign-in. */}
          {showEmail && (
            <div className="auth-email">
              <form onSubmit={handleEmailLogin} className="auth-email-form">
                <input type="email" className="auth-input" value={emailVal} onChange={e => setEmailVal(e.target.value)}
                  placeholder="Email address" autoComplete="email" aria-label="Email address"/>
                <input type="password" className="auth-input" value={passVal} onChange={e => setPassVal(e.target.value)}
                  placeholder="Password" autoComplete="current-password" aria-label="Password"/>
                <div className="auth-email-row">
                  <button type="button" className="auth-link auth-forgot" onClick={handleForgotPassword} disabled={resetLoad}>
                    {resetLoad ? 'Sending…' : 'Forgot password?'}
                  </button>
                </div>
                {resetSent && <p className="auth-ok">✓ Password reset link sent — check your inbox (and spam folder).</p>}
                {emailErr && <p className="auth-err" role="alert">{emailErr}</p>}
                <button type="submit" disabled={emailLoad} className="auth-btn auth-btn-primary">
                  {emailLoad ? <><Spinner /><span>Signing in…</span></> : 'Sign in'}
                </button>
              </form>
              <div className="auth-divider">
                <span/>
                <em className="auth-divider-txt">or continue with</em>
                <span/>
              </div>
            </div>
          )}

          {/* Social sign-in buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button onClick={handleGoogle} disabled={googleLoad || appleLoad} className="auth-btn auth-btn-google">
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
                <button onClick={handleApple} disabled={appleLoad || googleLoad} className="auth-btn auth-btn-apple">
                  {appleLoad ? <Spinner /> : (
                    <svg width="17" height="17" viewBox="0 0 814 1000" fill="white">
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.3 46 341.4 46 339.2c0-157.3 98.4-240.5 195-240.5 57.8 0 106.9 38.2 143.4 38.2 35.2 0 89.1-38.2 154.2-38.2 27.1 0 108.2 2.6 168.2 75.8zm-295-10.3c6.4-28.8 10.3-56.3 10.3-82.9 0-32.1-5.8-63.5-16.8-91.7-41.5 7.7-81.4 46.3-101.8 91.7-14.7 35.7-21 70.7-21 105.3 0 28.2 4.5 56.3 15.6 80.5 49.3 4.5 100.5-28.2 113.7-103z"/>
                    </svg>
                  )}
                  <span>{appleLoad ? 'Redirecting…' : (mode === 'login' ? 'Continue with Apple' : 'Sign up with Apple')}</span>
                </button>
                {appleErr && (
                  <p style={{ fontSize:12, color:'#dc2626', textAlign:'center', marginTop:-2 }}>{appleErr}</p>
                )}
              </>
            )}
          </div>

          {/* Bottom mode switch */}
          <p style={{ textAlign:'center', fontSize:13, color:'#64748b', marginTop:'clamp(12px,2.4vh,18px)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" className="auth-link" onClick={() => switchMode('signup')}>Sign up free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" className="auth-link" onClick={() => switchMode('login')}>Sign in</button>
              </>
            )}
          </p>

          {/* Terms + secure note */}
          <div style={{ marginTop:'clamp(14px,3vh,26px)', paddingTop:'clamp(12px,2.2vh,18px)', borderTop:'1px solid #e2e8f0', display:'flex', alignItems:'flex-start', gap:10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
            <p style={{ fontSize:11.5, color:'#94a3b8', lineHeight:1.6, margin:0 }}>
              Secure sign-in. By continuing you agree to our{' '}
              <button onClick={() => handleNav('terms')} className="auth-link" style={{ fontWeight:600, textDecoration:'underline' }}>Terms</button>
              {' '}and{' '}
              <button onClick={() => handleNav('privacy')} className="auth-link" style={{ fontWeight:600, textDecoration:'underline' }}>Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
