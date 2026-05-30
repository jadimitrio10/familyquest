import { motion } from 'framer-motion'

interface AnimatedCircularProgressProps {
  value: number        // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  children?: React.ReactNode
}

// magicui AnimatedCircularProgressBar
export function AnimatedCircularProgress({
  value,
  size = 36,
  strokeWidth = 3.5,
  color = '#7C3AED',
  trackColor = '#e5e7eb',
  label,
  children,
}: AnimatedCircularProgressProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
      {label && !children && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: size * 0.22, fontWeight: 700, color, fontFamily: 'Nunito, sans-serif' }}>
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
