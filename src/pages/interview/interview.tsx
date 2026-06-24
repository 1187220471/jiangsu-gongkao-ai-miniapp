import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './interview.scss'

interface SectionItem {
  title: string
  subtitle: string
  icon: string
  color: string
  features: string[]
  badge: string | null
}

const sections: SectionItem[] = [
  {
    title: 'AI智能练习',
    subtitle: '选择题型，随机出题，AI智能批改',
    icon: 'AI',
    color: '#3b82f6',
    features: ['7大题型', '随机出题', 'AI批改', '改进建议'],
    badge: '每日5次免费',
  },
  {
    title: '面试真题参考',
    subtitle: '江苏省考历年真题 + AI三答对比',
    icon: '真题',
    color: '#10b981',
    features: ['2008-2026真题', 'AI三答', '汇总答案', '语音答题'],
    badge: '200+ 真题',
  },
  {
    title: '套题训练',
    subtitle: '模拟真实考场，一次性生成完整套题',
    icon: '套题',
    color: '#f59e0b',
    features: ['3题/4题模式', '限时模拟', 'Word下载', '邀请专享'],
    badge: '邀请用户专享',
  },
  {
    title: '自定义题目',
    subtitle: '输入你自己的面试题，AI生成参考答案',
    icon: '自定义',
    color: '#8b5cf6',
    features: ['自由输入', 'AI生成', '参考答案', '即时查看'],
    badge: null,
  },
  {
    title: '练习记录',
    subtitle: '查看历史答题记录和AI批改结果',
    icon: '记录',
    color: '#64748b',
    features: ['历史记录', '批改回顾', '成绩追踪', '持续改进'],
    badge: null,
  },
]

export default function Interview() {
  const handleNavigate = (index: number) => {
    if (index === 0) {
      // AI智能练习 → 选择题型页面
      Taro.navigateTo({
        url: '/subpkg-practice/pages/mode-select/index',
      })
    } else if (index === 1) {
      // 面试真题参考 → 真题列表页
      Taro.navigateTo({
        url: '/subpkg-zhenti/pages/list/index',
      })
    } else if (index === 2) {
      // 套题训练
      Taro.navigateTo({
        url: '/subpkg-practice/pages/set-select/index',
      })
    } else if (index === 3) {
      // 自定义题目
      Taro.navigateTo({
        url: '/subpkg-practice/pages/custom/index',
      })
    } else if (index === 4) {
      // 练习记录
      Taro.navigateTo({
        url: '/subpkg-history/pages/list/index',
      })
    }
  }

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

      {/* 功能卡片列表 */}
      <View className='sections'>
        {sections.map((section, index) => (
          <View
            key={index}
            className='section-card'
            style={{ background: `linear-gradient(135deg, ${section.color}15, ${section.color}08)` }}
            onClick={() => handleNavigate(index)}
          >
            <View className='card-header'>
              <View className='card-icon-bg' style={{ background: `${section.color}15` }}>
                <Text className='card-icon-text' style={{ color: section.color }}>{section.icon}</Text>
              </View>
              {section.badge && (
                <View className='card-badge' style={{ background: `${section.color}15`, borderColor: `${section.color}30` }}>
                  <Text className='badge-text' style={{ color: section.color }}>{section.badge}</Text>
                </View>
              )}
            </View>
            <Text className='card-title'>{section.title}</Text>
            <Text className='card-subtitle'>{section.subtitle}</Text>
            <View className='card-features'>
              {section.features.map((f, fi) => (
                <View key={fi} className='feature-tag' style={{ background: `${section.color}10`, color: section.color }}>
                  <Text className='feature-text'>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
