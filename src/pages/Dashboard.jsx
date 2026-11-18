import { useState, useEffect, useRef, useCallback, lazy, Suspense, memo } from 'react'
import { Capacitor } from '@capacitor/core'
import { getPrefs as getNotifPrefs, savePrefs as saveNotifPrefs, scheduleAll, cancelAll as cancelAllNotifs } from '../notifications.js'
import { supabase } from '../supabase.js'
import { recentResults, loadStudyPlan, saveStudyPlanJson, replaceStudyPlan, upsertOnboarding, upsertProfile, uploadAvatar, deleteMyData } from '../data/userData.js'
import { startCheckout } from '../payments.js'
import { toast } from '../toast.js'
import { getExamBlueprint } from '../api.js'
import { EXAMS as CUTOFF_EXAMS } from './CutoffsPage.jsx'
import PerformancePage from './PerformancePage.jsx'
import PredictionPage from './PredictionPage.jsx'
const DashHelpTab          = lazy(() => import('./DashHelpTab.jsx'))
const DashSubscriptionsTab = lazy(() => import('./DashSubscriptionsTab.jsx'))
const DashBillingTab       = lazy(() => import('./DashBillingTab.jsx'))
import { DateField, SelectField } from '../components/ui/Popovers.jsx' // UI: styled calendar + dropdown (Study Planner)
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
// Admin status is passed as a prop from App.jsx (resolved via user_access DB table)

export const EXAM_GROUPS = [
  {
    id: 'ibps', label: 'IBPS Exams',
    color: 'from-orange-500 to-orange-600', hex: '#F06535',
    exams: [
      { id: 'bank_clerk_prelims', name: 'Clerk Prelims', sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'bank_clerk_mains',   name: 'Clerk Mains',   sub: '175Q · 160 min', tag: null },
      { id: 'bank_po_prelims',    name: 'PO Prelims',    sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'bank_po_mains',      name: 'PO Mains',      sub: '175Q · 180 min', tag: null },
    ],
  },
  {
    id: 'sbi', label: 'SBI Exams',
    color: 'from-blue-700 to-blue-900', hex: '#1d4ed8',
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

/* UI: modern DUOTONE sidebar icons, each matching its menu title. Used ONLY by SIDEBAR_NAV
   below — the older Svg* icons are still used elsewhere and are left unchanged.
   Shapes with className "nf" get a soft tinted fill and "ns" a solid fill (see index.css
   ".db-nav-svg"), giving a two-tone look that reads better than thin outlines. */
const NavIc = ({ children }) => (
  <svg className="db-nav-svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const NavDashboard   = () => <NavIc><rect className="nf" x="3" y="3" width="7.5" height="9" rx="2"/><rect className="nf" x="13.5" y="3" width="7.5" height="5.5" rx="2"/><rect className="nf" x="13.5" y="11.5" width="7.5" height="9.5" rx="2"/><rect className="nf" x="3" y="15" width="7.5" height="6" rx="2"/></NavIc>
const NavExplore     = () => <NavIc><circle className="nf" cx="12" cy="12" r="9.5"/><path className="ns" d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5z"/></NavIc>
const NavPlanner     = () => <NavIc><rect className="nf" x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/><path d="m9 15 2 2 4-4"/></NavIc>
const NavPerformance = () => <NavIc><rect className="nf" x="3.5" y="12.5" width="4" height="8" rx="1.2"/><rect className="nf" x="10" y="8" width="4" height="12.5" rx="1.2"/><rect className="nf" x="16.5" y="3.5" width="4" height="17" rx="1.2"/></NavIc>
const NavPrediction  = () => <NavIc><path className="nf" d="M10.2 3.8a.8.8 0 0 1 1.5 0l1.2 3.5a3 3 0 0 0 1.9 1.9l3.5 1.2a.8.8 0 0 1 0 1.5l-3.5 1.2a3 3 0 0 0-1.9 1.9l-1.2 3.5a.8.8 0 0 1-1.5 0l-1.2-3.5a3 3 0 0 0-1.9-1.9l-3.5-1.2a.8.8 0 0 1 0-1.5l3.5-1.2a3 3 0 0 0 1.9-1.9z"/><path d="M19 2.5v3M20.5 4h-3"/></NavIc>
const NavWeakAreas   = () => <NavIc><circle className="nf" cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle className="ns" cx="12" cy="12" r="1.8"/></NavIc>
const NavSubs        = () => <NavIc><path className="nf" d="M3.5 8.2 7.8 11l3.4-5.6a1 1 0 0 1 1.6 0l3.4 5.6 4.3-2.8a.6.6 0 0 1 .9.7L19.2 17H4.8L2.6 8.9a.6.6 0 0 1 .9-.7z"/><path d="M5 20.5h14"/></NavIc>
const NavProfile     = () => <NavIc><circle className="nf" cx="12" cy="12" r="9.5"/><circle cx="12" cy="10" r="3.2"/><path d="M6.8 18.6a6 6 0 0 1 10.4 0"/></NavIc>
const NavBilling     = () => <NavIc><rect className="nf" x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 9.5h19M6.5 15h3.5"/></NavIc>
const NavSettings    = () => <NavIc><path className="nf" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></NavIc>

/* UI FIX: expand 3-digit hex (#111) to 6 digits (#111111) so appending an alpha
   suffix like "40" gives a valid colour. "#111"+"40" = "#11140" is invalid and the
   browser drops it — that is why the SBI exam chips had no border/background. */
const hex6 = (h) => (/^#[0-9a-f]{3}$/i.test(h || "") ? "#" + h.slice(1).split("").map(c => c + c).join("") : h)

const SIDEBAR_NAV = [
  { id:'home',          Icon:NavDashboard,   label:'Dashboard'      },  // UI: grid layout
  { id:'explore',       Icon:NavExplore,     label:'Explore Exams'  },  // UI: compass
  { id:'studyplan',     Icon:NavPlanner,     label:'Study Planner'  },  // UI: calendar with tick
  { id:'performance',   Icon:NavPerformance, label:'My Performance' },  // UI: rising bar chart
  { id:'prediction',    Icon:NavPrediction,  label:'AI Prediction'  },  // UI: AI sparkle (was lightning bolt)
  { id:'weakareas',     Icon:NavWeakAreas,   label:'Weak Areas'     },  // UI: focus target (was map pin)
  { id:'subscriptions', Icon:NavSubs,        label:'Subscriptions'  },  // UI: crown / premium (was blank clipboard)
  { id:'profile',       Icon:NavProfile,     label:'Profile'        },  // UI: user in circle
  { id:'billing',       Icon:NavBilling,     label:'Billing'        },  // UI: credit card
  { id:'settings',      Icon:NavSettings,    label:'Settings'       },  // UI: real gear (was sun-like)
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

/* Map exam_id → relevant TOPIC_GROUPS sections for the Study Planner.
   Keeps plans focused on sections that actually appear in the target exam. */
function getExamTopicGroups(examId) {
  const id = (examId || '').toLowerCase()
  if (!id) return TOPIC_GROUPS
  // Insurance exams (LIC, NICL, NIACL, UIIC, OICL) need Insurance Awareness section
  if (id.startsWith('lic_') || id.includes('niacl') || id.includes('nicl_') || id.includes('uiic') || id.includes('oicl'))
    return TOPIC_GROUPS
  // Banking Prelims (Clerk/PO pre): English + Numerical + Reasoning only (no GK/Insurance)
  if (/^(bank_|sbi_|rbi_|nabard_|ippb_|rrb_)/.test(id) && (id.includes('pre') || id.includes('cbt1') || id.includes('scale1_pre')))
    return TOPIC_GROUPS.filter(g => ['Quantitative Aptitude','Reasoning Ability','English Language'].includes(g.section))
  // Banking Mains and other banking: add General Awareness but no Insurance
  if (/^(bank_|sbi_|rbi_|nabard_|ippb_|rrb_)/.test(id))
    return TOPIC_GROUPS.filter(g => g.section !== 'Insurance Awareness')
  // SSC, PSU: GK + Reasoning + English + Quant (no Insurance)
  if (/^(ssc_|coal_)/.test(id))
    return TOPIC_GROUPS.filter(g => g.section !== 'Insurance Awareness')
  return TOPIC_GROUPS
}

/* Isolated countdown — has its own 1-second ticker so it never causes
   the full Dashboard to re-render and flash the Android status bar.    */
const ExamCountdown = memo(function ExamCountdown({ examDate, accent, muted, dark }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const msLeft = Math.max(0, new Date(examDate) - now)
  const dL = Math.floor(msLeft / 86400000)
  const hL = Math.floor((msLeft % 86400000) / 3600000)
  const mL = Math.floor((msLeft % 3600000) / 60000)
  const sL = Math.floor((msLeft % 60000) / 1000)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
      {[{v:dL,l:'Days'},{v:hL,l:'Hours'},{v:mL,l:'Mins'},{v:sL,l:'Secs'}].map(({ v, l }) => (
        <div key={l} style={{ textAlign:'center', background: dark ? 'rgba(255,255,255,.05)' : '#f9fafb', borderRadius: 8, padding: '8px 3px' }}>
          <div style={{ fontSize:20, fontWeight:900, color:accent, lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{String(v).padStart(2,'0')}</div>
          <div style={{ fontSize:9, color:muted, marginTop:3, fontWeight:600 }}>{l}</div>
        </div>
      ))}
    </div>
  )
})

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
    <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4" style={{background:'#F06535'}}>
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
        style={{background:'#fff',color:'#F06535'}}>
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
  mock:     { label:'Mock Test',   bg:'#fff4ef', border:'#F06535', text:'#F06535', dot:'#F06535' },
  revision: { label:'Revision',    bg:'#f0fdf4', border:'#16a34a', text:'#16a34a', dot:'#16a34a' },
  study:    { label:'Study',       bg:'#f5f3ff', border:'#7c3aed', text:'#7c3aed', dot:'#7c3aed' },
  catchup:  { label:'Buffer',      bg:'#f9fafb', border:'#9ca3af', text:'#6b7280', dot:'#9ca3af' },
}
const CAL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function PlanScheduleView({ plan, onStartTest, onTopicPractice, onRebuild, completedTasks = {}, onToggleDone }) {
  const days = plan?.days || []
  const [done, setDone] = useState(completedTasks)
  useEffect(() => { setDone(completedTasks) }, [completedTasks])
  const [selectedIso, setSelectedIso] = useState(null)
  const todayISO = new Date().toISOString().split('T')[0]

  if (!days.length) return (
    <div style={{background:'#fff0eb',border:'1px solid #fdd0b5',borderRadius:16,padding:32,textAlign:'center'}}>
      <div style={{fontSize:14,fontWeight:700,color:'#c84b11',marginBottom:8}}>No study plan found</div>
      <button onClick={onRebuild} style={{fontSize:13,fontWeight:700,color:'#F06535',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',touchAction:'manipulation'}}>Create a plan →</button>
    </div>
  )

  const isDayDone = (pd) => pd && pd.topics.every((_, i) => done[`${pd.isoDate}_${i}`])

  // Build 14-day window centred on today so user can see upcoming days
  const dayWindow = (() => {
    const now = new Date(todayISO)
    const dow = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
    return Array.from({length:14}, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i)
      const iso = d.toISOString().split('T')[0]
      return { iso, num: d.getDate(), label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d.getDay()===0?6:d.getDay()-1], planDay: days.find(pd => pd.isoDate === iso) || null }
    })
  })()

  const streak = (() => {
    let s = 0; const cur = new Date(todayISO)
    while (s < 365) {
      const iso = cur.toISOString().split('T')[0]
      const pd = days.find(d => d.isoDate === iso)
      if (!pd || !isDayDone(pd)) break
      s++; cur.setDate(cur.getDate() - 1)
    }
    return s
  })()

  const totalDays = days.length
  const totalDone = days.filter(d => isDayDone(d)).length
  const pct = totalDays ? Math.round((totalDone / totalDays) * 100) : 0

  // Exam countdown
  const examDate = plan?.exam_date ? new Date(plan.exam_date) : null
  const daysLeft = examDate ? Math.max(0, Math.ceil((examDate - new Date()) / 86400000)) : null

  const selDay   = selectedIso ? days.find(d => d.isoDate === selectedIso) : null
  const todayDay = days.find(d => d.isoDate === todayISO)
  const viewDay  = selDay || todayDay

  // Subject colours for task cards
  const SUBJ_COLS = ['#6366f1','#0891b2','#16a34a','#d97706','#e11d48','#7c3aed','#0ea5e9','#f59e0b']
  const getSubjCol = (i) => SUBJ_COLS[i % SUBJ_COLS.length]

  // Circular SVG arc helper (r=28, cx/cy=32)
  const arc = (fraction) => {
    const r=28, cx=32, cy=32, circ=2*Math.PI*r
    const offset = circ * (1 - Math.min(fraction, 1))
    return { circ, offset }
  }
  const { circ, offset } = arc(pct / 100)

  return (
    <div>
      {/* ══ INSTAGRAM-STYLE FULL-BLEED DARK HEADER ══ */}
      <div style={{margin:'0 -14px',background:'#000',padding:'18px 18px 22px',borderRadius:'0 0 28px 28px',position:'relative',overflow:'hidden',marginBottom:16}}>
        {/* Subtle gradient wash */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 80% 0%,rgba(232,90,44,.18) 0%,transparent 60%)',pointerEvents:'none'}}/>
        {/* Top row: label + edit */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.45)',letterSpacing:'.1em',textTransform:'uppercase'}}>Study Plan</span>
          <button onClick={onRebuild}
            style={{padding:'5px 13px',borderRadius:20,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.7)',fontSize:11.5,fontWeight:700,cursor:'pointer',touchAction:'manipulation'}}>
            Edit
          </button>
        </div>
        {/* Main row: ring + info */}
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          {/* Instagram-style story ring */}
          <div style={{flexShrink:0,position:'relative',width:72,height:72}}>
            {/* Outer gradient ring (like IG story ring) */}
            <svg width="72" height="72" viewBox="0 0 72 72" style={{position:'absolute',inset:0}}>
              <defs>
                <linearGradient id="igRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F06535"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </linearGradient>
              </defs>
              <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4"/>
              <circle cx="36" cy="36" r="32" fill="none" stroke="url(#igRing)" strokeWidth="4"
                strokeDasharray={circ * (72/64)} strokeDashoffset={(circ * (72/64)) * (1 - Math.min(pct/100, 1))}
                strokeLinecap="round" transform="rotate(-90 36 36)"/>
            </svg>
            {/* Avatar circle inside */}
            <div style={{position:'absolute',inset:7,borderRadius:'50%',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
              <span style={{fontSize:15,fontWeight:900,color:'#fff',lineHeight:1}}>{pct}%</span>
              <span style={{fontSize:8,color:'rgba(255,255,255,.45)',fontWeight:600,marginTop:1}}>done</span>
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:18,fontWeight:800,color:'#fff',lineHeight:1.15,marginBottom:6,letterSpacing:'-.01em'}}>{plan?.exam_name || 'Exam Prep'}</div>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,.55)',fontWeight:600}}>{totalDone}/{totalDays} days</span>
              {daysLeft !== null && (
                <span style={{fontSize:11.5,fontWeight:800,padding:'3px 10px',borderRadius:99,background:'rgba(232,90,44,.3)',color:'#FF8F6A',letterSpacing:'.02em'}}>{daysLeft}d left</span>
              )}
              {streak > 0 && (
                <span style={{fontSize:11.5,fontWeight:800,padding:'3px 10px',borderRadius:99,background:'rgba(245,158,11,.2)',color:'#fbbf24'}}>🔥 {streak}</span>
              )}
            </div>
          </div>
        </div>
        {/* Thin progress bar */}
        <div style={{marginTop:16,height:3,borderRadius:99,background:'rgba(255,255,255,.1)',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,borderRadius:99,background:'linear-gradient(90deg,#F06535,#f59e0b)',transition:'width .5s'}}/>
        </div>
      </div>

      {/* ── Horizontal day timeline (Instagram Stories row feel) ── */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',letterSpacing:'.07em',marginBottom:10,textTransform:'uppercase'}}>This Week</div>
        <div style={{display:'flex',gap:10,overflowX:'auto',scrollbarWidth:'none',paddingBottom:2,WebkitOverflowScrolling:'touch'}}>
          {dayWindow.map(d => {
            const isToday  = d.iso === todayISO
            const isSel    = (selectedIso || todayISO) === d.iso
            const hasPlan  = !!d.planDay
            const dayDone  = hasPlan && isDayDone(d.planDay)
            const isPast   = d.iso < todayISO
            return (
              <button key={d.iso}
                onClick={() => hasPlan && setSelectedIso(isSel && !isToday ? null : d.iso)}
                disabled={!hasPlan}
                style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:5,background:'none',border:'none',cursor: hasPlan?'pointer':'default',padding:'2px 4px',touchAction:'manipulation',opacity: isPast && !hasPlan ? .3 : 1}}>
                {/* Story-ring avatar */}
                <div style={{width:46,height:46,borderRadius:'50%',padding:2,
                  background: isToday ? 'linear-gradient(135deg,#F06535,#f59e0b)' : isSel && hasPlan ? 'linear-gradient(135deg,#F06535,#f59e0b)' : hasPlan ? (dayDone ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(0,0,0,.06)') : 'transparent',
                  boxSizing:'border-box'}}>
                  <div style={{width:'100%',height:'100%',borderRadius:'50%',background: isToday||isSel ? '#fff' : '#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',border: hasPlan ? '2px solid #fff' : 'none'}}>
                    {dayDone
                      ? <svg width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{fontSize:14,fontWeight:800,color: isToday ? '#F06535' : hasPlan ? '#374151' : '#d1d5db'}}>{d.num}</span>}
                  </div>
                </div>
                <span style={{fontSize:9,fontWeight:700,color: isToday ? '#F06535' : '#9ca3af',letterSpacing:'.03em'}}>{d.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Today / selected tasks ── */}
      <div style={{background:'#fff',borderRadius:20,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.06)',marginBottom:14}}>
        <div style={{padding:'14px 16px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #f3f4f6'}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'#111'}}>
              {selDay && selDay.isoDate !== todayISO ? `Day ${selDay.day}` : "Today's Plan"}
            </div>
            {viewDay && <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>{viewDay.topics?.length || 0} topics</div>}
          </div>
          {viewDay?.type === 'mock' && (
            <span style={{fontSize:10.5,fontWeight:800,padding:'4px 10px',borderRadius:99,background:'rgba(232,90,44,.1)',color:'#F06535'}}>MOCK DAY</span>
          )}
        </div>

        {viewDay ? (
          <>
            {viewDay.topics.map((topic, i) => {
              const key = `${viewDay.isoDate}_${i}`
              const taskDone = !!done[key]
              const accentCol = getSubjCol(i)
              return (
                <div key={i}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom: i < viewDay.topics.length - 1 ? '1px solid #f8f9fa' : 'none',background: taskDone ? '#fafafa' : '#fff',transition:'background .15s'}}>
                  <div style={{width:3,height:36,borderRadius:99,background:taskDone?'#d1d5db':accentCol,flexShrink:0,transition:'background .2s'}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:600,color:taskDone?'#9ca3af':'#1f2937',textDecoration:taskDone?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{topic}</div>
                    {!taskDone && <div style={{fontSize:11,color:accentCol,fontWeight:600,marginTop:2}}>Study</div>}
                  </div>
                  <button onClick={() => { const nv = !done[key]; setDone(p => ({...p, [key]: nv})); onToggleDone?.(key, nv) }}
                    style={{width:30,height:30,borderRadius:'50%',border:`2.5px solid ${taskDone?'#F06535':'#e5e7eb'}`,background:taskDone?'#F06535':'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,padding:0,touchAction:'manipulation',transition:'all .15s'}}>
                    {taskDone
                      ? <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div style={{width:8,height:8,borderRadius:'50%',background:'#e5e7eb'}}/>}
                  </button>
                </div>
              )
            })}
            {viewDay.type === 'mock' && (
              <div style={{padding:'12px 16px 14px'}}>
                <button onClick={() => onStartTest('mock')}
                  style={{width:'100%',padding:'13px',borderRadius:14,background:'linear-gradient(135deg,#F06535,#e5512f)',color:'#fff',fontSize:14,fontWeight:800,border:'none',cursor:'pointer',boxShadow:'0 4px 14px rgba(232,90,44,.4)',touchAction:'manipulation'}}>
                  🚀 Launch Full Mock Test
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{padding:'28px 16px',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:8}}>📅</div>
            <div style={{fontSize:13,fontWeight:600,color:'#6b7280',marginBottom:14}}>No tasks for this day</div>
            <button onClick={() => onStartTest('mock')}
              style={{padding:'10px 24px',borderRadius:99,background:'#F06535',color:'#fff',fontSize:13,fontWeight:800,border:'none',cursor:'pointer',touchAction:'manipulation'}}>
              Take a Mock Test →
            </button>
          </div>
        )}
      </div>

      {/* ══ INSTAGRAM-STYLE FULL-BLEED DARK FOOTER ══ */}
      <div style={{margin:'0 -14px -14px',background:'#000',borderRadius:'28px 28px 0 0',padding:'18px 18px 22px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <button onClick={() => onStartTest('mock')}
          style={{padding:'14px 10px',borderRadius:14,background:'linear-gradient(135deg,#F06535,#e5401d)',color:'#fff',fontSize:13,fontWeight:800,border:'none',cursor:'pointer',touchAction:'manipulation',boxShadow:'0 3px 12px rgba(232,90,44,.4)'}}>
          📝 Mock Test
        </button>
        <button onClick={onRebuild}
          style={{padding:'14px 10px',borderRadius:14,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)',fontSize:13,fontWeight:700,cursor:'pointer',touchAction:'manipulation'}}>
          ↺ Rebuild
        </button>
      </div>
    </div>
  )
}


export default function Dashboard({ user, isAdmin = false, planData, onStartTest, onLogout, onNav, onOpenResult, initialTab = 'home', examRegion = 'in', onTabChange, onResumeTest, darkMode = false, onToggleDark }) {  // UI: darkMode/onToggleDark → header dark-mode switch

  /* ── existing state ── */
  const [inProgressTest, setInProgressTest] = useState(() => {
    try {
      const base = localStorage.getItem('mt-inprogress')
      if (!base) return null
      const state = localStorage.getItem('mt-inprogress-state')
      return { ...JSON.parse(base), ...(state ? JSON.parse(state) : {}) }
    } catch { return null }
  })
  const [history,    setHistory]   = useState([])
  const [panelOpen,  setPanelOpen] = useState(false)

  /* ── UI: collapsible sidebar state ──
     sbPinned: stays open at 260px + content reflows (persisted in localStorage 'app-sidebar-pinned')
     sbHover : temporary overlay expand — only for real mouse/trackpad devices (hover:hover, pointer:fine)
     sbFocus : temporary expand while KEYBOARD focus is inside (mouse clicks don't count) */
  const [sbPinned, setSbPinned] = useState(() => {
    try { return localStorage.getItem('app-sidebar-pinned') === '1' } catch { return false }
  })
  const [sbHover, setSbHover] = useState(false)
  const [sbFocus, setSbFocus] = useState(false)
  const sbExpanded = sbPinned || sbHover || sbFocus
  const sbCanHover = () => {
    try { return window.matchMedia('(hover: hover) and (pointer: fine)').matches } catch { return true }
  }
  useEffect(() => {
    try { localStorage.setItem('app-sidebar-pinned', sbPinned ? '1' : '0') } catch {}
  }, [sbPinned])
  // Mobile drawer (web): Esc closes it, and the page behind can't scroll while it's open.
  useEffect(() => {
    if (!panelOpen || isNative) return
    const onKey = (e) => { if (e.key === 'Escape') setPanelOpen(false) }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [panelOpen])
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  /* ── new sidebar state ── */
  const [activeTab,  setActiveTab_raw] = useState(initialTab)
  const [showNativeMenu, setShowNativeMenu] = useState(false)

  // Stack-based tab history — each forward navigation pushes, back pops.
  // Seed with 'home' so there's always a base; if starting at a non-home tab, add it on top.
  const tabHistoryRef = useRef(initialTab === 'home' ? ['home'] : ['home', initialTab])
  const mainScrollRef = useRef(null)
  const setActiveTab = (t) => {
    tabHistoryRef.current.push(t)
    window.__mt_active_tab = t
    setActiveTab_raw(t)
    onTabChange?.(t)
  }

  /* Reset scroll to top whenever the active tab changes */
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0
      // fallback for WebViews that don't honour scrollTop assignment synchronously
      window.scrollTo(0, 0)
    }
  }, [activeTab])
  const goBackRef = useRef(null)
  useEffect(() => {
    window.__mt_active_tab = initialTab
    const h  = () => {
      tabHistoryRef.current = ['home']
      window.__mt_active_tab = 'home'
      setActiveTab_raw('home')
      onTabChange?.('home')
    }
    const st = (e) => {
      const t = e.detail?.tab
      if (t) {
        tabHistoryRef.current.push(t)
        window.__mt_active_tab = t
        setActiveTab_raw(t)
        onTabChange?.(t)
      }
    }
    const gb = () => goBackRef.current?.()
    window.addEventListener('mt:go-home', h)
    window.addEventListener('mt:switch-tab', st)
    window.addEventListener('mt:go-back', gb)
    return () => { window.removeEventListener('mt:go-home', h); window.removeEventListener('mt:switch-tab', st); window.removeEventListener('mt:go-back', gb) }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const [exploreExam, setExploreExam] = useState(null)   // selected exam in Explore view
  const [activeExploreGroup, setActiveExploreGroup] = useState(null)  // category tab in Explore
  const [exploreSearch, setExploreSearch] = useState('')
  const exploreSearchRef = useRef(null)
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
  const [completedTasks, setCompletedTasks] = useState(planData?.completed_tasks || {})
  const completedTasksRef = useRef(planData?.completed_tasks || {})
  const savedPlanRef      = useRef(planData || null)
  const debounceSaveRef   = useRef(null)

  /* ── profile state ── */
  const [profileEdit,     setProfileEdit]     = useState(false)
  const [profileName,     setProfileName]     = useState(user?.user_metadata?.full_name || '')
  const [profilePhone,    setProfilePhone]    = useState(user?.user_metadata?.phone || '')
  const [profileDob,      setProfileDob]      = useState(user?.user_metadata?.dob || '')
  const [profileGender,   setProfileGender]   = useState(user?.user_metadata?.gender || '')
  const [profileReferral, setProfileReferral] = useState(user?.user_metadata?.referral_source || '')
  const [profileSaving,   setProfileSaving]   = useState(false)
  const [profileMsg,      setProfileMsg]      = useState('')
  const [profileErr,      setProfileErr]      = useState({})     // Edit Profile: per-field errors
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
  const [privacyView,  setPrivacyView]  = useState(false)
  const [showNewPwd,   setShowNewPwd]   = useState(false)
  const [showConfPwd,  setShowConfPwd]  = useState(false)
  const [deleteModal,  setDeleteModal]  = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [signOutAllMsg,setSignOutAllMsg]= useState('')
  // notification preferences (email)
  const [notifNoSubs,  setNotifNoSubs]  = useState(!!user?.user_metadata?.notif_off_subs)
  const [notifNoPromo, setNotifNoPromo] = useState(!!user?.user_metadata?.notif_off_promo)
  const [notifSaving,  setNotifSaving]  = useState(false)
  // local push notification prefs (native only)
  const [notifPrefs, setNotifPrefs] = useState(() => isNative ? getNotifPrefs() : null)
  // in-app notification inbox
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [notifInbox, setNotifInbox] = useState(() => { try { return JSON.parse(localStorage.getItem('mt_inbox_v2') || '[]') } catch { return [] } })
  const [avatarUrl,       setAvatarUrl]       = useState(user?.user_metadata?.avatar_url || '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)
  // Pop the tab history stack and navigate to the previous tab.
  // Dispatches mt:at-root when we're already at the stack base (exits the app on Android).
  const goBackTab = useCallback(() => {
    const hist = tabHistoryRef.current
    if (hist.length > 1) {
      hist.pop()
      const prev = hist[hist.length - 1]
      window.__mt_active_tab = prev
      setActiveTab_raw(prev)
      onTabChange?.(prev)
    } else {
      window.dispatchEvent(new CustomEvent('mt:at-root'))
    }
  }, [onTabChange])

  // Keep goBackRef.current updated so the stable mt:go-back listener always sees latest state.
  // Priority: close overlays/sub-views first, then pop tab history.
  useEffect(() => {
    goBackRef.current = () => {
      if (showNotifPanel)  { setShowNotifPanel(false);  return }
      if (privacyView)     { setPrivacyView(false);     return }
      if (profileEdit)     { setProfileEdit(false);     return }
      if (showPlanBuilder) { setShowPlanBuilder(false); return }
      if (exploreExam)     { setExploreExam(null);      return }
      goBackTab()
    }
  }, [showNotifPanel, profileEdit, privacyView, showPlanBuilder, exploreExam, goBackTab])

  /* UI: Study Planner → exam-category tab row. Whenever the selected category changes (click,
     keyboard, or opening the page), slide ONLY the tab row so the selected tab sits in the
     middle. The page itself never scrolls; the browser clamps at the first/last tab. */
  const planTabRowRef = useRef(null)
  useEffect(() => {
    if (activeTab !== 'studyplan') return
    const id = requestAnimationFrame(() => {
      const row = planTabRowRef.current
      const btn = row?.querySelector('.sp-tab.is-active')
      if (!row || !btn) return
      const b = btn.getBoundingClientRect(), r = row.getBoundingClientRect()
      const target = row.scrollLeft + (b.left + b.width / 2) - (r.left + r.width / 2)
      let smooth = true
      try { smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch {}
      row.scrollTo({ left: Math.max(0, target), behavior: smooth ? 'smooth' : 'auto' })
    })
    return () => cancelAnimationFrame(id)
  }, [planExamTab, activeTab, showPlanBuilder, savedPlan, planLoading])

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
  const [dailyGoal,      setDailyGoal]      = useState(()=>{try{return parseInt(localStorage.getItem('mt_dailyGoal')||'3',10)||3}catch{return 3}})
  const [showGoalEditor, setShowGoalEditor] = useState(false)
  const [goalEditVal,    setGoalEditVal]    = useState(3)
  // clockNow removed — isolated into <ExamCountdown> so the ticker doesn't re-render the whole Dashboard

  /* show all exam groups regardless of region so users see their full history */
  const ACTIVE_GROUPS       = [...EXAM_GROUPS, ...SAT_EXAM_GROUPS]
  const ACTIVE_TOPIC_GROUPS = examRegion === 'us' ? SAT_TOPIC_GROUPS : TOPIC_GROUPS

  /* category-based visibility filter — only affects practice & explore tabs */
  const CATEGORY_TO_GROUP_IDS = {
    banking: ['ibps','sbi','rbi','nabard','lic','insurance','indiapost','psu'],
    railway: ['rrb'],
    ssc: ['ssc'],
    engineering: ['eamcet'],
  }
  const _selCats = (() => {
    const fromMeta = user?.user_metadata?.selected_categories
    if (fromMeta && fromMeta.length) return fromMeta
    try { const raw = localStorage.getItem('mt-pending-cats'); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })()
  const _visibleRaw = _selCats.length > 0
    ? ACTIVE_GROUPS.filter(g => _selCats.flatMap(c => CATEGORY_TO_GROUP_IDS[c] || []).includes(g.id))
    : ACTIVE_GROUPS
  const VISIBLE_GROUPS = _visibleRaw.length > 0 ? _visibleRaw : ACTIVE_GROUPS

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
  const _a = '#F06535'

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
  /* UI: License management (Settings) — super admins, plus the preview account(s) below. */
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

  /* ── in-app notification inbox builder ── */
  useEffect(() => {
    if (!user) return
    const existing = (() => { try { return JSON.parse(localStorage.getItem('mt_inbox_v2') || '[]') } catch { return [] } })()
    const existingIds = new Set(existing.map(n => n.id))
    const newItems = []
    const pushIfNew = item => { if (!existingIds.has(item.id)) newItems.push(item) }

    pushIfNew({ id: `welcome-${user.id.slice(0,8)}`, type: 'system', icon: '👋', title: 'Welcome to MockTest', body: 'Take a mock test to start tracking your progress and score higher.', ts: new Date(user.created_at || Date.now()).getTime(), read: false, action: null })

    const _plan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
    const _isPro = !['free','','none'].includes(_plan)
    if (!_isPro) {
      const _created = user.created_at ? new Date(user.created_at) : new Date()
      const _trialEnd = new Date(_created.getTime() + 7 * 86400000)
      const _daysLeft = Math.max(0, Math.ceil((_trialEnd - new Date()) / 86400000))
      const _trialEndStr = _trialEnd.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
      if (_daysLeft > 0 && _daysLeft <= 3) {
        pushIfNew({ id: `trial-warn-${_daysLeft}d`, type: 'subscription', icon: '⚡', title: `${_daysLeft} day${_daysLeft===1?'':'s'} left in free trial`, body: `Your trial ends ${_trialEndStr}. Upgrade to keep full access.`, ts: Date.now() - 500, read: false, action: 'subscriptions' })
      }
      if (_daysLeft === 0) {
        pushIfNew({ id: `trial-expired-${user.id.slice(0,8)}`, type: 'subscription', icon: '🔒', title: 'Free trial ended', body: 'Upgrade to unlock all mock tests, analytics and study tools.', ts: Date.now() - 1000, read: false, action: 'subscriptions' })
      }
    }

    if (newItems.length > 0) {
      const merged = [...newItems, ...existing].slice(0, 50)
      try { localStorage.setItem('mt_inbox_v2', JSON.stringify(merged)) } catch {}
      setNotifInbox(merged)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* add result notifications when history loads */
  useEffect(() => {
    if (!history.length) return
    const r = history[0]
    const rid = `result-${r.id || r.created_at}`
    const existing = (() => { try { return JSON.parse(localStorage.getItem('mt_inbox_v2') || '[]') } catch { return [] } })()
    if (existing.some(n => n.id === rid)) return
    const item = { id: rid, type: 'result', icon: '📊', title: 'Mock test completed', body: `You scored ${(r.percentage||0).toFixed(1)}% on your latest test. Keep practicing!`, ts: new Date(r.created_at || Date.now()).getTime(), read: false, action: 'performance' }
    const merged = [item, ...existing].slice(0, 50)
    try { localStorage.setItem('mt_inbox_v2', JSON.stringify(merged)) } catch {}
    setNotifInbox(merged)
  }, [history.length]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── load recent results + saved plan ── */
  const planFetchedRef = useRef(false)
  useEffect(() => {
    if (!user) return

    recentResults(user.id, 50)
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
      loadStudyPlan(user.id)
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

  // Keep refs in sync so debounced handler always reads fresh values
  useEffect(() => { savedPlanRef.current = savedPlan }, [savedPlan])
  // When savedPlan changes (new plan created or loaded), sync completedTasks from it
  useEffect(() => {
    const ct = savedPlan?.completed_tasks || {}
    setCompletedTasks(ct)
    completedTasksRef.current = ct
  }, [savedPlan])

  const handleToggleDone = (key, val) => {
    const updated = { ...completedTasksRef.current, [key]: val }
    completedTasksRef.current = updated
    setCompletedTasks(updated)
    clearTimeout(debounceSaveRef.current)
    debounceSaveRef.current = setTimeout(async () => {
      if (!user?.id || !savedPlanRef.current) return
      const { exam_id, exam_date, hours_per_day, weak_topics, created_at, completed_tasks: _ct, ...planContent } = savedPlanRef.current
      await saveStudyPlanJson(user.id, { ...planContent, completed_tasks: completedTasksRef.current })
    }, 800)
  }

  // Create Plan now generates AND saves in one click (no separate Save step).
  const handleGeneratePlan = async () => {
    if (!startDate || !endDate || !studyDays.length) return
    const span = Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    if (span > 7) { toast('Study plan can be at most 7 days. Please pick an end date within a week of the start date.', 'error'); return }
    if (!isPro && trialActive && new Date(endDate) > trialEnd) {
      toast(`Your free trial ends on ${trialEndStr}. Pick an end date within your trial, or upgrade for longer plans.`, 'error'); return
    }
    const examTGs = examRegion === 'us' ? SAT_TOPIC_GROUPS : getExamTopicGroups(planExam || selectedExamId)
    const plan = generatePlan({ startDate, endDate, studyDays, hoursPerDay, dayHours, weakTopics, topicGroups: examTGs, blockedDates, catchupEvery: catchupEnabled ? catchupEvery : 0 })
    if (!plan) return
    setGeneratedPlan(plan)
    await handleSavePlan(plan)
  }

  const handleSavePlan = async (planArg) => {
    const plan = planArg || generatedPlan
    if (!plan) return
    setPlanSaving(true)

    // Delete old plans for this user first, then insert fresh
    const { data: inserted, error } = await replaceStudyPlan(user.id, {
        user_id:       user.id,
        exam_id:       planExam,
        exam_date:     endDate,
        hours_per_day: hoursPerDay,
        weak_topics:   weakTopics,
        plan_json:     plan,
        created_at:    new Date().toISOString(),
      })

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
      await upsertOnboarding({
        student_id:      user.id,
        exam_id:         planExam,
        selected_exams:  [planExam],
        exam_date:       endDate || null,
        hours_per_day:   hoursPerDay,
        weak_topics:     groupWeakTopics(weakTopics, ACTIVE_TOPIC_GROUPS),
        onboarding_done: true,
        updated_at:      new Date().toISOString(),
      })
    } catch (e) { console.error('student_onboarding (planner) save failed:', e?.message) }

    // Reflect the chosen exam on the dashboard immediately
    setSelectedExamId(planExam); setExamChosen(true)

    // Update exam countdown notifications with the new exam date
    if (isNative && endDate) {
      const examObj = CUTOFF_EXAMS.find(e => e.id === planExam)
      const examLabel = examObj?.name || 'Your Exam'
      scheduleAll(getNotifPrefs(), endDate, examLabel).catch(() => {})
    }

    // Use the normalized plan so PlanScheduleView always gets .days at root
    const normalized = normalizePlan(inserted || plan)
    setSavedPlan(normalized)
    setPlanSaving(false)
    setPlanSaved(true)
    setShowPlanBuilder(false)
    setGeneratedPlan(null)
    setTimeout(() => setPlanSaved(false), 3000)
  }

  // Phone → the 10 local digits (drops +91 / leading 0 and spaces) — Edit Profile shows +91 separately.
  const phoneDigits = (p) => { let d = String(p || '').replace(/\D/g, ''); if (d.length === 12 && d.startsWith('91')) d = d.slice(2); if (d.length === 11 && d.startsWith('0')) d = d.slice(1); return d.slice(0, 10) }

  const handleSaveProfile = async () => {
    // Validate (Edit Profile): name required; phone optional but must be a valid Indian mobile; DOB complete if started.
    const fullName = profileName.trim()
    const digits = phoneDigits(profilePhone)
    const errs = {}
    if (fullName.length < 2) errs.name = 'Enter your full name'
    if (digits && !/^[6-9]\d{9}$/.test(digits)) errs.phone = 'Enter a valid 10-digit mobile number'
    if (profileDob && (profileDob < '1950-01-01' || profileDob > new Date().toISOString().slice(0, 10))) errs.dob = 'Enter a valid date of birth'
    setProfileErr(errs)
    if (Object.keys(errs).length) return
    const phone = digits ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : ''   // same format as the old placeholder
    setProfileName(fullName); setProfilePhone(phone)

    setProfileSaving(true); setProfileMsg('')
    // category is now saved here too (it was shown in this form but only saved by the Education section)
    await supabase.auth.updateUser({ data: {
      full_name: fullName, phone,
      dob: profileDob, gender: profileGender, referral_source: profileReferral, category: profileCategory,
    }})
    try {
      await upsertProfile({
        id: user.id, full_name: fullName, phone,
        dob: profileDob || null, gender: profileGender || null, referral_source: profileReferral || null,
        category: profileCategory,
      })
      await upsertOnboarding({ student_id: user.id, phone, updated_at: new Date().toISOString() })
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
    const { url: publicUrl, error: upErr } = await uploadAvatar(user.id, file)   // server mode: max 4 MB
    if (upErr) { setAvatarUploading(false); toast('Upload failed: ' + upErr.message, 'error'); return }
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
      await upsertProfile({ id: user.id, category: profileCategory, state: profileState, target_exam: profileExam })
      await upsertOnboarding({ student_id: user.id, exam_id: profileExam, selected_exams: [profileExam], level: profileLevel, updated_at: new Date().toISOString() })
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

  const handleSignOutAllDevices = async () => {
    setSignOutAllMsg('')
    try {
      await supabase.auth.signOut({ scope: 'global' })
      onLogout()
    } catch (e) {
      setSignOutAllMsg(e?.message || 'Failed to sign out all devices.')
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // Delete user data from results/profiles before signing out
      await deleteMyData(user.id)
      await supabase.auth.signOut()
      onLogout()
    } catch (e) {
      setDeleting(false)
      setDeleteModal(false)
    }
  }

  const handleSaveNotif = async (subs, promo) => {
    setNotifNoSubs(subs); setNotifNoPromo(promo); setNotifSaving(true)
    await supabase.auth.updateUser({ data: { notif_off_subs: subs, notif_off_promo: promo } })
    setNotifSaving(false)
  }

  /* ── type colour helpers ── */
  const typeColor = t => t==='mock'?'#F06535':t==='revision'?'#16a34a':'#F06535'
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
        .na .sp-card{background:${cd?'#1c1c1e':'#fff'}!important;border:none!important;border-radius:18px!important;box-shadow:${cd?'0 2px 14px rgba(0,0,0,.4),0 0 0 .5px rgba(255,255,255,.05)':'0 2px 10px rgba(0,0,0,.06),0 0 0 .5px rgba(0,0,0,.04)'}!important;width:100%!important;box-sizing:border-box!important}
        .na .sp-header{background:${cd?'#1c1c1e':'#fff'}!important;border-bottom:1px solid ${cd?'rgba(255,255,255,.06)':'#f3f4f6'}!important}
        .na .sp-form{width:100%!important;max-width:100%!important;box-sizing:border-box!important;min-width:0!important}
        .na .sp-grid{display:flex!important;flex-direction:column!important;gap:0!important;align-items:stretch!important;width:100%!important;min-width:0!important;box-sizing:border-box!important}
        .na .sp-grid>div{width:100%!important;min-width:0!important;box-sizing:border-box!important}
      `}</style>}

      {/* ══ NATIVE APP TOP BAR — per-tab header, Capacitor only ══ */}
      {isNative && (() => {
        const isPrimary = ['home','explore','performance','studyplan','profile'].includes(activeTab)
        const TITLES = {home:'Home',explore:'Explore Exams',performance:'My Progress',studyplan:'Study Planner',profile:'Profile',weakareas:'Weak Areas',prediction:'AI Prediction',subscriptions:'Subscriptions',billing:'Billing',settings:'Settings',help:'Help & Support'}
        return (
          <div style={{background:'#111',paddingTop:'env(safe-area-inset-top,0px)',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(255,255,255,.08)',boxShadow:'0 2px 8px rgba(0,0,0,.3)'}}>
            <div style={{height:54,display:'flex',alignItems:'center',padding:'0 16px',gap:10}}>
              {/* Left: back arrow for secondary tabs, MT logo for primary */}
              {!isPrimary ? (
                <button onClick={goBackTab} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'rgba(255,255,255,.1)',borderRadius:11,cursor:'pointer',flexShrink:0,touchAction:'manipulation'}}>
                  <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
              ) : (
                <div style={{width:34,height:34,background:'#F06535',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{color:'#fff',fontWeight:900,fontSize:11}}>MT</span>
                </div>
              )}
              {/* Title */}
              <div style={{flex:1,minWidth:0}}>
                {activeTab==='home' ? (
                  <div style={{fontSize:16,fontWeight:800,color:'#fff',letterSpacing:'-.02em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    Home
                  </div>
                ) : (
                  <div style={{fontSize:17,fontWeight:800,color:'#fff',letterSpacing:'-.02em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {TITLES[activeTab]||activeTab}
                  </div>
                )}
              </div>
              {/* Bell + three-dots for all primary tabs; explore also gets search */}
              {isPrimary && (<>
                {activeTab==='explore' && (
                  <button onClick={()=>{ setTimeout(()=>exploreSearchRef.current?.focus(),50) }} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'rgba(255,255,255,.1)',borderRadius:11,cursor:'pointer',flexShrink:0,touchAction:'manipulation'}}>
                    <svg width="17" height="17" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                )}
                <button onClick={()=>setShowNotifPanel(true)} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'rgba(255,255,255,.1)',borderRadius:11,cursor:'pointer',flexShrink:0,touchAction:'manipulation',position:'relative'}}>
                  <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {notifInbox.some(n=>!n.read) && <span style={{position:'absolute',top:5,right:5,width:8,height:8,background:'#ff3b30',borderRadius:'50%',border:'1.5px solid #111'}}/>}
                </button>
                <button onClick={()=>setShowNativeMenu(v=>!v)} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'rgba(255,255,255,.1)',borderRadius:11,cursor:'pointer',flexShrink:0,touchAction:'manipulation'}}>
                  <svg width="4" height="18" viewBox="0 0 4 20" fill="rgba(255,255,255,.75)"><circle cx="2" cy="2" r="2"/><circle cx="2" cy="10" r="2"/><circle cx="2" cy="18" r="2"/></svg>
                </button>
              </>)}
              {/* Three-dots dropdown */}
              {showNativeMenu && (
                <>
                  <div onClick={()=>setShowNativeMenu(false)} style={{position:'fixed',inset:0,zIndex:199}}/>
                  <div style={{position:'fixed',top:'calc(env(safe-area-inset-top,0px) + 58px)',right:14,zIndex:200,background:'#1c1c1e',borderRadius:14,boxShadow:'0 8px 32px rgba(0,0,0,.6)',overflow:'hidden',minWidth:180}}>
                    <button onClick={()=>{setShowNativeMenu(false);setActiveTab('help')}} style={{width:'100%',padding:'14px 18px',display:'flex',alignItems:'center',gap:12,background:'none',border:'none',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',textAlign:'left',touchAction:'manipulation'}}>
                      <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Help & Support
                    </button>
                    <div style={{height:1,background:'rgba(255,255,255,.08)',margin:'0 18px'}}/>
                    <button onClick={()=>{setShowNativeMenu(false);setActiveTab('settings')}} style={{width:'100%',padding:'14px 18px',display:'flex',alignItems:'center',gap:12,background:'none',border:'none',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',textAlign:'left',touchAction:'manipulation'}}>
                      <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Settings
                    </button>
                    <div style={{height:1,background:'rgba(255,255,255,.08)',margin:'0 18px'}}/>
                    <button onClick={()=>{setShowNativeMenu(false);onLogout?.()}} style={{width:'100%',padding:'14px 18px',display:'flex',alignItems:'center',gap:12,background:'none',border:'none',color:'#ff4444',fontSize:14,fontWeight:600,cursor:'pointer',textAlign:'left',touchAction:'manipulation'}}>
                      <svg width="16" height="16" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* Trial notice strip */}
            {activeTab==='home' && (trialActive||trialExpired) && (
              <div style={{padding:'8px 14px',background:'#F06535',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <span style={{fontSize:12,color:'rgba(255,255,255,.95)',fontWeight:600}}>
                  {trialExpired?'Free trial ended — upgrade to continue':`🔥 ${trialDaysLeft===1?'Last day':trialDaysLeft+' days'} left in free trial`}
                </span>
                <button onClick={()=>setActiveTab('subscriptions')} style={{fontSize:11,fontWeight:800,color:'#F06535',background:'#fff',border:'none',borderRadius:8,padding:'5px 10px',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap',touchAction:'manipulation'}}>
                  Upgrade →
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
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#F06535' }}>
            <span className="text-white text-sm font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-base font-black tracking-tight" style={{color:'#111827'}}>MockTest</div>
            <div style={{fontSize:8.5,fontWeight:700,color:'#F06535',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
          </div>
        </div>
        <div className="flex-1"/>
        {/* Trial pill — inline in header */}
        {(trialActive || trialExpired) && (
          <div className="hidden sm:flex items-center gap-2 text-xs flex-shrink-0" style={{color:'#6b7280'}}>
            <span>
              {trialExpired
                ? 'Free trial ended — upgrade to continue.'
                : <>{trialDaysLeft === 1 ? 'Last day' : <><b style={{color:'#F06535'}}>{trialDaysLeft} days</b> left</>} of your free trial.</>}
            </span>
            <button onClick={() => setActiveTab('subscriptions')}
              className="text-white text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0"
              style={{ background:'#F06535' }}>
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
          {/* UI: dark-mode switch — sits between the Upgrade button and the profile menu.
              Uses the same App-level darkMode state as the public navbar toggle. */}
          {onToggleDark && (
            <button onClick={onToggleDark}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
              className="db-theme-toggle w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0">
              {darkMode ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
              )}
            </button>
          )}
          {/* User dropdown — desktop */}
          <div className="relative hidden md:block">
            {userMenuOpen && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setUserMenuOpen(false)}/>}
            <button onClick={()=>setUserMenuOpen(o=>!o)}
              className="flex items-center gap-2 rounded-full transition-all"
              style={{background:'#f3f4f6',border:'1px solid #e5e7eb',padding:'5px 12px 5px 5px',cursor:'pointer',outline:'none',position:'relative',zIndex:50}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#F06535,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',flexShrink:0,overflow:'hidden'}}>
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
                    <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#F06535,#ff8a5f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff',flexShrink:0,overflow:'hidden'}}>
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
                    <div style={{fontSize:12,fontWeight:700,color:isPro?(plan==='ultimate'?'#7048E8':'#F06535'):(trialExpired?'#ef4444':'#F06535'),marginTop:1}}>
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
          {/* Mobile/tablet: hamburger — UI: shown below 900px (.db-burger), opens the left drawer */}
          <button onClick={() => setPanelOpen(true)} aria-label="Open menu" aria-expanded={panelOpen}
            className="db-burger w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl transition-colors"
            style={{background:'#f3f4f6',border:'1px solid #e5e7eb'}}>
            <span className="w-4 h-0.5 rounded-full" style={{background:'#374151'}}/>
            <span className="w-4 h-0.5 rounded-full" style={{background:'#374151'}}/>
            <span className="w-4 h-0.5 rounded-full" style={{background:'#374151'}}/>
          </button>
        </div>
      </header>}

      {/* UI: wrapper class drives the content offset — 'sidebar-is-collapsed' (80px rail) unless pinned.
          Hover never changes it, so the page doesn't shift on hover. Must keep overflow visible. */}
      <div className={`flex flex-1 min-h-0 ${sbPinned ? 'sidebar-is-pinned' : 'sidebar-is-collapsed'}`}>

        {/* ══ LEFT SIDEBAR — web only ══
            UI: collapsible sidebar (styles: "UI: Dashboard collapsible sidebar" in index.css).
            .db-rail       = in-flow spacer column: 80px (icon rail) or 260px (pinned) → <main> reflows on pin.
            .db-rail-panel = sticky panel: 78px rail, expands to 260px OVER the page on mouse hover
                             (main does not move) or stays open when pinned. Hidden below 900px —
                             there the header hamburger opens the left drawer instead. */}
        {!isNative && (
          <aside className="db-rail">
            <div
              className={`db-rail-panel${sbExpanded ? ' is-expanded' : ''}${sbPinned ? ' is-pinned' : ''}${!sbPinned && (sbHover || sbFocus) ? ' is-overlay' : ''}`}
              onMouseEnter={() => { if (sbCanHover()) setSbHover(true) }}
              onMouseLeave={() => setSbHover(false)}
              onFocus={e => { try { if (e.target.matches(':focus-visible')) setSbFocus(true) } catch {} }}
              onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbFocus(false) }}>

              {/* Pin button — visible in both states (centred in the rail) */}
              <div className="db-rail-top">
                <span className="db-rail-label db-rail-toplabel">Menu</span>
                <button type="button" className={`db-pin${sbPinned ? ' is-active' : ''}`}
                  onClick={() => { setSbPinned(p => !p); setSbHover(false) }}
                  aria-pressed={sbPinned}
                  aria-label={sbPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                  title={sbPinned ? 'Unpin sidebar' : 'Pin sidebar'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={sbPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                  </svg>
                </button>
              </div>

              <nav className="db-rail-nav" aria-label="Main navigation">
                {[
                  { title:'Prepare', items: SIDEBAR_NAV.slice(0, 6) },   // Dashboard → Weak Areas
                  { title:'Account', items: SIDEBAR_NAV.slice(6) },      // Subscriptions → Settings
                ].map(sec => (
                  <div key={sec.title} className="db-rail-section">
                    {/* Section title — shown when expanded; in the rail it is just empty spacing (UI: the "—" divider was removed on request) */}
                    <div className="db-rail-title">
                      <span className="db-rail-label">{sec.title}</span>
                    </div>
                    {sec.items.map(item => {
                      const act = activeTab === item.id
                      return (
                        <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                          className={`db-rail-item${act ? ' is-active' : ''}`}
                          aria-current={act ? 'page' : undefined}
                          title={!sbExpanded ? item.label : undefined}>
                          <span className="db-rail-icon"><item.Icon /></span>
                          <span className="db-rail-label">{item.label}</span>
                          {item.badge && !act && <span className="db-rail-badge">{item.badge}</span>}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* ══ MAIN CONTENT ══ */}
        <main ref={mainScrollRef} className="flex-1 min-w-0 overflow-y-auto flex flex-col" style={{overflowX:'clip',background: isNative?(cd?'#000':'#f2f2f7'):'#fff'}}>
          <div className="flex-1 py-6 px-4 sm:px-8 lg:px-12" style={{maxWidth:'100%',boxSizing:'border-box',
            ...(isNative ? {paddingBottom:'calc(76px + env(safe-area-inset-bottom,0px))',paddingLeft:16,paddingRight:16,paddingTop:14} : {})
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
              const _a = '#F06535'
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
                    .ht-cat-grid{display:grid;grid-template-columns:var(--cc,repeat(5,1fr));gap:14px}
                    .ht-cat-card{background:${_s};border:1px solid ${_b};border-radius:14px;padding:20px 14px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;width:100%;transition:all .18s}
                    .ht-cat-card-solo{flex-direction:row!important;text-align:left!important;align-items:center!important;padding:18px 20px!important;gap:16px!important}
                    .ht-cat-card-span2{grid-column:span 2!important}
                    .ht-explore-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
                    .ht-explore-card{background:${_s};border:1px solid ${_b};border-radius:14px;padding:18px 16px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
                    .ht-why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
                    .ht-hero-illus{flex-shrink:0;width:240px;min-width:0}
                    .ht-hero-inner{display:flex;align-items:center;gap:24;justify-content:space-between;position:relative}
                    @media(max-width:1100px){.ht-hero-illus{display:none!important}}
                    @media(max-width:980px){.ht-new-outer{grid-template-columns:1fr!important}.ht-new-col-right{align-self:auto!important}.ht-new-right{position:static!important}}
                    @media(max-width:1100px){.ht-cat-grid{grid-template-columns:var(--cc,repeat(3,1fr))!important}}
                    @media(max-width:700px){.ht-cat-grid{grid-template-columns:var(--cc-sm,repeat(2,1fr))!important}.ht-why-grid{grid-template-columns:1fr 1fr!important}.ht-explore-grid{grid-template-columns:1fr 1fr!important}.ht-explore-card{flex-direction:row!important;align-items:flex-start!important;gap:12px!important}}
                    @media(max-width:480px){.ht-why-grid{grid-template-columns:1fr!important}.ht-cat-grid{grid-template-columns:var(--cc-sm,repeat(2,1fr))!important}}
                    @media(max-width:360px){.ht-cat-grid{grid-template-columns:var(--cc-sm,1fr)!important}}
                  `}</style>

                  <div className="ht-new-outer">
                    {/* LEFT COLUMN */}
                    <div>

                      {/* HERO BANNER */}
                      <div style={{position:'relative',borderRadius:18,overflow:'hidden',
                        background:'linear-gradient(135deg,#F06535 0%,#e8571c 60%,#c94613 100%)',
                        border:'none',
                        boxShadow:'0 6px 28px rgba(232,90,44,.45)',
                        marginBottom:22,padding:'22px 20px'}}>
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,background:'rgba(255,255,255,.3)'}}/>
                        <div style={{position:'absolute',top:-50,right:-30,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,0,0,.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
                        <div style={{display:'flex',alignItems:'center',gap:24,justifyContent:'space-between',position:'relative'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                              <span style={{fontSize:16}}>👋</span>
                              <span>Hi, {(u=>{const fn=u.split(/[\s._@]/)[0];return fn.charAt(0).toUpperCase()+fn.slice(1)})(userName)}!</span>
                            </div>
                            <h1 style={{fontSize:18,fontWeight:800,color:'#fff',letterSpacing:'-.01em',lineHeight:1.3,margin:'0 0 10px',whiteSpace:'nowrap'}}>
                              Prepare Smarter, Score Higher
                            </h1>
                            <p style={{margin:0,fontSize:13,color:'rgba(255,255,255,.95)',fontWeight:500,lineHeight:1.7,maxWidth:380}}>
                              Full-length mock tests, topic-wise practice, and detailed analytics — everything you need to crack your exam.
                            </p>
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
                        {(()=>{
                          const _vc=[
                            {catId:'banking',label:'Banking Exams',sub:'IBPS, SBI, RRB, NABARD\nand more',col:'#3b82f6',grp:'ibps',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>},
                            {catId:'ssc',label:'SSC Exams',sub:'CGL, CHSL, MTS, GD\nand more',col:'#8b5cf6',grp:'ssc',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>},
                            {catId:'railway',label:'Railway Exams',sub:'RRB NTPC, Group D\nand more',col:'#16a34a',grp:'rrb',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8.5" cy="17" r="1.5"/><circle cx="15.5" cy="17" r="1.5"/><path d="M8 19l-2 3"/><path d="M16 19l2 3"/></svg>},
                            {catId:'engineering',label:'Entrance Exams',sub:'JEE, NEET, CUET\nand more',col:'#7c3aed',grp:'eamcet',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>},
                            {catId:'international',label:'International',sub:'SAT, ACT\nand more',col:'#d97706',grp:'sat',
                              icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>},
                          ].filter(cat => !_selCats.length || (cat.catId === 'international' ? examRegion === 'us' : _selCats.includes(cat.catId)))
                          const _vn=_vc.length
                          const _cc=_vn<=1?'1fr':_vn<=4?'repeat(2,1fr)':'repeat(3,1fr)'
                          const _ccSm=_vn<=1?'1fr':'repeat(2,1fr)'
                          return (
                          <div className="ht-cat-grid" style={{'--cc':_cc,'--cc-sm':_ccSm}}>
                            {_vc.map((cat,ci)=>(
                              <button key={ci}
                                onClick={cat.grp?()=>{setActiveExploreGroup(cat.grp);setActiveTab('explore')}:undefined}
                                className={`ht-cat-card${_vn===1?' ht-cat-card-solo':(_vn===3&&ci===2)?' ht-cat-card-span2':''}`}
                                style={{cursor:cat.grp?'pointer':'default',opacity:cat.grp?1:.75}}
                                onMouseOver={cat.grp?e=>{e.currentTarget.style.borderColor=cat.col+'55';e.currentTarget.style.boxShadow=`0 8px 24px ${cat.col}18`;e.currentTarget.style.transform='translateY(-3px)'}:undefined}
                                onMouseOut={cat.grp?e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}:undefined}>
                                <div style={{width:52,height:52,borderRadius:15,background:cat.col,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>
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
                          )
                        })()}
                      </div>

                      {/* EXPLORE WHAT YOU CAN DO */}
                      <div style={{marginBottom:24}}>
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:18,fontWeight:900,color:_t,letterSpacing:'-.02em',lineHeight:1.2}}>Explore What You Can Do</div>
                          <div style={{fontSize:12.5,color:_m,marginTop:4}}>Everything you need for effective exam preparation</div>
                        </div>
                        <div className="ht-explore-grid">
                          {[
                            {label:'Full Mock Tests',btnText:'Start Now',col:'#F06535',act:()=>onStartTest?.('mock',selectedExamId),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>},
                            {label:'Topic Practice',btnText:'Start Practice',col:'#3b82f6',act:()=>onStartTest?.('topic',''),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>},
                            {label:'Previous Year Papers',btnText:'Explore',col:'#16a34a',act:()=>onNav?.('papers'),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>},
                            {label:'Study Planner',btnText:'Create Plan',col:'#d97706',act:()=>setActiveTab('studyplan'),
                              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>},
                          ].map((ex,ei)=>(
                            <div key={ei} className="ht-explore-card" onClick={ex.act}
                              style={{cursor:'pointer',touchAction:'manipulation',transition:'box-shadow .15s,border-color .15s'}}
                              onMouseOver={e=>{e.currentTarget.style.boxShadow=`0 4px 16px ${ex.col}25`;e.currentTarget.style.borderColor=`${ex.col}40`}}
                              onMouseOut={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor=''}}>
                              <div style={{width:46,height:46,borderRadius:13,background:ex.col,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0,boxShadow:`0 4px 12px ${ex.col}55`}}>
                                {ex.icon}
                              </div>
                              <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:6,justifyContent:'center'}}>
                                <div style={{fontSize:13,fontWeight:800,color:_t,lineHeight:1.3}}>{ex.label}</div>
                                <div style={{display:'flex',alignItems:'center',gap:3,color:ex.col,fontSize:12,fontWeight:800}}>
                                  {ex.btnText}
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
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
                                <div style={{width:42,height:42,borderRadius:'50%',background:f.col,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0,boxShadow:`0 4px 12px ${f.col}55`}}>
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
                            <line x1="68" y1="43" x2="68" y2="57" stroke="#F06535" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="68" cy="61" r="4" fill="#F06535"/>
                            <line x1="65" y1="65" x2="63" y2="75" stroke="#F06535" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="68" y1="65" x2="68" y2="76" stroke="#F06535" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="71" y1="65" x2="73" y2="75" stroke="#F06535" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="26" cy="37" r="2.5" fill={cd?'rgba(255,200,80,.4)':'rgba(255,180,50,.5)'}/>
                            <circle cx="62" cy="25" r="2" fill={cd?'rgba(232,90,44,.4)':'rgba(232,90,44,.5)'}/>
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
                              <circle cx="22" cy="22" r="22" fill="#f59e0b"/>
                              <path d="M13.5 11h11v8.5a5.5 5.5 0 0 1-11 0V11z" fill="rgba(255,255,255,.9)"/>
                              <path d="M10.5 12.5h3v4.5a3.5 3.5 0 0 1-3 0v-4.5z" fill="rgba(255,255,255,.7)" opacity=".8"/>
                              <path d="M24.5 12.5h3v4.5a3.5 3.5 0 0 1-3 0v-4.5z" fill="rgba(255,255,255,.7)" opacity=".8"/>
                              <rect x="19.5" y="23.5" width="5" height="4.5" rx="1" fill="rgba(255,255,255,.9)"/>
                              <rect x="15" y="28" width="14" height="3" rx="1.5" fill="rgba(255,255,255,.9)"/>
                              <path d="M18 17L19.5 13.5L21 17L24.5 17.5L22 20L22.5 24L19.5 22.3L16.5 24L17 20L14.5 17.5Z" fill="#fff" opacity=".95"/>
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
                          <div style={{width:30,height:30,borderRadius:9,background:'#ec4899',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 8px rgba(236,72,153,.45)'}}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
                          {n:1,col:'#F06535',label:'Choose Your Exam',desc:'Select your target exam from the categories above.',
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
                          <div style={{width:30,height:30,borderRadius:9,background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 8px rgba(59,130,246,.45)'}}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            <div style={{width:30,height:30,borderRadius:8,background:item.col,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0,boxShadow:`0 2px 8px ${item.col}55`}}>
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

              /* ── Onboarded user, exam chosen, but no tests taken yet (native only) ── */
              if (isNative && hasChosenExam && history.length === 0) {
                const eObj = visibleGroupExams.find(e=>e.id===selectedExamId) || visibleGroupExams[0]
                const daysToExam = savedPlan?.exam_date
                  ? Math.max(0,Math.ceil((new Date(savedPlan.exam_date)-new Date())/86400000))
                  : null
                const selHex = selectedGroup?.hex || '#F06535'
                return (
                  <div>
                    {/* Target exam banner */}
                    <div style={{background:`linear-gradient(135deg,${selHex} 0%,${selHex}cc 100%)`,borderRadius:20,padding:'22px 20px',marginBottom:16,color:'#fff',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',right:-24,top:-24,width:130,height:130,borderRadius:'50%',background:'rgba(255,255,255,.08)',pointerEvents:'none'}}/>
                      <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.7)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Your Target Exam</div>
                      <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,marginBottom:2}}>{selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||selectedGroup?.label||'Your Exam'}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.8)',marginBottom:daysToExam!=null?10:16}}>{shortLbl2(selectedGroup?.label||'')}</div>
                      {daysToExam!=null&&(
                        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,.18)',borderRadius:99,padding:'4px 12px',fontSize:12,fontWeight:800,marginBottom:16}}>
                          {daysToExam}d until exam
                        </div>
                      )}
                      <button
                        onClick={()=>onStartTest?.('mock',selectedExamId)}
                        style={{display:'block',background:'#fff',color:selHex,border:'none',borderRadius:12,padding:'11px 22px',fontSize:13,fontWeight:900,cursor:'pointer',touchAction:'manipulation'}}>
                        Start First Mock Test →
                      </button>
                    </div>

                    {/* Quick actions */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                      {[
                        {label:'Topic Practice',sub:'Build section skills',col:'#7c3aed',action:()=>onStartTest?.('topic','')},
                        {label:'Study Planner',sub:'Build a schedule',col:'#0891b2',action:()=>setActiveTab('studyplan')},
                      ].map((a,i)=>(
                        <button key={i} onClick={a.action}
                          style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,padding:'14px 12px',textAlign:'left',cursor:'pointer',touchAction:'manipulation'}}>
                          <div style={{fontSize:13,fontWeight:800,color:_t,marginBottom:3}}>{a.label}</div>
                          <div style={{fontSize:11,color:_m}}>{a.sub}</div>
                        </button>
                      ))}
                    </div>

                    {/* Available exams in group */}
                    {visibleGroupExams.length>0&&(
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:14,padding:'16px 14px',marginBottom:16}}>
                        <div style={{fontSize:12,fontWeight:700,color:_t,marginBottom:10}}>{shortLbl2(selectedGroup?.label||'')} Exams</div>
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          {visibleGroupExams.map(e=>(
                            <button key={e.id}
                              onClick={()=>onStartTest?.('mock',e.id)}
                              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:10,border:`1px solid ${e.id===selectedExamId?selHex+'55':_b}`,background:e.id===selectedExamId?`${selHex}0d`:'transparent',cursor:'pointer',touchAction:'manipulation',textAlign:'left',width:'100%'}}>
                              <div>
                                <div style={{fontSize:13,fontWeight:700,color:_t}}>{e.name}</div>
                                <div style={{fontSize:11,color:_m}}>{e.sub}</div>
                              </div>
                              {e.id===selectedExamId&&<span style={{fontSize:10,fontWeight:800,color:selHex,background:`${selHex}18`,padding:'2px 8px',borderRadius:99,flexShrink:0}}>Selected</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <TodayPlanCard savedPlan={savedPlan} onViewPlan={()=>setActiveTab('studyplan')}/>
                  </div>
                )
              }

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
                    background:'linear-gradient(135deg,#F06535 0%,#e8571c 60%,#c94613 100%)',
                    border:'none',
                    boxShadow:'0 6px 28px rgba(232,90,44,.45)',
                    padding:isNative?'20px 18px':'24px 24px 24px 30px',minHeight:isNative?140:160}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,background:'rgba(255,255,255,.3)'}}/>
                    <div style={{position:'absolute',top:-50,right:-30,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,0,0,.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:12,position:'relative'}}>
                      <div style={{flex:'1 1 auto',minWidth:0,...(!isNative&&{maxWidth:'62%'})}}>
                        <h1 style={{fontSize:21,fontWeight:900,color:'#fff',letterSpacing:'-.03em',lineHeight:1.25,margin:'0 0 6px'}}>
                          {greeting}, {firstName}! 👋
                        </h1>
                        <p style={{margin:'0 0 14px',fontSize:12.5,color:'rgba(255,255,255,.85)',lineHeight:1.65,maxWidth:400}}>
                          {history.length>0
                            ?`Keep going! You've completed ${history.length} mock test${history.length===1?'':'s'}. Your consistency is paying off.`
                            :'Welcome! Start your first mock test and begin tracking your progress.'}
                        </p>
                      </div>
                      {/* Hero illustration — hidden below 600px to keep banner compact */}
                      <div className="hero-illus" style={{flexShrink:0,position:'relative',alignSelf:'flex-end'}}>
                        <div style={{position:'absolute',top:'-10px',right:'10px',textAlign:'right',lineHeight:1.45,pointerEvents:'none'}}>
                          <div style={{fontSize:11,fontWeight:800,fontStyle:'italic',color:cd?'rgba(255,200,100,.8)':'#F06535',textShadow:cd?'none':'0 1px 4px rgba(232,90,44,.2)'}}>Practice Today</div>
                          <div style={{fontSize:10.5,fontWeight:700,fontStyle:'italic',color:cd?'rgba(255,200,100,.65)':'rgba(232,90,44,.75)'}}>Get Closer</div>
                          <div style={{fontSize:10.5,fontWeight:700,fontStyle:'italic',color:cd?'rgba(255,200,100,.65)':'rgba(232,90,44,.75)'}}>To Your Goal! →</div>
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

                  {/* Next Exam Date — only shown when user has set an exam date */}
                  {savedPlan?.exam_date && (() => {
                    const ed=new Date(savedPlan.exam_date)
                    return (
                      <div className="db-card" style={{padding:'18px 20px',display:'flex',flexDirection:'column'}}>
                        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:14}}>
                          <div style={{width:30,height:30,borderRadius:8,background:_a,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 2px 8px ${_a}55`}}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                          </div>
                          <div>
                            <div style={{fontSize:9,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.08em'}}>Next Exam Date</div>
                            <div style={{fontSize:12.5,fontWeight:800,color:_t,lineHeight:1.2}}>{selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||selectedGroup?.label||'—'}</div>
                          </div>
                        </div>
                        <div style={{fontSize:11,color:_m,marginBottom:10}}>{ed.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                        <ExamCountdown examDate={savedPlan.exam_date} accent={_a} muted={_m} dark={cd} />
                      </div>
                    )
                  })()}
                </div>

                {/* ── MAIN LAYOUT (main-area + right sidebar) ── */}
                <div className="db-three">

                  {/* MAIN AREA */}
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>

                    {/* ── STATS ROW (inside main area so right col aligns with hero right) ── */}
                    <div className="db-stat-grid">
                      {[
                        {label:'Tests Completed',value:history.length,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>,
                          trend:testsTrend!=null?`${testsTrend>=0?'↑':'↓'} ${Math.abs(testsTrend)}%`:null,trendUp:testsTrend==null||testsTrend>=0,sub:'vs last month',col:_a},
                        {label:'Average Score',value:`${avg||0}%`,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                          trend:avgTrend!=null?`${avgTrend>=0?'↑':'↓'} ${Math.abs(avgTrend)}%`:null,trendUp:avgTrend==null||avgTrend>=0,sub:'vs last month',col:'#16a34a'},
                        {label:'Accuracy',value:`${accuracyPct}%`,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="#fff"/></svg>,
                          trend:null,sub:`${totalCorrect}/${totalQ} correct`,col:'#3b82f6'},
                        {label:'Day Streak',value:streak,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                          trend:streak>0?`↑ ${streak}d`:null,trendUp:true,sub:'Keep it up!',col:'#d97706'},
                      ].map((s,si)=>(
                        <div key={si} className="db-card" style={{padding:'10px 14px'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                            <div style={{display:'flex',alignItems:'center',gap:9}}>
                              <div style={{width:32,height:32,borderRadius:9,background:s.col,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 3px 10px ${s.col}55`}}>{s.icon}</div>
                              <div style={{fontSize:22,fontWeight:900,color:_t,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{s.value}</div>
                            </div>
                            {s.trend&&<span style={{fontSize:9.5,fontWeight:700,color:s.trendUp?'#16a34a':'#dc2626',background:s.trendUp?'rgba(22,163,74,.08)':'rgba(220,38,38,.08)',borderRadius:99,padding:'1px 6px'}}>{s.trend}</span>}
                          </div>
                          <div style={{fontSize:10.5,fontWeight:700,color:_t,marginBottom:1}}>{s.label}</div>
                          <div style={{fontSize:9.5,color:_m}}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Top row: Continue Prep + Performance Chart side by side */}
                    <div className="db-sec-row">

                    {/* Continue Your Preparation / Your Next Mock Test */}
                    <div className="db-card" style={{padding:'18px 20px'}}>
                      {inProgressTest ? (()=>{
                        const iExam = inProgressTest.testData?.exam || ''
                        const iExamName = selectedGroup?.exams?.find(e=>e.id===iExam)?.name
                          || iExam.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) || 'Full Mock Test'
                        const iAnswered = Object.keys(inProgressTest.answers||{}).length
                        const iTotalQ = Object.values(inProgressTest.testData?.sections||{}).reduce((s,sec)=>s+(sec.questions?.length||sec.count||0),0)||100
                        const iSecsLeft = inProgressTest.secsLeft!=null ? inProgressTest.secsLeft : (inProgressTest.testData?.total_time_mins||60)*60
                        const iMins = Math.floor(iSecsLeft/60)
                        return <>
                          <div className="db-ctitle">Continue Your Preparation</div>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                            <span style={{fontSize:10,fontWeight:800,color:'#16a34a',background:'rgba(22,163,74,.1)',borderRadius:5,padding:'3px 8px',letterSpacing:'.04em',flexShrink:0}}>IN PROGRESS</span>
                            <span style={{fontSize:13,fontWeight:800,color:_t,lineHeight:1.3}}>{iExamName}</span>
                          </div>
                          <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:12}}>
                            {[
                              {icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>,txt:`${iAnswered}/${iTotalQ} Answered`},
                              {icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,txt:`${iMins} min left`},
                              {icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,txt:'Full Pattern'},
                            ].map((it,ii)=>(
                              <span key={ii} style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:_m}}>{it.icon}{it.txt}</span>
                            ))}
                          </div>
                          <div style={{height:5,background:cd?'rgba(255,255,255,.07)':'#f0f0f0',borderRadius:99,overflow:'hidden',marginBottom:4}}>
                            <div style={{height:'100%',width:`${Math.min(95,Math.max(5,Math.round(iAnswered/Math.max(1,iTotalQ)*100)))}%`,background:'linear-gradient(90deg,#F06535,#ff8a5f)',borderRadius:99}}/>
                          </div>
                          <div style={{fontSize:10.5,color:_m,marginBottom:14}}>{iAnswered} of {iTotalQ} questions answered</div>
                          <div style={{display:'flex',gap:10}}>
                            <button onClick={()=>onResumeTest?.()}
                              style={{flex:1,background:_a,color:'#fff',border:'none',borderRadius:9,padding:'10px 16px',fontWeight:800,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              Resume Test →
                            </button>
                            <button onClick={()=>{ try{localStorage.removeItem('mt-inprogress');localStorage.removeItem('mt-inprogress-state')}catch{}; setInProgressTest(null) }}
                              style={{background:'none',color:_m,border:`1px solid ${_b}`,borderRadius:9,padding:'10px 16px',fontWeight:700,fontSize:13,cursor:'pointer',whiteSpace:'nowrap'}}>
                              Discard
                            </button>
                          </div>
                        </>
                      })() : (()=>{
                        const nr=(examResults.length||history.length)+1
                        const examName2=selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||'Mock Test'
                        const totalQs=(selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.questions)||100
                        return <>
                          <div className="db-ctitle">Your Next Mock Test</div>
                          {history.length>0 ? <>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                              <span style={{fontSize:10,fontWeight:800,color:'#2563eb',background:'rgba(37,99,235,.1)',borderRadius:5,padding:'3px 8px',letterSpacing:'.04em',flexShrink:0}}>UP NEXT</span>
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
                            <div style={{fontSize:11,color:_m,marginBottom:14}}>You've completed {history.length} mock test{history.length!==1?'s':''}. Keep the streak going!</div>
                            <button onClick={()=>onStartTest?.('mock',selectedExamId)}
                              style={{width:'100%',background:_a,color:'#fff',border:'none',borderRadius:9,padding:'10px 16px',fontWeight:800,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              Start Now →
                            </button>
                          </> : (
                            <div style={{textAlign:'center',padding:'14px 0'}}>
                              <div style={{fontSize:12,color:_m,marginBottom:12}}>No tests yet. Start your first mock test to begin tracking your progress.</div>
                              <button onClick={()=>onStartTest?.('mock',selectedExamId)} style={{background:_a,color:'#fff',border:'none',borderRadius:9,padding:'10px 20px',fontWeight:800,fontSize:13,cursor:'pointer'}}>Start First Test →</button>
                            </div>
                          )}
                        </>
                      })()}
                    </div>

                    {/* Your Recent Performance Chart */}
                    <div className="db-card" style={{padding:'18px 20px'}}>
                      <div className="db-ctitle">
                        Your Recent Performance
                        <div style={{display:'flex',gap:12}}>
                          {[{col:'#F06535',lbl:'Score %'},{col:'#3b82f6',lbl:'Accuracy %'}].map(l=>(
                            <span key={l.lbl} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,fontWeight:700,color:_m}}>
                              <span style={{width:12,height:12,borderRadius:3,background:l.col,display:'inline-block',flexShrink:0}}/>
                              {l.lbl}
                            </span>
                          ))}
                        </div>
                      </div>
                      {chartResults.length>0 ? (
                        <div style={{width:'100%',minWidth:0,overflow:'hidden'}}>
                          <ResponsiveContainer width="100%" height={200} debounce={50}>
                            <BarChart
                              data={chartResults.map((r,i)=>({
                                name: `T${i+1}`,
                                Score: Math.round(r.percentage||0),
                                Accuracy: ((r.correct_count||0)+(r.wrong_count||0))>0
                                  ? Math.round((r.correct_count||0)/((r.correct_count||0)+(r.wrong_count||0))*100)
                                  : 0
                              }))}
                              margin={{top:22,right:8,bottom:4,left:-20}}
                              barCategoryGap="30%"
                              barGap={2}>
                              <CartesianGrid strokeDasharray="3 3" stroke={cd?'rgba(255,255,255,.06)':'#f0f0f0'} vertical={false}/>
                              <XAxis dataKey="name" tick={{fontSize:9,fill:_m}} tickLine={false} axisLine={false}/>
                              <YAxis tick={{fontSize:9,fill:_m}} tickLine={false} axisLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                              <Tooltip
                                cursor={{fill:cd?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'}}
                                contentStyle={{background:_s,border:`1px solid ${_b}`,borderRadius:10,fontSize:11,padding:'8px 12px'}}
                                labelStyle={{color:_t,fontWeight:700,marginBottom:4}}
                                formatter={(val,name)=>[`${val}%`, name]}
                              />
                              <Bar dataKey="Score" fill="#F06535" radius={[4,4,0,0]} maxBarSize={18}
                                label={{position:'top',fontSize:8,fontWeight:700,fill:'#F06535',formatter:v=>`${v}%`}}/>
                              <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={18}
                                label={{position:'top',fontSize:8,fontWeight:700,fill:'#3b82f6',formatter:v=>`${v}%`}}/>
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
                            {/* Need Improvement label */}
                            <div style={{marginBottom:14}}>
                              <span style={{padding:'5px 12px',borderRadius:7,border:`1.5px solid ${_a}`,fontSize:11,fontWeight:700,background:_a,color:'#fff',display:'inline-block'}}>Need Improvement</span>
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
                              const showArr = weakTopicArr.length>0 ? weakTopicArr : topicPerfArr.slice(0,5)
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
                                    const iconBg=isWeak?'#f97316':'#16a34a'
                                    const iconCol='#fff'
                                    return (
                                      <div key={ti}>
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                                          <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                                            <div style={{width:24,height:24,borderRadius:7,background:iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:iconCol,flexShrink:0,boxShadow:`0 2px 6px ${iconBg}55`}}>
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
                    <div className="db-card" style={{padding:'18px 20px'}}>
                      <div className="db-ctitle">
                        Recent Tests
                        <button onClick={()=>setActiveTab('performance')} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0,whiteSpace:'nowrap',flexShrink:0}}>View All →</button>
                      </div>
                      {history.length>0 ? (
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          {history.slice(0,5).map((r,i)=>{
                            const pct=Math.round(r.percentage||0)
                            const tot2=(r.correct_count||0)+(r.wrong_count||0)
                            const acc=tot2>0?Math.round((r.correct_count||0)/tot2*100):0
                            const nm=r.test_type==='topic_diagnostic'?`Topic · ${_toT2(r.topic||'')}`:r.test_type==='mini'?`Practice · ${_toT2(r.section||'')}`:_toT2(r.exam||'Mock')
                            const dt=new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})
                            const scorePct=Math.round(r.percentage||0)
                            const isGood=scorePct>=60
                            return (
                              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:cd?'rgba(255,255,255,.04)':'#fafafa',border:`1px solid ${cd?'rgba(255,255,255,.08)':'#f0f0f0'}`}}>
                                {/* Score badge */}
                                <div style={{width:38,height:38,borderRadius:9,background:isGood?'rgba(22,163,74,.12)':'rgba(249,115,22,.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                  <span style={{fontSize:12,fontWeight:900,color:isGood?'#16a34a':'#f97316'}}>{scorePct}%</span>
                                </div>
                                {/* Name + date */}
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:12,fontWeight:700,color:_t,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{nm}</div>
                                  <div style={{display:'flex',gap:8,marginTop:2,flexWrap:'wrap'}}>
                                    <span style={{fontSize:10.5,color:_m}}>{dt}</span>
                                    <span style={{fontSize:10.5,color:'#16a34a',fontWeight:600}}>{r.correct_count||0} ✓</span>
                                    <span style={{fontSize:10.5,color:'#ef4444',fontWeight:600}}>{r.wrong_count||0} ✗</span>
                                    <span style={{fontSize:10.5,color:isGood?'#16a34a':'#f97316',fontWeight:700}}>{acc}% acc</span>
                                  </div>
                                </div>
                                <button onClick={()=>onOpenResult?.(r)} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:`1px solid ${_a}`,borderRadius:6,padding:'4px 8px',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>View</button>
                              </div>
                            )
                          })}
                        </div>
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
                        <button onClick={()=>{setGoalEditVal(dailyGoal);setShowGoalEditor(v=>!v)}} style={{fontSize:11,fontWeight:700,color:_a,background:'none',border:'none',cursor:'pointer',padding:0}}>
                          {showGoalEditor?'Cancel':'Edit Goal'}
                        </button>
                      </div>
                      {showGoalEditor && (
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,padding:'10px 12px',background:cd?'rgba(255,255,255,.05)':'#fff8f5',borderRadius:9,border:`1px solid ${cd?'rgba(255,255,255,.1)':'#fde8dc'}`}}>
                          <span style={{fontSize:12,color:_t,fontWeight:600,flex:1}}>Daily activities target:</span>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <button onClick={()=>setGoalEditVal(v=>Math.max(1,v-1))} style={{width:26,height:26,borderRadius:6,border:`1px solid ${_b}`,background:'transparent',color:_t,cursor:'pointer',fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                            <span style={{fontSize:14,fontWeight:800,color:_t,minWidth:20,textAlign:'center'}}>{goalEditVal}</span>
                            <button onClick={()=>setGoalEditVal(v=>Math.min(10,v+1))} style={{width:26,height:26,borderRadius:6,border:`1px solid ${_b}`,background:'transparent',color:_t,cursor:'pointer',fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                          </div>
                          <button onClick={()=>{try{localStorage.setItem('mt_dailyGoal',String(goalEditVal))}catch{}; setDailyGoal(goalEditVal); setShowGoalEditor(false)}} style={{padding:'5px 12px',background:_a,color:'#fff',border:'none',borderRadius:7,fontWeight:700,fontSize:11,cursor:'pointer'}}>Save</button>
                        </div>
                      )}
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                        <div style={{flex:1,height:6,background:cd?'rgba(255,255,255,.07)':'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${testsToday>0?Math.min(100,Math.round(testsToday/dailyGoal*100)):0}%`,background:`linear-gradient(90deg,${_a},#ff8a5f)`,borderRadius:99,transition:'width .5s'}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:_t,flexShrink:0}}>{testsToday} / {dailyGoal}</span>
                      </div>
                      <div style={{fontSize:10.5,color:_m}}>
                        {testsToday===0
                          ? '⚡ Start a test or practice to hit today\'s goal'
                          : testsToday>=dailyGoal
                            ? `✅ Goal reached! ${testsToday} activities done today`
                            : `${testsToday} of ${dailyGoal} done today — keep going!`}
                      </div>
                    </div>

                    {/* For More Practice – Topic Wise */}
                    <div className="db-card" style={{padding:'16px 18px'}}>
                      <div style={{fontSize:13,fontWeight:700,color:_t,marginBottom:12}}>For More Practice – Topic Wise</div>
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {[
                          {col:'#F06535',label:'Numerical Ability',sub:'Arithmetic, Number Series & more',sec:'numerical_ability',icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="13" x2="16" y2="17"/><line x1="14" y1="15" x2="18" y2="15"/><line x1="8" y1="13" x2="12" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>},
                          {col:'#8b5cf6',label:'Reasoning Ability',sub:'Puzzles, Syllogisms & more',sec:'reasoning',icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14z"/></svg>},
                          {col:'#0ea5e9',label:'English Language',sub:'Reading Comprehension & more',sec:'english',icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>},
                          {col:'#16a34a',label:'Take a Full Mock Test',sub:`${selectedGroup?.exams?.find(e=>e.id===selectedExamId)?.name||'Full Test'} – Next`,sec:null,icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/><polyline points="9 8 10 9 12 7"/></svg>},
                        ].map((rec,ri)=>(
                          <button key={ri} onClick={()=>{if(rec.sec){try{sessionStorage.setItem('mt-topic-section',rec.sec)}catch{};onStartTest?.('topic','')}else{onStartTest?.('mock',selectedExamId)}}}
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
                            {(isPro?VISIBLE_GROUPS:VISIBLE_GROUPS.filter(g=>g.id===selectedGroup?.id)).flatMap(g=>g.exams).slice(0,8).map(e=>(
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
                {VISIBLE_GROUPS.map(g => (
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
              const TOPIC_COLORS = ['#F06535','#1d4ed8','#7c3aed','#0891b2','#d97706','#16a34a','#e11d48','#db2777','#0d9488','#9333ea','#ca8a04','#2563eb']
              const cutExam = exploreExam ? CUTOFF_EXAMS.find(e => e.id === (CUTOFF_ID_MAP[exploreExam] || exploreExam)) : null
              const cutRows = cutExam ? cutExam.rows.slice(0, 2) : []
              return (
              <div>
                {!exam ? (
                  /* ── PREMIUM EXPLORE SCREEN ── */
                  <>
                    {/* Search bar */}
                    <div style={{position:'relative',marginBottom:12}}>
                      <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input
                        ref={exploreSearchRef}
                        value={exploreSearch}
                        onChange={e => { setExploreSearch(e.target.value); setActiveExploreGroup(null) }}
                        placeholder="Search exams, topics..."
                        style={{width:'100%',paddingLeft:38,paddingRight:exploreSearch?36:16,height:42,borderRadius:12,border:'1.5px solid #e5e7eb',fontSize:13.5,background:'#f9fafb',outline:'none',boxSizing:'border-box',fontFamily:'inherit',color:'#111'}}
                      />
                      {exploreSearch && (
                        <button onClick={()=>setExploreSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',border:'none',background:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#9ca3af'}}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    {/* Category filter chips */}
                    <div style={{display:'flex',gap:7,overflowX:'auto',scrollbarWidth:'none',paddingBottom:2,marginBottom:16}}>
                      {[{id:null,label:'All'},...VISIBLE_GROUPS.map(g=>({id:g.id,label:g.label.replace(' Exams','').replace(' Exam','').split('/')[0].trim()}))].map(f=>{
                        const active = f.id===null ? !activeExploreGroup : activeExploreGroup===f.id
                        return (
                          <button key={f.id||'all'} onClick={()=>setActiveExploreGroup(f.id)}
                            style={{flexShrink:0,padding:'6px 15px',borderRadius:99,fontSize:12.5,fontWeight:700,border:`1.5px solid ${active?'#F06535':'#e5e7eb'}`,background:active?'#F06535':'#fff',color:active?'#fff':'#6b7280',cursor:'pointer',whiteSpace:'nowrap',touchAction:'manipulation'}}>
                            {f.label}
                          </button>
                        )
                      })}
                    </div>
                    {/* Section heading */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                      <span style={{fontSize:15,fontWeight:800,color:'#111'}}>{exploreSearch ? `Results for "${exploreSearch}"` : 'Trending Exams'}</span>
                      {!exploreSearch && <span style={{fontSize:12,fontWeight:700,color:'#F06535'}}>View All</span>}
                    </div>
                    {/* Premium exam cards */}
                    {(() => {
                      const sq = exploreSearch.toLowerCase().trim()
                      const groups = activeExploreGroup ? VISIBLE_GROUPS.filter(g=>g.id===activeExploreGroup) : VISIBLE_GROUPS
                      const filtered = sq
                        ? groups.map(g=>({...g,exams:g.exams.filter(e=>(g.label+' '+e.name).toLowerCase().includes(sq))})).filter(g=>g.exams.length)
                        : groups
                      if (sq && filtered.length===0) return <div style={{textAlign:'center',padding:'32px 0',color:'#9ca3af',fontSize:14}}>No exams found for "{exploreSearch}"</div>
                      return filtered.map(g => {
                      const getLvl = (n='',id='') => {
                        const s = (n+id).toLowerCase()
                        if (s.includes('mains')||s.includes('grade b')||s.includes('grade a')||s.includes('phase 1')) return 'hard'
                        if (s.includes('po')||s.includes('officer')||s.includes('mt ')||s.includes('aao')) return 'med'
                        return 'easy'
                      }
                      const LVL = { hard:{l:'ADVANCED',bg:'rgba(232,90,44,.12)',c:'#F06535'}, med:{l:'INTERMEDIATE',bg:'rgba(10,132,255,.12)',c:'#0a84ff'}, easy:{l:'BEGINNER',bg:'rgba(52,199,89,.12)',c:'#34c759'} }
                      const STATIC_TRIES = {bank_po_prelims:'24k',bank_po_mains:'12k',bank_clerk_prelims:'38k',bank_clerk_mains:'8k',sbi_po_prelims:'19k',sbi_po_mains:'7k',sbi_clerk_prelims:'28k',sbi_clerk_mains:'5k'}
                      const STATIC_RATING = {bank_po_prelims:'4.8',bank_po_mains:'4.9',bank_clerk_prelims:'4.7',sbi_po_prelims:'4.8',sbi_po_mains:'4.9',rbi_gradeb_p1:'4.9'}
                      return g.exams.map(e => {
                        const lv = getLvl(e.name, e.id); const li = LVL[lv]
                        const qNum = (e.sub.match(/(\d+)\s*Q/)||[])[1]||'—'
                        const mNum = (e.sub.match(/(\d+)\s*min/)||[])[1]||'—'
                        const tries  = STATIC_TRIES[e.id] || '5k'
                        const rating = STATIC_RATING[e.id] || '4.7'
                        const abbr = g.label.replace(/ Exams?/,'').split('/')[0].trim()
                        const abbrFs = abbr.length >= 6 ? 8.5 : abbr.length >= 5 ? 10 : abbr.length >= 4 ? 12 : abbr.length >= 3 ? 14 : 18
                        return (
                          <div key={e.id} style={{background:'#fff',borderRadius:18,boxShadow:'0 2px 12px rgba(0,0,0,.07)',marginBottom:11,overflow:'hidden',border:`1px solid ${g.hex}18`}}>
                            {/* Card header */}
                            <div style={{display:'flex',alignItems:'flex-start',gap:13,padding:'15px 15px 11px',background:`linear-gradient(135deg,${g.hex}08,transparent)`}}>
                              <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${g.hex},${g.hex}bb)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:abbrFs,fontWeight:900,color:'#fff',flexShrink:0,boxShadow:`0 4px 12px ${g.hex}40`,letterSpacing:abbr.length>=5?'-.5px':'0',padding:'2px',textAlign:'center',lineHeight:1.1}}>
                                {abbr}
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,flexWrap:'wrap'}}>
                                  <span style={{fontSize:9.5,fontWeight:800,letterSpacing:'.04em',padding:'2px 8px',borderRadius:7,background:li.bg,color:li.c}}>{li.l}</span>
                                  {e.tag && <span style={{fontSize:9.5,fontWeight:800,padding:'2px 8px',borderRadius:7,background:`${g.hex}15`,color:g.hex}}>{e.tag}</span>}
                                </div>
                                <div style={{fontSize:14,fontWeight:800,color:'#111',lineHeight:1.25,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.label.replace(' Exams','').replace(' Exam','')} {e.name}</div>
                              </div>
                            </div>
                            {/* Meta row */}
                            <div style={{display:'flex',alignItems:'center',padding:'9px 15px 12px',borderTop:`1px solid ${g.hex}12`,gap:2}}>
                              <div style={{display:'flex',gap:12,flex:1,flexWrap:'wrap'}}>
                                <span style={{display:'flex',alignItems:'center',gap:3,fontSize:11.5,color:'#6b7280',fontWeight:600}}>
                                  <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                  {qNum} Qs
                                </span>
                                <span style={{display:'flex',alignItems:'center',gap:3,fontSize:11.5,color:'#6b7280',fontWeight:600}}>
                                  <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {mNum} min
                                </span>
                              </div>
                              {e.comingSoon ? (
                                <span style={{fontSize:11,fontWeight:700,padding:'7px 12px',borderRadius:11,background:'#f3f4f6',color:'#9ca3af',flexShrink:0}}>Soon</span>
                              ) : (
                                <button onClick={() => { onStartTest('mock', e.id); window.scrollTo(0,0) }}
                                  style={{fontSize:12,fontWeight:800,padding:'8px 16px',borderRadius:11,background:`linear-gradient(135deg,${g.hex},${g.hex}cc)`,color:'#fff',border:'none',cursor:'pointer',flexShrink:0,boxShadow:`0 3px 9px ${g.hex}40`,touchAction:'manipulation'}}>
                                  Start →
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    })
                    })()}
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
                            style={{ background:'#F06535' }}
                            onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                            onMouseOut={e=>e.currentTarget.style.background='#F06535'}>
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
                          style={exploreTab===id?{borderColor:'#F06535'}:{}}>
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
                                    <td key={c} className="px-3 py-2.5 text-center font-semibold whitespace-nowrap" style={{ color:c==='UR'?'#F06535':'#374151' }}>{r[c]??'—'}</td>
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
                      <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4" style={{borderColor:'#fed7c2',borderTopColor:'#F06535'}}/>{/* UI: orange spinner (MockTest palette) */}
                      <div className="text-sm text-gray-500">Loading your study plan...</div>
                    </div>
                  </div>
                ) : savedPlan && !showPlanBuilder ? (
                  <PlanScheduleView
                    plan={savedPlan}
                    onStartTest={onStartTest}
                    onTopicPractice={(topic) => {
                      onStartTest('topic', topic)
                    }}
                    onRebuild={() => { setShowPlanBuilder(true); setGeneratedPlan(null) }}
                    todayStr={today}
                    completedTasks={completedTasks}
                    onToggleDone={handleToggleDone}
                  />
                ) : (
                  /* ── Plan builder form ── */
                  /* UI: sp-page = style hook for the Study Planner web styles in index.css (team banner kept) */
                  <div className="w-full sp-form sp-page">
                    {/* ── Study Planner hero banner ── */}
                    <div style={{background:'linear-gradient(135deg,#F06535 0%,#f06030 58%,#d95020 100%)',borderRadius:isNative?18:20,padding:isNative?'18px 18px 16px':'22px 24px 20px',marginBottom:20,position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:-28,right:-18,width:110,height:110,borderRadius:'50%',background:'rgba(255,255,255,.09)',pointerEvents:'none'}}/>
                      <div style={{position:'absolute',bottom:-18,left:-12,width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.06)',pointerEvents:'none'}}/>
                      <div style={{position:'absolute',top:'50%',right:16,transform:'translateY(-50%)',opacity:.07,pointerEvents:'none'}}>
                        <svg width="64" height="64" fill="#fff" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><rect x="3" y="9" width="18" height="1"/><line x1="8" y1="2" x2="8" y2="5" stroke="#fff" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="5" stroke="#fff" strokeWidth="2"/></svg>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,position:'relative'}}>
                        <div style={{width:36,height:36,borderRadius:11,background:'rgba(255,255,255,.22)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,backdropFilter:'blur(4px)'}}>
                          <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                        </div>
                        <h2 style={{fontSize:20,fontWeight:900,color:'#fff',letterSpacing:'-.02em',margin:0,lineHeight:1.1}}>Study Planner</h2>
                      </div>
                      <p style={{fontSize:12.5,color:'rgba(255,255,255,.88)',margin:'0 0 0',lineHeight:1.65,fontWeight:500,position:'relative',maxWidth:340}}>
                        Tell us your exam date and daily hours — we'll build a clear, day-by-day schedule with mock tests and revision built in.
                      </p>
                      {savedPlan && (
                        <button onClick={()=>setShowPlanBuilder(false)} style={{marginTop:12,fontSize:11.5,fontWeight:700,color:'#fff',background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.32)',borderRadius:9,padding:'6px 14px',cursor:'pointer',touchAction:'manipulation',position:'relative'}}>
                          ← View My Plan
                        </button>
                      )}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4 items-start sp-grid">

                    {/* ════ LEFT column: exam + weak topics ════ */}
                    <div>
                    {/* Exam selector — tabbed by category */}
                    {(() => {
                      const activeGrp = VISIBLE_GROUPS.find(g => g.id === planExamTab) || VISIBLE_GROUPS[0]
                      return (
                      <div className="sp-card" style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:16,marginBottom:16,width:'100%',minWidth:0,boxSizing:'border-box'}}>
                        {/* Header */}
                        <div className="sp-header" style={{padding:'14px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',gap:8}}>
                          <DIcGrad s={18} c='#F06535'/>{/* UI: orange header icon */}
                          <span style={{fontSize:13.5,fontWeight:700,color:'#111827'}}>Select your target exam</span>
                          {planExam && (() => {
                            const g = ACTIVE_GROUPS.find(gr => gr.exams.find(e => e.id === planExam))
                            const e = g?.exams.find(e => e.id === planExam)
                            return e ? (
                              <span style={{marginLeft:'auto',fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:99,background:`${hex6(g.hex)}18` /* UI FIX: hex6 so #111 stays valid */,color:g.hex,flexShrink:0}}>
                                ✓ {e.name}
                              </span>
                            ) : null
                          })()}
                        </div>
                        {/* Category tabs — horizontally scrollable; pan-x prevents Android vertical scroll from claiming the gesture */}
                        {/* UI: planTabRowRef — the selected tab is auto-centred in this row (see effect near avatarInputRef) */}
                        <div ref={planTabRowRef} style={{overflowX:'auto',scrollbarWidth:'none',msOverflowStyle:'none',WebkitOverflowScrolling:'touch',touchAction:'pan-x',width:'100%',minWidth:0,boxSizing:'border-box',borderBottom:'1px solid #f3f4f6'}}>
                          <div style={{display:'flex',minWidth:'max-content',padding:'10px 16px',gap:8}}>
                            {VISIBLE_GROUPS.map(g => {
                              const isTab = (planExamTab||VISIBLE_GROUPS[0].id) === g.id
                              const hasSelected = g.exams.some(e => e.id === planExam)
                              return (
                                <button key={g.id} className={`sp-tab ${isTab ? 'is-active' : ''}`} /* UI: hover in index.css */
                                  onClick={() => setPlanExamTab(g.id)}
                                  style={{
                                    padding:'6px 14px',
                                    fontSize:12,fontWeight:700,
                                    whiteSpace:'nowrap',
                                    borderRadius:20,
                                    border: isTab ? 'none' : `1.5px solid ${hasSelected ? hex6(g.hex)+'80' : '#e5e7eb'}`, /* UI FIX: hex6 */
                                    background: isTab ? g.hex : hasSelected ? hex6(g.hex)+'14' : '#f9fafb', /* UI FIX: hex6 */
                                    color: isTab ? '#fff' : hasSelected ? g.hex : '#6b7280',
                                    cursor:'pointer',
                                    transition:'all .15s',
                                    position:'relative',
                                    touchAction:'manipulation',
                                    boxShadow: isTab ? `0 2px 8px ${hex6(g.hex)}50` : 'none', /* UI FIX: hex6 */
                                  }}>
                                  {g.label.replace(' Exams','').replace(' Exam','')}
                                  {hasSelected && !isTab && (
                                    <span style={{position:'absolute',top:4,right:5,width:5,height:5,borderRadius:'50%',background:g.hex}}/>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        {/* Exam chips for selected category */}
                        <div style={{padding:'14px 16px',width:'100%',boxSizing:'border-box'}}>
                          <div style={{display:'grid',gridTemplateColumns:isNative?'repeat(2,1fr)':'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
                            {activeGrp.exams.map(e => {
                              const sel = planExam === e.id
                              return (
                                <button key={e.id} onClick={() => setPlanExam(e.id)} className={`sp-exam-chip ${sel ? 'is-sel' : ''}`} /* UI: hover in index.css */
                                  style={{
                                    padding:'8px 10px',
                                    borderRadius:10,
                                    fontSize:12,fontWeight:600,
                                    border:`1.5px solid ${sel ? activeGrp.hex : hex6(activeGrp.hex)+'40'}`, /* UI FIX: was '#11140' (invalid) for SBI → no border */
                                    background: sel ? activeGrp.hex : `${hex6(activeGrp.hex)}0d`, /* UI FIX: hex6 so 3-digit colours (#111) stay valid */
                                    color: sel ? '#fff' : activeGrp.hex,
                                    textAlign:'left',cursor:'pointer',
                                    transition:'all .12s',
                                    lineHeight:1.3,
                                    touchAction:'manipulation',
                                  }}>
                                  <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.name}</div>
                                  {e.sub && <div style={{fontSize:10,opacity:.7,marginTop:2,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.sub}</div>}
                                </button>
                              )
                            })}
                          </div>
                          <div style={{marginTop:10,fontSize:11,color:'#9ca3af',fontWeight:500}}>
                            {activeGrp.exams.length} exam{activeGrp.exams.length!==1?'s':''} in {activeGrp.label}
                          </div>
                        </div>
                      </div>
                      )
                    })()}

                    {/* Weak topics */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden sp-card">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between sp-header">
                        <div className="flex items-center gap-2">
                          <DIcBolt s={16} c='#F06535'/>{/* UI: orange header icon (MockTest palette) */}
                          <div>
                            <span className="text-sm font-bold text-gray-900">Select and arrange weak topics</span>
                            <p className="text-xs text-gray-400 mt-0.5">These get extra days in your plan · {weakTopics.length} selected</p>
                          </div>
                        </div>
                        {weakTopics.length > 0 && (
                          <button onClick={() => setWeakTopics([])} className="text-xs text-red-500 font-semibold sp-clear">Clear all</button>
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
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border text-center truncate sp-chip ${sel ? 'is-sel' : ''}`} /* UI: hover styles in index.css (.sp-chip) */
                                    style={sel
                                      ? {borderColor:group.color, background:group.color, color:'#fff', fontWeight:700, boxShadow:`0 2px 8px ${group.color}44`}
                                      : {borderColor:group.color, background:`${group.color}BB`, color:'#fff'}}>
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
                            <summary className="sp-summary px-5 py-3 text-sm font-semibold text-blue-600 cursor-pointer select-none list-none flex items-center justify-between">
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
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden sp-card">
                      <div className="px-5 py-3.5 border-b border-gray-100 sp-header">
                        <div className="flex items-center gap-2">
                          <span className="flex" style={{color:'#F06535'}}><NavPlanner /></span>{/* UI: same calendar-with-tick icon as the sidebar's Study Planner item */}
                          <span className="text-sm font-bold text-gray-900">Choose your start and end dates</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-6">Based on your selections, we'll evenly distribute topics across your plan</p>
                      </div>
                      <div className="px-5 py-4">
                        {/* UI: two separate input boxes (label above, mm/dd/yyyy + calendar icon inside).
                            Type the date (mm → dd → yyyy, auto-advances) or click the calendar icon to pick one. Styles: .sp-date in index.css */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="min-w-0">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Start date</label>
                            {/* UI: typeable date + MockTest-styled calendar pop-up (components/ui/Popovers.jsx) */}
                            <DateField label="start date" min={today} max={startMax || undefined} value={startDate} onChange={setStartDate}
                              className={`sp-date w-full text-sm ${startDate ? '' : 'sp-date-empty'}`}/>
                          </div>
                          <div className="min-w-0">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">End date <span className="text-gray-300 font-normal">{(!isPro && trialActive) ? `(within your ${trialDaysLeft}-day trial)` : '(max 7 days)'}</span></label>
                            <DateField label="end date" min={minEnd} max={maxEnd || undefined} value={endDate} onChange={setEndDate}
                              className={`sp-date w-full text-sm ${endDate ? '' : 'sp-date-empty'}`}/>
                          </div>
                        </div>
                        {startDate && endDate && (
                          <p className="text-xs text-blue-600 font-semibold mt-2">
                            {Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24))} calendar days · {studyDays.length} study days/week selected
                          </p>
                        )}
                        {(!startDate || !endDate) && (
                          /* UI: hint shown as a soft info note (styles: .sp-hint in index.css) */
                          <p className="text-xs mt-3 sp-hint">Pick both a start and end date to enable Create Plan.</p>
                        )}
                      </div>
                    </div>

                    {/* Study days + per-day hours (checkbox · slider · hh:mm) */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden sp-card">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between sp-header">
                        <div className="flex items-center gap-2">
                          {/* UI: clock icon replaces the ⏰ emoji */}
                          <span className="flex"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F06535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
                          <span className="text-sm font-bold text-gray-900">Select your study days and hours</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400">hh:mm</span>
                      </div>
                      {/* UI: each day is a soft rounded row (tinted when on), custom slider that fills
                          as you drag (--fill), hh:mm shown as a pill. Styles: .sp-day* in index.css */}
                      <div className="px-3 py-3 space-y-1">
                        {WEEK_DISPLAY.map(d => {
                          const on  = studyDays.includes(d)
                          const hrs = on ? (Number(dayHours[d]) || 0) : 0
                          const hh  = String(Math.floor(hrs)).padStart(2,'0')
                          const mm  = String(Math.round((hrs % 1) * 60)).padStart(2,'0')
                          return (
                            <div key={d} className={`sp-day flex items-center gap-3 ${on ? 'is-on' : ''}`}>
                              <label className="flex items-center gap-2.5 w-[72px] flex-shrink-0 cursor-pointer">
                                <input type="checkbox" checked={on} onChange={()=>toggleDay(d)} className="sp-day-check"/>
                                <span className={`text-sm font-semibold ${on?'text-gray-900':'text-gray-400'}`}>{d}</span>
                              </label>
                              <input type="range" min="0" max="12" step="0.5" value={hrs} disabled={!on}
                                onChange={e=>setDayHour(d, Number(e.target.value))}
                                style={{'--fill': `${(hrs/12)*100}%`}}
                                className="sp-range flex-1"/>
                              <span className={`sp-time ${on ? 'is-on' : ''}`}>{hh}:{mm}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mark off unavailable days */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden sp-card">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 sp-header">
                        {/* UI: calendar-off icon replaces the 🚫 emoji */}
                        <span className="flex"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F06535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4"/></svg></span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900">Mark off unavailable days</div>
                          <div className="text-xs text-gray-400 mt-0.5">Tap any study day to block it — no tasks will be scheduled for those days</div>
                        </div>
                        {blockedDates.length > 0 && (
                          <button onClick={()=>setBlockedDates([])}
                            className="text-xs font-semibold flex-shrink-0 sp-clear"
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
                              <button key={dateStr} className={`sp-daypill ${isStudy ? 'is-study' : ''} ${blocked ? 'is-blocked' : ''}`} /* UI: hover in index.css */
                                onClick={()=>isStudy && toggleBlockedDate(dateStr)}
                                title={isStudy ? (blocked ? 'Click to unblock' : 'Click to block') : 'Not a study day'}
                                style={{
                                  position:'relative',
                                  padding:'8px 12px',
                                  borderRadius:12, /* UI: was 10 */
                                  textAlign:'center',
                                  minWidth:52,
                                  cursor: isStudy ? 'pointer' : 'default',
                                  border: `1.5px solid ${blocked ? '#fca5a5' : isStudy ? '#e5e7eb' : '#f3f4f6'}`,
                                  background: blocked ? '#fee2e2' : isStudy ? '#ffffff' : '#fafafa', /* UI: study day was #f9fafb */
                                  boxShadow: isStudy && !blocked ? '0 1px 2px rgba(15,23,42,.06)' : 'none', /* UI: subtle lift */
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
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden sp-card">
                      <div className="px-5 py-4 flex items-start gap-3 sp-toggle-row">{/* UI: row hover */}
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
                          /* UI: styled dropdown (the browser's native <select> menu can't be styled) */
                          <SelectField value={catchupEvery} onChange={setCatchupEvery} ariaLabel="Catch-up day frequency"
                            className="flex-shrink-0"
                            options={[2, 3, 4, 5, 7].map(n => ({ value: n, label: `Every ${n} days` }))}/>
                        )}
                      </div>
                      {catchupEnabled && (
                        /* UI: info note in brand-orange tint (MockTest palette) */
                        <div style={{margin:'0 16px 14px',padding:'10px 12px',borderRadius:12,
                          background:'#FFF3EE',border:'1px solid #fec9b0',
                          fontSize:11,color:'#c2410c',fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
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
                        /* UI: Create Plan = brand-orange gradient with glow (was blue→violet, which the
                           brand override in index.css turned into an orange→black gradient) */
                        className={`w-full py-3.5 rounded-[14px] text-sm font-bold tracking-wide transition-all ${
                          planSaved ? 'bg-green-600 text-white'
                          : (startDate&&endDate&&studyDays.length)
                            ? 'sp-cta text-white'
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
                            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center sp-card">{/* UI: same card style */}
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
                onOpenResult={onOpenResult}
              />
            )}

            {activeTab === 'prediction' && (
              (isNative && examResults.length < 3) ? (
                <div style={{textAlign:'center',padding:'56px 20px 40px'}}>
                  <div style={{fontSize:38,marginBottom:14}}>🔮</div>
                  <div style={{fontSize:17,fontWeight:900,color:_t,marginBottom:8}}>AI Prediction</div>
                  <div style={{fontSize:13,color:_m,marginBottom:4,lineHeight:1.6}}>
                    Complete at least <b style={{color:_t}}>3 mock tests</b> for {selectedExam?.name||'your exam'} to unlock your clearance probability score.
                  </div>
                  <div style={{fontSize:12,color:_m,marginBottom:22}}>
                    You've completed <b style={{color:_t}}>{examResults.length}</b> of 3 required tests.
                  </div>
                  <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:28}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:14,height:14,borderRadius:'50%',background:i<examResults.length?'#F06535':'#e5e7eb',transition:'background .3s'}}/>
                    ))}
                  </div>
                  <button onClick={()=>onStartTest?.('mock',selectedExamId)}
                    style={{background:'#F06535',color:'#fff',border:'none',borderRadius:12,padding:'12px 28px',fontSize:14,fontWeight:900,cursor:'pointer',touchAction:'manipulation'}}>
                    Take a Mock Test
                  </button>
                </div>
              ) : (
                <PredictionPage
                  history={history}
                  user={user}
                  savedPlan={savedPlan}
                  darkMode={document.documentElement.classList.contains('dark')}
                  onNav={setActiveTab}
                />
              )
            )}

            {activeTab === 'settings' && (
              <div style={{maxWidth:480}}>
                <h2 style={{fontSize:18,fontWeight:900,color:_t,marginBottom:20}}>Settings</h2>

                {/* ── Push Notifications (native only) ── */}
                {isNative && notifPrefs && (() => {
                  const p = notifPrefs
                  const updatePref = async (key, val) => {
                    const next = { ...p, [key]: val }
                    setNotifPrefs(next)
                    saveNotifPrefs(next)
                    const examObj = CUTOFF_EXAMS.find(e => e.id === savedPlan?.exam_id)
                    const examLabel = examObj?.name || 'Your Exam'
                    const examDate = savedPlan?.exam_date || null
                    if (next.enabled) {
                      scheduleAll(next, examDate, examLabel).catch(() => {})
                    } else {
                      cancelAllNotifs().catch(() => {})
                    }
                  }
                  const Toggle = ({ on, onToggle }) => (
                    <div onClick={onToggle} style={{width:42,height:24,borderRadius:12,background:on?'#F06535':'#d1d5db',position:'relative',cursor:'pointer',flexShrink:0,transition:'background .2s',touchAction:'manipulation'}}>
                      <div style={{position:'absolute',top:3,left:on?21:3,width:18,height:18,borderRadius:9,background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,.3)',transition:'left .2s'}}/>
                    </div>
                  )
                  const Row = ({ label, sub, on, onToggle, children }) => (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',gap:12}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:600,color:_t}}>{label}</div>
                        {sub && <div style={{fontSize:12,color:_m,marginTop:2}}>{sub}</div>}
                        {children}
                      </div>
                      <Toggle on={on} onToggle={onToggle}/>
                    </div>
                  )
                  const hours = Array.from({length:24},(_,i)=>i)
                  const fmtHour = h => { const ampm=h<12?'AM':'PM'; const hh=h%12||12; return `${hh}:00 ${ampm}` }
                  return (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:11,fontWeight:700,color:_m,letterSpacing:.6,textTransform:'uppercase',marginBottom:8,paddingLeft:4}}>App Notifications</div>
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden'}}>
                        {/* Master switch */}
                        <Row label="Push Notifications" sub="Enable all app notifications" on={p.enabled} onToggle={()=>updatePref('enabled',!p.enabled)}/>
                        {p.enabled && <>
                          <div style={{height:1,background:_b,margin:'0 18px'}}/>
                          {/* Daily study reminder */}
                          <Row label="Daily Study Reminder" sub={`Fires daily at ${fmtHour(p.studyReminderHour)}`} on={p.studyReminder} onToggle={()=>updatePref('studyReminder',!p.studyReminder)}>
                            {p.studyReminder && (
                              <div style={{marginTop:8,display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontSize:12,color:_m}}>Time:</span>
                                <select
                                  value={p.studyReminderHour}
                                  onChange={e=>updatePref('studyReminderHour',Number(e.target.value))}
                                  style={{fontSize:13,fontWeight:600,color:_t,background:cd?'#1e293b':'#f3f4f6',border:`1px solid ${_b}`,borderRadius:8,padding:'4px 8px',cursor:'pointer'}}
                                >
                                  {hours.map(h=><option key={h} value={h}>{fmtHour(h)}</option>)}
                                </select>
                              </div>
                            )}
                          </Row>
                          <div style={{height:1,background:_b,margin:'0 18px'}}/>
                          {/* Streak reminder */}
                          <Row label="Streak Reminder" sub="Every evening at 8:00 PM if not practiced" on={p.streakReminder} onToggle={()=>updatePref('streakReminder',!p.streakReminder)}/>
                          <div style={{height:1,background:_b,margin:'0 18px'}}/>
                          {/* Exam countdown */}
                          <Row label="Exam Countdown" sub="Alerts 7, 5, 3 and 1 day before your exam" on={p.examCountdown} onToggle={()=>updatePref('examCountdown',!p.examCountdown)}/>
                          <div style={{height:1,background:_b,margin:'0 18px'}}/>
                          {/* Idle nudge */}
                          <Row label="Comeback Reminder" sub="Nudge after 3 days away from the app" on={p.idleNudge} onToggle={()=>updatePref('idleNudge',!p.idleNudge)}/>
                        </>}
                      </div>
                    </div>
                  )
                })()}

                <button onClick={onLogout} style={{width:'100%',padding:'13px 0',background:cd?'rgba(239,68,68,.12)':'#fef2f2',border:`1px solid ${cd?'rgba(239,68,68,.3)':'#fecaca'}`,borderRadius:14,color:'#ef4444',fontSize:14,fontWeight:700,cursor:'pointer',touchAction:'manipulation'}}>
                  ↪ Log Out of MockTest
                </button>
              </div>
            )}

            {/* ── HELP & SUPPORT tab ── */}
            {activeTab === 'help' && (
              <Suspense fallback={null}>
                <DashHelpTab cd={cd} isNative={isNative} />
              </Suspense>
            )}

            {/* ── PROFILE tab ── */}
            {activeTab === 'profile' && (() => {
              // Streak: consecutive days with ≥1 test (counts today OR yesterday as starting point)
              const testStreak = (() => {
                if (!history.length) return 0
                const dates = new Set(history.map(r => r.created_at?.split?.('T')[0]).filter(Boolean))
                const d = new Date()
                if (!dates.has(d.toISOString().split('T')[0])) d.setDate(d.getDate() - 1)
                let s = 0
                while (s < 365 && dates.has(d.toISOString().split('T')[0])) { s++; d.setDate(d.getDate() - 1) }
                return s
              })()
              const rankLabel = !avg ? '—' : parseFloat(avg)>=85?'Top 5%':parseFloat(avg)>=75?'Top 12%':parseFloat(avg)>=60?'Top 25%':'Top 40%'
              const displayName = profileName || userName || user?.email?.split('@')[0] || 'User'

              const ChevronRight = () => <svg width="14" height="14" fill="none" stroke={_m} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>

              // Edit-profile sub-view
              if (profileEdit) return (
                <div style={{margin:'-14px'}}>
                  <div style={{background:_s,borderBottom:`1px solid ${_b}`,padding:'14px 16px',display:'flex',alignItems:'center',gap:10}}>
                    <button onClick={()=>{setProfileEdit(false);setProfileErr({})}} style={{width:34,height:34,borderRadius:10,background:cd?'rgba(255,255,255,.08)':'#f3f4f6',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,touchAction:'manipulation'}}>
                      <svg width="16" height="16" fill="none" stroke={_t} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span style={{fontSize:15,fontWeight:800,color:_t}}>Edit Profile</span>
                  </div>
                  <div style={{padding:'16px 14px 24px'}}>
                    {/* Avatar in edit mode */}
                    <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
                      <div style={{width:72,height:72,borderRadius:'50%',overflow:'hidden',position:'relative',background:`${_a}18`}}>
                        {avatarUrl ? <img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:900,color:_a}}>{displayName[0].toUpperCase()}</div>}
                        <label style={{position:'absolute',inset:0,cursor:'pointer',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:6,background:'linear-gradient(transparent 40%,rgba(0,0,0,.4))'}}>
                          <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarUpload}/>
                        </label>
                      </div>
                    </div>
                    {/* Edit Profile fields — every field is a boxed input (pf-* in index.css):
                        name (required), phone (+91 + 10 digits), DOB (day/month/year), gender, category. */}
                    {(() => {
                      const dobMax = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 10); return d.toISOString().slice(0, 10) })()   // age 10+
                      const box = (err) => ({ borderColor: err ? '#ef4444' : _b, backgroundColor: cd ? 'rgba(255,255,255,.04)' : '#fff', color: _t })   // backgroundColor (not background) keeps the select arrow image
                      const Lbl = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="pf-label" style={{ color: _m }}>{children}</label>
                      const Err = ({ msg }) => msg ? <div className="pf-err" role="alert">{msg}</div> : null
                      return (
                        <div className="pf-card" style={{ background: _s, borderColor: _b }}>
                          <div className="pf-row">
                            <Lbl htmlFor="pf-name">Full name</Lbl>
                            <input id="pf-name" className="pf-input" style={box(profileErr.name)} value={profileName} autoComplete="name"
                              onChange={e => { setProfileName(e.target.value); setProfileErr(x => ({ ...x, name: undefined })) }} placeholder="Your full name"/>
                            <Err msg={profileErr.name}/>
                          </div>
                          <div className="pf-row">
                            <Lbl htmlFor="pf-phone">Phone number</Lbl>
                            <div className="pf-phone" style={box(profileErr.phone)}>
                              <span className="pf-prefix" style={{ color: _m, borderColor: _b }}>+91</span>
                              <input id="pf-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10}
                                value={phoneDigits(profilePhone)} placeholder="10-digit mobile number" style={{ color: _t }}
                                onChange={e => { setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setProfileErr(x => ({ ...x, phone: undefined })) }}/>
                            </div>
                            <Err msg={profileErr.phone}/>
                          </div>
                          <div className="pf-row">
                            <Lbl>Date of birth</Lbl>
                            {/* one field: type the date or pick it from the calendar (month + year dropdowns for quick jumps) */}
                            <DateField label="date of birth" yearPicker min="1950-01-01" max={dobMax} value={profileDob}
                              className="pf-input" onChange={v => { setProfileDob(v); setProfileErr(x => ({ ...x, dob: undefined })) }}/>
                            <Err msg={profileErr.dob}/>
                          </div>
                          <div className="pf-grid2">
                            <div className="pf-row">
                              <Lbl htmlFor="pf-gender">Gender</Lbl>
                              <select id="pf-gender" className="pf-input pf-select" style={box()} value={profileGender} onChange={e => setProfileGender(e.target.value)}>
                                <option value="">Select gender</option>
                                {['Male','Female','Non-binary','Prefer not to say'].map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                              </select>
                            </div>
                            <div className="pf-row">
                              <Lbl htmlFor="pf-cat">Category</Lbl>
                              <select id="pf-cat" className="pf-input pf-select" style={box()} value={profileCategory} onChange={e => setProfileCategory(e.target.value)}>
                                {['UR','OBC','SC','ST','EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    <div className="pf-actions" style={{display:'flex',alignItems:'center',gap:12}}>
                      <button onClick={handleSaveProfile} disabled={profileSaving}
                        style={{background:_a,color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:800,fontSize:13.5,cursor:profileSaving?'default':'pointer',opacity:profileSaving?.6:1}}>
                        {profileSaving ? 'Saving…' : 'Save Changes'}
                      </button>
                      {profileMsg && <span style={{fontSize:12.5,fontWeight:700,color:'#16a34a'}}>{profileMsg}</span>}
                    </div>
                  </div>
                </div>
              )

              // Privacy & Security sub-view
              if (privacyView) {
                const provider = user?.app_metadata?.provider || user?.identities?.[0]?.provider || 'email'
                const isEmailUser = provider === 'email'
                return (
                  <div style={{margin:'-14px'}}>
                    {/* Header */}
                    <div style={{background:_s,borderBottom:`1px solid ${_b}`,padding:'14px 16px',display:'flex',alignItems:'center',gap:10}}>
                      <button onClick={()=>{setPrivacyView(false);setNewPwd('');setConfirmPwd('');setPwdMsg('');setShowNewPwd(false);setShowConfPwd(false);setDeleteModal(false)}}
                        style={{width:34,height:34,borderRadius:10,background:cd?'rgba(255,255,255,.08)':'#f3f4f6',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,touchAction:'manipulation'}}>
                        <svg width="16" height="16" fill="none" stroke={_t} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <span style={{fontSize:15,fontWeight:800,color:_t}}>Privacy & Security</span>
                    </div>

                    <div style={{padding:'16px 14px 36px',background:cd?'#000':'#f2f2f7',minHeight:'calc(100vh - 62px)'}}>

                      {/* ── Account Security ── */}
                      <div style={{fontSize:11,fontWeight:700,color:_m,letterSpacing:'.07em',marginBottom:8,paddingLeft:4}}>ACCOUNT SECURITY</div>
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden',marginBottom:20}}>

                        {/* Signed-in method row */}
                        <div style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:`1px solid ${_b}`}}>
                          <div style={{width:36,height:36,borderRadius:10,background:isEmailUser?'#007AFF':'#EA4335',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {isEmailUser
                              ? <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.8 10.2H21V10h-9v4h6.3C17.4 16.5 15 18 12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.9.6 4 1.5l2.8-2.8C17 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.5 0 10-4.5 10-10 0-.7-.1-1.3-.2-1.8z" fill="#fff"/></svg>
                            }
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13.5,fontWeight:600,color:_t}}>{isEmailUser ? 'Email & Password' : 'Google Account'}</div>
                            <div style={{fontSize:11.5,color:_m,marginTop:1}}>{user?.email}</div>
                          </div>
                          <span style={{fontSize:10.5,fontWeight:700,padding:'3px 9px',borderRadius:99,background:'#dcfce7',color:'#16a34a'}}>Active</span>
                        </div>

                        {/* Change Password (email users only) */}
                        {isEmailUser && (
                          <div style={{padding:'14px 16px'}}>
                            <div style={{fontSize:12,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:12}}>Change Password</div>
                            {[
                              {label:'New Password',     val:newPwd,     set:setNewPwd,     show:showNewPwd,   toggle:()=>setShowNewPwd(p=>!p)},
                              {label:'Confirm Password', val:confirmPwd, set:setConfirmPwd, show:showConfPwd,  toggle:()=>setShowConfPwd(p=>!p)},
                            ].map(f=>(
                              <div key={f.label} style={{marginBottom:10,position:'relative'}}>
                                <label style={{display:'block',fontSize:10.5,fontWeight:700,color:_m,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:5}}>{f.label}</label>
                                <div style={{display:'flex',alignItems:'center',background:cd?'rgba(255,255,255,.06)':'#f9fafb',border:`1.5px solid ${_b}`,borderRadius:10,overflow:'hidden'}}>
                                  <input
                                    type={f.show ? 'text' : 'password'}
                                    value={f.val}
                                    onChange={e=>f.set(e.target.value)}
                                    placeholder="••••••••"
                                    style={{flex:1,padding:'11px 12px',background:'none',border:'none',outline:'none',fontSize:13.5,color:_t,fontFamily:'inherit'}}
                                  />
                                  <button onClick={f.toggle} type="button" style={{padding:'0 12px',background:'none',border:'none',cursor:'pointer',color:_m,display:'flex',alignItems:'center',touchAction:'manipulation'}}>
                                    {f.show
                                      ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                      : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    }
                                  </button>
                                </div>
                              </div>
                            ))}
                            {pwdMsg && (
                              <div style={{fontSize:12.5,fontWeight:600,color:pwdMsg.startsWith('✓')?'#16a34a':'#dc2626',marginBottom:10}}>{pwdMsg}</div>
                            )}
                            <button onClick={handleChangePassword} disabled={pwdSaving||!newPwd||!confirmPwd}
                              style={{padding:'11px 22px',background:pwdSaving||!newPwd||!confirmPwd?_b:'#F06535',color:pwdSaving||!newPwd||!confirmPwd?_m:'#fff',border:'none',borderRadius:10,fontWeight:800,fontSize:13,cursor:pwdSaving||!newPwd||!confirmPwd?'default':'pointer',touchAction:'manipulation',transition:'background .15s'}}>
                              {pwdSaving ? 'Updating…' : 'Update Password'}
                            </button>
                          </div>
                        )}

                        {/* OAuth users can't change password */}
                        {!isEmailUser && (
                          <div style={{padding:'13px 16px',display:'flex',alignItems:'center',gap:8}}>
                            <svg width="14" height="14" fill="none" stroke={_m} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span style={{fontSize:12.5,color:_m}}>Password is managed by Google. Change it at myaccount.google.com.</span>
                          </div>
                        )}
                      </div>

                      {/* ── Sessions ── */}
                      <div style={{fontSize:11,fontWeight:700,color:_m,letterSpacing:'.07em',marginBottom:8,paddingLeft:4}}>SESSIONS</div>
                      <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden',marginBottom:20}}>
                        <button onClick={handleSignOutAllDevices}
                          style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',border:'none',background:'none',cursor:'pointer',textAlign:'left',touchAction:'manipulation'}}>
                          <div style={{width:36,height:36,borderRadius:10,background:'#FF9500',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13.5,fontWeight:600,color:_t}}>Sign Out All Devices</div>
                            <div style={{fontSize:11.5,color:_m,marginTop:1}}>Revoke access on all other browsers &amp; devices</div>
                          </div>
                          <svg width="14" height="14" fill="none" stroke={_m} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                        {signOutAllMsg && <div style={{padding:'0 16px 12px',fontSize:12,color:'#dc2626'}}>{signOutAllMsg}</div>}
                      </div>

                      {/* ── Danger Zone ── */}
                      <div style={{fontSize:11,fontWeight:700,color:'#dc2626',letterSpacing:'.07em',marginBottom:8,paddingLeft:4}}>DANGER ZONE</div>
                      <div style={{background:_s,border:`1px solid ${cd?'rgba(220,38,38,.25)':'#fee2e2'}`,borderRadius:16,overflow:'hidden',marginBottom:20}}>
                        <button onClick={()=>setDeleteModal(true)}
                          style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',border:'none',background:'none',cursor:'pointer',textAlign:'left',touchAction:'manipulation'}}>
                          <div style={{width:36,height:36,borderRadius:10,background:'#FF3B30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13.5,fontWeight:600,color:'#dc2626'}}>Delete Account</div>
                            <div style={{fontSize:11.5,color:_m,marginTop:1}}>Permanently remove your account and all data</div>
                          </div>
                          <svg width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                      </div>

                      {/* Delete Account confirmation modal */}
                      {deleteModal && (
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:500,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 12px 24px'}}>
                          <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:440,boxShadow:'0 -4px 40px rgba(0,0,0,.2)'}}>
                            <div style={{width:48,height:48,borderRadius:14,background:'#FF3B30',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            </div>
                            <div style={{textAlign:'center',marginBottom:16}}>
                              <div style={{fontSize:17,fontWeight:800,color:_t,marginBottom:6}}>Delete Account?</div>
                              <div style={{fontSize:13,color:_m,lineHeight:1.5}}>This will permanently delete your account, all test results, and study progress. This action cannot be undone.</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:10}}>
                              <button onClick={handleDeleteAccount} disabled={deleting}
                                style={{padding:'13px',background:'#FF3B30',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:14,cursor:deleting?'default':'pointer',opacity:deleting?.6:1,touchAction:'manipulation'}}>
                                {deleting ? 'Deleting…' : 'Yes, Delete My Account'}
                              </button>
                              <button onClick={()=>setDeleteModal(false)}
                                style={{padding:'13px',background:cd?'rgba(255,255,255,.08)':'#f3f4f6',color:_t,border:'none',borderRadius:12,fontWeight:700,fontSize:14,cursor:'pointer',touchAction:'manipulation'}}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Main profile menu view (iOS Settings style)
              return (
                <div style={{margin:'-14px'}}>
                  {/* ── Hero ── */}
                  <div style={{background:'linear-gradient(160deg,#F06535 0%,#E85A28 52%,#DC5020 100%)',margin:'12px 14px 0',borderRadius:20,padding:'14px 18px 12px',position:'relative',overflow:'hidden',boxShadow:'0 4px 24px rgba(240,101,53,0.32)'}}>
                    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 78% 18%,rgba(255,255,255,.18) 0%,transparent 55%)',pointerEvents:'none'}}/>
                    {/* Avatar left + info right */}
                    <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:14,marginBottom:12}}>
                      <div style={{width:58,height:58,borderRadius:'50%',overflow:'hidden',border:'2.5px solid rgba(255,255,255,.5)',position:'relative',background:'rgba(255,255,255,.2)',flexShrink:0}}>
                        {(avatarUrl && avatarUrl.includes('supabase'))
                          ? <img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="profile"/>
                          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:'#fff'}}>{displayName[0].toUpperCase()}</div>
                        }
                        <label style={{position:'absolute',inset:0,cursor:'pointer',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:4,background:'linear-gradient(transparent 45%,rgba(0,0,0,.3))',touchAction:'manipulation'}}>
                          <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarUpload}/>
                        </label>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:'-.01em',lineHeight:1.2}}>{displayName}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,.8)',marginTop:2,letterSpacing:'.01em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
                        <div style={{marginTop:6,display:'inline-block',padding:'3px 10px',background:'rgba(255,255,255,.22)',borderRadius:99,fontSize:10.5,fontWeight:800,color:'#fff',border:'1px solid rgba(255,255,255,.35)',letterSpacing:'.02em'}}>
                          {isPro ? plan.charAt(0).toUpperCase()+plan.slice(1)+' Plan' : trialActive ? `Free Trial · ${trialDaysLeft}d left` : 'Trial Ended — Upgrade'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Sections ── */}
                  <div style={{padding:'16px 14px 28px',background:cd?'#000':'#f2f2f7',minHeight:'100%'}}>

                    {/* Your Progress card */}
                    <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden',marginBottom:20,display:'flex'}}>
                      {[
                        {value:String(history.length||0), label:'Tests',  col:'#F06535'},
                        {value:avg?`${avg}%`:'—',          label:'Avg',    col:'#16a34a'},
                        {value:testStreak>0?`${testStreak}🔥`:'0', label:'Streak', col:'#d97706'},
                        {value:rankLabel,                   label:'Rank',   col:'#8b5cf6'},
                      ].map((s,i,arr)=>(
                        <div key={s.label} style={{flex:1,textAlign:'center',padding:'14px 4px',borderRight:i<arr.length-1?`1px solid ${_b}`:'none'}}>
                          <div style={{fontSize:17,fontWeight:900,color:s.col,lineHeight:1,letterSpacing:'-.01em'}}>{s.value}</div>
                          <div style={{fontSize:9.5,color:_m,fontWeight:700,marginTop:4,textTransform:'uppercase',letterSpacing:'.07em'}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {[
                      { label:'ACCOUNT', items:[
                        { id:'editprofile',   label:'Edit Profile',      col:'#FF453A', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
                        { id:'notifications', label:'Notifications',     col:'#007AFF', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
                        { id:'privacy',       label:'Privacy & Security', col:'#34C759', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                      ]},
                      { label:'STUDY', items:[
                        { id:'categories', label:'Exam Categories', col:'#F06535', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
                        { id:'explore',    label:'Target Exams', col:'#5856D6', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
                        { id:'studyplan',  label:'Study Goals',  col:'#FF9500', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> },
                        { id:'weakareas',  label:'Weak Areas',   col:'#FF3B30', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                      ]},
                      { label:'APP', items:[
                        { id:'subscriptions',label:'Subscriptions', col:'#f59e0b', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
                        { id:'billing',      label:'Billing',       col:'#10b981', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                        { id:'settings',     label:'Settings',      col:'#636366', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                        { id:'help',         label:'Help & Support', col:'#5856D6', icon:<svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                      ]},
                    ].map(section => (
                      <div key={section.label}>
                        <div style={{fontSize:11,fontWeight:700,color:_m,letterSpacing:'.07em',marginBottom:8,paddingLeft:4}}>{section.label}</div>
                        <div style={{background:_s,border:`1px solid ${_b}`,borderRadius:16,overflow:'hidden',marginBottom:20}}>
                          {section.items.map((item,i,arr)=>(
                            <button key={item.id}
                              onClick={()=> item.id==='editprofile' ? setProfileEdit(true) : item.id==='privacy' ? setPrivacyView(true) : item.id==='notifications' ? setActiveTab('settings') : item.id==='categories' ? onNav?.('category-select') : setActiveTab(item.id)}
                              style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'13px 16px',border:'none',background:'none',cursor:'pointer',textAlign:'left',borderBottom:i<arr.length-1?`1px solid ${_b}`:'none',touchAction:'manipulation'}}>
                              <div style={{width:36,height:36,borderRadius:10,background:item.col,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 2px 8px ${item.col}55`}}>
                                {item.icon}
                              </div>
                              <span style={{flex:1,fontSize:14,fontWeight:600,color:_t}}>{item.label}</span>
                              <ChevronRight/>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Sign Out */}
                    <button onClick={onLogout}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'13px 16px',background:cd?'rgba(255,59,48,.08)':'#fff5f5',border:`1px solid ${cd?'rgba(255,59,48,.2)':'#fecaca'}`,borderRadius:16,cursor:'pointer',touchAction:'manipulation'}}>
                      <div style={{width:36,height:36,borderRadius:10,background:'#FF3B30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 8px rgba(255,59,48,.4)'}}>
                        <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      </div>
                      <span style={{flex:1,fontSize:14,fontWeight:700,color:'#FF3B30',textAlign:'left'}}>Sign Out</span>
                      <svg width="14" height="14" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              )
            })()}

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
              <Suspense fallback={null}>
                <DashSubscriptionsTab cd={cd} _t={_t} _m={_m} _s={_s} _b={_b} _a={_a}
                  isPro={isPro} plan={plan} trialActive={trialActive} trialDaysLeft={trialDaysLeft} onNav={onNav} />
              </Suspense>
            )}

            {/* ── BILLING tab ── */}
            {activeTab === 'billing' && (
              <Suspense fallback={null}>
                <DashBillingTab cd={cd} _t={_t} _m={_m} _s={_s} _b={_b} _a={_a}
                  isPro={isPro} plan={plan} trialActive={trialActive} trialDaysLeft={trialDaysLeft} setActiveTab={setActiveTab} />
              </Suspense>
            )}

          </div>
        </main>
      </div>

      {/* ══ SLIDE-IN PANEL ══ */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setPanelOpen(false)}/>

          {/* ── WEB panel: full nav ──
              UI: now a LEFT drawer (260px, slides in) for screens below 900px. Scrim click, a menu item
              or the Esc key closes it; page scroll is locked while open (see sidebar state effect). */}
          {!isNative && (
            <div className="db-drawer fixed left-0 top-0 h-full z-50 flex flex-col overflow-y-auto shadow-2xl" style={{ background:'#fff' }}
              role="dialog" aria-modal="true" aria-label="Main navigation">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid #e5e7eb' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width:28, height:28, background:'#F06535', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#fff', fontWeight:900, fontSize:10 }}>MT</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{color:'#111827'}}>MockTest</div>
                    <div style={{fontSize:8.5,fontWeight:700,color:'#F06535',letterSpacing:'.10em',textTransform:'uppercase',fontStyle:'italic',marginTop:3,lineHeight:1}}>Your World of Mock Tests</div>
                  </div>
                </div>
                <button onClick={()=>setPanelOpen(false)} aria-label="Close menu" className="text-2xl w-8 h-8 flex items-center justify-center" style={{color:'#6b7280'}}>×</button>
              </div>
              <nav className="flex-1 py-3" aria-label="Main navigation">
                {SIDEBAR_NAV.map(item => (
                  <button key={item.id}
                    onClick={()=>{ setPanelOpen(false); setActiveTab(item.id) }}
                    className="w-full flex items-center gap-3 px-5 py-3 transition-colors"
                    style={ activeTab===item.id
                      ? { background:'rgba(232,90,44,.08)', color:'#F06535', fontWeight:700, borderLeft:'3px solid #F06535' }
                      : { color:'#374151', borderLeft:'3px solid transparent' } }
                    onMouseOver={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='#f9fafb' }}
                    onMouseOut={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='transparent' }}>
                    <span className="flex-shrink-0" style={{color: activeTab===item.id ? '#F06535' : '#9ca3af'}}><item.Icon /></span>
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
              style={{background:'#111',paddingTop:'env(safe-area-inset-top,0px)'}}>
              {/* Header */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,background:'#F06535',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{color:'#fff',fontWeight:900,fontSize:12}}>MT</span>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:'#fff'}}>MockTest</div>
                    <div style={{fontSize:8,fontWeight:700,color:'#F06535',letterSpacing:'.12em',textTransform:'uppercase'}}>More</div>
                  </div>
                </div>
                <button onClick={()=>setPanelOpen(false)}
                  style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,border:'none',cursor:'pointer',
                    background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.7)',fontSize:18,touchAction:'manipulation'}}>×</button>
              </div>
              {/* User card */}
              <div style={{margin:'14px 16px',padding:'14px 16px',borderRadius:14,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#F06535,#ff9a7a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#fff',flexShrink:0}}>
                  {(userName||'U')[0].toUpperCase()}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:800,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userName}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
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
                        background: isAct ? 'rgba(232,90,44,.1)' : 'transparent',
                        borderLeft: isAct ? '3px solid #F06535' : '3px solid transparent'}}>
                      <span style={{color:isAct?'#F06535':'rgba(255,255,255,.4)',flexShrink:0}}><item.Icon /></span>
                      <span style={{fontSize:13,fontWeight:600,color:isAct?'#F06535':'rgba(255,255,255,.75)'}}>{item.label}</span>
                    </button>
                  )
                })}
                <div style={{margin:'10px 18px',borderTop:'1px solid rgba(255,255,255,.07)'}}/>
                {adminUser && (
                  <button onClick={()=>{setPanelOpen(false);onNav?.('admin')}}
                    style={{width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 18px',border:'none',cursor:'pointer',background:'transparent'}}>
                    <DIcGear s={15} c='rgba(255,255,255,.4)'/><span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.5)'}}>Admin Panel</span>
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
          .db-bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:none;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 2px;position:relative;min-width:0;touch-action:manipulation}
          .db-bnav-pill{position:absolute;top:6px;width:32px;height:3px;border-radius:99px;background:#F06535}
          .db-bnav-lbl{font-size:9px;font-weight:700;line-height:1;letter-spacing:.02em}
        `}</style>
        <nav className="db-bnav" style={{background:'#111',borderTop:'1px solid rgba(255,255,255,.08)'}}>
          <div className="db-bnav-inner">
            {[
              { id:'home',        label:'Home',
                icon:<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"/> },
              { id:'explore',     label:'Explore',
                icon:<path d="M21 21l-4.35-4.35 M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z"/> },
              { id:'performance', label:'Progress',
                icon:<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/> },
              { id:'studyplan',   label:'Planner',
                icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></> },
              { id:'profile',     label:'Profile',
                icon:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
            ].map(({id, label, icon}) => {
              const isAct = activeTab === id
              const col = isAct ? '#F06535' : 'rgba(255,255,255,.4)'
              return (
                <button key={id} className="db-bnav-btn" onClick={() => setActiveTab(id)}>
                  {isAct && <span className="db-bnav-pill"/>}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{transition:'stroke .15s',flexShrink:0}}>
                    {icon}
                  </svg>
                  <span className="db-bnav-lbl" style={{color:col,transition:'color .15s'}}>{label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </>)}

      {/* ══ NOTIFICATION PANEL ══ */}
      {showNotifPanel && (() => {
        const unread = notifInbox.filter(n=>!n.read).length
        const markAllRead = () => {
          const updated = notifInbox.map(n=>({...n,read:true}))
          try{localStorage.setItem('mt_inbox_v2',JSON.stringify(updated))}catch{}
          setNotifInbox(updated)
        }
        const handleItemTap = (item) => {
          const updated = notifInbox.map(n=>n.id===item.id?{...n,read:true}:n)
          try{localStorage.setItem('mt_inbox_v2',JSON.stringify(updated))}catch{}
          setNotifInbox(updated)
          if(item.action){ setShowNotifPanel(false); setActiveTab(item.action) }
        }
        const fmtTs = (ts) => {
          const diff = Date.now()-ts
          if(diff<60000) return 'just now'
          if(diff<3600000) return `${Math.floor(diff/60000)}m ago`
          if(diff<86400000) return `${Math.floor(diff/3600000)}h ago`
          return new Date(ts).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
        }
        const typeColors = {subscription:'#F06535',result:'#007AFF',system:'#34C759',reminder:'#FF9500'}
        return (
          <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',flexDirection:'column'}}>
            <div onClick={()=>setShowNotifPanel(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.55)'}}/>
            <div style={{position:'relative',marginTop:'auto',background:cd?'#1c1c1e':'#f2f2f7',borderRadius:'20px 20px 0 0',maxHeight:'80vh',display:'flex',flexDirection:'column',paddingBottom:'max(env(safe-area-inset-bottom,0px),16px)'}}>
              <div style={{width:36,height:4,background:'rgba(128,128,128,.4)',borderRadius:2,margin:'10px auto 0'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px 10px',borderBottom:`1px solid ${cd?'rgba(255,255,255,.08)':'#e5e5ea'}`}}>
                <div>
                  <div style={{fontSize:17,fontWeight:800,color:cd?'#f1f5f9':'#111'}}>Notifications</div>
                  {unread>0 && <div style={{fontSize:12,color:cd?'#94a3b8':'#8e8e93',marginTop:1}}>{unread} unread</div>}
                </div>
                {unread>0 && <button onClick={markAllRead} style={{border:'none',background:'none',color:'#F06535',fontSize:13,fontWeight:700,cursor:'pointer',padding:'4px 8px',touchAction:'manipulation'}}>Mark all read</button>}
              </div>
              <div style={{overflowY:'auto',flex:1}}>
                {notifInbox.length===0 ? (
                  <div style={{padding:'48px 24px',textAlign:'center'}}>
                    <div style={{fontSize:40,marginBottom:12}}>🔔</div>
                    <div style={{fontSize:16,fontWeight:700,color:cd?'#f1f5f9':'#111',marginBottom:6}}>No notifications yet</div>
                    <div style={{fontSize:13,color:cd?'#94a3b8':'#8e8e93'}}>Exam reminders and updates will appear here.</div>
                  </div>
                ) : (
                  notifInbox.map(item=>(
                    <button key={item.id} onClick={()=>handleItemTap(item)}
                      style={{width:'100%',display:'flex',alignItems:'flex-start',gap:12,padding:'14px 20px',border:'none',background:item.read?'none':(cd?'rgba(255,255,255,.04)':'rgba(0,0,0,.03)'),cursor:'pointer',textAlign:'left',touchAction:'manipulation',borderBottom:`1px solid ${cd?'rgba(255,255,255,.05)':'#e5e5ea'}`}}>
                      <div style={{width:40,height:40,borderRadius:12,background:typeColors[item.type]||'#8e8e93',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{item.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                          <div style={{fontSize:14,fontWeight:item.read?600:800,color:cd?'#f1f5f9':'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                          <div style={{fontSize:11,color:cd?'#64748b':'#8e8e93',flexShrink:0,whiteSpace:'nowrap'}}>{fmtTs(item.ts)}</div>
                        </div>
                        <div style={{fontSize:13,color:cd?'#94a3b8':'#6b7280',marginTop:2,lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.body}</div>
                        {item.action && <div style={{fontSize:12,color:'#F06535',fontWeight:700,marginTop:4}}>Tap to open →</div>}
                      </div>
                      {!item.read && <div style={{width:8,height:8,background:'#007AFF',borderRadius:'50%',flexShrink:0,marginTop:4}}/>}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
