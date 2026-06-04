import { useState, useEffect } from 'react'
import type { AppSettings } from '@/types/app.types'
import { DEFAULT_SETTINGS } from '@/types/app.types'

const KEY   = 'fq_settings'
const EVENT = 'fq:settings'   // custom DOM event

function load(): AppSettings {
  try {
    const v = localStorage.getItem(KEY)
    return v ? { ...DEFAULT_SETTINGS, ...JSON.parse(v) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(load)

  // Listen for changes made by ANY component
  useEffect(() => {
    const handler = () => setSettings(load())
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  function update(patch: Partial<AppSettings>) {
    const next = { ...load(), ...patch }       // always read fresh — no stale closure
    localStorage.setItem(KEY, JSON.stringify(next))
    setSettings(next)                          // update THIS instance immediately
    window.dispatchEvent(new Event(EVENT))     // notify every other instance
  }

  return { settings, update, setSettings }
}
