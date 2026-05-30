import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Trash2, Check } from 'lucide-react'
import { MEMBERS } from '@/types/calendar.types'
import confetti from 'canvas-confetti'

interface Reward { id:string; title:string; emoji:string; points:number; memberId:string; claimed:boolean }
interface Points { [memberId:string]: number }

const INIT_REWARDS: Reward[] = [
  { id:'r1', title:'Extra screen time (1h)', emoji:'📱', points:50, memberId:'julie', claimed:false },
  { id:'r2', title:'Choose dinner tonight', emoji:'🍕', points:100, memberId:'julie', claimed:false },
  { id:'r3', title:'Movie night pick', emoji:'🎬', points:150, memberId:'julie', claimed:true },
  { id:'r4', title:'Skip one chore', emoji:'🙅', points:80, memberId:'emma', claimed:false },
  { id:'r5', title:'Sleep-in pass (+1h)', emoji:'😴', points:120, memberId:'wei', claimed:false },
]
const INIT_POINTS: Points = { emma:240, wei:180, julie:310 }

export function RewardsView() {
  const [rewards, setRewards] = useState<Reward[]>(INIT_REWARDS)
  const [points, setPoints]   = useState<Points>(INIT_POINTS)
  const [filter, setFilter]   = useState<string|null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎁')
  const [newPoints, setNewPoints] = useState(100)
  const [newMember, setNewMember] = useState(MEMBERS[0].id)

  const claim = (r: Reward) => {
    const bal = points[r.memberId] ?? 0
    if (bal < r.points || r.claimed) return
    setPoints(p => ({ ...p, [r.memberId]: p[r.memberId] - r.points }))
    setRewards(rs => rs.map(x => x.id===r.id ? {...x,claimed:true} : x))
    confetti({ particleCount:100, spread:70, origin:{y:0.6} })
  }
  const remove = (id:string) => setRewards(rs => rs.filter(r=>r.id!==id))
  const add = () => {
    if (!newTitle.trim()) return
    setRewards(rs => [...rs, { id:`r-${Date.now()}`, title:newTitle.trim(), emoji:newEmoji, points:newPoints, memberId:newMember, claimed:false }])
    setNewTitle(''); setShowAdd(false)
  }

  const visible = filter ? rewards.filter(r=>r.memberId===filter) : rewards

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>Rewards</h1>
          <motion.button whileTap={{scale:0.95}} onClick={()=>setShowAdd(v=>!v)}
            style={{ display:'flex',alignItems:'center',gap:6,background:'var(--text-1)',color:'#fff',borderRadius:20,padding:'8px 16px',fontSize:13,fontWeight:600,fontFamily:'Inter',border:'none',cursor:'pointer' }}>
            <Plus size={14}/> Add Reward
          </motion.button>
        </div>
        {/* Points balances */}
        <div style={{ display:'flex', gap:10, marginBottom:12 }}>
          {MEMBERS.map(m=>(
            <div key={m.id} style={{ padding:'8px 14px', borderRadius:12, background:m.bgColor, border:`1px solid ${m.barColor}40` }}>
              <p style={{ fontSize:11,fontWeight:600,color:m.textColor,fontFamily:'Inter' }}>{m.avatar} {m.name}</p>
              <p style={{ fontSize:18,fontWeight:800,color:m.textColor,fontFamily:'Inter' }}><Star size={13} style={{display:'inline',marginRight:3}}/>{points[m.id]??0}</p>
            </div>
          ))}
        </div>
        {/* Filter */}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setFilter(null)} style={{ padding:'5px 14px',borderRadius:20,border:`1.5px solid ${!filter?'var(--blue)':'var(--border)'}`,background:!filter?'var(--blue-bg)':'var(--surface)',color:!filter?'var(--blue)':'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>All</button>
          {MEMBERS.map(m=>(
            <button key={m.id} onClick={()=>setFilter(m.id===filter?null:m.id)}
              style={{ padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filter===m.id?m.barColor:'var(--border)'}`,background:filter===m.id?m.bgColor:'var(--surface)',color:filter===m.id?m.textColor:'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>
              {m.avatar} {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} style={{ overflow:'hidden',background:'var(--blue-bg)',borderBottom:'1px solid var(--border)' }}>
            <div style={{ padding:'14px 24px',display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end' }}>
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Reward name..." autoFocus
                style={{ flex:1,minWidth:180,padding:'9px 14px',borderRadius:10,border:'1.5px solid var(--border)',fontSize:14,fontFamily:'Inter',background:'var(--surface)',outline:'none' }}/>
              <input value={newEmoji} onChange={e=>setNewEmoji(e.target.value)} maxLength={2}
                style={{ width:52,padding:'9px',borderRadius:10,border:'1.5px solid var(--border)',fontSize:20,textAlign:'center',background:'var(--surface)',outline:'none' }}/>
              <input type="number" value={newPoints} onChange={e=>setNewPoints(Number(e.target.value))} min={10} max={1000}
                style={{ width:90,padding:'9px 12px',borderRadius:10,border:'1.5px solid var(--border)',fontSize:14,fontFamily:'Inter',background:'var(--surface)',outline:'none' }}/>
              <select value={newMember} onChange={e=>setNewMember(e.target.value)}
                style={{ padding:'9px 12px',borderRadius:10,border:'1.5px solid var(--border)',fontSize:13,fontFamily:'Inter',background:'var(--surface)',cursor:'pointer',outline:'none' }}>
                {MEMBERS.map(m=><option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
              <motion.button whileTap={{scale:0.95}} onClick={add}
                style={{ padding:'9px 20px',borderRadius:10,background:'var(--blue)',color:'#fff',border:'none',fontSize:13,fontWeight:700,fontFamily:'Inter',cursor:'pointer' }}>Add</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards grid */}
      <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16 }}>
          {visible.map(r=>{
            const m = MEMBERS.find(x=>x.id===r.memberId)!
            const bal = points[r.memberId]??0
            const canClaim = bal>=r.points && !r.claimed
            return (
              <motion.div key={r.id} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                style={{ background:'var(--surface)',borderRadius:16,padding:20,border:`1px solid ${r.claimed?m.barColor+'60':'var(--border)'}`,position:'relative',opacity:r.claimed?0.75:1 }}>
                <button onClick={()=>remove(r.id)} style={{ position:'absolute',top:10,right:10,width:24,height:24,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'var(--text-3)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Trash2 size={13}/>
                </button>
                <div style={{ fontSize:40,marginBottom:10 }}>{r.emoji}</div>
                <p style={{ fontSize:14,fontWeight:600,fontFamily:'Inter',color:'var(--text-1)',marginBottom:8,paddingRight:24 }}>{r.title}</p>
                <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:14 }}>
                  <span style={{ fontSize:12,fontWeight:700,color:m.textColor,background:m.bgColor,padding:'3px 10px',borderRadius:20 }}>{m.avatar} {m.name}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:'#F59E0B' }}>⭐{r.points}</span>
                </div>
                <motion.button whileTap={{scale:0.95}} onClick={()=>claim(r)}
                  disabled={!canClaim}
                  style={{ width:'100%',padding:'9px',borderRadius:10,border:'none',background:r.claimed?m.barColor:canClaim?m.barColor+'dd':'var(--border)',color:r.claimed||canClaim?'#fff':'var(--text-3)',fontSize:13,fontWeight:700,fontFamily:'Inter',cursor:canClaim?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                  {r.claimed ? <><Check size={14}/>Claimed!</> : canClaim ? '🎁 Claim' : `Need ${r.points-bal} more ⭐`}
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
