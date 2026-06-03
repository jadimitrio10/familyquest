'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface CelebrationOverlayProps {
  show: boolean
  memberName: string
  memberEmoji: string
  memberColor: string    // bg color
  memberAccent: string   // bar/accent color
  memberPhoto?: string
  points: number
  taskTitle: string
  taskEmoji: string
  onDone: () => void
}

export function CelebrationOverlay({
  show, memberName, memberEmoji, memberColor, memberAccent,
  memberPhoto, points, taskTitle, taskEmoji, onDone,
}: CelebrationOverlayProps) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!show) { firedRef.current = false; return }
    if (firedRef.current) return
    firedRef.current = true

    // Multi-burst confetti
    const burst = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        colors: [memberAccent, memberColor, '#FFD700', '#fff', '#FFC0CB'],
        scalar: 1.2,
      })

    burst({ x: 0.3, y: 0.5 })
    setTimeout(() => burst({ x: 0.7, y: 0.5 }), 200)
    setTimeout(() => burst({ x: 0.5, y: 0.4 }), 400)
    setTimeout(() => confetti({
      particleCount: 50,
      spread: 120,
      origin: { x: 0.5, y: 0.6 },
      colors: [memberAccent, '#FFD700', '#fff'],
      startVelocity: 45,
    }), 600)

    // Auto-dismiss after 3s
    const timer = setTimeout(onDone, 3200)
    return () => clearTimeout(timer)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onDone}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.50)',
            backdropFilter: 'blur(6px)',
            cursor: 'pointer',
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '40px 48px 36px',
              borderRadius: 32,
              background: `linear-gradient(160deg, ${memberColor}f5 0%, #fff 100%)`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.20), 0 0 0 2px ${memberAccent}40`,
              maxWidth: 380, width: '90%',
              textAlign: 'center',
            }}
          >
            {/* Big emoji + avatar */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -8, 8, -4, 4, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}
            >
              {taskEmoji}
            </motion.div>

            {/* Task title */}
            <p style={{
              fontSize: 20, fontWeight: 900,
              color: '#2D3748', fontFamily: 'var(--font-heading)',
              marginBottom: 6, lineHeight: 1.2,
            }}>
              {taskTitle}
            </p>
            <p style={{ fontSize: 14, color: '#718096', marginBottom: 24 }}>
              ¡completado! 🎉
            </p>

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              {memberPhoto ? (
                <img src={memberPhoto} alt={memberName}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${memberAccent}` }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: memberAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `3px solid rgba(255,255,255,0.6)` }}>
                  {memberEmoji}
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#2D3748', fontFamily: 'var(--font-heading)' }}>
                  {memberName}
                </p>
                <p style={{ fontSize: 12, color: '#718096' }}>¡excelente trabajo!</p>
              </div>
            </div>

            {/* Points badge — the star of the show */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '18px 32px',
                borderRadius: 99,
                background: `linear-gradient(135deg, #F59E0B, #D97706)`,
                boxShadow: '0 8px 24px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
                marginBottom: 24,
              }}
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 15, -15, 0] }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ fontSize: 36 }}
              >
                ⭐
              </motion.span>
              <div style={{ textAlign: 'left' }}>
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1 }}
                >
                  +{points}
                </motion.p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                  puntos ganados
                </p>
              </div>
            </motion.div>

            {/* Tap to close hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              style={{ fontSize: 12, color: '#A0AEC0' }}
            >
              Toca para cerrar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
