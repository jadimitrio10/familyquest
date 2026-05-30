import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { CalendarTopBar } from './CalendarTopBar'
import { MemberChip } from './MemberChip'
import { DayColumn } from './DayColumn'
import { NextWeekColumn } from './NextWeekColumn'
import { AddEventModal } from './AddEventModal'
import { EventDetailModal } from './EventDetailModal'
import { useCalendarStore } from '@/hooks/useCalendarStore'
import { WEEK_DAYS, type CalendarEvent, type CalendarMember } from '@/types/calendar.types'
import type { Member } from '@/hooks/useMembersStore'
import { addDays, format } from 'date-fns'

// Convert Member (from useMembersStore) to CalendarMember shape
function toCalendarMembers(members: Member[]): CalendarMember[] {
  return members.map(m => ({
    id: m.id, name: m.name,
    avatar: m.emoji, avatarUrl: m.photoDataUrl,
    // Also expose emoji so MemberChip works
    emoji: m.emoji, photoDataUrl: m.photoDataUrl,
    bgColor: m.bgColor, textColor: m.textColor, barColor: m.barColor,
    bgVar:'', textVar:'', barVar:'',
  }) as CalendarMember & { emoji: string; photoDataUrl?: string })
}

export function CalendarView({ members: rawMembers }: { members?: Member[] }) {
  const [activeMember, setActiveMember] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const { events, toggleEvent, addEvent, deleteEvent, updateEvent } = useCalendarStore()
  const MEMBERS = rawMembers ? toCalendarMembers(rawMembers) : toCalendarMembers([])

  const baseDate = new Date('2024-09-11')
  const weekStart = addDays(baseDate, weekOffset * 7)

  const weekDays = WEEK_DAYS.map((d, i) => ({
    ...d,
    date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
    num: addDays(weekStart, i).getDate(),
    label: ['Thu','Fri','Sat','Sun','Mon','Tue','Wed'][i],
  }))

  const row1 = weekDays.slice(0, 4)
  const row2 = weekDays.slice(4, 7)
  const nextLabel = `${format(addDays(weekStart,7),'MMM d')}–${format(addDays(weekStart,13),'MMM d')}`

  const eventsForDay = (date: string) => events.filter(e => e.date === date)
  const toggleMember = (id: string) => setActiveMember(prev => prev === id ? null : id)

  function handleDeleteEvent(id: string) {
    deleteEvent(id)
    setSelectedEvent(null)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background:'var(--bg)' }}>
      <CalendarTopBar
        weekStart={weekStart}
        weekEnd={addDays(weekStart, 6)}
        onAddEvent={() => setShowAdd(true)}
        onPrev={() => setWeekOffset(o => o - 1)}
        onNext={() => setWeekOffset(o => o + 1)}
      />

      {/* Member chips */}
      <div style={{ display:'flex', gap:10, padding:'0 16px 12px', flexShrink:0 }}>
        {MEMBERS.map(member => (
          <MemberChip
            key={member.id}
            member={member}
            events={events.filter(e => e.memberId === member.id)}
            isActive={activeMember === null || activeMember === member.id}
            onClick={() => toggleMember(member.id)}
          />
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={weekOffset}
          initial={{ opacity:0, x:weekOffset>0?30:-30 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:weekOffset>0?-30:30 }}
          transition={{ duration:0.22, ease:'easeInOut' }}
          className="flex-1 overflow-hidden"
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'1fr 1fr', background:'var(--surface)', borderRadius:'14px 14px 0 0', border:'1px solid var(--border)', borderBottom:'none', margin:'0 12px', overflow:'hidden' }}
        >
          {row1.map((day, idx) => (
            <DayColumn key={day.date} label={day.label} num={day.num} isToday={weekOffset===0&&idx===0}
              events={eventsForDay(day.date)} members={MEMBERS} activeMemberId={activeMember}
              onToggle={toggleEvent} onEventClick={setSelectedEvent} colIndex={idx}/>
          ))}
          {row2.map((day, idx) => (
            <DayColumn key={day.date} label={day.label} num={day.num}
              events={eventsForDay(day.date)} members={MEMBERS} activeMemberId={activeMember}
              onToggle={toggleEvent} onEventClick={setSelectedEvent} colIndex={idx+4}/>
          ))}
          <div style={{ borderLeft:'1px solid var(--border)', borderTop:'1px solid var(--border)' }}>
            <NextWeekColumn dateRange={nextLabel} onGoNext={() => setWeekOffset(o => o+1)}/>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* FAB */}
      <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
        style={{ position:'fixed', bottom:24, right:24, width:52, height:52, borderRadius:'50%', background:'var(--blue)', color:'#fff', border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.35)', zIndex:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Plus size={22} strokeWidth={2.5}/>
      </motion.button>

      <AddEventModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addEvent}/>
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onDelete={handleDeleteEvent} onUpdate={updateEvent} onToggle={toggleEvent}/>
    </div>
  )
}
