import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useStore } from '../store'
import SortableTaskCard from './SortableTaskCard'

const quadrants = [
  { id: 1 as const, title: '重要且紧急', subtitle: '立即做', color: 'red', icon: '🔴' },
  { id: 2 as const, title: '重要不紧急', subtitle: '计划做', color: 'amber', icon: '🟡' },
  { id: 3 as const, title: '紧急不重要', subtitle: '委托做', color: 'orange', icon: '🟠' },
  { id: 4 as const, title: '不紧急不重要', subtitle: '少做/不做', color: 'slate', icon: '⚪' }
]

const colorClasses = {
  red: {
    bg: 'bg-red-50/50',
    border: 'border-red-200/60',
    header: 'bg-red-100/80',
    text: 'text-red-700',
    button: 'bg-red-100 hover:bg-red-200 text-red-600'
  },
  amber: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-200/60',
    header: 'bg-amber-100/80',
    text: 'text-amber-700',
    button: 'bg-amber-100 hover:bg-amber-200 text-amber-600'
  },
  orange: {
    bg: 'bg-orange-50/50',
    border: 'border-orange-200/60',
    header: 'bg-orange-100/80',
    text: 'text-orange-700',
    button: 'bg-orange-100 hover:bg-orange-200 text-orange-600'
  },
  slate: {
    bg: 'bg-slate-50/50',
    border: 'border-slate-200/60',
    header: 'bg-slate-100/80',
    text: 'text-slate-600',
    button: 'bg-slate-100 hover:bg-slate-200 text-slate-500'
  }
}

const QuadrantGrid = () => {
  const { dayData, addTask, reorderTasks } = useStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const getTasksForQuadrant = (quadrantId: 1 | 2 | 3 | 4) => {
    return dayData.tasks
      .filter(t => t.quadrant === quadrantId)
      .sort((a, b) => a.order - b.order)
  }

  const handleDragEnd = (event: DragEndEvent, quadrantId: 1 | 2 | 3 | 4) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const tasks = getTasksForQuadrant(quadrantId)
      const oldIndex = tasks.findIndex(t => t.id === active.id)
      const newIndex = tasks.findIndex(t => t.id === over.id)

      const newOrder = arrayMove(tasks, oldIndex, newIndex)
      reorderTasks(quadrantId, newOrder.map(t => t.id))
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {quadrants.map(q => {
        const tasks = getTasksForQuadrant(q.id)
        const colors = colorClasses[q.color as keyof typeof colorClasses]

        return (
          <div
            key={q.id}
            className={`${colors.bg} ${colors.border} border rounded-2xl overflow-hidden`}
          >
            <div className={`${colors.header} px-4 py-3 flex items-center justify-between`}>
              <div>
                <div className="flex items-center gap-2">
                  <span>{q.icon}</span>
                  <h3 className={`font-semibold ${colors.text}`}>{q.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{q.subtitle}</p>
              </div>
              <button
                onClick={() => addTask(q.id)}
                className={`${colors.button} px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}
              >
                + 添加
              </button>
            </div>

            <div className="p-3 min-h-[120px]">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  暂无任务
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, q.id)}
                >
                  <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default QuadrantGrid
