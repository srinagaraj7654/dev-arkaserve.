import { useState, useEffect, useRef } from 'react'
import api from '../api.js'

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || ''
const headers   = { 'x-admin-key': ADMIN_KEY }

const BANKING_EXAM_IDS = new Set([
  'bank_clerk_prelims','bank_clerk_mains','bank_po_prelims','bank_po_mains',
  'sbi_clerk_prelims','sbi_clerk_mains','sbi_po_prelims','sbi_po_mains',
  'rrb_office_assistant_prelims','rrb_officer_scale1_prelims',
  'rbi_assistant_mains','rbi_gradeb_p1','nabard_gradeA_pre',
])
const EXAM_IDS = [...BANKING_EXAM_IDS]

const EXAM_DISPLAY = {
  'bank_clerk_prelims':          'Bank Clerk Prelims',
  'bank_clerk_mains':            'Bank Clerk Mains',
  'bank_po_prelims':             'Bank PO Prelims',
  'bank_po_mains':               'Bank PO Mains',
  'sbi_clerk_prelims':           'SBI Clerk Prelims',
  'sbi_clerk_mains':             'SBI Clerk Mains',
  'sbi_po_prelims':              'SBI PO Prelims',
  'sbi_po_mains':                'SBI PO Mains',
  'rrb_office_assistant_prelims':'RRB Office Asst',
  'rrb_officer_scale1_prelims':  'RRB Officer Scale 1',
  'rbi_assistant_mains':         'RBI Assistant Mains',
  'rbi_gradeb_p1':               'RBI Grade B PL',
  'nabard_gradeA_pre':           'NABARD Grade A Pre',
}

const SCHEDULER_EXAMS = [
  'bank_clerk_mains','sbi_clerk_mains','bank_po_mains','sbi_po_mains',
  'rbi_assistant_mains','rbi_gradeb_p1','nabard_gradeA_pre',
]

// ── Donut chart (pure SVG, no library) ───────────────────────────
function DonutChart({ segments, size = 120, stroke = 20 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  let offset = 0
  const slices = segments.map(s => {
    const dash = (s.pct / 100) * circ
    const sl = { ...s, dash, offset }
    offset += dash
    return sl
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      {slices.map((s, i) => (
        <circle key={i}
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  )
}

// ── Sidebar icon components (inline SVG for clean look) ──────────
const Icons = {
  dashboard:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  exam:        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>,
  ca:          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>,
  upload:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>,
  flagged:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>,
  scheduler:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>,
  analytics:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  settings:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  chevron:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>,
  bell:        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  search:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  play:        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>,
  add:         <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  generate:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>,
  manage:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>,
  upload2:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>,
  menu:        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  close:       <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  back:        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  refresh:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>,
  check:       <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  dot:         <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2"><circle cx="12" cy="12" r="8"/></svg>,
  write:       <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  trash:       <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
}

export default function AdminPage({ onBack }) {
  const [tab,          setTab]         = useState('dashboard')
  const [stats,        setStats]       = useState(null)
  const [flagged,      setFlagged]     = useState([])
  const [loading,      setLoading]     = useState(true)
  const [uploadExam,   setUploadExam]  = useState('')
  const [uploadFile,   setUploadFile]  = useState(null)
  const [uploadStatus, setUploadStatus]= useState('')
  const [seedStatus,   setSeedStatus]  = useState({})
  const [actionMsg,    setActionMsg]   = useState('')
  const [editingQ,     setEditingQ]    = useState(null)
  const [editData,     setEditData]    = useState({})
  const [bulkLoading,  setBulkLoading] = useState(false)
  const [savingEdit,   setSavingEdit]  = useState(false)
  const [caStatus,     setCaStatus]    = useState(null)
  const [caRunning,    setCaRunning]   = useState(false)
  const [caLog,        setCaLog]       = useState([])
  const [elapsed,      setElapsed]     = useState(0)
  const [sidebarOpen,  setSidebarOpen] = useState(false)
  const [writeForm,    setWriteForm]   = useState({
    exam:'', section:'', topic:'', difficulty:'medium',
    question_text:'', option_a:'', option_b:'', option_c:'', option_d:'', option_e:'',
    correct_answer:'A', explanation:'', has_e: false,
  })
  const [writeSaving,  setWriteSaving] = useState(false)
  const [writeList,    setWriteList]   = useState([])
  const fileRef = useRef()

  // ── Data fetching ────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const r = await api.get('/admin/stats', { headers })
      setStats(r.data)
    } catch { setStats({ exams: [], total_exams: 0, total_questions: 0 }) }
    finally { setLoading(false) }
  }
  const fetchFlagged = async (examId = '') => {
    try {
      const url = examId ? `/admin/flagged?exam=${examId}` : '/admin/flagged'
      const r   = await api.get(url, { headers })
      setFlagged((r.data.flagged || []).filter(q => BANKING_EXAM_IDS.has(q.exam)))
    } catch(e) { console.error(e) }
  }
  useEffect(() => { fetchStats(); fetchFlagged(); fetchCaStatus(); fetchCaLog() }, [])

  const showMsg = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000) }

  // ── Question actions ─────────────────────────────────────────────
  const handleApprove = async (qid) => {
    try {
      await api.put(`/admin/approve/${qid}`, {}, { headers })
      setFlagged(f => f.filter(q => q.id !== qid))
      showMsg('Question approved ✓'); fetchStats()
    } catch(e) { showMsg('Error: ' + (e.response?.data?.error || e.message)) }
  }
  const handleDelete = async (qid) => {
    try {
      await api.delete(`/admin/question/${qid}`, { headers })
      setFlagged(f => f.filter(q => q.id !== qid)); showMsg('Question deleted')
    } catch(e) { showMsg('Error: ' + (e.response?.data?.error || e.message)) }
  }
  const handleBulkApprove = async (examFilter = '') => {
    const toApprove = examFilter ? flagged.filter(q => q.exam === examFilter) : flagged
    if (!toApprove.length) { showMsg('No flagged questions to approve'); return }
    const confirmed = window.confirm(
      `Approve all ${toApprove.length} flagged questions${examFilter ? ` for ${examFilter}` : ''}?\n\nReview them first — this cannot be undone.`
    )
    if (!confirmed) return
    setBulkLoading(true)
    let approved = 0, failed = 0
    for (const q of toApprove) {
      try { await api.put(`/admin/approve/${q.id}`, {}, { headers }); approved++ }
      catch { failed++ }
    }
    setFlagged(f => examFilter ? f.filter(q => q.exam !== examFilter) : [])
    setBulkLoading(false)
    showMsg(`Bulk approved: ${approved} ✓${failed ? ` (${failed} failed)` : ''}`)
    fetchStats()
  }
  const openEdit = (q) => {
    setEditingQ(q.id)
    setEditData({
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, option_e: q.option_e,
      correct_answer: q.correct_answer, explanation: q.explanation || '',
    })
  }
  const handleSaveEdit = async (qid) => {
    setSavingEdit(true)
    try {
      await api.put(`/admin/edit/${qid}`, editData, { headers })
      await api.put(`/admin/approve/${qid}`, {}, { headers })
      setFlagged(f => f.filter(q => q.id !== qid))
      setEditingQ(null); showMsg('Edited & approved ✓'); fetchStats()
    } catch {
      try {
        await api.put(`/admin/approve/${qid}`, {}, { headers })
        setFlagged(f => f.filter(q => q.id !== qid))
        setEditingQ(null); showMsg('Approved ✓'); fetchStats()
      } catch(e2) { showMsg('Error: ' + (e2.response?.data?.error || e2.message)) }
    } finally { setSavingEdit(false) }
  }

  // ── Upload ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadExam || !uploadFile) { setUploadStatus('Please select an exam and a PDF file'); return }
    if (uploadFile.size > 20 * 1024 * 1024) { setUploadStatus('File too large — max 20MB'); return }
    setUploadStatus('Uploading...')
    const form = new FormData()
    form.append('exam_id', uploadExam); form.append('file', uploadFile)
    try {
      const r = await api.post('/admin/upload-syllabus', form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      })
      setUploadStatus(`✓ Uploaded: ${r.data.filename} (${(r.data.size_bytes/1024).toFixed(0)} KB)`)
      setUploadFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch(e) { setUploadStatus('Upload failed: ' + (e.response?.data?.error || e.message)) }
  }

  // ── Seed / Ingest ────────────────────────────────────────────────
  useEffect(() => {
    const hasActive = Object.values(seedStatus).some(s => s === 'seeding' || s === 'seeding_bg')
    if (!hasActive) return
    const interval = setInterval(async () => {
      try {
        const r = await api.get('/admin/seed-status', { headers })
        const active = r.data.active || {}
        setSeedStatus(prev => {
          const next = { ...prev }
          Object.keys(next).forEach(id => { if (next[id] === 'seeding_bg' && !active[id]) next[id] = 'done' })
          return next
        })
        if (Object.keys(active).length === 0) fetchStats()
      } catch {}
    }, 10000)
    return () => clearInterval(interval)
  }, [seedStatus])

  const handleCancelSeed = async (examId) => {
    try {
      await api.post(`/admin/cancel-seed/${examId}`, {}, { headers })
      setSeedStatus(s => ({ ...s, [examId]: 'cancelled' }))
      showMsg(`Seeding cancelled for ${examId}`)
      setTimeout(() => setSeedStatus(s => ({ ...s, [examId]: null })), 3000)
    } catch(e) { showMsg('Cancel failed: ' + (e.response?.data?.message || e.message)) }
  }
  const handleIngest = async (examId) => {
    setSeedStatus(s => ({ ...s, [examId]: 'ingesting' }))
    try { await api.post(`/admin/ingest/${examId}`, {}, { headers }); setSeedStatus(s => ({ ...s, [examId]: 'ingesting_bg' })) }
    catch(e) { setSeedStatus(s => ({ ...s, [examId]: 'error: ' + (e.response?.data?.error || e.message) })) }
  }
  const handleSeed = async (examId) => {
    setSeedStatus(s => ({ ...s, [examId]: 'seeding' }))
    try { await api.post(`/admin/seed/${examId}`, {}, { headers }); setSeedStatus(s => ({ ...s, [examId]: 'seeding_bg' })) }
    catch { setSeedStatus(s => ({ ...s, [examId]: 'error' })) }
  }

  // ── CA Scheduler ─────────────────────────────────────────────────
  const fetchCaStatus = async () => {
    try { const r = await api.get('/admin/ca-status', { headers }); setCaStatus(r.data); return r.data }
    catch {}
  }
  const fetchCaLog = async () => {
    try { const r = await api.get('/admin/ca-log?limit=5', { headers }); setCaLog(r.data.runs || []) }
    catch {}
  }
  const handleRunCa = async () => {
    setCaRunning(true); setElapsed(0)
    try {
      const r = await api.post('/admin/run-ca', {}, { headers })
      showMsg(r.data.message || 'CA generation started')
      await fetchCaStatus()
    } catch(e) { showMsg('Error: ' + (e.response?.data?.error || e.message)) }
    finally { setCaRunning(false) }
  }
  useEffect(() => {
    if (!caStatus?.running) { if (caStatus?.last_status === 'done') fetchCaLog(); return }
    const si = setInterval(fetchCaStatus, 10000)
    const ei = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { clearInterval(si); clearInterval(ei) }
  }, [caStatus?.running])

  // ── Computed metrics ─────────────────────────────────────────────
  const bankingExams   = (stats?.exams || []).filter(e => BANKING_EXAM_IDS.has(e.exam_id))
  const totalApproved  = bankingExams.reduce((s, e) => s + (e.approved || 0), 0)
  const ibpsCount = bankingExams.filter(e => e.exam_id.startsWith('bank_') || e.exam_id.startsWith('rrb_')).reduce((s,e) => s+(e.approved||0),0)
  const sbiCount  = bankingExams.filter(e => e.exam_id.startsWith('sbi_')).reduce((s,e) => s+(e.approved||0),0)
  const rbiCount  = bankingExams.filter(e => e.exam_id.startsWith('rbi_') || e.exam_id.startsWith('nabard_')).reduce((s,e) => s+(e.approved||0),0)
  const otherCount = Math.max(0, totalApproved - ibpsCount - sbiCount - rbiCount)
  // Use floor for all segments, give remainder to largest to keep sum = 100
  const ibpsPct  = totalApproved > 0 ? Math.floor(ibpsCount  / totalApproved * 100) : 0
  const sbiPct   = totalApproved > 0 ? Math.floor(sbiCount   / totalApproved * 100) : 0
  const rbiPct   = totalApproved > 0 ? Math.floor(rbiCount   / totalApproved * 100) : 0
  const otherPct = Math.max(0, 100 - ibpsPct - sbiPct - rbiPct)

  const chartSegments = totalApproved > 0
    ? [
        { pct: ibpsPct,  color: '#F97316', label: 'IBPS' },
        { pct: sbiPct,   color: '#3B82F6', label: 'SBI' },
        { pct: rbiPct,   color: '#8B5CF6', label: 'RBI/NABARD' },
        { pct: otherPct, color: '#6B7280', label: 'Others' },
      ].filter(s => s.pct > 0)
    : [{ pct: 100, color: '#E5E7EB', label: 'No data' }]

  // ── Sidebar nav items ────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',           icon: Icons.dashboard },
    { id: 'exams',     label: 'Exam Management',     icon: Icons.exam      },
    { id: 'write',     label: 'Write Questions',     icon: Icons.write     },
    { id: 'ca',        label: 'Current Affairs',     icon: Icons.ca,       arrow: true },
    { id: 'upload',    label: 'Upload Syllabus PDF', icon: Icons.upload    },
    { id: 'flagged',   label: 'Review Flagged',      icon: Icons.flagged,  badge: flagged.length || null },
    { id: 'scheduler', label: 'Scheduler',           icon: Icons.scheduler },
    { id: 'analytics', label: 'Reports & Analytics', icon: Icons.analytics, arrow: true },
    { id: 'settings',  label: 'Settings',            icon: Icons.settings  },
  ]

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"

  // ── Navigate helper ──────────────────────────────────────────────
  const goTab = (id) => { setTab(id); setSidebarOpen(false) }

  // ── Sidebar ──────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-60 flex flex-col bg-slate-900 transition-transform duration-200
      lg:static lg:translate-x-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
        <div className="min-w-0">
          <div className="text-white font-semibold text-sm leading-tight">MockTest</div>
          <div className="text-slate-400 text-xs">Admin Panel</div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-500 hover:text-white lg:hidden">
          {Icons.close}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(item => (
          <button key={item.id} onClick={() => goTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
              ${tab === item.id
                ? 'bg-orange-500 text-white font-medium shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <span className={`flex-shrink-0 ${tab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {item.icon}
            </span>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium min-w-[1.25rem] text-center
                ${tab === item.id ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'}`}>
                {item.badge}
              </span>
            )}
            {item.arrow && (
              <span className={`${tab === item.id ? 'text-white/60' : 'text-slate-600 group-hover:text-slate-400'}`}>
                {Icons.chevron}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Orange wave decorative band */}
      <div className="flex-shrink-0 relative overflow-hidden" style={{ height: 112, pointerEvents: 'none' }}>
        <svg viewBox="0 0 240 112" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c2410c" stopOpacity="0.95"/>
              <stop offset="45%" stopColor="#f97316" stopOpacity="1"/>
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.9"/>
            </linearGradient>
            <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9a3412" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#fb923c" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.75"/>
            </linearGradient>
            <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c2d12" stopOpacity="0.6"/>
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.65"/>
              <stop offset="100%" stopColor="#9a3412" stopOpacity="0.55"/>
            </linearGradient>
          </defs>
          {/* Dark navy base */}
          <rect width="240" height="112" fill="#0f172a"/>
          {/* Back wave — deepest */}
          <path d="M0,70 C30,50 70,28 120,42 C160,53 200,32 240,20 L240,112 L0,112 Z" fill="url(#wg3)"/>
          {/* Mid wave */}
          <path d="M0,82 C50,60 90,42 140,58 C180,70 215,50 240,40 L240,112 L0,112 Z" fill="url(#wg2)"/>
          {/* Front wave — brightest */}
          <path d="M0,96 C60,76 100,60 155,74 C190,84 220,70 240,62 L240,112 L0,112 Z" fill="url(#wg1)"/>
        </svg>
        {/* Text overlay */}
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>MockTest Admin</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>Powered by ArkaServe</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">MockTest Platform</div>
            <div className="text-slate-500 text-xs truncate">arkaserve.com • Internal Only</div>
          </div>
        </div>
      </div>
    </aside>
  )

  // ── Top bar ──────────────────────────────────────────────────────
  const TopBar = () => (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center gap-4 flex-shrink-0" style={{ minHeight: 64 }}>
      <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 lg:hidden flex-shrink-0">
        {Icons.menu}
      </button>
      {/* Title — left side, desktop only */}
      <div className="hidden lg:block flex-shrink-0 min-w-0">
        <h1 className="font-extrabold text-gray-900 leading-tight" style={{ fontSize: 22, letterSpacing: -0.8 }}>Admin Dashboard</h1>
        <p className="text-xs" style={{ color: '#78859a', marginTop: 1 }}>Manage exams, content, current affairs, and scheduled tasks</p>
      </div>
      {/* Spacer */}
      <div className="flex-1" />
      {/* Search */}
      <div className="relative hidden sm:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{Icons.search}</span>
        <input type="text" placeholder="Search exams, content, or tasks..."
          className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white w-72 transition-all" />
      </div>
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
        {Icons.bell}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-1 ring-white" />
      </button>
      <div className="flex items-center gap-2 pl-1 border-l border-gray-200 ml-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">A</span>
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 hidden sm:block"><path d="M7 10l5 5 5-5z"/></svg>
      </div>
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors ml-1 flex-shrink-0">
        {Icons.back}<span className="hidden sm:inline">Exit Admin</span>
      </button>
    </header>
  )

  // ── Dashboard view ───────────────────────────────────────────────
  const DashboardView = () => {
    const lastRun   = caLog[0]
    const caRunning_  = caStatus?.running
    const lastSuccess = caStatus?.last_status === 'done'
    const lastRunStr  = lastRun ? new Date(lastRun.run_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

    return (
      <div className="space-y-3">
        {/* Responsive grid helpers injected once */}
        <style>{`
          @media(max-width:1024px){.adm-feat{grid-template-columns:1fr!important}}
          @media(max-width:1024px){.adm-kpi{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
          @media(max-width:480px){.adm-kpi{grid-template-columns:1fr!important}}
          @media(max-width:1024px){.adm-middle,.adm-bottom{grid-template-columns:1fr!important}}
        `}</style>

        {/* Stats cards */}
        <div className="adm-kpi grid gap-3" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
          {[
            {
              icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:24,height:24}}><path d="M12 3L1 9l4 2.18V17h2v-4.82l1 .55V17c0 1.66 1.57 3 3.5 3s3.5-1.34 3.5-3v-4.27l3-1.64V15h2V9L12 3zm1.5 13.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-3.18l3 1.63v1.55z"/></svg>,
              gradient: 'linear-gradient(115deg,#fffaf7,#fff0e8)', border: '#ffdfcf',
              iconRing: '#ffe2d2', iconTxt: '#f35c16',
              val: SCHEDULER_EXAMS.length, label: 'Target Exams', sub: 'Active in Scheduler',
            },
            {
              icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:24,height:24}}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>,
              gradient: 'linear-gradient(115deg,#f8fbff,#eaf3ff)', border: '#cfe1ff',
              iconRing: '#d7eaff', iconTxt: '#1671df',
              val: caLog.reduce((s, r) => s + (r.approved || 0), 0) || 0,
              label: 'Current Affairs', sub: 'MCQs approved via CA runs',
              subColor: 'text-green-600', upArrow: true,
            },
            {
              icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:24,height:24}}><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>,
              gradient: 'linear-gradient(115deg,#f8fffa,#e8fbef)', border: '#ccefd9',
              iconRing: '#d6f7e2', iconTxt: '#14964b',
              val: flagged.length, label: 'Flagged for Review', sub: 'Awaiting approval',
            },
            {
              icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:24,height:24}}><path d="M4 20h16v-2H4v2zm0-4h16v-2H4v2zm0-4h16v-2H4v2zm0-4h16V6H4v2zm0-6v2h16V2H4z"/></svg>,
              gradient: 'linear-gradient(115deg,#fcfaff,#f0ebff)', border: '#e1d5ff',
              iconRing: '#e5dcff', iconTxt: '#6736dc',
              val: totalApproved.toLocaleString(), label: 'Total Questions', sub: 'Across all exams',
            },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow" style={{ background: c.gradient, border: `1px solid ${c.border}`, padding: '14px 16px', minHeight: 96 }}>
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52, background: c.iconRing, color: c.iconTxt }}>{c.icon}</div>
              <div className="min-w-0">
                <div className="font-extrabold text-gray-900 leading-none" style={{ fontSize: 24 }}>{loading ? '—' : c.val}</div>
                <div className="font-semibold text-gray-700 mt-1" style={{ fontSize: 12 }}>{c.label}</div>
                <div className={`mt-0.5 flex items-center gap-1 ${c.subColor || 'text-gray-500'}`} style={{ fontSize: 10 }}>
                  {c.upArrow && <span className="text-green-600 font-bold">↑</span>}{c.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CA Banner + Quick Actions row */}
        <div className="adm-feat grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1.7fr) minmax(260px,.75fr)' }}>
          {/* CA Banner */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
               style={{ background: '#fff', minHeight: 158 }}>
            <div className="flex items-stretch h-full" style={{ padding: '15px 22px', minHeight: 158 }}>
              {/* Left column */}
              <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ paddingRight: 18 }}>
                <h2 className="font-extrabold leading-tight" style={{ fontSize: 22, letterSpacing: -0.8, color: '#0f1f3d' }}>
                  Nightly <span style={{ color: '#ff721e' }}>Current Affairs</span> Generator
                </h2>
                <p className="mt-1" style={{ color: '#6b7280', fontSize: 11, lineHeight: 1.5, maxWidth: 560 }}>
                  Automatically fetches Indian news, extracts key points, and generates ~20 MCQs for your target exams.
                </p>
                <div className="flex flex-wrap items-center mt-3" style={{ gap: 14 }}>
                  {[
                    { icon: '📅', label: 'Runs Daily', sub: 'at 00:00 (IST)' },
                    { icon: '📝', label: '~20 MCQs',   sub: 'Per run' },
                    { icon: '🚩', label: 'Auto-Flag',  sub: 'For review' },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-1.5">
                      <span style={{ fontSize: 15, color: '#ff791f' }}>{p.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 10, color: '#1f2d4a' }}>{p.label}</div>
                        <div style={{ color: '#9ca3af', fontSize: 9 }}>{p.sub}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleRunCa} disabled={caRunning || caStatus?.running}
                    className="flex items-center gap-2 disabled:opacity-60 text-white font-bold whitespace-nowrap"
                    style={{ border: 0, borderRadius: 10, padding: '10px 16px', background: 'linear-gradient(135deg,#ff811e,#f04f16)', fontSize: 12, cursor: 'pointer', boxShadow: '0 6px 18px rgba(240,80,22,0.35)' }}>
                    {caRunning || caStatus?.running
                      ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{`Running… ${elapsed}s`}</>
                      : <>{Icons.play} Run Now</>}
                  </button>
                </div>
              </div>
              {/* Right column: globe */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 relative" style={{ width: 170 }}>
                <div className="relative" style={{ width: 120, height: 120, borderRadius: '50%', border: '1px solid #fdc9a3', background: 'radial-gradient(circle at 35% 30%,#fff0e6,#fde8d8 68%)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 20px rgba(249,115,22,0.15)', color: '#f97316', fontSize: 68, flexShrink: 0 }}>
                  <span style={{ lineHeight: 1 }}>◎</span>
                  <div style={{ position: 'absolute', right: -16, bottom: 2, width: 100, height: 68, padding: '8px 10px', borderRadius: 8, background: 'linear-gradient(135deg,#fff,#fff5ef)', color: '#20345f', transform: 'rotate(-7deg)', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', pointerEvents: 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4 }}>Current Affairs</div>
                    <div style={{ height: 4, background: '#f5bfa0', borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ height: 3, background: '#f8d4be', borderRadius: 2, marginBottom: 3, width: '80%' }} />
                    <div style={{ height: 3, background: '#f8d4be', borderRadius: 2, width: '55%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: 15 }}>ϟ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: Icons.add,     label: 'Add Exam',        onClick: () => goTab('exams')     },
                { icon: Icons.upload2, label: 'Upload Syllabus', onClick: () => goTab('upload')    },
                { icon: Icons.generate,label: 'Generate CA',     onClick: handleRunCa              },
                { icon: Icons.manage,  label: 'Manage Schedule', onClick: () => goTab('scheduler') },
              ].map(a => (
                <button key={a.label} onClick={a.onClick}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ minHeight: 56, border: '1px solid #ffdfcf', background: 'linear-gradient(130deg,#fffaf7,#fff0e8)' }}>
                  <span style={{ color: '#f35b18', fontSize: 20 }}>{a.icon}</span>
                  <span className="font-semibold text-gray-800 text-center leading-tight" style={{ fontSize: 10 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle row: Target Exams | Scheduler */}
        <div className="adm-middle grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(320px,.85fr)' }}>

          {/* Target Exams */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900" style={{ fontSize: 15 }}>◎ Target Exams</h3>
              <button onClick={() => goTab('exams')} className="text-orange-500 hover:text-orange-600 font-semibold" style={{ fontSize: 10 }}>
                Manage Exams →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SCHEDULER_EXAMS.map((id, i) => {
                const palettes = [
                  { bg: '#fff2eb', border: '#ffdfd0', color: '#a94319' },
                  { bg: '#fff7f2', border: '#ffdfd0', color: '#a94319' },
                  { bg: '#fff0e9', border: '#ffdfd0', color: '#a94319' },
                  { bg: '#f0f5ff', border: '#dbe7ff', color: '#27549b' },
                ]
                const p = palettes[i % 4]
                const isRbi   = id.startsWith('rbi_') || id.startsWith('nabard_')
                const isRrb   = id.startsWith('rrb_')
                const tagIcon = isRbi
                  ? <svg viewBox="0 0 24 24" fill="currentColor" style={{width:13,height:13,flexShrink:0}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  : isRrb
                  ? <svg viewBox="0 0 24 24" fill="currentColor" style={{width:13,height:13,flexShrink:0}}><path d="M4 4h16v2H4zm0 4h16v8H4zm2 2v4h12v-4z"/></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor" style={{width:13,height:13,flexShrink:0}}><path d="M12 2l-5 4.5V8H3v13h7v-5h4v5h7V8h-4V6.5L12 2zm0 2.5L16 8H8l4-3.5z"/></svg>
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap"
                        style={{ padding: '7px 13px', borderRadius: 30, fontSize: 11, border: `1px solid ${p.border}`, color: p.color, background: p.bg }}>
                    {tagIcon}{EXAM_DISPLAY[id] || id.replace(/_/g,' ')}
                  </span>
                )
              })}
            </div>
            <p className="mt-2" style={{ color: '#748198', fontSize: 10, lineHeight: 1.4 }}>
              ⓘ Generated questions arrive as <b>flagged</b> — review and approve them before adding to the live pool.
            </p>
          </div>

          {/* Scheduler — right side of middle row */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900" style={{ fontSize: 15 }}>▦ Scheduler</h3>
              <button onClick={() => goTab('scheduler')} className="text-orange-500 hover:text-orange-600 font-semibold" style={{ fontSize: 10 }}>
                View Full Schedule →
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e6eaf1' }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ background: '#fff1e9', borderBottom: '1px solid #ffddcd', fontSize: 11 }}>
                <span className="font-semibold text-gray-800">▦ Automated Current Affairs</span>
                <button onClick={() => {}} className="rounded-full" style={{ width: 36, height: 20, background: '#ff6a24', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                  <span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', right: 3, top: 3 }} />
                </button>
              </div>
              {[
                ['◷ Run Time', '00:00 (IST) – Daily'],
                ['▤ Action', 'Fetch news → Generate MCQs → Flag'],
                [`◎ Target Exams`, `${SCHEDULER_EXAMS.length} exams`],
                ['● Last Run', lastRun
                  ? `${new Date(lastRun.run_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}, ${new Date(lastRun.run_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}${lastSuccess ? ' (Success)' : ''}`
                  : 'Never run'],
              ].map(([label, val], i, arr) => (
                <div key={label} style={{ gridTemplateColumns: '38% 1fr', fontSize: 10, padding: '7px 12px', borderBottom: i < arr.length - 1 ? '1px solid #edf0f5' : 'none', display: 'grid', gap: 8 }}>
                  <span style={{ color: '#65728a' }}>{label}</span>
                  <b style={{ color: i === 3 && lastSuccess ? '#15934b' : '#26334e', fontWeight: 600 }}>{val}</b>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end adm-middle */}

        {/* Bottom row: Recent Activity | Questions Overview */}
        <div className="adm-bottom grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(320px,.85fr)' }}>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900" style={{ fontSize: 15 }}>☷ Recent Activity</h3>
              <button onClick={() => goTab('ca')} className="text-orange-500 hover:text-orange-600 font-semibold" style={{ fontSize: 10 }}>
                View All →
              </button>
            </div>
            {caLog.length > 0 ? caLog.slice(0, 4).map((run, i) => {
              const ok = (run.approved || 0) > 0
              const toneStyles = ok
                ? { bg: '#dcf8e7', color: '#12934a' }
                : { bg: '#ffe2d2', color: '#f36a1d' }
              return (
                <div key={i} className="flex items-center gap-2.5" style={{ padding: '7px 0', borderBottom: i < 3 ? '1px solid #edf0f5' : 'none' }}>
                  <span className="flex-shrink-0 font-bold" style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 15, background: toneStyles.bg, color: toneStyles.color }}>
                    {ok ? '✓' : '⇧'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <b className="block truncate" style={{ fontSize: 11, color: '#14203a' }}>
                      CA run {ok ? 'completed' : '(0 approved)'}
                    </b>
                    <small className="block truncate" style={{ fontSize: 10, color: '#78849a', marginTop: 1 }}>
                      {run.generated ?? 0} generated · {run.approved ?? 0} approved
                    </small>
                  </div>
                  <time className="flex-shrink-0" style={{ fontSize: 10, color: '#69768d', whiteSpace: 'nowrap' }}>
                    {new Date(run.run_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </time>
                </div>
              )
            }) : (
              <div className="flex flex-col items-center py-3" style={{ color: '#78849a' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f5f8', display: 'grid', placeItems: 'center', fontSize: 16, marginBottom: 7 }}>☷</div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#47546d' }}>No activity yet</p>
                <p style={{ fontSize: 10, marginTop: 2 }}>Run the CA generator to start</p>
              </div>
            )}
          </div>

          {/* Questions Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900" style={{ fontSize: 15 }}>▥ Questions Overview</h3>
              <select className="bg-white focus:outline-none focus:ring-2 focus:ring-orange-500" style={{ border: '1px solid #dce3ee', borderRadius: 8, padding: '5px 8px', color: '#34415b', font: '500 10px Inter' }}>
                <option>Last 30 days</option>
                <option>All Time</option>
              </select>
            </div>
            {/* 3-column grid: donut | legend | bar — no stretching, no gaps */}
            <div style={{ display: 'grid', gridTemplateColumns: '105px auto auto', alignItems: 'center', gap: '0 14px' }}>
              {/* Donut */}
              <div className="relative" style={{ width: 105, height: 105 }}>
                <div style={{
                  width: 105, height: 105, borderRadius: '50%',
                  background: totalApproved > 0
                    ? `conic-gradient(#ff741d 0 ${ibpsPct}%,#1875e8 ${ibpsPct}% ${ibpsPct+sbiPct}%,#5532d8 ${ibpsPct+sbiPct}% ${ibpsPct+sbiPct+rbiPct}%,#aa8aff ${ibpsPct+sbiPct+rbiPct}% 100%)`
                    : '#E5E7EB',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#101a35', lineHeight: 1 }}>{loading ? '—' : totalApproved.toLocaleString()}</span>
                    <span style={{ fontSize: 9, color: '#7b879b', marginTop: 2 }}>Questions</span>
                  </div>
                </div>
              </div>
              {/* Legend — compact grid: dot | label | pct, all auto-sized to content */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '8px auto auto',
                columnGap: 5,
                rowGap: 7,
                alignItems: 'center',
                fontSize: 10,
                color: '#47546d',
              }}>
                {[
                  { label: 'IBPS',       pct: ibpsPct,  color: '#ff741d' },
                  { label: 'SBI',        pct: sbiPct,   color: '#1875e8' },
                  { label: 'RBI/NABARD', pct: rbiPct,   color: '#5532d8' },
                  { label: 'Others',     pct: otherPct, color: '#aa8aff' },
                ].map(s => (
                  [
                    <span key={s.label+'-dot'} style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'block' }} />,
                    <span key={s.label+'-lbl'} style={{ whiteSpace: 'nowrap' }}>{s.label}</span>,
                    <b    key={s.label+'-pct'} style={{ color: '#14203a', paddingLeft: 6, whiteSpace: 'nowrap' }}>{s.pct}%</b>,
                  ]
                ))}
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-1" style={{ height: 95, padding: '6px 4px', borderLeft: '1px solid #edf0f5', borderBottom: '1px solid #edf0f5', width: 80 }}>
                {(() => {
                  const placeholderPcts = [18, 28, 38, 48, 62, 78, 100]
                  if (caLog.length === 0) {
                    return placeholderPcts.map((pct, i) => (
                      <div key={i} className="flex-1" style={{
                        height: `${pct}%`,
                        background: 'linear-gradient(180deg,#D1D5DB,#E5E7EB)',
                        borderRadius: '3px 3px 1px 1px',
                        opacity: 0.7,
                      }} />
                    ))
                  }
                  const runs = (caLog.length < 7
                    ? [...Array(7 - caLog.length).fill(null), ...caLog]
                    : caLog.slice(0, 7)
                  ).reverse()
                  const max = Math.max(...caLog.map(r => r.approved || 0), 1)
                  return runs.map((run, i) => {
                    const pct = run ? Math.max(8, Math.round(((run.approved || 0) / max) * 100)) : placeholderPcts[i]
                    const isReal = run && (run.approved || 0) > 0
                    return (
                      <div key={i} className="flex-1" style={{
                        height: `${pct}%`,
                        background: isReal ? 'linear-gradient(180deg,#ff6b1d,#ffb080)' : 'linear-gradient(180deg,#D1D5DB,#E5E7EB)',
                        borderRadius: '3px 3px 1px 1px',
                        opacity: run ? 1 : 0.5,
                      }} />
                    )
                  })
                })()}
              </div>
            </div>
          </div>

        </div>{/* end adm-bottom */}

        {/* Action message toast */}
        {actionMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-in">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            {actionMsg}
          </div>
        )}
      </div>
    )
  }

  // ── Exam Management view (existing) ──────────────────────────────
  const ExamsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exam Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage banking exam question pools</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors">
          {Icons.refresh} Refresh
        </button>
      </div>
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {(() => {
            const be = (stats.exams || []).filter(e => BANKING_EXAM_IDS.has(e.exam_id))
            return [
              [be.length, 'Banking Exams', 'bg-orange-50 text-orange-600'],
              [be.reduce((s, e) => s + (e.approved || 0), 0), 'Approved Questions', 'bg-green-50 text-green-600'],
              [be.filter(e => e.ready).length, 'Live Exams', 'bg-blue-50 text-blue-600'],
            ].map(([val, label, cls]) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                <div className={`text-2xl font-bold ${cls.split(' ')[1]}`}>{val}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
              </div>
            ))
          })()}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 text-sm">Banking Exams</h3>
          <span className="text-xs text-gray-400">{bankingExams.length} exams</span>
        </div>
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bankingExams.map(exam => (
              <div key={exam.exam_id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {EXAM_DISPLAY[exam.exam_id] || exam.name || exam.exam_id.replace(/_/g,' ')}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{exam.exam_id.replace(/_/g,' ')}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1
                    ${exam.ready ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${exam.ready ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {exam.ready ? 'Live' : 'Not ready'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs mb-3">
                  <span className="text-green-600 font-medium">{exam.approved} approved</span>
                  <span className="text-orange-500">{exam.flagged} flagged</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(seedStatus[exam.exam_id] === 'seeding' || seedStatus[exam.exam_id] === 'seeding_bg') ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                        <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Seeding...
                      </span>
                      <button onClick={() => handleCancelSeed(exam.exam_id)}
                        className="text-xs bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium transition-colors">
                        ✕ Cancel
                      </button>
                    </div>
                  ) : seedStatus[exam.exam_id] === 'done' ? (
                    <button onClick={() => { setSeedStatus(s => ({...s, [exam.exam_id]: null})); fetchStats() }}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium">
                      ✓ Done — Refresh
                    </button>
                  ) : seedStatus[exam.exam_id] === 'cancelled' ? (
                    <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">Cancelled</span>
                  ) : (
                    <button onClick={() => handleSeed(exam.exam_id)}
                      className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                      {exam.approved > 0 ? '+ Seed more' : '+ Seed questions'}
                    </button>
                  )}
                  <button onClick={() => { setTab('upload'); setUploadExam(exam.exam_id) }}
                    className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Upload PDF
                  </button>
                  {exam.flagged > 0 && (
                    <>
                      <button onClick={() => { setTab('flagged'); fetchFlagged(exam.exam_id) }}
                        className="text-xs border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                        Review flagged ({exam.flagged})
                      </button>
                      <button onClick={() => handleBulkApprove(exam.exam_id)} disabled={bulkLoading}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors font-medium">
                        {bulkLoading ? 'Approving...' : `✓ Approve all ${exam.flagged}`}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── Upload Syllabus view (existing) ──────────────────────────────
  const UploadView = () => (
    <div className="max-w-xl space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Upload Syllabus PDF</h2>
        <p className="text-sm text-gray-500 mt-0.5">Upload official syllabi to power RAG-grounded question generation</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Select Exam</label>
          <select value={uploadExam} onChange={e => setUploadExam(e.target.value)} className={inp}>
            <option value="">— Choose exam —</option>
            {EXAM_IDS.map(id => (
              <option key={id} value={id}>{EXAM_DISPLAY[id] || id.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Syllabus PDF <span className="text-gray-400 font-normal normal-case">(max 20MB)</span>
          </label>
          <input ref={fileRef} type="file" accept=".pdf" onChange={e => setUploadFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer" />
          {uploadFile && <div className="text-xs text-gray-500 mt-1">{uploadFile.name} · {(uploadFile.size/1024).toFixed(0)} KB</div>}
        </div>
        {uploadStatus && (
          <div className={`text-sm px-4 py-3 rounded-xl font-medium ${
            uploadStatus.startsWith('✓')    ? 'bg-green-50 text-green-700 border border-green-200'
            : uploadStatus.includes('failed') || uploadStatus.includes('Error') || uploadStatus.includes('large')
                                             ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>{uploadStatus}</div>
        )}
        <button onClick={handleUpload} disabled={!uploadExam || !uploadFile}
          className="w-full py-3 text-sm font-semibold rounded-xl text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition-colors shadow-lg shadow-orange-500/20">
          Upload PDF
        </button>
        {uploadStatus.startsWith('✓') && uploadExam && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-blue-900 mb-1">✓ PDF uploaded!</div>
            <div className="text-xs text-blue-700 mb-3">Next: Start RAG ingestion to process the PDF into the vector database (5-10 minutes).</div>
            <button onClick={() => handleIngest(uploadExam)}
              disabled={seedStatus[uploadExam] === 'ingesting' || seedStatus[uploadExam] === 'ingesting_bg'}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium">
              {seedStatus[uploadExam] === 'ingesting' ? 'Starting...'
               : seedStatus[uploadExam] === 'ingesting_bg' ? '⏳ Ingesting in background...'
               : 'Start RAG Ingestion'}
            </button>
            {seedStatus[uploadExam] === 'ingesting_bg' && (
              <div className="text-xs text-blue-600 mt-2">Ingestion running. When complete → go to Exam Management → Seed questions.</div>
            )}
          </div>
        )}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">How it works</div>
          <div className="space-y-2.5">
            {[
              'Upload official syllabus PDF here',
              'Click "Start RAG Ingestion" — PDF chunked + embedded into vector DB',
              'Exam Management → "Seed questions" — questions grounded in syllabus',
              'Exam appears live in student dropdown automatically',
            ].map((t, n) => (
              <div key={n} className="flex gap-3 text-xs text-gray-500 items-start">
                <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs">{n+1}</span>
                <span className="pt-0.5">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── Flagged Questions view (existing) ────────────────────────────
  const FlaggedView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Review Flagged Questions</h2>
          <p className="text-sm text-gray-500 mt-0.5">{flagged.length} questions awaiting review</p>
        </div>
        <div className="flex items-center gap-2">
          <select onChange={e => fetchFlagged(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">All exams</option>
            {EXAM_IDS.map(id => <option key={id} value={id}>{EXAM_DISPLAY[id] || id.replace(/_/g,' ')}</option>)}
          </select>
          {flagged.length > 0 && (
            <button onClick={() => handleBulkApprove('')} disabled={bulkLoading}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors font-semibold">
              {bulkLoading ? 'Approving...' : `✓ Approve all ${flagged.length}`}
            </button>
          )}
        </div>
      </div>
      {flagged.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">✓</div>
          <div className="text-gray-700 font-semibold">All clear!</div>
          <div className="text-sm text-gray-400 mt-1">No flagged questions to review.</div>
        </div>
      ) : (
        flagged.map(q => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex gap-1.5 flex-wrap">
                {[q.exam, q.section, q.topic, q.difficulty].map((tag, i) => tag && (
                  <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{tag}</span>
                ))}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {editingQ === q.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(q.id)} disabled={savingEdit}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 font-medium">
                      {savingEdit ? 'Saving...' : 'Save & Approve ✓'}
                    </button>
                    <button onClick={() => setEditingQ(null)}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleApprove(q.id)}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors">Approve ✓</button>
                    <button onClick={() => openEdit(q)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Edit ✎</button>
                    <button onClick={() => handleDelete(q.id)}
                      className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Delete ✗</button>
                  </>
                )}
              </div>
            </div>
            {editingQ !== q.id ? (
              <>
                <p className="text-sm text-gray-800 font-medium mb-3 leading-relaxed">{q.question_text}</p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {['a','b','c','d','e'].map(opt => {
                    const text = q[`option_${opt}`]
                    if (!text) return null
                    return (
                      <div key={opt}
                        className={`text-xs px-3 py-1.5 rounded-lg ${
                          q.correct_answer?.toUpperCase() === opt.toUpperCase()
                            ? 'bg-green-100 text-green-800 font-semibold border border-green-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {opt.toUpperCase()}) {text}
                        {q.correct_answer?.toUpperCase() === opt.toUpperCase() && ' ✓'}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">{q.explanation}</p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Question text</label>
                  <textarea rows={3} value={editData.question_text}
                    onChange={e => setEditData(d => ({...d, question_text: e.target.value}))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['a','b','c','d','e'].map(opt => (
                    <div key={opt}>
                      <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Option {opt.toUpperCase()}</label>
                      <input value={editData[`option_${opt}`] || ''}
                        onChange={e => setEditData(d => ({...d, [`option_${opt}`]: e.target.value}))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Correct answer</label>
                  <select value={editData.correct_answer}
                    onChange={e => setEditData(d => ({...d, correct_answer: e.target.value}))}
                    className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                    {['A','B','C','D','E'].map(opt => (
                      <option key={opt} value={opt}>{opt} — {editData[`option_${opt.toLowerCase()}`]?.substring(0,40)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Explanation</label>
                  <textarea rows={2} value={editData.explanation}
                    onChange={e => setEditData(d => ({...d, explanation: e.target.value}))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )

  // ── Scheduler view (existing) ────────────────────────────────────
  const SchedulerView = () => {
    const STEPS = [
      { icon: '📡', label: 'Fetch News',       sub: 'RSS feeds',         from: 0,   to: 20  },
      { icon: '🧠', label: 'Extract Entities', sub: 'Groq/Llama',        from: 20,  to: 60  },
      { icon: '✍️', label: 'Generate MCQs',   sub: '~20 questions',     from: 60,  to: 120 },
      { icon: '✅', label: 'Validate',         sub: 'Cross-check',       from: 120, to: 155 },
      { icon: '💾', label: 'Save',             sub: 'Review Flagged tab',from: 155, to: 180 },
    ]
    const done    = caStatus?.last_status === 'done'
    const running = caStatus?.running
    const activeStep = running ? STEPS.findLastIndex(s => elapsed >= s.from) : done ? STEPS.length - 1 : -1

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Scheduler</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage automated CA generation and scheduled tasks</p>
        </div>

        {/* Trigger card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-gray-800">Nightly Current Affairs Generator</h3>
              <p className="text-sm text-gray-500 mt-1">openai/gpt-oss-120b via Groq · Auto-runs daily at 00:00 IST · ~2–3 min · Free</p>
            </div>
            <button onClick={handleRunCa} disabled={caRunning || caStatus?.running}
              className="flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/20">
              {caRunning || caStatus?.running
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{`Running… ${elapsed}s`}</>
                : <>{Icons.play} Run Now</>}
            </button>
          </div>

          {/* Pipeline steps */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-0 text-xs overflow-x-auto pb-1">
              {STEPS.map((s, i) => {
                const isActive = i === activeStep && running
                const isDone   = done || (running && i < activeStep)
                return (
                  <div key={s.label} className="flex items-center shrink-0">
                    <div className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all
                      ${isActive ? 'bg-orange-50 border-orange-300 shadow-sm scale-105'
                        : isDone  ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-100'}`}>
                      <span className="text-base">{s.icon}</span>
                      <span className={`font-medium mt-0.5 text-xs ${isActive ? 'text-orange-700' : isDone ? 'text-green-700' : 'text-gray-600'}`}>{s.label}</span>
                      <span className={`text-xs ${isActive ? 'text-orange-500' : isDone ? 'text-green-500' : 'text-gray-400'}`}>
                        {isActive ? '⏳ in progress' : isDone ? '✓ done' : s.sub}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-5 h-0.5 mx-1 ${isDone ? 'bg-green-400' : running ? 'bg-orange-200' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
            {(running || done) && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-1.5 rounded-full transition-all duration-1000 ${done ? 'bg-green-500' : 'bg-orange-400'}`}
                     style={{ width: done ? '100%' : `${Math.min(100, (elapsed / 180) * 100).toFixed(1)}%` }} />
              </div>
            )}
          </div>

          {/* Status bar */}
          {caStatus && (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm
              ${caStatus.running
                ? 'bg-orange-50 border border-orange-200 text-orange-800'
                : caStatus.last_status === 'done'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : caStatus.last_status?.startsWith('failed') || caStatus.last_status?.startsWith('error')
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-gray-50 border border-gray-100 text-gray-500'}`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {caStatus.running && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                  <span className="font-medium">
                    {caStatus.running
                      ? `Running — elapsed ${Math.floor(elapsed/60)}m ${elapsed%60}s`
                      : caStatus.last_status === 'done' ? 'Last run completed successfully'
                      : caStatus.last_status || 'Idle — never run this session'}
                  </span>
                </div>
                {caStatus.started_at && (
                  <span className="text-xs opacity-70">Started: {new Date(caStatus.started_at).toLocaleTimeString()}</span>
                )}
              </div>
              {caStatus.running && (
                <p className="text-xs mt-1 opacity-70">
                  Typical run takes 2–3 min. Questions appear in <strong>Review Flagged</strong> tab when done.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Run history */}
        {caLog.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 text-sm">Run History</h4>
              <button onClick={fetchCaLog} className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium">
                {Icons.refresh} Refresh
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {caLog.map((run, i) => (
                <div key={i} className="px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <span className="font-semibold text-gray-700 w-28 shrink-0">{run.date}</span>
                  <span className="text-gray-400 text-xs">{new Date(run.run_at).toLocaleString()}</span>
                  <div className="flex gap-4 ml-auto text-xs flex-wrap">
                    <span className="text-blue-600">📡 {run.news_fetched ?? '—'} news</span>
                    <span className="text-purple-600">🧠 {run.entities_extracted ?? '—'} entities</span>
                    <span className="text-orange-600">✍️ {run.generated ?? '—'} generated</span>
                    <span className={`font-semibold ${(run.approved ?? 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ✅ {run.approved ?? '—'} approved
                    </span>
                    <span className="text-gray-400">⏱ {run.duration_secs}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info callout */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-orange-500 text-xl shrink-0">💡</span>
          <div className="text-sm">
            <p className="font-semibold text-orange-800">Where are the generated questions?</p>
            <p className="text-orange-700 mt-1">
              After each run, questions are saved with status <strong>flagged</strong>.
              Go to <button onClick={() => goTab('flagged')} className="underline font-semibold hover:text-orange-900">Review Flagged</button> to approve, edit, or delete them.
              Only <strong>approved</strong> questions enter the live test pool.
            </p>
          </div>
        </div>

        {/* Target exams */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">CA Target Exams</h4>
          <div className="flex flex-wrap gap-2">
            {SCHEDULER_EXAMS.map(e => (
              <span key={e} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full border border-orange-100 font-medium">
                {EXAM_DISPLAY[e] || e.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Current Affairs view ─────────────────────────────────────────
  const CAView = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Current Affairs</h2>
        <p className="text-sm text-gray-500 mt-0.5">Recent CA generation runs and status</p>
      </div>
      {caLog.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="text-gray-400 text-sm">No run history available.</div>
          <button onClick={() => goTab('scheduler')} className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium">
            Go to Scheduler →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-sm">Recent Runs</h4>
            <button onClick={fetchCaLog} className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium">
              {Icons.refresh} Refresh
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {caLog.map((run, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${(run.approved ?? 0) > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-semibold text-gray-800 text-sm">{run.date}</span>
                    <span className="text-gray-400 text-xs">{new Date(run.run_at).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-xs text-gray-400">⏱ {run.duration_secs}s</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    ['News', run.news_fetched ?? '—', 'text-blue-600'],
                    ['Entities', run.entities_extracted ?? '—', 'text-purple-600'],
                    ['Generated', run.generated ?? '—', 'text-orange-600'],
                    ['Approved', run.approved ?? '—', (run.approved ?? 0) > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                      <div className={`text-sm font-semibold ${cls}`}>{val}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Write Questions view ─────────────────────────────────────────
  const SECTIONS = ['Reasoning Ability','Quantitative Aptitude','English Language','General/Banking Awareness','Computer Knowledge','Current Affairs']
  const DIFFICULTIES = [{v:'easy',l:'Easy'},{v:'medium',l:'Medium'},{v:'hard',l:'Hard'}]

  const wf = (k,v) => setWriteForm(f => ({ ...f, [k]: v }))

  const handleWriteSubmit = async (andNew = false) => {
    if (!writeForm.exam) { showMsg('Please select an exam'); return }
    if (!writeForm.question_text.trim()) { showMsg('Question text is required'); return }
    if (!writeForm.option_a.trim() || !writeForm.option_b.trim() || !writeForm.option_c.trim() || !writeForm.option_d.trim()) {
      showMsg('Options A–D are required'); return
    }
    if (writeForm.has_e && !writeForm.option_e.trim()) { showMsg('Option E text is required when enabled'); return }
    setWriteSaving(true)
    try {
      const payload = {
        exam:          writeForm.exam,
        section:       writeForm.section || null,
        topic:         writeForm.topic || null,
        difficulty:    writeForm.difficulty,
        question_text: writeForm.question_text.trim(),
        option_a:      writeForm.option_a.trim(),
        option_b:      writeForm.option_b.trim(),
        option_c:      writeForm.option_c.trim(),
        option_d:      writeForm.option_d.trim(),
        option_e:      writeForm.has_e ? writeForm.option_e.trim() : '',
        correct_answer: writeForm.correct_answer,
        explanation:   writeForm.explanation.trim() || null,
      }
      const r = await api.post('/admin/question', payload, { headers })
      const saved = { ...payload, id: r.data.id, saved_at: new Date() }
      setWriteList(l => [saved, ...l])
      showMsg('Question saved ✓')
      if (andNew) {
        setWriteForm(f => ({
          exam: f.exam, section: f.section, topic: '', difficulty: f.difficulty,
          question_text:'', option_a:'', option_b:'', option_c:'', option_d:'', option_e:'',
          correct_answer:'A', explanation:'', has_e: false,
        }))
      }
      fetchStats()
    } catch(e) {
      showMsg('Error: ' + (e.response?.data?.error || e.message))
    } finally { setWriteSaving(false) }
  }

  const WriteQuestionsView = () => {
    const optionKeys = writeForm.has_e ? ['A','B','C','D','E'] : ['A','B','C','D']
    const optField = (letter) => `option_${letter.toLowerCase()}`
    const ta = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-white leading-relaxed"
    const inp2 = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
    const ANSWER_COLORS = { A:'#f97316', B:'#3b82f6', C:'#8b5cf6', D:'#10b981', E:'#ef4444' }

    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Write Questions</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manually author questions — saved directly as approved</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-xs font-medium text-orange-700">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            {writeList.length} saved this session
          </div>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(280px,1fr)' }}>

          {/* ── Left: Question editor ── */}
          <div className="space-y-4">

            {/* Metadata row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">Question Metadata</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Exam *</label>
                  <select value={writeForm.exam} onChange={e => wf('exam', e.target.value)} className={inp2}>
                    <option value="">— Select Exam —</option>
                    {EXAM_IDS.map(id => <option key={id} value={id}>{EXAM_DISPLAY[id] || id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Section</label>
                  <select value={writeForm.section} onChange={e => wf('section', e.target.value)} className={inp2}>
                    <option value="">— Select Section —</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Topic</label>
                  <input value={writeForm.topic} onChange={e => wf('topic', e.target.value)}
                    placeholder="e.g. Syllogism, Profit & Loss…" className={inp2} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(d => (
                      <button key={d.v} onClick={() => wf('difficulty', d.v)}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl border transition-all"
                        style={{
                          background: writeForm.difficulty === d.v ? (d.v==='easy'?'#dcfce7':d.v==='medium'?'#fef9c3':'#fee2e2') : '#f9fafb',
                          borderColor: writeForm.difficulty === d.v ? (d.v==='easy'?'#86efac':d.v==='medium'?'#fde047':'#fca5a5') : '#e5e7eb',
                          color: writeForm.difficulty === d.v ? (d.v==='easy'?'#15803d':d.v==='medium'?'#854d0e':'#b91c1c') : '#6b7280',
                        }}>
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Question text */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Question Text *</label>
              <textarea rows={4} value={writeForm.question_text} onChange={e => wf('question_text', e.target.value)}
                placeholder="Enter the question here…" className={ta} />
            </div>

            {/* Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Answer Options *</label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative" onClick={() => { wf('has_e', !writeForm.has_e); if (writeForm.has_e && writeForm.correct_answer === 'E') wf('correct_answer','A') }}>
                    <div className="w-9 h-5 rounded-full transition-colors" style={{background: writeForm.has_e ? '#f97316':'#d1d5db'}} />
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{left: writeForm.has_e?'auto':'2px', right: writeForm.has_e?'2px':'auto'}} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Option E</span>
                </label>
              </div>
              <div className="space-y-2.5">
                {optionKeys.map(letter => {
                  const color = ANSWER_COLORS[letter]
                  const isSelected = writeForm.correct_answer === letter
                  return (
                    <div key={letter} className="flex items-start gap-3">
                      <button onClick={() => wf('correct_answer', letter)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all mt-1.5"
                        title="Mark as correct answer"
                        style={{
                          background: isSelected ? color : '#f3f4f6',
                          color: isSelected ? '#fff' : '#9ca3af',
                          border: `2px solid ${isSelected ? color : '#e5e7eb'}`,
                          boxShadow: isSelected ? `0 2px 8px ${color}55` : 'none',
                        }}>
                        {letter}
                      </button>
                      <textarea rows={2} value={writeForm[optField(letter)]} onChange={e => wf(optField(letter), e.target.value)}
                        placeholder={`Option ${letter}…`}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none leading-snug bg-white"
                        style={{
                          borderColor: isSelected ? color : '#e5e7eb',
                          boxShadow: isSelected ? `0 0 0 1px ${color}30` : 'none',
                        }}
                        onFocus={e => { if (!isSelected) { e.currentTarget.style.borderColor='#f97316'; e.currentTarget.style.boxShadow='0 0 0 2px #f9731630' }}}
                        onBlur={e => { if (!isSelected) { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='none' }}}
                      />
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Click the letter badge to mark the correct answer</p>
            </div>

            {/* Explanation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Explanation <span className="normal-case text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={3} value={writeForm.explanation} onChange={e => wf('explanation', e.target.value)}
                placeholder="Explain why the answer is correct…" className={ta} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pb-6">
              <button onClick={() => handleWriteSubmit(true)} disabled={writeSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                style={{ background: '#f97316', color: '#fff', boxShadow: '0 2px 10px #f9731640' }}
                onMouseOver={e => !writeSaving && (e.currentTarget.style.background='#ea6b10')}
                onMouseOut={e => (e.currentTarget.style.background='#f97316')}>
                {writeSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : Icons.add}
                Save & New
              </button>
              <button onClick={() => handleWriteSubmit(false)} disabled={writeSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border transition-all disabled:opacity-50"
                style={{ background: '#fff', color: '#374151', borderColor: '#d1d5db' }}
                onMouseOver={e => !writeSaving && (e.currentTarget.style.background='#f9fafb')}
                onMouseOut={e => (e.currentTarget.style.background='#fff')}>
                {Icons.check}
                Save & Keep
              </button>
            </div>
          </div>

          {/* ── Right: Session history ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ position: 'sticky', top: 16 }}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">Session Questions</h3>
                <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{writeList.length}</span>
              </div>
              {writeList.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    {Icons.write}
                  </div>
                  <div className="text-sm font-medium text-gray-500">No questions yet</div>
                  <div className="text-xs text-gray-400 mt-1">Questions you save will appear here</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {writeList.map((q, i) => (
                    <div key={q.id || i} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-orange-500">#{writeList.length - i}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{EXAM_DISPLAY[q.exam] || q.exam}</span>
                          <span className="text-xs rounded-full px-2 py-0.5 font-medium"
                            style={{background: q.difficulty==='easy'?'#dcfce7':q.difficulty==='hard'?'#fee2e2':'#fef9c3', color: q.difficulty==='easy'?'#15803d':q.difficulty==='hard'?'#b91c1c':'#854d0e'}}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{q.question_text}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {['A','B','C','D', q.option_e?'E':null].filter(Boolean).map(l => (
                          <span key={l} className="text-xs rounded px-1.5 py-0.5 font-semibold"
                            style={{background: q.correct_answer===l ? '#f97316':'#f3f4f6', color: q.correct_answer===l?'#fff':'#9ca3af'}}>
                            {l}
                          </span>
                        ))}
                        {q.section && <span className="text-xs text-gray-400 ml-1 truncate">{q.section}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {writeList.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <button onClick={() => setWriteList([])} className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1">
                    {Icons.trash} Clear session history
                  </button>
                </div>
              )}
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-semibold text-blue-700">Tips</div>
              <ul className="space-y-1.5 text-xs text-blue-600">
                <li>• Click the letter badge (A/B/C/D) to set the correct answer</li>
                <li>• <b>Save & New</b> clears the form but keeps exam/section</li>
                <li>• <b>Save & Keep</b> stays on the same question for further edits</li>
                <li>• All saved questions are auto-approved in the database</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile stacking media query */}
        <style>{`@media(max-width:900px){.wq-grid{grid-template-columns:1fr!important}}`}</style>
      </div>
    )
  }

  // ── Placeholder views ────────────────────────────────────────────
  const PlaceholderView = ({ title, desc }) => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-300"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <div className="text-gray-700 font-semibold">Coming Soon</div>
        <div className="text-sm text-gray-400 mt-1">This section is under development.</div>
      </div>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        {/* Toast */}
        {actionMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400 flex-shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            {actionMsg}
          </div>
        )}

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 lg:px-7 py-4" style={{ maxWidth: 1800, boxSizing: 'border-box' }}>
            {tab === 'dashboard' && <DashboardView />}
            {tab === 'exams'     && <ExamsView />}
            {tab === 'write'     && <WriteQuestionsView />}
            {tab === 'upload'    && <UploadView />}
            {tab === 'flagged'   && <FlaggedView />}
            {tab === 'scheduler' && <SchedulerView />}
            {tab === 'ca'        && <CAView />}
            {tab === 'analytics' && <PlaceholderView title="Reports & Analytics" desc="Performance analytics and question insights coming soon." />}
            {tab === 'settings'  && <PlaceholderView title="Settings" desc="Admin configuration settings coming soon." />}
          </div>
        </main>
      </div>
    </div>
  )
}
