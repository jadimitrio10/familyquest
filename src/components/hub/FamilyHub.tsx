import { useTasksStore } from '@/stores/tasksStore'
import { useFamilyStore } from '@/stores/familyStore'
import { MemberColumn } from './MemberColumn'
import { getThemeByIndex } from '@/lib/memberThemes'
import toast from 'react-hot-toast'

export function FamilyHub() {
  const { members } = useFamilyStore()
  const { instances, markComplete } = useTasksStore()

  const children = members.filter(m => m.role === 'child')

  function handleComplete(instanceId: string) {
    const inst = instances.find(i => i.id === instanceId)
    if (!inst) return
    const pts = inst.task?.points_value ?? 10
    markComplete(instanceId, pts)
    toast.success(`+${pts} ⭐`, {
      duration: 1800,
      style: {
        borderRadius: '14px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 16,
        background: '#1E1B4B',
        color: '#fff',
        padding: '8px 16px',
      },
    })
  }

  return (
    <div
      className="flex gap-3.5 h-full overflow-x-auto"
      style={{
        padding: 14,
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        background: '#F7F8FC',
      }}
    >
      {children.map((member, idx) => {
        const theme = getThemeByIndex(idx)
        const memberInst = instances.filter(i => i.profile_id === member.id)
        return (
          <MemberColumn
            key={member.id}
            member={member}
            instances={memberInst}
            theme={theme}
            onComplete={handleComplete}
            colIndex={idx}
          />
        )
      })}

      {children.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-6xl animate-float">👨‍👩‍👧‍👦</span>
          <div className="text-center">
            <p className="font-heading font-black text-2xl text-gray-700">
              ¡Agrega a tu familia!
            </p>
            <p className="text-gray-400 font-medium mt-1 text-sm">
              Ve a Ajustes para añadir miembros.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
