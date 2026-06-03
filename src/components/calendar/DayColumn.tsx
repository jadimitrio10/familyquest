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
  onEventClick: (event: CalendarEvent) => void
  colIndex: number
}

export function DayColumn({
  label, num, isToday, events, members, activeMemberId, onToggle, onEventClick, colIndex
}: DayColumnProps) {
  const visible = activeMemberId
    ? events.filter(e => e.memberId === activeMemberId)
    : events

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: colIndex * 0.04, ease: 'easeOut' }}
      style={{
        borderRight: '1px solid var(--border-soft)',
        height: '100%', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Day header — Playfair Display serif */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-soft)',
        flexShrink: 0,
        background: isToday ? 'var(--pink)' : 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Label — small, uppercase */}
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: isToday ? 'var(--pink-text)' : 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-body)',
          }}>
            {label}
          </span>

          {/* Number — Playfair serif */}
          {isToday ? (
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--coral)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: 16, fontWeight: 700,
            }}>{num}</span>
          ) : (
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-1)',
              fontFamily: 'var(--font-serif)',
            }}>{num}</span>
          )}
        </div>

        {/* Event count */}
        {visible.length > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-body)',
          }}>
            {visible.length} EVENT{visible.length !== 1 ? 'S' : ''} +
          </span>
        )}
      </div>

      {/* Events */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {visible.map((event, idx) => {
          const member = members.find(m => m.id === event.memberId)
          if (!member) return null
          return (
            <div key={event.id} style={{ padding: '0 6px' }}>
              <EventCard
                event={event}
                member={member}
                onToggle={onToggle}
                onClick={onEventClick}
                animDelay={colIndex * 0.04 + idx * 0.04}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
