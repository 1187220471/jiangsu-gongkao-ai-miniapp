import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './interview.scss'
import iconMicrophone from '../../assets/icons/microphone.png'
import iconScroll from '../../assets/icons/scroll.png'
import iconNewspaper from '../../assets/icons/newspaper.png'
import iconClock from '../../assets/icons/clock.png'

interface SectionItem {
  title: string
  subtitle: string
  icon: any
  color: string
  textColor: string
  badge: string | null
  route: string
}

const sections: SectionItem[] = [
  {
    title: 'AI 智能练习',
    subtitle: '随机出题，AI 批改',
    icon: iconMicrophone,
    color: '#eef2f8',
    textColor: '#4a5568',
    badge: '每日5次免费',
    route: '/subpkg-practice/pages/mode-select/index',
  },
  {
    title: '面试真题',
    subtitle: '历年真题 + AI 三答',
    icon: iconScroll,
    color: '#eef8f2',
    textColor: '#4a5560',
    badge: '200+真题',
    route: '/subpkg-zhenti/pages/list/index',
  },
  {
    title: '套题训练',
    subtitle: '模拟考场限时练习',
    icon: iconNewspaper,
    color: '#f8f4ee',
    textColor: '#555048',
    badge: '邀请专享',
    route: '/subpkg-practice/pages/set-select/index',
  },
  {
    title: '自定义题目',
    subtitle: '自由输入 AI 生成',
    icon: iconScroll,
    color: '#f4eef8',
    textColor: '#504a55',
    badge: null,
    route: '/subpkg-practice/pages/custom/index',
  },
  {
    title: '练习记录',
    subtitle: '历史答题与批改',
    icon: iconClock,
    color: '#f3f4f6',
    textColor: '#4b5563',
    badge: null,
    route: '/subpkg-history/pages/list/index',
  },
]

export default function Interview() {
  const handleNavigate = (route: string) => {
    Taro.navigateTo({ url: route })
  }

  const stats = [
    { num: '200+', label: '面试真题', desc: '2008-2026' },
    { num: '7', label: '题型覆盖', desc: '全题型' },
    { num: 'AI', label: '智能批改', desc: '即时反馈' },
  ]

  const features = [
    { icon: '🎤', title: '语音答题', desc: '支持语音输入' },
    { icon: '🤖', title: 'AI 批改', desc: '智能评分建议' },
    { icon: '📊', title: '三答对比', desc: '多角度参考' },
    { icon: '⏱️', title: '限时模拟', desc: '真实考场体验' },
  ]

  return (
    <View className='interview'>
      {/* Header */}
      <View className='header'>
        <Text className='header-title'>公考面试训练</Text>
        <Text className='header-subtitle'>AI 出题 · 语音答题 · 智能批改</Text>
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
        {sections.map((section, index) => (
          <View
            key={index}
            className='module-card'
            onClick={() => handleNavigate(section.route)}
          >
            <View className='module-icon' style={{ background: section.color }}>
              <Image className='module-icon-img' src={section.icon} mode='aspectFit' />
            </View>
            <View className='module-card-info'>
              <View className='module-card-title-row'>
                <Text className='module-card-title'>{section.title}</Text>
                {section.badge && (
                  <View className='module-card-badge'>
                    <Text className='module-card-badge-text' style={{ color: section.textColor }}>{section.badge}</Text>
                  </View>
                )}
              </View>
              <Text className='module-card-subtitle' style={{ color: section.textColor }}>{section.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 功能特性 */}
      <View className='features-section'>
        <Text className='features-title'>核心能力</Text>
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

      {/* 支持的题型 */}
      <View className='types-section'>
        <Text className='types-title'>支持的面试题型</Text>
        <View className='types-grid'>
          {['社会现象类', '态度观点类', '组织管理类', '应急应变类', '人际关系类', '自我认知类', '情景模拟类'].map((type) => (
            <View key={type} className='type-tag'>
              <Text className='type-text'>{type}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
