import { useState, useEffect, useRef, useCallback } from 'react'
import { submitTest } from '../api.js'
import QuestionContent from '../components/QuestionContent'
// True when running inside a Capacitor native shell (Android/iOS).
// window.Capacitor is injected by the native runtime before web code runs.
const isNative = typeof window !== 'undefined' &&
  typeof window.Capacitor !== 'undefined' &&
  window.Capacitor.isNativePlatform?.() === true
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend,
         ResponsiveContainer } from 'recharts'

const SECTION_COLORS = {
  // Prelims
  english:                        { bg: 'bg-green-600',  light: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  numerical_ability:               { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  reasoning:                       { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  quantitative_aptitude:           { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  // Mains
  general_english:                 { bg: 'bg-green-600',  light: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  english_language:                { bg: 'bg-green-600',  light: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  reasoning_computer_aptitude:     { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  data_analysis_interpretation:    { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  general_financial_awareness:     { bg: 'bg-blue-600',   light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
  general_economy_banking:         { bg: 'bg-blue-600',   light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
  // Coal India / Other
  general_knowledge:               { bg: 'bg-blue-600',   light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
  general_studies_1:               { bg: 'bg-blue-600',   light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
  csat:                            { bg: 'bg-teal-600',   light: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700'   },
}
const SECTION_LABELS = {
  // Prelims
  english:                        'English',
  numerical_ability:               'Numerical',
  reasoning:                       'Reasoning',
  quantitative_aptitude:           'Quantitative',
  general_knowledge:               'Gen. Knowledge',
  // Mains
  general_english:                 'English',
  english_language:                'English',
  reasoning_computer_aptitude:     'Reasoning & CA',
  data_analysis_interpretation:    'Data Analysis',
  general_financial_awareness:     'GK & Finance',
  general_economy_banking:         'Economy & Banking',
  // Others
  general_studies_1:               'Gen. Studies',
  csat:                            'CSAT',
  general_intelligence:            'Gen. Intelligence',
  general_awareness:               'Gen. Awareness',
  engineering_mathematics:         'Engg. Maths',
  computer_science:                'Computer Science',
}

// Get short label for any section
const getSectionLabel = (sec) => {
  if (!sec) return ''
  return SECTION_LABELS[sec] || sec.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0,16)
}

// Chart colors for DI questions
const CHART_COLORS = ['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444']

const MAX_VIOLATIONS = 5   // auto-submit after this many violations

// Renders bar/line/pie chart for DI questions
function ChartBlock({ question }) {
  const meta = question.metadata || {}
  if (meta.render_type !== 'chart') return null

  const { chart_type, chart_title, chart_data,
          chart_x_label, chart_y_label } = meta

  if (!chart_data || chart_data.length === 0) return null

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <p className="text-sm font-semibold text-center text-gray-700 mb-2">
        {chart_title}
      </p>
      {chart_type === 'bar' && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chart_data} margin={{top:5,right:20,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{fontSize:11}}
              label={chart_x_label ? {value:chart_x_label,position:'insideBottom',offset:-2,fontSize:11} : undefined} />
            <YAxis tick={{fontSize:11}}
              label={chart_y_label ? {value:chart_y_label,angle:-90,position:'insideLeft',fontSize:11} : undefined} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {chart_type === 'line' && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chart_data} margin={{top:5,right:20,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{fontSize:11}} />
            <YAxis tick={{fontSize:11}} />
            <Tooltip />
            <Line type="monotone" dataKey="value"
              stroke="#4f46e5" strokeWidth={2} dot={{r:3}} />
          </LineChart>
        </ResponsiveContainer>
      )}
      {chart_type === 'pie' && (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chart_data} dataKey="value" nameKey="name"
              cx="50%" cy="50%" outerRadius={80}
              label={({name,value}) => name + ' ' + value + '%'}>
              {chart_data.map((_,i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function ExamScreen({ testData, studentName, onResult, onExit }) {
  // Flatten all questions into one list with section info
  const allQuestions = testData.sections
    ? Object.entries(testData.sections).flatMap(([sec, data]) =>
        (data.questions || []).map(q => ({ ...q, section: sec }))
      ).sort((a, b) => a.question_number - b.question_number)
    : []

  const totalQ          = allQuestions.length
  const totalSecs       = (testData.total_time_mins || 60) * 60

  // ── Section time limits ─────────────────────────────────────
  // Each section has its own 20-min countdown
  // When section timer hits 0 → auto-move to next section
  const getSectionSecs = (sec) => {
    const sData = testData.sections?.[sec]
    return ((sData?.time_mins) || 20) * 60
  }

  const [currentIdx,    setCurrentIdx]    = useState(0)
  const [answers,       setAnswers]       = useState({})        // qnum -> 'A'|'B'|'C'|'D'
  const [timeSpent,     setTimeSpent]     = useState({})        // qnum -> ms
  const [marked,        setMarked]        = useState({})        // qnum -> bool
  const [visited,       setVisited]       = useState({ 1: true })
  const [secsLeft,      setSecsLeft]      = useState(totalSecs)
  const [secTimers,     setSecTimers]     = useState(() => {
    // Initialise per-section countdown from blueprint time_mins
    const t = {}
    Object.keys(testData.sections || {}).forEach(sec => { t[sec] = getSectionSecs(sec) })
    return t
  })
  const [secTimerActive, setSecTimerActive] = useState(true)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState('')
  const [isOffline,     setIsOffline]     = useState(!navigator.onLine)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [activeSection, setActiveSection] = useState(Object.keys(testData.sections || {})[0])

  // ── Anti-cheating state ────────────────────────────────────────
  const [violations,   setViolations]   = useState(0)
  const [violationMsg, setViolationMsg] = useState('')
  const violationsRef    = useRef(0)    // tracks violation count
  const examStartedRef   = useRef(false) // grace period - 3s after start

  const questionStartRef = useRef(Date.now())
  const timerRef         = useRef(null)
  const currentQ         = allQuestions[currentIdx] || {}
  const qNum             = currentQ.question_number

  // Timestamp-based timer state — survives setInterval pauses on background/resume.
  // timerEpochRef: the wall-clock time when this epoch began.
  // timerBaseRef:  the secs remaining at that epoch start.
  // When the app resumes from background, the next interval tick automatically
  // calculates the correct remaining time using Date.now() - timerEpochRef.
  const timerEpochRef = useRef(Date.now())
  const timerBaseRef  = useRef(totalSecs)

  // Epoch for the currently-ticking section: { sec, base (secs), epoch (ms) }.
  // Set when a section becomes active; cleared on section change or unmount.
  const secEpochRef = useRef(null)

  // ── addViolation helper ──────────────────────────────────────
  // Safe to call from any useEffect — no stale closure issues
  const addViolation = useCallback((msg) => {
    const newV = violationsRef.current + 1
    violationsRef.current = newV
    setViolations(newV)  // this triggers the useEffect above when >= MAX_VIOLATIONS
    if (newV < MAX_VIOLATIONS) {
      setViolationMsg(`${msg} Violation ${newV}/${MAX_VIOLATIONS}.`)
      setTimeout(() => setViolationMsg(''), 5000)
    } else {
      setViolationMsg(`⚠ Exam will be submitted: ${MAX_VIOLATIONS} violations reached.`)
    }
  }, [])

  // Countdown timer — timestamp-based so it survives setInterval suspension on background.
  // Polls every 500ms; each tick re-derives remaining time from Date.now() rather than
  // accumulating decrements, so a backgrounded app loses the correct time on resume.
  useEffect(() => {
    const grace = setTimeout(() => { examStartedRef.current = true }, 3000)
    timerEpochRef.current = Date.now()
    timerBaseRef.current  = totalSecs
    timerRef.current = setInterval(() => {
      const elapsed    = Math.floor((Date.now() - timerEpochRef.current) / 1000)
      const remaining  = Math.max(0, timerBaseRef.current - elapsed)
      setSecsLeft(remaining)
      if (remaining <= 0) clearInterval(timerRef.current)
    }, 500)
    return () => { clearInterval(timerRef.current); clearTimeout(grace) }
  }, [])  // eslint-disable-line

  // ── Per-section countdown ────────────────────────────────────
  // Disabled for mini tests (Topic Practice / Section Test)
  // Only active for full mock tests with multiple sections
  const isMini = testData?.is_mini || testData?.test_type === "mini"
  const sectionTimingOn = secTimerActive && !isMini && Object.keys(testData.sections || {}).length > 1
  const testTypeLabel = (() => {
    const t = testData?.test_type || 'full'
    if (t === 'topic_diagnostic' || t === 'concept_mini') return 'Topic Practice'
    if (t === 'mini') {
      const secs = Object.keys(testData.sections || {})
      return secs.length === 1 ? 'Section Test' : 'Topic Practice'
    }
    return 'Full Mock Test'
  })()

  // 1) Timestamp-based — derives remaining from wall-clock, not accumulated decrements.
  //    Background time (OS suspension on Android/iOS, browser tab freeze) is accounted
  //    for automatically: Date.now() advances in wall time regardless of whether the
  //    JS event loop was running. No separate appStateChange correction is needed.
  //    On section switch: cleanup freezes the outgoing section's remaining seconds;
  //    the new effect captures the incoming section's current value as the new base.
  useEffect(() => {
    if (!sectionTimingOn || !activeSection) {
      secEpochRef.current = null
      return
    }
    secEpochRef.current = {
      sec:   activeSection,
      base:  secTimers[activeSection] ?? getSectionSecs(activeSection),
      epoch: Date.now(),
    }
    const id = setInterval(() => {
      const e = secEpochRef.current
      if (!e) return
      const remaining = Math.max(0, e.base - Math.floor((Date.now() - e.epoch) / 1000))
      setSecTimers(prev => {
        if (prev[e.sec] === remaining) return prev   // skip no-op re-renders
        return { ...prev, [e.sec]: remaining }
      })
    }, 500)
    return () => {
      // Freeze remaining time for the outgoing section so the next effect
      // initialises from the correct base when this section becomes active again.
      const e = secEpochRef.current
      if (e) {
        const frozen = Math.max(0, e.base - Math.floor((Date.now() - e.epoch) / 1000))
        setSecTimers(prev => ({ ...prev, [e.sec]: frozen }))
      }
      secEpochRef.current = null
      clearInterval(id)
    }
  }, [activeSection, sectionTimingOn])  // eslint-disable-line

  // 2) When the active section hits 0 → auto-advance to the next un-expired
  //    section (or submit if it was the last). Kept separate so the advance is
  //    a reliable effect, not a side-effect buried in a state updater.
  //    (defined further below, after handleSubmit, to avoid a TDZ on handleSubmit)

  // Online / offline detection
  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  // ── FEATURE 1: Fullscreen on exam start (desktop browser only) ──
  // requestFullscreen() is not available in Capacitor's native WebView.
  // On native the app already occupies the full screen; skip this entirely.
  useEffect(() => {
    if (isNative) return   // native shell — fullscreen is handled by the OS

    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen()
      } catch(e) {
        setViolationMsg('Tip: Press F11 for fullscreen during exam.')
        setTimeout(() => setViolationMsg(''), 4000)
      }
    }
    enterFullscreen()

    const onFSChange = () => {
      if (!document.fullscreenElement && examStartedRef.current) {
        setViolationMsg('⚠ Fullscreen exited — please return to fullscreen to continue.')
        setTimeout(() => setViolationMsg(''), 6000)
      }
    }
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])  // eslint-disable-line

  // ── FEATURE 2: Tab switch / window blur detection ─────────────
  // Strategy by platform:
  //   Desktop browser: visibilitychange + window.blur (original behavior)
  //   iOS Safari:      visibilitychange only (blur fires on swipe-up/control-centre)
  //   Native (Capacitor Android/iOS): skip both — visibilitychange fires on every
  //     home-button press, incoming call, notification shade open, etc., making it
  //     indistinguishable from genuine exam abandonment. The App State listener
  //     above already tracks background/resume for timer correction; we do not
  //     penalise ordinary OS-level interruptions in the native context.
  useEffect(() => {
    if (isNative) return   // native shell — OS interruptions are not violations

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

    const onVisibilityChange = () => {
      if (document.hidden && examStartedRef.current) {
        addViolation('⚠ Tab switch detected! Stay on exam tab.')
      }
    }
    const onBlur = () => {
      if (examStartedRef.current) {
        addViolation('⚠ Window focus lost! Do not switch applications.')
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    if (!isIOS) window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (!isIOS) window.removeEventListener('blur', onBlur)
    }
  }, [])  // eslint-disable-line

  // ── FEATURE 3: Right-click disable ───────────────────────────
  useEffect(() => {
    const onContextMenu = (e) => {
      e.preventDefault()
      setViolationMsg('⚠ Right-click is disabled during the exam.')
      setTimeout(() => setViolationMsg(''), 2000)
    }
    document.addEventListener('contextmenu', onContextMenu)
    return () => document.removeEventListener('contextmenu', onContextMenu)
  }, [])

  // ── FEATURE 4: Copy-paste disable ───────────────────────────
  useEffect(() => {
    const onCopy = (e) => {
      e.preventDefault()
      setViolationMsg('⚠ Copying text is not allowed during the exam.')
      setTimeout(() => setViolationMsg(''), 2000)
    }
    const onPaste = (e) => e.preventDefault()
    const onCut   = (e) => e.preventDefault()
    document.addEventListener('copy',  onCopy)
    document.addEventListener('paste', onPaste)
    document.addEventListener('cut',   onCut)
    return () => {
      document.removeEventListener('copy',  onCopy)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('cut',   onCut)
    }
  }, [])

  // ── Cleanup: exit fullscreen when exam ends (browser only) ──
  useEffect(() => {
    return () => {
      if (!isNative && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  // Track time per question
  useEffect(() => {
    questionStartRef.current = Date.now()
    setVisited(v => ({ ...v, [qNum]: true }))
  }, [currentIdx, qNum])

  const saveTimeForCurrent = useCallback(() => {
    const ms = Date.now() - questionStartRef.current
    setTimeSpent(t => ({ ...t, [qNum]: (t[qNum] || 0) + ms }))
  }, [qNum])

  // A section whose clock has run out is locked — you can't go back into it.
  const isSectionExpired = (sec) => sectionTimingOn && secTimers[sec] === 0

  const goTo = (idx) => {
    const q = allQuestions[idx]
    if (q && isSectionExpired(q.section)) return   // finished section — navigation blocked
    saveTimeForCurrent()
    setCurrentIdx(idx)
    if (q) setActiveSection(q.section)
  }

  const selectAnswer = (opt) => {
    setAnswers(a => ({ ...a, [qNum]: opt }))
  }

  const toggleMark = () => {
    setMarked(m => ({ ...m, [qNum]: !m[qNum] }))
  }

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    saveTimeForCurrent()
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      // Convert question_number keys to strings
      const ans = {}
      const ts  = {}
      Object.entries(answers).forEach(([k, v]) => { ans[String(k)] = v })
      Object.entries(timeSpent).forEach(([k, v]) => { ts[String(k)] = v })
      const result = await submitTest(testData.test_id, ans, ts)
      result.integrity_violations = violationsRef.current
      onResult(result)
    } catch (e) {
      const msg = e.friendlyMessage || 'Submission failed. Please try again.'
      setSubmitError(msg)
      setSubmitting(false)
    }
  }, [testData?.test_id, answers, timeSpent])

  // ── Auto-submit when violations maxed — simple useEffect, no TDZ ──
  useEffect(() => {
    if (violations >= MAX_VIOLATIONS && !submitting) {
      handleSubmit(true)
    }
  }, [violations])  // eslint-disable-line

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (secsLeft === 0 && !submitting) {
      handleSubmit(true)
    }
  }, [secsLeft])  // eslint-disable-line

  // Per-section auto-advance: when the active section's clock reaches 0, jump to
  // the next section that still has time; if none remain, submit the test.
  useEffect(() => {
    if (!sectionTimingOn || !activeSection || submitting) return
    if (secTimers[activeSection] !== 0) return
    const secs    = Object.keys(testData.sections || {})
    const idx     = secs.indexOf(activeSection)
    const nextSec = secs.slice(idx + 1).find(s => (secTimers[s] || 0) > 0)
    if (nextSec) {
      saveTimeForCurrent()
      setActiveSection(nextSec)
      const firstQ = (testData.sections[nextSec]?.questions || [])[0]
      if (firstQ) {
        const qi = allQuestions.findIndex(q => q.question_number === firstQ.question_number)
        if (qi >= 0) setCurrentIdx(qi)
      }
    } else {
      handleSubmit(true)   // last section expired — finish the test
    }
  }, [secTimers, activeSection, sectionTimingOn, submitting])  // eslint-disable-line

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const isLow = secsLeft < 300  // last 5 mins

  // Question palette status
  const getStatus = (q) => {
    const n = q.question_number
    if (answers[n] && marked[n]) return 'answered-marked'
    if (answers[n])              return 'answered'
    if (marked[n])               return 'marked'
    if (visited[n])              return 'visited'
    return 'not-visited'
  }

  const STATUS_STYLE = {
    'answered':         'bg-green-500  text-white border-green-500',
    'answered-marked':  'bg-purple-500 text-white border-purple-500',
    'marked':           'bg-yellow-400 text-white border-yellow-400',
    'visited':          'bg-red-100    text-red-700 border-red-300',
    'not-visited':      'bg-white      text-gray-600 border-gray-300',
  }

  const answeredCount = Object.keys(answers).length
  const sections      = Object.keys(testData.sections || {})

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between gap-2" style={{background:'#111', minHeight:52}}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#FF653F'}}>
            <span className="text-white font-black text-xs">MT</span>
          </div>
          <span className="font-bold text-sm truncate" style={{color:'#fff'}}>{testTypeLabel}</span>
          {violations > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{background:'rgba(239,68,68,.2)',color:'#fca5a5'}}>
              ⚠ {violations}
            </span>
          )}
        </div>
        <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl font-mono font-bold flex-shrink-0
          ${isLow ? 'border border-red-400' : 'border'}`}
          style={isLow ? {background:'rgba(239,68,68,.15)',color:'#fca5a5',borderColor:'rgba(239,68,68,.4)'} : {background:'rgba(255,101,63,.15)',color:'#FF653F',borderColor:'rgba(255,101,63,.3)'}}>
          <span className="text-sm sm:text-base leading-tight">{formatTime(secsLeft)}</span>
          {secTimers[activeSection] !== undefined && (
            <span className={`text-[9px] leading-tight ${secTimers[activeSection] < 120 ? 'text-red-400' : ''}`}
              style={secTimers[activeSection] >= 120 ? {color:'rgba(255,101,63,.7)'} : {}}>
              {getSectionLabel(activeSection)}: {formatTime(secTimers[activeSection])}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!navigator.onLine && (
            <span className="text-xs px-2 py-1 rounded-lg" style={{background:'rgba(239,68,68,.15)',color:'#fca5a5'}}>Offline</span>
          )}
          <button onClick={() => setShowConfirm(true)}
            className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-lg text-white whitespace-nowrap transition-colors"
            style={{background:'#FF653F'}}
            onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
            onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
            Submit
          </button>
        </div>
      </div>

      {/* ── Section tabs ── */}
      <div className="bg-white border-b border-gray-200 px-2 flex gap-0.5 pt-1 overflow-x-auto scrollbar-hide"
        style={{WebkitOverflowScrolling:'touch', touchAction:'pan-x'}}>
        {sections.map(sec => {
          const col          = SECTION_COLORS[sec] || SECTION_COLORS.english
          const sectionData  = testData.sections[sec] || {}
          const sectionQs    = sectionData.questions || []
          const expectedCount = sectionData.expected_count || sectionQs.length
          const secAnswered  = sectionQs.filter(q => answers[q.question_number]).length
          const isShort      = sectionQs.length < expectedCount
          const expired      = isSectionExpired(sec)
          return (
            <button
              key={sec}
              disabled={expired}
              onClick={() => {
                if (expired) return
                const firstQ = sectionQs[0]
                if (firstQ) {
                  const idx = allQuestions.findIndex(q => q.question_number === firstQ.question_number)
                  if (idx >= 0) goTo(idx)
                }
                setActiveSection(sec)
              }}
              title={expired ? 'Time over for this section' : undefined}
              style={{touchAction:'manipulation'}}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap
                ${expired
                  ? 'text-gray-300 border-transparent cursor-not-allowed'
                  : activeSection === sec
                    ? `${col.text} border-current bg-white`
                    : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {getSectionLabel(sec)} ({secAnswered}/{expectedCount})
            </button>
          )
        })}
      </div>

      {/* ── Offline banner ── */}
      {isOffline && (
        <div className="bg-red-600 text-white text-center text-sm py-2 px-4 font-medium">
          ⚠ You are offline. Your answers are saved locally. Reconnect to submit.
        </div>
      )}

      {/* ── FEATURE 5: Violation warning banner ── */}
      {violationMsg && (
        <div className="bg-red-600 text-white text-sm font-medium py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-pulse">
          <span>{violationMsg}</span>
          {violations > 0 && (
            <span className="bg-red-800 px-2 py-0.5 rounded-full text-xs">
              {violations}/{MAX_VIOLATIONS} violations
            </span>
          )}
        </div>
      )}

      {/* ── Submit error banner ── */}
      {submitError && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm py-2 px-4 text-center">
          {submitError}
          <button onClick={() => setSubmitError('')} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">

        {/* Question panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto nice-scroll p-3 sm:p-6">
          {(() => {
            const qtext   = currentQ.question_text || ''
            const isRC    = qtext.includes('[PASSAGE]')
            const passage = isRC ? (qtext.split('[PASSAGE]')[1]?.split('[/PASSAGE]')[0]?.trim() || '') : ''
            // A real DI table has >=2 lines that START with '|'. A stray '|'
            // (e.g. the coded-inequality legend "'@' means '>' | '#' means '<'")
            // must NOT blank the question text.
            // For RC the question line is the text after the passage; otherwise the
            // whole question_text (QuestionContent renders any DI table within it).
            const qline   = isRC
              ? (qtext.split('[/PASSAGE]')[1]?.trim() || '')
              : qtext

            const header = (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Question {currentIdx + 1} of {totalQ}</span>
                  <span className={`badge ${SECTION_COLORS[currentQ.section]?.light || 'bg-gray-100'} ${SECTION_COLORS[currentQ.section]?.text || 'text-gray-600'}`}>
                    {getSectionLabel(currentQ.section)}
                  </span>
                </div>
                <button onClick={toggleMark}
                  className={`text-sm px-3 py-1 rounded-lg border transition-colors ${marked[qNum] ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                  {marked[qNum] ? 'Marked for review' : 'Mark for review'}
                </button>
              </div>
            )

            const options = (
              <div className="space-y-2.5">
                {['a','b','c','d','e'].map(opt => {
                  const label  = opt.toUpperCase()
                  const text   = currentQ[`option_${opt}`]
                  if (!text) return null
                  const chosen = answers[qNum] === label
                  return (
                    <button key={opt} onClick={() => selectAnswer(label)}
                      className={`w-full text-left flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border-2 transition-all min-h-[44px] ${chosen ? 'shadow-sm' : 'border-gray-200 bg-white'}`}
                      style={chosen ? {borderColor:'#FF653F', background:'#FFF3EE', touchAction:'manipulation'} : {touchAction:'manipulation'}}
                      onMouseOver={e => !chosen && (e.currentTarget.style.borderColor='#fec9b0')}
                      onMouseOut={e => !chosen && (e.currentTarget.style.borderColor='#e5e7eb')}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${chosen ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                        style={chosen ? {background:'#FF653F'} : {}}>{label}</span>
                      <span className={`text-sm ${chosen ? 'font-medium' : 'text-gray-700'}`} style={chosen ? {color:'#111'} : {}}>{text}</span>
                    </button>
                  )
                })}
              </div>
            )

            // RC: passage left, question + options right (everything visible together)
            if (isRC) return (
              <div className="max-w-6xl mx-auto">
                {header}
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                  <div className="w-full lg:w-1/2 flex-shrink-0">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Read the passage carefully</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-[13px] text-gray-700 leading-relaxed whitespace-pre-line lg:max-h-[70vh] lg:overflow-y-auto nice-scroll">
                      {passage}
                    </div>
                  </div>
                  <div className="w-full lg:flex-1 min-w-0">
                    <QuestionContent text={qline} className="mb-3" />
                    {options}
                  </div>
                </div>
              </div>
            )

            // Non-RC: single column (chart / table / plain question)
            return (
              <div className="max-w-3xl mx-auto">
                {header}
                <div className="card p-4 sm:p-6 mb-4">
                  <ChartBlock question={currentQ} />
                  <QuestionContent text={qline} className="mt-2" />
                </div>
                {options}
              </div>
            )
          })()}
          </div>

          {/* ── Sticky navigation footer — always visible ── */}
          <div className="border-t border-gray-200 bg-white px-3 sm:px-6 py-3 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
              <button
                onClick={() => currentIdx > 0 && goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                style={{touchAction:'manipulation'}}
                className="btn-outline px-5 disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {answers[qNum] && (
                  <button
                    onClick={() => setAnswers(a => { const n = {...a}; delete n[qNum]; return n })}
                    style={{touchAction:'manipulation'}}
                    className="btn text-sm border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => currentIdx < totalQ - 1 && goTo(currentIdx + 1)}
                disabled={currentIdx === totalQ - 1}
                style={{touchAction:'manipulation'}}
                className="btn-primary px-5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ── Right sidebar — question palette ── */}
        <div className="sm:w-64 w-full bg-white sm:border-l border-t border-gray-200 flex flex-col overflow-hidden sm:max-h-none max-h-40">
          <div className="p-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-700 mb-2">Question palette</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                ['answered',        'bg-green-500',  'Answered'],
                ['marked',          'bg-yellow-400', 'Marked'],
                ['visited',         'bg-red-100  border border-red-300', 'Not answered'],
                ['not-visited',     'bg-white border border-gray-300', 'Not visited'],
              ].map(([, cls, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-sm ${cls} flex-shrink-0`}></span>
                  <span className="text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Answered: {answeredCount}</span>
              <span>Remaining: {totalQ - answeredCount}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(answeredCount / totalQ) * 100}%` }}></div>
            </div>
          </div>

          {/* Palette grid */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3">
            {sections.map(sec => {
              const sqs = (testData.sections[sec]?.questions || [])
                .sort((a, b) => a.question_number - b.question_number)
              return (
                <div key={sec} className="mb-4">
                  <div className={`text-xs font-semibold mb-2 ${SECTION_COLORS[sec]?.text || 'text-gray-600'}`}>
                    {SECTION_LABELS[sec]}
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {sqs.map(q => {
                      const status = getStatus(q)
                      const idx = allQuestions.findIndex(aq => aq.question_number === q.question_number)
                      return (
                        <button
                          key={q.question_number}
                          onClick={() => goTo(idx)}
                          style={{touchAction:'manipulation'}}
                          className={`w-9 h-9 text-xs font-medium rounded border transition-all
                            ${STATUS_STYLE[status]}
                            ${currentIdx === idx ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                        >
                          {q.question_number}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 border-t border-gray-100">
            <button onClick={() => setShowConfirm(true)}
              className="btn-success w-full text-sm py-2">
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* ── Submit confirmation modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Submit test?</h3>
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <div>Answered: <b className="text-green-600">{answeredCount}</b> of {totalQ}</div>
              <div>Unanswered: <b className="text-red-500">{totalQ - answeredCount}</b></div>
              <div>Time remaining: <b>{formatTime(secsLeft)}</b></div>
            </div>
            <p className="text-sm text-gray-500 mb-5">Once submitted you cannot change your answers.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-outline flex-1">
                Go back
              </button>
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                className="btn-success flex-1">
                {submitting ? 'Submitting...' : 'Yes, submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
