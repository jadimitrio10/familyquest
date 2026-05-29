interface AvatarCircleProps {
  emoji: string
  colorHex: string
  accentHex: string
  size?: number
  className?: string
}

export function AvatarCircle({ emoji, colorHex, accentHex, size = 52, className = '' }: AvatarCircleProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: colorHex,
        border: `3px solid ${accentHex}`,
        fontSize: size * 0.45,
      }}
    >
      {emoji}
    </div>
  )
}
