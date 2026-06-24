import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

const modes = [
  {
    id: '3',
    name: '江苏事业单位',
    count: 3,
    time: '12分钟',
    color: '#f59e0b',
    icon: '📋',
    desc: '3道面试题，适合事业单位面试模拟',
  },
  {
    id: '4',
    name: '江苏公务员',
    count: 4,
    time: '15分钟',
    color: '#3b82f6',
    icon: '📑',
    desc: '4道面试题，适合公务员结构化面试模拟',
  },
]

export default function SetSelect() {
  const [loading, setLoading] = useState(false)

  const handleSelect = async (mode: string) => {
    setLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/questions/set-generate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { mode },
      })

      if (res.statusCode === 403) {
        Taro.showModal({
          title: '邀请用户专享',
          content: '套题训练功能仅限邀请用户使用，可模拟真实考场环境。',
          showCancel: false,
        })
        return
      }

      if (res.data.questions) {
        Taro.navigateTo({
          url: `/subpkg-practice/pages/set-question/index?data=${encodeURIComponent(JSON.stringify(res.data))}`,
        })
      } else {
        Taro.showToast({ title: res.data.error || '生成失败', icon: 'none' })
      }
    } catch (err) {
      console.error('生成套题失败:', err)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className='set-select-page' scrollY>
      <View className='header'>
        <Text className='header-title'>套题训练</Text>
        <Text className='header-subtitle'>模拟真实考场，完整套题练习</Text>
      </View>

      <View className='mode-list'>
        {modes.map((mode) => (
          <View
            key={mode.id}
            className='mode-card'
            style={{ borderColor: mode.color }}
            onClick={() => !loading && handleSelect(mode.id)}
          >
            <View className='mode-icon' style={{ background: `${mode.color}15` }}>
              <Text style={{ color: mode.color, fontSize: 32 }}>{mode.icon}</Text>
            </View>
            <View className='mode-info'>
              <Text className='mode-name'>{mode.name}</Text>
              <Text className='mode-desc'>{mode.desc}</Text>
              <View className='mode-tags'>
                <Text className='mode-tag' style={{ color: mode.color, background: `${mode.color}10` }}>
                  {mode.count}道题
                </Text>
                <Text className='mode-tag' style={{ color: mode.color, background: `${mode.color}10` }}>
                  {mode.time}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {loading && (
        <View className='loading-mask'>
          <Text className='loading-text'>正在生成套题...</Text>
        </View>
      )}
    </ScrollView>
  )
}
