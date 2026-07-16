import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, createContext, useContext } from 'react'
import './index.scss'

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

  const modules = [
    {
      title: '公考面试训练',
      subtitle: 'AI出题 · 语音答题 · 智能批改',
      icon: '🎤',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      stats: '200+真题',
      route: '/pages/interview/interview',
    },
    {
      title: '公考申论训练',
      subtitle: '历年真题 · 材料分析 · AI批改',
      icon: '📝',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      stats: '97道题目',
      route: '/pages/shenlun/shenlun',
    },
    {
      title: '每日政务要闻',
      subtitle: '江苏政务 · AI精选 · 备考积累',
      icon: '📰',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      stats: '每日更新',
      route: '/pages/news/news',
    },
  ]

  const handleNavigate = (route: string) => {
    Taro.switchTab({ url: route })
  }

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
        {/* 顶部横幅 */}
        <View className='hero-banner'>
          <View className='hero-content'>
            <Text className='hero-title'>申面智能小助手</Text>
            <Text className='hero-subtitle'>面试 · 申论 · 时政 智能训练平台</Text>
          </View>
          
          {/* 登录状态 */}
          {!isLoggedIn ? (
            <View className='login-bar'>
              <Text className='login-bar-text'>登录后同步训练记录</Text>
              <Button className='login-bar-btn' onClick={handleLogin}>
                微信登录
              </Button>
            </View>
          ) : (
            <View className='user-bar'>
              <Text className='user-welcome'>你好，{user?.nickname || user?.username || '同学'}</Text>
              <Text className='user-logout' onClick={logout}>退出</Text>
            </View>
          )}
        </View>

        {/* 模块卡片 */}
        <View className='modules-section'>
          <Text className='section-title'>训练模块</Text>
          <View className='modules-grid'>
            {modules.map((module) => (
              <View
                key={module.route}
                className='module-card'
                style={{ background: module.gradient }}
                onClick={() => handleNavigate(module.route)}
              >
                <View className='module-card-header'>
                  <View className='module-icon-bg'>
                    <Text className='module-icon-text'>{module.icon}</Text>
                  </View>
                  <View className='module-stats-badge'>
                    <Text className='module-stats-text'>{module.stats}</Text>
                  </View>
                </View>
                <Text className='module-card-title'>{module.title}</Text>
                <Text className='module-card-subtitle'>{module.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 平台数据 */}
        <View className='platform-stats'>
          <Text className='stats-section-title'>平台数据</Text>
          <View className='stats-row'>
            <View className='stats-item'>
              <Text className='stats-num'>200+</Text>
              <Text className='stats-label'>面试真题</Text>
            </View>
            <View className='stats-item'>
              <Text className='stats-num'>97</Text>
              <Text className='stats-label'>申论题目</Text>
            </View>
            <View className='stats-item'>
              <Text className='stats-num'>AI</Text>
              <Text className='stats-label'>智能批改</Text>
            </View>
            <View className='stats-item'>
              <Text className='stats-num'>7</Text>
              <Text className='stats-label'>面试题型</Text>
            </View>
          </View>
        </View>

        {/* 底部信息 */}
        <View className='footer'>
          <Text className='footer-text'>申面智能小助手 · 助你上岸</Text>
        </View>
      </View>
    </AuthContext.Provider>
  )
}
