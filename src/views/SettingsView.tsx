import { useState, useRef, useCallback } from 'react'
import { useT } from '@/lib/i18n'
import { createFamily, joinFamily, uploadLocalData, downloadFamilyData, FAMILY_ID_KEY, FAMILY_CODE_KEY } from '@/lib/sync'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Users, Palette, Bell, Trophy, CalendarDays,
  Shield, CreditCard, Info, ChevronRight, Camera,
  Copy, Check, Trash2, Plus, Edit2, X, Save,
  Download, LogOut, Eye, EyeOff, Share2,
} from 'lucide-react'
import { useMembersStore, type Member } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { Toggle } from '@/components/shared/Toggle'
import { EmojiPicker } from '@/components/shared/EmojiPicker'
import { useCalendarPrefs } from '@/hooks/useCalendarPrefs'
import type { AppSettings } from '@/types/app.types'
import toast from 'react-hot-toast'

// ─── Module-level helpers (stable references — fixes input focus bug) ──────
function SettingsGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {label && (
        <p style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 4, fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
      )}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  icon, iconBg, label, sub, children, onClick, showArrow, value, last
}: {
  icon?: React.ReactNode; iconBg?: string; label: string; sub?: string
  children?: React.ReactNode; onClick?: () => void; showArrow?: boolean
  value?: string; last?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 13,
        padding: '12px 16px',
        borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        background: 'transparent',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg || '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#1C1C1E', fontFamily: 'var(--font-body)', lineHeight: 1.2 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2, fontFamily: 'var(--font-body)' }}>{sub}</p>}
      </div>
      {value && <p style={{ fontSize: 14, color: '#8E8E93', fontFamily: 'var(--font-body)', flexShrink: 0 }}>{value}</p>}
      {children}
      {showArrow && <ChevronRight size={16} color="#C7C7CC" style={{ flexShrink: 0 }} />}
    </div>
  )
}

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

type SectionId = 'profile'|'family'|'appearance'|'notifications'|'gamification'|'calendar'|'security'|'subscription'|'about'

const SECTION_META: { id: SectionId; emoji: string; labelKey: string; iconBg: string }[] = [
  { id:'profile',       emoji:'👤', labelKey:'settings.profile',       iconBg:'#007AFF' },
  { id:'family',        emoji:'👨‍👩‍👧', labelKey:'settings.family',        iconBg:'#FF9500' },
  { id:'appearance',    emoji:'🎨', labelKey:'settings.appearance',    iconBg:'#AF52DE' },
  { id:'notifications', emoji:'🔔', labelKey:'settings.notifications', iconBg:'#FF3B30' },
  { id:'gamification',  emoji:'🏆', labelKey:'settings.gamification',  iconBg:'#FFCC00' },
  { id:'calendar',      emoji:'📅', labelKey:'settings.calendar',      iconBg:'#34C759' },
  { id:'security',      emoji:'🔒', labelKey:'settings.security',      iconBg:'#636366' },
  { id:'subscription',  emoji:'💳', labelKey:'settings.plan',          iconBg:'#5AC8FA' },
  { id:'about',         emoji:'ℹ️', labelKey:'settings.about',         iconBg:'#8E8E93' },
]

// ─── Props ────────────────────────────────────────────────────────────────
interface SettingsViewProps {
  settings: AppSettings
  onUpdate: (patch: Partial<AppSettings>) => void
}

// ══════════════════════════════════════════════════════════════════════════
export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  const [active, setActive]   = useState<SectionId>('profile')
  const { members, addMember, updateMember, removeMember, uploadPhoto } = useMembersStore()
  const { prefs: calPrefs, update: updateCalPrefs } = useCalendarPrefs()
  const { t } = useT()
  const SECTIONS = SECTION_META.map(s => ({ ...s, label: t(s.labelKey) }))

  // Profile form — local state
  const [profileName, setProfileName] = useState(settings.familyName || '')
  const [profilePhone, setProfilePhone] = useState('')

  // Family member editing
  // Cloud sync state
  const [cloudId]   = useState<string|null>(() => localStorage.getItem(FAMILY_ID_KEY))
  const cloudCode   = localStorage.getItem(FAMILY_CODE_KEY) || ''
  const [syncing, setSyncing]   = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  const [cloudDone, setCloudDone] = useState(false)
  const [joinDone, setJoinDone]   = useState(false)

  async function handleCloudCreate() {
    setSyncing(true)
    try {
      const result = await createFamily(settings.familyName || 'Mi Familia')
      if (!result) { toast.error('No se pudo conectar. Verifica internet.'); return }
      // Upload without photos first (photos can be large)
      try { await uploadLocalData(result.id) } catch (e) { console.warn('upload partial:', e) }
      setCloudDone(true)
      toast.success(`✅ ¡Conectado! Tu código: ${result.code}`, { duration: 8000 })
    } catch (e) {
      console.error(e)
      toast.error('Error al conectar')
    } finally {
      setSyncing(false)
    }
  }

  async function handleCloudSync() {
    if (!cloudId) return
    setSyncing(true)
    try {
      await uploadLocalData(cloudId)
      toast.success('Datos sincronizados ✅')
    } catch { toast.error('Error al sincronizar') } finally { setSyncing(false) }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setSyncing(true)
    try {
      const result = await joinFamily(joinCode.trim())
      if (!result) { toast.error('Código incorrecto'); setSyncing(false); return }
      await downloadFamilyData(localStorage.getItem(FAMILY_ID_KEY)!)
      setJoinDone(true)
      toast.success(`✅ ¡Conectado a ${result.name}! Recarga la página para ver los datos.`, { duration: 6000 })
    } catch (e) {
      console.error(e)
      toast.error('Error al unirse')
    } finally {
      setSyncing(false)
    }
  }

  const [editingId, setEditingId]         = useState<string|null>(null)
  const [editName, setEditName]           = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEmojiFor, setShowEmojiFor]   = useState<string|null>(null)
  const [newMember, setNewMember]         = useState({ name:'', emoji:'👤', colorIdx:0, role:'child' as 'adult'|'child' })
  const [copied, setCopied]               = useState(false)
  const fileRefs = useRef<Record<string, HTMLInputElement>>({})

  // Notifications
  const [notifMaster, setNotifMaster] = useState(settings.notifications)
  const [notifTypes, setNotifTypes]   = useState({ taskReminder:true, taskDone:true, newEvent:true, achievement:true, reward:true })
  const [silentHours, setSilentHours] = useState(false)
  const [silentFrom, setSilentFrom]   = useState('22:00')
  const [silentTo, setSilentTo]       = useState('07:00')

  // Security
  const [pwForm, setPwForm]     = useState({ current:'', next:'', confirm:'' })
  const [showPw, setShowPw]     = useState(false)
  const [twoFA, setTwoFA]       = useState(false)
  const [deleteWord, setDeleteWord] = useState('')

  const saved = useCallback(() => {
    // get fresh lang from localStorage to avoid stale closure
    const lang = (() => { try { const s=JSON.parse(localStorage.getItem('fq_settings')||'{}'); return s.language||'es' } catch { return 'es' } })()
    const msg = lang==='en'?'Saved':lang==='fr'?'Enregistré':'Guardado'
    toast.success(msg, { duration:1500, icon:'✅',
      style:{ borderRadius:12, fontFamily:'var(--font-body)', fontWeight:600, fontSize:13 } })
  }, [])

  const savePref = useCallback(<K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    onUpdate({ [key]: val } as Partial<AppSettings>); saved()
  }, [onUpdate, saved])

  const saveCalPref = useCallback((patch: Parameters<typeof updateCalPrefs>[0]) => {
    updateCalPrefs(patch); saved()
  }, [updateCalPrefs, saved])

  function handlePhotoUpload(id: string, file: File) {
    const reader = new FileReader()
    reader.onload = e => { uploadPhoto(id, e.target?.result as string); saved() }
    reader.readAsDataURL(file)
  }

  function copyInvite() {
    navigator.clipboard.writeText(settings.familyName?.slice(0,8).toUpperCase() || 'FAMQUEST')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Código copiado 📋', { duration:1500 })
  }

  // ── PILL SELECTOR ──
  const PillSelect = ({ options, value, onChange }: { options:{v:string;l:string}[]; value:string; onChange:(v:string)=>void }) => (
    <div style={{ display:'flex', background:'rgba(0,0,0,0.06)', borderRadius:10, padding:3 }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          style={{ padding:'6px 14px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)', background:value===o.v?'#fff':'transparent', color:value===o.v?'#1C1C1E':'#8E8E93', boxShadow:value===o.v?'0 1px 4px rgba(0,0,0,0.12)':'none', transition:'all 0.15s' }}>
          {o.l}
        </button>
      ))}
    </div>
  )

  // ── SECTION CONTENT ──────────────────────────────────────────────────────
  const renderSection = () => {
    switch (active) {

    // ── PROFILE ────────────────────────────────────────────────────────────
    case 'profile': return (
      <div>
        <SectionTitle>{t('settings.profile')}</SectionTitle>

        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 }}>
          <div style={{ position:'relative', marginBottom:12 }}>
            <div style={{ width:88, height:88, borderRadius:22, background:'linear-gradient(135deg,#FF9500,#FF6B8A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>
              {members[0]?.emoji || '😊'}
            </div>
            <button onClick={() => toast('Próximamente')}
              style={{ position:'absolute', bottom:-2, right:-2, width:28, height:28, borderRadius:'50%', background:'#007AFF', border:'3px solid #F2F2F7', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Camera size={13} />
            </button>
          </div>
          <p style={{ fontSize:18, fontWeight:700, color:'#1C1C1E', fontFamily:'var(--font-heading)' }}>{profileName || 'Tu nombre'}</p>
          <p style={{ fontSize:13, color:'#8E8E93' }}>Administrador</p>
        </div>

        <SettingsGroup label={t('settings.profile')}>
          <SettingsRow icon={<User size={16} color="#fff" />} iconBg="#007AFF" label={t('settings.name')}>
            <input value={profileName} onChange={e => setProfileName(e.target.value)}
              onBlur={() => { onUpdate({ familyName: profileName }); saved() }}
              placeholder="Tu nombre"
              style={{ border:'none', outline:'none', fontSize:14, color:'#8E8E93', textAlign:'right', background:'transparent', fontFamily:'var(--font-body)', width:160 }} />
          </SettingsRow>
          <SettingsRow icon={<span style={{ fontSize:14 }}>📱</span>} iconBg="#34C759" label="Teléfono" last>
            <input value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
              onBlur={saved}
              placeholder="+1 (305) 000-0000"
              style={{ border:'none', outline:'none', fontSize:14, color:'#8E8E93', textAlign:'right', background:'transparent', fontFamily:'var(--font-body)', width:160 }} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Preferencias">
          <SettingsRow icon={<span style={{ fontSize:14 }}>🌐</span>} iconBg="#5AC8FA" label="Idioma" value={settings.language === 'en' ? 'English' : settings.language === 'fr' ? 'Français' : 'Español'}>
            <select value={settings.language || 'es'} onChange={e => savePref('language', e.target.value as any)}
              style={{ border:'none', outline:'none', fontSize:14, color:'#007AFF', background:'transparent', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 }}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </SettingsRow>
          <SettingsRow icon={<span style={{ fontSize:14 }}>🌡️</span>} iconBg="#FF9500" label="Temperatura">
            <PillSelect options={[{v:'F',l:'°F'},{v:'C',l:'°C'}]}
              value={settings.temperatureUnit || 'F'}
              onChange={v => savePref('temperatureUnit', v as any)} />
          </SettingsRow>
          <SettingsRow icon={<span style={{ fontSize:14 }}>🕐</span>} iconBg="#AF52DE" label="Hora" last>
            <PillSelect options={[{v:'12h',l:'12h'},{v:'24h',l:'24h'}]}
              value={settings.timeFormat || '12h'}
              onChange={v => savePref('timeFormat', v as any)} />
          </SettingsRow>
        </SettingsGroup>

        <motion.button whileTap={{ scale:0.97 }} onClick={() => { onUpdate({ familyName: profileName }); saved() }}
          style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#007AFF,#0063CC)', color:'#fff', fontSize:15, fontWeight:700, fontFamily:'var(--font-heading)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(0,122,255,0.30)' }}>
          <Save size={16} /> Guardar perfil
        </motion.button>
      </div>
    )

    // ── FAMILY ─────────────────────────────────────────────────────────────
    case 'family': return (
      <div>
        <SectionTitle>Familia</SectionTitle>

        {/* ── CLOUD SYNC (most important section) ── */}
        <SettingsGroup label="📱 Sincronizar en todos tus dispositivos">
          {!cloudId ? (
            /* Not connected yet */
            <div style={{ padding: 20 }}>
              <p style={{ fontSize:15, fontWeight:700, color:'#1C1C1E', marginBottom:8, fontFamily:'var(--font-heading)' }}>
                🌐 Conectar con la nube
              </p>
              <p style={{ fontSize:13, color:'#8E8E93', marginBottom:16, lineHeight:1.5 }}>
                Conecta tu app para que funcione en el iPad, teléfono y cualquier dispositivo con el mismo link.
              </p>

              {!showJoin ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {cloudDone ? (
                    <div style={{ padding:'16px', borderRadius:14, background:'rgba(52,199,89,0.10)', border:'1.5px solid rgba(52,199,89,0.30)', textAlign:'center' }}>
                      <p style={{ fontSize:16, fontWeight:900, color:'#34C759', fontFamily:'var(--font-heading)', marginBottom:6 }}>✅ ¡Familia creada en la nube!</p>
                      <p style={{ fontSize:13, color:'#3C3C43', marginBottom:12 }}>Tu código aparece abajo. Úsalo en el iPad.</p>
                      <p style={{ fontSize:22, fontWeight:900, color:'#007AFF', fontFamily:'monospace', letterSpacing:'0.15em', background:'rgba(0,122,255,0.08)', padding:'10px', borderRadius:10 }}>
                        {localStorage.getItem('fq_family_code') || '—'}
                      </p>
                    </div>
                  ) : (
                    <motion.button whileTap={{ scale:0.97 }} onClick={handleCloudCreate} disabled={syncing}
                      style={{ padding:'14px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#34C759,#28A745)', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-heading)', boxShadow:'0 4px 16px rgba(52,199,89,0.40)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      {syncing ? '⏳ Conectando...' : '🏠 Este es mi PC principal — Crear familia en la nube'}
                    </motion.button>
                  )}
                  {!cloudDone && (
                  <button onClick={() => setShowJoin(true)}
                    style={{ padding:'12px', borderRadius:14, border:'1.5px solid rgba(0,0,0,0.10)', background:'rgba(255,255,255,0.90)', color:'#007AFF', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    📱 Estoy en el iPad — Unirme a la familia existente
                  </button>
                  )}
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <p style={{ fontSize:13, color:'#3C3C43', fontWeight:600 }}>
                    Escribe el código de 8 letras que ves en el otro dispositivo (Settings → Familia)
                  </p>
                  <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={8}
                    placeholder="XXXXXXXX" autoFocus
                    style={{ padding:'14px', borderRadius:12, border:'1.5px solid rgba(0,0,0,0.10)', fontSize:24, fontFamily:'monospace', fontWeight:800, textAlign:'center', letterSpacing:'0.2em', color:'#007AFF', outline:'none' }} />
                  {joinDone ? (
                    <div style={{ padding:'16px', borderRadius:14, background:'rgba(0,122,255,0.08)', border:'1.5px solid rgba(0,122,255,0.25)', textAlign:'center' }}>
                      <p style={{ fontSize:15, fontWeight:900, color:'#007AFF', fontFamily:'var(--font-heading)', marginBottom:6 }}>✅ ¡Datos descargados!</p>
                      <p style={{ fontSize:13, color:'#3C3C43', marginBottom:12 }}>Toca el botón para ver tu familia en este dispositivo:</p>
                      <button onClick={() => window.location.reload()}
                        style={{ padding:'12px 24px', borderRadius:12, border:'none', background:'#007AFF', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-heading)' }}>
                        🔄 Recargar la app
                      </button>
                    </div>
                  ) : (
                    <motion.button whileTap={{ scale:0.97 }} onClick={handleJoin} disabled={joinCode.length<6||syncing}
                      style={{ padding:'13px', borderRadius:14, border:'none', background: joinCode.length>=6 ? 'linear-gradient(135deg,#007AFF,#0063CC)' : '#E5E5EA', color: joinCode.length>=6 ? '#fff' : '#C7C7CC', fontSize:15, fontWeight:800, cursor: joinCode.length>=6 ? 'pointer' : 'default', fontFamily:'var(--font-heading)' }}>
                      {syncing ? '⏳ Sincronizando...' : '🔗 Conectar y descargar datos'}
                    </motion.button>
                  )}
                  <button onClick={() => setShowJoin(false)} style={{ background:'none', border:'none', color:'#8E8E93', fontSize:13, cursor:'pointer' }}>← Volver</button>
                </div>
              )}
            </div>
          ) : (
            /* Already connected */
            <div style={{ padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <span style={{ fontSize:28 }}>☁️</span>
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:'#34C759', fontFamily:'var(--font-heading)' }}>✅ Conectado a la nube</p>
                  <p style={{ fontSize:12, color:'#8E8E93' }}>Los datos se sincronizan automáticamente</p>
                </div>
              </div>
              {/* Code to share with other devices */}
              <div style={{ background:'rgba(0,0,0,0.04)', borderRadius:12, padding:'12px 16px', marginBottom:12 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#8E8E93', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
                  Código para el iPad/otro dispositivo
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:'#007AFF', fontFamily:'monospace', letterSpacing:'0.15em', flex:1 }}>
                    {cloudCode || '–'}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(cloudCode); toast.success('Código copiado!') }}
                    style={{ padding:'8px 16px', borderRadius:10, border:'none', background:'rgba(0,122,255,0.12)', color:'#007AFF', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    Copiar
                  </button>
                </div>
              </div>
              <p style={{ fontSize:12, color:'#8E8E93', marginBottom:12, lineHeight:1.5 }}>
                👆 En el iPad: abre el link, ve a <strong>Settings → Familia</strong> y escribe este código
              </p>
              <motion.button whileTap={{ scale:0.96 }} onClick={handleCloudSync} disabled={syncing}
                style={{ width:'100%', padding:'11px', borderRadius:12, border:'none', background:syncing?'#E5E5EA':'rgba(52,199,89,0.12)', color:syncing?'#C7C7CC':'#34C759', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizar ahora'}
              </motion.button>
            </div>
          )}
        </SettingsGroup>

        {/* Invite code */}
        <SettingsGroup label="Código de invitación">
          <SettingsRow label="Código" sub="Compártelo para que otros se unan" icon={<span style={{ fontSize:14 }}>🔗</span>} iconBg="#FF9500" last>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:15, fontWeight:800, color:'#007AFF', fontFamily:'monospace', letterSpacing:'0.1em', background:'rgba(0,122,255,0.08)', padding:'4px 10px', borderRadius:8 }}>
                {settings.familyName?.slice(0,8).toUpperCase() || 'FAMQUEST'}
              </span>
              <button onClick={copyInvite}
                style={{ width:32, height:32, borderRadius:8, border:'none', background: copied ? 'rgba(52,199,89,0.12)' : 'rgba(0,122,255,0.10)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: copied ? '#34C759' : '#007AFF' }}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
              <button onClick={() => { const msg=encodeURIComponent(`Únete a FamilyQuest! Código: ${settings.familyName?.slice(0,8).toUpperCase()}`); window.open(`https://wa.me/?text=${msg}`) }}
                style={{ width:32, height:32, borderRadius:8, border:'none', background:'rgba(37,211,102,0.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#25D366' }}>
                <Share2 size={15} />
              </button>
            </div>
          </SettingsRow>
        </SettingsGroup>

        {/* Members */}
        <SettingsGroup label={`Miembros (${members.length})`}>
          {members.map((m, idx) => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: idx < members.length-1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <div style={{ position:'relative' }}>
                <MemberAvatar member={m} size={46} />
                <button onClick={() => fileRefs.current[m.id]?.click()}
                  style={{ position:'absolute', bottom:-2, right:-2, width:18, height:18, borderRadius:'50%', background:'#007AFF', border:'2px solid #F2F2F7', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Camera size={9} />
                </button>
                <input ref={el=>{if(el)fileRefs.current[m.id]=el}} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e=>{const f=e.target.files?.[0];if(f)handlePhotoUpload(m.id,f)}} />
              </div>

              {editingId === m.id ? (
                <div style={{ flex:1, display:'flex', gap:8 }}>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} autoFocus
                    style={{ flex:1, padding:'8px 12px', borderRadius:10, border:'1.5px solid #007AFF', fontSize:14, fontFamily:'var(--font-body)', outline:'none', background:'rgba(0,122,255,0.04)' }} />
                  <button onClick={() => { updateMember(m.id,{name:editName}); setEditingId(null); saved() }}
                    style={{ width:34, height:34, borderRadius:10, background:'rgba(52,199,89,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#34C759' }}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    style={{ width:34, height:34, borderRadius:10, background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <X size={16} color="#8E8E93" />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#1C1C1E', fontFamily:'var(--font-body)' }}>{m.name}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:m.textColor, background:m.bgColor, padding:'2px 8px', borderRadius:99, textTransform:'capitalize' }}>{m.role}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {/* Emoji change */}
                    <div style={{ position:'relative' }}>
                      <button onClick={() => setShowEmojiFor(showEmojiFor===m.id?null:m.id)}
                        style={{ width:34, height:34, borderRadius:10, border:'1px solid rgba(0,0,0,0.10)', background:'rgba(255,255,255,0.90)', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {m.emoji}
                      </button>
                      <AnimatePresence>
                        {showEmojiFor===m.id && (
                          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                            style={{ position:'absolute', top:'110%', right:0, zIndex:99 }}>
                            <EmojiPicker value={m.emoji} onChange={e=>{updateMember(m.id,{emoji:e});setShowEmojiFor(null);saved()}} onClose={()=>setShowEmojiFor(null)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={()=>{setEditingId(m.id);setEditName(m.name)}}
                      style={{ width:34, height:34, borderRadius:10, border:'1px solid rgba(0,0,0,0.10)', background:'rgba(255,255,255,0.90)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Edit2 size={14} color="#8E8E93" />
                    </button>
                    <button onClick={()=>{if(confirm(`¿Eliminar a ${m.name}?`))removeMember(m.id)}}
                      style={{ width:34, height:34, borderRadius:10, border:'none', background:'rgba(255,59,48,0.10)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Trash2 size={14} color="#FF3B30" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add member button */}
          <div style={{ padding:'0 16px 4px' }}>
            <button onClick={() => setShowAddMember(true)}
              style={{ width:'100%', padding:'12px', borderRadius:12, border:'1.5px dashed rgba(0,122,255,0.3)', background:'rgba(0,122,255,0.04)', color:'#007AFF', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'var(--font-body)', marginTop:8, marginBottom:4 }}>
              <Plus size={16} /> Agregar miembro
            </button>
          </div>
        </SettingsGroup>

        {/* Add member modal */}
        <AnimatePresence>
          {showAddMember && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={e=>e.target===e.currentTarget&&setShowAddMember(false)}
              style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.30)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center' }}>
              <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
                transition={{type:'spring',stiffness:340,damping:30}}
                style={{ width:'100%',maxWidth:480,background:'rgba(255,251,247,0.98)',backdropFilter:'blur(40px)',borderRadius:'28px 28px 0 0',padding:'12px 24px 32px',boxShadow:'0 -4px 40px rgba(0,0,0,0.12)' }}>
                <div style={{ width:36,height:4,borderRadius:99,background:'rgba(0,0,0,0.12)',margin:'0 auto 18px' }} />
                <h2 style={{ fontSize:20,fontWeight:900,fontFamily:'var(--font-heading)',marginBottom:18 }}>Agregar miembro</h2>
                <div style={{ display:'flex',gap:10,alignItems:'center',marginBottom:14 }}>
                  <div style={{ position:'relative' }}>
                    <button onClick={()=>setShowEmojiFor('new')}
                      style={{ width:56,height:56,borderRadius:16,border:'1.5px solid rgba(0,0,0,0.10)',background:'rgba(255,255,255,0.90)',fontSize:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      {newMember.emoji}
                    </button>
                    <AnimatePresence>
                      {showEmojiFor==='new' && (
                        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} style={{ position:'absolute',top:'110%',left:0,zIndex:99 }}>
                          <EmojiPicker value={newMember.emoji} onChange={e=>{setNewMember(f=>({...f,emoji:e}));setShowEmojiFor(null)}} onClose={()=>setShowEmojiFor(null)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input value={newMember.name} onChange={e=>setNewMember(f=>({...f,name:e.target.value}))} placeholder="Nombre" autoFocus
                    style={{ flex:1,padding:'13px 16px',borderRadius:12,border:'1.5px solid rgba(0,0,0,0.10)',fontSize:15,fontFamily:'var(--font-body)',outline:'none',background:'rgba(255,255,255,0.90)' }} />
                </div>
                <div style={{ display:'flex',gap:8,marginBottom:14 }}>
                  {[{v:'adult',l:'👨 Adulto'},{v:'child',l:'👦 Niño/a'}].map(opt=>(
                    <button key={opt.v} onClick={()=>setNewMember(f=>({...f,role:opt.v as any}))}
                      style={{ flex:1,padding:'10px',borderRadius:12,border:`1.5px solid ${newMember.role===opt.v?'#007AFF':'rgba(0,0,0,0.10)'}`,background:newMember.role===opt.v?'rgba(0,122,255,0.08)':'rgba(255,255,255,0.90)',color:newMember.role===opt.v?'#007AFF':'#3C3C43',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-body)' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex',gap:8,marginBottom:18,flexWrap:'wrap' }}>
                  {COLOR_OPTIONS.map((c,i)=>(
                    <button key={i} onClick={()=>setNewMember(f=>({...f,colorIdx:i}))}
                      style={{ width:32,height:32,borderRadius:'50%',background:c.bar,border:`3px solid ${newMember.colorIdx===i?'#1C1C1E':'transparent'}`,cursor:'pointer',boxShadow:newMember.colorIdx===i?`0 0 0 2px rgba(255,255,255,0.9)`:undefined }} />
                  ))}
                </div>
                <motion.button whileTap={{scale:0.97}} onClick={()=>{
                  if(!newMember.name.trim())return
                  const c=COLOR_OPTIONS[newMember.colorIdx]
                  addMember({name:newMember.name.trim(),emoji:newMember.emoji,bgColor:c.bg,textColor:c.text,barColor:c.bar,role:newMember.role})
                  setNewMember({name:'',emoji:'👤',colorIdx:0,role:'child'})
                  setShowAddMember(false); saved()
                }} style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#007AFF,#0063CC)',color:'#fff',fontSize:15,fontWeight:700,fontFamily:'var(--font-heading)',cursor:'pointer',boxShadow:'0 4px 14px rgba(0,122,255,0.30)' }}>
                  Agregar
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )

    // ── APPEARANCE ─────────────────────────────────────────────────────────
    case 'appearance': return (
      <div>
        <SectionTitle>Apariencia</SectionTitle>

        <SettingsGroup label="Modo de color">
          <SettingsRow icon={<span style={{ fontSize:14 }}>☀️</span>} iconBg="#FF9500" label="Modo" last>
            <PillSelect options={[{v:'light',l:'Claro'},{v:'dark',l:'Oscuro'},{v:'system',l:'Auto'}]}
              value={settings.theme || 'light'} onChange={v => savePref('theme', v as any)} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Fuente">
          <SettingsRow icon={<span style={{ fontSize:14 }}>Aa</span>} iconBg="#AF52DE" label="Tamaño de letra" last>
            <PillSelect options={[{v:'small',l:'S'},{v:'normal',l:'M'},{v:'large',l:'L'},{v:'xlarge',l:'XL'}]}
              value={settings.fontSize as string || 'normal'} onChange={v => savePref('fontSize' as any, v)} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Color de acento">
          <div style={{ padding:'16px' }}>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
              {['#007AFF','#34C759','#FF3B30','#FF9500','#AF52DE','#5856D6','#FF2D55','#00C7BE','#FFCC00','#FF6B00'].map(c=>(
                <button key={c} onClick={() => savePref('accentColor' as any, c)}
                  style={{ width:36, height:36, borderRadius:'50%', background:c, border:`3px solid ${(settings as any).accentColor===c?'#1C1C1E':'transparent'}`, cursor:'pointer', boxShadow:(settings as any).accentColor===c?`0 0 0 2px rgba(255,255,255,0.9)`:undefined }} />
              ))}
            </div>
          </div>
        </SettingsGroup>
      </div>
    )

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────
    case 'notifications': return (
      <div>
        <SectionTitle>Notificaciones</SectionTitle>

        <SettingsGroup>
          <SettingsRow icon={<Bell size={16} color="#fff" />} iconBg="#FF3B30" label="Notificaciones" sub="Activar o desactivar todas" last>
            <Toggle value={notifMaster} onChange={v => { setNotifMaster(v); savePref('notifications', v) }} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Por tipo">
          {[
            { k:'taskReminder', l:'Recordatorio de task',   s:'Antes de que venza',          bg:'#FF9500' },
            { k:'taskDone',     l:'Task completado',        s:'Cuando un hijo termina',       bg:'#34C759' },
            { k:'newEvent',     l:'Nuevo evento',           s:'Eventos en el calendario',     bg:'#007AFF' },
            { k:'achievement',  l:'Logro desbloqueado',     s:'¡Felicidades!',                bg:'#FFCC00' },
            { k:'reward',       l:'Premio reclamado',       s:'Solicitudes de recompensa',    bg:'#AF52DE' },
          ].map((item, i, arr) => (
            <SettingsRow key={item.k} icon={<Bell size={14} color="#fff" />} iconBg={item.bg}
              label={item.l} sub={item.s} last={i===arr.length-1}>
              <Toggle size="sm" value={(notifTypes as any)[item.k]} disabled={!notifMaster}
                onChange={v => setNotifTypes(t=>({...t,[item.k]:v}))} />
            </SettingsRow>
          ))}
        </SettingsGroup>

        <SettingsGroup label="Horas de silencio">
          <SettingsRow icon={<span style={{ fontSize:14 }}>🌙</span>} iconBg="#636366" label="Silenciar notificaciones">
            <Toggle value={silentHours} onChange={v => { setSilentHours(v); saved() }} />
          </SettingsRow>
          {silentHours && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px 14px' }}>
              {[{l:'Desde',v:silentFrom,s:setSilentFrom},{l:'Hasta',v:silentTo,s:setSilentTo}].map(f=>(
                <div key={f.l}>
                  <p style={{ fontSize:11,fontWeight:600,color:'#8E8E93',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em' }}>{f.l}</p>
                  <input type="time" value={f.v} onChange={e=>{f.s(e.target.value);saved()}}
                    style={{ width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid rgba(0,0,0,0.10)',fontSize:14,fontFamily:'var(--font-body)',outline:'none',color:'#1C1C1E',background:'rgba(255,255,255,0.90)' }} />
                </div>
              ))}
            </div>
          )}
        </SettingsGroup>
      </div>
    )

    // ── GAMIFICATION ───────────────────────────────────────────────────────
    case 'gamification': return (
      <div>
        <SectionTitle>Gamificación</SectionTitle>
        <SettingsGroup>
          <SettingsRow icon={<span style={{ fontSize:14 }}>⭐</span>} iconBg="#FFCC00" label="Sistema de puntos" sub="Los hijos ganan puntos al completar tasks">
            <Toggle value={true} onChange={() => toast('Próximamente')} />
          </SettingsRow>
          <SettingsRow icon={<span style={{ fontSize:14 }}>🔥</span>} iconBg="#FF9500" label="Rachas" sub="Días consecutivos completando tasks" last>
            <Toggle value={true} onChange={() => toast('Próximamente')} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Logros disponibles">
          {[{e:'🌟',t:'Primera Tarea',d:'Completar el primer task'},{e:'🔥',t:'Racha de 7 días',d:'7 días consecutivos'},{e:'💯',t:'Perfeccionista',d:'100 tasks completados'},{e:'👑',t:'Campeón',d:'1000 puntos acumulados'}].map((a,i,arr)=>(
            <SettingsRow key={a.t} icon={<span style={{ fontSize:16 }}>{a.e}</span>} iconBg="transparent" label={a.t} sub={a.d} last={i===arr.length-1} />
          ))}
        </SettingsGroup>
      </div>
    )

    // ── CALENDAR ───────────────────────────────────────────────────────────
    case 'calendar': return (
      <div>
        <SectionTitle>Calendario</SectionTitle>

        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, background:'rgba(0,122,255,0.08)', border:'1px solid rgba(0,122,255,0.20)', marginBottom:20 }}>
          <span style={{ fontSize:18 }}>✨</span>
          <p style={{ fontSize:13, fontWeight:600, color:'#007AFF', fontFamily:'var(--font-body)' }}>Cambios instantáneos — sin botón de guardar</p>
        </div>

        <SettingsGroup label="Vista">
          <SettingsRow icon={<CalendarDays size={16} color="#fff" />} iconBg="#34C759" label="Vista por defecto"
            value={calPrefs.defaultView==='week'?'Semana':calPrefs.defaultView==='day'?'Día':calPrefs.defaultView==='month'?'Mes':'Agenda'} last>
            <PillSelect options={[{v:'week',l:'Semana'},{v:'day',l:'Día'},{v:'month',l:'Mes'},{v:'agenda',l:'Agenda'}]}
              value={calPrefs.defaultView} onChange={v => saveCalPref({ defaultView: v as any })} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Opciones">
          <SettingsRow icon={<span style={{ fontSize:14 }}>📋</span>} iconBg="#007AFF" label="Mostrar tasks" sub="Tasks con hora en su slot">
            <Toggle value={calPrefs.showTasks} onChange={v => saveCalPref({ showTasks: v })} />
          </SettingsRow>
          <SettingsRow icon={<span style={{ fontSize:14 }}>📅</span>} iconBg="#FF9500" label="La semana empieza en">
            <PillSelect options={[{v:'monday',l:'Lunes'},{v:'sunday',l:'Domingo'}]}
              value={calPrefs.weekStartsOn} onChange={v => saveCalPref({ weekStartsOn: v as any })} />
          </SettingsRow>
          <SettingsRow icon={<span style={{ fontSize:14 }}>🏖️</span>} iconBg="#5AC8FA" label="Mostrar fines de semana" sub="Sábado y domingo en la vista semanal" last>
            <Toggle value={calPrefs.showWeekends} onChange={v => saveCalPref({ showWeekends: v })} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Integraciones">
          <SettingsRow icon={<span style={{ fontSize:16 }}>🗓️</span>} iconBg="#34C759" label="Google Calendar" sub="Sincronizar eventos" showArrow onClick={() => toast('Próximamente')} />
          <SettingsRow icon={<span style={{ fontSize:16 }}>🍎</span>} iconBg="#636366" label="Apple Calendar" sub="Importar/exportar" showArrow onClick={() => toast('Próximamente')} last />
        </SettingsGroup>

        <button onClick={() => toast('Exportando .ics...')}
          style={{ width:'100%',padding:'13px',borderRadius:12,border:'1px solid rgba(0,0,0,0.10)',background:'rgba(255,255,255,0.90)',color:'#007AFF',fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'var(--font-body)' }}>
          <Download size={15} /> Exportar calendario (.ics)
        </button>
      </div>
    )

    // ── SECURITY ───────────────────────────────────────────────────────────
    case 'security': return (
      <div>
        <SectionTitle>Seguridad</SectionTitle>

        <SettingsGroup label="Contraseña">
          {[{l:'Contraseña actual',k:'current'},{l:'Nueva contraseña',k:'next'},{l:'Confirmar nueva',k:'confirm'}].map((f,i,arr)=>(
            <SettingsRow key={f.k} icon={i===0?<span>🔑</span>:<span>🔒</span>} iconBg="#636366" label={f.l} last={i===arr.length-1}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <input type={showPw?'text':'password'} value={(pwForm as any)[f.k]}
                  onChange={e=>setPwForm(p=>({...p,[f.k]:e.target.value}))}
                  placeholder="••••••••"
                  style={{ border:'none',outline:'none',fontSize:14,color:'#8E8E93',textAlign:'right',background:'transparent',fontFamily:'var(--font-body)',width:120 }} />
                {i===0&&<button onClick={()=>setShowPw(v=>!v)} style={{ border:'none',background:'transparent',cursor:'pointer',color:'#8E8E93' }}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>}
              </div>
            </SettingsRow>
          ))}
        </SettingsGroup>

        <motion.button whileTap={{scale:0.97}} onClick={()=>{
          if(pwForm.next===pwForm.confirm&&pwForm.next.length>=6){toast.success('Contraseña actualizada ✅');setPwForm({current:'',next:'',confirm:''})}
          else toast.error('Las contraseñas no coinciden o son muy cortas')
        }} style={{ width:'100%',padding:'13px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#636366,#48484A)',color:'#fff',fontSize:14,fontWeight:700,fontFamily:'var(--font-heading)',cursor:'pointer',marginBottom:20 }}>
          Actualizar contraseña
        </motion.button>

        <SettingsGroup label="Seguridad adicional">
          <SettingsRow icon={<span style={{ fontSize:14 }}>🔐</span>} iconBg="#FF3B30" label="Autenticación 2 factores" sub="Más seguridad con autenticador" last>
            <Toggle value={twoFA} onChange={v=>{setTwoFA(v);saved()}} />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup label="Datos">
          <SettingsRow icon={<Download size={15} color="#fff" />} iconBg="#007AFF" label="Descargar mis datos" showArrow onClick={()=>{const d=JSON.stringify({});const b=new Blob([d],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='familyquest-backup.json';a.click();toast.success('Descargando...')}} />
          <SettingsRow icon={<LogOut size={15} color="#fff" />} iconBg="#FF3B30" label="Cerrar sesión en todos" showArrow last onClick={()=>toast.error('Todas las sesiones cerradas')} />
        </SettingsGroup>

        <SettingsGroup label="Zona peligrosa">
          <div style={{ padding:'16px' }}>
            <p style={{ fontSize:13,color:'#FF3B30',fontWeight:600,marginBottom:10 }}>
              ⚠️ Escribe ELIMINAR para confirmar el borrado de cuenta
            </p>
            <input value={deleteWord} onChange={e=>setDeleteWord(e.target.value)} placeholder='Escribe "ELIMINAR"'
              style={{ width:'100%',padding:'11px 14px',borderRadius:10,border:`1.5px solid ${deleteWord==='ELIMINAR'?'#FF3B30':'rgba(0,0,0,0.10)'}`,fontSize:14,fontFamily:'var(--font-body)',outline:'none',marginBottom:10,color:'#1C1C1E' }} />
            <button disabled={deleteWord!=='ELIMINAR'}
              onClick={()=>{if(deleteWord==='ELIMINAR'){localStorage.clear();window.location.reload()}}}
              style={{ width:'100%',padding:'12px',borderRadius:10,border:'none',background:deleteWord==='ELIMINAR'?'#FF3B30':'rgba(0,0,0,0.06)',color:deleteWord==='ELIMINAR'?'#fff':'#C7C7CC',fontSize:14,fontWeight:700,cursor:deleteWord==='ELIMINAR'?'pointer':'default',fontFamily:'var(--font-heading)' }}>
              Eliminar cuenta permanentemente
            </button>
          </div>
        </SettingsGroup>
      </div>
    )

    // ── SUBSCRIPTION ───────────────────────────────────────────────────────
    case 'subscription': return (
      <div>
        <SectionTitle>Plan</SectionTitle>

        <div style={{ padding:'20px', borderRadius:18, background:'linear-gradient(135deg,#007AFF,#5856D6)', color:'#fff', marginBottom:20, boxShadow:'0 8px 24px rgba(0,122,255,0.35)' }}>
          <p style={{ fontSize:12,fontWeight:600,opacity:0.7,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4 }}>Plan actual</p>
          <p style={{ fontSize:26,fontWeight:900,fontFamily:'var(--font-heading)',marginBottom:4 }}>Free</p>
          <p style={{ fontSize:13,opacity:0.8 }}>5 miembros · 30 tasks/mes</p>
        </div>

        <SettingsGroup label="Planes disponibles">
          {[
            { name:'Pro', price:'$4.99/mes', color:'#007AFF', features:['Miembros ilimitados','Tasks sin límite','Historial completo'] },
            { name:'Family Pro', price:'$9.99/mes', color:'#AF52DE', features:['Todo en Pro','8 miembros','Soporte prioritario'] },
          ].map((plan,i,arr)=>(
            <div key={plan.name} style={{ padding:'16px', borderBottom: i<arr.length-1?'1px solid rgba(0,0,0,0.06)':'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <p style={{ fontSize:16,fontWeight:800,color:plan.color,fontFamily:'var(--font-heading)' }}>{plan.name}</p>
                  <p style={{ fontSize:13,color:'#8E8E93',marginTop:2 }}>{plan.price}</p>
                </div>
                <button onClick={()=>toast('Próximamente: Stripe Checkout')}
                  style={{ padding:'8px 20px',borderRadius:99,border:`1.5px solid ${plan.color}`,background:`rgba(${plan.color==='#007AFF'?'0,122,255':'175,82,222'},0.10)`,color:plan.color,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-body)' }}>
                  Upgrade
                </button>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {plan.features.map(f=>(
                  <span key={f} style={{ fontSize:11,fontWeight:600,color:'#636366',background:'rgba(0,0,0,0.04)',padding:'3px 10px',borderRadius:99 }}>✓ {f}</span>
                ))}
              </div>
            </div>
          ))}
        </SettingsGroup>
      </div>
    )

    // ── ABOUT ──────────────────────────────────────────────────────────────
    case 'about': return (
      <div>
        <SectionTitle>Acerca de</SectionTitle>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 0', marginBottom:20 }}>
          <div style={{ width:80,height:80,borderRadius:20,background:'linear-gradient(135deg,#E07B8A,#D45C6B)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-heading)',fontWeight:900,fontSize:28,color:'#fff',boxShadow:'0 6px 20px rgba(224,123,138,0.40)',marginBottom:14 }}>FQ</div>
          <p style={{ fontSize:22,fontWeight:900,fontFamily:'var(--font-heading)',color:'#1C1C1E' }}>FamilyQuest</p>
          <p style={{ fontSize:14,color:'#8E8E93',marginTop:4 }}>Versión 1.0.0</p>
        </div>

        <SettingsGroup>
          {[
            { l:'Términos de uso',        e:'📄', onClick:()=>toast('Próximamente') },
            { l:'Política de privacidad', e:'🔏', onClick:()=>toast('Próximamente') },
            { l:'Contacto / Soporte',     e:'💬', onClick:()=>toast('hola@familyquest.app') },
            { l:'Calificar la app',       e:'⭐', onClick:()=>toast('¡Gracias!'), last:true },
          ].map((item,i,arr)=>(
            <SettingsRow key={item.l} icon={<span style={{ fontSize:16 }}>{item.e}</span>} iconBg="transparent"
              label={item.l} showArrow onClick={item.onClick} last={i===arr.length-1} />
          ))}
        </SettingsGroup>

        <p style={{ textAlign:'center',fontSize:12,color:'#C7C7CC',marginTop:20 }}>
          Hecho con ❤️ para las familias · © 2026 FamilyQuest
        </p>
      </div>
    )

    default: return null
    }
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', height:'100%', background:'#F2F2F7', overflow:'hidden', fontFamily:'var(--font-body)' }}>

      {/* Sidebar */}
      <div style={{ width:240, background:'#F2F2F7', borderRight:'1px solid rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 10px' }}>
          <p style={{ fontSize:22, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)' }}>{t('settings.title')}</p>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0 10px 16px' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:12, border:'none',
                background: active===s.id ? '#fff' : 'transparent',
                cursor:'pointer', marginBottom:2,
                boxShadow: active===s.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition:'all 0.15s',
              }}>
              <div style={{ width:30, height:30, borderRadius:8, background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {s.emoji}
              </div>
              <span style={{ fontSize:14, fontWeight: active===s.id ? 700 : 500, color: active===s.id ? '#1C1C1E' : '#3C3C43', fontFamily:'var(--font-body)', flex:1, textAlign:'left' }}>
                {s.label}
              </span>
              {active===s.id && <ChevronRight size={14} color="#C7C7CC" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity:0, x:10 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-10 }}
            transition={{ duration:0.16, ease:'easeInOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize:26, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)', marginBottom:20 }}>{children}</h1>
}
