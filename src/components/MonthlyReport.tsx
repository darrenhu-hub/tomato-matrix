import { useState } from 'react'

const MonthlyReport = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const generateReport = () => {
    const [year, month] = exportMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    
    let totalTasks = 0
    let completedTasks = 0
    let totalPomodoros = 0
    const quadrantStats = { q1: 0, q2: 0, q3: 0, q4: 0 }
    const dailyData: Array<{
      date: string
      tasks: number
      completed: number
      pomodoros: number
    }> = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const stored = localStorage.getItem(`tomatoMatrix:days:${dateStr}`)
      
      if (stored) {
        try {
          const data = JSON.parse(stored)
          const dayTasks = data.tasks || []
          const dayCompleted = dayTasks.filter((t: any) => t.completed).length
          const dayPomodoros = dayTasks.reduce((sum: number, t: any) => sum + (t.completedPomodoros || 0), 0)

          totalTasks += dayTasks.length
          completedTasks += dayCompleted
          totalPomodoros += dayPomodoros

          dayTasks.forEach((t: any) => {
            if (t.quadrant === 1) quadrantStats.q1++
            else if (t.quadrant === 2) quadrantStats.q2++
            else if (t.quadrant === 3) quadrantStats.q3++
            else if (t.quadrant === 4) quadrantStats.q4++
          })

          if (dayTasks.length > 0) {
            dailyData.push({
              date: dateStr,
              tasks: dayTasks.length,
              completed: dayCompleted,
              pomodoros: dayPomodoros
            })
          }
        } catch (e) {}
      }
    }

    const totalMinutes = totalPomodoros * 25
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    let report = `番茄象限 - 月度报表\n`
    report += `${year}年${month}月\n`
    report += `${'='.repeat(40)}\n\n`
    
    report += `📊 总体统计\n`
    report += `────────────────────────────\n`
    report += `任务总数：${totalTasks}\n`
    report += `已完成：${completedTasks}\n`
    report += `完成率：${completionRate}%\n`
    report += `番茄钟：${totalPomodoros}个\n`
    report += `专注时长：${hours}小时${mins}分钟\n\n`
    
    report += `📋 象限分布\n`
    report += `────────────────────────────\n`
    report += `🔴 重要且紧急：${quadrantStats.q1}\n`
    report += `🟡 重要不紧急：${quadrantStats.q2}\n`
    report += `🟠 紧急不重要：${quadrantStats.q3}\n`
    report += `⚪ 不重要：${quadrantStats.q4}\n\n`
    
    if (dailyData.length > 0) {
      report += `📅 每日明细\n`
      report += `────────────────────────────\n`
      report += `日期          任务  完成  番茄\n`
      dailyData.forEach(d => {
        const date = new Date(d.date)
        const dateDisplay = `${date.getMonth() + 1}/${date.getDate()}`
        report += `${dateDisplay.padEnd(12)} ${String(d.tasks).padStart(4)}  ${String(d.completed).padStart(4)}  ${String(d.pomodoros).padStart(4)}\n`
      })
    }

    return report
  }

  const handleExport = () => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `番茄象限_月报_${exportMonth}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  const handleExportCSV = () => {
    const [year, month] = exportMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    
    let csv = '日期,象限,任务名称,状态,番茄数\n'
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const stored = localStorage.getItem(`tomatoMatrix:days:${dateStr}`)
      
      if (stored) {
        try {
          const data = JSON.parse(stored)
          const tasks = data.tasks || []
          
          tasks.forEach((t: any) => {
            const quadrantName = t.quadrant === 1 ? '重要且紧急' 
              : t.quadrant === 2 ? '重要不紧急' 
              : t.quadrant === 3 ? '紧急不重要' 
              : '不重要'
            const status = t.completed ? '已完成' : '进行中'
            csv += `${dateStr},${quadrantName},"${t.title}",${status},${t.completedPomodoros || 0}\n`
          })
        } catch (e) {}
      }
    }

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `番茄象限_明细_${exportMonth}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm text-sm"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        月报导出
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-50 w-[300px]">
          <h3 className="font-semibold text-slate-800 mb-4">导出月度报表</h3>
          
          <div className="mb-4">
            <label className="block text-sm text-slate-600 mb-2">选择月份</label>
            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出 TXT 报表
            </button>
            
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              导出 CSV 明细
            </button>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 py-2"
          >
            取消
          </button>
        </div>
      )}
    </div>
  )
}

export default MonthlyReport
