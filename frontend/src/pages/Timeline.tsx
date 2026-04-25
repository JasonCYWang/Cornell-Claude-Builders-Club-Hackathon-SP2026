import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import type { FutureSelfType } from '../types'

type Milestone = {
  id: string
  age: number
  title: string
  description: string
  badge: string
  emoji: string
  fighterType: FutureSelfType
}

const STORAGE_KEY = 'futurefighter.lifeMapMilestones'

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'm-22',
    age: 22,
    title: 'First Big Break',
    description: 'You stop waiting to feel ready and start applying anyway.',
    badge: '+20 Courage XP',
    emoji: '🚀',
    fighterType: 'risk-taker',
  },
  {
    id: 'm-25',
    age: 25,
    title: 'Career Power-Up',
    description: 'You land the role that makes you feel unstoppable.',
    badge: 'Confidence Unlocked',
    emoji: '⚡',
    fighterType: 'ceo',
  },
  {
    id: 'm-30',
    age: 30,
    title: 'CEO Mode',
    description: 'You build bold ventures, make high-stakes calls, and stack wins.',
    badge: 'Boss Level',
    emoji: '💼',
    fighterType: 'ceo',
  },
  {
    id: 'm-40',
    age: 40,
    title: 'Legacy Builder',
    description: 'You mentor younger fighters and build something bigger than yourself.',
    badge: 'Impact XP',
    emoji: '🏛️',
    fighterType: 'main-character',
  },
  {
    id: 'm-50',
    age: 50,
    title: 'Soft Life Ending',
    description: 'Married, peaceful, fishing somewhere beautiful, phone on Do Not Disturb.',
    badge: 'Peace Unlocked',
    emoji: '🎣',
    fighterType: 'soft-life',
  },
]

export function Timeline() {
  const nav = useNavigate()
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES)
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_MILESTONES[0].id)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<Milestone, 'id'>>({
    age: 22,
    title: '',
    description: '',
    badge: '',
    emoji: '✨',
    fighterType: 'main-character',
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Milestone[]
      if (Array.isArray(parsed) && parsed.length) {
        const sorted = [...parsed].sort((a, b) => a.age - b.age)
        setMilestones(sorted)
        setSelectedId(sorted[0].id)
      }
    } catch {
      // ignore malformed local data
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones))
  }, [milestones])

  const selected = useMemo(
    () => milestones.find((m) => m.id === selectedId) || milestones[0],
    [milestones, selectedId],
  )

  const resetDraft = () =>
    setDraft({
      age: 22,
      title: '',
      description: '',
      badge: '',
      emoji: '✨',
      fighterType: 'main-character',
    })

  const startEdit = (m: Milestone) => {
    setEditingId(m.id)
    setDraft({
      age: m.age,
      title: m.title,
      description: m.description,
      badge: m.badge,
      emoji: m.emoji,
      fighterType: m.fighterType,
    })
  }

  const saveMilestone = () => {
    if (!draft.title.trim() || !draft.description.trim()) return
    if (editingId) {
      setMilestones((prev) =>
        [...prev]
          .map((m) => (m.id === editingId ? { ...m, ...draft, title: draft.title.trim(), description: draft.description.trim(), badge: draft.badge.trim() || 'Quest Unlocked' } : m))
          .sort((a, b) => a.age - b.age),
      )
      setSelectedId(editingId)
      setEditingId(null)
      resetDraft()
      return
    }
    const id = `m-${Date.now()}`
    const newMilestone: Milestone = {
      id,
      age: draft.age,
      title: draft.title.trim(),
      description: draft.description.trim(),
      badge: draft.badge.trim() || 'Quest Unlocked',
      emoji: draft.emoji.trim() || '✨',
      fighterType: draft.fighterType,
    }
    setMilestones((prev) => [...prev, newMilestone].sort((a, b) => a.age - b.age))
    setSelectedId(id)
    resetDraft()
  }

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => {
      const next = prev.filter((m) => m.id !== id)
      if (!next.length) return prev
      if (selectedId === id) setSelectedId(next[0].id)
      return next
    })
    if (editingId === id) {
      setEditingId(null)
      resetDraft()
    }
  }

  return (
    <div className="fm-page space-y-5">
      <div>
        <div className="font-display text-[34px] text-textDark">Life Map 🗺️</div>
        <div className="mt-1 text-[13px] text-textSoft">
          Design your future life arc checkpoint by checkpoint.
        </div>
      </div>

      <GlassCard className="p-5 bg-[linear-gradient(135deg,rgba(123,91,255,0.25),rgba(86,186,255,0.2),rgba(255,126,217,0.2))]">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[11px] font-pixel text-textDark">QUEST UNLOCKED: LIFE PROGRESSION</div>
          <div className="fm-sticker px-3 py-1 text-[11px] text-textDark">Boss Level Path</div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="relative flex min-w-[980px] items-start gap-5 pt-6">
            <div className="pointer-events-none absolute left-0 right-0 top-[36px] h-[6px] rounded-full bg-[linear-gradient(90deg,#7B5BFF,#56BAFF,#FF7ED9,#FFB166)] shadow-[0_0_20px_rgba(123,91,255,0.45)]" />
            {milestones.map((m) => {
              const active = selected?.id === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className="relative z-10 w-[176px] text-left"
                >
                  <div
                    className={[
                      'mx-auto mb-3 grid h-[42px] w-[42px] place-items-center rounded-full border-2 text-[20px] transition-all',
                      active
                        ? 'scale-110 border-white bg-[linear-gradient(135deg,#7B5BFF,#FF7ED9)] shadow-[0_10px_24px_rgba(123,91,255,0.45)]'
                        : 'border-white/70 bg-[rgba(255,255,255,0.55)]',
                    ].join(' ')}
                  >
                    {m.emoji}
                  </div>
                  <div
                    className={[
                      'rounded-glass border px-3 py-3 backdrop-blur-[16px] transition-all',
                      active
                        ? 'border-white bg-[rgba(255,255,255,0.82)] shadow-[0_12px_30px_rgba(123,91,255,0.3)]'
                        : 'border-glassBorder bg-[rgba(253,249,245,0.66)]',
                    ].join(' ')}
                  >
                    <div className="text-[11px] font-pixel text-textSoft">AGE {m.age}</div>
                    <div className="mt-1 font-display text-[20px] text-textDark">{m.title}</div>
                    <div className="mt-1 line-clamp-2 text-[12px] text-textMid">{m.description}</div>
                    <div className="mt-2 fm-sticker inline-block px-2 py-1 text-[10px] text-textDark">
                      {m.badge}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </GlassCard>

      {selected ? (
      <GlassCard className="p-5">
        <div className="text-[11px] font-pixel text-textSoft">SELECTED CHECKPOINT</div>
        <div className="mt-1 flex items-center gap-2 font-display text-[28px] text-textDark">
          <span>{selected.emoji}</span>
          <span>Age {selected.age}: {selected.title}</span>
        </div>
        <div className="mt-2 text-[14px] leading-relaxed text-textMid">{selected.description}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="fm-sticker px-3 py-1 text-[11px] text-textDark">{selected.badge}</span>
          <span className="fm-sticker px-3 py-1 text-[11px] text-textDark">Pattern Unlocked</span>
          <span className="fm-sticker px-3 py-1 text-[11px] text-textDark">Reality Check Available</span>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              nav('/selves', {
                state: {
                  lifeMapMilestone: selected,
                },
              })
            }
            className="fm-glow-button rounded-full bg-[linear-gradient(135deg,#7B5BFF,#FF7ED9,#56BAFF)] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Talk to this version
          </button>
          <button
            type="button"
            onClick={() => startEdit(selected)}
            className="ml-2 rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2.5 text-[13px] text-textDark"
          >
            Edit checkpoint
          </button>
          <button
            type="button"
            onClick={() => deleteMilestone(selected.id)}
            disabled={milestones.length <= 1}
            className="ml-2 rounded-full border border-glassBorder bg-[rgba(255,126,160,0.2)] px-4 py-2.5 text-[13px] text-textDark disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </GlassCard>
      ) : null}

      <GlassCard className="p-5">
        <div className="font-display text-[24px] text-textDark">
          {editingId ? 'Edit Milestone' : 'Add Milestone'}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-[12px] text-textSoft">Age</label>
            <input
              type="number"
              min={1}
              value={draft.age}
              onChange={(e) => setDraft((d) => ({ ...d, age: Number(e.target.value) || 1 }))}
              className="mt-1 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-textSoft">Icon / Emoji</label>
            <input
              value={draft.emoji}
              onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
              className="mt-1 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-textSoft">Title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-textSoft">Badge / Reward</label>
            <input
              value={draft.badge}
              onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value }))}
              placeholder="e.g. Boss Level"
              className="mt-1 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-2 text-[13px]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[12px] text-textSoft">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full resize-none rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-textSoft">Fighter archetype</label>
            <select
              value={draft.fighterType}
              onChange={(e) => setDraft((d) => ({ ...d, fighterType: e.target.value as FutureSelfType }))}
              className="mt-1 w-full rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-3 py-2 text-[13px]"
            >
              <option value="ceo">CEO Fighter</option>
              <option value="zen">Zen Fighter</option>
              <option value="risk-taker">Risk-Taker Fighter</option>
              <option value="main-character">Main Character Fighter</option>
              <option value="villain">Villain Arc Fighter</option>
              <option value="soft-life">Soft Life Fighter</option>
              <option value="brutal">Brutally Honest Fighter</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveMilestone}
            className="fm-glow-button rounded-full bg-[linear-gradient(135deg,#7B5BFF,#FF7ED9,#56BAFF)] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            {editingId ? 'Save changes' : 'Add milestone'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                resetDraft()
              }}
              className="rounded-full border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-2.5 text-[13px] text-textDark"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </GlassCard>
    </div>
  )
}

