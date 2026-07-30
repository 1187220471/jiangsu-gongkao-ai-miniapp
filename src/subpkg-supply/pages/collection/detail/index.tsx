import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { request } from '@/utils/request'
import { getCollectionImageUrl } from '@/utils/collectionAssets'
import { THEME_META, type SupplyCategory } from '@/utils/theme'
import { shareItem } from '@/utils/supply'
import './index.scss'

interface CollectionItem {
  id: number
  name: string
  rarity: string
  imageUrl: string
  category: string
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

export default function CollectionDetail() {
  const router = useRouter()
  const id = Number(router.params.id)
  const category = (router.params.category as SupplyCategory) || 'pixelPet'

  const [item, setItem] = useState<CollectionItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [equipping, setEquipping] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const data = await request<CollectionResponse>({ url: `/api/supply/collection?category=${category}` })
      const found = data.items.find((i) => i.id === id)
      if (found) {
        setItem(found)
      } else {
        Taro.showToast({ title: '物品不存在', icon: 'none' })
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

  const handleShare = async () => {
    if (!item || sharing) return

    setSharing(true)
    try {
      const result = await shareItem(item.id, 'collection')

      // 触发微信分享
      Taro.showModal({
        title: '分享成功',
        content: result.reward.description + '\n今日已分享 ' + result.shareCountToday + ' 次',
        showCancel: false,
      })
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '分享失败',
        icon: 'none',
      })
    } finally {
      setSharing(false)
    }
  }

  // 微信分享配置
  useEffect(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  }, [])

  // 监听分享事件
  const onShareAppMessage = () => {
    if (!item) return {}

    return {
      title: `我获得了 ${item.name}，分享给你！`,
      path: `/pages/index/index?source=share&itemId=${item.id}`,
      imageUrl: getCollectionImageUrl(item.imageUrl),
    }
  }

  // 分享到朋友圈
  const onShareTimeline = () => {
    if (!item) return {}

    return {
      title: `我获得了 ${item.name}，分享给你！`,
      query: `source=share&itemId=${item.id}`,
      imageUrl: getCollectionImageUrl(item.imageUrl),
    }
  }

  const getCardImage = (item: CollectionItem) => getCollectionImageUrl(item.imageUrl)

  const theme = THEME_META[category]
  const rareColor = theme.rareColor
  const commonColor = '#6b7280'

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
        <Text className='loading-text'>物品不存在</Text>
      </View>
    )
  }

  return (
    <View className='collection-detail-page'>
      <View className='detail-card'>
        <Image
          className='detail-img'
          src={getCardImage(item)}
          mode='aspectFit'
        />
        <Text className='detail-name'>{item.name}</Text>
        <View
          className='detail-rarity'
          style={{ background: item.rarity === 'rare' ? rareColor : commonColor }}
        >
          <Text className='detail-rarity-text'>
            {RARITY_LABELS[item.rarity]}
          </Text>
        </View>
        <Text className='detail-desc'>
          {item.description || `${item.name}是收集系统中的一个物品。`}
        </Text>
        {item.collected && item.obtainedAt && (
          <Text className='detail-date'>
            获得时间：{new Date(item.obtainedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {item.collected && (
        <>
          <Button
            className={`equip-btn ${item.isEquipped ? 'unequip' : ''}`}
            onClick={handleEquip}
            disabled={equipping}
          >
            {item.isEquipped ? '取消首页展示' : theme.equipLabel}
          </Button>
          <Button className='share-btn' onClick={handleShare} disabled={sharing}>
            {sharing ? '分享中...' : '分享给朋友'}
          </Button>
        </>
      )}

      {!item.collected && (
        <View className='locked-tip'>
          <Text className='locked-text'>还未收集，去补给站抽取吧</Text>
        </View>
      )}
    </View>
  )
}
