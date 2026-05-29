import { useState } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import { useNavigate } from 'react-router-dom'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { MEMBER_COLORS } from '@/lib/colors'
import type { Profile } from '@/types/database.types'
import toast from 'react-hot-toast'
import { Trash2, Plus } from 'lucide-react'

export function SettingsPage() {
  const { family, members, setMembers, isDemo } = useFamilyStore()
  const navigate = useNavigate()
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')
  const [newRole, setNewRole] = useState<'child' | 'parent'>('child')

  function handleAddMember() {
    if (!newName.trim()) return
    const colorIdx = members.length % MEMBER_COLORS.length
    const { color_hex, accent_hex } = MEMBER_COLORS[colorIdx]
    const newMember: Profile = {
      id: `member-${Date.now()}`,
      family_id: family?.id ?? '',
      user_id: null,
      name: newName.trim(),
      avatar_emoji: newEmoji,
      color_hex,
      accent_hex,
      role: newRole,
      points_balance: 0,
      total_points_earned: 0,
      current_streak: 0,
      longest_streak: 0,
      created_at: new Date().toISOString(),
    }
    setMembers([...members, newMember])
    setNewName('')
    setNewEmoji('⭐')
    toast.success(`${newName} added! 🎉`)
  }

  function handleRemoveMember(id: string) {
    setMembers(members.filter((m) => m.id !== id))
    toast('Member removed.', { icon: '🗑️' })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-black text-3xl text-gray-800 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
        Settings ⚙️
      </h1>

      {isDemo && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 font-semibold text-sm">
          🎭 Demo Mode — changes won't be saved to a database
        </div>
      )}

      {/* Family info */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="font-black text-xl text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Family Info
        </h2>
        <p className="text-gray-600 font-semibold">{family?.name}</p>
        <p className="text-sm text-gray-400 mt-1">Invite code: <code className="bg-gray-100 px-2 py-0.5 rounded">{family?.invite_code}</code></p>
      </div>

      {/* Members */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="font-black text-xl text-gray-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Family Members
        </h2>
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 mb-3 p-3 rounded-2xl" style={{ background: `${m.color_hex}44` }}>
            <AvatarCircle emoji={m.avatar_emoji} colorHex={m.color_hex} accentHex={m.accent_hex} size={44} />
            <div className="flex-1">
              <p className="font-bold text-gray-800">{m.name}</p>
              <p className="text-xs text-gray-500 capitalize">{m.role} · ⭐ {m.points_balance} stars</p>
            </div>
            <button
              onClick={() => handleRemoveMember(m.id)}
              className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Add member form */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-600 mb-3">Add Member</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:border-purple-400"
              style={{ minHeight: 44 }}
            />
            <input
              type="text"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="w-14 rounded-xl border border-gray-200 px-2 py-2 text-center text-xl focus:outline-none"
              maxLength={2}
              style={{ minHeight: 44 }}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'child' | 'parent')}
              className="rounded-xl border border-gray-200 px-2 py-2 text-sm focus:outline-none"
              style={{ minHeight: 44 }}
            >
              <option value="child">Child</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <button
            onClick={handleAddMember}
            className="flex items-center gap-2 w-full justify-center py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600"
            style={{ minHeight: 48 }}
          >
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </div>

      <button
        onClick={() => { navigate('/'); toast('Returning to hub.') }}
        className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
        style={{ minHeight: 52 }}
      >
        Back to Hub
      </button>
    </div>
  )
}
