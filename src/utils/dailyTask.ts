import Taro from '@tarojs/taro'

const DAILY_TASK_DATE_KEY = 'daily_task_date'
const DAILY_TASK_COUNT_KEY = 'daily_task_count'
const DAILY_TASK_TARGET_KEY = 'daily_task_target'
const DEFAULT_TARGET = 3
const MAX_TARGET = 20

export interface DailyTaskState {
  count: number
  target: number
  completed: boolean
  date: string
  progress: number
}

/** 0=reading, 1=writing, 2=thumbsup */
export type MascotStage = 0 | 1 | 2

function getToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTarget(): number {
  const stored = Taro.getStorageSync<number>(DAILY_TASK_TARGET_KEY)
  if (typeof stored === 'number' && stored >= 1 && stored <= MAX_TARGET) {
    return stored
  }
  return DEFAULT_TARGET
}

function computeProgress(count: number, target: number): number {
  if (target <= 0) return 0
  return Math.round((count / target) * 100)
}

export function getMascotStage(progress: number): MascotStage {
  if (progress >= 66) return 2
  if (progress >= 33) return 1
  return 0
}

export function getDailyTask(): DailyTaskState {
  const today = getToday()
  const storedDate = Taro.getStorageSync<string>(DAILY_TASK_DATE_KEY) || ''
  const target = getTarget()
  let count = 0

  if (storedDate === today) {
    const storedCount = Taro.getStorageSync<number>(DAILY_TASK_COUNT_KEY)
    count = typeof storedCount === 'number' && storedCount >= 0 ? storedCount : 0
  }

  count = Math.min(count, target)

  return {
    count,
    target,
    completed: count >= target,
    date: today,
    progress: computeProgress(count, target),
  }
}

export function completeDailyTask(): DailyTaskState {
  const today = getToday()
  const storedDate = Taro.getStorageSync<string>(DAILY_TASK_DATE_KEY) || ''
  const target = getTarget()
  let count = 0

  if (storedDate === today) {
    const storedCount = Taro.getStorageSync<number>(DAILY_TASK_COUNT_KEY)
    count = typeof storedCount === 'number' && storedCount >= 0 ? storedCount : 0
  }

  if (count < target) {
    count += 1
  }

  Taro.setStorageSync(DAILY_TASK_DATE_KEY, today)
  Taro.setStorageSync(DAILY_TASK_COUNT_KEY, count)

  return {
    count,
    target,
    completed: count >= target,
    date: today,
    progress: computeProgress(count, target),
  }
}

export function setDailyTaskTarget(n: number): DailyTaskState {
  const today = getToday()
  const target = Math.max(1, Math.min(MAX_TARGET, Math.round(n)))
  let count = 0

  const storedDate = Taro.getStorageSync<string>(DAILY_TASK_DATE_KEY) || ''
  if (storedDate === today) {
    const storedCount = Taro.getStorageSync<number>(DAILY_TASK_COUNT_KEY)
    count = typeof storedCount === 'number' && storedCount >= 0 ? storedCount : 0
  }

  count = Math.min(count, target)

  Taro.setStorageSync(DAILY_TASK_TARGET_KEY, target)
  Taro.setStorageSync(DAILY_TASK_DATE_KEY, today)
  Taro.setStorageSync(DAILY_TASK_COUNT_KEY, count)

  return {
    count,
    target,
    completed: count >= target,
    date: today,
    progress: computeProgress(count, target),
  }
}

export function getTaskHint(count: number, target: number): string {
  if (count >= target) {
    return '今日目标已完成！'
  }
  const remaining = target - count
  if (remaining === 1) {
    return '还差 1 次完成今日目标'
  }
  return `还差 ${remaining} 次完成今日目标`
}
