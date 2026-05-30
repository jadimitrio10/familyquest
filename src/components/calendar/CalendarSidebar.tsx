import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, CheckSquare, Star, UtensilsCrossed, Image, Moon, Settings, CloudSun } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Calendar,         label: 'Calendar',  id: 'calendar' },
  { icon: CheckSquare,      label: 'Tasks',     id: 'tasks' },
  { icon: Star,             label: 'Rewards',   id: 'rewards' },
  { icon: UtensilsCrossed,  label: 'Meals',     id: 'meals' },
  { icon: Image,            label: 'Photos',    id: 'photos' },
  { icon: Moon,             label: 'Sleep',     id: 'sleep' },
  { icon: Settings,         label: 'Settings',  id: 'settings' },
]

export function CalendarSidebar() {
  const [active, setActive] = useState('calendar')
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <aside
      className="flex flex-col items-center py-4 flex-shrink-0 relative"
      style={{
        width: 64,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
      }}
    >
      {/* Weather widget */}
      <div className="flex flex-col items-center mb-2 px-2">
        <CloudSun size={22} color="#94A3B8" strokeWidth={1.8} />
        <p style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-1)', lineHeight: 1.1, marginTop: 4 }}>
          68°F
        </p>
        <p style={{
          fontWeight: 600,
          fontSize: 8,
          color: 'var(--text-3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: 2,
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          PARTLY<br/>CLOUDY
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '80%', height: 1, background: 'var(--border)', margin: '10px 0' }} />

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
          const isActive = active === id
          return (
            <div key={id} className="relative w-full">
              <motion.button
                onClick={() => setActive(id)}
                onHoverStart={() => setHovered(id)}
                onHoverEnd={() => setHovered(null)}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center justify-center w-full gap-0.5"
                style={{
                  height: 44,
                  borderRadius: 10,
                  background: isActive ? 'var(--blue-bg)' : hovered === id ? '#F9FAFB' : 'transparent',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background 150ms ease',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? 'var(--blue)' : 'var(--text-3)'}
                />
                <span style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: isActive ? 'var(--blue)' : 'var(--text-3)',
                  lineHeight: 1,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {label}
                </span>
              </motion.button>

              {/* Tooltip */}
              <AnimatePresence>
                {hovered === id && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute pointer-events-none z-50 whitespace-nowrap"
                    style={{
                      left: '110%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--text-1)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '5px 10px',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                    }}
                  >
                    {label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
