import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { fetchCollection } from '@/utils/supply'
import { getCollectionImageUrl } from '@/utils/collectionAssets'
import { THEME_META, type SupplyCategory } from '@/utils/theme'
import './index.scss'

interface CollectionItem {
  id: number
  name: string
  rarity: string
  imageUrl: string
  category: string
  collected: boolean
  isEquipped: boolean
  obtainedAt: string | null
}

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
}

export default function CollectionList() {
  const router = useRouter()
  const initialCategory = (router.params.category as SupplyCategory) || 'pixelPet'
  const [category, setCategory] = useState<SupplyCategory>(initialCategory)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [stats, setStats] = useState({ total: 0, collected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollectionData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const fetchCollectionData = async () => {
    setLoading(true)
    try {
      const data = await fetchCollection(category)
      // 兜底客户端过滤：API 可能返回跨主题数据（旧版部署），按 category 字段二次过滤
      const filtered = (data.items as CollectionItem[]).filter((item) => {
        if (!item.category) return category === 'pixelPet' // 老数据无 category 按 pixelPet 处理
        return item.category === category
      })
      setItems(filtered)
      setStats({ total: filtered.length, collected: filtered.filter((i) => i.collected).length })
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  const getCardImage = (item: CollectionItem) => getCollectionImageUrl(item.imageUrl)

  const goToDetail = (item: CollectionItem) => {
    if (item.collected) {
      Taro.navigateTo({ url: `/subpkg-supply/pages/collection/detail/index?id=${item.id}&category=${category}` })
    }
  }

  const switchTheme = (c: SupplyCategory) => {
    if (c === category) return
    setCategory(c)
  }

  const theme = THEME_META[category]
  const rareColor = theme.rareColor
  const commonColor = '#6b7280'

  if (loading) {
    return (
      <View className='collection-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='collection-page' scrollY>
      {/* 主题切换 Tab */}
      <View className='theme-tabs'>
        {(['pixelPet', 'nbaStar'] as SupplyCategory[]).map((c) => (
          <View
            key={c}
            className={`theme-tab ${category === c ? 'active' : ''}`}
            onClick={() => switchTheme(c)}
          >
            <Text>{THEME_META[c].icon}</Text>
            <Text className='theme-tab-label'>{THEME_META[c].label}</Text>
          </View>
        ))}
      </View>

      <View className='collection-header'>
        <Text className='collection-title'>{theme.collectionTitle}</Text>
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
                src={getCardImage(item)}
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
              style={{ color: item.collected ? (item.rarity === 'rare' ? rareColor : commonColor) : '#d1d5db' }}
            >
              {item.collected ? RARITY_LABELS[item.rarity] : '???'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
