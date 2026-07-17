import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, createContext, useContext } from 'react'
import './index.scss'
import iconMicrophone from '../../assets/icons/microphone.png'
import iconScroll from '../../assets/icons/scroll.png'
import iconNewspaper from '../../assets/icons/newspaper.png'
import iconClock from '../../assets/icons/clock.png'
import pandaReading from '../../assets/images/panda-reading-120.png'
import pandaWriting from '../../assets/images/panda-writing-120.png'
import pandaThumbsup from '../../assets/images/panda-thumbsup-120.png'
import { getDailyTask, getTaskHint } from '../../utils/dailyTask'
import type { DailyTaskState } from '../../utils/dailyTask'

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
  const [dailyTask, setDailyTask] = useState<DailyTaskState>({ count: 0, total: 3, completed: false, date: '', progress: 0 })

  // 检查本地登录状态 + 每日任务
  useEffect(() => {
    const storedToken = Taro.getStorageSync('token')
    const storedUser = Taro.getStorageSync('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      setIsLoggedIn(true)
    }
    setDailyTask(getDailyTask())
    setLoading(false)
  }, [])

  // 根据完成任务数切换 mascot
  const pandaMascot = dailyTask.count >= 3 ? pandaThumbsup : dailyTask.count >= 1 ? pandaWriting : pandaReading

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
      color: '#f3f4f6',
      textColor: '#4b5563',
      stats: '200+真题',
      route: '/pages/interview/interview',
      isTab: true,
    },
    {
      title: '申论真题训练',
      icon: iconScroll,
      color: '#f3f4f6',
      textColor: '#4b5563',
      stats: '97题',
      route: '/pages/shenlun/shenlun',
      isTab: true,
    },
    {
      title: '每日政务要闻',
      icon: iconNewspaper,
      color: '#f3f4f6',
      textColor: '#4b5563',
      stats: '每日更新',
      route: '/pages/news/news',
      isTab: true,
    },
    {
      title: '练习记录',
      icon: iconClock,
      color: '#f3f4f6',
      textColor: '#4b5563',
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

          <View className='hero-body'>
            <Image className='hero-mascot' src={pandaMascot} mode='aspectFit' />
            <View className='hero-info'>
              <View className='streak-badge'>
                <Text className='streak-text'>连续打卡 1 天</Text>
              </View>
              <View className='hero-stats-row'>
                <View className='hero-stat-mini'>
                  <Text className='hero-stat-num'>{dailyTask.count}</Text>
                  <Text className='hero-stat-label'>今日练习</Text>
                </View>
                <View className='hero-stat-mini'>
                  <Text className='hero-stat-num'>{dailyTask.progress}%</Text>
                  <Text className='hero-stat-label'>今日目标</Text>
                </View>
              </View>
            </View>
          </View>

          <View className='progress-track'>
            <View className='progress-fill' style={{ width: `${dailyTask.progress}%` }} />
          </View>

          <Text className='task-hint'>{getTaskHint(dailyTask.count)}</Text>

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
