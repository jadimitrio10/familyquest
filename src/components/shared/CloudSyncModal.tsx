/**
 * CloudSyncModal — completely isolated from SettingsView
 * Uses its own state, no shared state with parent
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createFamily, joinFamily, uploadLocalData, downloadFamilyData, FAMILY_ID_KEY, FAMILY_CODE_KEY } from '@/lib/sync'

interface CloudSyncModalProps {
  familyName: string
  onClose: () => void
}

export function CloudSyncModal({ familyName, onClose }: CloudSyncModalProps) {
  const familyId = localStorage.getItem(FAMILY_ID_KEY)
  const existingCode = localStorage.getItem(FAMILY_CODE_KEY)

  const [view, setView]     = useState<'home' | 'create' | 'join' | 'done_create' | 'done_join'>(
    familyId ? 'done_create' : 'home'
  )
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading]   = useState(false)
  const [myCode, setMyCode]     = useState(existingCode || '')
  const [error, setError]       = useState('')

  const doCreate = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await createFamily(familyName || 'Mi Familia')
      if (!result) { setError('No se pudo conectar. Verifica internet.'); return }
      try { await uploadLocalData(result.id) } catch {}
      setMyCode(result.code)
      setView('done_create')
    } catch (e: any) {
      setError(e?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [familyName])

  const doJoin = useCallback(async () => {
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await joinFamily(joinCode.trim())
      if (!result) { setError('Código incorrecto'); return }
      const fid = localStorage.getItem(FAMILY_ID_KEY)
      if (fid) await downloadFamilyData(fid)
      setView('done_join')
    } catch (e: any) {
      setError(e?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [joinCode])

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale:0.9, opacity:0, y:20 }}
        animate={{ scale:1, opacity:1, y:0 }}
        transition={{ type:'spring', stiffness:300, damping:25 }}
        style={{ background:'rgba(255,251,247,0.98)', backdropFilter:'blur(32px)', borderRadius:28, padding:'36px 32px', maxWidth:420, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.18)', textAlign:'center' }}
      >
        {/* Close */}
        <button onClick={onClose}
          style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%', border:'1px solid rgba(0,0,0,0.10)', background:'rgba(255,255,255,0.90)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#8E8E93' }}>
          ×
        </button>

        <div style={{ fontSize:48, marginBottom:12 }}>☁️</div>
        <h2 style={{ fontSize:22, fontWeight:900, color:'#1C1C1E', fontFamily:'var(--font-heading)', marginBottom:8 }}>
          Sincronizar dispositivos
        </h2>

        {/* HOME */}
        {view === 'home' && (
          <div>
            <p style={{ fontSize:14, color:'#8E8E93', marginBottom:28, lineHeight:1.5 }}>
              Conecta tu app para que el iPad, el teléfono y el PC tengan los mismos datos.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button disabled={loading} onClick={() => setView('create')}
                style={{ padding:'15px 20px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#34C759,#28A745)', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-heading)', boxShadow:'0 4px 16px rgba(52,199,89,0.35)' }}>
                🏠 Este es mi PC principal
              </button>
              <button disabled={loading} onClick={() => setView('join')}
                style={{ padding:'15px 20px', borderRadius:16, border:'1.5px solid rgba(0,0,0,0.10)', background:'rgba(255,255,255,0.90)', color:'#007AFF', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                📱 Estoy en el iPad / otro dispositivo
              </button>
            </div>
          </div>
        )}

        {/* CREATE */}
        {view === 'create' && (
          <div>
            <p style={{ fontSize:14, color:'#8E8E93', marginBottom:24, lineHeight:1.5 }}>
              Sube todos tus datos a la nube. Obtendrás un código para compartir con otros dispositivos.
            </p>
            {error && <p style={{ color:'#FF3B30', fontSize:13, marginBottom:12 }}>{error}</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button disabled={loading} onClick={doCreate}
                style={{ padding:'15px', borderRadius:16, border:'none', background: loading ? '#E5E5EA' : 'linear-gradient(135deg,#34C759,#28A745)', color: loading ? '#C7C7CC' : '#fff', fontSize:15, fontWeight:800, cursor: loading ? 'default' : 'pointer', fontFamily:'var(--font-heading)' }}>
                {loading ? '⏳ Conectando...' : '✅ Conectar y subir datos'}
              </button>
              <button onClick={() => { setView('home'); setError('') }}
                style={{ background:'none', border:'none', color:'#8E8E93', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', padding:8 }}>
                ← Volver
              </button>
            </div>
          </div>
        )}

        {/* JOIN */}
        {view === 'join' && (
          <div>
            <p style={{ fontSize:14, color:'#8E8E93', marginBottom:8, lineHeight:1.5 }}>
              Escribe el código de 8 letras que ves en tu PC
            </p>
            <p style={{ fontSize:12, color:'#C7C7CC', marginBottom:20 }}>
              (Settings → Familia → código en verde)
            </p>
            <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={8}
              placeholder="XXXXXXXX"
              style={{ width:'100%', padding:'16px', borderRadius:14, border:'1.5px solid rgba(0,0,0,0.10)', fontSize:28, fontFamily:'monospace', fontWeight:900, textAlign:'center', letterSpacing:'0.2em', color:'#007AFF', outline:'none', marginBottom:14, background:'rgba(255,255,255,0.90)' }} />
            {error && <p style={{ color:'#FF3B30', fontSize:13, marginBottom:12 }}>{error}</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button disabled={joinCode.length<6||loading} onClick={doJoin}
                style={{ padding:'15px', borderRadius:16, border:'none', background: joinCode.length>=6&&!loading ? 'linear-gradient(135deg,#007AFF,#0063CC)' : '#E5E5EA', color: joinCode.length>=6&&!loading ? '#fff' : '#C7C7CC', fontSize:15, fontWeight:800, cursor: joinCode.length>=6&&!loading ? 'pointer' : 'default', fontFamily:'var(--font-heading)' }}>
                {loading ? '⏳ Descargando...' : '🔗 Conectar este dispositivo'}
              </button>
              <button onClick={() => { setView('home'); setError('') }}
                style={{ background:'none', border:'none', color:'#8E8E93', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', padding:8 }}>
                ← Volver
              </button>
            </div>
          </div>
        )}

        {/* DONE CREATE */}
        {view === 'done_create' && (
          <div>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <p style={{ fontSize:16, fontWeight:900, color:'#34C759', fontFamily:'var(--font-heading)', marginBottom:8 }}>
              ¡Conectado a la nube!
            </p>
            <p style={{ fontSize:13, color:'#3C3C43', marginBottom:20, lineHeight:1.5 }}>
              Comparte este código con tu iPad u otros dispositivos:
            </p>
            <div style={{ background:'rgba(0,122,255,0.08)', borderRadius:16, padding:'16px 20px', marginBottom:20 }}>
              <p style={{ fontSize:32, fontWeight:900, color:'#007AFF', fontFamily:'monospace', letterSpacing:'0.2em' }}>
                {myCode || existingCode || '—'}
              </p>
            </div>
            <p style={{ fontSize:12, color:'#8E8E93', marginBottom:20, lineHeight:1.5 }}>
              📱 En el iPad: abre la app → Settings → Familia → icono ☁️ → "Estoy en el iPad" → escribe este código
            </p>
            <button onClick={() => { navigator.clipboard.writeText(myCode || existingCode || ''); }}
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
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <p style={{ fontSize:16, fontWeight:900, color:'#34C759', fontFamily:'var(--font-heading)', marginBottom:8 }}>
              ¡Datos descargados!
            </p>
            <p style={{ fontSize:13, color:'#3C3C43', marginBottom:24, lineHeight:1.5 }}>
              Recarga la página para ver todos tus datos en este dispositivo.
            </p>
            <button onClick={() => window.location.reload()}
              style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#007AFF,#0063CC)', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-heading)', boxShadow:'0 4px 16px rgba(0,122,255,0.35)' }}>
              🔄 Recargar la app ahora
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
