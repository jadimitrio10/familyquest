import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Heart, ZoomIn } from 'lucide-react'

interface Photo { id:string; url:string; caption:string; liked:boolean; date:string }

const SAMPLE: Photo[] = [
  { id:'p1',url:'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=400',caption:'Family dinner 🍝',liked:true,date:'Sep 11'},
  { id:'p2',url:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',caption:'Weekend hike 🥾',liked:false,date:'Sep 10'},
  { id:'p3',url:'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=400',caption:'Julie\'s recital 🎹',liked:true,date:'Sep 8'},
  { id:'p4',url:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',caption:'Morning coffee ☕',liked:false,date:'Sep 7'},
  { id:'p5',url:'https://images.unsplash.com/photo-1559181567-c3190bfa4cfe?w=400',caption:'Park day 🌳',liked:true,date:'Sep 6'},
  { id:'p6',url:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',caption:'Pizza Friday 🍕',liked:false,date:'Sep 5'},
]

export function PhotosView() {
  const [photos, setPhotos] = useState<Photo[]>(SAMPLE)
  const [selected, setSelected] = useState<Photo|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleLike = (id:string) => setPhotos(ps=>ps.map(p=>p.id===id?{...p,liked:!p.liked}:p))
  const remove = (id:string) => { setPhotos(ps=>ps.filter(p=>p.id!==id)); setSelected(null) }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files??[])
    files.forEach(file=>{
      const url = URL.createObjectURL(file)
      setPhotos(ps=>[{ id:`p-${Date.now()}`,url,caption:file.name.replace(/\.[^.]+$/,''),liked:false,date:'Today' },...ps])
    })
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)' }}>
      <div style={{ padding:'20px 24px 14px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'Inter',color:'var(--text-1)' }}>Family Photos</h1>
          <p style={{ fontSize:13,color:'var(--text-3)',fontFamily:'Inter',marginTop:2 }}>{photos.length} memories</p>
        </div>
        <motion.button whileTap={{scale:0.95}} onClick={()=>fileRef.current?.click()}
          style={{ display:'flex',alignItems:'center',gap:6,background:'var(--text-1)',color:'#fff',borderRadius:20,padding:'8px 16px',fontSize:13,fontWeight:600,fontFamily:'Inter',border:'none',cursor:'pointer' }}>
          <Upload size={14}/> Upload
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleFile}/>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:16 }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12 }}>
          {photos.map(p=>(
            <motion.div key={p.id} layout whileHover={{scale:1.02}} style={{ position:'relative',borderRadius:14,overflow:'hidden',background:'var(--surface)',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',cursor:'pointer' }}>
              <img src={p.url} alt={p.caption} style={{ width:'100%',height:160,objectFit:'cover',display:'block' }} onClick={()=>setSelected(p)}/>
              <div style={{ padding:'10px 12px' }}>
                <p style={{ fontSize:13,fontWeight:500,fontFamily:'Inter',color:'var(--text-1)',marginBottom:4 }}>{p.caption}</p>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <span style={{ fontSize:11,color:'var(--text-3)',fontFamily:'Inter' }}>{p.date}</span>
                  <motion.button whileTap={{scale:0.8}} onClick={()=>toggleLike(p.id)}
                    style={{ border:'none',background:'transparent',cursor:'pointer',padding:4,display:'flex',alignItems:'center' }}>
                    <Heart size={16} fill={p.liked?'#EF4444':'none'} color={p.liked?'#EF4444':'var(--text-3)'}/>
                  </motion.button>
                </div>
              </div>
              <button onClick={()=>setSelected(p)} style={{ position:'absolute',top:8,right:8,width:28,height:28,borderRadius:'50%',background:'rgba(0,0,0,0.4)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff' }}>
                <ZoomIn size={13}/>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}
            onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} style={{ position:'relative',maxWidth:800,width:'100%' }}>
              <img src={selected.url} alt={selected.caption} style={{ width:'100%',borderRadius:16,maxHeight:'70vh',objectFit:'contain' }}/>
              <div style={{ position:'absolute',top:12,right:12,display:'flex',gap:8 }}>
                <button onClick={()=>remove(selected.id)} style={{ width:36,height:36,borderRadius:'50%',background:'rgba(0,0,0,0.6)',border:'none',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={16}/></button>
              </div>
              <div style={{ marginTop:12,textAlign:'center' }}>
                <p style={{ fontSize:16,fontWeight:600,color:'#fff',fontFamily:'Inter' }}>{selected.caption}</p>
                <p style={{ fontSize:13,color:'rgba(255,255,255,0.6)',fontFamily:'Inter',marginTop:4 }}>{selected.date}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
