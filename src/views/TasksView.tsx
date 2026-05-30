import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, RefreshCw, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { EmojiPicker } from '@/components/shared/EmojiPicker'

export interface Task {
  id: string
  title: string
  emoji: string
  memberId: string
  done: boolean
  type: 'fixed' | 'once'        // fixed = recurring daily, once = one-time
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  notes?: string
}

const STORAGE_KEY = 'fq_tasks_v2'

function loadTasks(): Task[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

const PRIORITY_COLOR: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }

export function TasksView() {
  const { members } = useMembersStore()
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [activeMember, setActiveMember] = useState<string>(members[0]?.id ?? '')
  const [showAdd, setShowAdd] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [expandedSections, setExpandedSections] = useState({ fixed: true, once: true, done: false })

  // New task form state
  const [form, setForm] = useState({
    title: '', emoji: '✅', type: 'once' as 'fixed' | 'once',
    priority: 'medium' as 'high' | 'medium' | 'low', dueDate: '', notes: ''
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) } catch {}
  }, [tasks])

  const member = members.find(m => m.id === activeMember)
  const myTasks = tasks.filter(t => t.memberId === activeMember)
  const fixedTasks  = myTasks.filter(t => t.type === 'fixed' && !t.done)
  const onceTasks   = myTasks.filter(t => t.type === 'once' && !t.done)
  const doneTasks   = myTasks.filter(t => t.done)

  const toggle = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = (id: string) => setTasks(ts => ts.filter(t => t.id !== id))
  const resetFixed = () => setTasks(ts => ts.map(t => t.memberId === activeMember && t.type === 'fixed' ? { ...t, done: false } : t))

  function addTask() {
    if (!form.title.trim()) return
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: form.title.trim(),
      emoji: form.emoji,
      memberId: activeMember,
      done: false,
      type: form.type,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    }
    setTasks(ts => [...ts, newTask])
    setForm({ title: '', emoji: '✅', type: 'once', priority: 'medium', dueDate: '', notes: '' })
    setShowAdd(false)
  }

  const toggleSection = (s: keyof typeof expandedSections) =>
    setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }))

  const doneCount = doneTasks.length
  const totalCount = myTasks.length

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* LEFT — Member list */}
      <div style={{ width: 200, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter' }}>Members</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {members.map(m => {
            const mTasks = tasks.filter(t => t.memberId === m.id)
            const mDone  = mTasks.filter(t => t.done).length
            const isActive = m.id === activeMember
            return (
              <motion.button key={m.id} onClick={() => setActiveMember(m.id)} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 12, border: 'none', background: isActive ? m.bgColor : 'transparent', cursor: 'pointer', marginBottom: 4, transition: 'background 150ms' }}>
                <MemberAvatar member={m} size={34} />
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? m.textColor : 'var(--text-1)', fontFamily: 'Inter', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'Inter' }}>{mDone}/{mTasks.length} done</p>
                </div>
                {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.barColor, flexShrink: 0 }} />}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* RIGHT — Tasks */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {member && <MemberAvatar member={member} size={40} />}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-1)' }}>{member?.name ?? 'Tasks'}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'Inter' }}>{doneCount}/{totalCount} completed today</p>
          </div>
          {/* Progress bar */}
          <div style={{ width: 100, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${totalCount ? (doneCount / totalCount) * 100 : 0}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ height: '100%', borderRadius: 3, background: member?.barColor ?? 'var(--blue)' }} />
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: member?.barColor ?? 'var(--text-1)', color: '#fff', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'Inter', border: 'none', cursor: 'pointer' }}>
            <Plus size={14} /> Add Task
          </motion.button>
        </div>

        {/* Add task form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', background: member ? member.bgColor + '55' : 'var(--blue-bg)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* Emoji button */}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowEmojiPicker(v => !v)}
                      style={{ width: 44, height: 44, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {form.emoji}
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          style={{ position: 'absolute', top: '110%', left: 0, zIndex: 99 }}>
                          <EmojiPicker value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e }))} onClose={() => setShowEmojiPicker(false)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Task name..." autoFocus
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'Inter', background: 'var(--surface)', outline: 'none', color: 'var(--text-1)' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* Type */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'fixed', label: '🔄 Fixed', desc: 'Repeats daily' }, { v: 'once', label: '📅 One-time', desc: 'Happens once' }].map(opt => (
                      <button key={opt.v} onClick={() => setForm(f => ({ ...f, type: opt.v as 'fixed' | 'once' }))}
                        title={opt.desc}
                        style={{ padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${form.type === opt.v ? (member?.barColor ?? 'var(--blue)') : 'var(--border)'}`, background: form.type === opt.v ? (member?.bgColor ?? 'var(--blue-bg)') : 'var(--surface)', color: form.type === opt.v ? (member?.textColor ?? 'var(--blue)') : 'var(--text-2)', fontSize: 12, fontWeight: 600, fontFamily: 'Inter', cursor: 'pointer' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Priority */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'high', label: '🔴 High' }, { v: 'medium', label: '🟡 Medium' }, { v: 'low', label: '🟢 Low' }].map(opt => (
                      <button key={opt.v} onClick={() => setForm(f => ({ ...f, priority: opt.v as 'high' | 'medium' | 'low' }))}
                        style={{ padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${form.priority === opt.v ? PRIORITY_COLOR[opt.v] : 'var(--border)'}`, background: form.priority === opt.v ? PRIORITY_COLOR[opt.v] + '20' : 'var(--surface)', color: form.priority === opt.v ? PRIORITY_COLOR[opt.v] : 'var(--text-2)', fontSize: 12, fontWeight: 600, fontFamily: 'Inter', cursor: 'pointer' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {form.type === 'once' && (
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      style={{ padding: '7px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'Inter', background: 'var(--surface)', outline: 'none', color: 'var(--text-1)' }} />
                  )}
                </div>

                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes (optional)..."
                  style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'Inter', background: 'var(--surface)', outline: 'none', color: 'var(--text-1)' }} />

                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={addTask}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, background: member?.barColor ?? 'var(--blue)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'Inter', cursor: 'pointer' }}>
                    ✅ Add Task
                  </motion.button>
                  <button onClick={() => setShowAdd(false)}
                    style={{ padding: '10px 18px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Inter', cursor: 'pointer', color: 'var(--text-2)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {/* Fixed tasks */}
          <TaskSection
            title="🔄 Fixed Tasks"
            subtitle="Repeat every day"
            tasks={fixedTasks}
            expanded={expandedSections.fixed}
            onToggle={() => toggleSection('fixed')}
            onTaskToggle={toggle}
            onTaskRemove={remove}
            member={member}
            extra={
              <button onClick={resetFixed} title="Reset all fixed tasks" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', fontFamily: 'Inter', border: 'none', background: 'transparent', cursor: 'pointer', padding: '3px 8px', borderRadius: 6 }}>
                <RefreshCw size={11} /> Reset
              </button>
            }
          />

          {/* One-time tasks */}
          <TaskSection
            title="📅 One-time Tasks"
            subtitle="Specific tasks and events"
            tasks={onceTasks}
            expanded={expandedSections.once}
            onToggle={() => toggleSection('once')}
            onTaskToggle={toggle}
            onTaskRemove={remove}
            member={member}
          />

          {/* Done */}
          <TaskSection
            title={`✅ Done (${doneTasks.length})`}
            subtitle=""
            tasks={doneTasks}
            expanded={expandedSections.done}
            onToggle={() => toggleSection('done')}
            onTaskToggle={toggle}
            onTaskRemove={remove}
            member={member}
            dimmed
          />

          {myTasks.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-3)' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
              <p style={{ fontWeight: 700, fontFamily: 'Inter', fontSize: 18, color: 'var(--text-2)' }}>No tasks yet for {member?.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'Inter', marginTop: 6 }}>Click "+ Add Task" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskSection({
  title, subtitle, tasks, expanded, onToggle, onTaskToggle, onTaskRemove, member, extra, dimmed
}: {
  title: string; subtitle: string; tasks: Task[]
  expanded: boolean; onToggle: () => void
  onTaskToggle: (id: string) => void; onTaskRemove: (id: string) => void
  member?: { bgColor: string; barColor: string; textColor: string } | null
  extra?: React.ReactNode; dimmed?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: expanded ? 8 : 0 }}>
        {expanded ? <ChevronDown size={14} color="var(--text-3)" /> : <ChevronRight size={14} color="var(--text-3)" />}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {subtitle && <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'Inter' }}>· {subtitle}</span>}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontFamily: 'Inter', fontWeight: 600 }}>{tasks.length}</span>
        {extra && <div onClick={e => e.stopPropagation()}>{extra}</div>}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {tasks.map(task => (
              <motion.div key={task.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: dimmed ? 0.55 : 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 6 }}>
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => onTaskToggle(task.id)}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${task.done ? (member?.barColor ?? '#10B981') : 'var(--border)'}`, background: task.done ? (member?.barColor ?? '#10B981') : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {task.done && <Check size={13} color="#fff" strokeWidth={3} />}
                </motion.button>
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{task.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'Inter', color: 'var(--text-1)', textDecoration: task.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLOR[task.priority], display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'Inter', textTransform: 'capitalize' }}>{task.priority}</span>
                    {task.type === 'fixed' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-3)', fontFamily: 'Inter' }}><RefreshCw size={9} /> Daily</span>
                    )}
                    {task.dueDate && <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'Inter' }}><Calendar size={9} style={{ display: 'inline', marginRight: 3 }} />{task.dueDate}</span>}
                    {task.notes && <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'Inter', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.notes}</span>}
                  </div>
                </div>
                <button onClick={() => onTaskRemove(task.id)}
                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
