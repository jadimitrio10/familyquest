import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Check, X, Bell, Moon, Globe, Clock, Thermometer, Users, Palette, Shield } from 'lucide-react'
import type { AppSettings, AppMember } from '@/types/app.types'

const THEME_OPTIONS = [
  { id:'light', label:'Light', icon:'☀️' },
  { id:'dark',  label:'Dark',  icon:'🌙' },
  { id:'system',label:'System',icon:'💻' },
]

const AVATAR_OPTIONS = ['👩','👨','👧','👦','👴','👵','🧑','👱','🧔','👩‍🦰','👩‍🦱','👩‍🦳','👨‍🦰','👨‍🦱','👨‍🦳']
const COLOR_OPTIONS = [
  { bg:'#FFE4E6', text:'#9F1239', bar:'#FB7185', name:'Rose' },
  { bg:'#E0F2FE', text:'#075985', bar:'#38BDF8', name:'Sky' },
  { bg:'#F3E8FF', text:'#6B21A8', bar:'#C084FC', name:'Purple' },
  { bg:'#DCFCE7', text:'#166534', bar:'#4ADE80', name:'Green' },
  { bg:'#FEF3C7', text:'#92400E', bar:'#FCD34D', name:'Yellow' },
  { bg:'#FFEDD5', text:'#9A3412', bar:'#FB923C', name:'Orange' },
]

interface SettingsViewProps {
  settings: AppSettings
  onUpdate: (patch: Partial<AppSettings>) => void
}

export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  const [editingMember, setEditingMember] = useState<string|null>(null)
  const [newMemberName, setNewMemberName] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('👤')
  const [newColorIdx, setNewColorIdx] = useState(0)
  const [newRole, setNewRole] = useState<'adult'|'child'>('child')

  const updateMember = (id:string, patch:Partial<AppMember>) => {
    onUpdate({ members: settings.members.map(m => m.id===id ? {...m,...patch} : m) })
  }
  const removeMember = (id:string) => {
    onUpdate({ members: settings.members.filter(m=>m.id!==id) })
  }
  const addMember = () => {
    if (!newName.trim()) return
    const c = COLOR_OPTIONS[newColorIdx]
    const member: AppMember = { id:`m-${Date.now()}`, name:newName.trim(), avatar:newAvatar, bgColor:c.bg, textColor:c.text, barColor:c.bar, role:newRole }
    onUpdate({ members:[...settings.members,member] })
    setNewName(''); setNewAvatar('👤'); setShowAddMember(false)
  }

  const Section = ({ icon: Icon, title, children }: { icon:React.ElementType; title:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:24, background:'var(--surface)', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 20px',borderBottom:'1px solid var(--border)',background:'var(--bg)' }}>
        <Icon size={16} color="var(--blue)" strokeWidth={2}/>
        <h2 style={{ fontSize:14,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>{title}</h2>
      </div>
      <div style={{ padding:'16px 20px' }}>{children}</div>
    </div>
  )

  const Row = ({ label, children }: { label:string; children:React.ReactNode }) => (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:14,marginBottom:14,borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:14,fontWeight:500,fontFamily:'Inter',color:'var(--text-1)' }}>{label}</span>
      {children}
    </div>
  )

  const Toggle = ({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) => (
    <motion.button onClick={()=>onChange(!value)} style={{ width:44,height:24,borderRadius:12,background:value?'var(--blue)':'var(--border)',border:'none',cursor:'pointer',position:'relative',transition:'background 200ms' }}>
      <motion.div animate={{x:value?22:2}} transition={{type:'spring',stiffness:500,damping:30}} style={{ width:20,height:20,borderRadius:'50%',background:'#fff',position:'absolute',top:2,boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}/>
    </motion.button>
  )

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)' }}>
      <div style={{ padding:'20px 24px 14px',background:'var(--surface)',borderBottom:'1px solid var(--border)' }}>
        <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>Settings</h1>
        <p style={{ fontSize:13,color:'var(--text-3)',fontFamily:'Inter',marginTop:2 }}>Customize your FamilyQuest experience</p>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:'20px 24px' }}>
        {/* Family */}
        <Section icon={Globe} title="Family Profile">
          <Row label="Family Name">
            <input value={settings.familyName} onChange={e=>onUpdate({familyName:e.target.value})}
              style={{ padding:'7px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'Inter',background:'var(--bg)',color:'var(--text-1)',outline:'none',textAlign:'right' }}/>
          </Row>
          <Row label="Location">
            <input value={settings.location} onChange={e=>onUpdate({location:e.target.value})}
              style={{ padding:'7px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'Inter',background:'var(--bg)',color:'var(--text-1)',outline:'none',textAlign:'right' }}/>
          </Row>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:14,fontWeight:500,fontFamily:'Inter',color:'var(--text-1)' }}>Week Starts On</span>
            <div style={{ display:'flex',gap:6 }}>
              {(['sunday','monday'] as const).map(d=>(
                <button key={d} onClick={()=>onUpdate({weekStartsOn:d})}
                  style={{ padding:'6px 14px',borderRadius:8,border:`1.5px solid ${settings.weekStartsOn===d?'var(--blue)':'var(--border)'}`,background:settings.weekStartsOn===d?'var(--blue-bg)':'transparent',color:settings.weekStartsOn===d?'var(--blue)':'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer',textTransform:'capitalize' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Members */}
        <Section icon={Users} title="Family Members">
          {settings.members.map(m=>(
            <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:40,height:40,borderRadius:'50%',background:m.bgColor,border:`2px solid ${m.barColor}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
                {m.avatar}
              </div>
              {editingMember===m.id ? (
                <div style={{ flex:1,display:'flex',gap:8,alignItems:'center' }}>
                  <input value={newMemberName} onChange={e=>setNewMemberName(e.target.value)} autoFocus
                    style={{ flex:1,padding:'6px 10px',borderRadius:8,border:'1.5px solid var(--blue)',fontSize:13,fontFamily:'Inter',outline:'none' }}/>
                  <button onClick={()=>{updateMember(m.id,{name:newMemberName});setEditingMember(null)}}
                    style={{ width:28,height:28,borderRadius:8,background:'var(--blue)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff' }}><Check size={13}/></button>
                  <button onClick={()=>setEditingMember(null)}
                    style={{ width:28,height:28,borderRadius:8,background:'var(--bg)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)' }}><X size={13}/></button>
                </div>
              ) : (
                <>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14,fontWeight:600,fontFamily:'Inter',color:'var(--text-1)' }}>{m.name}</p>
                    <p style={{ fontSize:11,color:'var(--text-3)',fontFamily:'Inter',textTransform:'capitalize' }}>{m.role}</p>
                  </div>
                  <button onClick={()=>{setEditingMember(m.id);setNewMemberName(m.name)}}
                    style={{ width:30,height:30,borderRadius:8,border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)' }}><Edit2 size={13}/></button>
                  <button onClick={()=>removeMember(m.id)}
                    style={{ width:30,height:30,borderRadius:8,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)' }}><Trash2 size={13}/></button>
                </>
              )}
            </div>
          ))}

          {/* Add member */}
          <AnimatePresence>
            {showAddMember && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{ overflow:'hidden',marginTop:12 }}>
                <div style={{ padding:14,borderRadius:12,background:'var(--blue-bg)',border:'1px solid var(--blue)',display:'flex',flexDirection:'column',gap:10 }}>
                  <div style={{ display:'flex',gap:8 }}>
                    <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name..." autoFocus
                      style={{ flex:1,padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'Inter',outline:'none' }}/>
                    <select value={newRole} onChange={e=>setNewRole(e.target.value as 'adult'|'child')}
                      style={{ padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'Inter',background:'var(--surface)',outline:'none',cursor:'pointer' }}>
                      <option value="adult">Adult</option>
                      <option value="child">Child</option>
                    </select>
                  </div>
                  <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                    {AVATAR_OPTIONS.map(a=>(
                      <button key={a} onClick={()=>setNewAvatar(a)}
                        style={{ width:36,height:36,borderRadius:8,border:`2px solid ${newAvatar===a?'var(--blue)':'transparent'}`,background:newAvatar===a?'rgba(79,70,229,0.1)':'transparent',fontSize:20,cursor:'pointer' }}>{a}</button>
                    ))}
                  </div>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                    {COLOR_OPTIONS.map((c,i)=>(
                      <button key={i} onClick={()=>setNewColorIdx(i)}
                        style={{ width:28,height:28,borderRadius:'50%',background:c.bar,border:`3px solid ${newColorIdx===i?'var(--text-1)':'transparent'}`,cursor:'pointer' }}/>
                    ))}
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <motion.button whileTap={{scale:0.95}} onClick={addMember}
                      style={{ flex:1,padding:'8px',borderRadius:8,background:'var(--blue)',color:'#fff',border:'none',fontSize:13,fontWeight:700,fontFamily:'Inter',cursor:'pointer' }}>Add Member</motion.button>
                    <button onClick={()=>setShowAddMember(false)}
                      style={{ padding:'8px 16px',borderRadius:8,background:'transparent',border:'1px solid var(--border)',fontSize:13,fontFamily:'Inter',cursor:'pointer',color:'var(--text-2)' }}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showAddMember && (
            <button onClick={()=>setShowAddMember(true)}
              style={{ display:'flex',alignItems:'center',gap:6,marginTop:12,padding:'8px 16px',borderRadius:10,border:'1.5px dashed var(--border)',background:'transparent',color:'var(--text-3)',fontSize:13,fontWeight:600,fontFamily:'Inter',cursor:'pointer',width:'100%',justifyContent:'center' }}>
              <Plus size={14}/> Add Member
            </button>
          )}
        </Section>

        {/* Preferences */}
        <Section icon={Clock} title="Preferences">
          <Row label="Time Format">
            <div style={{ display:'flex',gap:6 }}>
              {(['12h','24h'] as const).map(f=>(
                <button key={f} onClick={()=>onUpdate({timeFormat:f})}
                  style={{ padding:'6px 14px',borderRadius:8,border:`1.5px solid ${settings.timeFormat===f?'var(--blue)':'var(--border)'}`,background:settings.timeFormat===f?'var(--blue-bg)':'transparent',color:settings.timeFormat===f?'var(--blue)':'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>{f}</button>
              ))}
            </div>
          </Row>
          <Row label="Temperature">
            <div style={{ display:'flex',gap:6 }}>
              {(['F','C'] as const).map(u=>(
                <button key={u} onClick={()=>onUpdate({temperatureUnit:u})}
                  style={{ padding:'6px 14px',borderRadius:8,border:`1.5px solid ${settings.temperatureUnit===u?'var(--blue)':'var(--border)'}`,background:settings.temperatureUnit===u?'var(--blue-bg)':'transparent',color:settings.temperatureUnit===u?'var(--blue)':'var(--text-2)',fontSize:12,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>°{u}</button>
              ))}
            </div>
          </Row>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:14,fontWeight:500,fontFamily:'Inter',color:'var(--text-1)' }}>Notifications</span>
            <Toggle value={settings.notifications} onChange={v=>onUpdate({notifications:v})}/>
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          <div style={{ display:'flex',gap:10 }}>
            {THEME_OPTIONS.map(t=>(
              <button key={t.id} onClick={()=>onUpdate({theme:t.id as 'light'|'dark'|'system'})}
                style={{ flex:1,padding:'12px 8px',borderRadius:12,border:`2px solid ${settings.theme===t.id?'var(--blue)':'var(--border)'}`,background:settings.theme===t.id?'var(--blue-bg)':'var(--bg)',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
                <span style={{ fontSize:24 }}>{t.icon}</span>
                <span style={{ fontSize:12,fontWeight:600,fontFamily:'Inter',color:settings.theme===t.id?'var(--blue)':'var(--text-2)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section icon={Shield} title="Data">
          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            <button onClick={()=>{ if(confirm('Reset all data to defaults?')){ localStorage.clear(); window.location.reload() }}}
              style={{ padding:'9px 18px',borderRadius:10,border:'1.5px solid #EF4444',background:'#FEF2F2',color:'#EF4444',fontSize:13,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>
              Reset All Data
            </button>
            <button onClick={()=>{ const d=JSON.stringify(settings,null,2); const b=new Blob([d],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='familyquest-backup.json'; a.click() }}
              style={{ padding:'9px 18px',borderRadius:10,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text-2)',fontSize:13,fontWeight:600,fontFamily:'Inter',cursor:'pointer' }}>
              Export Backup
            </button>
          </div>
        </Section>

        <div style={{ textAlign:'center',padding:'8px 0 24px',color:'var(--text-3)',fontSize:12,fontFamily:'Inter' }}>
          FamilyQuest v1.0 · Made with ❤️
        </div>
      </div>
    </div>
  )
}
