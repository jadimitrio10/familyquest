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

// Kinship palette — pastel warm family colors
const DEFAULT_MEMBERS: Member[] = [
  { id:'sindy',   name:'Sindy',   emoji:'👩', bgColor:'#F9D2D2', textColor:'#7A2222', barColor:'#E07070', role:'adult'  },
  { id:'ivan',    name:'Ivan',    emoji:'👨', bgColor:'#C5E5F1', textColor:'#1A5C7A', barColor:'#5BB4D4', role:'adult'  },
  { id:'nicolas', name:'Nicolas', emoji:'👦', bgColor:'#E2D6F3', textColor:'#5B3A8B', barColor:'#A080D4', role:'child'  },
  { id:'sofi',    name:'Sofi',    emoji:'👧', bgColor:'#D4F1EE', textColor:'#1A6B64', barColor:'#5AC4BC', role:'child'  },
  { id:'mnauel',  name:'Mnauel',  emoji:'👦', bgColor:'#D9EAD3', textColor:'#2E5E2A', barColor:'#70B870', role:'child'  },
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
