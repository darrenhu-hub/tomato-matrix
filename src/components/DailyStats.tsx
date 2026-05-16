import { useState, useEffect } from 'react'
import { useStore } from '../store'

const DailyStats = () => {
  const { dayData, pomodoroState } = useStore()
  const [, setTick] = useState(0)

  // 每秒刷新一次，实现实时计时
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const totalTasks = dayData.tasks.length
  const completedTasks = dayData.tasks.filter(t => t.completed).length
  const totalPomodoros = dayData.tasks.reduce((sum, t) => sum + t.completedPomodoros, 0)

  // 计算实际专注秒数（已存储的 + 当前正在计时的）
  let totalSeconds = dayData.focusSeconds || 0
  if (pomodoroState.isRunning && !pomodoroState.isBreak && pomodoroState.focusStartTime) {
    totalSeconds += Math.floor((Date.now() - pomodoroState.focusStartTime) / 1000)
  }

  const quadrantStats = [
    { id: 1, icon: '🔴', label: '重要紧急', count: 0 },
    { id: 2, icon: '🟡', label: '重要不紧急', count: 0 },
    { id: 3, icon: '🟠', label: '紧急不重要', count: 0 },
    { id: 4, icon: '⚪', label: '不重要', count: 0 }
  ]

  dayData.tasks.forEach(task => {
    const q = quadrantStats.find(q => q.id === task.quadrant)
    if (q) q.count++
  })

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours === 0 && mins === 0) return `${secs}秒`
    if (hours === 0) return `${mins}分${secs > 0 ? secs + '秒' : ''}`
    return `${hours}小时${mins}分`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        今日统计
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{totalPomodoros}</div>
            <div className="text-xs text-slate-500 mt-1">完成番茄</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{completedTasks}/{totalTasks}</div>
            <div className="text-xs text-slate-500 mt-1">完成任务</div>
          </div>
        </div>

        <div className={`rounded-xl p-3 text-center transition-colors ${
          pomodoroState.isRunning && !pomodoroState.isBreak
            ? 'bg-red-50 border border-red-100'
            : 'bg-slate-50'
        }`}>
          <div className="text-2xl font-bold text-slate-800">
            {formatTime(totalSeconds)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            总专注时长
            {pomodoroState.isRunning && !pomodoroState.isBreak && (
              <span className="ml-2 text-red-500">● 计时中</span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="text-xs text-slate-500 mb-3">象限分布</div>
          <div className="flex justify-between">
            {quadrantStats.map(q => (
              <div key={q.id} className="text-center">
                <div className="text-lg">{q.icon}</div>
                <div className="text-sm font-semibold text-slate-700 mt-1">{q.count}</div>
              </div>
            ))}
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">完成进度</span>
              <span className="font-semibold text-slate-700">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyStats
