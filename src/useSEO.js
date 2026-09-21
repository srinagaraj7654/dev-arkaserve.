import { useEffect } from 'react'

const BASE_URL = 'https://prep.arkaserve.com'

const SEO = {
  home:        { path: '/',          title: 'MockTest — Free Mock Tests for EAMCET, JEE, IBPS, SSC & UPSC | Arkaserve', desc: 'Free expert-crafted mock tests for EAMCET, JEE Mains, JEE Advanced, IBPS Clerk, SBI PO, SSC CGL, UPSC Prelims and more. AI-powered weakness analysis. Start free today.' },
  exams:       { path: '/exams',     title: 'All Mock Tests — EAMCET, JEE, IBPS, SSC, UPSC | MockTest', desc: 'Browse all free mock tests: EAMCET Engineering, JEE Mains, JEE Advanced, IBPS Clerk, SBI PO, SSC CGL, UPSC Prelims, GATE, LIC, RBI and more.' },
  about:       { path: '/about',     title: 'About Arkaserve & MockTest | Expert Mock Tests for India', desc: 'Learn about MockTest — built by Arkaserve to help Indian students ace competitive exams with AI-powered mock tests and weakness analysis.' },
  contact:     { path: '/contact',   title: 'Contact Us | MockTest by Arkaserve', desc: 'Get in touch with the MockTest team at Arkaserve for support, partnerships or feedback.' },
  courses:     { path: '/courses',   title: 'Courses & Study Material | MockTest by Arkaserve', desc: 'Explore curated courses and study material for EAMCET, JEE, IBPS, SSC, UPSC and other competitive exams.' },
  papers:      { path: '/papers',    title: 'Previous Year Papers — EAMCET, JEE, IBPS, SSC | MockTest', desc: 'Download and practice previous year question papers for EAMCET, JEE, IBPS, SSC, UPSC and other exams.' },
  cutoffs:     { path: '/cutoffs',   title: 'Exam Cutoffs 2024–25 — EAMCET, JEE, IBPS, SSC | MockTest', desc: 'Check latest cutoff marks for EAMCET, JEE Mains, IBPS Clerk, SSC CGL, UPSC and other competitive exams.' },
  privacy:     { path: '/privacy',   title: 'Privacy Policy | MockTest by Arkaserve', desc: 'Read the MockTest privacy policy — how we collect, use and protect your data under India\'s DPDP Act 2023.' },
  terms:       { path: '/terms',     title: 'Terms of Service | MockTest by Arkaserve', desc: 'Read the MockTest terms of service governing your use of the platform.' },
  dashboard:   { path: '/dashboard', title: 'Dashboard | MockTest', desc: 'Your personalised MockTest dashboard — track progress, review tests and study smarter.' },
  examhome:    { path: '/examhome',  title: 'Start Exam | MockTest', desc: 'Begin your mock test session on MockTest.' },
  auth:        { path: '/auth',      title: 'Sign In or Register | MockTest', desc: 'Create a free MockTest account or sign in to track your progress and access all exams.' },
}

const BASE = 'MockTest — Free Mock Tests | Arkaserve'
const BASE_DESC = 'Free expert-crafted mock tests for EAMCET, JEE, IBPS, SSC, UPSC and more. AI-powered weakness analysis.'

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function setOG(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`)
  if (el) el.setAttribute('content', content)
}
function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el) }
  el.setAttribute('href', url)
}

export function useSEO(page) {
  useEffect(() => {
    const s = SEO[page] || {}
    const title = s.title || BASE
    const desc  = s.desc  || BASE_DESC
    const url   = BASE_URL + (s.path || '/')
    document.title = title
    setMeta('description', desc)
    setOG('og:title', title)
    setOG('og:description', desc)
    setOG('og:url', url)
    setCanonical(url)
  }, [page])
}
