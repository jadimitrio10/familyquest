import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/shared/Sidebar'
import { TopBar } from '@/components/hub/TopBar'
import { useFamilyStore } from '@/stores/familyStore'

export function AppLayout() {
  const { isDemo } = useFamilyStore()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {isDemo && (
          <div
            className="shrink-0 text-center py-1.5 text-sm font-bold"
            style={{ background: '#FDE68A', color: '#92400e', fontFamily: 'Nunito, sans-serif' }}
          >
            🎭 Modo Demo — los cambios no se guardan en base de datos
          </div>
        )}
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
