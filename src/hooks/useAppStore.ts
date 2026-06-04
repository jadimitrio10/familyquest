import { useState, useEffect } from 'react'
import type { AppSettings } from '@/types/app.types'
import { DEFAULT_SETTINGS } from '@/types/app.types'

const KEY = 'fq_settings'

function load(): AppSettings {
  try {
    const v = localStorage.getItem(KEY)
    return v ? { ...DEFAULT_SETTINGS, ...JSON.parse(v) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

// ── Singleton shared state — all hook instances stay in sync ───────────────
let _settings: AppSettings = load()
const _listeners = new Set<(s: AppSettings) => void>()

function _notify(s: AppSettings) {
  _listeners.forEach(fn => fn(s))
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(_settings)

  useEffect(() => {
    _listeners.add(setSettings)
    return () => { _listeners.delete(setSettings) }
  }, [])

  function update(patch: Partial<AppSettings>) {
    const next = { ..._settings, ...patch }
    _settings = next
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    _notify(next)   // instantly updates ALL hook instances (App, CalendarTopBar, etc.)
  }

  return { settings, update, setSettings }
}
