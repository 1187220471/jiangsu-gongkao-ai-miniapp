import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface EvaluationResult {
  score: number
  evaluation: string
  improvedAnswer: string
  dimensions?: {
    name: string
    score: number
    comment: string
  }[]
}

export default function Result() {
  const router = useRouter()
  const [result, setResult] = useState<EvaluationResult | null>(null)

  useEffect(() => {
    try {
      const data = JSON.parse(decodeURIComponent(router.params.result || '{}'))
      setResult(data)
    } catch {
      Taro.showToast({ title: '数据解析失败', icon: 'none' })
    }
  }, [])

  if (!result) {
    return (
      <View className='result-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLevel = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    return '待提升'
  }

  return (
    <ScrollView className='result-page' scrollY>
      {/* 总分 */}
      <View className='score-section'>
        <View className='score-circle' style={{ borderColor: getScoreColor(result.score) }}>
          <Text className='score-number' style={{ color: getScoreColor(result.score) }}>
            {result.score}
          </Text>
          <Text className='score-total'>/100</Text>
        </View>
        <Text className='score-level' style={{ color: getScoreColor(result.score) }}>
          {getScoreLevel(result.score)}
        </Text>
      </View>

      {/* 维度得分 */}
      {result.dimensions && result.dimensions.length > 0 && (
        <View className='dimensions-section'>
          <Text className='section-title'>维度得分</Text>
          {result.dimensions.map((dim, index) => (
            <View key={index} className='dimension-item'>
              <View className='dimension-header'>
                <Text className='dimension-name'>{dim.name}</Text>
                <Text className='dimension-score' style={{ color: getScoreColor(dim.score) }}>
                  {dim.score}分
                </Text>
              </View>
              <View className='dimension-bar-bg'>
                <View
                  className='dimension-bar-fill'
                  style={{
                    width: `${dim.score}%`,
                    background: getScoreColor(dim.score),
                  }}
                />
              </View>
              <Text className='dimension-comment'>{dim.comment}</Text>
            </View>
          ))}
        </View>
      )}

      {/* AI点评 */}
      <View className='evaluation-section'>
        <Text className='section-title'>AI点评</Text>
        <View className='evaluation-card'>
          <Text className='evaluation-text'>{result.evaluation}</Text>
        </View>
      </View>

      {/* 改进版答案 */}
      {result.improvedAnswer && (
        <View className='improved-section'>
          <Text className='section-title'>改进版答案</Text>
          <View className='improved-card'>
            <Text className='improved-text'>{result.improvedAnswer}</Text>
          </View>
        </View>
      )}

      {/* 底部按钮 */}
      <View className='footer'>
        <View className='action-btn primary' onClick={() => Taro.navigateBack()}>
          <Text className='action-text'>继续练习</Text>
        </View>
      </View>
    </ScrollView>
  )
}
