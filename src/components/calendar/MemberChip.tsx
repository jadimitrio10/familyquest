import { motion } from 'framer-motion'
import type { CalendarEvent } from '@/types/calendar.types'
import { BorderBeam } from '@/components/magicui/border-beam'
import { NumberTicker } from '@/components/magicui/number-ticker'

interface ChipMember {
  id: string; name: string
  emoji?: string; avatar?: string; photoDataUrl?: string; avatarUrl?: string
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
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex flex-col gap-2 text-left overflow-hidden flex-1"
      style={{
        padding: '12px 16px',
        borderRadius: 20,
        background: member.bgColor,
        border: isActive ? `2px solid ${member.barColor}` : `1.5px solid ${member.barColor}30`,
        opacity: isActive ? 1 : 0.72,
        cursor: 'pointer',
        minWidth: 0,
        boxShadow: isActive
          ? `0 4px 20px ${member.barColor}30, inset 0 1px 0 rgba(255,255,255,0.6)`
          : `0 2px 8px rgba(0,0,0,0.06)`,
        transition: 'opacity 200ms, border-color 200ms, box-shadow 200ms',
      }}
    >
      {isActive && (
        <BorderBeam colorFrom={member.bgColor} colorTo={member.barColor} size={200} duration={6} borderWidth={2} />
      )}

      {/* Row 1: avatar + name + count */}
      <div className="flex items-center gap-2.5">
        {(member.photoDataUrl || member.avatarUrl) ? (
          <img src={member.photoDataUrl ?? member.avatarUrl} alt={member.name}
            style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', border:`2.5px solid ${member.barColor}`, flexShrink:0 }} />
        ) : (
          <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${member.bgColor},${member.barColor}44)`, border:`2.5px solid ${member.barColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
            {member.emoji ?? member.avatar ?? '👤'}
          </div>
        )}

        <span style={{ fontWeight:700, fontSize:14, color:member.textColor, fontFamily:'var(--font-heading)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {member.name}
        </span>

        <span style={{ fontWeight:600, fontSize:12, color:member.textColor, opacity:0.7, fontFamily:'var(--font-body)', flexShrink:0, display:'flex', alignItems:'center', gap:2 }}>
          <NumberTicker value={done} className="tabular-nums" />/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height:3, borderRadius:2, background:`${member.barColor}25`, overflow:'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type:'spring', stiffness:120, damping:20 }}
          style={{ height:'100%', borderRadius:2, background:member.barColor }}
        />
      </div>
    </motion.button>
  )
}
