import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { supabase }        from './supabase.js'
import { useSEO }          from './useSEO.js'

import { handleCheckoutReturn } from './payments.js'
import { checkHealth, syncSubscriptions } from './api.js'
import { toast }            from './toast.js'
import Navbar              from './components/Navbar.jsx'
import Footer              from './components/Footer.jsx'
import ToastHost           from './components/ToastHost.jsx'
import CookieConsent       from './components/CookieConsent.jsx'
import InstallPrompt       from './components/InstallPrompt.jsx'

// Landing page loads eagerly (first paint); everything else is code-split and
// loaded on demand so the initial bundle stays tiny and the site loads fast.
import LandingPage         from './pages/LandingPage.jsx'
const AboutPage          = lazy(() => import('./pages/AboutPage.jsx'))
const CoursesPage        = lazy(() => import('./pages/CoursesPage.jsx'))
const ContactPage        = lazy(() => import('./pages/ContactPage.jsx'))
const PrivacyPage        = lazy(() => import('./pages/PrivacyPage.jsx'))
const TermsPage          = lazy(() => import('./pages/TermsPage.jsx'))
const RefundPage         = lazy(() => import('./pages/RefundPage.jsx'))
const DisclaimerPage     = lazy(() => import('./pages/DisclaimerPage.jsx'))
const CookiesPage        = lazy(() => import('./pages/CookiesPage.jsx'))
const CutoffsPage        = lazy(() => import('./pages/CutoffsPage.jsx'))
const PreviousPapersPage = lazy(() => import('./pages/PreviousPapersPage.jsx'))
const ExamsPage          = lazy(() => import('./pages/ExamsPage.jsx'))
const BlogPage           = lazy(() => import('./pages/BlogPage.jsx'))
const AuthScreen         = lazy(() => import('./pages/AuthScreen.jsx'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage.jsx'))
const AdminPage          = lazy(() => import('./pages/AdminPage.jsx'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage.jsx'))
const Dashboard          = lazy(() => import('./pages/Dashboard.jsx'))
const PracticePage       = lazy(() => import('./pages/PracticePage.jsx'))
const PredictionExplainer= lazy(() => import('./pages/PredictionExplainer.jsx'))
const HomeScreen         = lazy(() => import('./pages/HomeScreen.jsx'))
const ExamScreen         = lazy(() => import('./pages/ExamScreen.jsx'))
const ResultScreen       = lazy(() => import('./pages/ResultScreen.jsx'))
const OnboardingWizard   = lazy(() => import('./pages/OnboardingWizard.jsx'))
const PaymentComingSoon  = lazy(() => import('./pages/PaymentComingSoon.jsx'))
const TopicPractice      = lazy(() => import('./pages/TopicPractice.jsx'))
const USExamsPage             = lazy(() => import('./pages/USExamsPage.jsx'))
const USPredictionExplainer   = lazy(() => import('./pages/USPredictionExplainer.jsx'))
const USResultScreen          = lazy(() => import('./pages/USResultScreen.jsx'))
const CurrentAffairsPage      = lazy(() => import('./pages/CurrentAffairsPage.jsx'))
const SyllabusPage            = lazy(() => import('./pages/SyllabusPage.jsx'))
const ExamDatesPage           = lazy(() => import('./pages/ExamDatesPage.jsx'))

// Sections rendered by the LandingPage (single-page tabs)
const LANDING_TABS  = ['home','about','success','career']
const PUBLIC_PAGES  = [
  ...LANDING_TABS,
  'courses','contact','privacy','terms','refund','disclaimer','cookies',
  'auth','cutoffs','papers',
  'exams','exams-banking','exams-insurance','exams-ssc','exams-railway','exams-engineering','exams-medical',
  'blog','us-exams','us-score-prediction','current-affairs','syllabus','exam-dates',
]

// Real URL path ↔ page name mapping (enables indexable URLs for each page)
const PAGE_PATH = {
  home:'/', about:'/about', success:'/success', career:'/career', blog:'/blog',
  courses:'/courses', contact:'/contact', privacy:'/privacy', terms:'/terms',
  refund:'/refund', disclaimer:'/disclaimer', cookies:'/cookies',
  cutoffs:'/cutoffs', papers:'/papers', exams:'/exams',
  'exams-banking':'/exams/banking', 'exams-insurance':'/exams/insurance',
  'exams-ssc':'/exams/ssc', 'exams-railway':'/exams/railway',
  'exams-engineering':'/exams/engineering', 'exams-medical':'/exams/medical',
  auth:'/auth', 'reset-password':'/reset-password',
  dashboard:'/dashboard', practice:'/practice', 'topic-practice':'/topic-practice', examhome:'/examhome',
  exam:'/exam', result:'/result', payment:'/payment',
  admin:'/admin', 'how-prediction-works':'/how-prediction-works',
  'us-exams':'/us-exams', 'us-score-prediction':'/us-score-prediction',
  'current-affairs':'/current-affairs',
  'syllabus':'/syllabus', 'exam-dates':'/exam-dates',
}
const PATH_PAGE = Object.fromEntries(Object.entries(PAGE_PATH).map(([k,v]) => [v,k]))
const pathToPage = (p) => PATH_PAGE[p] || (p === '/' ? 'home' : null)
const pageToPath = (p) => PAGE_PATH[p] || '/'
const IDLE_TIMEOUT  = 15 * 60 * 1000
const IDLE_WARNING  = 60 * 1000

export default function App() {
  const [page,        setPage]        = useState(() => pathToPage(window.location.pathname) || 'home')
  useSEO(page)
  const [user,        setUser]        = useState(null)
  const [userRole,    setUserRole]    = useState('student')
  const [testData,    setTestData]    = useState(null)
  const [resultData,  setResultData]  = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [startMode,   setStartMode]   = useState('mock')
  const [startExamId, setStartExamId] = useState('')
  const [planData,    setPlanData]    = useState(null)
  const [paymentPlan, setPaymentPlan] = useState(null)
  const [dashTab,     setDashTab]     = useState('home')

  const [idleWarning, setIdleWarning] = useState(false)
  const idleTimer    = useRef(null)
  const warningTimer = useRef(null)
  const skipPushRef    = useRef(false)
  const historyMounted = useRef(false)
  const pendingNavRef    = useRef(null)
  const navClaimedRef   = useRef(false)  // first handler to navigate after login claims this
  const regionSavedRef  = useRef(false)  // prevent duplicate updateUser calls per session

  // Save the destination before redirecting to auth.
  // sessionStorage persists across OAuth page redirects; the ref covers same-session logins.
  const _savePendingNav = (target, examId, region) => {
    const v = { target, examId: examId || null, region: region || null }
    pendingNavRef.current = v
    navClaimedRef.current = false
    try { sessionStorage.setItem('postAuthNav', JSON.stringify(v)) } catch {}
  }

  const _consumePendingNav = () => {
    const fromRef = pendingNavRef.current
    if (fromRef) {
      pendingNavRef.current = null
      try { sessionStorage.removeItem('postAuthNav') } catch {}
      return fromRef
    }
    try {
      const raw = sessionStorage.getItem('postAuthNav')
      if (raw) { sessionStorage.removeItem('postAuthNav'); return JSON.parse(raw) }
    } catch {}
    return null
  }

  // Peek at the pending nav without consuming it (used before _navigateOnce eats it).
  const _peekPendingNav = () => {
    if (pendingNavRef.current) return pendingNavRef.current
    try {
      const raw = sessionStorage.getItem('postAuthNav')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  // Tag the user's exam region in Supabase metadata once per session.
  // Call BEFORE _navigateOnce so the pending nav hasn't been consumed yet.
  // Rule: always save when exam_region is unset; overwrite only when the pending
  // context is explicitly 'us' (e.g. user just logged in from the US Exams page).
  const _saveExamRegion = (u) => {
    if (regionSavedRef.current) return
    const existingRegion = u?.user_metadata?.exam_region
    const pending = _peekPendingNav()
    const pendingRegion = pending?.region
    if (!existingRegion || pendingRegion === 'us') {
      regionSavedRef.current = true
      const regionToSave = pendingRegion || 'in'
      supabase.auth.updateUser({ data: { exam_region: regionToSave } }).then(({ data }) => {
        if (data?.user) setUser(data.user)
      })
    }
  }

  // First handler to navigate after login claims navClaimedRef.
  // Subsequent handlers (handleAuth, onAuthStateChange, getSession) skip.
  const _navigateOnce = (u) => {
    if (navClaimedRef.current) return
    navClaimedRef.current = true
    const pending = _consumePendingNav()
    if (pending) {
      if (pending.target === 'mocktest') {
        setStartMode('mock'); setStartExamId(pending.examId || ''); setPage('examhome')
      } else {
        setPage(pending.target)
      }
      window.scrollTo(0, 0)
    } else {
      setDashTab('home'); setPage(resolvePostAuthPage(u))
    }
  }

  const clearTimers = useCallback(() => {
    if (idleTimer.current)    clearTimeout(idleTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)
  }, [])

  const handleLogout = useCallback(async () => {
    clearTimers()
    setIdleWarning(false)
    await supabase.auth.signOut()
    setUser(null)
    setUserRole('student')
    setPlanData(null)
    setDashTab('home')
    navClaimedRef.current = false
    regionSavedRef.current = false
    setPage('home')
  }, [clearTimers])

  // Fetch role from user_roles table whenever the logged-in user changes.
  // Falls back to 'student' on any error so the app never breaks.
  useEffect(() => {
    if (!user) { setUserRole('student'); return }
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => setUserRole(data?.role || 'student'))
      .catch(() => setUserRole('student'))
  }, [user?.id])

  const resetIdleTimer = useCallback(() => {
    if (!user) return
    clearTimers()
    setIdleWarning(false)
    warningTimer.current = setTimeout(() => setIdleWarning(true), IDLE_TIMEOUT - IDLE_WARNING)
    idleTimer.current    = setTimeout(() => handleLogout(),       IDLE_TIMEOUT)
  }, [user, clearTimers, handleLogout])

  // Warm up the backend on first load (Render free tier sleeps). Fire-and-forget
  // so the cold start overlaps with the user reading the page, not their first action.
  useEffect(() => { checkHealth().catch(() => {}) }, [])

  useEffect(() => {
    if (!user) { clearTimers(); setIdleWarning(false); return }
    const EVENTS = ['mousemove','mousedown','keydown','scroll','touchstart','click']
    EVENTS.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))
    resetIdleTimer()
    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, resetIdleTimer))
      clearTimers()
    }
  }, [user, resetIdleTimer, clearTimers])

  useEffect(() => {
    const hash = window.location.hash
    // ONLY a password-recovery link should open the reset page. A normal
    // login/OAuth redirect also carries access_token in the hash — treating
    // that as recovery wrongly forced the reset page (and re-fired on Back).
    if (hash.includes('type=recovery')) {
      setPage('reset-password')
      setAuthChecked(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      const onAuthPage = window.location.pathname === '/auth' || window.location.hash === '#/auth'
      if (!onAuthPage && data.session?.user && data.session.user.email_confirmed_at) {
        const u = data.session.user
        setUser(u)
        _saveExamRegion(u)
        _navigateOnce(u)
      } else if (onAuthPage && data.session) {
        // User is on the auth page — clear any stale session so they get a fresh start
        supabase.auth.signOut().catch(() => {})
      }
      setAuthChecked(true)
      // Strip any leftover auth token from the URL so pressing Back can't
      // re-trigger auth handling / show a stale page.
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
        try { window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search) } catch {}
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // On the auth page: auth events from background refreshes / stale sessions must never
      // auto-navigate. The auth page handles navigation explicitly via onAuth() callback.
      const onAuthPage = window.location.pathname === '/auth'
      if (onAuthPage) {
        if (!session) { setUser(null); navClaimedRef.current = false; regionSavedRef.current = false }
        return
      }
      // Skip INITIAL_SESSION — getSession() handles the initial restore
      if (event === 'INITIAL_SESSION') return
      if (session?.user) {
        // Skip navigation for unconfirmed signups — let OTP flow handle it
        if (!session.user.email_confirmed_at) return
        setUser(session.user)
        _saveExamRegion(session.user)
        _navigateOnce(session.user)
      } else {
        setUser(null)
        navClaimedRef.current = false
        regionSavedRef.current = false
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const resolvePostAuthPage = (u) => {
    const region = u?.user_metadata?.exam_region
    if (region === 'us') return 'us-exams'
    return 'dashboard'
  }

  // Failsafe for Google OAuth redirect: after OAuth the page lands at http://localhost:3000/
  // (page='home'). If the async Supabase handlers haven't fired _navigateOnce yet,
  // this effect catches it once authChecked=true and user is set.
  // navClaimedRef guards against double-navigation — if _navigateOnce already ran, this skips.
  useEffect(() => {
    if (!authChecked || !user || page !== 'home') return
    _saveExamRegion(user)
    _navigateOnce(user)
  }, [authChecked, user?.id, page])  // eslint-disable-line react-hooks/exhaustive-deps

  // Reconcile the plan from the authoritative subscriptions table (the DB is the
  // source of truth). If there's an active, non-expired subscription → stamp it
  // into the user's metadata; if there is NONE but metadata still claims a plan
  // → clear it (so an expired/removed subscription downgrades correctly).
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        // Self-heal: verify any paid-but-pending sessions against Stripe first.
        try { await syncSubscriptions(user.id) } catch {}
        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan, period_end')
          .eq('user_id', user.id).eq('status', 'active')
          .order('period_end', { ascending: false }).limit(1)
        if (cancelled || error) return   // on a read error, never change the plan

        const row    = data && data[0]
        const active = row && (!row.period_end || new Date(row.period_end) > new Date())
        const meta   = user.user_metadata || {}
        const curPlan = (meta.plan || meta.subscription || '').toLowerCase()
        const isProNow = curPlan && !['free', '', 'none'].includes(curPlan)

        if (active) {
          // Stamp only if it differs (avoids needless updates / loops).
          if (curPlan !== row.plan || meta.plan_expires !== row.period_end) {
            const { data: upd } = await supabase.auth.updateUser({ data: {
              plan: row.plan, subscription: row.plan, plan_expires: row.period_end,
            }})
            if (!cancelled && upd?.user) setUser(upd.user)
          }
        } else if (isProNow) {
          // No active subscription in the DB → downgrade the cached metadata.
          const { data: upd } = await supabase.auth.updateUser({ data: {
            plan: 'free', subscription: 'free', plan_expires: null,
          }})
          if (!cancelled && upd?.user) setUser(upd.user)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [user])

  // After returning from Stripe Checkout, verify the session and activate the plan.
  useEffect(() => {
    if (!user) return
    if (!window.location.search.includes('sub=')) return
    handleCheckoutReturn(user).then(res => {
      if (res?.ok) {
        setDashTab('subscriptions')
        setPage('dashboard')
        toast(`Payment successful! Your ${res.plan} plan is now active.`, 'success')
      } else if (res?.cancelled) {
        setDashTab('subscriptions')
        setPage('dashboard')
        toast('Payment cancelled — no charge was made. You can try again anytime.', 'info')
      } else if (res?.pending) {
        setDashTab('subscriptions')
        setPage('dashboard')
        toast('Payment received! Your plan is being activated — this can take a minute. Refresh if it doesn’t appear shortly.', 'info')
      } else if (res?.error) {
        toast(res.error, 'error')
      }
    })
  }, [user])

  // ── Browser Back/Forward support ─────────────────────────────────────
  // The app is a single-URL state machine, so without this the browser Back
  // button just leaves the site. We push a history entry on each page change
  // and restore the page on popstate. Data-dependent screens (exam/result)
  // fall back to a safe page so Back can never land on a blank/crashing view.
  useEffect(() => {
    const onPop = (e) => {
      const target = e.state?.appPage || pathToPage(window.location.pathname)
      skipPushRef.current = true
      // Logged in: Back always returns to the Dashboard (never a blank/loading
      // page or a stranded public/test screen).
      if (user) { setPage('dashboard'); return }
      // Logged out: restore the previous page, else Home.
      setPage(target || 'home')
    }
    window.addEventListener('popstate', onPop)
    // seed state on the current entry so the first Back has somewhere to go
    try { window.history.replaceState({ appPage: page }, '', pageToPath(page)) } catch {}
    return () => window.removeEventListener('popstate', onPop)
  }, [user, testData, resultData])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!historyMounted.current) { historyMounted.current = true; return }
    if (skipPushRef.current) { skipPushRef.current = false; return }  // change came from Back
    try { window.history.pushState({ appPage: page }, '', pageToPath(page)) } catch {}
  }, [page])

  // ── Free-trial gating ───────────────────────────────────────────────
  // After 7 days, a non-subscribed user can browse but cannot take tests.
  const userPlan     = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
  const isProUser    = !['free','','none'].includes(userPlan)
  const trialDaysUsed= user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) : 0
  const trialExpired = !!user && !isProUser && trialDaysUsed >= 7
  const guardTrial = () => {
    if (trialExpired) {
      setDashTab('subscriptions'); setPage('dashboard'); window.scrollTo(0,0)
      toast('Your 7-day free trial has ended. Subscribe to Pro or Ultimate to keep taking tests.', 'info')
      return false
    }
    return true
  }

  const nav = (target, examId) => {
    const publicList = [...LANDING_TABS,'courses','contact','privacy','terms','auth','practice','cutoffs','papers','exams','exams-banking','exams-insurance','exams-ssc','exams-railway','exams-engineering','exams-medical','blog','us-exams','us-score-prediction','current-affairs','examhome','syllabus','exam-dates']

    // US-region users: block only pure Indian exam category pages.
    // Dashboard, Study Planner, Results, Subscriptions, Profile, Settings, Billing are shared.
    if (user?.user_metadata?.exam_region === 'us') {
      const indiaOnlyTargets = ['exams','exams-banking','exams-insurance','exams-ssc','exams-railway','exams-engineering','exams-medical','cutoffs','papers']
      if (indiaOnlyTargets.includes(target)) {
        setPage('us-exams'); window.scrollTo(0, 0); return
      }
      // Launching a mock/topic test without a SAT id → treat as sat_full
      if (target === 'mocktest' && !examId?.startsWith('sat_')) {
        setStartMode('mock'); setStartExamId('sat_full'); setPage('examhome'); window.scrollTo(0, 0); return
      }
    }

    // When user clicks "Sign In" from us-exams, preserve that context so
    // they return to the US Exams page (not the generic dashboard) after login.
    if (target === 'auth' && !user && page === 'us-exams') {
      _savePendingNav('us-exams', null, 'us')
    }


    if (!user && !publicList.includes(target)) {
      const region = (page === 'us-exams' || (examId && examId.startsWith('sat_'))) ? 'us' : 'in'
      _savePendingNav(target, examId, region)
      setPage('auth')
      return
    }
    if (target === 'mocktest' && !guardTrial()) return

    // Dashboard inner tabs reached from other pages (e.g. Practice sidebar)
    const DASH_TABS = { results:'results', planner:'studyplan', studyplan:'studyplan',
                        subscriptions:'subscriptions', profile:'profile', settings:'settings',
                        explore:'explore', billing:'billing' }
    if (DASH_TABS[target]) {
      setDashTab(DASH_TABS[target]); setPage('dashboard'); window.scrollTo(0, 0); return
    }
    if (target === 'dashboard') { setDashTab('home') }

    if (target === 'mocktest') {
      if (user) {
        setStartMode('mock')
        setStartExamId(examId || '')
        setPage('examhome')
      } else {
        setPage('auth')
      }
      window.scrollTo(0, 0)
      return
    }
    window.scrollTo(0, 0)
    setPage(target)
  }

  const handleAuth = (u) => {
    setUser(u)
    _saveExamRegion(u)
    _navigateOnce(u)
  }

  const handleOnboardingDone = (wizardOutput) => {
    setPlanData(wizardOutput)
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
    setPage('dashboard')
  }

  const handleOnboardingSkip = () => setPage('dashboard')

  const startTest  = (data) => { if (!guardTrial()) return; setTestData(data); setPage('exam') }
  const showResult = async (data) => {
    setResultData(data)
    setPage('result')
    if (user) {
      try {
        const payload = {
          student_id:    user.id,
          exam:          data.exam          || 'bank_clerk_prelims',
          total_score:   Number(data.score         || 0),
          max_score:     Number(data.max_score      || 0),
          percentage:    Number(data.percentage     || 0),
          correct_count: Number(data.correct_count  || 0),
          wrong_count:   Number(data.wrong_count    || 0),
          skipped_count: Number(data.skipped_count  || 0),
          section_scores: data.section_stats || {},
          topic_scores:   {},
          weak_topics:    data.weak_topics   || [],
          strong_topics:  data.strong_topics || [],
          ai_feedback:    data.ai_feedback   || '',
          exam_readiness: Number(data.exam_readiness || 0),
          test_id_str:    data.test_id       || '',
          result_json:    data,               // full result for re-opening later
        }
        let { error } = await supabase.from('results').insert(payload)
        if (error && /result_json/.test(error.message || '')) {
          // DB doesn't have result_json yet — save the summary so history isn't lost
          const { result_json, ...summary } = payload
          ;({ error } = await supabase.from('results').insert(summary))
          if (!error) console.warn('Saved result WITHOUT result_json — run the migration to enable question review.')
        }
        if (error) console.error('Save result error:', error.message)
        else if (import.meta.env.DEV) console.log('✓ Result saved:', data.exam)
      } catch(e) {
        console.error('Save result exception:', e.message)
      }
    }
  }

  // Re-open a previously saved attempt (review mode) from history
  const openSavedResult = (row) => {
    const full = row?.result_json
    if (full && typeof full === 'object') {
      setResultData(full)
    } else {
      // Old attempts saved before result_json existed — show summary only
      setResultData({
        exam: row.exam, score: row.total_score, max_score: row.max_score,
        percentage: row.percentage, correct_count: row.correct_count,
        wrong_count: row.wrong_count, skipped_count: row.skipped_count,
        weak_topics: row.weak_topics || [], strong_topics: row.strong_topics || [],
        ai_feedback: row.ai_feedback || '', exam_readiness: row.exam_readiness || 0,
        question_results: [], _noDetail: true,
      })
    }
    window.scrollTo(0, 0)
    setPage('result')
  }

  const goHome = () => { setTestData(null); setResultData(null); setPage('dashboard') }

  const userName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Student'

  const isPublic = PUBLIC_PAGES.includes(page)

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{background:'#FF653F'}}>
            <span className="text-white font-bold text-sm">MT</span>
          </div>
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{borderColor:'#FF653F',borderTopColor:'transparent'}}></div>
        </div>
      </div>
    )
  }

  const appEnv = import.meta.env.VITE_APP_ENV

  return (
    <div className="min-h-screen flex flex-col">

      {/* Staging environment banner — only visible on non-production builds */}
      {appEnv && appEnv !== 'production' && (
        <div style={{ background: appEnv === 'staging' ? '#7c3aed' : '#1d4ed8', color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '4px 16px', letterSpacing: '.05em', zIndex: 9998, position: 'relative' }}>
          {appEnv === 'staging' ? '⚠ STAGING BUILD — not for public use' : 'DEV BUILD — localhost'}
        </div>
      )}

      {/* Idle warning banner */}
      {idleWarning && user && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-5 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">⏱</span>
            <span className="text-sm font-semibold">
              You've been inactive for a while. You'll be logged out in 60 seconds to keep your account secure.
            </span>
          </div>
          <button onClick={resetIdleTimer}
            className="flex-shrink-0 bg-white text-amber-600 text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-amber-50 transition-colors ml-4">
            Stay Logged In
          </button>
        </div>
      )}

      {isPublic && page !== 'auth' && page !== 'us-exams' && !page.startsWith('exams') && page !== 'cutoffs' && page !== 'papers' && (
        <Navbar currentPage={page} onNav={nav} user={user} onLogout={handleLogout} userRole={userRole} />
      )}

      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor:'#fed7c2', borderTopColor:'#FF653F' }}/>
          </div>
        }>
        {LANDING_TABS.includes(page) && <LandingPage key={page} onNav={nav} initialTab={page} />}
        {page === 'courses'        && <CoursesPage        onNav={nav} />}
        {page === 'contact'        && <ContactPage />}
        {page === 'privacy'        && <PrivacyPage />}
        {page === 'terms'          && <TermsPage />}
        {page === 'refund'         && <RefundPage />}
        {page === 'disclaimer'     && <DisclaimerPage />}
        {page === 'cookies'        && <CookiesPage />}
        {page === 'cutoffs'        && <CutoffsPage onNav={nav} user={user} onLogout={handleLogout} />}
        {page === 'papers'         && <PreviousPapersPage onNav={nav} user={user} onLogout={handleLogout} />}
        {page === 'exams'              && <ExamsPage onNav={nav} isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'exams-banking'     && <ExamsPage onNav={nav} category="banking"     isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'exams-insurance'   && <ExamsPage onNav={nav} category="insurance"   isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'exams-ssc'         && <ExamsPage onNav={nav} category="ssc"         isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'exams-railway'     && <ExamsPage onNav={nav} category="railway"     isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'exams-engineering' && <ExamsPage onNav={nav} category="engineering" isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'exams-medical'     && <ExamsPage onNav={nav} category="medical"     isAdmin={userRole === 'super_admin'} user={user} onLogout={handleLogout} />}
        {page === 'blog'              && <BlogPage onNav={nav} />}
        {page === 'us-exams'          && <USExamsPage onNav={nav} user={user} onLogout={handleLogout} />}
        {page === 'current-affairs'   && <CurrentAffairsPage onNav={nav} />}
        {page === 'syllabus'          && <SyllabusPage onNav={nav} />}
        {page === 'exam-dates'        && <ExamDatesPage onNav={nav} />}
        {page === 'auth'           && <AuthScreen onAuth={handleAuth} onBack={() => setPage('home')} onNav={nav} />}
        {page === 'reset-password' && <ResetPasswordPage onBack={() => setPage('auth')} />}
        {page === 'payment'        && (
          <PaymentComingSoon
            plan={paymentPlan || 'intermediate'}
            onBack={() => setPage('dashboard')}
          />
        )}
        {page === 'dashboard'      && (
          <Dashboard
            user={user}
            isAdmin={userRole === 'super_admin'}
            planData={planData}
            initialTab={dashTab}
            examRegion={user?.user_metadata?.exam_region || 'in'}
            onStartTest={(mode, examId) => {
              if (!guardTrial()) return
              setStartMode(mode || 'mock')
              setStartExamId(examId || '')
              setPage('examhome')
            }}
            onLogout={handleLogout}
            onNav={nav}
            onOpenResult={openSavedResult}
          />
        )}
        {page === 'practice'       && (
          <PracticePage
            user={user}
            isAdmin={userRole === 'super_admin'}
            onStartTest={(mode, examId) => {
              if (!guardTrial()) return
              setStartMode(mode || 'mock')
              setStartExamId(examId || '')
              setPage('examhome')
            }}
            onLogout={handleLogout}
            onNav={nav}
          />
        )}
        {page === 'topic-practice' && (
          <TopicPractice
            onBack={() => setPage('dashboard')}
            onStartTest={(mode, engineKey, options) => {
              if (!guardTrial()) return
              setStartMode('topic')
              setStartExamId(engineKey || '')
              setPage('examhome')
            }}
            studentScores={{}}
          />
        )}
        {page === 'examhome'       && (
          <HomeScreen
            studentName={userName}
            user={user}
            onStart={startTest}
            onBack={() => setPage('dashboard')}
            onNav={nav}
            onLogout={handleLogout}
            startMode={startMode}
            startExamId={startExamId}
          />
        )}
        {page === 'exam'           && (
          <ExamScreen
            testData={testData}
            studentName={userName}
            onResult={showResult}
            onExit={goHome}
          />
        )}
        {page === 'result'         && (
          user?.user_metadata?.exam_region === 'us'
            ? <USResultScreen
                result={resultData}
                studentName={userName}
                onRetry={() => setPage('examhome')}
                onHome={() => setPage('us-exams')}
                onStartTest={startTest}
                user={user}
              />
            : <ResultScreen
                result={resultData}
                studentName={userName}
                onRetry={() => setPage('examhome')}
                onHome={() => setPage('dashboard')}
                onStartTest={startTest}
                user={user}
              />
        )}
        {page === 'admin'          && (userRole === 'super_admin'
          ? <AdminPage onBack={() => setPage('dashboard')} />
          : (() => { nav('dashboard'); return null })()
        )}
		{page === 'how-prediction-works' && <PredictionExplainer />}
        {page === 'us-score-prediction' && <USPredictionExplainer />}
        {![
          ...LANDING_TABS,
          'courses','contact','privacy','terms','cutoffs','papers',
          'exams','exams-banking','exams-insurance','exams-ssc','exams-railway','exams-engineering','exams-medical',
          'blog',
          'auth','reset-password','payment','dashboard','practice','topic-practice','examhome','exam',
          'result','admin','how-prediction-works','us-exams','us-score-prediction','current-affairs',
        ].includes(page) && <NotFoundPage onNav={nav} />}
        </Suspense>
      </main>

      {isPublic && page !== 'auth' && page !== 'dashboard' && !page.startsWith('exams') && page !== 'cutoffs' && page !== 'papers' && <Footer onNav={nav} />}
      <CookieConsent />
      <ToastHost />
      <InstallPrompt />

      {/* ── Floating WhatsApp button ── */}
      <style>{`
        .wa-float-text{display:inline}
        @media(max-width:640px){
          .wa-float{padding:13px!important;border-radius:50%!important}
          .wa-float-text{display:none!important}
        }
        @media(prefers-reduced-motion:reduce){
          .wa-float{transition:none!important}
        }
      `}</style>
      <a
        href="https://wa.me/919490284208"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        style={{
          position:'fixed', bottom:'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))', right:24, zIndex:9999,
          display:'flex', alignItems:'center', gap:10,
          background:'#25D366', color:'#fff',
          borderRadius:999, padding:'12px 20px 12px 14px',
          boxShadow:'0 4px 20px rgba(37,211,102,.45)',
          textDecoration:'none', fontFamily:"'Inter',sans-serif",
          fontSize:15, fontWeight:700, letterSpacing:'.01em',
          transition:'transform .2s, box-shadow .2s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(37,211,102,.55)' }}
        onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(37,211,102,.45)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="wa-float-text">WhatsApp</span>
      </a>
    </div>
  )
}
