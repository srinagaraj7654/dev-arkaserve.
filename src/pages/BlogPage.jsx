import { useState, useEffect } from 'react'
const _sv = (c) => ({fill:'none',stroke:c||'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'})
const BIcBank   = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M3 21h18M3 10h18M3 10l9-7 9 7"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></svg>
const BIcShield = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const BIcDoc    = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2z"/><polyline points="14 2 14 8 20 8"/></svg>
const BIcChart  = ({s=20,c}) => <svg width={s} height={s} viewBox="0 0 24 24" {..._sv(c)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>

/* ──────────────────────────────────────────────────────────────
   Blog page — standalone at /blog; required for AdSense
   Each article is full-text expandable for crawlability
────────────────────────────────────────────────────────────── */

const ARTICLES = [
  {
    id: 'ibps-po-2025-syllabus',
    title: 'IBPS PO 2025: Complete Syllabus, Exam Pattern and Preparation Strategy',
    date: '2025-09-10',
    category: 'Banking',
    readTime: '8 min read',
    excerpt: 'Everything you need to know about IBPS PO 2025 — prelims and mains pattern, topic-wise syllabus, cut-off trends and a 60-day preparation strategy.',
    content: `
IBPS PO (Probationary Officer) is one of the most sought-after banking jobs in India. Here is a complete guide for 2025 aspirants.

## Exam Pattern

**Prelims (100 questions, 60 minutes)**
- English Language: 30 questions, 20 minutes
- Quantitative Aptitude: 35 questions, 20 minutes
- Reasoning Ability: 35 questions, 20 minutes
- Negative marking: 0.25 marks per wrong answer

**Mains (155 questions, 180 minutes)**
- Reasoning & Computer Aptitude: 45 questions, 60 minutes
- Data Analysis & Interpretation: 35 questions, 45 minutes
- General/Financial Awareness: 40 questions, 35 minutes
- English: 35 questions, 40 minutes
- Descriptive Paper: 2 questions, 30 minutes (Essay + Letter)

## Syllabus Breakdown

**Quantitative Aptitude / Data Analysis**
The most scoring section if prepared well. Focus on: Number Series (5–8 questions), Data Interpretation (15–20 questions across 3–4 sets), Quadratic Equations, Simplification, Percentage, Profit & Loss, Time & Work, Simple and Compound Interest, Mixture & Alligation.

**Reasoning Ability**
High-weightage topics: Puzzles & Seating Arrangement (15–20 questions in mains), Syllogism, Inequality, Blood Relations, Coding-Decoding, Direction Sense, Input-Output. In mains, expect complex circular and linear arrangement puzzles with 4–5 variables.

**English Language**
Reading Comprehension dominates — practice 3 RC passages per day. Also cover: Cloze Test, Error Detection, Para Jumbles, Fill in the Blanks, Sentence Improvement, Vocabulary (synonyms/antonyms in context).

**General/Financial Awareness**
Six months of current affairs is the standard. Focus on: RBI monetary policy decisions, budget announcements, government schemes, banking sector news, static GK (HQ of banks, financial terms).

## Preparation Strategy — 60 Days

**Days 1–20: Foundation**
- Spend 3 hours/day: 1 hour each on Quant, Reasoning, English
- Complete all basic concepts with a standard textbook
- Start giving topic-wise tests after 3 days of learning

**Days 21–40: Practice**
- Shift to 4 hours/day
- Attempt 2 sectional tests per day (rotate sections)
- Track accuracy: target 90%+ in easy topics before moving to medium

**Days 41–55: Mock Tests**
- Attempt a full mock test every day
- Spend equal time analysing your results — identify weak sub-topics
- Use AI weakness analysis (available on MockTest) to prioritise revision

**Days 56–60: Revision**
- No new topics — only revision of weak areas
- Attempt 2 mocks on day 57 and 59 for timing practice

## Cut-off Trends (Prelims)

| Year | General (Overall) | OBC | SC | ST |
|------|-------------------|-----|----|----|
| 2024 | 48.25 | 44.25 | 38.00 | 31.50 |
| 2023 | 52.75 | 48.75 | 43.25 | 38.00 |
| 2022 | 54.75 | 50.50 | 44.25 | 37.75 |

The cut-off dropped in 2024 due to increased vacancy and a slightly harder paper. Aim for 65+ in prelims for a safe margin.

## Tips for High Score

1. **Prioritise DI in mains**: DI sets can yield 20+ marks if solved correctly. Practice bar charts, pie charts, tables and line graphs daily.
2. **Sectional time management**: In prelims, spend no more than 18 minutes on Reasoning to leave time for the relatively easier English section.
3. **Attempt English last**: Most aspirants are faster in English — save it to compensate if you run over time in Quant or Reasoning.
4. **Don't leave GA**: Many aspirants neglect GK in mains. Even 25/40 in GA can be the difference between selection and non-selection.
    `,
  },
  {
    id: 'sbi-clerk-30-day-plan',
    title: 'SBI Clerk 2025: How to Score 80+ in Prelims with a 30-Day Plan',
    date: '2025-09-05',
    category: 'Banking',
    readTime: '6 min read',
    excerpt: 'A realistic, day-by-day 30-day plan to score 80 or more marks in SBI Clerk Prelims 2025. Includes topic priorities, daily targets and mock test schedule.',
    content: `
SBI Clerk (Junior Associates) is the entry point to the State Bank of India and one of the most competitive banking exams. The prelims requires 100 questions in 60 minutes — speed and accuracy are everything.

## Exam Pattern

- English Language: 30 questions, 20 minutes
- Numerical Ability: 35 questions, 20 minutes
- Reasoning Ability: 35 questions, 20 minutes
- Negative marking: 0.25 marks per wrong answer
- Minimum marks in each section are required to clear prelims

## What 80+ Marks Looks Like

- English: 24–26 correct (80–87%)
- Numerical: 26–28 correct (74–80%)
- Reasoning: 28–30 correct (80–86%)
- Total: 78–84 marks

This is achievable with the right preparation — here is how.

## 30-Day Plan

**Week 1 (Days 1–7): Concepts**

Day 1–2: Number System, Simplification, Approximation (Numerical)
Day 3–4: Puzzles basics, Inequality, Syllogism (Reasoning)
Day 5–6: Reading Comprehension, Error Detection (English)
Day 7: Revision + first sectional test (Reasoning only)

**Week 2 (Days 8–14): Core topics**

Day 8–9: Percentage, Profit & Loss, Ratio (Numerical)
Day 10–11: Number Series, Quadratic Equations (Numerical)
Day 12: Coding-Decoding, Blood Relations, Direction Sense (Reasoning)
Day 13: Cloze Test, Para Jumbles, Fill in the Blanks (English)
Day 14: Sectional tests — all 3 sections, review thoroughly

**Week 3 (Days 15–21): Speed building**

Day 15–16: Time & Work, Time & Distance, Average (Numerical)
Day 17–18: Seating Arrangement (linear, circular) + Alpha-Numeric Series (Reasoning)
Day 19: Sentence Improvement, Vocabulary exercises (English)
Day 20: Full mock test #1 — score benchmark, identify weaknesses
Day 21: Dedicated revision of weak topics identified in mock 1

**Week 4 (Days 22–28): Mock + analysis**

Day 22: Full mock test #2
Day 23: Analysis of mock 2 + weak topic practice
Day 24: Full mock test #3
Day 25: Analysis + targeted practice
Day 26: Full mock test #4
Day 27: Analysis — by now you should see improvement
Day 28: Topic revision only, no new tests

**Final 2 days:**
Day 29: Light mock test, focus on speed
Day 30: No test — sleep well, revise tricks and formulas

## High-Impact Tips

**Numerical Ability**
- Simplification/Approximation: 5–8 questions, solvable in under 30 seconds each. This is free marks — master BODMAS and fraction simplification.
- Number Series: Identify the pattern in under 15 seconds. Common patterns: difference series, square series, cube series, alternating series.
- Avoid Data Interpretation in prelims if it's complex — it is not always present and wastes time.

**Reasoning**
- Puzzles take 3–5 minutes each. Attempt easy puzzles (linear seating) first, leave complex ones.
- Inequality: Formula-based, solvable in 20–30 seconds. Never skip these.
- Target 20+ from non-puzzle questions: Syllogism, Blood Relations, Coding, Direction — these are faster.

**English**
- RC passage: Read questions first, then skim the passage. For vocabulary questions, use elimination.
- Error Detection: Focus on subject-verb agreement, tense consistency, preposition usage.
- Para Jumbles: Find the mandatory first sentence (introductory context), then link ideas.

## Cut-off Trend

SBI Clerk Prelims cutoff for General category typically ranges 62–70 out of 100. Score 80+ to be safe regardless of state-wise variation.
    `,
  },
  {
    id: 'ibps-clerk-vs-sbi-clerk',
    title: 'IBPS Clerk vs SBI Clerk 2025: Which Exam Should You Attempt First?',
    date: '2025-08-28',
    category: 'Banking',
    readTime: '5 min read',
    excerpt: 'A detailed comparison of IBPS Clerk and SBI Clerk — pattern, difficulty, salary, career growth and which one to prioritise if you are a fresher.',
    content: `
Both IBPS Clerk and SBI Clerk are clerical grade positions in India's public banking sector. The preparation overlaps significantly but the exams differ in important ways.

## Pattern Comparison

| Feature | IBPS Clerk | SBI Clerk |
|---------|------------|-----------|
| Prelims | 100Q, 60 min | 100Q, 60 min |
| Mains | 190Q, 160 min | 190Q, 160 min |
| Negative marking | 0.25 per wrong | 0.25 per wrong |
| Sectional cutoffs | Yes | Yes |
| Language test | English / Hindi | Depends on state |

Both prelims are identical in structure. The difference is that SBI Clerk mains has a local language test for certain states.

## Difficulty Level

**SBI Clerk** is generally considered slightly harder:
- SBI sets the questions in-house; the difficulty level is unpredictable
- SBI's English section in mains tends to include more vocabulary-intensive questions
- Competition is higher because SBI brand attracts more aspirants per vacancy

**IBPS Clerk** is more predictable:
- Questions follow a more standard pattern year-on-year
- The mains has more vacancies overall (recruitment for multiple banks)
- Cut-offs are sometimes lower than SBI depending on the state

## Salary and Benefits

| Aspect | IBPS Clerk | SBI Clerk |
|--------|------------|-----------|
| Basic pay | ₹11,765 | ₹13,075 |
| Gross pay (approx) | ₹29,000–32,000 | ₹32,000–35,000 |
| HRA | As per RBI guidelines | Slightly higher |
| Location | Any public sector bank | Only SBI |

SBI offers marginally better pay and perks. For career growth, SBI has a faster internal promotion track.

## Career Growth

**IBPS Clerk → Officer**: You can appear for IBPS PO or IBPS SO exams externally, or apply for internal promotion (typically after 3 years). Banks like PNB, BOB and Canara Bank have active internal promotion tracks.

**SBI Clerk → Officer**: SBI has an internal promotion exam (JMGS-I) that is competitive. Many SBI clerks become officers within 3–5 years. SBI also has inter-state transfer options.

## Which to Attempt First?

**If you are a fresher preparing from scratch:**
Start with IBPS Clerk (if both are available that year). The pattern is predictable, there are more vacancies, and it gives you real exam experience before SBI Clerk.

**If you are already in service:**
Aim for SBI Clerk directly. The brand recognition, slightly better pay and faster promotion track make it worth the extra preparation.

**If exam dates clash:**
IBPS and SBI rarely overlap. Both appear in different months, so you can usually attempt both. Never skip either — the effort is the same, the reward is different.

## Preparation Tip

Since the syllabus is nearly identical, prepare for both simultaneously. Use the same mock test bank, the same notes. The only extra preparation needed for SBI Clerk mains is the local language test (where applicable).
    `,
  },
  {
    id: 'quant-shortcuts-banking',
    title: 'Quantitative Aptitude: 10 Shortcut Tricks for Banking Exams 2025',
    date: '2025-08-20',
    category: 'Strategy',
    readTime: '7 min read',
    excerpt: 'Master these 10 shortcut tricks for Quantitative Aptitude that help you solve banking exam questions in under 30 seconds. With worked examples.',
    content: `
Speed is everything in banking prelims — 35 Quant questions in 20 minutes means under 35 seconds per question. These shortcuts will make you significantly faster.

## 1. Percentage — Base Change Method

To find what percentage X is of Y: divide X by Y, multiply by 100.

**Shortcut**: For common denominators, memorise the fraction-percentage conversion table:
- 1/2 = 50%, 1/3 ≈ 33.3%, 1/4 = 25%, 1/5 = 20%
- 1/6 ≈ 16.7%, 1/8 = 12.5%, 1/9 ≈ 11.1%, 1/12 ≈ 8.3%

**Example**: What is 37.5% of 480?
37.5% = 3/8, so 480 × 3/8 = 180. Done in 5 seconds.

## 2. Simplification — VBODMAS with Approximation

For large numbers, round to nearest 5 or 10 before operating.

**Example**: 324 × 48 ÷ 27
Step 1: 324 ÷ 27 = 12 (simplify first)
Step 2: 12 × 48 = 576

Always simplify before multiplying — never multiply large numbers first.

## 3. Number Series — Pattern Types

The five patterns that cover 95% of questions:
1. **Difference series**: 2, 5, 10, 17, 26 → differences are 3, 5, 7, 9 (odd numbers)
2. **Ratio series**: 3, 6, 12, 24, 48 → multiply by 2
3. **Square series**: 4, 9, 16, 25, 36 → n²
4. **Cube series**: 1, 8, 27, 64, 125 → n³
5. **Mixed difference**: 2, 3, 5, 9, 17 → differences double each time

Identify the pattern in under 15 seconds, then calculate the missing term.

## 4. Ratio & Proportion — Unitary Method

For most ratio problems, convert to the unitary value (value per 1 unit) first.

**Example**: A and B share Rs 780 in ratio 3:5. Find B's share.
Total parts = 8. Per part = 780/8 = 97.5. B's share = 5 × 97.5 = Rs 487.50

## 5. Profit and Loss — Multiplier Method

Instead of calculating profit/loss separately, use multipliers:
- 20% profit: multiply cost by 1.20
- 15% loss: multiply cost by 0.85

**Example**: CP = 450, sells at 30% profit. SP = 450 × 1.30 = Rs 585

## 6. Time and Work — LCM Method

Find LCM of time taken by each person to get total work units.

**Example**: A finishes in 12 days, B in 15 days. Together?
LCM(12,15) = 60 units total. A does 5/day, B does 4/day. Together = 9/day.
Time = 60/9 = 6.67 days ≈ 6⅔ days

## 7. Simple Interest vs Compound Interest

**SI**: P × R × T / 100
**CI for 2 years**: P × (1 + R/100)² − P
**CI shortcut for 2 years**: SI + (SI on first year's interest)

If P = 1000, R = 10%, T = 2:
SI = 200. Extra for CI = 10% of 100 = 10. CI = 210.

## 8. Average — Deviation Method

Instead of adding all values, take an assumed average and find deviations.

**Example**: Average of 47, 52, 45, 58, 48
Assume average = 50. Deviations: −3, +2, −5, +8, −2 = 0 total.
Average = 50 (the deviations cancel). If not, add net deviation / n.

## 9. Boats and Streams

Downstream speed = Boat + Stream. Upstream speed = Boat − Stream.
Boat speed = (Downstream + Upstream) / 2.
Stream speed = (Downstream − Upstream) / 2.

If downstream = 18 km/h, upstream = 10 km/h:
Boat speed = 14 km/h. Stream = 4 km/h. Memorise these formulas — the question will always give you two of the four values.

## 10. Quadratic Equations — Sum and Product

For x² − (sum)x + (product) = 0, the roots are the two numbers that add to "sum" and multiply to "product".

**Example**: x² − 7x + 12 = 0
Sum = 7, Product = 12. Numbers: 3 and 4. So x = 3 or x = 4.

In banking exams, always note whether the question asks for relation between x and y:
- If both roots of x² > both roots of y²: x > y
- If they overlap: relation cannot be determined
    `,
  },
  {
    id: 'current-affairs-strategy-2025',
    title: 'Current Affairs Strategy for Banking Exams 2025: What to Study and What to Skip',
    date: '2025-08-15',
    category: 'Strategy',
    readTime: '6 min read',
    excerpt: 'A focused current affairs strategy for IBPS, SBI and RBI exams in 2025 — which topics matter most, how many months to cover, and the best free resources.',
    content: `
Current Affairs and General Awareness (GA) is the easiest section to improve quickly, yet most aspirants prepare it poorly. Here is a focused approach.

## How Many Months to Cover?

The standard rule: **cover the last 6 months** before your exam date.

For IBPS Clerk and PO mains (usually in November–December), cover May–October.
For SBI Clerk mains (usually in February), cover August–January.

Going back 12 months rarely gives ROI. The questions in mains are almost always from the last 6 months, with the last 3 months having the highest density.

## Topic Weightage (Banking Exams)

Based on 2022–2024 IBPS and SBI mains analysis:

| Topic | Expected Questions |
|-------|-------------------|
| Banking/Finance news | 8–12 |
| RBI decisions and circulars | 5–8 |
| Government schemes | 4–6 |
| Sports (recent champions) | 3–5 |
| National appointments | 3–4 |
| International news | 3–5 |
| Awards and recognition | 2–3 |
| Books and authors | 1–2 |
| Science and technology | 2–3 |
| Static banking facts | 5–8 |

## What to Study in Detail

**RBI and Monetary Policy**
Every RBI policy statement is exam material. Note: repo rate, reverse repo rate, CRR, SLR, bank rate, MSF rate. Any change in these rates is tested frequently. Also: NBFC regulations, payment bank guidelines, priority sector lending norms.

**Government Schemes**
Focus on schemes announced in the last 6 months AND their implementing ministry. Old schemes still appear: PM Jan Dhan Yojana, PMAY, Mudra Yojana — know their key facts (launched date, target beneficiaries, implementing bank if any).

**Banking Sector Events**
Mergers, acquisitions, new banks, bank HQ changes. For 2025: any public sector bank privatisation news, new payment banks, cooperative bank issues. Know the MD & CEO of PSU banks (this changes frequently).

**Sports**
Only current champions — don't memorise entire history. Focus on: Cricket (World Cup, Asia Cup, Test series winners), Kabaddi (Pro Kabaddi), Football (ISL), Badminton (world championship), Athletics (world records by Indians).

## Static Banking Facts (Always Tested)

Memorise these — they never change:
- Headquarters of all PSU banks
- Taglines of banks (SBI: "With You — Always", PNB: "The Name You Can Bank Upon")
- Payment banks and small finance banks
- Founder and established year of major banks
- International HQ: IMF (Washington D.C.), World Bank (Washington D.C.), ADB (Manila), NDB (Shanghai)

## Best Free Resources

1. **The Hindu** or **Indian Express** — read for 20 minutes daily, banking/economy pages
2. **RBI website** — bookmark the Press Releases section for direct source accuracy
3. **PIB (Press Information Bureau)** — government scheme announcements
4. **Monthly GK PDFs** from Jagran Josh or Bankersadda — useful for final revision
5. **MockTest current affairs section** — updated questions based on recent events

## Study Schedule

**Ongoing (daily, 20 minutes)**: Read one newspaper page, note 5–10 facts in a notebook
**Weekly (1 hour)**: Weekly current affairs quiz — pick 50 MCQs
**Monthly (2 hours)**: Monthly current affairs revision of your notes
**2 weeks before exam**: Full 6-month revision from consolidated notes or PDF

## What to Skip

- District-level news unless it involves national significance
- Detailed state government budget figures (not asked in banking exams)
- International sports results unless Indian athletes won medals
- Individual state political appointments (central appointments only)
- GK older than 6 months (except static facts)
    `,
  },
  {
    id: 'rrb-office-assistant-guide',
    title: 'RRB Office Assistant 2025: Complete Guide for Freshers',
    date: '2025-08-08',
    category: 'Banking',
    readTime: '5 min read',
    excerpt: 'Everything a fresher needs to know about RRB Office Assistant (IBPS RRB Clerk) — eligibility, pattern, language options, preparation tips and career prospects.',
    content: `
IBPS RRB Office Assistant (Multipurpose) is a popular entry-level banking job at Regional Rural Banks. It is slightly easier to clear than IBPS Clerk, with lower cut-offs, and offers stable government employment.

## Eligibility

- Educational qualification: Graduation in any discipline
- Age limit: 18–28 years (relaxation for reserved categories)
- Local language: Must know the official language of the state where the RRB is located
- Proficiency in reading and writing local language is often tested

## Exam Pattern

**Prelims (80 questions, 45 minutes)**
- Numerical Ability: 40 questions
- Reasoning Ability: 40 questions
- No negative marking in prelims

**Mains (200 questions, 120 minutes)**
- Reasoning: 40 questions
- Numerical Ability: 40 questions
- General Awareness: 40 questions
- English / Hindi: 40 questions (your choice)
- Computer Knowledge: 40 questions

Note: There is NO sectional time limit in RRB Office Assistant. This is a major advantage over IBPS Clerk prelims.

## Key Differences from IBPS Clerk

| Feature | RRB Office Assistant | IBPS Clerk |
|---------|---------------------|------------|
| English in prelims | No | Yes |
| Sectional time | No limit | 20 min per section |
| Prelims questions | 80 | 100 |
| Negative marking (prelims) | None | 0.25 |
| Language option in mains | English or Hindi | English |
| Posting | Rural/Semi-urban | Urban/Semi-urban |

No English in prelims is a big relief for Hindi-medium aspirants. No sectional time limit means you can manage your time freely across sections.

## Preparation Strategy

**Numerical Ability (40Q prelims)**
Focus: Simplification (10–12Q), Number Series (5Q), Approximation (5Q), DI (10–12Q), Word Problems (10Q).
No need to do complex topics — RRB prelims quant is simpler than IBPS.

**Reasoning Ability (40Q prelims)**
Focus: Inequality (5Q), Syllogism (5Q), Blood Relations (3–4Q), Direction (3–4Q), Coding-Decoding (5Q), Puzzles (10–15Q).
Puzzles here tend to be simpler than IBPS — 2–3 variable seating arrangements.

**General Awareness (40Q mains)**
Focus more on rural India topics: NABARD schemes, PM Kisan, crop loans, Kisan Credit Card, rural banking statistics, RRB mergers and headquarters.

**Computer Knowledge (40Q mains)**
This is one of the easiest sections in banking exams if prepared properly. Topics: MS Office shortcuts, internet basics, database concepts, hardware/software, cybersecurity basics. Score 30+ here consistently.

## Career Prospects

- Starting salary: ₹15,000–22,000 per month + allowances
- Posting: Rural or semi-urban branches in the RRB's operational state
- Promotion to Officer cadre is possible through internal exams after 2–3 years
- RRBs are now performing well financially and offer job security comparable to nationalised banks

## Which State's RRB to Apply For?

If you have a choice, apply for RRBs in states where:
1. You know the local language (mandatory for posting)
2. Cut-offs are historically lower (smaller states with fewer applicants)

Check the IBPS notification for state-wise vacancy and cut-off data.
    `,
  },
  {
    id: 'banking-exam-time-management',
    title: 'How to Attempt 100 Questions in 60 Minutes: Banking Exam Time Strategy',
    date: '2025-07-30',
    category: 'Strategy',
    readTime: '5 min read',
    excerpt: 'The exact section-by-section time strategy that toppers use to maximise their score in banking prelims. Includes a question-level decision framework.',
    content: `
Attempting 100 questions correctly in 60 minutes — that is 36 seconds per question — requires a system, not just speed. Here is the system toppers use.

## The Core Principle: Don't Attempt Sequentially

The biggest mistake is starting from Question 1 and going to Question 100. By the time you reach easier questions at the end, time has run out.

**The correct approach**: In each section, do a rapid mental triage:
1. **Attempt first**: Questions you can solve in under 30 seconds
2. **Attempt second**: Questions you can solve in 45–60 seconds
3. **Skip for now**: Questions requiring more than 60 seconds
4. **Return if time**: Skipped questions, only if time allows
5. **Never attempt**: Questions you have no idea about — negative marking applies

## Section-Wise Time Budget (IBPS/SBI Clerk Prelims)

Each section has a 20-minute limit with sectional cut-offs.

**English (30Q, 20 minutes)**
- Reading Comprehension: 1 passage (7–8Q), spend max 8 minutes
- Non-RC questions (22–23Q): 12 minutes remaining
- Target: 22–25 correct out of 30
- Skip: Long, confusing RC questions and difficult Para Jumbles
- Always attempt: Error Detection (grammatical — faster), Fill in the Blanks (vocabulary-based — quick elimination)

**Quantitative Aptitude (35Q, 20 minutes)**
- Simplification/Approximation: 5–8Q, aim for 3 minutes max (fastest marks)
- Number Series: 5Q, aim for 3 minutes
- Quadratic Equations: 5Q, aim for 3 minutes
- Word Problems: spend remaining 6 minutes on easiest 3–4 problems
- DI: Only if straightforward — 1 set in 5 minutes max
- Target: 22–26 correct

**Reasoning Ability (35Q, 20 minutes)**
- Inequality: 5Q in 2 minutes (formula-based, fastest in reasoning)
- Syllogism: 5Q in 3 minutes
- Non-puzzle topics: 10Q in 5 minutes (Blood Relations, Coding, Direction, Alpha-Numeric)
- Puzzles: Remaining 10 minutes for 1–2 puzzle sets (10–15Q)
- Target: 26–30 correct

## The 2-Pass Method

**Pass 1 (first 12 minutes of each section)**
Go through ALL questions quickly. Attempt only the easy ones. Mark "skip" mentally for the rest.

**Pass 2 (last 8 minutes)**
Return to the medium-difficulty questions you skipped. Never spend Pass 2 time on questions you genuinely don't know.

## Section Order Strategy

Most aspirants should follow this order:
1. **Reasoning first** — while the mind is fresh, puzzles take concentration
2. **English second** — RC comprehension is better when not rushed
3. **Quantitative last** — calculation-heavy but most straightforward if you know the formulas

Some aspirants prefer English first because it's faster and gives confidence. Experiment during mock tests to find your optimal order.

## The 1-Minute Rule

For any single question in prelims: if you have spent more than 60 seconds on it, mark your best guess (if the options give a strong clue) and move on. Do not spend 3 minutes fighting one question while 10 easier ones wait.

## Mock Test Drill

During mock tests, note how many questions you:
- Solved correctly in under 30 seconds
- Solved correctly in 30–60 seconds
- Attempted but got wrong (wasted time + lost marks)
- Skipped but could have solved quickly

The third category is the most important to reduce. Over 10 mock tests, you'll identify patterns in your wrong questions and focus your revision accordingly.
    `,
  },
  {
    id: 'lic-aao-2025-study-plan',
    title: 'LIC AAO 2025: Syllabus, Exam Pattern and a 60-Day Study Plan',
    date: '2025-07-22',
    category: 'Insurance',
    readTime: '7 min read',
    excerpt: 'Complete guide for LIC AAO 2025 — eligibility, prelims and mains pattern, insurance-specific GK topics and a day-by-day 60-day preparation plan.',
    content: `
LIC AAO (Assistant Administrative Officer) is a prestigious officer-level position in Life Insurance Corporation of India. With a gross pay of approximately ₹65,000–70,000 per month, it is one of the best insurance sector jobs in India.

## Eligibility

- Graduation in any discipline with minimum 60% marks (55% for SC/ST)
- Age: 21–30 years (relaxation for reserved categories)
- Computer proficiency is required
- For Chartered Accountant, Actuarial or Legal specialisation posts: professional qualification required

## Exam Pattern

**Phase 1 — Prelims (100Q, 60 minutes)**
- Reasoning Ability: 35Q, 20 minutes
- Quantitative Aptitude: 35Q, 20 minutes
- English Language: 30Q, 20 minutes
- Negative marking: 0.25 per wrong answer

**Phase 2 — Mains (300 marks)**
- General Knowledge + Current Affairs (30Q, 25 min, 60 marks)
- Data Analysis & Interpretation (35Q, 45 min, 90 marks)
- Reasoning Ability with Computer Knowledge (30Q, 45 min, 80 marks)
- Insurance and Financial Market Awareness (30Q, 25 min, 60 marks)
- English Language with professional writing (30Q + descriptive, 40 min, 50+25 marks)

**Phase 3 — Interview** (50 marks, for candidates shortlisted after mains)

## Insurance-Specific Topics (High Priority)

This is what differentiates LIC AAO from other banking exams. Study:

**Life Insurance Concepts**
- Term insurance, whole life, endowment plans, ULIP
- Premium calculation basics, sum assured, surrender value
- Riders: accidental death rider, critical illness rider, waiver of premium
- LIC's flagship plans: Jeevan Anand, Jeevan Labh, New Bima Bachat

**IRDAI (Insurance Regulatory and Development Authority)**
- Role, functions, recent circulars
- Solvency norms for insurance companies
- FDI limit in insurance (currently 74%)
- Bancassurance model

**Financial Markets**
- Stock market basics: BSE, NSE, SEBI
- Mutual funds: NAV, SIP, debt vs equity funds
- Bonds: G-Secs, T-Bills, coupon rate, YTM
- RBI and monetary policy (overlaps with banking exams)

## 60-Day Study Plan

**Days 1–15: Foundation Phase**
- Morning (1.5 hr): Quantitative Aptitude — complete all chapters
- Evening (1.5 hr): Reasoning — all standard topics
- Night (30 min): Insurance concepts — read IRDAI basics, LIC product types

**Days 16–30: English + GK**
- Morning (1 hr): English — RC, error detection, vocabulary
- Afternoon (1 hr): General Knowledge + Current Affairs (last 6 months)
- Evening (1 hr): Insurance & Financial Market Awareness (deep study)
- Night (30 min): Daily newspaper — 1 banking/economy article

**Days 31–45: Mock Tests**
- Alternate days: Full prelims mock test + 2-hour analysis
- Non-mock days: Weak topic practice (identified from mocks)
- Weekly: Insurance GK quiz (50 MCQs)

**Days 46–55: Mains Pattern Practice**
- Sectional tests for mains — especially DI and Insurance Awareness
- Essay and letter writing practice (descriptive component in mains)
- Professional writing: formal email, business letter

**Days 56–60: Revision**
- Rapid revision of all insurance concepts
- Current affairs last 3 months — final pass
- One full mains mock, one full prelims mock

## Key Differentiators from IBPS Exams

1. **Insurance and Financial Awareness** is a dedicated mains section with 30 questions — aspirants who skip this section lose 60 marks
2. The **descriptive paper** (essay + business writing) requires regular English writing practice
3. **Interview** carries 50 marks — soft skills, communication and knowledge of LIC products matter
4. **Difficulty**: LIC AAO prelims is comparable to IBPS PO prelims in difficulty

## Salary and Growth

- Basic pay: ₹32,795 (E1 scale)
- Gross pay with allowances: ₹65,000–70,000/month
- Promotions: AAO → AO (Assistant Officer) → AAO Specialist → Deputy Manager
- LIC provides housing loan, medical benefits and pension under a defined benefit scheme
    `,
  },
]

function injectJsonLD(id, data) {
  let el = document.getElementById(id)
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el) }
  el.textContent = JSON.stringify(data)
}

function ArticleCard({ article, onOpen }) {
  return (
    <article
      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpen(article.id)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:'#FFF3EE', color:'#FF653F' }}>
          {article.category}
        </span>
        <span className="text-xs text-gray-400">{article.readTime}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
      </div>
      <h2 className="text-lg font-black text-gray-900 mb-2 leading-snug">{article.title}</h2>
      <p className="text-gray-500 text-sm leading-relaxed">{article.excerpt}</p>
      <button className="mt-4 text-sm font-bold" style={{ color:'#FF653F' }}>Read full article →</button>
    </article>
  )
}

function parseMarkdown(text) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-gray-900 mt-6 mb-2">{line.slice(3)}</h2>
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2,-2).includes('**')) {
        return <p key={i} className="font-bold text-gray-800 mt-3 mb-1">{line.slice(2,-2)}</p>
      }
      if (line.startsWith('| ') && line.endsWith(' |')) {
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
        const isHeader = false
        return <div key={i} className="flex gap-2 text-sm border-b border-gray-100 py-1">
          {cells.map((c,j) => <span key={j} className="flex-1 text-gray-700">{c.replace(/\*\*/g,'')}</span>)}
        </div>
      }
      if (line.startsWith('- ')) return <li key={i} className="text-gray-600 text-sm ml-4 list-disc">{line.slice(2)}</li>
      if (/^\d+\. /.test(line)) return <li key={i} className="text-gray-600 text-sm ml-4 list-decimal">{line.replace(/^\d+\. /,'')}</li>
      if (line.trim() === '') return <div key={i} className="my-1" />
      return <p key={i} className="text-gray-600 text-sm leading-relaxed my-1">{line}</p>
    })
}

function ArticleView({ article, onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0)
    injectJsonLD('ld-article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      publisher: { '@type':'Organization', name:'Arkaserve', url:'https://www.arkaserve.com' },
      url: `https://prep.arkaserve.com/blog`,
      author: { '@type':'Organization', name:'MockTest by Arkaserve' },
    })
    return () => { const el = document.getElementById('ld-article'); if (el) el.remove() }
  }, [article.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-700">
        ← Back to all articles
      </button>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:'#FFF3EE', color:'#FF653F' }}>
          {article.category}
        </span>
        <span className="text-xs text-gray-400">{article.readTime}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">
          {new Date(article.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-tight">{article.title}</h1>
      <p className="text-gray-500 mb-6 text-sm leading-relaxed border-l-4 pl-4 italic" style={{ borderColor:'#FF653F' }}>
        {article.excerpt}
      </p>
      <div className="prose-sm">
        {parseMarkdown(article.content)}
      </div>
      <div className="mt-10 rounded-2xl p-6 text-center" style={{ background:'#1a1a2e' }}>
        <p className="text-white font-black text-lg mb-2">Practice what you just learned</p>
        <p className="text-sm mb-4" style={{ color:'rgba(255,255,255,.7)' }}>
          Free mock tests with AI-powered analysis. No payment required.
        </p>
        <button onClick={onBack}
          className="text-white text-sm font-bold px-6 py-3 rounded-xl" style={{ background:'#FF653F' }}>
          Browse All Mock Tests →
        </button>
      </div>
    </div>
  )
}

export default function BlogPage({ onNav }) {
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...new Set(ARTICLES.map(a => a.category))]
  const filtered = filter === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === filter)
  const openArticle = ARTICLES.find(a => a.id === openId)

  useEffect(() => {
    if (!openId) {
      injectJsonLD('ld-blog-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type':'ListItem', position:1, name:'Home',  item:'https://prep.arkaserve.com/' },
          { '@type':'ListItem', position:2, name:'Blog',  item:'https://prep.arkaserve.com/blog' },
        ],
      })
    }
    return () => { const el = document.getElementById('ld-blog-breadcrumb'); if (el) el.remove() }
  }, [openId])

  if (openArticle) return (
    <div className="min-h-screen bg-white" style={{ fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>
      <ArticleView article={openArticle} onBack={() => setOpenId(null)} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Exam Prep <span style={{color:'#FF653F'}}>Blog</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Strategy guides, syllabus breakdowns and study plans for banking and government exams — updated for 2025.
          </p>

          {/* Category filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === c ? 'text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
                style={filter === c ? { background:'#FF653F' } : {}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(a => (
            <ArticleCard key={a.id} article={a} onOpen={setOpenId} />
          ))}
        </div>

        {/* Internal links to exam pages */}
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-black text-gray-900 mb-3">Practice with Free Mock Tests</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Banking Exams', key:'exams-banking', icon:<BIcBank s={20}/> },
              { label:'Insurance Exams', key:'exams-insurance', icon:<BIcShield s={20}/> },
              { label:'Previous Papers', key:'papers', icon:<BIcDoc s={20}/> },
              { label:'Exam Cutoffs', key:'cutoffs', icon:<BIcChart s={20}/> },
            ].map(l => (
              <button key={l.key} onClick={() => onNav?.(l.key)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-center">
                <span className="text-xl">{l.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
