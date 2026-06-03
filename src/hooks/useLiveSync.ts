/**
 * useLiveSync — Real-time cross-device sync
 *
 * Behavior:
 * 1. On app start → download latest from Supabase → load into localStorage
 * 2. Every 5 seconds → push local changes to Supabase (auto-save)
 * 3. Supabase Realtime → detects changes from OTHER devices → re-downloads instantly
 * 4. When re-download happens → increments syncTick → causes app to re-read localStorage
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadLocalData, downloadFamilyData, FAMILY_ID_KEY } from '@/lib/sync'

const SYNC_INTERVAL_MS = 8_000  // push changes every 8 seconds

export function useLiveSync(): { syncTick: number; isConnected: boolean } {
  const [syncTick,    setSyncTick]    = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const uploadTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef       = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastUploadRef    = useRef<string>('')    // hash to avoid redundant uploads
  const isFirstSyncDone  = useRef(false)

  const familyId = localStorage.getItem(FAMILY_ID_KEY)

  // ── Push changes to Supabase ────────────────────────────────────────────
  const pushToCloud = useCallback(async () => {
    if (!familyId) return
    try {
      await uploadLocalData(familyId)
    } catch (e) {
      console.warn('[liveSync] push failed:', e)
    }
  }, [familyId])

  // ── Pull latest from Supabase + trigger re-render ───────────────────────
  const pullFromCloud = useCallback(async (reason = 'scheduled') => {
    if (!familyId) return
    try {
      console.log('[liveSync] pulling from cloud:', reason)
      await downloadFamilyData(familyId)
      setSyncTick(n => n + 1)   // causes App to re-read localStorage
    } catch (e) {
      console.warn('[liveSync] pull failed:', e)
    }
  }, [familyId])

  useEffect(() => {
    if (!familyId) return

    // ── 1. Initial download on app start ──────────────────────────────────
    if (!isFirstSyncDone.current) {
      isFirstSyncDone.current = true
      pullFromCloud('initial').then(() => setIsConnected(true))
    }

    // ── 2. Auto-push every 8 seconds ──────────────────────────────────────
    uploadTimerRef.current = setInterval(pushToCloud, SYNC_INTERVAL_MS)

    // ── 3. Push when tab is hidden (user switches app) ────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') pushToCloud()
      if (document.visibilityState === 'visible') pullFromCloud('tab-focus')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // ── 4. Supabase Realtime — listen for changes from other devices ───────
    // We subscribe to ALL tables for this family. When any record changes
    // on another device, we re-download the full dataset.
    const TABLES = [
      'fq_tasks', 'fq_members', 'fq_calendar_events',
      'fq_family_events', 'fq_task_completions',
      'fq_points_balances', 'fq_rewards',
    ]

    let lastPullTime = 0

    const channel = supabase.channel(`family:${familyId}`)

    TABLES.forEach(table => {
      channel.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table, filter: `family_id=eq.${familyId}` },
        () => {
          const now = Date.now()
          // Debounce: don't pull more than once per 2 seconds
          if (now - lastPullTime > 2000) {
            lastPullTime = now
            pullFromCloud(`realtime:${table}`)
          }
        }
      )
    })

    channel.subscribe((status) => {
      console.log('[liveSync] realtime status:', status)
      if (status === 'SUBSCRIBED') setIsConnected(true)
    })

    channelRef.current = channel

    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [familyId, pushToCloud, pullFromCloud])

  return { syncTick, isConnected }
}
