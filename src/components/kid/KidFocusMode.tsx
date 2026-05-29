import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { useTasksStore } from '@/stores/tasksStore'
import { PointsOrb } from './PointsOrb'
import { KidTaskCard } from './KidTaskCard'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const SIZE = 120
const STROKE = 8
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export function KidFocusMode() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const { members } = useFamilyStore()
  const { instances, markComplete } = useTasksStore()

  const member = members.find((m) => m.id === memberId)
  if (!member) return null

  const myInstances = instances.filter((i) => i.profile_id === member.id)
  const completed = myInstances.filter((i) => !!i.completed_at).length
  const total = myInstances.length
  const remaining = total - completed
  const pct = total === 0 ? 0 : completed / total
  const dash = pct * CIRC

  function handleComplete(instanceId: string) {
    const inst = myInstances.find((i) => i.id === instanceId)
    if (!inst) return
    const pts = inst.task?.points_value ?? 10
    markComplete(instanceId, pts)
    toast.success(`🎉 +${pts} stars!`, { duration: 2500 })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-auto"
      style={{
        background: `linear-gradient(135deg, ${member.color_hex} 0%, ${member.color_hex}88 100%)`,
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 font-bold text-gray-700 hover:text-gray-900 transition-colors z-10"
        style={{ minHeight: 52 }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="max-w-md mx-auto px-4 pt-16 pb-8">
        {/* Greeting */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-2">{member.avatar_emoji}</div>
          <h1
            className="font-black text-5xl text-gray-800"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Hey {member.name}! 🌟
          </h1>
          <p className="text-lg text-gray-600 mt-1" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {remaining === 0 ? 'All done for today! Amazing! 🎉' : `You have ${remaining} task${remaining !== 1 ? 's' : ''} left today`}
          </p>
        </motion.div>

        {/* Progress ring */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg width={SIZE} height={SIZE}>
              <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={STROKE} />
              <motion.circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={member.accent_hex}
                strokeWidth={STROKE}
                strokeDasharray={`${CIRC}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC - dash }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black text-2xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {completed}/{total}
              </span>
              <span className="text-xs text-gray-500 font-semibold">done</span>
            </div>
          </div>
        </div>

        {/* Points orb */}
        <div className="flex justify-center mb-8">
          <PointsOrb points={member.points_balance} accentHex={member.accent_hex} colorHex={member.color_hex} />
        </div>

        {/* Tasks */}
        <div>
          {myInstances.map((inst) => (
            <KidTaskCard
              key={inst.id}
              instance={inst}
              accentHex={member.accent_hex}
              colorHex={member.color_hex}
              onComplete={handleComplete}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
