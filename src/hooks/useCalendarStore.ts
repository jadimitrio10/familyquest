import { useState, useEffect } from 'react'
import type { CalendarEvent } from '@/types/calendar.types'

const STORAGE_KEY = 'fq_events_v3'  // bumped version to clear stale data

// Default empty — events will be created by the user
function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CalendarEvent[]
  } catch {}
  return []
}

function saveEvents(events: CalendarEvent[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch {}
}

export function useCalendarStore() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents)

  useEffect(() => { saveEvents(events) }, [events])

  const toggleEvent = (id: string) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e))

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: `e-${Date.now()}` }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }

  const deleteEvent = (id: string) =>
    setEvents(prev => prev.filter(e => e.id !== id))

  const updateEvent = (id: string, patch: Partial<CalendarEvent>) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))

  return { events, toggleEvent, addEvent, deleteEvent, updateEvent }
}
