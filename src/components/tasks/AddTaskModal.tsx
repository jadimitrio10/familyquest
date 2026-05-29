import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { EmojiPicker } from './EmojiPicker'
import { useFamilyStore } from '@/stores/familyStore'
import { useTasksStore } from '@/stores/tasksStore'
import type { Task, TimeOfDay, Frequency } from '@/types/database.types'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import toast from 'react-hot-toast'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
}

const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: '🌅 Morning' },
  { value: 'afternoon', label: '☀️ Afternoon' },
  { value: 'evening', label: '🌙 Evening' },
  { value: 'anytime', label: '🔄 Anytime' },
]

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'once', label: 'Once' },
  { value: 'monthly', label: 'Monthly' },
]

export function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const { members, family } = useFamilyStore()
  const { addTask } = useTasksStore()
  const children = members.filter((m) => m.role === 'child')

  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [assignTo, setAssignTo] = useState<string[]>([])
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
  const [points, setPoints] = useState(10)

  function handleSubmit() {
    if (!title.trim() || assignTo.length === 0) {
      toast.error('Please fill in the task name and assign it to someone.')
      return
    }
    assignTo.forEach((profileId) => {
      const task: Task = {
        id: `task-${Date.now()}-${profileId}`,
        family_id: family?.id ?? '',
        title: title.trim(),
        emoji_icon: emoji,
        assigned_to: profileId,
        frequency,
        days_of_week: null,
        time_of_day: timeOfDay,
        due_time: null,
        points_value: points,
        notes: null,
        is_active: true,
        sort_order: 0,
        created_by: null,
        created_at: new Date().toISOString(),
      }
      addTask(task)
    })
    toast.success('Task added! 🎉')
    setTitle('')
    setEmoji('⭐')
    setAssignTo([])
    setPoints(10)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-2xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                New Task
              </h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Task name */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Task Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Brush Teeth"
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold focus:outline-none focus:border-purple-400"
                  style={{ minHeight: 52 }}
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Emoji Icon</label>
                <EmojiPicker value={emoji} onChange={setEmoji} />
              </div>

              {/* Assign to */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Assign To</label>
                <div className="flex gap-3 flex-wrap">
                  {children.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssignTo((prev) =>
                        prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                      )}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`rounded-2xl p-1 transition-all ${assignTo.includes(m.id) ? 'ring-3 ring-purple-500 scale-110' : 'opacity-60'}`}>
                        <AvatarCircle emoji={m.avatar_emoji} colorHex={m.color_hex} accentHex={m.accent_hex} size={48} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Frequency</label>
                <div className="flex gap-2 flex-wrap">
                  {FREQ_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFrequency(value)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                        frequency === value ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                      style={{ minHeight: 40 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of day */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Time of Day</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTimeOfDay(value)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                        timeOfDay === value ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                      style={{ minHeight: 44 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Points slider */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Points Value: <span className="text-purple-600">⭐ {points}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5</span><span>100</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-black text-xl text-white bg-purple-500 hover:bg-purple-600 transition-colors"
                style={{ minHeight: 60 }}
              >
                Add Task ✨
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
