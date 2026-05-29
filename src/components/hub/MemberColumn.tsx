import { motion } from 'framer-motion'
import type { Profile, TaskInstance } from '@/types/database.types'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { PointsBadge } from '@/components/shared/PointsBadge'
import { TimeOfDayRing } from './TimeOfDayRing'
import { TaskCard } from './TaskCard'
import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'

interface MemberColumnProps {
  member: Profile
  instances: TaskInstance[]
  onComplete: (instanceId: string) => void
}

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'anytime', label: 'Chores' },
] as const

export function MemberColumn({ member, instances, onComplete }: MemberColumnProps) {
  const navigate = useNavigate()
  const { setCurrentUser } = useFamilyStore()

  function handleHeaderClick() {
    setCurrentUser(member)
    navigate(`/kid/${member.id}`)
  }

  const bySlot = (slot: string) => instances.filter((i) => i.task?.time_of_day === slot)
  const completedInSlot = (slot: string) => bySlot(slot).filter((i) => !!i.completed_at).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-w-[280px] max-w-[300px] h-full flex flex-col rounded-3xl overflow-hidden shrink-0"
      style={{ background: `${member.color_hex}55` }}
    >
      {/* Column header */}
      <button
        onClick={handleHeaderClick}
        className="w-full p-4 text-left hover:brightness-95 transition-all"
        style={{ background: member.color_hex }}
      >
        <div className="flex items-center gap-3 mb-3">
          <AvatarCircle emoji={member.avatar_emoji} colorHex={member.color_hex} accentHex={member.accent_hex} size={52} />
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-800 text-lg leading-none truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {member.name}
            </p>
            <PointsBadge points={member.points_balance} accentHex={member.accent_hex} size="sm" />
          </div>
        </div>
        {/* Time-of-day rings */}
        <div className="flex gap-3 justify-center">
          {TIME_SLOTS.map(({ key, label }) => {
            const total = bySlot(key).length
            if (total === 0) return null
            return (
              <TimeOfDayRing
                key={key}
                label={label}
                completed={completedInSlot(key)}
                total={total}
                accentHex={member.accent_hex}
              />
            )
          })}
        </div>
      </button>

      {/* Scrollable task list */}
      <div className="flex-1 overflow-y-auto p-3">
        {TIME_SLOTS.map(({ key, label }) => {
          const slotInstances = bySlot(key)
          if (slotInstances.length === 0) return null
          return (
            <div key={key} className="mb-4">
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
                style={{ color: member.accent_hex, fontFamily: 'Quicksand, sans-serif' }}
              >
                {label}
              </h3>
              {slotInstances.map((instance) => (
                <TaskCard
                  key={instance.id}
                  instance={instance}
                  accentHex={member.accent_hex}
                  colorHex={member.color_hex}
                  onComplete={onComplete}
                />
              ))}
            </div>
          )
        })}

        {instances.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <span className="text-3xl mb-2">🎉</span>
            <p className="text-sm font-medium">No tasks today!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
