import { create } from 'zustand'

interface Task {
  id: string
  title: string
  quadrant: 1 | 2 | 3 | 4
  estimatedPomodoros: number
  completedPomodoros: number
  completed: boolean
  order: number
  createdAt: string
}

interface DayData {
  date: string
  tasks: Task[]
  pomodoroTarget: number
  focusSeconds: number
}

interface PomodoroSettings {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  dailyTarget: number
}

interface PomodoroState {
  isRunning: boolean
  isBreak: boolean
  timeLeft: number
  currentTaskId: string | null
  completedPomodoros: number
  focusStartTime: number | null
  savedFocusTimeLeft: number | null
}

interface AppState {
  currentDate: string
  dayData: DayData
  settings: PomodoroSettings
  pomodoroState: PomodoroState
}

interface AppActions {
  setCurrentDate: (date: string) => void
  addTask: (quadrant: 1 | 2 | 3 | 4) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  toggleTaskComplete: (taskId: string) => void
  moveTask: (taskId: string, newQuadrant: 1 | 2 | 3 | 4) => void
  reorderTasks: (quadrant: 1 | 2 | 3 | 4, taskIds: string[]) => void
  startPomodoro: (taskId?: string) => void
  pausePomodoro: () => void
  resumePomodoro: () => void
  stopPomodoro: () => void
  tickPomodoro: () => void
  completePomodoro: () => void
  finishTask: () => void
  startBreak: () => void
  endBreak: () => void
  updateSettings: (settings: Partial<PomodoroSettings>) => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)
const getToday = () => new Date().toISOString().split('T')[0]

const defaultSettings: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  dailyTarget: 8
}

const defaultPomodoroState: PomodoroState = {
  isRunning: false,
  isBreak: false,
  timeLeft: 25 * 60,
  currentTaskId: null,
  completedPomodoros: 0,
  focusStartTime: null,
  savedFocusTimeLeft: null
}

const loadDayData = (date: string): DayData => {
  const stored = localStorage.getItem(`tomatoMatrix:days:${date}`)
  if (stored) {
    const data = JSON.parse(stored)
    if (data.focusSeconds === undefined) data.focusSeconds = 0
    return data
  }
  return { date, tasks: [], pomodoroTarget: 8, focusSeconds: 0 }
}

const saveDayData = (data: DayData) => {
  localStorage.setItem(`tomatoMatrix:days:${data.date}`, JSON.stringify(data))
}

const loadSettings = (): PomodoroSettings => {
  const stored = localStorage.getItem('tomatoMatrix:settings')
  return stored ? JSON.parse(stored) : defaultSettings
}

const saveSettings = (settings: PomodoroSettings) => {
  localStorage.setItem('tomatoMatrix:settings', JSON.stringify(settings))
}

// 帮助函数：累积专注时长
const accumulateFocus = (state: AppState): DayData => {
  let addedSeconds = 0
  if (state.pomodoroState.focusStartTime) {
    addedSeconds = Math.floor((Date.now() - state.pomodoroState.focusStartTime) / 1000)
  }
  return {
    ...state.dayData,
    focusSeconds: (state.dayData.focusSeconds || 0) + addedSeconds
  }
}

// 帮助函数：构建 pomodoroState
const ps = (overrides: Partial<PomodoroState>): PomodoroState => ({
  ...defaultPomodoroState,
  ...overrides
})

export const useStore = create<AppState & AppActions>((set, get) => ({
  currentDate: getToday(),
  dayData: loadDayData(getToday()),
  settings: loadSettings(),
  pomodoroState: { ...defaultPomodoroState },

  setCurrentDate: (date) => {
    set({ currentDate: date, dayData: loadDayData(date) })
  },

  addTask: (quadrant) => {
    const state = get()
    const tasksInQuadrant = state.dayData.tasks.filter(t => t.quadrant === quadrant)
    const newTask: Task = {
      id: generateId(),
      title: '',
      quadrant,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      completed: false,
      order: tasksInQuadrant.length,
      createdAt: new Date().toISOString()
    }
    const newDayData = { ...state.dayData, tasks: [...state.dayData.tasks, newTask] }
    saveDayData(newDayData)
    set({ dayData: newDayData })
  },

  updateTask: (taskId, updates) => {
    const state = get()
    const newDayData = {
      ...state.dayData,
      tasks: state.dayData.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }
    saveDayData(newDayData)
    set({ dayData: newDayData })
  },

  deleteTask: (taskId) => {
    const state = get()
    const newDayData = { ...state.dayData, tasks: state.dayData.tasks.filter(t => t.id !== taskId) }
    saveDayData(newDayData)
    set({ dayData: newDayData })
  },

  toggleTaskComplete: (taskId) => {
    const state = get()
    const newDayData = {
      ...state.dayData,
      tasks: state.dayData.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }
    saveDayData(newDayData)
    set({ dayData: newDayData })
  },

  moveTask: (taskId, newQuadrant) => {
    const state = get()
    const tasksInNewQuadrant = state.dayData.tasks.filter(t => t.quadrant === newQuadrant)
    const newDayData = {
      ...state.dayData,
      tasks: state.dayData.tasks.map(t =>
        t.id === taskId ? { ...t, quadrant: newQuadrant, order: tasksInNewQuadrant.length } : t
      )
    }
    saveDayData(newDayData)
    set({ dayData: newDayData })
  },

  reorderTasks: (quadrant, taskIds) => {
    const state = get()
    const newDayData = {
      ...state.dayData,
      tasks: state.dayData.tasks.map(t => {
        if (t.quadrant === quadrant) {
          const newOrder = taskIds.indexOf(t.id)
          return { ...t, order: newOrder >= 0 ? newOrder : t.order }
        }
        return t
      })
    }
    saveDayData(newDayData)
    set({ dayData: newDayData })
  },

  startPomodoro: (taskId) => {
    const state = get()
    set({
      pomodoroState: ps({
        isRunning: true,
        isBreak: false,
        timeLeft: state.settings.workMinutes * 60,
        currentTaskId: taskId || state.pomodoroState.currentTaskId,
        completedPomodoros: state.pomodoroState.completedPomodoros,
        focusStartTime: Date.now()
      })
    })
  },

  pausePomodoro: () => {
    const state = get()
    const newDayData = accumulateFocus(state)
    saveDayData(newDayData)
    set({
      dayData: newDayData,
      pomodoroState: ps({ ...state.pomodoroState, isRunning: false, focusStartTime: null })
    })
  },

  resumePomodoro: () => {
    set(state => ({
      pomodoroState: ps({ ...state.pomodoroState, isRunning: true, focusStartTime: Date.now() })
    }))
  },

  stopPomodoro: () => {
    const state = get()
    const newDayData = accumulateFocus(state)
    saveDayData(newDayData)
    set({
      dayData: newDayData,
      pomodoroState: ps({
        isRunning: false,
        isBreak: false,
        timeLeft: state.settings.workMinutes * 60,
        currentTaskId: null,
        completedPomodoros: state.pomodoroState.completedPomodoros
      })
    })
  },

  tickPomodoro: () => {
    set(state => {
      if (!state.pomodoroState.isRunning) return state
      if (state.pomodoroState.timeLeft <= 1) {
        return {
          pomodoroState: ps({ ...state.pomodoroState, timeLeft: 0, isRunning: false })
        }
      }
      return {
        pomodoroState: ps({ ...state.pomodoroState, timeLeft: state.pomodoroState.timeLeft - 1 })
      }
    })
  },

  completePomodoro: () => {
    const state = get()
    const newCompleted = state.pomodoroState.completedPomodoros + 1
    const isLongBreak = newCompleted % state.settings.longBreakInterval === 0
    const breakTime = isLongBreak
      ? state.settings.longBreakMinutes * 60
      : state.settings.shortBreakMinutes * 60

    const newDayData = accumulateFocus(state)

    if (state.pomodoroState.currentTaskId) {
      newDayData.tasks = newDayData.tasks.map(t =>
        t.id === state.pomodoroState.currentTaskId
          ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
          : t
      )
    }
    saveDayData(newDayData)

    set({
      dayData: newDayData,
      pomodoroState: ps({
        isRunning: true,
        isBreak: true,
        timeLeft: breakTime,
        currentTaskId: state.pomodoroState.currentTaskId,
        completedPomodoros: newCompleted
      })
    })
  },

  finishTask: () => {
    const state = get()
    const newDayData = accumulateFocus(state)

    if (state.pomodoroState.currentTaskId) {
      newDayData.tasks = newDayData.tasks.map(t =>
        t.id === state.pomodoroState.currentTaskId
          ? { ...t, completed: true, completedPomodoros: t.completedPomodoros + 1 }
          : t
      )
    }
    saveDayData(newDayData)

    set({
      dayData: newDayData,
      pomodoroState: ps({
        isRunning: false,
        isBreak: false,
        timeLeft: state.settings.workMinutes * 60,
        currentTaskId: null,
        completedPomodoros: state.pomodoroState.completedPomodoros + 1
      })
    })
  },

  startBreak: () => {
    const state = get()
    const newDayData = accumulateFocus(state)
    saveDayData(newDayData)

    set({
      dayData: newDayData,
      pomodoroState: ps({
        ...state.pomodoroState,
        isRunning: true,
        isBreak: true,
        timeLeft: state.settings.shortBreakMinutes * 60,
        savedFocusTimeLeft: state.pomodoroState.timeLeft,
        focusStartTime: null
      })
    })
  },

  endBreak: () => {
    const state = get()
    const savedTime = state.pomodoroState.savedFocusTimeLeft ?? state.settings.workMinutes * 60
    set({
      pomodoroState: ps({
        ...state.pomodoroState,
        isRunning: true,
        isBreak: false,
        timeLeft: savedTime,
        savedFocusTimeLeft: null,
        focusStartTime: Date.now()
      })
    })
  },

  updateSettings: (newSettings) => {
    const state = get()
    const settings = { ...state.settings, ...newSettings }
    saveSettings(settings)
    set({ settings })
  }
}))
