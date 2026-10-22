import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { supabase } from '../supabase.js'
import { startCheckout } from '../payments.js'
import { toast } from '../toast.js'
import { getExamBlueprint } from '../api.js'
import { EXAMS as CUTOFF_EXAMS } from './CutoffsPage.jsx'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

/* ─────────────────────────────────────────────
   SVG ICON HELPERS
───────────────────────────────────────────── */
const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const DIcDoc     = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const DIcRepeat  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
const DIcBook    = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const DIcCal     = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const DIcTrophy  = ({s=18,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const DIcGear    = ({s=14,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const DIcGrad    = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const DIcChart   = ({s=36,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const DIcReceipt = ({s=28,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2l-3 2-2-2-2 2-2-2-2 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
const DIcLock    = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const DIcBolt    = ({s=16,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const DIcParty   = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M5.8 11.3L2 22l10.7-3.79"/><path d="M14 20l-1-1M9 7L7.5 5.5M22 8h.01M15 2h.01M4 3h.01"/><path d="M22 13l-1.5-1.5M2 11l1.5 1.5M12 6l2 2"/></svg>
const DIcEdit    = ({s=13,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

/* ─────────────────────────────────────────────
   CONSTANTS  (merged from both files)
───────────────────────────────────────────── */
// Admin status is passed as a prop from App.jsx (resolved via user_roles DB table)

export const EXAM_GROUPS = [
  {
    id: 'ibps', label: 'IBPS Exams',
    color: 'from-orange-500 to-orange-600', hex: '#FF653F',
    exams: [
      { id: 'bank_clerk_prelims', name: 'Clerk Prelims', sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'bank_clerk_mains',   name: 'Clerk Mains',   sub: '175Q · 160 min', tag: null },
      { id: 'bank_po_prelims',    name: 'PO Prelims',    sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'bank_po_mains',      name: 'PO Mains',      sub: '175Q · 180 min', tag: null },
    ],
  },
  {
    id: 'sbi', label: 'SBI Exams',
    color: 'from-gray-800 to-gray-900', hex: '#111',
    exams: [
      { id: 'sbi_clerk_prelims', name: 'Clerk Prelims', sub: '100Q · 60 min',  tag: null },
      { id: 'sbi_clerk_mains',   name: 'Clerk Mains',   sub: '170Q · 160 min', tag: null },
      { id: 'sbi_po_prelims',    name: 'PO Prelims',    sub: '100Q · 60 min',  tag: null },
      { id: 'sbi_po_mains',      name: 'PO Mains',      sub: '175Q · 180 min', tag: null },
    ],
  },
  {
    id: 'rbi', label: 'RBI Exams',
    color: 'from-rose-500 to-rose-600', hex: '#e11d48',
    exams: [
      { id: 'rbi_assistant_pre',   name: 'Assistant Prelims', sub: '100Q · 60 min',  tag: 'New', tagColor: 'bg-rose-100 text-rose-700' },
      { id: 'rbi_assistant_mains', name: 'Assistant Mains',   sub: '200Q · 135 min', tag: null },
      { id: 'rbi_gradeb_p1',       name: 'Grade B (Phase 1)', sub: '200Q · 120 min', tag: null },
    ],
  },
  {
    id: 'nabard', label: 'NABARD Exams',
    color: 'from-green-600 to-green-700', hex: '#16a34a',
    exams: [
      { id: 'nabard_gradeA_pre', name: 'Grade A Prelims',          sub: '200Q · 120 min', tag: null },
      { id: 'nabard_da_pre',     name: 'Development Assistant',     sub: '100Q · 60 min',  tag: null },
    ],
  },
  {
    id: 'lic', label: 'LIC Exams',
    color: 'from-blue-600 to-blue-700', hex: '#2563eb',
    exams: [
      { id: 'lic_aao_pre',       name: 'AAO Prelims',       sub: '100Q · 60 min',  tag: null },
      { id: 'lic_aao_mains',     name: 'AAO Mains',         sub: '120Q · 120 min', tag: 'New', tagColor: 'bg-blue-100 text-blue-700' },
      { id: 'lic_assistant_pre', name: 'Assistant Prelims', sub: '100Q · 60 min',  tag: null },
      { id: 'lic_ado_pre',       name: 'ADO Prelims',       sub: '100Q · 60 min',  tag: null },
      { id: 'lic_ado_mains',     name: 'ADO Mains',         sub: '120Q · 120 min', tag: 'New', tagColor: 'bg-blue-100 text-blue-700' },
    ],
  },
  {
    id: 'insurance', label: 'Insurance Exams',
    color: 'from-cyan-600 to-cyan-700', hex: '#0891b2',
    exams: [
      { id: 'niacl_ao_pre',       name: 'NIACL AO Prelims',       sub: '100Q · 60 min', tag: null },
      { id: 'niacl_assistant_pre', name: 'NIACL Assistant Prelims', sub: '100Q · 60 min', tag: null },
      { id: 'nicl_ao_pre',         name: 'NICL AO Prelims',         sub: '100Q · 60 min', tag: null },
      { id: 'uiic_ao_pre',         name: 'UIIC AO Prelims',         sub: '100Q · 60 min', tag: null },
      { id: 'oicl_ao_pre',         name: 'OICL AO Prelims',         sub: '100Q · 60 min', tag: null },
    ],
  },
  {
    id: 'indiapost', label: 'India Post Exams',
    color: 'from-amber-600 to-amber-700', hex: '#d97706',
    exams: [
      { id: 'ippb_officer', name: 'IPPB Officer Scale I', sub: '100Q · 60 min', tag: null },
    ],
  },
  {
    id: 'psu', label: 'PSU Exams',
    color: 'from-emerald-600 to-emerald-700', hex: '#059669',
    exams: [
      { id: 'coal_india_mt', name: 'Coal India MT', sub: '100Q · 120 min', tag: 'New', tagColor: 'bg-emerald-100 text-emerald-700' },
    ],
  },
  {
    id: 'eamcet', label: 'EAMCET Exams',
    color: 'from-violet-600 to-violet-700', hex: '#7c3aed',
    exams: [
      { id: 'ap_eamcet_engg', name: 'AP EAMCET Engineering', sub: '160Q · 180 min', tag: 'New', tagColor: 'bg-violet-100 text-violet-700' },
      { id: 'ts_eamcet_engg', name: 'TS EAMCET Engineering', sub: '160Q · 180 min', tag: 'New', tagColor: 'bg-violet-100 text-violet-700' },
    ],
  },
  {
    id: 'ssc', label: 'SSC Exams',
    color: 'from-orange-600 to-red-600', hex: '#ea580c',
    exams: [
      { id: 'ssc_cgl_tier1',  name: 'CGL Tier 1',  sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-orange-100 text-orange-700' },
      { id: 'ssc_chsl_tier1', name: 'CHSL Tier 1', sub: '100Q · 60 min',  tag: null },
      { id: 'ssc_mts_paper1', name: 'MTS Paper 1', sub: '90Q · 90 min',   tag: null },
      { id: 'ssc_cpo_tier1',  name: 'CPO Tier 1',  sub: '200Q · 120 min', tag: null },
    ],
  },
  {
    id: 'rrb', label: 'RRB Exams',
    color: 'from-sky-600 to-blue-700', hex: '#0284c7',
    exams: [
      { id: 'rrb_ntpc_cbt1', name: 'NTPC CBT 1',  sub: '100Q · 90 min',  tag: 'Popular', tagColor: 'bg-sky-100 text-sky-700' },
      { id: 'rrb_ntpc_cbt2', name: 'NTPC CBT 2',  sub: '120Q · 90 min',  tag: null },
      { id: 'rrb_group_d',   name: 'Group D',      sub: '100Q · 90 min',  tag: null },
      { id: 'rrb_alp_cbt1',  name: 'ALP CBT 1',   sub: '75Q · 60 min',   tag: null },
    ],
  },
]

export const SAT_EXAM_GROUPS = [
  {
    id: 'sat', label: 'SAT Exams',
    color: 'from-blue-600 to-blue-700', hex: '#2563eb',
    exams: [
      { id: 'sat_full',             name: 'SAT Full Test',           sub: '98Q · 134 min',  tag: 'Popular', tagColor: 'bg-blue-100 text-blue-700' },
      { id: 'sat_math',             name: 'SAT Math',                sub: '44Q · 70 min',   tag: null },
      { id: 'sat_reading_writing',  name: 'SAT Reading & Writing',   sub: '54Q · 64 min',   tag: null },
    ],
  },
  {
    id: 'act', label: 'ACT Exams',
    color: 'from-red-500 to-red-600', hex: '#ef4444',
    exams: [
      { id: 'act_full',     name: 'ACT Full Test',  sub: '215Q · 175 min', tag: 'Popular', tagColor: 'bg-red-100 text-red-700' },
      { id: 'act_english',  name: 'ACT English',    sub: '75Q · 45 min',   tag: null },
      { id: 'act_math',     name: 'ACT Math',       sub: '60Q · 60 min',   tag: null },
      { id: 'act_reading',  name: 'ACT Reading',    sub: '40Q · 35 min',   tag: null },
      { id: 'act_science',  name: 'ACT Science',    sub: '40Q · 35 min',   tag: null },
    ],
  },
  {
    id: 'psat', label: 'PSAT / NMSQT',
    color: 'from-violet-500 to-violet-600', hex: '#8b5cf6',
    exams: [
      { id: 'psat_full',            name: 'PSAT Full Test',          sub: '98Q · 134 min', tag: 'Popular', tagColor: 'bg-violet-100 text-violet-700' },
      { id: 'psat_math',            name: 'PSAT Math',               sub: '44Q · 70 min',  tag: null },
      { id: 'psat_reading_writing', name: 'PSAT Reading & Writing',  sub: '54Q · 64 min',  tag: null },
    ],
  },
  {
    id: 'ap_math_science', label: 'AP Math & Science',
    color: 'from-emerald-600 to-emerald-700', hex: '#059669',
    exams: [
      { id: 'ap_calc_ab',      name: 'AP Calculus AB',         sub: '45Q · 105 min', tag: 'Popular', tagColor: 'bg-emerald-100 text-emerald-700' },
      { id: 'ap_calc_bc',      name: 'AP Calculus BC',         sub: '45Q · 105 min', tag: null },
      { id: 'ap_statistics',   name: 'AP Statistics',          sub: '40Q · 90 min',  tag: null },
      { id: 'ap_physics1',     name: 'AP Physics 1',           sub: '50Q · 90 min',  tag: null },
      { id: 'ap_chemistry',    name: 'AP Chemistry',           sub: '60Q · 90 min',  tag: null },
      { id: 'ap_biology',      name: 'AP Biology',             sub: '60Q · 90 min',  tag: null },
      { id: 'ap_env_science',  name: 'AP Environmental Sci.',  sub: '80Q · 90 min',  tag: null },
      { id: 'ap_comp_sci_a',   name: 'AP Computer Science A',  sub: '40Q · 90 min',  tag: null },
    ],
  },
  {
    id: 'ap_humanities', label: 'AP Humanities & Social Studies',
    color: 'from-amber-500 to-amber-600', hex: '#f59e0b',
    exams: [
      { id: 'ap_us_history',   name: 'AP U.S. History',        sub: '55Q · 55 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'ap_world_history',name: 'AP World History',       sub: '55Q · 55 min',  tag: null },
      { id: 'ap_gov_politics', name: 'AP Gov. & Politics',     sub: '55Q · 80 min',  tag: null },
      { id: 'ap_english_lang', name: 'AP English Language',    sub: '45Q · 60 min',  tag: null },
      { id: 'ap_english_lit',  name: 'AP English Literature',  sub: '55Q · 60 min',  tag: null },
      { id: 'ap_psychology',   name: 'AP Psychology',          sub: '100Q · 70 min', tag: null },
      { id: 'ap_macro_econ',   name: 'AP Macroeconomics',      sub: '60Q · 70 min',  tag: null },
      { id: 'ap_micro_econ',   name: 'AP Microeconomics',      sub: '60Q · 70 min',  tag: null },
    ],
  },
]

const CATEGORIES = [
  { value:'UR',   label:'General / UR' },
  { value:'OBC',  label:'OBC' },
  { value:'EWS',  label:'EWS' },
  { value:'SC',   label:'SC' },
  { value:'ST',   label:'ST' },
  { value:'PwBD', label:'PwBD' },
]
const LEVELS = [
  { value:'beginner',     label:'Beginner' },
  { value:'intermediate', label:'Intermediate' },
  { value:'advanced',     label:'Advanced' },
]

const SvgDoc   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M12 2v4h4M6 10h8M6 13h5"/></svg>
const SvgTarget = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>
const SvgTimer  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="11" r="7"/><path d="M10 7v4l2.5 2.5"/><path d="M7.5 2h5M10 2v2"/></svg>
const SvgHome   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M8 19V12h4v7"/></svg>
const SvgCal    = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="16" height="14" rx="2"/><path d="M2 8h16M6 2v4M14 2v4"/></svg>
const SvgChart  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgClip   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-3M8 3a1 1 0 011-1h2a1 1 0 011 1M8 3h4"/></svg>
const SvgUser   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="6" r="4"/><path d="M2 18c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const SvgCard   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 9h16"/></svg>
const SvgGear   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg>
const SvgFlame  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 18s-7-4-7-9a7 7 0 0114 0c0 5-7 9-7 9z"/><path d="M10 14s-3-2-3-4a3 3 0 016 0c0 2-3 4-3 4z" fill="currentColor" stroke="none"/></svg>

const MODES = [
  { id:'mock',    label:'Full Mock Test',  desc:'Complete paper · all sections · timed · negative marking · download PDF result', Icon:SvgDoc,    bg:'bg-blue-600',    light:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200'    },
  { id:'topic',   label:'Topic Practice',  desc:'Choose any topic · no timer · build concept depth · instant feedback per question', Icon:SvgTarget, bg:'bg-violet-600',  light:'bg-violet-50',  text:'text-violet-700',  border:'border-violet-200'  },
  { id:'section', label:'Section Test',    desc:'One section at a time · focused timer · great for targeted exam-day revision',  Icon:SvgTimer,  bg:'bg-emerald-600', light:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200' },
]

const SAT_MODES = [
  { id:'mock',    label:'Full SAT Practice', desc:'98 questions · Reading, Writing & Math · 134 min · adaptive scoring 400–1600', Icon:SvgDoc,    bg:'bg-blue-600',    light:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200'    },
  { id:'topic',   label:'Topic Practice',    desc:'Drill any SAT topic at your own pace · no timer · instant feedback per question',   Icon:SvgTarget, bg:'bg-violet-600',  light:'bg-violet-50',  text:'text-violet-700',  border:'border-violet-200'  },
  { id:'section', label:'Section Test',      desc:'Reading & Writing or Math only · focused timer · great for targeted revision',     Icon:SvgTimer,  bg:'bg-emerald-600', light:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200' },
]

const SIDEBAR_NAV = [
  { id:'home',          Icon:SvgHome,  label:'Dashboard'     },
  { id:'explore',       Icon:SvgDoc,   label:'Explore Exams' },
  { id:'studyplan',     Icon:SvgCal,   label:'Study Planner' },
  { id:'results',       Icon:SvgChart, label:'My Results'    },
  { id:'weakareas',     Icon:SvgFlame, label:'Weak Areas'    },
  { id:'subscriptions', Icon:SvgClip,  label:'Subscriptions' },
  { id:'profile',       Icon:SvgUser,  label:'Profile'       },
  { id:'billing',       Icon:SvgCard,  label:'Billing'       },
  { id:'settings',      Icon:SvgGear,  label:'Settings'      },
]

const TOPIC_GROUPS = [
  { section:'Quantitative Aptitude', color:'#1d4ed8', topics:['Simplification','Number Series','Quadratic Equations','Data Interpretation','Percentage','Profit & Loss','Time & Work','Time & Distance','Mensuration'] },
  { section:'Reasoning Ability',     color:'#7c3aed', topics:['Puzzles & Seating','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Floor Puzzles','Input-Output'] },
  { section:'English Language',      color:'#0891b2', topics:['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement'] },
  { section:'General Awareness',     color:'#d97706', topics:['Current Affairs','Banking Awareness','RBI & Monetary Policy','Financial Terms','Government Schemes','Static GK'] },
  { section:'Insurance Awareness',   color:'#0e7490', topics:['IRDAI & Regulations','LIC Products','Insurance Principles','Government Schemes (PMJJBY/PMSBY/PMFBY)','Health Insurance & PM-JAY','Reinsurance','Bancassurance','ULIP & Investment Plans','Insurance Terminology','Solvency & Capital Norms'] },
]

const SAT_TOPIC_GROUPS = [
  { section:'Algebra & Functions',          color:'#1d4ed8', topics:['Linear Equations','Systems of Equations','Linear Inequalities','Quadratic Equations','Polynomials','Rational & Radical Expressions','Nonlinear Functions','Exponential Growth'] },
  { section:'Advanced Math',                color:'#7c3aed', topics:['Coordinate Geometry','Plane Geometry','Trigonometry','Circles','Area & Volume','Right Triangle Trig','3D Geometry'] },
  { section:'Statistics & Data Analysis',   color:'#059669', topics:['Ratios & Proportions','Percentages','Unit Conversions','Probability','Descriptive Statistics','Data Interpretation','Two-Variable Data'] },
  { section:'Reading Comprehension',        color:'#0891b2', topics:['Central Ideas & Details','Command of Evidence','Inference','Literary Narrative','Social Studies Passages','Humanities Passages','Natural Science Passages','Cross-Text Connections'] },
  { section:'Writing & Language',           color:'#db2777', topics:['Words in Context','Rhetorical Purpose','Text Structure','Transitions','Style & Tone','Organization','Strategy'] },
  { section:'English Conventions',          color:'#e11d48', topics:['Grammar & Usage','Punctuation','Sentence Structure','Subject-Verb Agreement','Pronoun Usage','Modifier Placement','Parallel Structure'] },
  { section:'ACT Science',                  color:'#0e7490', topics:['Data Representation','Research Summaries','Conflicting Viewpoints','Scientific Reasoning','Experimental Design'] },
  { section:'AP Calculus & Statistics',     color:'#059669', topics:['Limits & Continuity','Derivatives','Integrals','Differential Equations','Series & Sequences','Sampling Methods','Probability Distributions','Hypothesis Testing','Statistical Inference'] },
  { section:'AP Sciences',                  color:'#16a34a', topics:['Forces & Motion','Energy & Waves','Chemical Reactions','Stoichiometry','Cell Biology','Genetics & Evolution','Ecosystems','Environmental Systems'] },
  { section:'AP History & Social Studies',  color:'#f59e0b', topics:['Argumentation & Evidence','Causation & Effect','Continuity & Change','Comparison','Contextualization','Primary Source Analysis','Economic Systems','Political Systems'] },
  { section:'AP English & Economics',       color:'#d97706', topics:['Rhetorical Analysis','Argumentation','Close Reading','Literary Devices','Supply & Demand','Market Structures','Fiscal Policy','Monetary Policy'] },
]

const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const WEEK_DISPLAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']  // grid display order

/* Indicative latest-year cut-offs (marks) by exam group + category — for the
   personalised "your score vs cut-off" card. Mirrors the public Cut-offs page. */
const CUTOFF_BY_GROUP = {
  ibps:      { UR:76.5, OBC:75.0, EWS:74.5, SC:68.0, ST:56.0, PwBD:48.0 },
  sbi:       { UR:80.5, OBC:79.0, EWS:78.0, SC:72.0, ST:60.0, PwBD:52.0 },
  rrb:       { UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 },
  rbi:       { UR:84.0, OBC:82.0, EWS:81.0, SC:75.0, ST:64.0, PwBD:55.0 },
  nabard:    { UR:70.0, OBC:67.0, EWS:66.0, SC:58.0, ST:50.0, PwBD:44.0 },
  lic:       { UR:72.0, OBC:70.0, EWS:69.0, SC:62.0, ST:54.0, PwBD:46.0 },
  insurance: { UR:78.0, OBC:76.0, EWS:75.0, SC:68.0, ST:58.0, PwBD:50.0 },
  indiapost: { UR:62.0, OBC:60.0, EWS:59.0, SC:52.0, ST:45.0, PwBD:38.0 },
  psu:       { UR:55.0, OBC:52.0, EWS:51.0, SC:45.0, ST:40.0, PwBD:35.0 },
}

/* Dashboard exam id → public Cut-offs page exam id (for the Cut-off Marks tab) */
const CUTOFF_ID_MAP = {
  bank_clerk_prelims:'ibps_clerk_pre', bank_clerk_mains:'ibps_clerk_mains',
  bank_po_prelims:'ibps_po_pre',       bank_po_mains:'ibps_po_mains',
  sbi_clerk_prelims:'sbi_clerk_pre',   sbi_po_prelims:'sbi_po_pre',
  // LIC
  lic_aao_pre:'lic_aao_pre',           lic_aao_mains:'lic_aao_mains',
  lic_assistant_pre:'lic_assistant_pre',
  lic_ado_pre:'lic_ado_pre',           lic_ado_mains:'lic_ado_mains',
  // General Insurance
  niacl_ao_pre:'niacl_ao_pre',         niacl_assistant_pre:'niacl_assistant_pre',
  nicl_ao_pre:'nicl_ao_pre',
  uiic_ao_pre:'uiic_ao_pre',
  oicl_ao_pre:'oicl_ao_pre',
  // NABARD
  nabard_gradeA_pre:'nabard_gradeA_pre', nabard_da_pre:'nabard_da_pre',
  // India Post / PSU
  ippb_officer:'ippb_officer',
  coal_india_mt:'coal_india_mt',
}

/* Subscription tiers with validity — shown in Explore Exams + Subscriptions */
const PLAN_TIERS = [
  { id:'basic',    name:'Basic',    price:'₹199',  validity:'1 month',  features:['5 mock tests / month','Topic practice','Basic analytics'] },
  { id:'pro',      name:'Pro',      price:'₹499',  validity:'1 month',  popular:true, features:['Unlimited mock tests','PDF solutions','personalised study plan','Priority support'] },
  { id:'ultimate', name:'Ultimate', price:'₹1199', validity:'3 months', features:['Everything in Pro','All exam categories','Performance trends','WhatsApp reminders'] },
]

/* section label → key, to store weak topics grouped by section */
const SECTION_KEY = {
  'Quantitative Aptitude': 'arithmetic',
  'Reasoning Ability':     'reasoning',
  'English Language':      'english',
  'General Awareness':     'general_awareness',
}
function groupWeakTopics(weakTopics, topicGroups = TOPIC_GROUPS) {
  const grouped = {}
  topicGroups.forEach(g => {
    const picked = g.topics.filter(t => weakTopics.includes(t))
    if (picked.length) grouped[SECTION_KEY[g.section] || g.section] = picked
  })
  return grouped
}

/* ─────────────────────────────────────────────
   PLAN GENERATOR  (pure JS, no API needed)
───────────────────────────────────────────── */
function generatePlan({ startDate, endDate, studyDays, hoursPerDay, dayHours = {}, weakTopics, topicGroups = TOPIC_GROUPS, blockedDates = [], catchupEvery = 0 }) {
  const start = new Date(startDate)
  const end   = new Date(endDate)
  const total = Math.round((end - start) / (1000 * 60 * 60 * 24))
  if (total < 1) return null

  const allTopics = topicGroups.flatMap(g => g.topics)
  const priority  = allTopics.filter(t => weakTopics.includes(t))
  const rest      = allTopics.filter(t => !weakTopics.includes(t))
  const ordered   = [...priority, ...rest]

  const days = []
  let topicIdx    = 0
  let studyCount  = 0  // counts only non-catchup days for mock/revision cadence

  for (let i = 0; i <= total; i++) {
    const d   = new Date(start); d.setDate(start.getDate() + i)
    const dow = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
    if (!studyDays.includes(dow)) continue
    const dateStr = d.toISOString().split('T')[0]
    if (blockedDates.includes(dateStr)) continue

    const dayNum   = days.length + 1
    const dh       = dayHours[dow] || hoursPerDay

    // Insert catch-up day every N scheduled days (except day 1)
    const isCatchup = catchupEvery > 0 && dayNum > 1 && (dayNum - 1) % catchupEvery === 0

    let type, topics, duration
    if (isCatchup) {
      type = 'catchup'; topics = ['Catch-up / Buffer']; duration = `${dh}h`
    } else {
      studyCount++
      const isRevise = studyCount % 14 === 0
      const isMock   = !isRevise && studyCount % 7 === 0
      if (isRevise)    { type='revision'; topics=['Full Revision'];  duration=`${dh}h` }
      else if (isMock) { type='mock';     topics=['Full Mock Test']; duration='2–3h'   }
      else {
        type = 'study'
        topics = ordered.slice(topicIdx, topicIdx + 2).filter(Boolean)
        if (!topics.length) topics = ['Revision / Practice']
        topicIdx = (topicIdx + 2) % ordered.length
        duration = `${dh}h`
      }
    }
    days.push({
      day: dayNum,
      date: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}),
      isoDate: dateStr,
      dow, type, topics, duration,
    })
  }
  return {
    totalCalendarDays: total,
    scheduledDays:     days.length,
    studyDays:         days.filter(d=>d.type==='study').length,
    mockDays:          days.filter(d=>d.type==='mock').length,
    revisionDays:      days.filter(d=>d.type==='revision').length,
    catchupDays:       days.filter(d=>d.type==='catchup').length,
    days,
  }
}

/* ─────────────────────────────────────────────
   DASHBOARD  (merged — keeps all existing
   functionality, adds UWorld sidebar tabs)

   Props (unchanged from existing):
     user          Supabase user object
     onStartTest   (mode, examId?) → launches test
     onLogout      signs out
     onNav         routes to other pages
   New prop:
     planData      wizard output (optional)
───────────────────────────────────────────── */
/* ── ActionButton — avoids IIFE in JSX ── */
function ActionButton({ dayType, topics, getAction }) {
  const act = getAction(dayType, topics)
  return (
    <button
      onClick={act.onClick}
      className={`text-xs font-bold px-4 py-1.5 rounded-full flex-shrink-0 transition-all ${act.cls} whitespace-nowrap`}>
      {act.label}
    </button>
  )
}

/* ── TodayPlanCard — shows today or next pending day on Home tab ── */
function TodayPlanCard({ savedPlan, onViewPlan }) {
  if (!savedPlan) return null
  const days = savedPlan?.days || []
  const todayFormatted = new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})
  const todayPlan  = days.find(d => d.date === todayFormatted)
  const nextPlan   = days.find(d => d.type)   // first available day
  const display    = todayPlan || nextPlan
  if (!display) return null
  const icon = display.type==='mock' ? <DIcDoc s={22} c='#fff'/> : display.type==='revision' ? <DIcRepeat s={22} c='#fff'/> : <DIcBook s={22} c='#fff'/>
  const label = todayPlan ? "TODAY'S PLAN — Day "+display.day : "NEXT UP — Day "+display.day
  return (
    <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4" style={{background:'#FF653F'}}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(255,255,255,.2)'}}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{color:'rgba(255,255,255,.75)'}}>{label}</div>
          <div className="text-sm font-black text-white">{display.topics.join(', ')}</div>
          <div className="text-xs mt-0.5" style={{color:'rgba(255,255,255,.75)'}}>{display.duration} · {display.date}</div>
        </div>
      </div>
      <button
        onClick={onViewPlan}
        className="flex-shrink-0 text-xs font-black px-4 py-2 rounded-full hover:shadow-lg transition-all whitespace-nowrap"
        style={{background:'#fff',color:'#FF653F'}}>
        View Full Plan →
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PLAN SCHEDULE VIEW — UWorld-style day list
   Shows after plan is saved. Groups days by
   week, expandable rows, topic + action chips.
───────────────────────────────────────────── */
/* ── type colours used in the calendar ── */
const TYPE_CFG = {
  mock:     { label:'Mock Test',   bg:'#fff4ef', border:'#FF653F', text:'#FF653F', dot:'#FF653F' },
  revision: { label:'Revision',    bg:'#f0fdf4', border:'#16a34a', text:'#16a34a', dot:'#16a34a' },
  study:    { label:'Study',       bg:'#f5f3ff', border:'#7c3aed', text:'#7c3aed', dot:'#7c3aed' },
  catchup:  { label:'Buffer',      bg:'#f9fafb', border:'#9ca3af', text:'#6b7280', dot:'#9ca3af' },
}
const CAL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function PlanScheduleView({ plan, onStartTest, onTopicPractice, onRebuild, todayStr }) {
  const days   = plan?.days || []
  const [doneDays,   setDoneDays]   = useState({})
  const [selectedDay, setSelectedDay] = useState(null)

  if (!days.length) return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
      <div className="mb-3 flex justify-center"><DIcCal s={32} c='#1d4ed8'/></div>
      <div className="text-sm font-bold text-blue-800 mb-1">No schedule data found</div>
      <button onClick={onRebuild} className="text-xs text-blue-600 font-semibold underline">Create a plan</button>
    </div>
  )

  const totalDone = Object.values(doneDays).filter(Boolean).length
  const totalDays = days.length
  const pctDone   = totalDays ? Math.round((totalDone / totalDays) * 100) : 0
  const todayISO  = new Date().toISOString().split('T')[0]

  /* Build calendar grid from isoDate if available, else fall back to list */
  const hasISO = days.some(d => d.isoDate)

  /* Build week grid */
  const calWeeks = (() => {
    if (!hasISO) return null
    const dayMap = {}
    days.forEach(d => { if (d.isoDate) dayMap[d.isoDate] = d })
    const sorted = days.filter(d => d.isoDate).map(d => d.isoDate).sort()
    if (!sorted.length) return null
    const firstDate = new Date(sorted[0])
    const lastDate  = new Date(sorted[sorted.length - 1])
    // Anchor to Monday of the first week
    const anchor = new Date(firstDate)
    const dow0 = anchor.getDay()
    anchor.setDate(anchor.getDate() - (dow0 === 0 ? 6 : dow0 - 1))
    const weeks = []
    const cur = new Date(anchor)
    while (cur <= lastDate) {
      const week = []
      for (let c = 0; c < 7; c++) {
        const iso = cur.toISOString().split('T')[0]
        week.push({ iso, dayNum: cur.getDate(), planDay: dayMap[iso] || null })
        cur.setDate(cur.getDate() + 1)
      }
      weeks.push(week)
    }
    return weeks
  })()

  const getAction = (dayType, topics) => {
    if (dayType === 'mock')
      return { label:'Launch Mock Test', onClick: () => onStartTest('mock') }
    if (dayType === 'revision')
      return { label:'Review Topics', onClick: () => onTopicPractice(topics[0] || '') }
    if (dayType === 'catchup')
      return { label:'Practice Weak Topics', onClick: () => onTopicPractice(topics[0] || '') }
    return { label:'Practice Questions', onClick: () => onTopicPractice(topics[0] || '') }
  }

  const selDay = selectedDay ? days.find(d => d.isoDate === selectedDay || d.day === selectedDay) : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900">My Study Plan</h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {[
              { label:'Study',   val:plan.studyDays||0,    color:'#7c3aed' },
              { label:'Mock',    val:plan.mockDays||0,     color:'#FF653F' },
              { label:'Revision',val:plan.revisionDays||0, color:'#16a34a' },
              ...(plan.catchupDays ? [{ label:'Buffer', val:plan.catchupDays, color:'#6b7280' }] : []),
            ].map(s => (
              <span key={s.label} className="flex items-center gap-1 text-xs font-semibold" style={{color:s.color}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:s.color,display:'inline-block'}}/>
                {s.val} {s.label}
              </span>
            ))}
          </div>
        </div>
        <button onClick={onRebuild}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-semibold flex-shrink-0">
          ↺ Rebuild
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-900">Overall Progress</span>
          <span className="text-sm font-black" style={{color:'#6366f1'}}>{pctDone}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-500"
            style={{width:`${pctDone}%`,background:'linear-gradient(90deg,#6366f1,#FF653F)'}}/>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-base font-black text-green-600">{totalDone}</div>
            <div className="text-xs text-gray-400">Done</div>
          </div>
          <div>
            <div className="text-base font-black" style={{color:'#6366f1'}}>{totalDays - totalDone}</div>
            <div className="text-xs text-gray-400">Remaining</div>
          </div>
          <div>
            <div className="text-base font-black text-gray-700">{totalDays}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      {calWeeks ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
          {/* Legend */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 flex-wrap">
            {Object.entries(TYPE_CFG).map(([k,v]) => (
              <span key={k} className="flex items-center gap-1.5 text-xs font-semibold" style={{color:v.text}}>
                <span style={{width:10,height:10,borderRadius:3,background:v.bg,border:`1.5px solid ${v.border}`,display:'inline-block'}}/>
                {v.label}
              </span>
            ))}
            <span className="ml-auto text-xs text-gray-400">Click a day to see details</span>
          </div>

          {/* Day-of-week header */}
          <div style={{overflowX:'auto',scrollbarWidth:'none'}}>
            <div style={{minWidth:420}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #f3f4f6'}}>
                {CAL_DAYS.map(d => (
                  <div key={d} style={{padding:'8px 4px',textAlign:'center',fontSize:11,fontWeight:700,
                    color:'#9ca3af',letterSpacing:'.04em',textTransform:'uppercase'}}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              {calWeeks.map((week, wIdx) => (
                <div key={wIdx} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',
                  borderBottom: wIdx < calWeeks.length-1 ? '1px solid #f3f4f6' : 'none'}}>
                  {week.map(cell => {
                    const pd      = cell.planDay
                    const isDone  = pd ? !!doneDays[pd.day] : false
                    const isToday = cell.iso === todayISO
                    const isSel   = selectedDay === cell.iso
                    const cfg     = pd ? TYPE_CFG[pd.type] || TYPE_CFG.study : null
                    return (
                      <div key={cell.iso}
                        onClick={() => pd && setSelectedDay(isSel ? null : cell.iso)}
                        style={{
                          minHeight:72,
                          padding:'6px 5px',
                          cursor: pd ? 'pointer' : 'default',
                          background: isDone ? '#f0fdf4'
                            : isSel ? '#faf5ff'
                            : isToday && pd ? '#fff9f7'
                            : pd ? cfg.bg : '#fafafa',
                          border: isSel ? '2px solid #7c3aed'
                            : isToday && pd ? `2px solid ${cfg?.border||'#e5e7eb'}`
                            : '2px solid transparent',
                          borderRadius: 8,
                          margin: 3,
                          transition:'all .1s',
                          position:'relative',
                        }}>
                        {/* Date number */}
                        <div style={{fontSize:12,fontWeight:800,
                          color: isDone ? '#16a34a' : isToday ? cfg?.text||'#374151' : pd ? cfg?.text||'#374151' : '#d1d5db',
                          marginBottom:3}}>
                          {cell.dayNum}
                          {isToday && pd && <span style={{fontSize:8,fontWeight:700,marginLeft:3,
                            background:cfg?.border,color:'#fff',borderRadius:3,padding:'1px 3px'}}>NOW</span>}
                        </div>
                        {pd && (
                          <>
                            {/* Type badge */}
                            <div style={{fontSize:9,fontWeight:800,textTransform:'uppercase',
                              letterSpacing:'.06em',color: isDone ? '#16a34a' : cfg.text,
                              marginBottom:3}}>
                              {isDone ? '✓ Done' : cfg.label}
                            </div>
                            {/* Topic snippet */}
                            <div style={{fontSize:9,color: isDone ? '#6b7280' : '#6b7280',
                              lineHeight:1.3,overflow:'hidden',
                              display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',
                              textDecoration: isDone ? 'line-through' : 'none',opacity: isDone ? 0.6 : 1}}>
                              {pd.topics[0]}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback: old list if no isoDate (legacy saved plans) */
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700 font-semibold">
          ↺ Rebuild your plan to enable the new calendar view.
        </div>
      )}

      {/* Day detail panel — shows when a calendar cell is clicked */}
      {selDay && (
        <div className="bg-white border-2 rounded-2xl p-5 mb-5 transition-all"
          style={{borderColor: TYPE_CFG[selDay.type]?.border || '#e5e7eb'}}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{
                  fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.07em',
                  padding:'2px 8px',borderRadius:99,
                  background: TYPE_CFG[selDay.type]?.bg,
                  color: TYPE_CFG[selDay.type]?.text,
                  border:`1px solid ${TYPE_CFG[selDay.type]?.border}`,
                }}>
                  {TYPE_CFG[selDay.type]?.label}
                </span>
                <span className="text-xs text-gray-400 font-semibold">Day {selDay.day} · {selDay.date} · {selDay.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selDay.topics.map(t => (
                  <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{background:TYPE_CFG[selDay.type]?.bg, color:TYPE_CFG[selDay.type]?.text,
                      border:`1px solid ${TYPE_CFG[selDay.type]?.border}40`}}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={()=>setSelectedDay(null)}
              style={{color:'#9ca3af',fontSize:18,background:'none',border:'none',cursor:'pointer',padding:4,lineHeight:1}}>
              ×
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {!doneDays[selDay.day] && selDay.type !== 'catchup' && (() => {
              const act = getAction(selDay.type, selDay.topics)
              return (
                <button onClick={act.onClick}
                  style={{padding:'8px 18px',borderRadius:99,fontSize:12,fontWeight:800,
                    border:'none',cursor:'pointer',color:'#fff',
                    background: selDay.type==='mock' ? '#FF653F'
                      : selDay.type==='revision' ? '#16a34a' : '#7c3aed'}}>
                  {act.label} →
                </button>
              )
            })()}
            <button onClick={()=>setDoneDays(p=>({...p,[selDay.day]:!doneDays[selDay.day]}))}
              style={{padding:'8px 18px',borderRadius:99,fontSize:12,fontWeight:700,cursor:'pointer',
                border:`1.5px solid ${doneDays[selDay.day]?'#d1d5db':'#e5e7eb'}`,
                background: doneDays[selDay.day] ? '#f3f4f6' : '#fff',
                color: doneDays[selDay.day] ? '#6b7280' : '#374151'}}>
              {doneDays[selDay.day] ? '✓ Completed — Undo' : 'Mark as done'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom motivation banner */}
      <div className="bg-gradient-to-r from-violet-600 to-orange-500 rounded-2xl p-5 text-white flex items-center justify-between">
        <div>
          <div className="text-sm font-black mb-1">
            {pctDone === 0 && "Your journey starts today — Day 1 awaits!"}
            {pctDone > 0 && pctDone < 50 && `Great start! ${totalDone} days done — keep the momentum!`}
            {pctDone >= 50 && pctDone < 100 && "More than halfway there — you're on track!"}
            {pctDone === 100 && "🏆 Plan complete — you're exam ready!"}
          </div>
          <div className="text-xs" style={{color:'rgba(255,255,255,.75)'}}>{totalDays - totalDone} study days remaining</div>
        </div>
        <button onClick={() => onStartTest('mock')}
          className="flex-shrink-0 bg-white text-violet-700 text-xs font-black px-5 py-2.5 rounded-full hover:shadow-lg transition-all whitespace-nowrap ml-4">
          Take a Mock Test →
        </button>
      </div>
    </div>
  )
}


export default function Dashboard({ user, isAdmin = false, planData, onStartTest, onLogout, onNav, onOpenResult, initialTab = 'home', examRegion = 'in' }) {

  /* ── existing state ── */
  const [history,    setHistory]   = useState([])
  const [panelOpen,  setPanelOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  /* ── new sidebar state ── */
  const [activeTab,  setActiveTab] = useState(initialTab)
  const [exploreExam, setExploreExam] = useState(null)   // selected exam in Explore view
  const [activeExploreGroup, setActiveExploreGroup] = useState(null)  // category tab in Explore
  const [exploreTab,  setExploreTab]  = useState('overview')
  const [blueprint,   setBlueprint]   = useState(null)
  const [bpLoading,   setBpLoading]   = useState(false)
  useEffect(() => { if (activeTab !== 'explore') setExploreExam(null) }, [activeTab])
  // Make browser Back close an open exam-detail (return to the exam list) instead
  // of appearing to do nothing — the detail is internal state, so we register a
  // history entry while it's open and pop back to the list on Back.
  useEffect(() => {
    if (!exploreExam) return
    window.history.pushState({ dashExplore: true }, '')
    const onPop = () => setExploreExam(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [exploreExam])
  // load the real per-exam blueprint (topic-wise weightage) when an exam opens
  useEffect(() => {
    if (!exploreExam) { setBlueprint(null); return }
    setExploreTab('overview'); setBlueprint(null); setBpLoading(true)
    let cancelled = false
    // Retry on failure — Render free tier cold-starts, so the first hit after
    // inactivity can time out; without this it falls back to the plain chips view.
    const load = (attempt = 0) =>
      getExamBlueprint(exploreExam)
        .then(d => { if (!cancelled) { setBlueprint(d); setBpLoading(false) } })
        .catch(() => {
          if (cancelled) return
          if (attempt < 3) { setTimeout(() => load(attempt + 1), 2500) }
          else { setBlueprint(null); setBpLoading(false) }
        })
    load()
    return () => { cancelled = true }
  }, [exploreExam])

  /* ── study planner state ── */
  const [planExam,      setPlanExam]      = useState(user?.user_metadata?.target_exam || '')
  const [planExamTab,   setPlanExamTab]   = useState('')
  const [blockedDates,  setBlockedDates]  = useState([])
  const toggleBlockedDate = (dateStr) =>
    setBlockedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr])
  const [catchupEnabled, setCatchupEnabled] = useState(false)
  const [catchupEvery,   setCatchupEvery]   = useState(3)
  const [startDate,     setStartDate]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [studyDays,     setStudyDays]     = useState([])
  const [dayHours,      setDayHours]      = useState({})
  // average hours/day across selected days — used where a single value is needed
  const hoursPerDay = studyDays.length
    ? Math.max(1, Math.round(studyDays.reduce((s,d)=>s+(Number(dayHours[d])||0),0)/studyDays.length))
    : 2
  const [weakTopics,    setWeakTopics]    = useState([])
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [savedPlan,     setSavedPlan]     = useState(planData || null)
  const [planSaving,    setPlanSaving]    = useState(false)
  const [planSaved,     setPlanSaved]     = useState(false)
  const [showPlanBuilder,setShowPlanBuilder]= useState(false)
  const [completedDays,  setCompletedDays] = useState({})
  const [planLoading,    setPlanLoading]   = useState(true)   // true until Supabase responds

  /* ── profile state ── */
  const [profileEdit,   setProfileEdit]   = useState(false)
  const [profileName,   setProfileName]   = useState(user?.user_metadata?.full_name || '')
  const [profilePhone,  setProfilePhone]  = useState(user?.user_metadata?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg,    setProfileMsg]    = useState('')
  // educational status
  const [profileCategory, setProfileCategory] = useState(user?.user_metadata?.category || 'UR')
  const [profileState,    setProfileState]    = useState(user?.user_metadata?.state || '')
  const [profileLevel,    setProfileLevel]    = useState(user?.user_metadata?.level || '')
  const [profileExam,     setProfileExam]     = useState(user?.user_metadata?.target_exam || (examRegion === 'us' ? 'sat_full' : 'bank_clerk_prelims'))
  const [eduEdit,         setEduEdit]         = useState(false)
  const [eduSaving,       setEduSaving]       = useState(false)
  // password change
  const [newPwd,    setNewPwd]    = useState('')
  const [confirmPwd,setConfirmPwd]= useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg,    setPwdMsg]    = useState('')
  // notification preferences
  const [notifNoSubs,  setNotifNoSubs]  = useState(!!user?.user_metadata?.notif_off_subs)
  const [notifNoPromo, setNotifNoPromo] = useState(!!user?.user_metadata?.notif_off_promo)
  const [notifSaving,  setNotifSaving]  = useState(false)

  /* ── selected / target exam state ── */
  const [selectedExamId, setSelectedExamId] = useState(
    user?.user_metadata?.target_exam || (examRegion === 'us' ? 'sat_full' : 'bank_clerk_prelims')
  )
  // true only once the user has actually picked an exam (not skipped onboarding)
  const [examChosen,     setExamChosen]     = useState(!!user?.user_metadata?.target_exam)
  const [showAllExams,   setShowAllExams]   = useState(false)
  const [changingExam,   setChangingExam]   = useState(false)
  const [examSaving,     setExamSaving]     = useState(false)

  /* region-aware exam groups, practice modes, and topic groups */
  const ACTIVE_GROUPS       = examRegion === 'us' ? SAT_EXAM_GROUPS  : EXAM_GROUPS
  const ACTIVE_MODES        = examRegion === 'us' ? SAT_MODES        : MODES
  const ACTIVE_TOPIC_GROUPS = examRegion === 'us' ? SAT_TOPIC_GROUPS : TOPIC_GROUPS

  /* flatten all exams + find the selected one and its group */
  const ALL_EXAMS_FLAT = ACTIVE_GROUPS.flatMap(g => g.exams.map(e => ({ ...e, groupId: g.id, groupLabel: g.label, groupColor: g.color })))
  const selectedExam   = ALL_EXAMS_FLAT.find(e => e.id === selectedExamId) || ALL_EXAMS_FLAT[0]
  const selectedGroup  = ACTIVE_GROUPS.find(g => g.id === selectedExam?.groupId) || ACTIVE_GROUPS[0]

  /* persist a new target exam to Supabase user_metadata */
  const handleChangeExam = async (examId) => {
    setSelectedExamId(examId)
    setExamChosen(true)
    setChangingExam(false)
    setExamSaving(true)
    try { await supabase.auth.updateUser({ data: { target_exam: examId } }) }
    catch (e) { console.error('Change exam error:', e.message) }
    setExamSaving(false)
  }

  /* results that belong to the selected exam GROUP (for progress) */
  const groupExamIds = selectedGroup?.exams?.map(e => e.id) || [selectedExamId]
  const examResults = history.filter(r => groupExamIds.includes(r.exam || ''))

  /* exam ids the user has actually attempted (for "other exams" list) */
  const attemptedExamIds = [...new Set(history.map(r => r.exam).filter(Boolean))]

  /* If the user skipped exam selection but has practised something,
     treat their most recent attempt as the selected exam. */
  useEffect(() => {
    if (!examChosen && history.length > 0 && history[0].exam) {
      setSelectedExamId(history[0].exam)
      setExamChosen(true)
    }
  }, [history, examChosen])

  /* subscription tier — free users can only prepare for one exam group */
  const plan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
  const isPro = !['free','', 'none'].includes(plan)

  /* 7-day free trial countdown (from account creation) */
  const TRIAL_DAYS    = 7
  const createdAt     = user?.created_at ? new Date(user.created_at) : new Date()
  const trialEnd      = new Date(createdAt.getTime() + TRIAL_DAYS * 86400000)
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd - new Date()) / 86400000))
  const trialActive   = !isPro && trialDaysLeft > 0
  const trialExpired  = !isPro && trialDaysLeft <= 0
  const trialEndStr   = trialEnd.toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })

  /* exams the user registered for (free → just their pick; pro → whole group) */
  const registeredExamIds = (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length)
    ? user.user_metadata.selected_exams
    : [selectedExamId]

  /* Derived live each render (not one-time state) so the "pick an exam" hero
     never flashes for returning users while their data is still loading. */
  const hasChosenExam = examRegion === 'us'
    || examChosen
    || !!user?.user_metadata?.target_exam
    || (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length > 0)
    || history.length > 0
  const FREE_OPEN_IDS = new Set(['ap_eamcet_engg', 'ts_eamcet_engg'])
  const visibleGroupExams = (examRegion === 'us' || isPro)
    ? selectedGroup.exams
    : selectedGroup.exams.filter(e => registeredExamIds.includes(e.id) || e.id === selectedExamId || FREE_OPEN_IDS.has(e.id))
  const examBest    = examResults.length ? Math.max(...examResults.map(r => r.percentage || 0)) : null
  const examAvg     = examResults.length ? (examResults.reduce((s,r)=>s+(r.percentage||0),0)/examResults.length) : null
  const lastAttempt = examResults[0] || null
  const readiness   = examBest != null ? Math.min(100, Math.round(examBest)) : 0

  const gcol = (pct, cnt) => {
    if (!cnt) return '#e5e7eb'
    if (pct < 40)  return '#ef4444'
    if (pct < 65)  return '#f97316'
    if (pct < 82)  return '#3b82f6'
    return '#16a34a'
  }
  const shortGroupLbl = l => l.replace(/\s*(exams?|tests?)\s*$/i,'').trim()
  const readinessStatus = pct => {
    if (pct >= 82) return { msg:"You're on Track!",       sub:"Great progress, keep it up!",                col:'#16a34a', bg:'#f0fdf4', bdr:'#bbf7d0' }
    if (pct >= 65) return { msg:"You're making progress!", sub:"Focus on weak areas to improve further.",    col:'#f97316', bg:'#fff8f0', bdr:'#fed7aa' }
    if (pct >= 40) return { msg:"Keep Practicing!",        sub:"More tests will sharpen your skills.",       col:'#3b82f6', bg:'#eff6ff', bdr:'#bfdbfe' }
    return           { msg:"Needs More Work",             sub:"Start with your weakest section first.",     col:'#ef4444', bg:'#fff5f5', bdr:'#fecaca' }
  }

  /* ── existing derived values ── */
  const rawName  = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const generic  = ['admin','test','user','testuser','administrator']
  const userName = generic.includes(rawName.toLowerCase()) ? (user?.email?.split('@')[0] || rawName) : rawName
  const adminUser = isAdmin
  const today    = new Date().toISOString().split('T')[0]
  // Free users can't plan past their trial expiry; everyone is capped at 7 days.
  const trialCap = (!isPro && trialActive) ? trialEnd.toISOString().split('T')[0] : ''
  const startMax = trialCap || ''                      // latest the plan may START (free users)
  const minEnd   = startDate || today
  // Plan length cap = 7 days, but never beyond the trial window for free users.
  const maxEnd   = startDate
    ? (() => {
        const cap7 = new Date(new Date(startDate).getTime() + 7 * 86400000)
        const cap  = (!isPro && trialActive)
          ? new Date(Math.min(cap7.getTime(), trialEnd.getTime()))
          : cap7
        return cap.toISOString().split('T')[0]
      })()
    : ''

  // A date input's `max` only limits the calendar popup, not an already-set value.
  // Clamp the picked dates back inside the allowed range (e.g. trial window).
  useEffect(() => {
    if (startMax && startDate && startDate > startMax) setStartDate(startMax)
    if (maxEnd && endDate && endDate > maxEnd) setEndDate(maxEnd)
  }, [startMax, maxEnd, startDate, endDate])

  /* ── load recent results + saved plan ── */
  const planFetchedRef = useRef(false)
  useEffect(() => {
    if (!user) return

    supabase.from('results').select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setHistory(data || []))
      .catch(() => {})

    if (planData) {
      setSavedPlan(normalizePlan(planData))
      setPlanLoading(false)
      planFetchedRef.current = true
    } else if (!planFetchedRef.current) {
      planFetchedRef.current = true
      // Safety timeout — show builder if Supabase doesn't respond in 8s
      const timeout = setTimeout(() => setPlanLoading(false), 8000)
      supabase.from('study_plans').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data, error }) => {
          clearTimeout(timeout)
          if (error) console.error('Load plan error:', error.message)
          if (data?.[0]) setSavedPlan(normalizePlan(data[0]))
          setPlanLoading(false)
        })
        .catch((e) => {
          clearTimeout(timeout)
          console.error('Load plan exception:', e)
          setPlanLoading(false)
        })
    }
  }, [user])

  /* ── existing stats ── */
  const best = history.length ? Math.max(...history.map(r => r.percentage || 0)).toFixed(1) : null
  const avg  = history.length ? (history.reduce((s, r) => s + (r.percentage || 0), 0) / history.length).toFixed(1) : null

  /* ── plan helpers ── */
  const toggleDay   = d => setStudyDays(p => {
    const has = p.includes(d)
    setDayHours(h => { const n = { ...h }; if (has) delete n[d]; else n[d] = n[d] || 0; return n })
    return has ? p.filter(x => x !== d) : [...p, d]
  })
  const setDayHour  = (d, hrs) => {
    setDayHours(h => ({ ...h, [d]: hrs }))
    setStudyDays(p => p.includes(d) ? p : [...p, d])
  }
  const toggleTopic = t => setWeakTopics(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t])

  /* ── subscription / payment ── */
  const [payingPlan, setPayingPlan] = useState('')
  const handleSubscribe = async (planName) => {
    const planId = (planName || '').toLowerCase()
    setPayingPlan(planId)
    try {
      await startCheckout({ user, plan: planId })   // redirects to Stripe on success
    } catch (e) {
      toast(e?.message || 'Could not start checkout. Please try again.', 'error')
      setPayingPlan('')
    }
  }

  /* Normalize plan shape — Supabase rows wrap it under plan_json */
  const normalizePlan = (raw) => {
    if (!raw) return null
    // Already a raw plan object with .days at root
    if (Array.isArray(raw?.days)) return raw
    // Supabase row — plan is under plan_json
    if (raw?.plan_json) {
      return {
        ...raw.plan_json,
        exam_id:       raw.exam_id,
        exam_date:     raw.exam_date,
        hours_per_day: raw.hours_per_day,
        weak_topics:   raw.weak_topics,
        created_at:    raw.created_at,
      }
    }
    return null
  }

  // Create Plan now generates AND saves in one click (no separate Save step).
  const handleGeneratePlan = async () => {
    if (!startDate || !endDate || !studyDays.length) return
    const span = Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    if (span > 7) { toast('Study plan can be at most 7 days. Please pick an end date within a week of the start date.', 'error'); return }
    if (!isPro && trialActive && new Date(endDate) > trialEnd) {
      toast(`Your free trial ends on ${trialEndStr}. Pick an end date within your trial, or upgrade for longer plans.`, 'error'); return
    }
    const plan = generatePlan({ startDate, endDate, studyDays, hoursPerDay, dayHours, weakTopics, topicGroups: ACTIVE_TOPIC_GROUPS, blockedDates, catchupEvery: catchupEnabled ? catchupEvery : 0 })
    if (!plan) return
    setGeneratedPlan(plan)
    await handleSavePlan(plan)
  }

  const handleSavePlan = async (planArg) => {
    const plan = planArg || generatedPlan
    if (!plan) return
    setPlanSaving(true)

    // Delete old plans for this user first, then insert fresh
    await supabase.from('study_plans').delete().eq('user_id', user.id)

    const { data: inserted, error } = await supabase
      .from('study_plans')
      .insert({
        user_id:       user.id,
        exam_id:       planExam,
        exam_date:     endDate,
        hours_per_day: hoursPerDay,
        weak_topics:   weakTopics,
        plan_json:     plan,
        created_at:    new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Plan save error:', error.message, error.details, error.hint)
      setPlanSaving(false)
      toast('Could not save plan: ' + error.message, 'error')
      return
    }

    await supabase.auth.updateUser({
      data: { onboarding_complete: true, target_exam: planExam }
    })

    // Capture the plan inputs into student_onboarding (one row per student)
    try {
      await supabase.from('student_onboarding').upsert({
        student_id:      user.id,
        exam_id:         planExam,
        selected_exams:  [planExam],
        exam_date:       endDate || null,
        hours_per_day:   hoursPerDay,
        weak_topics:     groupWeakTopics(weakTopics, ACTIVE_TOPIC_GROUPS),
        onboarding_done: true,
        updated_at:      new Date().toISOString(),
      }, { onConflict: 'student_id' })
    } catch (e) { console.error('student_onboarding (planner) save failed:', e?.message) }

    // Reflect the chosen exam on the dashboard immediately
    setSelectedExamId(planExam); setExamChosen(true)

    // Use the normalized plan so PlanScheduleView always gets .days at root
    const normalized = normalizePlan(inserted || plan)
    setSavedPlan(normalized)
    setPlanSaving(false)
    setPlanSaved(true)
    setShowPlanBuilder(false)
    setGeneratedPlan(null)
    setTimeout(() => setPlanSaved(false), 3000)
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileMsg('')
    await supabase.auth.updateUser({ data: { full_name: profileName, phone: profilePhone } })
    try {
      await supabase.from('profiles').upsert({ id: user.id, full_name: profileName, phone: profilePhone }, { onConflict: 'id' })
      await supabase.from('student_onboarding').upsert({ student_id: user.id, phone: profilePhone, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
    } catch (_) {}
    setProfileSaving(false); setProfileEdit(false)
    setProfileMsg('✓ Saved'); setTimeout(() => setProfileMsg(''), 2500)
  }

  const handleSaveEdu = async () => {
    setEduSaving(true)
    await supabase.auth.updateUser({ data: {
      category: profileCategory, state: profileState, level: profileLevel, target_exam: profileExam,
    }})
    try {
      await supabase.from('profiles').upsert({ id: user.id, category: profileCategory, state: profileState, target_exam: profileExam }, { onConflict: 'id' })
      await supabase.from('student_onboarding').upsert({ student_id: user.id, exam_id: profileExam, selected_exams: [profileExam], level: profileLevel, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
    } catch (_) {}
    setSelectedExamId(profileExam); setExamChosen(true)
    setEduSaving(false); setEduEdit(false)
  }

  const handleChangePassword = async () => {
    setPwdMsg('')
    if (newPwd.length < 6)        { setPwdMsg('Password must be at least 6 characters.'); return }
    if (newPwd !== confirmPwd)    { setPwdMsg('Passwords do not match.'); return }
    setPwdSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdSaving(false)
    if (error) { setPwdMsg(error.message); return }
    setNewPwd(''); setConfirmPwd(''); setPwdMsg('✓ Password updated')
    setTimeout(() => setPwdMsg(''), 3000)
  }

  const handleSaveNotif = async (subs, promo) => {
    setNotifNoSubs(subs); setNotifNoPromo(promo); setNotifSaving(true)
    await supabase.auth.updateUser({ data: { notif_off_subs: subs, notif_off_promo: promo } })
    setNotifSaving(false)
  }

  /* ── type colour helpers ── */
  const typeColor = t => t==='mock'?'#FF653F':t==='revision'?'#16a34a':'#FF653F'
  const typeBg    = t => t==='mock'?'#FFF3EE':t==='revision'?'#dcfce7':'#FFF3EE'

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col" style={{background:'#fff'}}>

      {/* ══ TOP HEADER — identical to existing ══ */}
      <header className="h-16 flex items-center px-5 gap-4 sticky top-0 z-30" style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#FF653F' }}>
            <span className="text-white text-sm font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-base font-black tracking-tight" style={{color:'#111827'}}>MockTest</div>
            <div style={{fontSize:8.5,fontWeight:700,color:'#FF653F',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
          </div>
        </div>
        <div className="flex-1"/>
        {/* Trial pill — inline in header */}
        {(trialActive || trialExpired) && (
          <div className="hidden sm:flex items-center gap-2 text-xs flex-shrink-0" style={{color:'#6b7280'}}>
            <span>
              {trialExpired
                ? 'Free trial ended — upgrade to continue.'
                : <>{trialDaysLeft === 1 ? 'Last day' : <><b style={{color:'#FF653F'}}>{trialDaysLeft} days</b> left</>} of your free trial.</>}
            </span>
            <button onClick={() => setActiveTab('subscriptions')}
              className="text-white text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0"
              style={{ background:'#FF653F' }}>
              Upgrade
            </button>
          </div>
        )}
        {/* Right section */}
        <div className="flex items-center gap-2 ml-3">
          {adminUser && (
            <button onClick={() => onNav?.('admin')}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl transition-colors"
              style={{background:'#f3f4f6',border:'1px solid #e5e7eb'}}><DIcGear s={14} c='#374151'/></button>
          )}
          {/* Last updated — desktop */}
          {history[0]?.created_at && (
            <div className="hidden md:flex" style={{alignItems:'center',gap:5,fontSize:11,color:'#b0b8c4',fontWeight:600,whiteSpace:'nowrap',marginRight:2}}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Last updated {new Date(history[0].created_at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
            </div>
          )}
          {/* User dropdown — desktop */}
          <div className="relative hidden md:block">
            {userMenuOpen && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setUserMenuOpen(false)}/>}
            <button onClick={()=>setUserMenuOpen(o=>!o)}
              className="flex items-center gap-2 rounded-full transition-all"
              style={{background:'#f3f4f6',border:'1px solid #e5e7eb',padding:'5px 12px 5px 5px',cursor:'pointer',outline:'none',position:'relative',zIndex:50}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',flexShrink:0}}>
                {(userName[0]||'U').toUpperCase()}
              </div>
              <span style={{fontSize:13,fontWeight:700,color:'#111827',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {(userName||'').split(' ')[0].replace(/\b\w/g,c=>c.toUpperCase())}
              </span>
              <svg width="10" height="10" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"
                style={{transform:userMenuOpen?'rotate(180deg)':'none',transition:'transform .2s'}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {/* Dropdown panel */}
            {userMenuOpen && (
              <div style={{
                position:'absolute',top:'calc(100% + 8px)',right:0,
                background:'#fff',border:'1px solid #e5e7eb',borderRadius:14,
                boxShadow:'0 8px 32px rgba(0,0,0,.12)',minWidth:220,
                zIndex:50,overflow:'hidden',
                animation:'dropdown-in .15s ease-out'
              }}>
                <style>{`@keyframes dropdown-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                {/* User info header */}
                <div style={{padding:'14px 16px 12px',borderBottom:'1px solid #f5f5f5'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff',flexShrink:0}}>
                      {(userName[0]||'U').toUpperCase()}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:'#111827',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{userName}</div>
                      <div style={{fontSize:11,color:'#9ca3af',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email}</div>
                    </div>
                  </div>
                  {/* Plan badge */}
                  <div style={{marginTop:10,padding:'6px 10px',background: isPro ? (plan==='ultimate'?'#f5f3ff':'#fff8f5') : '#f8fafc', border:`1px solid ${isPro?(plan==='ultimate'?'#ddd6fe':'#fed7aa'):'#e5e7eb'}`,borderRadius:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em'}}>
                      {isPro?'Plan':'Free Trial'}
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:isPro?(plan==='ultimate'?'#7048E8':'#FF653F'):(trialExpired?'#ef4444':'#FF653F'),marginTop:1}}>
                      {isPro
                        ? `${plan.charAt(0).toUpperCase()+plan.slice(1)} — active`
                        : trialExpired ? `Trial expired on ${trialEndStr}`
                        : `${trialDaysLeft} day${trialDaysLeft>1?'s':''} left`}
                    </div>
                  </div>
                </div>
                {/* Menu items */}
                {[
                  {label:'Profile & Settings', icon:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, action:()=>{setUserMenuOpen(false);setActiveTab('profile')}},
                  {label:'Subscription',       icon:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, action:()=>{setUserMenuOpen(false);setActiveTab('subscriptions')}},
                ].map(m=>(
                  <button key={m.label} onClick={m.action}
                    style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',fontSize:13,fontWeight:600,color:'#374151',background:'none',border:'none',cursor:'pointer',textAlign:'left',transition:'background .1s'}}
                    onMouseOver={e=>e.currentTarget.style.background='#f8fafc'}
                    onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <span style={{color:'#9ca3af',flexShrink:0}}>{m.icon}</span>
                    {m.label}
                  </button>
                ))}
                <div style={{borderTop:'1px solid #f5f5f5',margin:'4px 0'}}/>
                <button onClick={()=>{setUserMenuOpen(false);onLogout()}}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 16px 12px',fontSize:13,fontWeight:600,color:'#ef4444',background:'none',border:'none',cursor:'pointer',textAlign:'left',transition:'background .1s'}}
                  onMouseOver={e=>e.currentTarget.style.background='#fff5f5'}
                  onMouseOut={e=>e.currentTarget.style.background='none'}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          {/* Mobile: hamburger only */}
          <button onClick={() => setPanelOpen(true)} aria-label="Menu"
            className="w-9 h-9 flex md:hidden flex-col items-center justify-center gap-[5px] rounded-xl transition-colors"
            style={{background:'#f3f4f6',border:'1px solid #e5e7eb'}}>
            <span className="w-4 h-0.5 rounded-full" style={{background:'#374151'}}/>
            <span className="w-4 h-0.5 rounded-full" style={{background:'#374151'}}/>
            <span className="w-4 h-0.5 rounded-full" style={{background:'#374151'}}/>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ══ LEFT SIDEBAR — light ══ */}
        <aside className="w-60 flex-shrink-0 hidden md:flex flex-col overflow-y-auto"
          style={{position:'sticky',top:64,height:'calc(100vh - 64px)',background:'#f8fafc',borderRight:'1px solid #e5e7eb'}}>

          {/* Nav items */}
          <nav className="flex-1 py-4 px-3">
            {SIDEBAR_NAV.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm mb-0.5 transition-all"
                style={activeTab === item.id
                  ? { background:'rgba(255,101,63,.1)', color:'#FF653F', fontWeight:700, boxShadow:'inset 3px 0 0 #FF653F' }
                  : { color:'#6b7280', fontWeight:500 }}
                onMouseOver={e=>{ if(activeTab!==item.id){ e.currentTarget.style.background='#f0f0f0'; e.currentTarget.style.color='#374151' } }}
                onMouseOut={e=>{ if(activeTab!==item.id){ e.currentTarget.style.background=''; e.currentTarget.style.color='#6b7280' } }}>
                <span className="flex-shrink-0 opacity-80"><item.Icon /></span>
                {item.label}
                {item.badge && activeTab !== item.id && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background:'#FF653F' }}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

        </aside>

        {/* ══ MAIN CONTENT — swaps per sidebar tab ══ */}
        <main className="flex-1 overflow-auto flex flex-col" style={{background:'#fff'}}>
          <div className="flex-1 py-6 px-4 sm:px-8 lg:px-12">

            {/* ── HOME tab ── */}
            {activeTab === 'home' && <>
              <style>{`
                .dh-btn{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;padding:9px 18px;border-radius:9px;cursor:pointer;transition:all .15s;border:none;white-space:nowrap;letter-spacing:-.01em}
                .dh-btn-primary{background:#FF653F;color:#fff;box-shadow:0 2px 10px rgba(255,101,63,.30)}
                .dh-btn-primary:hover{box-shadow:0 4px 16px rgba(255,101,63,.44);transform:translateY(-1px)}
                .dh-btn-ghost{background:#fff;color:#374151;box-shadow:0 0 0 1.5px #e5e7eb}
                .dh-btn-ghost:hover{box-shadow:0 0 0 1.5px #d1d5db;background:#f9fafb}
                .dh-pill{display:inline-flex;align-items:center;padding:6px 13px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;transition:all .12s;background:#fff;box-shadow:0 0 0 1.5px #e5e7eb;color:#374151}
                .dh-pill:hover{box-shadow:0 0 0 1.5px #FF653F;color:#FF653F}
                .dh-pill.active{background:#FF653F;color:#fff;box-shadow:0 2px 8px rgba(255,101,63,.28)}
                .dh-mode-btn{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #f0f0f0;background:#fff;cursor:pointer;transition:all .13s;text-align:left}
                .dh-mode-btn:hover{border-color:#fec9b0;background:#fffaf8;box-shadow:0 2px 10px rgba(255,101,63,.08)}
                .dh-card{background:#fafafa;border:1px solid #f0f0f0;border-radius:14px;padding:20px}
                .dh-lbl{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#b0b8c4;margin-bottom:10px}
                .dh-result-row{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid #f5f5f5;background:none;border-left:none;border-right:none;border-top:none;width:100%;cursor:pointer;transition:background .1s;border-radius:0}
                .dh-result-row:last-child{border-bottom:none}
                .dh-result-row:hover{background:#fafafa}
                .dh-sec-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:1px}
                @media(max-width:860px){
                  .dh-grid{flex-direction:column!important}
                  .dh-left{padding-right:0!important}
                  .dh-right{width:100%!important;flex-shrink:1!important;border-left:none!important;padding-left:0!important;margin-top:28px;border-top:1px solid #f0f0f0;padding-top:28px}
                  .dh-right-inner{display:grid!important;grid-template-columns:1fr 1fr!important;gap:16px!important}
                }
                @media(max-width:600px){
                  .dh-header-row{flex-direction:column!important;gap:12px!important}
                  .dh-header-btns{padding-top:0!important}
                  .dh-right-inner{grid-template-columns:1fr!important}
                }
              `}</style>

              {/* ── Header ── */}
              <div className="dh-header-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,paddingBottom:16,marginBottom:22}}>
                <div style={{minWidth:0,flex:1}}>
                  <h1 style={{fontSize:24,fontWeight:900,color:'#111827',letterSpacing:'-.03em',lineHeight:1.2,margin:0}}>
                    Welcome back, {(userName||'').split(' ')[0].replace(/\b\w/g,c=>c.toUpperCase())}
                  </h1>
                  <p style={{margin:'6px 0 0',fontSize:13.5,color:'#6b7280',fontWeight:500,lineHeight:1.5}}>
                    {[
                      'The score you want tomorrow is earned in the quiet hours you put in today.',
                      'Preparation isn\'t a moment — it\'s a discipline you choose every single day.',
                      'Champions are made long before the exam hall — they\'re made right here, right now.',
                      'Every session you show up for is quietly building the version of you that succeeds.',
                      'Your dedication in these hours is the difference between almost and absolutely.',
                      'Small, consistent effort compounds into extraordinary results — keep going.',
                      'The exam doesn\'t test potential; it reveals preparation. Make yours count.',
                    ][new Date().getDay()]}
                  </p>
                </div>
              </div>

              {/* ── Two-column body ── */}
              <div className="dh-grid" style={{display:'flex',gap:0}}>

                {/* ── LEFT ── */}
                <div className="dh-left" style={{flex:'1 1 0',minWidth:0,paddingRight:36}}>

                  {/* ── All Exams Readiness Circles ── */}
                  {history.length > 0 && (() => {
                    const shortLbl = l => l.replace(/\s*(exams?|tests?)\s*$/i,'').trim()
                    const groupStats = ACTIVE_GROUPS.map(g => {
                      const ids = g.exams.map(e => e.id)
                      const res = history.filter(r => ids.includes(r.exam || ''))
                      const best = res.length ? Math.round(Math.max(...res.map(r => Number(r.percentage||0)))) : 0
                      const avg  = res.length ? Math.round(res.reduce((s,r)=>s+Number(r.percentage||0),0)/res.length) : 0
                      return { ...g, count: res.length, best, avg }
                    }).filter(g => g.count > 0)
                    if (!groupStats.length) return null

                    const SZ=110, R=42, CX=55, CY=55, CIRC=+(2*Math.PI*R).toFixed(1)

                    return (
                      <div style={{marginBottom:24}}>
                        <style>{`
                          @keyframes rg-pulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.9;transform:scale(1.07)}}
                          @keyframes rg-card-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
                          .rg-grid{display:grid;gap:10px}
                          .rg-card{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;cursor:pointer;outline:none;border-radius:16px;padding:14px 10px 14px;position:relative;transition:border-color .08s,background .08s,box-shadow .08s,transform .08s}
                          .rg-ring-wrap{position:relative;width:110px;height:110px;flex-shrink:0}
                          .rg-footer{display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap}
                          @media(max-width:600px){
                            .rg-grid{grid-template-columns:1fr 1fr!important;gap:10px!important}
                            .rg-card{padding:12px 8px 12px!important;min-height:0;gap:6px!important}
                            .rg-ring-wrap{width:95px!important;height:95px!important}
                            .rg-ring-wrap svg{width:95px!important;height:95px!important}
                            .rg-footer{flex-direction:column!important;align-items:center!important;gap:3px!important}
                          }
                        `}</style>

                        {/* Circle cards — equal-width grid */}
                        <div className="rg-grid" style={{gridTemplateColumns:`repeat(${Math.min(groupStats.length,3)},1fr)`}}>
                          {groupStats.map((g, gi) => {
                            const col      = gcol(g.best, g.count)
                            const dashBest = +((g.best/100)*CIRC).toFixed(1)
                            const dashAvg  = +((g.avg/100)*CIRC).toFixed(1)
                            const isActive = g.id === selectedGroup?.id
                            const gid      = `rg-${g.id}`
                            const tipAngle = (g.best/100)*2*Math.PI - Math.PI/2
                            const tipX     = (CX + R*Math.cos(tipAngle)).toFixed(2)
                            const tipY     = (CY + R*Math.sin(tipAngle)).toFixed(2)
                            const statusLbl = g.best>=82?'On Track':g.best>=65?'Improving':g.best>=40?'Needs Work':'Needs Focus'

                            return (
                              <button key={g.id}
                                className="rg-card"
                                onClick={() => setSelectedExamId(g.exams[0].id)}
                                style={{
                                  background: isActive ? `${col}0d` : '#f8fafc',
                                  border: `2px solid ${isActive ? col : '#eef0f3'}`,
                                  boxShadow: isActive
                                    ? `0 8px 32px ${col}28, 0 2px 10px rgba(0,0,0,.06)`
                                    : '0 1px 4px rgba(0,0,0,.04)',
                                  transform: isActive ? 'translateY(-4px)' : 'none',
                                  animation:`rg-card-in .4s ease-out ${gi*0.07}s both`,
                                }}>

                                {/* Accent top strip */}
                                {isActive && (
                                  <div style={{position:'absolute',top:0,left:16,right:16,height:3,borderRadius:'0 0 4px 4px',background:`linear-gradient(90deg,${col}88,${col})`}}/>
                                )}

                                <div className="rg-ring-wrap">
                                  {/* ambient glow */}
                                  {isActive && (
                                    <div style={{
                                      position:'absolute',inset:-10,borderRadius:'50%',
                                      background:`radial-gradient(circle, ${col}22 0%, transparent 68%)`,
                                      animation:'rg-pulse 2.8s ease-in-out infinite'
                                    }}/>
                                  )}

                                  <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}
                                    style={{display:'block',overflow:'visible'}}>
                                    <defs>
                                      <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={col} stopOpacity="0.55"/>
                                        <stop offset="100%" stopColor={col} stopOpacity="1"/>
                                      </linearGradient>
                                      <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
                                        <feGaussianBlur stdDeviation="3.5" result="blur"/>
                                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                      </filter>
                                    </defs>

                                    {/* background disc */}
                                    <circle cx={CX} cy={CY} r={R+7}
                                      fill={isActive ? `${col}09` : '#f8f9fa'}
                                      stroke={isActive ? `${col}20` : '#f0f0f0'}
                                      strokeWidth="1.5"/>

                                    {/* track ring */}
                                    <circle cx={CX} cy={CY} r={R}
                                      fill="none" stroke={isActive ? `${col}25` : '#ebebeb'} strokeWidth="10"
                                      strokeLinecap="round"/>

                                    {/* avg ghost ring */}
                                    {g.avg > 0 && g.avg !== g.best && (
                                      <circle cx={CX} cy={CY} r={R}
                                        fill="none" stroke={`${col}30`} strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${dashAvg} ${CIRC}`}
                                        transform={`rotate(-90 ${CX} ${CY})`}/>
                                    )}

                                    {/* main arc */}
                                    {g.best > 0 && (
                                      <circle cx={CX} cy={CY} r={R}
                                        fill="none"
                                        stroke={`url(#${gid})`}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${dashBest} ${CIRC}`}
                                        transform={`rotate(-90 ${CX} ${CY})`}
                                        filter={isActive ? `url(#${gid}-glow)` : 'none'}/>
                                    )}

                                    {/* tip dot */}
                                    {g.best > 0 && g.best < 100 && (
                                      <>
                                        <circle cx={tipX} cy={tipY} r="8" fill={col} opacity="0.18"/>
                                        <circle cx={tipX} cy={tipY} r="5" fill={col} opacity={isActive?1:0.7}/>
                                        <circle cx={tipX} cy={tipY} r="2.5" fill="#fff"/>
                                      </>
                                    )}
                                  </svg>

                                  {/* center content */}
                                  <div style={{
                                    position:'absolute',inset:0,
                                    display:'flex',flexDirection:'column',
                                    alignItems:'center',justifyContent:'center',gap:2
                                  }}>
                                    <span style={{
                                      fontSize:g.best>=100?14:17,fontWeight:900,
                                      color:g.best>0?col:'#d1d5db',
                                      lineHeight:1,letterSpacing:'-.02em',
                                      fontVariantNumeric:'tabular-nums'
                                    }}>
                                      {g.best>0?`${g.best}%`:'0%'}
                                    </span>
                                    {g.best > 0 ? (
                                      <span style={{fontSize:8,fontWeight:800,color:'#b0b8c4',letterSpacing:'.07em',textTransform:'uppercase',marginTop:1}}>BEST</span>
                                    ) : (
                                      <span style={{fontSize:9,fontWeight:700,color:'#c4c9d4',marginTop:1}}>Not Started</span>
                                    )}
                                    {g.avg > 0 && g.avg !== g.best && (
                                      <span style={{fontSize:9.5,fontWeight:700,color:`${col}aa`,marginTop:2}}>
                                        {g.avg}% avg
                                      </span>
                                    )}
                                  </div>

                                </div>

                                {/* label + status */}
                                <div className="rg-footer" style={{textAlign:'center'}}>
                                  <div style={{fontSize:13,fontWeight:800,lineHeight:1.2,color:isActive?col:'#374151',whiteSpace:'nowrap'}}>
                                    {shortLbl(g.label)}
                                  </div>
                                  <div style={{
                                    fontSize:10.5,fontWeight:700,
                                    color: isActive ? col : '#b0b8c4',
                                    background: isActive ? `${col}15` : '#f5f5f5',
                                    borderRadius:99,padding:'2px 8px',
                                    display:'inline-block',
                                    transition:'color .08s,background .08s',
                                    whiteSpace:'nowrap',
                                    flexShrink:0
                                  }}>
                                    {statusLbl}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* No exam chosen — rich onboarding */}
                  {!hasChosenExam && (
                    <div style={{marginBottom:28}}>

                      {/* Hero banner */}
                      <div style={{background:'linear-gradient(135deg,#FF653F 0%,#ff9a5f 100%)',borderRadius:18,padding:'24px 28px',marginBottom:22,position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,.08)'}}/>
                        <div style={{position:'absolute',bottom:-30,right:40,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.06)'}}/>
                        <div style={{position:'relative'}}>
                          <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.75)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Welcome to MockTest</div>
                          <div style={{fontSize:20,fontWeight:900,color:'#fff',lineHeight:1.3,marginBottom:10,letterSpacing:'-.02em'}}>
                            Your path to exam success<br/>starts with one decision
                          </div>
                          <p style={{fontSize:13,color:'rgba(255,255,255,.85)',lineHeight:1.65,marginBottom:18,maxWidth:360}}>
                            Choose your target exam and unlock full-length mock tests, topic-wise drills, instant analytics, and a personalised study plan — all in one place.
                          </p>
                          <button className="dh-btn" onClick={() => setActiveTab('explore')}
                            style={{background:'#fff',color:'#FF653F',fontWeight:800,boxShadow:'0 4px 16px rgba(0,0,0,.15)'}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Browse Exams
                          </button>
                        </div>
                      </div>

                      {/* 3-step journey */}
                      <div style={{marginBottom:22}}>
                        <div className="dh-lbl">How it works</div>
                        <div style={{display:'flex',flexDirection:'column',gap:0}}>
                          {[
                            { n:'01', title:'Choose your exam', desc:'Select from IBPS, SBI, SSC, Railway, RBI, SAT, ACT and more. Your dashboard adapts to your target.', col:'#3b82f6' },
                            { n:'02', title:'Practice intelligently', desc:'Take full mocks, topic-wise drills, or section tests — each with a timer, negative marking and instant scoring.', col:'#8b5cf6' },
                            { n:'03', title:'Analyse & improve', desc:'Get a detailed result PDF, topic-wise accuracy breakdown, and an AI study plan every time you attempt a test.', col:'#10b981' },
                          ].map((s,i) => (
                            <div key={s.n} style={{display:'flex',gap:16,paddingBottom:i<2?18:0,borderBottom:i<2?'1px dashed #f0f0f0':'none',marginBottom:i<2?18:0}}>
                              <div style={{width:36,height:36,borderRadius:10,background:`${s.col}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                                <span style={{fontSize:11,fontWeight:900,color:s.col}}>{s.n}</span>
                              </div>
                              <div>
                                <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:3}}>{s.title}</div>
                                <div style={{fontSize:12.5,color:'#6b7280',lineHeight:1.65}}>{s.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Exam category quick-picks */}
                      <div>
                        <div className="dh-lbl">Popular exam categories</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                          {[
                            { label:'Banking Exams', sub:'IBPS · SBI · RBI · NABARD', col:'#3b82f6', id:'explore' },
                            { label:'SSC Exams',     sub:'CGL · CHSL · MTS · CPO',   col:'#8b5cf6', id:'explore' },
                            { label:'Railway',       sub:'NTPC · Group D · ALP',       col:'#10b981', id:'explore' },
                            { label:'US Exams',      sub:'SAT · ACT · AP · PSAT',      col:'#f59e0b', id:'us-exams' },
                          ].map(cat => (
                            <button key={cat.label} onClick={() => setActiveTab(cat.id)}
                              style={{textAlign:'left',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${cat.col}22`,background:`${cat.col}08`,cursor:'pointer',transition:'all .15s'}}
                              onMouseOver={e=>{e.currentTarget.style.background=`${cat.col}15`;e.currentTarget.style.borderColor=`${cat.col}55`}}
                              onMouseOut={e=>{e.currentTarget.style.background=`${cat.col}08`;e.currentTarget.style.borderColor=`${cat.col}22`}}>
                              <div style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:2}}>{cat.label}</div>
                              <div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>{cat.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Progress panel — detailed exam card */}
                  {hasChosenExam && examResults.length > 0 && (() => {
                    const stCol    = gcol(readiness, examResults.length)
                    const st       = readinessStatus(readiness)
                    const totalCorrect = examResults.reduce((s,r)=>s+(r.correct_count||0),0)
                    const totalWrong   = examResults.reduce((s,r)=>s+(r.wrong_count||0),0)

                    /* sparkline for the score trend row */
                    const sparkData = [...examResults].reverse().slice(-8).map(r=>Number(r.percentage||0))
                    const trend     = sparkData.length>=2 ? sparkData[sparkData.length-1]-sparkData[0] : 0
                    const sparkCol  = trend>0?'#16a34a':trend<0?'#f97316':'#9ca3af'
                    const SW=160,SH=52,PAD={t:6,b:6,l:2,r:2}
                    const sMinS=Math.min(...sparkData),sMaxS=Math.max(...sparkData,1),sRangeS=sMaxS-sMinS||1
                    const iW=SW-PAD.l-PAD.r,iH=SH-PAD.t-PAD.b
                    const spx=i=>PAD.l+((i/Math.max(sparkData.length-1,1))*iW)
                    const spy=v=>PAD.t+iH-((v-sMinS)/sRangeS)*iH
                    const linePts=sparkData.map((_,i)=>`${spx(i).toFixed(1)},${spy(sparkData[i]).toFixed(1)}`).join(' ')
                    const areaPath=`M${spx(0).toFixed(1)},${(SH-PAD.b).toFixed(1)} `+sparkData.map((_,i)=>`L${spx(i).toFixed(1)},${spy(sparkData[i]).toFixed(1)}`).join(' ')+` L${spx(sparkData.length-1).toFixed(1)},${(SH-PAD.b).toFixed(1)} Z`
                    const gradId=`sgt-${selectedGroup.id}`

                    return (
                      <div style={{marginBottom:28}}>
                        <div style={{
                          background:'#fff',
                          border:'1.5px solid #f0f0f0',
                          borderRadius:18,
                          overflow:'hidden',
                          boxShadow:'0 2px 16px rgba(0,0,0,.06)',
                          transition:'all .3s'
                        }}>
                          {/* Accent bar */}
                          <div style={{height:4,background:`linear-gradient(90deg,${stCol},${stCol}66)`}}/>

                          <div style={{padding:'18px 20px 20px'}}>
                            {/* Header: exam name + status badge */}
                            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:18,flexWrap:'wrap'}}>
                              <div style={{display:'flex',alignItems:'center',gap:12}}>
                                <div style={{width:44,height:44,borderRadius:12,background:`${stCol}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                  <svg width="20" height="20" fill="none" stroke={stCol} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                </div>
                                <div>
                                  <div style={{fontSize:16,fontWeight:900,color:'#111827',letterSpacing:'-.01em',lineHeight:1.2}}>{shortGroupLbl(selectedGroup.label)}</div>
                                </div>
                              </div>
                              {/* Status badge */}
                              <div style={{background:st.bg,border:`1.5px solid ${st.bdr}`,borderRadius:12,padding:'8px 14px',flexShrink:0}}>
                                <div style={{fontSize:12,fontWeight:800,color:st.col,lineHeight:1.2,display:'flex',alignItems:'center',gap:5}}>
                                  {readiness>=65 && <svg width="12" height="12" fill={st.col} viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z"/></svg>}
                                  {st.msg}
                                </div>
                              </div>
                            </div>

                            {/* Stats grid + sparkline */}
                            <div style={{marginBottom:18}}>
                              {/* 4-stat grid */}
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                                {[
                                  { val:examResults.length,            lbl:'Tests Attempted', col:'#374151', bg:'#f8fafc' },
                                  { val:(examBest!=null?Math.round(examBest)+'%':'—'), lbl:'Best Score',     col:stCol,    bg:`${stCol}08` },
                                  { val:(examAvg!=null?Math.round(examAvg)+'%':'—'),  lbl:'Average Score',  col:'#6b7280', bg:'#f8fafc' },
                                  { val:totalCorrect,                  lbl:'Correct Answers',col:'#16a34a', bg:'#f0fdf4' },
                                ].map(s=>(
                                  <div key={s.lbl} style={{background:s.bg,borderRadius:12,padding:'14px 16px',border:'1px solid #f0f0f0'}}>
                                    <div style={{fontSize:26,fontWeight:900,color:s.col,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{s.val}</div>
                                    <div style={{fontSize:10.5,color:'#9ca3af',fontWeight:600,marginTop:6,lineHeight:1.3}}>{s.lbl}</div>
                                  </div>
                                ))}
                              </div>

                            </div>

                            {/* Action buttons */}
                            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                              <button className="dh-btn dh-btn-primary"
                                onClick={() => onStartTest?.('mock', selectedExamId)}
                                style={{flex:'1 1 140px',justifyContent:'center'}}>
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Continue Practicing
                              </button>
                              <button className="dh-btn dh-btn-ghost"
                                onClick={() => setActiveTab('results')}
                                style={{flex:'1 1 140px',justifyContent:'center'}}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                View Detailed Analysis
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}


                  {/* No results yet — rich first-test experience */}
                  {hasChosenExam && examResults.length === 0 && (
                    <div style={{marginBottom:28}}>

                      {/* Exam hero */}
                      <div style={{background:'#f8fafc',border:'1.5px solid #e5e7eb',borderRadius:16,padding:'20px 20px 16px',marginBottom:18,position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF653F,#ff9a5f)'}}/>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#FF653F,#ff9a5f)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </div>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',letterSpacing:'.06em',textTransform:'uppercase'}}>Your exam</div>
                            <div style={{fontSize:15,fontWeight:900,color:'#111827',letterSpacing:'-.01em'}}>{selectedGroup?.label || 'Mock Test'}</div>
                          </div>
                        </div>
                        <p style={{fontSize:13,color:'#6b7280',lineHeight:1.65,marginBottom:16}}>
                          You've set your target. Now it's time to take your first full-length mock test and get a real picture of where you stand.
                        </p>
                        <button className="dh-btn dh-btn-primary" onClick={() => onStartTest('mock', selectedExamId)}
                          style={{display:'flex',alignItems:'center',gap:8}}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Start first mock test
                        </button>
                      </div>

                      {/* What to expect */}
                      <div style={{marginBottom:18}}>
                        <div className="dh-lbl">What happens after you submit</div>
                        <div style={{display:'flex',flexDirection:'column',gap:10}}>
                          {[
                            { icon: '📊', title: 'Instant score & percentile', desc: 'See your marks, accuracy, and where you rank among test-takers.' },
                            { icon: '📄', title: 'Downloadable result PDF', desc: 'A full paper with correct answers and detailed explanations.' },
                            { icon: '🎯', title: 'Topic-wise weak-area report', desc: 'Find out exactly which topics need more attention.' },
                          ].map(item => (
                            <div key={item.title} style={{display:'flex',gap:12,padding:'12px 14px',background:'#fff',border:'1px solid #f0f0f0',borderRadius:12}}>
                              <div style={{fontSize:20,flexShrink:0,lineHeight:1}}>{item.icon}</div>
                              <div>
                                <div style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:2}}>{item.title}</div>
                                <div style={{fontSize:12,color:'#6b7280',lineHeight:1.55}}>{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick tips */}
                      <div style={{background:'#fffbf5',border:'1px solid #fed7aa',borderRadius:12,padding:'14px 16px'}}>
                        <div style={{fontSize:11,fontWeight:800,color:'#f97316',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Before you start — 3 tips</div>
                        <ol style={{margin:0,paddingLeft:18,display:'flex',flexDirection:'column',gap:6}}>
                          {[
                            'Sit in a quiet place with at least 90 uninterrupted minutes.',
                            'Don\'t skip negative-marking rules — read them in the "Before you start" panel.',
                            'Treat it like the real exam: no pausing, no switching tabs.',
                          ].map((t,i) => (
                            <li key={i} style={{fontSize:12.5,color:'#374151',lineHeight:1.6}}>{t}</li>
                          ))}
                        </ol>
                      </div>

                    </div>
                  )}

                  {/* Recent Tests */}
                  {history.length > 0 && (
                    <div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                        <div className="dh-lbl" style={{margin:0}}>Recent Tests</div>
                        <button onClick={() => setActiveTab('results')}
                          style={{fontSize:11,fontWeight:700,color:'#FF653F',background:'none',border:'none',cursor:'pointer',padding:0}}>
                          View all →
                        </button>
                      </div>
                      <div style={{background:'#fafafa',border:'1px solid #f0f0f0',borderRadius:12,overflow:'hidden'}}>
                        {history.slice(0,5).map((r,i,arr)=>{
                          const pct=Number(r.percentage||0)
                          const toTitle=s=>(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
                          const name=r.test_type==='topic_diagnostic'?`Topicwise${r.topic?` · ${toTitle(r.topic)}`:''}`
                            :r.test_type==='mini'||r.test_type==='concept_mini'?`Practice${r.topic?` · ${toTitle(r.topic)}`:r.section?` · ${toTitle(r.section)}`:''}`
                            :`Mock Test · ${toTitle(r.exam)||'Clerk Prelims'}`
                          const date=new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
                          const pass=pct>=40
                          return (
                            <button key={r.id||i} onClick={()=>onOpenResult?.(r)}
                              className="dh-result-row"
                              style={{padding:'10px 16px',borderRadius:0,borderBottom:i<arr.length-1?'1px solid #f0f0f0':'none'}}>
                              <span style={{
                                fontSize:13,fontWeight:900,width:40,textAlign:'right',flexShrink:0,
                                color:pass?'#16a34a':'#f97316',fontVariantNumeric:'tabular-nums'
                              }}>{pct.toFixed(0)}%</span>
                              <div style={{flex:1,minWidth:0,marginLeft:4}}>
                                <div style={{fontSize:12.5,fontWeight:600,color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
                                <div style={{fontSize:11,color:'#b0b8c4',marginTop:1}}>{date} · {r.correct_count||0} correct · {r.wrong_count||0} wrong</div>
                              </div>
                              <span style={{fontSize:11,fontWeight:700,color:'#FF653F',flexShrink:0,opacity:0,transition:'opacity .15s'}}
                                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                                onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                                Review →
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── RIGHT ── */}
                <div className="dh-right" style={{width:270,flexShrink:0,borderLeft:'1px solid #f0f0f0',paddingLeft:28}}>

                  {/* ── Tests Overview breakdown ── */}
                  {history.length > 0 && (() => {
                    const groupBreakdown = ACTIVE_GROUPS.map(g => ({
                      ...g,
                      count: history.filter(r => g.exams.map(e=>e.id).includes(r.exam||'')).length
                    })).filter(g => g.count > 0)
                    const shortLbl = l => l.replace(/\s*(exams?|tests?)\s*$/i,'').trim()
                    return (
                      <div style={{marginBottom:22}}>
                        <div className="dh-lbl">Tests Overview</div>
                        <div style={{background:'#fff',border:'1.5px solid #f0f0f0',borderRadius:14,padding:'14px 16px',boxShadow:'0 1px 6px rgba(0,0,0,.04)'}}>
                          {/* Total pill */}
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:10,marginBottom:10,borderBottom:'1px solid #f5f5f5'}}>
                            <span style={{fontSize:11.5,fontWeight:700,color:'#6b7280'}}>Total Tests Taken</span>
                            <span style={{fontSize:22,fontWeight:900,color:'#111827',lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{history.length}</span>
                          </div>
                          {/* Per-group rows */}
                          <div style={{display:'flex',flexDirection:'column',gap:8}}>
                            {groupBreakdown.map(g => {
                              const pct = Math.round((g.count/history.length)*100)
                              return (
                                <div key={g.id}>
                                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                                    <div style={{width:8,height:8,borderRadius:'50%',background:g.hex,flexShrink:0}}/>
                                    <span style={{fontSize:12,fontWeight:700,color:'#374151',flex:1}}>{shortLbl(g.label)}</span>
                                    <span style={{fontSize:13,fontWeight:900,color:g.hex,fontVariantNumeric:'tabular-nums',minWidth:20,textAlign:'right'}}>{g.count}</span>
                                  </div>
                                  <div style={{height:4,background:'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                                    <div style={{height:'100%',width:`${pct}%`,background:g.hex,borderRadius:99,transition:'width .8s ease'}}/>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Quick launch */}
                  <div style={{marginBottom:24}}>
                    <div className="dh-lbl">Quick Launch</div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {ACTIVE_MODES.map(m=>(
                        <button key={m.id} onClick={()=>onStartTest(m.id)}
                          style={{display:'flex',gap:13,padding:'13px 14px',borderRadius:13,border:'1.5px solid #f0f0f0',background:'#fff',cursor:'pointer',transition:'all .15s',textAlign:'left',alignItems:'flex-start',width:'100%'}}
                          onMouseOver={e=>{e.currentTarget.style.borderColor='#fec9b0';e.currentTarget.style.background='#fffaf8';e.currentTarget.style.boxShadow='0 2px 12px rgba(255,101,63,.10)'}}
                          onMouseOut={e=>{e.currentTarget.style.borderColor='#f0f0f0';e.currentTarget.style.background='#fff';e.currentTarget.style.boxShadow='none'}}>
                          <span className={`${m.bg} rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                            style={{width:38,height:38,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <m.Icon/>
                          </span>
                          <span style={{display:'flex',flexDirection:'column',gap:3,minWidth:0}}>
                            <span style={{fontSize:13,fontWeight:800,color:'#111827',lineHeight:1.2}}>{m.label}</span>
                            <span style={{fontSize:11.5,color:'#9ca3af',lineHeight:1.55,fontWeight:500}}>{m.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Your exam */}
                  {hasChosenExam && (
                    <div style={{marginBottom:24}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                        <div className="dh-lbl" style={{margin:0}}>Your Exam</div>
                        <button onClick={()=>setChangingExam(v=>!v)}
                          style={{fontSize:11,fontWeight:700,color:'#FF653F',background:'none',border:'none',cursor:'pointer',padding:0}}>
                          {changingExam?'Done':'Change'}
                        </button>
                      </div>
                      {changingExam ? (
                        <div>
                          {(isPro?ACTIVE_GROUPS:ACTIVE_GROUPS.filter(g=>g.id===selectedGroup.id)).map(g=>(
                            <div key={g.id} style={{marginBottom:12}}>
                              <div style={{fontSize:10,fontWeight:700,color:'#b0b8c4',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>{g.label}</div>
                              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                                {g.exams.map(e=>(
                                  <button key={e.id} onClick={()=>handleChangeExam(e.id)} className={`dh-pill ${e.id===selectedExamId?'active':''}`}>
                                    {e.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          {!isPro && (
                            <button onClick={()=>onNav?.('subscriptions')}
                              style={{marginTop:4,fontSize:11.5,fontWeight:700,color:'#FF653F',background:'none',border:'none',cursor:'pointer',padding:0}}>
                              Unlock more exams →
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                          {visibleGroupExams.map(e=>(
                            <button key={e.id} onClick={()=>onStartTest('mock',e.id)}
                              className={`dh-pill ${e.id===selectedExamId?'active':''}`}
                              style={{width:'100%',justifyContent:'center',textAlign:'center'}}>
                              {e.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Study plan */}
                  {savedPlan && (() => {
                    const days=savedPlan.days||[]
                    const total=days.length
                    const completed=Object.values(completedDays).filter(Boolean).length
                    const pct=total?Math.round((completed/total)*100):0
                    const next=days.filter(d=>!completedDays[d.day])[0]
                    return (
                      <div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                          <div className="dh-lbl" style={{margin:0}}>Study Plan</div>
                          <button onClick={()=>setActiveTab('studyplan')}
                            style={{fontSize:11,fontWeight:700,color:'#FF653F',background:'none',border:'none',cursor:'pointer',padding:0}}>
                            View →
                          </button>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <div style={{flex:1,height:3,background:'#ebebeb',borderRadius:99,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${pct}%`,background:'#FF653F',borderRadius:99,transition:'width .5s'}}/>
                          </div>
                          <span style={{fontSize:11.5,fontWeight:800,color:'#374151'}}>{pct}%</span>
                        </div>
                        <div style={{fontSize:11,color:'#b0b8c4',marginBottom:8}}>{completed}/{total} days · {total-completed} remaining</div>
                        {next && (
                          <div style={{fontSize:12,fontWeight:600,color:'#374151',lineHeight:1.5}}>
                            Up next: {(next.topics||[]).slice(0,2).join(', ')||'Study session'}
                            <span style={{fontSize:11,color:'#b0b8c4',display:'block'}}>{next.date} · {next.duration}</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </>}

            {/* ── PRACTICE tab ── */}
            {activeTab === 'practice' && <>
              <h2 className="text-xl font-black text-gray-900 mb-1">Practice</h2>
              <p className="text-sm text-gray-500 mb-6">Choose a mode and launch your test</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {ACTIVE_MODES.map(m => (
                  <button key={m.id} onClick={() => onStartTest(m.id)}
                    className="text-left bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all group"
                    onMouseOver={e=>e.currentTarget.style.borderColor='#fec9b0'}
                    onMouseOut={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                    <div className={`w-11 h-11 ${m.bg} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform`}><m.Icon /></div>
                    <div className="font-bold text-gray-900 text-sm mb-1">{m.label}</div>
                    <div className="text-xs text-gray-500 leading-relaxed mb-3">{m.desc}</div>
                    <span className={`text-xs font-bold ${m.text}`}>Start now →</span>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {ACTIVE_GROUPS.map(g => (
                  <div key={g.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className={`bg-gradient-to-r ${g.color} px-5 py-3 flex items-center justify-between`}>
                      <span className="font-bold text-white text-sm">{g.label}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                      {g.exams.map((e, i) => (
                        <div key={e.id} className={`p-4 flex flex-col gap-2 ${i>=2?'border-t sm:border-t-0 border-gray-100':''}`}>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{e.name}</span>
                            {e.tag && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${e.tagColor||'bg-gray-100 text-gray-500'}`}>{e.tag}</span>}
                          </div>
                          <span className="text-xs text-gray-400">{e.sub}</span>
                          <button onClick={() => onStartTest('mock', e.id)}
                            className="mt-auto text-xs font-bold text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-600 hover:text-white transition-all text-center">
                            Launch
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {/* ── EXPLORE EXAMS tab — list → exam detail (pricing + start mock) ── */}
            {activeTab === 'explore' && (() => {
              const groupOf = (id) => ACTIVE_GROUPS.find(g => g.exams.some(e => e.id === id))
              const grp  = exploreExam ? groupOf(exploreExam) : null
              const exam = grp ? grp.exams.find(e => e.id === exploreExam) : null
              const cut  = grp ? (CUTOFF_BY_GROUP[grp.id] || CUTOFF_BY_GROUP.ibps) : null
              const qOf  = (sub='') => (sub.match(/(\d+)\s*Q/)||[])[1] || '—'
              const mOf  = (sub='') => (sub.match(/(\d+)\s*min/)||[])[1] || '—'
              const userPlan = (user?.user_metadata?.plan || user?.user_metadata?.subscription || '').toLowerCase()
              const fmtTopic = t => String(t||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
              const SEC_COLORS = ['#1d4ed8','#7c3aed','#0891b2','#d97706','#16a34a','#e11d48']
              const TOPIC_COLORS = ['#FF653F','#1d4ed8','#7c3aed','#0891b2','#d97706','#16a34a','#e11d48','#db2777','#0d9488','#9333ea','#ca8a04','#2563eb']
              const cutExam = exploreExam ? CUTOFF_EXAMS.find(e => e.id === (CUTOFF_ID_MAP[exploreExam] || exploreExam)) : null
              const cutRows = cutExam ? cutExam.rows.slice(0, 2) : []
              return (
              <div>
                {!exam ? (
                  /* ── SINGLE-SCREEN EXPLORE ── */
                  <>
                    <h2 className="text-xl font-black text-gray-900 mb-1">Explore Exams</h2>
                    <p className="text-sm text-gray-500 mb-5">Select a category then click any exam to start a mock test</p>

                    {/* Category filter tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button onClick={()=>setActiveExploreGroup(null)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all"
                        style={!activeExploreGroup
                          ? {background:'#FF653F',color:'#fff',borderColor:'#FF653F'}
                          : {color:'#6b7280',borderColor:'#e5e7eb',background:'#fff'}}>
                        All Exams
                      </button>
                      {ACTIVE_GROUPS.map(g => (
                        <button key={g.id} onClick={()=>setActiveExploreGroup(g.id)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all"
                          style={activeExploreGroup===g.id
                            ? {background:g.hex,color:'#fff',borderColor:g.hex}
                            : {color:'#6b7280',borderColor:'#e5e7eb',background:'#fff'}}>
                          {g.label.replace(' Exams','')}
                        </button>
                      ))}
                    </div>

                    {/* Exam cards — filtered by selected category */}
                    {(activeExploreGroup
                      ? ACTIVE_GROUPS.filter(g=>g.id===activeExploreGroup)
                      : ACTIVE_GROUPS
                    ).map(g => (
                      <div key={g.id} className="mb-6">
                        {!activeExploreGroup && (
                          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:g.hex }}>{g.label}</div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {g.exams.map(e => (
                            <button key={e.id}
                              onClick={() => { onStartTest('mock', e.id); window.scrollTo(0,0) }}
                              className="text-left border rounded-xl p-3 hover:shadow-md transition-all"
                              style={{ background:`${g.hex}0D`, borderColor:`${g.hex}33`, borderLeftColor:g.hex, borderLeftWidth:4 }}>
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[13px] font-bold leading-tight" style={{ color:g.hex }}>{e.name}</span>
                                {e.tag && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 text-white" style={{ background:g.hex }}>{e.tag}</span>}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-1">{e.sub}</div>
                              <div className="text-[11px] font-semibold mt-1.5" style={{ color:'#FF653F' }}>Start Test →</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  /* ── DETAIL (tabbed) — no outer card padding so it aligns edge-to-edge like the exam list ── */
                  <div className="mb-4">
                    {/* Title + Back */}
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-gray-900">{grp.label.replace(' Exams','')} {exam.name}</h2>
                        {exam.tag && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:`${grp.hex}18`, color:grp.hex }}>{exam.tag}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={()=>onStartTest('mock', exam.id)}
                          className="text-xs font-bold text-white rounded-lg px-4 py-1.5 hover:shadow-md transition-all whitespace-nowrap"
                          style={{ background:'#FF653F' }}
                          onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                          onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                          Start Mock Test →
                        </button>
                        <button onClick={()=>{ setExploreExam(null); window.scrollTo(0,0) }}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                          ← Back to exams
                        </button>
                      </div>
                    </div>

                    {/* Quick summary — single compact box */}
                    <div className="inline-flex items-center gap-3 flex-wrap text-xs mb-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
                      <span className="text-gray-600"><b className="text-orange-600">{blueprint?.total_questions||qOf(exam.sub)}</b> Questions</span>
                      <span className="text-orange-200">·</span>
                      <span className="text-gray-600"><b className="text-blue-600">{blueprint?.total_time_mins||mOf(exam.sub)} min</b> Duration</span>
                      <span className="text-orange-200">·</span>
                      <span className="text-gray-600"><b className="text-red-600">-{blueprint?.negative??0.25}</b> Negative marking</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-gray-100 mb-4 overflow-x-auto">
                      {[['overview','Overview'],['cutoff','Cut-off Marks']].map(([id,label])=>(
                        <button key={id} onClick={()=>setExploreTab(id)}
                          className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${exploreTab===id?'text-orange-600':'border-transparent text-gray-500 hover:text-gray-800'}`}
                          style={exploreTab===id?{borderColor:'#FF653F'}:{}}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* OVERVIEW — topic-wise chapters, marks + per-section circle ── */}
                    {exploreTab==='overview' && (
                      bpLoading ? <p className="text-xs text-gray-400 text-center py-8">Loading syllabus…</p>
                      : blueprint?.sections?.length ? (
                        <div className="space-y-4">
                          {blueprint.sections.map((s,si)=>{
                            const data = s.topics.filter(t=>t.count>0).map((t,j)=>({ name:fmtTopic(t.topic), value:t.count, color:TOPIC_COLORS[j%TOPIC_COLORS.length] }))
                            return (
                              <div key={s.section} className="border border-gray-200 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-bold" style={{ color:SEC_COLORS[si%SEC_COLORS.length] }}>{s.label}</span>
                                  <span className="text-xs font-semibold text-gray-400">{s.count} marks{s.minutes?` · ${s.minutes} min`:''}</span>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
                                  <div className="w-44 h-44 flex-shrink-0 mx-auto lg:mx-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart margin={{ top:14, right:14, bottom:14, left:14 }}>
                                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={34} outerRadius={56} paddingAngle={1} labelLine={false} label={({value})=>value}>
                                          {data.map((d,j)=><Cell key={j} fill={d.color}/>)}
                                        </Pie>
                                        <Tooltip/>
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                  <div className="flex-1 min-w-0 lg:pl-24">
                                    <table className="w-full text-xs table-fixed">
                                      <thead>
                                        <tr className="text-gray-400 border-b border-gray-100">
                                          <th className="text-left   font-bold py-2">Topic / Chapter</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20">Marks</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20 text-green-600">Easy</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20 text-amber-600">Med</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20 text-red-600">Hard</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {s.topics.filter(t=>t.count>0).map((t,j)=>(
                                          <tr key={t.topic} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2 pr-2 font-medium text-gray-700">
                                              <span className="flex items-start gap-2">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background:TOPIC_COLORS[j%TOPIC_COLORS.length] }}/>
                                                <span className="leading-snug">{fmtTopic(t.topic)}</span>
                                              </span>
                                            </td>
                                            <td className="py-2 text-center font-bold text-gray-900">{t.count}</td>
                                            <td className="py-2 text-center font-semibold text-green-600">{t.easy||0}</td>
                                            <td className="py-2 text-center font-semibold text-amber-600">{t.medium||0}</td>
                                            <td className="py-2 text-center font-semibold text-red-600">{t.hard||0}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {ACTIVE_TOPIC_GROUPS.map(group => (
                            <div key={group.section}>
                              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color:group.color }}>{group.section}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {group.topics.map(t => (
                                  <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background:`${group.color}14`, color:group.color }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* CUT-OFF MARKS — last two recent years ── */}
                    {exploreTab==='cutoff' && (
                      cutRows.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[420px] text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500">
                                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Year</th>
                                {['UR','OBC','EWS','SC','ST','PwBD'].map(c=>(
                                  <th key={c} className="font-bold px-3 py-2.5 text-center whitespace-nowrap">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {cutRows.map((r,i)=>(
                                <tr key={r.year} className={i<cutRows.length-1?'border-b border-gray-100':''}>
                                  <td className="px-4 py-2.5 font-bold text-gray-900 whitespace-nowrap">{r.year}</td>
                                  {['UR','OBC','EWS','SC','ST','PwBD'].map(c=>(
                                    <td key={c} className="px-3 py-2.5 text-center font-semibold whitespace-nowrap" style={{ color:c==='UR'?'#FF653F':'#374151' }}>{r[c]??'—'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-xs text-gray-400 mt-3">⚠ Indicative figures. Out of {cutExam?.total} marks · actual cut-offs are released state-wise and vary each year.</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-8">Cut-off data not available for this exam yet.</p>
                      )
                    )}

                  </div>
                )}
              </div>
              )
            })()}

            {/* ── STUDY PLANNER tab ── */}
            {activeTab === 'studyplan' && (
              <div>
                {/* Loading state — only show if still fetching AND no plan loaded yet */}
                {planLoading && !savedPlan ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"/>
                      <div className="text-sm text-gray-500">Loading your study plan...</div>
                    </div>
                  </div>
                ) : savedPlan && !showPlanBuilder ? (
                  <PlanScheduleView
                    plan={savedPlan}
                    onStartTest={onStartTest}
                    onTopicPractice={(topic) => {
                      /* Route to HomeScreen in topic mode, pass topic as examId so
                         HomeScreen/ExamScreen can pre-select it */
                      onStartTest('topic', topic)
                    }}
                    onRebuild={() => { setShowPlanBuilder(true); setGeneratedPlan(null) }}
                    todayStr={today}
                  />
                ) : (
                  /* ── Plan builder form ── */
                  <div className="w-full">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Study Planner</h2>
                      <p className="text-sm text-gray-500 mt-1.5 max-w-2xl mx-auto">
                        Tell us your exam date and how many hours you can give each day — we'll turn it into a clear,
                        day-by-day schedule with built-in mock tests and revision, so you always know what to study next.
                      </p>
                      {savedPlan && (
                        <button onClick={()=>setShowPlanBuilder(false)}
                          className="mt-3 text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                          ← View My Plan
                        </button>
                      )}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4 items-start">

                    {/* ════ LEFT column: exam + weak topics ════ */}
                    <div>
                    {/* Exam selector — tabbed by category */}
                    {(() => {
                      const activeGrp = ACTIVE_GROUPS.find(g => g.id === planExamTab) || ACTIVE_GROUPS[0]
                      return (
                      <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                          <DIcGrad s={18} c='#374151'/>
                          <span className="text-sm font-bold text-gray-900">Select your target exam</span>
                          {planExam && (() => {
                            const g = ACTIVE_GROUPS.find(gr => gr.exams.find(e => e.id === planExam))
                            const e = g?.exams.find(e => e.id === planExam)
                            return e ? (
                              <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full" style={{background:`${g.hex}18`,color:g.hex}}>
                                ✓ {e.name}
                              </span>
                            ) : null
                          })()}
                        </div>
                        {/* Category tabs — scrollable */}
                        <div style={{overflowX:'auto',scrollbarWidth:'none',borderBottom:'1px solid #f3f4f6'}}>
                          <div style={{display:'flex',minWidth:'max-content',padding:'0 16px'}}>
                            {ACTIVE_GROUPS.map(g => {
                              const isTab = (planExamTab||ACTIVE_GROUPS[0].id) === g.id
                              const hasSelected = g.exams.some(e => e.id === planExam)
                              return (
                                <button key={g.id}
                                  onClick={() => setPlanExamTab(g.id)}
                                  style={{
                                    padding:'10px 14px',
                                    fontSize:12,fontWeight:700,
                                    whiteSpace:'nowrap',
                                    border:'none',background:'transparent',cursor:'pointer',
                                    borderBottom: isTab ? `2.5px solid ${g.hex}` : '2.5px solid transparent',
                                    color: isTab ? g.hex : hasSelected ? g.hex : '#9ca3af',
                                    transition:'all .12s',
                                    position:'relative',
                                  }}>
                                  {g.label.replace(' Exams','').replace(' Exam','')}
                                  {hasSelected && !isTab && (
                                    <span style={{position:'absolute',top:8,right:6,width:6,height:6,borderRadius:'50%',background:g.hex}}/>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        {/* Exam chips for selected category */}
                        <div style={{padding:'14px 16px'}}>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
                            {activeGrp.exams.map(e => {
                              const sel = planExam === e.id
                              return (
                                <button key={e.id} onClick={() => setPlanExam(e.id)}
                                  style={{
                                    padding:'8px 10px',
                                    borderRadius:10,
                                    fontSize:12,fontWeight:600,
                                    border:`1.5px solid ${sel ? activeGrp.hex : activeGrp.hex+'40'}`,
                                    background: sel ? activeGrp.hex : `${activeGrp.hex}0d`,
                                    color: sel ? '#fff' : activeGrp.hex,
                                    textAlign:'left',cursor:'pointer',
                                    transition:'all .12s',
                                    lineHeight:1.3,
                                  }}>
                                  <div>{e.name}</div>
                                  {e.sub && <div style={{fontSize:10,opacity:.7,marginTop:2,fontWeight:500}}>{e.sub}</div>}
                                </button>
                              )
                            })}
                          </div>
                          {/* Count hint */}
                          <div style={{marginTop:10,fontSize:11,color:'#9ca3af',fontWeight:500}}>
                            {activeGrp.exams.length} exam{activeGrp.exams.length!==1?'s':''} in {activeGrp.label}
                          </div>
                        </div>
                      </div>
                      )
                    })()}

                    {/* Weak topics */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DIcBolt s={16} c='#374151'/>
                          <div>
                            <span className="text-sm font-bold text-gray-900">Select and arrange weak topics</span>
                            <p className="text-xs text-gray-400 mt-0.5">These get extra days in your plan · {weakTopics.length} selected</p>
                          </div>
                        </div>
                        {weakTopics.length > 0 && (
                          <button onClick={() => setWeakTopics([])} className="text-xs text-red-500 font-semibold">Clear all</button>
                        )}
                      </div>
                      {(() => {
                        const sections = ACTIVE_TOPIC_GROUPS.map(group => (
                          <div key={group.section}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:group.color}}>{group.section}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {group.topics.map(t => {
                                const sel = weakTopics.includes(t)
                                return (
                                  <button key={t} onClick={() => toggleTopic(t)}
                                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-sm text-center truncate"
                                    style={sel
                                      ? {borderColor:group.color, background:group.color, color:'#fff'}
                                      : {borderColor:`${group.color}40`, background:`${group.color}12`, color:group.color}}>
                                    {t}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))
                        return (<>
                          {/* Mobile: tap to expand */}
                          <details className="sm:hidden border-t border-gray-100">
                            <summary className="px-5 py-3 text-sm font-semibold text-blue-600 cursor-pointer select-none list-none flex items-center justify-between">
                              <span>{weakTopics.length ? `${weakTopics.length} topic${weakTopics.length>1?'s':''} selected` : 'Tap to choose weak topics'}</span>
                              <span className="text-gray-400">▾</span>
                            </summary>
                            <div className="px-5 pb-4 space-y-4">{sections}</div>
                          </details>
                          {/* Desktop: always shown */}
                          <div className="hidden sm:block px-5 py-4 space-y-4">{sections}</div>
                        </>)
                      })()}
                    </div>
                    </div>

                    {/* ════ RIGHT column: dates + per-day study hours ════ */}
                    <div>
                    {/* Date range */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <DIcCal s={18} c='#374151'/>
                          <span className="text-sm font-bold text-gray-900">Choose your start and end dates</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-6">Based on your selections, we'll evenly distribute topics across your plan</p>
                      </div>
                      <div className="px-5 py-4">
                        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 focus-within:border-blue-500">
                          <div className="flex-1 px-3 py-2.5">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start date</label>
                            <input type="date" min={today} max={startMax || undefined} value={startDate} onChange={e=>setStartDate(e.target.value)}
                              className="w-full text-sm text-gray-700 bg-transparent outline-none border-0 p-0"/>
                          </div>
                          <div className="flex-1 px-3 py-2.5">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">End date <span className="text-gray-300 font-normal">{(!isPro && trialActive) ? `(within your ${trialDaysLeft}-day trial)` : '(max 7 days)'}</span></label>
                            <input type="date" min={minEnd} max={maxEnd || undefined} value={endDate} onChange={e=>setEndDate(e.target.value)}
                              className="w-full text-sm text-gray-700 bg-transparent outline-none border-0 p-0"/>
                          </div>
                        </div>
                        {startDate && endDate && (
                          <p className="text-xs text-blue-600 font-semibold mt-2">
                            {Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24))} calendar days · {studyDays.length} study days/week selected
                          </p>
                        )}
                        {(!startDate || !endDate) && (
                          <p className="text-xs text-gray-400 mt-2">Pick both a start and end date to enable Create Plan.</p>
                        )}
                      </div>
                    </div>

                    {/* Study days + per-day hours (checkbox · slider · hh:mm) */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          <span className="text-sm font-bold text-gray-900">Select your study days and hours</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400">hh:mm</span>
                      </div>
                      <div className="px-5 py-4 space-y-2.5">
                        {WEEK_DISPLAY.map(d => {
                          const on  = studyDays.includes(d)
                          const hrs = on ? (Number(dayHours[d]) || 0) : 0
                          const hh  = String(Math.floor(hrs)).padStart(2,'0')
                          const mm  = String(Math.round((hrs % 1) * 60)).padStart(2,'0')
                          return (
                            <div key={d} className="flex items-center gap-3">
                              <label className="flex items-center gap-2 w-16 flex-shrink-0 cursor-pointer">
                                <input type="checkbox" checked={on} onChange={()=>toggleDay(d)} className="w-4 h-4 accent-sky-400"/>
                                <span className={`text-sm font-semibold ${on?'text-gray-900':'text-gray-400'}`}>{d}</span>
                              </label>
                              <input type="range" min="0" max="12" step="0.5" value={hrs} disabled={!on}
                                onChange={e=>setDayHour(d, Number(e.target.value))}
                                className="flex-1 accent-sky-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"/>
                              <span className={`w-14 text-right text-sm font-mono ${on?'text-sky-500 font-bold':'text-gray-300'}`}>{hh}:{mm}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mark off unavailable days */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                        <span style={{fontSize:16}}>🚫</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900">Mark off unavailable days</div>
                          <div className="text-xs text-gray-400 mt-0.5">Tap any study day to block it — no tasks will be scheduled for those days</div>
                        </div>
                        {blockedDates.length > 0 && (
                          <button onClick={()=>setBlockedDates([])}
                            className="text-xs font-semibold flex-shrink-0"
                            style={{color:'#ef4444'}}>
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="px-5 py-4">
                        {(!startDate || !endDate) ? (
                          <p className="text-xs text-gray-400">Pick your start and end dates first.</p>
                        ) : (() => {
                          const pills = []
                          const s = new Date(startDate)
                          const e = new Date(endDate)
                          for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
                            const dateStr  = d.toISOString().split('T')[0]
                            const dow      = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
                            const isStudy  = studyDays.includes(dow)
                            const blocked  = blockedDates.includes(dateStr)
                            const dayName  = d.toLocaleDateString('en-IN',{weekday:'short'})
                            const dayNum   = d.getDate()
                            const monthAb  = d.toLocaleDateString('en-IN',{month:'short'})
                            pills.push(
                              <button key={dateStr}
                                onClick={()=>isStudy && toggleBlockedDate(dateStr)}
                                title={isStudy ? (blocked ? 'Click to unblock' : 'Click to block') : 'Not a study day'}
                                style={{
                                  position:'relative',
                                  padding:'8px 12px',
                                  borderRadius:10,
                                  textAlign:'center',
                                  minWidth:52,
                                  cursor: isStudy ? 'pointer' : 'default',
                                  border: `1.5px solid ${blocked ? '#fca5a5' : isStudy ? '#e5e7eb' : '#f3f4f6'}`,
                                  background: blocked ? '#fee2e2' : isStudy ? '#f9fafb' : '#fafafa',
                                  color: blocked ? '#ef4444' : isStudy ? '#374151' : '#d1d5db',
                                  transition:'all .12s',
                                  opacity: isStudy ? 1 : 0.5,
                                }}>
                                <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',
                                  textDecoration: blocked ? 'line-through' : 'none'}}>
                                  {dayName}
                                </div>
                                <div style={{fontSize:15,fontWeight:900,lineHeight:1.1,marginTop:2,
                                  textDecoration: blocked ? 'line-through' : 'none'}}>
                                  {dayNum}
                                </div>
                                <div style={{fontSize:9,color: blocked ? '#f87171' : '#9ca3af',marginTop:1}}>
                                  {monthAb}
                                </div>
                                {blocked && (
                                  <div style={{position:'absolute',top:-5,right:-5,width:16,height:16,
                                    background:'#ef4444',borderRadius:'50%',
                                    display:'flex',alignItems:'center',justifyContent:'center',
                                    fontSize:9,fontWeight:900,color:'#fff',border:'1.5px solid #fff'}}>
                                    ✕
                                  </div>
                                )}
                                {!isStudy && (
                                  <div style={{fontSize:8,color:'#d1d5db',marginTop:1}}>Off</div>
                                )}
                              </button>
                            )
                          }
                          return (
                            <div>
                              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{pills}</div>
                              {blockedDates.length > 0 && (
                                <div style={{marginTop:12,fontSize:12,fontWeight:600,color:'#d97706',
                                  display:'flex',alignItems:'center',gap:5}}>
                                  <span>⚠️</span>
                                  {blockedDates.length} day{blockedDates.length>1?'s':''} blocked — plan will skip {blockedDates.length>1?'them':'it'}.
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Catch-up buffer days */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-4 flex items-start gap-3">
                        <div style={{paddingTop:1}}>
                          <input type="checkbox" id="catchup-toggle" checked={catchupEnabled}
                            onChange={e=>setCatchupEnabled(e.target.checked)}
                            style={{width:16,height:16,accentColor:'#6366f1',cursor:'pointer'}}/>
                        </div>
                        <label htmlFor="catchup-toggle" style={{cursor:'pointer',flex:1}}>
                          <div className="text-sm font-bold text-gray-900 leading-none mb-1">Add catch-up buffer days</div>
                          <div className="text-xs text-gray-400">Reserved days to catch up on overdue topics — no new content is scheduled</div>
                        </label>
                        {catchupEnabled && (
                          <select value={catchupEvery} onChange={e=>setCatchupEvery(Number(e.target.value))}
                            className="text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 outline-none flex-shrink-0"
                            style={{cursor:'pointer'}}>
                            <option value={2}>Every 2 days</option>
                            <option value={3}>Every 3 days</option>
                            <option value={4}>Every 4 days</option>
                            <option value={5}>Every 5 days</option>
                            <option value={7}>Every 7 days</option>
                          </select>
                        )}
                      </div>
                      {catchupEnabled && (
                        <div style={{margin:'0 16px 14px',padding:'10px 12px',borderRadius:8,
                          background:'#f0f0ff',border:'1px solid #e0e0ff',
                          fontSize:11,color:'#6366f1',fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
                          <span>📅</span>
                          A buffer day is inserted every {catchupEvery} scheduled days. No new topics — just time to catch up.
                        </div>
                      )}
                    </div>
                    </div>

                    </div>{/* ── end two-column grid ── */}

                    {/* Single action — Create Plan generates AND saves */}
                    <div className="mb-6">
                      <button onClick={handleGeneratePlan}
                        disabled={!startDate||!endDate||!studyDays.length||planSaving}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                          planSaved ? 'bg-green-600 text-white'
                          : (startDate&&endDate&&studyDays.length)
                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        {planSaving ? 'Creating your plan…' : planSaved ? '✓ Plan created — View below' : 'Create Plan'}
                      </button>
                    </div>

                    {/* Preview of generated plan */}
                    {generatedPlan && (
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                          {[
                            {label:'Scheduled', value:generatedPlan.scheduledDays, icon:<DIcCal s={20} c='#2563eb'/>,    cls:'text-blue-600'},
                            {label:'Study days',value:generatedPlan.studyDays,     icon:<DIcBook s={20} c='#7c3aed'/>,   cls:'text-violet-600'},
                            {label:'Mocks',     value:generatedPlan.mockDays,      icon:<DIcDoc s={20} c='#0891b2'/>,    cls:'text-cyan-600'},
                            {label:'Revision',  value:generatedPlan.revisionDays,  icon:<DIcRepeat s={20} c='#16a34a'/>, cls:'text-green-600'},
                          ].map(c=>(
                            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                              <div className="mb-1 flex justify-center">{c.icon}</div>
                              <div className={`text-xl font-black ${c.cls}`}>{c.value}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 text-center mb-2">Save the plan to see your full day-by-day schedule ↑</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── MY RESULTS tab — performance graphs + every attempt ── */}
            {activeTab === 'results' && (() => {
              const fmtTopic = t => String(t||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
              const SEC_LABEL = {
                english:'English', numerical_ability:'Numerical', quantitative_aptitude:'Quant',
                reasoning:'Reasoning', reasoning_computer_aptitude:'Reasoning+Comp',
                general_financial_awareness:'GA', general_awareness:'GA',
                data_analysis_interpretation:'DI', general_economy_banking:'GA', general_english:'English',
              }
              const chrono = [...history].reverse()
              const scoreTrend = chrono.map((r,i) => ({
                name: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : `T${i+1}`,
                score: Math.round(Number(r.percentage)||0),
                readiness: Math.round(Number(r.exam_readiness)||0),
              }))
              const secAgg = {}
              history.forEach(r => Object.entries(r.section_scores||{}).forEach(([sec,v])=>{
                const acc = v?.accuracy!=null ? v.accuracy : (v?.total ? (v.correct/v.total*100) : 0)
                if(!secAgg[sec]) secAgg[sec]={sum:0,n:0}; secAgg[sec].sum+=acc; secAgg[sec].n+=1
              }))
              const sectionData = Object.entries(secAgg).map(([sec,a])=>({ section: SEC_LABEL[sec]||sec, accuracy: Math.round(a.sum/a.n) }))
              const topAgg = {}
              history.forEach(r => (r.weak_topics||[]).forEach(w=>{
                const name = w?.topic||w?.name; if(!name) return
                const acc = Number(w?.accuracy)||0
                if(!topAgg[name]) topAgg[name]={sum:0,n:0}; topAgg[name].sum+=acc; topAgg[name].n+=1
              }))
              const weakData = Object.entries(topAgg)
                .map(([t,a])=>({ topic: fmtTopic(t), accuracy: Math.round(a.sum/a.n) }))
                .sort((x,y)=>x.accuracy-y.accuracy).slice(0,6)

              return (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">My Results</h2>
                <p className="text-sm text-gray-500 mb-6">Your performance trends and every attempt in one place</p>

                {history.length < 1 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                    <div className="mb-3 flex justify-center"><DIcChart s={40} c='#9ca3af'/></div>
                    <div className="text-sm font-bold text-gray-900 mb-1">No data yet</div>
                    <div className="text-xs text-gray-500 mb-4">Take a topicwise test or mock test to unlock your progress graphs.</div>
                    <button onClick={()=>onStartTest()} className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl">
                      Take a test →
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Score & readiness trend */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:col-span-2">
                      <div className="text-sm font-bold text-gray-900 mb-3">Score &amp; readiness trend</div>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={scoreTrend} margin={{top:5,right:20,left:-10,bottom:5}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3"/>
                          <XAxis dataKey="name" tick={{fontSize:11}}/>
                          <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                          <Tooltip/>
                          <Line type="monotone" dataKey="score"     name="Score %"     stroke="#FF653F" strokeWidth={2} dot={{r:3}}/>
                          <Line type="monotone" dataKey="readiness" name="Readiness %" stroke="#7048E8" strokeWidth={2} dot={{r:3}}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Section accuracy radar */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-sm font-bold text-gray-900 mb-3">Section-wise accuracy (avg)</div>
                      {sectionData.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <RadarChart data={sectionData} outerRadius={90}>
                            <PolarGrid stroke="#eef0f3"/>
                            <PolarAngleAxis dataKey="section" tick={{fontSize:11}}/>
                            <Radar dataKey="accuracy" stroke="#FF653F" fill="#FF653F" fillOpacity={0.35}/>
                            <Tooltip/>
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-xs text-gray-400 text-center py-16">No section data yet.</p>}
                    </div>

                    {/* Weakest topics */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-sm font-bold text-gray-900 mb-3">Weakest topics (avg accuracy)</div>
                      {weakData.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={weakData} layout="vertical" margin={{top:5,right:20,left:10,bottom:5}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3"/>
                            <XAxis type="number" domain={[0,100]} tick={{fontSize:11}}/>
                            <YAxis type="category" dataKey="topic" width={120} tick={{fontSize:11}}/>
                            <Tooltip/>
                            <Bar dataKey="accuracy" fill="#f59e0b" radius={[0,4,4,0]}/>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-xs text-gray-400 text-center py-16">No weak-topic data yet — take a test to see this.</p>}
                    </div>
                  </div>

                  {/* Every attempt — click to review */}
                  <div className="text-sm font-bold text-gray-900 mb-3">All attempts</div>
                  <div className="space-y-3">
                    {history.map((r,i)=>{
                      const pct  = Number(r.percentage||0)
                      const name = (() => {
                        const toTitle = s => (s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
                        if (r.test_type === 'topic_diagnostic') return `Topicwise Test${r.topic ? ` — ${toTitle(r.topic)}` : ''}`
                        if (r.test_type === 'mini' || r.test_type === 'concept_mini') return `Practice Test${r.topic ? ` — ${toTitle(r.topic)}` : r.section ? ` — ${toTitle(r.section)}` : ''}`
                        return `Mock Test — ${toTitle(r.exam) || 'Bank Clerk Prelims'}`
                      })()
                      const date = new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
                      const pass = pct >= 40
                      return (
                        <button key={r.id||i} onClick={()=>onOpenResult?.(r)}
                          className="w-full text-left bg-white border border-gray-200 rounded-xl flex items-center gap-4 px-5 py-4 hover:shadow-md hover:border-gray-300 transition-all">
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${pass?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>
                            <span className="text-sm font-black">{pct.toFixed(0)}%</span>
                            <span className="text-xs opacity-60">{pass?'Pass':'Fail'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900">{name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{date} · {r.correct_count||0} correct · {r.wrong_count||0} wrong · {r.skipped_count||0} skipped</div>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{color:'#FF653F'}}>Review →</span>
                        </button>
                      )
                    })}
                  </div>
                  </>
                )}
              </div>
              )
            })()}

            {/* ── SUBSCRIPTIONS tab ── */}
            {activeTab === 'subscriptions' && (() => {
              const RANK = { basic:1, pro:2, ultimate:3 }
              const curPlan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || '').toLowerCase()
              const expRaw   = user?.user_metadata?.plan_expires
              const expDate  = expRaw ? new Date(expRaw) : null
              const expValid = expDate && !isNaN(expDate) ? expDate : null
              const fmtD     = (d) => d.toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })
              const PLANS = [
                { name:'Basic',    price:'₹199',  per:'/month',    features:['5 mock tests / month','Topic & section practice','Basic analytics'] },
                { name:'Pro',      price:'₹499',  per:'/month',    features:['Unlimited mock tests','PDF solutions','Personalised study plan','Priority support'], highlight:true },
                { name:'Ultimate', price:'₹1199', per:'/3 months', features:['Everything in Pro','All exam categories','Performance trends','WhatsApp reminders'] },
              ]
              // Feature comparison matrix
              const CMP = [
                ['Price',                   '₹199/mo', '₹499/mo', '₹1199/3mo'],
                ['Mock tests',              '5 / month', 'Unlimited', 'Unlimited'],
                ['Topic & section practice','✓', '✓', '✓'],
                ['PDF solutions',           '✗', '✓', '✓'],
                ['Personalised study plan', '✗', '✓', '✓'],
                ['Performance trends',      'Basic', '✓', '✓'],
                ['All exam categories',     '✗', '✗', '✓'],
                ['Priority support',        '✗', '✓', '✓'],
                ['WhatsApp reminders',      '✗', '✗', '✓'],
              ]
              const cell = (v) => v === '✓' ? <span className="text-green-600 font-bold">✓</span>
                                : v === '✗' ? <span className="text-gray-300">✗</span>
                                : <span className="text-gray-700">{v}</span>
              return (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Subscriptions</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your MockTest plan</p>

                {/* Current status */}
                {isPro ? (
                  <div className="rounded-2xl p-5 mb-6 text-white" style={{ background:'linear-gradient(135deg,#FF653F 0%,#ff8a5f 100%)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold mb-1.5">● Active</div>
                        <div className="text-lg font-black">You're subscribed to the {curPlan.charAt(0).toUpperCase()+curPlan.slice(1)} plan</div>
                        <div className="text-sm text-white/90 mt-0.5">{expValid ? `Renews / expires on ${fmtD(expValid)}` : 'Subscription active'}</div>
                        {RANK[curPlan] > 1 && (
                          <div className="text-xs text-white/80 mt-2">
                            You can switch to a lower plan when this one renews{expValid ? ` on ${fmtD(expValid)}` : ''}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#FFF3EE' }}><DIcGrad s={20} c='#FF653F'/></div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{trialActive ? `You're on the free trial — ${trialDaysLeft} day${trialDaysLeft>1?'s':''} left` : "You're on the Free tier"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Upgrade for unlimited mock tests, PDF solutions & study plans.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* On the top plan (Ultimate) there's nothing to upgrade to — hide the options */}
                {curPlan === 'ultimate' ? (
                  <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center">
                    <div className="mb-1 flex justify-center"><DIcParty s={22} c='#16a34a'/></div>
                    <div className="text-base font-black text-gray-900">You're on the Ultimate plan — our highest tier</div>
                    <div className="text-sm text-gray-600 mt-1">You already have every feature. There's nothing more to upgrade.</div>
                  </div>
                ) : (<>
                {/* Unified plan comparison — headers (price + buy) sit on top of the feature rows */}
                <h3 className="text-sm font-bold text-gray-900 mb-3">Choose your plan</h3>
                <div className="overflow-x-auto -mx-1 sm:mx-0 border border-gray-200 rounded-2xl">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr>
                        <th className="p-3 sm:p-4"></th>
                        {PLANS.map(plan=>{
                          const planId  = plan.name.toLowerCase()
                          const current = isPro && curPlan === planId
                          const busy    = payingPlan === planId
                          const lower   = isPro && RANK[planId] < RANK[curPlan]
                          const hl      = plan.highlight
                          const label   = current ? '✓ Current Plan'
                                        : busy    ? 'Opening…'
                                        : lower   ? 'Included'
                                        : isPro   ? 'Upgrade →'
                                        : hl ? 'Get Started' : 'Choose Plan'
                          return (
                            <th key={plan.name} className="p-3 sm:p-4 text-center align-top border-l border-gray-100"
                              style={current?{background:'#f0fdf4'}:hl?{background:'#FFF3EE'}:{}}>
                              {/* Always reserve the tag line so every column aligns (no zigzag) */}
                              <div className="text-[10px] font-black uppercase tracking-wide mb-1 h-3.5 leading-none"
                                style={{color:current?'#16a34a':hl?'#FF653F':'transparent'}}>
                                {current ? 'Your plan' : hl ? 'Most popular' : ' '}
                              </div>
                              <div className="text-sm sm:text-base font-black text-gray-900">{plan.name}</div>
                              <div className="flex items-baseline justify-center gap-1 mt-0.5 h-8">
                                <span className="text-xl sm:text-2xl font-black" style={{color:hl?'#FF653F':'#111827'}}>{plan.price}</span>
                                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{plan.per}</span>
                              </div>
                              <button onClick={() => (!current && !lower) && handleSubscribe(plan.name)} disabled={busy || current || lower}
                                className={`mt-2 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                                  current ? 'bg-green-600 text-white cursor-default'
                                  : lower  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'text-white hover:shadow-md'} ${busy?'opacity-60 cursor-wait':''}`}
                                style={(!current && !lower) ? {background:'#FF653F'} : {}}>
                                {label}
                              </button>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {CMP.filter(r=>r[0]!=='Price').map(row=>(
                        <tr key={row[0]} className="border-t border-gray-100">
                          <td className="px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{row[0]}</td>
                          {[1,2,3].map(ci=>{
                            const planId  = ['','basic','pro','ultimate'][ci]
                            const current = isPro && curPlan === planId
                            const hl      = planId === 'pro'
                            return (
                              <td key={ci} className="px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm text-center border-l border-gray-100"
                                style={current?{background:'#f0fdf4'}:hl?{background:'#FFF8F4'}:{}}>
                                {cell(row[ci])}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>)}
              </div>
              )
            })()}

            {/* ── PROFILE tab ── */}
            {activeTab === 'profile' && (() => {
              const fieldCls = (on) => `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${on ? 'bg-white text-gray-900 focus:ring-2' : 'border-gray-200 bg-gray-50 text-gray-500'}`
              const fieldStyle = (on) => on ? { borderColor:'#FF653F' } : {}
              const examName = (id) => ALL_EXAMS_FLAT.find(e=>e.id===id)?.name
              const examLabel = (id) => { const e=ALL_EXAMS_FLAT.find(x=>x.id===id); const g=ACTIVE_GROUPS.find(gr=>gr.exams.some(x=>x.id===id)); return e? `${g?.label?.replace(' Exams','')||''} ${e.name}`.trim() : id }
              return (
              <div className="max-w-2xl">
                <h2 className="text-xl font-black text-gray-900 mb-1">Profile</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your account, exam preferences and password</p>

                {/* User Information */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{background:'#FF653F'}}>
                      {(userName[0]||'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">{userName}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                      <div className="text-xs text-green-600 font-semibold mt-1">✓ Account active</div>
                    </div>
                    <button onClick={()=>setProfileEdit(v=>!v)} className="ml-auto text-sm font-semibold" style={{color:'#FF653F'}}>
                      {profileEdit ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input value={profileName} onChange={e=>setProfileName(e.target.value)} disabled={!profileEdit}
                        className={fieldCls(profileEdit)} style={fieldStyle(profileEdit)}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                      <input value={user?.email||''} disabled className={fieldCls(false)}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile (+91)</label>
                      <input value={profilePhone} maxLength={10} onChange={e=>setProfilePhone(e.target.value.replace(/[^0-9]/g,''))} disabled={!profileEdit}
                        className={fieldCls(profileEdit)} style={fieldStyle(profileEdit)} placeholder="10-digit mobile"/>
                    </div>
                  </div>
                  {profileEdit && (
                    <button onClick={handleSaveProfile} disabled={profileSaving}
                      className="mt-5 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60" style={{background:'#FF653F'}}>
                      {profileSaving?'Saving…':'Save Changes'}
                    </button>
                  )}
                  {profileMsg && <span className="ml-3 text-sm text-green-600 font-semibold">{profileMsg}</span>}
                </div>

                {/* Educational Status */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Educational Status</h3>
                    <button onClick={()=>setEduEdit(v=>!v)} className="text-sm font-semibold" style={{color:'#FF653F'}}>
                      {eduEdit ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  {!eduEdit ? (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Target Exam</div><div className="font-semibold text-gray-900">{examLabel(profileExam)}</div></div>
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Category</div><div className="font-semibold text-gray-900">{CATEGORIES.find(c=>c.value===profileCategory)?.label||profileCategory}</div></div>
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Prep Level</div><div className="font-semibold text-gray-900 capitalize">{profileLevel||'—'}</div></div>
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">State</div><div className="font-semibold text-gray-900">{profileState||'—'}</div></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Exam</label>
                        <select value={profileExam} onChange={e=>setProfileExam(e.target.value)} className={fieldCls(true)+' cursor-pointer'} style={fieldStyle(true)}>
                          {ACTIVE_GROUPS.flatMap(g=>g.exams.map(e=>(
                            <option key={e.id} value={e.id}>{g.label.replace(' Exams','')} — {e.name}</option>
                          )))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                          <select value={profileCategory} onChange={e=>setProfileCategory(e.target.value)} className={fieldCls(true)+' cursor-pointer'} style={fieldStyle(true)}>
                            {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prep Level</label>
                          <select value={profileLevel} onChange={e=>setProfileLevel(e.target.value)} className={fieldCls(true)+' cursor-pointer'} style={fieldStyle(true)}>
                            <option value="">-- Select --</option>
                            {LEVELS.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                        <input value={profileState} onChange={e=>setProfileState(e.target.value)} className={fieldCls(true)} style={fieldStyle(true)} placeholder="e.g. Telangana"/>
                      </div>
                      <button onClick={handleSaveEdu} disabled={eduSaving}
                        className="text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60" style={{background:'#FF653F'}}>
                        {eduSaving?'Saving…':'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                      <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Min 6 chars"
                        className={fieldCls(true)} style={fieldStyle(true)}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                      <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Repeat password"
                        className={fieldCls(true)} style={fieldStyle(true)}/>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button onClick={handleChangePassword} disabled={pwdSaving || !newPwd}
                      className="text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-50" style={{background:'#FF653F'}}>
                      {pwdSaving?'Updating…':'Update Password'}
                    </button>
                    {pwdMsg && <span className={`text-sm font-semibold ${pwdMsg.startsWith('✓')?'text-green-600':'text-red-600'}`}>{pwdMsg}</span>}
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Email / Notification Preferences {notifSaving && <span className="text-xs text-gray-400 font-normal">saving…</span>}</h3>
                  {[
                    { key:'subs',  val:notifNoSubs,  label:"I don't want notifications about my subscription (renewals, service updates)." },
                    { key:'promo', val:notifNoPromo, label:"I don't want promotions about future products and special offers." },
                  ].map(n=>(
                    <label key={n.key} className="flex items-start gap-3 py-2 cursor-pointer">
                      <input type="checkbox" checked={n.val}
                        onChange={e=>handleSaveNotif(n.key==='subs'?e.target.checked:notifNoSubs, n.key==='promo'?e.target.checked:notifNoPromo)}
                        className="mt-0.5 w-4 h-4 accent-orange-500"/>
                      <span className="text-sm text-gray-600">{n.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              )
            })()}

            {/* ── BILLING tab — account & payment management (distinct from Subscriptions = plan shopping) ── */}
            {activeTab === 'billing' && (() => {
              const planLabel = isPro ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'
              const expRaw    = user?.user_metadata?.plan_expires
              const expDate   = expRaw ? new Date(expRaw) : null
              const expValid  = expDate && !isNaN(expDate) ? expDate : null
              const fmtDate   = (d) => d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
              const tier      = PLAN_TIERS.find(t => t.id === plan)
              const lastAmt   = tier?.price
              return (
              <div className="max-w-lg">
                <h2 className="text-xl font-black text-gray-900 mb-1">Billing</h2>
                <p className="text-sm text-gray-500 mb-6">Your current plan, validity and payment history</p>

                {/* Current plan status */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-gray-900">Current Plan</div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPro?'bg-green-50 text-green-600':'bg-gray-100 text-gray-500'}`}>
                      {isPro ? '● Active' : 'Free tier'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-black ${isPro?'text-orange-600':'text-gray-900'}`}>{planLabel}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isPro
                          ? (expValid ? `Renews / expires on ${fmtDate(expValid)}` : 'Active subscription')
                          : 'Limited to 5 mock tests / month · No PDF downloads'}
                      </div>
                    </div>
                    <button onClick={()=>setActiveTab('subscriptions')}
                      className="text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
                      style={{ background:'#FF653F' }}>
                      {isPro ? 'Change plan' : 'Upgrade →'}
                    </button>
                  </div>
                </div>

                {/* Payment history */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="text-sm font-bold text-gray-900 mb-4">Payment History</div>
                  {isPro ? (
                    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{planLabel} plan</div>
                        <div className="text-xs text-gray-400 mt-0.5">{expValid ? `Valid until ${fmtDate(expValid)}` : 'Active'}</div>
                      </div>
                      <div className="text-right">
                        {lastAmt && <div className="text-sm font-bold text-gray-900">{lastAmt}</div>}
                        <span className="text-xs font-semibold text-green-600">Paid</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="mb-2 flex justify-center"><DIcReceipt s={28} c='#9ca3af'/></div>
                      <div className="text-sm font-semibold text-gray-600">No payments yet</div>
                      <div className="text-xs text-gray-400 mt-1">Your invoices will appear here after you subscribe.</div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5">
                    <DIcLock s={13} c='#9ca3af'/> Payments are processed securely via Stripe.
                  </div>
                </div>
              </div>
              )
            })()}


            {/* ── WEAK AREAS tab ── */}
            {activeTab === 'weakareas' && (() => {
              const WA_SEC = {
                english:            {label:'English',            dot:'#3b82f6', emoji:'📖', tip:'Focus on reading comprehension and grammar rules.'},
                numerical_ability:  {label:'Numerical Ability',  dot:'#f59e0b', emoji:'🔢', tip:'Practise speed-math shortcuts and number series patterns.'},
                reasoning:          {label:'Reasoning',          dot:'#8b5cf6', emoji:'🧠', tip:'Solve 10 puzzles daily — syllogisms, blood relations, coding.'},
                general_awareness:  {label:'General Awareness',  dot:'#10b981', emoji:'🌐', tip:'Read one news digest per day + monthly current affairs PDFs.'},
                computer_knowledge: {label:'Computer Knowledge', dot:'#6366f1', emoji:'💻', tip:'Revise hardware basics, MS Office shortcuts and networking concepts.'},
                quantitative:       {label:'Quantitative',       dot:'#f97316', emoji:'📊', tip:'Prioritise DI sets, percentage, and profit & loss chapters.'},
                verbal:             {label:'Verbal',             dot:'#ec4899', emoji:'💬', tip:'Build vocabulary with 5 new words/day + sentence correction drills.'},
                reading:            {label:'Reading',            dot:'#0ea5e9', emoji:'📚', tip:'Do timed passage reads — aim for 250 wpm with 80%+ comprehension.'},
                math:               {label:'Math',               dot:'#84cc16', emoji:'📐', tip:'Revise formulas first, then solve 20 varied problems per topic.'},
                science:            {label:'Science',            dot:'#14b8a6', emoji:'🔬', tip:'Use concept maps and diagrams — visualise before memorising facts.'},
                other:              {label:'Other',              dot:'#9ca3af', emoji:'📋', tip:'Identify the specific subtopic and find targeted practice material.'},
              }

              const allWeakSrc = history  // all exams, all time
              const topicAgg = {}
              allWeakSrc.forEach(r => {
                ;(r.weak_topics || []).forEach(w => {
                  const topic   = typeof w==='string' ? w : (w?.topic||w?.name||'')
                  const section = (typeof w==='string' ? 'other' : w?.section) || 'other'
                  const acc     = w?.accuracy != null ? Number(w.accuracy) : null
                  if (!topic) return
                  if (!topicAgg[topic]) topicAgg[topic] = { section, count:0, accSum:0, accN:0 }
                  topicAgg[topic].count++
                  if (acc != null) { topicAgg[topic].accSum += acc; topicAgg[topic].accN++ }
                })
              })

              const sorted = Object.entries(topicAgg).sort((a,b) => {
                const aAvg = a[1].accN ? a[1].accSum/a[1].accN : 999
                const bAvg = b[1].accN ? b[1].accSum/b[1].accN : 999
                return aAvg - bAvg
              })

              if (!sorted.length) return (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0',gap:16,textAlign:'center'}}>
                  <div style={{fontSize:56,lineHeight:1}}>🎯</div>
                  <div style={{fontSize:20,fontWeight:900,color:'#111827'}}>No Weak Areas Detected</div>
                  <div style={{fontSize:14,color:'#9ca3af',maxWidth:320,lineHeight:1.65}}>
                    Take more mock tests to build a picture of your weak areas and get AI-powered suggestions.
                  </div>
                  <button onClick={() => onStartTest?.('mock', selectedExamId)} className="dh-btn dh-btn-primary" style={{marginTop:8}}>
                    Take a Mock Test
                  </button>
                </div>
              )

              const bySection = {}
              sorted.forEach(([topic, info]) => {
                if (!bySection[info.section]) bySection[info.section] = []
                bySection[info.section].push({ topic, count:info.count, avgAcc:info.accN?Math.round(info.accSum/info.accN):null })
              })

              const sectionSummary = Object.entries(bySection).map(([sec, topics]) => {
                const accVals = topics.filter(t=>t.avgAcc!=null).map(t=>t.avgAcc)
                const secAvg  = accVals.length ? Math.round(accVals.reduce((a,b)=>a+b,0)/accVals.length) : null
                return { sec, topics, secAvg, meta: WA_SEC[sec]||WA_SEC.other }
              }).sort((a,b)=>(a.secAvg??100)-(b.secAvg??100))

              const totalTopics    = sorted.length
              const criticalCount  = sorted.filter(([,v])=>v.accN&&(v.accSum/v.accN)<40).length
              const needsWorkCount = sorted.filter(([,v])=>v.accN&&(v.accSum/v.accN)>=40&&(v.accSum/v.accN)<65).length
              const worstSec       = sectionSummary[0]

              const suggestions = [
                worstSec && {
                  icon:'🎯', color:'#ef4444',
                  title:`Start with ${worstSec.meta.label} — your lowest-scoring section`,
                  desc:`Accuracy: ${worstSec.secAvg??'low'}%. Spend 40% of each study session here until you cross 65%.`,
                },
                criticalCount > 0 && {
                  icon:'⚡', color:'#f97316',
                  title:`${criticalCount} critical topic${criticalCount>1?'s':''} below 40% — high priority`,
                  desc:`Negative marking hits hardest in topics you barely know. Master these with concept notes before attempting more questions.`,
                },
                {
                  icon:'🔄', color:'#3b82f6',
                  title:'Use Topic Practice for targeted drilling',
                  desc:`Short 20-question sessions on a single topic build recall faster than full mocks. Use "Topic Practice" mode after each weak topic study session.`,
                },
                {
                  icon:'📈', color:'#8b5cf6',
                  title:'Retake benchmark mock after 1 week of focused study',
                  desc:`Track your improvement cycle: study weak topic → take section test → verify accuracy gain. Aim for 15-20% improvement per week.`,
                },
              ].filter(Boolean)

              const sevLabel = acc => acc==null?'Unscored':acc<40?'Critical':acc<65?'Needs Work':acc<82?'Improving':'Good'
              const sevColor = acc => acc==null?'#9ca3af':acc<40?'#ef4444':acc<65?'#f97316':acc<82?'#3b82f6':'#16a34a'

              return (
                <div>
                  {/* Header */}
                  <div style={{marginBottom:24}}>
                    <h1 style={{fontSize:24,fontWeight:900,color:'#111827',letterSpacing:'-.03em',margin:0}}>
                      Weak Area Analysis
                    </h1>
                    <p style={{fontSize:13,color:'#9ca3af',marginTop:5,fontWeight:500}}>
                      AI-powered insights from {allWeakSrc.length} test{allWeakSrc.length!==1?'s':''} · focus on these to maximise your score
                    </p>
                  </div>

                  {/* Summary tiles */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
                    {[
                      {val:totalTopics,    lbl:'Total Weak Topics',   col:'#FF653F', bg:'linear-gradient(135deg,#fff8f5 0%,#fff 100%)', border:'#FF653F22'},
                      {val:criticalCount,  lbl:'Critical (< 40%)',    col:'#ef4444', bg:'linear-gradient(135deg,#fff5f5 0%,#fff 100%)', border:'#ef444422'},
                      {val:needsWorkCount, lbl:'Needs Work (40–65%)', col:'#f97316', bg:'linear-gradient(135deg,#fff8f0 0%,#fff 100%)', border:'#f9731622'},
                    ].map(s => (
                      <div key={s.lbl} style={{background:s.bg,borderRadius:16,padding:'16px 18px',border:`1.5px solid ${s.border}`}}>
                        <div style={{fontSize:32,fontWeight:900,color:s.col,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{s.val}</div>
                        <div style={{fontSize:11,fontWeight:700,color:'#6b7280',marginTop:5,lineHeight:1.3}}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>

                  {/* Section breakdown */}
                  <div style={{marginBottom:28}}>
                    <div className="dh-lbl">Section Breakdown</div>
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      {sectionSummary.map(({sec,topics,secAvg,meta}) => {
                        const sc = sevColor(secAvg), sl = sevLabel(secAvg)
                        return (
                          <div key={sec} style={{background:'#fff',border:'1.5px solid #f0f0f0',borderRadius:16,padding:'16px 18px',transition:'box-shadow .15s'}}
                            onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.06)'}
                            onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                              <div style={{
                                width:40,height:40,borderRadius:12,flexShrink:0,
                                background:`${meta.dot}15`,
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:18
                              }}>{meta.emoji}</div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:14,fontWeight:800,color:'#111827'}}>{meta.label}</div>
                                <div style={{fontSize:11,color:'#9ca3af',fontWeight:500,marginTop:1}}>{topics.length} topic{topics.length!==1?'s':''} · {meta.tip}</div>
                              </div>
                              <div style={{textAlign:'right',flexShrink:0}}>
                                {secAvg!=null && <div style={{fontSize:20,fontWeight:900,color:sc,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{secAvg}%</div>}
                                <span style={{fontSize:10,fontWeight:700,color:sc,background:`${sc}15`,borderRadius:99,padding:'2px 8px',marginTop:3,display:'inline-block'}}>{sl}</span>
                              </div>
                            </div>
                            {/* accuracy bar */}
                            <div style={{height:6,background:'#f0f0f0',borderRadius:99,overflow:'hidden',marginBottom:10}}>
                              <div style={{height:'100%',width:`${secAvg||2}%`,background:`linear-gradient(90deg,${sc}77,${sc})`,borderRadius:99,transition:'width .9s ease'}}/>
                            </div>
                            {/* topic chips */}
                            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                              {topics.slice(0,10).map(({topic,avgAcc},i) => {
                                const tc = sevColor(avgAcc)
                                return (
                                  <span key={i} style={{
                                    display:'inline-flex',alignItems:'center',gap:4,
                                    fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:7,
                                    background:`${tc}10`,color:tc,border:`1px solid ${tc}28`
                                  }}>
                                    {String(topic).replace(/_/g,' ')}
                                    {avgAcc!=null && <span style={{fontWeight:900}}>{avgAcc}%</span>}
                                  </span>
                                )
                              })}
                              {topics.length>10 && <span style={{fontSize:11,color:'#9ca3af',alignSelf:'center',fontWeight:600}}>+{topics.length-10} more</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* AI suggestions */}
                  <div style={{marginBottom:28}}>
                    <div className="dh-lbl" style={{display:'flex',alignItems:'center',gap:7}}>
                      <span style={{fontSize:15}}>🤖</span>
                      AI-Powered Suggestions
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {suggestions.map((s,i) => (
                        <div key={i} style={{
                          display:'flex',gap:14,padding:'14px 18px',
                          background:'#fff',borderRadius:14,
                          border:'1.5px solid #f0f0f0',
                          borderLeft:`4px solid ${s.color}`,
                          transition:'box-shadow .15s'
                        }}
                          onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.06)'}
                          onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                          <div style={{fontSize:22,lineHeight:1,flexShrink:0,marginTop:1}}>{s.icon}</div>
                          <div>
                            <div style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:4}}>{s.title}</div>
                            <div style={{fontSize:12.5,color:'#6b7280',lineHeight:1.65}}>{s.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study priority queue */}
                  <div style={{marginBottom:28}}>
                    <div className="dh-lbl">Top 5 Topics to Study Now</div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {sorted.slice(0,5).map(([topic,info],i) => {
                        const avg = info.accN ? Math.round(info.accSum/info.accN) : null
                        const sc  = sevColor(avg), sl = sevLabel(avg)
                        const meta = WA_SEC[info.section]||WA_SEC.other
                        return (
                          <div key={topic} style={{
                            display:'flex',alignItems:'center',gap:14,
                            padding:'12px 16px',background:'#fff',
                            border:'1.5px solid #f0f0f0',borderRadius:14
                          }}>
                            <div style={{
                              width:32,height:32,borderRadius:99,
                              background:`linear-gradient(135deg,${sc}22,${sc}44)`,
                              color:sc,fontWeight:900,fontSize:14,
                              display:'flex',alignItems:'center',justifyContent:'center',
                              flexShrink:0
                            }}>{i+1}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:800,color:'#111827',textTransform:'capitalize'}}>
                                {String(topic).replace(/_/g,' ')}
                              </div>
                              <div style={{fontSize:11,color:'#9ca3af',fontWeight:500,marginTop:1}}>
                                {meta.label} · appeared {info.count}×
                              </div>
                            </div>
                            {avg!=null && (
                              <div style={{textAlign:'right',flexShrink:0}}>
                                <div style={{fontSize:16,fontWeight:900,color:sc,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{avg}%</div>
                                <div style={{fontSize:10,fontWeight:700,color:sc,marginTop:2}}>{sl}</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <button onClick={() => onStartTest?.('topic', selectedExamId)} className="dh-btn dh-btn-primary">
                      Start Topic Practice
                    </button>
                    <button onClick={() => setActiveTab('results')} className="dh-btn dh-btn-ghost">
                      View Full Results
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* ── SETTINGS tab ── */}
            {activeTab === 'settings' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-black text-gray-900 mb-6">Settings</h2>
                <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 mb-4">
                  {[
                    { label:'Email notifications',  sub:'Exam reminders, plan updates',      on:true  },
                    { label:'WhatsApp alerts',       sub:'Daily study reminders',             on:false },
                    { label:'Performance digest',   sub:'Weekly score summary email',        on:true  },
                  ].map(s=>(
                    <div key={s.label} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${s.on?'':'bg-gray-200'}`} style={s.on?{background:'#FF653F'}:{}}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.on?'left-5':'left-0.5'}`}/>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={onLogout} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors">
                  ↪ Log Out of MockTest
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ══ SLIDE-IN PANEL ══ */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setPanelOpen(false)}/>
          <div className="fixed right-0 top-0 h-full w-72 z-50 flex flex-col overflow-y-auto shadow-2xl" style={{ background:'#fff' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid #e5e7eb' }}>
              <div className="flex items-center gap-2">
                <div style={{ width:28, height:28, background:'#FF653F', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontWeight:900, fontSize:10 }}>MT</span>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{color:'#111827'}}>MockTest</div>
                  <div style={{fontSize:8.5,fontWeight:700,color:'#FF653F',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
                </div>
              </div>
              <button onClick={()=>setPanelOpen(false)} className="text-2xl w-8 h-8 flex items-center justify-center" style={{color:'#6b7280'}}>×</button>
            </div>
            <nav className="flex-1 py-3">
              {/* Dashboard sections — MOBILE ONLY (desktop already has the sidebar) */}
              <div className="md:hidden">
                <div className="px-5 pt-1 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color:'#FF653F' }}>Menu</div>
                {SIDEBAR_NAV.map(item => (
                  <button key={item.id}
                    onClick={()=>{ setPanelOpen(false); setActiveTab(item.id) }}
                    className="w-full flex items-center gap-3 px-5 py-2.5 transition-colors"
                    style={ activeTab===item.id ? { background:'rgba(255,101,63,.1)', color:'#FF653F', fontWeight:700 } : { color:'#374151' } }
                    onMouseOver={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='#f3f4f6' }}
                    onMouseOut={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='transparent' }}>
                    <span className="flex-shrink-0" style={{color: activeTab===item.id ? '#FF653F' : '#6b7280'}}><item.Icon /></span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="px-5 pt-1 md:pt-1 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color:'#FF653F' }}>Practice Modes</div>
              {ACTIVE_MODES.map(m => (
                <button key={m.id} onClick={()=>{setPanelOpen(false);onStartTest(m.id)}}
                  className="w-full flex items-center gap-3 px-5 py-3 transition-colors"
                  style={{ borderRadius:0, color:'#374151' }}
                  onMouseOver={e=>e.currentTarget.style.background='#fef3f2'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{color:'#FF653F'}} className="flex-shrink-0"><m.Icon /></span>
                  <div>
                    <div className="text-sm font-bold">{m.label}</div>
                  </div>
                </button>
              ))}
              {ACTIVE_GROUPS.map(g => (
                <div key={g.id} className="mt-2">
                  <div className="px-5 py-2 text-xs font-bold uppercase tracking-widest" style={{ color:'#FF653F', borderTop:'1px solid #e5e7eb' }}>{g.label}</div>
                  {g.exams.map(e => (
                    <button key={e.id} onClick={()=>{setPanelOpen(false);onStartTest('mock', e.id)}}
                      className="w-full flex items-center justify-between px-5 py-2.5 transition-colors"
                      style={{color:'#374151'}}
                      onMouseOver={ev=>ev.currentTarget.style.background='#f9fafb'}
                      onMouseOut={ev=>ev.currentTarget.style.background='transparent'}>
                      <div>
                        <span className="text-sm font-medium">{e.name}</span>
                        <span className="text-xs ml-2" style={{ color:'#9ca3af' }}>{e.sub}</span>
                      </div>
                      {e.tag && <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#FFF3EE',color:'#FF653F'}}>{e.tag}</span>}
                    </button>
                  ))}
                </div>
              ))}
              <div className="mt-3 pt-2" style={{ borderTop:'1px solid #e5e7eb' }}>
                {adminUser && (
                  <button onClick={()=>{setPanelOpen(false);onNav?.('admin')}} className="w-full text-left px-5 py-2.5 text-sm flex items-center gap-2" style={{ color:'#6b7280' }}><DIcGear s={13} c='#6b7280'/> Admin Panel</button>
                )}
                <button onClick={onLogout} className="w-full text-left px-5 py-2.5 text-sm" style={{ color:'#ef4444' }}>→ Log out</button>
              </div>
            </nav>
          </div>
        </>
      )}

    </div>
  )
}
