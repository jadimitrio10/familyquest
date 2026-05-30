import { useState, useEffect } from 'react'
import type { AppSettings } from '@/types/app.types'
import { DEFAULT_SETTINGS } from '@/types/app.types'

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch { return fallback }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => load('fq_settings', DEFAULT_SETTINGS))
  useEffect(() => { save('fq_settings', settings) }, [settings])
  const update = (patch: Partial<AppSettings>) => setSettings(s => ({ ...s, ...patch }))
  return { settings, update, setSettings }
}
