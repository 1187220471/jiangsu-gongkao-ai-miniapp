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
      color: '#3b82f6',
      route: '/pages/interview/interview',
    },
    {
      title: '公考申论训练',
      subtitle: '历年真题 · 材料分析 · AI批改',
      icon: '📝',
      color: '#10b981',
      route: '/pages/shenlun/shenlun',
    },
    {
      title: '每日政务要闻',
      subtitle: '江苏政务 · AI精选 · 备考积累',
      icon: '📰',
      color: '#f59e0b',
      route: '/pages/news/news',
    },
  ]

  const handleNavigate = (route: string) => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
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
        {/* Header */}
        <View className='header'>
          <Text className='title'>🐻 江苏公考AI智能训练</Text>
          <Text className='subtitle'>面试 · 申论 · 时政 三大模块</Text>
        </View>

        {/* 登录状态 */}
        {!isLoggedIn ? (
          <View className='login-section'>
            <Text className='login-tip'>登录后即可开始训练</Text>
            <Button className='login-btn' onClick={handleLogin}>
              微信一键登录
            </Button>
          </View>
        ) : (
          <View className='user-section'>
            <Text className='welcome'>你好，{user?.nickname || user?.username || '用户'}</Text>
            <Text className='logout' onClick={logout}>退出登录</Text>
          </View>
        )}

        {/* 模块卡片 */}
        <View className='modules'>
          {modules.map((module) => (
            <View
              key={module.route}
              className='module-card'
              style={{ borderLeftColor: module.color }}
              onClick={() => handleNavigate(module.route)}
            >
              <Text className='module-icon' style={{ color: module.color }}>
                {module.icon}
              </Text>
              <View className='module-info'>
                <Text className='module-title'>{module.title}</Text>
                <Text className='module-subtitle'>{module.subtitle}</Text>
              </View>
              <Text className='module-arrow'>→</Text>
            </View>
          ))}
        </View>

        {/* 底部信息 */}
        <View className='footer'>
          <Text className='footer-text'>江苏公考AI · 助你上岸</Text>
        </View>
      </View>
    </AuthContext.Provider>
  )
}
