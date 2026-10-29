import { useState, useRef, useEffect } from 'react'
import { generateTest, generateMiniTest, generateTopicTest } from '../api.js'

// ── Tab mode icons ────────────────────────────────────────────
const _sv2 = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const HIcGrad   = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv2(c)}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const HIcDoc    = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv2(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const HIcTarget = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv2(c)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const HIcTimer  = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv2(c)}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l-1 2M19 3l1 2M9 3h6"/></svg>

// ── Sidebar icons — identical set to the Dashboard sidebar ─────
const SvgHome  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M8 19V12h4v7"/></svg>
const SvgDoc   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M12 2v4h4M6 10h8M6 13h5"/></svg>
const SvgCal   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="16" height="14" rx="2"/><path d="M2 8h16M6 2v4M14 2v4"/></svg>
const SvgChart = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgClip  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-3M8 3a1 1 0 011-1h2a1 1 0 011 1M8 3h4"/></svg>
const SvgUser  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="6" r="4"/><path d="M2 18c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const SvgCard  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 9h16"/></svg>
const SvgGear  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg>

// ── Colours ───────────────────────────────────────────────────
const SEC_COLOR = {
  english:'text-emerald-700 bg-emerald-50 border-emerald-200',
  english_language:'text-emerald-700 bg-emerald-50 border-emerald-200',
  numerical_ability:'text-amber-700 bg-amber-50 border-amber-200',
  reasoning:'text-violet-700 bg-violet-50 border-violet-200',
  quantitative_aptitude:'text-amber-700 bg-amber-50 border-amber-200',
  reasoning_computer_aptitude:'text-violet-700 bg-violet-50 border-violet-200',
  data_analysis_interpretation:'text-amber-700 bg-amber-50 border-amber-200',
  general_financial_awareness:'text-blue-700 bg-blue-50 border-blue-200',
  general_economy_banking:'text-blue-700 bg-blue-50 border-blue-200',
  general_knowledge:'text-blue-700 bg-blue-50 border-blue-200',
  // Engineering / EAMCET sections
  mathematics:'text-indigo-700 bg-indigo-50 border-indigo-200',
  physics:'text-sky-700 bg-sky-50 border-sky-200',
  chemistry:'text-teal-700 bg-teal-50 border-teal-200',
  // SSC sections
  general_intelligence_reasoning:'text-violet-700 bg-violet-50 border-violet-200',
  general_intelligence:'text-violet-700 bg-violet-50 border-violet-200',
  general_awareness:'text-blue-700 bg-blue-50 border-blue-200',
  english_comprehension:'text-emerald-700 bg-emerald-50 border-emerald-200',
  numerical_mathematical_ability:'text-amber-700 bg-amber-50 border-amber-200',
  reasoning_problem_solving:'text-violet-700 bg-violet-50 border-violet-200',
  general_english:'text-emerald-700 bg-emerald-50 border-emerald-200',
}
const SEC_LABEL = {
  english:'English Language',
  english_language:'English Language', numerical_ability:'Numerical Ability',
  reasoning:'Reasoning Ability', quantitative_aptitude:'Quantitative Aptitude',
  reasoning_computer_aptitude:'Reasoning & Computer Aptitude',
  data_analysis_interpretation:'Data Analysis & Interpretation',
  general_financial_awareness:'General / Financial Awareness',
  general_economy_banking:'General Economy & Banking',
  general_knowledge:'General Knowledge',
  // Engineering / EAMCET sections
  mathematics:'Mathematics',
  physics:'Physics',
  chemistry:'Chemistry',
  // SSC sections
  general_intelligence_reasoning:'General Intelligence & Reasoning',
  general_intelligence:'General Intelligence',
  general_awareness:'General Awareness',
  english_comprehension:'English Comprehension',
  numerical_mathematical_ability:'Numerical & Mathematical Ability',
  reasoning_problem_solving:'Reasoning & Problem Solving',
  general_english:'General English',
}
const secLabel = s => SEC_LABEL[s] || s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())

// ── Exam data ─────────────────────────────────────────────────
const EXAM_TREE = [
  { bank:'IBPS', exams:[
    { id:'bank_clerk_prelims', name:'IBPS Clerk Prelims', badge:'Clerk', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'bank_clerk_mains',   name:'IBPS Clerk Mains',   badge:'Clerk', level:'Mains',   questions:175, duration:'160 min', negative:0.25, sections:['general_financial_awareness','general_english','reasoning_computer_aptitude','quantitative_aptitude'], pattern:{general_financial_awareness:50,general_english:45,reasoning_computer_aptitude:40,quantitative_aptitude:40} },
    { id:'bank_po_prelims',    name:'IBPS PO Prelims',    badge:'PO',    level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning'], pattern:{english:30,quantitative_aptitude:35,reasoning:35} },
    { id:'bank_po_mains',      name:'IBPS PO Mains',      badge:'PO',    level:'Mains',   questions:175, duration:'180 min', negative:0.25, sections:['reasoning_computer_aptitude','english_language','data_analysis_interpretation','general_economy_banking'], pattern:{reasoning_computer_aptitude:45,english_language:45,data_analysis_interpretation:45,general_economy_banking:40} },
  ]},
  { bank:'SBI', exams:[
    { id:'sbi_clerk_prelims', name:'SBI Clerk Prelims', badge:'Clerk', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'sbi_clerk_mains',   name:'SBI Clerk Mains',   badge:'Clerk', level:'Mains',   questions:170, duration:'160 min', negative:0.25, sections:['general_english','quantitative_aptitude','reasoning_computer_aptitude','general_financial_awareness'], pattern:{general_english:45,quantitative_aptitude:40,reasoning_computer_aptitude:40,general_financial_awareness:45} },
    { id:'sbi_po_prelims',    name:'SBI PO Prelims',    badge:'PO',    level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning'], pattern:{english:30,quantitative_aptitude:35,reasoning:35} },
    { id:'sbi_po_mains',      name:'SBI PO Mains',      badge:'PO',    level:'Mains',   questions:175, duration:'180 min', negative:0.25, sections:['reasoning_computer_aptitude','data_analysis_interpretation','general_economy_banking','english_language'], pattern:{reasoning_computer_aptitude:45,data_analysis_interpretation:45,general_economy_banking:40,english_language:45} },
  ]},
  { bank:'RBI', exams:[
    { id:'rbi_assistant_pre',   name:'RBI Assistant Prelims', badge:'Assistant', level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'rbi_assistant_mains', name:'RBI Assistant Mains',   badge:'Assistant', level:'Mains',   questions:190, duration:'135 min', negative:0.25, sections:['general_financial_awareness','general_english','reasoning_computer_aptitude','quantitative_aptitude'], pattern:{general_financial_awareness:50,general_english:45,reasoning_computer_aptitude:40,quantitative_aptitude:40} },
    { id:'rbi_gradeb_p1',       name:'RBI Grade B (Phase 1)', badge:'Grade B',   level:'Phase 1', questions:155, duration:'120 min', negative:0.25, sections:['reasoning_computer_aptitude','english_language','data_analysis_interpretation','general_economy_banking'], pattern:{reasoning_computer_aptitude:45,english_language:45,data_analysis_interpretation:45,general_economy_banking:40} },
  ]},
  { bank:'NABARD', exams:[
    { id:'nabard_gradeA_pre', name:'NABARD Grade A Prelims',         badge:'Grade A', level:'Prelims', questions:190, duration:'120 min', negative:0.25, sections:['general_financial_awareness','general_english','reasoning_computer_aptitude','quantitative_aptitude'], pattern:{general_financial_awareness:50,general_english:45,reasoning_computer_aptitude:40,quantitative_aptitude:40} },
    { id:'nabard_da_pre',     name:'NABARD Development Assistant',   badge:'DA',      level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
  ]},
  { bank:'LIC', exams:[
    { id:'lic_aao_pre',       name:'LIC AAO Prelims',       badge:'AAO',       level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','quantitative_aptitude','reasoning','insurance_awareness'],          pattern:{english:30,quantitative_aptitude:35,reasoning:25,insurance_awareness:10} },
    { id:'lic_aao_mains',     name:'LIC AAO Mains',         badge:'AAO',       level:'Mains',   questions:120, duration:'120 min', negative:0.25, sections:['general_knowledge_current_affairs','reasoning','data_analysis_interpretation','insurance_financial_awareness'], pattern:{general_knowledge_current_affairs:30,reasoning:30,data_analysis_interpretation:30,insurance_financial_awareness:30} },
    { id:'lic_assistant_pre', name:'LIC Assistant Prelims', badge:'Assistant', level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','numerical_ability','reasoning'],                                   pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'lic_ado_pre',       name:'LIC ADO Prelims',       badge:'ADO',       level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','numerical_ability','reasoning'],                                        pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'lic_ado_mains',     name:'LIC ADO Mains',         badge:'ADO',       level:'Mains',   questions:120, duration:'120 min', negative:0.25, sections:['reasoning_ability','numerical_ability','insurance_financial_awareness'],               pattern:{reasoning_ability:40,numerical_ability:40,insurance_financial_awareness:40} },
  ]},
  { bank:'Insurance', exams:[
    { id:'nicl_ao_pre',         name:'NICL AO Prelims',         badge:'NICL',   level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning','insurance_awareness'], pattern:{english:30,quantitative_aptitude:35,reasoning:25,insurance_awareness:10} },
    { id:'uiic_ao_pre',         name:'UIIC AO Prelims',         badge:'UIIC',   level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning','insurance_awareness'], pattern:{english:30,quantitative_aptitude:35,reasoning:25,insurance_awareness:10} },
    { id:'niacl_ao_pre',        name:'NIACL AO Prelims',        badge:'NIACL',  level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning','insurance_awareness'], pattern:{english:30,quantitative_aptitude:35,reasoning:25,insurance_awareness:10} },
    { id:'oicl_ao_pre',         name:'OICL AO Prelims',         badge:'OICL',   level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning','insurance_awareness'], pattern:{english:30,quantitative_aptitude:35,reasoning:25,insurance_awareness:10} },
    { id:'niacl_assistant_pre', name:'NIACL Assistant Prelims', badge:'NIACL',  level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
  ]},
  { bank:'India Post', exams:[
    { id:'ippb_officer', name:'IPPB Officer Scale I', badge:'IPPB', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
  ]},
  { bank:'PSU', exams:[
    { id:'coal_india_mt', name:'Coal India MT', badge:'MT', level:'Main', questions:100, duration:'120 min', negative:0, sections:['general_knowledge','reasoning','quantitative_aptitude','english'], pattern:{general_knowledge:30,reasoning:25,quantitative_aptitude:25,english:20} },
  ]},
  { bank:'IBPS RRB', exams:[
    { id:'rrb_office_assistant_prelims', name:'Office Assistant Prelims', badge:'OA', level:'Prelims', questions:80,  duration:'45 min',  negative:0.25, sections:['reasoning','numerical_ability'],                                                              pattern:{reasoning:40,numerical_ability:40} },
    { id:'rrb_office_assistant_mains',   name:'Office Assistant Mains',   badge:'OA', level:'Mains',   questions:200, duration:'120 min', negative:0.25, sections:['reasoning','numerical_ability','general_awareness','english_hindi','computer_knowledge'],    pattern:{reasoning:40,numerical_ability:40,general_awareness:40,english_hindi:40,computer_knowledge:40} },
    { id:'rrb_officer_scale1_prelims',   name:'Officer Scale-I Prelims',  badge:'PO', level:'Prelims', questions:80,  duration:'45 min',  negative:0.25, sections:['reasoning','quantitative_aptitude'],                                                         pattern:{reasoning:40,quantitative_aptitude:40} },
    { id:'rrb_officer_scale1_mains',     name:'Officer Scale-I Mains',    badge:'PO', level:'Mains',   questions:200, duration:'120 min', negative:0.25, sections:['reasoning','quantitative_aptitude','general_awareness','english_hindi','computer_knowledge'], pattern:{reasoning:40,quantitative_aptitude:40,general_awareness:40,english_hindi:40,computer_knowledge:40} },
  ]},
  { bank:'SSC', exams:[
    { id:'ssc_cgl_tier1',  name:'SSC CGL Tier I',  badge:'CGL',  level:'Tier I', questions:100, duration:'60 min', negative:0.50, sections:['general_intelligence_reasoning','general_awareness','quantitative_aptitude','english_comprehension'], pattern:{general_intelligence_reasoning:25,general_awareness:25,quantitative_aptitude:25,english_comprehension:25} },
    { id:'ssc_chsl_tier1', name:'SSC CHSL Tier I', badge:'CHSL', level:'Tier I', questions:100, duration:'60 min', negative:0.50, sections:['general_intelligence','general_awareness','quantitative_aptitude','english_language'], pattern:{general_intelligence:25,general_awareness:25,quantitative_aptitude:25,english_language:25} },
    { id:'ssc_mts_paper1', name:'SSC MTS Paper I', badge:'MTS',  level:'Paper I', questions:80, duration:'90 min', negative:0,    sections:['numerical_mathematical_ability','reasoning_problem_solving','general_english','general_awareness'], pattern:{numerical_mathematical_ability:20,reasoning_problem_solving:20,general_english:20,general_awareness:20} },
  ]},
  { bank:'RRB', exams:[
    { id:'rrb_ntpc_cbt1', name:'RRB NTPC CBT 1', badge:'NTPC', level:'CBT 1', questions:100, duration:'90 min', negative:0.33, sections:['mathematics','general_intelligence_reasoning','general_awareness'], pattern:{mathematics:30,general_intelligence_reasoning:30,general_awareness:40} },
    { id:'rrb_ntpc_cbt2', name:'RRB NTPC CBT 2', badge:'NTPC', level:'CBT 2', questions:120, duration:'90 min', negative:0.33, sections:['mathematics','general_intelligence_reasoning','general_awareness'], pattern:{mathematics:35,general_intelligence_reasoning:35,general_awareness:50} },
    { id:'rrb_group_d',   name:'RRB Group D',    badge:'Grp D', level:'CBT',  questions:100, duration:'90 min', negative:0.33, sections:['mathematics','general_intelligence_reasoning','general_science','general_awareness'], pattern:{mathematics:25,general_intelligence_reasoning:30,general_science:25,general_awareness:20} },
    { id:'rrb_alp_cbt1',  name:'RRB ALP CBT 1',  badge:'ALP',  level:'CBT 1', questions:75, duration:'60 min', negative:0.33, sections:['mathematics','general_intelligence_reasoning','general_science'], pattern:{mathematics:20,general_intelligence_reasoning:25,general_science:30} },
  ]},
  { bank:'EAMCET', exams:[
    { id:'ap_eamcet_engg', name:'AP EAMCET Engineering', badge:'AP', level:'Entrance', questions:160, duration:'180 min', negative:0, sections:['mathematics','physics','chemistry'], pattern:{mathematics:80,physics:40,chemistry:40} },
    { id:'ts_eamcet_engg', name:'TS EAMCET Engineering', badge:'TS', level:'Entrance', questions:160, duration:'180 min', negative:0, sections:['mathematics','physics','chemistry'], pattern:{mathematics:80,physics:40,chemistry:40} },
  ]},
  { bank:'JEE', exams:[
    { id:'jee_mains', name:'JEE Main', badge:'Mains', level:'Entrance', questions:90, duration:'180 min', negative:1, sections:['mathematics','physics','chemistry'], pattern:{mathematics:30,physics:30,chemistry:30} },
    { id:'jee_advanced_p1', name:'JEE Advanced Paper 1', badge:'Adv P1', level:'Advanced', questions:54, duration:'180 min', negative:2, sections:['mathematics','physics','chemistry'], pattern:{mathematics:18,physics:18,chemistry:18} },
    { id:'jee_advanced_p2', name:'JEE Advanced Paper 2', badge:'Adv P2', level:'Advanced', questions:54, duration:'180 min', negative:2, sections:['mathematics','physics','chemistry'], pattern:{mathematics:18,physics:18,chemistry:18} },
  ]},
]

const ALL_EXAMS = EXAM_TREE.flatMap(g => g.exams)

// ── Topic data ────────────────────────────────────────────────
const TOPICS = [
  { section:'numerical_ability', label:'Numerical Ability', accent:'#F59E0B',
    topics:[
      { id:'simplification',         label:'Simplification',        sub:'BODMAS · sqrt · fractions' }, 
	  { id:'data_sufficiency',       label:'Data Sufficiency',      sub:'find value · yes/no · sufficient' },
      { id:'number_series',          label:'Number Series',         sub:'patterns · missing term' },
      { id:'data_interpretation',    label:'Data Interpretation',   sub:'tables · bar · pie charts' },
      { id:'profit_loss',            label:'Profit & Loss',         sub:'SP / CP / profit %' },
      { id:'simple_compound_interest',label:'Simple Interest',      sub:'SI / CI / difference' },
      { id:'percentage',             label:'Percentage',            sub:'successive % · population' },
      { id:'time_work',              label:'Time & Work',           sub:'pipes · cisterns · combined' },
      { id:'time_speed_distance',    label:'Time & Distance',       sub:'trains · boats · relative speed' },
      { id:'average',                label:'Average',               sub:'combined avg · weighted' },
      { id:'problems_on_ages',       label:'Ages',                  sub:'ratio · linear equations' },
      { id:'ratio_proportion',       label:'Ratio & Proportion',    sub:'direct · indirect' },
      { id:'mixture_alligation',     label:'Mixture & Alligation',  sub:'rule of alligation' },
      { id:'quadratic_equations',    label:'Quadratic Equations',   sub:'roots · compare I & II' },
      { id:'partnership_ratio',      label:'Partnership',           sub:'profit sharing · time ratio' },
      { id:'mensuration_2d',         label:'Mensuration',           sub:'area · perimeter · volume' },
      { id:'boats_streams',          label:'Boats & Streams',       sub:'upstream · downstream' },
      { id:'pipes_cisterns',         label:'Pipes & Cisterns',      sub:'fill · drain · together' },
      { id:'probability',            label:'Probability',           sub:'P(E) · cards · dice' },
      { id:'permutation_combination',label:'Permutation & Combination', sub:'nPr · nCr · arrangements' },
      { id:'trigonometry',            label:'Trigonometry',             sub:'standard angles · height & distance' },
    ]
  },
  { section:'reasoning', label:'Reasoning Ability', accent:'#8B5CF6',
    topics:[
      { id:'seating_arrangement_linear',   label:'Linear Seating',     sub:'row · facing same/opposite' },
      { id:'seating_arrangement_circular', label:'Circular Seating',   sub:'round table · facing centre' },
      { id:'puzzle_box_floor',             label:'Floor / Box Puzzle',  sub:'ordering · multi-parameter' },
      { id:'syllogisms',                   label:'Syllogism',           sub:'all · some · no · possibility' },
      { id:'inequalities',                 label:'Coded Inequality',    sub:'coded signs · conclusions' },
      { id:'blood_relations',              label:'Blood Relations',     sub:'family tree · coded relations' },
      { id:'direction_sense',              label:'Direction Sense',     sub:'N/S/E/W · distance' },
      { id:'coding_decoding',              label:'Coding-Decoding',     sub:'letter / number codes' },
      { id:'alphanumeric_series',          label:'Alphanumeric Series', sub:'mixed series · next term' },
      { id:'order_ranking',                label:'Order & Ranking',     sub:'position from top/bottom' },
      { id:'computer_awareness',           label:'Computer Awareness',  sub:'hardware · software · MS Office · internet' },
      { id:'data_sufficiency_reasoning',   label:'Data Sufficiency',    sub:'arrangement · relationships · direction' },
      { id:'venn_diagram',                 label:'Venn Diagram',        sub:'two-set · three-set · intersection' },
      { id:'missing_number',               label:'Missing Number',      sub:'grid patterns · triangle · matrix' },
    ]
  },
  { section:'english', label:'English Language', accent:'#10B981',
    topics:[
      { id:'error_detection',    label:'Error Detection',   sub:'subject-verb · tense · preposition' },
      { id:'cloze_test',         label:'Cloze Test',        sub:'fill 5-word passage' },
      { id:'para_jumbles',       label:'Para Jumbles',      sub:'rearrange sentences' },
      { id:'vocabulary',         label:'Vocabulary',        sub:'synonyms · antonyms (60 words)' },
      { id:'fill_in_the_blanks', label:'Fill in the Blanks',sub:'grammar · context words' },
      { id:'reading_comprehension',  label:'Reading Comprehension',sub:'passage · 5 Qs' },
    ]
  },
]

const BADGE = { Clerk:'bg-indigo-100 text-indigo-700', PO:'bg-purple-100 text-purple-700', MT:'bg-green-100 text-green-700' }
const LEVEL = { Prelims:'bg-sky-100 text-sky-700', Mains:'bg-amber-100 text-amber-700', Main:'bg-amber-100 text-amber-700' }

// Exams always visible to all users (free or paid) regardless of registration
const FREE_OPEN_EXAMS = new Set(['ap_eamcet_engg', 'ts_eamcet_engg', 'jee_mains', 'jee_advanced_p1', 'jee_advanced_p2'])

// ── SAT exam definitions ──────────────────────────────────────
const SAT_EXAMS = [
  {
    id: 'sat_full', badge: 'Full SAT',
    name: 'Digital SAT — Full Practice Test',
    questions: 98, duration: '2 hr 14 min', score: '400–1600',
    desc: 'Complete simulation: both Reading & Writing and Math sections with adaptive difficulty.',
    sections: [
      { key: 'reading_writing', label: 'Reading & Writing', q: 54, mins: 64, cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { key: 'math',           label: 'Math',              q: 44, mins: 70, cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    ],
  },
  {
    id: 'sat_math', badge: 'Math Only',
    name: 'SAT — Math Section',
    questions: 44, duration: '70 min', score: '200–800',
    desc: 'Algebra, Advanced Math, Problem-Solving & Data, Geometry & Trig.',
    sections: [
      { key: 'algebra',         label: 'Algebra',                  q: 14, cls: 'text-blue-700 bg-blue-50 border-blue-200' },
      { key: 'advanced_math',   label: 'Advanced Math',            q: 14, cls: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
      { key: 'problem_solving', label: 'Problem-Solving & Data',   q: 10, cls: 'text-violet-700 bg-violet-50 border-violet-200' },
      { key: 'geometry',        label: 'Geometry & Trig',          q:  6, cls: 'text-sky-700 bg-sky-50 border-sky-200' },
    ],
  },
  {
    id: 'sat_reading_writing', badge: 'R&W Only',
    name: 'SAT — Reading & Writing Section',
    questions: 54, duration: '64 min', score: '200–800',
    desc: 'Information & Ideas, Craft & Structure, Standard English, Words in Context.',
    sections: [
      { key: 'info_ideas',      label: 'Information & Ideas',      q: 26, cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { key: 'craft_structure', label: 'Craft & Structure',        q: 13, cls: 'text-teal-700 bg-teal-50 border-teal-200' },
      { key: 'std_english',     label: 'Standard English',         q: 11, cls: 'text-lime-700 bg-lime-50 border-lime-200' },
      { key: 'words_context',   label: 'Words in Context',         q:  4, cls: 'text-amber-700 bg-amber-50 border-amber-200' },
    ],
  },
]

function SATExamTab({ studentName, onStart, initialExamId = 'sat_full' }) {
  const [selected, setSelected] = useState(
    SAT_EXAMS.find(e => e.id === initialExamId) || SAT_EXAMS[0]
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const start = async () => {
    setError(''); setLoading(true)
    try { const d = await generateTest(studentName, selected.id); onStart(d) }
    catch(e) { setError(e.friendlyMessage || 'Server error. Please try again.'); setLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1 border-b border-gray-100">
        <HIcGrad s={22} c='#374151'/>
        <div>
          <div className="font-black text-gray-900 text-lg leading-tight">Digital SAT Practice</div>
          <div className="text-xs text-gray-400">College Board · USA · No negative marking · 400–1600</div>
        </div>
      </div>

      {/* 3 option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SAT_EXAMS.map(exam => {
          const active = selected.id === exam.id
          return (
            <button key={exam.id} onClick={() => { setSelected(exam); setError('') }}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${active ? '' : 'border-gray-200 bg-white hover:border-orange-200'}`}
              style={active ? { borderColor:'#FF653F', background:'#FFF3EE' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{exam.badge}</span>
                {active && <span className="text-orange-500 text-sm">✓</span>}
              </div>
              <div className="font-bold text-sm text-gray-900 leading-tight mb-1">{exam.name.split('—')[1]?.trim() || exam.name}</div>
              <div className="text-xs text-gray-500">{exam.questions}Q · {exam.duration} · Score {exam.score}</div>
            </button>
          )
        })}
      </div>

      {/* Section breakdown */}
      <div className="rounded-2xl border p-4 space-y-2" style={{ background:'#f9fafb', borderColor:'#e5e7eb' }}>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{selected.name} — Sections</div>
        {selected.sections.map(s => (
          <div key={s.key} className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-medium ${s.cls}`}>
            <span>{s.label}</span>
            <span>{s.q} questions{s.mins ? ` · ${s.mins} min` : ''}</span>
          </div>
        ))}
        <div className="text-xs text-gray-400 pt-1">{selected.desc}</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 space-y-0.5">
        <div className="font-semibold mb-1">Before you start:</div>
        <div>• Digital SAT uses adaptive modules — Module 2 difficulty depends on Module 1 performance</div>
        <div>• No negative marking — attempt every question</div>
        <div>• Calculator is permitted for all Math questions</div>
      </div>

      {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

      <button onClick={start} disabled={loading}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-all"
        style={{ background:'#FF653F' }}
        onMouseOver={e => !loading && (e.currentTarget.style.background = '#e5512f')}
        onMouseOut={e => (e.currentTarget.style.background = '#FF653F')}>
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating test…</span>
          : `Start ${selected.badge} · ${selected.questions}Q · ${selected.duration}`}
      </button>
    </div>
  )
}

// ── Section inline-style map (replaces Tailwind classes) ──────
const SS = {
  english:                      {bg:'#ecfdf5',fg:'#065f46',br:'#a7f3d0'},
  english_language:             {bg:'#ecfdf5',fg:'#065f46',br:'#a7f3d0'},
  general_english:              {bg:'#ecfdf5',fg:'#065f46',br:'#a7f3d0'},
  english_comprehension:        {bg:'#ecfdf5',fg:'#065f46',br:'#a7f3d0'},
  numerical_ability:            {bg:'#fffbeb',fg:'#92400e',br:'#fde68a'},
  quantitative_aptitude:        {bg:'#fffbeb',fg:'#92400e',br:'#fde68a'},
  data_analysis_interpretation: {bg:'#fffbeb',fg:'#92400e',br:'#fde68a'},
  numerical_mathematical_ability:{bg:'#fffbeb',fg:'#92400e',br:'#fde68a'},
  reasoning:                    {bg:'#f5f3ff',fg:'#5b21b6',br:'#ddd6fe'},
  reasoning_computer_aptitude:  {bg:'#f5f3ff',fg:'#5b21b6',br:'#ddd6fe'},
  general_intelligence_reasoning:{bg:'#f5f3ff',fg:'#5b21b6',br:'#ddd6fe'},
  general_intelligence:         {bg:'#f5f3ff',fg:'#5b21b6',br:'#ddd6fe'},
  reasoning_problem_solving:    {bg:'#f5f3ff',fg:'#5b21b6',br:'#ddd6fe'},
  general_financial_awareness:  {bg:'#eff6ff',fg:'#1e40af',br:'#bfdbfe'},
  general_economy_banking:      {bg:'#eff6ff',fg:'#1e40af',br:'#bfdbfe'},
  general_knowledge:            {bg:'#eff6ff',fg:'#1e40af',br:'#bfdbfe'},
  general_awareness:            {bg:'#eff6ff',fg:'#1e40af',br:'#bfdbfe'},
  mathematics:                  {bg:'#eef2ff',fg:'#3730a3',br:'#c7d2fe'},
  physics:                      {bg:'#f0f9ff',fg:'#075985',br:'#bae6fd'},
  chemistry:                    {bg:'#f0fdfa',fg:'#134e4a',br:'#99f6e4'},
}
const ss = s => SS[s] || {bg:'#f9fafb',fg:'#374151',br:'#e5e7eb'}

// ── Selection stages helper ───────────────────────────────────
function getSelectionStages(exam) {
  const lvl = (exam.level || '').toLowerCase()
  if (lvl.includes('prelim') || lvl.includes('phase 1') || lvl.includes('cbt 1') || lvl.includes('paper i') || lvl.includes('tier i'))
    return [{label:'Prelims / Phase 1',active:true},{label:'Mains / Phase 2',active:false},{label:'Interview / DV',active:false}]
  if (lvl.includes('main') || lvl.includes('phase 2') || lvl.includes('cbt 2') || lvl.includes('tier ii'))
    return [{label:'Prelims / Phase 1',active:false},{label:'Mains / Phase 2',active:true},{label:'Interview / DV',active:false}]
  if (lvl.includes('advanced'))
    return [{label:'JEE Main',active:false},{label:'JEE Advanced',active:true},{label:'JoSAA Counselling',active:false}]
  if (lvl === 'entrance')
    return [{label:'Entrance Exam',active:true},{label:'Counselling',active:false}]
  return [{label:exam.level,active:true},{label:'Document Verification',active:false}]
}

// ── Tab: Full Mock ────────────────────────────────────────────
function FullMockTab({ studentName, onStart, onNeedAuth, initialExamId = '', registeredExamIds = [], isPro = false, bank, onBankChange, bankTree = EXAM_TREE }) {
  const tree = bankTree
  const bankGroup = tree.find(g => g.bank === bank) || tree[0]
  const [loading,   setLoading]   = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [error,     setError]     = useState('')
  const [isMobile,  setIsMobile]  = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { setError(''); setLoadingId(null); setLoading(false) }, [bank])

  const start = async (exam) => {
    if (loading) return
    if (onNeedAuth) { onNeedAuth(); return }
    setError(''); setLoadingId(exam.id); setLoading(true)
    try { const d = await generateTest(studentName, exam.id); onStart(d) }
    catch(e) { setError(e.friendlyMessage || 'Server error. Please try again.'); setLoading(false); setLoadingId(null) }
  }

  return (
    <>
    <style>{`
      .fmock-outer{display:flex;gap:24px;align-items:flex-start;flex-direction:row}
      .fmock-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;width:100%}
      .fmock-side{width:280px;flex-shrink:0;display:flex;flex-direction:column;gap:12px}
      @media(max-width:767px){
        .fmock-outer{flex-direction:column;gap:0;align-items:stretch}
        .fmock-cards{grid-template-columns:1fr}
        .fmock-side{width:100%;margin-top:16px}
      }
    `}</style>
    <div className="fmock-outer">

      {/* ── LEFT: Exam cards grid ── */}
      <div style={{flex:'1 1 0',minWidth:0}}>
        {error && <div style={{padding:'9px 13px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:9,fontSize:12.5,color:'#dc2626',marginBottom:14}}>{error}</div>}
        <div className="fmock-cards">
          {bankGroup.exams.map(exam => {
            const isThis = loadingId === exam.id && loading
            return (
              <div key={exam.id} style={{border:'1.5px solid #f0f0f0',borderRadius:12,overflow:'hidden',background:'#fff',display:'flex',flexDirection:'column'}}>
                <div style={{height:3,background:'linear-gradient(90deg,#FF653F,#ff9a72)'}}/>
                <div style={{padding:'13px 16px',flex:1,display:'flex',flexDirection:'column',gap:10}}>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:900,color:'#111827',letterSpacing:'-.02em',marginBottom:5}}>{exam.name}</div>
                    <div style={{display:'flex',gap:5}}>
                      <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'#FFF3EE',color:'#FF653F'}}>{exam.badge}</span>
                      <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'#f3f4f6',color:'#6b7280'}}>{exam.level}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:18}}>
                    {[{v:`${exam.questions}`,l:'Questions'},{v:exam.duration,l:'Duration'},{v:exam.negative>0?`−${exam.negative}`:'None',l:'Negative'}].map(({v,l})=>(
                      <div key={l}>
                        <div style={{fontSize:13,fontWeight:900,color:'#111827',lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{v}</div>
                        <div style={{fontSize:9.5,color:'#9ca3af',fontWeight:600,marginTop:2}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    {exam.sections.map(s => {
                      const c = ss(s)
                      return (
                        <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:600,background:c.bg,color:c.fg,border:`1px solid ${c.br}`}}>
                          <span>{secLabel(s)}</span>
                          <span style={{opacity:.7}}>{exam.pattern[s]}Q</span>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => start(exam)} disabled={loading} style={{
                    width:'100%',padding:'10px',borderRadius:9,border:'none',
                    cursor:loading?'default':'pointer',
                    background:'#FF653F',color:'#fff',fontWeight:800,fontSize:12.5,
                    boxShadow:'0 3px 14px rgba(255,101,63,.25)',transition:'all .15s',
                    opacity:loading?.75:1,marginTop:'auto',
                  }}
                    onMouseOver={e=>!loading&&(e.currentTarget.style.background='#e8501c')}
                    onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                    {isThis
                      ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                          <span style={{width:12,height:12,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/>
                          Generating…
                        </span>
                      : 'Start Test →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Info sidebar ── */}
      <div className="fmock-side">
        <div style={{background:'rgba(255,101,63,.08)',border:'1px solid rgba(255,101,63,.2)',borderRadius:16,padding:'18px 20px'}}>
          <div style={{fontSize:10,fontWeight:800,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.09em',marginBottom:12}}>Preparation Tips</div>
          {[
            'Start with section tests to spot weak areas',
            'Review solution PDFs after every mock',
            'Improve speed in Reasoning & Quant first',
            'Maintain exam-day discipline with a timer',
          ].map((tip, i) => (
            <div key={i} style={{display:'flex',gap:10,marginBottom:i<3?10:0,fontSize:12.5,color:'#374151',lineHeight:1.6}}>
              <span style={{color:'#FF653F',flexShrink:0,fontWeight:700,marginTop:1}}>→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
        <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:16,padding:'16px 18px',fontSize:12.5,color:'#6b7280',lineHeight:1.7}}>
          <div style={{fontWeight:800,color:'#111827',marginBottom:6,fontSize:12}}>Before you start</div>
          <div>· Each section has a separate 20-min timer — auto-advances when time is up</div>
          <div>· Negative marking: <b style={{color:'#f87171'}}>−0.25</b> per wrong answer</div>
          <div>· Download solution PDF after submission for full explanations</div>
        </div>
      </div>
    </div>
    </>
  )
}

// ── Tab: Topic Practice ───────────────────────────────────────
function TopicPracticeTab({ studentName, onStart, user = null, sectionId = 'numerical_ability' }) {
  const [topic,      setTopic]     = useState(null)
  const [topicSec,   setTopicSec]  = useState(null)
  const [difficulty, setDifficulty]= useState('diagnostic')
  const [count,      setCount]     = useState(10)
  const [loading,    setLoading]   = useState(false)
  const [error,      setError]     = useState('')

  const currentSection = TOPICS.find(s => s.section === sectionId) || TOPICS[0]
  const isDiagnostic   = difficulty === 'diagnostic'

  const pickTopic = (t, secId) => { setTopic(t); setTopicSec(secId); setError('') }

  const start = async () => {
    if (!topic) return
    setError(''); setLoading(true)
    try {
      const d = isDiagnostic
        ? await generateTopicTest(topicSec, topic.id, count, user?.id || null)
        : await generateMiniTest(topicSec, topic.id, count, difficulty, user?.id || studentName)
      onStart(d)
    }
    catch(e) { setError(e.friendlyMessage||'Server error. Please try again.'); setLoading(false) }
  }

  const diffStyle = { easy:'bg-emerald-100 text-emerald-800 border-emerald-300', medium:'bg-amber-100 text-amber-800 border-amber-300', hard:'bg-red-100 text-red-800 border-red-300', mixed:'bg-orange-100 text-orange-800 border-orange-300', diagnostic:'bg-orange-100 text-orange-800 border-orange-300' }

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start">

      {/* ── TOPIC CARDS for selected section ── */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          {currentSection.label} — {currentSection.topics.length} Topics
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
          {currentSection.topics.map(t => {
            const isSel = topic?.id === t.id
            return (
              <button key={t.id}
                onClick={() => pickTopic(t, currentSection.section)}
                className={`text-left px-3 py-2 rounded-xl border transition-all hover:shadow-sm ${isSel ? 'border-2' : ''}`}
                style={isSel
                  ? { background:'#FFF3EE', borderColor:'#FF653F' }
                  : { background:`${currentSection.accent}0D`, borderColor:`${currentSection.accent}33`, borderLeftColor: currentSection.accent, borderLeftWidth: 4 }}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold leading-tight"
                    style={{ color: isSel ? '#111' : currentSection.accent }}>
                    {t.label}
                  </span>
                  {isSel && <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background:'#FF653F' }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: config panel ── */}
      <div className="w-full xl:w-72 flex-shrink-0">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4 xl:sticky xl:top-4">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">{topic ? secLabel(topicSec) : 'No topic selected'}</div>
            <div className="text-base font-black" style={{color: topic ? '#FF653F' : '#9ca3af'}}>{topic ? topic.label : 'Pick a topic →'}</div>
          </div>

          {/* ── Mode: Diagnostic vs Practice ── */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>setDifficulty('diagnostic')}
                className={`py-1.5 text-xs font-semibold rounded-xl border-2 transition-all ${isDiagnostic ? diffStyle.diagnostic+' border-current' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                Diagnostic
              </button>
              <button onClick={()=>setDifficulty(prev => prev==='diagnostic' ? 'easy' : prev)}
                className={`py-1.5 text-xs font-semibold rounded-xl border-2 transition-all ${!isDiagnostic ? 'bg-blue-50 text-blue-700 border-blue-300 border-current' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                Practice
              </button>
            </div>
            {isDiagnostic && (
              <p className="text-[11px] text-orange-600 mt-1.5 leading-tight">
                Auto-mix of Easy + Medium + Hard — shows your level instantly after the test
              </p>
            )}
          </div>

          {/* ── Difficulty (only when Practice mode) ── */}
          {!isDiagnostic && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Difficulty</p>
            <div className="grid grid-cols-2 gap-2">
              {['easy','medium','hard','mixed'].map(d=>(
                <button key={d} onClick={()=>setDifficulty(d)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border-2 capitalize transition-all
                    ${difficulty===d ? diffStyle[d]+' border-current' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                  {d === 'mixed' ? 'Mixed' : d}
                </button>
              ))}
            </div>
          </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Number of questions</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:'#FFF3EE', color:'#FF653F'}}>~{Math.max(5,count)} min</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[5,10,15,20,30,50].map(n=>(
                <button key={n} onClick={()=>setCount(n)}
                  className={`h-9 text-xs font-bold rounded-xl border-2 transition-all
                    ${count===n ? 'text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-orange-300'}`}
                  style={count===n ? {borderColor:'#FF653F',background:'#FF653F'} : {}}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <button onClick={start} disabled={loading || !topic}
            className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{background:'#FF653F'}}
            onMouseOver={e=>!loading&&topic&&(e.currentTarget.style.background='#e5512f')}
            onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating…</span>
              : !topic
                ? 'Select a topic to start'
                : isDiagnostic
                  ? `Start Diagnostic · ${count}Q · ~${Math.max(5,count)} min`
                  : `Start · ${count}Q · ~${Math.max(5,count)} min · ${difficulty}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Section Test ─────────────────────────────────────────
function SectionTestTab({ studentName, onStart, user = null }) {
  const [sec,     setSec]     = useState('numerical_ability')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const SECS = [
    { id:'numerical_ability', label:'Numerical Ability', q:35, mins:20, accent:'#F59E0B', bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-800' },
    { id:'reasoning',         label:'Reasoning Ability', q:35, mins:20, accent:'#8B5CF6', bg:'bg-violet-50', border:'border-violet-200', text:'text-violet-800' },
    { id:'english',           label:'English Language',  q:30, mins:20, accent:'#10B981', bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-800' },
  ]
  const active = SECS.find(s=>s.id===sec)||SECS[0]

  const start = async () => {
    setError(''); setLoading(true)
    // For section tests, cycle through all topics of that section
    // Send multiple mini-tests and merge — or use the first topic with enough Q count
    // Strategy: pick the highest-variety topic per section
    const topic = 'all'
    const sectDiff = user?.id ? 'adaptive' : 'mixed'
    try { const d = await generateMiniTest(sec, topic, active.q, sectDiff, user?.id || null); onStart(d) }
    catch(e) { setError(e.friendlyMessage||'Server error. Please try again.'); setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Practice one complete section under timed exam conditions</p>

      <div className="grid grid-cols-3 gap-3">
        {SECS.map(s=>(
          <button key={s.id} onClick={()=>{setSec(s.id);setError('')}}
            className={`p-4 rounded-2xl border-2 text-left transition-all
              ${sec===s.id ? `border-2 ${s.border} ${s.bg}` : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className={`text-xs font-bold mb-1 ${sec===s.id?s.text:'text-gray-700'}`}>{s.label}</div>
            <div className="text-xs text-gray-400">{s.q}Q · {s.mins} min</div>
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border-2 ${active.border} ${active.bg} p-4`}>
        <div className={`font-bold text-sm mb-3 ${active.text}`}>{active.label} Section Test</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[[`${active.q}Q`,'Questions'],[`${active.mins} min`,'Timer'],['-0.25','Negative']].map(([v,l])=>(
            <div key={l} className="bg-white rounded-xl p-2">
              <div className={`text-sm font-bold ${active.text}`}>{v}</div>
              <div className="text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-0.5">
        <div className="font-semibold mb-1">Section test rules:</div>
        <div>• 20-minute timer starts immediately on begin</div>
        <div>• Same difficulty mix as real IBPS / SBI exam</div>
        <div>• Full explanation PDF available after submission</div>
      </div>

      {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

      <button onClick={start} disabled={loading}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-all"
        style={{background:'#FF653F'}}
        onMouseOver={e=>!loading&&(e.currentTarget.style.background='#e5512f')}
        onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating section test...</span>
          : `Start ${active.label} · ${active.q}Q · ${active.mins} min`}
      </button>
    </div>
  )
}

// ── Main HomeScreen ───────────────────────────────────────────
export default function HomeScreen({ studentName, onStart, onBack, onNav, onLogout, startMode = 'mock', startExamId = '', user = null }) {
  const isUSUser = user?.user_metadata?.exam_region === 'us'
  // An explicit non-SAT/ACT exam ID (e.g. 'bank_clerk_prelims') must override the US region default.
  const hasExplicitNonSATExam = !!startExamId && !startExamId.startsWith('sat_') && !startExamId.startsWith('act_')
  const isSAT = (isUSUser && !hasExplicitNonSATExam) || startExamId?.startsWith('sat_') || startExamId?.startsWith('act_')
  // US users default to sat_full only when no specific exam was requested
  const effectiveExamId = (isUSUser && !startExamId) ? 'sat_full' : startExamId
  const [tab,          setTab]          = useState(hasExplicitNonSATExam ? startMode : (isSAT ? 'sat' : startMode))
  const [topicSecId,   setTopicSecId]   = useState('numerical_ability')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mainRef = useRef(null)

  // Registration + subscription → which exams the user may launch
  const _meta = user?.user_metadata || {}
  const _plan = (_meta.plan || _meta.subscription || 'free').toLowerCase()
  const isPro = !['free','','none'].includes(_plan)
  const registeredExamIds = (Array.isArray(_meta.selected_exams) && _meta.selected_exams.length)
    ? _meta.selected_exams
    : (_meta.target_exam ? [_meta.target_exam] : [])

  // Filtered bank tree based on subscription (lifted here so header nav stays in sync)
  const _hasReg = registeredExamIds.length > 0
  const bankTree = (() => {
    if (isPro || !_hasReg) return EXAM_TREE
    const filtered = EXAM_TREE
      .map(g => ({ ...g, exams: g.exams.filter(e => registeredExamIds.includes(e.id) || FREE_OPEN_EXAMS.has(e.id)) }))
      .filter(g => g.exams.length > 0)
    return filtered.length ? filtered : EXAM_TREE
  })()

  const _initBankForHeader = (effectiveExamId && !isSAT)
    ? (bankTree.find(g => g.exams.some(e => e.id === effectiveExamId))?.bank || bankTree[0].bank)
    : bankTree[0].bank
  const [activeBank, setActiveBank] = useState(_initBankForHeader)

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [tab])

  // 7-day trial
  const createdAt     = user?.created_at ? new Date(user.created_at) : new Date()
  const trialDaysLeft = Math.max(0, Math.ceil((createdAt.getTime() + 7*86400000 - Date.now())/86400000))
  const trialActive   = !isPro && trialDaysLeft > 0

  const initials = (studentName||'U').slice(0,2).toUpperCase()
  // If the user has an explicit non-SAT exam (e.g. admin-assigned Banking exam), show Indian tabs.
  // Otherwise follow the region preference: US users see SAT only; SAT-start users see both.
  const tabs = hasExplicitNonSATExam
    ? [
        { id:'mock',    label:'Full Mock Test',  icon:<HIcDoc s={13}/> },
        { id:'topic',   label:'Topic Practice',  icon:<HIcTarget s={13}/> },
        { id:'section', label:'Section Test',    icon:<HIcTimer s={13}/> },
      ]
    : isUSUser
      ? [
          { id:'sat', label:'SAT Practice', icon:<HIcGrad s={13}/> },
        ]
      : isSAT
        ? [
            { id:'sat',     label:'SAT Practice',    icon:<HIcGrad s={13}/> },
            { id:'mock',    label:'India Exams',      icon:<HIcDoc s={13}/> },
          ]
        : [
            { id:'mock',    label:'Full Mock Test',  icon:<HIcDoc s={13}/> },
            { id:'topic',   label:'Topic Practice',  icon:<HIcTarget s={13}/> },
            { id:'section', label:'Section Test',    icon:<HIcTimer s={13}/> },
          ]
  const SIDE = [
    { id:'dashboard',     label:'Dashboard',     Icon:SvgHome  },
    { id:'explore',       label:'Explore Exams', Icon:SvgDoc   },
    { id:'studyplan',     label:'Study Planner', Icon:SvgCal   },
    { id:'performance',   label:'My Performance', Icon:SvgChart },
    { id:'subscriptions', label:'Subscriptions', Icon:SvgClip  },
    { id:'profile',       label:'Profile',       Icon:SvgUser  },
    { id:'billing',       label:'Billing',       Icon:SvgCard  },
    { id:'settings',      label:'Settings',      Icon:SvgGear  },
  ]

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{background:'#fff'}}>

      {/* ── Header ── */}
      <header className="h-16 flex items-center px-5 gap-4 flex-shrink-0" style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'#FF653F'}}>
            <span className="text-white text-sm font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-base font-black tracking-tight" style={{color:'#111827'}}>MockTest</div>
            <div style={{fontSize:8.5,fontWeight:700,color:'#FF653F',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
          </div>
        </div>
        {/* Bank nav in header — Full Mock tab only; spacer otherwise */}
        {tab === 'mock' ? (
          <>
            <div style={{flex:1,minWidth:0}} />
            <div style={{overflowX:'auto',scrollbarWidth:'none',flexShrink:1}}>
              <div style={{display:'flex',alignItems:'stretch',height:64,minWidth:'max-content'}}>
                {bankTree.map(g => (
                  <button key={g.bank} onClick={() => setActiveBank(g.bank)} style={{
                    padding:'0 13px',fontWeight:700,fontSize:12,border:'none',cursor:'pointer',
                    transition:'all .12s',whiteSpace:'nowrap',background:'transparent',
                    color: activeBank===g.bank ? '#FF653F' : '#9ca3af',
                    borderBottom: activeBank===g.bank ? '2.5px solid #FF653F' : '2.5px solid transparent',
                  }}>{g.bank}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1,minWidth:0}} />
          </>
        ) : (
          <div className="flex-1" />
        )}
        {/* Trial pill */}
        {trialActive && (
          <div className="hidden sm:flex items-center gap-2 text-xs flex-shrink-0" style={{color:'#6b7280'}}>
            <span>{trialDaysLeft === 1 ? 'Last day' : <><b style={{color:'#FF653F'}}>{trialDaysLeft}d</b> left</>}</span>
            <button onClick={()=>onNav?.('subscriptions')}
              className="text-white text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0"
              style={{ background:'#FF653F' }}>
              Upgrade
            </button>
          </div>
        )}
        <button onClick={onBack}
          className="text-sm rounded-xl px-3 py-1.5 font-medium transition-colors flex-shrink-0"
          style={{color:'#374151',background:'#f3f4f6',border:'1px solid #e5e7eb'}}>
          ← <span className="hidden sm:inline">Exit</span>
        </button>
        {/* User avatar dropdown */}
        <div className="relative flex-shrink-0" style={{zIndex:50}}>
          {userMenuOpen && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setUserMenuOpen(false)}/>}
          <button onClick={()=>setUserMenuOpen(o=>!o)}
            style={{display:'flex',alignItems:'center',gap:7,background:'#f3f4f6',border:'1px solid #e5e7eb',borderRadius:999,padding:'4px 10px 4px 4px',cursor:'pointer',position:'relative',zIndex:50}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#fff',flexShrink:0}}>
              {initials[0]}
            </div>
            <span className="hidden sm:block" style={{fontSize:12,fontWeight:700,color:'#374151',maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {(studentName||'').split(' ')[0] || 'User'}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{transform:userMenuOpen?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {userMenuOpen && (
            <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,boxShadow:'0 8px 28px rgba(0,0,0,.15)',minWidth:210,zIndex:50,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:'1px solid #f3f4f6'}}>
                <div style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:2}}>{(studentName||'User').replace(/\b\w/g,c=>c.toUpperCase())}</div>
                <div style={{fontSize:11,color:'#9ca3af'}}>{user?.email}</div>
              </div>
              <div style={{padding:6}}>
                <button onClick={()=>{setUserMenuOpen(false);onLogout?.()}}
                  style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600,color:'#ef4444',textAlign:'left'}}
                  onMouseOver={e=>e.currentTarget.style.background='#fee2e2'}
                  onMouseOut={e=>e.currentTarget.style.background='none'}>
                  ↪ Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ── Left sidebar ── */}
        <aside className="w-56 flex-shrink-0 hidden md:flex flex-col overflow-y-auto"
          style={{background:'#f8fafc',borderRight:'1px solid #e5e7eb'}}>
          <nav className="flex-1 py-3 px-2">
            {SIDE.map(item => (
              <button key={item.id} onClick={()=>onNav?.(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm mb-0.5 transition-all font-medium"
                style={{color:'#6b7280'}}
                onMouseOver={e=>{e.currentTarget.style.background='#f0f0f0';e.currentTarget.style.color='#374151'}}
                onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b7280'}}>
                <span className="flex-shrink-0 opacity-75"><item.Icon /></span>{item.label}
              </button>
            ))}
            {tab === 'topic' && (
              <div className="mt-3 pt-3" style={{borderTop:'1px solid #e5e7eb'}}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1" style={{color:'#9ca3af'}}>Subject</p>
                {TOPICS.map(sec => {
                  const active = topicSecId === sec.section
                  return (
                    <button key={sec.section}
                      onClick={() => setTopicSecId(sec.section)}
                      className="w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition-all"
                      style={active
                        ? { background:`${sec.accent}20`, color: sec.accent }
                        : { color:'#6b7280' }}
                      onMouseOver={e=>{if(!active){e.currentTarget.style.background='#f0f0f0';e.currentTarget.style.color='#374151'}}}
                      onMouseOut={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b7280'}}}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sec.accent }}/>
                        <span className="text-xs font-semibold leading-tight">{sec.label}</span>
                      </div>
                      <div className="text-[10px] mt-0.5 ml-4" style={{color:'#9ca3af'}}>{sec.topics.length} topics</div>
                    </button>
                  )
                })}
              </div>
            )}
          </nav>
          {/* user block hidden on desktop — user info lives in topbar avatar dropdown */}
        </aside>

        {/* ── Main content ── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto nice-scroll flex flex-col" style={{background:'#fff'}}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{flex:1,padding:'24px 28px 0'}}>

            {/* Header */}
            <div style={{marginBottom:22}}>
              <h1 style={{fontSize:22,fontWeight:900,color:'#111827',letterSpacing:'-.03em',lineHeight:1.2,margin:0}}>Practice</h1>
              <p style={{fontSize:13,color:'#6b7280',marginTop:4,fontWeight:500}}>
                {tab==='mock'    ? 'Choose an exam and launch a full mock test'
                :tab==='topic'   ? 'Focus on a single topic — any difficulty, any count'
                :tab==='section' ? 'Practice one complete section under timed conditions'
                :tab==='sat'     ? 'Digital SAT practice — adaptive modules, no negative marking'
                :                  'Select a mode to begin'}
              </p>
            </div>

            {/* Mode tab switcher */}
            <div style={{overflowX:'auto',scrollbarWidth:'none',marginBottom:22,borderBottom:'1px solid #e5e7eb',paddingBottom:16}}>
              <div style={{display:'flex',gap:6,minWidth:'max-content'}}>
                {tabs.map(t => (
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{
                    display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',
                    borderRadius:8,fontWeight:700,fontSize:12,cursor:'pointer',border:'1.5px solid',
                    transition:'all .12s',whiteSpace:'nowrap',
                    background: tab===t.id ? '#FF653F' : '#f9fafb',
                    borderColor: tab===t.id ? '#FF653F' : '#e5e7eb',
                    color: tab===t.id ? '#fff' : '#6b7280',
                    boxShadow: tab===t.id ? '0 2px 10px rgba(255,101,63,.22)' : 'none',
                  }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile-only subject selector for topic tab */}
            {tab === 'topic' && (
              <div className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
                {TOPICS.map(sec => {
                  const active = topicSecId === sec.section
                  return (
                    <button key={sec.section} onClick={() => setTopicSecId(sec.section)}
                      style={{
                        flexShrink:0,display:'flex',alignItems:'center',gap:5,padding:'6px 12px',
                        borderRadius:20,fontSize:11,fontWeight:700,border:'1.5px solid',
                        whiteSpace:'nowrap',cursor:'pointer',transition:'all .12s',
                        background: active ? sec.accent : '#fff',
                        borderColor: active ? sec.accent : `${sec.accent}44`,
                        color: active ? '#fff' : sec.accent,
                      }}>
                      <span style={{width:5,height:5,borderRadius:'50%',background: active?'#fff':sec.accent,flexShrink:0}}/>
                      {sec.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Tab content */}
            {tab === 'mock' ? (
              <FullMockTab studentName={studentName} onStart={onStart} onNeedAuth={!user ? () => onNav?.('auth') : undefined} initialExamId={isSAT ? '' : startExamId} registeredExamIds={registeredExamIds} isPro={isPro} bank={activeBank} onBankChange={setActiveBank} bankTree={bankTree} />
            ) : (
              <div style={{background:'#f9fafb',borderRadius:16,border:'1px solid #e5e7eb',padding:'24px'}}>
                {tab==='sat'     && <SATExamTab studentName={studentName} onStart={onStart} initialExamId={effectiveExamId} />}
                {tab==='topic'   && <TopicPracticeTab key={topicSecId} studentName={studentName} onStart={onStart} user={user} sectionId={topicSecId} />}
                {tab==='section' && <SectionTestTab studentName={studentName} onStart={onStart} user={user} />}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
