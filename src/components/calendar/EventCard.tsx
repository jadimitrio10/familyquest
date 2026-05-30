import { motion } from 'framer-motion'
import type { CalendarEvent, CalendarMember } from '@/types/calendar.types'

interface EventCardProps {
  event: CalendarEvent
  member: CalendarMember
  onToggle: (id: string) => void
  animDelay?: number
}

export function EventCard({ event, member, onToggle, animDelay = 0 }: EventCardProps) {
  const timeStr = event.allDay
    ? 'All day'
    : event.startTime && event.endTime
      ? `${event.startTime} - ${event.endTime}`
      : event.startTime ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: animDelay, ease: 'easeOut' }}
      className="group"
      style={{
        background: member.bgColor,
        borderRadius: 10,
        padding: '9px 12px',
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'filter 150ms ease',
      }}
      whileHover={{ filter: 'brightness(0.96)' }}
    >
      {/* Row 1: title + checkbox */}
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontWeight: 500,
          fontSize: 13,
          color: member.textColor,
          lineHeight: 1.3,
          fontFamily: 'Inter, sans-serif',
          flex: 1,
        }}>
          {event.emoji} {event.title}
        </p>

        {/* Circular checkbox */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggle(event.id) }}
          whileTap={{ scale: 0.85 }}
          animate={event.completed ? { scale: [1, 1.3, 1] } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 16 }}
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: event.completed ? 'none' : `1.5px solid ${member.barColor}66`,
            background: event.completed ? member.barColor : 'transparent',
            cursor: 'pointer',
            marginTop: 1,
          }}
        >
          {event.completed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}
            >
              ✓
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Row 2: time */}
      <p style={{
        fontWeight: 400,
        fontSize: 11,
        color: member.textColor,
        opacity: 0.55,
        marginTop: 3,
        fontFamily: 'Inter, sans-serif',
      }}>
        {timeStr}
      </p>
    </motion.div>
  )
}
