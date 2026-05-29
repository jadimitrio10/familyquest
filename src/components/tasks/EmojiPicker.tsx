import { useState } from 'react'

const EMOJIS = [
  '⭐','🦷','📚','🛏️','✏️','🗑️','🐶','🎸','🧹','🍽️','🔢','📱','🎬','🍕','🍦',
  '🎉','🏃','🚿','🧴','👕','🥗','🍎','🥦','💧','🌿','📖','🎨','🎭','🏀','⚽',
  '🎮','🧩','🎲','🎯','🎵','🎤','🏊','🚴','🌱','🌸','🌈','🌟','💫','✨','🦋',
  '🐱','🐭','🦊','🐻','🐼','🐸','🦄','🐝','🌺','🍓','🍒','🍭','🧁','🎂','🍪',
  '🏠','🌙','☀️','⚡','🔥','💎','🏆','🥇','🎖️','📝','📓','🎒','🧸','🪆','🎁',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = EMOJIS.filter(() => true)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-3xl w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          {value}
        </div>
        <input
          type="text"
          placeholder="Search emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>
      <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
        {filtered.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onChange(emoji)}
            className={`text-xl w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors ${
              value === emoji ? 'bg-purple-100 ring-2 ring-purple-400' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
