import { request } from './request'
import type { SupplyCategory } from './theme'

export type EarnType = 'answer' | 'set' | 'zhenti' | 'shenlun' | 'focus30' | 'focus60' | 'dailySign' | 'share'

export async function earnPoints(type: EarnType, refId?: string) {
  return request<{ balance: number; earned: number; alreadyEarned: boolean }>({
    url: '/api/supply/earn',
    method: 'POST',
    data: { type, refId },
  })
}

export async function fetchSupplyBalance(category?: SupplyCategory) {
  const query = category ? `?category=${category}` : ''
  return request<{
    balance: number
    freeDrawUsedToday?: boolean
    category?: string
    equippedItem: { id: number; name: string; imageUrl: string; rarity: string; category?: string } | null
  }>({
    url: `/api/supply/balance${query}`,
  })
}

export async function fetchCollection(category: SupplyCategory = 'pixelPet') {
  return request<{
    items: Array<{
      id: number
      name: string
      rarity: string
      imageUrl: string
      category: string
      description?: string | null
      collected: boolean
      isEquipped: boolean
      obtainedAt: string | null
    }>
    total: number
    collected: number
  }>({
    url: `/api/supply/collection?category=${category}`,
  })
}

export async function fetchAllCollection() {
  return request<{
    items: Array<{
      id: number
      name: string
      rarity: string
      imageUrl: string
      category: string
      description?: string | null
      collected: boolean
      isEquipped: boolean
      obtainedAt: string | null
    }>
    total: number
    collected: number
  }>({
    url: '/api/supply/collection?category=all',
  })
}

export async function drawItem(source: 'free' | 'paid', category: SupplyCategory = 'pixelPet') {
  return request<{
    item: {
      id: number
      name: string
      rarity: string
      imageUrl: string
      description: string | null
    }
    isRepeat: boolean
    repeatPoints: number
    balance: number
    source: 'free' | 'paid'
  }>({
    url: '/api/supply/draw',
    method: 'POST',
    data: { source, category },
  })
}

/**
 * ���享补给品，获得奖励
 */
export async function shareItem(itemId: number, source: 'collection' | 'focus' | 'answer' = 'collection') {
  return request<{
    success: boolean
    shared: boolean
    sharerId?: string
    reward: {
      type: 'points'
      amount: number
      description: string
    }
    shareCountToday: number
    remainingShares: number
  }>({
    url: '/api/supply/share',
    method: 'POST',
    data: { itemId, source },
  })
}

/**
 * 领取被分享的免费抽奖励
 */
export async function claimShareReward(token: string) {
  return request<{
    success: boolean
    reward: {
      type: 'freeDraw'
      description: string
    }
    sharerId: string
    item: {
      id: number
      name: string
      rarity: string
      category: string
    } | null
  }>({
    url: '/api/supply/share/claim',
    method: 'POST',
    data: { token },
  })
}
