import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, CheckSquare, Gift, BarChart2, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Calendar, label: 'Hub', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Gift, label: 'Rewards', path: '/rewards' },
  { icon: BarChart2, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="w-16 h-full bg-white/80 backdrop-blur flex flex-col items-center py-4 gap-2 border-r border-white/50 shadow-lg shrink-0">
      <div className="mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-lg">
          F
        </div>
      </div>
      {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path
        return (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative group ${
              active ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={label}
          >
            <Icon size={22} />
            {active && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute right-0 w-1 h-8 bg-purple-500 rounded-l-full"
              />
            )}
            <span className="sr-only">{label}</span>
          </motion.button>
        )
      })}
    </nav>
  )
}
