import { useMemo } from 'react'
import type { JournalEntry } from '../types'
import { GlassCard } from './GlassCard'
import { MoodBadge } from './MoodBadge'

interface DayEntryPanelProps {
  dateKey: string | null
  entries: JournalEntry[]
  onClose: () => void
  onRevisit: (entry: JournalEntry) => void
}

const formatLong = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map((x) => Number(x))
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export function DayEntryPanel({ dateKey, entries, onClose, onRevisit }: DayEntryPanelProps) {
  const isOpen = Boolean(dateKey)
  const sorted = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)), [entries])

  return (
    <div
      className={[
        'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
        isOpen ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{ maxHeight: isOpen ? 1000 : 0 }}
    >
      <div className="mt-3">
        <GlassCard className="relative px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full px-2 py-1 text-[14px] text-textMid hover:bg-[rgba(200,192,216,0.15)]"
            aria-label="Close day panel"
          >
            ×
          </button>

          <div className="pr-12">
            <div className="font-display text-[17px] leading-tight text-textDark md:text-[18px]">
              {dateKey ? formatLong(dateKey) : ''}
            </div>
            <div className="mt-0.5 text-[12px] text-textSoft">
              {sorted.length} {sorted.length === 1 ? 'reflection' : 'reflections'}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {sorted.length === 0 ? (
              <div className="text-[13px] text-textMid">
                <div className="text-textDark">No reflections on this day.</div>
                <div className="mt-1 text-textSoft">Scroll up to record one.</div>
              </div>
            ) : (
              sorted.map((e) => (
                <div
                  key={e.id}
                  className="rounded-glass border border-glassBorder bg-[rgba(253,249,245,0.62)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MoodBadge mood={e.mood} label={e.moodLabel} size="sm" />
                      <div className="text-[12px] text-textSoft">
                        {new Date(e.date).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        • {e.duration}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRevisit(e)}
                      className="rounded-full px-2 py-1 text-[12px] text-textMid hover:bg-[rgba(200,192,216,0.15)]"
                    >
                      Revisit →
                    </button>
                  </div>

                  <div
                    className="mt-2 text-[13px] leading-relaxed text-textDark"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    “{e.transcript}”
                  </div>

                  <div className="mt-2 text-[12px] text-textSoft">
                    Pattern: <span className="text-textMid">{e.patternDetected}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

