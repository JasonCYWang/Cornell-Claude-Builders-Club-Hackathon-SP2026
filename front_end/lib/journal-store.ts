import type { JournalEntry } from "@/lib/journal-types"

const STORAGE_KEY = "futuremirror:journals:v1"
const UPDATED_EVENT = "futuremirror:journals:updated"

function safeParseEntries(raw: string | null): JournalEntry[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as JournalEntry[]
  } catch {
    return []
  }
}

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return []
  return safeParseEntries(window.localStorage.getItem(STORAGE_KEY))
}

export function saveJournalEntries(entries: JournalEntry[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  window.dispatchEvent(new Event(UPDATED_EVENT))
}

export function addJournalEntry(entry: JournalEntry) {
  const current = getJournalEntries()
  saveJournalEntries([entry, ...current])
}

export function getLatestJournalEntry(): JournalEntry | null {
  const entries = getJournalEntries()
  return entries[0] ?? null
}

export function onJournalEntriesUpdated(handler: () => void) {
  if (typeof window === "undefined") return () => {}
  const onUpdated = () => handler()
  window.addEventListener(UPDATED_EVENT, onUpdated)
  window.addEventListener("storage", onUpdated)
  return () => {
    window.removeEventListener(UPDATED_EVENT, onUpdated)
    window.removeEventListener("storage", onUpdated)
  }
}

export function getJournalEntryById(id: string): JournalEntry | null {
  const entries = getJournalEntries()
  return entries.find((e) => e.id === id) ?? null
}

