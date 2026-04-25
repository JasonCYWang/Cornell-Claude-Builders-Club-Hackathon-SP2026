import { useMemo } from 'react'
import { GlassCard } from '../components/GlassCard'
import { MoodBadge } from '../components/MoodBadge'
import { PatternBanner } from '../components/PatternBanner'
import { useJournalEntries } from '../hooks/useJournalEntries'

export function Dashboard() {
  const { entries, loading } = useJournalEntries()
  const latest = entries[0]

  const todayCopy = useMemo(() => {
    if (loading) return 'Listening for your latest reflection…'
    if (!latest) return 'Your story hasn’t been written yet. Begin with a breath.'
    return 'A small mirror of what you’ve been carrying lately.'
  }, [latest, loading])

  return (
    <div className="fm-page">
      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard className="p-5">
          <div className="font-display text-[22px] italic text-textDark">Today’s Mirror</div>
          <div className="mt-2 text-[13px] leading-relaxed text-textMid">{todayCopy}</div>

          {latest ? (
            <div className="mt-5 space-y-3">
              <MoodBadge mood={latest.mood} label={latest.moodLabel} size="lg" />
              <div className="font-display text-[17px] italic leading-relaxed text-textDark">
                {latest.summary}
              </div>
              <PatternBanner text={latest.patternDetected} />
            </div>
          ) : (
            <div className="mt-5 text-[13px] text-textSoft">
              Go to <span className="text-textMid">Journal</span> to record your first reflection.
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="font-display text-[22px] italic text-textDark">Quiet intentions</div>
          <div className="mt-2 text-[13px] leading-relaxed text-textMid">
            This app speaks gently and speculatively—no certainty, no promises. Just patterns, possibilities,
            and a place to notice yourself.
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[12px] text-textSoft">
            <div className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
              Record → Transcribe
            </div>
            <div className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
              Mood → Themes
            </div>
            <div className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
              Pattern → Question
            </div>
            <div className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
              Letters, not chat bubbles
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

