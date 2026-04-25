import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { FutureSelfCard } from '../components/FutureSelfCard'
import { GlassCard } from '../components/GlassCard'
import { LetterDisplay } from '../components/LetterDisplay'
import { MoodBadge } from '../components/MoodBadge'
import { PatternBanner } from '../components/PatternBanner'
import { useJournalEntries } from '../hooks/useJournalEntries'
import type {
  FutureSelfMeta,
  FutureSelfType,
  JournalEntry,
} from '../types'

const FUTURE_SELVES: FutureSelfMeta[] = [
  {
    id: 'ceo',
    name: 'CEO Fighter',
    subtitle: 'Strategic, decisive, and allergic to avoidable drama.',
    emoji: '📈',
    gradientClass: 'bg-gradient-to-br from-[rgba(184,205,216,0.55)] to-[rgba(184,205,184,0.25)]',
    strength: 'Discipline',
    weakness: 'Rigidity',
    specialMove: 'Executes before overthinking starts',
  },
  {
    id: 'brutal',
    name: 'Brutally Honest Fighter',
    subtitle: 'Sharp clarity, zero fluff, and meme-level honesty.',
    emoji: '🗡️',
    gradientClass: 'bg-gradient-to-br from-[rgba(200,192,216,0.55)] to-[rgba(253,249,245,0.0)]',
    strength: 'Clarity',
    weakness: 'Can come in hot',
    specialMove: 'Names the truth in one sentence',
  },
  {
    id: 'zen',
    name: 'Zen Fighter',
    subtitle: 'Low chaos, high peace, still winning.',
    emoji: '🌸',
    gradientClass: 'bg-gradient-to-br from-[rgba(184,205,184,0.55)] to-[rgba(253,249,245,0.0)]',
    strength: 'Calm',
    weakness: 'Slow starts',
    specialMove: 'Stabilizes the nervous system mid-crisis',
  },
  {
    id: 'soft-life',
    name: 'Soft Life Fighter',
    subtitle: 'Protects peace without shrinking ambition.',
    emoji: '🪷',
    gradientClass: 'bg-gradient-to-br from-[rgba(255,126,217,0.35)] to-[rgba(184,205,184,0.3)]',
    strength: 'Boundaries',
    weakness: 'Avoiding discomfort',
    specialMove: 'Wins quietly and sustainably',
  },
  {
    id: 'villain',
    name: 'Villain Arc Fighter',
    subtitle: 'Boundaries, standards, and glorious focus.',
    emoji: '🖤',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,184,184,0.55)] to-[rgba(200,192,216,0.25)]',
    strength: 'Standards',
    weakness: 'Impatience',
    specialMove: 'Cuts fake obligations instantly',
  },
  {
    id: 'main-character',
    name: 'Main Character Fighter',
    subtitle: 'Cinematic momentum with emotional depth.',
    emoji: '🎬',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,200,184,0.55)] to-[rgba(184,205,216,0.2)]',
    strength: 'Courage',
    weakness: 'Can romanticize chaos',
    specialMove: 'Turns fear into plot momentum',
  },
  {
    id: 'risk-taker',
    name: 'Risk-Taker Fighter',
    subtitle: 'Acts before fear disappears.',
    emoji: '🚀',
    gradientClass: 'bg-gradient-to-br from-[rgba(255,177,102,0.5)] to-[rgba(255,126,217,0.2)]',
    strength: 'Action bias',
    weakness: 'Overcommitting',
    specialMove: 'Launches the first move immediately',
  },
]

export function FutureSelves() {
  const location = useLocation()
  const { entries } = useJournalEntries()

  const preloadedEntry = (location.state as { entry?: JournalEntry } | null)?.entry
  const activeEntry = preloadedEntry || entries[0] || null

  const [selected, setSelected] = useState<FutureSelfType>('ceo')
  const [question, setQuestion] = useState('')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roastMode, setRoastMode] = useState(false)

  const selectedMeta = useMemo(
    () => FUTURE_SELVES.find((s) => s.id === selected) || FUTURE_SELVES[0],
    [selected],
  )

  const generate = async (opts?: { allowEmptyQuestion?: boolean; realityCheck?: boolean }) => {
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
        roastMode,
        realityCheck: opts?.realityCheck,
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
              <div className="font-display text-[26px] text-textDark">Fighter Builder ⚡</div>
              <div className="mt-1 text-[12px] text-textSoft">Your emotional time machine is online.</div>
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
          <LetterDisplay
            title={selectedMeta.name}
            subtitle={`Message from ${selectedMeta.name}, Timeline 2031`}
            text={letter}
            loading={loading}
          />

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
                onClick={() => setRoastMode((v) => !v)}
                className={[
                  'rounded-full px-4 py-2 text-[13px] font-medium',
                  roastMode
                    ? 'bg-[linear-gradient(135deg,rgba(255,126,217,0.45),rgba(255,177,102,0.45))] text-textDark'
                    : 'border border-glassBorder bg-[rgba(253,249,245,0.62)] text-textMid',
                ].join(' ')}
              >
                Roast Mode 🔥 {roastMode ? 'ON' : 'OFF'}
              </button>
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
              <button
                type="button"
                onClick={() => void generate({ allowEmptyQuestion: true, realityCheck: true })}
                disabled={loading}
                className="rounded-full bg-[rgba(155,143,176,0.35)] px-4 py-2 text-[13px] font-medium text-textDark hover:bg-[rgba(155,143,176,0.46)] disabled:opacity-50"
              >
                Tell me the truth
              </button>
            </div>
            {roastMode ? (
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="fm-sticker px-3 py-1 text-textDark">Future Cringe Detected</span>
                <span className="fm-sticker px-3 py-1 text-textDark">Delusion Level: HIGH</span>
                <span className="fm-sticker px-3 py-1 text-textDark">Character Development Pending</span>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuestion('Tell me the truth about what I am avoiding.')
                  void generate({ realityCheck: true })
                }}
                className="rounded-full border border-glassBorder bg-[rgba(123,91,255,0.18)] px-3 py-1.5 text-[12px] text-textDark hover:bg-[rgba(123,91,255,0.28)]"
              >
                Tell me the truth
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestion('Roast me for this pattern.')
                  setRoastMode(true)
                  void generate()
                }}
                className="rounded-full border border-glassBorder bg-[rgba(255,126,217,0.2)] px-3 py-1.5 text-[12px] text-textDark hover:bg-[rgba(255,126,217,0.3)]"
              >
                Roast me
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelected('main-character')
                  setQuestion('Give me main character advice for this week.')
                  void generate()
                }}
                className="rounded-full border border-glassBorder bg-[rgba(86,186,255,0.22)] px-3 py-1.5 text-[12px] text-textDark hover:bg-[rgba(86,186,255,0.32)]"
              >
                Give me main character advice
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelected('risk-taker')
                  setQuestion('What action should I take before I feel ready?')
                  void generate()
                }}
                className="rounded-full border border-glassBorder bg-[rgba(255,177,102,0.25)] px-3 py-1.5 text-[12px] text-textDark hover:bg-[rgba(255,177,102,0.35)]"
              >
                Risk-taker advice
              </button>
            </div>

            {error ? <div className="mt-3 text-[12px] text-roseDeep">{error}</div> : null}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

