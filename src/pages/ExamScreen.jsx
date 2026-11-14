import { useState, useEffect, useRef, useCallback } from 'react'
import { submitTest } from '../api.js'
import QuestionContent from '../components/QuestionContent'
const isNative = import.meta.env.VITE_IS_NATIVE === 'true'
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

export default function ExamScreen({ testData, studentName, onResult, onExit, onExitToHistory, resumeState }) {
  // Flatten all questions into one list with section info
  const allQuestions = testData.sections
    ? Object.entries(testData.sections).flatMap(([sec, data]) =>
        (data.questions || []).map(q => ({ ...q, section: sec }))
      ).sort((a, b) => a.question_number - b.question_number)
    : []

  const totalQ          = allQuestions.length

  // For Topic Practice and Diagnostic tests (single-section), derive the time
  // directly from the actual question count (1 min/Q, min 5) so the timer is
  // always accurate regardless of what the backend sends in total_time_mins.
  // Section Practice and Full Mock still use the backend value.
  const isTopicPractice = testData?.test_type === 'topic_diagnostic' ||
    testData?.test_type === 'concept_mini' ||
    (testData?.test_type === 'mini' && testData?.topic !== 'all')
  const totalSecs = isTopicPractice
    ? Math.max(5, totalQ) * 60
    : (testData.total_time_mins || 60) * 60
  const resumedSecsLeft = resumeState?.secsLeft != null ? Math.max(0, resumeState.secsLeft) : totalSecs

  // ── Section time limits ─────────────────────────────────────
  // Each section has its own 20-min countdown
  // When section timer hits 0 → auto-move to next section
  const getSectionSecs = (sec) => {
    const sData = testData.sections?.[sec]
    if (isTopicPractice) {
      // Derive from actual Q count so it matches the global timer
      return Math.max(5, sData?.count || (sData?.questions || []).length) * 60
    }
    return ((sData?.time_mins) || 20) * 60
  }

  const [currentIdx,    setCurrentIdx]    = useState(() => {
    if (!resumeState?.activeSection) return 0
    const idx = allQuestions.findIndex(q => q.section === resumeState.activeSection)
    return idx >= 0 ? idx : 0
  })
  const [answers,       setAnswers]       = useState(() => resumeState?.answers || {})
  const [timeSpent,     setTimeSpent]     = useState({})        // qnum -> ms
  const [marked,        setMarked]        = useState({})        // qnum -> bool
  const [visited,       setVisited]       = useState(() => {
    const v = { 1: true }
    if (resumeState?.answers) Object.keys(resumeState.answers).forEach(qn => { v[Number(qn)] = true })
    return v
  })
  const [secsLeft,      setSecsLeft]      = useState(resumedSecsLeft)
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
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showPalette,     setShowPalette]     = useState(false)
  const [activeSection,   setActiveSection]   = useState(
    resumeState?.activeSection || Object.keys(testData.sections || {})[0]
  )

  // ── Anti-cheating state ────────────────────────────────────────
  const [violations,   setViolations]   = useState(0)
  const [violationMsg, setViolationMsg] = useState('')
  const violationsRef    = useRef(0)    // tracks violation count
  const examStartedRef   = useRef(false) // grace period - 3s after start

  const questionStartRef = useRef(Date.now())
  const timerRef         = useRef(null)
  const submitLockRef    = useRef(false)   // prevents double-submit race between timer effects
  const currentQ         = allQuestions[currentIdx] || {}
  const qNum             = currentQ.question_number

  // Timestamp-based timer state — survives setInterval pauses on background/resume.
  // timerEpochRef: the wall-clock time when this epoch began.
  // timerBaseRef:  the secs remaining at that epoch start.
  // When the app resumes from background, the next interval tick automatically
  // calculates the correct remaining time using Date.now() - timerEpochRef.
  const timerEpochRef = useRef(Date.now())
  const timerBaseRef  = useRef(resumedSecsLeft)

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
    timerBaseRef.current  = resumedSecsLeft
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
  const isFullMock = !isTopicPractice && !isMini && Object.keys(testData.sections || {}).length > 1

  // ── Full-mock resume persistence ─────────────────────────────
  const answersRef      = useRef(answers)
  const activeSectionRef = useRef(activeSection)
  const secsLeftRef     = useRef(secsLeft)
  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { activeSectionRef.current = activeSection }, [activeSection])
  useEffect(() => { secsLeftRef.current = secsLeft }, [secsLeft])

  // Save test metadata on mount
  useEffect(() => {
    if (!isFullMock) return
    try { localStorage.setItem('mt-inprogress', JSON.stringify({ testData, savedAt: Date.now() })) } catch {}
  }, []) // eslint-disable-line

  // Save answers immediately when they change
  useEffect(() => {
    if (!isFullMock) return
    try {
      localStorage.setItem('mt-inprogress-state', JSON.stringify({
        answers, activeSection, secsLeft: secsLeftRef.current, savedAt: Date.now(),
      }))
    } catch {}
  }, [answers, activeSection]) // eslint-disable-line

  // Periodic save of secsLeft every 20s
  useEffect(() => {
    if (!isFullMock) return
    const id = setInterval(() => {
      try {
        localStorage.setItem('mt-inprogress-state', JSON.stringify({
          answers: answersRef.current, activeSection: activeSectionRef.current,
          secsLeft: secsLeftRef.current, savedAt: Date.now(),
        }))
      } catch {}
    }, 20000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line

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

  // Android back button during exam → show exit confirmation instead of navigating away
  useEffect(() => {
    const onExamBack = () => setShowExitConfirm(true)
    window.addEventListener('mt:exam-back', onExamBack)
    return () => window.removeEventListener('mt:exam-back', onExamBack)
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
    if (submitLockRef.current) return
    submitLockRef.current = true
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
      try { localStorage.removeItem('mt-inprogress'); localStorage.removeItem('mt-inprogress-state') } catch {}
      onResult(result)
    } catch (e) {
      const msg = e.friendlyMessage || 'Submission failed. Please try again.'
      setSubmitError(msg)
      setSubmitting(false)
      submitLockRef.current = false   // allow retry on network error
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
    <div className="flex flex-col bg-gray-50" style={{height:'100dvh',overflow:'hidden'}}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3"
        style={{background:'#111',minHeight:50,paddingTop:'calc(env(safe-area-inset-top,0px) + 6px)',paddingBottom:'6px'}}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{width:28,height:28,background:'#F06535'}}>
            <span className="font-black text-white" style={{fontSize:10}}>MT</span>
          </div>
          <span className="font-bold truncate" style={{color:'#fff',fontSize:12,maxWidth:80}}>{testTypeLabel}</span>
          {violations > 0 && (
            <span className="font-medium flex-shrink-0" style={{background:'rgba(239,68,68,.2)',color:'#fca5a5',fontSize:10,padding:'2px 7px',borderRadius:99}}>
              ⚠{violations}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center flex-shrink-0 font-mono font-bold"
          style={{padding:'4px 10px',borderRadius:10,fontSize:14,lineHeight:1.15,
            ...(isLow
              ? {background:'rgba(239,68,68,.15)',color:'#fca5a5',border:'1px solid rgba(239,68,68,.4)'}
              : {background:'rgba(232,90,44,.15)',color:'#F06535',border:'1px solid rgba(232,90,44,.3)'})}}>
          {formatTime(secsLeft)}
          {sectionTimingOn && secTimers[activeSection] !== undefined && (
            <span style={{fontSize:9,lineHeight:1.2,color:secTimers[activeSection]<120?'#fca5a5':'rgba(232,90,44,.65)'}}>
              {getSectionLabel(activeSection)}: {formatTime(secTimers[activeSection])}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setShowExitConfirm(true)}
            className="flex items-center justify-center rounded-lg"
            style={{width:30,height:30,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',touchAction:'manipulation'}}>
            <svg width="14" height="14" fill="none" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <button onClick={() => setShowConfirm(true)}
            className="font-bold text-white rounded-lg whitespace-nowrap"
            style={{background:'#F06535',fontSize:12,padding:'6px 12px',touchAction:'manipulation'}}>
            Submit
          </button>
        </div>
      </div>

      {/* ── Section tabs ── */}
      <div className="bg-white border-b border-gray-200 flex overflow-x-auto flex-shrink-0"
        style={{WebkitOverflowScrolling:'touch',touchAction:'pan-x'}}>
        {sections.map(sec => {
          const col         = SECTION_COLORS[sec] || SECTION_COLORS.english
          const sData       = testData.sections[sec] || {}
          const sectionQs   = sData.questions || []
          const expectedCount = sData.expected_count || sectionQs.length
          const secAnswered = sectionQs.filter(q => answers[q.question_number]).length
          const expired     = isSectionExpired(sec)
          const isActive    = activeSection === sec
          return (
            <button key={sec} disabled={expired}
              onClick={() => {
                if (expired) return
                const firstQ = sectionQs[0]
                if (firstQ) {
                  const idx = allQuestions.findIndex(q => q.question_number === firstQ.question_number)
                  if (idx >= 0) goTo(idx)
                }
                setActiveSection(sec)
              }}
              style={{
                touchAction:'manipulation',padding:'8px 14px',fontSize:12,fontWeight:isActive?700:500,
                whiteSpace:'nowrap',flexShrink:0,background:'transparent',border:'none',
                borderBottom:isActive?'2px solid #F06535':'2px solid transparent',
                color:expired?'#d1d5db':isActive?'#111':'#6b7280',cursor:expired?'not-allowed':'pointer',
              }}>
              {getSectionLabel(sec)} ({secAnswered}/{expectedCount})
            </button>
          )
        })}
      </div>

      {/* ── Alert banners ── */}
      {isOffline && <div className="flex-shrink-0 bg-red-600 text-white text-center font-medium" style={{fontSize:12,padding:'6px 12px'}}>⚠ Offline — answers saved locally. Reconnect to submit.</div>}
      {violationMsg && <div className="flex-shrink-0 bg-red-600 text-white text-center font-medium" style={{fontSize:12,padding:'6px 12px'}}>{violationMsg}</div>}
      {submitError && <div className="flex-shrink-0 bg-red-50 border-b border-red-200 text-red-700 text-center" style={{fontSize:12,padding:'6px 12px'}}>{submitError} <button onClick={()=>setSubmitError('')} className="ml-2 underline">Dismiss</button></div>}

      {/* ── Question area (full-width, scrollable) ── */}
      <div className="flex-1 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>
        {(() => {
          const qtext   = currentQ.question_text || ''
          const isRC    = qtext.includes('[PASSAGE]')
          const passage = isRC ? (qtext.split('[PASSAGE]')[1]?.split('[/PASSAGE]')[0]?.trim() || '') : ''
          const qline   = isRC ? (qtext.split('[/PASSAGE]')[1]?.trim() || '') : qtext

          const qHeader = (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{fontSize:12,fontWeight:600,color:'#6b7280'}}>Q {currentIdx+1} of {totalQ}</span>
                <span className={`${SECTION_COLORS[currentQ.section]?.light||'bg-gray-100'} ${SECTION_COLORS[currentQ.section]?.text||'text-gray-600'}`}
                  style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:99}}>
                  {getSectionLabel(currentQ.section)}
                </span>
              </div>
              <button onClick={toggleMark} style={{
                fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:8,touchAction:'manipulation',cursor:'pointer',border:'1px solid',
                borderColor:marked[qNum]?'#eab308':'#d1d5db',background:marked[qNum]?'#fefce8':'#fff',
                color:marked[qNum]?'#a16207':'#6b7280'}}>
                {marked[qNum] ? '★ Marked' : 'Mark for review'}
              </button>
            </div>
          )

          const optionEls = (
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {['a','b','c','d','e'].map(opt => {
                const label  = opt.toUpperCase()
                const text   = currentQ[`option_${opt}`]
                if (!text) return null
                const chosen = answers[qNum] === label
                return (
                  <button key={opt} onClick={() => selectAnswer(label)}
                    className="w-full text-left flex items-center gap-3"
                    style={{
                      padding:'11px 14px',minHeight:48,borderRadius:12,border:'2px solid',
                      borderColor:chosen?'#F06535':'#e5e7eb',
                      background:chosen?'#FFF3EE':'#fff',
                      touchAction:'manipulation',transition:'border-color .1s'}}
                    onMouseOver={e => !chosen && (e.currentTarget.style.borderColor='#fec9b0')}
                    onMouseOut={e => !chosen && (e.currentTarget.style.borderColor='#e5e7eb')}>
                    <span style={{
                      width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:12,fontWeight:800,flexShrink:0,
                      background:chosen?'#F06535':'#f3f4f6',color:chosen?'#fff':'#374151'}}>
                      {label}
                    </span>
                    <span style={{fontSize:14,lineHeight:1.5,color:chosen?'#111':'#374151',fontWeight:chosen?500:400}}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>
          )

          if (isRC) return (
            <div style={{padding:'16px 16px 8px',maxWidth:720,margin:'0 auto'}}>
              {qHeader}
              <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color:'#3b82f6',marginBottom:8}}>
                Read the passage carefully
              </div>
              <div style={{background:'#eff6ff',border:'1px solid #dbeafe',borderRadius:14,padding:'14px 16px',marginBottom:14,
                fontSize:13.5,color:'#1e3a5f',lineHeight:1.75,maxHeight:'32vh',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
                {passage}
              </div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:14,padding:'14px 16px',marginBottom:14,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
                <QuestionContent text={qline} />
              </div>
              {optionEls}
            </div>
          )

          return (
            <div style={{padding:'16px 16px 8px',maxWidth:720,margin:'0 auto'}}>
              {qHeader}
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:14,padding:'14px 16px',marginBottom:14,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
                <ChartBlock question={currentQ} />
                <QuestionContent text={qline} />
              </div>
              {optionEls}
            </div>
          )
        })()}
      </div>

      {/* ── Bottom nav bar (always visible) ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200"
        style={{paddingBottom:'calc(env(safe-area-inset-bottom,0px) + 2px)'}}>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <button onClick={() => currentIdx > 0 && goTo(currentIdx - 1)} disabled={currentIdx === 0}
            style={{padding:'8px 18px',borderRadius:10,border:'1.5px solid #d1d5db',fontSize:13,fontWeight:700,
              color:'#374151',background:'#fff',touchAction:'manipulation',opacity:currentIdx===0?.4:1,cursor:currentIdx===0?'not-allowed':'pointer'}}>
            ← Prev
          </button>
          <div className="flex items-center gap-2">
            {answers[qNum] && (
              <button onClick={() => setAnswers(a => { const n={...a}; delete n[qNum]; return n })}
                style={{padding:'6px 10px',borderRadius:9,border:'1.5px solid #fecaca',fontSize:12,fontWeight:600,
                  color:'#dc2626',background:'#fff',touchAction:'manipulation'}}>
                Clear
              </button>
            )}
            <button onClick={() => setShowPalette(p => !p)}
              style={{padding:'6px 11px',borderRadius:9,border:'1.5px solid #e5e7eb',fontSize:12,fontWeight:700,
                color:'#374151',background:showPalette?'#f3f4f6':'#fff',touchAction:'manipulation'}}>
              {answeredCount}/{totalQ} {showPalette ? '▾' : '▴'}
            </button>
          </div>
          <button onClick={() => currentIdx < totalQ - 1 && goTo(currentIdx + 1)} disabled={currentIdx === totalQ - 1}
            style={{padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:700,color:'#fff',
              background:'#F06535',border:'none',touchAction:'manipulation',
              opacity:currentIdx===totalQ-1?.4:1,cursor:currentIdx===totalQ-1?'not-allowed':'pointer'}}>
            Next →
          </button>
        </div>

        {/* Collapsible question palette */}
        {showPalette && (
          <div className="border-t border-gray-100 overflow-y-auto" style={{maxHeight:'40vh',WebkitOverflowScrolling:'touch'}}>
            {/* Legend */}
            <div style={{padding:'10px 12px 6px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'6px 4px'}}>
              {[
                ['bg-green-500','Answered'],
                ['bg-yellow-400','Marked'],
                ['bg-red-100 border border-red-300','Not answered'],
                ['bg-white border border-gray-300','Not visited'],
              ].map(([cls, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <span className={`flex-shrink-0 rounded-sm ${cls}`} style={{width:12,height:12}}></span>
                  <span style={{fontSize:9.5,color:'#6b7280',lineHeight:1.2}}>{label}</span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{padding:'0 12px 8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,color:'#6b7280'}}>Answered: {answeredCount}</span>
                <span style={{fontSize:11,color:'#6b7280'}}>Remaining: {totalQ - answeredCount}</span>
              </div>
              <div style={{height:3,background:'#f3f4f6',borderRadius:99}}>
                <div style={{height:3,background:'#10b981',borderRadius:99,width:`${(answeredCount/totalQ)*100}%`,transition:'width .3s'}}></div>
              </div>
            </div>
            {/* Question grid */}
            <div style={{padding:'0 12px 10px'}}>
              {sections.map(sec => {
                const sqs = (testData.sections[sec]?.questions || []).sort((a,b)=>a.question_number-b.question_number)
                return (
                  <div key={sec} style={{marginBottom:12}}>
                    <div className={`${SECTION_COLORS[sec]?.text || 'text-gray-600'}`} style={{fontSize:11,fontWeight:700,marginBottom:6}}>
                      {SECTION_LABELS[sec]}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:4}}>
                      {sqs.map(q => {
                        const status = getStatus(q)
                        const qi = allQuestions.findIndex(aq => aq.question_number === q.question_number)
                        return (
                          <button key={q.question_number} onClick={() => { goTo(qi); setShowPalette(false) }}
                            style={{touchAction:'manipulation',width:'100%',aspectRatio:'1',fontSize:11,fontWeight:600,borderRadius:6,border:'1px solid',cursor:'pointer'}}
                            className={`${STATUS_STYLE[status]} ${currentIdx===qi?'ring-2 ring-blue-400 ring-offset-1':''}`}>
                            {q.question_number}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Submit */}
            <div style={{padding:'0 12px 12px'}}>
              <button onClick={() => { setShowPalette(false); setShowConfirm(true) }}
                className="w-full font-bold text-white rounded-xl"
                style={{padding:'11px',fontSize:13,background:'#10b981',border:'none',touchAction:'manipulation',cursor:'pointer'}}>
                Submit Test
              </button>
            </div>
          </div>
        )}
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

      {/* ── Exit confirmation modal (Home button / Android back) ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Exit exam?</h3>
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <div>Answered: <b className="text-green-600">{answeredCount}</b> of {totalQ}</div>
              <div>Unanswered: <b className="text-red-500">{totalQ - answeredCount}</b></div>
            </div>
            <p className="text-sm text-gray-500 mb-5">Exiting now will discard your progress. This test will not be saved.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowExitConfirm(false)}
                className="btn-success w-full">
                Continue Exam
              </button>
              <button onClick={() => { setShowExitConfirm(false); handleSubmit(false) }}
                disabled={submitting}
                className="w-full text-sm font-semibold py-2 px-4 rounded-lg border transition-colors"
                style={{borderColor:'#F06535',color:'#F06535',background:'transparent'}}>
                {submitting ? 'Submitting...' : 'Submit & View Result'}
              </button>
              <button onClick={() => { setShowExitConfirm(false); if (onExitToHistory) onExitToHistory(); else if (onExit) onExit() }}
                className="w-full text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                style={{color:'#6b7280',background:'#f3f4f6'}}>
                Exit Without Submitting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
