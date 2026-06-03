import { useState, useEffect } from 'react'
import { useWeather } from '@/hooks/useWeather'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, CheckSquare, Star, UtensilsCrossed, Image, Moon, Settings, CloudSun } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { CalendarView } from '@/components/calendar/CalendarView'
import { TasksView } from '@/views/TasksView'
import { RewardsView } from '@/views/RewardsView'
import { MealsView } from '@/views/MealsView'
import { PhotosView } from '@/views/PhotosView'
import { SleepView } from '@/views/SleepView'
import { SettingsView } from '@/views/SettingsView'
import { useAppSettings } from '@/hooks/useAppStore'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import type { ViewId } from '@/types/app.types'

const NAV: { id: ViewId; icon: React.ElementType; label: string }[] = [
  { id:'calendar', icon:Calendar,        label:'Calendar'  },
  { id:'tasks',    icon:CheckSquare,     label:'Tasks'     },
  { id:'rewards',  icon:Star,            label:'Rewards'   },
  { id:'meals',    icon:UtensilsCrossed, label:'Meals'     },
  { id:'photos',   icon:Image,           label:'Photos'    },
  { id:'sleep',    icon:Moon,            label:'Sleep'     },
  { id:'settings', icon:Settings,        label:'Settings'  },
]

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('calendar')
  const [hovered, setHovered] = useState<string | null>(null)
  const { settings, update } = useAppSettings()
  const { members } = useMembersStore()
  const weather = useWeather()
  const [clockTime, setClockTime] = useState('')

  // Live clock
  useEffect(() => {
    function tick() {
      const now = new Date()
      setClockTime(now.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true }))
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 14,
            background: 'var(--surface)',
            color: 'var(--text-1)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: '#fff' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: '#fff' } },
        }}
      />

      {/* Sidebar — Miller Family style: white, clean, icon + label */}
      <aside style={{
        width: 72,
        background: '#FFFFFF',
        borderRight: '1px solid var(--border-soft)',
        height: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0',
        flexShrink: 0, zIndex: 10,
        boxShadow: '1px 0 0 var(--border-soft)',
      }}>
        {/* Weather widget — compact */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:8, paddingBottom:10, borderBottom:'1px solid var(--border-soft)', width:'85%' }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{weather?.emoji ?? '🌤️'}</span>
          <p style={{ fontWeight:700, fontSize:18, color:'var(--text-1)', fontFamily:'var(--font-serif)', lineHeight:1.1, marginTop:3 }}>
            {weather
              ? (settings.temperatureUnit === 'F' ? `${weather.tempF}°` : `${weather.temp}°`)
              : '—'
            }
          </p>
          <p style={{ fontWeight:600, fontSize:7, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', textAlign:'center', lineHeight:1.4, marginTop:2 }}>
            {weather?.description ?? 'WEATHER'}
          </p>
        </div>

        {/* Nav */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, flex:1, width:'100%', padding:'0 8px' }}>
          {NAV.map(({ id, icon: Icon, label }) => {
            const active = activeView === id
            return (
              <div key={id} style={{ position:'relative', width:'100%' }}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
              >
                <motion.button
                  onClick={() => setActiveView(id)}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    width: '100%', height: 52,
                    borderRadius: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 3, border: 'none',
                    background: active ? 'var(--pink)' : hovered === id ? 'rgba(0,0,0,0.04)' : 'transparent',
                    cursor: 'pointer', transition: 'background 150ms ease',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.6}
                    color={active ? 'var(--pink-text)' : 'var(--text-3)'}
                  />
                  <span style={{
                    fontSize: 9, fontWeight: active ? 700 : 500,
                    color: active ? 'var(--pink-text)' : 'var(--text-3)',
                    fontFamily: 'var(--font-body)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    lineHeight: 1,
                  }}>
                    {label}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {hovered === id && !active && (
                    <motion.div
                      initial={{ opacity:0, x:-6 }}
                      animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:-6 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)',
                        background: 'var(--text-1)', color: '#fff',
                        fontSize: 12, fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 99,
                        boxShadow: 'var(--shadow-md)',
                        fontFamily: 'var(--font-body)',
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

        {/* User avatar at bottom */}
        {members.filter(m => m.role === 'adult').slice(0, 1).map(m => (
          <div key={m.id} style={{ marginTop:'auto', marginBottom:8, padding:'0 8px', width:'100%', display:'flex', justifyContent:'center' }}>
            <motion.button
              onClick={() => setActiveView('settings')}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              style={{ border:'none', background:'transparent', cursor:'pointer', borderRadius:'50%' }}
            >
              <MemberAvatar member={m} size={38} />
            </motion.button>
          </div>
        ))}
      </aside>

      {/* Main */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity:0, x:8 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-8 }}
            transition={{ duration:0.16, ease:'easeInOut' }}
            style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}
          >
            {activeView === 'calendar'  && <CalendarView members={members} />}
            {activeView === 'tasks'     && <TasksView />}
            {activeView === 'rewards'   && <RewardsView />}
            {activeView === 'meals'     && <MealsView />}
            {activeView === 'photos'    && <PhotosView />}
            {activeView === 'sleep'     && <SleepView />}
            {activeView === 'settings'  && <SettingsView settings={settings} onUpdate={update} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
