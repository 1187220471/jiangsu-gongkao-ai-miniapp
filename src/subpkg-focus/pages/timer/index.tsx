import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { startFocus, endFocus, fetchTodayFocus, fetchActiveFocus, type FocusDuration } from '@/utils/focus'
import pandaReading from '@/assets/images/panda-reading-120.png'
import { getPetImageUrl } from '@/utils/petAssets'
import { fetchSupplyBalance } from '@/utils/supply'
import './index.scss'

type Phase = 'select' | 'focusing' | 'completed'
const BG_TOLERANCE_MS = 5 * 60 * 1000

export default function FocusTimer() {
  const [phase, setPhase] = useState<Phase>('select')
  const [duration, setDuration] = useState<FocusDuration | null>(null) // 仅用于显示
  const [remaining, setRemaining] = useState(0)
  const [equipped, setEquipped] = useState<{ id: number; name: string; imageUrl: string; rarity: string } | null>(null)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [result, setResult] = useState<{ pointsAwarded: number; status: string } | null>(null)
  const [showLeavePrompt, setShowLeavePrompt] = useState(false)
  const [staleActive, setStaleActive] = useState<{ sessionId: number; duration: number; elapsedSeconds: number } | null>(null)
  const [abandoning, setAbandoning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const backgroundAtRef = useRef<number | null>(null)
  // 用 ref 存关键值，解决 ticker 闭包捕获旧 state 的问题
  const startedAtRef = useRef<number | null>(null)
  const durationRef = useRef<number | null>(null)
  const pausedRemainingRef = useRef<number>(0)
  const sessionIdRef = useRef<number | null>(null)

  useEffect(() => {
    loadInitial()
    return () => stopTicker()
  }, [])

  // 切后台检测
  useDidHide(() => {
    if (phase === 'focusing' && !isPaused && startedAtRef.current) {
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
      const [bal, today, activeRes] = await Promise.all([fetchSupplyBalance(), fetchTodayFocus(), fetchActiveFocus()])
      if (bal.equippedItem) setEquipped(bal.equippedItem)
      setTodayMinutes(today.totalMinutes || 0)
      if (activeRes.active) {
        setStaleActive(activeRes.active)
      }
    } catch (err) {
      console.error('加载专注页失败:', err)
    }
  }

  /**
   * 启动倒计时 ticker——每秒用 ref 计算剩余，不再依赖 state 闭包
   */
  const startTicker = () => {
    stopTicker()
    tickerRef.current = setInterval(() => {
      const sa = startedAtRef.current
      const d = durationRef.current
      if (!sa || !d) return
      const elapsedSec = Math.floor((Date.now() - sa) / 1000)
      const totalSec = d * 60
      const left = Math.max(0, totalSec - elapsedSec)
      setRemaining(left)
      if (left <= 0) {
        stopTicker()
        handleComplete()
      }
    }, 1000)
  }

  /**
   * 新建专注：调 start API → 设置 ref + state → 切 focusing → 启动 ticker
   */
  const handleSelect = async (d: FocusDuration) => {
    try {
      Taro.showLoading({ title: '准备中...', mask: true })
      const res = await startFocus(d)
      const sa = new Date(res.startedAt).getTime()
      sessionIdRef.current = res.sessionId
      startedAtRef.current = sa
      durationRef.current = d
      setDuration(d)
      setRemaining(d * 60)
      setIsPaused(false)
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

  /**
   * 完成专注：停止 ticker → 调 end API
   */
  const handleComplete = async () => {
    const sid = sessionIdRef.current
    if (!sid) return
    stopTicker()
    try {
      const res = await endFocus(sid, 'complete')
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

  // ---- 暂停 / 继续 ----
  const handlePause = () => {
    stopTicker()
    pausedRemainingRef.current = remaining
    setIsPaused(true)
  }

  const handleResume = () => {
    if (!durationRef.current) return
    // 用 pausedRemaining 反推虚拟 startedAt，保持倒计时连续
    const totalSec = durationRef.current * 60
    const newStartAt = Date.now() - (totalSec - pausedRemainingRef.current) * 1000
    startedAtRef.current = newStartAt
    setRemaining(pausedRemainingRef.current)
    setIsPaused(false)
    startTicker()
  }

  // ---- 遗留 session 处理 ----
  const handleResumeStale = () => {
    if (!staleActive) return
    const sid = staleActive.sessionId
    const d = staleActive.duration as FocusDuration
    const totalSec = d * 60
    const left = Math.max(0, totalSec - staleActive.elapsedSeconds)
    const sa = Date.now() - staleActive.elapsedSeconds * 1000

    sessionIdRef.current = sid
    startedAtRef.current = sa
    durationRef.current = d
    setDuration(d)
    setRemaining(left)
    setIsPaused(false)
    setStaleActive(null)
    setPhase('focusing')
    startTicker()
  }

  const handleAbandonStale = async () => {
    if (!staleActive || abandoning) return
    setAbandoning(true)
    try {
      await endFocus(staleActive.sessionId, 'abandon')
      setStaleActive(null)
      Taro.showToast({ title: '已放弃上次专注', icon: 'none' })
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '操作失败',
        icon: 'none',
      })
    } finally {
      setAbandoning(false)
    }
  }

  // ---- 专注中放弃 ----
  const handleAbandon = async () => {
    const sid = sessionIdRef.current
    if (!sid) return
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
      await endFocus(sid, 'abandon')
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
          {staleActive ? (
            <View className='stale-prompt'>
              <Text className='stale-emoji'>⏱️</Text>
              <Text className='stale-title'>有一场未结束的专注</Text>
              <Text className='stale-desc'>
                上次发起了 {staleActive.duration} 分钟专注，已过去 {Math.floor(staleActive.elapsedSeconds / 60)} 分钟。
              </Text>
              <Text className='stale-desc'>你可以继续本次专注，或放弃后开启新的。</Text>
              <View className='stale-actions'>
                <View className='stale-two-btns'>
                  <Button className='stale-btn stale-btn-resume' onClick={handleResumeStale}>
                    继续专注
                  </Button>
                  <Button
                    className='stale-btn stale-btn-abandon'
                    onClick={handleAbandonStale}
                    loading={abandoning}
                    disabled={abandoning}
                  >
                    放弃本次专注
                  </Button>
                </View>
              </View>
            </View>
          ) : (
            <>
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
            </>
          )}
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
              <Text className='countdown-label'>
                {isPaused ? '已暂停' : `${duration} 分钟专注中`}
              </Text>
            </View>
          </View>

          <View className='focus-actions'>
            {isPaused ? (
              <Button className='focus-btn focus-btn-primary' onClick={handleResume}>
                继续专注
              </Button>
            ) : (
              <Button className='focus-btn' onClick={handlePause}>
                暂停
              </Button>
            )}
            <Button className='focus-btn focus-btn-danger' onClick={handleAbandon}>
              放弃
            </Button>
          </View>
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
