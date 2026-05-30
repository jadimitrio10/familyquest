import { AnimatedCircularProgressBar } from '@/components/magicui/animated-circular-progress-bar'

interface TimeOfDayRingProps {
  label: string
  completed: number
  total: number
  ringColor: string
  ringBg: string
}

export function TimeOfDayRing({ label, completed, total, ringColor, ringBg }: TimeOfDayRingProps) {
  if (total === 0) return null
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="flex flex-col items-center gap-0.5" title={`${label}: ${completed}/${total}`}>
      {/* magicui AnimatedCircularProgressBar */}
      <div style={{ width: 32, height: 32 }}>
        <AnimatedCircularProgressBar
          value={completed}
          min={0}
          max={total}
          gaugePrimaryColor={ringColor}
          gaugeSecondaryColor={ringBg}
          className="!size-8 !text-[8px]"
        />
      </div>
      <span
        className="ring-label"
        style={{ color: ringColor, opacity: 0.8 }}
      >
        {label.slice(0, 3).toUpperCase()}
      </span>
    </div>
  )
}
