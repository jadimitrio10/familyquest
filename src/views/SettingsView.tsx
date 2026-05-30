import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Check, X, Camera, Upload, Bell, Globe, Clock, Thermometer, Users, Palette, Shield, Save } from 'lucide-react'
import { useMembersStore, type Member } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { EmojiPicker } from '@/components/shared/EmojiPicker'
import type { AppSettings } from '@/types/app.types'
import toast from 'react-hot-toast'

const COLOR_OPTIONS = [
  { bg:'#FFE4E6', text:'#9F1239', bar:'#FB7185', name:'Rose'   },
  { bg:'#E0F2FE', text:'#075985', bar:'#38BDF8', name:'Sky'    },
  { bg:'#F3E8FF', text:'#6B21A8', bar:'#C084FC', name:'Purple' },
  { bg:'#DCFCE7', text:'#166534', bar:'#4ADE80', name:'Green'  },
  { bg:'#FEF3C7', text:'#92400E', bar:'#FCD34D', name:'Yellow' },
  { bg:'#FFEDD5', text:'#9A3412', bar:'#FB923C', name:'Orange' },
  { bg:'#E0E7FF', text:'#3730A3', bar:'#818CF8', name:'Indigo' },
  { bg:'#CCFBF1', text:'#134E4A', bar:'#2DD4BF', name:'Teal'  },
]

interface SettingsViewProps {
  settings: AppSettings
  onUpdate: (patch: Partial<AppSettings>) => void
}

export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  const { members, addMember, updateMember, removeMember, uploadPhoto, removePhoto } = useMembersStore()

  // Local draft state — changes apply only on Save
  const [draft, setDraft] = useState<AppSettings>(settings)
  const [isDirty, setIsDirty] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null)

  // New member form
  const [newForm, setNewForm] = useState({ name:'', emoji:'👤', colorIdx:0, role:'child' as 'adult'|'child' })

  const fileRefs = useRef<Record<string, HTMLInputElement>>({})

  const updateDraft = (patch: Partial<AppSettings>) => {
    setDraft(d => ({ ...d, ...patch }))
    setIsDirty(true)
  }

  function handleSave() {
    onUpdate(draft)
    setIsDirty(false)
    toast.success('Settings saved! ✅', { duration: 2000 })
  }

  function handlePhotoUpload(memberId: string, file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      uploadPhoto(memberId, dataUrl)
      toast.success('Photo updated! 📸', { duration: 1500 })
    }
    reader.readAsDataURL(file)
  }

  function handleAddMember() {
    if (!newForm.name.trim()) return
    const c = COLOR_OPTIONS[newForm.colorIdx]
    addMember({ name: newForm.name.trim(), emoji: newForm.emoji, bgColor: c.bg, textColor: c.text, barColor: c.bar, role: newForm.role })
    setNewForm({ name:'', emoji:'👤', colorIdx:0, role:'child' })
    setShowAddMember(false)
    toast.success(`${newForm.name} added! 👋`)
  }

  const Section = ({ icon:Icon, title, children }: { icon:React.ElementType; title:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:20, background:'var(--surface)', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
        <Icon size={16} color="var(--blue)" strokeWidth={2}/>
        <h2 style={{ fontSize:14, fontWeight:700, fontFamily:'Inter', color:'var(--text-1)' }}>{title}</h2>
      </div>
      <div style={{ padding:'16px 20px' }}>{children}</div>
    </div>
  )

  const Row = ({ label, sub, children }: { label:string; sub?:string; children:React.ReactNode }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:14, marginBottom:14, borderBottom:'1px solid var(--border)' }}>
      <div>
        <span style={{ fontSize:14, fontWeight:500, fontFamily:'Inter', color:'var(--text-1)' }}>{label}</span>
        {sub && <p style={{ fontSize:11, color:'var(--text-3)', fontFamily:'Inter', marginTop:2 }}>{sub}</p>}
      </div>
      {children}
    </div>
  )

  const Toggle = ({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) => (
    <motion.button onClick={() => onChange(!value)}
      style={{ width:44, height:24, borderRadius:12, background:value?'var(--blue)':'var(--border)', border:'none', cursor:'pointer', position:'relative', transition:'background 200ms', flexShrink:0 }}>
      <motion.div animate={{ x:value?22:2 }} transition={{ type:'spring', stiffness:500, damping:30 }}
        style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:2, boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}/>
    </motion.button>
  )

  const Pill = ({ options, value, onChange }: { options:{v:string;l:string}[]; value:string; onChange:(v:string)=>void }) => (
    <div style={{ display:'flex', gap:6 }}>
      {options.map(opt=>(
        <button key={opt.v} onClick={() => onChange(opt.v)}
          style={{ padding:'6px 14px', borderRadius:8, border:`1.5px solid ${value===opt.v?'var(--blue)':'var(--border)'}`, background:value===opt.v?'var(--blue-bg)':'transparent', color:value===opt.v?'var(--blue)':'var(--text-2)', fontSize:12, fontWeight:600, fontFamily:'Inter', cursor:'pointer' }}>
          {opt.l}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      {/* Header with Save */}
      <div style={{ padding:'16px 24px 14px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, fontFamily:'Inter', color:'var(--text-1)' }}>Settings</h1>
          <p style={{ fontSize:13, color:'var(--text-3)', fontFamily:'Inter', marginTop:2 }}>Customize your FamilyQuest experience</p>
        </div>
        <AnimatePresence>
          {isDirty && (
            <motion.button initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
              onClick={handleSave} whileTap={{ scale:0.96 }}
              style={{ display:'flex', alignItems:'center', gap:8, background:'var(--blue)', color:'#fff', borderRadius:14, padding:'10px 20px', fontSize:14, fontWeight:700, fontFamily:'Inter', border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,70,229,0.35)' }}>
              <Save size={16}/> Save Changes
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

        {/* FAMILY PROFILE */}
        <Section icon={Globe} title="Family Profile">
          <Row label="Family Name">
            <input value={draft.familyName} onChange={e=>updateDraft({familyName:e.target.value})}
              style={{ padding:'8px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--bg)', color:'var(--text-1)', outline:'none', width:220, textAlign:'right' }}/>
          </Row>
          <Row label="Location">
            <input value={draft.location} onChange={e=>updateDraft({location:e.target.value})}
              style={{ padding:'8px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--bg)', color:'var(--text-1)', outline:'none', width:220, textAlign:'right' }}/>
          </Row>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, fontWeight:500, fontFamily:'Inter', color:'var(--text-1)' }}>Week Starts On</span>
            <Pill options={[{v:'sunday',l:'Sunday'},{v:'monday',l:'Monday'}]} value={draft.weekStartsOn} onChange={v=>updateDraft({weekStartsOn:v as 'sunday'|'monday'})}/>
          </div>
        </Section>

        {/* FAMILY MEMBERS */}
        <Section icon={Users} title="Family Members">
          {members.map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              {/* Avatar + photo upload */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <MemberAvatar member={m} size={50}/>
                <button
                  onClick={() => fileRefs.current[m.id]?.click()}
                  title="Upload photo"
                  style={{ position:'absolute', bottom:-2, right:-2, width:20, height:20, borderRadius:'50%', background:'var(--blue)', border:'2px solid var(--surface)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
                  <Camera size={10}/>
                </button>
                <input ref={el=>{ if(el) fileRefs.current[m.id]=el }} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e=>{ const f=e.target.files?.[0]; if(f) handlePhotoUpload(m.id,f) }}/>
              </div>

              {editingId===m.id ? (
                <div style={{ flex:1, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  {/* Emoji picker */}
                  <div style={{ position:'relative' }}>
                    <button onClick={() => setShowEmojiFor(showEmojiFor===m.id?null:m.id)}
                      style={{ width:38, height:38, borderRadius:8, border:'1.5px solid var(--border)', background:'var(--bg)', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {m.emoji}
                    </button>
                    <AnimatePresence>
                      {showEmojiFor===m.id && (
                        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
                          style={{ position:'absolute', top:'110%', left:0, zIndex:99 }}>
                          <EmojiPicker value={m.emoji} onChange={e=>{ updateMember(m.id,{emoji:e}); setShowEmojiFor(null) }} onClose={()=>setShowEmojiFor(null)}/>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} autoFocus
                    style={{ flex:1, minWidth:100, padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--blue)', fontSize:14, fontFamily:'Inter', outline:'none' }}/>
                  <div style={{ display:'flex', gap:4 }}>
                    {COLOR_OPTIONS.map((c,i)=>(
                      <button key={i} onClick={()=>updateMember(m.id,{bgColor:c.bg,textColor:c.text,barColor:c.bar})}
                        style={{ width:22, height:22, borderRadius:'50%', background:c.bar, border:`3px solid ${m.barColor===c.bar?'var(--text-1)':'transparent'}`, cursor:'pointer' }}/>
                    ))}
                  </div>
                  <select value={m.role} onChange={e=>updateMember(m.id,{role:e.target.value as 'adult'|'child'})}
                    style={{ padding:'7px 10px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, fontFamily:'Inter', background:'var(--surface)', cursor:'pointer', outline:'none' }}>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                  </select>
                  <button onClick={()=>{ updateMember(m.id,{name:editName}); setEditingId(null) }}
                    style={{ width:32, height:32, borderRadius:8, background:'var(--blue)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Check size={14}/></button>
                  <button onClick={()=>setEditingId(null)}
                    style={{ width:32, height:32, borderRadius:8, background:'var(--bg)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}><X size={14}/></button>
                </div>
              ) : (
                <>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <p style={{ fontSize:15, fontWeight:700, fontFamily:'Inter', color:'var(--text-1)' }}>{m.name}</p>
                      <span style={{ fontSize:10, fontWeight:600, color:m.textColor, background:m.bgColor, padding:'2px 8px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.04em' }}>{m.role}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center' }}>
                      {m.photoDataUrl ? (
                        <button onClick={()=>removePhoto(m.id)}
                          style={{ fontSize:11, color:'var(--text-3)', fontFamily:'Inter', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                          <X size={10}/> Remove photo
                        </button>
                      ) : (
                        <button onClick={()=>fileRefs.current[m.id]?.click()}
                          style={{ fontSize:11, color:'var(--blue)', fontFamily:'Inter', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                          <Upload size={10}/> Upload photo
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={()=>{ setEditingId(m.id); setEditName(m.name) }}
                      style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)' }}><Edit2 size={13}/></button>
                    <button onClick={()=>{ if(confirm(`Remove ${m.name}?`)) removeMember(m.id) }}
                      style={{ width:32, height:32, borderRadius:8, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}><Trash2 size={13}/></button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add member form */}
          <AnimatePresence>
            {showAddMember && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ overflow:'hidden', marginTop:12 }}>
                <div style={{ padding:16, borderRadius:14, background:'var(--blue-bg)', border:'1px solid rgba(79,70,229,0.2)', display:'flex', flexDirection:'column', gap:12 }}>
                  <h3 style={{ fontSize:13, fontWeight:700, fontFamily:'Inter', color:'var(--text-1)', marginBottom:2 }}>New Member</h3>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    {/* Emoji */}
                    <div style={{ position:'relative' }}>
                      <button onClick={()=>setShowEmojiFor(showEmojiFor==='new'?null:'new')}
                        style={{ width:44, height:44, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--surface)', fontSize:24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {newForm.emoji}
                      </button>
                      <AnimatePresence>
                        {showEmojiFor==='new' && (
                          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
                            style={{ position:'absolute', top:'110%', left:0, zIndex:99 }}>
                            <EmojiPicker value={newForm.emoji} onChange={e=>{ setNewForm(f=>({...f,emoji:e})); setShowEmojiFor(null) }} onClose={()=>setShowEmojiFor(null)}/>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <input value={newForm.name} onChange={e=>setNewForm(f=>({...f,name:e.target.value}))} placeholder="Name..." autoFocus
                      style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, fontFamily:'Inter', background:'var(--surface)', outline:'none' }}/>
                    <select value={newForm.role} onChange={e=>setNewForm(f=>({...f,role:e.target.value as 'adult'|'child'}))}
                      style={{ padding:'10px 12px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:13, fontFamily:'Inter', background:'var(--surface)', cursor:'pointer', outline:'none' }}>
                      <option value="adult">Adult</option>
                      <option value="child">Child</option>
                    </select>
                  </div>
                  {/* Color selector */}
                  <div>
                    <p style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', fontFamily:'Inter', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Color Theme</p>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {COLOR_OPTIONS.map((c,i)=>(
                        <button key={i} onClick={()=>setNewForm(f=>({...f,colorIdx:i}))}
                          style={{ width:32, height:32, borderRadius:'50%', background:c.bar, border:`3px solid ${newForm.colorIdx===i?'var(--text-1)':'transparent'}`, cursor:'pointer', boxShadow:newForm.colorIdx===i?'0 0 0 2px var(--surface)':undefined }}
                          title={c.name}/>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <motion.button whileTap={{ scale:0.95 }} onClick={handleAddMember} disabled={!newForm.name.trim()}
                      style={{ flex:1, padding:'10px', borderRadius:10, background:newForm.name.trim()?'var(--blue)':'var(--border)', color:'#fff', border:'none', fontSize:14, fontWeight:700, fontFamily:'Inter', cursor:newForm.name.trim()?'pointer':'default' }}>
                      Add Member
                    </motion.button>
                    <button onClick={()=>setShowAddMember(false)}
                      style={{ padding:'10px 18px', borderRadius:10, background:'transparent', border:'1px solid var(--border)', fontSize:14, fontFamily:'Inter', cursor:'pointer', color:'var(--text-2)' }}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showAddMember && (
            <button onClick={()=>setShowAddMember(true)}
              style={{ display:'flex', alignItems:'center', gap:6, marginTop:12, padding:'10px 16px', borderRadius:12, border:'1.5px dashed var(--border)', background:'transparent', color:'var(--text-3)', fontSize:13, fontWeight:600, fontFamily:'Inter', cursor:'pointer', width:'100%', justifyContent:'center' }}>
              <Plus size={14}/> Add Family Member
            </button>
          )}
        </Section>

        {/* PREFERENCES */}
        <Section icon={Clock} title="Preferences">
          <Row label="Time Format" sub="How times are displayed">
            <Pill options={[{v:'12h',l:'12h'},{v:'24h',l:'24h'}]} value={draft.timeFormat} onChange={v=>updateDraft({timeFormat:v as '12h'|'24h'})}/>
          </Row>
          <Row label="Temperature Unit" sub="Weather display">
            <Pill options={[{v:'F',l:'°F'},{v:'C',l:'°C'}]} value={draft.temperatureUnit} onChange={v=>updateDraft({temperatureUnit:v as 'F'|'C'})}/>
          </Row>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <span style={{ fontSize:14, fontWeight:500, fontFamily:'Inter', color:'var(--text-1)' }}>Notifications</span>
              <p style={{ fontSize:11, color:'var(--text-3)', fontFamily:'Inter', marginTop:2 }}>Get reminders for events and tasks</p>
            </div>
            <Toggle value={draft.notifications} onChange={v=>updateDraft({notifications:v})}/>
          </div>
        </Section>

        {/* APPEARANCE */}
        <Section icon={Palette} title="Appearance">
          <p style={{ fontSize:12, color:'var(--text-3)', fontFamily:'Inter', marginBottom:12 }}>Choose your preferred color theme</p>
          <div style={{ display:'flex', gap:10 }}>
            {[{id:'light',icon:'☀️',label:'Light'},{id:'dark',icon:'🌙',label:'Dark'},{id:'system',icon:'💻',label:'System'}].map(t=>(
              <button key={t.id} onClick={()=>updateDraft({theme:t.id as 'light'|'dark'|'system'})}
                style={{ flex:1, padding:'14px 8px', borderRadius:14, border:`2px solid ${draft.theme===t.id?'var(--blue)':'var(--border)'}`, background:draft.theme===t.id?'var(--blue-bg)':'var(--bg)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:28 }}>{t.icon}</span>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:'Inter', color:draft.theme===t.id?'var(--blue)':'var(--text-2)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* DATA */}
        <Section icon={Shield} title="Data & Privacy">
          <Row label="Export Backup" sub="Download all your data as JSON">
            <button onClick={()=>{ const d=JSON.stringify({settings,members},null,2); const b=new Blob([d],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='familyquest-backup.json'; a.click(); toast.success('Backup downloaded!') }}
              style={{ padding:'8px 16px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text-2)', fontSize:13, fontWeight:600, fontFamily:'Inter', cursor:'pointer' }}>
              Download
            </button>
          </Row>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <span style={{ fontSize:14, fontWeight:500, fontFamily:'Inter', color:'#EF4444' }}>Reset All Data</span>
              <p style={{ fontSize:11, color:'var(--text-3)', fontFamily:'Inter', marginTop:2 }}>Clears everything — cannot be undone</p>
            </div>
            <button onClick={()=>{ if(confirm('⚠️ This will delete ALL data. Are you sure?')){ localStorage.clear(); window.location.reload() }}}
              style={{ padding:'8px 16px', borderRadius:10, border:'1.5px solid #EF4444', background:'#FEF2F2', color:'#EF4444', fontSize:13, fontWeight:600, fontFamily:'Inter', cursor:'pointer' }}>
              Reset
            </button>
          </div>
        </Section>

        {/* Save button at bottom too */}
        {isDirty && (
          <motion.button initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} onClick={handleSave} whileTap={{ scale:0.97 }}
            style={{ width:'100%', padding:'14px', borderRadius:16, background:'var(--blue)', color:'#fff', border:'none', fontSize:16, fontWeight:700, fontFamily:'Inter', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24, boxShadow:'0 4px 20px rgba(79,70,229,0.3)' }}>
            <Save size={18}/> Save Changes
          </motion.button>
        )}

        <div style={{ textAlign:'center', padding:'0 0 24px', color:'var(--text-3)', fontSize:12, fontFamily:'Inter' }}>
          FamilyQuest v1.0 · Built with ❤️
        </div>
      </div>
    </div>
  )
}
