import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useTasksStore } from '@/stores/tasksStore'
import { useFamilyStore } from '@/stores/familyStore'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { AddTaskModal } from './AddTaskModal'

export function TaskManager() {
  const { tasks, removeTask } = useTasksStore()
  const { members } = useFamilyStore()
  const [showModal, setShowModal] = useState(false)
  const [filterMember, setFilterMember] = useState<string | null>(null)

  const children = members.filter((m) => m.role === 'child')
  const filtered = filterMember ? tasks.filter((t) => t.assigned_to === filterMember) : tasks

  const getMember = (id: string | null) => members.find((m) => m.id === id)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-3xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Tasks 📋
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors"
          style={{ minHeight: 52 }}
        >
          <Plus size={20} />
          Add Task
        </motion.button>
      </div>

      {/* Member filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterMember(null)}
          className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
            !filterMember ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
          style={{ minHeight: 40 }}
        >
          All Members
        </button>
        {children.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilterMember(m.id === filterMember ? null : m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
              filterMember === m.id ? 'text-white' : 'bg-gray-100 text-gray-600'
            }`}
            style={{
              background: filterMember === m.id ? m.accent_hex : undefined,
              minHeight: 40,
            }}
          >
            <span>{m.avatar_emoji}</span>
            {m.name}
          </button>
        ))}
      </div>

      {/* Task list */}
      <AnimatePresence>
        {filtered.map((task) => {
          const member = getMember(task.assigned_to)
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-4 shadow-sm border border-gray-100"
            >
              <span className="text-3xl">{task.emoji_icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="capitalize">{task.time_of_day}</span>
                  <span>·</span>
                  <span className="capitalize">{task.frequency}</span>
                  <span>·</span>
                  <span className="font-semibold" style={{ color: member?.accent_hex }}>⭐ {task.points_value}</span>
                </div>
              </div>
              {member && (
                <AvatarCircle emoji={member.avatar_emoji} colorHex={member.color_hex} accentHex={member.accent_hex} size={36} />
              )}
              <button
                onClick={() => removeTask(task.id)}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">📋</span>
          <p className="font-semibold">No tasks yet — add one above!</p>
        </div>
      )}

      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
