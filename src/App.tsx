import { useState } from 'react'
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

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius:'12px', fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:14 },
          success: { iconTheme: { primary:'#4F46E5', secondary:'#fff' } },
        }}
      />

      {/* Sidebar */}
      <aside style={{ width:64, background:'var(--surface)', borderRight:'1px solid var(--border)', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', flexShrink:0, zIndex:10 }}>
        {/* Weather widget */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:6, paddingBottom:10, borderBottom:'1px solid var(--border)', width:'80%' }}>
          <CloudSun size={20} color="#94A3B8" strokeWidth={1.8}/>
          <p style={{ fontWeight:700, fontSize:19, color:'var(--text-1)', fontFamily:'Inter', lineHeight:1.1, marginTop:3 }}>
            68°{settings.temperatureUnit}
          </p>
          <p style={{ fontWeight:600, fontSize:7, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', textAlign:'center', lineHeight:1.3, marginTop:2 }}>
            PARTLY<br/>CLOUDY
          </p>
        </div>

        {/* Nav items */}
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
                  whileTap={{ scale:0.92 }}
                  style={{ width:'100%', height:46, borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, border:'none', background:active?'var(--blue-bg)':hovered===id?'#F4F4F8':'transparent', cursor:'pointer', transition:'background 150ms' }}
                >
                  <Icon size={19} strokeWidth={active?2.2:1.8} color={active?'var(--blue)':'var(--text-3)'}/>
                  <span style={{ fontSize:9, fontWeight:active?700:500, color:active?'var(--blue)':'var(--text-3)', fontFamily:'Inter', lineHeight:1 }}>{label}</span>
                </motion.button>

                {/* Tooltip */}
                <AnimatePresence>
                  {hovered===id && !active && (
                    <motion.div initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }} transition={{ duration:0.1 }}
                      style={{ position:'absolute', left:'110%', top:'50%', transform:'translateY(-50%)', background:'var(--text-1)', color:'#fff', fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, whiteSpace:'nowrap', pointerEvents:'none', zIndex:99, boxShadow:'0 4px 12px rgba(0,0,0,0.18)', fontFamily:'Inter' }}>
                      {label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Bottom: first adult avatar */}
        {members.filter(m=>m.role==='adult').slice(0,1).map(m=>(
          <div key={m.id} style={{ marginTop:'auto', marginBottom:8, padding:'0 8px', width:'100%', display:'flex', justifyContent:'center' }}>
            <button onClick={()=>setActiveView('settings')} title="Settings" style={{ border:'none', background:'transparent', cursor:'pointer', borderRadius:'50%' }}>
              <MemberAvatar member={m} size={36}/>
            </button>
          </div>
        ))}
      </aside>

      {/* Main content */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity:0, x:10 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-10 }}
            transition={{ duration:0.16, ease:'easeInOut' }}
            style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}
          >
            {activeView==='calendar' && <CalendarView members={members}/>}
            {activeView==='tasks'    && <TasksView/>}
            {activeView==='rewards'  && <RewardsView/>}
            {activeView==='meals'    && <MealsView/>}
            {activeView==='photos'   && <PhotosView/>}
            {activeView==='sleep'    && <SleepView/>}
            {activeView==='settings' && <SettingsView settings={settings} onUpdate={update}/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
