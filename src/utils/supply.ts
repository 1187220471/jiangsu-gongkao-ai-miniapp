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

export type DrawSource = 'free' | 'paid' | 'share'

export async function drawItem(
  source: DrawSource,
  category: SupplyCategory = 'pixelPet',
  shareToken?: string
) {
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
    source: DrawSource
  }>({
    url: '/api/supply/draw',
    method: 'POST',
    data: { source, category, shareToken },
  })
}

/**
 * 创建带一次性免费抽令牌的分享卡
 */
export async function shareItem(itemId: number) {
  return request<{
    success: boolean
    token: string
    item: { id: number; name: string; category: string }
    shareCountToday: number
    remainingShares: number
  }>({
    url: '/api/supply/share',
    method: 'POST',
    data: { itemId },
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
