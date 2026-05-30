import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

interface Sparkle {
  id: string
  x: string
  y: string
  color: string
  delay: number
  scale: number
  size: number
}

interface SparklesTextProps {
  text: string
  className?: string
  colors?: { first: string; second: string }
  sparklesCount?: number
}

const COLORS_DEFAULT = { first: '#9E7AFF', second: '#FE8BBB' }

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function generateSparkle(color: string): Sparkle {
  return {
    id: String(Math.random()),
    x: `${random(10, 90)}%`,
    y: `${random(10, 90)}%`,
    color,
    delay: random(0, 2),
    scale: random(0.4, 1),
    size: Math.floor(random(10, 20)),
  }
}

// magicui SparklesText
export function SparklesText({
  text,
  colors = COLORS_DEFAULT,
  className = '',
  sparklesCount = 8,
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const colorArr = [colors.first, colors.second]
    const generated = Array.from({ length: sparklesCount }, (_, i) =>
      generateSparkle(colorArr[i % 2])
    )
    setSparkles(generated)

    const interval = setInterval(() => {
      setSparkles((prev) =>
        prev.map((s) =>
          Math.random() < 0.3
            ? generateSparkle(colorArr[Math.floor(Math.random() * 2)])
            : s
        )
      )
    }, 1500)
    return () => clearInterval(interval)
  }, [colors.first, colors.second, sparklesCount])

  return (
    <span className={`relative inline-block ${className}`}>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="pointer-events-none absolute"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            zIndex: 20,
            animation: `sparkle-spin ${0.8 + sparkle.delay}s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 21 21"
            fill="none"
          >
            <path
              d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L13.3663 6.98686C13.5944 7.61029 14.1758 8.04028 14.8379 8.01078L21.3172 7.7164C21.9858 7.68695 22.3204 8.49387 21.7801 8.91114L16.7228 12.7573C16.1861 13.1715 15.9613 13.8791 16.1949 14.5167L18.2062 20.6108C18.4258 21.2429 17.7544 21.7531 17.2156 21.3708L11.6475 17.3758C11.2024 17.0613 10.6037 17.0613 10.1586 17.3758L4.59053 21.3708C4.05175 21.7531 3.38033 21.2429 3.59994 20.6108L5.61121 14.5167C5.84484 13.8791 5.62005 13.1715 5.08327 12.7573L0.0259771 8.91114C-0.514312 8.49387 -0.179786 7.68695 0.488795 7.7164L6.96808 8.01078C7.63022 8.04028 8.21163 7.61029 8.43966 6.98686L9.82531 0.843845Z"
              fill={sparkle.color}
            />
          </svg>
        </span>
      ))}
      <span
        className="relative z-10"
        style={{
          backgroundImage: `linear-gradient(90deg, ${colors.first}, ${colors.second})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        } as CSSProperties}
      >
        {text}
      </span>
    </span>
  )
}
