import { useState, useEffect } from 'react'

/* ──────────────────────────────────────────────────────────────
   Syllabus Page — topic-by-topic breakdown for every exam category
────────────────────────────────────────────────────────────── */

const CATS = [
  { key:'banking',     label:'Banking' },
  { key:'insurance',   label:'Insurance' },
  { key:'ssc',         label:'SSC' },
  { key:'railway',     label:'Railway' },
  { key:'engineering', label:'Engineering' },
  { key:'medical',     label:'Medical' },
]

const SYLLABUS = {
  banking: [
    { exam:'IBPS / SBI Clerk & PO', stage:'Prelims', sections:[
      { name:'English Language', color:'#16a34a', topics:['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement','Vocabulary','Word Usage','Phrase Replacement'] },
      { name:'Numerical Ability', color:'#f59e0b', topics:['Simplification','Number Series','Quadratic Equations','Data Interpretation','Percentage','Profit & Loss','Ratio & Proportion','Time & Work','Time & Distance','Average','SI & CI','Mensuration','Probability'] },
      { name:'Reasoning Ability', color:'#7048e8', topics:['Puzzles & Seating Arrangement','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Order & Ranking','Alphanumeric Series','Input-Output','Data Sufficiency'] },
    ]},
    { exam:'IBPS / SBI PO', stage:'Mains', sections:[
      { name:'General/Financial Awareness', color:'#0891b2', topics:['Current Affairs (6 months)','Banking Awareness','RBI & Monetary Policy','Financial & Economic Terms','Government Schemes','Budget & Five-Year Plans','Static GK','Awards & Honours','Sports','International Affairs'] },
      { name:'Data Analysis & Interpretation', color:'#f59e0b', topics:['Data Tables','Pie Charts','Bar & Line Graphs','Missing DI','Caselet DI','Quantity Comparison','Data Sufficiency'] },
      { name:'Reasoning & Computer Aptitude', color:'#7048e8', topics:['Puzzles','Input-Output','Statement & Conclusion','Course of Action','Computer Fundamentals','MS Office','Internet & Networking','Hardware & Software','Security Basics'] },
      { name:'English Language', color:'#16a34a', topics:['RC — Long Passage','Reading Comprehension','Sentence Connectors','Paragraph Completion','Summary Writing','Inference-based Questions'] },
    ]},
    { exam:'RBI Grade B', stage:'Phase 1', sections:[
      { name:'English', color:'#16a34a', topics:['Reading Comprehension','Vocabulary','Grammar','Verbal Ability'] },
      { name:'Quantitative Aptitude', color:'#f59e0b', topics:['Data Interpretation','Number Series','Arithmetic','Probability','Permutation & Combination'] },
      { name:'Reasoning', color:'#7048e8', topics:['Puzzles','Analytical Reasoning','Statement & Argument','Decision Making'] },
      { name:'General Awareness', color:'#0891b2', topics:['Economy','Finance','Current Affairs','Banking Awareness','Static GK'] },
    ]},
  ],
  insurance: [
    { exam:'LIC AAO', stage:'Prelims', sections:[
      { name:'Reasoning Ability', color:'#7048e8', topics:['Puzzles','Seating Arrangement','Syllogism','Coding-Decoding','Blood Relations','Direction Sense','Inequality'] },
      { name:'Quantitative Aptitude', color:'#f59e0b', topics:['Data Interpretation','Number Series','Arithmetic','Quadratic Equations','Data Sufficiency'] },
      { name:'English with Comprehension', color:'#16a34a', topics:['Reading Comprehension','Grammar','Vocabulary','Para Jumbles','Sentence Correction'] },
    ]},
    { exam:'NIACL Assistant', stage:'Prelims', sections:[
      { name:'English Language', color:'#16a34a', topics:['RC','Error Detection','Cloze Test','Vocabulary','Para Jumbles'] },
      { name:'Reasoning Ability', color:'#7048e8', topics:['Puzzles','Coding','Blood Relations','Direction','Syllogism'] },
      { name:'Numerical Ability', color:'#f59e0b', topics:['DI','Simplification','Arithmetic','Number Series'] },
    ]},
    { exam:'LIC ADO / LIC HFL', stage:'Mains', sections:[
      { name:'Reasoning & Numerical Ability', color:'#7048e8', topics:['High-Level Puzzles','DI & Caselet','Quantity-based Questions','Data Sufficiency'] },
      { name:'General Knowledge & Current Affairs', color:'#0891b2', topics:['Insurance Industry Basics','IRDAI Regulations','Current Affairs','Economic Survey Highlights','Static GK'] },
      { name:'English Language', color:'#16a34a', topics:['RC — Insurance passage','Summary Writing','Error Correction','Vocabulary'] },
    ]},
  ],
  ssc: [
    { exam:'SSC CGL', stage:'Tier I', sections:[
      { name:'General Intelligence & Reasoning', color:'#7048e8', topics:['Analogies','Classifications','Series Completion','Coding-Decoding','Blood Relations','Directions','Venn Diagrams','Non-Verbal Reasoning','Syllogism','Matrix','Paper Folding & Cutting','Missing Number','Statement & Conclusion'] },
      { name:'General Awareness', color:'#0891b2', topics:['History of India','Indian Polity','Geography','Economics','General Science','Current Affairs','Static GK','Sports','Environment & Ecology','Science & Technology'] },
      { name:'Quantitative Aptitude', color:'#f59e0b', topics:['Number System','HCF & LCM','Percentage','Ratio & Proportion','Profit & Loss','SI & CI','Time & Work','Speed & Distance','Geometry','Trigonometry','Algebra','Average','Mensuration','Data Interpretation'] },
      { name:'English Comprehension', color:'#16a34a', topics:['Reading Comprehension','Fill in the Blanks','Error Detection','Sentence Improvement','Synonyms & Antonyms','Idioms & Phrases','One Word Substitution','Cloze Test','Para Jumbles','Sentence Rearrangement'] },
    ]},
    { exam:'SSC CGL', stage:'Tier II', sections:[
      { name:'Mathematical Abilities', color:'#f59e0b', topics:['Advanced Arithmetic','Geometry & Mensuration','Algebra','Trigonometry','Data Interpretation & Analysis'] },
      { name:'Reasoning & GI', color:'#7048e8', topics:['Advanced Reasoning','Non-Verbal Reasoning','Critical Thinking','Decision Making'] },
      { name:'English Language & Comprehension', color:'#16a34a', topics:['Advanced RC','Para Summary','Sentence Improvement','Fill in the Blanks','Cloze Test'] },
      { name:'General Awareness', color:'#0891b2', topics:['Current Affairs','Static GK','Computer Proficiency','Finance & Economics'] },
    ]},
    { exam:'SSC CHSL', stage:'Tier I', sections:[
      { name:'English Language', color:'#16a34a', topics:['Vocabulary','Grammar','Reading Comprehension','Para Jumbles','Fill in the Blanks'] },
      { name:'General Intelligence', color:'#7048e8', topics:['Analogies','Classification','Series','Coding-Decoding','Non-Verbal Reasoning'] },
      { name:'Quantitative Aptitude', color:'#f59e0b', topics:['Arithmetic','Algebra','Geometry','Trigonometry','Statistics & DI'] },
      { name:'General Awareness', color:'#0891b2', topics:['History','Geography','Polity','Economy','Science','Current Affairs'] },
    ]},
    { exam:'SSC MTS / GD', stage:'Tier I', sections:[
      { name:'Numerical Ability', color:'#f59e0b', topics:['Number System','Percentage','Profit & Loss','Ratio','Time & Work','Geometry','Mensuration'] },
      { name:'General Intelligence', color:'#7048e8', topics:['Analogies','Similarities & Differences','Visual Memory','Observation','Non-Verbal Reasoning'] },
      { name:'English', color:'#16a34a', topics:['Basics of Grammar','Fill in the Blanks','Error Spotting','Vocabulary'] },
      { name:'General Awareness', color:'#0891b2', topics:['India & World','Sports','History','Culture','Economic Scene','Geography','General Polity','Scientific Research'] },
    ]},
  ],
  railway: [
    { exam:'RRB NTPC', stage:'CBT 1 & 2', sections:[
      { name:'Mathematics', color:'#f59e0b', topics:['Number System','Decimals & Fractions','LCM & HCF','Ratio & Proportion','Percentage','Mensuration','Time & Work','Time & Distance','SI & CI','Profit & Loss','Elementary Algebra','Geometry & Trigonometry','Elementary Statistics','Square Roots','Ages','Calendar & Clock','Pipes & Cistern'] },
      { name:'General Intelligence & Reasoning', color:'#7048e8', topics:['Analogies','Completion of Number & Alphabetical Series','Coding-Decoding','Mathematical Operations','Similarities & Differences','Relationships','Analytical Reasoning','Syllogism','Jumbling','Venn Diagrams','Conclusions & Decision Making','Statement-Course of Action','Data Interpretation & Sufficiency','Non-Verbal Reasoning'] },
      { name:'General Awareness & Current Affairs', color:'#0891b2', topics:['Railway History & Architecture','General Science','National & International Events','Games & Sports','Art & Culture','Literature','Economy & Finance','Indian Geography','Indian Polity & Constitution','Indian History','Environment & Ecology','Computers & Mobile Technology','Static GK','Events of National & International Importance'] },
    ]},
    { exam:'RRB Group D', stage:'CBT', sections:[
      { name:'Mathematics', color:'#f59e0b', topics:['Number System','BODMAS','Decimals','LCM & HCF','Ratio','Percentage','Mensuration','Time & Work','SI & CI','Profit & Loss','Elementary Algebra','Geometry','Trigonometry'] },
      { name:'General Intelligence & Reasoning', color:'#7048e8', topics:['Analogies','Alphabetical Series','Coding & Decoding','Mathematical Operations','Relationships','Syllogism','Non-Verbal Reasoning','Conclusions & Decision Making','Maps & Diagrams','Data Interpretation'] },
      { name:'General Science', color:'#16a34a', topics:['Physics — 10th standard','Chemistry — 10th standard','Life Sciences / Biology — 10th standard'] },
      { name:'General Awareness & Current Affairs', color:'#0891b2', topics:['Current Events','Science & Technology','Sports','Culture','Personalities','Economics','Politics'] },
    ]},
    { exam:'RRB ALP', stage:'Stage 1', sections:[
      { name:'Mathematics', color:'#f59e0b', topics:['Number System','BODMAS','Fractions','LCM & HCF','Ratio & Proportion','Percentage','Mensuration','Time & Work','SI & CI','Profit & Loss','Algebra','Geometry'] },
      { name:'General Intelligence & Reasoning', color:'#7048e8', topics:['Analogies','Alphabetical Series','Coding & Decoding','Reasoning','Non-Verbal Reasoning'] },
      { name:'Basic Science & Engineering', color:'#16a34a', topics:['Engineering Drawing & Projections','Units & Measurements','Mass, Weight & Density','Work, Power & Energy','Speed & Velocity','Heat & Temperature','Basic Electricity','Levers & Simple Machines','Occupational Safety & Health','Environment Education','IT Literacy'] },
      { name:'General Awareness & Current Affairs', color:'#0891b2', topics:['Current Affairs','Science & Technology','Sports','Culture'] },
    ]},
  ],
  engineering: [
    { exam:'JEE Main / Advanced', stage:'Paper 1', sections:[
      { name:'Mathematics', color:'#f59e0b', topics:['Sets, Relations & Functions','Complex Numbers','Matrices & Determinants','Sequence & Series','Permutations & Combinations','Binomial Theorem','Limit & Continuity','Differentiability & Differentiation','Integration','Differential Equations','Vectors','3D Geometry','Probability','Statistics','Coordinate Geometry — Straight Lines & Circles','Conic Sections','Trigonometry'] },
      { name:'Physics', color:'#7048e8', topics:['Units, Dimensions & Errors','Kinematics','Laws of Motion','Work, Energy & Power','Rotational Motion & Moment of Inertia','Gravitation','Properties of Matter','SHM & Waves','Thermodynamics & Kinetic Theory','Electrostatics','Current Electricity','Magnetic Effects','Electromagnetic Induction','Optics — Ray & Wave','Modern Physics — Photoelectric, Nucleus, Radioactivity','Semiconductors & Electronic Devices','Communication Systems'] },
      { name:'Chemistry', color:'#dc2626', topics:['Structure of Atom','Periodic Table','Chemical Bonding','States of Matter','Thermodynamics','Equilibrium','Redox Reactions','Hydrogen','Organic Chemistry — Basics, IUPAC, Isomerism','Hydrocarbons','Halides, Alcohols, Ethers, Aldehydes, Ketones, Acids','Amines & Biomolecules','Polymers','Coordination Compounds','Electrochemistry','Chemical Kinetics','d & f Block Elements','Metallurgy'] },
    ]},
    { exam:'GATE', stage:'All Streams', sections:[
      { name:'Engineering Mathematics', color:'#f59e0b', topics:['Linear Algebra','Calculus','Differential Equations','Complex Variables','Probability & Statistics','Numerical Methods','Transform Theory'] },
      { name:'General Aptitude', color:'#7048e8', topics:['Verbal Ability — English grammar, Reading comprehension','Numerical Ability — Reasoning, DI, Arithmetic'] },
      { name:'Core Branch Subject', color:'#0891b2', topics:['CSE: Data Structures, Algorithms, OS, DBMS, Networks, Compilers','ECE: Signals, Circuits, EM Theory, Control Systems','ME: Engineering Mechanics, Thermodynamics, Fluid Mechanics','CE: Structural Analysis, RCC, Soil Mechanics, Surveying'] },
    ]},
    { exam:'BITSAT', stage:'Full Test', sections:[
      { name:'Mathematics', color:'#f59e0b', topics:['Algebra','Trigonometry','Two & Three D Geometry','Differential & Integral Calculus','Ordinary Differential Equations','Probability','Vectors','Statistics','Linear Programming'] },
      { name:'Physics', color:'#7048e8', topics:['Units & Measurements','Kinematics','Newton\'s Laws','Work & Energy','Rotational Motion','Gravitation','Mechanics of Solids & Fluids','Heat & Thermodynamics','Wave Motion','Electrostatics','Current Electricity','Optics','Modern Physics'] },
      { name:'Chemistry', color:'#dc2626', topics:['States of Matter','Atomic Structure','Chemical Bonding','Thermodynamics','Physical & Chemical Equilibria','Electrochemistry','Organic Chemistry','Polymers & Surface Chemistry'] },
      { name:'English & Logical Reasoning', color:'#16a34a', topics:['Reading Comprehension','Composition & Grammar','Verbal Reasoning','Non-Verbal Reasoning'] },
    ]},
  ],
  medical: [
    { exam:'NEET UG', stage:'Phase 1', sections:[
      { name:'Physics', color:'#7048e8', topics:['Physical World & Measurement','Kinematics','Laws of Motion','Work, Energy & Power','Motion of Systems of Particles','Gravitation','Properties of Bulk Matter','Thermodynamics','Kinetic Theory of Gases','Oscillations & Waves','Electrostatics','Current Electricity','Magnetic Effects','Electromagnetic Waves','Optics','Dual Nature of Matter','Atoms & Nuclei','Electronic Devices'] },
      { name:'Chemistry', color:'#dc2626', topics:['Some Basic Concepts of Chemistry','Atomic Structure','Chemical Bonding','States of Matter','Chemical Thermodynamics','Equilibrium','Redox Reactions','Hydrogen','Block Elements (s & p)','Coordination Compounds','Organic Chemistry — Basic Principles','Hydrocarbons','Environmental Chemistry','d & f Block Elements','Haloalkanes & Haloarenes','Alcohols, Phenols & Ethers','Aldehydes, Ketones & Carboxylic Acids','Amines','Biomolecules & Polymers'] },
      { name:'Biology — Botany', color:'#16a34a', topics:['Diversity in Living World','Structural Organisation in Plants & Animals','Cell Structure & Function','Plant Physiology','Human Physiology','Reproduction','Genetics & Evolution','Biology & Human Welfare','Biotechnology','Ecology & Environment'] },
      { name:'Biology — Zoology', color:'#0891b2', topics:['Animal Kingdom','Animal Tissues','Digestion & Absorption','Breathing & Exchange of Gases','Body Fluids & Circulation','Excretory Products','Locomotion & Movement','Neural Control','Chemical Coordination','Reproduction in Organisms','Human Reproduction'] },
    ]},
    { exam:'NEET PG', stage:'Phase 1', sections:[
      { name:'Pre-Clinical Subjects', color:'#7048e8', topics:['Anatomy — General, Regional, Neuroanatomy, Embryology','Physiology — General, Systemic, Special Senses','Biochemistry — Proteins, Carbohydrates, Lipids, Enzymes, Vitamins, Metabolism, Genetics'] },
      { name:'Para-Clinical Subjects', color:'#f59e0b', topics:['Pathology — General, Systemic','Microbiology — Bacteriology, Virology, Parasitology, Mycology','Pharmacology — General, CNS, CVS, Antibiotics, Autonomic','Forensic Medicine — Medicolegal aspects, Toxicology'] },
      { name:'Clinical Subjects', color:'#dc2626', topics:['Internal Medicine','Surgery (General & Specialties)','OBG — Obstetrics & Gynaecology','Paediatrics','Orthopaedics','ENT','Ophthalmology','Community Medicine (PSM)','Anaesthesiology','Dermatology & Venereology','Psychiatry','Radiology'] },
    ]},
  ],
}

const P = { fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }

function TopicChip({ label }) {
  return (
    <span style={{
      display:'inline-block', fontSize:11.5, padding:'3px 9px', borderRadius:99,
      background:'#f1f5f9', color:'#475569', fontWeight:500, margin:'3px 3px 0 0',
    }}>
      {label}
    </span>
  )
}

export default function SyllabusPage({ onNav }) {
  const [activeCat, setActiveCat] = useState('banking')
  const [openExam, setOpenExam]   = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Exam Syllabus 2025-26 — Banking, SSC, Railway | MockTest'
  }, [])

  const sections = SYLLABUS[activeCat] || []

  return (
    <div style={{ ...P, minHeight:'100vh', background:'#f8fafc' }}>

      {/* Page header */}
      <div style={{ background:'#0f172a', padding:'36px 24px 32px' }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <button onClick={() => onNav?.('exams-banking')} style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'none', border:'none', color:'rgba(255,255,255,.5)',
            fontSize:12.5, fontWeight:500, cursor:'pointer', marginBottom:14, padding:0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Exams
          </button>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.4px' }}>Exam Syllabus</h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', margin:0 }}>
            Complete topic-wise syllabus for Banking, Insurance, SSC, Railway, Engineering and Medical exams
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'28px 24px 60px' }}>

        {/* Category tabs */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => { setActiveCat(c.key); setOpenExam(null) }}
              style={{
                padding:'7px 16px', borderRadius:99, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, transition:'background .12s, color .12s',
                background: activeCat === c.key ? '#0f172a' : '#fff',
                color: activeCat === c.key ? '#fff' : '#64748b',
                boxShadow: activeCat === c.key ? 'none' : '0 1px 4px rgba(0,0,0,.08)',
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Exam accordion */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {sections.map((exam, ei) => {
            const key = `${exam.exam}-${exam.stage}`
            const isOpen = openExam === key
            return (
              <div key={key} style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>

                {/* Accordion header */}
                <button onClick={() => setOpenExam(isOpen ? null : key)}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    width:'100%', padding:'16px 20px', border:'none', background:'transparent',
                    cursor:'pointer', textAlign:'left',
                  }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>{exam.exam}</div>
                    <div style={{ fontSize:12, color:'#94a3b8', marginTop:2, fontWeight:500 }}>{exam.stage} · {exam.sections.length} sections</div>
                  </div>
                  <div style={{
                    width:28, height:28, borderRadius:8, background: isOpen ? '#0f172a' : '#f1f5f9',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    transition:'background .15s',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={isOpen ? '#fff' : '#64748b'} strokeWidth="2.5" strokeLinecap="round">
                      {isOpen ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                    </svg>
                  </div>
                </button>

                {/* Sections content */}
                {isOpen && (
                  <div style={{ borderTop:'1px solid #f1f5f9', padding:'16px 20px 20px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
                      {exam.sections.map(sec => (
                        <div key={sec.name} style={{ background:'#f8fafc', borderRadius:10, padding:'14px 16px', border:`1px solid ${sec.color}22` }}>
                          <div style={{
                            display:'flex', alignItems:'center', gap:8, marginBottom:10,
                            paddingBottom:8, borderBottom:`2px solid ${sec.color}`,
                          }}>
                            <span style={{ width:10, height:10, borderRadius:'50%', background:sec.color, flexShrink:0 }} />
                            <span style={{ fontSize:12.5, fontWeight:700, color:'#0f172a' }}>{sec.name}</span>
                          </div>
                          <div style={{ display:'flex', flexWrap:'wrap' }}>
                            {sec.topics.map(t => <TopicChip key={t} label={t} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop:36, background:'#0f172a', borderRadius:16, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff', marginBottom:5 }}>Ready to practice?</div>
            <div style={{ fontSize:13.5, color:'rgba(255,255,255,.5)' }}>Attempt full-length mock tests for every exam listed above — completely free.</div>
          </div>
          <button onClick={() => onNav?.('exams-banking')} style={{
            background:'#F06535', color:'#fff', border:'none', borderRadius:10,
            padding:'12px 24px', fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
          }}
          onMouseOver={e => e.currentTarget.style.background='#e5512f'}
          onMouseOut={e => e.currentTarget.style.background='#F06535'}>
            Start Free Mock Test →
          </button>
        </div>
      </div>
    </div>
  )
}
