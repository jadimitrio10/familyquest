import { motion } from 'framer-motion'

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Toggle({ value, onChange, disabled, size = 'md' }: ToggleProps) {
  const w = size === 'sm' ? 40 : 51
  const h = size === 'sm' ? 24 : 31
  const d = size === 'sm' ? 20 : 27
  const travel = w - d - 4

  return (
    <motion.button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className="flex-shrink-0 relative border-0 p-0"
      style={{
        width: w, height: h,
        borderRadius: h / 2,
        background: value ? 'var(--green)' : '#E5E5EA',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.25s ease',
      }}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.div
        animate={{ x: value ? travel : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2,
          width: d, height: d,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
        }}
      />
    </motion.button>
  )
}
