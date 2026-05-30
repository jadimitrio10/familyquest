import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Profile, TaskInstance } from '@/types/database.types'
import type { MemberTheme } from '@/lib/memberThemes'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BorderBeam } from '@/components/magicui/border-beam'
import { TimeOfDayRing } from './TimeOfDayRing'
import { TaskCard } from './TaskCard'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'

interface MemberColumnProps {
  member: Profile
  instances: TaskInstance[]
  theme: MemberTheme
  onComplete: (instanceId: string) => void
  colIndex: number
}

const TIME_SLOTS = [
  { key: 'morning',   label: 'Mañana',   emoji: '🌅' },
  { key: 'afternoon', label: 'Tarde',    emoji: '☀️' },
  { key: 'evening',   label: 'Noche',    emoji: '🌙' },
  { key: 'anytime',   label: 'Tareas',   emoji: '✅' },
] as const

export function MemberColumn({ member, instances, theme, onComplete, colIndex }: MemberColumnProps) {
  const navigate = useNavigate()
  const [isActive, setIsActive] = useState(false)
  const [allDoneCelebrated, setAllDoneCelebrated] = useState(false)

  const bySlot = (slot: string) => instances.filter(i => i.task?.time_of_day === slot)
  const doneInSlot = (slot: string) => bySlot(slot).filter(i => !!i.completed_at).length
  const totalDone = instances.filter(i => !!i.completed_at).length
  const total = instances.length

  function handleComplete(instanceId: string) {
    onComplete(instanceId)
    // Check if all done after this completion
    const newDone = totalDone + 1
    if (newDone === total && total > 0 && !allDoneCelebrated) {
      setAllDoneCelebrated(true)
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: [theme.accent, theme.accentLight, '#fff', '#ffd700'],
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24, delay: colIndex * 0.08 }}
      onClick={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      className="relative flex-shrink-0 flex flex-col rounded-3xl overflow-hidden focus:outline-none"
      style={{
        width: 285,
        height: 'calc(100vh - 56px)',
        background: '#FFFFFF',
        boxShadow: isActive
          ? `0 8px 32px ${theme.accent}28`
          : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* magicui BorderBeam — only when active */}
      {isActive && (
        <BorderBeam
          colorFrom={theme.accentLight}
          colorTo={theme.accent}
          size={120}
          duration={4}
          borderWidth={2}
        />
      )}

      {/* ── HEADER ── */}
      <button
        onClick={() => navigate(`/kid/${member.id}`)}
        className="w-full text-left flex-shrink-0"
        style={{ background: theme.headerBg, padding: '14px 14px 12px' }}
      >
        {/* Row 1: avatar + name + points */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar circle */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 52,
              height: 52,
              background: `linear-gradient(135deg, ${theme.headerBg}, ${theme.accentLight}66)`,
              border: `2.5px solid ${theme.accent}`,
              fontSize: 26,
              boxShadow: `0 3px 10px ${theme.accent}30`,
            }}
          >
            {member.avatar_emoji}
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="member-name truncate" style={{ color: '#1F2937' }}>
              {member.name}
            </p>
            {/* points counter — magicui NumberTicker */}
            <div
              className="inline-flex items-center gap-1 mt-0.5"
              style={{ color: theme.accentDark }}
            >
              <span style={{ fontSize: 13 }}>⭐</span>
              <NumberTicker
                value={member.points_balance}
                className="points-badge"
                style={{ color: theme.accentDark } as React.CSSProperties}
              />
              <span className="points-badge opacity-70">pts</span>
            </div>
          </div>

          {/* task count */}
          <div className="text-right flex-shrink-0">
            <p
              className="font-bold text-sm"
              style={{ color: theme.accent }}
            >
              {totalDone}/{total}
            </p>
            <p className="section-label" style={{ color: theme.textMuted }}>
              listas
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="rounded-full mb-3 overflow-hidden"
          style={{ height: 3, background: `${theme.accent}20` }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: theme.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${total ? (totalDone / total) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Time-of-day rings (magicui AnimatedCircularProgressBar) */}
        <div className="flex gap-3 justify-center">
          {TIME_SLOTS.map(({ key, label }) => (
            <TimeOfDayRing
              key={key}
              label={label}
              completed={doneInSlot(key)}
              total={bySlot(key).length}
              ringColor={theme.ringColor}
              ringBg={theme.ringBg}
            />
          ))}
        </div>
      </button>

      {/* ── TASKS ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '10px 10px 16px', background: theme.columnBg }}
      >
        {TIME_SLOTS.map(({ key, label, emoji }) => {
          const slotInst = bySlot(key)
          if (slotInst.length === 0) return null
          return (
            <div key={key} className="mb-3">
              {/* Section header */}
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <span style={{ fontSize: 13 }}>{emoji}</span>
                <span className="section-label" style={{ color: theme.textMuted }}>
                  {label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: `${theme.accent}20` }}
                />
              </div>

              {/* Cards — stagger animation */}
              {slotInst.map((inst, idx) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 26,
                    delay: colIndex * 0.08 + idx * 0.05,
                  }}
                >
                  <TaskCard
                    instance={inst}
                    theme={theme}
                    onComplete={handleComplete}
                  />
                </motion.div>
              ))}
            </div>
          )
        })}

        {instances.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 gap-2">
            <span className="animate-float text-3xl">🎉</span>
            <p className="section-label" style={{ color: theme.textMuted }}>
              Sin tareas hoy
            </p>
          </div>
        )}

        {/* All done celebration */}
        <AnimatePresence>
          {allDoneCelebrated && totalDone === total && total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mx-2 mt-2 py-3 px-4 rounded-2xl text-center"
              style={{ background: theme.headerBg }}
            >
              <p
                className="font-heading font-bold text-sm"
                style={{ color: theme.accent }}
              >
                🏆 ¡Todo listo!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
