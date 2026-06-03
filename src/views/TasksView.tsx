import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Check, RefreshCw, ChevronDown, ChevronRight,
  Repeat2, CalendarDays, X, Sparkles, BookOpen, PenLine,
  Sunrise, GraduationCap, Home, Moon, Dumbbell
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
}

const STORAGE_KEY = 'fq_tasks_v2'
function loadTasks(): Task[] {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : [] } catch { return [] }
}

// ─── Priority config ──────────────────────────────────────
const PRIORITY = {
  high:   { label: 'High',   emoji: '🔴', color: '#EF4444', grad: 'linear-gradient(135deg,#EF4444,#DC2626)', glow: 'rgba(239,68,68,0.35)',   bg: 'rgba(239,68,68,0.08)'  },
  medium: { label: 'Medium', emoji: '🟡', color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#D97706)', glow: 'rgba(245,158,11,0.35)',  bg: 'rgba(245,158,11,0.08)' },
  low:    { label: 'Low',    emoji: '🟢', color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)', glow: 'rgba(16,185,129,0.35)',  bg: 'rgba(16,185,129,0.08)' },
}

// ─── Task Library ─────────────────────────────────────────
const LIBRARY = [
  { cat:'🌅 Mañana',        color:'#F59E0B', items:[
    {e:'🪥',t:'Lavarse los dientes'},{e:'🚿',t:'Bañarse / ducharse'},
    {e:'👕',t:'Ponerse la ropa'},{e:'🍳',t:'Desayunar'},
    {e:'🛏️',t:'Hacer la cama'},{e:'🎒',t:'Preparar la mochila'},
  ]},
  { cat:'📚 Escuela & Tarde', color:'#6366F1', items:[
    {e:'📖',t:'Hacer la tarea'},{e:'📚',t:'Leer 20 minutos'},
    {e:'🎵',t:'Practicar instrumento'},{e:'✏️',t:'Repasar lecciones'},
  ]},
  { cat:'🏠 Hogar',          color:'#10B981', items:[
    {e:'🍽️',t:'Poner la mesa'},{e:'🧹',t:'Barrer / trapear'},
    {e:'🗑️',t:'Sacar la basura'},{e:'🐾',t:'Darle de comer a la mascota'},
    {e:'🧺',t:'Recoger la ropa'},{e:'🫧',t:'Lavar los platos'},
  ]},
  { cat:'🌙 Noche',          color:'#8B5CF6', items:[
    {e:'🪥',t:'Lavarse los dientes (noche)'},{e:'😴',t:'Preparar ropa para mañana'},
    {e:'📵',t:'Sin pantallas 30 min antes'},{e:'🌙',t:'Pijama y a la cama'},
  ]},
  { cat:'💪 Salud & Personal',color:'#EF4444', items:[
    {e:'💧',t:'Beber 8 vasos de agua'},{e:'🏃',t:'Hacer ejercicio'},
    {e:'🧘',t:'Momento de calma'},{e:'🎨',t:'Practicar un hobby'},
  ]},
]

const sp = { type: 'spring' as const, stiffness: 400, damping: 28 }

// ─── MAIN COMPONENT ───────────────────────────────────────
export function TasksView() {
  const { members } = useMembersStore()
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [activeMember, setActiveMember] = useState('')
  const [expanded, setExpanded] = useState({ fixed: true, once: true, done: false })
  const emojiRef = useRef<HTMLDivElement>(null)

  // Flow: null → 'choose' → 'library' | 'form'
  const [flow, setFlow] = useState<null | 'choose' | 'library' | 'form'>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [libSelected, setLibSelected] = useState<Set<string>>(new Set())
  const [libActiveItem, setLibActiveItem] = useState<{ e: string; t: string } | null>(null)

  const [form, setForm] = useState({
    title: '', emoji: '✅',
    type: 'once' as 'fixed' | 'once',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '', notes: '',
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) } catch {}
  }, [tasks])

  useEffect(() => {
    function h(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const memberId = activeMember || members[0]?.id || ''
  const member   = members.find(m => m.id === memberId)
  const accent   = member?.barColor ?? '#007AFF'
  const myTasks  = tasks.filter(t => t.memberId === memberId)
  const fixedP   = myTasks.filter(t => t.type === 'fixed' && !t.done)
  const onceP    = myTasks.filter(t => t.type === 'once'  && !t.done)
  const doneT    = myTasks.filter(t => t.done)
  const totalDone = doneT.length
  const totalT    = myTasks.length
  const pct       = totalT ? Math.round((totalDone / totalT) * 100) : 0

  const toggle      = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove      = (id: string) => setTasks(ts => ts.filter(t => t.id !== id))
  const resetFixed  = () => setTasks(ts => ts.map(t => t.memberId === memberId && t.type === 'fixed' ? { ...t, done: false } : t))
  const toggleSec   = (s: keyof typeof expanded) => setExpanded(p => ({ ...p, [s]: !p[s] }))

  function openAdd() { setFlow('choose') }

  function useLibSelected() {
    if (libSelected.size === 0) return
    // Pick first selected to pre-fill form (queue handled by each submit)
    const allItems = LIBRARY.flatMap(c => c.items)
    const first = allItems.find(i => libSelected.has(i.t))
    if (first) {
      setForm(f => ({ ...f, title: first.t, emoji: first.e }))
      setLibActiveItem(first)
    }
    setFlow('form')
  }

  function addTask() {
    if (!form.title.trim()) return
    setTasks(ts => [...ts, {
      id: `t-${Date.now()}`, memberId,
      title: form.title.trim(), emoji: form.emoji,
      done: false, type: form.type, priority: form.priority,
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    }])

    // If more library items queued, pre-fill next
    if (libSelected.size > 1 && libActiveItem) {
      const allItems = LIBRARY.flatMap(c => c.items)
      const remaining = [...libSelected].filter(t => t !== libActiveItem.t)
      const next = allItems.find(i => remaining.includes(i.t))
      if (next) {
        setLibSelected(new Set(remaining))
        setLibActiveItem(next)
        setForm(f => ({ ...f, title: next.t, emoji: next.e, dueDate: '', notes: '' }))
        return
      }
    }

    // Done
    setLibSelected(new Set())
    setLibActiveItem(null)
    setFlow(null)
    setForm({ title: '', emoji: '✅', type: 'once', priority: 'medium', dueDate: '', notes: '' })
  }

  function closeAll() {
    setFlow(null)
    setLibSelected(new Set())
    setLibActiveItem(null)
    setShowEmojiPicker(false)
    setForm({ title: '', emoji: '✅', type: 'once', priority: 'medium', dueDate: '', notes: '' })
  }

  // ── STYLES ──
  const S = {
    sidebar: {
      width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column' as const, flexShrink: 0,
    },
    right: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' as const },
    header: {
      padding: '18px 24px 14px', background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 14,
    },
  }

  return (
    <div style={{ display:'flex', height:'100%', background:'var(--bg)', overflow:'hidden', fontFamily:'var(--font-body)' }}>

      {/* ── SIDEBAR ── */}
      <div style={S.sidebar}>
        <div style={{ padding:'20px 14px 10px' }}>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Miembros
          </p>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0 10px 16px', display:'flex', flexDirection:'column', gap:6 }}>
          {members.map(m => {
            const mt   = tasks.filter(t => t.memberId === m.id)
            const done = mt.filter(t => t.done).length
            const p    = mt.length ? Math.round((done / mt.length) * 100) : 0
            const active = m.id === memberId
            return (
              <motion.button key={m.id} onClick={() => setActiveMember(m.id)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type:'spring', stiffness:400, damping:25 }}
                style={{
                  width:'100%', textAlign:'left', cursor:'pointer',
                  padding:'12px 12px',
                  borderRadius:16,
                  background: active
                    ? `linear-gradient(135deg, ${m.bgColor}, ${m.bgColor}dd)`
                    : 'rgba(0,0,0,0.02)',
                  boxShadow: active
                    ? `0 4px 20px ${m.barColor}30, inset 0 1px 0 rgba(255,255,255,0.7)`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  border: active ? `1.5px solid ${m.barColor}50` : '1.5px solid transparent',
                  transition: 'background 200ms, box-shadow 200ms',
                }}
              >
                {/* Avatar + name row */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <MemberAvatar member={m} size={36} />
                    {active && (
                      <motion.div
                        initial={{ scale:0.6, opacity:0 }}
                        animate={{ scale:1, opacity:1 }}
                        style={{
                          position:'absolute', inset:-3,
                          borderRadius:'50%',
                          border:`2.5px solid ${m.barColor}`,
                          pointerEvents:'none',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:800, color: active ? m.textColor : 'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'var(--font-heading)' }}>
                      {m.name}
                    </p>
                    <p style={{ fontSize:10, color: active ? m.textColor : 'var(--text-3)', opacity:0.8, fontWeight:600 }}>
                      {m.role === 'child' ? '👦 Niño/a' : '👨 Adulto'}
                    </p>
                  </div>
                  {/* Progress circle */}
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:15, fontWeight:800, color: active ? m.textColor : 'var(--text-1)', lineHeight:1, fontFamily:'var(--font-heading)' }}>
                      {p}%
                    </p>
                    <p style={{ fontSize:10, color:'var(--text-3)', fontWeight:600 }}>{done}/{mt.length}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height:4, borderRadius:99, background: active ? `${m.barColor}25` : 'rgba(0,0,0,0.07)', overflow:'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width:`${p}%` }}
                    transition={{ duration:0.8, ease:'easeOut', delay:0.1 }}
                    style={{
                      height:'100%', borderRadius:99,
                      background: `linear-gradient(90deg, ${m.barColor}, ${m.barColor}cc)`,
                      boxShadow: active ? `0 0 8px ${m.barColor}60` : 'none',
                    }}
                  />
                </div>
              </motion.button>
            )
          })}
          {members.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 8px', color:'var(--text-3)' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>👥</div>
              <p style={{ fontSize:12, fontWeight:600 }}>Agrega miembros en Ajustes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={S.right}>

        {/* Header */}
        <div style={S.header}>
          {member && <MemberAvatar member={member} size={46} />}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
              <h1 style={{ fontSize:20, fontWeight:900, color:'var(--text-1)', fontFamily:'var(--font-heading)' }}>
                {member?.name ?? 'Tasks'}
              </h1>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text-3)' }}>
                {totalDone}/{totalT} completados · {pct}%
              </span>
            </div>
            {/* Gradient progress bar */}
            <div style={{ height:6, borderRadius:99, background:'rgba(0,0,0,0.06)', overflow:'hidden', maxWidth:320, position:'relative' }}>
              <motion.div
                animate={{ width:`${pct}%` }}
                transition={{ type:'spring', stiffness:100, damping:20 }}
                style={{
                  height:'100%', borderRadius:99,
                  background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                  boxShadow: `0 0 10px ${accent}50`,
                }}
              />
            </div>
          </div>

          {/* ADD TASK BUTTON — premium */}
          <motion.button
            onClick={openAdd}
            whileHover={{ y: -2, boxShadow:`0 8px 24px ${accent}50` }}
            whileTap={{ y: 1, scale:0.97 }}
            style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'11px 22px',
              background:`linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color:'#fff',
              border:'none',
              borderRadius:14,
              fontSize:14, fontWeight:800,
              cursor:'pointer',
              boxShadow:`0 4px 16px ${accent}35, inset 0 1px 0 rgba(255,255,255,0.25)`,
              fontFamily:'var(--font-heading)',
              transition:'box-shadow 0.2s ease',
              flexShrink:0,
            }}
          >
            <Sparkles size={16} />
            Add Task
          </motion.button>
        </div>

        {/* Task list */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

          {/* FIXED TASKS section */}
          <PremiumSection
            icon="🔄" title="Fixed Tasks" subtitle="Se repiten todos los días"
            count={fixedP.length} accent="#6366F1"
            expanded={expanded.fixed} onToggle={() => toggleSec('fixed')}
            extra={
              <button onClick={resetFixed}
                style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:'#6366F1', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', padding:'4px 10px', borderRadius:99, cursor:'pointer' }}>
                <RefreshCw size={10} /> Reiniciar
              </button>
            }
          >
            {fixedP.map((task, i) => <TaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i*0.04} onAddClick={openAdd} />)}
            {fixedP.length === 0 && <PremiumEmpty emoji="🔄" text="Sin tasks fijos" sub="Los tasks diarios aparecen aquí" onAdd={openAdd} />}
          </PremiumSection>

          {/* ONE-TIME TASKS section */}
          <PremiumSection
            icon="📅" title="One-time Tasks" subtitle="Tareas específicas"
            count={onceP.length} accent="#F59E0B"
            expanded={expanded.once} onToggle={() => toggleSec('once')}
          >
            {onceP.map((task, i) => <TaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i*0.04} onAddClick={openAdd} />)}
            {onceP.length === 0 && <PremiumEmpty emoji="📅" text="Sin tasks pendientes" sub="Agrega tareas para este miembro" onAdd={openAdd} />}
          </PremiumSection>

          {/* DONE section */}
          <PremiumSection
            icon="✅" title="Completados" count={doneT.length}
            accent="#10B981" expanded={expanded.done} onToggle={() => toggleSec('done')} dimmed
          >
            {doneT.map((task, i) => <TaskCard key={task.id} task={task} member={member} onToggle={toggle} onRemove={remove} delay={i*0.03} dimmed onAddClick={openAdd} />)}
          </PremiumSection>

          {/* Full empty state */}
          {myTasks.length === 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              style={{ textAlign:'center', paddingTop:48 }}>
              <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}
                style={{ fontSize:60, marginBottom:16 }}>🎯</motion.div>
              <p style={{ fontSize:22, fontWeight:900, color:'var(--text-1)', marginBottom:8, fontFamily:'var(--font-heading)' }}>
                ¡{member?.name} no tiene tasks aún!
              </p>
              <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:28 }}>
                Agrega el primer task para empezar a trackear el progreso
              </p>
              <motion.button whileTap={{ scale:0.96 }} onClick={openAdd}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:14, border:'none', background:`linear-gradient(135deg, ${accent}, ${accent}cc)`, color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', boxShadow:`0 4px 20px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.25)`, fontFamily:'var(--font-heading)' }}>
                <Plus size={18} /> Agregar primer task
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FLOW MODALS
      ══════════════════════════════════════════════════════ */}

      {/* 1. CHOOSE modal */}
      <AnimatePresence>
        {flow === 'choose' && (
          <ModalOverlay onClose={closeAll}>
            <ModalSheet>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:900, fontFamily:'var(--font-heading)', color:'var(--text-1)' }}>➕ Nuevo Task</h2>
                  <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>¿Cómo quieres crearlo?</p>
                </div>
                <CloseBtn onClick={closeAll} />
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:20 }}>
                {/* Opción A — biblioteca */}
                <motion.button
                  whileHover={{ scale:1.02, y:-2 }}
                  whileTap={{ scale:0.97 }}
                  onClick={() => setFlow('library')}
                  style={{
                    display:'flex', alignItems:'center', gap:16,
                    padding:'20px 20px', borderRadius:20, border:'2px solid rgba(99,102,241,0.2)',
                    background:'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
                    cursor:'pointer', textAlign:'left',
                    boxShadow:'0 2px 12px rgba(99,102,241,0.1)',
                    transition:'all 0.2s ease',
                  }}
                >
                  <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0, boxShadow:'0 4px 14px rgba(99,102,241,0.4)' }}>
                    📚
                  </div>
                  <div>
                    <p style={{ fontSize:16, fontWeight:900, color:'var(--text-1)', fontFamily:'var(--font-heading)', marginBottom:4 }}>
                      Elegir de biblioteca
                    </p>
                    <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.4 }}>
                      24 tasks predeterminados listos para usar · organizado por categorías
                    </p>
                  </div>
                  <ChevronRight size={20} color="#6366F1" style={{ marginLeft:'auto', flexShrink:0 }} />
                </motion.button>

                {/* Opción B — desde cero */}
                <motion.button
                  whileHover={{ scale:1.02, y:-2 }}
                  whileTap={{ scale:0.97 }}
                  onClick={() => { setForm(f => ({ ...f, title:'', emoji:'✅' })); setFlow('form') }}
                  style={{
                    display:'flex', alignItems:'center', gap:16,
                    padding:'20px 20px', borderRadius:20, border:'2px solid rgba(0,0,0,0.07)',
                    background:'rgba(0,0,0,0.02)',
                    cursor:'pointer', textAlign:'left',
                    transition:'all 0.2s ease',
                  }}
                >
                  <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#F59E0B,#EF4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0, boxShadow:'0 4px 14px rgba(245,158,11,0.35)' }}>
                    ✏️
                  </div>
                  <div>
                    <p style={{ fontSize:16, fontWeight:900, color:'var(--text-1)', fontFamily:'var(--font-heading)', marginBottom:4 }}>
                      Crear desde cero
                    </p>
                    <p style={{ fontSize:13, color:'var(--text-3)' }}>
                      Formulario completo · nombre, emoji, prioridad, fecha
                    </p>
                  </div>
                  <ChevronRight size={20} color="var(--text-3)" style={{ marginLeft:'auto', flexShrink:0 }} />
                </motion.button>
              </div>
            </ModalSheet>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* 2. LIBRARY modal */}
      <AnimatePresence>
        {flow === 'library' && (
          <ModalOverlay onClose={closeAll}>
            <ModalSheet tall>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <button onClick={() => setFlow('choose')}
                  style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight size={16} style={{ transform:'rotate(180deg)' }} color="var(--text-2)" />
                </button>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:20, fontWeight:900, fontFamily:'var(--font-heading)', color:'var(--text-1)' }}>📚 Biblioteca</h2>
                  <p style={{ fontSize:12, color:'var(--text-3)' }}>
                    {libSelected.size > 0 ? `${libSelected.size} seleccionado${libSelected.size>1?'s':''}` : 'Toca para seleccionar'}
                  </p>
                </div>
                <CloseBtn onClick={closeAll} />
              </div>

              <div style={{ flex:1, overflowY:'auto', minHeight:0 }}>
                {LIBRARY.map(cat => (
                  <div key={cat.cat} style={{ marginBottom:20 }}>
                    <p style={{ fontSize:13, fontWeight:800, color:cat.color, marginBottom:10, fontFamily:'var(--font-heading)', display:'flex', alignItems:'center', gap:6 }}>
                      {cat.cat}
                    </p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                      {cat.items.map(item => {
                        const sel = libSelected.has(item.t)
                        return (
                          <motion.button
                            key={item.t}
                            onClick={() => {
                              setLibSelected(s => {
                                const n = new Set(s)
                                sel ? n.delete(item.t) : n.add(item.t)
                                return n
                              })
                            }}
                            whileTap={{ scale:0.95 }}
                            style={{
                              display:'flex', alignItems:'center', gap:10,
                              padding:'12px 14px', borderRadius:14,
                              border:`2px solid ${sel ? cat.color+'60' : 'var(--border)'}`,
                              background: sel ? `${cat.color}10` : 'var(--surface)',
                              cursor:'pointer', textAlign:'left',
                              boxShadow: sel ? `0 2px 12px ${cat.color}20` : '0 1px 4px rgba(0,0,0,0.05)',
                              transition:'all 0.15s ease',
                              position:'relative',
                            }}
                          >
                            <span style={{ fontSize:22, flexShrink:0 }}>{item.e}</span>
                            <span style={{ fontSize:13, fontWeight:700, color: sel ? cat.color : 'var(--text-1)', lineHeight:1.3, flex:1 }}>
                              {item.t}
                            </span>
                            <AnimatePresence>
                              {sel && (
                                <motion.div initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }} transition={{ type:'spring', stiffness:500, damping:25 }}
                                  style={{ width:20, height:20, borderRadius:'50%', background:cat.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
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

              {/* Sticky footer */}
              <AnimatePresence>
                {libSelected.size > 0 && (
                  <motion.div
                    initial={{ opacity:0, y:16 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:16 }}
                    style={{ paddingTop:14, borderTop:'1px solid var(--border)', marginTop:8 }}
                  >
                    <motion.button
                      whileTap={{ scale:0.97 }}
                      onClick={useLibSelected}
                      style={{
                        width:'100%', padding:'14px', borderRadius:14, border:'none',
                        background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                        color:'#fff', fontSize:16, fontWeight:800,
                        cursor:'pointer', fontFamily:'var(--font-heading)',
                        boxShadow:'0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                      Usar seleccionados ({libSelected.size})
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalSheet>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* 3. FORM modal */}
      <AnimatePresence>
        {flow === 'form' && (
          <ModalOverlay onClose={closeAll}>
            <ModalSheet>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                {libActiveItem && (
                  <button onClick={() => { setLibActiveItem(null); setFlow('library') }}
                    style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ChevronRight size={16} style={{ transform:'rotate(180deg)' }} color="var(--text-2)" />
                  </button>
                )}
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:20, fontWeight:900, fontFamily:'var(--font-heading)', color:'var(--text-1)' }}>
                    {libActiveItem ? `Configurar: ${libActiveItem.t}` : '✏️ Nuevo Task'}
                  </h2>
                  {libSelected.size > 1 && libActiveItem && (
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                      {libSelected.size} seleccionados · configurando 1 a la vez
                    </p>
                  )}
                </div>
                <CloseBtn onClick={closeAll} />
              </div>

              {/* Title + emoji */}
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:16 }}>
                <div ref={emojiRef} style={{ position:'relative' }}>
                  <motion.button whileTap={{ scale:0.88 }}
                    onClick={() => setShowEmojiPicker(v => !v)}
                    style={{ width:56, height:56, borderRadius:16, border:`2px solid ${showEmojiPicker ? accent : 'var(--border)'}`, background:'rgba(0,0,0,0.03)', fontSize:26, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'border-color 0.15s', boxShadow: showEmojiPicker ? `0 0 0 3px ${accent}20` : 'none' }}>
                    {form.emoji}
                  </motion.button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div initial={{ opacity:0, scale:0.95, y:-6 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:-6 }}
                        style={{ position:'absolute', top:'110%', left:0, zIndex:99 }}>
                        <EmojiPicker value={form.emoji} onChange={e => { setForm(f => ({ ...f, emoji:e })); setShowEmojiPicker(false) }} onClose={() => setShowEmojiPicker(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="¿Qué necesita hacer?"
                  autoFocus={!libActiveItem}
                  style={{ flex:1, padding:'15px 18px', borderRadius:16, border:`2px solid var(--border)`, fontSize:15, fontWeight:600, fontFamily:'var(--font-body)', color:'var(--text-1)', outline:'none', background:'rgba(0,0,0,0.02)', transition:'border-color 0.15s, box-shadow 0.15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor=accent; e.currentTarget.style.boxShadow=`0 0 0 3px ${accent}18` }}
                  onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
                />
              </div>

              {/* Type segmented control — Apple style */}
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Tipo</p>
                <div style={{
                  display:'flex', background:'rgba(0,0,0,0.06)',
                  borderRadius:100, padding:4,
                  boxShadow:'inset 0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  {([{ v:'fixed', icon:Repeat2, label:'🔄 Fixed', desc:'Se repite diario' }, { v:'once', icon:CalendarDays, label:'📅 One-time', desc:'Una sola vez' }] as const).map(opt => (
                    <motion.button key={opt.v}
                      onClick={() => setForm(f => ({ ...f, type:opt.v }))}
                      animate={form.type === opt.v ? { scale:1 } : { scale:1 }}
                      style={{
                        flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                        padding:'9px 16px', borderRadius:100, border:'none',
                        background: form.type === opt.v
                          ? `linear-gradient(135deg, ${accent}, ${accent}dd)`
                          : 'transparent',
                        color: form.type === opt.v ? '#fff' : 'var(--text-2)',
                        fontSize:13, fontWeight:700, cursor:'pointer',
                        boxShadow: form.type === opt.v
                          ? `0 2px 12px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.25)`
                          : 'none',
                        transition:'all 0.2s ease',
                        fontFamily:'var(--font-body)',
                      }}
                    >
                      <opt.icon size={14} strokeWidth={2.5} />
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Priority — premium pills */}
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Prioridad</p>
                <div style={{ display:'flex', gap:8 }}>
                  {(Object.entries(PRIORITY) as [string, typeof PRIORITY.high][]).map(([k, p]) => (
                    <motion.button key={k}
                      onClick={() => setForm(f => ({ ...f, priority:k as 'high'|'medium'|'low' }))}
                      whileHover={{ scale:1.04 }}
                      whileTap={{ scale:0.95 }}
                      animate={{ scale: form.priority===k ? 1.04 : 1 }}
                      style={{
                        flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                        padding:'10px 8px', borderRadius:14, border:'none',
                        background: form.priority===k ? p.grad : p.bg,
                        color: form.priority===k ? '#fff' : p.color,
                        fontSize:13, fontWeight:700, cursor:'pointer',
                        boxShadow: form.priority===k ? `0 4px 16px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
                        transition:'all 0.2s ease',
                        fontFamily:'var(--font-body)',
                      }}
                    >
                      <span style={{ fontSize:18 }}>{p.emoji}</span>
                      <span>{p.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date (one-time only) — pill style */}
              {form.type === 'once' && (
                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Fecha límite</p>
                  <label style={{
                    display:'flex', alignItems:'center', gap:10, cursor:'pointer',
                    padding:'11px 16px', borderRadius:100, background:'rgba(0,0,0,0.04)',
                    border:'1.5px solid var(--border)', transition:'all 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor=accent)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor='var(--border)')}>
                    <CalendarDays size={16} color={accent} />
                    <input type="date" value={form.dueDate}
                      onChange={e => setForm(f => ({ ...f, dueDate:e.target.value }))}
                      style={{ flex:1, border:'none', outline:'none', fontSize:14, fontFamily:'var(--font-body)', color:'var(--text-1)', background:'transparent', cursor:'pointer', fontWeight:600 }} />
                  </label>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Nota (opcional)</p>
                <input value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes:e.target.value }))}
                  placeholder="Agregar una nota..."
                  style={{ width:'100%', padding:'12px 16px', borderRadius:14, border:'1.5px solid var(--border)', fontSize:13, fontFamily:'var(--font-body)', color:'var(--text-1)', background:'rgba(0,0,0,0.02)', outline:'none', transition:'all 0.15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor=accent; e.currentTarget.style.boxShadow=`0 0 0 3px ${accent}15` }}
                  onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }} />
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:10 }}>
                {/* ADD TASK — emerald gradient */}
                <motion.button
                  whileHover={{ y:-2, boxShadow:`0 8px 24px rgba(16,185,129,0.5)` }}
                  whileTap={{ y:1, scale:0.97 }}
                  onClick={addTask}
                  disabled={!form.title.trim()}
                  style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    padding:'14px', borderRadius:14, border:'none',
                    background: form.title.trim()
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'rgba(0,0,0,0.08)',
                    color: form.title.trim() ? '#fff' : 'var(--text-3)',
                    fontSize:15, fontWeight:800,
                    cursor: form.title.trim() ? 'pointer' : 'default',
                    boxShadow: form.title.trim()
                      ? '0 4px 18px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)'
                      : 'none',
                    transition:'all 0.2s ease',
                    fontFamily:'var(--font-heading)',
                  }}
                >
                  <Sparkles size={17} />
                  {libSelected.size > 1 ? `Agregar y seguir (${libSelected.size - 1} más)` : 'Agregar Task'}
                </motion.button>

                {/* CANCEL — glassmorphism */}
                <motion.button
                  whileHover={{ background:'rgba(0,0,0,0.08)' }}
                  whileTap={{ scale:0.96 }}
                  onClick={closeAll}
                  style={{
                    padding:'14px 20px', borderRadius:14,
                    border:'1.5px solid rgba(0,0,0,0.1)',
                    background:'rgba(0,0,0,0.04)',
                    backdropFilter:'blur(8px)',
                    fontSize:14, fontWeight:700, color:'var(--text-2)',
                    cursor:'pointer', fontFamily:'var(--font-body)',
                    transition:'background 0.15s ease',
                  }}
                >
                  Cancelar
                </motion.button>
              </div>
            </ModalSheet>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── SHARED MODAL HELPERS ────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.2 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:50,
        background:'rgba(0,0,0,0.35)',
        backdropFilter:'blur(8px)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        padding:'0 0 0 0',
      }}
    >
      {children}
    </motion.div>
  )
}

function ModalSheet({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <motion.div
      initial={{ y:80, opacity:0, scale:0.97 }}
      animate={{ y:0, opacity:1, scale:1 }}
      exit={{ y:80, opacity:0, scale:0.97 }}
      transition={{ type:'spring', stiffness:340, damping:30 }}
      style={{
        background:'var(--surface)',
        borderRadius:'28px 28px 0 0',
        width:'100%', maxWidth:520,
        maxHeight: tall ? '88vh' : '75vh',
        display:'flex', flexDirection:'column',
        padding:24,
        boxShadow:'0 -8px 48px rgba(0,0,0,0.14)',
        overflow:'hidden',
      }}
    >
      {/* Drag handle */}
      <div style={{ width:40, height:4, borderRadius:99, background:'rgba(0,0,0,0.12)', margin:'-6px auto 16px', flexShrink:0 }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, overflow: tall ? 'hidden' : 'auto' }}>
        {children}
      </div>
    </motion.div>
  )
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale:0.9 }} onClick={onClick}
      style={{ width:34, height:34, borderRadius:10, border:'1px solid var(--border)', background:'rgba(0,0,0,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <X size={16} color="var(--text-3)" />
    </motion.button>
  )
}

// ─── SECTION ─────────────────────────────────────────────
function PremiumSection({ icon, title, subtitle, count, accent, expanded, onToggle, extra, dimmed, children }: {
  icon:string; title:string; subtitle?:string; count:number
  accent:string; expanded:boolean; onToggle:()=>void
  extra?:React.ReactNode; dimmed?:boolean; children:React.ReactNode
}) {
  const isFixed  = title === 'Fixed Tasks'
  const isOnce   = title === 'One-time Tasks'
  const isDone   = title === 'Completados'

  return (
    <div style={{ marginBottom:24 }}>
      {/* Section header */}
      <button onClick={onToggle}
        style={{
          width:'100%', display:'flex', alignItems:'center', gap:10,
          padding:'10px 14px 10px 12px',
          borderRadius:14, border:'none', cursor:'pointer', textAlign:'left',
          background: dimmed ? 'transparent' : `${accent}08`,
          borderLeft: dimmed ? 'none' : `4px solid ${accent}`,
          marginBottom: expanded ? 10 : 0,
          transition:'background 0.15s',
        }}>
        <span style={{ fontSize:20, lineHeight:1 }}>{icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em', color: dimmed ? 'var(--text-3)' : accent, fontFamily:'var(--font-heading)' }}>
            {title}
          </span>
          {subtitle && <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500, marginLeft:6 }}>· {subtitle}</span>}
        </div>
        {count > 0 && (
          <span style={{ minWidth:24, height:24, borderRadius:99, background: dimmed ? 'rgba(0,0,0,0.06)' : `${accent}20`, color: dimmed ? 'var(--text-3)' : accent, fontSize:12, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'0 8px', fontFamily:'var(--font-heading)' }}>
            {count}
          </span>
        )}
        {extra && <div onClick={e=>e.stopPropagation()}>{extra}</div>}
        <span style={{ color:'var(--text-3)', display:'flex', alignItems:'center' }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.22, ease:'easeInOut' }}
            style={{ overflow:'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────
function PremiumEmpty({ emoji, text, sub, onAdd }: { emoji:string; text:string; sub:string; onAdd:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      style={{ padding:'24px 16px', textAlign:'center', borderRadius:16, background:'rgba(0,0,0,0.02)', border:'1.5px dashed var(--border)', marginBottom:8 }}>
      <div style={{ fontSize:36, marginBottom:8 }}>{emoji}</div>
      <p style={{ fontSize:14, fontWeight:800, color:'var(--text-2)', marginBottom:4, fontFamily:'var(--font-heading)' }}>{text}</p>
      <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14 }}>{sub}</p>
      <motion.button whileTap={{ scale:0.95 }} onClick={onAdd}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:99, border:'none', background:'rgba(0,0,0,0.07)', color:'var(--text-2)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
        <Plus size={13} /> Agregar task
      </motion.button>
    </motion.div>
  )
}

// ─── TASK CARD ────────────────────────────────────────────
function TaskCard({ task, member, onToggle, onRemove, delay=0, dimmed, onAddClick }: {
  task:Task
  member?: { barColor:string; bgColor:string; textColor:string } | null
  onToggle:(id:string)=>void; onRemove:(id:string)=>void
  delay?:number; dimmed?:boolean; onAddClick?:()=>void
}) {
  const p = PRIORITY[task.priority]
  const [hov, setHov] = useState(false)
  const acc = member?.barColor ?? '#007AFF'

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:8 }}
      animate={{ opacity: dimmed ? 0.52 : 1, y:0 }}
      exit={{ opacity:0, x:-12, height:0, marginBottom:0 }}
      transition={{ type:'spring', stiffness:380, damping:28, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'13px 16px', borderRadius:16, marginBottom:8,
        background:'var(--surface)',
        border:`1.5px solid ${hov && !task.done ? acc+'35' : 'var(--border)'}`,
        boxShadow: hov && !task.done ? `0 4px 18px rgba(0,0,0,0.07)` : '0 1px 4px rgba(0,0,0,0.04)',
        transition:'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Checkbox */}
      <motion.button
        whileTap={{ scale:0.75 }}
        onClick={() => onToggle(task.id)}
        style={{
          width:28, height:28, borderRadius:'50%', flexShrink:0,
          border:`2.5px solid ${task.done ? acc : 'var(--border)'}`,
          background: task.done
            ? `linear-gradient(135deg, ${acc}, ${acc}cc)`
            : 'transparent',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: task.done ? `0 2px 10px ${acc}40` : 'none',
          transition:'all 0.2s ease',
        }}
      >
        <AnimatePresence>
          {task.done && (
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }} transition={{ type:'spring', stiffness:500, damping:25 }}>
              <Check size={13} color="#fff" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Emoji */}
      <span style={{ fontSize:22, flexShrink:0, filter: task.done ? 'grayscale(0.6) opacity(0.6)' : 'none', transition:'filter 0.2s' }}>
        {task.emoji}
      </span>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:700, color: task.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.done ? 'line-through' : 'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom: (task.dueDate || task.notes) ? 4 : 0 }}>
          {task.title}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700, color: task.done ? 'var(--text-3)' : p.color, background: task.done ? 'rgba(0,0,0,0.05)' : p.bg, padding:'2px 8px', borderRadius:99 }}>
            {p.emoji} {p.label}
          </span>
          {task.type === 'fixed' && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:600, color:'var(--text-3)', background:'rgba(0,0,0,0.04)', padding:'2px 8px', borderRadius:99, border:'1px solid var(--border)' }}>
              <Repeat2 size={9} /> Diario
            </span>
          )}
          {task.dueDate && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, color:'var(--text-3)' }}>
              <CalendarDays size={10} /> {task.dueDate}
            </span>
          )}
          {task.notes && (
            <span style={{ fontSize:11, color:'var(--text-3)', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              · {task.notes}
            </span>
          )}
        </div>
      </div>

      {/* Delete (hover) */}
      <AnimatePresence>
        {hov && (
          <motion.button
            initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.7 }}
            transition={{ duration:0.12 }}
            whileTap={{ scale:0.88 }}
            onClick={() => onRemove(task.id)}
            style={{ width:30, height:30, borderRadius:9, border:'none', background:'#FEF2F2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#EF4444', flexShrink:0 }}
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
