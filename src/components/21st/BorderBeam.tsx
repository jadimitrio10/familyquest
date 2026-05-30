import type { CSSProperties } from 'react'

interface BorderBeamProps {
  size?: number
  duration?: number
  anchor?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
  className?: string
}

// magicui BorderBeam — animated gradient that travels around the border
export function BorderBeam({
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  delay = 0,
  className = '',
}: BorderBeamProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
      style={
        {
          '--size': size,
          '--duration': duration,
          '--anchor': anchor,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-[0] rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${colorFrom}, ${colorTo}, transparent 70%)`,
          padding: borderWidth,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: `border-beam ${duration}s infinite linear`,
          animationDelay: `var(--delay)`,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
        }}
      />
    </div>
  )
}
