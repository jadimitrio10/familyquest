import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, PenLine, ChevronLeft, Clock, Bell, CalendarDays } from 'lucide-react'
import { Toggle } from '@/components/shared/Toggle'
import { EmojiPicker } from '@/components/shared/EmojiPicker'
import { TaskLibraryModal } from './TaskLibraryModal'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import type { Task } from '@/views/TasksView'
import type { TaskTemplate } from '@/lib/taskLibrary'
import toast from 'react-hot-toast'

const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const FREQ_OPTIONS = [
  { v:'daily',    label:'Todos los días' },
  { v:'weekdays', label:'Días de semana' },
  { v:'weekends', label:'Fines de semana' },
  { v:'custom',   label:'Días específicos' },
  { v:'once',     label:'Una sola vez' },
]
const CATEGORIES = [
  { v:'Higiene',  e:'🧴' },{ v:'Escuela',  e:'📚' },
  { v:'Hogar',    e:'🏠' },{ v:'Salud',    e:'💪' },
  { v:'Personal', e:'🎯' },{ v:'Otros',    e:'📋' },
]
const PRIORITY_OPTS = [
  { v:'low',    label:'Baja',    color:'#64748B' },
  { v:'medium', label:'Media',   color:'#F59E0B' },
  { v:'high',   label:'Alta',    color:'#EF4444' },
  { v:'urgent', label:'Urgente', color:'#A855F7' },
]
const REMINDER_OPTS = [
  { v:'5',  label:'5 min antes' },
  { v:'15', label:'15 min antes' },
  { v:'30', label:'30 min antes' },
  { v:'60', label:'1 hora antes' },
]

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onAdd: (tasks: Task[]) => void
}

type Step = 'choose' | 'library-config' | 'custom'

type ExtForm = Partial<Task> & {
  freq: string; customDays: number[]
  hasTime: boolean; hasReminder: boolean
  reminderMin: string; timeSlot: string
  dueDate: string; startTime?: string; category?: string
}

function emptyForm(): ExtForm {
  return {
    title:'', emoji:'✅', priority:'medium',
    freq:'daily', customDays:[], hasTime:false, hasReminder:false,
    reminderMin:'15', timeSlot:'morning', startTime:undefined,
    dueDate:'', type:'once', notes:'', memberId:'',
    category:'Otros',
  } as ExtForm
}

export function AddTaskModal({ open, onClose, onAdd }: AddTaskModalProps) {
  const { members } = useMembersStore()
  const children = members.filter(m => m.role === 'child')

  const [step, setStep] = useState<Step>('choose')
  const [showLibrary, setShowLibrary] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  // Forms for library-selected templates (one per template)
  const [libraryTemplates, setLibraryTemplates] = useState<TaskTemplate[]>([])
  const [libForms, setLibForms] = useState<Record<string, ExtForm>>({})

  // Single custom form
  const [form, setForm] = useState(emptyForm)
  const setF = (patch: Partial<ExtForm>) => setForm(f => ({ ...f, ...patch }))

  function handleLibrarySelect(templates: TaskTemplate[]) {
    setLibraryTemplates(templates)
    const forms: Record<string, ExtForm> = {}
    templates.forEach(t => {
      forms[t.id] = { ...emptyForm(), title: t.title, emoji: t.emoji, suggestedPoints: t.suggestedPoints, memberId: children[0]?.id ?? '' } as any
    })
    setLibForms(forms)
    setStep('library-config')
  }

  function updateLibForm(id: string, patch: Partial<ExtForm>) {
    setLibForms(f => ({ ...f, [id]: { ...f[id], ...patch } }))
  }

  function handleSubmitLibrary() {
    const tasks = libraryTemplates.map(t => {
      const f = libForms[t.id]
      return buildTask(t.title, t.emoji, f)
    })
    onAdd(tasks)
    toast.success(`${tasks.length} task${tasks.length > 1 ? 's' : ''} agregado${tasks.length > 1 ? 's' : ''} ✅`)
    reset()
  }

  function handleSubmitCustom() {
    if (!form.title?.trim()) { toast.error('Escribe el nombre del task'); return }
    onAdd([buildTask(form.title!, form.emoji!, form)])
    toast.success('Task creado ✅')
    reset()
  }

  function buildTask(title: string, emoji: string, f: ExtForm): Task {
    return {
      id: `t-${Date.now()}-${Math.random()}`,
      title: title.trim(),
      emoji,
      memberId: f.memberId || children[0]?.id || '',
      done: false,
      type: f.freq === 'once' ? 'once' : 'fixed',
      priority: (f.priority as any) || 'medium',
      dueDate: f.dueDate || undefined,
      notes: f.notes || undefined,
      // Extended scheduling
      freq: f.freq,
      customDays: f.customDays,
      hasTime: f.hasTime,
      startTime: f.hasTime ? f.startTime : undefined,
      timeSlot: f.timeSlot,
      hasReminder: f.hasReminder,
      reminderMin: f.reminderMin,
      category: f.category || 'Otros',
      points: (f as any).suggestedPoints ?? 10,
    } as any
  }

  function reset() {
    setStep('choose'); setForm(emptyForm()); setLibraryTemplates([]); setLibForms({})
    onClose()
  }

  const TaskFormFields = ({ f, setF: update, showEmojiPicker, setShowEmojiPicker, templateTitle, templateEmoji }: {
    f: ExtForm; setF: (p: Partial<ExtForm>) => void
    showEmojiPicker?: boolean; setShowEmojiPicker?: (v:boolean)=>void
    templateTitle?: string; templateEmoji?: string
  }) => (
    <div className="flex flex-col gap-4">
      {/* Title + emoji (custom only, library shows fixed title) */}
      {!templateTitle ? (
        <div className="flex gap-2 items-start">
          <div className="relative">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEmojiPicker?.(!showEmojiPicker)}
              className="card flex items-center justify-center" style={{ width:52, height:52, fontSize:26, flexShrink:0 }}>
              {f.emoji}
            </motion.button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
                  style={{ position:'absolute', top:'110%', left:0, zIndex:99 }}>
                  <EmojiPicker value={f.emoji||'✅'} onChange={e => { update({ emoji:e }); setShowEmojiPicker?.(false) }} onClose={() => setShowEmojiPicker?.(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input value={f.title||''} onChange={e => update({ title:e.target.value })}
            placeholder="Nombre del task..." autoFocus className="input-apple flex-1" />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background:'rgba(0,122,255,0.06)', border:'1.5px solid rgba(0,122,255,0.15)' }}>
          <span style={{ fontSize:28 }}>{templateEmoji}</span>
          <span className="font-bold text-base" style={{ fontFamily:'var(--font-heading)' }}>{templateTitle}</span>
        </div>
      )}

      {/* Assign to */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>
          Asignar a
        </label>
        <div className="flex gap-2 flex-wrap">
          {children.map(m => (
            <motion.button key={m.id} whileTap={{ scale: 0.95 }} onClick={() => update({ memberId: m.id })}
              className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
              style={{ background: f.memberId===m.id ? m.bgColor : 'var(--bg)', border:`2px solid ${f.memberId===m.id ? m.barColor : 'var(--border)'}`, fontWeight:700, fontSize:13, color: f.memberId===m.id ? m.textColor : 'var(--text-2)' }}>
              <MemberAvatar member={m} size={24} />
              {m.name}
            </motion.button>
          ))}
          {children.length === 0 && <p className="text-sm" style={{ color:'var(--text-3)' }}>Agrega hijos en Ajustes</p>}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>
          Frecuencia
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {FREQ_OPTIONS.map(opt => (
            <button key={opt.v} onClick={() => update({ freq:opt.v })}
              className={`pill ${f.freq===opt.v ? 'pill-selected' : 'pill-default'}`}
              style={{ fontSize:12 }}>
              {opt.label}
            </button>
          ))}
        </div>
        {/* Day checkboxes for custom */}
        {f.freq === 'custom' && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {DAYS.map((day, i) => {
              const active = (f.customDays||[]).includes(i)
              return (
                <button key={day} onClick={() => {
                  const d = f.customDays||[]
                  update({ customDays: active ? d.filter(x=>x!==i) : [...d, i] })
                }}
                className="w-9 h-9 rounded-full font-bold text-xs transition-all"
                style={{ background: active ? 'var(--blue)' : 'var(--bg)', color: active ? '#fff' : 'var(--text-2)', border:`1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}` }}>
                  {day}
                </button>
              )
            })}
          </div>
        )}
        {f.freq === 'once' && (
          <input type="date" value={f.dueDate||''} onChange={e => update({ dueDate:e.target.value })}
            className="input-apple mt-3" />
        )}
      </div>

      {/* Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} style={{ color:'var(--text-3)' }} />
          <span className="font-semibold text-sm">Hora específica</span>
        </div>
        <Toggle value={f.hasTime||false} onChange={v => update({ hasTime:v })} />
      </div>
      {f.hasTime && (
        <div className="flex gap-3">
          <input type="time" value={f.startTime||''} onChange={e => update({ startTime:e.target.value })}
            className="input-apple flex-1" />
          <div className="flex gap-1.5">
            {[{v:'morning',e:'🌅'},{v:'afternoon',e:'☀️'},{v:'evening',e:'🌙'}].map(s=>(
              <button key={s.v} onClick={() => update({ timeSlot:s.v })}
                className="w-10 h-10 rounded-xl text-lg transition-all"
                style={{ background: f.timeSlot===s.v ? 'var(--blue)' : 'var(--bg)', border:`1.5px solid ${f.timeSlot===s.v ? 'var(--blue)' : 'var(--border)'}` }}>
                {s.e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reminder */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color:'var(--text-3)' }} />
          <span className="font-semibold text-sm">Recordatorio</span>
        </div>
        <Toggle value={f.hasReminder||false} onChange={v => update({ hasReminder:v })} />
      </div>
      {f.hasReminder && (
        <div className="flex gap-2 flex-wrap">
          {REMINDER_OPTS.map(r=>(
            <button key={r.v} onClick={() => update({ reminderMin:r.v })}
              className={`pill ${f.reminderMin===r.v ? 'pill-selected' : 'pill-default'}`}>
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Priority */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>
          Prioridad
        </label>
        <div className="flex gap-2">
          {PRIORITY_OPTS.map(p=>(
            <button key={p.v} onClick={() => update({ priority:p.v as any })}
              className="flex-1 py-2 rounded-xl font-bold text-xs transition-all"
              style={{ background: f.priority===p.v ? p.color+'20' : 'var(--bg)', color: f.priority===p.v ? p.color : 'var(--text-3)', border:`1.5px solid ${f.priority===p.v ? p.color : 'var(--border)'}` }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'var(--text-3)' }}>
          Categoría
        </label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c=>(
            <button key={c.v} onClick={() => update({ category:c.v })}
              className={`pill ${(f as any).category===c.v ? 'pill-selected' : 'pill-default'}`}>
              {c.e} {c.v}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <input value={f.notes||''} onChange={e => update({ notes:e.target.value })}
        placeholder="Nota opcional..."
        className="input-apple" style={{ fontSize:13 }} />
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {open && step === 'choose' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="modal-overlay" onClick={e => e.target===e.currentTarget && reset()}>
            <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              transition={{ type:'spring', stiffness:340, damping:30 }}
              className="modal-sheet">
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
              <h2 className="font-black text-xl mb-1" style={{ fontFamily:'var(--font-heading)' }}>➕ Agregar Task</h2>
              <p className="text-sm mb-6" style={{ color:'var(--text-3)' }}>¿Cómo quieres crearlo?</p>

              <div className="flex flex-col gap-3">
                <motion.button whileTap={{ scale:0.97 }} onClick={() => setShowLibrary(true)}
                  className="card p-5 text-left transition-all group"
                  style={{ border:'2px solid var(--border)' }}
                  whileHover={{ borderColor:'var(--blue)', background:'rgba(0,122,255,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background:'rgba(0,122,255,0.1)' }}>📚</div>
                    <div>
                      <p className="font-bold text-base" style={{ fontFamily:'var(--font-heading)' }}>
                        Elegir de la biblioteca
                      </p>
                      <p className="text-sm mt-0.5" style={{ color:'var(--text-3)' }}>
                        24 tasks predeterminados listos para usar
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button whileTap={{ scale:0.97 }} onClick={() => setStep('custom')}
                  className="card p-5 text-left transition-all"
                  style={{ border:'2px solid var(--border)' }}
                  whileHover={{ borderColor:'var(--blue)', background:'rgba(0,122,255,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background:'rgba(88,86,214,0.1)' }}>✏️</div>
                    <div>
                      <p className="font-bold text-base" style={{ fontFamily:'var(--font-heading)' }}>
                        Crear desde cero
                      </p>
                      <p className="text-sm mt-0.5" style={{ color:'var(--text-3)' }}>
                        Formulario completo con todas las opciones
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {open && step === 'custom' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="modal-overlay" onClick={e => e.target===e.currentTarget && reset()}>
            <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              transition={{ type:'spring', stiffness:340, damping:30 }}
              className="modal-sheet" style={{ maxHeight:'90vh', overflowY:'auto' }}>
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep('choose')} className="btn-icon"><ChevronLeft size={18} /></button>
                <div>
                  <h2 className="font-black text-xl" style={{ fontFamily:'var(--font-heading)' }}>✏️ Crear Task</h2>
                  <p className="text-xs" style={{ color:'var(--text-3)' }}>Personaliza todos los detalles</p>
                </div>
                <button onClick={reset} className="btn-icon ml-auto"><X size={18} /></button>
              </div>

              <TaskFormFields f={form} setF={setF} showEmojiPicker={showEmoji} setShowEmojiPicker={setShowEmoji} />

              <motion.button whileTap={{ scale:0.97 }} onClick={handleSubmitCustom}
                className="btn btn-primary w-full mt-5" style={{ padding:'14px', fontSize:16 }}>
                Agregar Task
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {open && step === 'library-config' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="modal-overlay" onClick={e => e.target===e.currentTarget && reset()}>
            <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              transition={{ type:'spring', stiffness:340, damping:30 }}
              className="modal-sheet" style={{ maxHeight:'92vh', overflowY:'auto' }}>
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => { setStep('choose'); setShowLibrary(true) }} className="btn-icon"><ChevronLeft size={18} /></button>
                <div>
                  <h2 className="font-black text-xl" style={{ fontFamily:'var(--font-heading)' }}>⚙️ Configurar Tasks</h2>
                  <p className="text-xs" style={{ color:'var(--text-3)' }}>{libraryTemplates.length} task{libraryTemplates.length>1?'s':''} seleccionado{libraryTemplates.length>1?'s':''}</p>
                </div>
                <button onClick={reset} className="btn-icon ml-auto"><X size={18} /></button>
              </div>

              {libraryTemplates.map((t, i) => {
                const f = libForms[t.id] || emptyForm()
                return (
                  <div key={t.id} className="mb-6">
                    {libraryTemplates.length > 1 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
                        <span className="text-xs font-bold px-2" style={{ color:'var(--text-3)' }}>Task {i+1} de {libraryTemplates.length}</span>
                        <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
                      </div>
                    )}
                    <TaskFormFields f={f} setF={(p) => updateLibForm(t.id, p)} templateTitle={t.title} templateEmoji={t.emoji} />
                  </div>
                )
              })}

              <motion.button whileTap={{ scale:0.97 }} onClick={handleSubmitLibrary}
                className="btn btn-primary w-full mt-4" style={{ padding:'14px', fontSize:16 }}>
                Confirmar y agregar {libraryTemplates.length} task{libraryTemplates.length>1?'s':''}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={templates => { setShowLibrary(false); handleLibrarySelect(templates) }}
      />
    </>
  )
}
