import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { CalendarEvent, CalendarMember } from '@/types/calendar.types'

// Kinship pastel palette per member index
const KINSHIP_COLORS = [
  { bg: '#F9D2D2', textColor: '#6B2020', border: 'rgba(249,210,210,0.8)' }, // pink
  { bg: '#D4F1EE', textColor: '#1A6B64', border: 'rgba(212,241,238,0.8)' }, // mint
  { bg: '#E2D6F3', textColor: '#5B3A8B', border: 'rgba(226,214,243,0.8)' }, // lavender
  { bg: '#C5E5F1', textColor: '#1A5C7A', border: 'rgba(197,229,241,0.8)' }, // sky
  { bg: '#D9EAD3', textColor: '#2E5E2A', border: 'rgba(217,234,211,0.8)' }, // sage
  { bg: '#FAE0C8', textColor: '#8B4A1A', border: 'rgba(250,224,200,0.8)' }, // peach
]

// Multi-person events get the diagonal gradient
const DIAGONAL_BG = `repeating-linear-gradient(
  135deg,
  #D4F1EE 0px, #D4F1EE 10px,
  #F9D2D2 10px, #F9D2D2 20px,
  #E2D6F3 20px, #E2D6F3 30px,
  #C5E5F1 30px, #C5E5F1 40px
)`

interface EventCardProps {
  event: CalendarEvent
  member: CalendarMember
  onToggle: (id: string) => void
  onClick: (event: CalendarEvent) => void
  animDelay?: number
}

export function EventCard({ event, member, onToggle, onClick, animDelay = 0 }: EventCardProps) {
  const timeStr = event.allDay
    ? 'All day'
    : event.startTime && event.endTime
      ? `${event.startTime} - ${event.endTime}`
      : event.startTime ?? ''

  // Pick color based on member id (stable)
  const colorIdx = Math.abs(member.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % KINSHIP_COLORS.length
  const colors   = KINSHIP_COLORS[colorIdx]

  const bg = event.recurrence === 'multi'
    ? undefined
    : (member.bgColor || colors.bg)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animDelay, ease: 'easeOut' }}
      onClick={() => onClick(event)}
      className="event-card"
      style={{
        background: bg,
        backgroundImage: !bg ? DIAGONAL_BG : undefined,
        backgroundSize: !bg ? '40px 40px' : undefined,
        padding: '10px 12px',
        marginBottom: 6,
        cursor: 'pointer',
        opacity: event.completed ? 0.65 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ filter: 'brightness(0.97)' }}
    >
      {/* Diagonal overlay for multi-person events */}
      {!bg && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'relative' }}>
        {/* Title + checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <p style={{
            fontWeight: 700, fontSize: 13,
            color: member.textColor || colors.textColor,
            lineHeight: 1.3,
            fontFamily: 'var(--font-heading)',
            flex: 1,
            textDecoration: event.completed ? 'line-through' : 'none',
          }}>
            {event.emoji} {event.title}
          </p>

          {/* Circular checkbox — Kinship style */}
          <motion.button
            onClick={e => { e.stopPropagation(); onToggle(event.id) }}
            whileTap={{ scale: 0.80 }}
            style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              border: event.completed
                ? 'none'
                : `1.5px solid ${member.barColor || 'rgba(0,0,0,0.20)'}`,
              background: event.completed
                ? (member.barColor || '#34C759')
                : 'rgba(255,255,255,0.60)',
              cursor: 'pointer', marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              boxShadow: event.completed ? `0 1px 6px ${member.barColor || '#34C759'}40` : 'none',
              transition: 'all 0.2s',
            }}
          >
            <AnimatePresence>
              {event.completed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                  <Check size={12} color="#fff" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Time */}
        <p style={{
          fontWeight: 500, fontSize: 11,
          color: member.textColor || colors.textColor,
          opacity: 0.60, marginTop: 3,
          fontFamily: 'var(--font-body)',
        }}>
          {timeStr}
        </p>
      </div>
    </motion.div>
  )
}
