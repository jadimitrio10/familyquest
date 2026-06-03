import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Plus, Trash2, Check, RefreshCw, ChevronDown, ChevronRight,
  Repeat2, CalendarDays, X, Sparkles, BookOpen, PenLine
} from 'lucide-react'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { EmojiPicker } from '@/components/shared/EmojiPicker'

// ─── Types ────────────────────────────────────────────────
export interface Task {
  id: string; title: string; emoji: string; memberId: string
  done: boolean; type: 'fixed' | 'once'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string; notes?: string
  // Scheduling
  startTime?: string
  endTime?: string
  allDay?: boolean
  // Days of week: 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
  // undefined = every day; [] = every day; specific array = those days only
  daysOfWeek?: number[]
  // Points
  points: number
}

const STORAGE_KEY = 'fq_tasks_v2'
function loadTasks(): Task[] {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : [] } catch { return [] }
}

// ─── Priority config ──────────────────────────────────────
const PRIORITY = {
  high:   { label: 'Urgente', emoji: '🔴', color: '#FF3B30', bg: 'rgba(255,59,48,0.10)',  border: 'rgba(255,59,48,0.20)'  },
  medium: { label: 'Media',   emoji: '🟡', color: '#FF9500', bg: 'rgba(255,149,0,0.10)',  border: 'rgba(255,149,0,0.20)'  },
  low:    { label: 'Baja',    emoji: '🟢', color: '#34C759', bg: 'rgba(52,199,89,0.10)',  border: 'rgba(52,199,89,0.20)'  },
}

// ─── Task Library ─────────────────────────────────────────
const LIBRARY = [
  { cat: '🌅 Mañana',          color: '#FF9500', items: [
    { e:'🪥', t:'Lavarse los dientes'  }, { e:'🚿', t:'Bañarse / ducharse'   },
    { e:'👕', t:'Ponerse la ropa'      }, { e:'🍳', t:'Desayunar'            },
    { e:'🛏️', t:'Hacer la cama'       }, { e:'🎒', t:'Preparar la mochila'  },
  ]},
  { cat: '📚 Escuela & Tarde',  color: '#007AFF', items: [
    { e:'📖', t:'Hacer la tarea'       }, { e:'📚', t:'Leer 20 minutos'      },
    { e:'🎵', t:'Practicar instrumento'}, { e:'✏️', t:'Repasar lecciones'   },
  ]},
  { cat: '🏠 Hogar',            color: '#34C759', items: [
    { e:'🍽️', t:'Poner la mesa'       }, { e:'🧹', t:'Barrer / trapear'     },
    { e:'🗑️', t:'Sacar la basura'     }, { e:'🐾', t:'Darle de comer a la mascota' },
    { e:'🧺', t:'Recoger la ropa'     }, { e:'🫧', t:'Lavar los platos'     },
  ]},
  { cat: '🌙 Noche',            color: '#5856D6', items: [
    { e:'🪥', t:'Lavarse los dientes (noche)' }, { e:'😴', t:'Preparar ropa para mañana' },
    { e:'📵', t:'Sin pantallas 30 min antes'  }, { e:'🌙', t:'Pijama y a la cama'        },
  ]},
  { cat: '💪 Salud & Personal', color: '#FF3B30', items: [
    { e:'💧', t:'Beber 8 vasos de agua'}, { e:'🏃', t:'Hacer ejercicio'       },
    { e:'🧘', t:'Momento de calma'     }, { e:'🎨', t:'Practicar un hobby'    },
  ]},
]

// ─── Apple Spring ─────────────────────────────────────────
const AP = { type: 'spring' as const, stiffness: 400, damping: 25 }

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export function TasksView() {
  const { members } = useMembersStore()
  const [tasks, setTasks]               = useState<Task[]>(loadTasks)
  const [activeMember, setActiveMember] = useState('')
  const [expanded, setExpanded]         = useState({ fixed: true, once: true, done: false })
  const [flow, setFlow]                 = useState<null | 'choose' | 'library' | 'form'>(null)
  const [showEmoji, setShowEmoji]       = useState(false)
  const [libSelected, setLibSelected]   = useState<Set<string>>(new Set())
  const [libItem, setLibItem]           = useState<{ e: string; t: string } | null>(null)
  const emojiRef                        = useRef<HTMLDivElement>(null)

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const emptyForm = () => ({
    title: '', emoji: '✅',
    type: 'once' as 'fixed' | 'once',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '', notes: '',
    hasTime: false,
    startTime: '08:00',
    endTime: '09:00',
    points: 10,
    daysPreset: 'everyday' as 'everyday' | 'weekdays' | 'weekends' | 'custom',
    daysCustom: [] as number[],
  })

  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) } catch {}
  }, [tasks])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const memberId = activeMember || members[0]?.id || ''
  const member   = members.find(m => m.id === memberId)
  const accent   = member?.barColor ?? '#FF6B8A'
  const myTasks  = tasks.filter(t => t.memberId === memberId)
  const fixedP   = myTasks.filter(t => t.type === 'fixed' && !t.done)
  const onceP    = myTasks.filter(t => t.type === 'once'  && !t.done)
  const doneT    = myTasks.filter(t => t.done)
  const pct      = myTasks.length ? Math.round((doneT.length / myTasks.length) * 100) : 0

  const toggle     = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove     = (id: string) => setTasks(ts => ts.filter(t => t.id !== id))
  const resetFixed = () => setTasks(ts => ts.map(t => t.memberId === memberId && t.type === 'fixed' ? { ...t, done: false } : t))
  const toggleSec  = (s: keyof typeof expanded) => setExpanded(p => ({ ...p, [s]: !p[s] }))

  function startFromLib(item: { e: string; t: string }) {
    setLibItem(item)
    setForm(f => ({ ...f, title: item.t, emoji: item.e }))
    setFlow('form')
  }

  // Compute daysOfWeek from preset
  function getDaysOfWeek(): number[] | undefined {
    if (form.type !== 'fixed') return undefined
    if (form.daysPreset === 'everyday')  return undefined         // show every day
    if (form.daysPreset === 'weekdays')  return [0,1,2,3,4]      // Mon–Fri
    if (form.daysPreset === 'weekends')  return [5,6]             // Sat–Sun
    if (form.daysPreset === 'custom')    return form.daysCustom   // user-picked
    return undefined
  }

  // Open edit mode for a task
  function openEdit(task: Task) {
    // Determine preset from daysOfWeek
    let preset: 'everyday' | 'weekdays' | 'weekends' | 'custom' = 'everyday'
    let custom: number[] = []
    const d = task.daysOfWeek
    if (d && d.length > 0) {
      const s = [...d].sort().join(',')
      if (s === '0,1,2,3,4') preset = 'weekdays'
      else if (s === '5,6')  preset = 'weekends'
      else                   { preset = 'custom'; custom = d }
    }
    setEditingTaskId(task.id)
    setForm({
      title: task.title, emoji: task.emoji,
      type: task.type, priority: task.priority,
      dueDate: task.dueDate || '',
      notes: task.notes || '',
      hasTime: !!task.startTime,
      startTime: task.startTime || '08:00',
      endTime: task.endTime || '09:00',
      points: task.points || 10,
      daysPreset: preset,
      daysCustom: custom,
    })
    setFlow('form')
  }

  function addTask() {
    if (!form.title.trim()) return
    const daysOfWeek = getDaysOfWeek()
    const taskData = {
      memberId,
      title: form.title.trim(), emoji: form.emoji,
      done: false, type: form.type, priority: form.priority,
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
      allDay: !form.hasTime,
      startTime: form.hasTime ? form.startTime : undefined,
      endTime:   form.hasTime ? form.endTime   : undefined,
      points: form.points,
      daysOfWeek,
    }

    if (editingTaskId) {
      // EDIT existing task
      setTasks(ts => ts.map(t => t.id === editingTaskId ? { ...t, ...taskData } : t))
      setEditingTaskId(null)
    } else {
      // CREATE new task
      setTasks(ts => [...ts, { id: `t-${Date.now()}`, ...taskData }])
    }

    // Queue: if more library items selected
    if (libSelected.size > 1 && libItem) {
      const all = LIBRARY.flatMap(c => c.items)
      const remaining = [...libSelected].filter(t => t !== libItem.t)
      const next = all.find(i => remaining.includes(i.t))
      if (next) {
        setLibSelected(new Set(remaining))
        setLibItem(next)
        setForm(f => ({ ...f, title: next.t, emoji: next.e, dueDate: '', notes: '' }))
        return
      }
    }
    closeAll()
  }

  function closeAll() {
    setFlow(null); setLibSelected(new Set()); setLibItem(null); setShowEmoji(false)
    setForm(emptyForm())
    setEditingTaskId(null)
  }

  // ── RENDER ──────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ─────────────────────────── */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.50)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 16px 10px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Miembros
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {members.map(m => {
            const mt     = tasks.filter(t => t.memberId === m.id)
            const done   = mt.filter(t => t.done).length
            const p      = mt.length ? Math.round((done / mt.length) * 100) : 0
            const active = m.id === memberId

            return (
              <motion.button
                key={m.id}
                onClick={() => setActiveMember(m.id)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={AP}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  padding: '11px 12px', borderRadius: 18,
                  background: active
                    ? `linear-gradient(135deg, ${m.bgColor}ee, ${m.bgColor}bb)`
                    : 'rgba(255,255,255,0.50)',
                  backdropFilter: 'blur(12px)',
                  border: active
                    ? `1.5px solid ${m.barColor}50`
                    : '1.5px solid rgba(255,255,255,0.70)',
                  boxShadow: active
                    ? `0 4px 20px ${m.barColor}25, inset 0 1px 0 rgba(255,255,255,0.60)`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'background 200ms, box-shadow 200ms, border-color 200ms',
                }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <MemberAvatar member={m} size={36} />
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={AP}
                        style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `2.5px solid ${m.barColor}`, pointerEvents: 'none' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: active ? m.textColor : 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)' }}>
                      {m.name}
                    </p>
                    <p style={{ fontSize: 10, color: active ? m.textColor : 'var(--text-3)', opacity: 0.75, fontWeight: 600 }}>
                      {done}/{mt.length} · {p}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, borderRadius: 99, background: active ? `${m.barColor}25` : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${m.barColor}, ${m.barColor}bb)`,
                      boxShadow: active ? `0 0 8px ${m.barColor}50` : 'none',
                    }}
                  />
                </div>
              </motion.button>
            )
          })}

          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 8px', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Agrega miembros en Ajustes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          padding: '16px 24px 14px',
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.50)',
          display: 'flex', alignItems: 'center', gap: 14,
          flexShrink: 0,
        }}>
          {member && <MemberAvatar member={member} size={46} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
                {member?.name ?? 'Tasks'}
              </h1>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>
                {doneT.length}/{myTasks.length} · {pct}%
              </span>
            </div>
            {/* Progress */}
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', maxWidth: 280, position: 'relative' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{
                  height: '100%', borderRadius: 99,
                  background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                  boxShadow: `0 0 8px ${accent}50`,
                }}
              />
            </div>
          </div>

          {/* ADD TASK button */}
          <motion.button
            onClick={() => setFlow('choose')}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={AP}
            className="btn-primary"
            style={{ flexShrink: 0, fontSize: 14 }}
          >
            <Sparkles size={15} />
            Add Task
          </motion.button>
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          <AppleSection
            icon="🔄" title="Fixed Tasks" subtitle="Se repiten todos los días"
            count={fixedP.length} accent="#5856D6"
            expanded={expanded.fixed} onToggle={() => toggleSec('fixed')}
            extra={
              <motion.button whileTap={{ scale: 0.93 }} onClick={resetFixed}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#5856D6', background: 'rgba(88,86,214,0.10)', border: 'none', padding: '4px 10px', borderRadius: 99, cursor: 'pointer' }}>
                <RefreshCw size={10} /> Reiniciar
              </motion.button>
            }
          >
            {fixedP.map((task, i) => <AppleTaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i * 0.04} onEdit={openEdit} />)}
            {fixedP.length === 0 && <AppleEmptySection emoji="🔄" text="Sin tasks fijos" sub="Agrega tareas que se repiten diario" onAdd={() => setFlow('choose')} />}
          </AppleSection>

          <AppleSection
            icon="📅" title="One-time Tasks" subtitle="Tareas específicas"
            count={onceP.length} accent="#FF9500"
            expanded={expanded.once} onToggle={() => toggleSec('once')}
          >
            {onceP.map((task, i) => <AppleTaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i * 0.04} onEdit={openEdit} />)}
            {onceP.length === 0 && <AppleEmptySection emoji="📅" text="Sin tasks pendientes" sub="Agrega tareas para este miembro" onAdd={() => setFlow('choose')} />}
          </AppleSection>

          <AppleSection
            icon="✅" title="Completados" count={doneT.length}
            accent="#34C759" expanded={expanded.done} onToggle={() => toggleSec('done')} dimmed
          >
            {doneT.map((task, i) => <AppleTaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i * 0.03} dimmed onEdit={openEdit} />)}
          </AppleSection>

          {myTasks.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', paddingTop: 56 }}>
              <motion.div className="float" style={{ fontSize: 60, marginBottom: 16 }}>🎯</motion.div>
              <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                ¡{member?.name} no tiene tasks!
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>Agrega el primer task para empezar</p>
              <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={AP}
                onClick={() => setFlow('choose')} className="btn-primary" style={{ fontSize: 15 }}>
                <Plus size={18} /> Agregar primer task
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}

      {/* CHOOSE */}
      <AnimatePresence>
        {flow === 'choose' && (
          <AppleOverlay onClose={closeAll}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>➕ Nuevo Task</h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>¿Cómo quieres crearlo?</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={closeAll} className="btn-icon"><X size={17} /></motion.button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📚', label: 'Elegir de biblioteca', sub: '24 tasks listos · organizados por categoría', grad: 'linear-gradient(135deg,#5856D6,#AF52DE)', flow: 'library' as const },
                { icon: '✏️', label: 'Crear desde cero',     sub: 'Formulario completo · nombre, emoji, prioridad', grad: 'linear-gradient(135deg,#FF6B8A,#FF8E53)', flow: 'form' as const },
              ].map(opt => (
                <motion.button key={opt.flow}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={AP}
                  onClick={() => { if (opt.flow === 'form') { setForm(f => ({ ...f, title: '', emoji: '✅' })); setLibItem(null) } setFlow(opt.flow) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px',
                    borderRadius: 20, border: '1px solid rgba(255,255,255,0.50)', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(12px)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    textAlign: 'left',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <div style={{ width: 50, height: 50, borderRadius: 16, background: opt.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {opt.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 3 }}>{opt.label}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{opt.sub}</p>
                  </div>
                  <ChevronRight size={18} color="var(--text-3)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </motion.button>
              ))}
            </div>
          </AppleOverlay>
        )}
      </AnimatePresence>

      {/* LIBRARY */}
      <AnimatePresence>
        {flow === 'library' && (
          <AppleOverlay onClose={closeAll} tall>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFlow('choose')} className="btn-icon">
                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
              </motion.button>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>📚 Biblioteca</h2>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {libSelected.size > 0 ? `${libSelected.size} seleccionado${libSelected.size > 1 ? 's' : ''}` : 'Toca para seleccionar'}
                </p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={closeAll} className="btn-icon"><X size={17} /></motion.button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {LIBRARY.map(cat => (
                <div key={cat.cat} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: cat.color, marginBottom: 10, fontFamily: 'var(--font-heading)' }}>{cat.cat}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {cat.items.map(item => {
                      const sel = libSelected.has(item.t)
                      return (
                        <motion.button key={item.t}
                          whileTap={{ scale: 0.95 }}
                          transition={AP}
                          onClick={() => setLibSelected(s => { const n = new Set(s); sel ? n.delete(item.t) : n.add(item.t); return n })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 14px', borderRadius: 16,
                            border: `2px solid ${sel ? cat.color + '50' : 'rgba(255,255,255,0.60)'}`,
                            background: sel ? `${cat.color}10` : 'rgba(255,255,255,0.60)',
                            backdropFilter: 'blur(8px)',
                            cursor: 'pointer', textAlign: 'left',
                            boxShadow: sel ? `0 2px 12px ${cat.color}20` : '0 1px 4px rgba(0,0,0,0.05)',
                            transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                          }}
                        >
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{item.e}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: sel ? cat.color : 'var(--text-1)', lineHeight: 1.3, flex: 1 }}>{item.t}</span>
                          <AnimatePresence>
                            {sel && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={AP}
                                style={{ width: 20, height: 20, borderRadius: '50%', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Check size={12} color="#fff" strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {libSelected.size > 0 && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
                  style={{ paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 8 }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={AP}
                    onClick={() => {
                      const all = LIBRARY.flatMap(c => c.items)
                      const first = all.find(i => libSelected.has(i.t))
                      if (first) { setLibItem(first); setForm(f => ({ ...f, title: first.t, emoji: first.e })); setFlow('form') }
                    }}
                    className="btn-primary"
                    style={{ width: '100%', padding: '15px', fontSize: 16, borderRadius: 16 }}
                  >
                    <Check size={18} strokeWidth={3} />
                    Usar seleccionados ({libSelected.size})
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </AppleOverlay>
        )}
      </AnimatePresence>

      {/* FORM */}
      <AnimatePresence>
        {flow === 'form' && (
          <AppleOverlay onClose={closeAll}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              {libItem && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setLibItem(null); setFlow('library') }} className="btn-icon">
                  <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                </motion.button>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                  {editingTaskId ? '✏️ Editar Task' : libItem ? `Configurar task` : '✏️ Nuevo Task'}
                </h2>
                {libSelected.size > 1 && libItem && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{libSelected.size} seleccionados · uno a la vez</p>
                )}
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={closeAll} className="btn-icon"><X size={17} /></motion.button>
            </div>

            {/* Title */}
            {libItem ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, background: 'rgba(88,86,214,0.08)', border: '1.5px solid rgba(88,86,214,0.20)', marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{libItem.e}</span>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>{libItem.t}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                <div ref={emojiRef} style={{ position: 'relative' }}>
                  <motion.button whileTap={{ scale: 0.88 }} transition={AP}
                    onClick={() => setShowEmoji(v => !v)}
                    style={{ width: 56, height: 56, borderRadius: 16, border: `2px solid ${showEmoji ? accent : 'rgba(0,0,0,0.08)'}`, background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(8px)', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s', boxShadow: showEmoji ? `0 0 0 4px ${accent}18` : 'none' }}>
                    {form.emoji}
                  </motion.button>
                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ position: 'absolute', top: '110%', left: 0, zIndex: 99 }}>
                        <EmojiPicker value={form.emoji} onChange={e => { setForm(f => ({ ...f, emoji: e })); setShowEmoji(false) }} onClose={() => setShowEmoji(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="¿Qué necesita hacer?" autoFocus
                  className="input-apple" style={{ flex: 1 }}
                  onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 4px ${accent}15` }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            )}

            {/* Type — Apple Segmented Control */}
            <FormLabel>Tipo</FormLabel>
            <AppleSegmented
              options={[{ v: 'fixed', icon: <Repeat2 size={13} strokeWidth={2.5} />, label: '🔄 Fixed' }, { v: 'once', icon: <CalendarDays size={13} strokeWidth={2.5} />, label: '📅 One-time' }]}
              value={form.type}
              onChange={v => setForm(f => ({ ...f, type: v as 'fixed' | 'once' }))}
              layoutId="type-seg"
              style={{ marginBottom: 14 }}
            />

            {/* ── DAYS OF WEEK (only for Fixed tasks) ── */}
            {form.type === 'fixed' && (
              <>
                <FormLabel>¿Qué días se repite?</FormLabel>
                <div style={{ marginBottom:14 }}>
                  {/* Preset pills */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    {[
                      { v:'everyday',  l:'Todos los días', e:'📅' },
                      { v:'weekdays',  l:'Lun–Vie (escuela)', e:'🎒' },
                      { v:'weekends',  l:'Sáb–Dom', e:'🏖️' },
                      { v:'custom',    l:'Personalizado', e:'⚙️' },
                    ].map(opt => (
                      <motion.button key={opt.v} whileTap={{ scale:0.93 }}
                        onClick={() => setForm(f => ({ ...f, daysPreset: opt.v as any }))}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:99, border:`2px solid ${form.daysPreset===opt.v ? accent : 'rgba(0,0,0,0.08)'}`, background:form.daysPreset===opt.v ? `${accent}12` : 'rgba(255,255,255,0.80)', fontSize:13, fontWeight:700, color:form.daysPreset===opt.v ? accent : 'var(--text-2)', cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.15s' }}>
                        <span>{opt.e}</span>{opt.l}
                      </motion.button>
                    ))}
                  </div>

                  {/* Custom day checkboxes */}
                  {form.daysPreset === 'custom' && (
                    <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                      style={{ display:'flex', gap:8, flexWrap:'wrap', padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.80)', border:`1.5px solid ${accent}40` }}>
                      {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((day, i) => {
                        const selected = form.daysCustom.includes(i)
                        return (
                          <motion.button key={day} whileTap={{ scale:0.85 }}
                            onClick={() => setForm(f => ({
                              ...f,
                              daysCustom: selected
                                ? f.daysCustom.filter(d => d !== i)
                                : [...f.daysCustom, i].sort()
                            }))}
                            style={{ width:44, height:44, borderRadius:'50%', border:`2px solid ${selected ? accent : 'rgba(0,0,0,0.10)'}`, background:selected ? accent : 'rgba(255,255,255,0.90)', fontSize:11, fontWeight:800, color:selected ? '#fff' : 'var(--text-3)', cursor:'pointer', fontFamily:'var(--font-heading)', boxShadow:selected ? `0 2px 8px ${accent}40` : 'none', transition:'all 0.15s' }}>
                            {day}
                          </motion.button>
                        )
                      })}
                      {form.daysCustom.length === 0 && (
                        <p style={{ fontSize:12, color:'var(--text-3)', alignSelf:'center', padding:'0 4px' }}>
                          Selecciona al menos un día
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Summary */}
                  <p style={{ fontSize:11, color:'var(--text-3)', marginTop:8 }}>
                    {form.daysPreset === 'everyday'  && '📅 Aparecerá todos los días de la semana'}
                    {form.daysPreset === 'weekdays'  && '🎒 Solo Lunes a Viernes — no aparece el fin de semana'}
                    {form.daysPreset === 'weekends'  && '🏖️ Solo Sábado y Domingo'}
                    {form.daysPreset === 'custom' && form.daysCustom.length > 0 &&
                      `⚙️ Solo: ${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].filter((_,i) => form.daysCustom.includes(i)).join(', ')}`}
                  </p>
                </div>
              </>
            )}

            {/* Priority — Apple Segmented */}
            <FormLabel>Prioridad</FormLabel>
            <AppleSegmented
              options={[
                { v: 'high',   label: '🔴 Urgente' },
                { v: 'medium', label: '🟡 Media'   },
                { v: 'low',    label: '🟢 Baja'    },
              ]}
              value={form.priority}
              onChange={v => setForm(f => ({ ...f, priority: v as 'high'|'medium'|'low' }))}
              layoutId="pri-seg"
              style={{ marginBottom: 14 }}
            />

            {/* Date */}
            {form.type === 'once' && (
              <>
                <FormLabel>Fecha límite</FormLabel>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(0,0,0,0.08)', marginBottom: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}>
                  <CalendarDays size={16} style={{ color: accent }} />
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text-1)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }} />
                </label>
              </>
            )}

            {/* ── TIME PICKER ── */}
            <FormLabel>Hora</FormLabel>
            <div style={{ marginBottom: 14 }}>
              {/* Toggle hasTime */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderRadius:12, background:'rgba(255,255,255,0.80)', border:'1.5px solid rgba(0,0,0,0.08)', marginBottom: form.hasTime ? 10 : 0, cursor:'pointer' }}
                onClick={() => setForm(f => ({ ...f, hasTime: !f.hasTime }))}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:18 }}>🕐</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--text-1)', fontFamily:'var(--font-body)' }}>
                      {form.hasTime ? `${form.startTime} → ${form.endTime}` : 'Sin hora específica'}
                    </p>
                    <p style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>
                      {form.hasTime ? 'Aparece en el horario del calendario' : 'Toca para elegir una hora'}
                    </p>
                  </div>
                </div>
                {/* iOS toggle */}
                <motion.div
                  animate={{ backgroundColor: form.hasTime ? accent : '#E5E5EA' }}
                  style={{ width:44, height:26, borderRadius:100, position:'relative', border:'none', flexShrink:0 }}
                >
                  <motion.div
                    animate={{ x: form.hasTime ? 20 : 2 }}
                    transition={{ type:'spring', stiffness:500, damping:30 }}
                    style={{ position:'absolute', top:2, width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,0.22)' }}
                  />
                </motion.div>
              </div>

              {/* Time inputs — show when hasTime */}
              <AnimatePresence>
                {form.hasTime && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    style={{ overflow:'hidden' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>
                          🟢 Inicio
                        </label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                          style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:`1.5px solid ${accent}40`, background:'rgba(255,255,255,0.90)', fontSize:16, fontWeight:700, color:'var(--text-1)', outline:'none', fontFamily:'var(--font-body)', cursor:'pointer' }}
                          onFocus={e => e.currentTarget.style.borderColor = accent}
                          onBlur={e => e.currentTarget.style.borderColor = `${accent}40`}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>
                          🔴 Fin
                        </label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                          style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:`1.5px solid ${accent}40`, background:'rgba(255,255,255,0.90)', fontSize:16, fontWeight:700, color:'var(--text-1)', outline:'none', fontFamily:'var(--font-body)', cursor:'pointer' }}
                          onFocus={e => e.currentTarget.style.borderColor = accent}
                          onBlur={e => e.currentTarget.style.borderColor = `${accent}40`}
                        />
                      </div>
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-3)', marginTop:8, textAlign:'center' }}>
                      El task aparecerá en el calendario a las {form.startTime} 📅
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── POINTS ── */}
            <FormLabel>Puntos al completar</FormLabel>
            <div style={{ padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.80)', border:'1.5px solid rgba(0,0,0,0.08)', marginBottom:14 }}>
              {/* Points display */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:28 }}>⭐</span>
                  <div>
                    <p style={{ fontSize:22, fontWeight:900, color: accent, fontFamily:'var(--font-heading)', lineHeight:1 }}>
                      {form.points}
                    </p>
                    <p style={{ fontSize:11, color:'var(--text-3)' }}>puntos</p>
                  </div>
                </div>
                {/* Quick-pick buttons */}
                <div style={{ display:'flex', gap:6 }}>
                  {[5,10,20,50].map(v => (
                    <motion.button key={v} whileTap={{ scale:0.88 }}
                      onClick={() => setForm(f => ({ ...f, points:v }))}
                      style={{ width:38, height:30, borderRadius:99, border:`1.5px solid ${form.points===v ? accent : 'rgba(0,0,0,0.10)'}`, background:form.points===v ? `${accent}18` : 'transparent', fontSize:12, fontWeight:700, color:form.points===v ? accent : 'var(--text-3)', cursor:'pointer', fontFamily:'var(--font-body)' }}>
                      {v}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Slider */}
              <input type="range" min={1} max={100} step={1} value={form.points}
                onChange={e => setForm(f => ({ ...f, points:Number(e.target.value) }))}
                style={{ width:'100%', accentColor: accent, height:4, cursor:'pointer' }}
              />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:10, color:'var(--text-4)' }}>1</span>
                <span style={{ fontSize:10, color:'var(--text-4)' }}>100</span>
              </div>
            </div>

            {/* Notes */}
            <FormLabel>Nota (opcional)</FormLabel>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Agregar una nota..." className="input-apple"
              style={{ marginBottom: 20 }}
              onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 4px ${accent}15` }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileHover={{ scale: form.title.trim() ? 1.02 : 1, y: form.title.trim() ? -2 : 0 }}
                whileTap={{ scale: 0.97 }}
                transition={AP}
                onClick={addTask}
                disabled={!form.title.trim()}
                className="btn-primary"
                style={{ flex: 1, padding: '14px', fontSize: 15, borderRadius: 16 }}
              >
                <Sparkles size={16} />
                {editingTaskId ? '💾 Guardar cambios' : libSelected.size > 1 ? `Agregar y seguir (${libSelected.size - 1} más)` : '✨ Agregar Task'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={closeAll}
                style={{ padding: '14px 18px', borderRadius: 16, border: '1.5px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(8px)', fontSize: 14, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.70)')}
              >
                Cancelar
              </motion.button>
            </div>
          </AppleOverlay>
        )}
      </AnimatePresence>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// STABLE SUB-COMPONENTS (defined outside — no remount bug)
// ══════════════════════════════════════════════════════════

function FormLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>{children}</p>
}

// Apple Segmented Control with layoutId sliding background
function AppleSegmented({
  options, value, onChange, layoutId, style
}: {
  options: { v: string; label: string; icon?: React.ReactNode }[]
  value: string
  onChange: (v: string) => void
  layoutId: string
  style?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: 12, padding: 3, position: 'relative', ...style }}>
      <LayoutGroup id={layoutId}>
        {options.map(opt => (
          <button key={opt.v}
            onClick={() => onChange(opt.v)}
            style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: value === opt.v ? 'var(--text-1)' : 'var(--text-3)', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
          >
            {value === opt.v && (
              <motion.div
                layoutId={`${layoutId}-bg`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 10, zIndex: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.05)' }}
              />
            )}
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </LayoutGroup>
    </div>
  )
}

// Modal overlay + sheet
function AppleOverlay({ children, onClose, tall }: { children: React.ReactNode; onClose: () => void; tall?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px) saturate(150%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        style={{
          width: '100%', maxWidth: 520,
          maxHeight: '92vh',           // always enough height
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(40px) saturate(200%)',
          borderRadius: '28px 28px 0 0',
          padding: '0',                // padding moved inside for correct scroll
          boxShadow: '0 -2px 60px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.60)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle — fixed */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.12)', margin: '12px auto 0', flexShrink: 0 }} />
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 32px',
          // iOS momentum scroll
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Section
function AppleSection({ icon, title, subtitle, count, accent, expanded, onToggle, extra, dimmed, children }: {
  icon: string; title: string; subtitle?: string; count: number
  accent: string; expanded: boolean; onToggle: () => void
  extra?: React.ReactNode; dimmed?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left', background: dimmed ? 'transparent' : `${accent}0A`, borderLeft: dimmed ? 'none' : `4px solid ${accent}80`, marginBottom: expanded ? 10 : 0, transition: 'background 0.15s' }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: dimmed ? 'var(--text-3)' : accent, fontFamily: 'var(--font-heading)' }}>{title}</span>
        {subtitle && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>· {subtitle}</span>}
        {count > 0 && (
          <span style={{ minWidth: 24, height: 24, borderRadius: 99, background: dimmed ? 'rgba(0,0,0,0.06)' : `${accent}18`, color: dimmed ? 'var(--text-3)' : accent, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontFamily: 'var(--font-heading)' }}>
            {count}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {extra && <div onClick={e => e.stopPropagation()}>{extra}</div>}
        {expanded ? <ChevronDown size={15} color="var(--text-3)" /> : <ChevronRight size={15} color="var(--text-3)" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Empty state
function AppleEmptySection({ emoji, text, sub, onAdd }: { emoji: string; text: string; sub: string; onAdd: () => void }) {
  return (
    <div style={{ padding: '22px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(12px)', border: '1.5px dashed rgba(0,0,0,0.10)', textAlign: 'center', marginBottom: 8 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-2)', marginBottom: 3, fontFamily: 'var(--font-heading)' }}>{text}</p>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>{sub}</p>
      <motion.button whileTap={{ scale: 0.95 }} transition={AP} onClick={onAdd}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 99, border: 'none', background: 'rgba(0,0,0,0.07)', color: 'var(--text-2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        <Plus size={13} /> Agregar task
      </motion.button>
    </div>
  )
}

// Day names helper
const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function daysLabel(daysOfWeek?: number[]): string | null {
  if (!daysOfWeek || daysOfWeek.length === 0) return null
  const s = [...daysOfWeek].sort().join(',')
  if (s === '0,1,2,3,4') return '🎒 Lun–Vie'
  if (s === '5,6')        return '🏖️ Sáb–Dom'
  return '📅 ' + daysOfWeek.sort().map(d => DAY_NAMES[d]).join(' · ')
}

// Task Card
function AppleTaskCard({ task, member, onToggle, onRemove, onEdit, delay = 0, dimmed }: {
  task: Task
  member?: { barColor: string; bgColor: string; textColor: string } | null
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onEdit: (task: Task) => void
  delay?: number; dimmed?: boolean
}) {
  const p   = PRIORITY[task.priority]
  const acc = member?.barColor ?? '#FF6B8A'
  const [hov, setHov] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.50 : 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ ...AP, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ y: -1 }}
      onClick={() => !task.done && onEdit(task)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', borderRadius: 18, marginBottom: 8,
        background: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(20px)',
        border: `1.5px solid ${hov && !task.done ? acc + '45' : 'rgba(255,255,255,0.60)'}`,
        boxShadow: hov && !task.done
          ? `0 8px 24px rgba(0,0,0,0.09), 0 0 0 1px ${acc}20`
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: task.done ? 'default' : 'pointer',
      }}
    >
      {/* Checkbox */}
      <motion.button
        whileTap={{ scale: 0.75 }}
        transition={AP}
        onClick={e => { e.stopPropagation(); onToggle(task.id) }}
        style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          border: `2.5px solid ${task.done ? acc : 'rgba(0,0,0,0.15)'}`,
          background: task.done ? `linear-gradient(135deg, ${acc}, ${acc}bb)` : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: task.done ? `0 3px 10px ${acc}40` : 'none',
          transition: 'all 0.2s',
        }}
      >
        <AnimatePresence>
          {task.done && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={AP}>
              <Check size={13} color="#fff" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Emoji */}
      <span style={{ fontSize: 22, flexShrink: 0, filter: task.done ? 'grayscale(0.6) opacity(0.55)' : 'none', transition: 'filter 0.2s' }}>
        {task.emoji}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: task.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: p.color, background: p.bg, border: `1px solid ${p.border}`, padding: '2px 8px', borderRadius: 99 }}>
            {p.emoji} {p.label}
          </span>
          {task.type === 'fixed' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-3)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 99 }}>
              <Repeat2 size={9} /> Diario
            </span>
          )}
          {/* Points badge */}
          {task.points > 0 && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:800, color:'#D97706', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', padding:'2px 8px', borderRadius:99 }}>
              ⭐ {task.points}
            </span>
          )}
          {/* Show time if task has one */}
          {task.startTime && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: acc, background: `${acc}15`, padding: '2px 8px', borderRadius: 99 }}>
              🕐 {task.startTime}{task.endTime ? ` → ${task.endTime}` : ''}
            </span>
          )}
          {!task.startTime && task.dueDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
              <CalendarDays size={10} /> {task.dueDate}
            </span>
          )}
          {/* Days of week label */}
          {task.type === 'fixed' && daysLabel(task.daysOfWeek) && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700, color:'var(--text-3)', background:'rgba(0,0,0,0.05)', padding:'2px 8px', borderRadius:99 }}>
              {daysLabel(task.daysOfWeek)}
            </span>
          )}
          {task.notes && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              · {task.notes}
            </span>
          )}
        </div>
        {/* Edit hint on hover */}
        {hov && !task.done && (
          <p style={{ fontSize:10, color: acc, fontWeight:600, marginTop:2 }}>Toca para editar ✏️</p>
        )}
      </div>

      {/* Delete on hover */}
      <AnimatePresence>
        {hov && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={e => { e.stopPropagation(); onRemove(task.id) }}
            style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: 'rgba(255,59,48,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF3B30', flexShrink: 0 }}
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
