import { useStore } from '../store'
import PomodoroSettings from './PomodoroSettings'

const PomodoroTimer = () => {
  const { pomodoroState, settings, dayData, startPomodoro, pausePomodoro, resumePomodoro, stopPomodoro, finishTask, startBreak, endBreak } = useStore()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalTime = pomodoroState.isBreak
    ? settings.shortBreakMinutes * 60
    : settings.workMinutes * 60
  const progress = ((totalTime - pomodoroState.timeLeft) / totalTime) * 100

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const currentTask = pomodoroState.currentTaskId
    ? dayData.tasks.find(t => t.id === pomodoroState.currentTaskId)
    : null

  // 今日完成的番茄数
  const todayCompletedPomodoros = dayData.tasks.reduce((sum, t) => sum + t.completedPomodoros, 0)

  const handleFinishTask = () => {
    finishTask()
    playSound()
  }

  const handleStartBreak = () => {
    startBreak()
  }

  const handleAbandon = () => {
    stopPomodoro()
  }

  const playSound = () => {
    try {
      new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVggoKIeG9hZG16jrCsfFMsLF1nha6whGQ2Ml5rh7K2jGg4Ml1qhbC4kG07NGFuh7S7lG88NGJwiLe9mHM+NWVzjLq/m3dAN2d2kL3BnXpCOGl5k8DConnEPGx8lsTFpX3GQW9+mcjKqYDKRXGAm8vNrIPOSXODn8/RsIfQR3WFotHVtonUSHaIptPYwI7ZSniKqtjdx5LeTHqNr9rgypfgT3yPs97izZrhUn+SteHn1J3kVYKVuOXq2qLnWIWYvOju4KXqW4ecvuvw5ajsXYqewu7y6qrtXoyhw/L176zxYI2jxvb58a/0Y5CmyPj79LL3ZpKpzPr897X6aZWs0Pz9+bj8bZiv1f7/+7r+b5qy2AAA').play()
    } catch (e) {}
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">🍅</span>
          番茄钟
        </h2>
        <div className="flex items-center gap-1">
          <PomodoroSettings />
          {pomodoroState.isRunning && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              pomodoroState.isBreak
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-red-100 text-red-600'
            }`}>
              {pomodoroState.isBreak ? '休息中' : '专注中'}
            </span>
          )}
          <span className="text-xs text-slate-400">
            今日 🍅 {todayCompletedPomodoros}
          </span>
        </div>
      </div>

      {/* 计时器圆环 */}
      <div className="flex justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke={pomodoroState.isBreak ? '#10b981' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-800 tracking-tight">
              {formatTime(pomodoroState.timeLeft)}
            </span>
            {!pomodoroState.isRunning && !pomodoroState.isBreak && pomodoroState.timeLeft === settings.workMinutes * 60 && (
              <span className="text-xs text-slate-400 mt-1">{settings.workMinutes}分钟</span>
            )}
          </div>
        </div>
      </div>

      {/* 当前任务 */}
      {currentTask ? (
        <div className="text-center mb-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl py-3 px-4 border border-red-100">
          <div className="text-slate-500 text-xs mb-1">当前专注</div>
          <div className="font-medium text-slate-800 text-sm">{currentTask.title}</div>
        </div>
      ) : (
        <div className="text-center mb-4 text-sm text-slate-400 bg-slate-50 rounded-xl py-3 px-4">
          点击任务的 ▶ 按钮开始专注
        </div>
      )}

      {/* 按钮区域 */}
      <div className="space-y-2">
        {!pomodoroState.isRunning && !pomodoroState.isBreak && pomodoroState.timeLeft === settings.workMinutes * 60 ? (
          // 初始状态：未开始
          <button
            onClick={() => startPomodoro()}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors text-sm"
          >
            开始专注
          </button>
        ) : !pomodoroState.isRunning && !pomodoroState.isBreak ? (
          // 暂停状态
          <div className="flex gap-2">
            <button
              onClick={resumePomodoro}
              className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors text-sm"
            >
              继续专注
            </button>
            <button
              onClick={handleAbandon}
              className="px-4 py-3 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm"
            >
              重置
            </button>
          </div>
        ) : pomodoroState.isBreak ? (
          // 休息中
          <div className="text-center">
            <div className="text-emerald-600 font-medium text-sm mb-3">☕ 休息一下</div>
            <button
              onClick={endBreak}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
            >
              结束休息
            </button>
          </div>
        ) : (
          // 专注中：暂停 / 完成任务 / 休息 / 放弃
          <>
            <div className="flex gap-2">
              <button
                onClick={pausePomodoro}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
              >
                暂停
              </button>
              <button
                onClick={handleFinishTask}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors text-sm"
              >
                ✓ 完成任务
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStartBreak}
                className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-medium hover:bg-blue-100 transition-colors text-sm"
              >
                ☕ 休息{settings.shortBreakMinutes}分钟
              </button>
              <button
                onClick={handleAbandon}
                className="px-4 py-2.5 rounded-xl font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
              >
                放弃
              </button>
            </div>
          </>
        )}
      </div>

      {/* 今日番茄进度 */}
      {todayCompletedPomodoros > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>今日专注进度</span>
            <span>{todayCompletedPomodoros} / {settings.dailyTarget} 个番茄</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((todayCompletedPomodoros / settings.dailyTarget) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: Math.min(todayCompletedPomodoros, 12) }, (_, i) => (
              <span key={i} className="text-base">🍅</span>
            ))}
            {todayCompletedPomodoros > 12 && (
              <span className="text-xs text-slate-400 self-center">+{todayCompletedPomodoros - 12}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PomodoroTimer
