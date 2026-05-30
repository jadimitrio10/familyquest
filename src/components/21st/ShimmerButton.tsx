import type { CSSProperties, ReactNode } from 'react'

interface ShimmerButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  background?: string
  shimmerColor?: string
  className?: string
  style?: CSSProperties
}

// magicui ShimmerButton — button with moving shimmer effect
export function ShimmerButton({
  children,
  onClick,
  disabled,
  background = '#7C3AED',
  shimmerColor = 'rgba(255,255,255,0.4)',
  className = '',
  style,
}: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-2xl font-black text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background,
        minHeight: 60,
        ...style,
      }}
    >
      {/* shimmer overlay */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(110deg, transparent 25%, ${shimmerColor} 50%, transparent 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer-slide 2s linear infinite',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}
