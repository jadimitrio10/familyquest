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
}

export function CalendarTopBar({ weekStart, weekEnd, onAddEvent, onPrev, onNext }: CalendarTopBarProps) {
  const weather      = useWeather()
  const { members }  = useMembersStore()
  const { settings } = useAppSettings()
  const now          = new Date()
  const timeStr      = format(now, 'h:mm aa')
  const rangeStr     = `${format(weekStart,'MMM d')}–${format(weekEnd,'d')}`

  // Pill bg colors matching Stitch (eef2ff, fdf2f2, f5f3ff, f0fdf4)
  const PILL_STYLES = [
    { bg:'#FDF2F2', border:'#FEE2E2' },
    { bg:'#EEF2FF', border:'#DBEAFE' },
    { bg:'#F5F3FF', border:'#EDE9FE' },
    { bg:'#F0FDF4', border:'#DCFCE7' },
    { bg:'#FFF7ED', border:'#FED7AA' },
  ]

  return (
    <div style={{ background: 'var(--bg)', flexShrink: 0 }}>
      {/* ── ROW 1: Family name · time · weather · controls ── */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 28px 12px' }}>

        {/* Family name — Playfair Display LARGE serif like "Miller Family" */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32, fontWeight: 700,
          color: '#2D3748',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginRight: 4,
        }}>
          {settings.familyName || 'FamilyQuest'}
        </h1>

        {/* Time — light weight */}
        <span style={{
          fontSize: 26, fontWeight: 300,
          color: '#A0AEC0',
          fontFamily: 'var(--font-body)',
          lineHeight: 1,
        }}>
          {timeStr}
        </span>

        {/* Weather — icon + temperature */}
        {weather && (
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:24, fontWeight:300, color:'#A0AEC0', fontFamily:'var(--font-body)' }}>
            <span>{weather.emoji}</span>
            <span>{settings.temperatureUnit==='F' ? `${weather.tempF}°` : `${weather.temp}°`}</span>
          </div>
        )}

        <div style={{ flex:1 }} />

        {/* ── Navigation controls ── */}
        {/* Week pill */}
        <motion.div whileHover={{ scale:1.02 }}
          style={{ display:'flex', alignItems:'center', gap:3, background:'#fff', border:'1px solid #EEE8E0', padding:'7px 16px', borderRadius:100, cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', color:'#2D3748' }}>Week</span>
          <ChevronRight size={11} color="#A0AEC0" />
        </motion.div>

        {/* Date range with arrows */}
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

        {/* Filter icon */}
        <button style={{ width:36, height:36, borderRadius:'50%', border:'1px solid #EEE8E0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <SlidersHorizontal size={15} color="#718096" strokeWidth={1.8} />
        </button>

        {/* + Add Event — Kinship style */}
        <motion.button
          onClick={onAddEvent}
          whileHover={{ scale:1.03, y:-1 }}
          whileTap={{ scale:0.97 }}
          style={{
            display:'flex', alignItems:'center', gap:7,
            padding:'9px 20px',
            background:'linear-gradient(135deg,#E07B8A,#D45C6B)',
            color:'#fff', border:'none', borderRadius:100,
            fontSize:13, fontWeight:700,
            fontFamily:'var(--font-heading)',
            cursor:'pointer',
            boxShadow:'0 4px 14px rgba(224,123,138,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Event
        </motion.button>
      </div>

      {/* ── ROW 2: Member pills — exactly like Stitch ── */}
      <div style={{ display:'flex', gap:8, alignItems:'center', padding:'0 28px 14px', flexWrap:'wrap' }}>
        {/* Family "vacation" pill placeholder */}
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid #EEE8E0', padding:'5px 14px', borderRadius:100, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize:13 }}>🏡</span>
          <span style={{ fontSize:12, fontWeight:600, color:'#718096', fontFamily:'var(--font-body)' }}>
            {settings.familyName || 'Family'}
          </span>
          <span style={{ fontSize:11, color:'#A0AEC0', fontFamily:'var(--font-body)' }}>
            {format(now, 'MMM d')}
          </span>
        </div>

        {/* One pill per member — like "Dad 1/20", "Ellie 1/20" in Stitch */}
        {members.map((m, i) => {
          const pill = PILL_STYLES[i % PILL_STYLES.length]
          return (
            <motion.div
              key={m.id}
              whileHover={{ scale:1.04, y:-1 }}
              whileTap={{ scale:0.97 }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background: m.bgColor || pill.bg,
                border: `1px solid ${m.barColor ? m.barColor + '50' : pill.border}`,
                padding:'5px 12px 5px 6px',
                borderRadius:100,
                cursor:'pointer',
                boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Circular avatar — photo or emoji */}
              <MemberAvatar member={m} size={24} />
              <span style={{ fontSize:12, fontWeight:700, color:m.textColor||'#2D3748', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }}>
                {m.name}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
