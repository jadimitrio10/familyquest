import { motion } from 'framer-motion'
import type { CalendarMember, CalendarEvent } from '@/types/calendar.types'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BorderBeam } from '@/components/magicui/border-beam'

interface MemberChipProps {
  member: CalendarMember
  events: CalendarEvent[]
  isActive: boolean
  onClick: () => void
}

export function MemberChip({ member, events, isActive, onClick }: MemberChipProps) {
  const total = events.length
  const done = events.filter(e => e.completed).length
  const pct = total === 0 ? 0 : (done / total) * 100

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-col gap-2 text-left overflow-hidden flex-1"
      style={{
        padding: '10px 14px',
        borderRadius: 14,
        background: member.bgColor,
        border: isActive
          ? `2px solid ${member.barColor}`
          : `1px solid ${member.barColor}30`,
        opacity: isActive ? 1 : 0.85,
        filter: isActive ? 'none' : 'grayscale(0.15)',
        transition: 'opacity 200ms, filter 200ms, border-color 200ms',
        cursor: 'pointer',
        minWidth: 0,
      }}
    >
      {/* BorderBeam when active — magicui */}
      {isActive && (
        <BorderBeam
          colorFrom={member.bgColor}
          colorTo={member.barColor}
          size={160}
          duration={5}
          borderWidth={2}
        />
      )}

      {/* Row 1: avatar + name + count */}
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: `${member.barColor}22`,
            border: `2px solid ${member.barColor}`,
            fontSize: 16,
          }}
        >
          {member.avatar}
        </div>

        <span style={{
          fontWeight: 600,
          fontSize: 14,
          color: member.textColor,
          fontFamily: 'Inter, sans-serif',
          flex: 1,
        }}>
          {member.name}
        </span>

        {/* Badge 0/12 — NumberTicker */}
        <span style={{
          fontWeight: 600,
          fontSize: 12,
          color: 'var(--text-3)',
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <NumberTicker value={done} className="tabular-nums" />
          /{total}
        </span>
      </div>

      {/* Row 2: progress bar */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: `${member.barColor}25`,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{
            height: '100%',
            borderRadius: 2,
            background: member.barColor,
          }}
        />
      </div>
    </motion.button>
  )
}
