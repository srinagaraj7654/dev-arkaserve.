/* ══════════════════════════════════════════════════════════════════════════
   User data access — one function per place the website reads/writes its own data.
   SERVER_MODE (web + VITE_AUTH_MODE=server): calls the Node server (/api/me/*, /api/public/*), which
   scopes every query to the signed-in user. Otherwise (default, and always in the Android/iOS app):
   runs EXACTLY the Supabase query each page used before — so native behaviour is unchanged.
   Every function returns the same shape the old Supabase call returned ({ data, error } / { error }).
   The question/answer API (src/api.js) is not touched.
   ══════════════════════════════════════════════════════════════════════════ */
import axios from 'axios'
import { supabase, SERVER_MODE } from '../supabase.js'
import { AUTH_API, setServerUser } from '../auth/serverAuth.js'

const http = axios.create({ baseURL: AUTH_API, timeout: 60_000 })
http.interceptors.request.use(async (cfg) => {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
const asError = (e) => ({ message: e?.response?.data?.error || e?.message || 'Something went wrong' })
/** Run a server call and return { data, error } like supabase-js does. */
const call = async (fn, pick = (d) => d) => { try { const { data } = await fn(); return { data: pick(data), error: null } } catch (e) { return { data: null, error: asError(e) } } }

/* ── results ─────────────────────────────────────────────────────────── */
/** App.showResult — save a finished test. Same retry as before when the DB has no result_json column. */
export async function insertResult(payload) {
  if (SERVER_MODE) { const { student_id, ...row } = payload; const r = await call(() => http.post('/api/me/results', row)); return { error: r.error } }
  let { error } = await supabase.from('results').insert(payload)
  if (error && /result_json/.test(error.message || '')) {
    const { result_json, ...summary } = payload
    ;({ error } = await supabase.from('results').insert(summary))
    if (!error) console.warn('Saved result WITHOUT result_json — run the migration to enable question review.')
  }
  return { error }
}
/** Dashboard history (last 50). */
export function recentResults(userId, limit = 50) {
  if (SERVER_MODE) return call(() => http.get('/api/me/results', { params: { limit } }), (d) => d.results)
  return supabase.from('results').select('*').eq('student_id', userId).order('created_at', { ascending: false }).limit(limit)
}
/** US Exams progress (SAT/ACT, last 30). */
export function usExamResults(userId) {
  if (SERVER_MODE) return call(() => http.get('/api/me/results', { params: { limit: 30, examPrefixes: 'sat,act' } }), (d) => d.results)
  return supabase.from('results')
    .select('exam,total_score,max_score,percentage,correct_count,wrong_count,section_scores,weak_topics,exam_readiness,created_at')
    .eq('student_id', userId).or('exam.like.sat%,exam.like.act%').order('created_at', { ascending: false }).limit(30)
}
/** Prediction explainer — latest result for one exam. */
export async function latestResultForExam(userId, examId) {
  if (SERVER_MODE) {
    const r = await call(() => http.get('/api/me/results', { params: { limit: 1, exam: examId } }), (d) => d.results?.[0] || null)
    return r.data ? r : { data: null, error: r.error || { message: 'No results' } }
  }
  return supabase.from('results').select('*').eq('user_id', userId).eq('exam', examId).order('created_at', { ascending: false }).limit(1).single()
}
/** Dashboard "Delete my account": results + profile (same scope as before). */
export async function deleteMyData(userId) {
  if (SERVER_MODE) { const r = await call(() => http.delete('/api/me/data')); return { error: r.error } }
  await supabase.from('results').delete().eq('student_id', userId)
  await supabase.from('profiles').delete().eq('id', userId)
  return { error: null }
}

/* ── study plan ──────────────────────────────────────────────────────── */
/** Latest plan → { data: [row] | [] } (same shape as the old select). */
export function loadStudyPlan(userId) {
  if (SERVER_MODE) return call(() => http.get('/api/me/study-plan'), (d) => (d.plan ? [d.plan] : []))
  return supabase.from('study_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
}
/** Ticking tasks — save plan_json. */
export function saveStudyPlanJson(userId, planJson) {
  if (SERVER_MODE) return call(() => http.patch('/api/me/study-plan', { plan_json: planJson }))
  return supabase.from('study_plans').update({ plan_json: planJson }).eq('user_id', userId)
}
/** Create plan — replace the user's plan (delete + insert) → { data: insertedRow, error }. */
export async function replaceStudyPlan(userId, row) {
  if (SERVER_MODE) { const { user_id, created_at, ...plan } = row; return call(() => http.put('/api/me/study-plan', plan), (d) => d.plan) }
  await supabase.from('study_plans').delete().eq('user_id', userId)
  return supabase.from('study_plans').insert(row).select().single()
}

/* ── onboarding / profile ────────────────────────────────────────────── */
export function upsertOnboarding(row) {
  if (SERVER_MODE) { const { student_id, updated_at, ...fields } = row; return call(() => http.put('/api/me/onboarding', fields)) }
  return supabase.from('student_onboarding').upsert(row, { onConflict: 'student_id' })
}
export function upsertProfile(row) {
  if (SERVER_MODE) { const { id, ...fields } = row; return call(() => http.put('/api/me/profile', fields)) }
  return supabase.from('profiles').upsert(row, { onConflict: 'id' })
}

/* ── topic stats ─────────────────────────────────────────────────────── */
export function topicStats(userId) {
  if (SERVER_MODE) return call(() => http.get('/api/me/topic-stats'), (d) => d.stats)
  return supabase.from('student_topic_stats').select('topic, last_accuracy, attempts, correct, total_questions').eq('student_id', userId)
}

/* ── avatar ──────────────────────────────────────────────────────────── */
/** Upload a profile photo → { url, error }. Server mode: max 4 MB (the server saves avatar_url). */
export async function uploadAvatar(userId, file) {
  if (SERVER_MODE) {
    if (file.size > 4 * 1024 * 1024) return { url: null, error: { message: 'Image must be under 4 MB' } }
    const fd = new FormData(); fd.append('file', file)
    try { const { data } = await http.post('/api/me/avatar', fd); setServerUser(data.user); return { url: data.url, error: null } }
    catch (e) { return { url: null, error: asError(e) } }
  }
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
  if (upErr) return { url: null, error: upErr }
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
  return { url: publicUrl, error: null }
}

/* ── plan (subscription) ─────────────────────────────────────────────── */
/** SERVER_MODE only: the server reads `subscriptions` and stamps the plan; returns the up-to-date user. */
export async function syncPlanOnServer() {
  try { const { data } = await http.post('/api/me/plan-sync'); setServerUser(data.user); return data.user } catch { return null }
}

/* ── role fallback (when the access server is unreachable) ───────────── */
/** Old direct read of user_access. In SERVER_MODE roles come only from /api/me/access → null here. */
export function roleFromTable(userId) {
  if (SERVER_MODE) return Promise.resolve({ data: null, error: null })
  return supabase.from('user_access').select('role').eq('user_id', userId).single()
}

/* ── public pages (logged out) ───────────────────────────────────────── */
export function currentAffairs({ from, category, exam }) {
  if (SERVER_MODE) return call(() => http.get('/api/public/current-affairs', { params: { from, category, exam } }), (d) => d.items)
  let q = supabase.from('current_affairs').select('*').gte('date', from)
    .order('date', { ascending: false }).order('created_at', { ascending: false }).limit(200)
  if (category) q = q.eq('category', category)
  if (exam) q = q.contains('tags', [exam])
  return q
}
export async function currentAffairsCount(date) {
  if (SERVER_MODE) { const r = await call(() => http.get('/api/public/current-affairs', { params: { countDate: date } }), (d) => d.count); return { count: r.data, error: r.error } }
  return supabase.from('current_affairs').select('id', { count: 'exact', head: true }).eq('date', date)
}
export function previousPapers() {
  if (SERVER_MODE) return call(() => http.get('/api/public/previous-papers'), (d) => d.papers)
  return supabase.from('previous_papers').select('*').eq('is_published', true)
    .order('sort_order', { ascending: true }).order('year', { ascending: false })
}
