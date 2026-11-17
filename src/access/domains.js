/* ══════════════════════════════════════════════════════════════════════════
   Domains = exam categories an admin can be given access to.
   MIRROR of server-for-admin-panel-/src/config/domains.js — keep both in sync.
   An exam belongs to the FIRST domain whose prefix matches its id
   (`state` is checked before `us` because AP EAMCET ids start with "ap_").
   ══════════════════════════════════════════════════════════════════════════ */

export const DOMAINS = [
  { id: 'banking',    label: 'Banking',                 color: '#F06535', prefixes: ['bank_', 'sbi_', 'rbi_', 'nabard_', 'ibps_', 'rrb_office', 'rrb_officer', 'rrb_clerk', 'rrb_po'] },
  { id: 'insurance',  label: 'Insurance',               color: '#0891b2', prefixes: ['lic_', 'niacl_', 'nicl_', 'uiic_', 'oicl_'] },
  { id: 'ssc',        label: 'SSC',                     color: '#7c3aed', prefixes: ['ssc_'] },
  { id: 'railway',    label: 'Railway',                 color: '#059669', prefixes: ['rrb_ntpc', 'rrb_group', 'rrb_alp', 'rrb_je'] },
  { id: 'government', label: 'Government (Post / PSU)', color: '#d97706', prefixes: ['ippb_', 'coal_india'] },
  { id: 'state',      label: 'State (EAMCET)',          color: '#db2777', prefixes: ['ap_eamcet', 'ts_eamcet'] },
  { id: 'us',         label: 'US Exams',                color: '#2563eb', prefixes: ['sat_', 'act_', 'psat_', 'ap_'] },
]

export const DOMAIN_IDS = DOMAINS.map((d) => d.id)
export const domainById = (id) => DOMAINS.find((d) => d.id === id)

/** Domain id for an exam id, or null. */
export function domainOfExam(examId) {
  const id = String(examId || '').trim()
  if (!id) return null
  const d = DOMAINS.find((dom) => dom.prefixes.some((p) => id.startsWith(p)))
  return d ? d.id : null
}

/** Is this exam inside one of these domains? */
export function examInDomains(examId, domains = []) {
  const d = domainOfExam(examId)
  return !!d && domains.includes(d)
}

/** Admin-panel modules a DOMAIN admin may use (super admins use everything). */
export const DOMAIN_ADMIN_MODULES = ['exams', 'write', 'upload', 'flagged']
