import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar.types'
import { useMembersStore } from '@/hooks/useMembersStore'

interface AddEventModalProps {
  open: boolean
  onClose: () => void
  onAdd: (event: Omit<CalendarEvent, 'id'>) => void
  defaultDate?: string
}

const EMOJI_OPTIONS = ['🏃','📖','🥗','🎾','🎂','✈️','💃','🎸','🐶','🩺','🛏️','✏️','🧹','🎨','🏊','⚽','🎮','🍕','🎬','🎉','🌱','🧴']

export function AddEventModal({ open, onClose, onAdd, defaultDate }: AddEventModalProps) {
  const { members } = useMembersStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📅')
  const [memberId, setMemberId] = useState('')
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)

  const effectiveMemberId = memberId || members[0]?.id || ''
  const member = members.find(m => m.id === effectiveMemberId) ?? members[0]

  function handleSubmit() {
    if (!title.trim() || !member) return
    onAdd({ title: title.trim(), emoji, memberId: effectiveMemberId, date, startTime: allDay ? undefined : startTime, endTime: allDay ? undefined : endTime, allDay, completed: false })
    setTitle(''); setEmoji('📅'); setAllDay(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background:'rgba(0,0,0,0.35)', backdropFilter:'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}
            transition={{ type:'spring', stiffness:320, damping:28 }}
            style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:24, boxShadow:'0 -8px 40px rgba(0,0,0,0.12)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontWeight:700, fontSize:18, fontFamily:'Inter', color:'var(--text-1)' }}>New Event</h2>
              <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16} color="var(--text-2)"/>
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>Title</label>
                <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                  placeholder="Event name..."
                  style={{ width:'100%', marginTop:6, padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:15, fontWeight:500, fontFamily:'Inter', color:'var(--text-1)', outline:'none', background:'var(--bg)' }}/>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>Emoji</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={()=>setEmoji(e)}
                      style={{ width:36, height:36, borderRadius:8, border:emoji===e?'2px solid var(--blue)':'1.5px solid var(--border)', background:emoji===e?'var(--blue-bg)':'var(--bg)', fontSize:18, cursor:'pointer' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>For</label>
                <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                  {members.map(m => (
                    <button key={m.id} onClick={()=>setMemberId(m.id)}
                      style={{ flex:1, minWidth:80, padding:'8px 10px', borderRadius:10, border:effectiveMemberId===m.id?`2px solid ${m.barColor}`:'1.5px solid var(--border)', background:effectiveMemberId===m.id?m.bgColor:'var(--bg)', fontSize:13, fontWeight:600, color:effectiveMemberId===m.id?m.textColor:'var(--text-2)', fontFamily:'Inter', cursor:'pointer' }}>
                      {m.emoji} {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                  style={{ width:'100%', marginTop:6, padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--bg)', outline:'none', color:'var(--text-1)' }}/>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={()=>setAllDay(v=>!v)}
                  style={{ width:40, height:22, borderRadius:11, background:allDay?'var(--blue)':'var(--border)', border:'none', cursor:'pointer', position:'relative', transition:'background 200ms' }}>
                  <motion.div animate={{ x:allDay?18:2 }} transition={{ type:'spring', stiffness:500, damping:30 }}
                    style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:2 }}/>
                </button>
                <span style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', fontFamily:'Inter' }}>All day</span>
              </div>

              {!allDay && (
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>Start</label>
                    <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}
                      style={{ width:'100%', marginTop:6, padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--bg)', outline:'none', color:'var(--text-1)' }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Inter' }}>End</label>
                    <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                      style={{ width:'100%', marginTop:6, padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--bg)', outline:'none', color:'var(--text-1)' }}/>
                  </div>
                </div>
              )}

              <motion.button whileTap={{ scale:0.97 }} onClick={handleSubmit} disabled={!title.trim()}
                style={{ width:'100%', height:48, borderRadius:12, border:'none', background:title.trim()?(member?.barColor??'var(--blue)'):'var(--border)', color:'#fff', fontSize:15, fontWeight:700, fontFamily:'Inter', cursor:title.trim()?'pointer':'not-allowed', marginTop:4, transition:'background 200ms' }}>
                Add Event
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
