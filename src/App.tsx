import { useEffect, useRef } from 'react'
import { useStore } from './store'
import DateSelector from './components/DateSelector'
import QuadrantGrid from './components/QuadrantGrid'
import PomodoroTimer from './components/PomodoroTimer'
import DailyStats from './components/DailyStats'
import MonthlyReport from './components/MonthlyReport'

function App() {
  const { pomodoroState, tickPomodoro, endBreak } = useStore()
  const prevTimeLeft = useRef(pomodoroState.timeLeft)

  useEffect(() => {
    let interval: number | null = null
    if (pomodoroState.isRunning) {
      interval = window.setInterval(() => {
        tickPomodoro()
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pomodoroState.isRunning, tickPomodoro])

  // 检测休息结束：当休息倒计时到0时，自动恢复专注
  useEffect(() => {
    if (pomodoroState.isBreak && pomodoroState.timeLeft === 0 && prevTimeLeft.current > 0) {
      // 休息时间到了，自动恢复专注
      endBreak()
    }
    prevTimeLeft.current = pomodoroState.timeLeft
  }, [pomodoroState.timeLeft, pomodoroState.isBreak, endBreak])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            <h1 className="text-xl font-semibold text-slate-800">番茄象限</h1>
          </div>
          <div className="flex items-center gap-3">
            <DateSelector />
            <MonthlyReport />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuadrantGrid />
          </div>
          <div className="space-y-6">
            <PomodoroTimer />
            <DailyStats />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
