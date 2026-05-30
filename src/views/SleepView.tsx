import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

interface SleepEntry { memberId:string; day:string; bedtime:string; wakeup:string }

function calcHours(bed:string, wake:string) {
  const [bh,bm]=bed.split(':').map(Number)
  const [wh,wm]=wake.split(':').map(Number)
  let mins = (wh*60+wm) - (bh*60+bm)
  if (mins<0) mins+=1440
  return Math.round(mins/60*10)/10
}
function qualityColor(h:number) {
  if (h>=8) return '#10B981'; if (h>=7) return '#6EE7B7'; if (h>=6) return '#F59E0B'; return '#EF4444'
}

export function SleepView() {
  const { members } = useMembersStore()
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [activeId, setActiveId] = useState<string>('')

  const memberId = activeId || members[0]?.id || ''
  const member = members.find(m=>m.id===memberId)
  const memberEntries = entries.filter(e=>e.memberId===memberId)
  const avgHours = memberEntries.length
    ? Math.round(memberEntries.reduce((a,e)=>a+calcHours(e.bedtime,e.wakeup),0)/memberEntries.length*10)/10
    : 0

  const update = (day:string, field:'bedtime'|'wakeup', val:string) => {
    setEntries(es => {
      const exists = es.find(e=>e.memberId===memberId&&e.day===day)
      if (exists) return es.map(e=>e.memberId===memberId&&e.day===day?{...e,[field]:val}:e)
      return [...es, { memberId, day, bedtime:'22:00', wakeup:'07:00', [field]:val }]
    })
  }

  const getEntry = (day:string) => memberEntries.find(e=>e.day===day)

  if (!member) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-3)',fontFamily:'Inter' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48,marginBottom:12 }}>😴</div>
        <p style={{ fontSize:16,fontWeight:600 }}>Add family members in Settings to track sleep</p>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)' }}>
      <div style={{ padding:'20px 24px 14px',background:'var(--surface)',borderBottom:'1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>Sleep Tracker</h1>
            <p style={{ fontSize:13,color:'var(--text-3)',fontFamily:'Inter',marginTop:2 }}>Weekly sleep schedules</p>
          </div>
          <div style={{ textAlign:'center',background:member.bgColor,padding:'10px 20px',borderRadius:14,border:`1px solid ${member.barColor}40` }}>
            <p style={{ fontSize:11,fontWeight:600,color:member.textColor,fontFamily:'Inter' }}>AVG SLEEP</p>
            <p style={{ fontSize:28,fontWeight:800,color:member.textColor,fontFamily:'Inter' }}>{avgHours}h</p>
          </div>
        </div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          {members.map(m=>(
            <button key={m.id} onClick={()=>setActiveId(m.id)}
              style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:20,border:`1.5px solid ${memberId===m.id?m.barColor:'var(--border)'}`,background:memberId===m.id?m.bgColor:'var(--surface)',color:memberId===m.id?m.textColor:'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>
              <MemberAvatar member={m} size={22}/> {m.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
        <div style={{ background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden' }}>
          <div style={{ display:'grid',gridTemplateColumns:'80px 1fr 1fr 80px',background:'var(--bg)',borderBottom:'1px solid var(--border)',padding:'10px 16px' }}>
            {['Day','Bedtime','Wake up','Hours'].map(h=>(
              <p key={h} style={{ fontSize:11,fontWeight:600,color:'var(--text-3)',fontFamily:'Inter',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</p>
            ))}
          </div>
          {DAYS.map(day=>{
            const e = getEntry(day)
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
        <div style={{ display:'flex',gap:16,marginTop:16,padding:'12px 16px',background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)',flexWrap:'wrap' }}>
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
