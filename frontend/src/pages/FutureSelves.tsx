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
  ApprovalResponse,
  DelusionResponse,
  FutureSelfMeta,
  FutureSelfType,
  JournalEntry,
} from '../types'

const FUTURE_SELVES: FutureSelfMeta[] = [
  {
    id: 'ceo',
    name: 'CEO Version of You',
    subtitle: 'Strategic, decisive, and allergic to avoidable drama.',
    emoji: '📈',
    gradientClass: 'bg-gradient-to-br from-[rgba(184,205,216,0.55)] to-[rgba(184,205,184,0.25)]',
  },
  {
    id: 'brutal',
    name: 'Brutally Honest You',
    subtitle: 'Sharp clarity, zero fluff, and meme-level honesty.',
    emoji: '🗡️',
    gradientClass: 'bg-gradient-to-br from-[rgba(200,192,216,0.55)] to-[rgba(253,249,245,0.0)]',
  },
  {
    id: 'zen',
    name: 'Soft Life You',
    subtitle: 'Low chaos, high peace, still winning.',
    emoji: '🌸',
    gradientClass: 'bg-gradient-to-br from-[rgba(184,205,184,0.55)] to-[rgba(253,249,245,0.0)]',
  },
  {
    id: 'villain',
    name: 'Villain Arc You',
    subtitle: 'Boundaries, standards, and glorious focus.',
    emoji: '🖤',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,184,184,0.55)] to-[rgba(200,192,216,0.25)]',
  },
  {
    id: 'main-character',
    name: 'Main Character You',
    subtitle: 'Cinematic momentum with emotional depth.',
    emoji: '🎬',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,200,184,0.55)] to-[rgba(184,205,216,0.2)]',
  },
  {
    id: 'delusional-confidence',
    name: 'Delusional Confidence You',
    subtitle: 'Wild belief, big energy, suspiciously effective.',
    emoji: '⚡',
    gradientClass: 'bg-gradient-to-br from-[rgba(212,184,200,0.55)] to-[rgba(253,249,245,0.0)]',
  },
]

const LIFE_PATH_CARDS = [
  { name: 'Wall Street You', vibe: 'Power suits, giant calendar, elite execution.' },
  { name: 'Startup Founder You', vibe: 'Messy courage, high upside, no comfort zone.' },
  { name: 'Peaceful Balanced You', vibe: 'Strong routines, deep sleep, sustainable wins.' },
  { name: 'Burned Out Achievement You', vibe: 'Trophy shelf full, nervous system empty.' },
  { name: 'Quiet Happy You', vibe: 'Lower noise, better relationships, meaningful pace.' },
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
  const [approvalInput, setApprovalInput] = useState('')
  const [approvalResult, setApprovalResult] = useState<ApprovalResponse | null>(null)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [delusionInput, setDelusionInput] = useState('')
  const [delusionResult, setDelusionResult] = useState<DelusionResponse | null>(null)
  const [delusionLoading, setDelusionLoading] = useState(false)
  const [voicemailPlaying, setVoicemailPlaying] = useState(false)

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

  const runApproval = async () => {
    if (!approvalInput.trim()) return
    setApprovalLoading(true)
    try {
      const res = await api.getFutureApproval({
        question: approvalInput.trim(),
        context: activeEntry?.patternDetected || '',
      })
      setApprovalResult(res)
    } finally {
      setApprovalLoading(false)
    }
  }

  const runDelusionDetector = async () => {
    if (!delusionInput.trim()) return
    setDelusionLoading(true)
    try {
      const res = await api.getDelusionCheck({ statement: delusionInput.trim() })
      setDelusionResult(res)
    } finally {
      setDelusionLoading(false)
    }
  }

  return (
    <div className="fm-page space-y-5">
      {activeEntry ? (
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-[26px] italic text-textDark">Your current thread ⚡</div>
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
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="font-display text-[24px] italic text-textDark">Future Self Voicemail 📼</div>
              <button
                type="button"
                onClick={() => setVoicemailPlaying((p) => !p)}
                className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-1 text-[12px] text-textMid hover:bg-[rgba(200,192,216,0.12)]"
              >
                {voicemailPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            <div className="text-[12px] text-textSoft">Transmission from {selectedMeta.name}, Timeline 2031…</div>
            <div className="mt-3 flex h-[44px] items-end gap-[4px]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-full bg-[rgba(155,143,176,0.55)] transition-all duration-300"
                  style={{ height: `${voicemailPlaying ? 8 + ((i * 13) % 30) : 10}px` }}
                />
              ))}
            </div>
          </GlassCard>

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
            </div>

            {error ? <div className="mt-3 text-[12px] text-roseDeep">{error}</div> : null}
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard className="p-5">
          <div className="font-display text-[24px] italic text-textDark">Would future me approve? 🧪</div>
          <div className="mt-1 text-[12px] text-textSoft">Fast judgment from your timeline.</div>
          <input
            value={approvalInput}
            onChange={(e) => setApprovalInput(e.target.value)}
            placeholder="Should I text them again?"
            className="mt-3 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-[rgba(155,143,176,0.8)]"
          />
          <button
            type="button"
            onClick={() => void runApproval()}
            disabled={approvalLoading}
            className="mt-3 rounded-full bg-[rgba(200,192,216,0.28)] px-4 py-2 text-[13px] font-medium text-textDark hover:bg-[rgba(200,192,216,0.36)] disabled:opacity-50"
          >
            {approvalLoading ? 'Scanning timeline…' : 'Check future approval'}
          </button>
          {approvalResult ? (
            <div className="mt-3 rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-textSoft">Result badge</div>
              <div className="mt-1 font-display text-[24px] italic text-textDark">{approvalResult.badge}</div>
              <div className="mt-1 text-[13px] text-textMid">{approvalResult.reason}</div>
            </div>
          ) : null}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="font-display text-[24px] italic text-textDark">Delusion Detector™ 🚨</div>
          <div className="mt-1 text-[12px] text-textSoft">Gentle chaos, brutal clarity.</div>
          <input
            value={delusionInput}
            onChange={(e) => setDelusionInput(e.target.value)}
            placeholder="I'll definitely start tomorrow."
            className="mt-3 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-[rgba(155,143,176,0.8)]"
          />
          <button
            type="button"
            onClick={() => void runDelusionDetector()}
            disabled={delusionLoading}
            className="mt-3 rounded-full bg-[rgba(212,184,184,0.32)] px-4 py-2 text-[13px] font-medium text-textDark hover:bg-[rgba(212,184,184,0.44)] disabled:opacity-50"
          >
            {delusionLoading ? 'Detecting…' : 'Run detector'}
          </button>
          {delusionResult ? (
            <div className="mt-3 rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
              <div className="text-[13px] font-medium text-textDark">Delusion detected.</div>
              <div className="mt-1 text-[12px] text-textSoft">Severity: {delusionResult.severity}</div>
              <div className="mt-2 text-[13px] text-textMid">{delusionResult.message}</div>
            </div>
          ) : null}
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="font-display text-[28px] italic text-textDark">Life Path Cards 🌌</div>
        <div className="mt-1 text-[12px] text-textSoft">Parallel universes. Same you. Different defaults.</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LIFE_PATH_CARDS.map((card) => (
            <div
              key={card.name}
              className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-3"
            >
              <div className="font-display text-[17px] italic text-textDark">{card.name}</div>
              <div className="mt-1 text-[12px] leading-relaxed text-textMid">{card.vibe}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

