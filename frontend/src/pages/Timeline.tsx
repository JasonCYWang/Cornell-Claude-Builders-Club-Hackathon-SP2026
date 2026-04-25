import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { MoodBadge } from '../components/MoodBadge'
import { PatternBanner } from '../components/PatternBanner'
import { useJournalEntries } from '../hooks/useJournalEntries'

const TAG_COLORS: Record<string, string> = {
  anxiety: 'rgba(177,119,255,0.22)',
  ambition: 'rgba(255,177,102,0.28)',
  procrastination: 'rgba(255,126,217,0.24)',
  confidence: 'rgba(86,186,255,0.25)',
  chaos: 'rgba(255,126,160,0.25)',
  clarity: 'rgba(103,214,181,0.26)',
}

export function Timeline() {
  const nav = useNavigate()
  const { entries, loading } = useJournalEntries()

  return (
    <div className="fm-page">
      <div className="mb-4">
        <div className="font-display text-[28px] italic text-textDark">Memory Vault Timeline 🧿</div>
        <div className="mt-1 text-[12px] text-textSoft">Collectible moments from your emotional multiverse.</div>
      </div>

      {loading ? <div className="text-[12px] text-textSoft">Loading…</div> : null}

      {entries.length === 0 && !loading ? (
        <GlassCard className="p-6">
          <div className="font-display text-[18px] italic text-textDark">
            Your story hasn’t been written yet. Begin with a breath.
          </div>
        </GlassCard>
      ) : null}

      <div className="space-y-4">
        {entries.map((e, idx) => (
          <div key={e.id} className="grid grid-cols-[18px_1fr] gap-3">
            <div className="relative">
              <div
                className="mx-auto mt-2 h-[10px] w-[10px] rounded-full"
                style={{ background: e.moodColor }}
              />
              {idx !== entries.length - 1 ? (
                <div className="mx-auto mt-1 h-full w-[2px] rounded-full bg-[rgba(200,192,216,0.35)]" />
              ) : null}
            </div>

            <GlassCard className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[12px] text-textSoft">
                  {new Date(e.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {e.duration}
                </div>
                <div className="flex items-center gap-2">
                  <MoodBadge mood={e.mood} label={e.moodLabel} size="sm" />
                  <button
                    type="button"
                    onClick={() => nav('/selves', { state: { entry: e } })}
                    className="rounded-full px-2 py-1 text-[12px] text-textMid hover:bg-[rgba(200,192,216,0.15)]"
                  >
                    Revisit →
                  </button>
                </div>
              </div>

              <div className="mt-3 font-display text-[18px] italic leading-relaxed text-textDark">
                {e.summary}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {e.emotionalThemes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-glassBorder px-3 py-1 text-[12px] text-textDark"
                    style={{
                      background: TAG_COLORS[t.toLowerCase()] || 'rgba(253,249,245,0.62)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <PatternBanner text={e.patternDetected} />
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  )
}

