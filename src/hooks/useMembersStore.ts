import { useState, useEffect } from 'react'

export interface Member {
  id: string
  name: string
  emoji: string          // fallback emoji
  photoDataUrl?: string  // base64 uploaded photo
  bgColor: string
  textColor: string
  barColor: string
  role: 'adult' | 'child'
}

const DEFAULT_MEMBERS: Member[] = [
  { id:'sindy',   name:'Sindy',   emoji:'👩', bgColor:'#FFE4E6', textColor:'#9F1239', barColor:'#FB7185', role:'adult'  },
  { id:'ivan',    name:'Ivan',    emoji:'👨', bgColor:'#E0F2FE', textColor:'#075985', barColor:'#38BDF8', role:'adult'  },
  { id:'nicolas', name:'Nicolas', emoji:'👦', bgColor:'#F3E8FF', textColor:'#6B21A8', barColor:'#C084FC', role:'child'  },
  { id:'sofi',    name:'Sofi',    emoji:'👧', bgColor:'#DCFCE7', textColor:'#166534', barColor:'#4ADE80', role:'child'  },
  { id:'mnauel',  name:'Mnauel',  emoji:'👦', bgColor:'#FEF3C7', textColor:'#92400E', barColor:'#FCD34D', role:'child'  },
]

function load(): Member[] {
  try {
    const v = localStorage.getItem('fq_members_v2')
    return v ? JSON.parse(v) : DEFAULT_MEMBERS
  } catch { return DEFAULT_MEMBERS }
}

export function useMembersStore() {
  const [members, setMembers] = useState<Member[]>(load)

  useEffect(() => {
    try { localStorage.setItem('fq_members_v2', JSON.stringify(members)) } catch {}
  }, [members])

  const addMember = (m: Omit<Member, 'id'>) =>
    setMembers(ms => [...ms, { ...m, id: `m-${Date.now()}` }])

  const updateMember = (id: string, patch: Partial<Member>) =>
    setMembers(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m))

  const removeMember = (id: string) =>
    setMembers(ms => ms.filter(m => m.id !== id))

  const uploadPhoto = (id: string, dataUrl: string) =>
    setMembers(ms => ms.map(m => m.id === id ? { ...m, photoDataUrl: dataUrl } : m))

  const removePhoto = (id: string) =>
    setMembers(ms => ms.map(m => m.id === id ? { ...m, photoDataUrl: undefined } : m))

  return { members, setMembers, addMember, updateMember, removeMember, uploadPhoto, removePhoto }
}
