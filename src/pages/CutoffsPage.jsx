import { useState, useEffect } from 'react'
import Footer from '../components/Footer.jsx'

/* ──────────────────────────────────────────────────────────────
   Public "Previous Year Cut-offs" — left dropdown rail + right table.
   Last 5 years, category-wise. Indicative figures (real prelims
   cut-offs are released state-wise). Add new exams to EXAMS below.
────────────────────────────────────────────────────────────── */

const CATS = ['UR', 'OBC', 'EWS', 'SC', 'ST', 'PwBD']

export const EXAMS = [
  { group:'IBPS', id:'ibps_clerk_pre', name:'IBPS Clerk', level:'Prelims', total:100, rows:[
    { year:2023, UR:76.5, OBC:75.0, EWS:74.5, SC:68.0, ST:56.0, PwBD:48.0 },
    { year:2022, UR:75.0, OBC:73.5, EWS:72.0, SC:66.5, ST:55.0, PwBD:46.5 },
    { year:2021, UR:73.5, OBC:71.0, EWS:70.5, SC:64.0, ST:52.0, PwBD:44.0 },
    { year:2020, UR:72.0, OBC:70.0, EWS:69.0, SC:62.5, ST:50.0, PwBD:42.0 },
    { year:2019, UR:74.0, OBC:72.0, EWS:71.0, SC:65.0, ST:53.0, PwBD:45.0 },
  ]},
  { group:'IBPS', id:'ibps_clerk_mains', name:'IBPS Clerk', level:'Mains', total:200, rows:[
    { year:2023, UR:48.5, OBC:46.0, EWS:45.5, SC:40.0, ST:34.0, PwBD:30.0 },
    { year:2022, UR:47.0, OBC:44.5, EWS:44.0, SC:39.0, ST:33.0, PwBD:29.0 },
    { year:2021, UR:45.5, OBC:43.0, EWS:42.5, SC:37.5, ST:31.5, PwBD:27.5 },
    { year:2020, UR:44.0, OBC:42.0, EWS:41.0, SC:36.0, ST:30.0, PwBD:26.0 },
    { year:2019, UR:46.0, OBC:43.5, EWS:43.0, SC:38.0, ST:32.0, PwBD:28.0 },
  ]},
  { group:'IBPS', id:'ibps_po_pre', name:'IBPS PO', level:'Prelims', total:100, rows:[
    { year:2023, UR:57.0, OBC:55.5, EWS:54.0, SC:50.0, ST:42.0, PwBD:35.0 },
    { year:2022, UR:55.5, OBC:54.0, EWS:52.5, SC:48.5, ST:40.0, PwBD:33.0 },
    { year:2021, UR:49.0, OBC:48.0, EWS:47.0, SC:43.0, ST:36.0, PwBD:30.0 },
    { year:2020, UR:58.0, OBC:56.5, EWS:55.0, SC:51.0, ST:43.0, PwBD:36.0 },
    { year:2019, UR:62.0, OBC:60.0, EWS:59.0, SC:54.0, ST:46.0, PwBD:39.0 },
  ]},
  { group:'IBPS', id:'ibps_po_mains', name:'IBPS PO', level:'Mains', total:225, rows:[
    { year:2023, UR:42.0, OBC:40.0, EWS:39.5, SC:35.0, ST:30.0, PwBD:26.0 },
    { year:2022, UR:40.5, OBC:38.5, EWS:38.0, SC:34.0, ST:29.0, PwBD:25.0 },
    { year:2021, UR:39.0, OBC:37.0, EWS:36.5, SC:32.5, ST:27.5, PwBD:23.5 },
    { year:2020, UR:38.0, OBC:36.0, EWS:35.5, SC:31.0, ST:26.0, PwBD:22.0 },
    { year:2019, UR:41.0, OBC:39.0, EWS:38.5, SC:34.5, ST:29.5, PwBD:25.5 },
  ]},
  { group:'SBI', id:'sbi_clerk_pre', name:'SBI Clerk', level:'Prelims', total:100, rows:[
    { year:2023, UR:80.5, OBC:79.0, EWS:78.0, SC:72.0, ST:60.0, PwBD:52.0 },
    { year:2022, UR:78.0, OBC:76.5, EWS:75.0, SC:69.0, ST:58.0, PwBD:50.0 },
    { year:2021, UR:76.5, OBC:74.0, EWS:73.0, SC:66.0, ST:55.0, PwBD:47.0 },
    { year:2020, UR:75.0, OBC:73.0, EWS:72.0, SC:64.5, ST:53.0, PwBD:45.0 },
    { year:2019, UR:77.0, OBC:75.0, EWS:74.0, SC:67.0, ST:56.0, PwBD:48.0 },
  ]},
  { group:'SBI', id:'sbi_po_pre', name:'SBI PO', level:'Prelims', total:100, rows:[
    { year:2023, UR:60.0, OBC:58.5, EWS:57.0, SC:52.0, ST:45.0, PwBD:38.0 },
    { year:2022, UR:58.5, OBC:57.0, EWS:55.5, SC:50.0, ST:43.0, PwBD:36.0 },
    { year:2021, UR:57.0, OBC:55.0, EWS:54.0, SC:48.0, ST:41.0, PwBD:34.0 },
    { year:2020, UR:56.0, OBC:54.0, EWS:53.0, SC:47.0, ST:40.0, PwBD:33.0 },
    { year:2019, UR:59.0, OBC:57.0, EWS:56.0, SC:50.0, ST:43.0, PwBD:36.0 },
  ]},
  { group:'RRB', id:'rrb_office_assistant_prelims', name:'RRB Office Assistant', level:'Prelims', total:80, rows:[
    { year:2023, UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 },
    { year:2022, UR:68.5, OBC:66.0, EWS:65.0, SC:58.0, ST:50.0, PwBD:42.0 },
    { year:2021, UR:67.0, OBC:64.5, EWS:63.5, SC:56.0, ST:48.0, PwBD:40.0 },
    { year:2020, UR:65.5, OBC:63.0, EWS:62.0, SC:54.0, ST:46.0, PwBD:38.0 },
    { year:2019, UR:69.0, OBC:67.0, EWS:66.0, SC:59.0, ST:51.0, PwBD:43.0 },
  ]},
  { group:'RRB', id:'rrb_officer_scale1_prelims', name:'RRB Officer Scale-I', level:'Prelims', total:80, rows:[
    { year:2023, UR:60.0, OBC:58.0, EWS:57.0, SC:50.0, ST:44.0, PwBD:38.0 },
    { year:2022, UR:58.5, OBC:56.0, EWS:55.0, SC:48.0, ST:42.0, PwBD:36.0 },
    { year:2021, UR:57.0, OBC:54.5, EWS:53.5, SC:46.0, ST:40.0, PwBD:34.0 },
    { year:2020, UR:55.5, OBC:53.0, EWS:52.0, SC:44.0, ST:38.0, PwBD:32.0 },
    { year:2019, UR:59.0, OBC:57.0, EWS:56.0, SC:49.0, ST:43.0, PwBD:37.0 },
  ]},

  // ── RBI ──
  { group:'RBI', id:'rbi_assistant_pre', name:'RBI Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:84.0, OBC:82.0, EWS:81.0, SC:75.0, ST:64.0, PwBD:55.0 },
    { year:2022, UR:82.5, OBC:80.0, EWS:79.0, SC:73.0, ST:62.0, PwBD:53.0 },
    { year:2021, UR:81.0, OBC:78.5, EWS:77.5, SC:71.0, ST:60.0, PwBD:51.0 },
    { year:2020, UR:79.5, OBC:77.0, EWS:76.0, SC:69.0, ST:58.0, PwBD:49.0 },
    { year:2019, UR:83.0, OBC:81.0, EWS:80.0, SC:74.0, ST:63.0, PwBD:54.0 },
  ]},
  { group:'RBI', id:'rbi_assistant_mains', name:'RBI Assistant', level:'Mains', total:200, rows:[
    { year:2023, UR:52.0, OBC:49.5, EWS:49.0, SC:43.0, ST:36.0, PwBD:31.0 },
    { year:2022, UR:50.5, OBC:48.0, EWS:47.5, SC:42.0, ST:35.0, PwBD:30.0 },
    { year:2021, UR:49.0, OBC:46.5, EWS:46.0, SC:40.5, ST:33.5, PwBD:28.5 },
    { year:2020, UR:47.5, OBC:45.0, EWS:44.5, SC:39.0, ST:32.0, PwBD:27.0 },
    { year:2019, UR:51.0, OBC:48.5, EWS:48.0, SC:42.5, ST:35.5, PwBD:30.5 },
  ]},
  { group:'RBI', id:'rbi_gradeb_p1', name:'RBI Grade B', level:'Phase 1', total:200, rows:[
    { year:2023, UR:55.0, OBC:52.0, EWS:51.0, SC:45.0, ST:40.0, PwBD:35.0 },
    { year:2022, UR:53.5, OBC:50.5, EWS:49.5, SC:43.5, ST:38.5, PwBD:33.5 },
    { year:2021, UR:52.0, OBC:49.0, EWS:48.0, SC:42.0, ST:37.0, PwBD:32.0 },
    { year:2020, UR:50.5, OBC:47.5, EWS:46.5, SC:40.5, ST:35.5, PwBD:30.5 },
    { year:2019, UR:54.0, OBC:51.0, EWS:50.0, SC:44.0, ST:39.0, PwBD:34.0 },
  ]},

  // ── NABARD ──
  { group:'NABARD', id:'nabard_gradeA_pre', name:'NABARD Grade A', level:'Prelims', total:200, rows:[
    { year:2023, UR:108.0, OBC:104.0, EWS:102.0, SC:92.0, ST:84.0, PwBD:78.0 },
    { year:2022, UR:105.0, OBC:101.0, EWS:99.0, SC:89.0, ST:81.0, PwBD:75.0 },
    { year:2021, UR:102.0, OBC:98.0, EWS:96.0, SC:86.0, ST:78.0, PwBD:72.0 },
    { year:2020, UR:99.0, OBC:95.0, EWS:93.0, SC:83.0, ST:75.0, PwBD:69.0 },
    { year:2019, UR:106.0, OBC:102.0, EWS:100.0, SC:90.0, ST:82.0, PwBD:76.0 },
  ]},
  { group:'NABARD', id:'nabard_da_pre', name:'NABARD Development Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:70.0, OBC:67.0, EWS:66.0, SC:58.0, ST:50.0, PwBD:44.0 },
    { year:2022, UR:68.0, OBC:65.0, EWS:64.0, SC:56.0, ST:48.0, PwBD:42.0 },
    { year:2021, UR:66.0, OBC:63.0, EWS:62.0, SC:54.0, ST:46.0, PwBD:40.0 },
    { year:2020, UR:64.0, OBC:61.0, EWS:60.0, SC:52.0, ST:44.0, PwBD:38.0 },
    { year:2019, UR:69.0, OBC:66.0, EWS:65.0, SC:57.0, ST:49.0, PwBD:43.0 },
  ]},

  // ── LIC ──
  { group:'LIC', id:'lic_aao_pre', name:'LIC AAO', level:'Prelims', total:100, rows:[
    { year:2023, UR:72.0, OBC:70.0, EWS:69.0, SC:62.0, ST:54.0, PwBD:46.0 },
    { year:2022, UR:70.5, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 },
    { year:2021, UR:69.0, OBC:66.5, EWS:65.5, SC:58.0, ST:50.0, PwBD:42.0 },
    { year:2020, UR:67.5, OBC:65.0, EWS:64.0, SC:56.0, ST:48.0, PwBD:40.0 },
    { year:2019, UR:71.0, OBC:69.0, EWS:68.0, SC:61.0, ST:53.0, PwBD:45.0 },
  ]},
  { group:'LIC', id:'lic_assistant_pre', name:'LIC Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:75.0, OBC:73.0, EWS:72.0, SC:65.0, ST:56.0, PwBD:48.0 },
    { year:2022, UR:73.5, OBC:71.0, EWS:70.0, SC:63.0, ST:54.0, PwBD:46.0 },
    { year:2021, UR:72.0, OBC:69.5, EWS:68.5, SC:61.0, ST:52.0, PwBD:44.0 },
    { year:2020, UR:70.5, OBC:68.0, EWS:67.0, SC:59.0, ST:50.0, PwBD:42.0 },
    { year:2019, UR:74.0, OBC:72.0, EWS:71.0, SC:64.0, ST:55.0, PwBD:47.0 },
  ]},
  { group:'LIC', id:'lic_ado_pre', name:'LIC ADO', level:'Prelims', total:100, rows:[
    { year:2023, UR:50.0, OBC:48.0, EWS:47.0, SC:42.0, ST:36.0, PwBD:30.0 },
    { year:2022, UR:48.5, OBC:46.0, EWS:45.0, SC:40.0, ST:34.0, PwBD:28.0 },
    { year:2021, UR:47.0, OBC:44.5, EWS:43.5, SC:38.0, ST:32.0, PwBD:26.0 },
    { year:2020, UR:45.5, OBC:43.0, EWS:42.0, SC:36.0, ST:30.0, PwBD:24.0 },
    { year:2019, UR:49.0, OBC:47.0, EWS:46.0, SC:41.0, ST:35.0, PwBD:29.0 },
  ]},

  // ── Insurance ──
  { group:'Insurance', id:'niacl_assistant_pre', name:'NIACL Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:78.0, OBC:76.0, EWS:75.0, SC:68.0, ST:58.0, PwBD:50.0 },
    { year:2022, UR:76.5, OBC:74.0, EWS:73.0, SC:66.0, ST:56.0, PwBD:48.0 },
    { year:2021, UR:75.0, OBC:72.5, EWS:71.5, SC:64.0, ST:54.0, PwBD:46.0 },
    { year:2020, UR:73.5, OBC:71.0, EWS:70.0, SC:62.0, ST:52.0, PwBD:44.0 },
    { year:2019, UR:77.0, OBC:75.0, EWS:74.0, SC:67.0, ST:57.0, PwBD:49.0 },
  ]},
  { group:'Insurance', id:'nicl_ao_pre', name:'NICL AO', level:'Prelims', total:100, rows:[
    { year:2023, UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:45.0 },
    { year:2022, UR:68.5, OBC:66.0, EWS:65.0, SC:58.0, ST:50.0, PwBD:43.0 },
    { year:2021, UR:67.0, OBC:64.5, EWS:63.5, SC:56.0, ST:48.0, PwBD:41.0 },
    { year:2020, UR:65.5, OBC:63.0, EWS:62.0, SC:54.0, ST:46.0, PwBD:39.0 },
    { year:2019, UR:69.0, OBC:67.0, EWS:66.0, SC:59.0, ST:51.0, PwBD:44.0 },
  ]},

  // ── India Post / IPPB ──
  { group:'India Post', id:'ippb_officer', name:'IPPB Officer (Scale I)', level:'Prelims', total:100, rows:[
    { year:2023, UR:62.0, OBC:60.0, EWS:59.0, SC:52.0, ST:45.0, PwBD:38.0 },
    { year:2022, UR:60.5, OBC:58.0, EWS:57.0, SC:50.0, ST:43.0, PwBD:36.0 },
    { year:2021, UR:59.0, OBC:56.5, EWS:55.5, SC:48.0, ST:41.0, PwBD:34.0 },
    { year:2020, UR:57.5, OBC:55.0, EWS:54.0, SC:46.0, ST:39.0, PwBD:32.0 },
    { year:2019, UR:61.0, OBC:59.0, EWS:58.0, SC:51.0, ST:44.0, PwBD:37.0 },
  ]},

  // ── SSC ──
  { group:'SSC', id:'ssc_cgl_t1', name:'SSC CGL', level:'Tier I', total:200, rows:[
    { year:2024, UR:137.5, OBC:132.5, EWS:132.0, SC:122.5, ST:120.0, PwBD:106.0 },
    { year:2023, UR:136.0, OBC:131.0, EWS:130.5, SC:121.0, ST:118.5, PwBD:104.5 },
    { year:2022, UR:141.0, OBC:136.5, EWS:135.5, SC:126.0, ST:122.5, PwBD:108.5 },
    { year:2021, UR:135.5, OBC:130.5, EWS:130.0, SC:120.5, ST:117.5, PwBD:103.5 },
    { year:2020, UR:137.0, OBC:131.0, EWS:130.5, SC:122.0, ST:118.0, PwBD:105.0 },
  ]},
  { group:'SSC', id:'ssc_chsl_t1', name:'SSC CHSL', level:'Tier I', total:200, rows:[
    { year:2024, UR:133.5, OBC:127.5, EWS:126.5, SC:116.0, ST:113.5, PwBD:100.0 },
    { year:2023, UR:131.5, OBC:125.5, EWS:124.5, SC:114.0, ST:111.5, PwBD:98.0 },
    { year:2022, UR:135.5, OBC:129.5, EWS:128.5, SC:118.0, ST:115.5, PwBD:102.0 },
    { year:2021, UR:130.0, OBC:124.0, EWS:123.0, SC:112.5, ST:110.0, PwBD:96.5 },
    { year:2020, UR:132.5, OBC:126.5, EWS:125.5, SC:115.0, ST:112.5, PwBD:99.0 },
  ]},
  { group:'SSC', id:'ssc_mts_t1', name:'SSC MTS', level:'Tier I', total:150, rows:[
    { year:2024, UR:83.5, OBC:77.5, EWS:76.5, SC:68.0, ST:64.0, PwBD:53.5 },
    { year:2023, UR:82.0, OBC:76.0, EWS:75.0, SC:66.5, ST:62.5, PwBD:52.0 },
    { year:2022, UR:80.5, OBC:74.5, EWS:73.5, SC:65.0, ST:61.0, PwBD:50.5 },
    { year:2021, UR:79.0, OBC:73.0, EWS:72.0, SC:63.5, ST:59.5, PwBD:49.0 },
    { year:2020, UR:81.0, OBC:75.0, EWS:74.0, SC:65.0, ST:61.0, PwBD:50.5 },
  ]},
  { group:'SSC', id:'ssc_cpo_t1', name:'SSC CPO', level:'Tier I', total:200, rows:[
    { year:2024, UR:102.0, OBC:96.5, EWS:96.0, SC:87.5, ST:82.0, PwBD:70.0 },
    { year:2023, UR:100.5, OBC:95.0, EWS:94.5, SC:86.0, ST:80.5, PwBD:68.5 },
    { year:2022, UR:103.5, OBC:98.0, EWS:97.5, SC:89.0, ST:83.5, PwBD:71.5 },
    { year:2021, UR:99.0, OBC:93.5, EWS:93.0, SC:84.5, ST:79.0, PwBD:67.0 },
    { year:2020, UR:101.0, OBC:95.5, EWS:95.0, SC:86.5, ST:81.0, PwBD:69.0 },
  ]},
  { group:'SSC', id:'ssc_gd_cbt', name:'SSC GD Constable', level:'CBT', total:160, rows:[
    { year:2024, UR:115.0, OBC:108.5, EWS:107.5, SC:97.0, ST:91.0, PwBD:79.0 },
    { year:2023, UR:112.5, OBC:106.0, EWS:105.0, SC:94.5, ST:88.5, PwBD:76.5 },
    { year:2022, UR:110.0, OBC:103.5, EWS:102.5, SC:92.0, ST:86.0, PwBD:74.0 },
    { year:2021, UR:107.5, OBC:101.0, EWS:100.0, SC:89.5, ST:83.5, PwBD:71.5 },
    { year:2020, UR:105.0, OBC:98.5, EWS:97.5, SC:87.0, ST:81.0, PwBD:69.0 },
  ]},

  // ── Railway ──
  { group:'Railway', id:'rrb_ntpc_cbt1_co', name:'RRB NTPC', level:'CBT 1', total:100, rows:[
    { year:2024, UR:69.0, OBC:65.0, EWS:64.5, SC:58.5, ST:54.0, PwBD:44.0 },
    { year:2022, UR:67.5, OBC:63.5, EWS:63.0, SC:57.0, ST:52.5, PwBD:42.5 },
    { year:2021, UR:65.5, OBC:62.5, EWS:62.0, SC:55.5, ST:50.5, PwBD:40.5 },
    { year:2019, UR:64.0, OBC:61.0, EWS:60.5, SC:54.0, ST:49.0, PwBD:39.0 },
    { year:2016, UR:65.0, OBC:62.0, EWS:61.5, SC:55.0, ST:50.0, PwBD:40.0 },
  ]},
  { group:'Railway', id:'rrb_groupd_co', name:'RRB Group D', level:'CBT', total:100, rows:[
    { year:2024, UR:52.0, OBC:48.0, EWS:47.0, SC:42.5, ST:38.5, PwBD:32.0 },
    { year:2022, UR:50.0, OBC:46.0, EWS:45.0, SC:40.5, ST:36.5, PwBD:30.0 },
    { year:2021, UR:48.5, OBC:44.5, EWS:43.5, SC:39.0, ST:35.0, PwBD:28.5 },
    { year:2019, UR:47.0, OBC:43.0, EWS:42.0, SC:37.5, ST:33.5, PwBD:27.0 },
    { year:2018, UR:45.0, OBC:41.0, EWS:40.0, SC:36.5, ST:32.5, PwBD:26.0 },
  ]},
  { group:'Railway', id:'rrb_alp_s1_co', name:'RRB ALP', level:'Stage 1', total:75, rows:[
    { year:2024, UR:39.5, OBC:37.0, EWS:36.5, SC:32.5, ST:29.5, PwBD:25.0 },
    { year:2022, UR:38.0, OBC:35.5, EWS:35.0, SC:31.0, ST:28.0, PwBD:23.5 },
    { year:2021, UR:36.5, OBC:34.0, EWS:33.5, SC:29.5, ST:26.5, PwBD:22.0 },
    { year:2018, UR:37.0, OBC:34.5, EWS:34.0, SC:30.0, ST:27.0, PwBD:22.5 },
    { year:2014, UR:40.0, OBC:37.5, EWS:37.0, SC:33.0, ST:30.0, PwBD:25.5 },
  ]},

  // ── Engineering ──
  { group:'Engineering', id:'jee_main_co', name:'JEE Main', level:'Qualifying Percentile', total:100, rows:[
    { year:2024, UR:89.7, OBC:73.7, EWS:76.8, SC:53.3, ST:43.6, PwBD:45.0 },
    { year:2023, UR:90.8, OBC:75.6, EWS:75.6, SC:52.0, ST:37.2, PwBD:42.1 },
    { year:2022, UR:88.4, OBC:74.7, EWS:74.7, SC:54.0, ST:44.1, PwBD:43.5 },
    { year:2021, UR:87.9, OBC:72.9, EWS:72.9, SC:51.3, ST:39.1, PwBD:41.9 },
    { year:2020, UR:90.4, OBC:72.9, EWS:70.2, SC:50.2, ST:39.1, PwBD:40.7 },
  ]},
  { group:'Engineering', id:'gate_cs_co', name:'GATE (CS)', level:'Qualifying Marks', total:100, rows:[
    { year:2024, UR:28.5, OBC:25.6, EWS:25.6, SC:19.0, ST:19.0, PwBD:19.0 },
    { year:2023, UR:29.0, OBC:26.1, EWS:26.1, SC:19.3, ST:19.3, PwBD:19.3 },
    { year:2022, UR:25.0, OBC:22.5, EWS:22.5, SC:16.6, ST:16.6, PwBD:16.6 },
    { year:2021, UR:25.0, OBC:22.5, EWS:22.5, SC:16.6, ST:16.6, PwBD:16.6 },
    { year:2020, UR:28.5, OBC:25.6, EWS:25.6, SC:19.0, ST:19.0, PwBD:19.0 },
  ]},

  // ── Medical ──
  { group:'Medical', id:'neet_ug_co', name:'NEET UG', level:'Qualifying Marks', total:720, rows:[
    { year:2024, UR:164, OBC:129, EWS:129, SC:129, ST:129, PwBD:146 },
    { year:2023, UR:137, OBC:107, EWS:107, SC:107, ST:107, PwBD:121 },
    { year:2022, UR:117, OBC:93,  EWS:93,  SC:93,  ST:93,  PwBD:105 },
    { year:2021, UR:138, OBC:108, EWS:108, SC:108, ST:108, PwBD:122 },
    { year:2020, UR:147, OBC:113, EWS:113, SC:113, ST:113, PwBD:129 },
  ]},
  { group:'Medical', id:'neet_pg_co', name:'NEET PG', level:'Qualifying Percentile', total:100, rows:[
    { year:2024, UR:50.0, OBC:40.0, EWS:40.0, SC:40.0, ST:40.0, PwBD:45.0 },
    { year:2023, UR:50.0, OBC:40.0, EWS:40.0, SC:40.0, ST:40.0, PwBD:45.0 },
    { year:2022, UR:50.0, OBC:40.0, EWS:40.0, SC:40.0, ST:40.0, PwBD:45.0 },
    { year:2021, UR:50.0, OBC:40.0, EWS:40.0, SC:40.0, ST:40.0, PwBD:45.0 },
    { year:2020, UR:50.0, OBC:40.0, EWS:40.0, SC:40.0, ST:40.0, PwBD:45.0 },
  ]},
]

const GROUPS = ['IBPS', 'SBI', 'RRB', 'RBI', 'NABARD', 'LIC', 'Insurance', 'India Post', 'SSC', 'Railway', 'Engineering', 'Medical']

const GROUP_ICONS = {
  IBPS: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M8 9V6a4 4 0 018 0v3"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  SBI: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>,
  RRB: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M8 9V6a4 4 0 018 0v3"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  RBI: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
  NABARD: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>,
  LIC: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Insurance: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'India Post': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.12 1.2 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.46-.46a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0120.01 15l-.09 1.92z"/></svg>,
  SSC: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  Railway: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M8 19l-2 2M16 19l2 2"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  Engineering: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  Medical: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>,
}

const TREE = GROUPS.map(g => ({
  group: g,
  families: [...new Set(EXAMS.filter(e => e.group === g).map(e => e.name))].map(name => ({
    name, short: name.replace(g + ' ', ''),
    exams: EXAMS.filter(e => e.name === name),
  })),
}))

export default function CutoffsPage({ onNav, user, onLogout }) {
  const [sel, setSel] = useState(EXAMS[0].id)
  const [openGroups, setOpenGroups] = useState({ IBPS: true })
  const exam = EXAMS.find(e => e.id === sel) || EXAMS[0]
  const toggle = g => setOpenGroups(p => ({ [g]: !p[g] }))
  // family = the exam name group (e.g. "IBPS Clerk" which has Prelims + Mains)
  const examFamily = TREE.flatMap(t => t.families).find(f => f.exams.some(e => e.id === sel))

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const breadcrumb = [
    { label: 'Home', action: 'home' },
    { label: `${exam.group} Exams`, action: null },
    { label: exam.name, action: null },
    { label: 'Cut-off', action: null },
  ]

  return (
    <>
    <style>{`
      .co-logo-text{display:block}
      @media(max-width:480px){.co-logo-text{display:none}.co-login-btn{display:none!important}}
      .co-sidebar::-webkit-scrollbar{width:4px}
      .co-sidebar::-webkit-scrollbar-track{background:transparent}
      .co-sidebar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
      .co-main::-webkit-scrollbar{width:6px}
      .co-main::-webkit-scrollbar-track{background:#f1f5f9}
      .co-main::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      .co-group-btn:hover{background:rgba(255,255,255,.08)!important}
      .co-exam-btn:hover{background:rgba(255,255,255,.1)!important}
      .co-content{padding:28px 36px 48px}
      @media(max-width:900px){.co-content{padding:20px 20px 40px}}
      @media(max-width:600px){.co-content{padding:16px 16px 36px}}
      .co-cta-illus{min-width:0}
      .co-cta-left{flex:1 1 260px;padding:32px 28px}
      .co-cta-right{flex:1 1 220px;padding:28px 32px}
      @media(max-width:760px){.co-cta-illus{display:none!important}.co-cta-left{padding:28px 24px;flex:1 1 100%}.co-cta-right{padding:0 24px 28px;flex:1 1 100%;border-left:none!important}}
    `}</style>
    <header style={{ background:'#0f172a', height:58, display:'flex', alignItems:'center', padding:'0 20px', gap:16, position:'sticky', top:0, zIndex:100, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onNav?.('home')}>
        <div style={{ width:36, height:36, background:'#FF653F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:15, color:'#fff', letterSpacing:'-0.5px' }}>MT</div>
        <div className="co-logo-text">
          <div style={{ color:'#fff', fontWeight:800, fontSize:14, lineHeight:1.1 }}>MockTest</div>
          <div style={{ color:'rgba(255,255,255,.45)', fontSize:9.5, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase' }}>Your world of mock tests</div>
        </div>
      </div>
      <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
        {user ? (
          <button onClick={onLogout} style={{ background:'none', border:'1px solid rgba(255,255,255,.25)', borderRadius:8, color:'rgba(255,255,255,.85)', fontSize:13, fontWeight:600, padding:'6px 14px', cursor:'pointer' }}>Logout</button>
        ) : (
          <>
            <button onClick={() => onNav?.('auth')} className="co-login-btn" style={{ background:'none', border:'none', color:'rgba(255,255,255,.82)', fontSize:13, fontWeight:500, padding:'6px 10px', cursor:'pointer' }}>Login</button>
            <button onClick={() => onNav?.('auth')} style={{ background:'#FF653F', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:700, padding:'7px 16px', cursor:'pointer', whiteSpace:'nowrap' }}>Start Free →</button>
          </>
        )}
      </div>
    </header>

    <div style={{ display:'flex', fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* LEFT SIDEBAR — dark navy */}
      <aside className="co-sidebar hidden md:flex" style={{ width:256, flexShrink:0, background:'#0f172a', flexDirection:'column', overflowY:'auto', borderRight:'1px solid rgba(255,255,255,.07)', position:'sticky', top:58, height:'calc(100vh - 58px)', alignSelf:'flex-start' }}>
        <div style={{ padding:'16px 12px 8px' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', padding:'0 8px 10px' }}>Browse Exams</div>
          {TREE.map(({ group, families }) => {
            const open = !!openGroups[group]
            const hasActive = families.some(f => f.exams.some(e => e.id === sel))
            return (
              <div key={group} style={{ marginBottom:2 }}>
                <button className="co-group-btn" onClick={() => toggle(group)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', background: open || hasActive ? 'rgba(255,101,63,.12)' : 'transparent', transition:'background .15s', textAlign:'left' }}>
                  <span style={{ color: open || hasActive ? '#FF653F' : 'rgba(255,255,255,.45)', flexShrink:0, display:'flex' }}>
                    {GROUP_ICONS[group]}
                  </span>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color: open || hasActive ? '#fff' : 'rgba(255,255,255,.7)' }}>{group}</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,.3)', transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▼</span>
                </button>
                {open && (
                  <div style={{ paddingLeft:8, paddingBottom:6, paddingTop:2 }}>
                    {families.map(fam => {
                      const famActive = fam.exams.some(e => e.id === sel)
                      return (
                        <button key={fam.name} className="co-exam-btn"
                          onClick={() => setSel(fam.exams[0].id)}
                          style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer', background: famActive ? 'rgba(255,101,63,.18)' : 'transparent', marginBottom:2, transition:'background .12s', textAlign:'left' }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background: famActive ? '#FF653F' : 'rgba(255,255,255,.25)', flexShrink:0 }} />
                          <span style={{ fontSize:12.5, fontWeight: famActive ? 700 : 400, color: famActive ? '#fff' : 'rgba(255,255,255,.65)', flex:1 }}>{fam.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="co-main" style={{ flex:1, minWidth:0, background:'#f8fafc' }}>
        <div className="co-content">

          {/* Breadcrumb */}
          <nav style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20, flexWrap:'wrap' }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                {i > 0 && <span style={{ color:'#94a3b8', fontSize:12 }}>›</span>}
                {crumb.action ? (
                  <button onClick={() => onNav?.(crumb.action)}
                    style={{ background:'none', border:'none', padding:0, cursor:'pointer', fontSize:12.5, color:'#64748b', fontWeight:500 }}
                    onMouseOver={e => e.currentTarget.style.color = '#FF653F'}
                    onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                    {crumb.label}
                  </button>
                ) : (
                  <span style={{ fontSize:12.5, color: i === breadcrumb.length - 1 ? '#1e293b' : '#64748b', fontWeight: i === breadcrumb.length - 1 ? 600 : 400 }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Page heading */}
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', margin:0, lineHeight:1.2 }}>
              Exam <span style={{ color:'#FF653F' }}>Cut-offs</span> by Category
            </h1>
            <p style={{ fontSize:13.5, color:'#64748b', marginTop:6 }}>
              Last 5 years of cut-off marks for UR, OBC, EWS, SC, ST and PwBD candidates.
            </p>
          </div>

          {/* Mobile selectors */}
          <div className="md:hidden" style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#FF653F', marginBottom:8 }}>Choose an exam</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <select value={exam.group}
                onChange={e => { const first = EXAMS.find(x => x.group === e.target.value); if (first) setSel(first.id) }}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, background:'#fff', outline:'none' }}>
                {GROUPS.filter(g => EXAMS.some(x => x.group === g)).map(g => <option key={g} value={g}>{g} Exams</option>)}
              </select>
              <select value={sel} onChange={e => setSel(e.target.value)}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, background:'#fff', outline:'none' }}>
                {EXAMS.filter(x => x.group === exam.group).map(x => <option key={x.id} value={x.id}>{x.name} — {x.level}</option>)}
              </select>
            </div>
          </div>

          {/* Table card */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 16px rgba(15,23,42,.06)', marginBottom:12 }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <span style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>{exam.name}</span>
                {examFamily && examFamily.exams.length > 1 && (
                  <div style={{ display:'flex', gap:4 }}>
                    {examFamily.exams.map(e => (
                      <button key={e.id} onClick={() => setSel(e.id)}
                        style={{ fontSize:11.5, fontWeight:600, padding:'3px 10px', borderRadius:20, border:'none', cursor:'pointer', background: e.id === sel ? '#FF653F' : '#f1f5f9', color: e.id === sel ? '#fff' : '#64748b', transition:'all .12s' }}>
                        {e.level}
                      </button>
                    ))}
                  </div>
                )}
                {examFamily && examFamily.exams.length === 1 && (
                  <span style={{ fontSize:13, color:'#64748b' }}>· {exam.level}</span>
                )}
              </div>
              <span style={{ fontSize:12, color:'#94a3b8', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:6, padding:'3px 10px', whiteSpace:'nowrap' }}>Out of {exam.total} marks · indicative</span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', minWidth:440, fontSize:13.5, borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    <th style={{ textAlign:'left', fontWeight:700, padding:'11px 20px', color:'#475569', whiteSpace:'nowrap', borderBottom:'1px solid #e2e8f0' }}>Year</th>
                    {CATS.map(c => (
                      <th key={c} style={{ fontWeight:700, padding:'11px 16px', textAlign:'center', color: c === 'UR' ? '#FF653F' : '#475569', whiteSpace:'nowrap', borderBottom:'1px solid #e2e8f0' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exam.rows.map((r, i) => (
                    <tr key={r.year} style={{ borderBottom: i < exam.rows.length - 1 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={{ padding:'12px 20px', fontWeight:700, color:'#1e293b', whiteSpace:'nowrap' }}>{r.year}</td>
                      {CATS.map(c => (
                        <td key={c} style={{ padding:'12px 16px', textAlign:'center', fontWeight:600, whiteSpace:'nowrap', color: c === 'UR' ? '#FF653F' : '#374151' }}>
                          {r[c] != null ? r[c] : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ fontSize:11.5, color:'#94a3b8', marginBottom:32 }}>
            ⚠ Figures are indicative. Actual cut-offs are released state-wise by IBPS/SBI and may vary each year.
          </p>

          {/* CTA */}
          <div style={{ borderRadius:20, overflow:'hidden', background:'#0f172a', display:'flex', flexWrap:'wrap', alignItems:'stretch' }}>
            {/* Illustration col */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 20px 28px 32px', flexShrink:0 }} className="co-cta-illus">
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="96" height="96" rx="16" fill="rgba(255,101,63,.12)"/>
                <rect x="20" y="18" width="40" height="52" rx="4" fill="#fff" fillOpacity=".1" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
                <line x1="28" y1="30" x2="52" y2="30" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="28" y1="38" x2="52" y2="38" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="28" y1="46" x2="44" y2="46" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="52" y="52" width="24" height="18" rx="4" fill="rgba(255,101,63,.15)" stroke="rgba(255,101,63,.4)" strokeWidth="1"/>
                <rect x="56" y="62" width="4" height="6" rx="1" fill="#FF653F" fillOpacity=".7"/>
                <rect x="62" y="58" width="4" height="10" rx="1" fill="#FF653F"/>
                <rect x="68" y="55" width="4" height="13" rx="1" fill="#FF653F" fillOpacity=".85"/>
                <circle cx="70" cy="32" r="12" fill="rgba(255,101,63,.2)" stroke="#FF653F" strokeWidth="1.5"/>
                <polyline points="65,32 69,36 76,28" stroke="#FF653F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Text + button col */}
            <div className="co-cta-left" style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#fff', margin:'0 0 10px', lineHeight:1.3 }}>
                Will your score clear the <span style={{ color:'#FF653F' }}>cut-off?</span>
              </h2>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.6)', margin:'0 0 24px', lineHeight:1.65 }}>
                Take a free mock test — we'll compare your score against the cut-off for <b style={{ color:'rgba(255,255,255,.85)' }}>your category</b> and show exactly what to improve.
              </p>
              <div>
                <button onClick={() => onNav?.('auth')}
                  style={{ background:'#FF653F', border:'none', borderRadius:10, color:'#fff', fontSize:13.5, fontWeight:700, padding:'12px 26px', cursor:'pointer', whiteSpace:'nowrap' }}
                  onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                  onMouseOut={e => e.currentTarget.style.background = '#FF653F'}>
                  Start Free Test →
                </button>
              </div>
            </div>
            {/* Benefits col */}
            <div className="co-cta-right" style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:10, borderLeft:'1px solid rgba(255,255,255,.07)' }}>
              {[
                'Get your estimated score',
                'Compare with category cut-off',
                'See topic-wise analysis',
                'Know your weak areas',
              ].map(feat => (
                <button key={feat} onClick={() => onNav?.('auth')}
                  style={{ display:'flex', alignItems:'center', gap:10, background:'transparent', border:'none', padding:'6px 0', cursor:'pointer', textAlign:'left' }}
                  onMouseOver={e => e.currentTarget.querySelector('span:last-child').style.color = '#fff'}
                  onMouseOut={e => e.currentTarget.querySelector('span:last-child').style.color = 'rgba(255,255,255,.75)'}>
                  <span style={{ width:22, height:22, borderRadius:'50%', background:'#1e40af', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,.75)', transition:'color .12s' }}>{feat}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer onNav={onNav} />
    </>
  )
}
