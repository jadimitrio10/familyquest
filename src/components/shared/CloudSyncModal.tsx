/**
 * CloudSyncModal — completely isolated from SettingsView
 * Handles Supabase sync without affecting parent component renders
 */
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createFamily, joinFamily, uploadLocalData, downloadFamilyData, FAMILY_ID_KEY, FAMILY_CODE_KEY } from '@/lib/sync'

interface CloudSyncModalProps {
  familyName: string
  onClose: () => void
}

type View = 'home' | 'create' | 'join' | 'manage' | 'uploading' | 'downloading' | 'done_upload' | 'done_join'

export function CloudSyncModal({ familyName, onClose }: CloudSyncModalProps) {
  const familyId     = localStorage.getItem(FAMILY_ID_KEY)
  const existingCode = localStorage.getItem(FAMILY_CODE_KEY)

  const [view, setView]       = useState<View>(familyId ? 'manage' : 'home')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading]   = useState(false)
  const [myCode, setMyCode]     = useState(existingCode || '')
  const [error, setError]       = useState('')
  const [progress, setProgress] = useState('')

  // ── Create + upload ─────────────────────────────────────────────────────
  const doCreate = useCallback(async () => {
    setLoading(true); setError(''); setView('uploading')
    try {
      setProgress('Creando familia en la nube...')
      const result = await createFamily(familyName || 'Mi Familia')
      if (!result) { setError('No se pudo conectar — verifica internet'); setView('create'); return }

      setProgress('Subiendo miembros...')
      await uploadLocalData(result.id)

      setMyCode(result.code)
      setView('done_upload')
    } catch (e: any) {
      setError(e?.message || 'Error de conexión')
      setView('create')
    } finally { setLoading(false) }
  }, [familyName])

  // ── Re-upload (PC already connected, data wasn't uploaded) ──────────────
  const doUpload = useCallback(async () => {
    if (!familyId) return
    setLoading(true); setError(''); setView('uploading')
    try {
      setProgress('Subiendo todos tus datos...')
      await uploadLocalData(familyId)
      setView('done_upload')
    } catch (e: any) {
      setError(e?.message || 'Error al subir')
      setView('manage')
    } finally { setLoading(false) }
  }, [familyId])

  // ── Join + download ──────────────────────────────────────────────────────
  const doJoin = useCallback(async () => {
    if (!joinCode.trim()) return
    setLoading(true); setError(''); setView('downloading')
    try {
      setProgress('Buscando familia...')
      const result = await joinFamily(joinCode.trim())
      if (!result) { setError('Código incorrecto — verifica las letras'); setView('join'); return }

      setProgress('Descargando miembros...')
      const fid = localStorage.getItem(FAMILY_ID_KEY)
      if (fid) await downloadFamilyData(fid)

      setView('done_join')
    } catch (e: any) {
      setError(e?.message || 'Error de conexión')
      setView('join')
    } finally { setLoading(false) }
  }, [joinCode])

  // ── Re-download (iPad already joined, but shows wrong data) ─────────────
  const doDownload = useCallback(async () => {
    if (!familyId) return
    setLoading(true); setError(''); setView('downloading')
    try {
      setProgress('Re-descargando todos los datos...')
      await downloadFamilyData(familyId)
      setView('done_join')
    } catch (e: any) {
      setError(e?.message || 'Error al descargar')
      setView('manage')
    } finally { setLoading(false) }
  }, [familyId])

  // ── Styles ───────────────────────────────────────────────────────────────
  const Btn = ({ onClick, disabled, color, text }: { onClick:()=>void; disabled?:boolean; color:string; text:string }) => (
    <button disabled={disabled} onClick={onClick}
      style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background:disabled?'#E5E5EA':color, color:disabled?'#C7C7CC':'#fff', fontSize:15, fontWeight:800, cursor:disabled?'default':'pointer', fontFamily:'var(--font-heading)', marginBottom:10 }}>
      {text}
    </button>
  )

  const Back = ({ to }: { to: View }) => (
    <button onClick={() => { setView(to); setError('') }}
      style={{ background:'none', border:'none', color:'#8E8E93', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', padding:'4px 0', display:'block', marginTop:4 }}>
      ← Volver
    </button>
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }}
        transition={{ type:'spring', stiffness:300, damping:25 }}
        style={{ position:'relative', background:'rgba(255,251,247,0.98)', backdropFilter:'blur(32px)', borderRadius:28, padding:'36px 28px', maxWidth:400, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.18)', textAlign:'center' }}>

        <button onClick={onClose}
          style={{ position:'absolute', top:14, right:14, width:30, height:30, borderRadius:'50%', border:'1px solid rgba(0,0,0,0.10)', background:'rgba(255,255,255,0.90)', cursor:'pointer', fontSize:16, color:'#8E8E93', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>

        {/* LOADING */}
        {(view === 'uploading' || view === 'downloading') && (
          <div>
            <div style={{ fontSize:48, marginBottom:16 }}>{view==='uploading'?'☁️':'📥'}</div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)', marginBottom:12 }}>
              {view==='uploading'?'Subiendo datos...':'Descargando datos...'}
            </h2>
            <p style={{ fontSize:14, color:'#8E8E93', marginBottom:20 }}>{progress}</p>
            <div style={{ height:4, borderRadius:99, background:'rgba(0,0,0,0.08)', overflow:'hidden' }}>
              <motion.div animate={{ x:['-100%','100%'] }} transition={{ duration:1.2, repeat:Infinity, ease:'easeInOut' }}
                style={{ height:'100%', width:'60%', borderRadius:99, background:'linear-gradient(90deg,#007AFF,#34C759)' }} />
            </div>
          </div>
        )}

        {/* HOME */}
        {view === 'home' && (
          <div>
            <div style={{ fontSize:48, marginBottom:12 }}>☁️</div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)', marginBottom:8 }}>Sincronizar dispositivos</h2>
            <p style={{ fontSize:13, color:'#8E8E93', marginBottom:24, lineHeight:1.5 }}>¿En qué dispositivo estás ahora?</p>
            <Btn onClick={() => setView('create')} color="linear-gradient(135deg,#34C759,#28A745)" text="🖥️ PC / Dispositivo principal" />
            <Btn onClick={() => setView('join')} color="linear-gradient(135deg,#007AFF,#0063CC)" text="📱 iPad / Otro dispositivo" />
          </div>
        )}

        {/* CREATE */}
        {view === 'create' && (
          <div>
            <div style={{ fontSize:48, marginBottom:12 }}>🏠</div>
            <h2 style={{ fontSize:18, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)', marginBottom:8 }}>Subir mis datos</h2>
            <p style={{ fontSize:13, color:'#8E8E93', marginBottom:20, lineHeight:1.5 }}>Sube todos tus datos (familia, tasks, eventos) a la nube. Recibirás un código para el iPad.</p>
            {error && <p style={{ color:'#FF3B30', fontSize:13, marginBottom:12 }}>{error}</p>}
            <Btn onClick={doCreate} disabled={loading} color="linear-gradient(135deg,#34C759,#28A745)" text={loading?'⏳ Subiendo...':'✅ Subir todos mis datos'} />
            <Back to="home" />
          </div>
        )}

        {/* JOIN */}
        {view === 'join' && (
          <div>
            <div style={{ fontSize:48, marginBottom:12 }}>📱</div>
            <h2 style={{ fontSize:18, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)', marginBottom:8 }}>Unirse a familia</h2>
            <p style={{ fontSize:13, color:'#8E8E93', marginBottom:6, lineHeight:1.5 }}>Escribe el código que ves en el PC:</p>
            <p style={{ fontSize:11, color:'#C7C7CC', marginBottom:14 }}>Settings → Familia → icono ☁️ → código en azul</p>
            <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={8}
              placeholder="XXXXXXXX"
              style={{ width:'100%', padding:'16px', borderRadius:14, border:'1.5px solid rgba(0,0,0,0.10)', fontSize:28, fontFamily:'monospace', fontWeight:900, textAlign:'center', letterSpacing:'0.2em', color:'#007AFF', outline:'none', marginBottom:14, background:'rgba(255,255,255,0.90)' }} />
            {error && <p style={{ color:'#FF3B30', fontSize:13, marginBottom:12 }}>{error}</p>}
            <Btn onClick={doJoin} disabled={joinCode.length<6||loading} color="linear-gradient(135deg,#007AFF,#0063CC)" text={loading?'⏳ Conectando...':'🔗 Descargar y sincronizar'} />
            <Back to="home" />
          </div>
        )}

        {/* MANAGE (already connected) */}
        {view === 'manage' && (
          <div>
            <div style={{ fontSize:40, marginBottom:12 }}>☁️</div>
            <p style={{ fontSize:13, fontWeight:800, color:'#34C759', fontFamily:'var(--font-heading)', marginBottom:4 }}>✅ Conectado a la nube</p>
            {existingCode && (
              <div style={{ background:'rgba(0,122,255,0.08)', borderRadius:12, padding:'10px 16px', marginBottom:16 }}>
                <p style={{ fontSize:11, color:'#8E8E93', marginBottom:4 }}>Código para otros dispositivos:</p>
                <p style={{ fontSize:24, fontWeight:900, color:'#007AFF', fontFamily:'monospace', letterSpacing:'0.15em' }}>{existingCode}</p>
                <button onClick={() => { navigator.clipboard.writeText(existingCode) }}
                  style={{ fontSize:12, color:'#007AFF', border:'none', background:'transparent', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600, marginTop:4 }}>
                  📋 Copiar código
                </button>
              </div>
            )}
            <p style={{ fontSize:12, color:'#8E8E93', marginBottom:16, lineHeight:1.5 }}>
              ¿Tienes datos nuevos que sincronizar? Usa los botones según tu situación:
            </p>
            <button onClick={doUpload} disabled={loading}
              style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background: loading?'#E5E5EA':'linear-gradient(135deg,#34C759,#28A745)', color: loading?'#C7C7CC':'#fff', fontSize:14, fontWeight:800, cursor: loading?'default':'pointer', fontFamily:'var(--font-heading)', marginBottom:10 }}>
              {loading?'⏳ Subiendo...':'⬆️ Subir datos del PC a la nube'}
            </button>
            <button onClick={doDownload} disabled={loading}
              style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background: loading?'#E5E5EA':'linear-gradient(135deg,#007AFF,#0063CC)', color: loading?'#C7C7CC':'#fff', fontSize:14, fontWeight:800, cursor: loading?'default':'pointer', fontFamily:'var(--font-heading)', marginBottom:10 }}>
              {loading?'⏳ Descargando...':'⬇️ Descargar datos de la nube (iPad)'}
            </button>
            <button onClick={onClose}
              style={{ background:'none', border:'none', color:'#8E8E93', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', padding:'4px 0' }}>
              Cerrar
            </button>
            {error && <p style={{ color:'#FF3B30', fontSize:12, marginTop:8 }}>{error}</p>}
          </div>
        )}

        {/* DONE UPLOAD */}
        {view === 'done_upload' && (
          <div>
            <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#34C759', fontFamily:'var(--font-heading)', marginBottom:8 }}>¡Datos subidos!</h2>
            <p style={{ fontSize:13, color:'#3C3C43', marginBottom:20, lineHeight:1.5 }}>
              Ahora ve al iPad, abre Settings → Familia → ☁️ y escribe este código:
            </p>
            <div style={{ background:'rgba(0,122,255,0.08)', borderRadius:16, padding:'16px 20px', marginBottom:20 }}>
              <p style={{ fontSize:32, fontWeight:900, color:'#007AFF', fontFamily:'monospace', letterSpacing:'0.2em' }}>
                {myCode || existingCode || '—'}
              </p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(myCode || existingCode || '') }}
              style={{ width:'100%', padding:'12px', borderRadius:14, border:'none', background:'rgba(0,122,255,0.10)', color:'#007AFF', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', marginBottom:10 }}>
              📋 Copiar código
            </button>
            <button onClick={onClose}
              style={{ width:'100%', padding:'12px', borderRadius:14, border:'none', background:'rgba(0,0,0,0.06)', color:'#3C3C43', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
              Listo ✓
            </button>
          </div>
        )}

        {/* DONE JOIN */}
        {view === 'done_join' && (
          <div>
            <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#34C759', fontFamily:'var(--font-heading)', marginBottom:8 }}>¡Sincronizado!</h2>
            <p style={{ fontSize:13, color:'#3C3C43', marginBottom:24, lineHeight:1.5 }}>
              Recarga la página para ver todos tus datos en este dispositivo.
            </p>
            <button onClick={() => window.location.reload()}
              style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#007AFF,#0063CC)', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-heading)', boxShadow:'0 4px 16px rgba(0,122,255,0.35)' }}>
              🔄 Recargar la app
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
