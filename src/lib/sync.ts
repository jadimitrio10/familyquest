/**
 * FamilyQuest Supabase Sync Service
 *
 * Strategy: localStorage as primary cache, Supabase as source of truth.
 * - On setup: push local data → Supabase
 * - On join:  pull Supabase data → localStorage
 * - On change: write to both
 * - On startup (known family): pull latest from Supabase → merge
 */

import { supabase } from './supabase'

export const FAMILY_ID_KEY = 'fq_family_id'
export const FAMILY_CODE_KEY = 'fq_family_code'

// ─── localStorage keys ──────────────────────────────────────────────────────
const LS = {
  members:     'fq_members_v2',
  tasks:       'fq_tasks_v2',
  completions: 'fq_task_completions',
  events:      'fq_events_v3',
  familyEvt:   'fq_family_events_v1',
  points:      'fq_points_v1',
  ptxHistory:  'fq_points_history_v1',
  rewards:     'fq_rewards_v1',
  settings:    'fq_settings',
  calPrefs:    'fq_calendar_prefs_v1',
}

function ls<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

// ─── Create new family ───────────────────────────────────────────────────────
export async function createFamily(name: string): Promise<{ id: string; code: string } | null> {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase()
  const { data, error } = await supabase
    .from('fq_families')
    .insert({ name, code })
    .select()
    .single()

  if (error) { console.error('createFamily:', error); return null }

  localStorage.setItem(FAMILY_ID_KEY, data.id)
  localStorage.setItem(FAMILY_CODE_KEY, code)
  return { id: data.id, code }
}

// ─── Join existing family ────────────────────────────────────────────────────
export async function joinFamily(code: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase
    .from('fq_families')
    .select()
    .eq('code', code.toUpperCase())
    .single()

  if (error || !data) { return null }

  localStorage.setItem(FAMILY_ID_KEY, data.id)
  localStorage.setItem(FAMILY_CODE_KEY, data.code)
  return { id: data.id, name: data.name }
}

// ─── Upload all local data to Supabase ───────────────────────────────────────
export async function uploadLocalData(familyId: string): Promise<void> {
  const members     = ls<any[]>(LS.members, [])
  const tasks       = ls<any[]>(LS.tasks, [])
  const completions = ls<Record<string, boolean>>(LS.completions, {})
  const events      = ls<any[]>(LS.events, [])
  const familyEvts  = ls<any[]>(LS.familyEvt, [])
  const balances    = ls<Record<string, number>>(LS.points, {})
  const txHistory   = ls<any[]>(LS.ptxHistory, [])
  const rewards     = ls<any[]>(LS.rewards, [])
  const settings    = ls<Record<string, unknown>>(LS.settings, {})
  const calPrefs    = ls<Record<string, unknown>>(LS.calPrefs, {})

  const run = async (table: string, rows: any[]) => {
    if (!rows.length) return
    await supabase.from(table).upsert(rows, { onConflict: 'id' })
  }

  // Members
  await run('fq_members', members.map(m => ({ ...m, family_id: familyId, bg_color:m.bgColor, text_color:m.textColor, bar_color:m.barColor, photo_data_url:m.photoDataUrl })))

  // Tasks
  await run('fq_tasks', tasks.map(t => ({
    id:t.id, family_id:familyId, title:t.title, emoji:t.emoji,
    member_id:t.memberId, done:t.done, type:t.type, priority:t.priority,
    due_date:t.dueDate, notes:t.notes, start_time:t.startTime,
    end_time:t.endTime, all_day:t.allDay??true, days_of_week:t.daysOfWeek,
    points:t.points??10,
  })))

  // Task completions
  const completionRows = Object.entries(completions).map(([id, completed]) => ({ id, family_id:familyId, completed }))
  await run('fq_task_completions', completionRows)

  // Calendar events
  await run('fq_calendar_events', events.map(e => ({
    id:e.id, family_id:familyId, title:e.title, emoji:e.emoji,
    member_id:e.memberId, date:e.date, start_time:e.startTime,
    end_time:e.endTime, all_day:e.allDay??true, completed:e.completed??false,
    recurrence:e.recurrence,
  })))

  // Family events
  await run('fq_family_events', familyEvts.map(fe => ({ ...fe, family_id:familyId })))

  // Points balances
  const balanceRows = Object.entries(balances).map(([member_id, balance]) => ({ member_id, family_id:familyId, balance }))
  if (balanceRows.length) await supabase.from('fq_points_balances').upsert(balanceRows, { onConflict: 'member_id,family_id' })

  // Points transactions
  await run('fq_points_transactions', txHistory.map(tx => ({ ...tx, family_id:familyId })))

  // Rewards
  await run('fq_rewards', rewards.map(r => ({ ...r, family_id:familyId, is_active:r.isActive??true, points_cost:r.pointsCost??50 })))

  // Settings
  await supabase.from('fq_settings').upsert({ family_id:familyId, settings, calendar_prefs:calPrefs }, { onConflict:'family_id' })

  console.log('✅ Local data uploaded to Supabase')
}

// ─── Download all data from Supabase → localStorage ─────────────────────────
export async function downloadFamilyData(familyId: string): Promise<void> {
  const [
    { data: members },
    { data: tasks },
    { data: completions },
    { data: events },
    { data: familyEvts },
    { data: balances },
    { data: txHistory },
    { data: rewards },
    { data: settingsRow },
    { data: family },
  ] = await Promise.all([
    supabase.from('fq_members').select().eq('family_id', familyId),
    supabase.from('fq_tasks').select().eq('family_id', familyId),
    supabase.from('fq_task_completions').select().eq('family_id', familyId),
    supabase.from('fq_calendar_events').select().eq('family_id', familyId),
    supabase.from('fq_family_events').select().eq('family_id', familyId),
    supabase.from('fq_points_balances').select().eq('family_id', familyId),
    supabase.from('fq_points_transactions').select().eq('family_id', familyId),
    supabase.from('fq_rewards').select().eq('family_id', familyId),
    supabase.from('fq_settings').select().eq('family_id', familyId).single(),
    supabase.from('fq_families').select().eq('id', familyId).single(),
  ])

  if (family?.data) localStorage.setItem(FAMILY_CODE_KEY, (family as any).data.code)

  // Transform back to localStorage format
  if (members?.length) {
    localStorage.setItem(LS.members, JSON.stringify(members.map((m:any) => ({
      id:m.id, name:m.name, emoji:m.emoji, photoDataUrl:m.photo_data_url,
      bgColor:m.bg_color, textColor:m.text_color, barColor:m.bar_color, role:m.role,
    }))))
  }

  if (tasks?.length) {
    localStorage.setItem(LS.tasks, JSON.stringify(tasks.map((t:any) => ({
      id:t.id, title:t.title, emoji:t.emoji, memberId:t.member_id,
      done:t.done, type:t.type, priority:t.priority, dueDate:t.due_date,
      notes:t.notes, startTime:t.start_time, endTime:t.end_time,
      allDay:t.all_day, daysOfWeek:t.days_of_week, points:t.points,
    }))))
  }

  if (completions?.length) {
    const map: Record<string, boolean> = {}
    completions.forEach((c:any) => { map[c.id] = c.completed })
    localStorage.setItem(LS.completions, JSON.stringify(map))
  }

  if (events?.length) {
    localStorage.setItem(LS.events, JSON.stringify(events.map((e:any) => ({
      id:e.id, title:e.title, emoji:e.emoji, memberId:e.member_id,
      date:e.date, startTime:e.start_time, endTime:e.end_time,
      allDay:e.all_day, completed:e.completed, recurrence:e.recurrence,
    }))))
  }

  if (familyEvts?.length) {
    localStorage.setItem(LS.familyEvt, JSON.stringify(familyEvts.map((fe:any) => ({
      id:fe.id, title:fe.title, emoji:fe.emoji, date:fe.date, endDate:fe.end_date, color:fe.color,
    }))))
  }

  if (balances?.length) {
    const map: Record<string, number> = {}
    balances.forEach((b:any) => { map[b.member_id] = b.balance })
    localStorage.setItem(LS.points, JSON.stringify(map))
  }

  if (txHistory?.length) {
    localStorage.setItem(LS.ptxHistory, JSON.stringify(txHistory))
  }

  if (rewards?.length) {
    localStorage.setItem(LS.rewards, JSON.stringify(rewards.map((r:any) => ({
      id:r.id, title:r.title, emoji:r.emoji, pointsCost:r.points_cost, isActive:r.is_active, createdAt:r.created_at,
    }))))
  }

  if ((settingsRow as any)?.data) {
    const s = (settingsRow as any).data
    if (s.settings) localStorage.setItem(LS.settings, JSON.stringify(s.settings))
    if (s.calendar_prefs) localStorage.setItem(LS.calPrefs, JSON.stringify(s.calendar_prefs))
  }

  console.log('✅ Family data downloaded from Supabase')
}

// ─── Push a single change ────────────────────────────────────────────────────
export async function pushChange(table: string, row: Record<string, unknown>, conflictCol = 'id') {
  const fid = localStorage.getItem(FAMILY_ID_KEY)
  if (!fid) return
  await supabase.from(table).upsert({ ...row, family_id: fid }, { onConflict: conflictCol })
}

export async function deleteRow(table: string, id: string) {
  await supabase.from(table).delete().eq('id', id)
}
