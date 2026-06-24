import { View, Text, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './profile.scss'

export default function Profile() {
  const [user, setUser] = useState<{ id: string; username: string; nickname: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [bindCode, setBindCode] = useState('')
  const [bindLoading, setBindLoading] = useState(false)
  const [bindMessage, setBindMessage] = useState('')
  const [bindError, setBindError] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = () => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      setUser(null)
      return
    }
    setLoading(true)
    Taro.request({
      url: 'https://www.mianshidati.xyz/api/auth/me',
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      },
      fail: () => {
        setUser(null)
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
                setUser(loginRes.data.user)
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
    setUser(null)
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
    <View className='profile'>
      <View className='header'>
        <Text className='title'>我的</Text>
      </View>

      <View className='card user-card'>
        {user ? (
          <>
            <View className='avatar'>
              <Text className='avatar-text'>🐻</Text>
            </View>
            <View className='user-info'>
              <Text className='nickname'>{user.nickname || user.username}</Text>
              <Text className='username'>用户名：{user.username}</Text>
            </View>
          </>
        ) : (
          <>
            <View className='avatar'>
              <Text className='avatar-text'>👤</Text>
            </View>
            <View className='user-info'>
              <Text className='nickname'>未登录</Text>
              <Text className='username'>登录后同步 Web 端记录</Text>
            </View>
          </>
        )}
      </View>

      {user ? (
        <>
          <View className='card bind-card'>
            <Text className='card-title'>绑定 Web 账号</Text>
            <Text className='card-desc'>在网页端个人中心生成绑定码，输入后小程序即可享受 Web 账号权限</Text>
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
  )
}
