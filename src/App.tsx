import { Toaster } from 'react-hot-toast'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { CalendarView } from '@/components/calendar/CalendarView'

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 14,
          },
        }}
      />
      <CalendarSidebar />
      <CalendarView />
    </>
  )
}
