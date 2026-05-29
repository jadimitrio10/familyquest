import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useFamilyStore } from '@/stores/familyStore'
import { Login } from '@/pages/Login'
import { AppLayout } from '@/pages/AppLayout'
import { FamilyHub } from '@/components/hub/FamilyHub'
import { KidFocusMode } from '@/components/kid/KidFocusMode'
import { TaskManager } from '@/components/tasks/TaskManager'
import { RewardsStore } from '@/components/rewards/RewardsStore'
import { HistoryDashboard } from '@/components/history/HistoryDashboard'
import { SettingsPage } from '@/components/settings/SettingsPage'

function RequireFamily({ children }: { children: React.ReactNode }) {
  const { family } = useFamilyStore()
  if (!family) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '16px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 16,
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireFamily>
                <AppLayout />
              </RequireFamily>
            }
          >
            <Route index element={<FamilyHub />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="rewards" element={<RewardsStore />} />
            <Route path="history" element={<HistoryDashboard />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="/kid/:memberId"
            element={
              <RequireFamily>
                <KidFocusMode />
              </RequireFamily>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
