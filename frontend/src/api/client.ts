import type { CalendarSummaryMap, JournalEntry, ReflectionResponse } from '../types'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  uploadJournal: async (blob: Blob, durationStr: string, note?: string) => {
    const form = new FormData()
    form.append('audio', blob, 'journal.webm')
    form.append('duration', durationStr)
    if (note) form.append('note', note)
    const res = await fetch(`${BASE}/journal/upload`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Upload failed')
    return (await res.json()) as JournalEntry
  },

  createTextJournal: async (payload: {
    transcript: string
    note?: string
    duration?: string
  }) => {
    const res = await fetch(`${BASE}/journal/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Text journal save failed')
    return (await res.json()) as JournalEntry
  },

  getEntries: async (): Promise<JournalEntry[]> => {
    const res = await fetch(`${BASE}/journal/entries`)
    if (!res.ok) throw new Error('Failed to load entries')
    return (await res.json()) as JournalEntry[]
  },

  getEntriesByDate: async (dateKey: string): Promise<JournalEntry[]> => {
    const res = await fetch(`${BASE}/journal/entries/by-date/${dateKey}`)
    if (!res.ok) throw new Error('Failed to load entries for day')
    return (await res.json()) as JournalEntry[]
  },

  getCalendarSummary: async (): Promise<CalendarSummaryMap> => {
    const res = await fetch(`${BASE}/journal/calendar-summary`)
    if (!res.ok) throw new Error('Failed to load calendar summary')
    return (await res.json()) as CalendarSummaryMap
  },

  deleteEntry: async (id: string) => {
    const res = await fetch(`${BASE}/journal/entries/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    return (await res.json()) as { deleted: boolean }
  },

  getFutureReflection: async (payload: {
    question: string
    futureSelfType: string
    journalSummary: string
    patternDetected: string
  }): Promise<ReflectionResponse> => {
    const res = await fetch(`${BASE}/future-self/reflection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Reflection failed')
    return (await res.json()) as ReflectionResponse
  },
}

