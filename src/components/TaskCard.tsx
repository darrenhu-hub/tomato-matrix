import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'

interface TaskCardProps {
  task: {
    id: string
    title: string
    quadrant: 1 | 2 | 3 | 4
    estimatedPomodoros: number
    completedPomodoros: number
    completed: boolean
  }
  dragListeners?: any
}

const TaskCard = ({ task, dragListeners }: TaskCardProps) => {
  const { updateTask, deleteTask, toggleTaskComplete, startPomodoro, pomodoroState } = useStore()
  const [isEditing, setIsEditing] = useState(!task.title)
  const [editTitle, setEditTitle] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  // 判断当前任务是否处于专注/暂停状态
  const isCurrentTask = pomodoroState.currentTaskId === task.id
  const isPaused = isCurrentTask && !pomodoroState.isRunning && !pomodoroState.isBreak && pomodoroState.timeLeft < 25 * 60
  const isFocusing = isCurrentTask && pomodoroState.isRunning && !pomodoroState.isBreak

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() })
    } else {
      deleteTask(task.id)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditTitle(task.title)
      setIsEditing(false)
      if (!task.title) {
        deleteTask(task.id)
      }
    }
  }

  const handlePomodoroClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.title) {
      startPomodoro(task.id)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl p-3 shadow-sm border transition-all duration-200 ${
        task.completed
          ? 'opacity-60 border-slate-100'
          : isPaused
          ? 'border-amber-300 bg-amber-50/50 shadow-amber-100'
          : isFocusing
          ? 'border-red-300 bg-red-50/50 shadow-red-100'
          : 'border-slate-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* 拖拽手柄 */}
        <div
          {...dragListeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 flex-shrink-0"
          title="拖拽排序"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>

        <button
          onClick={() => toggleTaskComplete(task.id)}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder="输入任务名称..."
              className="w-full px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className={`text-sm cursor-pointer ${
                task.completed ? 'line-through text-slate-400' : 'text-slate-700'
              }`}
            >
              {task.title || '点击编辑...'}
            </div>
          )}
        </div>

        <div className="flex gap-1 items-center">
          {isPaused && (
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">II</span>
          )}
          {isFocusing && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {!task.completed && task.title && !isCurrentTask && (
            <button
              onClick={handlePomodoroClick}
              className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors text-slate-400 hover:text-emerald-500"
              title="开始番茄钟"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
            title="删除任务"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
