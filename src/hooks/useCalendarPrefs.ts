import { useState, useEffect } from 'react'

export interface CalendarPrefs {
  defaultView:    'week' | 'day' | 'month' | 'agenda'
  showTasks:      boolean
  weekStartsOn:   'monday' | 'sunday'
  showWeekends:   boolean
}

const KEY   = 'fq_calendar_prefs_v1'
const EVENT = 'fq:calprefs'   // custom DOM event — reliable across any component tree

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

export function useCalendarPrefs() {
  const [prefs, setPrefs] = useState<CalendarPrefs>(load)

  // Listen for changes made by ANY component (Settings, Calendar header, etc.)
  useEffect(() => {
    const handler = () => setPrefs(load())
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  function update(patch: Partial<CalendarPrefs>) {
    const next = { ...load(), ...patch }       // always read fresh — no stale closure
    localStorage.setItem(KEY, JSON.stringify(next))
    setPrefs(next)                             // update THIS instance immediately
    window.dispatchEvent(new Event(EVENT))     // notify every other instance
  }

  return { prefs, update }
}
