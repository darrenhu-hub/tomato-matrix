import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'

interface SortableTaskCardProps {
  task: {
    id: string
    title: string
    quadrant: 1 | 2 | 3 | 4
    estimatedPomodoros: number
    completedPomodoros: number
    completed: boolean
  }
}

const SortableTaskCard = ({ task }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard task={task} dragListeners={listeners} />
    </div>
  )
}

export default SortableTaskCard
