import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, CheckSquare, Gift, BarChart2, Settings } from 'lucide-react'

const NAV = [
  { icon: Calendar,    label: 'Hub',      path: '/' },
  { icon: CheckSquare, label: 'Tareas',   path: '/tasks' },
  { icon: Gift,        label: 'Premios',  path: '/rewards' },
  { icon: BarChart2,   label: 'Historia', path: '/history' },
  { icon: Settings,    label: 'Ajustes',  path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <nav
      className="relative flex flex-col items-center py-3 gap-1 flex-shrink-0"
      style={{ width: 68, background: '#1E1B4B', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo FQ */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="flex items-center justify-center rounded-xl font-black text-white mb-4"
        style={{
          width: 42, height: 42,
          background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
          fontSize: 15,
          fontFamily: 'Nunito, sans-serif',
          boxShadow: '0 4px 12px rgba(124,58,237,0.45)',
          flexShrink: 0,
        }}
      >
        FQ
      </motion.button>

      {/* Nav icons */}
      {NAV.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path
        return (
          <div
            key={path}
            className="relative"
            onMouseEnter={() => setHovered(path)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.button
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.92 }}
              className="flex items-center justify-center rounded-xl transition-colors"
              style={{
                width: 46, height: 46,
                color: active ? '#fff' : 'rgba(199,210,254,0.65)',
                background: active
                  ? 'rgba(124,58,237,0.85)'
                  : hovered === path
                    ? 'rgba(255,255,255,0.07)'
                    : 'transparent',
                position: 'relative',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {active && (
                <motion.div
                  layoutId="active-pip"
                  className="absolute right-0 rounded-l-full"
                  style={{ width: 3, height: 24, background: '#A78BFA' }}
                />
              )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {hovered === path && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-full ml-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-bold text-white pointer-events-none z-50"
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#2D2A5E',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    fontFamily: 'Nunito, sans-serif',
                  }}
                >
                  {label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}
