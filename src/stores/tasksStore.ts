import { create } from 'zustand'
import type { Task, TaskInstance } from '@/types/database.types'

interface TasksState {
  tasks: Task[]
  instances: TaskInstance[]
  setTasks: (tasks: Task[]) => void
  setInstances: (instances: TaskInstance[]) => void
  markComplete: (instanceId: string, pointsAwarded: number) => void
  addTask: (task: Task) => void
  removeTask: (taskId: string) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  instances: [],
  setTasks: (tasks) => set({ tasks }),
  setInstances: (instances) => set({ instances }),
  markComplete: (instanceId, pointsAwarded) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === instanceId
          ? { ...i, completed_at: new Date().toISOString(), points_awarded: pointsAwarded }
          : i
      ),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  removeTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),
}))
