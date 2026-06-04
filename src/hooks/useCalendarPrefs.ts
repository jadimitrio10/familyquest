import { useState, useEffect } from 'react'

export interface CalendarPrefs {
  defaultView:    'week' | 'day' | 'month' | 'agenda'
  showTasks:      boolean
  weekStartsOn:   'monday' | 'sunday'
  showWeekends:   boolean
}

const KEY = 'fq_calendar_prefs_v1'

const DEFAULTS: CalendarPrefs = {
  defaultView:  'week',
  showTasks:    true,
  weekStartsOn: 'monday',
  showWeekends: true,
}

function load(): CalendarPrefs {
  try {
    const v = localStorage.getItem(KEY)
    return v ? { ...DEFAULTS, ...JSON.parse(v) } : DEFAULTS
  } catch { return DEFAULTS }
}

// ── Singleton shared state — all hook instances stay in sync ───────────────
let _prefs: CalendarPrefs = load()
const _listeners = new Set<(p: CalendarPrefs) => void>()

function _notify(p: CalendarPrefs) {
  _listeners.forEach(fn => fn(p))
}

export function useCalendarPrefs() {
  const [prefs, setPrefs] = useState<CalendarPrefs>(_prefs)

  // Register this instance so it receives updates from other instances
  useEffect(() => {
    _listeners.add(setPrefs)
    return () => { _listeners.delete(setPrefs) }
  }, [])

  function update(patch: Partial<CalendarPrefs>) {
    const next = { ..._prefs, ...patch }
    _prefs = next
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    _notify(next)   // instantly updates ALL hook instances across the app
  }

  return { prefs, update }
}
