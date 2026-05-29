import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Ban } from 'lucide-react'
import { useRewardsStore } from '@/stores/rewardsStore'
import { useFamilyStore } from '@/stores/familyStore'
import { RewardCard } from './RewardCard'
import type { Reward, Redemption } from '@/types/database.types'
import { EmojiPicker } from '@/components/tasks/EmojiPicker'
import toast from 'react-hot-toast'
import { fireConfetti } from '@/components/shared/ConfettiExplosion'

export function RewardsStore() {
  const { rewards, redemptions, addReward, addRedemption, updateRedemptionStatus } = useRewardsStore()
  const { members, currentUser, family } = useFamilyStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎁')
  const [newCost, setNewCost] = useState(50)

  const isParent = currentUser?.role === 'parent' || !currentUser
  const kidMember = !isParent ? currentUser : null

  const pending = redemptions.filter((r) => r.status === 'pending')

  function handleAddReward() {
    if (!newTitle.trim()) return
    const reward: Reward = {
      id: `reward-${Date.now()}`,
      family_id: family?.id ?? '',
      title: newTitle.trim(),
      emoji_icon: newEmoji,
      points_cost: newCost,
      quantity_available: null,
      is_active: true,
      created_by: null,
      created_at: new Date().toISOString(),
    }
    addReward(reward)
    setNewTitle('')
    setNewEmoji('🎁')
    setNewCost(50)
    setShowAdd(false)
    toast.success('Reward added! 🎁')
  }

  function handleRedeem(rewardId: string) {
    if (!kidMember) return
    const redemption: Redemption = {
      id: `redeem-${Date.now()}`,
      reward_id: rewardId,
      profile_id: kidMember.id,
      family_id: family?.id ?? '',
      status: 'pending',
      requested_at: new Date().toISOString(),
      resolved_at: null,
      resolved_by: null,
    }
    addRedemption(redemption)
    toast.success('Request sent! Waiting for parent approval ⏳')
  }

  function handleApprove(id: string) {
    updateRedemptionStatus(id, 'approved')
    fireConfetti()
    toast.success('Reward approved! 🎉')
  }

  function handleDeny(id: string) {
    updateRedemptionStatus(id, 'denied')
    toast('Reward denied.', { icon: '❌' })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-3xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Rewards Store 🎁
        </h1>
        {isParent && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600"
            style={{ minHeight: 52 }}
          >
            <Plus size={20} />
            Add Reward
          </motion.button>
        )}
      </div>

      {!isParent && kidMember && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-black text-amber-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              My Stars: {kidMember.points_balance}
            </p>
            <p className="text-sm text-amber-600">Spend your stars on rewards below!</p>
          </div>
        </div>
      )}

      {/* Pending redemptions (parent view) */}
      {isParent && pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-lg text-gray-700 mb-3">⏳ Pending Requests</h2>
          {pending.map((r) => {
            const reward = rewards.find((rw) => rw.id === r.reward_id)
            const kid = members.find((m) => m.id === r.profile_id)
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 mb-2 flex items-center gap-4 shadow-sm border border-gray-100">
                <span className="text-3xl">{reward?.emoji_icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{reward?.title}</p>
                  <p className="text-sm text-gray-500">{kid?.name} · ⭐ {reward?.points_cost}</p>
                </div>
                <button
                  onClick={() => handleApprove(r.id)}
                  className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleDeny(r.id)}
                  className="w-10 h-10 rounded-xl bg-red-100 text-red-400 flex items-center justify-center hover:bg-red-200"
                >
                  <Ban size={18} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Rewards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rewards.filter((r) => r.is_active).map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            userPoints={kidMember?.points_balance ?? 0}
            onRedeem={handleRedeem}
            isKidMode={!isParent}
          />
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">🎁</span>
          <p className="font-semibold">No rewards yet — add some for the kids!</p>
        </div>
      )}

      {/* Add reward modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-t-3xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-2xl" style={{ fontFamily: 'Nunito, sans-serif' }}>New Reward</h2>
                <button onClick={() => setShowAdd(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Reward name..."
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold focus:outline-none focus:border-purple-400"
                  style={{ minHeight: 52 }}
                />
                <EmojiPicker value={newEmoji} onChange={setNewEmoji} />
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Star Cost: <span className="text-amber-500">⭐ {newCost}</span>
                  </label>
                  <input type="range" min={10} max={500} step={10} value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <button
                  onClick={handleAddReward}
                  className="w-full py-4 rounded-2xl font-black text-xl text-white bg-purple-500 hover:bg-purple-600"
                  style={{ minHeight: 60 }}
                >
                  Add Reward 🎁
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
