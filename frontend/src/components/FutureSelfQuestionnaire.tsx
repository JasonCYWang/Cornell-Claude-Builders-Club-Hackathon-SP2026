import { useMemo, useState } from 'react'

type QuestionnaireAnswers = {
  firstName: string
  lifeStage: string
  focusAreas: string[]
  mood: string
  biggestStress: string
  reflectionFrequency: string
  oneYearVision: string
  fiveYearVision: string
  moreOf: string
  futureSelfFeeling: string
}

const STORAGE_KEY = 'futuremirror.questionnaire'

const steps = [
  {
    id: 1,
    title: 'Who you are',
    subtitle: 'A little grounding context helps Future Mirror meet you where you are.',
  },
  {
    id: 2,
    title: 'How you feel',
    subtitle: "Name the season you're in so reflections can respond with care.",
  },
  {
    id: 3,
    title: 'Who you want to become',
    subtitle: "Let's sketch the version of you that you're slowly growing toward.",
  },
] as const

const lifeStages = [
  'Student',
  'Early career',
  'Working professional',
  'Career transition',
  'Caretaker or parent',
  'Retired',
  'Something else',
]

const focusAreas = [
  'Health & body',
  'Mental wellbeing',
  'Relationships',
  'Career & purpose',
  'Creativity',
  'Finances',
  'Learning',
  'Spirituality',
]

const moods = ['Struggling', 'Getting by', 'Neutral', 'Pretty good', 'Thriving']

const reflectionFrequencies = [
  'Rarely or never',
  'Once in a while',
  'A few times a week',
  'Almost daily',
]

const futureFeelings = [
  'Gently challenged',
  'Deeply understood',
  'Honestly guided',
  'Warmly encouraged',
  'Playfully curious',
]

const initialAnswers: QuestionnaireAnswers = {
  firstName: '',
  lifeStage: '',
  focusAreas: [],
  mood: '',
  biggestStress: '',
  reflectionFrequency: '',
  oneYearVision: '',
  fiveYearVision: '',
  moreOf: '',
  futureSelfFeeling: '',
}

const chipClass = (selected: boolean) =>
  [
    'rounded-full border px-3 py-1.5 text-[12px] transition-colors',
    selected
      ? 'border-lavenderDeep bg-[rgba(155,143,176,0.18)] text-textDark'
      : 'border-glassBorder bg-[rgba(253,249,245,0.72)] text-textMid hover:bg-[rgba(200,192,216,0.14)]',
  ].join(' ')

export function getStoredQuestionnaire(): QuestionnaireAnswers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as QuestionnaireAnswers
    return parsed
  } catch {
    return null
  }
}

export function FutureSelfQuestionnaire({
  onComplete,
}: {
  onComplete: (answers: QuestionnaireAnswers) => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers)

  const canFinish = useMemo(() => {
    return Boolean(answers.oneYearVision.trim() && answers.fiveYearVision.trim())
  }, [answers.fiveYearVision, answers.oneYearVision])

  const updateAnswer = <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const toggleFocusArea = (area: string) => {
    setAnswers((prev) => {
      const selected = prev.focusAreas.includes(area)
      if (selected) {
        return { ...prev, focusAreas: prev.focusAreas.filter((item) => item !== area) }
      }
      if (prev.focusAreas.length >= 3) return prev
      return { ...prev, focusAreas: [...prev.focusAreas, area] }
    })
  }

  const goForward = () => {
    if (currentStep === steps.length - 1) {
      if (!canFinish) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
      onComplete(answers)
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  return (
    <section className="rounded-glass border border-glassBorder bg-glassBg p-5 shadow-soft backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]">
      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          {steps.map((step, index) => {
            const active = index === currentStep
            const done = index < currentStep
            return (
              <div key={step.id} className="flex flex-1 items-center gap-2">
                <div
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold',
                    done
                      ? 'border-sage bg-sage text-textDark'
                      : active
                        ? 'border-lavenderDeep bg-[rgba(200,192,216,0.25)] text-textDark'
                        : 'border-glassBorder bg-[rgba(253,249,245,0.62)] text-textSoft',
                  ].join(' ')}
                >
                  {done ? '✓' : step.id}
                </div>
                {index < steps.length - 1 ? (
                  <div className="h-[2px] flex-1 rounded-full bg-[rgba(200,192,216,0.35)]" />
                ) : null}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-textSoft">Build your future selves</p>
        <h2 className="mt-1 font-display text-[26px] italic text-textDark">{steps[currentStep].title}</h2>
        <p className="mt-1 text-[13px] text-textMid">{steps[currentStep].subtitle}</p>
      </div>

      {currentStep === 0 ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[12px] text-textSoft">First name or nickname</label>
            <input
              type="text"
              value={answers.firstName}
              onChange={(e) => updateAnswer('firstName', e.target.value)}
              placeholder="What should we call you?"
              className="w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.7)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-lavenderDeep"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-textSoft">Life stage</label>
            <select
              value={answers.lifeStage}
              onChange={(e) => updateAnswer('lifeStage', e.target.value)}
              className="w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.7)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-lavenderDeep"
            >
              <option value="">Select one</option>
              {lifeStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[12px] text-textSoft">Focus areas</label>
              <span className="text-[11px] text-textSoft">{answers.focusAreas.length}/3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleFocusArea(area)}
                  className={chipClass(answers.focusAreas.includes(area))}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[12px] text-textSoft">Mood right now</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => updateAnswer('mood', mood)}
                  className={chipClass(answers.mood === mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-textSoft">Biggest source of stress lately</label>
            <textarea
              value={answers.biggestStress}
              onChange={(e) => updateAnswer('biggestStress', e.target.value)}
              rows={4}
              placeholder="What has been weighing on you most?"
              className="w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.7)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-lavenderDeep"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] text-textSoft">Reflection frequency</label>
            <div className="flex flex-wrap gap-2">
              {reflectionFrequencies.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => updateAnswer('reflectionFrequency', freq)}
                  className={chipClass(answers.reflectionFrequency === freq)}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[12px] text-textSoft">Where do you want to be in 1 year?</label>
            <textarea
              value={answers.oneYearVision}
              onChange={(e) => updateAnswer('oneYearVision', e.target.value)}
              rows={3}
              placeholder="Describe the next version of your life."
              className="w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.7)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-lavenderDeep"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-textSoft">What does life look like in 5 years?</label>
            <textarea
              value={answers.fiveYearVision}
              onChange={(e) => updateAnswer('fiveYearVision', e.target.value)}
              rows={3}
              placeholder="Paint a fuller picture of the life you're building."
              className="w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.7)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-lavenderDeep"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-textSoft">One thing you wish you did more of</label>
            <input
              type="text"
              value={answers.moreOf}
              onChange={(e) => updateAnswer('moreOf', e.target.value)}
              placeholder="resting, writing, reaching out..."
              className="w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.7)] px-4 py-2.5 text-[13px] text-textDark outline-none focus:border-lavenderDeep"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] text-textSoft">
              How do you want your future self to feel?
            </label>
            <div className="flex flex-wrap gap-2">
              {futureFeelings.map((feeling) => (
                <button
                  key={feeling}
                  type="button"
                  onClick={() => updateAnswer('futureSelfFeeling', feeling)}
                  className={chipClass(answers.futureSelfFeeling === feeling)}
                >
                  {feeling}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-glassBorder pt-4">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
          className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2 text-[12px] text-textMid disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goForward}
          disabled={currentStep === steps.length - 1 && !canFinish}
          className="rounded-full bg-[rgba(200,192,216,0.28)] px-5 py-2 text-[12px] font-medium text-textDark disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? 'Build my future selves' : 'Continue'}
        </button>
      </div>
    </section>
  )
}

export type { QuestionnaireAnswers }

