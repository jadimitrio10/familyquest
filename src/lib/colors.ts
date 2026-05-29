export const MEMBER_COLORS = [
  { color_hex: '#FFB5B5', accent_hex: '#E05C5C', name: 'Coral' },
  { color_hex: '#FDE68A', accent_hex: '#D97706', name: 'Amber' },
  { color_hex: '#BAE6FD', accent_hex: '#0284C7', name: 'Sky' },
  { color_hex: '#DDD6FE', accent_hex: '#7C3AED', name: 'Purple' },
  { color_hex: '#99F6E4', accent_hex: '#0D9488', name: 'Teal' },
  { color_hex: '#FBCFE8', accent_hex: '#DB2777', name: 'Pink' },
]

export function getColorForIndex(index: number) {
  return MEMBER_COLORS[index % MEMBER_COLORS.length]
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
