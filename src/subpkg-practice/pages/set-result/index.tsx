import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface SetQuestion {
  index: number
  type: string
  typeName: string
  question: string
}

interface EvaluationResult {
  score: number
  evaluation: string
  improvedAnswer: string
  referenceAnswer: string
}

export default function SetResult() {
  const router = useRouter()
  const [questions, setQuestions] = useState<SetQuestion[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [results, setResults] = useState<EvaluationResult[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  useEffect(() => {
    try {
      const q = JSON.parse(decodeURIComponent(router.params.questions || '[]'))
      const a = JSON.parse(decodeURIComponent(router.params.answers || '[]'))
      const r = JSON.parse(decodeURIComponent(router.params.results || '[]'))
      setQuestions(q)
      setAnswers(a)
      setResults(r)
    } catch (err) {
      console.error('解析结果数据失败:', err)
      Taro.showToast({ title: '数据加载失败', icon: 'none' })
    }
  }, [])

  const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0)
  const avgScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0

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

  const getTotalLevel = (score: number) => {
    if (score >= 85) return '表现优秀'
    if (score >= 70) return '表现良好'
    return '还需练习'
  }

  if (questions.length === 0) {
    return (
      <View className='set-result-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='set-result-page' scrollY>
      {/* 总分 */}
      <View className='total-section'>
        <Text className='total-label'>套题总评</Text>
        <View className='total-score-wrap'>
          <Text className='total-score' style={{ color: getScoreColor(avgScore) }}>
            {avgScore}
          </Text>
          <Text className='total-total'>/100</Text>
        </View>
        <Text className='total-level' style={{ color: getScoreColor(avgScore) }}>
          {getTotalLevel(avgScore)}
        </Text>
        <Text className='total-detail'>
          共 {questions.length} 题，总分 {totalScore} 分
        </Text>
      </View>

      {/* 每题结果 */}
      <View className='result-list'>
        <Text className='section-title'>逐题分析</Text>
        {questions.map((q, i) => {
          const result = results[i]
          const isExpanded = expandedIndex === i

          return (
            <View key={q.index} className='result-card'>
              <View className='result-header' onClick={() => setExpandedIndex(isExpanded ? null : i)}>
                <View className='result-meta'>
                  <Text className='result-index'>第 {i + 1} 题</Text>
                  <Text className='result-type'>{q.typeName}</Text>
                </View>
                <View className='result-score-wrap'>
                  <Text className='result-score' style={{ color: getScoreColor(result?.score || 0) }}>
                    {result?.score ?? 0}
                  </Text>
                  <Text className='result-level' style={{ color: getScoreColor(result?.score || 0) }}>
                    {getScoreLevel(result?.score || 0)}
                  </Text>
                </View>
              </View>

              {isExpanded && (
                <View className='result-body'>
                  <View className='body-section'>
                    <Text className='body-title'>题目</Text>
                    <Text className='body-text'>{q.question}</Text>
                  </View>

                  <View className='body-section'>
                    <Text className='body-title'>我的作答</Text>
                    <Text className='body-text'>{answers[i] || '未作答'}</Text>
                  </View>

                  {result?.evaluation && (
                    <View className='body-section'>
                      <Text className='body-title'>AI点评</Text>
                      <Text className='body-text'>{result.evaluation}</Text>
                    </View>
                  )}

                  {result?.improvedAnswer && (
                    <View className='body-section improved'>
                      <Text className='body-title'>改进版答案</Text>
                      <Text className='body-text'>{result.improvedAnswer}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )
        })}
      </View>

      {/* 底部按钮 */}
      <View className='footer'>
        <View className='action-btn primary' onClick={() => Taro.navigateBack({ delta: 2 })}>
          <Text className='action-text'>再来一套</Text>
        </View>
      </View>
    </ScrollView>
  )
}
