import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, Edit2, X, Star, TrendingUp } from 'lucide-react'
import { useMembersStore } from '@/hooks/useMembersStore'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { usePointsStore, type RewardItem } from '@/hooks/usePointsStore'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'

// Quick-pick emojis for rewards
const REWARD_EMOJIS = ['📱','🎬','🍕','🍦','🎮','🛍️','🎡','🎭','🏊','🚴','🎨','📚','🎵','🎯','🏆','⭐','🎁','🍫','🧁','🛹']

export function RewardsView() {
  const { members } = useMembersStore()
  const { balances, rewards, claimReward, addReward, updateReward, deleteReward, getMemberHistory } = usePointsStore()

  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store')
  const [activeMember, setActiveMember] = useState(members.filter(m => m.role==='child')[0]?.id ?? members[0]?.id ?? '')
  const [showAddReward, setShowAddReward] = useState(false)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [newForm, setNewForm] = useState({ title:'', emoji:'🎁', pointsCost:50 })

  const children = members.filter(m => m.role === 'child')
  const selectedMember = members.find(m => m.id === activeMember)
  const balance = balances[activeMember] ?? 0
  const history = getMemberHistory(activeMember)

  function handleClaim(reward: RewardItem) {
    const ok = claimReward(activeMember, reward)
    if (ok) {
      confetti({ particleCount:120, spread:70, origin:{y:0.6}, colors:[selectedMember?.barColor ?? '#FFD700','#fff','#FFD700'] })
      toast.success(`🎉 ¡${reward.title} canjeado!`, {
        duration: 3000,
        style: { background:selectedMember?.bgColor, color:selectedMember?.textColor, fontFamily:'var(--font-heading)', fontWeight:800, fontSize:15, borderRadius:16 },
      })
    } else {
      toast.error(`Necesitas ${reward.pointsCost - balance} puntos más`, { duration:2000 })
    }
  }

  function handleAddReward() {
    if (!newForm.title.trim()) return
    addReward({ title:newForm.title.trim(), emoji:newForm.emoji, pointsCost:newForm.pointsCost, isActive:true })
    setNewForm({ title:'', emoji:'🎁', pointsCost:50 })
    setShowAddReward(false)
    toast.success('Premio agregado ✅')
  }

  const AP = { type:'spring' as const, stiffness:400, damping:25 }

  return (
    <div style={{ display:'flex', height:'100%', background:'var(--bg)', overflow:'hidden', fontFamily:'var(--font-body)' }}>

      {/* ── LEFT: Member selector + balances ── */}
      <div style={{ width:220, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)', borderRight:'1px solid rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 12px' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Miembros</p>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0 10px 16px', display:'flex', flexDirection:'column', gap:6 }}>
          {members.map(m => {
            const bal = balances[m.id] ?? 0
            const active = m.id === activeMember
            return (
              <motion.button key={m.id} onClick={() => setActiveMember(m.id)}
                whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }} transition={AP}
                style={{ width:'100%', textAlign:'left', cursor:'pointer', padding:'11px 12px', borderRadius:18,
                  background: active ? `linear-gradient(135deg,${m.bgColor}ee,${m.bgColor}bb)` : 'rgba(255,255,255,0.5)',
                  backdropFilter:'blur(8px)',
                  border: active ? `1.5px solid ${m.barColor}50` : '1.5px solid transparent',
                  boxShadow: active ? `0 4px 16px ${m.barColor}25` : '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
                  <div style={{ position:'relative' }}>
                    <MemberAvatar member={m} size={36} />
                    {active && <motion.div initial={{scale:0}} animate={{scale:1}} style={{ position:'absolute',inset:-3,borderRadius:'50%',border:`2.5px solid ${m.barColor}`,pointerEvents:'none' }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:800, color:active?m.textColor:'var(--text-1)', fontFamily:'var(--font-heading)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</p>
                    <p style={{ fontSize:10, color:active?m.textColor:'var(--text-3)', opacity:0.75 }}>{m.role==='child'?'👦 Niño/a':'👨 Adulto'}</p>
                  </div>
                </div>
                {/* Points balance */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 10px', borderRadius:10, background:active?`${m.barColor}18`:'rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:active?m.textColor:'var(--text-3)' }}>⭐ Puntos</span>
                  <span style={{ fontSize:18, fontWeight:900, color:active?m.textColor:'var(--text-1)', fontFamily:'var(--font-heading)' }}>
                    {bal.toLocaleString()}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Rewards store + history ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px 14px', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(0,0,0,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
            {selectedMember && <MemberAvatar member={selectedMember} size={46}/>}
            <div style={{ flex:1 }}>
              <h1 style={{ fontSize:20, fontWeight:900, color:'var(--text-1)', fontFamily:'var(--font-heading)', marginBottom:4 }}>
                {selectedMember?.name ?? 'Rewards'}
              </h1>
              {/* Points balance big display */}
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:28 }}>⭐</span>
                <span style={{ fontSize:28, fontWeight:900, color:'#D97706', fontFamily:'var(--font-heading)', lineHeight:1 }}>
                  {balance.toLocaleString()}
                </span>
                <span style={{ fontSize:14, color:'var(--text-3)', fontWeight:600 }}>puntos disponibles</span>
              </div>
            </div>
            <motion.button whileTap={{scale:0.95}} whileHover={{scale:1.03,y:-1}} transition={AP}
              onClick={() => setShowAddReward(true)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#E07B8A,#D45C6B)', color:'#fff', border:'none', borderRadius:100, fontSize:13, fontWeight:700, fontFamily:'var(--font-heading)', cursor:'pointer', boxShadow:'0 4px 14px rgba(224,123,138,0.35)' }}>
              <Plus size={14}/> Agregar Premio
            </motion.button>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', background:'rgba(0,0,0,0.05)', borderRadius:12, padding:3, gap:0, width:'fit-content' }}>
            {[{v:'store',l:'🎁 Tienda'},{v:'history',l:'📜 Historial'}].map(tab => (
              <button key={tab.v} onClick={() => setActiveTab(tab.v as any)}
                style={{ padding:'8px 20px', borderRadius:10, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', background:activeTab===tab.v?'#fff':'transparent', color:activeTab===tab.v?'var(--text-1)':'var(--text-3)', boxShadow:activeTab===tab.v?'0 2px 8px rgba(0,0,0,0.10)':'none', transition:'all 0.2s' }}>
                {tab.l}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>

          {/* ── STORE TAB ── */}
          {activeTab === 'store' && (
            <div>
              {/* Rewards grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                {rewards.filter(r => r.isActive).map(r => {
                  const canAfford = balance >= r.pointsCost
                  const isEditing = editingId === r.id
                  return (
                    <motion.div key={r.id} layout
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                      style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)', borderRadius:20, padding:20, border:`1px solid ${canAfford?selectedMember?.barColor+'30':'rgba(0,0,0,0.07)'}`, boxShadow: canAfford?`0 4px 20px ${selectedMember?.barColor ?? '#E07B8A'}15`:'0 2px 8px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden', opacity:canAfford?1:0.7 }}>
                      {/* Top glow for affordable rewards */}
                      {canAfford && <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${selectedMember?.barColor ?? '#E07B8A'},transparent)` }}/>}

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <span style={{ fontSize:44 }}>{r.emoji}</span>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={() => setEditingId(isEditing?null:r.id)}
                            style={{ width:28,height:28,borderRadius:8,border:'none',background:'rgba(0,0,0,0.05)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)' }}>
                            <Edit2 size={12}/>
                          </button>
                          <button onClick={() => { if(confirm('¿Eliminar premio?')) deleteReward(r.id) }}
                            style={{ width:28,height:28,borderRadius:8,border:'none',background:'rgba(255,59,48,0.08)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#FF3B30' }}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                          <input defaultValue={r.title} onBlur={e => updateReward(r.id,{title:e.target.value})}
                            style={{ padding:'7px 10px',borderRadius:8,border:'1.5px solid var(--border)',fontSize:13,fontFamily:'var(--font-body)',outline:'none' }}/>
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-3)' }}>⭐</span>
                            <input type="number" defaultValue={r.pointsCost} min={1}
                              onBlur={e => updateReward(r.id,{pointsCost:Number(e.target.value)})}
                              style={{ width:80,padding:'7px 10px',borderRadius:8,border:'1.5px solid var(--border)',fontSize:13,fontFamily:'var(--font-body)',fontWeight:700,color:'#D97706',outline:'none' }}/>
                            <button onClick={() => setEditingId(null)}
                              style={{ marginLeft:'auto',padding:'6px 12px',borderRadius:8,border:'none',background:'var(--bg)',fontSize:12,fontWeight:600,cursor:'pointer',color:'var(--text-2)' }}>
                              Listo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p style={{ fontSize:15, fontWeight:800, color:'var(--text-1)', fontFamily:'var(--font-heading)', marginBottom:8, lineHeight:1.2 }}>{r.title}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
                            <span style={{ fontSize:22, fontWeight:900, color:'#D97706', fontFamily:'var(--font-heading)' }}>⭐{r.pointsCost}</span>
                            {!canAfford && (
                              <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>
                                (te faltan {r.pointsCost-balance})
                              </span>
                            )}
                          </div>
                          <motion.button whileTap={{scale:0.95}} whileHover={canAfford?{scale:1.02,y:-1}:{}}
                            onClick={() => handleClaim(r)}
                            style={{ width:'100%', padding:'11px', borderRadius:14, border:'none', fontSize:14, fontWeight:800, fontFamily:'var(--font-heading)', cursor:canAfford?'pointer':'not-allowed',
                              background: canAfford ? `linear-gradient(135deg,${selectedMember?.barColor??'#E07B8A'},${selectedMember?.barColor??'#E07B8A'}bb)` : 'rgba(0,0,0,0.07)',
                              color: canAfford ? '#fff' : 'var(--text-3)',
                              boxShadow: canAfford ? `0 4px 14px ${selectedMember?.barColor ?? '#E07B8A'}40` : 'none',
                              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                            }}>
                            {canAfford ? <><Check size={15} strokeWidth={3}/> Canjear</> : '🔒 No alcanza'}
                          </motion.button>
                        </>
                      )}
                    </motion.div>
                  )
                })}

                {rewards.filter(r=>r.isActive).length === 0 && (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', paddingTop:48, color:'var(--text-3)' }}>
                    <div style={{ fontSize:52, marginBottom:12 }}>🎁</div>
                    <p style={{ fontWeight:800, fontSize:18, fontFamily:'var(--font-heading)', color:'var(--text-2)' }}>Sin premios todavía</p>
                    <p style={{ fontSize:13, marginTop:6 }}>Agrega premios para que tus hijos los canjeen</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <div>
              {history.length === 0 ? (
                <div style={{ textAlign:'center', paddingTop:48, color:'var(--text-3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📜</div>
                  <p style={{ fontWeight:800, fontSize:16, fontFamily:'var(--font-heading)', color:'var(--text-2)' }}>Sin historial aún</p>
                  <p style={{ fontSize:13, marginTop:6 }}>Los puntos ganados y canjeados aparecen aquí</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {/* Running balance */}
                  <div style={{ padding:'14px 18px', borderRadius:16, background:selectedMember?.bgColor, border:`1px solid ${selectedMember?.barColor}30`, marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:28 }}>⭐</span>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:selectedMember?.textColor, fontFamily:'var(--font-heading)' }}>Balance actual</p>
                      <p style={{ fontSize:26, fontWeight:900, color:selectedMember?.textColor, fontFamily:'var(--font-heading)', lineHeight:1 }}>{balance.toLocaleString()} puntos</p>
                    </div>
                  </div>

                  {history.map(tx => (
                    <motion.div key={tx.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.80)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.60)' }}>
                      <span style={{ fontSize:22 }}>{tx.emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.reason}</p>
                        <p style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{new Date(tx.createdAt).toLocaleDateString('es-ES',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                      <span style={{ fontSize:16, fontWeight:900, color:tx.amount>0?'#16A34A':'#DC2626', fontFamily:'var(--font-heading)', flexShrink:0 }}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ⭐
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Reward Modal */}
      <AnimatePresence>
        {showAddReward && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.30)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center' }}
            onClick={e=>e.target===e.currentTarget&&setShowAddReward(false)}>
            <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
              transition={{ type:'spring',stiffness:340,damping:30 }}
              style={{ background:'rgba(255,251,247,0.97)',backdropFilter:'blur(32px)',borderRadius:'28px 28px 0 0',width:'100%',maxWidth:520,padding:'8px 24px 32px',boxShadow:'0 -4px 48px rgba(0,0,0,0.12)' }}>
              <div style={{ width:40,height:4,borderRadius:99,background:'rgba(0,0,0,0.12)',margin:'8px auto 20px' }}/>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
                <h2 style={{ fontSize:22,fontWeight:900,fontFamily:'var(--font-heading)' }}>🎁 Nuevo Premio</h2>
                <button onClick={() => setShowAddReward(false)} style={{ width:34,height:34,borderRadius:10,border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={16}/></button>
              </div>

              {/* Emoji picker row */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                {REWARD_EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewForm(f=>({...f,emoji:e}))}
                    style={{ width:40,height:40,borderRadius:10,border:`2px solid ${newForm.emoji===e?'var(--accent, #E07B8A)':'var(--border)'}`,background:newForm.emoji===e?'rgba(224,123,138,0.1)':'var(--bg)',fontSize:20,cursor:'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>

              {/* Title */}
              <input value={newForm.title} onChange={e=>setNewForm(f=>({...f,title:e.target.value}))}
                placeholder="Nombre del premio..." autoFocus
                className="input-apple" style={{ marginBottom:14 }}/>

              {/* Points cost */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:10 }}>
                  Costo en puntos
                </label>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.80)', border:'1.5px solid rgba(0,0,0,0.08)' }}>
                  <span style={{ fontSize:24 }}>⭐</span>
                  <span style={{ fontSize:28,fontWeight:900,color:'#D97706',fontFamily:'var(--font-heading)',minWidth:60 }}>{newForm.pointsCost}</span>
                  <div style={{ flex:1 }}>
                    <input type="range" min={5} max={500} step={5} value={newForm.pointsCost}
                      onChange={e=>setNewForm(f=>({...f,pointsCost:Number(e.target.value)}))}
                      style={{ width:'100%',accentColor:'#D97706',cursor:'pointer' }}/>
                    <div style={{ display:'flex',gap:8,marginTop:6,flexWrap:'wrap' }}>
                      {[25,50,100,200,300].map(v=>(
                        <button key={v} onClick={()=>setNewForm(f=>({...f,pointsCost:v}))}
                          style={{ padding:'4px 12px',borderRadius:99,border:`1.5px solid ${newForm.pointsCost===v?'#D97706':'var(--border)'}`,background:newForm.pointsCost===v?'rgba(245,158,11,0.12)':'transparent',fontSize:12,fontWeight:700,color:newForm.pointsCost===v?'#D97706':'var(--text-3)',cursor:'pointer' }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <motion.button whileTap={{scale:0.97}} onClick={handleAddReward} disabled={!newForm.title.trim()}
                style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:newForm.title.trim()?'linear-gradient(135deg,#E07B8A,#D45C6B)':'var(--border)',color:newForm.title.trim()?'#fff':'var(--text-3)',fontSize:16,fontWeight:800,fontFamily:'var(--font-heading)',cursor:newForm.title.trim()?'pointer':'default',boxShadow:newForm.title.trim()?'0 4px 20px rgba(224,123,138,0.4)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                <Check size={18} strokeWidth={3}/> Agregar Premio
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
