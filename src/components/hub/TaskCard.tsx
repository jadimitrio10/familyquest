import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { TaskInstance } from '@/types/database.types'
import type { MemberTheme } from '@/lib/memberThemes'
import confetti from 'canvas-confetti'

interface TaskCardProps {
  instance: TaskInstance
  theme: MemberTheme
  onComplete: (instanceId: string) => void
}

// 8 star particles burst from the checkbox
function StarBurst({ accent }: { accent: string }) {
  return (
    <>
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * 2 * Math.PI
        const dist = 36
        return (
          <motion.span
            key={i}
            className="absolute text-xs pointer-events-none select-none"
            style={{ right: 9, top: '50%', zIndex: 20 }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: 0.3,
            }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.03 }}
          >
            ⭐
          </motion.span>
        )
      })}
    </>
  )
}

export function TaskCard({ instance, theme, onComplete }: TaskCardProps) {
  const task = instance.task!
  const done = !!instance.completed_at
  const [showBurst, setShowBurst] = useState(false)

  function handleCheck() {
    if (done) return
    setShowBurst(true)
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.65 },
      colors: [theme.accent, theme.accentLight, '#fff'],
      scalar: 0.8,
    })
    onComplete(instance.id)
    setTimeout(() => setShowBurst(false), 600)
  }

  const timeLabel = task.due_time
    ? `${task.due_time} · ${task.frequency}`
    : task.frequency !== 'daily' ? task.frequency : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="relative flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl"
      style={{
        background: done ? theme.cardCompletedBg : theme.cardBg,
        border: `1.5px solid ${done ? 'transparent' : theme.cardBorder}`,
        boxShadow: done ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'background 400ms ease, border-color 300ms ease',
        minHeight: 64,
      }}
    >
      {/* Emoji */}
      <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
        {task.emoji_icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Task title */}
        <p
          className="task-title truncate"
          style={{
            color: done ? theme.textOnCompleted : '#1F2937',
            textDecoration: done ? 'line-through' : 'none',
            transition: 'color 300ms ease',
          }}
        >
          {task.title}
        </p>

        {/* Bottom row: time pill + star badge */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Time pill */}
          {timeLabel && (
            <span
              className="time-label inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: done ? 'rgba(255,255,255,0.25)' : theme.accentDark + '18',
                color: done ? theme.textOnCompleted : theme.accentDark,
              }}
            >
              <Clock size={11} strokeWidth={2.5} />
              {timeLabel}
            </span>
          )}

          {/* Star badge — outline star, no background */}
          <span
            className="points-badge inline-flex items-center gap-1"
            style={{ color: done ? 'rgba(255,255,255,0.85)' : '#9CA3AF' }}
          >
            ☆ {task.points_value}
          </span>
        </div>
      </div>

      {/* Checkbox — SIMPLE CIRCLE outline / filled */}
      <div className="relative shrink-0">
        <motion.button
          onClick={handleCheck}
          disabled={done}
          whileTap={done ? {} : { scale: 0.85 }}
          animate={done
            ? { scale: [1, 1.4, 0.85, 1.05, 1] }
            : { scale: 1 }
          }
          transition={done
            ? { duration: 0.4, times: [0, 0.25, 0.55, 0.8, 1] }
            : { type: 'spring', stiffness: 400, damping: 17 }
          }
          className="flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: done ? 'none' : `2px solid ${theme.checkboxBorder}`,
            background: done ? theme.checkboxFilled : 'transparent',
            boxShadow: done ? `0 2px 8px ${theme.checkboxFilled}50` : 'none',
            cursor: done ? 'default' : 'pointer',
            flexShrink: 0,
            transition: 'background 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
          }}
        >
          <AnimatePresence>
            {done && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0 }}
                style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1 }}
              >
                ✓
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Star burst particles */}
        <AnimatePresence>
          {showBurst && <StarBurst accent={theme.accent} />}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
