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
        'transition-[transform,box-shadow] duration-200 hover:shadow-[0_20px_44px_rgba(123,91,255,0.18)]',
        'backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

