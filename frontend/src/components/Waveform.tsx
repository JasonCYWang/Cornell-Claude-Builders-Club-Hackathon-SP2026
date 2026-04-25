import { useEffect, useMemo, useState } from 'react'

export function Waveform({
  active,
}: {
  active: boolean
}) {
  const [heights, setHeights] = useState<number[]>(() => Array.from({ length: 20 }).map(() => 0.25))

  useEffect(() => {
    if (!active) {
      setHeights(Array.from({ length: 20 }).map(() => 0.18))
      return
    }

    const id = window.setInterval(() => {
      setHeights(Array.from({ length: 20 }).map(() => 0.25 + Math.random() * 0.75))
    }, 140)

    return () => window.clearInterval(id)
  }, [active])

  const bars = useMemo(() => heights, [heights])

  return (
    <div className="flex h-[40px] items-end justify-center gap-[6px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[6px] rounded-full bg-[rgba(155,143,176,0.55)] transition-[height] duration-150"
          style={{ height: `${Math.round(h * 40)}px` }}
        />
      ))}
    </div>
  )
}

