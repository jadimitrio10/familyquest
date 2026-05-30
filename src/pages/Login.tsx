import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { useTasksStore } from '@/stores/tasksStore'
import { useRewardsStore } from '@/stores/rewardsStore'
import { SparklesText } from '@/components/21st/SparklesText'
import {
  DEMO_FAMILY, DEMO_MEMBERS, DEMO_TASKS, DEMO_INSTANCES, DEMO_REWARDS,
} from '@/lib/demoData'

const BUBBLES = [
  { emoji: '⭐', x: 8,  y: 12, dur: 3.2, delay: 0 },
  { emoji: '🌟', x: 20, y: 70, dur: 2.8, delay: 0.4 },
  { emoji: '🎯', x: 35, y: 20, dur: 3.5, delay: 0.8 },
  { emoji: '🏆', x: 55, y: 80, dur: 2.9, delay: 0.2 },
  { emoji: '🎁', x: 70, y: 15, dur: 3.1, delay: 0.6 },
  { emoji: '🌈', x: 82, y: 65, dur: 3.3, delay: 1.0 },
  { emoji: '🚀', x: 90, y: 35, dur: 2.7, delay: 0.3 },
  { emoji: '💫', x: 15, y: 45, dur: 3.0, delay: 0.7 },
  { emoji: '🎉', x: 48, y: 55, dur: 3.4, delay: 0.5 },
  { emoji: '✨', x: 63, y: 40, dur: 2.6, delay: 0.9 },
]

export function Login() {
  const navigate = useNavigate()
  const { setFamily, setMembers, setCurrentUser, setDemo } = useFamilyStore()
  const { setTasks, setInstances } = useTasksStore()
  const { setRewards } = useRewardsStore()
  const [familyName, setFamilyName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  function enterDemo() {
    setFamily(DEMO_FAMILY)
    setMembers(DEMO_MEMBERS)
    setTasks(DEMO_TASKS)
    setInstances(DEMO_INSTANCES)
    setRewards(DEMO_REWARDS)
    setDemo(true)
    setCurrentUser(DEMO_MEMBERS.find((m) => m.role === 'parent') ?? null)
    navigate('/')
  }

  function createFamily() {
    if (!familyName.trim()) return
    setFamily({
      id: `family-${Date.now()}`,
      name: familyName.trim(),
      invite_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
      timezone: 'America/New_York',
      owner_id: 'local-user',
      created_at: new Date().toISOString(),
    })
    setMembers([])
    setTasks([])
    setInstances([])
    setRewards([])
    setDemo(false)
    navigate('/')
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, #EDE9FE 0%, #E0F2FE 40%, #FDE68A 80%, #FBCFE8 100%)',
      }}
    >
      {/* Floating background emojis */}
      {BUBBLES.map((b, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none text-3xl opacity-25"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
          animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        >
          {b.emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-5 flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <motion.div
          className="text-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-7xl mb-3">🏆</div>
          {/* SparklesText de 21st.dev */}
          <SparklesText
            text="FamilyQuest"
            className="font-black text-5xl"
            colors={{ first: '#7C3AED', second: '#DB2777' }}
            sparklesCount={8}
          />
          <p
            className="mt-2 font-semibold"
            style={{ color: '#4b5563', fontFamily: 'Quicksand, sans-serif', fontSize: 16 }}
          >
            Las tareas como una aventura ✨
          </p>
        </motion.div>

        {/* Demo CTA */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={enterDemo}
          className="w-full py-4 rounded-3xl font-black text-xl text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
            minHeight: 64,
            fontFamily: 'Nunito, sans-serif',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}
        >
          <motion.span
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative">🎭 Probar Demo</span>
        </motion.button>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-white/60" />
          <span className="text-sm font-semibold" style={{ color: '#6b7280' }}>o</span>
          <div className="flex-1 h-px bg-white/60" />
        </div>

        {/* Create family */}
        <AnimatePresence mode="wait">
          {!showCreate ? (
            <motion.button
              key="show"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="w-full py-4 rounded-3xl font-bold text-lg transition-colors"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)',
                color: '#374151',
                minHeight: 56,
                fontFamily: 'Quicksand, sans-serif',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              👨‍👩‍👧‍👦 Crear mi Familia
            </motion.button>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full space-y-3 overflow-hidden"
            >
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createFamily()}
                placeholder="Nombre de la familia..."
                autoFocus
                className="w-full rounded-2xl px-4 py-3 text-lg font-semibold focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '2px solid rgba(124,58,237,0.3)',
                  minHeight: 56,
                  fontFamily: 'Nunito, sans-serif',
                  color: '#1f2937',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={createFamily}
                disabled={!familyName.trim()}
                className="w-full py-4 rounded-3xl font-black text-xl text-white"
                style={{
                  background: familyName.trim()
                    ? 'linear-gradient(135deg, #7C3AED, #0284C7)'
                    : '#d1d5db',
                  minHeight: 60,
                  fontFamily: 'Nunito, sans-serif',
                  transition: 'background 0.3s',
                }}
              >
                ¡Empezar aventura! 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
