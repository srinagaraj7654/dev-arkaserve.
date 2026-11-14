import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const isNative = Capacitor.isNativePlatform()

export const NOTIF_IDS = {
  STUDY_REMINDER:    1001,
  STREAK_REMINDER:   1002,
  IDLE_NUDGE:        3001,
  EXAM_DAILY_AM:     2001,  // daily 8 AM countdown
  EXAM_DAILY_PM:     2002,  // daily 7 PM countdown
  EXAM_MILESTONE_7:  2003,  // 7 days before
  EXAM_MILESTONE_3:  2004,  // 3 days before
  EXAM_MILESTONE_1:  2005,  // 1 day before
}

const PREFS_KEY = 'mt_notif_prefs'

const DEFAULTS = {
  enabled:           true,
  studyReminder:     true,
  studyReminderHour: 8,
  studyReminderMin:  0,
  streakReminder:    true,
  examCountdown:     true,
  idleNudge:         true,
}

export const getPrefs = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } }
  catch { return { ...DEFAULTS } }
}

export const savePrefs = (p) => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {}
}

async function createChannels() {
  try {
    await LocalNotifications.createChannel({ id: 'study', name: 'Study Reminders', importance: 4, vibration: true })
    await LocalNotifications.createChannel({ id: 'exam',  name: 'Exam Alerts',     importance: 5, vibration: true })
  } catch {}
}

export async function requestPermission() {
  if (!isNative) return false
  try {
    const { display } = await LocalNotifications.requestPermissions()
    return display === 'granted'
  } catch { return false }
}

export async function cancelAll() {
  if (!isNative) return
  try {
    const { notifications } = await LocalNotifications.getPending()
    if (notifications?.length) {
      await LocalNotifications.cancel({ notifications: notifications.map(n => ({ id: n.id })) })
    }
  } catch {}
}

function nextOccurrence(hour, min) {
  const d = new Date()
  d.setHours(hour, min, 0, 0)
  if (d <= new Date()) d.setDate(d.getDate() + 1)
  return d
}

export async function scheduleAll(prefs, examDate, examName) {
  if (!isNative) return
  const p = prefs || getPrefs()
  await cancelAll()
  if (!p.enabled) return

  const notifs = []

  if (p.studyReminder) {
    notifs.push({
      id: NOTIF_IDS.STUDY_REMINDER,
      title: '📚 Time to Study!',
      body: 'Your daily practice session is waiting. Stay consistent!',
      schedule: { at: nextOccurrence(p.studyReminderHour, p.studyReminderMin), repeats: true, every: 'day', allowWhileIdle: true },
      channelId: 'study',
    })
  }

  if (p.streakReminder) {
    notifs.push({
      id: NOTIF_IDS.STREAK_REMINDER,
      title: "🔥 Don't Break Your Streak!",
      body: "Haven't studied today? Take 5 quick questions to keep it alive.",
      schedule: { at: nextOccurrence(20, 0), repeats: true, every: 'day', allowWhileIdle: true },
      channelId: 'study',
    })
  }

  if (p.examCountdown && examDate && examName) {
    const eDate = typeof examDate === 'string' ? new Date(examDate) : examDate
    const now = new Date()
    const examDateStr = eDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    // Daily 8 AM morning reminder
    const amTrigger = nextOccurrence(8, 0)
    if (amTrigger < eDate) {
      notifs.push({
        id: NOTIF_IDS.EXAM_DAILY_AM,
        title: `📚 ${examName} Countdown`,
        body: `Morning study session — exam on ${examDateStr}. Keep the momentum!`,
        schedule: { at: amTrigger, repeats: true, every: 'day', allowWhileIdle: true },
        channelId: 'exam',
      })
    }

    // Daily 7 PM evening reminder
    const pmTrigger = nextOccurrence(19, 0)
    if (pmTrigger < eDate) {
      notifs.push({
        id: NOTIF_IDS.EXAM_DAILY_PM,
        title: `🌙 Evening Prep — ${examName}`,
        body: `Evening revision time! ${examDateStr} is coming up. One topic tonight?`,
        schedule: { at: pmTrigger, repeats: true, every: 'day', allowWhileIdle: true },
        channelId: 'exam',
      })
    }

    // Milestone one-shots: 7, 3, 1 days before
    const milestones = [
      { id: NOTIF_IDS.EXAM_MILESTONE_7, days: 7, title: `📅 ${examName} in 7 days`,   body: "Step up your prep — take 2 full mocks this week!" },
      { id: NOTIF_IDS.EXAM_MILESTONE_3, days: 3, title: `🎯 ${examName} in 3 days`,   body: "3 days to go. One timed full mock + review mistakes." },
      { id: NOTIF_IDS.EXAM_MILESTONE_1, days: 1, title: `🔔 ${examName} is TOMORROW`, body: "Rest well. Stay calm. Trust your preparation!" },
    ]
    for (const m of milestones) {
      const at = new Date(eDate)
      at.setDate(at.getDate() - m.days)
      at.setHours(9, 0, 0, 0)
      if (at > now) {
        notifs.push({ id: m.id, title: m.title, body: m.body, schedule: { at, allowWhileIdle: true }, channelId: 'exam' })
      }
    }
  }

  if (p.idleNudge) {
    const at = new Date()
    at.setDate(at.getDate() + 3)
    at.setHours(10, 0, 0, 0)
    notifs.push({
      id: NOTIF_IDS.IDLE_NUDGE,
      title: "👀 You've been away 3 days",
      body: "Your peers have taken 5+ mocks. Jump back in!",
      schedule: { at, allowWhileIdle: true },
      channelId: 'study',
    })
  }

  if (notifs.length) {
    try { await LocalNotifications.schedule({ notifications: notifs }) }
    catch (e) { console.error('notif schedule error', e) }
  }
}

export async function rescheduleIdleNudge() {
  if (!isNative) return
  const p = getPrefs()
  if (!p.enabled || !p.idleNudge) return
  try {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_IDS.IDLE_NUDGE }] })
    const at = new Date()
    at.setDate(at.getDate() + 3)
    at.setHours(10, 0, 0, 0)
    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIF_IDS.IDLE_NUDGE,
        title: "👀 You've been away 3 days",
        body: "Your peers have taken 5+ mocks. Jump back in!",
        schedule: { at, allowWhileIdle: true },
        channelId: 'study',
      }],
    })
  } catch {}
}

export async function initNotifications(examDate, examName) {
  if (!isNative) return
  await createChannels()
  const granted = await requestPermission()
  if (!granted) return
  await scheduleAll(getPrefs(), examDate, examName)
}
