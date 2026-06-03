'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createFamily, joinFamily, uploadLocalData, downloadFamilyData, FAMILY_ID_KEY } from '@/lib/sync'
import toast from 'react-hot-toast'

interface FamilySetupProps {
  onConnected: () => void
  existingFamilyName?: string
}

export function FamilySetup({ onConnected, existingFamilyName }: FamilySetupProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [name, setName]   = useState(existingFamilyName || '')
  const [code, setCode]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const result = await createFamily(name.trim())
      if (!result) throw new Error('No se pudo crear la familia')

      // Upload any existing local data
      await uploadLocalData(result.id)
      toast.success(`¡Familia creada! Código: ${result.code}`, { duration: 4000 })
      onConnected()
    } catch (e: any) {
      toast.error(e.message || 'Error al crear')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true)
    try {
      const result = await joinFamily(code.trim())
      if (!result) throw new Error('Código incorrecto')

      // Download family data to this device
      await downloadFamilyData(localStorage.getItem(FAMILY_ID_KEY)!)
      toast.success(`¡Bienvenido a ${result.name}!`)
      // Reload to pick up new data
      setTimeout(() => window.location.reload(), 800)
    } catch (e: any) {
      toast.error(e.message || 'Código no encontrado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'linear-gradient(145deg, #FFF8F5 0%, #FFF0F3 50%, #F5F0FF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 28,
          padding: '40px 36px',
          maxWidth: 420, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.8)',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 56, marginBottom: 8 }}>📅</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1C1C1E', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
          FamilyQuest
        </h1>
        <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 32 }}>
          Sincroniza tu familia en todos los dispositivos
        </p>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-10 }}>
              <p style={{ fontSize: 15, color: '#3C3C43', fontWeight: 600, marginBottom: 20 }}>
                ¿Qué quieres hacer?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('create')}
                  style={{ padding: '16px 24px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#E07B8A,#D45C6B)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 4px 16px rgba(224,123,138,0.40)' }}>
                  🏠 Crear nueva familia
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('join')}
                  style={{ padding: '16px 24px', borderRadius: 16, border: '1.5px solid rgba(0,0,0,0.10)', background: 'rgba(255,255,255,0.90)', color: '#1C1C1E', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  🔗 Unirse a familia existente
                </motion.button>
              </div>
              <p style={{ fontSize: 12, color: '#C7C7CC', marginTop: 20 }}>
                Necesitas conexión a internet para sincronizar
              </p>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1E', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
                Crear familia
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 20 }}>
                Se guardará todo tu contenido en la nube
              </p>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Nombre de tu familia (ej: Sussman)"
                autoFocus
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.10)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', marginBottom: 14, textAlign: 'center', fontWeight: 600 }}
              />
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={!name.trim() || loading}
                style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: name.trim() ? 'linear-gradient(135deg,#E07B8A,#D45C6B)' : '#E5E5EA', color: name.trim() ? '#fff' : '#C7C7CC', fontSize: 15, fontWeight: 800, cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'var(--font-heading)', marginBottom: 10 }}>
                {loading ? '⏳ Creando...' : '✅ Crear y conectar'}
              </motion.button>
              <button onClick={() => setMode('choose')} style={{ background: 'none', border: 'none', color: '#8E8E93', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                ← Volver
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1E', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
                Unirse a familia
              </h2>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 20 }}>
                Ingresa el código de 8 letras que ves en el otro dispositivo
                <br />
                <strong style={{ color: '#1C1C1E' }}>Settings → Familia → Código de invitación</strong>
              </p>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="XXXXXXXX"
                maxLength={8}
                autoFocus
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.10)', fontSize: 24, fontFamily: 'monospace', fontWeight: 800, outline: 'none', marginBottom: 14, textAlign: 'center', letterSpacing: '0.2em', color: '#007AFF' }}
              />
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={code.length < 6 || loading}
                style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: code.length >= 6 ? 'linear-gradient(135deg,#007AFF,#0063CC)' : '#E5E5EA', color: code.length >= 6 ? '#fff' : '#C7C7CC', fontSize: 15, fontWeight: 800, cursor: code.length >= 6 ? 'pointer' : 'default', fontFamily: 'var(--font-heading)', marginBottom: 10 }}>
                {loading ? '⏳ Sincronizando...' : '🔗 Conectar y sincronizar'}
              </motion.button>
              <button onClick={() => setMode('choose')} style={{ background: 'none', border: 'none', color: '#8E8E93', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                ← Volver
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
