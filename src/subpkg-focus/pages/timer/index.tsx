import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { startFocus, endFocus, fetchTodayFocus, type FocusDuration } from '@/utils/focus'
import pandaReading from '@/assets/images/panda-reading-120.png'
import { getPetImageUrl } from '@/utils/petAssets'
import { fetchSupplyBalance } from '@/utils/supply'
import './index.scss'

type Phase = 'select' | 'focusing' | 'completed'
const BG_TOLERANCE_MS = 5 * 60 * 1000 // 切后台 5 分钟容差

export default function FocusTimer() {
  const [phase, setPhase] = useState<Phase>('select')
  const [duration, setDuration] = useState<FocusDuration | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0) // 秒
  const [equipped, setEquipped] = useState<{ id: number; name: string; imageUrl: string; rarity: string } | null>(null)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [result, setResult] = useState<{ pointsAwarded: number; status: string } | null>(null)
  const [showLeavePrompt, setShowLeavePrompt] = useState(false)

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const backgroundAtRef = useRef<number | null>(null)

  useEffect(() => {
    loadInitial()
    return () => stopTicker()
  }, [])

  // 切后台检测
  useDidHide(() => {
    if (phase === 'focusing' && startedAt) {
      backgroundAtRef.current = Date.now()
    }
  })

  useDidShow(() => {
    if (phase === 'focusing' && backgroundAtRef.current) {
      const elapsed = Date.now() - backgroundAtRef.current
      if (elapsed >= BG_TOLERANCE_MS) {
        setShowLeavePrompt(true)
      }
      backgroundAtRef.current = null
    }
  })

  const stopTicker = () => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current)
      tickerRef.current = null
    }
  }

  const loadInitial = async () => {
    try {
      const [bal, today] = await Promise.all([fetchSupplyBalance(), fetchTodayFocus()])
      if (bal.equippedItem) setEquipped(bal.equippedItem)
      setTodayMinutes(today.totalMinutes || 0)
    } catch (err) {
      console.error('加载专注页失败:', err)
    }
  }

  const startTicker = () => {
    stopTicker()
    tickerRef.current = setInterval(() => {
      if (!startedAt || !duration) return
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000)
      const totalSec = duration * 60
      const left = Math.max(0, totalSec - elapsedSec)
      setRemaining(left)
      if (left <= 0) {
        stopTicker()
        handleComplete()
      }
    }, 1000)
  }

  const handleSelect = async (d: FocusDuration) => {
    try {
      Taro.showLoading({ title: '准备中...', mask: true })
      const res = await startFocus(d)
      setSessionId(res.sessionId)
      setStartedAt(new Date(res.startedAt).getTime())
      setDuration(d)
      setRemaining(d * 60)
      setPhase('focusing')
      startTicker()
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '开始失败',
        icon: 'none',
      })
    } finally {
      Taro.hideLoading()
    }
  }

  const handleComplete = async () => {
    if (!sessionId) return
    stopTicker()
    try {
      const res = await endFocus(sessionId, 'complete')
      setResult({ pointsAwarded: res.pointsAwarded, status: res.status })
      setPhase('completed')
      Taro.showToast({
        title: res.status === 'cheated' ? '时长不足，未获得学习点' : `专注完成 +${res.pointsAwarded} 学习点`,
        icon: 'none',
        duration: 2000,
      })
    } catch (err) {
      Taro.showToast({ title: '结束失败', icon: 'none' })
    }
  }

  const handleAbandon = async () => {
    if (!sessionId) return
    try {
      const confirmed = await Taro.showModal({
        title: '放弃本次专注？',
        content: '当前时长未达标，将不会获得学习点。',
        confirmText: '放弃',
        cancelText: '继续',
        confirmColor: '#dc2626',
      })
      if (!confirmed.confirm) return

      stopTicker()
      await endFocus(sessionId, 'abandon')
      Taro.showToast({ title: '已放弃', icon: 'none' })
      Taro.navigateBack()
    } catch (err) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleLeaveContinue = () => {
    setShowLeavePrompt(false)
    backgroundAtRef.current = null
  }

  const handleLeaveAbandon = async () => {
    setShowLeavePrompt(false)
    await handleAbandon()
  }

  const handleFinish = () => {
    Taro.navigateBack()
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const totalSec = (duration || 30) * 60
  const progress = duration ? Math.min(1, (totalSec - remaining) / totalSec) : 0

  return (
    <View className='focus-page'>
      {phase === 'select' && (
        <View className='select-phase'>
          <Text className='page-title'>选择专注时长</Text>

          <View className='mascot-card'>
            {equipped ? (
              <View className={`mascot-img-wrap ${equipped.rarity === 'rare' ? 'rare-shimmer' : ''}`}>
                <View className='mascot-img' style={{ backgroundImage: `url(${getPetImageUrl(equipped.imageUrl)})` }} />
              </View>
            ) : (
              <View className='mascot-img-wrap'>
                <View className='mascot-img' style={{ backgroundImage: `url(${pandaReading})` }} />
              </View>
            )}
            <Text className='mascot-hint'>
              {equipped ? `和 ${equipped.name} 一起专注` : '和默认熊猫一起专注'}
            </Text>
            <Text className='today-stat'>今日已专注 {todayMinutes} 分钟</Text>
          </View>

          <View className='duration-cards'>
            <View className='duration-card' onClick={() => handleSelect(30)}>
              <Text className='duration-num'>30</Text>
              <Text className='duration-unit'>分钟</Text>
              <View className='reward-tag'>
                <Text className='reward-text'>+2 学习点</Text>
              </View>
            </View>
            <View className='duration-card duration-card-primary' onClick={() => handleSelect(60)}>
              <Text className='duration-num'>60</Text>
              <Text className='duration-unit'>分钟</Text>
              <View className='reward-tag reward-tag-primary'>
                <Text className='reward-text'>+4 学习点</Text>
              </View>
            </View>
          </View>

          <Text className='hint-text'>专注期间切后台超过 5 分钟将被提示放弃</Text>
        </View>
      )}

      {phase === 'focusing' && (
        <View className='focusing-phase'>
          <View className='focus-mascot-wrap'>
            {equipped ? (
              <View className={`focus-mascot ${equipped.rarity === 'rare' ? 'rare-shimmer' : ''}`} style={{ backgroundImage: `url(${getPetImageUrl(equipped.imageUrl)})` }} />
            ) : (
              <View className='focus-mascot' style={{ backgroundImage: `url(${pandaReading})` }} />
            )}
          </View>

          <View className='countdown-ring'>
            <View className='ring-bg' />
            <View
              className='ring-fill'
              style={{
                background: `conic-gradient(#3b82f6 ${progress * 360}deg, transparent ${progress * 360}deg)`,
              }}
            />
            <View className='ring-inner'>
              <Text className='countdown-time'>{formatTime(remaining)}</Text>
              <Text className='countdown-label'>{duration} 分钟专注中</Text>
            </View>
          </View>

          <Button className='abandon-btn' onClick={handleAbandon}>
            放弃本次专注
          </Button>
        </View>
      )}

      {phase === 'completed' && result && (
        <View className='completed-phase'>
          <View className='completed-card'>
            <Text className='completed-emoji'>{result.status === 'cheated' ? '⚠️' : '🎉'}</Text>
            <Text className='completed-title'>
              {result.status === 'cheated' ? '时长未达标' : '专注完成'}
            </Text>
            <Text className='completed-points'>
              {result.status === 'cheated' ? '本次未获得学习点' : `+${result.pointsAwarded} 学习点`}
            </Text>
            <Text className='completed-hint'>
              {result.status === 'cheated' ? '请坚持完成 30/60 分钟专注' : '继续加油！'}
            </Text>
            <Button className='completed-btn' onClick={handleFinish}>
              返回
            </Button>
          </View>
        </View>
      )}

      {showLeavePrompt && (
        <View className='leave-overlay'>
          <View className='leave-modal'>
            <Text className='leave-title'>检测到长时间离开</Text>
            <Text className='leave-desc'>已离开超过 5 分钟，是否放弃本次专注？</Text>
            <View className='leave-actions'>
              <View className='leave-btn leave-btn-cancel' onClick={handleLeaveContinue}>
                <Text className='leave-btn-text'>继续</Text>
              </View>
              <View className='leave-btn leave-btn-confirm' onClick={handleLeaveAbandon}>
                <Text className='leave-btn-text leave-btn-text-white'>放弃</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
