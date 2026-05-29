import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TaskInstance } from '@/types/database.types'
import { fireConfetti } from '@/components/shared/ConfettiExplosion'

interface KidTaskCardProps {
  instance: TaskInstance
  accentHex: string
  colorHex: string
  onComplete: (instanceId: string) => void
}

export function KidTaskCard({ instance, accentHex, colorHex, onComplete }: KidTaskCardProps) {
  const task = instance.task!
  const isCompleted = !!instance.completed_at
  const [celebrating, setCelebrating] = useState(false)

  function handleDone() {
    if (isCompleted) return
    setCelebrating(true)
    fireConfetti([accentHex, colorHex])
    onComplete(instance.id)
    setTimeout(() => setCelebrating(false), 1500)
  }

  return (
    <motion.div
      layout
      className="rounded-3xl p-6 mb-4 relative overflow-hidden"
      style={{
        background: isCompleted ? `${accentHex}22` : 'white',
        border: `3px solid ${isCompleted ? accentHex : '#f3f4f6'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={celebrating ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
          className="text-7xl leading-none"
        >
          {task.emoji_icon}
        </motion.div>
        <p
          className="font-black text-2xl text-center text-gray-800"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {task.title}
        </p>
        <span className="font-bold text-lg" style={{ color: accentHex }}>
          ⭐ +{task.points_value} stars
        </span>

        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full py-4 rounded-2xl text-center font-black text-xl"
              style={{ background: `${accentHex}22`, color: accentHex }}
            >
              🎉 Done! +{task.points_value} stars!
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              onClick={handleDone}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="w-full py-4 rounded-2xl font-black text-xl text-white"
              style={{ background: accentHex, minHeight: 60 }}
            >
              MARK DONE ✅
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
