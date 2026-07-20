import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { request } from '@/utils/request'
import { getPetImageUrl } from '@/utils/petAssets'
import './index.scss'

interface CollectionItem {
  id: number
  name: string
  rarity: string
  imageUrl: string
  collected: boolean
  isEquipped: boolean
  obtainedAt: string | null
}

interface CollectionResponse {
  items: CollectionItem[]
  total: number
  collected: number
}

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
}

const RARITY_COLORS: Record<string, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
}

export default function CollectionList() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [stats, setStats] = useState({ total: 0, collected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollection()
  }, [])

  const fetchCollection = async () => {
    setLoading(true)
    try {
      const data = await request<CollectionResponse>({ url: '/api/supply/collection' })
      setItems(data.items)
      setStats({ total: data.total, collected: data.collected })
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPetImage = (item: CollectionItem) => getPetImageUrl(item.imageUrl)

  const goToDetail = (item: CollectionItem) => {
    if (item.collected) {
      Taro.navigateTo({ url: `/subpkg-supply/pages/collection/detail?id=${item.id}` })
    }
  }

  if (loading) {
    return (
      <View className='collection-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='collection-page' scrollY>
      <View className='collection-header'>
        <Text className='collection-title'>我的图鉴</Text>
        <Text className='collection-progress'>
          {stats.collected}/{stats.total}
        </Text>
      </View>

      <View className='progress-bar'>
        <View
          className='progress-fill'
          style={{ width: `${stats.total > 0 ? (stats.collected / stats.total) * 100 : 0}%` }}
        />
      </View>

      <View className='collection-grid'>
        {items.map((item) => (
          <View
            key={item.id}
            className={`collection-item ${item.collected ? '' : 'locked'} ${item.isEquipped ? 'equipped' : ''}`}
            onClick={() => goToDetail(item)}
          >
            {item.isEquipped && (
              <View className='equipped-badge'>
                <Text className='equipped-text'>展示中</Text>
              </View>
            )}

            {item.collected ? (
              <Image
                className='collection-img'
                src={getPetImage(item)}
                mode='aspectFit'
              />
            ) : (
              <Text className='collection-lock'>?</Text>
            )}

            <Text className='collection-name'>
              {item.collected ? item.name : '???'}
            </Text>

            <Text
              className='collection-rarity'
              style={{ color: item.collected ? RARITY_COLORS[item.rarity] : '#d1d5db' }}
            >
              {item.collected ? RARITY_LABELS[item.rarity] : '???'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
