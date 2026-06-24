import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

const questionTypes = [
  { id: 'comprehensive', name: '综合分析', desc: '社会现象、态度观点', color: '#3b82f6', icon: '🔍' },
  { id: 'planning', name: '组织管理', desc: '活动策划、方案执行', color: '#10b981', icon: '📋' },
  { id: 'emergency', name: '应急应变', desc: '突发事件、危机处理', color: '#f59e0b', icon: '🚨' },
  { id: 'interpersonal', name: '人际关系', desc: '同事矛盾、沟通协调', color: '#8b5cf6', icon: '🤝' },
  { id: 'self', name: '自我认知', desc: '个人经历、职业规划', color: '#ec4899', icon: '👤' },
  { id: 'simulation', name: '情景模拟', desc: '角色扮演、现场模拟', color: '#06b6d4', icon: '🎭' },
  { id: 'material', name: '材料题', desc: '阅读材料、提炼观点', color: '#64748b', icon: '📄' },
]

export default function ModeSelect() {
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelect = (id: string) => {
    setSelectedType(id)
  }

  const handleStart = async () => {
    if (!selectedType) {
      Taro.showToast({ title: '请先选择题型', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/questions/generate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          type: selectedType,
          mode: 'single',
        },
      })

      if (res.data.question) {
        Taro.navigateTo({
          url: `/subpkg-practice/pages/question/index?question=${encodeURIComponent(res.data.question)}&type=${selectedType}`,
        })
      } else {
        Taro.showToast({ title: res.data.error || '出题失败', icon: 'none' })
      }
    } catch (err) {
      console.error('出题失败:', err)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='mode-select'>
      {/* Header */}
      <View className='header'>
        <Text className='header-title'>选择题型</Text>
        <Text className='header-subtitle'>选择你要练习的面试题型</Text>
      </View>

      {/* 题型卡片网格 */}
      <ScrollView className='card-grid' scrollY>
        <View className='card-container'>
          {questionTypes.map((type) => (
            <View
              key={type.id}
              className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
              style={{
                borderColor: selectedType === type.id ? type.color : '#e2e8f0',
                background: selectedType === type.id ? `${type.color}10` : '#ffffff',
              }}
              onClick={() => handleSelect(type.id)}
            >
              {/* 顶部图标和名称 */}
              <View className='card-top'>
                <View className='icon-circle' style={{ background: `${type.color}15` }}>
                  <Text className='icon-text' style={{ color: type.color }}>{type.icon}</Text>
                </View>
                <Text className='card-name' style={{ color: selectedType === type.id ? type.color : '#1e293b' }}>
                  {type.name}
                </Text>
              </View>
              {/* 描述 */}
              <Text className='card-desc'>{type.desc}</Text>
              {/* 选中标记 */}
              {selectedType === type.id && (
                <View className='check-badge' style={{ background: type.color }}>
                  <Text className='check-text'>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 开始按钮 */}
      <View className='footer'>
        <View
          className={`start-btn ${selectedType ? 'active' : ''}`}
          onClick={handleStart}
        >
          <Text className='start-text'>
            {loading ? '出题中...' : '开始练习'}
          </Text>
        </View>
      </View>
    </View>
  )
}
