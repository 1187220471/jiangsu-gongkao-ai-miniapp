import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, createContext, useContext } from 'react'
import './index.scss'
import iconMicrophone from '../../assets/icons/microphone.png'
import iconScroll from '../../assets/icons/scroll.png'
import iconNewspaper from '../../assets/icons/newspaper.png'
import iconClock from '../../assets/icons/clock.png'

// 全局登录状态
interface AuthContextType {
  isLoggedIn: boolean
  user: { id: string; username: string; nickname: string | null } | null
  token: string | null
  login: (token: string, user: any) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 检查本地登录状态
  useEffect(() => {
    const storedToken = Taro.getStorageSync('token')
    const storedUser = Taro.getStorageSync('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, newUser: any) => {
    Taro.setStorageSync('token', newToken)
    Taro.setStorageSync('user', newUser)
    setToken(newToken)
    setUser(newUser)
    setIsLoggedIn(true)
  }

  const logout = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    setToken(null)
    setUser(null)
    setIsLoggedIn(false)
  }

  const handleLogin = async () => {
    try {
      const { code } = await Taro.login()
      console.log('获取到 code:', code)

      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/auth/wechat-login',
        method: 'POST',
        data: { code },
      })

      console.log('后端返回:', res.data)

      if (res.data.token) {
        login(res.data.token, res.data.user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
      } else {
        console.error('登录失败:', res.data)
        Taro.showToast({ title: res.data.error || '登录失败', icon: 'none' })
      }
    } catch (err) {
      console.error('登录失败:', err)
      Taro.showToast({ title: '登录失败', icon: 'none' })
    }
  }

  const handleNavigate = (route: string, isTab: boolean) => {
    if (isTab) {
      Taro.switchTab({ url: route })
    } else {
      Taro.navigateTo({ url: route })
    }
  }

  const handleStartPractice = () => {
    Taro.switchTab({ url: '/pages/interview/interview' })
  }

  const modules = [
    {
      title: 'AI 面试训练',
      icon: iconMicrophone,
      color: '#eff6ff',
      textColor: '#2563eb',
      stats: '200+真题',
      route: '/pages/interview/interview',
      isTab: true,
    },
    {
      title: '申论真题训练',
      icon: iconScroll,
      color: '#f0fdf4',
      textColor: '#16a34a',
      stats: '97题',
      route: '/pages/shenlun/shenlun',
      isTab: true,
    },
    {
      title: '每日政务要闻',
      icon: iconNewspaper,
      color: '#fffbeb',
      textColor: '#d97706',
      stats: '每日更新',
      route: '/pages/news/news',
      isTab: true,
    },
    {
      title: '练习记录',
      icon: iconClock,
      color: '#faf5ff',
      textColor: '#9333ea',
      stats: '查看历史',
      route: '/subpkg-history/pages/list/index',
      isTab: false,
    },
  ]

  const stats = [
    { num: '200+', label: '面试真题' },
    { num: '97', label: '申论题目' },
    { num: '7', label: '面试题型' },
    { num: 'AI', label: '智能批改' },
  ]

  if (loading) {
    return (
      <View className='index'>
        <View className='loading'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
      <View className='index'>
        {/* 顶部 Hero 卡片 */}
        <View className='hero-card'>
          <View className='hero-header'>
            <View className='hero-brand'>
              <Text className='hero-title'>申面智能小助手</Text>
              <Text className='hero-subtitle'>你的个人备考助手</Text>
            </View>
            {!isLoggedIn ? (
              <Button className='login-pill' onClick={handleLogin}>
                登录
              </Button>
            ) : (
              <View className='user-pill'>
                <Text className='user-pill-text'>{user?.nickname || user?.username || '我'}</Text>
              </View>
            )}
          </View>

          <View className='today-stats'>
            <View className='today-stat'>
              <Text className='today-stat-num'>0</Text>
              <Text className='today-stat-label'>今日练习</Text>
            </View>
            <View className='today-stat'>
              <Text className='today-stat-num'>1</Text>
              <Text className='today-stat-label'>连续打卡</Text>
            </View>
          </View>

          <View className='progress-area'>
            <View className='progress-labels'>
              <Text className='progress-title'>今日目标</Text>
              <Text className='progress-value'>0%</Text>
            </View>
            <View className='progress-track'>
              <View className='progress-fill' style={{ width: '0%' }} />
            </View>
            <Text className='progress-hint'>完成 1 道练习即可达成目标</Text>
          </View>

          <Button className='start-btn' onClick={handleStartPractice}>
            开始练习
          </Button>
        </View>

        {/* 训练模块 */}
        <View className='section'>
          <Text className='section-title'>训练模块</Text>
          <View className='modules-grid'>
            {modules.map((module) => (
              <View
                key={module.route}
                className='module-card'
                onClick={() => handleNavigate(module.route, module.isTab)}
              >
                <View className='module-card-main'>
                  <View className='module-icon' style={{ background: module.color }}>
                    <Image className='module-icon-img' src={module.icon} mode='aspectFit' />
                  </View>
                  <View className='module-card-info'>
                    <Text className='module-card-title'>{module.title}</Text>
                    <Text className='module-card-stats' style={{ color: module.textColor }}>
                      {module.stats}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 数据概览 */}
        <View className='section'>
          <Text className='section-title'>数据概览</Text>
          <View className='stats-grid'>
            {stats.map((stat) => (
              <View key={stat.label} className='stat-card'>
                <Text className='stat-num'>{stat.num}</Text>
                <Text className='stat-label'>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 底部 */}
        <View className='footer'>
          <Text className='footer-text'>个人备考工具 · 非经营性</Text>
        </View>
      </View>
    </AuthContext.Provider>
  )
}
