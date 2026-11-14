import { useState, useEffect, useRef } from 'react'
import Footer from '../components/Footer.jsx'

/* ──────────────────────────────────────────────────────────────
   Public "Exams" page — category filtering, FAQ JSON-LD, BreadcrumbList
────────────────────────────────────────────────────────────── */

const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const EIcBank  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
const EIcShield= ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const EIcClip  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const EIcGear  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const EIcTrain  = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M8 19l-2 3M16 19l2 3M9 19h6"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>
const EIcMedical= ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

const T = {
  numerical: ['Simplification','Number Series','Data Interpretation','Quadratic Equations','Percentage','Profit & Loss','Ratio & Proportion','Time & Work','Time & Distance','Average','Mensuration','Simple & Compound Interest','Probability','Permutation & Combination'],
  reasoning: ['Puzzles & Seating','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Order & Ranking','Alphanumeric Series','Input-Output','Data Sufficiency'],
  english:   ['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement','Vocabulary','Word Usage'],
  ga:        ['Current Affairs (6 months)','Banking Awareness','RBI & Monetary Policy','Financial & Economic Terms','Government Schemes','Static GK'],
  computer:  ['Computer Fundamentals','MS Office','Internet & Networking','Hardware & Software','Security Basics','Shortcut Keys'],
  ssc_q:     ['Number System','HCF & LCM','Percentage','Ratio & Proportion','Profit & Loss','SI & CI','Time & Work','Speed & Distance','Geometry','Trigonometry','Algebra','Average','Mensuration','Data Interpretation'],
  ssc_gi:    ['Analogies','Classifications','Series','Coding-Decoding','Blood Relations','Directions','Venn Diagrams','Non-Verbal Reasoning','Syllogism','Matrix','Paper Folding'],
  ssc_ga:    ['History','Geography','Indian Polity','Economics','General Science','Current Affairs','Static GK','Environment & Ecology'],
  ssc_eng:   ['Reading Comprehension','Fill in the Blanks','Error Detection','Sentence Improvement','Synonyms & Antonyms','Idioms & Phrases','One Word Substitution','Cloze Test','Para Jumbles'],
  rail_m:    ['Number System','Percentage','Ratio & Proportion','Profit & Loss','SI & CI','Time & Work','Speed & Distance','Geometry','Mensuration','Statistics'],
  rail_gi:   ['Analogies','Coding-Decoding','Blood Relations','Directions','Series','Syllogism','Venn Diagrams','Statement & Conclusion'],
  rail_ga:   ['History','Geography','Polity','Economics','Current Affairs','Railway Awareness','Static GK'],
  rail_sci:  ['Physics','Chemistry','Biology (Life Sciences)','Computer & Applications'],
  engg_m:    ['Sets & Functions','Matrices','Calculus','Coordinate Geometry','Probability','Vectors','Complex Numbers','Differential Equations'],
  engg_phy:  ['Mechanics','Thermodynamics','Waves','Electrostatics','Current Electricity','Magnetism','Modern Physics','Optics'],
  engg_chem: ['Structure of Atom','Chemical Bonding','States of Matter','Thermodynamics','Organic Chemistry','Coordination Compounds','Electrochemistry','Polymers'],
  med_bio:   ['Cell Biology & Biomolecules','Genetics & Evolution','Human Physiology','Plant Physiology','Reproduction','Ecology','Biotechnology','Diversity in Living World'],
}

const SEC_COLOR = {
  English:'#16a34a', 'Numerical Ability':'#f59e0b', 'Quantitative Aptitude':'#f59e0b',
  'Reasoning Ability':'#7048e8', 'Reasoning & Computer Aptitude':'#7048e8',
  'General/Financial Awareness':'#0891b2', 'General Awareness':'#0891b2',
  'Data Analysis & Interpretation':'#f59e0b', 'Computer Knowledge':'#7048e8',
  'General Intelligence':'#7048e8', 'Mathematics':'#f59e0b', 'Reasoning & GI':'#7048e8',
  'English / Hindi':'#16a34a', 'General Science':'#16a34a',
  'Engineering Mathematics':'#f59e0b', 'General Aptitude':'#7048e8', 'Core Branch Subject':'#0891b2',
  Physics:'#7048e8', Chemistry:'#dc2626', 'Biology':'#16a34a', Botany:'#16a34a', Zoology:'#0891b2',
  'English & Logical Reasoning':'#16a34a', 'Pre-Clinical Subjects':'#0891b2',
  'Para-Clinical Subjects':'#f59e0b', 'Clinical Subjects':'#F06535',
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

  // ── SSC ──
  { group:'CGL', category:'ssc', id:'ssc_cgl_t1', name:'SSC CGL', level:'Tier I', total:100, duration:'60 min', negative:0.5,
    sections:[
      { label:'General Intelligence', q:25, mins:15, topics:T.ssc_gi },
      { label:'General Awareness', q:25, mins:15, topics:T.ssc_ga },
      { label:'Quantitative Aptitude', q:25, mins:15, topics:T.ssc_q },
      { label:'English', q:25, mins:15, topics:T.ssc_eng },
    ]},
  { group:'CGL', category:'ssc', id:'ssc_cgl_t2', name:'SSC CGL', level:'Tier II', total:130, duration:'135 min', negative:1,
    sections:[
      { label:'Mathematics', q:30, mins:60, topics:T.ssc_q },
      { label:'Reasoning & GI', q:30, mins:60, topics:T.ssc_gi },
      { label:'English', q:45, mins:45, topics:T.ssc_eng },
      { label:'General Awareness', q:25, mins:30, topics:T.ssc_ga },
    ]},
  { group:'CHSL', category:'ssc', id:'ssc_chsl_t1', name:'SSC CHSL', level:'Tier I', total:100, duration:'60 min', negative:0.5,
    sections:[
      { label:'English', q:25, mins:15, topics:T.ssc_eng },
      { label:'General Intelligence', q:25, mins:15, topics:T.ssc_gi },
      { label:'Quantitative Aptitude', q:25, mins:15, topics:T.ssc_q },
      { label:'General Awareness', q:25, mins:15, topics:T.ssc_ga },
    ]},
  { group:'CHSL', category:'ssc', id:'ssc_chsl_t2', name:'SSC CHSL', level:'Tier II', total:100, duration:'60 min', negative:0.5,
    sections:[
      { label:'Mathematics', q:30, mins:30, topics:T.ssc_q },
      { label:'Reasoning & GI', q:30, mins:30, topics:T.ssc_gi },
      { label:'English', q:40, mins:40, topics:T.ssc_eng },
    ]},
  { group:'MTS', category:'ssc', id:'ssc_mts_t1', name:'SSC MTS', level:'Tier I', total:90, duration:'90 min', negative:1,
    sections:[
      { label:'Numerical Ability', q:20, mins:22, topics:T.ssc_q },
      { label:'General Intelligence', q:20, mins:23, topics:T.ssc_gi },
      { label:'English', q:25, mins:25, topics:T.ssc_eng },
      { label:'General Awareness', q:25, mins:20, topics:T.ssc_ga },
    ]},
  { group:'CPO', category:'ssc', id:'ssc_cpo_t1', name:'SSC CPO', level:'Tier I', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'General Intelligence', q:50, mins:30, topics:T.ssc_gi },
      { label:'General Awareness', q:50, mins:30, topics:T.ssc_ga },
      { label:'Quantitative Aptitude', q:50, mins:30, topics:T.ssc_q },
      { label:'English', q:50, mins:30, topics:T.ssc_eng },
    ]},
  { group:'GD', category:'ssc', id:'ssc_gd', name:'SSC GD Constable', level:'CBT', total:80, duration:'60 min', negative:0.5,
    sections:[
      { label:'General Intelligence', q:20, mins:15, topics:T.ssc_gi },
      { label:'General Awareness', q:20, mins:15, topics:T.ssc_ga },
      { label:'Mathematics', q:20, mins:15, topics:T.ssc_q },
      { label:'English / Hindi', q:20, mins:15, topics:T.ssc_eng },
    ]},
  { group:'Steno', category:'ssc', id:'ssc_steno', name:'SSC Stenographer', level:'Tier I', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'General Intelligence', q:50, mins:35, topics:T.ssc_gi },
      { label:'General Awareness', q:50, mins:35, topics:T.ssc_ga },
      { label:'English', q:100, mins:50, topics:T.ssc_eng },
    ]},

  // ── Railway ──
  { group:'NTPC', category:'railway', id:'rrb_ntpc_cbt1', name:'RRB NTPC', level:'CBT 1', total:100, duration:'90 min', negative:0.33,
    sections:[
      { label:'Mathematics', q:30, mins:30, topics:T.rail_m },
      { label:'General Intelligence', q:30, mins:30, topics:T.rail_gi },
      { label:'General Awareness', q:40, mins:30, topics:T.rail_ga },
    ]},
  { group:'NTPC', category:'railway', id:'rrb_ntpc_cbt2', name:'RRB NTPC', level:'CBT 2', total:120, duration:'90 min', negative:0.33,
    sections:[
      { label:'Mathematics', q:35, mins:30, topics:T.rail_m },
      { label:'General Intelligence', q:35, mins:30, topics:T.rail_gi },
      { label:'General Awareness', q:50, mins:30, topics:T.rail_ga },
    ]},
  { group:'Group D', category:'railway', id:'rrb_groupd', name:'RRB Group D', level:'CBT', total:100, duration:'90 min', negative:0.33,
    sections:[
      { label:'Mathematics', q:25, mins:22, topics:T.rail_m },
      { label:'General Intelligence', q:30, mins:27, topics:T.rail_gi },
      { label:'General Science', q:25, mins:22, topics:T.rail_sci },
      { label:'General Awareness', q:20, mins:19, topics:T.rail_ga },
    ]},
  { group:'ALP', category:'railway', id:'rrb_alp_s1', name:'RRB ALP', level:'Stage 1', total:75, duration:'60 min', negative:0.33,
    sections:[
      { label:'Mathematics', q:20, mins:16, topics:T.rail_m },
      { label:'General Intelligence', q:25, mins:20, topics:T.rail_gi },
      { label:'General Science', q:20, mins:16, topics:T.rail_sci },
      { label:'General Awareness', q:10, mins:8, topics:T.rail_ga },
    ]},
  { group:'JE', category:'railway', id:'rrb_je_cbt1', name:'RRB JE', level:'CBT 1', total:100, duration:'90 min', negative:0.33,
    sections:[
      { label:'Mathematics', q:30, mins:27, topics:T.rail_m },
      { label:'General Intelligence', q:25, mins:22, topics:T.rail_gi },
      { label:'General Awareness', q:15, mins:13, topics:T.rail_ga },
      { label:'General Science', q:30, mins:28, topics:T.rail_sci },
    ]},

  // ── Engineering ──
  { group:'JEE', category:'engineering', id:'jee_main', name:'JEE Main', level:'Paper 1', total:90, duration:'180 min', negative:1,
    sections:[
      { label:'Mathematics', q:30, mins:60, topics:T.engg_m },
      { label:'Physics', q:30, mins:60, topics:T.engg_phy },
      { label:'Chemistry', q:30, mins:60, topics:T.engg_chem },
    ]},
  { group:'JEE', category:'engineering', id:'jee_adv', name:'JEE Advanced', level:'Paper 1', total:54, duration:'180 min', negative:2,
    sections:[
      { label:'Mathematics', q:18, mins:60, topics:T.engg_m },
      { label:'Physics', q:18, mins:60, topics:T.engg_phy },
      { label:'Chemistry', q:18, mins:60, topics:T.engg_chem },
    ]},
  { group:'GATE', category:'engineering', id:'gate_gen', name:'GATE', level:'General Paper', total:65, duration:'180 min', negative:0.67,
    sections:[
      { label:'Engineering Mathematics', q:13, mins:35, topics:T.engg_m },
      { label:'General Aptitude', q:10, mins:25, topics:T.ssc_gi },
      { label:'Core Branch Subject', q:42, mins:120, topics:['Domain-specific Questions'] },
    ]},
  { group:'BITSAT', category:'engineering', id:'bitsat', name:'BITSAT', level:'Full Test', total:130, duration:'180 min', negative:1,
    sections:[
      { label:'Mathematics', q:40, mins:50, topics:T.engg_m },
      { label:'Physics', q:30, mins:38, topics:T.engg_phy },
      { label:'Chemistry', q:30, mins:38, topics:T.engg_chem },
      { label:'English & Logical Reasoning', q:30, mins:34, topics:T.ssc_eng },
    ]},

  // ── Medical ──
  { group:'NEET', category:'medical', id:'neet_ug', name:'NEET UG', level:'Phase 1', total:200, duration:'200 min', negative:1,
    sections:[
      { label:'Physics', q:50, mins:50, topics:T.engg_phy },
      { label:'Chemistry', q:50, mins:50, topics:T.engg_chem },
      { label:'Botany', q:50, mins:50, topics:T.med_bio },
      { label:'Zoology', q:50, mins:50, topics:T.med_bio },
    ]},
  { group:'NEET PG', category:'medical', id:'neet_pg', name:'NEET PG', level:'Phase 1', total:200, duration:'210 min', negative:1,
    sections:[
      { label:'Pre-Clinical Subjects', q:50, mins:52, topics:['Anatomy','Physiology','Biochemistry'] },
      { label:'Para-Clinical Subjects', q:50, mins:52, topics:['Pathology','Microbiology','Pharmacology','Forensic Medicine'] },
      { label:'Clinical Subjects', q:100, mins:106, topics:['Medicine','Surgery','OBG','Paediatrics','Orthopaedics','ENT','Ophthalmology','PSM'] },
    ]},
  { group:'AIIMS', category:'medical', id:'aiims_pg', name:'AIIMS PG', level:'Entrance', total:200, duration:'210 min', negative:0.33,
    sections:[
      { label:'Pre-Clinical Subjects', q:45, mins:47, topics:['Anatomy','Physiology','Biochemistry'] },
      { label:'Para-Clinical Subjects', q:55, mins:57, topics:['Pathology','Microbiology','Pharmacology','Community Medicine'] },
      { label:'Clinical Subjects', q:100, mins:106, topics:['Medicine','Surgery','OBG','Paediatrics','ENT','Ophthalmology','Orthopaedics'] },
    ]},
]

const CATEGORY_META = {
  banking:     { label:'Banking',     title:'Bank & Government Financial Exams',          subtitle:'IBPS · SBI · RRB · RBI · NABARD — pick an exam to see sections, question counts, timing and syllabus.' },
  insurance:   { label:'Insurance',   title:'Insurance Sector Exams',                     subtitle:'LIC · NIACL · NICL · IPPB — detailed exam patterns with sections, question counts and timing.' },
  ssc:         { label:'SSC',         title:'SSC — Staff Selection Commission Exams',     subtitle:'CGL · CHSL · MTS · CPO · GD · Steno — full tier-wise exam patterns with question counts and negative marking.' },
  railway:     { label:'Railway',     title:'Railway Recruitment Board Exams',            subtitle:'NTPC · Group D · ALP · JE — complete CBT patterns with section-wise question counts and timing.' },
  engineering: { label:'Engineering', title:'Engineering Entrance & Recruitment Exams',   subtitle:'JEE Main · JEE Advanced · GATE · BITSAT — subject-wise patterns with question counts and marking schemes.' },
  medical:     { label:'Medical',     title:'Medical Entrance & PG Exams',               subtitle:'NEET UG · NEET PG · AIIMS PG — full exam patterns with section-wise question counts and negative marking.' },
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
    { q:'How many questions are in SSC CGL Tier I?', a:'SSC CGL Tier I has 100 questions — 25 each in General Intelligence, General Awareness, Quantitative Aptitude and English — in 60 minutes. Each wrong answer carries a penalty of 0.50 marks.' },
    { q:'What is the difference between SSC CGL and SSC CHSL?', a:'SSC CGL is for graduates and recruits Group B and C posts (Assistants, Inspector, JSO etc.), while SSC CHSL is for 12th-pass candidates for Group C posts (LDC, JSA, DEO). CGL has higher difficulty and better pay grades.' },
    { q:'How many questions are in SSC GD CBT?', a:'SSC GD Constable CBT has 80 questions — 20 each in General Intelligence, General Awareness, Mathematics and English/Hindi — in 60 minutes with 0.50 mark negative.' },
  ],
  railway: [
    { q:'How many questions are in RRB NTPC CBT 1?', a:'RRB NTPC CBT 1 has 100 questions — 30 Mathematics, 30 General Intelligence & Reasoning, 40 General Awareness — in 90 minutes. Wrong answers carry 1/3 negative marking.' },
    { q:'What is the difference between RRB NTPC CBT 1 and CBT 2?', a:'CBT 1 is the screening test (100Q / 90 min) while CBT 2 is the main exam (120Q / 90 min). CBT 2 has a higher number of questions in each section and is harder. Only CBT 1 qualifiers appear for CBT 2.' },
    { q:'How many questions are in RRB Group D CBT?', a:'RRB Group D CBT has 100 questions — 25 Mathematics, 30 General Intelligence, 25 General Science, 20 General Awareness — in 90 minutes with 1/3 negative marking.' },
  ],
  engineering: [
    { q:'How many questions are in JEE Main?', a:'JEE Main Paper 1 has 90 questions — 30 each in Mathematics, Physics and Chemistry — in 180 minutes. Each correct answer gets 4 marks and wrong answers carry −1 negative marking.' },
    { q:'What is the difference between JEE Main and JEE Advanced?', a:'JEE Main is the gateway exam for NITs, IIITs and CFTIs, while JEE Advanced (top 2.5 lakh JEE Main qualifiers) is the entrance for IITs. JEE Advanced is significantly harder and has a different paper pattern.' },
    { q:'How many questions are in GATE?', a:'GATE has 65 questions in 180 minutes — 13 Engineering Mathematics, 10 General Aptitude, and 42 Core Branch questions. Marks range from 1 to 2 with 1/3 or 2/3 negative marking per question type.' },
  ],
  medical: [
    { q:'How many questions are in NEET UG?', a:'NEET UG has 200 questions (180 to attempt) — 50 each in Physics, Chemistry, Botany and Zoology — in 200 minutes. Each correct answer gets 4 marks with −1 for wrong answers.' },
    { q:'What is the difference between NEET UG and NEET PG?', a:'NEET UG is for undergraduate medical admissions (MBBS/BDS) after Class 12, while NEET PG is for postgraduate medical admissions (MD/MS/Diploma) after MBBS. NEET PG tests clinical knowledge across all major medical specialties.' },
    { q:'Is AIIMS separate from NEET?', a:'Since 2020, AIIMS and JIPMER UG admissions are done through NEET UG. AIIMS PG (for MD/MS/PhD) is however a separate exam conducted by AIIMS institutes, testing pre-clinical, para-clinical and clinical subjects.' },
  ],
}

const QUICK_LINKS = [
  { label:'Syllabus',             sub:'Complete exam syllabus',    color:'#2563eb', bg:'#eff6ff', nav:'syllabus',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { label:'Previous Year Papers', sub:'Download PDFs',             color:'#ea580c', bg:'#fff7ed', nav:'papers',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
  { label:'Preparation Tips',     sub:'Expert guidance',           color:'#d97706', bg:'#fffbeb', nav:'blog',
    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

const EXAM_UPDATES = {
  banking: [
    { dot:'#16a34a', label:'IBPS PO 2026 Prelims Result Out',         date:'Oct 18, 2026' },
    { dot:'#f59e0b', label:'SBI PO 2026 Mains Admit Card Released',   date:'Oct 14, 2026' },
    { dot:'#0891b2', label:'RBI Grade B 2026 Phase 2 Date Notified',  date:'Oct 09, 2026' },
    { dot:'#F06535', label:'IBPS Clerk 2026 Notification Released',   date:'Oct 05, 2026' },
  ],
  insurance: [
    { dot:'#16a34a', label:'LIC ADO 2026 Mains Result Announced',     date:'Oct 16, 2026' },
    { dot:'#f59e0b', label:'NIACL Assistant 2026 Notification',       date:'Oct 10, 2026' },
    { dot:'#0891b2', label:'UIIC Assistant 2026 Exam Date',           date:'Oct 03, 2026' },
    { dot:'#F06535', label:'LIC AAO 2026 Interview Schedule',         date:'Sep 28, 2026' },
  ],
  ssc: [
    { dot:'#16a34a', label:'SSC CGL 2026 Tier I Result Out',          date:'Oct 19, 2026' },
    { dot:'#f59e0b', label:'SSC CHSL 2026 Tier I Answer Key',         date:'Oct 13, 2026' },
    { dot:'#0891b2', label:'SSC MTS 2026 Admit Card Released',        date:'Oct 08, 2026' },
    { dot:'#F06535', label:'SSC GD 2026 Notification Published',      date:'Oct 02, 2026' },
  ],
  railway: [
    { dot:'#16a34a', label:'RRB NTPC 2026 CBT 1 Result Out',         date:'Oct 17, 2026' },
    { dot:'#f59e0b', label:'RRB ALP 2026 Technician Admit Card',     date:'Oct 11, 2026' },
    { dot:'#0891b2', label:'RRB Group D 2026 Notification',          date:'Oct 06, 2026' },
    { dot:'#F06535', label:'RRB JE 2026 Exam Dates Announced',       date:'Oct 01, 2026' },
  ],
  engineering: [
    { dot:'#16a34a', label:'JEE Advanced 2027 Exam Date Notified',   date:'Oct 15, 2026' },
    { dot:'#f59e0b', label:'GATE 2027 Registration Opens',           date:'Oct 11, 2026' },
    { dot:'#0891b2', label:'JEE Main 2027 Session 1 Schedule',       date:'Oct 07, 2026' },
    { dot:'#F06535', label:'BITSAT 2027 Application Form Out',       date:'Oct 02, 2026' },
  ],
  medical: [
    { dot:'#16a34a', label:'NEET UG 2027 Notification Released',     date:'Oct 18, 2026' },
    { dot:'#f59e0b', label:'NEET PG 2026 Final Result Out',          date:'Oct 13, 2026' },
    { dot:'#0891b2', label:'AIIMS PG 2027 Registration Opens',       date:'Oct 08, 2026' },
    { dot:'#F06535', label:'JIPMER PG 2027 Application Form',        date:'Oct 02, 2026' },
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

const CARD_IN_CSS = `
@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* ── Layout ── */
.exams-body    { display:flex; flex:1; }
.exams-menu-btn { display:none; }
.exams-sidebar {
  width: 220px; background:#0f172a; border-right:1px solid rgba(255,255,255,.07);
  flex-shrink:0; display:flex; flex-direction:column;
  position:sticky; top:52px; height:calc(100vh - 52px);
  overflow-y:auto; overflow-x:hidden; transition:width .2s ease; scrollbar-width:none;
}
.exams-sidebar::-webkit-scrollbar { display:none; }
.exams-sidebar.sb-collapsed { width:56px; }
.sb-collapse-btn { flex-shrink:0; }
.exam-main  { flex:1; min-width:0; background:#f8fafc; }
.exam-page-content { padding:24px 32px 44px; box-sizing:border-box; }
.exam-content-layout { display:flex; gap:20px; align-items:flex-start; }
.exam-content-main { flex:1; min-width:0; }
.exam-right-panel { width:240px; flex-shrink:0; display:flex; flex-direction:column; gap:16px; position:sticky; top:68px; }
.exam-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }

@media (max-width:1200px) { .exam-right-panel { width:216px; } }
@media (max-width:1100px) { .exam-page-content { padding-inline:24px; } .exam-right-panel { display:none; } }

@media (max-width:900px) {
  .exams-menu-btn { display:flex !important; align-items:center; justify-content:center; }
  .sb-collapse-btn { display:none !important; }
  .exams-sidebar {
    position:fixed; top:0; left:0; height:100vh; width:260px !important;
    z-index:300; transform:translateX(-100%); transition:transform .25s ease;
  }
  .exams-sidebar.sb-open { transform:translateX(0); }
  .exam-main  { min-height:calc(100vh - 52px); }
  .exam-page-content { padding-inline:20px; }
}

@media (max-width:640px) {
  .exam-grid { grid-template-columns:1fr; }
  .exam-page-content { padding-inline:16px; }
  .exams-logo-text { display:none; }
  .exams-auth-login { display:none !important; }
}
`

/* ── Exam card for the grid ── */
function ExamCard({ exam, onNav, index = 0 }) {
  const shortName = exam.name.replace(/^(IBPS|SBI|RRB|RBI|NABARD|LIC|NIACL|NICL|IPPB|India Post)\s*/i, '') || exam.name
  const levelColor = exam.level === 'Prelims' ? { bg:'#eff6ff', c:'#2563eb' }
    : exam.level === 'Mains'   ? { bg:'#fdf4ff', c:'#9333ea' }
    : { bg:'#fff7ed', c:'#ea580c' }

  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden',
      boxShadow:'0 2px 8px rgba(15,23,42,.06)', display:'flex', flexDirection:'column', transition:'box-shadow .15s',
      animation:'cardIn 0.45s ease both', animationDelay:`${index * 0.1}s` }}
      onMouseOver={e => e.currentTarget.style.boxShadow='0 6px 24px rgba(15,23,42,.12)'}
      onMouseOut={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(15,23,42,.06)'}>

      {/* Card header */}
      <div style={{ padding:'12px 14px 10px', borderBottom:'1px solid #f1f5f9' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6, marginBottom:7 }}>
          <h3 style={{ fontSize:13.5, fontWeight:800, color:'#0f172a', margin:0, lineHeight:1.3 }}>
            {exam.name} <span style={{ color:'#94a3b8', fontWeight:500 }}>{exam.level}</span>
          </h3>
          <div style={{ display:'flex', gap:4, flexShrink:0 }}>
            {shortName && shortName !== exam.name && (
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:5, background:'#f1f5f9', color:'#475569' }}>{shortName}</span>
            )}
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:5, background:levelColor.bg, color:levelColor.c }}>{exam.level}</span>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display:'flex', gap:12 }}>
          {[{v:`${exam.total}`, l:'Questions', c:'#F06535'}, {v:exam.duration, l:'Duration', c:'#7048e8'}, {v:exam.negative>0?`−${exam.negative}`:'None', l:'Negative', c:'#dc2626'}].map(({v,l,c}) => (
            <div key={l}>
              <div style={{ fontSize:13.5, fontWeight:900, color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:9, color:'#94a3b8', fontWeight:500, marginTop:2, textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding:'10px 14px', flex:1 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {exam.sections.map(s => {
            const c = SEC_COLOR[s.label] || '#F06535'
            const pct = Math.round((s.q / exam.total) * 100)
            return (
              <div key={s.label}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <span style={{ fontSize:11.5, fontWeight:600, color:'#334155' }}>{s.label}</span>
                  <span style={{ fontSize:11.5, fontWeight:700, color:c }}>{s.q}Q</span>
                </div>
                <div style={{ height:3, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:c, opacity:.8 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Start button */}
      <div style={{ padding:'0 14px 12px' }}>
        <button onClick={() => onNav?.('auth')} style={{
          width:'100%', padding:'7px', background:'#F06535', color:'#fff', border:'none',
          borderRadius:8, fontSize:12.5, fontWeight:700, cursor:'pointer', transition:'background .15s',
        }}
        onMouseOver={e => e.currentTarget.style.background='#e5512f'}
        onMouseOut={e => e.currentTarget.style.background='#F06535'}>
          Start Free Mock →
        </button>
      </div>
    </div>
  )
}

let _pendingGroup = null

export default function ExamsPage({ onNav, category, isAdmin = false, user, onLogout }) {
  const catKey  = category || 'banking'
  const meta    = CATEGORY_META[catKey] || CATEGORY_META.banking
  const faqs    = CATEGORY_FAQ[catKey] || []
  const visibleExams = category ? EXAMS.filter(e => e.category === catKey) : EXAMS
  const allGroups = [...new Set(visibleExams.map(e => e.group))]

  const [selGroup, setSelGroup] = useState(allGroups[0])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sb-collapsed') === '1' } catch { return false }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const toggleSidebar = () => setSidebarCollapsed(c => {
    const next = !c
    try { localStorage.setItem('sb-collapsed', next ? '1' : '0') } catch {}
    return next
  })

  useEffect(() => {
    if (_pendingGroup && allGroups.includes(_pendingGroup)) {
      setSelGroup(_pendingGroup)
    } else {
      setSelGroup(allGroups[0])
    }
    _pendingGroup = null
  }, [catKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // BreadcrumbList + FAQ JSON-LD
  useEffect(() => {
    const BASE = 'https://prep.arkaserve.com'
    const catPath = category ? `/exams/${category}` : '/exams'
    injectJsonLD('ld-breadcrumb', {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type':'ListItem', position:1, name:'Home',  item:`${BASE}/` },
        { '@type':'ListItem', position:2, name:'Exams', item:`${BASE}/exams` },
        ...(category ? [{ '@type':'ListItem', position:3, name:meta.label, item:`${BASE}${catPath}` }] : []),
      ],
    })
    if (faqs.length) {
      injectJsonLD('ld-faq', {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } })),
      })
    }
    return () => { removeJsonLD('ld-breadcrumb'); removeJsonLD('ld-faq') }
  }, [catKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const isComingSoon = !visibleExams.length
  const groupExams   = visibleExams.filter(e => e.group === selGroup)

  const P = { fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }

  const SIDEBAR_ITEMS = [
    { label:'IBPS',        category:'banking',     group:'IBPS',       icon:<EIcBank s={16}/> },
    { label:'SBI',         category:'banking',     group:'SBI',        icon:<EIcBank s={16}/> },
    { label:'RRB',         category:'banking',     group:'RRB',        icon:<EIcBank s={16}/> },
    { label:'RBI',         category:'banking',     group:'RBI',        icon:<EIcBank s={16}/> },
    { label:'NABARD',      category:'banking',     group:'NABARD',     icon:<EIcBank s={16}/> },
    { label:'LIC',         category:'insurance',   group:'LIC',        icon:<EIcShield s={16}/> },
    { label:'Insurance',   category:'insurance',   group:'Insurance',  icon:<EIcShield s={16}/> },
    { label:'India Post',  category:'insurance',   group:'India Post', icon:<EIcShield s={16}/> },
    { label:'SSC',         category:'ssc',         group:null,         icon:<EIcClip s={16}/> },
    { label:'Railway',     category:'railway',     group:null,         icon:<EIcTrain s={16}/> },
    { label:'Engineering', category:'engineering', group:null,         icon:<EIcGear s={16}/>,    soon:true },
    { label:'Medical',     category:'medical',     group:null,         icon:<EIcMedical s={16}/>, soon:true },
  ]

  return (
    <>
    <div style={{ ...P, background:'#f8fafc', display:'flex', flexDirection:'column' }}>
      <style>{CARD_IN_CSS}</style>

      {/* ── Compact top header ── */}
      <header style={{ background:'#0f172a', position:'sticky', top:0, zIndex:200, flexShrink:0 }}>
        <div style={{ padding:'0 20px', display:'flex', alignItems:'center', height:52, gap:10 }}>

          {/* Hamburger (mobile only) */}
          <button className="exams-menu-btn" onClick={() => setDrawerOpen(true)} style={{
            background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.8)',
            padding:'6px', borderRadius:6, flexShrink:0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Logo */}
          <button onClick={() => onNav?.('home')} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:7, background:'#F06535', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#fff', fontSize:12, fontWeight:900, letterSpacing:'-0.5px' }}>MT</span>
            </div>
            <div className="exams-logo-text" style={{ textAlign:'left' }}>
              <div style={{ color:'#fff', fontSize:13.5, fontWeight:800, lineHeight:1.1, letterSpacing:'-0.2px' }}>MockTest</div>
              <div style={{ color:'rgba(255,255,255,.4)', fontSize:8, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase' }}>Your World of Mock Tests</div>
            </div>
          </button>

          <div style={{ flex:1 }} />

          {/* Auth actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {user ? (
              <button onClick={onLogout} style={{ background:'none', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.75)', borderRadius:7, padding:'6px 13px', fontSize:12.5, fontWeight:500, cursor:'pointer' }}
                onMouseOver={e => e.currentTarget.style.borderColor='rgba(255,255,255,.5)'}
                onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,.2)'}>
                Logout
              </button>
            ) : (
              <button className="exams-auth-login" onClick={() => onNav?.('auth')} style={{ background:'none', border:'none', color:'rgba(255,255,255,.75)', fontSize:12.5, fontWeight:500, cursor:'pointer', padding:'6px 9px' }}
                onMouseOver={e => e.currentTarget.style.color='#fff'}
                onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,.75)'}>
                Login
              </button>
            )}
            <button onClick={() => onNav?.('auth')} style={{ background:'#F06535', color:'#fff', border:'none', borderRadius:7, padding:'7px 15px', fontSize:12.5, fontWeight:700, cursor:'pointer', transition:'background .15s', whiteSpace:'nowrap' }}
              onMouseOver={e => e.currentTarget.style.background='#e5512f'}
              onMouseOut={e => e.currentTarget.style.background='#F06535'}>
              Start Free →
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="exams-body">

        {/* Mobile overlay */}
        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:250,
          }} />
        )}

        {/* ── Left Sidebar ── */}
        {(() => {
          const sbExpanded = !sidebarCollapsed || drawerOpen
          return (
        <aside className={`exams-sidebar${sidebarCollapsed ? ' sb-collapsed' : ''}${drawerOpen ? ' sb-open' : ''}`}>

          {/* Sidebar header label */}
          <div style={{ padding: sbExpanded ? '14px 16px 10px' : '14px 0 10px', borderBottom:'1px solid rgba(255,255,255,.07)', flexShrink:0 }}>
            {sbExpanded && (
              <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,.28)', textTransform:'uppercase', letterSpacing:'.12em' }}>
                Browse Exams
              </div>
            )}
          </div>

          {/* Flat exam group nav */}
          <nav style={{ flex:1, paddingBottom:8, overflowY:'auto', overflowX:'hidden', scrollbarWidth:'none' }}>
            {SIDEBAR_ITEMS.map(({ label, category, group, icon, soon }) => {
              const isActive = group
                ? catKey === category && selGroup === group
                : catKey === category
              return (
                <button key={label}
                  onClick={() => {
                    if (soon) return
                    setDrawerOpen(false)
                    if (group) {
                      if (catKey === category) { setSelGroup(group) }
                      else { _pendingGroup = group; onNav?.('exams-' + category) }
                    } else {
                      onNav?.('exams-' + category)
                    }
                  }}
                  title={!sbExpanded ? label : undefined}
                  style={{
                    display:'flex', alignItems:'center',
                    gap: sbExpanded ? 10 : 0,
                    width:'100%',
                    padding: sbExpanded ? '9px 16px' : '11px 0',
                    justifyContent: sbExpanded ? 'flex-start' : 'center',
                    border:'none',
                    background: isActive ? 'rgba(232,90,44,.13)' : 'transparent',
                    cursor: soon ? 'default' : 'pointer',
                    color: isActive ? '#F06535' : soon ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.68)',
                    transition:'background .12s, color .12s',
                  }}
                  onMouseOver={e => { if (!isActive && !soon) { e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.color='#fff' } }}
                  onMouseOut={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color = soon ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.68)' } }}>
                  <span style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', width:20 }}>{icon}</span>
                  {sbExpanded && (
                    <>
                      <span style={{ flex:1, fontSize:13, fontWeight: isActive ? 700 : 500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textAlign:'left' }}>{label}</span>
                      {soon
                        ? <span style={{ fontSize:8.5, fontWeight:700, background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.38)', borderRadius:99, padding:'1px 5px', letterSpacing:'.04em', flexShrink:0 }}>SOON</span>
                        : <span style={{ color: isActive ? 'rgba(232,90,44,.5)' : 'rgba(255,255,255,.18)', fontSize:10, flexShrink:0 }}>▾</span>
                      }
                    </>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Collapse toggle (desktop only) */}
          <button className="sb-collapse-btn" onClick={toggleSidebar}
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              width:'100%', padding:'11px 16px', border:'none', background:'transparent',
              cursor:'pointer', color:'rgba(255,255,255,.28)', fontSize:11.5,
              borderTop:'1px solid rgba(255,255,255,.07)', transition:'color .12s',
            }}
            onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,.65)'}
            onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,.28)'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {sbExpanded ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
            </svg>
            {sbExpanded && <span>Collapse</span>}
          </button>
        </aside>
          )
        })()}

        {/* ── Main content area ── */}
        <main className="exam-main">
          {isComingSoon ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', textAlign:'center', minHeight:'60vh' }}>
              <div style={{ width:68, height:68, borderRadius:18, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                {catKey === 'medical' ? <EIcMedical s={34} c='#94a3b8'/> : <EIcGear s={34} c='#94a3b8'/>}
              </div>
              <h1 style={{ fontSize:24, fontWeight:900, color:'#0f172a', marginBottom:8 }}>{meta.title} — Coming Soon</h1>
              <p style={{ fontSize:14.5, color:'#64748b', maxWidth:420, lineHeight:1.6, marginBottom:26 }}>{meta.subtitle}</p>
              <button onClick={() => onNav?.('auth')} style={{ background:'#F06535', color:'#fff', border:'none', borderRadius:10, padding:'12px 26px', fontSize:14.5, fontWeight:700, cursor:'pointer' }}
                onMouseOver={e=>e.currentTarget.style.background='#e5512f'} onMouseOut={e=>e.currentTarget.style.background='#F06535'}>
                Notify Me When Live →
              </button>
              {faqs.length > 0 && (
                <div style={{ marginTop:48, width:'100%', maxWidth:600, textAlign:'left' }}>
                  <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', marginBottom:12 }}>Frequently Asked Questions</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {faqs.map((f,i) => (
                      <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'13px 16px' }}>
                        <h3 style={{ fontSize:13.5, fontWeight:700, color:'#0f172a', marginBottom:4 }}>{f.q}</h3>
                        <p style={{ fontSize:12.5, color:'#64748b', lineHeight:1.65, margin:0 }}>{f.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="exam-page-content">

              {/* Page header */}
              <div style={{ marginBottom:18 }}>
                <h1 style={{ fontSize:21, fontWeight:900, color:'#0f172a', letterSpacing:'-0.4px', margin:'0 0 3px' }}>{meta.title}</h1>
                <p style={{ fontSize:13, color:'#64748b', margin:0 }}>{meta.subtitle}</p>
              </div>

              <div className="exam-content-layout">

                {/* ── Left: exam cards + FAQ ── */}
                <div className="exam-content-main">

                  {/* Exam cards grid */}
                  <div key={selGroup} className="exam-grid" style={{ marginBottom:32 }}>
                    {groupExams.map((e, i) => (
                      <ExamCard key={e.id} exam={e} onNav={onNav} index={i} />
                    ))}
                  </div>

                  {/* FAQ */}
                  {faqs.length > 0 && (
                    <div>
                      <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', marginBottom:12 }}>Frequently Asked Questions</h2>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {faqs.map((f,i) => (
                          <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'13px 16px' }}>
                            <h3 style={{ fontSize:13.5, fontWeight:700, color:'#0f172a', marginBottom:4 }}>{f.q}</h3>
                            <p style={{ fontSize:12.5, color:'#64748b', lineHeight:1.65, margin:0 }}>{f.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right: Quick Links + Exam Updates ── */}
                <div className="exam-right-panel">

                  {/* Quick Links */}
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>
                    <div style={{ padding:'13px 16px 11px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:7 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F06535" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      <span style={{ fontSize:12.5, fontWeight:700, color:'#0f172a' }}>Quick Links</span>
                    </div>
                    <div>
                      {QUICK_LINKS.map((item, idx) => (
                        <button key={item.label} onClick={() => onNav?.(item.nav)}
                          style={{
                            display:'flex', alignItems:'center', gap:10, width:'100%',
                            padding:'10px 16px', border:'none', background:'#fff', cursor:'pointer',
                            textAlign:'left', transition:'background .12s',
                            borderBottom: idx < QUICK_LINKS.length - 1 ? '1px solid #f8fafc' : 'none',
                          }}
                          onMouseOver={e => e.currentTarget.style.background='#f8fafc'}
                          onMouseOut={e => e.currentTarget.style.background='#fff'}>
                          <div style={{ width:32, height:32, borderRadius:8, background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {item.icon}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</div>
                            <div style={{ fontSize:10.5, color:'#94a3b8', marginTop:1 }}>{item.sub}</div>
                          </div>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam Updates */}
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>
                    <div style={{ padding:'13px 16px 11px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F06535" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        <span style={{ fontSize:12.5, fontWeight:700, color:'#0f172a' }}>Exam Updates</span>
                      </div>
                      <button onClick={() => onNav?.('exam-dates')} style={{ fontSize:11, color:'#F06535', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>View All →</button>
                    </div>
                    <div style={{ padding:'4px 0' }}>
                      {(EXAM_UPDATES[catKey] || EXAM_UPDATES.banking).map((item, i) => (
                        <div key={i} style={{
                          padding:'9px 16px',
                          borderBottom: i < (EXAM_UPDATES[catKey] || EXAM_UPDATES.banking).length - 1 ? '1px solid #f8fafc' : 'none',
                          display:'flex', gap:10, alignItems:'flex-start',
                        }}>
                          <span style={{ width:7, height:7, borderRadius:'50%', background:item.dot, flexShrink:0, marginTop:5, display:'inline-block' }} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11.5, fontWeight:500, color:'#334155', lineHeight:1.4 }}>{item.label}</div>
                            <div style={{ fontSize:10.5, color:'#94a3b8', marginTop:2 }}>{item.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    <Footer onNav={onNav} />
    </>
  )
}
