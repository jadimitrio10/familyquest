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
  const weather     = useWeather()
  const { members } = useMembersStore()
  const { settings } = useAppSettings()
  const now         = new Date()
  const timeStr     = format(now, 'h:mm aa')
  const rangeStr    = `${format(weekStart, 'MMM d')}–${format(weekEnd, 'd')}`

  const MEMBER_PILL_COLORS = [
    { bg: '#EEF2FF', border: '#DBEAFE' },
    { bg: '#FDF2F2', border: '#FEE2E2' },
    { bg: '#F5F3FF', border: '#EDE9FE' },
    { bg: '#F0FDF4', border: '#DCFCE7' },
    { bg: '#FFF7ED', border: '#FED7AA' },
  ]

  return (
    <div style={{ background: 'var(--bg)', padding: '18px 24px 14px', flexShrink: 0 }}>
      {/* Row 1: Family name + time + weather */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
        {/* Family name — Playfair Display SERIF */}
        <h1 className="font-serif" style={{
          fontSize: 30,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {settings.familyName || 'FamilyQuest'}
        </h1>

        {/* Time */}
        <span style={{ fontSize: 26, fontWeight: 300, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
          {timeStr}
        </span>

        {/* Weather */}
        {weather && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 24, fontWeight: 300, color: 'var(--text-3)' }}>
            <span>{weather.emoji}</span>
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {settings.temperatureUnit === 'F' ? `${weather.tempF}°` : `${weather.temp}°`}
            </span>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Nav pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Week pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--border-soft)', borderRadius: 100, padding: '6px 16px', background: '#fff', cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--text-1)' }}>Week</span>
            <ChevronRight size={11} color="var(--text-3)" />
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-soft)', borderRadius: 100, background: '#fff', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <motion.button onClick={onPrev} whileTap={{ scale: 0.9 }}
              style={{ width: 32, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <ChevronLeft size={14} color="var(--text-2)" />
            </motion.button>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--text-1)', padding: '0 4px', minWidth: 88, textAlign: 'center' }}>
              {rangeStr}
            </span>
            <motion.button onClick={onNext} whileTap={{ scale: 0.9 }}
              style={{ width: 32, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <ChevronRight size={14} color="var(--text-2)" />
            </motion.button>
          </div>

          {/* Filter */}
          <button className="btn-icon" style={{ borderRadius: 100 }}>
            <SlidersHorizontal size={14} strokeWidth={1.8} />
          </button>

          {/* + Add Event */}
          <motion.button
            onClick={onAddEvent}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{ fontSize: 13, padding: '9px 18px', gap: 6 }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Event
          </motion.button>
        </div>
      </div>

      {/* Row 2: Member pills — Kinship style */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Vacation-style decorative pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid var(--border-soft)', padding: '5px 14px', borderRadius: 100, boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: 14 }}>🏠</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>
            {settings.familyName || 'Family'}
          </span>
        </div>

        {/* One pill per member */}
        {members.map((m, i) => {
          const colors = MEMBER_PILL_COLORS[i % MEMBER_PILL_COLORS.length]
          return (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: m.bgColor || colors.bg,
                border: `1px solid ${m.barColor ? m.barColor + '40' : colors.border}`,
                padding: '5px 12px 5px 6px',
                borderRadius: 100,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <MemberAvatar member={m} size={22} />
              <span style={{ fontSize: 12, fontWeight: 700, color: m.textColor || 'var(--text-1)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {m.name}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
