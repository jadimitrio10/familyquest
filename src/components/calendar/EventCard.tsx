import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { CalendarEvent, CalendarMember } from '@/types/calendar.types'

// Kinship pastel palette (from Stitch Miller Family HTML)
const KINSHIP = [
  { bg:'#F9D2D2', text:'#6B2020', bar:'#D47070' }, // pink
  { bg:'#D4F1EE', text:'#1A6B64', bar:'#5ABAB3' }, // mint
  { bg:'#E2D6F3', text:'#5B3A8B', bar:'#A080D4' }, // lavender
  { bg:'#C5E5F1', text:'#1A5C7A', bar:'#5BB4D4' }, // sky
  { bg:'#D9EAD3', text:'#2E5E2A', bar:'#70B870' }, // sage
  { bg:'#FAE0C8', text:'#7A3A18', bar:'#D48A50' }, // peach
]

// Repeating diagonal gradient for multi-person events (exact from Stitch HTML)
const DIAGONAL = `repeating-linear-gradient(
  135deg,
  #d4f1ee 0px 10px,
  #f9d2d2 10px 20px,
  #e2d6f3 20px 30px,
  #c5e5f1 30px 40px
)`

interface EventCardProps {
  event: CalendarEvent
  member: CalendarMember & { photoDataUrl?: string; emoji?: string }
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

  // COLOR BY TITLE — each unique task title gets its own Kinship pastel
  // This gives variety: Lavarse → pink, Hacer la cama → mint, Tarea → lavender, etc.
  const titleHash = [...event.title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0)
  const colors    = KINSHIP[titleHash % KINSHIP.length]
  const bg        = colors.bg
  const textC     = colors.text
  const barC      = colors.bar

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animDelay, ease: 'easeOut' }}
      onClick={() => onClick(event)}
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.65)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '10px 12px 10px',
        marginBottom: 6,
        cursor: 'pointer',
        opacity: event.completed ? 0.60 : 1,
        background: bg,
        transition: 'filter 0.15s, transform 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ filter:'brightness(0.97)', y: -1 }}
    >
      {/* Subtle inner glow line at top — like Stitch card style */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'rgba(255,255,255,0.70)', borderRadius:'16px 16px 0 0' }} />

      {/* Title row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        <p style={{
          fontWeight: 700,
          fontSize: 13,
          color: textC,
          lineHeight: 1.3,
          fontFamily: 'var(--font-heading)',
          flex: 1,
          textDecoration: event.completed ? 'line-through' : 'none',
        }}>
          {event.emoji && event.emoji !== '📅' ? `${event.emoji} ` : ''}{event.title}
        </p>

        {/* Circular checkbox — large, mint green like Stitch tasks */}
        <motion.button
          onClick={e => { e.stopPropagation(); onToggle(event.id) }}
          whileTap={{ scale: 0.78 }}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            border: event.completed ? 'none' : `1.5px solid ${barC}80`,
            background: event.completed ? barC : 'rgba(255,255,255,0.55)',
            cursor: 'pointer', marginTop: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: event.completed ? `0 2px 6px ${barC}50` : 'none',
            transition: 'all 0.2s',
          }}
        >
          <AnimatePresence>
            {event.completed && (
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                transition={{ type:'spring', stiffness:500, damping:25 }}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Time + avatar row — like Stitch "10 - 11:30 AM" + avatar at right */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 4 }}>
        <p style={{
          fontWeight: 500, fontSize: 11,
          color: textC, opacity: 0.60,
          fontFamily: 'var(--font-body)',
        }}>
          {timeStr}
        </p>

        {/* Member avatar — bottom right, like in Stitch event cards */}
        <div style={{ display:'flex', alignItems:'center', marginLeft:'auto' }}>
          {member.photoDataUrl ? (
            <img
              src={member.photoDataUrl}
              alt={member.name}
              style={{ width:20, height:20, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.80)', boxShadow:'0 1px 4px rgba(0,0,0,0.12)' }}
            />
          ) : (
            <div style={{
              width:20, height:20, borderRadius:'50%',
              background: barC,
              border: '2px solid rgba(255,255,255,0.80)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 10, fontWeight:700, color:'#fff',
              boxShadow:'0 1px 4px rgba(0,0,0,0.12)',
              fontFamily:'var(--font-body)',
            }}>
              {(member.avatar || member.name || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
