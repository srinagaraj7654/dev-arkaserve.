import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../supabase.js'
import { startCheckout } from '../payments.js'
import { toast } from '../toast.js'
import { getExamBlueprint } from '../api.js'
import { EXAMS as CUTOFF_EXAMS } from './CutoffsPage.jsx'
import PerformancePage from './PerformancePage.jsx'
import PredictionPage from './PredictionPage.jsx'
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
      { id: 'rbi_assistant_pre',   name: 'Assistant Prelims', sub: '100Q · 60 min',  tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'rbi_assistant_mains', name: 'Assistant Mains',   sub: '200Q · 135 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'rbi_gradeb_p1',       name: 'Grade B (Phase 1)', sub: '200Q · 120 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
    ],
  },
  {
    id: 'nabard', label: 'NABARD Exams',
    color: 'from-green-600 to-green-700', hex: '#16a34a',
    exams: [
      { id: 'nabard_gradeA_pre', name: 'Grade A Prelims',      sub: '200Q · 120 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'nabard_da_pre',     name: 'Development Assistant', sub: '100Q · 60 min',  tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
    ],
  },
  {
    id: 'lic', label: 'LIC Exams',
    color: 'from-blue-600 to-blue-700', hex: '#2563eb',
    exams: [
      { id: 'lic_aao_pre',       name: 'AAO Prelims',       sub: '100Q · 60 min',  tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'lic_aao_mains',     name: 'AAO Mains',         sub: '120Q · 120 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'lic_assistant_pre', name: 'Assistant Prelims', sub: '100Q · 60 min',  tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'lic_ado_pre',       name: 'ADO Prelims',       sub: '100Q · 60 min',  tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'lic_ado_mains',     name: 'ADO Mains',         sub: '120Q · 120 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
    ],
  },
  {
    id: 'insurance', label: 'Insurance Exams',
    color: 'from-cyan-600 to-cyan-700', hex: '#0891b2',
    exams: [
      { id: 'niacl_ao_pre',        name: 'NIACL AO Prelims',        sub: '100Q · 60 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'niacl_assistant_pre', name: 'NIACL Assistant Prelims',  sub: '100Q · 60 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'nicl_ao_pre',         name: 'NICL AO Prelims',          sub: '100Q · 60 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'uiic_ao_pre',         name: 'UIIC AO Prelims',          sub: '100Q · 60 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
      { id: 'oicl_ao_pre',         name: 'OICL AO Prelims',          sub: '100Q · 60 min', tag: 'Coming Soon', tagColor: 'bg-gray-100 text-gray-500', comingSoon: true },
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
const SvgTrend  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 14 7 9 11 13 18 4"/><polyline points="14 4 18 4 18 8"/></svg>
const SvgBolt   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 2 2 11 9 11 9 18 18 9 11 9 11 2"/></svg>

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
  { id:'performance',   Icon:SvgTrend, label:'My Performance' },
  { id:'prediction',    Icon:SvgBolt,  label:'AI Prediction'  },
  { id:'weakareas',     Icon:SvgFlame, label:'Weak Areas'    },
  { id:'subscriptions', Icon:SvgClip,  label:'Subscriptions' },
  { id:'profile',       Icon:SvgUser,  label:'Profile'       },
  { id:'billing',       Icon:SvgCard,  label:'Billing'       },
  { id:'settings',      Icon:SvgGear,  label:'Settings'      },
]

// Build-time flag set when building for APK (VITE_IS_NATIVE=true npm run build)
const isNative = import.meta.env.VITE_IS_NATIVE === 'true'

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
  const [profileEdit,     setProfileEdit]     = useState(false)
  const [profileName,     setProfileName]     = useState(user?.user_metadata?.full_name || '')
  const [profilePhone,    setProfilePhone]    = useState(user?.user_metadata?.phone || '')
  const [profileDob,      setProfileDob]      = useState(user?.user_metadata?.dob || '')
  const [profileGender,   setProfileGender]   = useState(user?.user_metadata?.gender || '')
  const [profileReferral, setProfileReferral] = useState(user?.user_metadata?.referral_source || '')
  const [profileSaving,   setProfileSaving]   = useState(false)
  const [profileMsg,      setProfileMsg]      = useState('')
  // educational status
  const [profileCategory, setProfileCategory] = useState(user?.user_metadata?.category || 'UR')
  const [profileState,    setProfileState]    = useState(user?.user_metadata?.state || '')
  const [profileLevel,    setProfileLevel]    = useState(user?.user_metadata?.level || '')
  const [profileExam,     setProfileExam]     = useState(user?.user_metadata?.target_exam || 'bank_clerk_prelims')
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
  const [avatarUrl,       setAvatarUrl]       = useState(user?.user_metadata?.avatar_url || '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  /* ── selected / target exam state ── */
  const [selectedExamId, setSelectedExamId] = useState(
    user?.user_metadata?.target_exam || 'bank_clerk_prelims'
  )
  // true only once the user has actually picked an exam (not skipped onboarding)
  const [examChosen,     setExamChosen]     = useState(!!user?.user_metadata?.target_exam)
  const [showAllExams,   setShowAllExams]   = useState(false)
  const [changingExam,   setChangingExam]   = useState(false)
  const [examSaving,     setExamSaving]     = useState(false)
  const [waFilter,       setWaFilter]       = useState('all')   // weak-areas section filter
  const [topicTab,       setTopicTab]       = useState('weak')  // dashboard topic tab: 'weak' | 'strong'
  const [clockNow,       setClockNow]       = useState(Date.now)

  // Live countdown ticker — 1-second interval, cleaned up on unmount
  useEffect(() => {
    const t = setInterval(() => setClockNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  /* show all exam groups regardless of region so users see their full history */
  const ACTIVE_GROUPS       = [...EXAM_GROUPS, ...SAT_EXAM_GROUPS]
  const ACTIVE_TOPIC_GROUPS = examRegion === 'us' ? SAT_TOPIC_GROUPS : TOPIC_GROUPS

  /* flatten all exams + find the selected one and its group */
  const ALL_EXAMS_FLAT = ACTIVE_GROUPS.flatMap(g => g.exams.map(e => ({ ...e, groupId: g.id, groupLabel: g.label, groupColor: g.color })))
  const selectedExam   = ALL_EXAMS_FLAT.find(e => e.id === selectedExamId) || ALL_EXAMS_FLAT[0]
  const selectedGroup  = ACTIVE_GROUPS.find(g => g.id === selectedExam?.groupId) || ACTIVE_GROUPS[0]

  /* practice modes based on the currently selected exam group, not the user's region */
  const SAT_GROUP_IDS = new Set(['sat', 'act', 'psat', 'ap_math_science', 'ap_humanities'])
  const ACTIVE_MODES  = SAT_GROUP_IDS.has(selectedGroup?.id) ? SAT_MODES : MODES

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

  /* theme-aware style tokens — shared across all tab render blocks */
  const cd = document.documentElement.classList.contains('dark')
  const _s = cd ? '#161b24' : '#fff'
  const _b = cd ? '#232c3a' : '#efefef'
  const _t = cd ? '#f1f5f9' : '#111827'
  const _m = cd ? '#94a3b8' : '#6b7280'
  const _a = '#FF653F'

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
  const hasChosenExam = examChosen
    || !!user?.user_metadata?.target_exam
    || (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length > 0)
    || history.length > 0
  const FREE_OPEN_IDS = new Set(['ap_eamcet_engg', 'ts_eamcet_engg'])
  const isSATGroup = selectedGroup?.id === 'sat' || selectedGroup?.id === 'act' || selectedGroup?.id === 'psat' || selectedGroup?.id?.startsWith('ap_')
  const visibleGroupExams = (isSATGroup || isPro)
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
    await supabase.auth.updateUser({ data: {
      full_name: profileName, phone: profilePhone,
      dob: profileDob, gender: profileGender, referral_source: profileReferral,
    }})
    try {
      await supabase.from('profiles').upsert({
        id: user.id, full_name: profileName, phone: profilePhone,
        dob: profileDob || null, gender: profileGender || null, referral_source: profileReferral || null,
      }, { onConflict: 'id' })
      await supabase.from('student_onboarding').upsert({ student_id: user.id, phone: profilePhone, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
    } catch (_) {}
    setProfileSaving(false); setProfileEdit(false)
    setProfileMsg('✓ Saved'); setTimeout(() => setProfileMsg(''), 2500)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5 MB', 'error'); return }
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setAvatarUploading(false); toast('Upload failed: ' + upErr.message, 'error'); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
    setAvatarUrl(publicUrl)
    setAvatarUploading(false)
    toast('Photo updated!', 'success')
    if (avatarInputRef.current) avatarInputRef.current.value = ''
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
    <div className={`min-h-screen flex flex-col${isNative?` na${cd?' na-dark':''}`:''}` }
      style={{background: isNative?(cd?'#000':'#f2f2f7'):'#fff'}}>

      {/* ══ NATIVE APP CSS — only injected in Capacitor APK ══ */}
      {isNative && <style>{`
        .na main{background:${cd?'#000':'#f2f2f7'}!important}
        .na .db-card{background:${cd?'#1c1c1e':'#fff'}!important;border:none!important;border-radius:20px!important;box-shadow:${cd?'0 2px 20px rgba(0,0,0,.45),0 0 0 .5px rgba(255,255,255,.05)':'0 2px 14px rgba(0,0,0,.07),0 0 0 .5px rgba(0,0,0,.04)'}!important}
        .na .db-ctitle{font-size:15px!important;font-weight:800!important;letter-spacing:-.01em!important;margin-bottom:16px!important}
        .na .db-ctitle button,.na .db-ctitle a{font-size:11px!important;padding:5px 10px!important;border-radius:20px!important}
        .na .db-stat-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
        .na .db-hero-row{grid-template-columns:1fr!important;margin-bottom:14px!important}
        .na .db-three{grid-template-columns:1fr!important}
        .na .db-sec-row{grid-template-columns:1fr!important}
        .na .db-perf-table td{font-size:13px!important;padding:12px 6px 12px 0!important}
        .na button{-webkit-tap-highlight-color:transparent!important}
        .na main{-webkit-overflow-scrolling:touch}
        .na .hero-illus{display:none!important}
        .na .ht-hero-illus{display:none!important}
      `}</style>}

      {/* ══ NATIVE APP TOP BAR — per-tab header, Capacitor only ══ */}
      {isNative && (() => {
        const isPrimary = ['home','explore','performance','studyplan','profile'].includes(activeTab)
        const TITLES = {home:'Home',explore:'Explore Exams',performance:'My Progress',studyplan:'Study Planner',profile:'Profile',weakareas:'Weak Areas',prediction:'AI Prediction',subscriptions:'Subscriptions',billing:'Billing',settings:'Settings'}
        return (
          <div style={{background:_s,paddingTop:'env(safe-area-inset-top,0px)',position:'sticky',top:0,zIndex:100,borderBottom:`1px solid ${_b}`,boxShadow:cd?'none':'0 1px 0 rgba(0,0,0,.05)'}}>
            <div style={{height:54,display:'flex',alignItems:'center',padding:'0 14px',gap:10}}>
              {/* Left: back arrow for secondary tabs, MT logo for primary */}
              {!isPrimary ? (
                <button onClick={()=>setActiveTab('home')} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:cd?'rgba(255,255,255,.09)':'rgba(0,0,0,.06)',borderRadius:11,cursor:'pointer',flexShrink:0}}>
                  <svg width="18" height="18" fill="none" stroke={_t} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
              ) : (
                <div style={{width:34,height:34,background:'#FF653F',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{color:'#fff',fontWeight:900,fontSize:11}}>MT</span>
                </div>
              )}
              {/* Title */}
              <div style={{flex:1,minWidth:0}}>
                {activeTab==='home' ? (
                  <div style={{fontSize:16,fontWeight:800,color:_t,letterSpacing:'-.02em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    Hi, {(userName||'Student').split(' ')[0]} 👋
                  </div>
                ) : (
                  <div style={{fontSize:17,fontWeight:800,color:_t,letterSpacing:'-.02em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {TITLES[activeTab]||activeTab}
                  </div>
                )}
              </div>
              {/* Context action */}
              {(activeTab==='home'||activeTab==='explore') && (
                <button style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:cd?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)',borderRadius:11,cursor:'pointer',flexShrink:0}}>
                  {activeTab==='home'
                    ? <svg width="17" height="17" fill="none" stroke={_m} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    : <svg width="17" height="17" fill="none" stroke={_m} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
                </button>
              )}
              {/* Three-dot More */}
              <button onClick={()=>setPanelOpen(true)} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer',flexShrink:0}}>
                <svg width="18" height="18" fill={_m} viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
            {/* Trial notice strip */}
            {activeTab==='home' && (trialActive||trialExpired) && (
              <div style={{padding:'7px 14px 9px',background:'rgba(255,101,63,.09)',borderTop:`1px solid rgba(255,101,63,.18)`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <span style={{fontSize:12,color:cd?'#ff9a7a':'#c94a1f',fontWeight:600}}>
                  {trialExpired?'Free trial ended — upgrade to continue':`${trialDaysLeft===1?'Last day':trialDaysLeft+' days'} left in free trial`}
                </span>
                <button onClick={()=>setActiveTab('subscriptions')} style={{fontSize:11,fontWeight:800,color:'#fff',background:'#FF653F',border:'none',borderRadius:8,padding:'5px 10px',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                  Upgrade
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* ══ TOP HEADER — web only ══ */}
      {!isNative && <header className="h-16 flex items-center px-5 gap-4 sticky top-0 z-30" style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
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
              <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',flexShrink:0,overflow:'hidden'}}>
                {avatarUrl ? <img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (userName[0]||'U').toUpperCase()}
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
                    <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff',flexShrink:0,overflow:'hidden'}}>
                      {avatarUrl ? <img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (userName[0]||'U').toUpperCase()}
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
      </header>}

      <div className="flex flex-1 min-h-0">

        {/* ══ LEFT SIDEBAR — web only ══ */}
        {!isNative && <aside className="w-60 flex-shrink-0 hidden md:flex flex-col overflow-y-auto"
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

        </aside>}

        {/* ══ MAIN CONTENT ══ */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto flex flex-col" style={{background: isNative?(cd?'#000':'#f2f2f7'):'#fff'}}>
          <div className="flex-1 py-6 px-4 sm:px-8 lg:px-12" style={{maxWidth:'100%',boxSizing:'border-box',
            ...(isNative ? {paddingBottom:'calc(76px + env(safe-area-inset-bottom,0px))',paddingLeft:14,paddingRight:14,paddingTop:14} : {})
          }}>

            {/* ── HOME tab ── */}
            {activeTab === 'home' && (() => {
              const now = new Date()
              const todayStr = now.toDateString()
              const weekAgo = new Date(+now - 7*864e5)
              const testsToday = history.filter(r => new Date(r.created_at).toDateString() === todayStr).length
              const testsThisWeek = history.filter(r => new Date(r.created_at) >= weekAgo).length
              const lastTest = history[0]
              const _toT2 = s => (s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
              const lastTestName = lastTest
                ? (lastTest.test_type==='topic_diagnostic' ? `Topic · ${_toT2(lastTest.topic||'')}`
                  : lastTest.test_type==='mini'||lastTest.test_type==='concept_mini' ? `Practice · ${_toT2(lastTest.section||lastTest.topic||'')}`
                  : `Mock · ${_toT2(lastTest.exam)||''}`)
                : ''
              const lastPct = lastTest ? Math.round(Number(lastTest.percentage||0)) : 0
              const todayDow = now.getDay()
              const weekActivity = Array.from({length:7}, (_,i) => {
                const d = new Date(+now - (6-i)*864e5)
                return history.some(r => new Date(r.created_at).toDateString() === d.toDateString())
              })
              const cd = document.documentElement.classList.contains('dark')
              const _s = cd ? '#161b24' : '#fff'
              const _b = cd ? '#232c3a' : '#efefef'
              const _t = cd ? '#f1f5f9' : '#111827'
              const _m = cd ? '#94a3b8' : '#6b7280'
              const _a = '#FF653F'
              const shortLbl2 = l => l.replace(/\s*(exams?|tests?)\s*$/i,'').trim()

              /* ── returning-user derived stats ── */
              const hr = now.getHours()
              const greeting = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'
              const firstName = (userName||'User').split(' ')[0].replace(/\b\w/g,c=>c.toUpperCase())

              const streak = (() => {
                const dates = new Set(history.map(r=>new Date(r.created_at).toDateString()))
                let c=0, d=new Date()
                while(dates.has(d.toDateString())){c++;d.setDate(d.getDate()-1)}
                return c
              })()

              const totalCorrect = history.reduce((s,r)=>s+(r.correct_count||0),0)
              const totalQ = history.reduce((s,r)=>s+(r.correct_count||0)+(r.wrong_count||0),0)
              const accuracyPct = totalQ>0?Math.round((totalCorrect/totalQ)*100):0

              const thisMonthStart = new Date(now.getFullYear(),now.getMonth(),1)
              const lastMonthStart = new Date(now.getFullYear(),now.getMonth()-1,1)
              const thisMonthHist = history.filter(r=>new Date(r.created_at)>=thisMonthStart)
              const lastMonthHist = history.filter(r=>new Date(r.created_at)>=lastMonthStart&&new Date(r.created_at)<thisMonthStart)
              const testsTrend = lastMonthHist.length>0?Math.round(((thisMonthHist.length-lastMonthHist.length)/lastMonthHist.length)*100):null
              const avgTrend = (() => {
                const lm = lastMonthHist.length?lastMonthHist.reduce((s,r)=>s+(r.percentage||0),0)/lastMonthHist.length:null
                const tm = thisMonthHist.length?thisMonthHist.reduce((s,r)=>s+(r.percentage||0),0)/thisMonthHist.length:null
                return lm&&tm?Math.round(tm-lm):null
              })()

              const chartResults = (examResults.length>0?examResults:history).slice(0,7).reverse()

              // Section-wise aggregation from section_scores (actual DB field)
              const sectionAgg = {}
              history.slice(0,15).forEach(r=>{
                Object.entries(r.section_scores||{}).forEach(([sec,v])=>{
                  if(!sectionAgg[sec]) sectionAgg[sec]={correct:0,total:0,accSum:0,n:0}
                  const c=Number(v?.correct||0)
                  const t=Number(v?.total||(v?.correct||0)+(v?.wrong||0))||0
                  const acc=v?.accuracy!=null?Number(v.accuracy):(t>0?c/t*100:0)
                  sectionAgg[sec].correct+=c
                  sectionAgg[sec].total+=t
                  sectionAgg[sec].accSum+=acc
                  sectionAgg[sec].n+=1
                })
              })
              const topicPerfArr = Object.entries(sectionAgg)
                .filter(([,d])=>d.n>0)
                .map(([sec,d])=>({
                  topic:sec.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
                  accuracy:d.total>0?Math.round(d.correct/d.total*100):Math.round(d.accSum/d.n),
                  correct:d.correct,total:d.total
                }))
                .sort((a,b)=>b.total-a.total).slice(0,6)

              // Topic-wise from aggregated weak/strong arrays across history
              const weakFreq={}, strongFreq={}
              history.slice(0,20).forEach(r=>{
                ;(r.weak_topics||[]).forEach(t=>{weakFreq[t]=(weakFreq[t]||0)+1})
                ;(r.strong_topics||[]).forEach(t=>{strongFreq[t]=(strongFreq[t]||0)+1})
              })
              const fmt=s=>s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
              // Use section accuracy for topics that appear in topicPerfArr; else fall back to frequency
              const topicPerfMap=Object.fromEntries(topicPerfArr.map(t=>[t.topic.toLowerCase(),t]))
              const weakTopicArr = topicPerfArr.filter(t=>t.accuracy<65).sort((a,b)=>a.accuracy-b.accuracy).length>0
                ? topicPerfArr.filter(t=>t.accuracy<65).sort((a,b)=>a.accuracy-b.accuracy)
                : Object.entries(weakFreq).sort((a,b)=>b[1]-a[1]).slice(0,5)
                    .map(([t,cnt])=>({topic:fmt(t),accuracy:topicPerfMap[fmt(t).toLowerCase()]?.accuracy??30,correct:0,total:cnt}))
              const strongTopicArr = topicPerfArr.filter(t=>t.accuracy>=65).sort((a,b)=>b.accuracy-a.accuracy).length>0
                ? topicPerfArr.filter(t=>t.accuracy>=65).sort((a,b)=>b.accuracy-a.accuracy)
                : Object.entries(strongFreq).sort((a,b)=>b[1]-a[1]).slice(0,5)
                    .map(([t,cnt])=>({topic:fmt(t),accuracy:topicPerfMap[fmt(t).toLowerCase()]?.accuracy??80,correct:0,total:cnt}))

              const isNewUser = !hasChosenExam
              if (isNewUser) return (
                <>
                  <style>{`
                    .ht-new-outer{display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start}.ht-new-col-right{align-self:stretch}
                    .ht-new-right{position:sticky;top:0;display:flex;flex-direction:column;gap:20px}
                    .ht-cat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
                    .ht-cat-card{background:${_s};border:1px solid ${_b};border-radius:14px;padding:20px 14px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;width:100%;transition:all .18s}
                    .ht-explore-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
                    .ht-explore-card{background:${_s};border:1px solid ${_b};border-radius:14px;padding:18px 16px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
                    .ht-why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
                    .ht-feat-grid{display:flex;flex-wrap:wrap;gap:8px}
                    .ht-feat-item{display:flex;align-items:center;gap:7px;padding:6px 12px;background:${cd?'rgba(255,255,255,.06)':'rgba(255,255,255,.82)'};border-radius:99px;border:1px solid ${cd?'rgba(255,255,255,.1)':'rgba(255,101,63,.14)'};flex-shrink:0}
                    .ht-hero-illus{flex-shrink:0;width:240px;min-width:0}
                    .ht-hero-inner{display:flex;align-items:center;gap:24;justify-content:space-between;position:relative}
                    @media(max-width:1100px){.ht-hero-illus{display:none!important}}
                    @media(max-width:980px){.ht-new-outer{grid-template-columns:1fr!important}.ht-new-col-right{align-self:auto!important}.ht-new-right{position:static!important}}
                    @media(max-width:1100px){.ht-cat-grid{grid-template-columns:repeat(3,1fr)!important}}
                    @media(max-width:700px){.ht-cat-grid{grid-template-columns:repeat(2,1fr)!important}.ht-why-grid{grid-template-columns:1fr 1fr!important}.ht-explore-grid{grid-template-columns:1fr 1fr!important}.ht-explore-card{flex-direction:row!important;align-items:flex-start!important;gap:12px!important}}
                    @media(max-width:480px){.ht-why-grid{grid-template-columns:1fr!important}.ht-cat-grid{grid-template-columns:repeat(2,1fr)!important}.ht-feat-grid{gap:6px!important}}
                    @media(max-width:360px){.ht-cat-grid{grid-template-columns:1fr!important}}
                  `}</style>

                  <div className="ht-new-outer">
                    {/* LEFT COLUMN */}
                    <div>

                      {/* HERO BANNER */}
                      <div style={{position:'relative',borderRadius:18,overflow:'hidden',
                        background:cd?'linear-gradient(135deg,#0d1117 0%,#161b24 100%)':'linear-gradient(135deg,#fff8f5 0%,#fff3ee 100%)',
                        border:`1px solid ${cd?'#1e2738':'#ffdece'}`,
                        boxShadow:cd?'0 2px 20px rgba(0,0,0,.35)':'0 4px 24px rgba(255,101,63,.08)',
                        marginBottom:22,padding:'26px 28px 26px 32px'}}>
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,background:'linear-gradient(180deg,#FF653F,#ff9c68)'}}/>
                        <div style={{position:'absolute',top:-50,right:-30,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,101,63,.1) 0%,transparent 70%)',pointerEvents:'none'}}/>
                        <div style={{display:'flex',alignItems:'center',gap:24,justifyContent:'space-between',position:'relative'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:_a,marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                              <span style={{fontSize:16}}>👋</span>
                              <span>Hi, {(u=>{const fn=u.split(/[\s._@]/)[0];return fn.charAt(0).toUpperCase()+fn.slice(1)})(userName)}!</span>
                            </div>
                            <h1 style={{fontSize:18,fontWeight:400,color:cd?'#fff':_t,letterSpacing:'-.01em',lineHeight:1.3,margin:'0 0 12px',whiteSpace:'nowrap'}}>
                              Prepare Smarter, Score Higher
                            </h1>
                            <p style={{margin:'0 0 20px',fontSize:13,color:_m,fontWeight:500,lineHeight:1.7,maxWidth:380}}>
                              Full-length mock tests, topic-wise practice, and detailed analytics — everything you need to crack your exam.
                            </p>
                            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:18}}>
                              <button onClick={()=>setActiveTab('explore')}
                                style={{background:_a,color:'#fff',border:'none',borderRadius:10,padding:'11px 22px',fontWeight:800,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:7,boxShadow:'0 4px 16px rgba(255,101,63,.32)'}}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                Browse Exams
                              </button>
                            </div>
                            <div className="ht-feat-grid">
                              {[
                                {label:'Full-Length Mock Tests',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={_a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
                                {label:'Topic-Wise Practice',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={_a} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>},
                                {label:'Detailed Explanations',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={_a} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>},
                                {label:'Personalised Study Plan',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={_a} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
                              ].map((f,fi)=>(
                                <div key={fi} className="ht-feat-item">
                                  {f.icon}
                                  <span style={{fontSize:11.5,fontWeight:700,color:cd?'rgba(255,220,190,.88)':_t,lineHeight:1.3,whiteSpace:'nowrap'}}>{f.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="ht-hero-illus" style={{display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                            <img
                              src="/hero-student.webp"
                              alt="Study illustration"
                              style={{
                                height:200,
                                width:'auto',
                                display:'block',
                                objectFit:'contain',
                                objectPosition:'bottom',
                                filter:cd?'brightness(.85) saturate(.9)':'none',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* POPULAR EXAM CATEGORIES */}
                      <div style={{marginBottom:24}}>
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
                          <div>
                            <div style={{fontSize:18,fontWeight:900,color:_t,letterSpacing:'-.02em',lineHeight:1.2}}>Popular Exam Categories</div>
                            <div style={{fontSize:12.5,color:_m,marginTop:4}}>Choose your target exam to get started</div>
                          </div>
                          <button onClick={()=>setActiveTab('explore')} style={{background:'none',border:'none',color:_a,fontSize:12.5,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5,padding:0,flexShrink:0,marginTop:2}}>
                            View All Exams
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        </div>
                        <div className="ht-cat-grid">
                          {[
                            {label:'Banking Exams',sub:'IBPS, SBI, RRB, NABARD\nand more',col:'#3b82f6',grp:'ibps',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>},
                            {label:'SSC Exams',sub:'CGL, CHSL, MTS, GD\nand more',col:'#8b5cf6',grp:'ssc',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>},
                            {label:'Railway Exams',sub:'RRB NTPC, Group D\nand more',col:'#16a34a',grp:'rrb',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8.5" cy="17" r="1.5"/><circle cx="15.5" cy="17" r="1.5"/><path d="M8 19l-2 3"/><path d="M16 19l2 3"/></svg>},
                            {label:'Entrance Exams',sub:'JEE, NEET, CUET\nand more',col:'#7c3aed',grp:null,
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>},
                            {label:'International',sub:'SAT, ACT\nand more',col:'#d97706',grp:'sat',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>},
                          ].map((cat,ci)=>(
                            <button key={ci}
                              onClick={cat.grp?()=>{setActiveExploreGroup(cat.grp);setActiveTab('explore')}:undefined}
                              className="ht-cat-card"
                              style={{cursor:cat.grp?'pointer':'default',opacity:cat.grp?1:.75}}
                              onMouseOver={cat.grp?e=>{e.currentTarget.style.borderColor=cat.col+'55';e.currentTarget.style.boxShadow=`0 8px 24px ${cat.col}18`;e.currentTarget.style.transform='translateY(-3px)'}:undefined}
                              onMouseOut={cat.grp?e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}:undefined}>
                              <div style={{width:52,height:52,borderRadius:15,background:cat.col+'15',display:'flex',alignItems:'center',justifyContent:'center',color:cat.col,flexShrink:0}}>
                                {cat.icon}
                              </div>
                              <div style={{flex:1,display:'flex',flexDirection:'column',gap:3,minWidth:0}}>
                                <div style={{fontSize:12.5,fontWeight:800,color:_t,lineHeight:1.3}}>{cat.label}</div>
                                <div style={{fontSize:10.5,color:_m,lineHeight:1.5,whiteSpace:'pre-line'}}>{cat.sub}</div>
                              </div>
                              {cat.grp
                                ?<div style={{width:24,height:24,borderRadius:'50%',border:`1.5px solid ${cat.col}44`,display:'flex',alignItems:'center',justifyContent:'center',color:cat.col,flexShrink:0}}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                                :<div style={{fontSize:9,fontWeight:800,color:cat.col,background:cat.col+'18',borderRadius:99,padding:'3px 9px',flexShrink:0,letterSpacing:'.04em'}}>Soon</div>
                              }
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* EXPLORE WHAT YOU CAN DO */}
                      <div style={{marginBottom:24}}>
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:18,fontWeight:900,color:_t,letterSpacing:'-.02em',lineHeight:1.2}}>Explore What You Can Do</div>
                          <div style={{fontSize:12.5,color:_m,marginTop:4}}>Everything you need for effective exam preparation</div>
                        </div>
                        <div className="ht-explore-grid">
                          {[
                            {label:'Full Mock Tests',desc:'Take complete tests with real exam pattern',btnText:'Start Now',col:'#FF653F',bg:`${_a}15`,act:()=>onStartTest?.('mock',selectedExamId),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>},
                            {label:'Topic Practice',desc:'Practice topic-wise questions',btnText:'Start Practice',col:'#3b82f6',bg:'rgba(59,130,246,.12)',act:()=>onStartTest?.('topic',selectedExamId),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>},
                            {label:'Previous Year Papers',desc:'Access past exam question papers',btnText:'Explore',col:'#16a34a',bg:'rgba(22,163,74,.12)',act:()=>onNav?.('papers'),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>},
                            {label:'Study Planner',desc:'Plan your study schedule effectively',btnText:'Create Plan',col:'#d97706',bg:'rgba(217,119,6,.12)',act:()=>setActiveTab('studyplan'),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>},
                          ].map((ex,ei)=>(
                            <div key={ei} className="ht-explore-card">
                              <div style={{width:46,height:46,borderRadius:13,background:ex.bg,display:'flex',alignItems:'center',justifyContent:'center',color:ex.col,flexShrink:0}}>
                                {ex.icon}
                              </div>
                              <div style={{minWidth:0,display:'flex',flexDirection:'column',gap:4}}>
                                <div style={{fontSize:13,fontWeight:800,color:_t,lineHeight:1.3}}>{ex.label}</div>
                                <div style={{fontSize:11.5,color:_m,lineHeight:1.5}}>{ex.desc}</div>
                                <button onClick={ex.act}
                                  style={{background:'none',border:'none',color:ex.col,fontSize:12,fontWeight:800,cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:4,marginTop:4}}>
                                  {ex.btnText}
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* WHY CHOOSE MOCKTEST */}
                      <div style={{display:'flex',alignItems:'center',gap:20,
                        background:cd?'linear-gradient(135deg,#0a1628 0%,#0d2236 100%)':'linear-gradient(135deg,#e8f4fd 0%,#dbeef9 100%)',
                        border:`1px solid ${cd?'rgba(59,130,246,.18)':'rgba(59,130,246,.22)'}`,
                        borderRadius:18,padding:'22px 24px',marginBottom:22}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:17,fontWeight:900,color:cd?'rgba(255,255,255,.95)':'#1e293b',letterSpacing:'-.02em',marginBottom:3}}>Why Choose MockTest?</div>
                          <div style={{fontSize:12,color:cd?'rgba(180,210,255,.68)':'rgba(30,41,59,.55)',marginBottom:18}}>A complete platform for your exam preparation journey</div>
                          <div className="ht-why-grid">
                            {[
                              {col:'#d97706',label:'Exam-focused Content',desc:'Curriculum aligned with latest exam patterns.',
                                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 10.5 16.5 14 13"/></svg>},
                              {col:'#3b82f6',label:'Detailed Analytics',desc:'Know your strengths and weak areas.',
                                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
                              {col:'#8b5cf6',label:'Expert Solutions',desc:'Step-by-step explanations for every question.',
                                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>},
                              {col:'#16a34a',label:'Trusted by Students',desc:'Helping students throughout their preparation journey.',
                                icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
                            ].map((f,fi)=>(
                              <div key={fi} style={{display:'flex',flexDirection:'column',gap:9}}>
                                <div style={{width:42,height:42,borderRadius:'50%',background:f.col+'1a',display:'flex',alignItems:'center',justifyContent:'center',color:f.col,flexShrink:0}}>
                                  {f.icon}
                                </div>
                                <div>
                                  <div style={{fontSize:12,fontWeight:800,color:cd?'rgba(255,255,255,.9)':'#1e293b',marginBottom:3,lineHeight:1.3}}>{f.label}</div>
                                  <div style={{fontSize:10.5,color:cd?'rgba(180,210,255,.6)':'rgba(30,41,59,.55)',lineHeight:1.55}}>{f.desc}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{flexShrink:0,opacity:cd?.7:1}}>
                          <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                            <circle cx="44" cy="44" r="42" fill={cd?'rgba(59,130,246,.08)':'rgba(59,130,246,.1)'}/>
                            <path d="M20 43 L44 33 L68 43 L44 53 Z" fill={cd?'#1e3a5f':'#1e293b'}/>
                            <path d="M20 43 L44 53 L68 43" fill="rgba(0,0,0,.12)"/>
                            <ellipse cx="44" cy="53" rx="15" ry="8" fill={cd?'#2a4a70':'#334155'}/>
                            <path d="M29 53 Q44 64 59 53" fill={cd?'#3a5a82':'#475569'}/>
                            <line x1="68" y1="43" x2="68" y2="57" stroke="#FF653F" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="68" cy="61" r="4" fill="#FF653F"/>
                            <line x1="65" y1="65" x2="63" y2="75" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="68" y1="65" x2="68" y2="76" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="71" y1="65" x2="73" y2="75" stroke="#FF653F" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="26" cy="37" r="2.5" fill={cd?'rgba(255,200,80,.4)':'rgba(255,180,50,.5)'}/>
                            <circle cx="62" cy="25" r="2" fill={cd?'rgba(255,101,63,.4)':'rgba(255,101,63,.5)'}/>
                            <path d="M17 55 L18.5 50 L20 55 L25 56.5 L20 58 L18.5 63 L17 58 L12 56.5 Z" fill={cd?'rgba(255,180,80,.3)':'rgba(255,180,80,.45)'}/>
                          </svg>
                        </div>
                      </div>

                      {/* HOW IT WORKS */}
                      <div style={{marginBottom:24}}>
                        <div style={{fontSize:18,fontWeight:900,color:_t,letterSpacing:'-.02em',lineHeight:1.2,marginBottom:14}}>How It Works</div>
                        <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'20px 22px'}}>
                          {[
                            {n:'01',title:'Choose your exam',desc:'Select from Banking, SSC, Railway, Entrance exams and more.',col:'#3b82f6'},
                            {n:'02',title:'Practice intelligently',desc:'Take full mocks, topic-wise drills, or section tests with instant scoring.',col:'#8b5cf6'},
                            {n:'03',title:'Analyse and improve',desc:'Get detailed analytics, topic accuracy reports and a personalised study plan.',col:'#16a34a'},
                          ].map((s,si)=>(
                            <div key={s.n} style={{display:'flex',gap:14,paddingBottom:si<2?16:0,borderBottom:si<2?`1px dashed ${_b}`:'none',marginBottom:si<2?16:0}}>
                              <div style={{width:36,height:36,borderRadius:10,background:`${s.col}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                                <span style={{fontSize:11,fontWeight:900,color:s.col}}>{s.n}</span>
                              </div>
                              <div>
                                <div style={{fontSize:13.5,fontWeight:800,color:_t,marginBottom:4}}>{s.title}</div>
                                <div style={{fontSize:12,color:_m,lineHeight:1.65}}>{s.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT STICKY COLUMN */}
                    <div className="ht-new-col-right"><div className="ht-new-right">

                      {/* Card A: Your Success Starts Here! */}
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,padding:'24px 18px',
                        boxShadow:`0 2px 10px rgba(0,0,0,${cd?.12:.04})`}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                          <div style={{flexShrink:0}}>
                            <svg width="54" height="54" viewBox="0 0 44 44" fill="none">
                              <circle cx="22" cy="22" r="22" fill={cd?'rgba(251,191,36,.1)':'rgba(251,191,36,.16)'}/>
                              <path d="M13.5 11h11v8.5a5.5 5.5 0 0 1-11 0V11z" fill={cd?'#d97706':'#f59e0b'}/>
                              <path d="M10.5 12.5h3v4.5a3.5 3.5 0 0 1-3 0v-4.5z" fill={cd?'#b45309':'#d97706'} opacity=".8"/>
                              <path d="M24.5 12.5h3v4.5a3.5 3.5 0 0 1-3 0v-4.5z" fill={cd?'#b45309':'#d97706'} opacity=".8"/>
                              <rect x="19.5" y="23.5" width="5" height="4.5" rx="1" fill={cd?'#d97706':'#f59e0b'}/>
                              <rect x="15" y="28" width="14" height="3" rx="1.5" fill={cd?'#d97706':'#f59e0b'}/>
                              <path d="M18 17L19.5 13.5L21 17L24.5 17.5L22 20L22.5 24L19.5 22.3L16.5 24L17 20L14.5 17.5Z" fill={cd?'#fef08a':'#fde68a'} opacity=".85"/>
                            </svg>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14.5,fontWeight:900,color:_t,lineHeight:1.25,marginBottom:8}}>Your Success Starts Here!</div>
                            <div style={{fontSize:12,color:_m,lineHeight:1.7}}>Join thousands of students who are preparing smarter with MockTest. Your journey to success begins today.</div>
                          </div>
                        </div>
                      </div>

                      {/* Card B: Today's Motivation */}
                      <div style={{borderRadius:14,
                        background:cd?'linear-gradient(135deg,#1a0814 0%,#220c1a 100%)':'linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%)',
                        border:`1px solid ${cd?'rgba(236,72,153,.15)':'rgba(236,72,153,.18)'}`,
                        padding:'20px 18px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                          <div style={{width:30,height:30,borderRadius:9,background:'rgba(236,72,153,.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          </div>
                          <div style={{fontSize:12.5,fontWeight:800,color:cd?'rgba(255,180,220,.9)':'#9d174d'}}>Today's Motivation</div>
                        </div>
                        <div style={{fontSize:12.5,color:cd?'rgba(255,200,230,.8)':'rgba(157,23,77,.75)',lineHeight:1.8,fontStyle:'italic',paddingLeft:2}}>
                          <span style={{fontSize:20,color:cd?'rgba(236,72,153,.5)':'rgba(236,72,153,.4)',lineHeight:1,marginRight:4,verticalAlign:'top',fontStyle:'normal'}}>{'"'}</span>
                          {(d=>{const q=['Discipline today creates the results you\'ll be proud of tomorrow.','Every expert was once a beginner — keep going.','Success is the sum of small efforts, repeated every day.','Your only limit is you — push beyond it.','The secret of getting ahead is getting started.','Believe you can and you\'re halfway there.','Don\'t stop when you\'re tired. Stop when you\'re done.','The harder you work, the luckier you get.','Champions are made in the quiet hours of practice.','One day you\'ll look back and thank yourself for not giving up.','Progress, not perfection — each step forward counts.','Your future is created by what you do today, not tomorrow.','Consistency is the bridge between goals and achievement.','Push yourself — no one else is going to do it for you.','The pain of discipline is far less than the pain of regret.','Every study session is an investment in your future.','Greatness is earned through relentless effort, not given.','Setbacks are setups for comebacks.','Your education is the one thing no one can take from you.','Hard work beats talent when talent doesn\'t work hard.','The best time to start was yesterday. The next best time is now.','A little progress each day adds up to big results.','Motivation gets you started — habit keeps you going.','Success doesn\'t come from what you do occasionally.','Doubt kills more dreams than failure ever will.','An investment in knowledge pays the best interest.','The difference between ordinary and extraordinary is that little extra.','You are capable of far more than you imagine.','Small daily improvements lead to stunning long-term results.','Stay patient and trust the process — your time is coming.'];return q[d%q.length]})(Math.floor((+new Date()- +(new Date(new Date().getFullYear(),0,1)))/864e5))}
                          <span style={{fontSize:20,color:cd?'rgba(236,72,153,.5)':'rgba(236,72,153,.4)',lineHeight:1,marginLeft:4,verticalAlign:'bottom',fontStyle:'normal'}}>{'"'}</span>
                        </div>
                      </div>

                      {/* Card C: Your Preparation Journey */}
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,padding:'18px 16px'}}>
                        <div style={{fontSize:12,fontWeight:800,color:_t,marginBottom:14}}>Your Preparation Journey</div>
                        {[
                          {n:1,col:'#FF653F',label:'Choose Your Exam',desc:'Select your target exam from the categories above.',
                            icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>},
                          {n:2,col:'#3b82f6',label:'Take Your First Mock',desc:'Experience real exam patterns with full-length timed tests.',
                            icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
                          {n:3,col:'#16a34a',label:'Track Your Progress',desc:'Identify strengths, improve weak areas, and achieve your goal.',
                            icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
                        ].map((step,si,arr)=>(
                          <div key={si} style={{display:'flex',gap:10,position:'relative'}}>
                            {si<arr.length-1&&<div style={{position:'absolute',left:13,top:28,width:2,height:'calc(100% - 14px)',background:cd?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)',zIndex:0}}/>}
                            <div style={{width:26,height:26,borderRadius:'50%',background:_a,
                              display:'flex',alignItems:'center',justifyContent:'center',
                              flexShrink:0,zIndex:1,color:'#fff'}}>
                              <span style={{fontSize:11,fontWeight:900}}>{step.n}</span>
                            </div>
                            <div style={{width:26,height:26,borderRadius:8,background:`${step.col}15`,display:'flex',alignItems:'center',justifyContent:'center',color:step.col,flexShrink:0,zIndex:1}}>
                              {step.icon}
                            </div>
                            <div style={{flex:1,paddingBottom:si<arr.length-1?20:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:_t,lineHeight:1.2,marginBottom:4}}>{step.label}</div>
                              <div style={{fontSize:10.5,color:_m,lineHeight:1.6}}>{step.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card D: Need Help? */}
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,padding:'18px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                          <div style={{width:30,height:30,borderRadius:9,background:cd?'rgba(255,255,255,.06)':'rgba(59,130,246,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{fontSize:12.5,fontWeight:800,color:_t,lineHeight:1.2}}>Need Help?</div>
                            <div style={{fontSize:10.5,color:_m,marginTop:1}}>Guides and support at your fingertips</div>
                          </div>
                        </div>
                        {[
                          {label:'Getting Started Guide',sub:'Learn how to use MockTest',col:'#3b82f6',act:()=>setActiveTab('explore'),
                            icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>},
                          {label:'Contact Support',sub:'We\'re here to help you',col:'#8b5cf6',act:()=>setActiveTab('profile'),
                            icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
                        ].map((item,ii)=>(
                          <button key={ii} onClick={item.act}
                            style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,border:`1px solid ${_b}`,background:cd?'rgba(255,255,255,.03)':'rgba(0,0,0,.02)',cursor:'pointer',transition:'all .15s',textAlign:'left',width:'100%',marginBottom:ii===0?10:0}}
                            onMouseOver={e=>{e.currentTarget.style.borderColor=item.col+'55';e.currentTarget.style.background=`${item.col}08`}}
                            onMouseOut={e=>{e.currentTarget.style.borderColor=_b;e.currentTarget.style.background=cd?'rgba(255,255,255,.03)':'rgba(0,0,0,.02)'}}>
                            <div style={{width:30,height:30,borderRadius:8,background:`${item.col}12`,display:'flex',alignItems:'center',justifyContent:'center',color:item.col,flexShrink:0}}>
                              {item.icon}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:_t,lineHeight:1.2}}>{item.label}</div>
                              <div style={{fontSize:10.5,color:_m,marginTop:1}}>{item.sub}</div>
                            </div>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={_m} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        ))}
                      </div>

                    </div></div>
                  </div>
                </>
              )

              return <>
                <style>{`
                  .db-card{background:${_s};border:1px solid ${_b};border-radius:14px}
                  .db-ctitle{font-size:13px;font-weight:700;color:${_t};margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
                  .db-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
                  .db-hero-row{display:grid;grid-template-columns:1fr 260px;gap:14px;margin-bottom:18px;align-items:stretch}
                  .db-three{display:grid;grid-template-columns:1fr 250px;gap:16px;align-items:start}
                  .db-sec-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
                  .db-perf-table{width:100%;border-collapse:collapse}
                  .db-perf-table tr:not(:last-child) td{border-bottom:1px solid ${_b}}
                  .db-perf-table td{padding:9px 6px 9px 0;font-size:12px;vertical-align:middle}
                  .db-sec-avgscore{display:table-cell}
                  .db-rt-rank{display:table-cell}.db-rt-date{display:table-cell}.db-rt-score{display:table-cell}
                  @media(max-width:1200px){.db-three{grid-template-columns:1fr 220px!important}.db-hero-row{grid-template-columns:1fr 200px!important}}
                  @media(max-width:980px){.db-three{grid-template-columns:1fr!important}.db-hero-row{grid-template-columns:1fr!important}}
                  @media(max-width:700px){.db-sec-row{grid-template-columns:1fr!important}}
                  @media(max-width:640px){.db-stat-grid{grid-template-columns:1fr 1fr!important}}
                  @media(max-width:600px){.hero-illus{display:none!important}.db-hero-row{margin-bottom:12px!important}.db-card{border-radius:10px}.db-ctitle{font-size:12px}.db-ctitle button,.db-ctitle a{font-size:10px!important}.db-rt-rank{display:none!important}}
                  @media(max-width:480px){.db-sec-avgscore{display:none!important}.db-rt-date{display:none!important}}
                  @media(max-width:380px){.db-stat-grid{grid-template-columns:1fr!important}.db-rt-score{display:none!important}}
                `}</style>

                {/* ── TOP ROW: Hero + Next Exam Date ── */}
                <div className="db-hero-row">
                  {/* Hero Banner */}
                  <div style={{position:'relative',borderRadius:18,overflow:'hidden',
                    background:cd?'linear-gradient(135deg,#1a0e08 0%,#2a1510 100%)':'linear-gradient(135deg,#fff8f5 0%,#fff0e8 100%)',
                    border:`1px solid ${cd?'rgba(255,101,63,.15)':'#ffdece'}`,
                    boxShadow:cd?'0 2px 20px rgba(0,0,0,.35)':'0 4px 24px rgba(255,101,63,.08)',
                    padding:'24px 24px 24px 30px',minHeight:160}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,background:'linear-gradient(180deg,#FF653F,#ff9c68)'}}/>
                    <div style={{position:'absolute',top:-50,right:-30,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,101,63,.1) 0%,transparent 70%)',pointerEvents:'none'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:12,position:'relative'}}>
                      <div style={{flex:'1 1 auto',minWidth:0,maxWidth:'62%'}}>
                        <h1 style={{fontSize:21,fontWeight:900,color:cd?'#fff':_t,letterSpacing:'-.03em',lineHeight:1.25,margin:'0 0 6px'}}>
                          {greeting}, {firstName}! 👋
                        </h1>
                        <p style={{margin:'0 0 14px',fontSize:12.5,color:_m,lineHeight:1.65,maxWidth:400}}>
                          {history.length>0
                            ?`Keep going! You've completed ${history.length} mock test${history.length===1?'':'s'}. Your consistency is paying off.`
                            :'Welcome! Start your first mock test and begin tracking your progress.'}
                        </p>
                        <button onClick={()=>setActiveTab('explore')}
                          style={{display:'inline-flex',alignItems:'center',gap:8,background:cd?'rgba(255,101,63,.15)':'#fff',border:`1px solid ${cd?'rgba(255,101,63,.3)':'rgba(255,101,63,.22)'}`,borderRadius:10,padding:'7px 13px',cursor:'pointer',transition:'all .15s'}}
                          onMouseOver={e=>{e.currentTarget.style.borderColor=_a;e.currentTarget.style.background=cd?'rgba(255,101,63,.25)':'rgba(255,101,63,.06)'}}
                          onMouseOut={e=>{e.currentTarget.style.borderColor=cd?'rgba(255,101,63,.3)':'rgba(255,101,63,.22)';e.currentTarget.style.background=cd?'rgba(255,101,63,.15)':'#fff'}}>
                          <div style={{width:24,height:24,borderRadius:6,background:_a,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                          </div>
                          <div style={{textAlign:'left'}}>
                            <div style={{fontSize:9,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em'}}>Your Target Exam</div>
                            <div style={{fontSize:12.5,fontWeight:800,color:cd?'rgba(255,210,180,.9)':_t}}>{selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||selectedGroup?.label||'Select an exam'} →</div>
                          </div>
                        </button>
                      </div>
                      {/* Hero illustration — hidden below 600px to keep banner compact */}
                      <div className="hero-illus" style={{flexShrink:0,position:'relative',alignSelf:'flex-end'}}>
                        <div style={{position:'absolute',top:'-10px',right:'10px',textAlign:'right',lineHeight:1.45,pointerEvents:'none'}}>
                          <div style={{fontSize:11,fontWeight:800,fontStyle:'italic',color:cd?'rgba(255,200,100,.8)':'#FF653F',textShadow:cd?'none':'0 1px 4px rgba(255,101,63,.2)'}}>Practice Today</div>
                          <div style={{fontSize:10.5,fontWeight:700,fontStyle:'italic',color:cd?'rgba(255,200,100,.65)':'rgba(255,101,63,.75)'}}>Get Closer</div>
                          <div style={{fontSize:10.5,fontWeight:700,fontStyle:'italic',color:cd?'rgba(255,200,100,.65)':'rgba(255,101,63,.75)'}}>To Your Goal! →</div>
                        </div>
                        <img
                          src="/hero-student.webp"
                          alt="Study illustration"
                          style={{
                            height:148,
                            width:'auto',
                            display:'block',
                            objectFit:'contain',
                            objectPosition:'bottom',
                            filter:cd?'brightness(.85) saturate(.9)':'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Next Exam Date */}
                  <div className="db-card" style={{padding:'18px 20px',display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:8,background:cd?'rgba(255,101,63,.12)':'rgba(255,101,63,.09)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={_a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                      </div>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.08em'}}>Next Exam Date</div>
                        <div style={{fontSize:12.5,fontWeight:800,color:_t,lineHeight:1.2}}>{selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||selectedGroup?.label||'—'}</div>
                      </div>
                    </div>
                    {savedPlan?.exam_date ? (() => {
                      const ed=new Date(savedPlan.exam_date), msLeft=Math.max(0,ed-clockNow)
                      const dL=Math.floor(msLeft/86400000)
                      const hL=Math.floor((msLeft%86400000)/3600000)
                      const mL=Math.floor((msLeft%3600000)/60000)
                      const sL=Math.floor((msLeft%60000)/1000)
                      return <>
                        <div style={{fontSize:11,color:_m,marginBottom:10}}>{ed.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
                          {[{v:dL,l:'Days'},{v:hL,l:'Hours'},{v:mL,l:'Mins'},{v:sL,l:'Secs'}].map(({v,l})=>(
                            <div key={l} style={{textAlign:'center',background:cd?'rgba(255,255,255,.05)':'#f9fafb',borderRadius:8,padding:'8px 3px'}}>
                              <div style={{fontSize:20,fontWeight:900,color:_a,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{String(v).padStart(2,'0')}</div>
                              <div style={{fontSize:9,color:_m,marginTop:3,fontWeight:600}}>{l}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    })() : (
                      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,paddingBottom:8}}>
                        <div style={{fontSize:11.5,color:_m,textAlign:'center',lineHeight:1.55}}>Set your exam date in the Study Planner to see the countdown</div>
                        <button onClick={()=>setActiveTab('studyplan')} style={{background:_a,color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Set Date →</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── MAIN LAYOUT (main-area + right sidebar) ── */}
                <div className="db-three">

                  {/* MAIN AREA */}
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>

                    {/* ── STATS ROW (inside main area so right col aligns with hero right) ── */}
                    <div className="db-stat-grid">
                      {[
                        {label:'Tests Completed',value:history.length,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={_a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>,
                          trend:testsTrend!=null?`${testsTrend>=0?'↑':'↓'} ${Math.abs(testsTrend)}%`:null,trendUp:testsTrend==null||testsTrend>=0,sub:'vs last month',col:_a},
                        {label:'Average Score',value:`${avg||0}%`,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                          trend:avgTrend!=null?`${avgTrend>=0?'↑':'↓'} ${Math.abs(avgTrend)}%`:null,trendUp:avgTrend==null||avgTrend>=0,sub:'vs last month',col:'#16a34a'},
                        {label:'Accuracy',value:`${accuracyPct}%`,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="#3b82f6"/></svg>,
                          trend:null,sub:`${totalCorrect}/${totalQ} correct`,col:'#3b82f6'},
                        {label:'Day Streak',value:streak,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                          trend:streak>0?`↑ ${streak}d`:null,trendUp:true,sub:'Keep it up!',col:'#d97706'},
                      ].map((s,si)=>(
                        <div key={si} className="db-card" style={{padding:'10px 14px'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                            <div style={{width:28,height:28,borderRadius:8,background:`${s.col}14`,display:'flex',alignItems:'center',justifyContent:'center'}}>{s.icon}</div>
                            {s.trend&&<span style={{fontSize:9.5,fontWeight:700,color:s.trendUp?'#16a34a':'#dc2626',background:s.trendUp?'rgba(22,163,74,.08)':'rgba(220,38,38,.08)',borderRadius:99,padding:'1px 6px'}}>{s.trend}</span>}
                          </div>
                          <div style={{fontSize:22,fontWeight:900,color:_t,lineHeight:1,fontVariantNumeric:'tabular-nums',marginBottom:2}}>{s.value}</div>
                          <div style={{fontSize:10.5,fontWeight:700,color:_t,marginBottom:1}}>{s.label}</div>
                          <div style={{fontSize:9.5,color:_m}}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Top row: Continue Prep + Performance Chart side by side */}
                    <div className="db-sec-row">

                    {/* Continue Your Preparation */}
                    <div className="db-card" style={{padding:'18px 20px'}}>
                      <div className="db-ctitle">Continue Your Preparation</div>
                      {history.length>0 ? (()=>{
                        const nr=(examResults.length||history.length)+1
                        const examName2=selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||'Mock Test'
                        const totalQs=(selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.questions)||100
                        return <>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                            <span style={{fontSize:10,fontWeight:800,color:'#16a34a',background:'rgba(22,163,74,.1)',borderRadius:5,padding:'3px 8px',letterSpacing:'.04em',flexShrink:0}}>IN PROGRESS</span>
                            <span style={{fontSize:13,fontWeight:800,color:_t,lineHeight:1.3}}>{examName2} – Full Length Mock {nr}</span>
                          </div>
                          <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:12}}>
                            {[
                              {icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>,txt:`${totalQs} Questions`},
                              {icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,txt:'60 Minutes'},
                              {icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,txt:'Full Pattern'},
                            ].map((it,ii)=>(
                              <span key={ii} style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:_m}}>{it.icon}{it.txt}</span>
                            ))}
                          </div>
                          <div style={{height:5,background:cd?'rgba(255,255,255,.07)':'#f0f0f0',borderRadius:99,overflow:'hidden',marginBottom:4}}>
                            <div style={{height:'100%',width:`${Math.min(95,Math.max(10,Math.round(lastPct*0.35+15)))}%`,background:'linear-gradient(90deg,#FF653F,#ff8a5f)',borderRadius:99}}/>
                          </div>
                          <div style={{fontSize:10.5,color:_m,marginBottom:14}}>Ready to start your next test</div>
                          <div style={{display:'flex',gap:10}}>
                            <button onClick={()=>onStartTest?.('mock',selectedExamId)}
                              style={{flex:1,background:_a,color:'#fff',border:'none',borderRadius:9,padding:'10px 16px',fontWeight:800,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              Continue Test →
                            </button>
                            <button onClick={()=>onOpenResult?.(lastTest)}
                              style={{background:'none',color:_a,border:`1px solid ${cd?'rgba(255,101,63,.3)':'rgba(255,101,63,.25)'}`,borderRadius:9,padding:'10px 16px',fontWeight:700,fontSize:13,cursor:'pointer',whiteSpace:'nowrap'}}>
                              View Details
                            </button>
                          </div>
                        </>
                      })() : (
                        <div style={{textAlign:'center',padding:'14px 0'}}>
                          <div style={{fontSize:12,color:_m,marginBottom:12}}>No tests yet. Start your first mock test to begin tracking your progress.</div>
                          <button onClick={()=>onStartTest?.('mock',selectedExamId)} style={{background:_a,color:'#fff',border:'none',borderRadius:9,padding:'10px 20px',fontWeight:800,fontSize:13,cursor:'pointer'}}>Start First Test →</button>
                        </div>
                      )}
                    </div>

                    {/* Your Recent Performance Chart */}
                    <div className="db-card" style={{padding:'18px 20px'}}>
                      <div className="db-ctitle">
                        Your Recent Performance
                        <div style={{display:'flex',gap:12}}>
                          {[{col:'#FF653F',lbl:'Score %'},{col:'#3b82f6',lbl:'Accuracy %'}].map(l=>(
                            <span key={l.lbl} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,fontWeight:700,color:_m}}>
                              <span style={{width:12,height:12,borderRadius:3,background:l.col,display:'inline-block',flexShrink:0}}/>
                              {l.lbl}
                            </span>
                          ))}
                        </div>
                      </div>
                      {chartResults.length>0 ? (
                        <div style={{width:'100%',overflow:'hidden'}}>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                              data={chartResults.map((r,i)=>({
                                name: chartResults.length<=6
                                  ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
                                  : `T${i+1}`,
                                Score: Math.round(r.percentage||0),
                                Accuracy: ((r.correct_count||0)+(r.wrong_count||0))>0
                                  ? Math.round((r.correct_count||0)/((r.correct_count||0)+(r.wrong_count||0))*100)
                                  : 0
                              }))}
                              margin={{top:18,right:20,bottom:4,left:-20}}
                              barCategoryGap="28%"
                              barGap={3}>
                              <CartesianGrid strokeDasharray="3 3" stroke={cd?'rgba(255,255,255,.06)':'#f0f0f0'} vertical={false}/>
                              <XAxis dataKey="name" tick={{fontSize:9,fill:_m}} tickLine={false} axisLine={false}/>
                              <YAxis tick={{fontSize:9,fill:_m}} tickLine={false} axisLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                              <Tooltip
                                cursor={{fill:cd?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'}}
                                contentStyle={{background:_s,border:`1px solid ${_b}`,borderRadius:10,fontSize:11,padding:'8px 12px'}}
                                labelStyle={{color:_t,fontWeight:700,marginBottom:4}}
                                formatter={(val,name)=>[`${val}%`, name]}
                              />
                              <Bar dataKey="Score" fill="#FF653F" radius={[4,4,0,0]} maxBarSize={22}
                                label={{position:'top',fontSize:9,fontWeight:700,fill:'#FF653F',formatter:v=>`${v}%`}}/>
                              <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={22}
                                label={{position:'top',fontSize:9,fontWeight:700,fill:'#3b82f6',formatter:v=>`${v}%`}}/>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div style={{height:160,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:_m}}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={_m} strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                          <span style={{fontSize:12}}>Take a test to see your performance</span>
                        </div>
                      )}
                    </div>

                    </div>{/* end top db-sec-row */}

                    {/* Section-wise + Topic side by side */}
                    <div className="db-sec-row">

                      {/* Section-wise Performance */}
                      <div className="db-card" style={{padding:'18px 20px'}}>
                        <div className="db-ctitle">
                          Section-wise Performance
                          <button onClick={()=>setActiveTab('performance')} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0,whiteSpace:'nowrap',flexShrink:0}}>View Detailed Analysis →</button>
                        </div>
                        {topicPerfArr.length>0 ? (
                          <div style={{overflowX:'auto'}}>
                          <table style={{width:'100%',borderCollapse:'collapse',minWidth:260}}>
                            <thead>
                              <tr style={{borderBottom:`1px solid ${_b}`}}>
                                <td style={{padding:'0 8px 10px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Section</td>
                                <td style={{padding:'0 8px 10px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Accuracy</td>
                                <td className="db-sec-avgscore" style={{padding:'0 8px 10px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Avg Score</td>
                                <td style={{padding:'0 8px 10px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Status</td>
                              </tr>
                            </thead>
                            <tbody>
                              {topicPerfArr.slice(0,5).map((tp,ti,arr)=>{
                                const status=tp.accuracy>=75?{lbl:'Strong',col:'#16a34a',bg:'rgba(22,163,74,.12)'}
                                  :tp.accuracy>=60?{lbl:'Good',col:'#3b82f6',bg:'rgba(59,130,246,.12)'}
                                  :tp.accuracy>=45?{lbl:'Improve',col:'#d97706',bg:'rgba(217,119,6,.12)'}
                                  :{lbl:'Focus',col:'#dc2626',bg:'rgba(220,38,38,.12)'}
                                const accCol=tp.accuracy>=75?'#16a34a':tp.accuracy>=60?'#3b82f6':tp.accuracy>=45?'#d97706':'#dc2626'
                                const barCol=tp.accuracy>=60?'linear-gradient(90deg,#16a34a,#4ade80)':tp.accuracy>=45?'linear-gradient(90deg,#d97706,#fbbf24)':'linear-gradient(90deg,#dc2626,#f97316)'
                                const n=sectionAgg[Object.keys(sectionAgg).find(k=>k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())===tp.topic)]?.n||1
                                const avgC=Math.round(tp.correct/n)
                                const avgT=Math.round(tp.total/n)
                                return (
                                  <tr key={ti} style={{borderBottom:ti<arr.length-1?`1px solid ${_b}`:'none'}}>
                                    <td style={{padding:'10px 8px 10px 0',fontSize:12.5,fontWeight:600,color:_t,maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tp.topic}</td>
                                    <td style={{padding:'10px 8px 10px 0',whiteSpace:'nowrap'}}>
                                      <span style={{fontSize:13,fontWeight:800,color:accCol}}>{tp.accuracy}%</span>
                                    </td>
                                    <td className="db-sec-avgscore" style={{padding:'10px 8px 10px 0',minWidth:80}}>
                                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                                        <div style={{flex:1,height:6,background:cd?'rgba(255,255,255,.07)':'#f0f0f0',borderRadius:99,overflow:'hidden',minWidth:36}}>
                                          <div style={{height:'100%',width:`${tp.accuracy}%`,background:barCol,borderRadius:99,transition:'width .6s'}}/>
                                        </div>
                                        <span style={{fontSize:10.5,fontWeight:700,color:_t,whiteSpace:'nowrap',flexShrink:0}}>{avgC}/{avgT}</span>
                                      </div>
                                    </td>
                                    <td style={{padding:'10px 0',whiteSpace:'nowrap'}}>
                                      <span style={{fontSize:10,fontWeight:700,color:status.col,background:status.bg,borderRadius:6,padding:'3px 7px'}}>{status.lbl}</span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          </div>
                        ) : (
                          <div style={{textAlign:'center',padding:'18px 0',color:_m,fontSize:12}}>Take tests to see section-wise performance analysis</div>
                        )}
                      </div>

                      {/* Topic Strengths & Weaknesses */}
                      <div className="db-card" style={{padding:'18px 20px'}}>
                        <div className="db-ctitle">
                          Topic-wise Strengths & Weaknesses
                          <button onClick={()=>setActiveTab('performance')} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0,whiteSpace:'nowrap',flexShrink:0}}>View All →</button>
                        </div>
                        {topicPerfArr.length>0 ? (
                          <>
                            {/* Interactive tabs */}
                            <div style={{display:'flex',gap:6,marginBottom:14}}>
                              {[{key:'weak',lbl:'Need Improvement'},{key:'strong',lbl:'Strong Topics'}].map(({key,lbl})=>{
                                const isAct=topicTab===key
                                return (
                                  <button key={key} onClick={()=>setTopicTab(key)}
                                    style={{padding:'5px 12px',borderRadius:7,border:`1.5px solid ${isAct?_a:cd?'rgba(255,255,255,.15)':'#e5e7eb'}`,cursor:'pointer',fontSize:11,fontWeight:700,
                                      background:isAct?_a:'transparent',color:isAct?'#fff':_m,transition:'all .15s'}}>
                                    {lbl}
                                  </button>
                                )
                              })}
                            </div>
                            {/* Topic list */}
                            {(() => {
                              const ICONS=[
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                              ]
                              const showArr = topicTab==='weak'
                                ? (weakTopicArr.length>0 ? weakTopicArr : topicPerfArr.slice(0,5))
                                : (strongTopicArr.length>0 ? strongTopicArr : topicPerfArr.slice(0,5))
                              if (showArr.length===0) return (
                                <div style={{textAlign:'center',padding:'16px 0',color:_m,fontSize:12}}>
                                  {topicTab==='weak'?'All sections look good!':'Keep practicing to build strong topics'}
                                </div>
                              )
                              return (
                                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                                  {showArr.slice(0,5).map((tp,ti)=>{
                                    const isWeak=tp.accuracy<65
                                    const barCol=isWeak?'linear-gradient(90deg,#f97316,#fbbf24)':'linear-gradient(90deg,#16a34a,#4ade80)'
                                    const iconCol=isWeak?'#f97316':'#16a34a'
                                    const iconBg=isWeak?'rgba(249,115,22,.12)':'rgba(22,163,74,.12)'
                                    return (
                                      <div key={ti}>
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                                          <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                                            <div style={{width:24,height:24,borderRadius:7,background:iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:iconCol,flexShrink:0}}>
                                              {ICONS[ti%ICONS.length]}
                                            </div>
                                            <span style={{fontSize:12.5,fontWeight:600,color:_t,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tp.topic}</span>
                                          </div>
                                          <span style={{fontSize:13,fontWeight:800,color:isWeak?'#f97316':'#16a34a',flexShrink:0,marginLeft:8}}>{tp.accuracy}%</span>
                                        </div>
                                        <div style={{height:7,background:cd?'rgba(255,255,255,.07)':'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                                          <div style={{height:'100%',width:`${tp.accuracy}%`,background:barCol,borderRadius:99,transition:'width .7s'}}/>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}
                          </>
                        ) : (
                          <div style={{textAlign:'center',padding:'20px 0',color:_m,fontSize:12}}>Take tests to see topic-wise analysis</div>
                        )}
                      </div>

                    </div>

                    {/* Recent Tests */}
                    <div className="db-card" style={{padding:'18px 20px',overflowX:'auto'}}>
                      <div className="db-ctitle">
                        Recent Tests
                        <button onClick={()=>setActiveTab('performance')} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0,whiteSpace:'nowrap',flexShrink:0}}>View All Tests →</button>
                      </div>
                      {history.length>0 ? (
                        <table style={{width:'100%',borderCollapse:'collapse',minWidth:260}}>
                          <thead>
                            <tr style={{borderBottom:`1px solid ${_b}`}}>
                              <td style={{padding:'0 6px 8px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Test Name</td>
                              <td className="db-rt-date" style={{padding:'0 6px 8px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Date</td>
                              <td className="db-rt-score" style={{padding:'0 6px 8px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Score</td>
                              <td style={{padding:'0 6px 8px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Accuracy</td>
                              <td className="db-rt-rank" style={{padding:'0 6px 8px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Rank</td>
                              <td style={{padding:'0 6px 8px 0',fontSize:9.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>Action</td>
                            </tr>
                          </thead>
                          <tbody>
                            {history.slice(0,3).map((r,i,arr)=>{
                              const pct=Math.round(r.percentage||0)
                              const tot2=(r.correct_count||0)+(r.wrong_count||0)
                              const acc=tot2>0?Math.round((r.correct_count||0)/tot2*100):0
                              const nm=r.test_type==='topic_diagnostic'?`Topic · ${_toT2(r.topic||'')}`:r.test_type==='mini'?`Practice · ${_toT2(r.section||'')}`:_toT2(r.exam||'Mock')
                              const dt=new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'})
                              const maxQ=(selectedGroup?.exams?.find(e=>e.id===r.exam)?.questions)||200
                              const peerPct=r.peer_comparison?.peer_percentile||null
                              const rankNum=peerPct?.rank||null
                              const rankTotal=peerPct?.total_candidates||null
                              return (
                                <tr key={i} style={{borderBottom:i<arr.length-1?`1px solid ${_b}`:'none'}}>
                                  <td style={{padding:'9px 6px 9px 0',fontSize:12,fontWeight:600,color:_t,maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{nm}</td>
                                  <td className="db-rt-date" style={{padding:'9px 6px',fontSize:11,color:_m,whiteSpace:'nowrap'}}>{dt}</td>
                                  <td className="db-rt-score" style={{padding:'9px 6px',fontSize:12,fontWeight:800,color:pct>=60?'#16a34a':'#f97316',whiteSpace:'nowrap'}}>{r.correct_count||pct}/{maxQ}</td>
                                  <td style={{padding:'9px 6px',fontSize:12,fontWeight:700,color:acc>=60?'#16a34a':'#f97316'}}>{acc}%</td>
                                  <td className="db-rt-rank" style={{padding:'9px 6px',whiteSpace:'nowrap'}}>
                                    {rankNum&&rankTotal
                                      ? <span style={{fontSize:11,fontWeight:700,color:'#6366f1'}}>#{rankNum}<span style={{fontSize:10,fontWeight:500,color:_m}}> / {rankTotal}</span></span>
                                      : <span style={{fontSize:11,color:_m}}>—</span>
                                    }
                                  </td>
                                  <td style={{padding:'9px 0'}}>
                                    <button onClick={()=>onOpenResult?.(r)} style={{fontSize:11,fontWeight:700,color:'#fff',background:_a,border:'none',borderRadius:6,padding:'4px 8px',cursor:'pointer',whiteSpace:'nowrap'}}>View</button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{textAlign:'center',padding:'14px 0',color:_m,fontSize:12}}>No tests yet. Take your first test to see results here.</div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div style={{display:'flex',flexDirection:'column',gap:14}}>

                    {/* Today's Goal */}
                    <div className="db-card" style={{padding:'16px 18px'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                        <div style={{fontSize:13,fontWeight:700,color:_t}}>Today's Goal</div>
                        <button onClick={()=>setActiveTab('studyplan')} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0}}>Edit Goal</button>
                      </div>
                      <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:12}}>
                        <div style={{width:32,height:32,borderRadius:8,background:'rgba(59,130,246,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="#3b82f6"/></svg>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:_t,lineHeight:1.55}}>
                          {savedPlan?'Complete today\'s study session and 1 topic practice':'Complete 1 mock test and 2 topic practice sessions'}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                        <div style={{flex:1,height:4,background:cd?'rgba(255,255,255,.07)':'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${testsToday>0?Math.min(100,Math.round(testsToday/3*100)):0}%`,background:'linear-gradient(90deg,#3b82f6,#60a5fa)',borderRadius:99,transition:'width .5s'}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:_t,flexShrink:0}}>{testsToday} / 3</span>
                      </div>
                      <div style={{fontSize:10.5,color:_m}}>{testsToday===0?'⚡ Start a test to hit today\'s goal':`${testsToday} of 3 done today — keep going!`}</div>
                    </div>

                    {/* Recommended for You */}
                    <div className="db-card" style={{padding:'16px 18px'}}>
                      <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:12}}>Recommended for You</div>
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {[
                          ...(weakTopicArr.slice(0,2).map((t,i)=>({col:i===0?'#FF653F':'#8b5cf6',label:t.topic,sub:`Practice more ${t.topic} questions`,act:()=>onStartTest?.('topic',selectedExamId),icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg>}))),
                          {col:'#16a34a',label:'Take a Full Mock Test',sub:`${selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||'Full Test'} – Next`,act:()=>onStartTest?.('mock',selectedExamId),icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
                        ].slice(0,3).map((rec,ri)=>(
                          <button key={ri} onClick={rec.act}
                            style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:10,border:`1px solid ${_b}`,background:cd?'rgba(255,255,255,.03)':'#fafafa',cursor:'pointer',textAlign:'left',width:'100%',transition:'all .15s'}}
                            onMouseOver={e=>{e.currentTarget.style.borderColor=`${rec.col}55`;e.currentTarget.style.background=`${rec.col}08`}}
                            onMouseOut={e=>{e.currentTarget.style.borderColor=_b;e.currentTarget.style.background=cd?'rgba(255,255,255,.03)':'#fafafa'}}>
                            <div style={{width:30,height:30,borderRadius:8,background:`${rec.col}12`,display:'flex',alignItems:'center',justifyContent:'center',color:rec.col,flexShrink:0}}>{rec.icon}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11.5,fontWeight:700,color:_t,lineHeight:1.2,marginBottom:1}}>{rec.label}</div>
                              <div style={{fontSize:10.5,color:_m}}>{rec.sub}</div>
                            </div>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={_m} strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Study Plan Progress */}
                    {savedPlan ? (()=>{
                      const days=savedPlan.days||[], total=days.length
                      const completed=Object.values(completedDays).filter(Boolean).length
                      const pct=total?Math.round((completed/total)*100):0
                      const R=26,CIRC=+(2*Math.PI*R).toFixed(1),dash=+((pct/100)*CIRC).toFixed(1)
                      const next=days.filter(d=>!completedDays[d.day])[0]
                      const tasks=next?(next.topics||[]).slice(0,4):['Complete a mock test this week','Review weak topic areas']
                      return (
                        <div className="db-card" style={{padding:'16px 18px'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                            <div style={{fontSize:13,fontWeight:700,color:_t}}>Study Plan Progress</div>
                            <button onClick={()=>setActiveTab('studyplan')} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0}}>View Plan →</button>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                            <svg width="60" height="60" viewBox="0 0 60 60">
                              <circle cx="30" cy="30" r={R} fill="none" stroke={cd?'rgba(255,255,255,.08)':'#f0f0f0'} strokeWidth="5"/>
                              {pct>0&&<circle cx="30" cy="30" r={R} fill="none" stroke={_a} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${dash} ${CIRC}`} transform="rotate(-90 30 30)"/>}
                              <text x="30" y="34" textAnchor="middle" style={{fontSize:12,fontWeight:900,fill:_t}}>{pct}%</text>
                            </svg>
                            <div>
                              <div style={{fontSize:12,fontWeight:800,color:_t,marginBottom:3}}>Your study plan</div>
                              <div style={{fontSize:11,color:_m}}>{completed}/{total} days complete</div>
                              <div style={{fontSize:10.5,color:_m,marginTop:2}}>{total-completed} remaining</div>
                            </div>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:7}}>
                            {tasks.map((task,ti)=>(
                              <div key={ti} style={{display:'flex',alignItems:'center',gap:8,fontSize:11.5}}>
                                <div style={{width:16,height:16,borderRadius:'50%',border:`1.5px solid ${ti===0?'#16a34a':_b}`,background:ti===0?'#16a34a':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                  {ti===0&&<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <span style={{color:ti===0?_t:_m,lineHeight:1.3}}>{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })() : (
                      <div className="db-card" style={{padding:'16px 18px',textAlign:'center'}}>
                        <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:8}}>Study Plan</div>
                        <div style={{fontSize:11.5,color:_m,marginBottom:12,lineHeight:1.5}}>Create a personalized study plan to track your daily progress</div>
                        <button onClick={()=>setActiveTab('studyplan')} style={{background:_a,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Create Plan →</button>
                      </div>
                    )}

                    {/* Exam change */}
                    {hasChosenExam&&(
                      <div className="db-card" style={{padding:'14px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:changingExam?10:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:_t}}>Your Exam</div>
                          <button onClick={()=>setChangingExam(v=>!v)} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0}}>{changingExam?'Done':'Change'}</button>
                        </div>
                        {changingExam&&(
                          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                            {(isPro?ACTIVE_GROUPS:ACTIVE_GROUPS.filter(g=>g.id===selectedGroup?.id)).flatMap(g=>g.exams).slice(0,8).map(e=>(
                              <button key={e.id} onClick={()=>{if(!e.comingSoon)handleChangeExam(e.id)}} disabled={!!e.comingSoon}
                                style={{padding:'4px 9px',borderRadius:6,border:'1.5px solid',cursor:e.comingSoon?'not-allowed':'pointer',fontSize:11,fontWeight:700,opacity:e.comingSoon?.4:1,background:e.id===selectedExamId?_a:'transparent',borderColor:e.id===selectedExamId?_a:(cd?'rgba(255,255,255,.15)':'#e5e7eb'),color:e.id===selectedExamId?'#fff':(cd?'rgba(255,255,255,.7)':'#374151')}}>
                                {e.name}
                              </button>
                            ))}
                            {!isPro&&<button onClick={()=>onNav?.('subscriptions')} style={{marginTop:2,fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:'4px 0',width:'100%'}}>Unlock more exams →</button>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </>
            })()}

            {/* ── PRACTICE tab ── */}
            {activeTab === 'practice' && <>
              <h2 className="text-xl font-black text-gray-900 mb-1">Practice</h2>
              <p className="text-sm text-gray-500 mb-6">Choose a mode and launch your test</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {ACTIVE_MODES.map(m => (
                  <button key={m.id} onClick={() => onStartTest(m.id, selectedExamId)}
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
                        {exam.comingSoon ? (
                          <span className="text-xs font-bold px-4 py-1.5 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                            🔒 Question Bank Coming Soon
                          </span>
                        ) : (
                          <button onClick={()=>onStartTest('mock', exam.id)}
                            className="text-xs font-bold text-white rounded-lg px-4 py-1.5 hover:shadow-md transition-all whitespace-nowrap"
                            style={{ background:'#FF653F' }}
                            onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                            onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                            Start Mock Test →
                          </button>
                        )}
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

            {/* ── SETTINGS tab ── */}
            {activeTab === 'performance' && (
              <PerformancePage
                history={history}
                user={user}
                darkMode={document.documentElement.classList.contains('dark')}
                onNav={setActiveTab}
              />
            )}

            {activeTab === 'prediction' && (
              <PredictionPage
                history={history}
                user={user}
                darkMode={document.documentElement.classList.contains('dark')}
                onNav={setActiveTab}
              />
            )}

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

            {/* ── PROFILE tab ── */}
            {activeTab === 'profile' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-black mb-1" style={{color:_t}}>Your Profile</h2>
                <p className="text-sm mb-6" style={{color:_m}}>Manage your personal information and exam preferences</p>

                {/* Avatar + name row */}
                <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'20px 22px',marginBottom:16,display:'flex',alignItems:'center',gap:18}}>
                  <div style={{width:64,height:64,borderRadius:'50%',background:`${_a}18`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:24,color:_a,flexShrink:0,overflow:'hidden',position:'relative'}}>
                    {avatarUrl ? <img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (userName[0]||'U').toUpperCase()}
                    <label style={{position:'absolute',inset:0,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0)',transition:'background .15s'}}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,.35)'}
                      onMouseOut={e=>e.currentTarget.style.background='rgba(0,0,0,0)'}>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarUpload}/>
                    </label>
                  </div>
                  <div>
                    <div style={{fontWeight:800,fontSize:16,color:_t}}>{profileName || userName}</div>
                    <div style={{fontSize:12,color:_m,marginTop:2}}>{user?.email}</div>
                    <div style={{marginTop:6,padding:'3px 10px',background:isPro?`${_a}18`:(cd?'rgba(255,255,255,.07)':'#f1f5f9'),borderRadius:99,display:'inline-block',fontSize:10.5,fontWeight:800,color:isPro?_a:(cd?'rgba(255,255,255,.5)':'#64748b')}}>
                      {isPro ? plan.charAt(0).toUpperCase()+plan.slice(1)+' Plan' : `Free Trial · ${trialDaysLeft}d left`}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden',marginBottom:16}}>
                  {[
                    {label:'Full Name',      value:profileName,     set:setProfileName,     type:'text',    placeholder:'Your full name'},
                    {label:'Phone Number',   value:profilePhone,    set:setProfilePhone,    type:'tel',     placeholder:'+91 XXXXX XXXXX'},
                    {label:'Date of Birth',  value:profileDob,      set:setProfileDob,      type:'date',    placeholder:''},
                  ].map((f,i,arr)=>(
                    <div key={f.label} style={{padding:'14px 20px',borderBottom:i<arr.length-1?`1px solid ${_b}`:'none'}}>
                      <label style={{display:'block',fontSize:10.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>{f.label}</label>
                      <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                        style={{width:'100%',background:'none',border:'none',outline:'none',fontSize:13.5,fontWeight:500,color:_t,padding:0}}/>
                    </div>
                  ))}
                  <div style={{padding:'14px 20px',borderBottom:`1px solid ${_b}`}}>
                    <label style={{display:'block',fontSize:10.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Gender</label>
                    <select value={profileGender} onChange={e=>setProfileGender(e.target.value)}
                      style={{background:'none',border:'none',outline:'none',fontSize:13.5,fontWeight:500,color:_t,padding:0,width:'100%',cursor:'pointer'}}>
                      <option value="">Select gender</option>
                      {['Male','Female','Non-binary','Prefer not to say'].map(g=><option key={g} value={g.toLowerCase()}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{padding:'14px 20px'}}>
                    <label style={{display:'block',fontSize:10.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Category</label>
                    <select value={profileCategory} onChange={e=>setProfileCategory(e.target.value)}
                      style={{background:'none',border:'none',outline:'none',fontSize:13.5,fontWeight:500,color:_t,padding:0,width:'100%',cursor:'pointer'}}>
                      {['UR','OBC','SC','ST','EWS'].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <button onClick={handleSaveProfile} disabled={profileSaving}
                    style={{background:_a,color:'#fff',border:'none',borderRadius:10,padding:'11px 24px',fontWeight:800,fontSize:13,cursor:profileSaving?'default':'pointer',opacity:profileSaving?.6:1}}>
                    {profileSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                  {profileMsg && <span style={{fontSize:12.5,fontWeight:700,color:'#16a34a'}}>{profileMsg}</span>}
                </div>
              </div>
            )}

            {/* ── WEAK AREAS tab ── */}
            {activeTab === 'weakareas' && (
              <div>
                <h2 className="text-xl font-black mb-1" style={{color:_t}}>Weak Areas</h2>
                <p className="text-sm mb-6" style={{color:_m}}>Topics that need more practice based on your test history</p>
                {history.length === 0 ? (
                  <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'36px 24px',textAlign:'center'}}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={_m} strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 14px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div style={{fontWeight:800,fontSize:15,color:_t,marginBottom:6}}>No data yet</div>
                    <div style={{fontSize:13,color:_m,marginBottom:20}}>Take a few mock tests to see your weak areas here.</div>
                    <button onClick={()=>setActiveTab('explore')} style={{background:_a,color:'#fff',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:800,fontSize:13,cursor:'pointer'}}>Browse Exams</button>
                  </div>
                ) : (()=>{
                  const topicMap = {}
                  history.forEach(r => {
                    if (!r.topic_breakdown) return
                    Object.entries(r.topic_breakdown).forEach(([topic, data]) => {
                      if (!topicMap[topic]) topicMap[topic] = {correct:0,total:0}
                      topicMap[topic].correct += (data.correct || 0)
                      topicMap[topic].total   += (data.total   || 0)
                    })
                  })
                  const topics = Object.entries(topicMap)
                    .filter(([,d]) => d.total >= 3)
                    .map(([topic, d]) => ({topic, pct: Math.round((d.correct/d.total)*100), total:d.total}))
                    .sort((a,b) => a.pct - b.pct)
                  if (!topics.length) return (
                    <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'28px 24px',textAlign:'center'}}>
                      <div style={{fontWeight:700,fontSize:14,color:_t,marginBottom:6}}>Not enough topic data yet</div>
                      <div style={{fontSize:12.5,color:_m}}>Complete more tests with topic breakdowns to identify weak areas.</div>
                    </div>
                  )
                  const weak = topics.filter(t => t.pct < 60)
                  const ok   = topics.filter(t => t.pct >= 60)
                  return (
                    <div style={{display:'flex',flexDirection:'column',gap:16}}>
                      {weak.length > 0 && (
                        <div>
                          <div style={{fontSize:12.5,fontWeight:800,color:'#dc2626',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:'#dc2626',display:'inline-block'}}/>
                            Needs Attention ({weak.length} topics)
                          </div>
                          <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,overflow:'hidden'}}>
                            {weak.map((t,i)=>(
                              <div key={t.topic} style={{padding:'12px 18px',borderBottom:i<weak.length-1?`1px solid ${_b}`:'none',display:'flex',alignItems:'center',gap:14}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:4}}>{t.topic}</div>
                                  <div style={{height:5,background:cd?'rgba(255,255,255,.1)':'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                                    <div style={{height:'100%',width:`${t.pct}%`,background:t.pct<40?'#dc2626':'#f97316',borderRadius:99}}/>
                                  </div>
                                </div>
                                <div style={{fontWeight:900,fontSize:14,color:t.pct<40?'#dc2626':'#f97316',flexShrink:0,minWidth:40,textAlign:'right'}}>{t.pct}%</div>
                                <button onClick={()=>onStartTest?.('topic',selectedExamId)} style={{background:_a,color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontSize:11.5,fontWeight:800,cursor:'pointer',flexShrink:0}}>Practice</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ok.length > 0 && (
                        <div>
                          <div style={{fontSize:12.5,fontWeight:800,color:'#16a34a',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:'#16a34a',display:'inline-block'}}/>
                            Strong Areas ({ok.length} topics)
                          </div>
                          <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,overflow:'hidden'}}>
                            {ok.map((t,i)=>(
                              <div key={t.topic} style={{padding:'12px 18px',borderBottom:i<ok.length-1?`1px solid ${_b}`:'none',display:'flex',alignItems:'center',gap:14}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:4}}>{t.topic}</div>
                                  <div style={{height:5,background:cd?'rgba(255,255,255,.1)':'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                                    <div style={{height:'100%',width:`${t.pct}%`,background:'#16a34a',borderRadius:99}}/>
                                  </div>
                                </div>
                                <div style={{fontWeight:900,fontSize:14,color:'#16a34a',flexShrink:0,minWidth:40,textAlign:'right'}}>{t.pct}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ── SUBSCRIPTIONS tab ── */}
            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-xl font-black mb-1" style={{color:_t}}>Subscriptions</h2>
                <p className="text-sm mb-6" style={{color:_m}}>Choose a plan to unlock the full MockTest experience</p>

                {/* Current plan status */}
                <div style={{background:isPro?`${_a}10`:(cd?'rgba(255,255,255,.05)':'#f8fafc'),border:`1px solid ${isPro?`${_a}30`:_b}`,borderRadius:14,padding:'16px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:40,height:40,borderRadius:12,background:isPro?`${_a}18`:(cd?'rgba(255,255,255,.08)':'#e5e7eb'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isPro?_a:'#64748b'} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5,fontWeight:800,color:_t}}>
                      {isPro ? `${plan.charAt(0).toUpperCase()+plan.slice(1)} Plan — Active` : trialActive ? `Free Trial — ${trialDaysLeft} days remaining` : 'Free Trial Expired'}
                    </div>
                    <div style={{fontSize:12,color:_m,marginTop:2}}>
                      {isPro ? 'You have full access to all features.' : trialActive ? 'Upgrade to keep access after your trial ends.' : 'Your trial has ended. Upgrade to continue.'}
                    </div>
                  </div>
                  {isPro && <div style={{fontSize:10.5,fontWeight:800,color:_a,background:`${_a}15`,borderRadius:99,padding:'4px 12px'}}>Active</div>}
                </div>

                {/* Plan cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
                  {PLAN_TIERS.map(tier=>(
                    <div key={tier.id} style={{background:_s,border:`2px solid ${tier.popular?_a:_b}`,borderRadius:16,padding:'22px 18px',position:'relative',display:'flex',flexDirection:'column',gap:12}}>
                      {tier.popular && <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',background:_a,color:'#fff',fontSize:10,fontWeight:800,padding:'3px 14px',borderRadius:'0 0 10px 10px',letterSpacing:'.04em'}}>MOST POPULAR</div>}
                      <div>
                        <div style={{fontSize:13,fontWeight:800,color:_m,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{tier.name}</div>
                        <div style={{fontSize:28,fontWeight:900,color:_t,lineHeight:1}}>{tier.price}<span style={{fontSize:13,fontWeight:600,color:_m}}>/{tier.validity}</span></div>
                      </div>
                      <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8,flex:1}}>
                        {tier.features.map(f=>(
                          <li key={f} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:12.5,color:_t,lineHeight:1.4}}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke='#16a34a' strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><polyline points="20 6 9 17 4 12"/></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button onClick={()=>onNav?.('subscriptions')}
                        style={{background:tier.popular?_a:'none',color:tier.popular?'#fff':_a,border:`2px solid ${_a}`,borderRadius:10,padding:'10px',fontWeight:800,fontSize:13,cursor:'pointer',transition:'all .15s',marginTop:'auto'}}
                        onMouseOver={e=>{if(!tier.popular){e.currentTarget.style.background=_a;e.currentTarget.style.color='#fff'}}}
                        onMouseOut={e=>{if(!tier.popular){e.currentTarget.style.background='none';e.currentTarget.style.color=_a}}}>
                        {isPro && plan===tier.id ? 'Current Plan' : 'Get Started'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BILLING tab ── */}
            {activeTab === 'billing' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-black mb-1" style={{color:_t}}>Billing</h2>
                <p className="text-sm mb-6" style={{color:_m}}>Your payment details and transaction history</p>

                {/* Plan summary */}
                <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'20px 22px',marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Current Plan</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:900,color:_t}}>{isPro ? plan.charAt(0).toUpperCase()+plan.slice(1)+' Plan' : 'Free Trial'}</div>
                      <div style={{fontSize:12.5,color:_m,marginTop:3}}>{isPro ? 'Billed monthly' : trialActive ? `${trialDaysLeft} days remaining in trial` : 'Trial period has ended'}</div>
                    </div>
                    <button onClick={()=>setActiveTab('subscriptions')}
                      style={{background:_a,color:'#fff',border:'none',borderRadius:10,padding:'9px 18px',fontWeight:800,fontSize:12.5,cursor:'pointer',flexShrink:0}}>
                      {isPro ? 'Manage' : 'Upgrade'}
                    </button>
                  </div>
                </div>

                {/* Payment method placeholder */}
                <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,padding:'20px 22px',marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12}}>Payment Method</div>
                  {isPro ? (
                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                      <div style={{width:44,height:30,borderRadius:6,background:cd?'rgba(255,255,255,.1)':'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <svg width="22" height="16" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#1a1f71"/><rect y="5" width="32" height="5" fill="#f7b600"/></svg>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:_t}}>Card ending ••••</div>
                        <div style={{fontSize:11.5,color:_m,marginTop:2}}>Update your payment method below</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{fontSize:13,color:_m}}>No payment method on file. Add one when you upgrade.</div>
                  )}
                </div>

                {/* Transaction history */}
                <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'16px 20px',borderBottom:`1px solid ${_b}`,fontSize:11,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.07em'}}>Transaction History</div>
                  <div style={{padding:'32px 20px',textAlign:'center'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={_m} strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 12px',display:'block'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
                    <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:4}}>No transactions yet</div>
                    <div style={{fontSize:12,color:_m}}>Your payment history will appear here once you subscribe.</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ══ SLIDE-IN PANEL ══ */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setPanelOpen(false)}/>

          {/* ── WEB panel: full nav (unchanged from original) ── */}
          {!isNative && (
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
                {SIDEBAR_NAV.map(item => (
                  <button key={item.id}
                    onClick={()=>{ setPanelOpen(false); setActiveTab(item.id) }}
                    className="w-full flex items-center gap-3 px-5 py-3 transition-colors"
                    style={ activeTab===item.id
                      ? { background:'rgba(255,101,63,.08)', color:'#FF653F', fontWeight:700, borderLeft:'3px solid #FF653F' }
                      : { color:'#374151', borderLeft:'3px solid transparent' } }
                    onMouseOver={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='#f9fafb' }}
                    onMouseOut={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='transparent' }}>
                    <span className="flex-shrink-0" style={{color: activeTab===item.id ? '#FF653F' : '#9ca3af'}}><item.Icon /></span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                ))}
                <div className="mt-4 mx-5 pt-4" style={{ borderTop:'1px solid #f3f4f6' }}>
                  {adminUser && (
                    <button onClick={()=>{setPanelOpen(false);onNav?.('admin')}} className="w-full text-left py-2.5 text-sm flex items-center gap-2 mb-1" style={{ color:'#6b7280' }}><DIcGear s={13} c='#6b7280'/> Admin Panel</button>
                  )}
                  <button onClick={onLogout} className="w-full text-left py-2.5 text-sm font-semibold" style={{ color:'#ef4444' }}>↪ Log Out</button>
                </div>
              </nav>
            </div>
          )}

          {/* ── NATIVE APP "More" panel: secondary items only (bottom nav handles primary) ── */}
          {isNative && (
            <div className="fixed right-0 top-0 h-full w-72 z-50 flex flex-col overflow-y-auto shadow-2xl"
              style={{background:cd?'#111':'#fff',paddingTop:'env(safe-area-inset-top,0px)'}}>
              {/* Header */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:`1px solid ${cd?'rgba(255,255,255,.08)':'#f0f0f0'}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,background:'#FF653F',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{color:'#fff',fontWeight:900,fontSize:12}}>MT</span>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:cd?'#fff':'#111827'}}>MockTest</div>
                    <div style={{fontSize:8,fontWeight:700,color:'#FF653F',letterSpacing:'.12em',textTransform:'uppercase'}}>More</div>
                  </div>
                </div>
                <button onClick={()=>setPanelOpen(false)}
                  style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,border:'none',cursor:'pointer',
                    background:cd?'rgba(255,255,255,.08)':'#f3f4f6',color:cd?'#9ca3af':'#6b7280',fontSize:18}}>×</button>
              </div>
              {/* User card */}
              <div style={{margin:'14px 16px',padding:'14px 16px',borderRadius:14,background:cd?'rgba(255,255,255,.05)':'#fafafa',border:`1px solid ${cd?'rgba(255,255,255,.07)':'#f0f0f0'}`,display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#ff9a7a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#fff',flexShrink:0}}>
                  {(userName||'U')[0].toUpperCase()}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:800,color:cd?'#fff':'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
                  <div style={{fontSize:11,color:cd?'#6b7280':'#9ca3af',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
                </div>
              </div>
              {/* Secondary nav */}
              <nav style={{flex:1,padding:'4px 0'}}>
                {[
                  {id:'weakareas',     Icon:SvgFlame, label:'Weak Areas'},
                  {id:'prediction',    Icon:SvgBolt,  label:'AI Prediction'},
                  {id:'subscriptions', Icon:SvgClip,  label:'Subscriptions'},
                  {id:'billing',       Icon:SvgCard,  label:'Billing'},
                  {id:'settings',      Icon:SvgGear,  label:'Settings'},
                ].map(item => {
                  const isAct = activeTab === item.id
                  return (
                    <button key={item.id}
                      onClick={()=>{ setPanelOpen(false); setActiveTab(item.id) }}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 18px',border:'none',cursor:'pointer',textAlign:'left',
                        background: isAct ? 'rgba(255,101,63,.1)' : 'transparent',
                        borderLeft: isAct ? '3px solid #FF653F' : '3px solid transparent'}}>
                      <span style={{color:isAct?'#FF653F':cd?'#6b7280':'#9ca3af',flexShrink:0}}><item.Icon /></span>
                      <span style={{fontSize:13,fontWeight:600,color:isAct?'#FF653F':cd?'#e5e7eb':'#374151'}}>{item.label}</span>
                    </button>
                  )
                })}
                <div style={{margin:'10px 18px',borderTop:`1px solid ${cd?'rgba(255,255,255,.07)':'#f0f0f0'}`}}/>
                {adminUser && (
                  <button onClick={()=>{setPanelOpen(false);onNav?.('admin')}}
                    style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 18px',border:'none',cursor:'pointer',background:'transparent'}}>
                    <DIcGear s={15} c={cd?'#6b7280':'#9ca3af'}/><span style={{fontSize:13,fontWeight:600,color:cd?'#9ca3af':'#6b7280'}}>Admin Panel</span>
                  </button>
                )}
                <button onClick={onLogout}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 18px',border:'none',cursor:'pointer',background:'transparent'}}>
                  <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span style={{fontSize:13,fontWeight:700,color:'#ef4444'}}>Sign Out</span>
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* ══ NATIVE APP BOTTOM NAV — only in Capacitor APK, never in web browser ══ */}
      {isNative && (<>
        <style>{`
          .db-bnav{position:fixed;bottom:0;left:0;right:0;z-index:200;padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -1px 0 rgba(0,0,0,.1),0 -6px 24px rgba(0,0,0,.08)}
          .db-bnav-inner{display:flex;width:100%;height:62px}
          .db-bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:none;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 2px;position:relative;min-width:0}
          .db-bnav-pill{position:absolute;top:6px;width:32px;height:3px;border-radius:99px;background:#FF653F}
          .db-bnav-lbl{font-size:9px;font-weight:700;line-height:1;letter-spacing:.02em}
        `}</style>
        <nav className="db-bnav" style={{background:cd?'#111':'#fff',borderTop:`1px solid ${cd?'rgba(255,255,255,.07)':'#e8e8e8'}`}}>
          <div className="db-bnav-inner">
            {[
              { id:'home',        label:'Home',
                path:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
              { id:'explore',     label:'Explore',
                path:'M21 21l-4.35-4.35 M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z' },
              { id:'performance', label:'Progress',
                path:'M22 7L13.5 15.5L8.5 10.5L2 17 M16 7h6v6' },
              { id:'studyplan',   label:'Planner',
                path:'M3 6h18 M3 12h18 M3 18h18' },
              { id:'profile',     label:'Profile',
                path:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
            ].map(({id, label, path}) => {
              const isAct = activeTab === id
              const col = isAct ? '#FF653F' : cd ? '#555' : '#bbb'
              return (
                <button key={id} className="db-bnav-btn" onClick={() => setActiveTab(id)}>
                  {isAct && <span className="db-bnav-pill"/>}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{transition:'stroke .15s',flexShrink:0}}>
                    <path d={path}/>
                  </svg>
                  <span className="db-bnav-lbl" style={{color:col,transition:'color .15s'}}>{label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </>)}

    </div>
  )
}
