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

export function useCalendarPrefs() {
  const [prefs, setPrefs] = useState<CalendarPrefs>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch {}
  }, [prefs])

  function update(patch: Partial<CalendarPrefs>) {
    setPrefs(p => ({ ...p, ...patch }))
  }

  return { prefs, update }
}
