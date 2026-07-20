import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { request } from '@/utils/request'
import { getPetImageUrl } from '@/utils/petAssets'
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
  source: 'free' | 'paid'
}

interface PoolItem {
  id: number
  name: string
  rarity: string
  imageUrl: string
  collected: boolean
}

interface CollectionResponse {
  items: PoolItem[]
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

const LIGHT_COUNT = 7

export default function SupplyDraw() {
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
  }, [])

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
        request<{ balance: number; freeDrawUsedToday?: boolean }>({ url: '/api/supply/balance' }),
        request<CollectionResponse>({ url: '/api/supply/collection' }),
      ])
      setBalance(balanceData.balance)
      setFreeUsed(!!balanceData.freeDrawUsedToday)
      setPool(collectionData.items)
      setStats({ total: collectionData.total, collected: collectionData.collected })
    } catch (err) {
      console.error('加载补给站失败:', err)
    }
  }

  const handleDraw = async () => {
    if (loading || animating) return

    const source: 'free' | 'paid' = freeUsed ? 'paid' : 'free'

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
      const data = await request<DrawResponse>({
        url: '/api/supply/draw',
        method: 'POST',
        data: { source },
      })

      // 三个滚筒错开停止：1.0s / 1.3s / 1.6s
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
        setShowModal(true)

        // 刷新奖池收集状态与服务端免费次数
        fetchData()
      }, 1600)
    } catch (err) {
      stopReel()
      setAnimating(false)
      setStoppedCount(0)
      const message = err instanceof Error ? err.message : '抽奖失败'

      // 错误自愈：服务端告知今日免费已用完时，同步本地状态（兼容线上旧版 balance 接口）
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
    Taro.navigateTo({ url: '/subpkg-supply/pages/collection/index' })
  }

  const getPetImage = (item: DrawResult | PoolItem) => getPetImageUrl(item.imageUrl)

  const ctaText = freeUsed ? '3 学习点抽一次' : '免费抽一次'
  const ctaDisabled = loading || animating || (freeUsed && balance < 3)

  const commonItems = pool.filter((i) => i.rarity === 'common')
  const rareItems = pool.filter((i) => i.rarity === 'rare')

  // 第 i 个滚筒视窗的内容
  const renderReel = (i: number) => {
    // 滚动中且该视窗未停止：显示切换的萌宠
    if (animating && i >= stoppedCount && pool.length > 0) {
      const item = pool[(reelIndex + i * 5) % pool.length]
      return (
        <Image
          className='reel-img spinning'
          src={getPetImage(item)}
          mode='aspectFit'
        />
      )
    }
    // 有结果：显示中奖萌宠
    if (outcome) {
      return (
        <Image
          className='reel-img'
          src={getPetImage(outcome.item)}
          mode='aspectFit'
        />
      )
    }
    // 默认：胶囊
    return (
      <Image className='reel-img capsule' src={capsuleImage} mode='aspectFit' />
    )
  }

  const renderPoolRow = (items: PoolItem[], groupName: string) => (
    <View className='pool-section' key={groupName}>
      <View className='pool-section-header'>
        <Text className='pool-section-title'>{groupName}</Text>
        <Text className='pool-section-count'>{items.length} 只</Text>
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
                src={getPetImage(item)}
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
              style={{ color: item.collected ? RARITY_COLORS[item.rarity] : '#d1d5db' }}
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
      {/* 状态栏 */}
      <View className='status-bar'>
        <View className='status-card'>
          <Text className='status-label'>学习点</Text>
          <Text className='status-value'>💎 {balance}</Text>
        </View>
        <View className='status-card'>
          <Text className='status-label'>今日免费</Text>
          <Text className={`status-value ${freeUsed ? 'used' : ''}`}>
            {freeUsed ? '已用完' : '剩余 1 次'}
          </Text>
        </View>
      </View>

      {/* 抽卡机 */}
      <View className='machine'>
        {/* 顶部灯泡 */}
        <View className='machine-lights'>
          {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
            <View
              key={i}
              className='light'
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </View>

        <Text className='machine-title'>像素补给站</Text>

        {/* 滚筒 + 拉杆 */}
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

        {/* 概率贴纸 */}
        <View className='machine-sticker'>
          <Text className='sticker-dot' style={{ backgroundColor: RARITY_COLORS.common }} />
          <Text className='sticker-text'>普通 80%</Text>
          <Text className='sticker-divider'>·</Text>
          <Text className='sticker-dot' style={{ backgroundColor: RARITY_COLORS.rare }} />
          <Text className='sticker-text'>稀有 20%</Text>
        </View>

        {/* 出卡口 */}
        <View className='machine-slot' />
      </View>

      {/* 抽卡按钮 */}
      <Button
        className={`draw-btn ${freeUsed && balance < 3 ? 'disabled' : ''}`}
        onClick={handleDraw}
        disabled={ctaDisabled}
      >
        {ctaText}
      </Button>

      {/* 图鉴入口 */}
      <View className='bag-entry' onClick={goToCollection}>
        <View className='bag-entry-left'>
          <Text className='bag-entry-title'>我的图鉴</Text>
          <Text className='bag-entry-desc'>收集全部像素萌宠</Text>
        </View>
        <View className='bag-entry-right'>
          <Text className='bag-entry-count'>已收集 {stats.collected}/{stats.total}</Text>
          <Text className='bag-entry-arrow'>→</Text>
        </View>
      </View>

      {/* 奖池分组 */}
      <View className='pool-area'>
        {renderPoolRow(commonItems, '常驻伙伴')}
        {renderPoolRow(rareItems, '珍稀伙伴')}
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
              src={getPetImage(outcome.item)}
              mode='aspectFit'
            />
            <Text className='result-name'>{outcome.item.name}</Text>
            <Text
              className='result-rarity'
              style={{ color: RARITY_COLORS[outcome.item.rarity] }}
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
