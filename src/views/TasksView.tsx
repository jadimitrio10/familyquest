import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Plus, Trash2, Check, RefreshCw, ChevronDown, ChevronRight,
  Repeat2, CalendarDays, Flag, StickyNote, X, Sparkles
} from 'lucide-react'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { EmojiPicker } from '@/components/shared/EmojiPicker'

export interface Task {
  id: string
  title: string
  emoji: string
  memberId: string
  done: boolean
  type: 'fixed' | 'once'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  notes?: string
}

const STORAGE_KEY = 'fq_tasks_v2'

function loadTasks(): Task[] {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : [] } catch { return [] }
}

// Priority config
const PRIORITY = {
  high:   { label: 'High',   color: '#EF4444', bg: '#FEF2F2', dot: '🔴' },
  medium: { label: 'Medium', color: '#F59E0B', bg: '#FFFBEB', dot: '🟡' },
  low:    { label: 'Low',    color: '#10B981', bg: '#F0FDF4', dot: '🟢' },
}

const spring = { type: 'spring' as const, stiffness: 400, damping: 28 }

export function TasksView() {
  const { members } = useMembersStore()
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [activeMember, setActiveMember] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [expanded, setExpanded] = useState({ fixed: true, once: true, done: false })
  const emojiRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    title: '', emoji: '✅',
    type: 'once' as 'fixed' | 'once',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '', notes: '',
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) } catch {}
  }, [tasks])

  // Close emoji picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const memberId = activeMember || members[0]?.id || ''
  const member = members.find(m => m.id === memberId)
  const myTasks = tasks.filter(t => t.memberId === memberId)
  const fixedPending = myTasks.filter(t => t.type === 'fixed' && !t.done)
  const oncePending  = myTasks.filter(t => t.type === 'once'  && !t.done)
  const doneTasks    = myTasks.filter(t => t.done)
  const totalDone    = doneTasks.length
  const totalTasks   = myTasks.length
  const pct          = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0

  const toggle = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = (id: string) => setTasks(ts => ts.filter(t => t.id !== id))
  const resetFixed = () => setTasks(ts => ts.map(t => t.memberId === memberId && t.type === 'fixed' ? { ...t, done: false } : t))

  function addTask() {
    if (!form.title.trim()) return
    setTasks(ts => [...ts, {
      id: `t-${Date.now()}`, memberId,
      title: form.title.trim(), emoji: form.emoji,
      done: false, type: form.type,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    }])
    setForm({ title: '', emoji: '✅', type: 'once', priority: 'medium', dueDate: '', notes: '' })
    setShowForm(false)
  }

  function toggleSection(s: keyof typeof expanded) {
    setExpanded(p => ({ ...p, [s]: !p[s] }))
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL — member list ── */}
      <div style={{ width: 210, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Members</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
          {members.map(m => {
            const mt   = tasks.filter(t => t.memberId === m.id)
            const done = mt.filter(t => t.done).length
            const pct  = mt.length ? Math.round((done / mt.length) * 100) : 0
            const active = m.id === memberId

            return (
              <motion.button key={m.id} onClick={() => setActiveMember(m.id)} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, border: 'none', background: active ? m.bgColor : 'transparent', cursor: 'pointer', marginBottom: 4, transition: 'background 180ms' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <MemberAvatar member={m} size={38} />
                  {active && (
                    <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: m.barColor, border: '2px solid var(--surface)' }} />
                  )}
                </div>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: active ? m.textColor : 'var(--text-1)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                  <div style={{ height: 3, borderRadius: 2, background: active ? `${m.barColor}30` : 'var(--border)', overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 2, background: m.barColor }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? m.textColor : 'var(--text-3)', flexShrink: 0 }}>{done}/{mt.length}</span>
              </motion.button>
            )
          })}

          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <p style={{ fontSize: 12, fontWeight: 500 }}>Add members in Settings</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
          {member && <MemberAvatar member={member} size={44} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2, marginBottom: 6 }}>
              {member?.name ?? 'Tasks'}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginLeft: 10 }}>
                {totalDone}/{totalTasks} done
              </span>
            </h1>
            {/* Progress bar */}
            <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', width: '100%', maxWidth: 300 }}>
              <motion.div animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ height: '100%', borderRadius: 3, background: member?.barColor ?? 'var(--blue)' }} />
            </div>
          </div>

          {/* Add button */}
          <motion.button
            onClick={() => setShowForm(v => !v)}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: showForm ? 'var(--border)' : (member?.barColor ?? 'var(--blue)'),
              color: showForm ? 'var(--text-2)' : '#fff',
              border: 'none', borderRadius: 14,
              padding: '10px 20px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', transition: 'all 200ms',
              boxShadow: showForm ? 'none' : `0 4px 14px ${(member?.barColor ?? '#4F46E5')}40`,
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} strokeWidth={2.5} />}
            {showForm ? 'Cancel' : 'Add Task'}
          </motion.button>
        </div>

        {/* ── ADD TASK FORM ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
            >
              <div style={{ padding: '20px 24px', background: member ? `${member.bgColor}66` : 'var(--bg)' }}>
                {/* Title row */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                  {/* Emoji button */}
                  <div ref={emojiRef} style={{ position: 'relative' }}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(v => !v)}
                      style={{ width: 52, height: 52, borderRadius: 14, border: `2px solid ${showEmojiPicker ? (member?.barColor ?? 'var(--blue)') : 'var(--border)'}`, background: 'var(--surface)', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}
                    >
                      {form.emoji}
                    </motion.button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -6 }}
                          style={{ position: 'absolute', top: '110%', left: 0, zIndex: 99 }}>
                          <EmojiPicker value={form.emoji} onChange={e => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }} onClose={() => setShowEmojiPicker(false)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="What needs to be done?"
                    autoFocus
                    style={{ flex: 1, padding: '14px 18px', borderRadius: 14, border: '2px solid var(--border)', fontSize: 15, fontWeight: 500, fontFamily: 'Inter', color: 'var(--text-1)', outline: 'none', background: 'var(--surface)', transition: 'border-color 150ms' }}
                    onFocus={e => e.currentTarget.style.borderColor = member?.barColor ?? 'var(--blue)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>

                {/* Options row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {/* Type toggle */}
                  <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 12, padding: 3, border: '1px solid var(--border)' }}>
                    {([{ v: 'fixed', icon: Repeat2, label: 'Fixed' }, { v: 'once', icon: CalendarDays, label: 'One-time' }] as const).map(opt => (
                      <button key={opt.v} onClick={() => setForm(f => ({ ...f, type: opt.v }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: 'none', background: form.type === opt.v ? (member?.barColor ?? 'var(--blue)') : 'transparent', color: form.type === opt.v ? '#fff' : 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 180ms' }}>
                        <opt.icon size={13} strokeWidth={2.5} />
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Priority pills */}
                  <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 12, padding: 3, border: '1px solid var(--border)', gap: 2 }}>
                    {(Object.entries(PRIORITY) as [string, typeof PRIORITY.high][]).map(([k, p]) => (
                      <button key={k} onClick={() => setForm(f => ({ ...f, priority: k as 'high' | 'medium' | 'low' }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 10, border: 'none', background: form.priority === k ? p.bg : 'transparent', color: form.priority === k ? p.color : 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 180ms' }}>
                        <Flag size={12} strokeWidth={2.5} fill={form.priority === k ? p.color : 'none'} />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Date (only for once) */}
                  {form.type === 'once' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <CalendarDays size={14} color="var(--text-3)" />
                      <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Inter', color: 'var(--text-1)', background: 'transparent', cursor: 'pointer' }} />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 14 }}>
                  <StickyNote size={14} color="var(--text-3)" />
                  <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Add a note (optional)..."
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Inter', color: 'var(--text-1)', background: 'transparent' }} />
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={addTask}
                    disabled={!form.title.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, border: 'none', background: form.title.trim() ? (member?.barColor ?? 'var(--blue)') : 'var(--border)', color: form.title.trim() ? '#fff' : 'var(--text-3)', fontSize: 15, fontWeight: 700, cursor: form.title.trim() ? 'pointer' : 'default', transition: 'all 200ms', boxShadow: form.title.trim() ? `0 4px 16px ${(member?.barColor ?? '#4F46E5')}35` : 'none' }}
                  >
                    <Sparkles size={16} />
                    Add Task
                  </motion.button>
                  <button onClick={() => setShowForm(false)}
                    style={{ padding: '12px 20px', borderRadius: 14, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 14, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'Inter' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

          {/* ── FIXED TASKS ── */}
          <TaskSection
            icon={<Repeat2 size={14} strokeWidth={2.5} />}
            title="Fixed Tasks"
            subtitle="Repeat every day"
            count={fixedPending.length}
            expanded={expanded.fixed}
            onToggle={() => toggleSection('fixed')}
            accentColor={member?.barColor}
            extra={
              <button onClick={resetFixed} title="Reset all fixed tasks to incomplete"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-3)', border: '1px solid var(--border)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>
                <RefreshCw size={11} /> Reset
              </button>
            }
          >
            {fixedPending.map((task, i) => (
              <TaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i * 0.04} />
            ))}
            {fixedPending.length === 0 && <EmptySection text="No fixed tasks" />}
          </TaskSection>

          {/* ── ONE-TIME TASKS ── */}
          <TaskSection
            icon={<CalendarDays size={14} strokeWidth={2.5} />}
            title="One-time Tasks"
            subtitle="Specific events & to-dos"
            count={oncePending.length}
            expanded={expanded.once}
            onToggle={() => toggleSection('once')}
            accentColor={member?.barColor}
          >
            {oncePending.map((task, i) => (
              <TaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i * 0.04} />
            ))}
            {oncePending.length === 0 && <EmptySection text="No pending tasks" />}
          </TaskSection>

          {/* ── DONE ── */}
          <TaskSection
            icon={<Check size={14} strokeWidth={2.5} />}
            title="Completed"
            count={doneTasks.length}
            expanded={expanded.done}
            onToggle={() => toggleSection('done')}
            dimmed
          >
            {doneTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i * 0.03} dimmed />
            ))}
          </TaskSection>

          {/* Empty state */}
          {myTasks.length === 0 && !showForm && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', paddingTop: 60 }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 56, marginBottom: 16 }}>🎯</motion.div>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>
                No tasks yet for {member?.name}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
                Add your first task and start tracking progress!
              </p>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowForm(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, border: 'none', background: member?.barColor ?? 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${(member?.barColor ?? '#4F46E5')}40` }}>
                <Plus size={18} /> Add First Task
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Section wrapper ── */
function TaskSection({ icon, title, subtitle, count, expanded, onToggle, accentColor, extra, dimmed, children }: {
  icon: React.ReactNode; title: string; subtitle?: string; count: number
  expanded: boolean; onToggle: () => void; accentColor?: string
  extra?: React.ReactNode; dimmed?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 10px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: dimmed ? 'var(--text-3)' : (accentColor ?? 'var(--text-2)') }}>
          {icon}
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        </span>
        {subtitle && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>· {subtitle}</span>
        )}
        {/* Count badge */}
        {count > 0 && (
          <span style={{ marginLeft: 4, minWidth: 20, height: 20, borderRadius: 10, background: accentColor ? `${accentColor}20` : 'var(--bg)', color: accentColor ?? 'var(--text-3)', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
            {count}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {extra && <div onClick={e => e.stopPropagation()}>{extra}</div>}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptySection({ text }: { text: string }) {
  return (
    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1.5px dashed var(--border)', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
      {text}
    </div>
  )
}

/* ── Task Card ── */
function TaskCard({ task, member, onToggle, onRemove, delay = 0, dimmed }: {
  task: Task
  member?: { barColor: string; bgColor: string; textColor: string } | null
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  delay?: number
  dimmed?: boolean
}) {
  const p = PRIORITY[task.priority]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0 }}
      transition={{ ...spring, delay }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 16, marginBottom: 8,
        background: 'var(--surface)',
        border: `1.5px solid ${hovered && !task.done ? (member?.barColor ?? 'var(--blue)') + '40' : 'var(--border)'}`,
        boxShadow: hovered && !task.done ? `0 4px 16px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 150ms, box-shadow 150ms',
        cursor: 'default',
      }}
    >
      {/* Checkbox */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => onToggle(task.id)}
        style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          border: `2.5px solid ${task.done ? (member?.barColor ?? '#10B981') : 'var(--border)'}`,
          background: task.done ? (member?.barColor ?? '#10B981') : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 200ms',
          boxShadow: task.done ? `0 2px 8px ${(member?.barColor ?? '#10B981')}40` : 'none',
        }}
      >
        <AnimatePresence>
          {task.done && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}>
              <Check size={13} color="#fff" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Emoji */}
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, filter: task.done ? 'grayscale(0.5)' : 'none' }}>
        {task.emoji}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: task.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: task.notes || task.dueDate ? 3 : 0 }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Priority pill */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: p.color, background: p.bg, padding: '2px 8px', borderRadius: 20 }}>
            <Flag size={9} strokeWidth={2.5} fill={p.color} /> {p.label}
          </span>
          {task.type === 'fixed' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-3)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>
              <Repeat2 size={9} /> Daily
            </span>
          )}
          {task.dueDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
              <CalendarDays size={10} /> {task.dueDate}
            </span>
          )}
          {task.notes && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              · {task.notes}
            </span>
          )}
        </div>
      </div>

      {/* Delete — only shows on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(task.id)}
            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
