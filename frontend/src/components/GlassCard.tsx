import type { ReactNode } from 'react'

export function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-glass border border-glassBorder bg-glassBg shadow-soft',
        'backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

