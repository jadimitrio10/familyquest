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

// ─────────────────────────────────────────────────────────
// Get Monday of current week — manual, no date-fns dependency
// JavaScript getDay(): 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()                    // 0=Sun…6=Sat
  const diff = day === 0 ? -6 : 1 - day    // Mon=0, Tue=-1 … Sun=-6
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

// ─────────────────────────────────────────────────────────
// Convert Member → CalendarMember (with photos)
type RichMember = CalendarMember & { emoji: string; photoDataUrl?: string }

function toRichMembers(members: Member[]): RichMember[] {
  return members.map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.emoji,
    avatarUrl: m.photoDataUrl,
    emoji: m.emoji,
    photoDataUrl: m.photoDataUrl,
    bgColor: m.bgColor,
    textColor: m.textColor,
    barColor: m.barColor,
    bgVar: '', textVar: '', barVar: '',
  }))
}

// ─────────────────────────────────────────────────────────
// Load tasks and convert to CalendarEvents for given dates
const TASKS_KEY = 'fq_tasks_v2'

interface StoredTask {
  id: string; title: string; emoji: string; memberId: string
  type: 'fixed' | 'once'; done: boolean; dueDate?: string
}

function loadTaskEvents(weekDates: string[]): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const tasks: StoredTask[] = JSON.parse(raw)
    const events: CalendarEvent[] = []

    for (const t of tasks) {
      if (t.type === 'fixed') {
        // Fixed = show every day of this week
        for (const date of weekDates) {
          events.push({
            id: `task:${t.id}:${date}`,
            title: t.title,
            emoji: t.emoji,
            memberId: t.memberId,
            date,
            allDay: true,
            completed: t.done,
          })
        }
      } else if (t.type === 'once' && t.dueDate && weekDates.includes(t.dueDate)) {
        events.push({
          id: `task:${t.id}:${t.dueDate}`,
          title: t.title,
          emoji: t.emoji,
          memberId: t.memberId,
          date: t.dueDate,
          allDay: true,
          completed: t.done,
        })
      }
    }
    return events
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────────────────
// Day labels Mon→Sun
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const todayStr = () => format(new Date(), 'yyyy-MM-dd')

// ─────────────────────────────────────────────────────────
export function CalendarView({ members: rawMembers }: { members?: Member[] }) {
  const [activeMember, setActiveMember] = useState<string | null>(null)
  const [showAdd, setShowAdd]           = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [weekOffset, setWeekOffset]     = useState(0)
  const [refreshTick, setRefreshTick]   = useState(0)

  // Poll task changes every 2s
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(n => n + 1), 2000)
    window.addEventListener('storage', () => setRefreshTick(n => n + 1))
    return () => clearInterval(id)
  }, [])

  const { events: calEvents, toggleEvent, addEvent, deleteEvent, updateEvent } = useCalendarStore()

  const MEMBERS: RichMember[] = useMemo(
    () => rawMembers ? toRichMembers(rawMembers) : [],
    [rawMembers]
  )

  // ── WEEK DATES — always Mon→Sun ──
  const baseMonday = getMondayOfWeek(new Date())            // Monday of THIS week
  const weekStart  = addDays(baseMonday, weekOffset * 7)   // shift by offset

  const weekDays = DAY_LABELS.map((label, i) => {
    const d    = addDays(weekStart, i)
    const date = format(d, 'yyyy-MM-dd')
    return { date, num: d.getDate(), label, isToday: date === todayStr() }
  })

  const row1 = weekDays.slice(0, 4)   // Lun–Jue
  const row2 = weekDays.slice(4, 7)   // Vie–Dom  (4th col = Next Week)

  const weekDates    = weekDays.map(d => d.date)
  const weekDatesKey = weekDates.join(',')

  // ── TASK EVENTS (derived from Tasks view storage) ──
  const taskEvents = useMemo(
    () => loadTaskEvents(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekDatesKey, refreshTick]
  )

  // ── MERGE calendar events + task events (no duplicates) ──
  const calIds     = new Set(calEvents.map(e => e.id))
  const allEvents  = [...calEvents, ...taskEvents.filter(t => !calIds.has(t.id))]

  const eventsForDay   = (date: string) => allEvents.filter(e => e.date === date)
  const toggleMember   = (id: string)   => setActiveMember(p => p === id ? null : id)

  // Toggle a task event → update fq_tasks_v2 directly
  function handleToggle(id: string) {
    if (id.startsWith('task:')) {
      const taskId = id.split(':')[1]
      try {
        const raw = localStorage.getItem(TASKS_KEY)
        if (!raw) return
        const tasks: StoredTask[] = JSON.parse(raw)
        localStorage.setItem(TASKS_KEY, JSON.stringify(
          tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
        ))
        setRefreshTick(n => n + 1)
      } catch {}
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

      {/* Member chips — show photos */}
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

      {/* Grid 4×2 : Lun–Jue / Vie–Dom + Next Week */}
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
          {/* Row 1: Lun Mar Mié Jue */}
          {row1.map((day, idx) => (
            <DayColumn
              key={day.date}
              label={day.label}
              num={day.num}
              isToday={day.isToday}
              events={eventsForDay(day.date)}
              members={MEMBERS as unknown as CalendarMember[]}
              activeMemberId={activeMember}
              onToggle={handleToggle}
              onEventClick={setSelectedEvent}
              colIndex={idx}
            />
          ))}

          {/* Row 2: Vie Sáb Dom + Next Week */}
          {row2.map((day, idx) => (
            <DayColumn
              key={day.date}
              label={day.label}
              num={day.num}
              isToday={day.isToday}
              events={eventsForDay(day.date)}
              members={MEMBERS as unknown as CalendarMember[]}
              activeMemberId={activeMember}
              onToggle={handleToggle}
              onEventClick={setSelectedEvent}
              colIndex={idx + 4}
            />
          ))}

          {/* Next Week column */}
          <div style={{ borderLeft: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
            <NextWeekColumn dateRange={nextLabel} onGoNext={() => setWeekOffset(o => o + 1)} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setShowAdd(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #007AFF, #5856D6)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,122,255,0.45)',
          zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      <AddEventModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addEvent} />
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={(id) => { deleteEvent(id); setSelectedEvent(null) }}
        onUpdate={updateEvent}
        onToggle={handleToggle}
      />
    </div>
  )
}
