import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './interview.scss'

interface SectionItem {
  title: string
  subtitle: string
  icon: string
  gradient: string
  badge: string | null
  route: string
}

const sections: SectionItem[] = [
  {
    title: 'AI智能练习',
    subtitle: '随机出题，AI批改',
    icon: 'AI',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    badge: '每日5次免费',
    route: '/subpkg-practice/pages/mode-select/index',
  },
  {
    title: '面试真题',
    subtitle: '历年真题+AI三答',
    icon: '真题',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    badge: '200+真题',
    route: '/subpkg-zhenti/pages/list/index',
  },
  {
    title: '套题训练',
    subtitle: '模拟考场限时练习',
    icon: '套题',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    badge: '邀请专享',
    route: '/subpkg-practice/pages/set-select/index',
  },
  {
    title: '自定义题目',
    subtitle: '自由输入AI生成',
    icon: '自定义',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    badge: null,
    route: '/subpkg-practice/pages/custom/index',
  },
  {
    title: '练习记录',
    subtitle: '历史答题与批改',
    icon: '记录',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
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
    { icon: '🤖', title: 'AI批改', desc: '智能评分建议' },
    { icon: '📊', title: '三答对比', desc: '多角度参考' },
    { icon: '⏱️', title: '限时模拟', desc: '真实考场体验' },
  ]

  return (
    <View className='interview'>
      {/* Header */}
      <View className='header'>
        <View className='header-icon-bg'>
          <Text className='header-icon-text'>面试</Text>
        </View>
        <Text className='header-title'>公考面试训练</Text>
        <Text className='header-subtitle'>AI出题 · 语音答题 · 智能批改</Text>
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

      {/* 功能卡片网格 */}
      <View className='card-grid'>
        {sections.map((section, index) => (
          <View
            key={index}
            className='grid-card'
            style={{ background: section.gradient }}
            onClick={() => handleNavigate(section.route)}
          >
            <View className='grid-card-header'>
              <View className='grid-icon-bg'>
                <Text className='grid-icon-text'>{section.icon}</Text>
              </View>
              {section.badge && (
                <View className='grid-badge'>
                  <Text className='grid-badge-text'>{section.badge}</Text>
                </View>
              )}
            </View>
            <Text className='grid-card-title'>{section.title}</Text>
            <Text className='grid-card-subtitle'>{section.subtitle}</Text>
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
