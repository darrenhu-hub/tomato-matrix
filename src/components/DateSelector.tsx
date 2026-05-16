import { useState, useRef, useEffect, useMemo } from 'react'
import { useStore } from '../store'

const DateSelector = () => {
  const { currentDate, setCurrentDate } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(new Date(currentDate))
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const today = new Date().toISOString().split('T')[0]

  // 获取当月有任务的日期集合
  const datesWithTasks = useMemo(() => {
    const dates = new Set<string>()
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const stored = localStorage.getItem(`tomatoMatrix:days:${dateStr}`)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.tasks && data.tasks.length > 0) {
            dates.add(dateStr)
          }
        } catch (e) {}
      }
    }
    return dates
  }, [viewMonth])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1 // Monday = 0
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getWeekday = (dateStr: string) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[new Date(dateStr).getDay()]
  }

  const navigateMonth = (direction: -1 | 1) => {
    const newDate = new Date(viewMonth)
    newDate.setMonth(newDate.getMonth() + direction)
    setViewMonth(newDate)
  }

  const handleDateClick = (day: number) => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setCurrentDate(dateStr)
    setIsOpen(false)
  }

  const daysInMonth = getDaysInMonth(viewMonth)
  const firstDay = getFirstDayOfMonth(viewMonth)
  const monthName = viewMonth.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })

  const dayNames = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm"
      >
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium text-slate-800">{formatDate(currentDate)}</span>
        <span className="text-slate-500">{getWeekday(currentDate)}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="font-semibold text-slate-800">{monthName}</h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === today
              const isSelected = dateStr === currentDate
              const hasTasks = datesWithTasks.has(dateStr)

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`relative w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-lg'
                      : isToday
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day}
                  {hasTasks && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              有任务的日期
            </div>
            <button
              onClick={() => {
                setCurrentDate(today)
                setIsOpen(false)
              }}
              className="text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-3 py-1 rounded-lg transition-colors"
            >
              回到今天
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateSelector
