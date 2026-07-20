import { View, Text, Button, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './profile.scss'
import { fetchSupplyBalance } from '../../utils/supply'

interface UserProfile {
  user: {
    id: string
    username: string
    nickname: string
    createdAt: string
  }
  access: {
    hasAccess: boolean
    accessLevel: string
    accessExpire: string | null
    remainingFree: number
  }
  stats: {
    totalPractices: number
    avgScore: number | null
  }
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [bindCode, setBindCode] = useState('')
  const [bindLoading, setBindLoading] = useState(false)
  const [bindMessage, setBindMessage] = useState('')
  const [bindError, setBindError] = useState('')
  const [showBindCard, setShowBindCard] = useState(false)
  const [supplyBalance, setSupplyBalance] = useState(0)

  useEffect(() => {
    loadProfile()
    loadSupplyBalance()
  }, [])

  const loadSupplyBalance = () => {
    const token = Taro.getStorageSync('token')
    if (!token) return
    fetchSupplyBalance()
      .then((data) => setSupplyBalance(data.balance))
      .catch((err) => console.error('获取学习点失败:', err))
  }

  const loadProfile = () => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      setProfile(null)
      return
    }
    setLoading(true)
    Taro.request({
      url: 'https://www.mianshidati.xyz/api/profile',
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        if (res.data && res.data.user) {
          setProfile(res.data)
        } else {
          setProfile(null)
        }
      },
      fail: () => {
        setProfile(null)
      },
      complete: () => {
        setLoading(false)
      },
    })
  }

  const handleLogin = () => {
    setLoading(true)
    Taro.login({
      success: (res) => {
        if (res.code) {
          Taro.request({
            url: 'https://www.mianshidati.xyz/api/auth/wechat-login',
            method: 'POST',
            data: { code: res.code },
            success: (loginRes) => {
              if (loginRes.data && loginRes.data.token) {
                Taro.setStorageSync('token', loginRes.data.token)
                Taro.setStorageSync('user', loginRes.data.user)
                loadProfile()
                loadSupplyBalance()
                Taro.showToast({ title: '登录成功', icon: 'success' })
              } else {
                Taro.showToast({
                  title: loginRes.data?.error || '登录失败',
                  icon: 'none',
                })
              }
            },
            fail: () => {
              Taro.showToast({ title: '登录失败', icon: 'none' })
            },
            complete: () => {
              setLoading(false)
            },
          })
        } else {
          setLoading(false)
          Taro.showToast({ title: '获取微信 code 失败', icon: 'none' })
        }
      },
      fail: () => {
        setLoading(false)
        Taro.showToast({ title: '登录失败', icon: 'none' })
      },
    })
  }

  const handleLogout = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    setProfile(null)
    setShowBindCard(false)
    Taro.showToast({ title: '已退出登录', icon: 'success' })
  }

  const handleBind = () => {
    setBindMessage('')
    setBindError('')

    if (!bindCode.trim()) {
      setBindError('请输入绑定码')
      return
    }

    const token = Taro.getStorageSync('token')
    if (!token) {
      setBindError('请先登录小程序')
      return
    }

    setBindLoading(true)
    Taro.request({
      url: 'https://www.mianshidati.xyz/api/auth/bind-wechat',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        token: bindCode.trim().toUpperCase(),
      },
      success: (res) => {
        if (res.data && res.data.message) {
          setBindMessage('绑定成功，请退出重新登录以同步 Web 账号权限')
          setBindCode('')
          Taro.showToast({ title: '绑定成功', icon: 'success' })
        } else {
          setBindError(res.data?.error || '绑定失败')
        }
      },
      fail: () => {
        setBindError('网络错误，请稍后重试')
      },
      complete: () => {
        setBindLoading(false)
      },
    })
  }

  const getMemberLabel = () => {
    if (!profile) return '未登录'
    if (profile.access.hasAccess) {
      if (profile.access.accessLevel === 'year') return '年度会员'
      if (profile.access.accessLevel === 'month') return '月度会员'
      return '会员'
    }
    return '普通用户'
  }

  const getMemberColor = () => {
    if (!profile) return '#9ca3af'
    if (profile.access.hasAccess) return '#f59e0b'
    return '#9ca3af'
  }

  const getQuotaText = () => {
    if (!profile) return ''
    if (profile.access.hasAccess) return '无限额度'
    return `今日剩余 ${profile.access.remainingFree} 点`
  }

  const getQuotaPercent = () => {
    if (!profile) return 0
    if (profile.access.hasAccess) return 100
    return Math.min(100, (profile.access.remainingFree / 5) * 100)
  }

  if (loading) {
    return (
      <View className='profile'>
        <View className='loading'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView scrollY className='profile-scroll'>
      <View className='profile'>
        {/* 顶部用户信息卡片 */}
        <View className='user-header'>
          <View className='user-header-content'>
            <View className='avatar'>
              <Text className='avatar-text'>{profile ? '🐻' : '👤'}</Text>
            </View>
            <View className='user-meta'>
              <Text className='nickname'>
                {profile ? profile.user.nickname || profile.user.username : '未登录'}
              </Text>
              <View className='member-tag' style={{ backgroundColor: getMemberColor() + '20', borderColor: getMemberColor() }}>
                <Text className='member-tag-text' style={{ color: getMemberColor() }}>
                  {getMemberLabel()}
                </Text>
              </View>
              {profile ? (
                <Text className='join-date'>加入时间：{profile.user.createdAt}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {profile ? (
          <>
            {/* 额度信息 */}
            <View className='section-card'>
              <View className='section-header'>
                <Text className='section-icon'>💎</Text>
                <Text className='section-title'>额度信息</Text>
              </View>
              <View className='quota-bar'>
                <View className='quota-progress-bg'>
                  <View
                    className='quota-progress-fill'
                    style={{ width: `${getQuotaPercent()}%`, backgroundColor: profile.access.hasAccess ? '#10b981' : '#3b82f6' }}
                  />
                </View>
                <Text className='quota-text'>{getQuotaText()}</Text>
              </View>
              {profile.access.hasAccess && profile.access.accessExpire ? (
                <Text className='expire-text'>有效期至：{profile.access.accessExpire}</Text>
              ) : null}
            </View>

            {/* 使用统计 */}
            <View className='section-card'>
              <View className='section-header'>
                <Text className='section-icon'>📊</Text>
                <Text className='section-title'>使用统计</Text>
              </View>
              <View className='stats-grid'>
                <View className='stat-item'>
                  <Text className='stat-value'>{profile.stats.totalPractices}</Text>
                  <Text className='stat-label'>练习次数</Text>
                </View>
                <View className='stat-item'>
                  <Text className='stat-value'>
                    {profile.stats.avgScore ? `${profile.stats.avgScore}分` : '—'}
                  </Text>
                  <Text className='stat-label'>平均得分</Text>
                </View>
              </View>
            </View>

            {/* 学习激励 */}
            <View className='section-card'>
              <View className='section-header'>
                <Text className='section-icon'>🎁</Text>
                <Text className='section-title'>学习激励</Text>
              </View>
              <View className='points-overview'>
                <Text className='points-overview-value'>{supplyBalance}</Text>
                <Text className='points-overview-label'>学习点</Text>
              </View>
              <View className='menu-list'>
                <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/subpkg-supply/pages/draw/index' })}>
                  <Text className='menu-icon'>🎲</Text>
                  <Text className='menu-text'>补给站</Text>
                  <Text className='menu-arrow'>›</Text>
                </View>
                <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/subpkg-supply/pages/collection/index' })}>
                  <Text className='menu-icon'>🐱</Text>
                  <Text className='menu-text'>我的图鉴</Text>
                  <Text className='menu-arrow'>›</Text>
                </View>
              </View>
            </View>

            {/* 功能入口 */}
            <View className='section-card'>
              <View className='section-header'>
                <Text className='section-icon'>🧭</Text>
                <Text className='section-title'>功能入口</Text>
              </View>
              <View className='menu-list'>
                <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/subpkg-history/pages/list/index' })}>
                  <Text className='menu-icon'>📝</Text>
                  <Text className='menu-text'>练习记录</Text>
                  <Text className='menu-arrow'>›</Text>
                </View>
                <View className='menu-item' onClick={() => setShowBindCard(!showBindCard)}>
                  <Text className='menu-icon'>🔗</Text>
                  <Text className='menu-text'>绑定 Web 账号</Text>
                  <Text className='menu-arrow'>›</Text>
                </View>
              </View>
            </View>

            {/* 绑定 Web 账号 */}
            {showBindCard ? (
              <View className='section-card bind-card'>
                <Text className='bind-desc'>在网页端个人中心生成绑定码，输入后小程序即可享受 Web 账号权限</Text>
                <Input
                  className='bind-input'
                  value={bindCode}
                  onInput={(e) => setBindCode(e.detail.value)}
                  placeholder='请输入绑定码'
                  maxLength={32}
                />
                <Button className='bind-btn' onClick={handleBind} loading={bindLoading}>
                  {bindLoading ? '绑定中...' : '确认绑定'}
                </Button>
                {bindError ? (
                  <Text className='error-text'>{bindError}</Text>
                ) : null}
                {bindMessage ? (
                  <Text className='success-text'>{bindMessage}</Text>
                ) : null}
              </View>
            ) : null}

            {/* 退出登录 */}
            <Button className='logout-btn' onClick={handleLogout}>
              退出登录
            </Button>
          </>
        ) : (
          <Button className='login-btn' onClick={handleLogin} loading={loading}>
            {loading ? '登录中...' : '微信一键登录'}
          </Button>
        )}
      </View>
    </ScrollView>
  )
}
