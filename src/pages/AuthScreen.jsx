import { useState, useEffect } from 'react'
const _MailIc = ({s=26,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
import { supabase } from '../supabase.js'
import {
  hashPassword, validatePassword, passwordStrength,
  getRateLimit, recordFailedAttempt, clearRateLimit, formatLockout,
} from '../crypto.js'
import Footer from '../components/Footer.jsx'

const MAX_TRIES_DISPLAY = 5

/* ─── Disposable / temp email domain blocklist ─── */
const BLOCKED_DOMAINS = new Set([
  // ── Mailinator family ──
  'mailinator.com','mailinator.net','mailinator.org','mailinator2.com',
  'tradermail.info','smsreceivefree.com','inoutmail.de','inoutmail.eu',
  // ── Guerrilla Mail ──
  'guerrillamail.com','guerrillamail.info','guerrillamail.biz','guerrillamail.de',
  'guerrillamail.net','guerrillamail.org','guerrillamailblock.com',
  'grr.la','sharklasers.com','guerrillamail.co.uk',
  // ── Trash / Temp families ──
  'trashmail.com','trashmail.at','trashmail.io','trashmail.me','trashmail.net',
  'trashmail.org','trashmail.xyz','trashemail.de','trashdevil.com','trashdevil.de',
  'tempmail.com','tempmail.net','tempmail.de','tempmail.org','tempmail.us',
  'tempmail.it','tempmail.plus','tempmail.io','tempmail.ninja','tempmail.email',
  'temp-mail.org','temp-mail.io','temp-mail.com','temp-mail.net',
  'tempr.email','tempinbox.com','tempinbox.co.uk','dispostable.com',
  '10minutemail.com','10minutemail.net','10minutemail.org','10minutemail.co.za',
  '10minutemail.de','10minemail.com','20minutemail.com','30minutemail.com',
  '60minutemail.com','2prong.com','3d-painting.com','4warding.com',
  'filzmail.com','filzmail.de',
  // ── Yopmail ──
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  // ── Spam / disposable ──
  'spam4.me','spam.la','spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'spamfree24.org','spamfree.eu','spamhereplease.com','spammotel.com',
  'spamspot.com','spamevader.com','bspamfree.org','antispam.de',
  'mailnull.com','mailnesia.com','maildrop.cc','mailexpire.com',
  'mailhazard.com','mailboxy.fun','mailme.lv','mail-filter.com',
  'meltmail.com','mintemail.com','mailsiphon.com','mailnew.com',
  // ── Burner / Throwaway ──
  'burnermail.io','throwaway.email','throwam.com','throam.com',
  'discard.email','deadaddress.com','emailondeck.com',
  'getairmail.com','fakeinbox.com','fakemailgenerator.com',
  'fakemail.net','fakemail.fr','fakenew.com',
  // ── One-click / anonymous ──
  'noclickemail.com','hailmail.net','inboxbear.com',
  '0-mail.com','0clickemail.com','0wnd.net','0wnd.org',
  'binkmail.com','bobmail.info','crazymailing.com','smellfear.com',
  'supergreatmail.com','bigstring.com','bloatbox.com','bumpymail.com',
  'tmailor.com','nwldx.com','venompen.com','thetimezone.com',
  'koszmail.pl','uggsrock.com','suremail.info','comsafe-mail.net',
  'mt2015.com',
  // ── Guerrilla / Short-lived ──
  'maildrop.cc','mailnull.com','spamgourmet.com','spam4.me',
  // ── Popular disposable services ──
  'mohmal.com','moakt.com','incognitomail.com','incognitomail.net',
  'incognitomail.org','mailismagic.com','magspam.net','jetable.com',
  'jetable.net','jetable.org','jetable.pp.ua','jetableemail.com',
  'nowmymail.com','nowmymail.net','nomail.xl.cx','notmailinator.com',
  'objectmail.com','odaymail.com','oneoffemail.com','oneoffmail.com',
  'onewaymail.com','online.ms','opayq.com','ordinaryamerican.net',
  'owlpic.com','pancakemail.com','pecinan.com','pecinan.net','pecinan.org',
  'pjjkp.com','plexolan.de','pookmail.com','powered.name','privacy.net',
  'proxymail.eu','prtnx.com','punkass.com','put2.net','qq.com',
  'r4nd0m.de','rcpt.at','recode.me','recursor.net','regbypass.com',
  'regbypass.comsafe-mail.net','rejectmail.com','rklips.com','rppkn.com',
  'rtrtr.com','s0ny.net','safe-mail.net','safersignup.de','safetymail.info',
  'safetypost.de','sandelf.de','sast.ro','shortmail.net',
  'sneakemail.com','snkmail.com','sofort-mail.de','sogetthis.com',
  'solvemail.info','spam.su','spamavert.com','spambo.com',
  'spambob.com','spambob.net','spambob.org','spambog.com','spambog.de',
  'spambog.ru','spamcon.org','spamcorptastic.com','spamcowboy.com',
  'spamcowboy.net','spamcowboy.org','spamday.com','spamdecoy.net',
  'spamex.com','spamfighter.cf','spamfighter.ga','spamfighter.gq',
  'spamfighter.ml','spamfighter.tk','spamgoes.in','spamgourmet.info',
  'spamherelots.com','spamify.com','spaminator.de','spamkill.info',
  'spaml.com','spaml.de','spamnotice.com','spamoff.de','spamslicer.com',
  'spamthis.co.uk','spamtroll.net','spamwc.cf','spamwc.ga','spamwc.gq',
  'spamwc.ml','spamwc.tk','spoofmail.de','squizzy.de','squizzy.eu',
  'squizzy.net','sry.li','stoned.com','stuffmail.de','super-auswahl.de',
  'supermailer.jp','superrito.com','superstachel.de','suremail.info',
  'svk.jp','sweetxxx.de','tafmail.com','tagyourself.com','techemail.com',
  'teewars.org','teleworm.com','teleworm.us','tempalias.com',
  'tempe-mail.com','tempinbox.com','temporaryemail.net','temporaryemail.us',
  'temporaryforwarding.com','temporaryinbox.com','temporarymailaddress.com',
  'tempthe.net','thanksnospam.info','thecloudindex.com',
  'thisisnotmyrealemail.com','thismail.net','throwam.com',
  'tittbit.in','tizi.com','tm2mail.com','tmailinator.com',
  'toiea.com','trashcanmail.com','trashimail.de','trayna.com',
  'trillianpro.com','tryalert.com','turual.com','twinmail.de',
  'tyldd.com','uggsrock.com','unbounded.me','unmail.ru',
  'upliftnow.com','uplipht.com','uroid.com','us.af',
  'valemail.net','venompen.com','veryrealemail.com','vidchart.com',
  'viditag.com','viewcastmedia.com','viewcastmedia.net','viewcastmedia.org',
  'vkcode.ru','vomoto.com','vpn.st','vsimcard.com','vubby.com',
  'wasteland.rr.nu','webm4il.info','wegwerfadresse.de','wegwerfmail.de',
  'wegwerfmail.net','wegwerfmail.org','wetrainbayarea.com','wetrainbayarea.org',
  'wilemail.com','willselfdestruct.com','winemaven.info','wronghead.com',
  'wuzupmail.net','www.e4ward.com','www.mailinator.com',
  'xagloo.co','xagloo.com','xemaps.com','xents.com','xmail.com',
  'xmaily.com','xn--9kq967o.com','xoxy.net','xperiae.com','xww.ro',
  'xyz.am','yapped.net','yeah.net','yep.it','yogamaven.com',
  'yomail.info','yopmail.pp.ua','yourdomain.com','ypmail.webarnak.fr.eu.org',
  'yuurok.com','z1p.biz','za.com','zebins.com','zebins.eu',
  'zehnminuten.de','zehnminutenmail.de','zetmail.com','zippymail.info',
  'zoaxe.com','zoemail.net','zoemail.org','zomg.info','zxcv.com',
  'zxcvbnm.com','zzz.com',
  // ── Indian temp mail services ──
  'yopmail.com','getindiamail.com',
  // ── One-time / anonymous mailers ──
  'sharklasers.com','guerrillamailblock.com',
  'drdrb.com','drdrb.net','easytrashmail.com','eelmail.com',
  'einrot.com','einrot.de','emailias.com','emailinfive.com',
  'emailisvalid.com','emailll.com','emailmiser.com','emailproxsy.com',
  'emailsecret.net','emailsensei.com','emailtemporario.com.br',
  'emailthe.net','emailtmp.com','emailto.de','emailwarden.com',
  'emailx.at.hm','emailxfer.com','emkei.cz','emz.net',
  'ero-tube.org','evilcomputer.com','evopo.com','exdonuts.com',
  'explodemail.com','express.net.ua',
])

const DISPOSABLE_PATTERNS = [
  /temp/i, /trash/i, /spam/i, /fake/i, /throw/i, /disposable/i,
  /guerrilla/i, /mailinator/i, /yopmail/i, /burner/i, /junk/i,
  /noreply/i, /nowhere/i, /anonymous/i, /hide/i, /incognito/i,
  /discard/i, /dead/i, /nospam/i, /antispam/i, /dontmail/i,
  /trashmail/i, /maildrop/i, /mailnull/i, /fakeMail/i,
]

const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  if (!domain) return true
  if (BLOCKED_DOMAINS.has(domain)) return true
  // Block if domain matches any known disposable pattern
  if (DISPOSABLE_PATTERNS.some(p => p.test(domain))) return true
  // Block single-character or suspiciously short domains
  const tld = domain.split('.')
  if (tld[0]?.length < 2) return true
  return false
}

const CATEGORIES = [
  { value: 'UR',   label: 'General / UR',  desc: 'No reservation benefit' },
  { value: 'OBC',  label: 'OBC',           desc: 'Other Backward Classes' },
  { value: 'EWS',  label: 'EWS',           desc: 'Economically Weaker Section' },
  { value: 'SC',   label: 'SC',            desc: 'Scheduled Caste' },
  { value: 'ST',   label: 'ST',            desc: 'Scheduled Tribe' },
  { value: 'PwBD', label: 'PwBD',          desc: 'Persons with Benchmark Disability' },
]

const SvgBrain  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3C7 3 5 5 5 8c0 1.5.5 2.5 1 3.5C7 13 7 14 7 15h6c0-1 0-2 1-3.5.5-1 1-2 1-3.5 0-3-2-5-5-5z"/><path d="M7 15h6M8 17h4"/></svg>
const SvgChart  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgTarget = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>
const SvgTimer  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="11" r="7"/><path d="M10 7v4l2.5 2.5"/><path d="M7.5 2h5M10 2v2"/></svg>

const EyeIcon = ({ open }) => open
  ? <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 10s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z"/><circle cx="10" cy="10" r="3"/></svg>
  : <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l14 14M12.4 12.5a3 3 0 01-4.9-3.4"/><path d="M7.3 5.4C8.1 5.1 9 5 10 5c5.4 0 9 5 9 5a17 17 0 01-2.7 3.3M5 6.7A17 17 0 001 10s3.6 7 9 7a9 9 0 004.3-1.1"/></svg>

const Spinner = () => (
  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'auth-spin .65s linear infinite' }} />
)

const OTP_LEN = 6  // must match Supabase Auth → Settings → "OTP length"

export default function AuthScreen({ onAuth, onBack, onNav }) {
  const handleNav = (id) => { if (onNav) onNav(id); else onBack() }

  const [tab,       setTab]      = useState('login')

  /* ── Login state ── */
  const [loginData,  setLoginData]  = useState({ email: '', password: '' })
  const [loginErr,   setLoginErr]   = useState('')
  const [loginLoad,  setLoginLoad]  = useState(false)
  const [showLPw,    setShowLPw]    = useState(false)
  const [forgotLoad, setForgotLoad] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [lockout,    setLockout]    = useState({ blocked: false, secondsLeft: 0 })

  /* ── Register state ── */
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    dialCode: '+91', category: '', password: '', confirm: '',
    dob: '', gender: '', referral: '',
  })
  const [regErr,   setRegErr]   = useState('')
  const [regLoad,  setRegLoad]  = useState(false)
  const [regStep,  setRegStep]  = useState('form')  // 'form' | 'otp'
  const [otp,      setOtp]      = useState('')
  const [otpErr,   setOtpErr]   = useState('')
  const [otpLoad,  setOtpLoad]  = useState(false)
  const [resendCd, setResendCd] = useState(0)
  const [showRPw,  setShowRPw]  = useState(false)
  const [showCPw,  setShowCPw]  = useState(false)
  const [pwStr,    setPwStr]    = useState({ score: 0, label: '', color: '#e5e7eb', bars: 0 })

  /* ── Clear any stale session when auth page loads ── */
  useEffect(() => { supabase.auth.signOut() }, [])

  /* ── Lockout countdown ── */
  useEffect(() => {
    let t
    const upd = () => { const rl = getRateLimit(); setLockout(rl); if (!rl.blocked) clearInterval(t) }
    upd(); t = setInterval(upd, 1000)
    return () => clearInterval(t)
  }, [])

  /* ── Resend countdown ── */
  useEffect(() => {
    if (resendCd <= 0) return
    const t = setInterval(() => setResendCd(c => c <= 1 ? 0 : c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCd])

  /* ─────────── LOGIN ─────────── */
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) { setLoginErr('Please fill all fields.'); return }
    const rl = getRateLimit()
    if (rl.blocked) { setLoginErr(`Too many failed attempts. Try again in ${formatLockout(rl.secondsLeft)}.`); return }
    setLoginErr(''); setLoginLoad(true)

    const email  = loginData.email.trim().toLowerCase()
    const hashed = await hashPassword(loginData.password)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: hashed })
    if (!error) { clearRateLimit(); onAuth(data.user); return }

    const { data: plain, error: plainErr } = await supabase.auth.signInWithPassword({ email, password: loginData.password })
    if (!plainErr && plain?.user) {
      supabase.auth.updateUser({ password: hashed }).catch(() => {})
      clearRateLimit(); onAuth(plain.user); return
    }

    recordFailedAttempt()
    const newRl = getRateLimit()
    const rem   = MAX_TRIES_DISPLAY - newRl.attempts
    setLoginErr(newRl.blocked
      ? `Too many failed attempts. Locked for ${formatLockout(newRl.secondsLeft)}.`
      : rem > 0 ? `Invalid email or password. ${rem} attempt${rem === 1 ? '' : 's'} remaining.` : 'Invalid email or password.')
    setLoginLoad(false)
  }

  const handleGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })

  const handleForgot = async () => {
    if (!loginData.email.trim()) { setLoginErr('Enter your email address first.'); return }
    setForgotLoad(true)
    const { error } = await supabase.auth.resetPasswordForEmail(loginData.email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setLoginErr(error.message || 'Failed to send reset email.')
    else setForgotSent(true)
    setForgotLoad(false)
  }

  /* ─────────── REGISTER — Step 1 ─────────── */
  const handleSendOtp = async () => {
    const { firstName, email, mobile, category, password, confirm } = regData
    if (!firstName.trim())                               { setRegErr('First name is required.'); return }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setRegErr('Enter a valid email address.'); return }
    if (isDisposableEmail(email.trim()))                 { setRegErr('Please use a permanent email address. Temporary or disposable emails are not allowed.'); return }
    const mobileValid = regData.dialCode === '+91'
      ? /^[6-9]\d{9}$/.test(mobile)
      : /^\d{10}$/.test(mobile)
    if (!mobile.trim() || !mobileValid) {
      setRegErr(regData.dialCode === '+91'
        ? 'Enter a valid 10-digit Indian mobile number (starts with 6–9).'
        : 'Enter a valid 10-digit US phone number.')
      return
    }
    if (!category)                                       { setRegErr('Please select your reservation category.'); return }
    if (!regData.dob)                                    { setRegErr('Please enter your date of birth.'); return }
    if (!regData.gender)                                 { setRegErr('Please select your gender.'); return }
    if (!password)                                       { setRegErr('Password is required.'); return }
    const pwErr = validatePassword(password)
    if (pwErr)                                           { setRegErr(pwErr); return }
    if (password !== confirm)                            { setRegErr('Passwords do not match.'); return }

    setRegErr(''); setRegLoad(true)
    const hashed = await hashPassword(password)

    // signUp with only credentials — no personal data written until OTP is verified
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: hashed,
    })

    if (error) { setRegErr(error.message); setRegLoad(false); return }

    setRegLoad(false)
    setRegStep('otp')
    setResendCd(60)
  }

  /* ─────────── REGISTER — Step 2: verify OTP ─────────── */
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== OTP_LEN) { setOtpErr(`Enter the ${OTP_LEN}-digit code.`); return }
    setOtpErr(''); setOtpLoad(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email: regData.email.trim().toLowerCase(),
      token: otp,
      type:  'signup',
    })

    if (error) { setOtpErr(error.message || 'Invalid code. Please try again.'); setOtpLoad(false); return }

    const u = data.session?.user || data.user
    if (!u) { setOtpErr('Verification failed. Please try again.'); setOtpLoad(false); return }

    // OTP verified — now write all user data to the database
    const fullName = `${regData.firstName} ${regData.lastName}`.trim()
    const phone    = `${regData.dialCode}${regData.mobile}`
    try {
      // Save metadata to Supabase Auth user profile
      await supabase.auth.updateUser({
        data: {
          full_name:           fullName,
          phone,
          mobile:              phone,
          dob:                 regData.dob || '',
          gender:              regData.gender || '',
          referral_source:     regData.referral || '',
          category:            regData.category,
          onboarding_complete: false,
        },
      })
      // Save to profiles table
      await supabase.from('profiles').upsert(
        { id: u.id, full_name: fullName, category: regData.category,
          phone, dob: regData.dob || null, gender: regData.gender || null,
          referral_source: regData.referral || null },
        { onConflict: 'id' }
      )
    } catch (_) {}

    onAuth(u)
  }

  const handleResend = async () => {
    if (resendCd > 0) return
    setOtpErr('')
    const { error } = await supabase.auth.resend({ type: 'signup', email: regData.email.trim().toLowerCase() })
    if (error) {
      setOtpErr('Failed to resend: ' + error.message)
      return
    }
    setResendCd(60)
    setOtpErr('')
  }

  const setOtpDigit = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const arr = otp.padEnd(OTP_LEN, ' ').split('')
    arr[i] = v || ' '
    const next = arr.join('').replace(/ /g, '')
    setOtp(next)
    if (v && i < OTP_LEN - 1) document.getElementById(`otp-${i + 1}`)?.focus()
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

  const inp = 'w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors'
  const sel = inp + ' cursor-pointer'
  const lbl = 'block text-[13px] font-semibold text-gray-900 mb-1'

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: '#ffffff', height: '100vh' }}
      className="flex flex-col md:flex-row overflow-hidden">

      <style>{`@keyframes auth-spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex md:w-[46%] flex-col justify-center p-10 relative overflow-y-auto h-full"
        style={{ background: '#ffffff', borderRight: '1px solid #e8eaed' }}>

        {/* Back to Home */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute', top: 24, left: 32,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid #e5e7eb',
              borderRadius: 8, padding: '6px 12px',
              cursor: 'pointer', color: '#6b7280',
              fontSize: 13, fontWeight: 500,
              transition: 'all .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#FF653F'; e.currentTarget.style.color = '#FF653F'; e.currentTarget.style.background = 'rgba(255,101,63,.04)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Home
          </button>
        )}

        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width: `${180 + i * 100}px`, height: `${180 + i * 100}px`,
                top: `${-60 + i * 15}px`, right: `${-80 + i * 10}px`,
                background: i % 2 === 0 ? 'rgba(255,101,63,.04)' : 'rgba(255,101,63,.02)',
                border: '1px solid rgba(255,101,63,.06)' }} />
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

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#FF653F' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
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

        {/* Testimonial */}
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
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: '#111' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, background: '#FF653F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 11 }}>MT</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>MockTest</span>
          </div>
          <button onClick={onBack} style={{ color: '#999', fontSize: 13 }} className="hover:text-white transition-colors">Back</button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto px-5 sm:px-8 py-8 w-full">
          <div className="w-full max-w-[440px] my-auto">
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>

              {/* ══════ OTP STEP ══════ */}
              {regStep === 'otp' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, background: '#FFF3EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#FF653F' }}><_MailIc s={26}/></div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your email</h2>
                  <p className="text-sm text-gray-500 mb-1">
                    We sent a {OTP_LEN}-digit code to<br />
                    <strong className="text-gray-900">{regData.email}</strong>
                  </p>
                  <p className="text-xs text-gray-400 mb-5">Check your spam folder if you don't see it within a minute.</p>

                  {otpErr && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                      <span className="text-red-600 text-xs">{otpErr}</span>
                    </div>
                  )}

                  {/* OTP digit boxes */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                    {Array.from({length: OTP_LEN}, (_, i) => i).map(i => (
                      <input key={i} id={`otp-${i}`}
                        type="text" inputMode="numeric" maxLength={1}
                        value={otp[i] || ''}
                        onChange={e => setOtpDigit(i, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !otp[i] && i > 0) {
                            const arr = otp.padEnd(OTP_LEN, ' ').split('')
                            arr[i - 1] = ' '
                            setOtp(arr.join('').replace(/ /g, ''))
                            document.getElementById(`otp-${i - 1}`)?.focus()
                          }
                        }}
                        onPaste={e => {
                          e.preventDefault()
                          const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN)
                          setOtp(pasted)
                          document.getElementById(`otp-${Math.min(pasted.length, OTP_LEN - 1)}`)?.focus()
                        }}
                        style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
                          border: `2px solid ${otp[i] ? '#FF653F' : '#e5e7eb'}`, borderRadius: 10, outline: 'none',
                          color: '#111', background: '#fff', boxSizing: 'border-box', transition: 'border-color .15s' }} />
                    ))}
                  </div>

                  <button onClick={handleVerifyOtp}
                    disabled={otpLoad || otp.replace(/\s/g, '').length < OTP_LEN}
                    className="w-full text-white text-sm font-bold py-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
                    style={{ background: '#FF653F' }}
                    onMouseOver={e => !otpLoad && (e.currentTarget.style.background = '#e5512f')}
                    onMouseOut={e => !otpLoad && (e.currentTarget.style.background = '#FF653F')}>
                    {otpLoad ? <><Spinner /> Verifying…</> : 'Verify & Create Account ✓'}
                  </button>

                  <p className="text-sm text-gray-500 mb-3">
                    Didn't receive the code?{' '}
                    {resendCd > 0
                      ? <span className="text-gray-400">Resend in {resendCd}s</span>
                      : <button onClick={handleResend} className="font-semibold hover:underline" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>Resend</button>
                    }
                  </p>
                  <button onClick={() => { setRegStep('form'); setOtp(''); setOtpErr('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    ← Edit my details
                  </button>
                </div>
              ) : (
                /* ══════ LOGIN / REGISTER FORM ══════ */
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {tab === 'login' ? 'Login to MockTest' : 'Create your account'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {tab === 'login'
                        ? 'Resume your tests, reports, and personalised study plan.'
                        : 'Set your exam and category once so predictions stay personalised.'}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex rounded-lg p-1 mb-4 bg-gray-100">
                    {[['login', 'Login'], ['register', 'Register']].map(([id, label]) => (
                      <button key={id} onClick={() => { setTab(id); setLoginErr(''); setRegErr('') }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                          tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Google */}
                  <button onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 transition-colors mb-4 bg-white hover:bg-gray-50">
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#4285F4" d="M46.145 24.503c0-1.633-.138-3.205-.397-4.712H24v8.924h12.441a10.6 10.6 0 01-4.602 6.958v5.782h7.45c4.358-4.013 6.856-9.924 6.856-16.952z"/>
                      <path fill="#34A853" d="M24 47c6.237 0 11.466-2.07 15.29-5.592l-7.45-5.782c-2.073 1.391-4.72 2.211-7.84 2.211-6.027 0-11.131-4.07-12.951-9.535H3.38v5.974C7.189 42.018 15.02 47 24 47z"/>
                      <path fill="#FBBC05" d="M11.049 28.302a13.71 13.71 0 01-.716-4.302c0-1.493.257-2.944.716-4.302v-5.974H3.38A23.986 23.986 0 001 24c0 3.868.924 7.527 2.38 10.276l7.669-5.974z"/>
                      <path fill="#EA4335" d="M24 9.8c3.397 0 6.444 1.168 8.84 3.461l6.624-6.624C35.462 2.973 30.234.8 24 .8 15.02.8 7.189 5.782 3.38 13.724l7.669 5.974C12.869 14.132 17.973 9.8 24 9.8z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200"/>
                    <span className="text-xs text-gray-400 font-medium">or with email</span>
                    <div className="flex-1 h-px bg-gray-200"/>
                  </div>

                  {/* ── LOGIN ── */}
                  {tab === 'login' && (
                    <div className="space-y-4">
                      {forgotSent ? (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                          <div style={{ marginBottom: 10, display:'flex', justifyContent:'center', color:'#FF653F' }}><_MailIc s={40}/></div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">Check your inbox</p>
                          <p className="text-xs text-gray-500 mb-4">
                            Password reset link sent to <strong>{loginData.email}</strong>
                          </p>
                          <button onClick={() => { setForgotSent(false); setLoginErr('') }}
                            className="text-xs font-semibold hover:underline" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer' }}>
                            ← Back to login
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className={lbl}>Email address</label>
                            <input type="email" placeholder="you@example.com" value={loginData.email}
                              onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleLogin()} className={inp} />
                          </div>
                          <div>
                            <label className={lbl}>Password</label>
                            <div className="relative">
                              <input type={showLPw ? 'text' : 'password'} placeholder="Enter your password" value={loginData.password}
                                onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()} className={inp + ' pr-10'} />
                              <button type="button" onClick={() => setShowLPw(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <EyeIcon open={showLPw} />
                              </button>
                            </div>
                          </div>
                          {loginErr && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-xs">{loginErr}</div>
                          )}
                          {lockout.blocked && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-orange-700 text-xs">
                              Account locked for {formatLockout(lockout.secondsLeft)}. Please wait.
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                            <button onClick={handleForgot} disabled={forgotLoad}
                              className="text-xs hover:underline disabled:opacity-50" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer' }}>
                              {forgotLoad ? 'Sending…' : 'Forgot password?'}
                            </button>
                            <button onClick={handleLogin} disabled={loginLoad || lockout.blocked}
                              className="w-full sm:w-auto justify-center text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-all disabled:opacity-60 flex items-center gap-2"
                              style={{ background: '#FF653F' }}
                              onMouseOver={e => !loginLoad && (e.currentTarget.style.background = '#e5512f')}
                              onMouseOut={e => !loginLoad && (e.currentTarget.style.background = '#FF653F')}>
                              {loginLoad ? <><Spinner /> Signing in…</> : 'Login'}
                            </button>
                          </div>
                          <p className="text-center text-xs text-gray-500 pt-2">
                            Don't have an account?{' '}
                            <button onClick={() => setTab('register')} className="font-semibold hover:underline" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer' }}>
                              Sign up free
                            </button>
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── REGISTER ── */}
                  {tab === 'register' && (
                    <div className="space-y-3">
                      {regErr && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-xs">{regErr}</div>
                      )}

                      {/* Name */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>First name <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="First name" value={regData.firstName}
                            onChange={e => setRegData(d => ({ ...d, firstName: e.target.value }))} className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Last name</label>
                          <input type="text" placeholder="Last name" value={regData.lastName}
                            onChange={e => setRegData(d => ({ ...d, lastName: e.target.value }))} className={inp} />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className={lbl}>Email address <span className="text-red-500">*</span></label>
                        <input type="email" placeholder="you@example.com" value={regData.email}
                          onChange={e => setRegData(d => ({ ...d, email: e.target.value }))} className={inp} />
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className={lbl}>Mobile <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          <select value={regData.dialCode}
                            onChange={e => setRegData(d => ({ ...d, dialCode: e.target.value, mobile: '' }))}
                            className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer flex-shrink-0">
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                          </select>
                          <input type="tel" maxLength={10} placeholder="10-digit number" value={regData.mobile}
                            onChange={e => setRegData(d => ({ ...d, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            className={inp + ' flex-1'} />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className={lbl}>
                          Reservation Category <span className="text-red-500">*</span>
                          <span className="ml-1 text-gray-400 font-normal">(for cut-off comparison)</span>
                        </label>
                        <select value={regData.category}
                          onChange={e => setRegData(d => ({ ...d, category: e.target.value }))}
                          className={sel + (regData.category ? '' : ' text-gray-400')}>
                          <option value="">-- Select your category --</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label} — {cat.desc}</option>
                          ))}
                        </select>
                        {regData.category && (
                          <p className="text-xs mt-1" style={{ color: '#FF653F' }}>
                            ✓ Tracked against {CATEGORIES.find(c => c.value === regData.category)?.label} cut-offs.
                          </p>
                        )}
                      </div>

                      {/* DOB + Gender */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Date of birth <span className="text-red-500">*</span></label>
                          <input type="date" max={new Date().toISOString().split('T')[0]} value={regData.dob}
                            onChange={e => setRegData(d => ({ ...d, dob: e.target.value }))} className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Gender <span className="text-red-500">*</span></label>
                          <select value={regData.gender}
                            onChange={e => setRegData(d => ({ ...d, gender: e.target.value }))}
                            className={sel + (regData.gender ? '' : ' text-gray-400')}>
                            <option value="">-- Select --</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="na">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      {/* Referral */}
                      <div>
                        <label className={lbl}>How did you hear about us?</label>
                        <select value={regData.referral}
                          onChange={e => setRegData(d => ({ ...d, referral: e.target.value }))}
                          className={sel + (regData.referral ? '' : ' text-gray-400')}>
                          <option value="">-- Select (optional) --</option>
                          <option value="youtube">YouTube</option>
                          <option value="instagram">Instagram</option>
                          <option value="telegram">Telegram</option>
                          <option value="google">Google Search</option>
                          <option value="friend">Friend / Word of mouth</option>
                          <option value="coaching">College / Coaching</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Password */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Password <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input type={showRPw ? 'text' : 'password'} placeholder="Min 8 chars" value={regData.password}
                              onChange={e => { setRegData(d => ({ ...d, password: e.target.value })); setPwStr(passwordStrength(e.target.value)) }}
                              className={inp + ' pr-9'} />
                            <button type="button" onClick={() => setShowRPw(v => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <EyeIcon open={showRPw} />
                            </button>
                          </div>
                          {regData.password && (
                            <div className="flex gap-1 mt-1.5">
                              {[1,2,3,4].map(i => (
                                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStr.bars ? pwStr.color : '#e5e7eb', transition: 'background .2s' }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={lbl}>Confirm <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input type={showCPw ? 'text' : 'password'} placeholder="Repeat password" value={regData.confirm}
                              onChange={e => setRegData(d => ({ ...d, confirm: e.target.value }))}
                              className={inp + ' pr-9' + (regData.confirm && regData.confirm !== regData.password ? ' border-red-400' : '')} />
                            <button type="button" onClick={() => setShowCPw(v => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <EyeIcon open={showCPw} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 leading-snug">
                        By registering you agree to our{' '}
                        <button onClick={() => handleNav('terms')} className="hover:underline" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>Terms</button>
                        {' '}and{' '}
                        <button onClick={() => handleNav('privacy')} className="hover:underline" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>Privacy Policy</button>.
                      </p>

                      <button onClick={handleSendOtp} disabled={regLoad}
                        className="w-full text-white text-sm font-bold py-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: '#FF653F' }}
                        onMouseOver={e => !regLoad && (e.currentTarget.style.background = '#e5512f')}
                        onMouseOut={e => !regLoad && (e.currentTarget.style.background = '#FF653F')}>
                        {regLoad ? <><Spinner /> Creating account…</> : 'Create free account'}
                      </button>

                      <p className="text-center text-xs text-gray-500">
                        Already have an account?{' '}
                        <button onClick={() => setTab('login')} className="font-semibold hover:underline" style={{ color: '#FF653F', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Login
                        </button>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
