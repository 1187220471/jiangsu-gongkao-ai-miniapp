import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './shenlun.scss'
import iconScroll from '../../assets/icons/scroll.png'

export default function Shenlun() {
  const handleNavigate = () => {
    Taro.navigateTo({ url: '/subpkg-shenlun/pages/list/index' })
  }

  const stats = [
    { num: '8', label: '年真题', desc: '2018-2025' },
    { num: '24', label: '套试卷', desc: 'A/B/C 卷' },
    { num: '97', label: '道题目', desc: '含材料分析' },
  ]

  const features = [
    { icon: '📝', title: '真题练习', desc: '历年真题逐题训练' },
    { icon: '📷', title: '拍照识别', desc: '手写答案一键录入' },
    { icon: '🤖', title: 'AI 批改', desc: '智能评分逐句点评' },
    { icon: '📊', title: '维度分析', desc: '多维度能力评估' },
  ]

  return (
    <View className='shenlun'>
      {/* 头部 */}
      <View className='header'>
        <Text className='header-title'>申论真题训练</Text>
        <Text className='header-subtitle'>材料分析 · 拍照识别 · AI 智能批改</Text>
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

      {/* 训练模块（首页样式） */}
      <View className='section-title-row'>
        <Text className='section-title-text'>训练模块</Text>
      </View>
      <View className='modules-grid'>
        <View className='module-card' onClick={handleNavigate}>
          <View className='module-icon' style={{ background: '#eef8f2' }}>
            <Image className='module-icon-img' src={iconScroll} mode='aspectFit' />
          </View>
          <View className='module-card-info'>
            <View className='module-card-title-row'>
              <Text className='module-card-title'>真题训练</Text>
              <View className='module-card-badge'>
                <Text className='module-card-badge-text' style={{ color: '#4a5560' }}>97 题</Text>
              </View>
            </View>
            <Text className='module-card-subtitle' style={{ color: '#4a5560' }}>按年份、种类、题型筛选练习</Text>
          </View>
        </View>
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
