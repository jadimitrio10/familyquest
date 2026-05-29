import { useTasksStore } from '@/stores/tasksStore'
import { useFamilyStore } from '@/stores/familyStore'
import { MemberColumn } from './MemberColumn'
import { useFamilyStore as useFamilyStoreDirect } from '@/stores/familyStore'
import toast from 'react-hot-toast'

export function FamilyHub() {
  const { members } = useFamilyStore()
  const { instances, markComplete, setInstances } = useTasksStore()
  const { members: familyMembers } = useFamilyStoreDirect()

  const children = members.filter((m) => m.role === 'child')

  function handleComplete(instanceId: string) {
    const inst = instances.find((i) => i.id === instanceId)
    if (!inst) return
    const pts = inst.task?.points_value ?? 10
    markComplete(instanceId, pts)
    toast.success(`+${pts} stars! ⭐`, { duration: 2000 })
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto px-4 py-4 pb-6">
      {children.map((member) => {
        const memberInstances = instances.filter((i) => i.profile_id === member.id)
        return (
          <MemberColumn
            key={member.id}
            member={member}
            instances={memberInstances}
            onComplete={handleComplete}
          />
        )
      })}

      {children.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
          <span className="text-6xl">👨‍👩‍👧‍👦</span>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
              No family members yet!
            </p>
            <p className="text-sm mt-1">Add members in Settings to get started.</p>
          </div>
        </div>
      )}
    </div>
  )
}
