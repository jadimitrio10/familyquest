import { useState, useEffect } from 'react'
import { useWeather } from '@/hooks/useWeather'
import { FamilySetup } from '@/components/shared/FamilySetup'
import { useLiveSync } from '@/hooks/useLiveSync'
import { FAMILY_ID_KEY } from '@/lib/sync'
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
import { useCalendarPrefs } from '@/hooks/useCalendarPrefs'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import type { ViewId } from '@/types/app.types'
import { useT } from '@/lib/i18n'

const NAV_IDS: { id: ViewId; icon: React.ElementType }[] = [
  { id:'calendar', icon:Calendar        },
  { id:'tasks',    icon:CheckSquare     },
  { id:'rewards',  icon:Star            },
  { id:'meals',    icon:UtensilsCrossed },
  { id:'photos',   icon:Image           },
  { id:'sleep',    icon:Moon            },
  { id:'settings', icon:Settings        },
]

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('calendar')
  const [hovered, setHovered]       = useState<string | null>(null)
  const [connected, setConnected]   = useState<boolean>(() => !!localStorage.getItem(FAMILY_ID_KEY))
  const { settings, update } = useAppSettings()
  const { members } = useMembersStore()
  const { prefs: calPrefs, update: updateCalPrefs } = useCalendarPrefs()
  const weather = useWeather()
  const [clockTime, setClockTime] = useState('')
  const { t }                    = useT()
  const { syncTick, isConnected: cloudOk } = useLiveSync()

  // ── Apply theme (dark/light/system) to <html> ──────────────────────────
  useEffect(() => {
    const theme = settings.theme || 'light'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [settings.theme])

  // ── Apply accent color as CSS variable ────────────────────────────────
  useEffect(() => {
    const color = (settings as any).accentColor || '#E07B8A'
    document.documentElement.style.setProperty('--accent', color)
    // Derive a soft bg from accent
    document.documentElement.style.setProperty('--accent-bg', color + '20')
  }, [(settings as any).accentColor])

  // ── Apply font size via CSS zoom on #root ────────────────────────────
  // The app uses px-based inline styles, so root font-size does nothing.
  // CSS zoom scales everything uniformly including px values.
  useEffect(() => {
    const map: Record<string, number> = { small: 0.88, normal: 1, large: 1.13, xlarge: 1.27 }
    const zoom = map[(settings as any).fontSize || 'normal'] ?? 1
    const root = document.getElementById('root')
    if (root) (root.style as any).zoom = String(zoom)
  }, [(settings as any).fontSize])

  // syncTick kept only for the cloud sync indicator; NOT used as a view key
  // (using it as key caused full view remount + animation every 8 seconds)
  void syncTick

  const NAV = NAV_IDS.map(n => ({ ...n, label: t(`nav.${n.id}`) }))

  // Show family setup screen if not connected to Supabase
  if (!connected) {
    return (
      <>
        <Toaster />
        <FamilySetup
          existingFamilyName={settings.familyName}
          onConnected={() => setConnected(true)}
        />
      </>
    )
  }

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

      {/* ── SIDEBAR — exactly like Stitch Miller Family ── */}
      <aside style={{
        width: 80,
        background: '#FFFFFF',
        borderRight: '1px solid #EEE8E0',
        height: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 0 16px',
        flexShrink: 0, zIndex: 10,
      }}>
        {/* Serif monogram — like "S" in Stitch HTML */}
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28, fontWeight: 700,
          color: '#B8A89A',
          marginBottom: 20,
          letterSpacing: '-0.02em',
        }}>
          {(settings.familyName || 'F')[0]}
        </div>

        {/* Weather — compact */}
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          marginBottom: 16, paddingBottom: 14,
          borderBottom: '1px solid #EEE8E0', width: '75%',
        }}>
          <span style={{ fontSize:20 }}>{weather?.emoji ?? '☀️'}</span>
          <p style={{ fontWeight:700, fontSize:17, color:'#2D3748', fontFamily:'var(--font-serif)', lineHeight:1, marginTop:2 }}>
            {weather ? (settings.temperatureUnit==='F' ? `${weather.tempF}°` : `${weather.temp}°`) : '—'}
          </p>
          <p style={{ fontSize:7, fontWeight:600, color:'#A0AEC0', letterSpacing:'0.1em', textTransform:'uppercase', textAlign:'center', lineHeight:1.3, marginTop:2 }}>
            {weather?.description?.split(' ').slice(0,2).join('\n') ?? 'PARTLY\nCLOUDY'}
          </p>
        </div>

        {/* Nav — icon + label, exactly like Stitch */}
        <nav style={{ display:'flex', flexDirection:'column', gap:6, width:'100%', padding:'0 10px', flex:1 }}>
          {NAV.map(({ id, icon: Icon, label }) => {
            const active = activeView === id
            return (
              <div key={id} style={{ position:'relative' }}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}>
                <motion.button
                  onClick={() => setActiveView(id)}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    width: '100%', padding: '8px 4px 6px',
                    borderRadius: 10,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 3, border: 'none',
                    background: active ? '#FBE9EC' : hovered === id ? '#F7F4F0' : 'transparent',
                    cursor: 'pointer', transition: 'background 150ms',
                    opacity: active ? 1 : 0.55,
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.0 : 1.5}
                    color={active ? '#C25B6E' : '#4A5568'}
                  />
                  <span style={{
                    fontSize: 9, fontWeight: 600,
                    color: active ? '#C25B6E' : '#718096',
                    fontFamily: 'var(--font-body)',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    lineHeight: 1,
                  }}>
                    {label}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {hovered === id && !active && (
                    <motion.div
                      initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)',
                        background: '#2D3748', color: '#fff',
                        fontSize: 12, fontWeight: 600,
                        padding: '5px 10px', borderRadius: 8,
                        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 99,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >{label}</motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* User avatar at bottom */}
        {members.filter(m => m.role === 'adult').slice(0, 1).map(m => (
          <div key={m.id} style={{ padding: '0 10px', width:'100%', display:'flex', justifyContent:'center' }}>
            <motion.button
              onClick={() => setActiveView('settings')}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              style={{ border:'none', background:'transparent', cursor:'pointer', borderRadius:'50%' }}
            >
              <MemberAvatar member={m} size={40} />
            </motion.button>
          </div>
        ))}
      </aside>

      {/* Main */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Cloud sync indicator */}
        {connected && (
          <div style={{ height:2, background:cloudOk?'transparent':'rgba(0,122,255,0.3)', transition:'background 1s', flexShrink:0 }}>
            {!cloudOk && <div style={{ height:'100%', background:'linear-gradient(90deg,transparent,#007AFF,transparent)', animation:'shimmer-slide 1.5s linear infinite' }} />}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity:0, x:8 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-8 }}
            transition={{ duration:0.16, ease:'easeInOut' }}
            style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}
          >
            {activeView === 'calendar'  && <CalendarView members={members} calPrefs={calPrefs} updateCalPrefs={updateCalPrefs} />}
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
