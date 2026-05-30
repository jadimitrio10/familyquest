import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, TrendingUp } from 'lucide-react'
import { MEMBERS } from '@/types/calendar.types'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

interface SleepEntry { memberId:string; day:string; bedtime:string; wakeup:string }

const INIT: SleepEntry[] = [
  { memberId:'emma',  day:'Mon', bedtime:'23:00', wakeup:'07:00' },
  { memberId:'emma',  day:'Tue', bedtime:'22:30', wakeup:'06:45' },
  { memberId:'emma',  day:'Wed', bedtime:'23:30', wakeup:'07:15' },
  { memberId:'emma',  day:'Thu', bedtime:'22:00', wakeup:'06:30' },
  { memberId:'emma',  day:'Fri', bedtime:'00:00', wakeup:'08:30' },
  { memberId:'emma',  day:'Sat', bedtime:'01:00', wakeup:'09:00' },
  { memberId:'emma',  day:'Sun', bedtime:'23:00', wakeup:'07:30' },
  { memberId:'wei',   day:'Mon', bedtime:'22:00', wakeup:'06:00' },
  { memberId:'wei',   day:'Tue', bedtime:'22:30', wakeup:'06:00' },
  { memberId:'wei',   day:'Wed', bedtime:'23:00', wakeup:'06:30' },
  { memberId:'wei',   day:'Thu', bedtime:'22:00', wakeup:'05:45' },
  { memberId:'wei',   day:'Fri', bedtime:'23:30', wakeup:'07:00' },
  { memberId:'wei',   day:'Sat', bedtime:'00:30', wakeup:'08:00' },
  { memberId:'wei',   day:'Sun', bedtime:'22:30', wakeup:'06:00' },
  { memberId:'julie', day:'Mon', bedtime:'21:00', wakeup:'07:00' },
  { memberId:'julie', day:'Tue', bedtime:'20:30', wakeup:'06:45' },
  { memberId:'julie', day:'Wed', bedtime:'21:00', wakeup:'07:00' },
  { memberId:'julie', day:'Thu', bedtime:'21:30', wakeup:'07:15' },
  { memberId:'julie', day:'Fri', bedtime:'22:00', wakeup:'08:00' },
  { memberId:'julie', day:'Sat', bedtime:'22:30', wakeup:'09:00' },
  { memberId:'julie', day:'Sun', bedtime:'21:00', wakeup:'07:00' },
]

function calcHours(bed:string, wake:string) {
  const [bh,bm]=bed.split(':').map(Number)
  const [wh,wm]=wake.split(':').map(Number)
  let mins = (wh*60+wm) - (bh*60+bm)
  if (mins<0) mins+=1440
  return Math.round(mins/60*10)/10
}

function qualityColor(h:number) {
  if (h>=8) return '#10B981'
  if (h>=7) return '#6EE7B7'
  if (h>=6) return '#F59E0B'
  return '#EF4444'
}

export function SleepView() {
  const [entries, setEntries] = useState<SleepEntry[]>(INIT)
  const [activeMember, setActiveMember] = useState(MEMBERS[0].id)

  const memberEntries = entries.filter(e=>e.memberId===activeMember)
  const member = MEMBERS.find(m=>m.id===activeMember)!
  const avgHours = memberEntries.length ? Math.round(memberEntries.reduce((a,e)=>a+calcHours(e.bedtime,e.wakeup),0)/memberEntries.length*10)/10 : 0

  const update = (day:string, field:'bedtime'|'wakeup', val:string) => {
    setEntries(es=>es.map(e=>e.memberId===activeMember&&e.day===day?{...e,[field]:val}:e))
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)' }}>
      <div style={{ padding:'20px 24px 14px',background:'var(--surface)',borderBottom:'1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>Sleep Tracker</h1>
            <p style={{ fontSize:13,color:'var(--text-3)',fontFamily:'Inter',marginTop:2 }}>Track sleep schedules for the week</p>
          </div>
          <div style={{ textAlign:'center',background:member.bgColor,padding:'10px 20px',borderRadius:14,border:`1px solid ${member.barColor}40` }}>
            <p style={{ fontSize:11,fontWeight:600,color:member.textColor,fontFamily:'Inter' }}>AVG SLEEP</p>
            <p style={{ fontSize:28,fontWeight:800,color:member.textColor,fontFamily:'Inter' }}>{avgHours}h</p>
          </div>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          {MEMBERS.map(m=>(
            <button key={m.id} onClick={()=>setActiveMember(m.id)}
              style={{ padding:'6px 16px',borderRadius:20,border:`1.5px solid ${activeMember===m.id?m.barColor:'var(--border)'}`,background:activeMember===m.id?m.bgColor:'var(--surface)',color:activeMember===m.id?m.textColor:'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>
              {m.avatar} {m.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
        <div style={{ background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden' }}>
          {/* Header */}
          <div style={{ display:'grid',gridTemplateColumns:'80px 1fr 1fr 80px',background:'var(--bg)',borderBottom:'1px solid var(--border)',padding:'10px 16px' }}>
            {['Day','Bedtime','Wake up','Hours'].map(h=>(
              <p key={h} style={{ fontSize:11,fontWeight:600,color:'var(--text-3)',fontFamily:'Inter',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</p>
            ))}
          </div>
          {DAYS.map(day=>{
            const e = memberEntries.find(x=>x.day===day)
            const hours = e ? calcHours(e.bedtime,e.wakeup) : 0
            return (
              <div key={day} style={{ display:'grid',gridTemplateColumns:'80px 1fr 1fr 80px',padding:'12px 16px',borderBottom:'1px solid var(--border)',alignItems:'center' }}>
                <p style={{ fontWeight:700,fontSize:14,color:'var(--text-1)',fontFamily:'Inter' }}>{day}</p>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <Moon size={14} color="#6B7280"/>
                  <input type="time" value={e?.bedtime??'22:00'} onChange={ev=>update(day,'bedtime',ev.target.value)}
                    style={{ padding:'6px 10px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,fontFamily:'Inter',background:'var(--bg)',color:'var(--text-1)',outline:'none' }}/>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <Sun size={14} color="#F59E0B"/>
                  <input type="time" value={e?.wakeup??'07:00'} onChange={ev=>update(day,'wakeup',ev.target.value)}
                    style={{ padding:'6px 10px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,fontFamily:'Inter',background:'var(--bg)',color:'var(--text-1)',outline:'none' }}/>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:qualityColor(hours) }}/>
                  <span style={{ fontSize:14,fontWeight:700,color:qualityColor(hours),fontFamily:'Inter' }}>{hours}h</span>
                </div>
              </div>
            )
          })}
        </div>
        {/* Legend */}
        <div style={{ display:'flex',gap:16,marginTop:16,padding:'12px 16px',background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)' }}>
          {[{color:'#10B981',label:'8h+ Excellent'},{color:'#6EE7B7',label:'7h Good'},{color:'#F59E0B',label:'6h Fair'},{color:'#EF4444',label:'<6h Poor'}].map(l=>(
            <div key={l.label} style={{ display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ width:10,height:10,borderRadius:'50%',background:l.color }}/>
              <span style={{ fontSize:12,fontWeight:500,color:'var(--text-2)',fontFamily:'Inter' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
