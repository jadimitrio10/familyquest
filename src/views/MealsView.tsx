import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MEAL_TYPES = ['Breakfast','Lunch','Dinner','Snack'] as const
type MealType = typeof MEAL_TYPES[number]

interface Meal { id:string; day:string; type:MealType; name:string; emoji:string }

const INIT_MEALS: Meal[] = [
  { id:'m1',day:'Mon',type:'Breakfast',name:'Oatmeal with berries',emoji:'🥣' },
  { id:'m2',day:'Mon',type:'Lunch',name:'Chicken salad',emoji:'🥗' },
  { id:'m3',day:'Mon',type:'Dinner',name:'Pasta carbonara',emoji:'🍝' },
  { id:'m4',day:'Tue',type:'Breakfast',name:'Avocado toast',emoji:'🥑' },
  { id:'m5',day:'Tue',type:'Dinner',name:'Grilled salmon',emoji:'🐟' },
  { id:'m6',day:'Wed',type:'Lunch',name:'Make salad',emoji:'🥗' },
  { id:'m7',day:'Thu',type:'Dinner',name:'Tacos',emoji:'🌮' },
  { id:'m8',day:'Fri',type:'Dinner',name:'Pizza night',emoji:'🍕' },
  { id:'m9',day:'Sat',type:'Breakfast',name:'Pancakes',emoji:'🥞' },
  { id:'m10',day:'Sat',type:'Dinner',name:'BBQ',emoji:'🥩' },
  { id:'m11',day:'Sun',type:'Breakfast',name:'French toast',emoji:'🍞' },
  { id:'m12',day:'Sun',type:'Dinner',name:'Roast chicken',emoji:'🍗' },
]

const TYPE_COLORS: Record<MealType,string> = { Breakfast:'#FEF3C7', Lunch:'#DCFCE7', Dinner:'#EDE9FE', Snack:'#FFE4E6' }
const TYPE_TEXT: Record<MealType,string> = { Breakfast:'#92400E', Lunch:'#166534', Dinner:'#6B21A8', Snack:'#9F1239' }

export function MealsView() {
  const [meals, setMeals] = useState<Meal[]>(INIT_MEALS)
  const [adding, setAdding] = useState<{day:string;type:MealType}|null>(null)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🍽️')

  const getMeal = (day:string, type:MealType) => meals.find(m=>m.day===day&&m.type===type)
  const remove = (id:string) => setMeals(ms=>ms.filter(m=>m.id!==id))
  const add = () => {
    if (!adding||!newName.trim()) return
    setMeals(ms=>[...ms,{id:`m-${Date.now()}`,day:adding.day,type:adding.type,name:newName.trim(),emoji:newEmoji}])
    setNewName(''); setAdding(null)
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)' }}>
      <div style={{ padding:'20px 24px 14px',background:'var(--surface)',borderBottom:'1px solid var(--border)' }}>
        <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>Meal Planner</h1>
        <p style={{ fontSize:13,color:'var(--text-3)',fontFamily:'Inter',marginTop:4 }}>Plan your family's meals for the week</p>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:16 }}>
        <div style={{ display:'grid',gridTemplateColumns:`120px repeat(${DAYS.length},1fr)`,gap:0,background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden' }}>
          {/* Header row */}
          <div style={{ background:'var(--bg)',padding:'10px 12px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)' }}/>
          {DAYS.map(d=>(
            <div key={d} style={{ textAlign:'center',padding:'10px 4px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)',fontWeight:700,fontSize:12,color:'var(--text-2)',fontFamily:'Inter',background:'var(--bg)' }}>{d}</div>
          ))}
          {/* Meal type rows */}
          {MEAL_TYPES.map(type=>(
            <>
              <div key={type} style={{ padding:'12px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)',background:TYPE_COLORS[type],display:'flex',alignItems:'center' }}>
                <span style={{ fontSize:11,fontWeight:700,color:TYPE_TEXT[type],fontFamily:'Inter',textTransform:'uppercase',letterSpacing:'0.05em' }}>{type}</span>
              </div>
              {DAYS.map(day=>{
                const meal = getMeal(day,type)
                const isAdding = adding?.day===day && adding?.type===type
                return (
                  <div key={`${day}-${type}`} style={{ borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)',padding:6,minHeight:64,background:meal?TYPE_COLORS[type]+'44':'transparent',position:'relative' }}>
                    {meal ? (
                      <div style={{ fontSize:12 }}>
                        <div style={{ fontSize:20,marginBottom:2 }}>{meal.emoji}</div>
                        <p style={{ fontSize:11,fontWeight:500,color:'var(--text-1)',fontFamily:'Inter',lineHeight:1.3 }}>{meal.name}</p>
                        <button onClick={()=>remove(meal.id)} style={{ position:'absolute',top:4,right:4,width:18,height:18,borderRadius:4,border:'none',background:'rgba(0,0,0,0.06)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)' }}><Trash2 size={10}/></button>
                      </div>
                    ) : isAdding ? (
                      <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                        <div style={{ display:'flex',gap:4 }}>
                          <input value={newEmoji} onChange={e=>setNewEmoji(e.target.value)} maxLength={2} style={{ width:30,padding:'3px',borderRadius:6,border:'1px solid var(--border)',fontSize:14,textAlign:'center',background:'var(--surface)',outline:'none' }}/>
                          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')add();if(e.key==='Escape')setAdding(null)}} placeholder="Meal..." autoFocus
                            style={{ flex:1,padding:'3px 6px',borderRadius:6,border:'1px solid var(--border)',fontSize:11,fontFamily:'Inter',background:'var(--surface)',outline:'none' }}/>
                        </div>
                        <div style={{ display:'flex',gap:4 }}>
                          <button onClick={add} style={{ flex:1,padding:'3px',borderRadius:6,background:'var(--blue)',color:'#fff',border:'none',fontSize:10,fontWeight:700,cursor:'pointer' }}>Add</button>
                          <button onClick={()=>setAdding(null)} style={{ width:28,padding:'3px',borderRadius:6,background:'var(--border)',color:'var(--text-2)',border:'none',fontSize:10,cursor:'pointer' }}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={()=>{setAdding({day,type});setNewName('');setNewEmoji('🍽️')}}
                        style={{ width:'100%',height:'100%',minHeight:50,border:'none',background:'transparent',cursor:'pointer',color:'var(--border)',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>
                        <Plus size={14} color="var(--text-3)" strokeWidth={1.5}/>
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
