import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'

interface NextWeekColumnProps {
  dateRange: string
  onGoNext: () => void
}

export function NextWeekColumn({ dateRange, onGoNext }: NextWeekColumnProps) {
  return (
    <motion.button
      onClick={onGoNext}
      whileHover={{ background: '#F0F0F4' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center w-full h-full"
      style={{ background: 'var(--bg)', border: '1.5px dashed var(--border)', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'background 150ms' }}
    >
      <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
        Next Week
      </p>
      <p style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-3)', fontFamily: 'Inter, sans-serif' }}>
        {dateRange}
      </p>
      <Sparkles size={20} color="var(--border)" strokeWidth={1.5} style={{ marginTop: 10 }} />
      <div style={{ marginTop: 8, display:'flex', alignItems:'center', gap:3, color:'var(--text-3)', fontSize:11, fontFamily:'Inter' }}>
        Go <ChevronRight size={12} />
      </div>
    </motion.button>
  )
}
