export interface CalendarMember {
  id: string
  name: string
  avatar: string        // emoji fallback while Stitch assets load
  avatarUrl?: string    // Stitch-generated photo avatar
  bgVar: string         // CSS var name e.g. '--emma-bg'
  textVar: string
  barVar: string
  bgColor: string       // hex
  textColor: string
  barColor: string
}

export interface CalendarEvent {
  id: string
  title: string
  emoji: string
  memberId: string
  date: string          // 'YYYY-MM-DD'
  startTime?: string    // '07:00'
  endTime?: string      // '07:30'
  allDay?: boolean
  completed: boolean
  recurrence?: string   // 'daily' | 'weekly' | undefined
}

export const MEMBERS: CalendarMember[] = [
  {
    id: 'emma',
    name: 'Emma',
    avatar: '👩',
    bgColor: '#FFE4E6',
    textColor: '#9F1239',
    barColor: '#FB7185',
    bgVar: '--emma-bg',
    textVar: '--emma-text',
    barVar: '--emma-bar',
  },
  {
    id: 'wei',
    name: 'Wei',
    avatar: '👨',
    bgColor: '#E0F2FE',
    textColor: '#075985',
    barColor: '#38BDF8',
    bgVar: '--wei-bg',
    textVar: '--wei-text',
    barVar: '--wei-bar',
  },
  {
    id: 'julie',
    name: 'Julie',
    avatar: '👧',
    bgColor: '#F3E8FF',
    textColor: '#6B21A8',
    barColor: '#C084FC',
    bgVar: '--julie-bg',
    textVar: '--julie-text',
    barVar: '--julie-bar',
  },
]

// Demo events matching the reference image
export const DEMO_EVENTS: CalendarEvent[] = [
  // Thu Sep 11
  { id:'e1',  title:'Running',          emoji:'🏃', memberId:'emma',  date:'2024-09-11', startTime:'07:00', endTime:'07:30', completed:false, recurrence:'daily' },
  { id:'e2',  title:'Birthday to Jess', emoji:'🎂', memberId:'emma',  date:'2024-09-11', startTime:'12:30', endTime:'13:30', completed:false },
  { id:'e3',  title:'See a doctor',     emoji:'🩺', memberId:'wei',   date:'2024-09-11', startTime:'14:00', endTime:'15:00', completed:false },
  // Fri Sep 12
  { id:'e4',  title:'Running',          emoji:'🏃', memberId:'wei',   date:'2024-09-12', startTime:'07:30', endTime:'08:00', completed:false, recurrence:'daily' },
  { id:'e5',  title:'Running',          emoji:'🏃', memberId:'emma',  date:'2024-09-12', startTime:'08:00', endTime:'09:00', completed:false },
  { id:'e6',  title:'Make salad',       emoji:'🥗', memberId:'julie', date:'2024-09-12', startTime:'12:30', endTime:'13:00', completed:false },
  // Sat Sep 13
  { id:'e7',  title:'Running',          emoji:'🏃', memberId:'emma',  date:'2024-09-13', startTime:'07:00', endTime:'07:30', completed:false },
  { id:'e8',  title:'Party',            emoji:'🎉', memberId:'emma',  date:'2024-09-13', startTime:'12:15', endTime:'13:45', completed:false },
  { id:'e9',  title:'Play tennis',      emoji:'🎾', memberId:'wei',   date:'2024-09-13', startTime:'14:00', endTime:'14:45', completed:false },
  // Sun Sep 14
  { id:'e10', title:'On business trip', emoji:'✈️', memberId:'wei',   date:'2024-09-14', allDay:true,       completed:false },
  { id:'e11', title:'Make salad',       emoji:'🥗', memberId:'emma',  date:'2024-09-14', startTime:'12:30', endTime:'13:00', completed:false },
  { id:'e12', title:'dessert',          emoji:'🍮', memberId:'julie', date:'2024-09-14', startTime:'14:00', endTime:'15:00', completed:false },
  // Mon Sep 15
  { id:'e13', title:'Running',          emoji:'🏃', memberId:'emma',  date:'2024-09-15', startTime:'07:00', endTime:'07:30', completed:false },
  { id:'e14', title:'Reading',          emoji:'📖', memberId:'emma',  date:'2024-09-15', startTime:'12:30', endTime:'13:30', completed:false },
  { id:'e15', title:'Play tennis',      emoji:'🎾', memberId:'wei',   date:'2024-09-15', startTime:'14:00', endTime:'14:45', completed:false },
  // Tue Sep 16
  { id:'e16', title:'On business trip', emoji:'✈️', memberId:'wei',   date:'2024-09-16', allDay:true,       completed:false },
  { id:'e17', title:'Make salad',       emoji:'🥗', memberId:'julie', date:'2024-09-16', startTime:'12:30', endTime:'13:00', completed:false },
  { id:'e18', title:'Dance Class',      emoji:'💃', memberId:'julie', date:'2024-09-16', startTime:'15:00', endTime:'16:30', completed:false },
  // Wed Sep 17
  { id:'e19', title:'On business trip', emoji:'✈️', memberId:'wei',   date:'2024-09-17', allDay:true,       completed:false },
  { id:'e20', title:'Running',          emoji:'🏃', memberId:'emma',  date:'2024-09-17', startTime:'07:00', endTime:'07:30', completed:false },
  { id:'e21', title:'Play tennis',      emoji:'🎾', memberId:'wei',   date:'2024-09-17', startTime:'14:00', endTime:'14:45', completed:false },
]

export const WEEK_DAYS = [
  { date: '2024-09-11', label: 'Thu', num: 11, isToday: true },
  { date: '2024-09-12', label: 'Fri', num: 12 },
  { date: '2024-09-13', label: 'Sat', num: 13 },
  { date: '2024-09-14', label: 'Sun', num: 14 },
  { date: '2024-09-15', label: 'Mon', num: 15 },
  { date: '2024-09-16', label: 'Tue', num: 16 },
  { date: '2024-09-17', label: 'Wed', num: 17 },
]
