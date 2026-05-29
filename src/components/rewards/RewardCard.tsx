import { motion } from 'framer-motion'
import type { Reward } from '@/types/database.types'

interface RewardCardProps {
  reward: Reward
  userPoints: number
  onRedeem: (rewardId: string) => void
  isKidMode?: boolean
}

export function RewardCard({ reward, userPoints, onRedeem, isKidMode }: RewardCardProps) {
  const canAfford = userPoints >= reward.points_cost

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 shadow-md border-2 border-transparent hover:border-purple-200 transition-all"
    >
      <span className="text-5xl">{reward.emoji_icon}</span>
      <p className="font-black text-center text-gray-800" style={{ fontFamily: 'Nunito, sans-serif', fontSize: 17 }}>
        {reward.title}
      </p>
      <div className="flex items-center gap-1 font-bold text-amber-600">
        <span>⭐</span>
        <span>{reward.points_cost} stars</span>
      </div>
      {reward.quantity_available !== null && (
        <span className="text-xs text-gray-400 font-medium">{reward.quantity_available} left</span>
      )}
      {isKidMode && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => canAfford && onRedeem(reward.id)}
          disabled={!canAfford}
          className="w-full py-3 rounded-2xl font-bold text-white transition-all"
          style={{
            background: canAfford ? '#7C3AED' : '#d1d5db',
            minHeight: 52,
            cursor: canAfford ? 'pointer' : 'not-allowed',
          }}
        >
          {canAfford ? 'Redeem 🎁' : `Need ${reward.points_cost - userPoints} more ⭐`}
        </motion.button>
      )}
    </motion.div>
  )
}
