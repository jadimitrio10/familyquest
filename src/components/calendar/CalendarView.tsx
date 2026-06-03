import { useState, useEffect, useMemo, useCallback } from 'react'
import { usePointsStore } from '@/hooks/usePointsStore'
import { CelebrationOverlay } from '@/components/shared/CelebrationOverlay'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { CalendarTopBar } from './CalendarTopBar'
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

type RichMember = CalendarMember & { emoji:string; photoDataUrl?:string }

function toRichMembers(members: Member[]): RichMember[] {
  return members.map(m => ({
    id:m.id, name:m.name, avatar:m.emoji, avatarUrl:m.photoDataUrl,
    emoji:m.emoji, photoDataUrl:m.photoDataUrl,
    bgColor:m.bgColor, textColor:m.textColor, barColor:m.barColor,
    bgVar:'', textVar:'', barVar:'',
  }))
}

const DAY_LABELS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

// ══════════════════════════════════════════════════════════
export function CalendarView({ members: rawMembers }: { members?: Member[] }) {
  const [activeMember, setActiveMember]   = useState<string|null>(null)
  const [showAdd, setShowAdd]             = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent|null>(null)
  const [weekOffset, setWeekOffset]       = useState(0)
  const [tick, setTick]                   = useState(0)

  // Celebration state
  const [celebration, setCelebration] = useState<{
    memberName: string; memberEmoji: string; memberColor: string
    memberAccent: string; memberPhoto?: string
    points: number; taskTitle: string; taskEmoji: string
  } | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTick(n => n+1), 2000)
    return () => clearInterval(id)
  }, [])

  const { events:calEvents, toggleEvent, addEvent, deleteEvent, updateEvent } = useCalendarStore()
  const { awardPoints, removePoints } = usePointsStore()
  const MEMBERS = useMemo(() => rawMembers ? toRichMembers(rawMembers) : [], [rawMembers])

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
  const row1 = weekDays.slice(0,4)
  const row2 = weekDays.slice(4,7)

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--bg)' }}>
      <CalendarTopBar
        weekStart={weekStart}
        weekEnd={addDays(weekStart,6)}
        onAddEvent={() => setShowAdd(true)}
        onPrev={() => setWeekOffset(o => o-1)}
        onNext={() => setWeekOffset(o => o+1)}
        activeMember={activeMember}
        onToggleMember={(id) => setActiveMember(prev => prev === id || id === '' ? null : id)}
      />

      {/* Calendar body — time grid exactly like Stitch */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', margin:'0 12px 0' }}>
        <AnimatePresence mode="wait">
          <motion.div key={weekOffset}
            initial={{ opacity:0, x:weekOffset>0?20:-20 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:weekOffset>0?-20:20 }}
            transition={{ duration:0.20, ease:'easeInOut' }}
            style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#fff', borderRadius:'14px 14px 0 0', border:'1px solid #EEE8E0', borderBottom:'none' }}
          >
            {/* ── Day headers ── */}
            <div style={{ display:'grid', gridTemplateColumns:`80px repeat(4,1fr)`, borderBottom:'1px solid #EEE8E0' }}>
              <div style={{ padding:'12px 8px' }} /> {/* time gutter */}
              {row1.map(day => (
                <DayHeader key={day.date} day={day} />
              ))}
            </div>

            {/* ── ROW 1: Time grid Mon–Jue ── */}
            <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
              <div style={{ display:'grid', gridTemplateColumns:`80px repeat(4,1fr)`, height: HOURS.length*HOUR_H, position:'relative' }}>
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

              {/* ── ROW 2 header: Vie–Dom + Next Week ── */}
              <div style={{ display:'grid', gridTemplateColumns:`80px repeat(4,1fr)`, borderTop:'2px solid #EEE8E0', borderBottom:'1px solid #EEE8E0', background:'var(--bg)' }}>
                <div style={{ padding:'12px 8px' }} />
                {row2.map(day => <DayHeader key={day.date} day={day} />)}
                {/* Next week header placeholder */}
                <div style={{ padding:'12px 8px' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'var(--font-body)' }}>Next</span>
                </div>
              </div>

              {/* ── ROW 2 body: Vie–Dom + Next Week ── */}
              <div style={{ display:'grid', gridTemplateColumns:`80px repeat(4,1fr)`, height:HOURS.length*HOUR_H*0.7, position:'relative' }}>
                <TimeAxis compact />
                {row2.map((day,i) => (
                  <TimeColumn key={day.date} events={eventsForDay(day.date)} members={MEMBERS}
                    onToggle={handleToggle} onEventClick={setSelectedEvent} colIndex={i+4} compact />
                ))}
                {/* Next Week column */}
                <div style={{ borderLeft:'1px solid #EEE8E0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:16, background:'#FAFAFA' }}>
                  <NextWeekColumn dateRange={nextLabel} onGoNext={() => setWeekOffset(o=>o+1)} />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
        style={{ position:'fixed', bottom:24, right:24, width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#E07B8A,#D45C6B)', color:'#fff', border:'none', cursor:'pointer', boxShadow:'0 6px 20px rgba(224,123,138,0.45)', zIndex:40, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
        +
      </motion.button>

      <AddEventModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addEvent} />
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)}
        onDelete={(id) => { deleteEvent(id); setSelectedEvent(null) }}
        onUpdate={updateEvent} onToggle={handleToggle} />

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
                background:bg, borderRadius:12, padding:'8px 10px 7px', marginBottom:5,
                border:'1px solid rgba(255,255,255,0.65)', cursor:'pointer',
                boxShadow:'0 1px 5px rgba(0,0,0,0.06)',
                opacity: event.completed ? 0.58 : 1,
              }}
              whileHover={{ filter:'brightness(0.97)' }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6 }}>
                <p style={{ fontWeight:700, fontSize:12, color:textC, lineHeight:1.2, fontFamily:'var(--font-heading)', flex:1, textDecoration:event.completed?'line-through':'none' }}>
                  {event.emoji && event.emoji!=='📅' ? `${event.emoji} ` : ''}{event.title}
                </p>
                <motion.button
                  onClick={e=>{e.stopPropagation();onToggle(event.id)}}
                  whileTap={{ scale:0.78 }}
                  style={{ width:19,height:19,borderRadius:'50%',flexShrink:0,border:event.completed?'none':`1.5px solid ${barC}80`,background:event.completed?barC:'rgba(255,255,255,0.55)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s' }}
                >
                  {event.completed && <Check size={11} color="#fff" strokeWidth={3} />}
                </motion.button>
              </div>
              {/* Avatar bottom right */}
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
                {member.photoDataUrl ? (
                  <img src={member.photoDataUrl} alt={member.name} style={{ width:18,height:18,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.80)',boxShadow:'0 1px 3px rgba(0,0,0,0.10)' }} />
                ) : (
                  <div style={{ width:18,height:18,borderRadius:'50%',background:barC,border:'2px solid rgba(255,255,255,0.80)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff' }}>
                    {(member.avatar||member.name||'?')[0].toUpperCase()}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Timed events — absolutely positioned, color by title */}
      {timedEvents.map(event => {
        const member = members.find(m => m.id===event.memberId)
        if (!member || !event.startTime) return null
        const colors = colorForTitle(event.title)
        const bg    = colors.bg
        const textC = colors.text
        const barC  = colors.bar
        const top  = timeToY(event.startTime) + (allDayEvents.length * 52)
        const h    = event.endTime ? timeToHeight(event.startTime, event.endTime) : 60

        return (
          <motion.div key={event.id}
            onClick={() => onEventClick(event)}
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{
              position:'absolute', left:4, right:4,
              top, height:h,
              background:bg, borderRadius:14,
              border:'1px solid rgba(255,255,255,0.65)',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)',
              padding:'10px 12px',
              cursor:'pointer', overflow:'hidden',
              display:'flex', flexDirection:'column', justifyContent:'space-between',
            }}
            whileHover={{ filter:'brightness(0.97)' }}
          >
            <p style={{ fontWeight:700, fontSize:13, color:textC, fontFamily:'var(--font-heading)', lineHeight:1.2 }}>
              {event.title}
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:11, fontWeight:500, color:textC, opacity:0.60, fontFamily:'var(--font-body)' }}>
                {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
              </p>
              {member.photoDataUrl ? (
                <img src={member.photoDataUrl} alt={member.name} style={{ width:20,height:20,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.8)' }} />
              ) : (
                <div style={{ width:20,height:20,borderRadius:'50%',background:barC,border:'2px solid rgba(255,255,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff' }}>
                  {(member.avatar||'?')[0].toUpperCase()}
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
