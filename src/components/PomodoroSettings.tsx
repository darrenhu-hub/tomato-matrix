import { useState } from 'react'
import { useStore } from '../store'

const PomodoroSettings = () => {
  const { settings, updateSettings } = useStore()
  const [open, setOpen] = useState(false)

  const handleChange = (key: string, value: number) => {
    if (value < 1) value = 1
    updateSettings({ [key]: value })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        title="番茄钟设置"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        title="番茄钟设置"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
        onClick={() => setOpen(false)}
      >
        {/* 弹窗 */}
        <div
          className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-[calc(100vw-2rem)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800 text-lg">⚙️ 番茄钟设置</h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
          </div>

          <div className="space-y-4">
            {/* 专注时长 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-600">专注时长（分钟）</label>
                <span className="text-sm font-medium text-slate-800">{settings.workMinutes}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange('workMinutes', settings.workMinutes - 5)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >−</button>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={settings.workMinutes}
                  onChange={e => handleChange('workMinutes', parseInt(e.target.value))}
                  className="flex-1 accent-red-500"
                />
                <button
                  onClick={() => handleChange('workMinutes', settings.workMinutes + 5)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >+</button>
              </div>
            </div>

            {/* 短休息 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-600">短休息（分钟）</label>
                <span className="text-sm font-medium text-slate-800">{settings.shortBreakMinutes}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange('shortBreakMinutes', settings.shortBreakMinutes - 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >−</button>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={settings.shortBreakMinutes}
                  onChange={e => handleChange('shortBreakMinutes', parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <button
                  onClick={() => handleChange('shortBreakMinutes', settings.shortBreakMinutes + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >+</button>
              </div>
            </div>

            {/* 长休息 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-600">长休息（分钟）</label>
                <span className="text-sm font-medium text-slate-800">{settings.longBreakMinutes}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange('longBreakMinutes', settings.longBreakMinutes - 5)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >−</button>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={settings.longBreakMinutes}
                  onChange={e => handleChange('longBreakMinutes', parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <button
                  onClick={() => handleChange('longBreakMinutes', settings.longBreakMinutes + 5)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >+</button>
              </div>
            </div>

            {/* 长休息间隔 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-600">长休息间隔（个番茄）</label>
                <span className="text-sm font-medium text-slate-800">{settings.longBreakInterval}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange('longBreakInterval', settings.longBreakInterval - 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >−</button>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={settings.longBreakInterval}
                  onChange={e => handleChange('longBreakInterval', parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <button
                  onClick={() => handleChange('longBreakInterval', settings.longBreakInterval + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >+</button>
              </div>
            </div>

            {/* 每日目标 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-600">每日目标（个番茄）</label>
                <span className="text-sm font-medium text-slate-800">{settings.dailyTarget}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange('dailyTarget', settings.dailyTarget - 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >−</button>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={settings.dailyTarget}
                  onChange={e => handleChange('dailyTarget', parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <button
                  onClick={() => handleChange('dailyTarget', settings.dailyTarget + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-medium"
                >+</button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full mt-5 bg-slate-800 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-colors text-sm"
          >
            完成
          </button>
        </div>
      </div>
    </>
  )
}

export default PomodoroSettings
