import { create } from 'zustand'
import type { Family, Profile } from '@/types/database.types'

interface FamilyState {
  family: Family | null
  members: Profile[]
  currentUser: Profile | null
  isDemo: boolean
  setFamily: (family: Family) => void
  setMembers: (members: Profile[]) => void
  setCurrentUser: (user: Profile | null) => void
  setDemo: (demo: boolean) => void
  reset: () => void
}

export const useFamilyStore = create<FamilyState>((set) => ({
  family: null,
  members: [],
  currentUser: null,
  isDemo: false,
  setFamily: (family) => set({ family }),
  setMembers: (members) => set({ members }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setDemo: (isDemo) => set({ isDemo }),
  reset: () => set({ family: null, members: [], currentUser: null, isDemo: false }),
}))
