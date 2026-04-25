import type { JournalEntry } from "@/lib/journal-types"
import { addJournalEntry, getJournalEntries as getStoredEntries } from "@/lib/journal-store"

export async function uploadVoiceMemo(audioBlob: Blob): Promise<{ audioUrl?: string }> {
  // TODO: connect transcription endpoint
  // TODO: connect to backend `/save_entry` (voice memo upload)
  void audioBlob
  return {}
}

export async function saveJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
  // TODO: connect to backend `/save_entry`
  addJournalEntry(entry)
  return entry
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  // TODO: connect to backend `/get_entries`
  return getStoredEntries()
}

