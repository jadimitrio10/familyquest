import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, SlidersHorizontal, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useWeather } from '@/hooks/useWeather'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { useAppSettings } from '@/hooks/useAppStore'

interface CalendarTopBarProps {
  weekStart: Date
  weekEnd: Date
  onAddEvent: () => void
  onPrev: () => void
  onNext: () => void
  // Member filter — connected to CalendarView state
  activeMember: string | null
  onToggleMember: (id: string) => void
}

export function CalendarTopBar({
  weekStart, weekEnd, onAddEvent, onPrev, onNext,
  activeMember, onToggleMember,
}: CalendarTopBarProps) {
  const weather       = useWeather()
  const { members }   = useMembersStore()
  const { settings }  = useAppSettings()
  const now           = new Date()
  const timeStr       = format(now, 'h:mm aa')
  const rangeStr      = `${format(weekStart,'MMM d')}–${format(weekEnd,'d')}`

  return (
    <div style={{ background: 'var(--bg)', flexShrink: 0 }}>
      {/* ── ROW 1: Family name · time · weather · nav ── */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 28px 12px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32, fontWeight: 700,
          color: '#2D3748',
          letterSpacing: '-0.02em', lineHeight: 1,
          marginRight: 4,
        }}>
          {settings.familyName || 'FamilyQuest'}
        </h1>
        <span style={{ fontSize:26, fontWeight:300, color:'#A0AEC0', fontFamily:'var(--font-body)', lineHeight:1 }}>
          {timeStr}
        </span>
        {weather && (
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:24, fontWeight:300, color:'#A0AEC0', fontFamily:'var(--font-body)' }}>
            <span>{weather.emoji}</span>
            <span>{settings.temperatureUnit==='F' ? `${weather.tempF}°` : `${weather.temp}°`}</span>
          </div>
        )}

        <div style={{ flex:1 }} />

        {/* Week pill */}
        <div style={{ display:'flex', alignItems:'center', gap:3, background:'#fff', border:'1px solid #EEE8E0', padding:'7px 16px', borderRadius:100, cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', color:'#2D3748' }}>Week</span>
          <ChevronRight size={11} color="#A0AEC0" />
        </div>

        {/* Date range */}
        <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1px solid #EEE8E0', borderRadius:100, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <motion.button onClick={onPrev} whileTap={{ scale:0.88 }}
            style={{ width:34, height:36, display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
            <ChevronLeft size={14} color="#718096" />
          </motion.button>
          <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', color:'#2D3748', padding:'0 4px', minWidth:86, textAlign:'center' }}>
            {rangeStr}
          </span>
          <motion.button onClick={onNext} whileTap={{ scale:0.88 }}
            style={{ width:34, height:36, display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
            <ChevronRight size={14} color="#718096" />
          </motion.button>
        </div>

        {/* Filter */}
        <button style={{ width:36, height:36, borderRadius:'50%', border:'1px solid #EEE8E0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <SlidersHorizontal size={15} color="#718096" strokeWidth={1.8} />
        </button>

        {/* + Add Event */}
        <motion.button onClick={onAddEvent} whileHover={{ scale:1.03, y:-1 }} whileTap={{ scale:0.97 }}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', background:'linear-gradient(135deg,#E07B8A,#D45C6B)', color:'#fff', border:'none', borderRadius:100, fontSize:13, fontWeight:700, fontFamily:'var(--font-heading)', cursor:'pointer', boxShadow:'0 4px 14px rgba(224,123,138,0.35)' }}>
          <Plus size={14} strokeWidth={2.5} /> Add Event
        </motion.button>
      </div>

      {/* ── ROW 2: Member filter pills — CLICKABLE ── */}
      <div style={{ display:'flex', gap:8, alignItems:'center', padding:'0 28px 14px', flexWrap:'wrap' }}>

        {/* "All" pill — clears filter */}
        <motion.button
          onClick={() => onToggleMember('')}
          whileHover={{ scale:1.04, y:-1 }}
          whileTap={{ scale:0.96 }}
          style={{
            display:'flex', alignItems:'center', gap:6,
            background: activeMember === null ? '#1C1C1E' : '#fff',
            border: activeMember === null ? 'none' : '1px solid #EEE8E0',
            color: activeMember === null ? '#fff' : '#718096',
            padding:'5px 14px', borderRadius:100, cursor:'pointer',
            boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
            fontSize:12, fontWeight:700, fontFamily:'var(--font-body)',
            transition:'all 0.15s',
          }}
        >
          <span style={{ fontSize:13 }}>🏡</span>
          {settings.familyName?.split(' ')[0] || 'Todos'}
        </motion.button>

        {/* One pill per member — clicking filters the calendar */}
        {members.map(m => {
          const isActive = activeMember === m.id
          return (
            <motion.button
              key={m.id}
              onClick={() => onToggleMember(m.id)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display:'flex', alignItems:'center', gap:7,
                background: isActive ? m.bgColor : '#fff',
                border: isActive
                  ? `2px solid ${m.barColor}`
                  : '1px solid #EEE8E0',
                padding: isActive ? '5px 14px 5px 6px' : '5px 14px 5px 6px',
                borderRadius:100,
                cursor:'pointer',
                boxShadow: isActive
                  ? `0 2px 10px ${m.barColor}40`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition:'all 0.15s',
              }}
            >
              <MemberAvatar member={m} size={24} />
              <span style={{
                fontSize:12, fontWeight: isActive ? 800 : 700,
                color: isActive ? m.textColor : '#2D3748',
                fontFamily:'var(--font-body)',
                whiteSpace:'nowrap',
              }}>
                {m.name}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span style={{ width:6, height:6, borderRadius:'50%', background:m.barColor, flexShrink:0 }} />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
