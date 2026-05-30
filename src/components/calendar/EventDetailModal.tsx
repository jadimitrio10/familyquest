import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Edit2, Check, Clock, Calendar } from 'lucide-react'
import type { CalendarEvent, CalendarMember } from '@/types/calendar.types'
import { MEMBERS } from '@/types/calendar.types'

interface EventDetailModalProps {
  event: CalendarEvent | null
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<CalendarEvent>) => void
  onToggle: (id: string) => void
}

export function EventDetailModal({ event, onClose, onDelete, onUpdate, onToggle }: EventDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')

  if (!event) return null
  const member = MEMBERS.find(m => m.id === event.memberId)!

  function startEdit() {
    setTitle(event!.title)
    setEmoji(event!.emoji)
    setEditing(true)
  }

  function saveEdit() {
    onUpdate(event!.id, { title, emoji })
    setEditing(false)
  }

  const timeStr = event.allDay ? 'All day'
    : event.startTime && event.endTime ? `${event.startTime} – ${event.endTime}`
    : event.startTime ?? ''

  return (
    <AnimatePresence>
      {event && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}
          onClick={e=>e.target===e.currentTarget&&onClose()}>
          <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.92,opacity:0}}
            transition={{type:'spring',stiffness:320,damping:28}}
            style={{ background:'var(--surface)',borderRadius:20,width:'100%',maxWidth:400,overflow:'hidden',boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>
            {/* Color header */}
            <div style={{ background:member.bgColor,padding:'20px 20px 16px',position:'relative' }}>
              <div style={{ display:'flex',alignItems:'flex-start',gap:12 }}>
                <div style={{ fontSize:40 }}>{editing?emoji:event.emoji}</div>
                <div style={{ flex:1 }}>
                  {editing ? (
                    <input value={title} onChange={e=>setTitle(e.target.value)} autoFocus onKeyDown={e=>e.key==='Enter'&&saveEdit()}
                      style={{ fontSize:18,fontWeight:700,fontFamily:'Inter',color:member.textColor,background:'transparent',border:'none',borderBottom:`2px solid ${member.barColor}`,outline:'none',width:'100%',paddingBottom:4 }}/>
                  ) : (
                    <h2 style={{ fontSize:18,fontWeight:700,fontFamily:'Inter',color:member.textColor,lineHeight:1.2 }}>{event.title}</h2>
                  )}
                  <span style={{ fontSize:12,fontWeight:600,color:member.textColor,background:`${member.barColor}30`,padding:'3px 10px',borderRadius:20,marginTop:6,display:'inline-block' }}>
                    {member.avatar} {member.name}
                  </span>
                </div>
              </div>
              {/* Action buttons */}
              <div style={{ position:'absolute',top:12,right:12,display:'flex',gap:6 }}>
                {editing ? (
                  <>
                    <button onClick={saveEdit} style={{ width:30,height:30,borderRadius:8,background:member.barColor,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff' }}><Check size={14}/></button>
                    <button onClick={()=>setEditing(false)} style={{ width:30,height:30,borderRadius:8,background:'rgba(0,0,0,0.1)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:member.textColor }}><X size={14}/></button>
                  </>
                ) : (
                  <>
                    <button onClick={startEdit} style={{ width:30,height:30,borderRadius:8,background:'rgba(0,0,0,0.08)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:member.textColor }}><Edit2 size={13}/></button>
                    <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:'rgba(0,0,0,0.08)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:member.textColor }}><X size={14}/></button>
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <Clock size={16} color="var(--text-3)"/>
                  <span style={{ fontSize:14,fontFamily:'Inter',color:'var(--text-1)' }}>{timeStr}</span>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <Calendar size={16} color="var(--text-3)"/>
                  <span style={{ fontSize:14,fontFamily:'Inter',color:'var(--text-1)' }}>{event.date}</span>
                </div>
                {event.recurrence && (
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <span style={{ fontSize:14 }}>🔄</span>
                    <span style={{ fontSize:14,fontFamily:'Inter',color:'var(--text-1)',textTransform:'capitalize' }}>{event.recurrence}</span>
                  </div>
                )}
              </div>

              {/* Emoji picker when editing */}
              {editing && (
                <div style={{ marginTop:14,padding:12,borderRadius:10,background:'var(--bg)',border:'1px solid var(--border)' }}>
                  <p style={{ fontSize:11,fontWeight:600,color:'var(--text-3)',fontFamily:'Inter',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Emoji</p>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                    {['🏃','📖','🥗','🎾','🎂','✈️','💃','🎸','🐶','🩺','🛏️','✏️','🧹','🎨','🏊','⚽','🎮','🍕','🎬','🎉'].map(e=>(
                      <button key={e} onClick={()=>setEmoji(e)} style={{ width:32,height:32,borderRadius:6,border:`2px solid ${emoji===e?member.barColor:'transparent'}`,background:emoji===e?member.bgColor:'transparent',fontSize:18,cursor:'pointer' }}>{e}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:'flex',gap:10,marginTop:20 }}>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{onToggle(event.id);onClose()}}
                  style={{ flex:1,padding:'11px',borderRadius:12,border:event.completed?'1px solid var(--border)':'none',background:event.completed?'var(--bg)':member.barColor,color:event.completed?'var(--text-2)':'#fff',fontSize:14,fontWeight:700,fontFamily:'Inter',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                  {event.completed ? '↩ Mark Incomplete' : <><Check size={15}/>Mark Done</>}
                </motion.button>
                <button onClick={()=>{onDelete(event.id);onClose()}}
                  style={{ width:44,height:44,borderRadius:12,border:'1px solid #EF444440',background:'#FEF2F2',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#EF4444' }}>
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
