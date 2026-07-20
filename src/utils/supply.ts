import { request } from './request'

export type EarnType = 'answer' | 'set' | 'zhenti' | 'shenlun' | 'focus30' | 'focus60' | 'dailySign' | 'share'

export async function earnPoints(type: EarnType, refId?: string) {
  return request<{ balance: number; earned: number; alreadyEarned: boolean }>({
    url: '/api/supply/earn',
    method: 'POST',
    data: { type, refId },
  })
}

export async function fetchSupplyBalance() {
  return request<{
    balance: number
    freeDrawUsedToday?: boolean
    equippedItem: { id: number; name: string; imageUrl: string } | null
  }>({
    url: '/api/supply/balance',
  })
}
