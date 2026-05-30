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

export function DayColumn({ label, num, isToday, events, members, activeMemberId, onToggle, onEventClick, colIndex }: DayColumnProps) {
  const visible = activeMemberId ? events.filter(e => e.memberId === activeMemberId) : events

  return (
    <motion.div
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.28, delay:colIndex*0.04, ease:'easeOut' }}
      style={{ borderRight:'1px solid var(--border)', height:'100%', overflow:'hidden', display:'flex', flexDirection:'column' }}
    >
      {/* Day header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderBottom:'1px solid var(--border)', flexShrink:0, background:'var(--bg)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', fontFamily:'Inter' }}>{label}</span>
          {isToday ? (
            <span style={{ width:26, height:26, borderRadius:'50%', background:'var(--blue)', color:'#fff', fontSize:14, fontWeight:700, fontFamily:'Inter', display:'flex', alignItems:'center', justifyContent:'center' }}>{num}</span>
          ) : (
            <span style={{ fontSize:17, fontWeight:700, color:'var(--text-1)', fontFamily:'Inter' }}>{num}</span>
          )}
        </div>
        {visible.length > 0 && (
          <span style={{ fontSize:10, fontWeight:500, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>
            {visible.length} EVENT{visible.length!==1?'S':''} +
          </span>
        )}
      </div>

      {/* Events */}
      <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
        {visible.map((event, idx) => {
          const member = members.find(m => m.id === event.memberId)
          // Skip events whose member no longer exists
          if (!member) return null
          return (
            <div key={event.id} style={{ padding:'0 6px' }}>
              <EventCard event={event} member={member} onToggle={onToggle} onClick={onEventClick} animDelay={colIndex*0.04+idx*0.04}/>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
