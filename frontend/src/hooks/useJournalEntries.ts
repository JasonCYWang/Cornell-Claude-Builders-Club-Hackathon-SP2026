import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { CalendarEntriesMap, CalendarSummaryMap, JournalEntry } from '../types'

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [summaryMap, setSummaryMap] = useState<CalendarSummaryMap>({})
  const [loading, setLoading] = useState(true)

  const calendarMap = useMemo(() => {
    return entries.reduce((map, e) => {
      if (!map[e.dateKey]) map[e.dateKey] = []
      map[e.dateKey].push(e)
      return map
    }, {} as CalendarEntriesMap)
  }, [entries])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const [e, s] = await Promise.all([api.getEntries(), api.getCalendarSummary()])
      setEntries(e)
      setSummaryMap(s)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { entries, calendarMap, summaryMap, loading, refetch }
}

