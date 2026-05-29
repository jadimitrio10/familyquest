import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiExplosionProps {
  trigger: boolean
  colors?: string[]
}

export function ConfettiExplosion({ trigger, colors = ['#FFB5B5', '#FDE68A', '#BAE6FD', '#DDD6FE', '#99F6E4'] }: ConfettiExplosionProps) {
  useEffect(() => {
    if (!trigger) return
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    })
  }, [trigger, colors])

  return null
}

export function fireConfetti(colors?: string[]) {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: colors ?? ['#FFB5B5', '#FDE68A', '#BAE6FD', '#DDD6FE', '#99F6E4'],
  })
}
