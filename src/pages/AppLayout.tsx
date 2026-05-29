import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/shared/Sidebar'
import { TopBar } from '@/components/hub/TopBar'
import { useFamilyStore } from '@/stores/familyStore'
import { motion } from 'framer-motion'

export function AppLayout() {
  const { isDemo } = useFamilyStore()

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-amber-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {isDemo && (
          <div className="bg-amber-400 text-amber-900 text-sm font-semibold text-center py-1.5">
            🎭 Demo Mode — changes won't be saved
          </div>
        )}
        <TopBar />
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
