export interface Family {
  id: string
  name: string
  invite_code: string
  timezone: string
  owner_id: string
  created_at: string
}

export interface Profile {
  id: string
  family_id: string
  user_id: string | null
  name: string
  avatar_emoji: string
  color_hex: string
  accent_hex: string
  role: 'parent' | 'child'
  points_balance: number
  total_points_earned: number
  current_streak: number
  longest_streak: number
  created_at: string
}

export interface Task {
  id: string
  family_id: string
  title: string
  emoji_icon: string
  assigned_to: string | null
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  days_of_week: number[] | null
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime'
  due_time: string | null
  points_value: number
  notes: string | null
  is_active: boolean
  sort_order: number
  created_by: string | null
  created_at: string
}

export interface TaskInstance {
  id: string
  task_id: string
  profile_id: string
  family_id: string
  due_date: string
  completed_at: string | null
  points_awarded: number | null
  created_at: string
  task?: Task
}

export interface Reward {
  id: string
  family_id: string
  title: string
  emoji_icon: string
  points_cost: number
  quantity_available: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface Redemption {
  id: string
  reward_id: string
  profile_id: string
  family_id: string
  status: 'pending' | 'approved' | 'denied'
  requested_at: string
  resolved_at: string | null
  resolved_by: string | null
  reward?: Reward
  profile?: Profile
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime'
export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly'
export type Role = 'parent' | 'child'
