/**
 * FamilyQuest Supabase Sync Service
 * Uploads / downloads ALL app data between localStorage ↔ Supabase
 */

import { supabase } from './supabase'

export const FAMILY_ID_KEY   = 'fq_family_id'
export const FAMILY_CODE_KEY = 'fq_family_code'

// ── All localStorage keys ──────────────────────────────────────────────────
const LS = {
  members:    'fq_members_v2',
  tasks:      'fq_tasks_v2',
  completions:'fq_task_completions',
  events:     'fq_events_v3',
  familyEvts: 'fq_family_events_v1',
  points:     'fq_points_v1',
  ptxHistory: 'fq_points_history_v1',
  rewards:    'fq_rewards_v1',
  settings:   'fq_settings',
  calPrefs:   'fq_calendar_prefs_v1',
}

function ls<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback }
  catch { return fallback }
}

async function upsert(table: string, rows: Record<string, unknown>[], conflict = 'id') {
  if (!rows.length) return
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict })
  if (error) console.warn(`[sync] ${table}:`, error.message)
}

// ── CREATE FAMILY ─────────────────────────────────────────────────────────
export async function createFamily(name: string): Promise<{ id: string; code: string } | null> {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase()
  const { data, error } = await supabase
    .from('fq_families').insert({ name, code }).select().single()
  if (error) { console.error('createFamily:', error); return null }
  localStorage.setItem(FAMILY_ID_KEY, data.id)
  localStorage.setItem(FAMILY_CODE_KEY, code)
  return { id: data.id, code }
}

// ── JOIN FAMILY ───────────────────────────────────────────────────────────
export async function joinFamily(code: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase
    .from('fq_families').select().eq('code', code.toUpperCase().trim()).single()
  if (error || !data) return null
  localStorage.setItem(FAMILY_ID_KEY, data.id)
  localStorage.setItem(FAMILY_CODE_KEY, data.code)
  return { id: data.id, name: data.name }
}

// ── UPLOAD ALL LOCAL DATA → SUPABASE ──────────────────────────────────────
export async function uploadLocalData(familyId: string): Promise<void> {
  console.log('[sync] Uploading everything for family:', familyId)

  // 1. Members
  const members = ls<any[]>(LS.members, [])
  await upsert('fq_members', members.map(m => ({
    id: m.id, family_id: familyId,
    name: m.name || '', emoji: m.emoji || '👤',
    photo_data_url: m.photoDataUrl || null,
    bg_color: m.bgColor || '#FFE4E6',
    text_color: m.textColor || '#9F1239',
    bar_color: m.barColor || '#FB7185',
    role: m.role || 'child',
  })))

  // 2. Tasks
  const tasks = ls<any[]>(LS.tasks, [])
  await upsert('fq_tasks', tasks.map(t => ({
    id: t.id, family_id: familyId,
    title: t.title || '', emoji: t.emoji || '✅',
    member_id: t.memberId || null, done: t.done ?? false,
    type: t.type || 'once', priority: t.priority || 'medium',
    due_date: t.dueDate || null, notes: t.notes || null,
    start_time: t.startTime || null, end_time: t.endTime || null,
    all_day: t.allDay ?? true, days_of_week: t.daysOfWeek || null,
    points: t.points ?? 10,
  })))

  // 3. Task completions
  const completions = ls<Record<string, boolean>>(LS.completions, {})
  await upsert('fq_task_completions',
    Object.entries(completions).map(([id, completed]) => ({ id, family_id: familyId, completed }))
  )

  // 4. Calendar events
  const events = ls<any[]>(LS.events, [])
  await upsert('fq_calendar_events', events.map(e => ({
    id: e.id, family_id: familyId,
    title: e.title || '', emoji: e.emoji || null,
    member_id: e.memberId || null, date: e.date || '',
    start_time: e.startTime || null, end_time: e.endTime || null,
    all_day: e.allDay ?? true, completed: e.completed ?? false,
    recurrence: e.recurrence || null,
  })))

  // 5. Family events (header strip)
  const familyEvts = ls<any[]>(LS.familyEvts, [])
  await upsert('fq_family_events', familyEvts.map(fe => ({
    id: fe.id, family_id: familyId,
    title: fe.title || '', emoji: fe.emoji || '📌',
    date: fe.date || '', end_date: fe.endDate || null, color: fe.color || null,
  })))

  // 6. Points balances
  const balances = ls<Record<string, number>>(LS.points, {})
  if (Object.keys(balances).length) {
    await supabase.from('fq_points_balances').upsert(
      Object.entries(balances).map(([member_id, balance]) => ({ member_id, family_id: familyId, balance: balance ?? 0 })),
      { onConflict: 'member_id,family_id' }
    )
  }

  // 7. Points history
  const history = ls<any[]>(LS.ptxHistory, [])
  await upsert('fq_points_transactions', history.map(tx => ({
    id: tx.id, family_id: familyId,
    member_id: tx.memberId || '', amount: tx.amount ?? 0,
    reason: tx.reason || '', emoji: tx.emoji || '⭐',
    created_at: tx.createdAt || new Date().toISOString(),
  })))

  // 8. Rewards
  const rewards = ls<any[]>(LS.rewards, [])
  await upsert('fq_rewards', rewards.map(r => ({
    id: r.id, family_id: familyId,
    title: r.title || '', emoji: r.emoji || '🎁',
    points_cost: r.pointsCost ?? 50, is_active: r.isActive ?? true,
  })))

  // 9. Settings + calendar prefs
  const settings = ls<Record<string, unknown>>(LS.settings, {})
  const calPrefs  = ls<Record<string, unknown>>(LS.calPrefs, {})
  await supabase.from('fq_settings').upsert({
    family_id: familyId, settings, calendar_prefs: calPrefs,
  }, { onConflict: 'family_id' })

  console.log('[sync] ✅ Upload complete! members:', members.length, 'tasks:', tasks.length, 'events:', events.length)
}

// ── DOWNLOAD ALL DATA FROM SUPABASE → localStorage ─────────────────────────
export async function downloadFamilyData(familyId: string): Promise<void> {
  console.log('[sync] Downloading everything for family:', familyId)

  const [membersR, tasksR, completionsR, eventsR, famEvtsR, balR, histR, rewardsR, settR, famR] =
    await Promise.all([
      supabase.from('fq_members').select('*').eq('family_id', familyId),
      supabase.from('fq_tasks').select('*').eq('family_id', familyId),
      supabase.from('fq_task_completions').select('*').eq('family_id', familyId),
      supabase.from('fq_calendar_events').select('*').eq('family_id', familyId),
      supabase.from('fq_family_events').select('*').eq('family_id', familyId),
      supabase.from('fq_points_balances').select('*').eq('family_id', familyId),
      supabase.from('fq_points_transactions').select('*').eq('family_id', familyId),
      supabase.from('fq_rewards').select('*').eq('family_id', familyId),
      supabase.from('fq_settings').select('*').eq('family_id', familyId).single(),
      supabase.from('fq_families').select('*').eq('id', familyId).single(),
    ])

  if (famR.data) localStorage.setItem(FAMILY_CODE_KEY, famR.data.code)

  if (membersR.data?.length) {
    localStorage.setItem(LS.members, JSON.stringify(membersR.data.map((m: any) => ({
      id: m.id, name: m.name, emoji: m.emoji,
      photoDataUrl: m.photo_data_url || undefined,
      bgColor: m.bg_color, textColor: m.text_color, barColor: m.bar_color, role: m.role,
    }))))
  }

  if (tasksR.data?.length) {
    localStorage.setItem(LS.tasks, JSON.stringify(tasksR.data.map((t: any) => ({
      id: t.id, title: t.title, emoji: t.emoji, memberId: t.member_id,
      done: t.done, type: t.type, priority: t.priority,
      dueDate: t.due_date, notes: t.notes,
      startTime: t.start_time, endTime: t.end_time,
      allDay: t.all_day, daysOfWeek: t.days_of_week, points: t.points,
    }))))
  }

  if (completionsR.data?.length) {
    const map: Record<string, boolean> = {}
    completionsR.data.forEach((c: any) => { map[c.id] = c.completed })
    localStorage.setItem(LS.completions, JSON.stringify(map))
  }

  if (eventsR.data?.length) {
    localStorage.setItem(LS.events, JSON.stringify(eventsR.data.map((e: any) => ({
      id: e.id, title: e.title, emoji: e.emoji, memberId: e.member_id,
      date: e.date, startTime: e.start_time, endTime: e.end_time,
      allDay: e.all_day, completed: e.completed, recurrence: e.recurrence,
    }))))
  }

  if (famEvtsR.data?.length) {
    localStorage.setItem(LS.familyEvts, JSON.stringify(famEvtsR.data.map((fe: any) => ({
      id: fe.id, title: fe.title, emoji: fe.emoji,
      date: fe.date, endDate: fe.end_date, color: fe.color,
    }))))
  }

  if (balR.data?.length) {
    const map: Record<string, number> = {}
    balR.data.forEach((b: any) => { map[b.member_id] = b.balance })
    localStorage.setItem(LS.points, JSON.stringify(map))
  }

  if (histR.data?.length) {
    localStorage.setItem(LS.ptxHistory, JSON.stringify(histR.data.map((tx: any) => ({
      id: tx.id, memberId: tx.member_id, amount: tx.amount,
      reason: tx.reason, emoji: tx.emoji, createdAt: tx.created_at,
    }))))
  }

  if (rewardsR.data?.length) {
    localStorage.setItem(LS.rewards, JSON.stringify(rewardsR.data.map((r: any) => ({
      id: r.id, title: r.title, emoji: r.emoji,
      pointsCost: r.points_cost, isActive: r.is_active, createdAt: r.created_at,
    }))))
  }

  if (settR.data) {
    const s = settR.data as any

    // Merge settings: cloud wins for FAMILY data, local wins for DEVICE preferences
    // Device prefs (fontSize, theme, accentColor, language, silentHours, etc.) are
    // per-device and must not be overwritten by another device's cloud data.
    if (s.settings && Object.keys(s.settings).length > 0) {
      const DEVICE_ONLY_KEYS = [
        'fontSize','theme','accentColor','language',
        'silentHours','silentFrom','silentTo','twoFAEnabled',
      ]
      let local: Record<string,unknown> = {}
      try { local = JSON.parse(localStorage.getItem(LS.settings) || '{}') } catch {}

      const merged: Record<string,unknown> = { ...s.settings }
      for (const k of DEVICE_ONLY_KEYS) {
        if (k in local) merged[k] = local[k]   // keep local device value
      }
      localStorage.setItem(LS.settings, JSON.stringify(merged))
      window.dispatchEvent(new Event('fq:settings'))   // notify all useAppSettings hooks
    }

    // Calendar prefs are also device-local (defaultView, etc.)
    if (s.calendar_prefs && Object.keys(s.calendar_prefs).length > 0) {
      const CAL_DEVICE_KEYS = ['defaultView']
      let localCal: Record<string,unknown> = {}
      try { localCal = JSON.parse(localStorage.getItem(LS.calPrefs) || '{}') } catch {}

      const mergedCal: Record<string,unknown> = { ...s.calendar_prefs }
      for (const k of CAL_DEVICE_KEYS) {
        if (k in localCal) mergedCal[k] = localCal[k]
      }
      localStorage.setItem(LS.calPrefs, JSON.stringify(mergedCal))
      window.dispatchEvent(new Event('fq:calprefs'))   // notify all useCalendarPrefs hooks
    }
  }

  console.log('[sync] ✅ Download complete! members:', membersR.data?.length ?? 0,
    'tasks:', tasksR.data?.length ?? 0, 'events:', eventsR.data?.length ?? 0)
}
