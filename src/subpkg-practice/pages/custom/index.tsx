import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function CustomQuestion() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [referenceAnswer, setReferenceAnswer] = useState('')
  const [generating, setGenerating] = useState(false)
  const [evaluateLoading, setEvaluateLoading] = useState(false)
  const [result, setResult] = useState<{
    score: number
    evaluation: string
    improvedAnswer: string
    referenceAnswer: string
  } | null>(null)

  const handleGenerateReference = async () => {
    if (!question.trim()) {
      Taro.showToast({ title: '请先输入题目', icon: 'none' })
      return
    }

    setGenerating(true)
    setReferenceAnswer('')
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/answers/generate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { question: question.trim() },
      })

      if (res.data.answer) {
        setReferenceAnswer(res.data.answer)
      } else {
        Taro.showToast({ title: res.data.error || '生成失败', icon: 'none' })
      }
    } catch (err) {
      console.error('生成参考答案失败:', err)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setGenerating(false)
    }
  }

  const handleEvaluate = async () => {
    if (!question.trim()) {
      Taro.showToast({ title: '请先输入题目', icon: 'none' })
      return
    }
    if (!answer.trim()) {
      Taro.showToast({ title: '请先输入你的作答', icon: 'none' })
      return
    }

    setEvaluateLoading(true)
    setResult(null)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/evaluate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          question: question.trim(),
          referenceAnswer: referenceAnswer || '',
          userAnswer: answer.trim(),
          type: 'custom',
        },
      })

      if (res.data.evaluation) {
        setResult({
          score: res.data.score,
          evaluation: res.data.evaluation,
          improvedAnswer: res.data.improvedAnswer || '',
          referenceAnswer: res.data.referenceAnswer || referenceAnswer || '',
        })
      } else {
        Taro.showToast({ title: res.data.error || '批改失败', icon: 'none' })
      }
    } catch (err) {
      console.error('批改失败:', err)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setEvaluateLoading(false)
    }
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
    <ScrollView className='custom-page' scrollY>
      {/* 题目输入 */}
      <View className='input-section'>
        <Text className='section-title'>✏️ 输入你的题目</Text>
        <Textarea
          className='custom-input'
          placeholder='请输入你要练习的面试题目...'
          value={question}
          onInput={(e) => setQuestion(e.detail.value)}
          maxlength={500}
          autoHeight
        />
        <Text className='input-count'>{question.length}/500</Text>
      </View>

      {/* 生成参考答案 */}
      <View className='btn-wrap'>
        <View className='primary-btn' onClick={handleGenerateReference}>
          <Text className='btn-text'>
            {generating ? '生成中...' : '生成参考答案'}
          </Text>
        </View>
      </View>

      {/* 参考答案 */}
      {referenceAnswer && (
        <View className='reference-section'>
          <Text className='section-title'>✅ 参考答案</Text>
          <View className='reference-card'>
            <Text className='reference-text'>{referenceAnswer}</Text>
          </View>
        </View>
      )}

      {/* 我的作答 */}
      <View className='input-section'>
        <Text className='section-title'>📝 我的作答</Text>
        <Textarea
          className='custom-input'
          placeholder='请在此输入你的作答内容...'
          value={answer}
          onInput={(e) => setAnswer(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
        <Text className='input-count'>{answer.length}/2000</Text>
      </View>

      {/* 提交批改 */}
      <View className='btn-wrap'>
        <View className='primary-btn' onClick={handleEvaluate}>
          <Text className='btn-text'>
            {evaluateLoading ? '批改中...' : '提交AI批改'}
          </Text>
        </View>
      </View>

      {/* 批改结果 */}
      {result && (
        <View className='result-section'>
          <View className='score-line'>
            <Text className='score-label'>AI批改</Text>
            <Text className='score-number' style={{ color: getScoreColor(result.score) }}>
              {result.score}
            </Text>
            <Text className='score-total'>/100</Text>
            <Text className='score-level' style={{ color: getScoreColor(result.score) }}>
              {getScoreLevel(result.score)}
            </Text>
          </View>
          <View className='result-card'>
            <Text className='result-text'>{result.evaluation}</Text>
          </View>
          {result.improvedAnswer && (
            <View className='improved-section'>
              <Text className='section-title'>✨ 改进版答案</Text>
              <View className='improved-card'>
                <Text className='improved-text'>{result.improvedAnswer}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  )
}
