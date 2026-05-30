import { motion } from 'framer-motion'
import type { CalendarEvent, CalendarMember } from '@/types/calendar.types'

interface EventCardProps {
  event: CalendarEvent
  member: CalendarMember
  onToggle: (id: string) => void
  onClick: (event: CalendarEvent) => void
  animDelay?: number
}

export function EventCard({ event, member, onToggle, onClick, animDelay = 0 }: EventCardProps) {
  const timeStr = event.allDay ? 'All day'
    : event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}`
    : event.startTime ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: animDelay, ease: 'easeOut' }}
      onClick={() => onClick(event)}
      style={{ background:member.bgColor, borderRadius:10, padding:'9px 12px', marginBottom:6, cursor:'pointer', transition:'filter 150ms ease', opacity:event.completed?0.7:1 }}
      whileHover={{ filter:'brightness(0.95)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <p style={{ fontWeight:500, fontSize:13, color:member.textColor, lineHeight:1.3, fontFamily:'Inter', flex:1, textDecoration:event.completed?'line-through':'none' }}>
          {event.emoji} {event.title}
        </p>
        <motion.button
          onClick={e => { e.stopPropagation(); onToggle(event.id) }}
          whileTap={{ scale: 0.82 }}
          animate={event.completed ? { scale:[1,1.3,1] } : {}}
          transition={{ type:'spring', stiffness:400, damping:16 }}
          style={{ width:20, height:20, borderRadius:'50%', border:event.completed?'none':`1.5px solid ${member.barColor}66`, background:event.completed?member.barColor:'transparent', cursor:'pointer', marginTop:1, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}
        >
          {event.completed && <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>✓</span>}
        </motion.button>
      </div>
      <p style={{ fontWeight:400, fontSize:11, color:member.textColor, opacity:0.55, marginTop:3, fontFamily:'Inter' }}>
        {timeStr}
      </p>
    </motion.div>
  )
}
