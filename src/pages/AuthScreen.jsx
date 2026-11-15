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

export default function AuthScreen({ onAuth, onBack, onNav }) {
  const handleNav = (id) => { if (onNav) onNav(id); else onBack() }
  const [googleLoad, setGoogleLoad] = useState(false)
  const [appleLoad,  setAppleLoad]  = useState(false)
  const [mode,       setMode]       = useState('login')

  // True only when redirected here from /admin
  const isAdminFlow = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('postAuthNav') || '{}')?.target === 'admin' } catch { return false }
  }, [])

  // Email / password login (for admin — web only)
  const [showEmail,  setShowEmail]  = useState(isAdminFlow)
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

  /* ── Auth UI (web layout) ── */
  return (
    <div style={{ fontFamily: "'Poppins','Inter','Segoe UI',system-ui,sans-serif", background: '#ffffff', height: '100vh' }}
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
          onMouseOver={e => { e.currentTarget.style.borderColor='#F06535'; e.currentTarget.style.color='#F06535'; e.currentTarget.style.background='rgba(232,90,44,.04)' }}
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
              background: i % 2 === 0 ? 'rgba(232,90,44,.04)' : 'rgba(232,90,44,.02)',
              border: '1px solid rgba(232,90,44,.06)',
            }} />
          ))}
        </div>

        <div className="relative z-10">
          <div className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: '#F06535', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>MT</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#111', fontSize: 16, lineHeight: 1 }}>MockTest</div>
              <div style={{ fontSize: 9, color: '#F06535', letterSpacing: '.10em', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 2 }}>Your World of Mock Tests</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1.25, marginBottom: 12, marginTop: 28 }}>
            Ace your next<br />
            <span style={{ color: '#F06535' }}>competitive exam</span>
          </h1>

          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, marginBottom: 32, maxWidth: 430 }}>
            India's first fully expert-crafted competitive exam platform.
            Category-aware cut-off tracking for UR, OBC, SC, ST, EWS and PwBD candidates.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#F06535' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map(({ Svg, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div style={{ width: 28, height: 28, background: '#fff', border: '1px solid #e8eaed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#F06535' }}>
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
            <div style={{ width: 28, height: 28, background: '#F06535', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div style={{ width: 32, height: 32, background: '#F06535', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <div style={{ width: 42, height: 42, background: '#F06535', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>MT</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: '#111', fontSize: 18, lineHeight: 1 }}>MockTest</div>
                    <div style={{ fontSize: 9, color: '#F06535', letterSpacing: '.09em', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 3 }}>Your World of Mock Tests</div>
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

              {/* Email / password — admin flow only */}
              <div style={{ marginTop: 16 }}>{isAdminFlow && <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: showEmail ? 12 : 0 }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <button type="button" onClick={() => { setShowEmail(v => !v); setEmailErr('') }}
                    style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 4px' }}>
                    {showEmail ? '▲ Hide email login' : '▼ Sign in with email'}
                  </button>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>

                {showEmail && (
                  <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)}
                      placeholder="Email address" autoComplete="email"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 10, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#F06535'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                    <input
                      type="password" value={passVal} onChange={e => setPassVal(e.target.value)}
                      placeholder="Password" autoComplete="current-password"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 10, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#F06535'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                    {isAdminFlow && (
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <button type="button" onClick={handleForgotPassword} disabled={resetLoad}
                          style={{ fontSize: 11.5, color: '#F06535', background: 'none', border: 'none', cursor: resetLoad ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit' }}>
                          {resetLoad ? 'Sending…' : 'Forgot / Set password?'}
                        </button>
                      </div>
                    )}
                    {resetSent && (
                      <p style={{ fontSize: 12, color: '#16a34a', margin: 0, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px' }}>
                        ✓ Password reset link sent — check your inbox (and spam folder).
                      </p>
                    )}
                    {emailErr && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{emailErr}</p>}
                    <button type="submit" disabled={emailLoad}
                      style={{ width: '100%', padding: '11px 0', fontSize: 13.5, fontWeight: 700, background: emailLoad ? '#f3f4f6' : '#111827', color: emailLoad ? '#9ca3af' : '#fff', border: 'none', borderRadius: 10, cursor: emailLoad ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {emailLoad ? <><Spinner /><span>Signing in…</span></> : 'Sign in'}
                    </button>
                  </form>
                )}
              </>}</div>

              {/* Bottom mode switch */}
              <p style={{ textAlign: 'center', fontSize: 12.5, color: '#6b7280', marginTop: 18 }}>
                {mode === 'login' ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} style={{ color: '#F06535', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 'inherit' }}>Sign up free</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} style={{ color: '#F06535', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 'inherit' }}>Sign in</button>
                  </>
                )}
              </p>

              <p style={{ fontSize: 10.5, color: '#b0b8c4', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                By continuing you agree to our{' '}
                <button onClick={() => handleNav('terms')} style={{ color: '#F06535', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Terms</button>
                {' '}and{' '}
                <button onClick={() => handleNav('privacy')} style={{ color: '#F06535', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>Privacy Policy</button>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
