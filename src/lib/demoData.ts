import type { Family, Profile, Task, TaskInstance, Reward } from '@/types/database.types'
import { todayISO } from './utils'

const today = todayISO()

export const DEMO_FAMILY: Family = {
  id: 'demo-family',
  name: 'The Demo Family',
  invite_code: 'DEMO1234',
  timezone: 'America/New_York',
  owner_id: 'demo-dad',
  created_at: new Date().toISOString(),
}

export const DEMO_MEMBERS: Profile[] = [
  {
    id: 'demo-emma',
    family_id: 'demo-family',
    user_id: null,
    name: 'Emma',
    avatar_emoji: '🌸',
    color_hex: '#FFB5B5',
    accent_hex: '#E05C5C',
    role: 'child',
    points_balance: 240,
    total_points_earned: 580,
    current_streak: 5,
    longest_streak: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-lucas',
    family_id: 'demo-family',
    user_id: null,
    name: 'Lucas',
    avatar_emoji: '⚡',
    color_hex: '#FDE68A',
    accent_hex: '#D97706',
    role: 'child',
    points_balance: 180,
    total_points_earned: 420,
    current_streak: 3,
    longest_streak: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-sofia',
    family_id: 'demo-family',
    user_id: null,
    name: 'Sofia',
    avatar_emoji: '🦋',
    color_hex: '#BAE6FD',
    accent_hex: '#0284C7',
    role: 'child',
    points_balance: 310,
    total_points_earned: 720,
    current_streak: 7,
    longest_streak: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-dad',
    family_id: 'demo-family',
    user_id: 'demo-user',
    name: 'Dad',
    avatar_emoji: '👨',
    color_hex: '#DDD6FE',
    accent_hex: '#7C3AED',
    role: 'parent',
    points_balance: 0,
    total_points_earned: 0,
    current_streak: 0,
    longest_streak: 0,
    created_at: new Date().toISOString(),
  },
]

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-1', family_id: 'demo-family', title: 'Brush Teeth', emoji_icon: '🦷',
    assigned_to: 'demo-emma', frequency: 'daily', days_of_week: null,
    time_of_day: 'morning', due_time: '07:30', points_value: 5, notes: null,
    is_active: true, sort_order: 0, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-2', family_id: 'demo-family', title: 'Reading Time', emoji_icon: '📚',
    assigned_to: 'demo-emma', frequency: 'daily', days_of_week: null,
    time_of_day: 'morning', due_time: '08:00', points_value: 10, notes: null,
    is_active: true, sort_order: 1, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-3', family_id: 'demo-family', title: 'Make Bed', emoji_icon: '🛏️',
    assigned_to: 'demo-emma', frequency: 'daily', days_of_week: null,
    time_of_day: 'morning', due_time: null, points_value: 5, notes: null,
    is_active: true, sort_order: 2, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-4', family_id: 'demo-family', title: 'Homework', emoji_icon: '✏️',
    assigned_to: 'demo-emma', frequency: 'daily', days_of_week: null,
    time_of_day: 'afternoon', due_time: '16:00', points_value: 20, notes: null,
    is_active: true, sort_order: 3, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-5', family_id: 'demo-family', title: 'Take Out Trash', emoji_icon: '🗑️',
    assigned_to: 'demo-emma', frequency: 'weekly', days_of_week: [1, 4],
    time_of_day: 'evening', due_time: '19:00', points_value: 15, notes: null,
    is_active: true, sort_order: 4, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-6', family_id: 'demo-family', title: 'Brush Teeth', emoji_icon: '🦷',
    assigned_to: 'demo-lucas', frequency: 'daily', days_of_week: null,
    time_of_day: 'morning', due_time: '07:30', points_value: 5, notes: null,
    is_active: true, sort_order: 0, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-7', family_id: 'demo-family', title: 'Practice Guitar', emoji_icon: '🎸',
    assigned_to: 'demo-lucas', frequency: 'daily', days_of_week: null,
    time_of_day: 'afternoon', due_time: '15:30', points_value: 15, notes: null,
    is_active: true, sort_order: 1, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-8', family_id: 'demo-family', title: 'Feed the Dog', emoji_icon: '🐶',
    assigned_to: 'demo-lucas', frequency: 'daily', days_of_week: null,
    time_of_day: 'morning', due_time: '08:00', points_value: 10, notes: null,
    is_active: true, sort_order: 2, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-9', family_id: 'demo-family', title: 'Clean Room', emoji_icon: '🧹',
    assigned_to: 'demo-lucas', frequency: 'weekly', days_of_week: [6],
    time_of_day: 'morning', due_time: null, points_value: 25, notes: null,
    is_active: true, sort_order: 3, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-10', family_id: 'demo-family', title: 'Brush Teeth', emoji_icon: '🦷',
    assigned_to: 'demo-sofia', frequency: 'daily', days_of_week: null,
    time_of_day: 'morning', due_time: '07:30', points_value: 5, notes: null,
    is_active: true, sort_order: 0, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-11', family_id: 'demo-family', title: 'Math Practice', emoji_icon: '🔢',
    assigned_to: 'demo-sofia', frequency: 'daily', days_of_week: null,
    time_of_day: 'afternoon', due_time: '15:00', points_value: 20, notes: null,
    is_active: true, sort_order: 1, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'task-12', family_id: 'demo-family', title: 'Set the Table', emoji_icon: '🍽️',
    assigned_to: 'demo-sofia', frequency: 'daily', days_of_week: null,
    time_of_day: 'evening', due_time: '18:00', points_value: 10, notes: null,
    is_active: true, sort_order: 2, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
]

export const DEMO_INSTANCES: TaskInstance[] = DEMO_TASKS.map((task) => ({
  id: `inst-${task.id}`,
  task_id: task.id,
  profile_id: task.assigned_to!,
  family_id: 'demo-family',
  due_date: today,
  completed_at: null,
  points_awarded: null,
  created_at: new Date().toISOString(),
  task,
}))

export const DEMO_REWARDS: Reward[] = [
  {
    id: 'reward-1', family_id: 'demo-family', title: 'Extra Screen Time',
    emoji_icon: '📱', points_cost: 50, quantity_available: null,
    is_active: true, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'reward-2', family_id: 'demo-family', title: 'Choose Dinner',
    emoji_icon: '🍕', points_cost: 100, quantity_available: null,
    is_active: true, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'reward-3', family_id: 'demo-family', title: 'Movie Night Pick',
    emoji_icon: '🎬', points_cost: 150, quantity_available: null,
    is_active: true, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'reward-4', family_id: 'demo-family', title: 'Ice Cream Trip',
    emoji_icon: '🍦', points_cost: 200, quantity_available: 2,
    is_active: true, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
  {
    id: 'reward-5', family_id: 'demo-family', title: 'Sleep-over Party',
    emoji_icon: '🎉', points_cost: 300, quantity_available: 1,
    is_active: true, created_by: 'demo-dad', created_at: new Date().toISOString(),
  },
]
