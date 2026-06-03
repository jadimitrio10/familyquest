import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { CalendarTopBar } from './CalendarTopBar'
import { MemberChip } from './MemberChip'
import { DayColumn } from './DayColumn'
import { NextWeekColumn } from './NextWeekColumn'
import { AddEventModal } from './AddEventModal'
import { EventDetailModal } from './EventDetailModal'
import { useCalendarStore } from '@/hooks/useCalendarStore'
import { type CalendarEvent, type CalendarMember } from '@/types/calendar.types'
import type { Member } from '@/hooks/useMembersStore'
import { addDays, format } from 'date-fns'

// ── Monday of current week (no date-fns weekStartsOn needed) ──
function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()                 // 0=Sun 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day // days to subtract to reach Mon
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

// ── Storage keys ──
const TASKS_KEY       = 'fq_tasks_v2'
const COMPLETIONS_KEY = 'fq_task_completions' // { "taskId:date": true }

function loadCompletions(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(COMPLETIONS_KEY) ?? '{}') } catch { return {} }
}

function saveCompletions(c: Record<string, boolean>) {
  try { localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(c)) } catch {}
}

// ── Convert Member → CalendarMember (with photos) ──
type RichMember = CalendarMember & { emoji: string; photoDataUrl?: string }

function toRichMembers(members: Member[]): RichMember[] {
  return members.map(m => ({
    id: m.id, name: m.name,
    avatar: m.emoji, avatarUrl: m.photoDataUrl,
    emoji: m.emoji, photoDataUrl: m.photoDataUrl,
    bgColor: m.bgColor, textColor: m.textColor, barColor: m.barColor,
    bgVar: '', textVar: '', barVar: '',
  }))
}

// ── Load tasks and produce per-day events ──
interface StoredTask {
  id: string; title: string; emoji: string; memberId: string
  type: 'fixed' | 'once'; done: boolean; dueDate?: string
}

function loadTaskEvents(weekDates: string[]): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const tasks: StoredTask[] = JSON.parse(raw)
    const completions = loadCompletions()
    const events: CalendarEvent[] = []

    for (const t of tasks) {
      if (t.type === 'fixed') {
        for (const date of weekDates) {
          const key = `${t.id}:${date}`
          events.push({
            id: `task:${key}`,
            title: t.title, emoji: t.emoji,
            memberId: t.memberId, date,
            allDay: true,
            // Per-day completion: check completions map first, fall back to task.done
            completed: completions[key] ?? false,
          })
        }
      } else if (t.type === 'once' && t.dueDate && weekDates.includes(t.dueDate)) {
        const key = `${t.id}:${t.dueDate}`
        events.push({
          id: `task:${key}`,
          title: t.title, emoji: t.emoji,
          memberId: t.memberId, date: t.dueDate,
          allDay: true,
          completed: completions[key] ?? t.done,
        })
      }
    }
    return events
  } catch { return [] }
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// ════════════════════════════════════════════════════════════
export function CalendarView({ members: rawMembers }: { members?: Member[] }) {
  const [activeMember, setActiveMember]   = useState<string | null>(null)
  const [showAdd, setShowAdd]             = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [weekOffset, setWeekOffset]       = useState(0)
  const [tick, setTick]                   = useState(0)

  // Refresh task events every 2s
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 2000)
    return () => clearInterval(id)
  }, [])

  const { events: calEvents, toggleEvent, addEvent, deleteEvent, updateEvent } = useCalendarStore()

  const MEMBERS: RichMember[] = useMemo(
    () => rawMembers ? toRichMembers(rawMembers) : [],
    [rawMembers]
  )

  // Week: always Mon → Sun
  const weekStart = addDays(getMondayOfWeek(new Date()), weekOffset * 7)

  const weekDays = DAY_LABELS.map((label, i) => {
    const d    = addDays(weekStart, i)
    const date = format(d, 'yyyy-MM-dd')
    return { date, num: d.getDate(), label, isToday: date === format(new Date(), 'yyyy-MM-dd') }
  })

  const row1      = weekDays.slice(0, 4)
  const row2      = weekDays.slice(4, 7)
  const weekDates = weekDays.map(d => d.date)

  const taskEvents = useMemo(
    () => loadTaskEvents(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekDates.join(','), tick]
  )

  const calIds    = new Set(calEvents.map(e => e.id))
  const allEvents = [...calEvents, ...taskEvents.filter(t => !calIds.has(t.id))]

  const eventsForDay = (date: string) => allEvents.filter(e => e.date === date)
  const toggleMember = (id: string) => setActiveMember(p => p === id ? null : id)

  function handleToggle(id: string) {
    if (id.startsWith('task:')) {
      // Toggle only THIS day's completion
      const rest = id.slice('task:'.length)  // "{taskId}:{date}"
      const completions = loadCompletions()
      completions[rest] = !completions[rest]
      saveCompletions(completions)
      setTick(n => n + 1)
    } else {
      toggleEvent(id)
    }
  }

  const nextLabel = `${format(addDays(weekStart, 7), 'MMM d')}–${format(addDays(weekStart, 13), 'MMM d')}`

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <CalendarTopBar
        weekStart={weekStart}
        weekEnd={addDays(weekStart, 6)}
        onAddEvent={() => setShowAdd(true)}
        onPrev={() => setWeekOffset(o => o - 1)}
        onNext={() => setWeekOffset(o => o + 1)}
      />

      {/* Member chips */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px 12px', flexShrink: 0, flexWrap: 'wrap' }}>
        {MEMBERS.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-body)', padding: '8px 0' }}>
            👋 Ve a Ajustes para agregar miembros
          </p>
        )}
        {MEMBERS.map(m => (
          <MemberChip
            key={m.id}
            member={m}
            events={allEvents.filter(e => e.memberId === m.id)}
            isActive={activeMember === null || activeMember === m.id}
            onClick={() => toggleMember(m.id)}
          />
        ))}
      </div>

      {/* Grid 4×2 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={weekOffset}
          initial={{ opacity: 0, x: weekOffset > 0 ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: weekOffset > 0 ? -30 : 30 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex-1 overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: '1fr 1fr',
            background: 'var(--surface)',
            borderRadius: '14px 14px 0 0',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            margin: '0 12px',
            overflow: 'hidden',
          }}
        >
          {row1.map((day, idx) => (
            <DayColumn key={day.date} label={day.label} num={day.num} isToday={day.isToday}
              events={eventsForDay(day.date)}
              members={MEMBERS as unknown as CalendarMember[]}
              activeMemberId={activeMember}
              onToggle={handleToggle}
              onEventClick={setSelectedEvent}
              colIndex={idx} />
          ))}
          {row2.map((day, idx) => (
            <DayColumn key={day.date} label={day.label} num={day.num} isToday={day.isToday}
              events={eventsForDay(day.date)}
              members={MEMBERS as unknown as CalendarMember[]}
              activeMemberId={activeMember}
              onToggle={handleToggle}
              onEventClick={setSelectedEvent}
              colIndex={idx + 4} />
          ))}
          <div style={{ borderLeft: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
            <NextWeekColumn dateRange={nextLabel} onGoNext={() => setWeekOffset(o => o + 1)} />
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#007AFF,#5856D6)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,122,255,0.45)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      <AddEventModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addEvent} />
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)}
        onDelete={(id) => { deleteEvent(id); setSelectedEvent(null) }}
        onUpdate={updateEvent} onToggle={handleToggle} />
    </div>
  )
}
