import { motion } from 'framer-motion'
import type { CalendarEvent } from '@/types/calendar.types'
import { BorderBeam } from '@/components/magicui/border-beam'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { MemberAvatar } from '@/components/shared/MemberAvatar'

// Accept any object with the shape we need
interface ChipMember {
  id: string; name: string
  emoji?: string        // from Member
  avatar?: string       // from CalendarMember
  photoDataUrl?: string
  avatarUrl?: string    // from CalendarMember
  bgColor: string; textColor: string; barColor: string
}

interface MemberChipProps {
  member: ChipMember
  events: CalendarEvent[]
  isActive: boolean
  onClick: () => void
}

export function MemberChip({ member, events, isActive, onClick }: MemberChipProps) {
  const total = events.length
  const done  = events.filter(e => e.completed).length
  const pct   = total === 0 ? 0 : (done / total) * 100

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="relative flex flex-col gap-2 text-left overflow-hidden flex-1"
      style={{ padding:'10px 14px', borderRadius:14, background:member.bgColor, border:isActive?`2px solid ${member.barColor}`:`1px solid ${member.barColor}30`, opacity:isActive?1:0.75, filter:isActive?'none':'grayscale(0.2)', transition:'opacity 200ms, filter 200ms, border-color 200ms', cursor:'pointer', minWidth:0 }}
    >
      {isActive && <BorderBeam colorFrom={member.bgColor} colorTo={member.barColor} size={160} duration={5} borderWidth={2}/>}

      {/* Row 1: avatar + name + count */}
      <div className="flex items-center gap-2">
        {/* Show photo if available, else emoji/avatar */}
        {(member.photoDataUrl || member.avatarUrl) ? (
          <img src={member.photoDataUrl ?? member.avatarUrl} alt={member.name}
            style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', border:`2px solid ${member.barColor}`, flexShrink:0 }}/>
        ) : (
          <div style={{ width:32, height:32, borderRadius:'50%', background:member.bgColor, border:`2px solid ${member.barColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
            {member.emoji ?? member.avatar ?? '👤'}
          </div>
        )}
        <span style={{ fontWeight:600, fontSize:14, color:member.textColor, fontFamily:'Inter', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {member.name}
        </span>
        <span style={{ fontWeight:600, fontSize:12, color:'var(--text-3)', fontFamily:'Inter', display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
          <NumberTicker value={done} className="tabular-nums"/>/{total}
        </span>
      </div>

      {/* Row 2: progress bar */}
      <div style={{ height:3, borderRadius:2, background:`${member.barColor}25`, overflow:'hidden' }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
          transition={{ type:'spring', stiffness:120, damping:20 }}
          style={{ height:'100%', borderRadius:2, background:member.barColor }}/>
      </div>
    </motion.button>
  )
}
