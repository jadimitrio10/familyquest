import { create } from 'zustand'
import type { Reward, Redemption } from '@/types/database.types'

interface RewardsState {
  rewards: Reward[]
  redemptions: Redemption[]
  setRewards: (rewards: Reward[]) => void
  setRedemptions: (redemptions: Redemption[]) => void
  addReward: (reward: Reward) => void
  addRedemption: (redemption: Redemption) => void
  updateRedemptionStatus: (id: string, status: 'approved' | 'denied') => void
}

export const useRewardsStore = create<RewardsState>((set) => ({
  rewards: [],
  redemptions: [],
  setRewards: (rewards) => set({ rewards }),
  setRedemptions: (redemptions) => set({ redemptions }),
  addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
  addRedemption: (redemption) =>
    set((state) => ({ redemptions: [...state.redemptions, redemption] })),
  updateRedemptionStatus: (id, status) =>
    set((state) => ({
      redemptions: state.redemptions.map((r) =>
        r.id === id ? { ...r, status, resolved_at: new Date().toISOString() } : r
      ),
    })),
}))
