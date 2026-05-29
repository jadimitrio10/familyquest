import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { useTasksStore } from '@/stores/tasksStore'
import { useRewardsStore } from '@/stores/rewardsStore'
import {
  DEMO_FAMILY, DEMO_MEMBERS, DEMO_TASKS, DEMO_INSTANCES, DEMO_REWARDS,
} from '@/lib/demoData'
import { floatAnimation } from '@/lib/animations'

const FLOATING_EMOJIS = ['⭐', '🌟', '🎯', '🏆', '🎁', '🌈', '🚀', '💫', '🎉', '✨', '🌸', '⚡']

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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #BAE6FD 50%, #FDE68A 100%)' }}
    >
      {/* Floating background emojis */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none select-none opacity-30"
          style={{
            left: `${(i * 8.3) % 100}%`,
            top: `${(i * 13.7 + 10) % 90}%`,
          }}
          animate={{
            y: [0, -20 - (i % 3) * 10, 0],
            rotate: [0, (i % 2 === 0 ? 10 : -10), 0],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center"
        >
          <div className="text-7xl mb-2">🏆</div>
          <h1
            className="font-black text-5xl text-gray-800"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            FamilyQuest
          </h1>
          <p className="text-gray-600 font-semibold mt-1" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            Make chores an adventure ✨
          </p>
        </motion.div>

        {/* Demo button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={enterDemo}
          className="w-full py-4 rounded-3xl font-black text-xl text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
            minHeight: 60,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          🎭 Try Demo Mode
        </motion.button>

        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-white/50" />
          <span className="text-gray-500 font-semibold text-sm">or</span>
          <div className="flex-1 h-px bg-white/50" />
        </div>

        {/* Create family */}
        <AnimatePresence mode="wait">
          {!showCreate ? (
            <motion.button
              key="show"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="w-full py-4 rounded-3xl font-bold text-lg bg-white/80 text-gray-700 shadow-md hover:bg-white transition-colors"
              style={{ minHeight: 56, fontFamily: 'Quicksand, sans-serif' }}
            >
              👨‍👩‍👧‍👦 Create a Family
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
                placeholder="Your family name..."
                className="w-full rounded-2xl bg-white/90 border-2 border-white px-4 py-3 text-lg font-semibold focus:outline-none focus:border-purple-400"
                style={{ minHeight: 52 }}
                onKeyDown={(e) => e.key === 'Enter' && createFamily()}
              />
              <button
                onClick={createFamily}
                disabled={!familyName.trim()}
                className="w-full py-4 rounded-3xl font-black text-xl text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 transition-colors"
                style={{ minHeight: 60, fontFamily: 'Nunito, sans-serif' }}
              >
                Start Quest! 🚀
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
