/**
 * useAutoSync — automatically pushes localStorage changes to Supabase
 * every 30 seconds and on key changes.
 */
import { useEffect, useRef } from 'react'
import { uploadLocalData, FAMILY_ID_KEY } from '@/lib/sync'

export function useAutoSync() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function sync() {
    const fid = localStorage.getItem(FAMILY_ID_KEY)
    if (!fid) return
    uploadLocalData(fid).catch(console.error)
  }

  useEffect(() => {
    // Initial sync after 3s (give app time to load)
    const initial = setTimeout(sync, 3000)

    // Auto-sync every 30 seconds
    timerRef.current = setInterval(sync, 30_000)

    // Sync on page hide (tab close, navigate away)
    const handleHide = () => sync()
    document.addEventListener('visibilitychange', handleHide)

    return () => {
      clearTimeout(initial)
      if (timerRef.current) clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', handleHide)
    }
  }, [])

  return { syncNow: sync }
}
