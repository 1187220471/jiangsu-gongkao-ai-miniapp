import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './shenlun.scss'

export default function Shenlun() {
  const handleNavigate = () => {
    Taro.navigateTo({ url: '/subpkg-shenlun/pages/list/index' })
  }

  const stats = [
    { num: '8', label: '年真题', desc: '2018-2025' },
    { num: '24', label: '套试卷', desc: 'A/B/C卷' },
    { num: '97', label: '道题目', desc: '含材料分析' },
  ]

  const features = [
    { icon: '📝', title: '真题练习', desc: '历年真题逐题训练' },
    { icon: '📷', title: '拍照识别', desc: '手写答案一键录入' },
    { icon: '🤖', title: 'AI批改', desc: '智能评分逐句点评' },
    { icon: '📊', title: '维度分析', desc: '多维度能力评估' },
  ]

  return (
    <View className='shenlun'>
      {/* 头部 */}
      <View className='header'>
        <View className='header-icon-bg'>
          <Text className='header-icon-text'>申论</Text>
        </View>
        <Text className='header-title'>申论真题训练</Text>
        <Text className='header-subtitle'>材料分析 · 拍照识别 · AI智能批改</Text>
      </View>

      {/* 统计数据 */}
      <View className='stats-bar'>
        {stats.map((s, i) => (
          <View key={i} className='stat-item'>
            <Text className='stat-num'>{s.num}</Text>
            <Text className='stat-label'>{s.label}</Text>
            <Text className='stat-desc'>{s.desc}</Text>
          </View>
        ))}
      </View>

      {/* 主入口卡片 */}
      <View className='main-card' onClick={handleNavigate}>
        <View className='main-card-content'>
          <View className='main-card-icon-bg'>
            <Text className='main-card-icon'>📚</Text>
          </View>
          <View className='main-card-info'>
            <Text className='main-card-title'>进入真题训练</Text>
            <Text className='main-card-subtitle'>按年份、种类、题型筛选练习</Text>
          </View>
        </View>
        <View className='main-card-arrow'>→</View>
      </View>

      {/* 功能特性 */}
      <View className='features-section'>
        <Text className='features-title'>功能特性</Text>
        <View className='features-grid'>
          {features.map((f, i) => (
            <View key={i} className='feature-item'>
              <Text className='feature-icon'>{f.icon}</Text>
              <Text className='feature-name'>{f.title}</Text>
              <Text className='feature-desc'>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 题型说明 */}
      <View className='types-section'>
        <Text className='types-title'>覆盖题型</Text>
        <View className='types-grid'>
          {['归纳概括', '综合分析', '提出对策', '贯彻执行', '大作文'].map((type) => (
            <View key={type} className='type-tag'>
              <Text className='type-text'>{type}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
