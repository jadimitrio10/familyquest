import { motion } from 'framer-motion'

interface TimeOfDayRingProps {
  label: string
  completed: number
  total: number
  accentHex: string
}

const SIZE = 32
const STROKE = 3
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export function TimeOfDayRing({ label, completed, total, accentHex }: TimeOfDayRingProps) {
  const pct = total === 0 ? 0 : completed / total
  const dash = pct * CIRC

  return (
    <div className="flex flex-col items-center gap-0.5" title={`${label}: ${completed}/${total}`}>
      <svg width={SIZE} height={SIZE}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#e5e7eb" strokeWidth={STROKE} />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={accentHex}
          strokeWidth={STROKE}
          strokeDasharray={`${CIRC}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC - dash }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {pct >= 1 && (
          <text x={SIZE / 2} y={SIZE / 2 + 4} textAnchor="middle" fontSize="11" fill={accentHex}>✓</text>
        )}
      </svg>
      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{label[0]}</span>
    </div>
  )
}
