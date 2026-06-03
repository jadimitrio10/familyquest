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
import { addDays, format, startOfWeek } from 'date-fns'

// Convert Member → CalendarMember (passes photos through)
function toCalendarMembers(members: Member[]): (CalendarMember & { emoji: string; photoDataUrl?: string })[] {
  return members.map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.emoji,
    avatarUrl: m.photoDataUrl,   // ← photo for display
    emoji: m.emoji,
    photoDataUrl: m.photoDataUrl,
    bgColor: m.bgColor,
    textColor: m.textColor,
    barColor: m.barColor,
    bgVar: '', textVar: '', barVar: '',
  }))
}

// Convert a Task (from TasksView) to a CalendarEvent
function taskToEvent(task: {
  id: string; title: string; emoji: string; memberId: string
  type: 'fixed' | 'once'; done: boolean
  dueDate?: string; startTime?: string
}, dateStr: string): CalendarEvent {
  return {
    id: `task-${task.id}-${dateStr}`,
    title: task.title,
    emoji: task.emoji,
    memberId: task.memberId,
    date: dateStr,
    startTime: (task as any).startTime,
    allDay: !(task as any).startTime,
    completed: task.done,
    recurrence: task.type === 'fixed' ? 'daily' : undefined,
  }
}

// Load tasks from localStorage and convert to calendar events for the given week
const TASKS_KEY = 'fq_tasks_v2'
function getTaskEvents(weekDates: string[]): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const tasks: Array<{
      id: string; title: string; emoji: string; memberId: string
      type: 'fixed' | 'once'; done: boolean; dueDate?: string
    }> = JSON.parse(raw)

    const events: CalendarEvent[] = []
    for (const task of tasks) {
      if (task.type === 'fixed') {
        // Fixed tasks appear on every day of the week
        for (const date of weekDates) {
          events.push(taskToEvent(task, date))
        }
      } else if (task.type === 'once' && task.dueDate) {
        // One-time tasks appear on their due date if it falls in this week
        if (weekDates.includes(task.dueDate)) {
          events.push(taskToEvent(task, task.dueDate))
        }
      }
    }
    return events
  } catch {
    return []
  }
}

// Get the Monday of the current week (week starts Monday)
function getThisMonday(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 }) // 1 = Monday
}

// Build 7 consecutive days starting from a Monday
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function CalendarView({ members: rawMembers }: { members?: Member[] }) {
  const [activeMember, setActiveMember] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [tick, setTick] = useState(0)

  // Re-render when tasks change (listen to storage events)
  useEffect(() => {
    const handler = () => setTick(t => t + 1)
    window.addEventListener('storage', handler)
    // Also poll every 2s for same-tab changes
    const interval = setInterval(() => setTick(t => t + 1), 2000)
    return () => { window.removeEventListener('storage', handler); clearInterval(interval) }
  }, [])

  const { events: calEvents, toggleEvent, addEvent, deleteEvent, updateEvent } = useCalendarStore()

  const MEMBERS = useMemo(
    () => rawMembers ? toCalendarMembers(rawMembers) : [],
    [rawMembers]
  )

  // Week calculation — always starts on Monday
  const thisMonday = getThisMonday()
  const weekStart = addDays(thisMonday, weekOffset * 7)

  const weekDays = DAY_LABELS.map((label, i) => {
    const date = addDays(weekStart, i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      num: date.getDate(),
      label,
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
    }
  })

  const row1 = weekDays.slice(0, 4)   // Lun–Jue
  const row2 = weekDays.slice(4, 7)   // Vie–Dom + Next Week

  // Merge calendar events + task events
  const weekDates = weekDays.map(d => d.date)
  const taskEvents = useMemo(
    () => getTaskEvents(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekDates.join(','), tick]
  )

  // All events: calendar events + task-derived events (dedup by id)
  const allEventIds = new Set(calEvents.map(e => e.id))
  const mergedEvents = [
    ...calEvents,
    ...taskEvents.filter(te => !allEventIds.has(te.id)),
  ]

  const eventsForDay = (date: string) => mergedEvents.filter(e => e.date === date)
  const toggleMember = (id: string) => setActiveMember(prev => prev === id ? null : id)

  function handleToggleEvent(id: string) {
    // If it's a task event, update the task in localStorage
    if (id.startsWith('task-')) {
      const parts = id.split('-')
      const taskId = parts.slice(1, -1).join('-')
      try {
        const raw = localStorage.getItem(TASKS_KEY)
        if (raw) {
          const tasks = JSON.parse(raw)
          const updated = tasks.map((t: any) => t.id === taskId ? { ...t, done: !t.done } : t)
          localStorage.setItem(TASKS_KEY, JSON.stringify(updated))
          setTick(t => t + 1)
        }
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

      {/* Member chips */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px 12px', flexShrink: 0, flexWrap: 'wrap' }}>
        {MEMBERS.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-body)', padding: '8px 0' }}>
            👋 Ve a Ajustes para agregar miembros, luego usa "+ Add Event"
          </p>
        )}
        {MEMBERS.map(member => !member?.bgColor ? null : (
          <MemberChip
            key={member.id}
            member={member}
            events={mergedEvents.filter(e => e.memberId === member.id)}
            isActive={activeMember === null || activeMember === member.id}
            onClick={() => toggleMember(member.id)}
          />
        ))}
      </div>

      {/* Calendar 4×2 grid */}
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
            <DayColumn
              key={day.date}
              label={day.label}
              num={day.num}
              isToday={day.isToday}
              events={eventsForDay(day.date)}
              members={MEMBERS as unknown as CalendarMember[]}
              activeMemberId={activeMember}
              onToggle={handleToggleEvent}
              onEventClick={setSelectedEvent}
              colIndex={idx}
            />
          ))}
          {row2.map((day, idx) => (
            <DayColumn
              key={day.date}
              label={day.label}
              num={day.num}
              isToday={day.isToday}
              events={eventsForDay(day.date)}
              members={MEMBERS as unknown as CalendarMember[]}
              activeMemberId={activeMember}
              onToggle={handleToggleEvent}
              onEventClick={setSelectedEvent}
              colIndex={idx + 4}
            />
          ))}
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
          background: 'linear-gradient(135deg,var(--blue),#818CF8)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(79,70,229,0.45)',
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
        onToggle={handleToggleEvent}
      />
    </div>
  )
}
