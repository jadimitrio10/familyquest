import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useFamilyStore } from '@/stores/familyStore'
import { useTasksStore } from '@/stores/tasksStore'
import { AvatarCircle } from '@/components/shared/AvatarCircle'

export function HistoryDashboard() {
  const { members } = useFamilyStore()
  const { instances } = useTasksStore()
  const children = members.filter((m) => m.role === 'child')

  const chartData = children.map((m) => {
    const myInstances = instances.filter((i) => i.profile_id === m.id)
    const done = myInstances.filter((i) => !!i.completed_at).length
    const total = myInstances.length
    return {
      name: m.name,
      completed: done,
      total,
      pct: total === 0 ? 0 : Math.round((done / total) * 100),
      accentHex: m.accent_hex,
      member: m,
    }
  })

  const sorted = [...chartData].sort((a, b) => b.pct - a.pct)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-black text-3xl text-gray-800 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
        History & Stats 📊
      </h1>

      {/* Leaderboard */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="font-black text-xl text-gray-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          🏆 Today's Leaderboard
        </h2>
        {sorted.map((d, i) => (
          <div key={d.name} className="flex items-center gap-4 mb-3">
            <span className="text-2xl font-black w-8 text-gray-400">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
            <AvatarCircle emoji={d.member.avatar_emoji} colorHex={d.member.color_hex} accentHex={d.member.accent_hex} size={40} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-700">{d.name}</span>
                <span className="font-bold text-sm" style={{ color: d.accentHex }}>{d.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.pct}%`, background: d.accentHex }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{d.completed}/{d.total} tasks · ⭐ {d.member.points_balance} stars</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h2 className="font-black text-xl text-gray-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          📈 Completion Rate Today
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={40}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Completion']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.accentHex} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {children.map((m) => (
          <div key={m.id} className="rounded-3xl p-5 text-center" style={{ background: m.color_hex }}>
            <span className="text-3xl">{m.avatar_emoji}</span>
            <p className="font-black text-lg mt-1 text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>{m.name}</p>
            <p className="text-3xl font-black" style={{ color: m.accent_hex }}>🔥 {m.current_streak}</p>
            <p className="text-xs text-gray-500 font-semibold">day streak</p>
            <p className="text-xs text-gray-400 mt-1">Best: {m.longest_streak} days</p>
          </div>
        ))}
      </div>
    </div>
  )
}
