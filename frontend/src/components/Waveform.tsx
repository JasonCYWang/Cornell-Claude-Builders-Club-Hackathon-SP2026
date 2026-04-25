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
          className="w-[6px] rounded-full transition-[height] duration-150"
          style={{
            height: `${Math.round(h * 40)}px`,
            background:
              i % 3 === 0
                ? 'linear-gradient(180deg, #7B5BFF, #B15BFF)'
                : i % 3 === 1
                  ? 'linear-gradient(180deg, #56BAFF, #7FE6FF)'
                  : 'linear-gradient(180deg, #FF7ED9, #FFB166)',
          }}
        />
      ))}
    </div>
  )
}

