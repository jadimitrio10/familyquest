import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Users, Palette, Bell, Trophy, CalendarDays,
  Shield, CreditCard, Info, ChevronRight, Camera,
  Copy, Check, Trash2, Plus, Edit2, X, Save,
  Download, LogOut, Smartphone, Eye, EyeOff,
  Globe, Clock, Hash, Link2, Share2
} from 'lucide-react'
import { useMembersStore, type Member } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { Toggle } from '@/components/shared/Toggle'
import { EmojiPicker } from '@/components/shared/EmojiPicker'
import type { AppSettings } from '@/types/app.types'
import toast from 'react-hot-toast'

type SectionId =
  'profile' | 'family' | 'appearance' | 'notifications' |
  'gamification' | 'calendar' | 'security' | 'subscription' | 'about'

const NAV: { id: SectionId; icon: React.ElementType; label: string; emoji: string }[] = [
  { id:'profile',       icon:User,         label:'Perfil',               emoji:'👤' },
  { id:'family',        icon:Users,        label:'Familia',              emoji:'👨‍👩‍👧' },
  { id:'appearance',    icon:Palette,      label:'Apariencia',           emoji:'🎨' },
  { id:'notifications', icon:Bell,         label:'Notificaciones',       emoji:'🔔' },
  { id:'gamification',  icon:Trophy,       label:'Gamificación',         emoji:'🏆' },
  { id:'calendar',      icon:CalendarDays, label:'Calendario',           emoji:'📅' },
  { id:'security',      icon:Shield,       label:'Seguridad',            emoji:'🔒' },
  { id:'subscription',  icon:CreditCard,   label:'Plan',                 emoji:'💳' },
  { id:'about',         icon:Info,         label:'Acerca de',            emoji:'ℹ️' },
]

const THEMES = [
  { id:'default', label:'Default', colors:['#007AFF','#5856D6'] },
  { id:'ocean',   label:'Ocean',   colors:['#00C7BE','#30B0C7'] },
  { id:'forest',  label:'Forest',  colors:['#34C759','#30D158'] },
  { id:'sunset',  label:'Sunset',  colors:['#FF9500','#FF6B00'] },
  { id:'candy',   label:'Candy',   colors:['#FF2D55','#FF375F'] },
  { id:'midnight',label:'Midnight',colors:['#5856D6','#AF52DE'] },
]
const ACCENT_COLORS = ['#007AFF','#34C759','#FF3B30','#FF9500','#AF52DE','#5856D6','#FF2D55','#00C7BE','#FFCC00','#30B0C7','#FF6B00','#30D158']
const TIMEZONES = ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Bogota','America/Lima','America/Santiago','Europe/Madrid','Europe/London','Europe/Paris']
const COLOR_OPTIONS = [
  { bg:'#FFE4E6',text:'#9F1239',bar:'#FB7185' },
  { bg:'#E0F2FE',text:'#075985',bar:'#38BDF8' },
  { bg:'#F3E8FF',text:'#6B21A8',bar:'#C084FC' },
  { bg:'#DCFCE7',text:'#166534',bar:'#4ADE80' },
  { bg:'#FEF3C7',text:'#92400E',bar:'#FCD34D' },
  { bg:'#FFEDD5',text:'#9A3412',bar:'#FB923C' },
  { bg:'#E0E7FF',text:'#3730A3',bar:'#818CF8' },
  { bg:'#CCFBF1',text:'#134E4A',bar:'#2DD4BF' },
]

interface SettingsViewProps {
  settings: AppSettings
  onUpdate: (patch: Partial<AppSettings>) => void
}

export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  const [active, setActive] = useState<SectionId>('profile')
  const { members, addMember, updateMember, removeMember, uploadPhoto } = useMembersStore()

  // Profile
  const [profileForm, setProfileForm] = useState({ name: settings.familyName || '', phone:'', timezone:'America/New_York', language:'es', dateFormat:'MM/DD/YYYY', timeFormat:'12h' })
  const fileRefs = useRef<Record<string, HTMLInputElement>>({})

  // Appearance
  const [appTheme, setAppTheme] = useState('default')
  const [accentColor, setAccentColor] = useState('#007AFF')
  const [fontSize, setFontSize] = useState('normal')
  const [calDensity, setCalDensity] = useState('normal')

  // Notifications
  const [notifMaster, setNotifMaster] = useState(settings.notifications)
  const [notifTypes, setNotifTypes] = useState({
    taskReminder:true, taskDone:true, newEvent:true,
    chat:false, achievement:true, reward:true,
  })
  const [silentHours, setSilentHours] = useState(false)
  const [silentFrom, setSilentFrom] = useState('22:00')
  const [silentTo, setSilentTo] = useState('07:00')

  // Family
  const [showAddMember, setShowAddMember] = useState(false)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editName, setEditName] = useState('')
  const [newMemberForm, setNewMemberForm] = useState({ name:'', emoji:'👤', colorIdx:0, role:'child' as 'adult'|'child' })
  const [copied, setCopied] = useState(false)
  const [showEmojiFor, setShowEmojiFor] = useState<string|null>(null)

  // Security
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' })
  const [showPw, setShowPw] = useState(false)
  const [pinForm, setPinForm] = useState({ pin:'', confirm:'' })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  function handlePhotoUpload(memberId: string, file: File) {
    const reader = new FileReader()
    reader.onload = e => { uploadPhoto(memberId, e.target?.result as string); toast.success('Foto actualizada 📸') }
    reader.readAsDataURL(file)
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(settings.familyName || 'DEMO1234')
    setCopied(true); toast.success('Código copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(`Únete a nuestra familia en FamilyQuest! Código: ${settings.familyName}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  function saveProfile() {
    onUpdate({ familyName: profileForm.name, timeFormat: profileForm.timeFormat as any })
    toast.success('Perfil guardado ✅')
  }

  // ── Row component ──
  const Row = ({ label, sub, children }: { label:string; sub?:string; children?:React.ReactNode }) => (
    <div className="settings-row">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color:'var(--text-1)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{sub}</p>}
      </div>
      {children}
    </div>
  )

  const SectionCard = ({ children }: { children:React.ReactNode }) => (
    <div className="card p-5 mb-4">{children}</div>
  )

  const sections: Record<SectionId, React.ReactNode> = {
    // ── PROFILE ──
    profile: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>👤 Perfil</h1>
        <SectionCard>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
                style={{ background:'rgba(0,122,255,0.1)', border:'2px solid var(--border)' }}>
                {members[0]?.emoji || '😊'}
              </div>
              <button onClick={() => toast('Próximamente: subir foto de perfil')}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background:'var(--blue)', color:'#fff' }}>
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="font-black text-lg" style={{ fontFamily:'var(--font-heading)' }}>{profileForm.name || 'Tu nombre'}</p>
              <p className="text-sm" style={{ color:'var(--text-3)' }}>Administrador familiar</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text-3)' }}>Nombre</label>
              <input value={profileForm.name} onChange={e => setProfileForm(f=>({...f,name:e.target.value}))}
                className="input-apple" placeholder="Tu nombre completo" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text-3)' }}>Teléfono</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(f=>({...f,phone:e.target.value}))}
                className="input-apple" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text-3)' }}>Idioma</label>
                <select value={profileForm.language} onChange={e => setProfileForm(f=>({...f,language:e.target.value}))}
                  className="input-apple">
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="fr">🇫🇷 Français</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text-3)' }}>Hora</label>
                <select value={profileForm.timeFormat} onChange={e => setProfileForm(f=>({...f,timeFormat:e.target.value}))}
                  className="input-apple">
                  <option value="12h">12h (AM/PM)</option>
                  <option value="24h">24h</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text-3)' }}>Zona horaria</label>
              <select value={profileForm.timezone} onChange={e => setProfileForm(f=>({...f,timezone:e.target.value}))}
                className="input-apple">
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
        </SectionCard>
        <motion.button whileTap={{ scale:0.97 }} onClick={saveProfile}
          className="btn btn-primary w-full" style={{ padding:'14px', fontSize:16 }}>
          <Save size={16} /> Guardar cambios
        </motion.button>
      </div>
    ),

    // ── FAMILY ──
    family: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>👨‍👩‍👧 Familia</h1>

        {/* Invite code */}
        <SectionCard>
          <p className="font-bold text-sm mb-1" style={{ fontFamily:'var(--font-heading)' }}>Código de invitación</p>
          <p className="text-xs mb-3" style={{ color:'var(--text-3)' }}>Compártelo para que otros se unan</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-2xl font-mono font-bold text-xl tracking-widest text-center"
              style={{ background:'rgba(0,122,255,0.08)', color:'var(--blue)', border:'1.5px solid rgba(0,122,255,0.2)' }}>
              {settings.familyName?.slice(0,8).toUpperCase() || 'FAMQUEST'}
            </div>
            <button onClick={copyInviteCode} className="btn-icon" title="Copiar">
              {copied ? <Check size={18} style={{ color:'var(--green)' }} /> : <Copy size={18} />}
            </button>
            <button onClick={shareWhatsApp} className="btn-icon" title="Compartir por WhatsApp"
              style={{ background:'#25D366', color:'#fff', border:'none' }}>
              <Share2 size={18} />
            </button>
          </div>
        </SectionCard>

        {/* Members */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold" style={{ fontFamily:'var(--font-heading)' }}>Miembros ({members.length})</p>
            <button onClick={() => setShowAddMember(true)} className="btn btn-primary" style={{ padding:'8px 16px', fontSize:13 }}>
              <Plus size={14} /> Agregar
            </button>
          </div>

          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor:'var(--border)' }}>
              <div className="relative">
                <MemberAvatar member={m} size={46} />
                <button onClick={() => fileRefs.current[m.id]?.click()}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background:'var(--blue)', color:'#fff' }}>
                  <Camera size={10} />
                </button>
                <input ref={el=>{ if(el) fileRefs.current[m.id]=el }} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => { const f=e.target.files?.[0]; if(f) handlePhotoUpload(m.id,f) }} />
              </div>

              {editingId === m.id ? (
                <div className="flex-1 flex gap-2">
                  <input value={editName} onChange={e=>setEditName(e.target.value)} autoFocus
                    className="input-apple flex-1" style={{ padding:'8px 12px', fontSize:14 }} />
                  <button onClick={() => { updateMember(m.id,{name:editName}); setEditingId(null); toast.success('Guardado') }}
                    className="btn-icon" style={{ color:'var(--green)' }}><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="btn-icon"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{m.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full font-semibold"
                        style={{ background:m.bgColor, color:m.textColor }}>{m.role}</span>
                      <span className="text-xs" style={{ color:'var(--text-3)' }}>⭐ pts</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {/* Color selector dots */}
                    <div className="relative">
                      <button onClick={() => setShowEmojiFor(showEmojiFor===m.id?null:m.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                        {m.emoji}
                      </button>
                      <AnimatePresence>
                        {showEmojiFor===m.id && (
                          <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.95 }}
                            style={{ position:'absolute', top:'110%', right:0, zIndex:99 }}>
                            <EmojiPicker value={m.emoji} onChange={e => { updateMember(m.id,{emoji:e}); setShowEmojiFor(null) }} onClose={() => setShowEmojiFor(null)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={() => { setEditingId(m.id); setEditName(m.name) }} className="btn-icon">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { if(confirm(`¿Eliminar a ${m.name}?`)) removeMember(m.id) }}
                      className="btn-icon" style={{ color:'var(--red)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </SectionCard>

        {/* Add member form */}
        <AnimatePresence>
          {showAddMember && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAddMember(false)}>
              <motion.div initial={{ y:60,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:60,opacity:0 }}
                transition={{ type:'spring',stiffness:340,damping:30 }} className="modal-sheet">
                <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
                <h2 className="font-black text-xl mb-4" style={{ fontFamily:'var(--font-heading)' }}>Agregar miembro</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <button onClick={() => setShowEmojiFor('new')}
                        className="card w-14 h-14 flex items-center justify-center text-3xl">
                        {newMemberForm.emoji}
                      </button>
                      <AnimatePresence>
                        {showEmojiFor==='new' && (
                          <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.95 }}
                            style={{ position:'absolute',top:'110%',left:0,zIndex:99 }}>
                            <EmojiPicker value={newMemberForm.emoji} onChange={e=>{setNewMemberForm(f=>({...f,emoji:e}));setShowEmojiFor(null)}} onClose={()=>setShowEmojiFor(null)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <input value={newMemberForm.name} onChange={e=>setNewMemberForm(f=>({...f,name:e.target.value}))}
                      placeholder="Nombre del miembro" autoFocus className="input-apple flex-1" />
                  </div>
                  <div className="flex gap-2">
                    {[{v:'adult',l:'👨 Adulto'},{v:'child',l:'👦 Niño/a'}].map(opt=>(
                      <button key={opt.v} onClick={()=>setNewMemberForm(f=>({...f,role:opt.v as any}))}
                        className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                        style={{ background:newMemberForm.role===opt.v?'rgba(0,122,255,0.1)':'var(--bg)', color:newMemberForm.role===opt.v?'var(--blue)':'var(--text-2)', border:`2px solid ${newMemberForm.role===opt.v?'var(--blue)':'var(--border)'}` }}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color:'var(--text-3)' }}>Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_OPTIONS.map((c,i)=>(
                        <button key={i} onClick={()=>setNewMemberForm(f=>({...f,colorIdx:i}))}
                          title={`Color ${i+1}`}
                          style={{ width:28,height:28,borderRadius:'50%',background:c.bar,border:`3px solid ${newMemberForm.colorIdx===i?'var(--text-1)':'transparent'}`,boxShadow:newMemberForm.colorIdx===i?`0 0 0 2px var(--surface)`:undefined }} />
                      ))}
                    </div>
                  </div>
                  <motion.button whileTap={{scale:0.97}} onClick={()=>{
                    if(!newMemberForm.name.trim()) return
                    const c=COLOR_OPTIONS[newMemberForm.colorIdx]
                    addMember({name:newMemberForm.name.trim(),emoji:newMemberForm.emoji,bgColor:c.bg,textColor:c.text,barColor:c.bar,role:newMemberForm.role})
                    setNewMemberForm({name:'',emoji:'👤',colorIdx:0,role:'child'})
                    setShowAddMember(false)
                    toast.success('Miembro agregado 👋')
                  }} className="btn btn-primary w-full" style={{ padding:'14px',fontSize:16 }}>
                    Agregar miembro
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),

    // ── APPEARANCE ──
    appearance: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>🎨 Apariencia</h1>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Modo de color</p>
          <div className="flex gap-2">
            {[{v:'light',l:'☀️ Claro'},{v:'dark',l:'🌙 Oscuro'},{v:'system',l:'💻 Sistema'}].map(opt=>(
              <button key={opt.v} className="flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all"
                style={{ background:appTheme==='default'&&opt.v==='light'?'rgba(0,122,255,0.1)':'var(--bg)', color:appTheme==='default'&&opt.v==='light'?'var(--blue)':'var(--text-2)', border:`1.5px solid ${appTheme==='default'&&opt.v==='light'?'var(--blue)':'var(--border)'}` }}>
                {opt.l}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Temas prediseñados</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t=>(
              <button key={t.id} onClick={() => { setAppTheme(t.id); toast.success(`Tema ${t.label} activado`) }}
                className="p-3 rounded-2xl text-center transition-all"
                style={{ border:`2px solid ${appTheme===t.id?t.colors[0]:'var(--border)'}`, background:appTheme===t.id?`${t.colors[0]}12`:'var(--bg)' }}>
                <div className="flex justify-center gap-1 mb-2">
                  <div className="w-5 h-5 rounded-full" style={{ background:t.colors[0] }} />
                  <div className="w-5 h-5 rounded-full" style={{ background:t.colors[1] }} />
                </div>
                <p className="text-xs font-bold" style={{ color:appTheme===t.id?t.colors[0]:'var(--text-2)' }}>{t.label}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Color de acento</p>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_COLORS.map(c=>(
              <button key={c} onClick={() => { setAccentColor(c); toast.success('Color actualizado') }}
                style={{ width:32,height:32,borderRadius:'50%',background:c,border:`3px solid ${accentColor===c?'var(--text-1)':'transparent'}`,boxShadow:accentColor===c?`0 0 0 2px var(--surface)`:undefined }} />
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="settings-row">
            <span className="font-semibold text-sm">Tamaño de fuente</span>
            <div className="flex gap-1.5">
              {['S','M','L','XL'].map((s,i)=>{
                const vals=['small','normal','large','xlarge']
                return <button key={s} onClick={()=>setFontSize(vals[i])}
                  className="w-8 h-8 rounded-xl font-bold text-sm transition-all"
                  style={{ background:fontSize===vals[i]?'var(--blue)':'var(--bg)', color:fontSize===vals[i]?'#fff':'var(--text-2)', border:`1px solid ${fontSize===vals[i]?'var(--blue)':'var(--border)'}` }}>{s}</button>
              })}
            </div>
          </div>
          <div className="settings-row">
            <span className="font-semibold text-sm">Densidad calendario</span>
            <div className="flex gap-1.5">
              {[{v:'compact',l:'Compact'},{v:'normal',l:'Normal'},{v:'spacious',l:'Espacioso'}].map(opt=>(
                <button key={opt.v} onClick={()=>setCalDensity(opt.v)}
                  className="pill"
                  style={{ background:calDensity===opt.v?'var(--blue)':'var(--bg)', color:calDensity===opt.v?'#fff':'var(--text-2)', border:`1.5px solid ${calDensity===opt.v?'var(--blue)':'var(--border)'}` }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    ),

    // ── NOTIFICATIONS ──
    notifications: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>🔔 Notificaciones</h1>

        <SectionCard>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">Notificaciones</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Activar/desactivar todas</p>
            </div>
            <Toggle value={notifMaster} onChange={v => { setNotifMaster(v); onUpdate({ notifications:v }) }} />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Por tipo</p>
          {[
            { k:'taskReminder', l:'Recordatorio de task', sub:'Antes de que venza un task' },
            { k:'taskDone',     l:'Task completado',      sub:'Cuando un hijo termina un task' },
            { k:'newEvent',     l:'Nuevo evento',         sub:'Eventos añadidos al calendario' },
            { k:'chat',         l:'Chat familiar',        sub:'Mensajes del chat' },
            { k:'achievement',  l:'Logro desbloqueado',   sub:'Cuando alguien consigue un logro' },
            { k:'reward',       l:'Premio reclamado',     sub:'Solicitudes de recompensa' },
          ].map(item=>(
            <div key={item.k} className="settings-row" style={{ opacity:notifMaster?1:0.4 }}>
              <div>
                <p className="font-semibold text-sm">{item.l}</p>
                <p className="text-xs" style={{ color:'var(--text-3)' }}>{item.sub}</p>
              </div>
              <Toggle value={(notifTypes as any)[item.k]} onChange={v=>setNotifTypes(t=>({...t,[item.k]:v}))} disabled={!notifMaster} />
            </div>
          ))}
        </SectionCard>

        <SectionCard>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">Horas de silencio</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Sin notificaciones en este rango</p>
            </div>
            <Toggle value={silentHours} onChange={setSilentHours} />
          </div>
          {silentHours && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1">
                <label className="text-xs font-semibold mb-1 block" style={{ color:'var(--text-3)' }}>Desde</label>
                <input type="time" value={silentFrom} onChange={e=>setSilentFrom(e.target.value)} className="input-apple" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold mb-1 block" style={{ color:'var(--text-3)' }}>Hasta</label>
                <input type="time" value={silentTo} onChange={e=>setSilentTo(e.target.value)} className="input-apple" />
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    ),

    // ── GAMIFICATION ──
    gamification: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>🏆 Gamificación</h1>

        <SectionCard>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">Sistema de puntos</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Los hijos ganan puntos al completar tasks</p>
            </div>
            <Toggle value={true} onChange={() => toast('Próximamente')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">Rachas</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Días consecutivos completando tasks</p>
            </div>
            <Toggle value={true} onChange={() => toast('Próximamente')} />
          </div>
          <div className="settings-row">
            <span className="font-semibold text-sm">Puntos por defecto</span>
            <input type="number" defaultValue={10} min={1} max={100}
              className="input-apple" style={{ width:80, textAlign:'center', padding:'8px' }} />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>🏅 Logros disponibles</p>
          {[
            { e:'🌟', t:'Primera Tarea', d:'Completar el primer task', pts:50 },
            { e:'🔥', t:'Racha de 7 días', d:'7 días consecutivos', pts:100 },
            { e:'💯', t:'Perfeccionista', d:'100 tasks completados', pts:500 },
            { e:'👑', t:'Campeón', d:'1000 puntos acumulados', pts:1000 },
          ].map((a,i)=>(
            <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor:'var(--border)' }}>
              <span className="text-2xl">{a.e}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{a.t}</p>
                <p className="text-xs" style={{ color:'var(--text-3)' }}>{a.d}</p>
              </div>
              <span className="text-xs font-bold" style={{ color:'var(--orange)' }}>⭐{a.pts}</span>
            </div>
          ))}
        </SectionCard>
      </div>
    ),

    // ── CALENDAR ──
    calendar: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>📅 Calendario</h1>

        <SectionCard>
          <div className="settings-row">
            <span className="font-semibold text-sm">Vista por defecto</span>
            <select className="input-apple" style={{ width:'auto', padding:'8px 12px' }}>
              <option>Semana</option><option>Día</option><option>Mes</option><option>Agenda</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">Mostrar tasks en calendario</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Tasks con hora aparecen en su slot</p>
            </div>
            <Toggle value={true} onChange={() => {}} />
          </div>
          <div className="settings-row">
            <span className="font-semibold text-sm">La semana empieza en</span>
            <div className="flex gap-2">
              {['Domingo','Lunes'].map(d=>(
                <button key={d} className="pill pill-default">{d}</button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span className="font-semibold text-sm">Mostrar fines de semana</span>
            <Toggle value={true} onChange={() => {}} />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Integraciones</p>
          {[
            { icon:'🗓️', name:'Google Calendar', sub:'Sincronizar eventos' },
            { icon:'🍎', name:'Apple Calendar',  sub:'Importar/exportar' },
          ].map(item=>(
            <div key={item.name} className="settings-row">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <div><p className="font-semibold text-sm">{item.name}</p><p className="text-xs" style={{ color:'var(--text-3)' }}>{item.sub}</p></div>
              </div>
              <button className="btn btn-secondary" style={{ padding:'7px 16px', fontSize:13 }}
                onClick={() => toast('Próximamente')}>
                Conectar
              </button>
            </div>
          ))}
          <button className="btn btn-ghost w-full mt-3" style={{ justifyContent:'center' }}
            onClick={() => toast('Exportando .ics...')}>
            <Download size={15} /> Exportar calendario (.ics)
          </button>
        </SectionCard>
      </div>
    ),

    // ── SECURITY ──
    security: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>🔒 Seguridad</h1>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Cambiar contraseña</p>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input type={showPw?'text':'password'} value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))}
                placeholder="Contraseña actual" className="input-apple" style={{ paddingRight:44 }} />
              <button onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>
                {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
            <input type="password" value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))}
              placeholder="Nueva contraseña" className="input-apple" />
            <input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))}
              placeholder="Confirmar nueva contraseña" className="input-apple" />
            <button className="btn btn-primary" style={{ padding:'12px' }}
              onClick={() => { if(pwForm.next===pwForm.confirm&&pwForm.next.length>=6){toast.success('Contraseña actualizada ✅');setPwForm({current:'',next:'',confirm:''})}else{toast.error('Las contraseñas no coinciden o son muy cortas')} }}>
              Actualizar contraseña
            </button>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">Autenticación 2 factores</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Seguridad extra con autenticador</p>
            </div>
            <Toggle value={twoFAEnabled} onChange={v=>{setTwoFAEnabled(v);toast(v?'2FA activado 🔐':'2FA desactivado')}} />
          </div>
          <div className="settings-row">
            <div>
              <p className="font-bold text-sm">PIN parental</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>Los niños no pueden cambiar ajustes</p>
            </div>
            <button className="btn btn-secondary" style={{ padding:'7px 16px', fontSize:13 }}
              onClick={() => toast('Próximamente')}>
              Configurar
            </button>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)' }}>Sesiones activas</p>
          {[
            { device:'Chrome · Windows', time:'Ahora mismo', current:true },
            { device:'Safari · iPhone', time:'Hace 2 horas', current:false },
          ].map((s,i)=>(
            <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor:'var(--border)' }}>
              <div>
                <p className="font-semibold text-sm">{s.device}</p>
                <p className="text-xs" style={{ color:s.current?'var(--green)':'var(--text-3)' }}>{s.time}</p>
              </div>
              {!s.current && <button className="text-xs font-bold" style={{ color:'var(--red)' }} onClick={()=>toast('Sesión cerrada')}>Cerrar</button>}
            </div>
          ))}
          <button className="btn btn-ghost w-full mt-3" style={{ color:'var(--red)', justifyContent:'center' }}
            onClick={() => toast.error('Todas las sesiones cerradas')}>
            <LogOut size={15} /> Cerrar todas las sesiones
          </button>
        </SectionCard>

        <SectionCard>
          <p className="font-bold text-sm mb-3" style={{ fontFamily:'var(--font-heading)', color:'var(--red)' }}>⚠️ Zona peligrosa</p>
          <button className="btn btn-ghost w-full mb-3" style={{ justifyContent:'center' }}
            onClick={() => { const d=JSON.stringify({}); const b=new Blob([d],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='familyquest-backup.json'; a.click() }}>
            <Download size={15} /> Descargar mis datos
          </button>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color:'var(--text-3)' }}>Escribe ELIMINAR para confirmar</p>
            <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)}
              placeholder='Escribe "ELIMINAR"' className="input-apple" style={{ borderColor: deleteConfirm==='ELIMINAR'?'var(--red)':'var(--border)' }} />
            <button disabled={deleteConfirm!=='ELIMINAR'}
              onClick={() => { if(deleteConfirm==='ELIMINAR'){localStorage.clear();window.location.reload()} }}
              className="btn btn-danger w-full" style={{ padding:'12px', opacity:deleteConfirm==='ELIMINAR'?1:0.4 }}>
              Eliminar cuenta permanentemente
            </button>
          </div>
        </SectionCard>
      </div>
    ),

    // ── SUBSCRIPTION ──
    subscription: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>💳 Plan</h1>
        <SectionCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background:'rgba(245,158,11,0.1)' }}>⭐</div>
            <div>
              <p className="font-black text-lg" style={{ fontFamily:'var(--font-heading)' }}>Plan Free</p>
              <p className="text-sm" style={{ color:'var(--text-3)' }}>5 miembros · 30 tasks/mes</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name:'Free', price:'$0', features:['5 miembros','30 tasks/mes','1 semana historial'], color:'#64748B' },
              { name:'Pro', price:'$4.99', features:['Ilimitado','Tasks sin límite','Historial completo','Sin anuncios'], color:'var(--blue)', highlight:true },
              { name:'Family Pro', price:'$9.99', features:['Todo Pro','8 miembros','Múltiples familias','Soporte prioritario'], color:'#AF52DE' },
            ].map(plan=>(
              <div key={plan.name} className="card p-4 text-center"
                style={{ border:`2px solid ${plan.highlight?plan.color:'var(--border)'}`, background:plan.highlight?`rgba(0,122,255,0.04)`:undefined }}>
                <p className="font-black text-base mb-1" style={{ color:plan.color, fontFamily:'var(--font-heading)' }}>{plan.name}</p>
                <p className="font-black text-2xl mb-3" style={{ fontFamily:'var(--font-heading)' }}>{plan.price}<span className="text-xs font-normal text-gray-400">/mes</span></p>
                <ul className="text-xs text-left space-y-1 mb-4" style={{ color:'var(--text-2)' }}>
                  {plan.features.map(f=><li key={f} className="flex items-center gap-1"><Check size={11} style={{ color:plan.color }}/>{f}</li>)}
                </ul>
                <button onClick={() => toast('Próximamente: Stripe Checkout')}
                  className="btn w-full" style={{ background:plan.highlight?plan.color:'var(--bg)', color:plan.highlight?'#fff':'var(--text-2)', border:`1px solid ${plan.color}`, padding:'8px', fontSize:12, borderRadius:'var(--radius-md)' }}>
                  {plan.highlight?'Upgrade':'Seleccionar'}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    ),

    // ── ABOUT ──
    about: (
      <div>
        <h1 className="font-black text-2xl mb-5" style={{ fontFamily:'var(--font-heading)' }}>ℹ️ Acerca de</h1>
        <SectionCard>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
              style={{ background:'linear-gradient(135deg,#007AFF,#5856D6)', fontFamily:'var(--font-heading)' }}>FQ</div>
            <div>
              <p className="font-black text-lg" style={{ fontFamily:'var(--font-heading)' }}>FamilyQuest</p>
              <p className="text-sm" style={{ color:'var(--text-3)' }}>Versión 1.0.0</p>
            </div>
          </div>
          {[
            { l:'Novedades', sub:'Ver qué hay de nuevo', icon:Smartphone },
            { l:'Términos de uso', sub:'Leer los términos', icon:Link2 },
            { l:'Política de privacidad', sub:'Cómo usamos tus datos', icon:Shield },
            { l:'Contacto / Soporte', sub:'Escríbenos un email', icon:Hash },
          ].map(item=>(
            <div key={item.l} className="settings-row cursor-pointer" onClick={() => toast('Próximamente')}>
              <div className="flex items-center gap-2">
                <item.icon size={16} style={{ color:'var(--text-3)' }} />
                <div><p className="font-semibold text-sm">{item.l}</p><p className="text-xs" style={{ color:'var(--text-3)' }}>{item.sub}</p></div>
              </div>
              <ChevronRight size={16} style={{ color:'var(--text-3)' }} />
            </div>
          ))}
        </SectionCard>
        <div className="text-center mt-4" style={{ color:'var(--text-3)' }}>
          <p className="text-xs">Hecho con ❤️ para las familias</p>
          <p className="text-xs mt-1">© 2026 FamilyQuest</p>
        </div>
      </div>
    ),
  }

  return (
    <div style={{ display:'flex', height:'100%', background:'var(--bg)', overflow:'hidden' }}>
      {/* Left nav */}
      <div style={{ width:220, background:'var(--surface)', borderRight:'1px solid var(--border)', padding:'20px 12px', display:'flex', flexDirection:'column', gap:2, flexShrink:0, overflowY:'auto' }}>
        <p className="text-xs font-bold uppercase tracking-wider px-2 mb-3" style={{ color:'var(--text-3)' }}>Ajustes</p>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`settings-nav-item ${active===item.id?'active':''}`}>
            <span className="text-base">{item.emoji}</span>
            {item.label}
            {active===item.id && <ChevronRight size={14} className="ml-auto" style={{ color:'var(--blue)' }} />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity:0, x:12 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-12 }}
            transition={{ duration:0.18, ease:'easeInOut' }}>
            {sections[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
