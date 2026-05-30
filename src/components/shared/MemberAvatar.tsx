import type { Member } from '@/hooks/useMembersStore'

interface MemberAvatarProps {
  member: Member
  size?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Shows uploaded photo if available, otherwise falls back to emoji.
 * Used everywhere a member avatar is displayed.
 */
export function MemberAvatar({ member, size = 36, className = '', style }: MemberAvatarProps) {
  if (member.photoDataUrl) {
    return (
      <img
        src={member.photoDataUrl}
        alt={member.name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2.5px solid ${member.barColor}`,
          flexShrink: 0,
          ...style,
        }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: member.bgColor,
        border: `2.5px solid ${member.barColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
        ...style,
      }}
    >
      {member.emoji}
    </div>
  )
}
