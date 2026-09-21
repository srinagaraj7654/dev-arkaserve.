import { useState, useEffect } from 'react'

/* ──────────────────────────────────────────────────────────────
   Public "Exams" page — category filtering, FAQ JSON-LD, BreadcrumbList
────────────────────────────────────────────────────────────── */

const T = {
  numerical: ['Simplification','Number Series','Data Interpretation','Quadratic Equations','Percentage','Profit & Loss','Ratio & Proportion','Time & Work','Time & Distance','Average','Mensuration','Simple & Compound Interest','Probability','Permutation & Combination'],
  reasoning: ['Puzzles & Seating','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Order & Ranking','Alphanumeric Series','Input-Output','Data Sufficiency'],
  english:   ['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement','Vocabulary','Word Usage'],
  ga:        ['Current Affairs (6 months)','Banking Awareness','RBI & Monetary Policy','Financial & Economic Terms','Government Schemes','Static GK'],
  computer:  ['Computer Fundamentals','MS Office','Internet & Networking','Hardware & Software','Security Basics','Shortcut Keys'],
}

const SEC_COLOR = {
  English:'#16a34a', 'Numerical Ability':'#f59e0b', 'Quantitative Aptitude':'#f59e0b',
  'Reasoning Ability':'#7048e8', 'Reasoning & Computer Aptitude':'#7048e8',
  'General/Financial Awareness':'#0891b2', 'General Awareness':'#0891b2',
  'Data Analysis & Interpretation':'#f59e0b', 'Computer Knowledge':'#7048e8',
}

const EXAMS = [
  { group:'IBPS', category:'banking', id:'ibps_clerk_pre', name:'IBPS Clerk', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'IBPS', category:'banking', id:'ibps_clerk_mains', name:'IBPS Clerk', level:'Mains', total:190, duration:'160 min', negative:0.25,
    sections:[
      { label:'General/Financial Awareness', q:50, mins:35, topics:T.ga },
      { label:'English', q:40, mins:35, topics:T.english },
      { label:'Reasoning & Computer Aptitude', q:50, mins:45, topics:[...T.reasoning, ...T.computer] },
      { label:'Quantitative Aptitude', q:50, mins:45, topics:T.numerical },
    ]},
  { group:'IBPS', category:'banking', id:'ibps_po_pre', name:'IBPS PO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'IBPS', category:'banking', id:'ibps_po_mains', name:'IBPS PO', level:'Mains', total:155, duration:'180 min', negative:0.25,
    sections:[
      { label:'Reasoning & Computer Aptitude', q:45, mins:60, topics:[...T.reasoning, ...T.computer] },
      { label:'Data Analysis & Interpretation', q:35, mins:45, topics:T.numerical },
      { label:'General/Financial Awareness', q:40, mins:35, topics:T.ga },
      { label:'English', q:35, mins:40, topics:T.english },
    ]},
  { group:'SBI', category:'banking', id:'sbi_clerk_pre', name:'SBI Clerk', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'SBI', category:'banking', id:'sbi_clerk_mains', name:'SBI Clerk', level:'Mains', total:190, duration:'160 min', negative:0.25,
    sections:[
      { label:'General/Financial Awareness', q:50, mins:35, topics:T.ga },
      { label:'English', q:40, mins:35, topics:T.english },
      { label:'Quantitative Aptitude', q:50, mins:45, topics:T.numerical },
      { label:'Reasoning & Computer Aptitude', q:50, mins:45, topics:[...T.reasoning, ...T.computer] },
    ]},
  { group:'SBI', category:'banking', id:'sbi_po_pre', name:'SBI PO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'SBI', category:'banking', id:'sbi_po_mains', name:'SBI PO', level:'Mains', total:155, duration:'180 min', negative:0.25,
    sections:[
      { label:'Reasoning & Computer Aptitude', q:40, mins:50, topics:[...T.reasoning, ...T.computer] },
      { label:'Data Analysis & Interpretation', q:30, mins:45, topics:T.numerical },
      { label:'General/Financial Awareness', q:40, mins:35, topics:T.ga },
      { label:'English', q:35, mins:40, topics:T.english },
    ]},
  { group:'RRB', category:'banking', id:'rrb_office_assistant_prelims', name:'RRB Office Assistant', level:'Prelims', total:80, duration:'45 min', negative:0.25,
    sections:[
      { label:'Numerical Ability', q:40, mins:'—', topics:T.numerical },
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
    ]},
  { group:'RRB', category:'banking', id:'rrb_office_assistant_mains', name:'RRB Office Assistant', level:'Mains', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
      { label:'Numerical Ability', q:40, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:40, mins:'—', topics:T.ga },
      { label:'English / Hindi', q:40, mins:'—', topics:T.english },
      { label:'Computer Knowledge', q:40, mins:'—', topics:T.computer },
    ]},
  { group:'RRB', category:'banking', id:'rrb_officer_scale1_prelims', name:'RRB Officer Scale I', level:'Prelims', total:80, duration:'45 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
      { label:'Quantitative Aptitude', q:40, mins:'—', topics:T.numerical },
    ]},
  { group:'RRB', category:'banking', id:'rrb_officer_scale1_mains', name:'RRB Officer Scale I', level:'Mains', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
      { label:'Quantitative Aptitude', q:40, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:40, mins:'—', topics:T.ga },
      { label:'English', q:40, mins:'—', topics:T.english },
      { label:'Computer Knowledge', q:40, mins:'—', topics:T.computer },
    ]},
  { group:'RBI', category:'banking', id:'rbi_assistant_pre', name:'RBI Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'RBI', category:'banking', id:'rbi_assistant_mains', name:'RBI Assistant', level:'Mains', total:200, duration:'135 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:30, topics:T.reasoning },
      { label:'English', q:40, mins:30, topics:T.english },
      { label:'Numerical Ability', q:40, mins:30, topics:T.numerical },
      { label:'General Awareness', q:40, mins:25, topics:T.ga },
      { label:'Computer Knowledge', q:40, mins:20, topics:T.computer },
    ]},
  { group:'RBI', category:'banking', id:'rbi_gradeb_p1', name:'RBI Grade B', level:'Phase 1', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'General Awareness', q:80, mins:25, topics:T.ga },
      { label:'English', q:30, mins:25, topics:T.english },
      { label:'Quantitative Aptitude', q:30, mins:25, topics:T.numerical },
      { label:'Reasoning Ability', q:60, mins:45, topics:T.reasoning },
    ]},
  { group:'NABARD', category:'banking', id:'nabard_gradeA_pre', name:'NABARD Grade A', level:'Prelims', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:20, mins:'—', topics:T.reasoning },
      { label:'English', q:40, mins:'—', topics:T.english },
      { label:'Quantitative Aptitude', q:20, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:20, mins:'—', topics:T.ga },
      { label:'Computer Knowledge', q:20, mins:'—', topics:T.computer },
    ]},
  { group:'NABARD', category:'banking', id:'nabard_da_pre', name:'NABARD Development Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:20, mins:'—', topics:T.reasoning },
      { label:'English', q:40, mins:'—', topics:T.english },
      { label:'Numerical Ability', q:20, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:20, mins:'—', topics:T.ga },
    ]},
  { group:'LIC', category:'insurance', id:'lic_aao_pre', name:'LIC AAO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
      { label:'English', q:30, mins:20, topics:T.english },
    ]},
  { group:'LIC', category:'insurance', id:'lic_assistant_pre', name:'LIC Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
    ]},
  { group:'LIC', category:'insurance', id:'lic_ado_pre', name:'LIC ADO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'English', q:30, mins:20, topics:T.english },
    ]},
  { group:'Insurance', category:'insurance', id:'niacl_assistant_pre', name:'NIACL Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
    ]},
  { group:'Insurance', category:'insurance', id:'nicl_ao_pre', name:'NICL AO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
    ]},
  { group:'India Post', category:'insurance', id:'ippb_officer', name:'IPPB Officer (Scale I)', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
    ]},
]

const CATEGORY_META = {
  banking:     { label:'Banking', title:'Bank & Government Financial Exams', subtitle:'IBPS · SBI · RRB · RBI · NABARD — pick an exam to see sections, question counts, timing and syllabus.', groups:['IBPS','SBI','RRB','RBI','NABARD','LIC','Insurance','India Post'] },
  insurance:   { label:'Insurance', title:'Insurance Sector Exams', subtitle:'LIC · NIACL · NICL · IPPB — detailed exam patterns with sections, question counts and timing.', groups:['LIC','Insurance','India Post'] },
  ssc:         { label:'SSC', title:'Staff Selection Commission Exams', subtitle:'SSC CGL · CHSL · MTS · CPO — coming soon with full tier-wise mock tests.', groups:[] },
  engineering: { label:'Engineering', title:'Engineering & Technical Exams', subtitle:'GATE · ESE · JEE Mains · JEE Advanced — coming soon with subject-wise practice.', groups:[] },
}

const CATEGORY_FAQ = {
  banking: [
    { q:'How many questions are in IBPS Clerk Prelims?', a:'IBPS Clerk Prelims has 100 questions — 30 English, 35 Numerical Ability, 35 Reasoning Ability — to be completed in 60 minutes with sectional timing.' },
    { q:'What is the negative marking in IBPS and SBI exams?', a:'Both IBPS and SBI exams carry a penalty of 0.25 marks (1/4) for each wrong answer. There is no negative marking for unattempted questions.' },
    { q:'Is this banking mock test free?', a:'Yes. All banking mock tests on MockTest are completely free. You can attempt IBPS, SBI, RRB and RBI mock tests without any payment.' },
    { q:'How many questions are in SBI PO Prelims?', a:'SBI PO Prelims has 100 questions — 30 English, 35 Quantitative Aptitude, 35 Reasoning Ability — to be completed in 60 minutes with separate sectional time limits.' },
    { q:'What topics are covered in the IBPS PO Mains?', a:'IBPS PO Mains covers Reasoning & Computer Aptitude (45Q), Data Analysis & Interpretation (35Q), General/Financial Awareness (40Q) and English (35Q) in 180 minutes.' },
    { q:'What is the difference between IBPS PO and SBI PO?', a:'IBPS PO recruits for multiple public sector banks other than SBI, while SBI PO is specifically for the State Bank of India. Both have similar prelims patterns but SBI PO generally has a higher cut-off and different mains pattern.' },
  ],
  insurance: [
    { q:'How many questions are in LIC AAO Prelims?', a:'LIC AAO Prelims has 100 questions — 35 Reasoning, 35 Quantitative Aptitude, 30 English — in 60 minutes with sectional time limits of 20 minutes each.' },
    { q:'Is the LIC AAO mock test free?', a:'Yes. LIC AAO, LIC Assistant and LIC ADO mock tests on MockTest are completely free to attempt.' },
    { q:'What is the difference between LIC AAO and LIC Assistant?', a:'LIC AAO (Assistant Administrative Officer) is a Grade I officer post requiring graduation, while LIC Assistant is a clerical grade post. AAO has higher responsibilities and better pay scale.' },
    { q:'What topics are covered in NIACL Assistant Prelims?', a:'NIACL Assistant Prelims has 100 questions — 30 English, 35 Reasoning, 35 Numerical Ability — in 60 minutes. Topics include RC, cloze test, puzzles, syllogism, DI and number series.' },
  ],
  ssc: [
    { q:'What exams does SSC conduct?', a:'SSC conducts CGL (Combined Graduate Level), CHSL (Combined Higher Secondary Level), MTS (Multi-Tasking Staff), CPO (Central Police Organisation) and various other recruitment exams.' },
    { q:'Is SSC CGL mock test available on MockTest?', a:'SSC CGL mock tests are coming soon. We are building comprehensive SSC mock tests with Tier 1 and Tier 2 patterns. Register now to be notified.' },
  ],
  engineering: [
    { q:'Does MockTest have GATE mock tests?', a:'GATE and JEE mock tests are coming soon. MockTest will cover GATE, ESE (IES), JEE Mains and JEE Advanced with subject-wise practice and full-length mocks.' },
    { q:'Which engineering exams will be covered?', a:'MockTest will cover GATE (all major branches), ESE/IES, JEE Mains, JEE Advanced and other engineering entrance and recruitment exams.' },
  ],
}

function injectJsonLD(id, data) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}
function removeJsonLD(id) {
  const el = document.getElementById(id)
  if (el) el.remove()
}

export default function ExamsPage({ onNav, category }) {
  const catKey  = category || 'banking'
  const meta    = CATEGORY_META[catKey] || CATEGORY_META.banking
  const faqs    = CATEGORY_FAQ[catKey] || []
  const visibleExams = category ? EXAMS.filter(e => e.category === catKey) : EXAMS
  const allGroups = category
    ? [...new Set(visibleExams.map(e => e.group))]
    : [...new Set(EXAMS.map(e => e.group))]

  const defaultExam = visibleExams[0]
  const [sel, setSel] = useState(defaultExam?.id)
  const [openGroups, setOpenGroups] = useState({})
  const exam = visibleExams.find(e => e.id === sel) || visibleExams[0]

  // reset selection when category changes
  useEffect(() => {
    const first = visibleExams[0]
    setSel(first?.id)
    setOpenGroups({})
  }, [catKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // BreadcrumbList + FAQ JSON-LD
  useEffect(() => {
    const BASE = 'https://prep.arkaserve.com'
    const catPath = category ? `/exams/${category}` : '/exams'
    injectJsonLD('ld-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type':'ListItem', position:1, name:'Home',  item:`${BASE}/` },
        { '@type':'ListItem', position:2, name:'Exams', item:`${BASE}/exams` },
        ...(category ? [{ '@type':'ListItem', position:3, name:meta.label, item:`${BASE}${catPath}` }] : []),
      ],
    })
    if (faqs.length) {
      injectJsonLD('ld-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type':'Answer', text: f.a },
        })),
      })
    }
    return () => { removeJsonLD('ld-breadcrumb'); removeJsonLD('ld-faq') }
  }, [catKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = g => setOpenGroups(p => ({ [g]: !p[g] }))

  const CATEGORY_TABS = [
    { key:'exams-banking',     label:'Banking',     icon:'🏦' },
    { key:'exams-insurance',   label:'Insurance',   icon:'🛡' },
    { key:'exams-ssc',         label:'SSC',         icon:'📋', soon:true },
    { key:'exams-engineering', label:'Engineering', icon:'⚙',  soon:true },
  ]

  const isComingSoon = !visibleExams.length

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* Category tab bar */}
      <div className="border-b border-gray-200 bg-white sticky top-[58px] z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 py-2 overflow-x-auto">
          {CATEGORY_TABS.map(t => {
            const active = t.key === (category ? `exams-${category}` : 'exams-banking')
            return (
              <button key={t.key} onClick={() => onNav?.(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${active ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                style={active ? { background:'#FF653F' } : {}}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.soon && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">Soon</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Coming soon state */}
      {isComingSoon ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="text-5xl mb-4">{catKey === 'ssc' ? '📋' : '⚙'}</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{meta.title} — Coming Soon</h1>
          <p className="text-gray-500 text-sm max-w-md mb-6">{meta.subtitle}</p>
          <button onClick={() => onNav?.('auth')}
            className="text-white text-sm font-bold px-6 py-3 rounded-xl transition-all" style={{ background:'#FF653F' }}
            onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
            onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
            Notify Me When Live →
          </button>
          {/* FAQ for coming-soon pages */}
          {faqs.length > 0 && (
            <div className="mt-16 w-full max-w-2xl text-left">
              <h2 className="text-lg font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((f,i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{f.q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-1">

          {/* LEFT RAIL */}
          <aside className="hidden md:block md:w-72 flex-shrink-0 bg-white md:border-r border-gray-200 md:sticky md:top-[105px] md:self-start md:h-[calc(100vh-105px)] overflow-y-auto">
            <div className="px-4 py-4">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#FF653F' }}>Choose an exam</div>
              {allGroups.map(group => {
                const groupExams = visibleExams.filter(e => e.group === group)
                const families = [...new Set(groupExams.map(e => e.name))].map(name => ({
                  name, short: name.replace(group + ' ', ''),
                  exams: groupExams.filter(e => e.name === name),
                }))
                const open = !!openGroups[group]
                return (
                  <div key={group} className="mb-1.5">
                    <button onClick={()=>toggle(group)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors">
                      <span>{group} Exams</span>
                      <span className={`text-gray-400 text-xs transition-transform ${open?'rotate-180':''}`}>▼</span>
                    </button>
                    {open && (
                      <div className="pl-2 pt-0.5 pb-1">
                        {families.map(fam => (
                          <div key={fam.name} className="mb-2">
                            <div className="flex items-center gap-1.5 px-3 mb-1">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#FF653F' }}/>
                              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color:'#FF653F' }}>{fam.short}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 ml-3 pl-2 border-l-2 border-gray-100">
                              {fam.exams.map(e => {
                                const active = e.id===sel
                                return (
                                  <button key={e.id} onClick={()=>setSel(e.id)}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${active?'text-white font-bold':'text-gray-700 hover:bg-gray-100 font-medium'}`}
                                    style={active?{background:'#FF653F'}:{}}>
                                    <span>{e.level}</span>
                                    <span className={`text-xs ${active?'text-white/80':'text-gray-400'}`}>{e.total}Q</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* RIGHT — exam details */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="px-4 sm:px-6 py-5">

              <div className="mb-3">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Explore <span style={{color:'#FF653F'}}>{meta.title}</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">{meta.subtitle}</p>
              </div>

              {/* Mobile selectors */}
              <div className="md:hidden mb-4">
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'#FF653F' }}>Choose an exam</div>
                <div className="grid grid-cols-1 gap-2">
                  <select value={exam?.group || ''}
                    onChange={e => { const first = visibleExams.find(x => x.group === e.target.value); if (first) setSel(first.id) }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400">
                    {allGroups.map(g => <option key={g} value={g}>{g} Exams</option>)}
                  </select>
                  <select value={sel} onChange={e => setSel(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400">
                    {visibleExams.filter(x => x.group === exam?.group).map(x => <option key={x.id} value={x.id}>{x.name} — {x.level}</option>)}
                  </select>
                </div>
              </div>

              {exam && (
                <main>
                  {/* Overview bar */}
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between flex-wrap gap-3" style={{ boxShadow:'0 2px 10px rgba(17,17,17,.05)' }}>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-gray-900">{exam.name}</h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:'#FFF3EE', color:'#FF653F' }}>{exam.level}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[[`${exam.total}`,'Questions'],[exam.duration,'Duration'],[exam.negative>0?`-${exam.negative}`:'None','Negative']].map(([v,l])=>(
                        <div key={l} className="flex items-baseline gap-1.5 rounded-lg px-3 py-1" style={{ background:'#FFF8F4', border:'1px solid #fde8dc' }}>
                          <span className="text-sm font-black" style={{ color:'#FF653F' }}>{v}</span>
                          <span className="text-[11px] text-gray-500">{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section cards */}
                  <div className="space-y-3">
                    {exam.sections.map(s=>{
                      const c = SEC_COLOR[s.label] || '#FF653F'
                      return (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4" style={{ boxShadow:'0 2px 8px rgba(17,17,17,.05)' }}>
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ background:c }}/>
                              <span className="font-bold text-gray-900 text-base">{s.label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-black" style={{ color:c }}>{s.q} Q</span>
                              {s.mins!=='—' && <span className="text-gray-400">{s.mins} min</span>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {s.topics.map(t=>(
                              <span key={t} className="text-[13px] px-3 py-1 rounded-full font-medium"
                                style={{ background:`${c}14`, color:c }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* CTA */}
                  <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center" style={{ background:'#1a1a2e' }}>
                    <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                      Ready to attempt <span style={{ color:'#FF653F' }}>{exam.name} {exam.level}</span>?
                    </h2>
                    <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,.7)' }}>
                      Free mock test with sectional timing, instant explanations and AI-powered weakness analysis.
                    </p>
                    <button onClick={()=>onNav?.('auth')}
                      className="text-white text-sm font-bold px-7 py-3 rounded-xl transition-all" style={{ background:'#FF653F' }}
                      onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                      onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                      🚀 Start Free Mock →
                    </button>
                  </div>

                  {/* FAQ section */}
                  {faqs.length > 0 && (
                    <div className="mt-10">
                      <h2 className="text-xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
                      <div className="space-y-3">
                        {faqs.map((f,i) => (
                          <div key={i} className="border border-gray-200 rounded-xl p-4">
                            <h3 className="font-bold text-gray-900 text-sm mb-1">{f.q}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </main>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
