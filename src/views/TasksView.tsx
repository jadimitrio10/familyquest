import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'
import { MEMBERS } from '@/types/calendar.types'

interface Task { id: string; title: string; memberId: string; done: boolean; priority: 'high'|'medium'|'low'; dueDate?: string }

const INIT: Task[] = [
  { id:'t1', title:'Buy groceries', memberId:'emma', done:false, priority:'high', dueDate:'2024-09-11' },
  { id:'t2', title:'Pick up kids from school', memberId:'wei', done:false, priority:'high' },
  { id:'t3', title:'Finish homework', memberId:'julie', done:false, priority:'medium', dueDate:'2024-09-12' },
  { id:'t4', title:'Call the dentist', memberId:'emma', done:true, priority:'medium' },
  { id:'t5', title:'Pay electricity bill', memberId:'wei', done:false, priority:'low' },
  { id:'t6', title:'Practice piano', memberId:'julie', done:false, priority:'medium' },
]

const PRIORITY_COLORS = { high:'#EF4444', medium:'#F59E0B', low:'#10B981' }

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>(INIT)
  const [filter, setFilter] = useState<string|null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newMember, setNewMember] = useState(MEMBERS[0].id)
  const [newPriority, setNewPriority] = useState<'high'|'medium'|'low'>('medium')
  const [showAdd, setShowAdd] = useState(false)

  const toggle = (id: string) => setTasks(t => t.map(x => x.id===id ? {...x,done:!x.done} : x))
  const remove = (id: string) => setTasks(t => t.filter(x => x.id!==id))
  const add = () => {
    if (!newTitle.trim()) return
    setTasks(t => [...t, { id:`t-${Date.now()}`, title:newTitle.trim(), memberId:newMember, done:false, priority:newPriority }])
    setNewTitle(''); setShowAdd(false)
  }

  const visible = filter ? tasks.filter(t => t.memberId===filter) : tasks
  const pending = visible.filter(t => !t.done)
  const done    = visible.filter(t => t.done)

  return (
    <div className="flex flex-col h-full" style={{ background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontSize:22, fontWeight:700, fontFamily:'Inter', color:'var(--text-1)' }}>Tasks</h1>
          <motion.button whileTap={{scale:0.95}} onClick={()=>setShowAdd(v=>!v)}
            style={{ display:'flex', alignItems:'center', gap:6, background:'var(--text-1)', color:'#fff', borderRadius:20, padding:'8px 16px', fontSize:13, fontWeight:600, fontFamily:'Inter', border:'none', cursor:'pointer' }}>
            <Plus size={14}/> Add Task
          </motion.button>
        </div>
        {/* Member filter */}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setFilter(null)} style={{ padding:'5px 14px', borderRadius:20, border:`1.5px solid ${!filter?'var(--blue)':'var(--border)'}`, background:!filter?'var(--blue-bg)':'var(--surface)', color:!filter?'var(--blue)':'var(--text-2)', fontSize:12, fontWeight:600, fontFamily:'Inter', cursor:'pointer' }}>All</button>
          {MEMBERS.map(m => (
            <button key={m.id} onClick={()=>setFilter(m.id===filter?null:m.id)}
              style={{ padding:'5px 14px', borderRadius:20, border:`1.5px solid ${filter===m.id?m.barColor:'var(--border)'}`, background:filter===m.id?m.bgColor:'var(--surface)', color:filter===m.id?m.textColor:'var(--text-2)', fontSize:12, fontWeight:600, fontFamily:'Inter', cursor:'pointer' }}>
              {m.avatar} {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add task form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
            style={{ overflow:'hidden', background:'var(--blue-bg)', borderBottom:'1px solid var(--border)' }}>
            <div style={{ padding:'14px 24px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
                placeholder="Task title..." autoFocus
                style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--surface)', color:'var(--text-1)', outline:'none' }}/>
              <select value={newMember} onChange={e=>setNewMember(e.target.value)}
                style={{ padding:'9px 12px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:13, fontFamily:'Inter', background:'var(--surface)', cursor:'pointer', outline:'none' }}>
                {MEMBERS.map(m=><option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
              <select value={newPriority} onChange={e=>setNewPriority(e.target.value as 'high'|'medium'|'low')}
                style={{ padding:'9px 12px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:13, fontFamily:'Inter', background:'var(--surface)', cursor:'pointer', outline:'none' }}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
              <motion.button whileTap={{scale:0.95}} onClick={add}
                style={{ padding:'9px 20px', borderRadius:10, background:'var(--blue)', color:'#fff', border:'none', fontSize:13, fontWeight:700, fontFamily:'Inter', cursor:'pointer' }}>Add</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-6">
            <p style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'Inter', marginBottom:10 }}>
              Pending — {pending.length}
            </p>
            <AnimatePresence>
              {pending.map(task => <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove}/>)}
            </AnimatePresence>
          </div>
        )}
        {/* Done */}
        {done.length > 0 && (
          <div>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'Inter', marginBottom:10 }}>
              Completed — {done.length}
            </p>
            <AnimatePresence>
              {done.map(task => <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove}/>)}
            </AnimatePresence>
          </div>
        )}
        {visible.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:60, color:'var(--text-3)' }}>
            <div style={{ fontSize:48 }}>✅</div>
            <p style={{ marginTop:12, fontWeight:600, fontFamily:'Inter', fontSize:16 }}>No tasks here!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onRemove }: { task:Task; onToggle:(id:string)=>void; onRemove:(id:string)=>void }) {
  const member = MEMBERS.find(m=>m.id===task.memberId)!
  const pc = { high:'#EF4444', medium:'#F59E0B', low:'#10B981' }
  return (
    <motion.div layout initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:10}}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, background:'var(--surface)', border:'1px solid var(--border)', marginBottom:8, opacity:task.done?0.6:1 }}>
      <motion.button whileTap={{scale:0.85}} onClick={()=>onToggle(task.id)}
        style={{ width:22,height:22,borderRadius:'50%',border:`2px solid ${task.done?member.barColor:'var(--border)'}`,background:task.done?member.barColor:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
        {task.done && <Check size={12} color="#fff" strokeWidth={3}/>}
      </motion.button>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14,fontWeight:500,fontFamily:'Inter',color:'var(--text-1)',textDecoration:task.done?'line-through':'none',marginBottom:2 }}>{task.title}</p>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontSize:11,fontWeight:600,color:member.textColor,background:member.bgColor,padding:'2px 8px',borderRadius:20 }}>{member.avatar} {member.name}</span>
          <span style={{ width:6,height:6,borderRadius:'50%',background:pc[task.priority],display:'inline-block' }}/>
          <span style={{ fontSize:11,fontWeight:500,color:'var(--text-3)',fontFamily:'Inter',textTransform:'capitalize' }}>{task.priority}</span>
          {task.dueDate && <span style={{ fontSize:11,color:'var(--text-3)',fontFamily:'Inter' }}>· {task.dueDate}</span>}
        </div>
      </div>
      <button onClick={()=>onRemove(task.id)} style={{ width:30,height:30,borderRadius:8,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)' }}>
        <Trash2 size={14}/>
      </button>
    </motion.div>
  )
}
