import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

const CATEGORIES = [
  {
    label: '😊 Faces', emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
      '🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬',
      '🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','🥴','😵','💫','🤯','🤠','🥳','🥸',
    ]
  },
  {
    label: '🏃 Activities', emojis: [
      '🏃','🚶','🧗','🏊','🚴','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🏒','🥊','🥋','🎯',
      '🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🤺','🤼','🤸','🤾','⛹','🤳','💪','🧘','🧗','🤿','🏇',
    ]
  },
  {
    label: '🍕 Food', emojis: [
      '🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍑','🍒','🍌','🍍','🥭','🥥','🥝','🍅','🥑','🍆','🥦','🥕','🌽',
      '🍞','🥐','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🌮','🌯','🥙','🧆','🥚','🍔','🍟','🍕','🌭',
      '🍣','🍱','🍜','🍝','🍲','🥘','🫕','🍛','🍚','🍙','🥗','🫙','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍩',
    ]
  },
  {
    label: '🐶 Animals', emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅',
      '🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦂','🐢','🐍','🦎','🦖','🐊','🦈',
    ]
  },
  {
    label: '✈️ Travel', emojis: [
      '✈️','🚀','🛸','🚁','🛩','⛵','🚢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌',
      '🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','⛩','🗼','🗽','🗺','🌋',
    ]
  },
  {
    label: '📚 Objects', emojis: [
      '📚','📖','📝','✏️','🖊','📓','📒','📔','📕','📗','📘','📙','📐','📏','🗂','📁','📂','🗃','🗄','🗑',
      '💻','🖥','🖨','⌨️','🖱','💾','💿','📱','☎️','📞','📟','📠','📺','📷','📸','📹','🎥','📽','🎬','🔦',
      '🎸','🎹','🥁','🎷','🎺','🎻','🪕','🎮','🕹','🧩','🎲','♟','🎯','🎳','🎰','🏆','🥇','🥈','🥉','🏅',
    ]
  },
  {
    label: '❤️ Hearts', emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟',
      '☮️','✝️','☯️','🕉','✡️','☸️','🔯','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒',
    ]
  },
  {
    label: '🌟 Stars & Nature', emojis: [
      '🌟','⭐','🌠','🌌','🌙','🌛','🌜','🌝','🌞','☀️','⛅','🌤','🌥','☁️','🌦','🌧','⛈','🌩','🌨','❄️',
      '🌸','🌺','🌻','🌹','🌷','💐','🌿','🍃','🍂','🍁','🌱','🌲','🌳','🌴','🌵','🎋','🎍','🍄','🌾','🌊',
    ]
  },
]

const ALL_EMOJIS = CATEGORIES.flatMap(c => c.emojis)

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  onClose?: () => void
}

export function EmojiPicker({ value, onChange, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(0)

  const filtered = useMemo(() => {
    if (!search.trim()) return null
    // Basic text search by index
    return ALL_EMOJIS.filter((e, i) => i.toString().includes(search) || e.includes(search))
      .slice(0, 60)
  }, [search])

  const displayEmojis = filtered ?? CATEGORIES[activeCategory].emojis

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        width: 320,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={14} color="var(--text-3)" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search emoji..."
          autoFocus
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Inter', color: 'var(--text-1)', background: 'transparent' }}
        />
        {value && (
          <span style={{ fontSize: 22, lineHeight: 1 }}>{value}</span>
        )}
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', padding: '4px 6px', gap: 2 }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                border: 'none',
                background: activeCategory === i ? 'var(--blue-bg)' : 'transparent',
                cursor: 'pointer',
                fontSize: 16,
                flexShrink: 0,
                opacity: activeCategory === i ? 1 : 0.6,
                transition: 'all 150ms',
              }}
              title={cat.label}
            >
              {cat.label.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, padding: 8, maxHeight: 220, overflowY: 'auto' }}>
        {displayEmojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => { onChange(emoji); onClose?.() }}
            style={{
              width: '100%',
              aspectRatio: '1',
              border: value === emoji ? '2px solid var(--blue)' : '2px solid transparent',
              borderRadius: 8,
              background: value === emoji ? 'var(--blue-bg)' : 'transparent',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 120ms',
              lineHeight: 1,
            }}
            onMouseEnter={e => { if (value !== emoji) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)' }}
            onMouseLeave={e => { if (value !== emoji) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'Inter' }}>
          {search ? `${displayEmojis.length} results` : CATEGORIES[activeCategory].label}
        </span>
        {onClose && (
          <button onClick={onClose} style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, fontFamily: 'Inter', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            Done
          </button>
        )}
      </div>
    </div>
  )
}
