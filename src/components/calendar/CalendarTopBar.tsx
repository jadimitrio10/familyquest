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
  const rangeStr = `${format(weekStart, 'MMM d')}–${format(weekEnd, 'd')}`

  return (
    <div className="flex items-center px-5 flex-shrink-0" style={{ height: 56, background: 'var(--bg)', gap: 10 }}>
      {/* Date + time */}
      <div className="flex items-baseline gap-2 flex-1">
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Inter, sans-serif' }}>
          {dateStr}
        </span>
        <span style={{ fontSize: 17, fontWeight: 300, color: 'var(--text-3)', fontFamily: 'Inter, sans-serif' }}>
          {timeStr}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Week pill */}
        <div style={{ display:'flex', alignItems:'center', gap:4, border:'1px solid var(--border)', borderRadius:20, padding:'6px 14px', background:'var(--surface)', cursor:'pointer' }}>
          <span style={{ fontSize:13, fontWeight:500, fontFamily:'Inter, sans-serif', color:'var(--text-1)' }}>Week</span>
          <ChevronRight size={12} color="var(--text-3)" />
        </div>

        {/* Date range pill with nav */}
        <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--border)', borderRadius:20, background:'var(--surface)', overflow:'hidden' }}>
          <button onClick={onPrev} style={{ width:30, height:34, display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
            <ChevronLeft size={14} color="var(--text-2)" />
          </button>
          <span style={{ fontSize:13, fontWeight:500, fontFamily:'Inter, sans-serif', color:'var(--text-1)', padding:'0 2px', minWidth:90, textAlign:'center' }}>
            {rangeStr}
          </span>
          <button onClick={onNext} style={{ width:30, height:34, display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
            <ChevronRight size={14} color="var(--text-2)" />
          </button>
        </div>

        {/* Filter */}
        <button style={{ width:36, height:36, borderRadius:18, border:'1px solid var(--border)', background:'var(--surface)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <SlidersHorizontal size={15} color="var(--text-2)" strokeWidth={1.8} />
        </button>

        {/* + Add Event */}
        <motion.button
          onClick={onAddEvent}
          whileHover={{ background: '#2D2D3E' }}
          whileTap={{ scale: 0.96 }}
          style={{ display:'flex', alignItems:'center', gap:6, background:'var(--text-1)', color:'#fff', borderRadius:20, padding:'8px 18px', fontSize:13, fontWeight:600, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', transition:'background 150ms' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Event
        </motion.button>
      </div>
    </div>
  )
}
