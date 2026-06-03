'use client'
import { useState, useEffect, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────
export interface PointsBalance {
  [memberId: string]: number   // total accumulated points
}

export interface PointsTransaction {
  id: string
  memberId: string
  amount: number        // positive = earned, negative = spent
  reason: string        // task title or reward title
  emoji: string
  createdAt: string
}

export interface RewardItem {
  id: string
  title: string
  emoji: string
  pointsCost: number
  isActive: boolean
  createdAt: string
}

// ── Storage keys ──────────────────────────────────────────
const BALANCES_KEY     = 'fq_points_v1'
const HISTORY_KEY      = 'fq_points_history_v1'
const REWARDS_KEY      = 'fq_rewards_v1'
const CLAIMED_KEY      = 'fq_claims_v1'

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── DEFAULT REWARDS ───────────────────────────────────────
const DEFAULT_REWARDS: RewardItem[] = [
  { id:'rw1', title:'30 min extra de pantalla', emoji:'📱', pointsCost:50,  isActive:true, createdAt:new Date().toISOString() },
  { id:'rw2', title:'Elegir la cena',           emoji:'🍕', pointsCost:100, isActive:true, createdAt:new Date().toISOString() },
  { id:'rw3', title:'Elegir la película',       emoji:'🎬', pointsCost:150, isActive:true, createdAt:new Date().toISOString() },
  { id:'rw4', title:'Noche de juegos',          emoji:'🎮', pointsCost:200, isActive:true, createdAt:new Date().toISOString() },
  { id:'rw5', title:'Salida especial',          emoji:'🎡', pointsCost:300, isActive:true, createdAt:new Date().toISOString() },
]

// ── HOOK ──────────────────────────────────────────────────
export function usePointsStore() {
  const [balances,  setBalances]  = useState<PointsBalance>(() => load(BALANCES_KEY, {}))
  const [history,   setHistory]   = useState<PointsTransaction[]>(() => load(HISTORY_KEY, []))
  const [rewards,   setRewards]   = useState<RewardItem[]>(() => {
    const saved = load<RewardItem[]>(REWARDS_KEY, [])
    return saved.length > 0 ? saved : DEFAULT_REWARDS
  })
  const [claimedIds, setClaimedIds] = useState<string[]>(() => load(CLAIMED_KEY, []))

  useEffect(() => { save(BALANCES_KEY, balances)       }, [balances])
  useEffect(() => { save(HISTORY_KEY,  history)        }, [history])
  useEffect(() => { save(REWARDS_KEY,  rewards)        }, [rewards])
  useEffect(() => { save(CLAIMED_KEY,  claimedIds)     }, [claimedIds])

  const getBalance = useCallback((memberId: string) => balances[memberId] ?? 0, [balances])

  // Award points (task completed)
  const awardPoints = useCallback((memberId: string, amount: number, reason: string, emoji = '⭐', txId?: string) => {
    const id = txId || `tx-${Date.now()}-${memberId}`
    // Prevent double-awarding the same task completion
    setHistory(h => {
      if (h.find(t => t.id === id)) return h
      const tx: PointsTransaction = { id, memberId, amount, reason, emoji, createdAt: new Date().toISOString() }
      return [tx, ...h].slice(0, 200)
    })
    setBalances(b => ({ ...b, [memberId]: Math.max(0, (b[memberId] ?? 0) + amount) }))
  }, [])

  // Remove points (task uncompleted)
  const removePoints = useCallback((memberId: string, amount: number, txId: string) => {
    setHistory(h => h.filter(t => t.id !== txId))
    setBalances(b => ({ ...b, [memberId]: Math.max(0, (b[memberId] ?? 0) - amount) }))
  }, [])

  // Claim reward
  const claimReward = useCallback((memberId: string, reward: RewardItem): boolean => {
    const bal = balances[memberId] ?? 0
    if (bal < reward.pointsCost) return false
    setBalances(b => ({ ...b, [memberId]: (b[memberId] ?? 0) - reward.pointsCost }))
    const tx: PointsTransaction = {
      id: `claim-${Date.now()}`,
      memberId, amount: -reward.pointsCost,
      reason: `Canjeó: ${reward.title}`,
      emoji: reward.emoji,
      createdAt: new Date().toISOString(),
    }
    setHistory(h => [tx, ...h].slice(0, 200))
    setClaimedIds(ids => [tx.id, ...ids])
    return true
  }, [balances])

  // Manage rewards
  const addReward = useCallback((r: Omit<RewardItem,'id'|'createdAt'>) => {
    const newR: RewardItem = { ...r, id:`rw-${Date.now()}`, createdAt:new Date().toISOString() }
    setRewards(rs => [...rs, newR])
    return newR
  }, [])

  const updateReward = useCallback((id: string, patch: Partial<RewardItem>) => {
    setRewards(rs => rs.map(r => r.id===id ? {...r,...patch} : r))
  }, [])

  const deleteReward = useCallback((id: string) => {
    setRewards(rs => rs.filter(r => r.id!==id))
  }, [])

  const getMemberHistory = useCallback((memberId: string) =>
    history.filter(t => t.memberId === memberId), [history])

  return {
    balances, history, rewards, claimedIds,
    getBalance, awardPoints, removePoints, claimReward,
    addReward, updateReward, deleteReward, getMemberHistory,
  }
}
