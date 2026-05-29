import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface PointsOrbProps {
  points: number
  accentHex: string
  colorHex: string
}

export function PointsOrb({ points, accentHex, colorHex }: PointsOrbProps) {
  const spring = useSpring(points, { stiffness: 150, damping: 18 })
  const display = useTransform(spring, (v) => Math.round(v))
  const prev = useRef(points)

  useEffect(() => {
    if (points !== prev.current) {
      spring.set(points)
      prev.current = points
    }
  }, [points, spring])

  return (
    <motion.div
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-3xl px-8 py-4 flex flex-col items-center"
      style={{ background: `${accentHex}22`, border: `3px solid ${accentHex}` }}
    >
      <span className="text-4xl mb-1">⭐</span>
      <motion.span
        className="font-black text-5xl"
        style={{ color: accentHex, fontFamily: 'Nunito, sans-serif' }}
      >
        {display}
      </motion.span>
      <span className="text-sm font-bold opacity-70" style={{ color: accentHex }}>
        My Stars
      </span>
    </motion.div>
  )
}
