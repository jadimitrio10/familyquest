import { motion } from 'framer-motion'
import type { CalendarEvent, CalendarMember } from '@/types/calendar.types'
import { EventCard } from './EventCard'

interface DayColumnProps {
  label: string
  num: number
  isToday?: boolean
  events: CalendarEvent[]
  members: CalendarMember[]
  activeMemberId: string | null
  onToggle: (id: string) => void
  colIndex: number
}

export function DayColumn({
  label, num, isToday, events, members, activeMemberId, onToggle, colIndex
}: DayColumnProps) {
  const visibleEvents = activeMemberId
    ? events.filter(e => e.memberId === activeMemberId)
    : events

  const eventCount = visibleEvents.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: colIndex * 0.04, ease: 'easeOut' }}
      style={{
        borderRight: '1px solid var(--border)',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Day header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          {/* Day label */}
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>
            {label}
          </span>

          {/* Day number */}
          {isToday ? (
            <span
              className="flex items-center justify-center"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--blue)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {num}
            </span>
          ) : (
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-1)',
              fontFamily: 'Inter, sans-serif',
            }}>
              {num}
            </span>
          )}
        </div>

        {/* Event count */}
        {eventCount > 0 && (
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontFamily: 'Inter, sans-serif',
          }}>
            {eventCount} EVENT{eventCount !== 1 ? 'S' : ''} +
          </span>
        )}
      </div>

      {/* Events */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '8px 0' }}
      >
        {visibleEvents.map((event, idx) => {
          const member = members.find(m => m.id === event.memberId)!
          return (
            <div key={event.id} style={{ padding: '0 8px' }}>
              <EventCard
                event={event}
                member={member}
                onToggle={onToggle}
                animDelay={colIndex * 0.04 + idx * 0.04}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
