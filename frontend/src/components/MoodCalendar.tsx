import { useMemo, useState } from 'react'
import type { CalendarSummaryMap } from '../types'
import { GlassCard } from './GlassCard'

interface MoodCalendarProps {
  summaryMap: CalendarSummaryMap
  selectedDay: string | null
  onDaySelect: (dateKey: string) => void
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

const fmtMonthYear = (d: Date) =>
  d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

const pad2 = (n: number) => String(n).padStart(2, '0')
const toDateKey = (year: number, monthIndex: number, day: number) =>
  `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

const MoodDots = ({ count, color }: { count: number; color: string }) => {
  if (count <= 0) return null
  const dots = Math.min(count, 3)
  const size = count === 1 ? 8 : 6
  return (
    <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
      {count >= 4 ? (
        <div
          style={{
            marginLeft: 3,
            fontSize: 10,
            lineHeight: '10px',
            color: 'var(--text-soft)',
          }}
        >
          {count}
        </div>
      ) : null}
    </div>
  )
}

export function MoodCalendar({ summaryMap, selectedDay, onDaySelect }: MoodCalendarProps) {
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()))

  const monthMeta = useMemo(() => {
    const year = viewMonth.getFullYear()
    const monthIndex = viewMonth.getMonth()
    const first = new Date(year, monthIndex, 1)
    const firstWeekday = first.getDay()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    return { year, monthIndex, firstWeekday, daysInMonth }
  }, [viewMonth])

  const todayKey = useMemo(() => {
    const now = new Date()
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const days = useMemo(() => {
    const blanks = Array.from({ length: monthMeta.firstWeekday }).map(() => null as number | null)
    const nums = Array.from({ length: monthMeta.daysInMonth }).map((_, i) => i + 1)
    return [...blanks, ...nums]
  }, [monthMeta.daysInMonth, monthMeta.firstWeekday])

  const monthLegend = useMemo(() => {
    const prefix = `${monthMeta.year}-${pad2(monthMeta.monthIndex + 1)}-`
    const counts = new Map<string, { mood: string; color: string; total: number }>()
    for (const [dateKey, summary] of Object.entries(summaryMap)) {
      if (!dateKey.startsWith(prefix)) continue
      const existing = counts.get(summary.mood) || { mood: summary.mood, color: summary.moodColor, total: 0 }
      existing.total += summary.count
      counts.set(summary.mood, existing)
    }
    return Array.from(counts.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [monthMeta.monthIndex, monthMeta.year, summaryMap])

  return (
    <GlassCard className="px-4 py-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)))}
          className="rounded-full px-2 py-1 text-[13px] text-textMid hover:bg-[rgba(200,192,216,0.15)]"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="font-display text-[20px] text-textDark">{fmtMonthYear(viewMonth)}</div>
        <button
          type="button"
          onClick={() => setViewMonth((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)))}
          className="rounded-full px-2 py-1 text-[13px] text-textMid hover:bg-[rgba(200,192,216,0.15)]"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center font-sans text-[11px] text-textSoft">
            {wd}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day == null) {
            return <div key={`blank-${idx}`} className="h-[36px] w-[36px]" />
          }
          const dateKey = toDateKey(monthMeta.year, monthMeta.monthIndex, day)
          const summary = summaryMap[dateKey]
          const hasEntries = Boolean(summary?.count)
          const selected = selectedDay === dateKey
          const isToday = todayKey === dateKey

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => hasEntries && onDaySelect(dateKey)}
              className={[
                'relative h-[36px] w-[36px] rounded-full transition-colors duration-150',
                hasEntries ? 'cursor-pointer' : 'cursor-default',
                selected
                  ? 'border border-lavenderDeep bg-glassBg'
                  : 'border border-transparent hover:bg-[rgba(200,192,216,0.15)]',
              ].join(' ')}
              style={{ pointerEvents: hasEntries ? 'auto' : 'none' }}
              aria-label={`Day ${day}`}
            >
              <div className="absolute left-1/2 top-[6px] -translate-x-1/2 font-sans text-[13px] text-textMid">
                {day}
              </div>
              <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2">
                {summary ? <MoodDots count={summary.count} color={summary.moodColor} /> : null}
              </div>
              {isToday ? (
                <div className="absolute left-1/2 top-[24px] h-[2px] w-[14px] -translate-x-1/2 rounded-full bg-[rgba(44,36,32,0.45)]" />
              ) : null}
            </button>
          )
        })}
      </div>

      {monthLegend.length ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {monthLegend.map((m) => (
            <div key={m.mood} className="flex items-center gap-2 text-[11px] text-textSoft">
              <span className="h-[8px] w-[8px] rounded-full" style={{ background: m.color }} />
              <span className="capitalize">{m.mood}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-[12px] text-textSoft">No reflections yet this month.</div>
      )}
    </GlassCard>
  )
}

