import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { useFamilyStore } from '@/stores/familyStore'
import { useTasksStore } from '@/stores/tasksStore'
import { getThemeByIndex } from '@/lib/memberThemes'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { AnimatedCircularProgressBar } from '@/components/magicui/animated-circular-progress-bar'

export function KidFocusMode() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const { members } = useFamilyStore()
  const { instances, markComplete } = useTasksStore()
  const [justDone, setJustDone] = useState<string | null>(null)
  const [allCelebrated, setAllCelebrated] = useState(false)

  const memberIdx = members.findIndex(m => m.id === memberId)
  const member = members[memberIdx]
  if (!member) return null

  const theme = getThemeByIndex(memberIdx >= 0 ? memberIdx : 0)
  const myInst = instances.filter(i => i.profile_id === member.id)
  const completed = myInst.filter(i => !!i.completed_at).length
  const total = myInst.length

  function handleDone(instanceId: string) {
    const inst = myInst.find(i => i.id === instanceId)
    if (!inst || inst.completed_at) return
    const pts = inst.task?.points_value ?? 10

    setJustDone(instanceId)
    markComplete(instanceId, pts)

    confetti({
      particleCount: 80,
      spread: 65,
      origin: { y: 0.65 },
      colors: [theme.accent, theme.accentLight, '#fff', '#ffd700'],
    })

    toast.success(`🎉 +${pts} estrellas!`, {
      duration: 2200,
      style: {
        borderRadius: '18px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 900,
        fontSize: 17,
        background: theme.accent,
        color: '#fff',
      },
    })

    // Check if all done
    const newCompleted = completed + 1
    if (newCompleted === total && !allCelebrated) {
      setAllCelebrated(true)
      setTimeout(() => {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: [theme.accent, theme.accentLight, '#ffd700', '#fff'] })
      }, 300)
    }

    setTimeout(() => setJustDone(null), 700)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed inset-0 z-50 overflow-auto"
      style={{
        background: `linear-gradient(145deg, ${theme.headerBg} 0%, ${theme.headerBg}cc 60%, ${theme.accentLight}22 100%)`,
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 font-bold rounded-2xl px-4 py-2 z-10"
        style={{
          background: 'rgba(255,255,255,0.75)',
          color: theme.accentDark,
          backdropFilter: 'blur(8px)',
          minHeight: 42,
          fontFamily: 'Nunito, sans-serif',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-md mx-auto px-5 pt-16 pb-10">
        {/* Greeting */}
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-5"
        >
          <motion.div
            animate={{ scale: [1, 1.07, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center mb-3 rounded-3xl"
            style={{
              width: 88, height: 88,
              fontSize: 48,
              background: 'rgba(255,255,255,0.85)',
              boxShadow: `0 6px 24px ${theme.accent}30`,
            }}
          >
            {member.avatar_emoji}
          </motion.div>

          <h1
            className="font-heading font-black"
            style={{ fontSize: 38, color: '#1F2937', lineHeight: 1.1 }}
          >
            ¡Hola, {member.name}! 🌟
          </h1>
          <p
            className="font-medium mt-1.5"
            style={{ fontSize: 16, color: '#6B7280', fontFamily: 'Quicksand, sans-serif' }}
          >
            {completed === total && total > 0
              ? '🎉 ¡Todo completado!'
              : `${total - completed} tarea${total - completed !== 1 ? 's' : ''} pendiente${total - completed !== 1 ? 's' : ''}`
            }
          </p>
        </motion.div>

        {/* Progress ring — magicui AnimatedCircularProgressBar */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <AnimatedCircularProgressBar
              value={completed}
              min={0}
              max={Math.max(total, 1)}
              gaugePrimaryColor={theme.accent}
              gaugeSecondaryColor={theme.ringBg}
              className="!size-28 !text-lg !font-black"
            />
          </div>
        </div>

        {/* Stars balance — magicui NumberTicker */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3 rounded-2xl py-3 px-6 mb-6"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)',
            border: `1.5px solid ${theme.accent}25`,
          }}
        >
          <span style={{ fontSize: 32 }}>⭐</span>
          <div>
            <div className="flex items-baseline gap-1">
              <NumberTicker
                value={member.points_balance}
                className="font-heading font-black"
                style={{ fontSize: 36, color: theme.accent } as React.CSSProperties}
              />
            </div>
            <p
              className="points-badge opacity-60"
              style={{ color: theme.accentDark }}
            >
              Mis Estrellas
            </p>
          </div>
        </motion.div>

        {/* Task list */}
        <div className="space-y-3">
          {myInst.map((inst, idx) => {
            const done = !!inst.completed_at
            return (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + idx * 0.06, type: 'spring', stiffness: 300, damping: 26 }}
                className="rounded-3xl relative overflow-hidden"
                style={{
                  background: done ? theme.cardCompletedBg : 'rgba(255,255,255,0.88)',
                  border: `2px solid ${done ? 'transparent' : 'rgba(255,255,255,0.9)'}`,
                  backdropFilter: 'blur(8px)',
                  boxShadow: done ? 'none' : '0 3px 16px rgba(0,0,0,0.07)',
                  padding: '18px 18px 16px',
                }}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  {/* Emoji */}
                  <motion.div
                    animate={justDone === inst.id
                      ? { scale: [1, 1.45, 1], rotate: [0, 15, -15, 0] }
                      : {}
                    }
                    className="flex items-center justify-center rounded-2xl"
                    style={{
                      width: 72, height: 72,
                      fontSize: 44,
                      background: done ? 'rgba(255,255,255,0.25)' : theme.headerBg,
                    }}
                  >
                    {inst.task?.emoji_icon}
                  </motion.div>

                  <p
                    className="font-heading font-bold"
                    style={{
                      fontSize: 20,
                      color: done ? theme.textOnCompleted : '#1F2937',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {inst.task?.title}
                  </p>

                  <span
                    className="points-badge px-3 py-1 rounded-full"
                    style={{
                      background: done ? 'rgba(255,255,255,0.25)' : `${theme.accent}15`,
                      color: done ? theme.textOnCompleted : theme.accent,
                    }}
                  >
                    ⭐ +{inst.task?.points_value} estrellas
                  </span>

                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full py-3 rounded-2xl font-heading font-bold text-lg"
                        style={{
                          background: 'rgba(255,255,255,0.3)',
                          color: theme.textOnCompleted,
                        }}
                      >
                        ✓ ¡Completado!
                      </motion.div>
                    ) : (
                      <motion.button
                        key="cta"
                        onClick={() => handleDone(inst.id)}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ filter: 'brightness(0.92)' }}
                        className="w-full font-heading font-extrabold"
                        style={{
                          height: 56,
                          borderRadius: 16,
                          background: theme.accent,
                          color: '#fff',
                          fontSize: 18,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: `0 4px 16px ${theme.accent}40`,
                        }}
                      >
                        ✅ ¡Lo hice!
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* All done overlay */}
        <AnimatePresence>
          {allCelebrated && completed === total && total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 py-5 rounded-3xl text-center"
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}
            >
              <p className="font-heading font-black text-2xl" style={{ color: theme.accent }}>
                🏆 ¡Increíble!
              </p>
              <p className="font-medium mt-1" style={{ color: '#6B7280', fontFamily: 'Quicksand' }}>
                Completaste todas tus tareas de hoy
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
