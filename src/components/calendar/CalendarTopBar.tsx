import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, SlidersHorizontal, Plus } from 'lucide-react'
import { format } from 'date-fns'

interface CalendarTopBarProps {
  weekStart: Date
  weekEnd: Date
  onAddEvent: () => void
  onPrev: () => void
  onNext: () => void
}

export function CalendarTopBar({ weekStart, weekEnd, onAddEvent, onPrev, onNext }: CalendarTopBarProps) {
  const now = new Date()
  const timeStr = format(now, 'h:mm aa')
  const dateStr = format(weekStart, 'MMMM d')
  const rangeStr = `${format(weekStart,'MMM d')}–${format(weekEnd,'d')}`

  return (
    <div className="flex items-center px-5 gap-3 flex-shrink-0"
      style={{ height: 56, background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
      {/* Date + time */}
      <div className="flex items-baseline gap-2 flex-1">
        <span style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', fontFamily:'var(--font-heading)' }}>
          {dateStr}
        </span>
        <span style={{ fontSize:15, fontWeight:400, color:'var(--text-3)', fontFamily:'var(--font-body)' }}>
          {timeStr}
        </span>
      </div>

      {/* Week pill */}
      <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
        className="flex items-center gap-1 cursor-pointer"
        style={{ border:'1.5px solid var(--border)', borderRadius:'var(--radius-pill)', padding:'6px 16px', background:'var(--surface)' }}>
        <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', color:'var(--text-1)' }}>Week</span>
        <ChevronRight size={12} color="var(--text-3)" />
      </motion.div>

      {/* Date range nav */}
      <div className="flex items-center"
        style={{ border:'1.5px solid var(--border)', borderRadius:'var(--radius-pill)', background:'var(--surface)', overflow:'hidden' }}>
        <motion.button onClick={onPrev} whileTap={{ scale:0.9 }}
          style={{ width:32, height:34, display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
          <ChevronLeft size={14} color="var(--text-2)" />
        </motion.button>
        <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', color:'var(--text-1)', padding:'0 4px', minWidth:90, textAlign:'center' }}>
          {rangeStr}
        </span>
        <motion.button onClick={onNext} whileTap={{ scale:0.9 }}
          style={{ width:32, height:34, display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
          <ChevronRight size={14} color="var(--text-2)" />
        </motion.button>
      </div>

      {/* Filter */}
      <motion.button whileTap={{ scale:0.93 }}
        style={{ width:36, height:36, borderRadius:'var(--radius-md)', border:'1.5px solid var(--border)', background:'var(--surface)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <SlidersHorizontal size={15} color="var(--text-2)" strokeWidth={1.8} />
      </motion.button>

      {/* + Add Event — Apple primary button */}
      <motion.button
        onClick={onAddEvent}
        whileTap={{ scale:0.96 }}
        className="btn btn-primary"
        style={{ fontSize:13, padding:'9px 18px', gap:6 }}
      >
        <Plus size={14} strokeWidth={2.5} />
        Add Event
      </motion.button>
    </div>
  )
}
