import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import {
  FutureSelfQuestionnaire,
  getStoredQuestionnaire,
  type QuestionnaireAnswers,
} from '../components/FutureSelfQuestionnaire'
import { GlassCard } from '../components/GlassCard'
import { MoodBadge } from '../components/MoodBadge'
import { PatternBanner } from '../components/PatternBanner'
import { useJournalEntries } from '../hooks/useJournalEntries'

export function Dashboard() {
  const navigate = useNavigate()
  const { entries, loading } = useJournalEntries()
  const latest = entries[0]
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireAnswers | null>(() =>
    getStoredQuestionnaire(),
  )

  const todayCopy = useMemo(() => {
    if (loading) return 'Listening for your latest reflection…'
    if (!latest) return 'Your story hasn’t been written yet. Begin with a breath.'
    return 'A small mirror of what you’ve been carrying lately.'
  }, [latest, loading])

  return (
    <div className="fm-page space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard className="p-5 bg-[linear-gradient(135deg,rgba(255,126,217,0.24),rgba(86,186,255,0.18),rgba(255,177,102,0.2))]">
          <div className="font-display text-[28px] italic text-textDark">Today’s Mirror Moment ✨</div>
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

        <GlassCard className="p-5 bg-[linear-gradient(135deg,rgba(123,91,255,0.2),rgba(255,126,217,0.2),rgba(86,186,255,0.16))]">
          <div className="font-display text-[28px] italic text-textDark">Pattern Callout 👀</div>
          <div className="mt-2 text-[13px] leading-relaxed text-textMid">
            Emotional time travel, but make it iconic. Patterns, plot twists, and future-self energy.
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[12px] text-textSoft">
            <div className="fm-sticker px-4 py-3 text-textDark">
              Record → Transcribe
            </div>
            <div className="fm-sticker px-4 py-3 text-textDark">
              Mood → Themes
            </div>
            <div className="fm-sticker px-4 py-3 text-textDark">
              Pattern → Question
            </div>
            <div className="fm-sticker px-4 py-3 text-textDark">
              Messages from alternate timelines
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-3">
        <div className="px-1">
          <div className="font-display text-[28px] italic text-textDark">Pick Your Future Fighter 🎮</div>
          <div className="mt-1 text-[12px] text-textSoft">
            This questionnaire (from your `questionaire` flow) creates personalized future directions.
          </div>
        </div>

        {!questionnaire ? (
          <FutureSelfQuestionnaire
            onComplete={(answers) => {
              setQuestionnaire(answers)
              // Persist the full questionnaire so backend prompt can use it.
              void api.saveProfile(answers as unknown as Record<string, unknown>)
            }}
          />
        ) : (
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-[20px] italic text-textDark">
                  {questionnaire.firstName || 'Your'} future selves are sketched
                </div>
                <div className="mt-1 text-[12px] text-textSoft">
                  Life stage: {questionnaire.lifeStage || 'Not set'} • Mood: {questionnaire.mood || 'Not set'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('futuremirror.questionnaire')
                  setQuestionnaire(null)
                }}
                className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-1.5 text-[12px] text-textMid hover:bg-[rgba(200,192,216,0.12)]"
              >
                Edit answers
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-textSoft">One-year self</div>
                <div className="mt-2 font-display text-[18px] italic text-textDark">
                  The Emerging You
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-textMid">
                  {questionnaire.oneYearVision || 'Define your next chapter in the questionnaire.'}
                </div>
              </div>
              <div className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-textSoft">Five-year self</div>
                <div className="mt-2 font-display text-[18px] italic text-textDark">
                  The Aligned You
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-textMid">
                  {questionnaire.fiveYearVision || 'Define your longer horizon in the questionnaire.'}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {questionnaire.focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-1 text-[12px] text-textMid"
                >
                  {area}
                </span>
              ))}
              {questionnaire.futureSelfFeeling ? (
                <span className="rounded-full border border-glassBorder bg-[rgba(200,192,216,0.2)] px-3 py-1 text-[12px] text-textDark">
                  Wants to feel: {questionnaire.futureSelfFeeling}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => navigate('/selves')}
              className="mt-4 rounded-full bg-[rgba(200,192,216,0.28)] px-4 py-2 text-[13px] font-medium text-textDark hover:bg-[rgba(200,192,216,0.36)]"
            >
              Open Future Selves
            </button>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

