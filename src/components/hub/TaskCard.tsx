import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TaskInstance } from '@/types/database.types'
import { fireConfetti } from '@/components/shared/ConfettiExplosion'

interface TaskCardProps {
  instance: TaskInstance
  accentHex: string
  colorHex: string
  onComplete: (instanceId: string) => void
}

export function TaskCard({ instance, accentHex, colorHex, onComplete }: TaskCardProps) {
  const task = instance.task!
  const isCompleted = !!instance.completed_at
  const [justCompleted, setJustCompleted] = useState(false)

  function handleCheck() {
    if (isCompleted) return
    setJustCompleted(true)
    fireConfetti([accentHex, colorHex])
    onComplete(instance.id)
  }

  const timeLabel = task.due_time
    ? `${task.due_time} · ${task.frequency}`
    : task.frequency !== 'daily' ? task.frequency : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 mb-3 relative overflow-hidden"
      style={{
        background: isCompleted ? `${accentHex}22` : 'white',
        border: `2px solid ${isCompleted ? accentHex : '#f3f4f6'}`,
        boxShadow: isCompleted ? `0 0 0 0` : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-4xl mb-1 text-center leading-none">{task.emoji_icon}</div>
          <p
            className="font-bold text-gray-800 text-center"
            style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15 }}
          >
            {task.title}
          </p>
          {timeLabel && (
            <p className="text-xs text-gray-400 text-center mt-0.5" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              {timeLabel}
            </p>
          )}
          <div className="flex justify-center mt-1">
            <span className="text-xs font-semibold" style={{ color: accentHex }}>
              ☆ {task.points_value} pts
            </span>
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={isCompleted}
          className="shrink-0 mt-1"
          style={{ minWidth: 32, minHeight: 32 }}
        >
          <motion.div
            animate={isCompleted ? { scale: [1, 1.3, 1], backgroundColor: accentHex } : {}}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: accentHex,
              background: isCompleted ? accentHex : 'transparent',
            }}
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-white text-sm font-bold"
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </div>

      {/* Star burst particles */}
      <AnimatePresence>
        {justCompleted && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 0.5,
                  x: Math.cos((i / 6) * Math.PI * 2) * 40,
                  y: Math.sin((i / 6) * Math.PI * 2) * 40,
                }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="absolute text-sm pointer-events-none"
                style={{ top: '50%', right: '1.5rem' }}
                onAnimationComplete={() => { if (i === 5) setJustCompleted(false) }}
              >
                ⭐
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
