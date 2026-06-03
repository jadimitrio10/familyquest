export interface TaskTemplate {
  id: string
  emoji: string
  title: string
  category: 'morning' | 'afternoon' | 'night' | 'home' | 'personal'
  suggestedPoints: number
  suggestedTimeSlot: 'morning' | 'afternoon' | 'evening'
  description?: string
}

export const TASK_LIBRARY: TaskTemplate[] = [
  // ── MAÑANA ──
  { id:'t-teeth-am',  emoji:'🦷', title:'Lavarse los dientes',      category:'morning',  suggestedPoints:5,  suggestedTimeSlot:'morning',   description:'Lavado completo de 2 minutos' },
  { id:'t-shower',    emoji:'🚿', title:'Bañarse / ducharse',        category:'morning',  suggestedPoints:10, suggestedTimeSlot:'morning' },
  { id:'t-uniform',   emoji:'👕', title:'Ponerse el uniforme / ropa', category:'morning', suggestedPoints:5,  suggestedTimeSlot:'morning' },
  { id:'t-breakfast', emoji:'🥣', title:'Desayunar',                 category:'morning',  suggestedPoints:5,  suggestedTimeSlot:'morning' },
  { id:'t-bed',       emoji:'🛏️', title:'Hacer la cama',             category:'morning',  suggestedPoints:10, suggestedTimeSlot:'morning' },
  { id:'t-backpack',  emoji:'🎒', title:'Preparar la mochila',        category:'morning',  suggestedPoints:10, suggestedTimeSlot:'morning' },

  // ── TARDE / ESCUELA ──
  { id:'t-snack',     emoji:'🍎', title:'Llegar y merendar',          category:'afternoon', suggestedPoints:5,  suggestedTimeSlot:'afternoon' },
  { id:'t-homework',  emoji:'✏️', title:'Hacer la tarea',             category:'afternoon', suggestedPoints:20, suggestedTimeSlot:'afternoon' },
  { id:'t-read',      emoji:'📖', title:'Leer 20 minutos',             category:'afternoon', suggestedPoints:15, suggestedTimeSlot:'afternoon' },
  { id:'t-music',     emoji:'🎵', title:'Practicar instrumento',       category:'afternoon', suggestedPoints:15, suggestedTimeSlot:'afternoon' },

  // ── NOCHE ──
  { id:'t-teeth-pm',  emoji:'🦷', title:'Lavarse los dientes (noche)', category:'night', suggestedPoints:5,  suggestedTimeSlot:'evening' },
  { id:'t-room',      emoji:'🧹', title:'Recoger el cuarto',            category:'night', suggestedPoints:15, suggestedTimeSlot:'evening' },
  { id:'t-clothes',   emoji:'👗', title:'Preparar ropa para mañana',    category:'night', suggestedPoints:10, suggestedTimeSlot:'evening' },
  { id:'t-pyjama',    emoji:'🌙', title:'Pijama y a la cama',           category:'night', suggestedPoints:5,  suggestedTimeSlot:'evening' },

  // ── HOGAR ──
  { id:'t-table',     emoji:'🍽️', title:'Poner la mesa',              category:'home', suggestedPoints:10, suggestedTimeSlot:'evening' },
  { id:'t-dishes',    emoji:'🧼', title:'Lavar los platos',            category:'home', suggestedPoints:15, suggestedTimeSlot:'evening' },
  { id:'t-trash',     emoji:'🗑️', title:'Sacar la basura',            category:'home', suggestedPoints:15, suggestedTimeSlot:'evening' },
  { id:'t-pet',       emoji:'🐶', title:'Darle de comer a la mascota', category:'home', suggestedPoints:10, suggestedTimeSlot:'morning' },
  { id:'t-sweep',     emoji:'🧹', title:'Barrer / trapear',            category:'home', suggestedPoints:20, suggestedTimeSlot:'afternoon' },
  { id:'t-cleanroom', emoji:'✨', title:'Limpiar su cuarto',           category:'home', suggestedPoints:25, suggestedTimeSlot:'afternoon' },

  // ── LOGROS PERSONALES ──
  { id:'t-exercise',  emoji:'🏃', title:'Hacer ejercicio',             category:'personal', suggestedPoints:20, suggestedTimeSlot:'afternoon' },
  { id:'t-water',     emoji:'💧', title:'Beber 8 vasos de agua',       category:'personal', suggestedPoints:10, suggestedTimeSlot:'afternoon' },
  { id:'t-noscreens', emoji:'📵', title:'Sin pantallas antes de dormir',category:'personal',suggestedPoints:15, suggestedTimeSlot:'evening' },
  { id:'t-hobby',     emoji:'🎨', title:'Practicar un hobby',          category:'personal', suggestedPoints:15, suggestedTimeSlot:'afternoon' },
]

export const CATEGORY_META = {
  morning:   { label: 'Mañana',           emoji: '🌅', color: '#FF9500' },
  afternoon: { label: 'Tarde / Escuela',  emoji: '📚', color: '#007AFF' },
  night:     { label: 'Noche',            emoji: '🌙', color: '#5856D6' },
  home:      { label: 'Hogar',            emoji: '🏠', color: '#34C759' },
  personal:  { label: 'Logros personales',emoji: '🎯', color: '#AF52DE' },
}

export type TaskCategory = keyof typeof CATEGORY_META
