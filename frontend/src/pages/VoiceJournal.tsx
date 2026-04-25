import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { DayEntryPanel } from '../components/DayEntryPanel'
import { GlassCard } from '../components/GlassCard'
import { MicButton } from '../components/MicButton'
import { MoodBadge } from '../components/MoodBadge'
import { MoodCalendar } from '../components/MoodCalendar'
import { PatternBanner } from '../components/PatternBanner'
import { Waveform } from '../components/Waveform'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useJournalEntries } from '../hooks/useJournalEntries'
import type { JournalEntry } from '../types'

export function VoiceJournal() {
  const nav = useNavigate()
  const recorder = useAudioRecorder()
  const { calendarMap, summaryMap, refetch, loading } = useJournalEntries()

  const [note, setNote] = useState('')
  const [journalText, setJournalText] = useState('')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [lastEntry, setLastEntry] = useState<JournalEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dayEntries = useMemo(() => {
    if (!selectedDay) return []
    return calendarMap[selectedDay] || []
  }, [calendarMap, selectedDay])

  const onMicClick = async () => {
    setError(null)
    if (recorder.isRecording) {
      recorder.stop()
      return
    }
    try {
      await recorder.start()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Microphone permission denied.')
    }
  }

  const onSaveReflect = async () => {
    setError(null)
    const cleanedText = journalText.trim()
    if (!recorder.audioBlob && !cleanedText) {
      setError('Record audio or write a reflection first.')
      return
    }
    setSaving(true)
    try {
      const entry = recorder.audioBlob
        ? await api.uploadJournal(recorder.audioBlob, recorder.durationStr, note.trim() || undefined)
        : await api.createTextJournal({
            transcript: cleanedText,
            note: note.trim() || undefined,
            duration: '0:00',
          })
      setLastEntry(entry)
      await refetch()
      setSelectedDay(entry.dateKey)
      recorder.reset()
      setNote('')
      setJournalText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fm-page">
      <div className="grid gap-5 md:grid-cols-2">
        {/* LEFT: Recorder */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex flex-col items-center">
              <MicButton isRecording={recorder.isRecording} onClick={onMicClick} />
              <div className="mt-4">
                <Waveform active={recorder.isRecording && !recorder.isPaused} />
              </div>
              <div className="mt-3 font-sans text-[13px] text-textMid">
                {recorder.durationStr}
                {recorder.isPaused ? ' (paused)' : ''}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={recorder.isPaused ? recorder.resume : recorder.pause}
                  disabled={!recorder.isRecording}
                  className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2 text-[13px] text-textMid hover:bg-[rgba(200,192,216,0.12)] disabled:opacity-50"
                >
                  {recorder.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  type="button"
                  onClick={recorder.stop}
                  disabled={!recorder.isRecording}
                  className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2 text-[13px] text-textMid hover:bg-[rgba(200,192,216,0.12)] disabled:opacity-50"
                >
                  Stop
                </button>
                <button
                  type="button"
                  onClick={recorder.reset}
                  className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2 text-[13px] text-textMid hover:bg-[rgba(200,192,216,0.12)]"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 w-full">
                <label className="text-[12px] font-medium text-textSoft">
                  Or write your reflection
                </label>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  rows={5}
                  placeholder="Today I noticed…"
                  className="mt-2 w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3 text-[13px] text-textDark outline-none placeholder:text-textSoft focus:border-[rgba(155,143,176,0.8)]"
                />
              </div>

              <div className="mt-3 w-full">
                <label className="text-[12px] font-medium text-textSoft">Optional note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="A detail you don’t want to lose…"
                  className="mt-2 w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3 text-[13px] text-textDark outline-none placeholder:text-textSoft focus:border-[rgba(155,143,176,0.8)]"
                />
              </div>

              <button
                type="button"
                onClick={onSaveReflect}
                disabled={saving || (!recorder.audioBlob && !journalText.trim())}
                className="mt-4 w-full rounded-full bg-[rgba(200,192,216,0.28)] px-5 py-3 text-[13px] font-medium text-textDark hover:bg-[rgba(200,192,216,0.36)] disabled:opacity-50"
              >
                {saving ? 'Reflecting…' : 'Save & Reflect'}
              </button>

              {error ? <div className="mt-3 text-[12px] text-roseDeep">{error}</div> : null}
            </div>
          </GlassCard>

          {lastEntry ? (
            <GlassCard className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-[20px] italic text-textDark">Mood result</div>
                <MoodBadge mood={lastEntry.mood} label={lastEntry.moodLabel} size="md" />
              </div>
              <div className="mt-3 font-display text-[18px] italic leading-relaxed text-textDark">
                {lastEntry.summary}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {lastEntry.emotionalThemes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-1 text-[12px] text-textMid"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <PatternBanner text={lastEntry.patternDetected} />
              </div>
              {lastEntry.nextQuestion ? (
                <div className="mt-4 rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3 text-[13px] text-textMid">
                  <span className="text-textSoft">Next question:</span> {lastEntry.nextQuestion}
                </div>
              ) : null}
            </GlassCard>
          ) : null}
        </div>

        {/* RIGHT: Calendar */}
        <div className="space-y-3">
          <div className="px-1">
            <div className="font-display text-[20px] italic text-textDark">Your reflection history</div>
            <div className="mt-1 text-[12px] text-textSoft">
              Tap a day with dots to reopen what you noticed.
            </div>
          </div>

          <MoodCalendar
            summaryMap={summaryMap}
            selectedDay={selectedDay}
            onDaySelect={(dk) => setSelectedDay(dk)}
          />

          <DayEntryPanel
            dateKey={selectedDay}
            entries={dayEntries}
            onClose={() => setSelectedDay(null)}
            onRevisit={(entry) => nav('/selves', { state: { entry } })}
          />

          {loading ? <div className="text-[12px] text-textSoft">Loading…</div> : null}
        </div>
      </div>
    </div>
  )
}

