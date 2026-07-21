import { request } from './request'

export type FocusDuration = 30 | 60

export interface StartFocusResponse {
  sessionId: number
  startedAt: string
  duration: FocusDuration
}

export interface EndFocusResponse {
  status: 'completed' | 'abandoned' | 'cheated'
  pointsAwarded: number
  balance: number
}

export interface TodayFocusResponse {
  totalMinutes: number
  completedMinutes: number
  sessions: Array<{
    id: number
    duration: number
    status: string
    pointsAwarded: number
    startedAt: string
    endedAt: string | null
  }>
}

export function startFocus(duration: FocusDuration) {
  return request<StartFocusResponse>({
    url: '/api/focus/start',
    method: 'POST',
    data: { duration },
  })
}

export function endFocus(sessionId: number, action: 'complete' | 'abandon' = 'complete', clientNow?: number) {
  return request<EndFocusResponse>({
    url: '/api/focus/end',
    method: 'POST',
    data: { sessionId, action, clientNow },
  })
}

export function fetchTodayFocus() {
  return request<TodayFocusResponse>({
    url: '/api/focus/today',
  })
}
