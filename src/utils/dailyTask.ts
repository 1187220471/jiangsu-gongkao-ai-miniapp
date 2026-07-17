import Taro from '@tarojs/taro'

const DAILY_TASK_DATE_KEY = 'daily_task_date'
const DAILY_TASK_COUNT_KEY = 'daily_task_count'
const DAILY_TASK_TOTAL = 3

export interface DailyTaskState {
  count: number
  total: number
  completed: boolean
  date: string
  progress: number
}

function getToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDailyTask(): DailyTaskState {
  const today = getToday()
  const storedDate = Taro.getStorageSync<string>(DAILY_TASK_DATE_KEY) || ''
  let count = 0

  if (storedDate === today) {
    const storedCount = Taro.getStorageSync<number>(DAILY_TASK_COUNT_KEY)
    count = typeof storedCount === 'number' && storedCount >= 0 ? storedCount : 0
  }

  count = Math.min(count, DAILY_TASK_TOTAL)

  return {
    count,
    total: DAILY_TASK_TOTAL,
    completed: count >= DAILY_TASK_TOTAL,
    date: today,
    progress: Math.round((count / DAILY_TASK_TOTAL) * 100),
  }
}

export function completeDailyTask(): DailyTaskState {
  const today = getToday()
  const storedDate = Taro.getStorageSync<string>(DAILY_TASK_DATE_KEY) || ''
  let count = 0

  if (storedDate === today) {
    const storedCount = Taro.getStorageSync<number>(DAILY_TASK_COUNT_KEY)
    count = typeof storedCount === 'number' && storedCount >= 0 ? storedCount : 0
  }

  if (count < DAILY_TASK_TOTAL) {
    count += 1
  }

  Taro.setStorageSync(DAILY_TASK_DATE_KEY, today)
  Taro.setStorageSync(DAILY_TASK_COUNT_KEY, count)

  return {
    count,
    total: DAILY_TASK_TOTAL,
    completed: count >= DAILY_TASK_TOTAL,
    date: today,
    progress: Math.round((count / DAILY_TASK_TOTAL) * 100),
  }
}

export function getTaskHint(count: number): string {
  if (count >= DAILY_TASK_TOTAL) {
    return '今日目标已完成！'
  }
  if (count === DAILY_TASK_TOTAL - 1) {
    return `还差 1 次完成今日目标`
  }
  return `今日目标：完成 ${DAILY_TASK_TOTAL} 次练习`
}
