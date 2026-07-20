import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { request } from '@/utils/request'
import { getPetImageUrl } from '@/utils/petAssets'
import './index.scss'

interface CollectionItem {
  id: number
  name: string
  rarity: string
  imageUrl: string
  description: string | null
  collected: boolean
  isEquipped: boolean
  obtainedAt: string | null
}

interface CollectionResponse {
  items: CollectionItem[]
}

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
}

const RARITY_COLORS: Record<string, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
}

export default function CollectionDetail() {
  const router = useRouter()
  const id = Number(router.params.id)

  const [item, setItem] = useState<CollectionItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [equipping, setEquipping] = useState(false)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const data = await request<CollectionResponse>({ url: '/api/supply/collection' })
      const found = data.items.find((i) => i.id === id)
      if (found) {
        setItem(found)
      } else {
        Taro.showToast({ title: '萌宠不存在', icon: 'none' })
      }
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEquip = async () => {
    if (!item || equipping) return

    setEquipping(true)
    try {
      await request({
        url: '/api/supply/collection/equip',
        method: 'POST',
        data: { itemId: item.isEquipped ? null : item.id },
      })

      Taro.showToast({
        title: item.isEquipped ? '已取消展示' : '已设为首页展示',
        icon: 'none',
      })

      setItem({ ...item, isEquipped: !item.isEquipped })
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '操作失败',
        icon: 'none',
      })
    } finally {
      setEquipping(false)
    }
  }

  const getPetImage = (item: CollectionItem) => getPetImageUrl(item.imageUrl)

  if (loading) {
    return (
      <View className='collection-detail-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='collection-detail-page'>
        <Text className='loading-text'>萌宠不存在</Text>
      </View>
    )
  }

  return (
    <View className='collection-detail-page'>
      <View className='detail-card'>
        <Image
          className='detail-img'
          src={getPetImage(item)}
          mode='aspectFit'
        />
        <Text className='detail-name'>{item.name}</Text>
        <View
          className='detail-rarity'
          style={{ background: RARITY_COLORS[item.rarity] }}
        >
          <Text className='detail-rarity-text'>
            {RARITY_LABELS[item.rarity]}
          </Text>
        </View>
        <Text className='detail-desc'>
          {item.description || `${item.name}是一只可爱的像素风萌宠。`}
        </Text>
        {item.collected && item.obtainedAt && (
          <Text className='detail-date'>
            获得时间：{new Date(item.obtainedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {item.collected && (
        <Button
          className={`equip-btn ${item.isEquipped ? 'unequip' : ''}`}
          onClick={handleEquip}
          disabled={equipping}
        >
          {item.isEquipped ? '取消首页展示' : '设为首页展示'}
        </Button>
      )}

      {!item.collected && (
        <View className='locked-tip'>
          <Text className='locked-text'>还未收集，去补给站抽取吧</Text>
        </View>
      )}
    </View>
  )
}
