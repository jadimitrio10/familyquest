import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface PointsBadgeProps {
  points: number
  accentHex: string
  size?: 'sm' | 'md' | 'lg'
}

export function PointsBadge({ points, accentHex, size = 'md' }: PointsBadgeProps) {
  const springValue = useSpring(points, { stiffness: 200, damping: 20 })
  const displayed = useTransform(springValue, (v) => Math.round(v))
  const prevPoints = useRef(points)

  useEffect(() => {
    if (points !== prevPoints.current) {
      springValue.set(points)
      prevPoints.current = points
    }
  }, [points, springValue])

  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-xl px-4 py-2',
  }

  return (
    <motion.div
      className={`rounded-full font-bold flex items-center gap-1 ${sizeClasses[size]}`}
      style={{ background: accentHex + '22', color: accentHex }}
    >
      <span>⭐</span>
      <motion.span>{displayed}</motion.span>
      <span className="opacity-70 font-medium">pts</span>
    </motion.div>
  )
}
