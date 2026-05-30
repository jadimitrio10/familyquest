import { formatDate, getGreeting } from '@/lib/utils'
import { useWeather } from '@/hooks/useWeather'
import { useFamilyStore } from '@/stores/familyStore'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const weather = useWeather()
  const { family, members } = useFamilyStore()
  const navigate = useNavigate()
  const parents = members.filter(m => m.role === 'parent')

  return (
    <div
      className="flex items-center px-4 gap-4 flex-shrink-0"
      style={{
        height: 56,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        zIndex: 10,
      }}
    >
      {/* SparklesText — magicui */}
      <SparklesText
        className="!text-lg !font-black leading-none"
        colors={{ first: '#7C3AED', second: '#D4564A' }}
        sparklesCount={5}
      >
        {family?.name ?? 'FamilyQuest'}
      </SparklesText>

      <div className="flex-1" />

      {/* Date + greeting */}
      <div className="hidden sm:flex flex-col items-end leading-none">
        <span
          className="font-medium text-xs"
          style={{ color: '#9CA3AF', fontFamily: 'Quicksand, sans-serif' }}
        >
          {formatDate(new Date())}
        </span>
        <span
          className="font-semibold text-xs mt-0.5"
          style={{ color: '#6B7280', fontFamily: 'Quicksand, sans-serif' }}
        >
          {getGreeting()}
          {weather && ` · ${weather.emoji} ${weather.temp}°`}
        </span>
      </div>

      {/* Parent avatars */}
      {parents.map(p => (
        <button
          key={p.id}
          onClick={() => navigate('/settings')}
          className="hover:scale-105 transition-transform flex-shrink-0"
          style={{ minWidth: 36, minHeight: 36 }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36,
              height: 36,
              background: p.color_hex,
              border: `2px solid ${p.accent_hex}`,
              fontSize: 18,
            }}
          >
            {p.avatar_emoji}
          </div>
        </button>
      ))}
    </div>
  )
}
