/* ══════════════════════════════════════════════════════════════════════════
   License Management — HARDCODED SAMPLE DATA (front-end preview only)
   Nothing here talks to the backend. Replace with Supabase queries later.
   Dates are generated relative to "today" so the demo always shows a mix of
   active / expiring-soon / expired / suspended licences.
   ══════════════════════════════════════════════════════════════════════════ */

/* Plan catalog — mirrors PLAN_TIERS + the 7-day free trial used in Dashboard.jsx */
export const LICENSE_PLANS = [
  { id: 'trial',    name: 'Free trial', days: 7,  price: 0,    color: '#64748b', active: true, popular: false, builtIn: true,
    desc: 'Try everything free before you decide.',
    features: ['Full access for the trial period', 'Mock tests & topic practice'] },
  { id: 'basic',    name: 'Basic',      days: 30, price: 199,  color: '#0891b2', active: true, popular: false, builtIn: true,
    desc: 'For getting started with regular practice.',
    features: ['5 mock tests / month', 'Topic practice', 'Basic analytics'] },
  { id: 'pro',      name: 'Pro',        days: 30, price: 499,  color: '#F06535', active: true, popular: true,  builtIn: true,
    desc: 'Our most popular plan for serious aspirants.',
    features: ['Unlimited mock tests', 'PDF solutions', 'Personalised study plan'] },
  { id: 'ultimate', name: 'Ultimate',   days: 90, price: 1199, color: '#7c3aed', active: true, popular: false, builtIn: true,
    desc: 'Everything, for the full exam season.',
    features: ['Everything in Pro', 'All exam categories', 'Performance trends', 'WhatsApp reminders'] },
]

/* Accent colours offered in the plan editor */
export const PLAN_COLORS = ['#64748b', '#0891b2', '#059669', '#F06535', '#d97706', '#dc2626', '#db2777', '#7c3aed', '#2563eb', '#0f766e']

/* yyyy-mm-dd for today ± n days (local time) */
export function isoFromToday(n = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/* [name, email-user, phone, plan, role, status, startOffset, durationDays, lastActiveOffset, notes] */
const RAW = [
  ['Priya Sharma',      'priya.sharma',     '98450 11201', 'pro',      'student',     'active',    -12, 30,  0,  ''],
  ['Rahul Mehta',       'rahul.mehta',      '99001 22314', 'ultimate', 'student',     'active',    -40, 90,  -1, 'Paid via UPI'],
  ['Deepa Krishnan',    'deepa.k',          '97411 55620', 'basic',    'student',     'active',    -25, 30,  -2, ''],
  ['Amit Singh',        'amit.singh',       '98860 74512', 'pro',      'student',     'active',    -26, 30,  -1, 'Renewal reminder sent'],
  ['Neha Verma',        'neha.verma',       '90080 33417', 'trial',    'student',     'active',    -2,  7,   0,  ''],
  ['Kiran Patil',       'kiran.patil',      '96320 88145', 'trial',    'student',     'active',    -6,  7,   0,  ''],
  ['Sneha Reddy',       'sneha.reddy',      '91087 65230', 'ultimate', 'student',     'active',    -10, 90,  -3, ''],
  ['Vikram Rao',        'vikram.rao',       '98440 12098', 'pro',      'student',     'active',    -45, 30,  -14, 'Asked about refund'],
  ['Ananya Iyer',       'ananya.iyer',      '99459 30871', 'basic',    'student',     'active',    -33, 30,  -5, ''],
  ['Rohit Kulkarni',    'rohit.k',          '97389 41562', 'trial',    'student',     'active',    -9,  7,   -2, ''],
  ['Pooja Nair',        'pooja.nair',       '90193 77408', 'pro',      'student',     'suspended', -15, 30,  -6, 'Suspended: payment dispute'],
  ['Arjun Das',         'arjun.das',        '96860 50923', 'ultimate', 'admin',       'active',    -60, 365, 0,  'Content team'],
  ['Meera Joshi',       'meera.joshi',      '98864 21036', 'basic',    'student',     'active',    -3,  30,  0,  ''],
  ['Suresh Babu',       'suresh.babu',      '94481 66724', 'pro',      'student',     'active',    -29, 30,  -1, ''],
  ['Lakshmi Menon',     'lakshmi.m',        '97316 90455', 'trial',    'student',     'suspended', -4,  7,   -4, 'Duplicate account'],
  ['Harish Gowda',      'harish.gowda',     '99860 13377', 'ultimate', 'student',     'active',    -85, 90,  -2, ''],
  ['Divya Pillai',      'divya.pillai',     '98450 98012', 'basic',    'student',     'active',    -40, 30,  -20, ''],
  ['Naveen Kumar',      'naveen.kumar',     '90360 44589', 'pro',      'student',     'active',    -1,  30,  0,  'New signup — Diwali offer'],
  ['Shruti Bhat',       'shruti.bhat',      '96111 72693', 'trial',    'student',     'active',    0,   7,   0,  ''],
  ['Manoj Hegde',       'manoj.hegde',      '94485 20137', 'basic',    'student',     'active',    -28, 30,  -1, ''],
  ['Kavya Shetty',      'kavya.shetty',     '99002 81460', 'ultimate', 'student',     'active',    -20, 180, -1, 'Custom 6-month deal'],
  ['Aditya Rao',        'aditya.rao',       '97409 53318', 'pro',      'student',     'active',    -38, 30,  -9, ''],
  ['Ritu Agarwal',      'ritu.agarwal',     '98861 07724', 'trial',    'student',     'active',    -12, 7,   -5, ''],
  ['Sri Nagaraj',       'nagaraj2k06',      '98450 00000', 'pro',      'super_admin', 'active',    -5,  365, 0,  'Platform owner'],
]

export const MOCK_USERS = RAW.map(([name, mail, phone, plan, role, status, start, days, last, notes], i) => ({
  id: `u${String(i + 1).padStart(3, '0')}`,
  name,
  email: mail.includes('@') ? mail : `${mail}@gmail.com`,
  phone: `+91 ${phone}`,
  plan,
  role,
  status,                                   // 'active' | 'suspended' (expired/expiring are derived from dates)
  startDate: isoFromToday(start),
  expiryDate: isoFromToday(start + days),
  lastActive: isoFromToday(last),
  notes,
}))
