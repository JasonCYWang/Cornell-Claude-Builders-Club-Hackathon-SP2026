import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { FutureSelfCard } from '../components/FutureSelfCard'
import { GlassCard } from '../components/GlassCard'
import { LetterDisplay } from '../components/LetterDisplay'
import { MoodBadge } from '../components/MoodBadge'
import { PatternBanner } from '../components/PatternBanner'
import { useJournalEntries } from '../hooks/useJournalEntries'
import type { FutureSelfMeta, FutureSelfType, JournalEntry } from '../types'

const FUTURE_SELVES: FutureSelfMeta[] = [
  {
    id: 'risk',
    name: 'The You Who Took the Risk',
    subtitle: 'Applied, moved, said yes—before feeling ready.',
    emoji: '🌊',
    gradientClass: 'bg-gradient-to-br from-[rgba(184,205,216,0.55)] to-[rgba(200,192,216,0.15)]',
  },
  {
    id: 'safe',
    name: 'The You Who Played It Safe',
    subtitle: 'Waited, stayed, chose the known path.',
    emoji: '🪟',
    gradientClass: 'bg-gradient-to-br from-[rgba(200,192,216,0.55)] to-[rgba(253,249,245,0.0)]',
  },
  {
    id: 'burnt',
    name: 'The Burnt-Out You',
    subtitle: 'Pushed too hard for too long without rest.',
    emoji: '🕯️',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,184,184,0.55)] to-[rgba(253,249,245,0.0)]',
  },
  {
    id: 'fulfilled',
    name: 'The Fulfilled You',
    subtitle: 'Found alignment between values and daily life.',
    emoji: '🌿',
    gradientClass: 'bg-gradient-to-br from-[rgba(184,205,184,0.55)] to-[rgba(253,249,245,0.0)]',
  },
  {
    id: 'regret',
    name: 'The Regretful You',
    subtitle: 'Wishes they acted differently, and learns from it.',
    emoji: '🍂',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,200,184,0.55)] to-[rgba(253,249,245,0.0)]',
  },
  {
    id: 'confident',
    name: 'The Confident You',
    subtitle: 'Slowly, quietly built trust in their judgment.',
    emoji: '✨',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,184,200,0.55)] to-[rgba(253,249,245,0.0)]',
  },
]

export function FutureSelves() {
  const location = useLocation()
  const { entries } = useJournalEntries()

  const preloadedEntry = (location.state as { entry?: JournalEntry } | null)?.entry
  const activeEntry = preloadedEntry || entries[0] || null

  const [selected, setSelected] = useState<FutureSelfType>('risk')
  const [question, setQuestion] = useState('')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMeta = useMemo(
    () => FUTURE_SELVES.find((s) => s.id === selected) || FUTURE_SELVES[0],
    [selected],
  )

  const generate = async (opts?: { allowEmptyQuestion?: boolean }) => {
    setError(null)
    if (!activeEntry) {
      setError('Record a journal entry first, then return here.')
      return
    }
    const q = question.trim()
    if (!q && !opts?.allowEmptyQuestion) {
      setError('Ask a question—or leave it empty and press “Generate opening letter”.')
      return
    }
    setLoading(true)
    try {
      const res = await api.getFutureReflection({
        question: q || 'What do you want me to notice first?',
        futureSelfType: selected,
        journalSummary: activeEntry.summary,
        patternDetected: activeEntry.patternDetected,
      })
      setLetter(res.letter)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reflection failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // If navigated here from a day panel, generate a gentle opening letter automatically.
    if (preloadedEntry) {
      void generate({ allowEmptyQuestion: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fm-page space-y-5">
      {activeEntry ? (
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-[22px] italic text-textDark">Your current thread</div>
              <div className="mt-1 text-[12px] text-textSoft">
                Letters are reflective and speculative—no certainty, no predictions.
              </div>
            </div>
            <MoodBadge mood={activeEntry.mood} label={activeEntry.moodLabel} size="md" />
          </div>
          <div className="mt-3 font-display text-[18px] italic leading-relaxed text-textDark">
            {activeEntry.summary}
          </div>
          <div className="mt-4">
            <PatternBanner text={activeEntry.patternDetected} />
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {FUTURE_SELVES.map((s) => (
            <FutureSelfCard
              key={s.id}
              meta={s}
              selected={s.id === selected}
              onSelect={() => setSelected(s.id)}
            />
          ))}
        </div>

        <div className="space-y-3">
          <LetterDisplay title={selectedMeta.name} text={letter} loading={loading} />

          <GlassCard className="p-5">
            <label className="text-[12px] font-medium text-textSoft">
              Ask this future self something…
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Will I regret waiting?"
              className="mt-2 w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3 text-[13px] text-textDark outline-none placeholder:text-textSoft focus:border-[rgba(155,143,176,0.8)]"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void generate({ allowEmptyQuestion: true })}
                disabled={loading}
                className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2 text-[13px] text-textMid hover:bg-[rgba(200,192,216,0.12)] disabled:opacity-50"
              >
                Generate opening letter
              </button>
              <button
                type="button"
                onClick={() => void generate()}
                disabled={loading}
                className="rounded-full bg-[rgba(200,192,216,0.28)] px-4 py-2 text-[13px] font-medium text-textDark hover:bg-[rgba(200,192,216,0.36)] disabled:opacity-50"
              >
                Ask & receive
              </button>
            </div>

            {error ? <div className="mt-3 text-[12px] text-roseDeep">{error}</div> : null}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

