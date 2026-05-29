import { formatDate, getGreeting } from '@/lib/utils'
import { useWeather } from '@/hooks/useWeather'
import { useFamilyStore } from '@/stores/familyStore'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const weather = useWeather()
  const { family, members, currentUser } = useFamilyStore()
  const navigate = useNavigate()
  const parents = members.filter((m) => m.role === 'parent')

  return (
    <div className="h-16 bg-white/80 backdrop-blur border-b border-white/50 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1">
        <h1 className="font-black text-xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {family?.name ?? 'FamilyQuest'}
        </h1>
        <p className="text-sm text-gray-500" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          {formatDate(new Date())} · {getGreeting()}
          {weather && <span className="ml-2">{weather.emoji} {weather.temp}°</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {parents.map((p) => (
          <button key={p.id} onClick={() => navigate('/settings')} className="hover:scale-105 transition-transform">
            <AvatarCircle emoji={p.avatar_emoji} colorHex={p.color_hex} accentHex={p.accent_hex} size={40} />
          </button>
        ))}
        {!currentUser && (
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ⚙️
          </button>
        )}
      </div>
    </div>
  )
}
