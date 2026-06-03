import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Search } from 'lucide-react'
import { TASK_LIBRARY, CATEGORY_META, type TaskTemplate } from '@/lib/taskLibrary'

interface TaskLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (templates: TaskTemplate[]) => void
}

export function TaskLibraryModal({ open, onClose, onSelect }: TaskLibraryModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')

  const filtered = TASK_LIBRARY.filter(t => {
    if (activeCategory !== 'all' && t.category !== activeCategory) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = Object.keys(CATEGORY_META).reduce((acc, cat) => {
    const items = filtered.filter(t => t.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, TaskTemplate[]>)

  function toggle(id: string) {
    setSelected(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function handleConfirm() {
    const templates = TASK_LIBRARY.filter(t => selected.has(t.id))
    onSelect(templates)
    setSelected(new Set())
    setSearch('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="modal-sheet"
            style={{ maxHeight: '88vh' }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ fontFamily:'var(--font-heading)' }}>
                  📚 Biblioteca de Tasks
                </h2>
                <p className="text-sm mt-0.5" style={{ color:'var(--text-3)' }}>
                  Elige uno o varios para personalizar
                </p>
              </div>
              <button onClick={onClose} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar task..."
                className="input-apple" style={{ paddingLeft: 36 }} />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 hide-scroll">
              <button onClick={() => setActiveCategory('all')}
                className={`pill flex-shrink-0 ${activeCategory === 'all' ? 'pill-selected' : 'pill-default'}`}>
                Todos
              </button>
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <button key={k} onClick={() => setActiveCategory(k)}
                  className={`pill flex-shrink-0 ${activeCategory === k ? 'pill-selected' : 'pill-default'}`}>
                  {v.emoji} {v.label}
                </button>
              ))}
            </div>

            {/* Task grid */}
            <div className="overflow-y-auto" style={{ maxHeight: '52vh' }}>
              {Object.entries(grouped).map(([cat, tasks]) => (
                <div key={cat} className="mb-5">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span style={{ fontSize: 16 }}>{CATEGORY_META[cat as keyof typeof CATEGORY_META].emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: CATEGORY_META[cat as keyof typeof CATEGORY_META].color }}>
                      {CATEGORY_META[cat as keyof typeof CATEGORY_META].label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tasks.map(task => {
                      const isSelected = selected.has(task.id)
                      return (
                        <motion.button
                          key={task.id}
                          onClick={() => toggle(task.id)}
                          whileTap={{ scale: 0.96 }}
                          className="card text-left p-3 relative transition-all"
                          style={{
                            border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`,
                            background: isSelected ? 'rgba(0,122,255,0.06)' : 'var(--surface)',
                          }}
                        >
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: 'var(--blue)' }}>
                              <Check size={11} color="#fff" strokeWidth={3} />
                            </motion.div>
                          )}
                          <div className="text-2xl mb-1">{task.emoji}</div>
                          <p className="text-sm font-bold leading-tight" style={{ color:'var(--text-1)', paddingRight: isSelected ? 20 : 0 }}>
                            {task.title}
                          </p>
                          <p className="text-xs mt-1 font-semibold" style={{ color:'var(--text-3)' }}>
                            ⭐ {task.suggestedPoints} pts
                          </p>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(grouped).length === 0 && (
                <div className="text-center py-8" style={{ color:'var(--text-3)' }}>
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="font-semibold">Sin resultados</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t mt-3" style={{ borderColor:'var(--border)' }}>
              <motion.button
                onClick={handleConfirm}
                disabled={selected.size === 0}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary w-full"
                style={{ fontSize: 16, padding: '14px' }}
              >
                Agregar {selected.size > 0 ? `${selected.size} task${selected.size > 1 ? 's' : ''}` : 'tasks'} seleccionados
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
