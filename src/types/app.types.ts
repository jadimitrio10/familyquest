export type ViewId = 'calendar' | 'tasks' | 'rewards' | 'meals' | 'photos' | 'sleep' | 'settings'

export interface AppMember {
  id: string
  name: string
  avatar: string
  bgColor: string
  textColor: string
  barColor: string
  role: 'adult' | 'child'
}

export interface AppSettings {
  familyName: string
  location: string
  temperatureUnit: 'F' | 'C'
  timeFormat: '12h' | '24h'
  weekStartsOn: 'sunday' | 'monday'
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  members: AppMember[]
  // Extended settings
  language: 'es' | 'en' | 'fr'
  fontSize: 'small' | 'normal' | 'large' | 'xlarge'
  accentColor: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  familyName: 'The Demo Family',
  location: 'New York, NY',
  temperatureUnit: 'F',
  timeFormat: '12h',
  weekStartsOn: 'sunday',
  theme: 'light',
  notifications: true,
  members: [
    { id: 'emma',  name: 'Emma',  avatar: '👩', bgColor: '#FFE4E6', textColor: '#9F1239', barColor: '#FB7185', role: 'adult'  },
    { id: 'wei',   name: 'Wei',   avatar: '👨', bgColor: '#E0F2FE', textColor: '#075985', barColor: '#38BDF8', role: 'adult'  },
    { id: 'julie', name: 'Julie', avatar: '👧', bgColor: '#F3E8FF', textColor: '#6B21A8', barColor: '#C084FC', role: 'child'  },
  ],
  language: 'es',
  fontSize: 'normal',
  accentColor: '#007AFF',
}
