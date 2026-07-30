import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { getCollectionImageUrl } from '@/utils/collectionAssets'
import { drawItem, fetchCollection, fetchSupplyBalance } from '@/utils/supply'
import { THEME_META, type SupplyCategory } from '@/utils/theme'
import capsuleImage from '@/assets/supply/capsule-160.png'
import './index.scss'

interface DrawResult {
  id: number
  name: string
  rarity: string
  imageUrl: string
  description: string | null
}

interface DrawResponse {
  item: DrawResult
  isRepeat: boolean
  repeatPoints: number
  balance: number
  source: 'free' | 'paid' | 'share'
}

interface PoolItem {
  id: number
  name: string
  rarity: string
  imageUrl: string
  collected: boolean
}

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
}

const LIGHT_COUNT = 7

export default function SupplyDraw() {
  const router = useRouter()
  const initialShareToken = router.params.shareToken
  const initialCategory = (router.params.category as SupplyCategory) || 'pixelPet'
  const [category, setCategory] = useState<SupplyCategory>(initialCategory)
  const [shareToken, setShareToken] = useState<string | undefined>(initialShareToken)
  const [balance, setBalance] = useState(0)
  const [pool, setPool] = useState<PoolItem[]>([])
  const [stats, setStats] = useState({ total: 0, collected: 0 })
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [outcome, setOutcome] = useState<DrawResponse | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [freeUsed, setFreeUsed] = useState(false)
  const [reelIndex, setReelIndex] = useState(0)
  const [stoppedCount, setStoppedCount] = useState(0)
  const reelTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchData()
    return () => stopReel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const stopReel = () => {
    if (reelTimer.current) {
      clearInterval(reelTimer.current)
      reelTimer.current = null
    }
  }

  const startReel = () => {
    stopReel()
    let i = 0
    reelTimer.current = setInterval(() => {
      i += 1
      setReelIndex(i)
    }, 100)
  }

  const fetchData = async () => {
    try {
      const [balanceData, collectionData] = await Promise.all([
        fetchSupplyBalance(),
        fetchCollection(category),
      ])
      setBalance(balanceData.balance)
      setFreeUsed(!!balanceData.freeDrawUsedToday)
      // 兜底客户端过滤
      const filtered = collectionData.items.filter((item: PoolItem & { category?: string }) => {
        if (!item.category) return category === 'pixelPet'
        return item.category === category
      })
      setPool(filtered as PoolItem[])
      setStats({ total: filtered.length, collected: filtered.filter((i: PoolItem) => i.collected).length })
    } catch (err) {
      console.error('加载补给站失败:', err)
    }
  }

  const handleDraw = async () => {
    if (loading || animating) return

    const source: 'free' | 'paid' | 'share' = shareToken ? 'share' : freeUsed ? 'paid' : 'free'

    if (source === 'paid' && balance < 3) {
      Taro.showToast({ title: '学习点不足，去答题赚学习点吧', icon: 'none' })
      return
    }

    setLoading(true)
    setAnimating(true)
    setOutcome(null)
    setStoppedCount(0)
    startReel()

    try {
      const data = await drawItem(source, category, shareToken)

      setOutcome(data)
      setTimeout(() => setStoppedCount(1), 1000)
      setTimeout(() => setStoppedCount(2), 1300)
      setTimeout(() => {
        setStoppedCount(3)
        stopReel()
        setAnimating(false)
        setBalance(data.balance)
        if (source === 'free') {
          setFreeUsed(true)
        }
        if (source === 'share') {
          setShareToken(undefined)
        }
        setShowModal(true)

        fetchData()
      }, 1600)
    } catch (err) {
      stopReel()
      setAnimating(false)
      setStoppedCount(0)
      const message = err instanceof Error ? err.message : '抽奖失败'

      if (source === 'free' && message.includes('免费')) {
        setFreeUsed(true)
        fetchData()
        Taro.showToast({
          title: '今日免费已用完，可消耗 3 学习点再抽',
          icon: 'none',
        })
      } else {
        Taro.showToast({ title: message, icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }

  const closeResult = () => {
    setShowModal(false)
    if (outcome?.isRepeat) {
      Taro.showToast({
        title: `已拥有，自动兑换 ${outcome.repeatPoints} 学习点`,
        icon: 'none',
      })
    }
  }

  const goToCollection = () => {
    Taro.navigateTo({ url: `/subpkg-supply/pages/collection/index?category=${category}` })
  }

  const switchTheme = (c: SupplyCategory) => {
    if (c === category) return
    setCategory(c)
  }

  const getCardImage = (item: DrawResult | PoolItem) => getCollectionImageUrl(item.imageUrl)

  const ctaText = shareToken ? '好友赠送免费抽' : freeUsed ? '3 学习点抽一次' : '免费抽一次'
  const ctaDisabled = loading || animating || (!shareToken && freeUsed && balance < 3)

  const theme = THEME_META[category]
  const rareColor = theme.rareColor
  const commonColor = '#6b7280'

  const commonItems = pool.filter((i) => i.rarity === 'common')
  const rareItems = pool.filter((i) => i.rarity === 'rare')

  const renderReel = (i: number) => {
    if (animating && i >= stoppedCount && pool.length > 0) {
      const item = pool[(reelIndex + i * 5) % pool.length]
      return (
        <Image
          className='reel-img spinning'
          src={getCardImage(item)}
          mode='aspectFit'
        />
      )
    }
    if (outcome) {
      return (
        <Image
          className='reel-img'
          src={getCardImage(outcome.item)}
          mode='aspectFit'
        />
      )
    }
    return (
      <Image className='reel-img capsule' src={capsuleImage} mode='aspectFit' />
    )
  }

  const renderPoolRow = (items: PoolItem[], groupName: string) => (
    <View className='pool-section' key={groupName}>
      <View className='pool-section-header'>
        <Text className='pool-section-title'>{groupName}</Text>
        <Text className='pool-section-count'>{items.length} {theme.unitLabel}</Text>
      </View>
      <ScrollView className='pool-row' scrollX enhanced showsHorizontalScrollIndicator={false}>
        {items.map((item) => (
          <View
            key={item.id}
            className={`pool-card ${item.collected ? '' : 'locked'}`}
          >
            {item.collected ? (
              <Image
                className='pool-card-img'
                src={getCardImage(item)}
                mode='aspectFit'
              />
            ) : (
              <Text className='pool-card-lock'>?</Text>
            )}
            <Text className='pool-card-name'>
              {item.collected ? item.name : '???'}
            </Text>
            <Text
              className='pool-card-rarity'
              style={{ color: item.collected ? (item.rarity === 'rare' ? rareColor : commonColor) : '#d1d5db' }}
            >
              {item.collected ? RARITY_LABELS[item.rarity] : '???'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <ScrollView className='supply-draw-page' scrollY>
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

      {/* 状态栏 */}
      <View className='status-bar'>
        <View className='status-card'>
          <Text className='status-label'>学习点</Text>
          <Text className='status-value'>💎 {balance}</Text>
        </View>
        <View className='status-card'>
          <Text className='status-label'>{shareToken ? '好友赠送' : '今日免费'}</Text>
          <Text className={`status-value ${freeUsed && !shareToken ? 'used' : ''}`}>
            {shareToken ? '独立 1 次' : freeUsed ? '已用完' : '剩余 1 次'}
          </Text>
        </View>
      </View>

      {/* 抽卡机 */}
      <View className='machine'>
        <View className='machine-lights'>
          {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
            <View
              key={i}
              className='light'
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </View>

        <Text className='machine-title'>{theme.drawTitle}</Text>

        <View className='machine-body'>
          <View className='reel-row'>
            {[0, 1, 2].map((i) => (
              <View className='reel-window' key={i}>
                {renderReel(i)}
              </View>
            ))}
          </View>
          <View
            className={`lever ${animating ? 'pulled' : ''}`}
            onClick={handleDraw}
          >
            <View className='lever-ball' />
            <View className='lever-stick' />
          </View>
        </View>

        <View className='machine-sticker'>
          <Text className='sticker-dot' style={{ backgroundColor: commonColor }} />
          <Text className='sticker-text'>普通 80%</Text>
          <Text className='sticker-divider'>·</Text>
          <Text className='sticker-dot' style={{ backgroundColor: rareColor }} />
          <Text className='sticker-text'>稀有 20%</Text>
        </View>

        <View className='machine-slot' />
      </View>

      {/* 抽卡按钮 */}
      <Button
        className={`draw-btn ${!shareToken && freeUsed && balance < 3 ? 'disabled' : ''}`}
        onClick={handleDraw}
        disabled={ctaDisabled}
      >
        {ctaText}
      </Button>

      {/* 图鉴入口 */}
      <View className='bag-entry' onClick={goToCollection}>
        <View className='bag-entry-left'>
          <Text className='bag-entry-title'>我的图鉴</Text>
          <Text className='bag-entry-desc'>{theme.collectionDesc}</Text>
        </View>
        <View className='bag-entry-right'>
          <Text className='bag-entry-count'>已收集 {stats.collected}/{stats.total}</Text>
          <Text className='bag-entry-arrow'>→</Text>
        </View>
      </View>

      {/* 奖池分组 */}
      <View className='pool-area'>
        {renderPoolRow(commonItems, theme.poolCommonLabel)}
        {renderPoolRow(rareItems, theme.poolRareLabel)}
      </View>

      {/* 结果弹窗 */}
      {showModal && outcome && (
        <View className='result-mask' onClick={closeResult}>
          <View className='result-card' onClick={(e) => e.stopPropagation()}>
            <Text className='result-title'>
              {outcome.isRepeat ? '重复获得' : '恭喜获得'}
            </Text>
            <Image
              className='result-img'
              src={getCardImage(outcome.item)}
              mode='aspectFit'
            />
            <Text className='result-name'>{outcome.item.name}</Text>
            <Text
              className='result-rarity'
              style={{ color: outcome.item.rarity === 'rare' ? rareColor : commonColor }}
            >
              {RARITY_LABELS[outcome.item.rarity]}
            </Text>
            {outcome.isRepeat && (
              <Text className='result-repeat'>
                已拥有，自动兑换 {outcome.repeatPoints} 学习点
              </Text>
            )}
            <Button className='result-btn' onClick={closeResult}>
              收下
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  )
}
