import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import {
  FutureSelfQuestionnaire,
  getStoredQuestionnaire,
  type QuestionnaireAnswers,
} from '../components/FutureSelfQuestionnaire'
import { GlassCard } from '../components/GlassCard'

export function Dashboard() {
  const navigate = useNavigate()
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireAnswers | null>(() =>
    getStoredQuestionnaire(),
  )

  return (
    <div className="fm-page space-y-5">
      <GlassCard className="p-5 bg-[linear-gradient(135deg,rgba(123,91,255,0.22),rgba(255,126,217,0.2),rgba(86,186,255,0.18))]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-[30px] text-textDark">HOME BASE</div>
            <div className="mt-1 text-[13px] text-textMid">
              Elaine, Level 7 Future Fighter
            </div>
          </div>
          <div className="fm-sticker px-4 py-2 text-[11px] font-pixel text-textDark">NEW FIGHTER INSIGHT</div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[12px] text-textMid">
            <span>Self-Trust XP</span>
            <span>742 / 1000</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.45)]">
            <div className="h-full w-[74%] bg-[linear-gradient(90deg,#7B5BFF,#FF7ED9,#56BAFF)]" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Courage', '78'],
            ['Discipline', '64'],
            ['Clarity', '71'],
            ['Confidence', '69'],
          ].map(([stat, score]) => (
            <div key={stat} className="rounded-glass border border-white/50 bg-[rgba(253,249,245,0.74)] px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-textSoft">{stat}</div>
              <div className="mt-1 font-display text-[24px] text-textDark">{score}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-glass border border-white/50 bg-[rgba(255,255,255,0.45)] px-4 py-3">
          <div className="text-[11px] font-pixel text-textSoft">ACTIVE QUEST</div>
          <div className="mt-1 text-[14px] text-textDark">Stop waiting for certainty before acting.</div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <div className="px-1">
          <div className="font-display text-[28px] text-textDark">Pick Your Future Fighter 🎮</div>
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

