import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { usePointsStore } from '@/hooks/usePointsStore'
import { CelebrationOverlay } from '@/components/shared/CelebrationOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import type { CalendarPrefs } from '@/hooks/useCalendarPrefs'
import { useT, T } from '@/lib/i18n'
import { CalendarTopBar, type MemberStat, type ViewMode } from './CalendarTopBar'
import { MemberChip } from './MemberChip'
import { AddEventModal } from './AddEventModal'
import { EventDetailModal } from './EventDetailModal'
import { NextWeekColumn } from './NextWeekColumn'
import { useCalendarStore } from '@/hooks/useCalendarStore'
import { type CalendarEvent, type CalendarMember } from '@/types/calendar.types'
import type { Member } from '@/hooks/useMembersStore'
import { addDays, format } from 'date-fns'
import { Check } from 'lucide-react'
import { AnimatePresence as AP2 } from 'framer-motion'

// ── Monday of current week ──
function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0,0,0,0)
  return m
}

// ── Per-day task completions ──
const TASKS_KEY       = 'fq_tasks_v2'
const COMPLETIONS_KEY = 'fq_task_completions'
function loadCompletions(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(COMPLETIONS_KEY) ?? '{}') } catch { return {} }
}
function saveCompletions(c: Record<string, boolean>) {
  try { localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(c)) } catch {}
}

interface StoredTask {
  id:string; title:string; emoji:string; memberId:string
  type:'fixed'|'once'; done:boolean; dueDate?:string
  startTime?:string; endTime?:string; allDay?:boolean
  daysOfWeek?: number[]  // 0=Mon 1=Tue...6=Sun; undefined = every day
  points?: number
}

function loadTaskEvents(weekDates: string[]): CalendarEvent[] {
  try {
    const tasks: StoredTask[] = JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]')
    const completions = loadCompletions()
    const events: CalendarEvent[] = []

    for (const t of tasks) {
      const isAllDay = t.allDay !== false ? !t.startTime : false
      const makeEvent = (date: string, key: string): CalendarEvent => ({
        id: `task:${key}`,
        title: t.title, emoji: t.emoji,
        memberId: t.memberId, date,
        allDay: isAllDay,
        startTime: t.startTime,
        endTime: t.endTime,
        completed: completions[key] ?? false,
      })

      if (t.type === 'fixed') {
        for (const date of weekDates) {
          // Check if this date's day-of-week is in the task's schedule
          // date = 'YYYY-MM-DD'; dayOfWeek 0=Mon...6=Sun
          if (t.daysOfWeek && t.daysOfWeek.length > 0) {
            const d = new Date(date + 'T12:00:00')
            const jsDay = d.getDay()  // 0=Sun...6=Sat
            // Convert JS day to our Mon-based 0-6: Mon=0,Tue=1,...Sun=6
            const ourDay = jsDay === 0 ? 6 : jsDay - 1
            if (!t.daysOfWeek.includes(ourDay)) continue
          }
          const key = `${t.id}:${date}`
          events.push(makeEvent(date, key))
        }
      } else if (t.type === 'once' && t.dueDate && weekDates.includes(t.dueDate)) {
        const key = `${t.id}:${t.dueDate}`
        events.push({ ...makeEvent(t.dueDate, key), completed: completions[key] ?? t.done })
      }
    }
    return events
  } catch { return [] }
}

// ── Kinship pastel palette (from Stitch Miller Family HTML) ──
const KINSHIP = [
  { bg:'#F9D2D2', text:'#7A2222', bar:'#D47070' }, // pink
  { bg:'#D4F1EE', text:'#1A6B64', bar:'#5ABAB3' }, // mint
  { bg:'#E2D6F3', text:'#5B3A8B', bar:'#A080D4' }, // lavender
  { bg:'#C5E5F1', text:'#1A5C7A', bar:'#5BB4D4' }, // sky
  { bg:'#D9EAD3', text:'#2E5E2A', bar:'#70B870' }, // sage
  { bg:'#FAE0C8', text:'#7A3A18', bar:'#D48A50' }, // peach
  { bg:'#FDE8F0', text:'#8B2252', bar:'#D470A0' }, // rose
  { bg:'#FEF3C7', text:'#7A5A00', bar:'#D4B050' }, // yellow
]

// Color by TITLE — so each task gets its own consistent color
function colorForTitle(title: string) {
  const h = [...title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0)
  return KINSHIP[h % KINSHIP.length]
}

// Color by MEMBER — for member-colored elements
function colorForMember(member: RichMember) {
  if (member.bgColor) return { bg: member.bgColor, text: member.textColor, bar: member.barColor }
  const h = [...member.id].reduce((a, c) => a + c.charCodeAt(0), 0)
  return KINSHIP[h % KINSHIP.length]
}

// ── Hours to show in time axis ──
const HOURS = [8,9,10,11,12,13,14,15,16,17,18,19,20]
const HOUR_H = 90 // px per hour

function timeToY(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h - HOURS[0]) * HOUR_H + (m / 60) * HOUR_H
}

function timeToHeight(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh*60+em) - (sh*60+sm)
  return Math.max((mins / 60) * HOUR_H, 32)
}

// ── Overlap layout — places simultaneous events side-by-side ──
interface PositionedEvent {
  event: CalendarEvent
  col: number     // 0-based column index in this overlap group
  totalCols: number
}

function layoutTimedEvents(events: CalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) return []

  // Convert time to minutes for comparison
  const toMins = (t: string) => { const [h,m]=t.split(':').map(Number); return h*60+m }

  const sorted = [...events].sort((a,b) =>
    toMins(a.startTime!) - toMins(b.startTime!)
  )

  const result: PositionedEvent[] = []
  // Groups of overlapping events
  const groups: CalendarEvent[][] = []

  for (const ev of sorted) {
    const start = toMins(ev.startTime!)
    const end   = ev.endTime ? toMins(ev.endTime) : start + 60

    // Find a group this event overlaps with
    let placed = false
    for (const group of groups) {
      // Check if this event overlaps any event in the group
      const overlaps = group.some(g => {
        const gs = toMins(g.startTime!)
        const ge = g.endTime ? toMins(g.endTime) : gs + 60
        return start < ge && end > gs
      })
      if (overlaps) { group.push(ev); placed = true; break }
    }
    if (!placed) groups.push([ev])
  }

  // For each group, assign columns
  for (const group of groups) {
    const total = group.length
    group.forEach((ev, idx) => {
      result.push({ event: ev, col: idx, totalCols: total })
    })
  }

  return result
}

// ── Family events storage ──
const FAMILY_EVENTS_KEY = 'fq_family_events_v1'
export interface FamilyEvent {
  id: string
  title: string
  emoji: string
  date: string       // 'YYYY-MM-DD'
  endDate?: string
  color?: string
}
function loadFamilyEvents(): FamilyEvent[] {
  try { return JSON.parse(localStorage.getItem(FAMILY_EVENTS_KEY) ?? '[]') } catch { return [] }
}
function saveFamilyEvents(evs: FamilyEvent[]) {
  try { localStorage.setItem(FAMILY_EVENTS_KEY, JSON.stringify(evs)) } catch {}
}

type RichMember = CalendarMember & { emoji:string; photoDataUrl?:string }

function toRichMembers(members: Member[]): RichMember[] {
  return members.map(m => ({
    id:m.id, name:m.name, avatar:m.emoji, avatarUrl:m.photoDataUrl,
    emoji:m.emoji, photoDataUrl:m.photoDataUrl,
    bgColor:m.bgColor, textColor:m.textColor, barColor:m.barColor,
    bgVar:'', textVar:'', barVar:'',
  }))
}

// Day labels are computed dynamically inside the component using useT()

// ══════════════════════════════════════════════════════════
export function CalendarView({ members: rawMembers, calPrefs }: { members?: Member[]; calPrefs?: CalendarPrefs }) {
  const [activeMember, setActiveMember]   = useState<string|null>(null)
  const [showAdd, setShowAdd]             = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent|null>(null)
  const [weekOffset, setWeekOffset]       = useState(0)
  const [dayOffset, setDayOffset]         = useState(0)   // for day view
  const [tick, setTick]                   = useState(0)
  // View mode — initialized from calPrefs.defaultView, user can override in the header
  const [viewMode, setViewMode] = useState<ViewMode>((calPrefs?.defaultView as ViewMode) ?? 'week')

  // Sync viewMode whenever calPrefs.defaultView changes (e.g. changed in Settings)
  useEffect(() => {
    if (calPrefs?.defaultView) setViewMode(calPrefs.defaultView as ViewMode)
  }, [calPrefs?.defaultView])

  // Family events
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>(loadFamilyEvents)
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  useEffect(() => { saveFamilyEvents(familyEvents) }, [familyEvents])

  // Celebration state
  const [celebration, setCelebration] = useState<{
    memberName: string; memberEmoji: string; memberColor: string
    memberAccent: string; memberPhoto?: string
    points: number; taskTitle: string; taskEmoji: string
  } | null>(null)

  // No interval — tick only increments on user action (task toggle)
  // A 2-second interval was causing continuous re-renders and jitter

  const { events:calEvents, toggleEvent, addEvent, deleteEvent, updateEvent } = useCalendarStore()
  const { awardPoints, removePoints } = usePointsStore()
  const MEMBERS = useMemo(() => rawMembers ? toRichMembers(rawMembers) : [], [rawMembers])
  const { t, lang } = useT()
  const DAY_LABELS = [...T.cal.days.short[lang]] as string[]

  const weekStart  = addDays(getMondayOfWeek(new Date()), weekOffset * 7)
  const weekDays   = DAY_LABELS.map((label, i) => {
    const d = addDays(weekStart, i)
    return { date:format(d,'yyyy-MM-dd'), num:d.getDate(), label, isToday:format(d,'yyyy-MM-dd')===format(new Date(),'yyyy-MM-dd') }
  })
  const weekDates  = weekDays.map(d => d.date)
  const taskEvents = useMemo(() => loadTaskEvents(weekDates), [weekDates.join(','), tick])

  const calIds    = new Set(calEvents.map(e => e.id))
  const allEvents = [...calEvents, ...taskEvents.filter(t => !calIds.has(t.id))]

  const eventsForDay = (date: string) =>
    (activeMember ? allEvents.filter(e => e.memberId===activeMember) : allEvents).filter(e => e.date===date)

  function handleToggle(id: string) {
    if (id.startsWith('task:')) {
      const rest = id.slice('task:'.length)         // "{taskId}:{date}"
      const taskId = rest.split(':')[0]
      const completions = loadCompletions()
      const wasCompleted = completions[rest] ?? false
      const nowCompleted = !wasCompleted
      completions[rest] = nowCompleted
      saveCompletions(completions)
      setTick(n => n+1)

      // Award / remove points
      try {
        const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]')
        const task = tasks.find((t: any) => t.id === taskId)
        if (task) {
          const txId = `tx-${rest}`
          if (nowCompleted) {
            // Award points
            if (task.points > 0) {
              awardPoints(task.memberId, task.points, task.title, task.emoji || '⭐', txId)
            }
            // Show celebration overlay!
            const member = MEMBERS.find(m => m.id === task.memberId)
            if (member) {
              setCelebration({
                memberName:   member.name,
                memberEmoji:  member.emoji || member.avatar || '👤',
                memberColor:  member.bgColor,
                memberAccent: member.barColor,
                memberPhoto:  member.photoDataUrl,
                points:       task.points || 0,
                taskTitle:    task.title,
                taskEmoji:    task.emoji || '✅',
              })
            }
          } else {
            if (task.points > 0) removePoints(task.memberId, task.points, txId)
          }
        }
      } catch {}
    } else {
      toggleEvent(id)
    }
  }

  // Current time position
  const now = new Date()
  const currentTimeY = now.getHours() >= HOURS[0] && now.getHours() <= HOURS[HOURS.length-1]
    ? (now.getHours() - HOURS[0]) * HOUR_H + (now.getMinutes()/60)*HOUR_H
    : -1

  const nextLabel = `${format(addDays(weekStart,7),'MMM d')}–${format(addDays(weekStart,13),'MMM d')}`

  // ── Per-member stats for TODAY (shown in member chips) ──────────────────
  const memberStats = useMemo((): Record<string, MemberStat> => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const stats: Record<string, MemberStat> = {}
    for (const ev of allEvents) {
      if (!ev.memberId || ev.date !== today) continue
      if (!stats[ev.memberId]) stats[ev.memberId] = { done: 0, total: 0 }
      stats[ev.memberId].total++
      if (ev.completed) stats[ev.memberId].done++
    }
    return stats
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, tick])

  // Apply showWeekends preference: if disabled, hide Sat(5) and Sun(6)
  const showWeekends = calPrefs?.showWeekends !== false
  const visibleDays  = showWeekends ? weekDays : weekDays.filter(d => {
    const jsDay = new Date(d.date + 'T12:00:00').getDay()
    return jsDay !== 0 && jsDay !== 6   // hide Sun(0) and Sat(6)
  })

  // Layout: up to 4 days per row
  const row1 = visibleDays.slice(0, 4)
  const row2 = visibleDays.slice(4, showWeekends ? 7 : visibleDays.length)
  const gridCols1 = `80px repeat(${row1.length}, 1fr)`
  const gridCols2 = `80px repeat(${row2.length}, 1fr)${showWeekends ? '' : ''}`

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--bg)' }}>
      <CalendarTopBar
        weekStart={weekStart}
        weekEnd={addDays(weekStart,6)}
        onAddEvent={() => setShowAdd(true)}
        onPrev={() => viewMode==='day' ? setDayOffset(o=>o-1) : setWeekOffset(o => o-1)}
        onNext={() => viewMode==='day' ? setDayOffset(o=>o+1) : setWeekOffset(o => o+1)}
        activeMember={activeMember}
        onToggleMember={(id) => setActiveMember(prev => prev === id || id === '' ? null : id)}
        familyEvents={familyEvents}
        onEditFamilyEvents={() => setShowFamilyModal(true)}
        memberStats={memberStats}
        viewMode={viewMode}
        onViewChange={v => {
          if (v === 'month' || v === 'agenda') { toast('Próximamente 🚀'); return }
          setViewMode(v)
        }}
        rangeLabel={viewMode==='day' ? format(addDays(new Date(), dayOffset + weekOffset*7), 'EEE, MMM d') : undefined}
      />

      {/* ── DAY VIEW ─────────────────────────────────────────────────────── */}
      {viewMode === 'day' && (() => {
        const dayDate = addDays(new Date(), dayOffset + weekOffset*7)
        const dayStr  = format(dayDate, 'yyyy-MM-dd')
        const isToday = dayStr === format(new Date(), 'yyyy-MM-dd')
        const dayLabel = { date:dayStr, num:dayDate.getDate(), label:format(dayDate,'EEE').toUpperCase(), isToday }
        const dayEvents = eventsForDay(dayStr)
        return (
          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', margin:'0 12px 0' }}>
            <AnimatePresence mode="wait">
              <motion.div key={`day-${dayStr}`}
                initial={{ opacity:0, x: dayOffset>0?20:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.18 }}
                style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#fff', borderRadius:'14px 14px 0 0', border:'1px solid #EEE8E0', borderBottom:'none' }}
              >
                {/* Single day header */}
                <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', borderBottom:'1px solid #EEE8E0' }}>
                  <div style={{ padding:'12px 8px' }} />
                  <DayHeader day={dayLabel} />
                </div>
                {/* Single day time grid */}
                <div style={{ flex:1, overflowY:'auto' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', height: HOURS.length*HOUR_H, position:'relative' }}>
                    {currentTimeY >= 0 && (
                      <div style={{ position:'absolute', left:80, right:0, top:currentTimeY, height:2, background:'#F87171', zIndex:20, pointerEvents:'none' }}>
                        <div style={{ position:'absolute', left:-4, top:-3, width:8, height:8, borderRadius:'50%', background:'#F87171' }} />
                      </div>
                    )}
                    <TimeAxis />
                    <TimeColumn events={dayEvents} members={MEMBERS} onToggle={handleToggle} onEventClick={setSelectedEvent} colIndex={0} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )
      })()}

      {/* Calendar body — WEEK VIEW */}
      {viewMode !== 'day' && <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', margin:'0 12px 0' }}>
        <AnimatePresence mode="wait">
          <motion.div key={weekOffset}
            initial={{ opacity:0, x:weekOffset>0?20:-20 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:weekOffset>0?-20:20 }}
            transition={{ duration:0.20, ease:'easeInOut' }}
            style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#fff', borderRadius:'14px 14px 0 0', border:'1px solid #EEE8E0', borderBottom:'none' }}
          >
            {/* ── Day headers ── */}
            <div style={{ display:'grid', gridTemplateColumns:gridCols1, borderBottom:'1px solid #EEE8E0' }}>
              <div style={{ padding:'12px 8px' }} />
              {row1.map(day => <DayHeader key={day.date} day={day} />)}
            </div>

            {/* ── ROW 1: Time grid ── */}
            <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
              <div style={{ display:'grid', gridTemplateColumns:gridCols1, height: HOURS.length*HOUR_H, position:'relative' }}>
                {/* Current time line */}
                {currentTimeY >= 0 && (
                  <div style={{ position:'absolute', left:80, right:0, top:currentTimeY, height:2, background:'#F87171', zIndex:20, pointerEvents:'none' }}>
                    <div style={{ position:'absolute', left:-4, top:-3, width:8, height:8, borderRadius:'50%', background:'#F87171' }} />
                  </div>
                )}

                {/* Time axis */}
                <TimeAxis />

                {/* Day columns */}
                {row1.map((day,i) => (
                  <TimeColumn key={day.date} events={eventsForDay(day.date)} members={MEMBERS}
                    onToggle={handleToggle} onEventClick={setSelectedEvent} colIndex={i} />
                ))}
              </div>

              {/* ── ROW 2 header ── */}
              {row2.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:`80px repeat(${row2.length},1fr)${showWeekends?' 1fr':''}`, borderTop:'2px solid #EEE8E0', borderBottom:'1px solid #EEE8E0', background:'var(--bg)' }}>
                  <div style={{ padding:'12px 8px' }} />
                  {row2.map(day => <DayHeader key={day.date} day={day} />)}
                  {showWeekends && (
                    <div style={{ padding:'12px 8px' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'var(--font-body)' }}>Next</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── ROW 2 body ── */}
              {row2.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:`80px repeat(${row2.length},1fr)${showWeekends?' 1fr':''}`, height:HOURS.length*HOUR_H*0.7, position:'relative' }}>
                  <TimeAxis compact />
                  {row2.map((day,i) => (
                    <TimeColumn key={day.date} events={eventsForDay(day.date)} members={MEMBERS}
                      onToggle={handleToggle} onEventClick={setSelectedEvent} colIndex={i+4} compact />
                  ))}
                  {showWeekends && (
                    <div style={{ borderLeft:'1px solid #EEE8E0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:16, background:'#FAFAFA' }}>
                      <NextWeekColumn dateRange={nextLabel} onGoNext={() => setWeekOffset(o=>o+1)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>}

      {/* FAB */}
      <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
        style={{ position:'fixed', bottom:24, right:24, width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#E07B8A,#D45C6B)', color:'#fff', border:'none', cursor:'pointer', boxShadow:'0 6px 20px rgba(224,123,138,0.45)', zIndex:40, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
        +
      </motion.button>

      <AddEventModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addEvent} />
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)}
        onDelete={(id) => { deleteEvent(id); setSelectedEvent(null) }}
        onUpdate={updateEvent} onToggle={handleToggle} />

      {/* 📌 Family Events Modal */}
      {showFamilyModal && (
        <FamilyEventsModal
          events={familyEvents}
          onAdd={(ev) => setFamilyEvents(prev => [...prev, ev])}
          onRemove={(id) => setFamilyEvents(prev => prev.filter(e => e.id !== id))}
          onClose={() => setShowFamilyModal(false)}
        />
      )}

      {/* 🎉 Celebration overlay — shows when task is completed */}
      <CelebrationOverlay
        show={!!celebration}
        memberName={celebration?.memberName ?? ''}
        memberEmoji={celebration?.memberEmoji ?? '👤'}
        memberColor={celebration?.memberColor ?? '#FFE4E6'}
        memberAccent={celebration?.memberAccent ?? '#FB7185'}
        memberPhoto={celebration?.memberPhoto}
        points={celebration?.points ?? 0}
        taskTitle={celebration?.taskTitle ?? ''}
        taskEmoji={celebration?.taskEmoji ?? '✅'}
        onDone={() => setCelebration(null)}
      />
    </div>
  )
}

// ── Day header cell ──
function DayHeader({ day }: { day: { label:string; num:number; isToday:boolean; date:string } }) {
  return (
    <div style={{ padding:'12px 12px 10px', textAlign:'center', borderRight:'1px solid #EEE8E0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        <span style={{ fontSize:11, fontWeight:600, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'var(--font-body)' }}>
          {day.label}
        </span>
        {day.isToday ? (
          <span style={{ width:26, height:26, borderRadius:'50%', background:'#F87171', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-serif)', fontSize:15, fontWeight:700 }}>
            {day.num}
          </span>
        ) : (
          <span style={{ fontSize:18, fontWeight:700, color:'#2D3748', fontFamily:'var(--font-serif)' }}>
            {day.num}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Time axis column ──
function TimeAxis({ compact }: { compact?: boolean }) {
  const hours = compact ? HOURS.filter((_,i) => i % 2 === 0) : HOURS
  return (
    <div style={{ position:'relative' }}>
      {HOURS.map(h => (
        <div key={h} style={{ height:HOUR_H*(compact?1.4:1), display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:'4px 10px 0', color:'#A0AEC0', fontSize:11, fontWeight:500, fontFamily:'var(--font-body)' }}>
          {(!compact || h % 2 === 0) && `${h > 12 ? h-12 : h} ${h >= 12 ? 'PM' : 'AM'}`}
        </div>
      ))}
    </div>
  )
}

// ── Timed column with absolute-positioned events ──
function TimeColumn({ events, members, onToggle, onEventClick, colIndex, compact }: {
  events: CalendarEvent[]
  members: RichMember[]
  onToggle: (id:string) => void
  onEventClick: (e:CalendarEvent) => void
  colIndex: number
  compact?: boolean
}) {
  const allDayEvents  = events.filter(e => e.allDay || (!e.startTime))
  const timedEvents   = events.filter(e => !e.allDay && e.startTime)
  const totalH = HOURS.length * HOUR_H * (compact ? 1.4 : 1)

  return (
    <div style={{ borderRight:'1px solid #EEE8E0', position:'relative', height:totalH, overflow:'hidden' }}>
      {/* Hour grid lines */}
      {HOURS.map(h => (
        <div key={h} style={{ position:'absolute', left:0, right:0, top:(h-HOURS[0])*HOUR_H*(compact?1.4:1), height:1, background:'rgba(0,0,0,0.04)' }} />
      ))}

      {/* All-day events (tasks) — stacked at top, each with its own color */}
      <div style={{ padding:'4px 4px 0' }}>
        {allDayEvents.map((event, i) => {
          const member = members.find(m => m.id===event.memberId)
          if (!member) return null
          // COLOR BY TITLE — every task title gets its own consistent Kinship color
          const colors = colorForTitle(event.title)
          const bg    = colors.bg
          const textC = colors.text
          const barC  = colors.bar
          return (
            <motion.div key={event.id}
              initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:colIndex*0.03+i*0.03 }}
              onClick={() => onEventClick(event)}
              style={{
                background: event.completed ? '#F0FDF4' : bg,
                borderRadius:12, padding:'7px 8px 7px', marginBottom:5,
                border: event.completed ? '1.5px solid #86EFAC' : '1px solid rgba(255,255,255,0.65)',
                cursor:'pointer',
                boxShadow:'0 1px 5px rgba(0,0,0,0.06)',
                transition:'all 0.2s',
              }}
              whileHover={{ filter:'brightness(0.97)' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {/* Big tap-target check button */}
                <motion.button
                  onClick={e=>{e.stopPropagation();onToggle(event.id)}}
                  whileTap={{ scale:0.75 }}
                  animate={{ scale: event.completed ? [1.2, 1] : 1 }}
                  style={{
                    width:22, height:22, borderRadius:'50%', flexShrink:0,
                    border: event.completed ? 'none' : `2px solid ${barC}`,
                    background: event.completed ? '#22C55E' : 'rgba(255,255,255,0.70)',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'background 0.2s, border 0.2s',
                    boxShadow: event.completed ? '0 2px 6px rgba(34,197,94,0.35)' : 'none',
                  }}
                >
                  {event.completed && <Check size={13} color="#fff" strokeWidth={3} />}
                </motion.button>

                {/* Title — strikethrough when done */}
                <p style={{
                  fontWeight: event.completed ? 500 : 700,
                  fontSize:12, lineHeight:1.2,
                  fontFamily:'var(--font-heading)', flex:1,
                  color: event.completed ? '#86EFAC' : textC,
                  textDecoration: event.completed ? 'line-through' : 'none',
                  textDecorationColor: '#22C55E',
                  textDecorationThickness: '2px',
                  transition:'all 0.2s',
                }}>
                  {event.emoji && event.emoji!=='📅' ? `${event.emoji} ` : ''}{event.title}
                </p>

                {/* Avatar */}
                {member.photoDataUrl ? (
                  <img src={member.photoDataUrl} alt={member.name}
                    style={{ width:20,height:20,borderRadius:'50%',objectFit:'cover',border:`2px solid ${event.completed?'#86EFAC':barC}`,flexShrink:0 }} />
                ) : (
                  <div style={{ width:20,height:20,borderRadius:'50%',background:event.completed?'#DCFCE7':member.bgColor,border:`2px solid ${event.completed?'#86EFAC':barC}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0 }}>
                    {member.emoji || (member.avatar||member.name||'?')[0]}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Timed events — side-by-side when overlapping */}
      {layoutTimedEvents(timedEvents).map(({ event, col, totalCols }) => {
        const member = members.find(m => m.id===event.memberId)
        if (!member || !event.startTime) return null
        const colors = colorForTitle(event.title)
        const bg    = colors.bg
        const textC = colors.text
        const barC  = colors.bar
        const top   = timeToY(event.startTime) + (allDayEvents.length * 52)
        const h     = event.endTime ? timeToHeight(event.startTime, event.endTime) : 60

        // Side-by-side layout: divide width equally, add 2px gap
        const gutter = 4
        const colW  = `calc((100% - ${gutter * (totalCols + 1)}px) / ${totalCols})`
        const leftPx = gutter + col * (gutter + 1) // approximate — use % below

        return (
          <motion.div key={event.id}
            onClick={() => onEventClick(event)}
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{
              position:'absolute',
              left: `calc(${gutter}px + ${col} * (100% - ${gutter*2}px) / ${totalCols} + ${col > 0 ? 2 : 0}px)`,
              width: `calc((100% - ${gutter * 2 + (totalCols - 1) * 2}px) / ${totalCols})`,
              top, height:h,
              background: event.completed ? '#F0FDF4' : bg,
              borderRadius:12,
              border: event.completed ? '2px solid #86EFAC' : `2px solid rgba(255,255,255,0.80)`,
              boxShadow: totalCols > 1
                ? `0 2px 8px rgba(0,0,0,0.10), 0 0 0 1px ${barC}30`
                : '0 2px 8px rgba(0,0,0,0.07)',
              padding: totalCols > 1 ? '8px 8px' : '10px 12px',
              cursor:'pointer', overflow:'hidden',
              display:'flex', flexDirection:'column', justifyContent:'space-between',
              transition:'background 0.2s, border 0.2s',
            }}
            whileHover={{ filter:'brightness(0.95)', zIndex:10 }}
          >
            {/* Completed green overlay badge */}
            {event.completed && (
              <div style={{ position:'absolute', top:6, right:6, width:18, height:18, borderRadius:'50%', background:'#22C55E', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(34,197,94,0.4)' }}>
                <Check size={11} color="#fff" strokeWidth={3} />
              </div>
            )}
            <p style={{
              fontWeight: event.completed ? 500 : 700,
              fontSize: totalCols > 1 ? 11 : 13,
              color: event.completed ? '#16A34A' : textC,
              fontFamily:'var(--font-heading)', lineHeight:1.2,
              overflow:'hidden', textOverflow:'ellipsis',
              whiteSpace: totalCols > 2 ? 'nowrap' : 'normal',
              textDecoration: event.completed ? 'line-through' : 'none',
              textDecorationColor:'#22C55E', textDecorationThickness:'2px',
            }}>
              {event.emoji && event.emoji !== '📅' ? `${event.emoji} ` : ''}{event.title}
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
              <p style={{ fontSize: totalCols > 1 ? 10 : 11, fontWeight:500, color: event.completed ? '#86EFAC' : textC, opacity:0.70, fontFamily:'var(--font-body)' }}>
                {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
              </p>
              {member.photoDataUrl ? (
                <img src={member.photoDataUrl} alt={member.name}
                  style={{ width:20,height:20,borderRadius:'50%',objectFit:'cover',border:`2px solid ${event.completed?'#86EFAC':barC}`,flexShrink:0 }} />
              ) : (
                <div style={{ width:20,height:20,borderRadius:'50%',background:event.completed?'#DCFCE7':member.bgColor,border:`2px solid ${event.completed?'#86EFAC':barC}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0 }}>
                  {member.emoji || (member.avatar||'?')[0]}
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Family Events Modal ────────────────────────────────────
const EVENT_EMOJIS = ['📌','🎂','✈️','🏖️','🎉','🏥','🎓','⚽','🎼','🏆','🍕','🎁','🌟','🏠','🚗','❤️','🎪','🎯']
const EVENT_COLORS = ['#F9D2D2','#D4F1EE','#E2D6F3','#C5E5F1','#D9EAD3','#FAE0C8','#FEF3C7','#E0E7FF']

function FamilyEventsModal({
  events, onAdd, onRemove, onClose
}: {
  events: FamilyEvent[]
  onAdd: (ev: FamilyEvent) => void
  onRemove: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle]   = useState('')
  const [emoji, setEmoji]   = useState('📌')
  const [date, setDate]     = useState(new Date().toISOString().slice(0,10))
  const [endDate, setEndDate] = useState('')
  const [color, setColor]   = useState(EVENT_COLORS[0])

  function handleAdd() {
    if (!title.trim()) return
    onAdd({ id:`fe-${Date.now()}`, title:title.trim(), emoji, date, endDate:endDate||undefined, color })
    setTitle(''); setEmoji('📌'); setEndDate('')
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.30)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center' }}>
      <motion.div
        initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
        transition={{ type:'spring', stiffness:340, damping:30 }}
        style={{ width:'100%',maxWidth:560,maxHeight:'88vh',background:'rgba(255,251,247,0.97)',backdropFilter:'blur(32px)',borderRadius:'28px 28px 0 0',display:'flex',flexDirection:'column',boxShadow:'0 -4px 48px rgba(0,0,0,0.12)',overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'16px 24px 12px',borderBottom:'1px solid rgba(0,0,0,0.07)',flexShrink:0 }}>
          <div style={{ width:40,height:4,borderRadius:99,background:'rgba(0,0,0,0.12)',margin:'0 auto 14px' }} />
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div>
              <h2 style={{ fontSize:20,fontWeight:900,fontFamily:'var(--font-heading)',color:'#2D3748' }}>
                📌 Eventos Familiares
              </h2>
              <p style={{ fontSize:12,color:'#A0AEC0',marginTop:2 }}>
                Aparecen en la franja del nombre de la familia
              </p>
            </div>
            <button onClick={onClose}
              style={{ width:34,height:34,borderRadius:10,border:'1px solid rgba(0,0,0,0.08)',background:'rgba(255,255,255,0.80)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <X size={16} color="#718096" />
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
          {/* Add form */}
          <div style={{ background:'rgba(255,255,255,0.85)',borderRadius:18,padding:'16px',marginBottom:20,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize:12,fontWeight:700,color:'#718096',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12 }}>
              Agregar evento
            </p>

            {/* Emoji row */}
            <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:12 }}>
              {EVENT_EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  style={{ width:38,height:38,borderRadius:10,border:`2px solid ${emoji===e?'#E07B8A':'rgba(0,0,0,0.08)'}`,background:emoji===e?'rgba(224,123,138,0.10)':'rgba(255,255,255,0.90)',fontSize:20,cursor:'pointer' }}>
                  {e}
                </button>
              ))}
            </div>

            {/* Title */}
            <input value={title} onChange={e=>setTitle(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleAdd()}
              placeholder="Nombre del evento (ej: Vacaciones en Miami)"
              style={{ width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid rgba(0,0,0,0.08)',fontSize:14,fontWeight:600,fontFamily:'var(--font-body)',color:'#2D3748',outline:'none',background:'rgba(255,255,255,0.90)',marginBottom:10 }}
              autoFocus />

            {/* Dates */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:'#A0AEC0',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:6 }}>Fecha inicio</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                  style={{ width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid rgba(0,0,0,0.08)',fontSize:13,fontFamily:'var(--font-body)',background:'rgba(255,255,255,0.90)',outline:'none',color:'#2D3748',fontWeight:600 }} />
              </div>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:'#A0AEC0',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:6 }}>Fecha fin (opcional)</label>
                <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                  style={{ width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid rgba(0,0,0,0.08)',fontSize:13,fontFamily:'var(--font-body)',background:'rgba(255,255,255,0.90)',outline:'none',color:'#2D3748',fontWeight:600 }} />
              </div>
            </div>

            {/* Color */}
            <div style={{ display:'flex',gap:8,marginBottom:14,flexWrap:'wrap' }}>
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ width:28,height:28,borderRadius:'50%',background:c,border:`3px solid ${color===c?'#2D3748':'transparent'}`,cursor:'pointer',boxShadow:color===c?`0 0 0 2px rgba(255,255,255,0.9)`:undefined }} />
              ))}
            </div>

            <motion.button whileTap={{scale:0.97}} onClick={handleAdd} disabled={!title.trim()}
              style={{ width:'100%',padding:'12px',borderRadius:14,border:'none',background:title.trim()?'linear-gradient(135deg,#E07B8A,#D45C6B)':'rgba(0,0,0,0.08)',color:title.trim()?'#fff':'#A0AEC0',fontSize:14,fontWeight:800,fontFamily:'var(--font-heading)',cursor:title.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:title.trim()?'0 4px 14px rgba(224,123,138,0.35)':'none' }}>
              <Plus size={16} strokeWidth={2.5} /> Agregar evento
            </motion.button>
          </div>

          {/* Existing events */}
          {events.length > 0 && (
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:'#718096',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10 }}>
                Eventos guardados ({events.length})
              </p>
              {[...events].sort((a,b)=>a.date.localeCompare(b.date)).map(ev => (
                <div key={ev.id}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:14,background:ev.color||'rgba(255,255,255,0.85)',border:'1px solid rgba(255,255,255,0.70)',marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize:22 }}>{ev.emoji}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:14,fontWeight:800,color:'#2D3748',fontFamily:'var(--font-heading)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.title}</p>
                    <p style={{ fontSize:11,color:'#718096',marginTop:2 }}>
                      {ev.date}{ev.endDate ? ` → ${ev.endDate}` : ''}
                    </p>
                  </div>
                  <button onClick={() => onRemove(ev.id)}
                    style={{ width:30,height:30,borderRadius:8,border:'none',background:'rgba(255,59,48,0.10)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#FF3B30',flexShrink:0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {events.length === 0 && (
            <div style={{ textAlign:'center',paddingTop:24,color:'#A0AEC0' }}>
              <div style={{ fontSize:40,marginBottom:8 }}>📌</div>
              <p style={{ fontWeight:700,fontSize:14,color:'#718096' }}>Sin eventos todavía</p>
              <p style={{ fontSize:12,marginTop:4 }}>Agrega cumpleaños, vacaciones, eventos importantes…</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
