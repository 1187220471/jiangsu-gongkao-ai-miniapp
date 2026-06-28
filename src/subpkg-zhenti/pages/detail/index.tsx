import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import VoiceInput from '../../../components/VoiceInput'
import './index.scss'

interface ZhentiDetail {
  id: number
  examTitle: string
  examYear: number
  examCategory: string
  questionNumber: number
  questionText: string
  questionType: string
  finalAnswer: string
  finalWordCount: number
  answer1: string
  answer2: string
  answer3: string
  score1: number
  score2: number
  score3: number
  comparison: {
    comparison: Array<{
      answer_id: number
      total_score: number
    }>
    best_answer_id: number
    ranking_reason: string
  }
}

interface EvaluationResult {
  score: number
  evaluation: string
  improvedAnswer: string
  referenceAnswer: string
}

export default function ZhentiDetail() {
  const router = useRouter()
  const id = router.params.id

  const [question, setQuestion] = useState<ZhentiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluateLoading, setEvaluateLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [activeTab, setActiveTab] = useState<'final' | 'compare'>('final')
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: `https://www.mianshidati.xyz/api/zhenti/detail/${id}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.data.question) {
        setQuestion(res.data.question)
      } else {
        Taro.showToast({ title: res.data.error || '加载失败', icon: 'none' })
      }
    } catch (err) {
      console.error('获取详情失败:', err)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async () => {
    if (!question || !userAnswer.trim()) {
      Taro.showToast({ title: '请先输入你的答案', icon: 'none' })
      return
    }

    setEvaluateLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/zhenti/evaluate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          questionId: question.id,
          questionText: question.questionText,
          referenceAnswer: question.finalAnswer,
          userAnswer: userAnswer.trim(),
          questionType: question.questionType,
        },
      })

      if (res.data.evaluation) {
        setResult({
          score: res.data.score,
          evaluation: res.data.evaluation,
          improvedAnswer: res.data.improvedAnswer || '',
          referenceAnswer: res.data.referenceAnswer || question.finalAnswer,
        })
        setActiveTab('final')
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
    if (score >= 85) return '#10b981'
    if (score >= 75) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLevel = (score: number) => {
    if (score >= 85) return '优秀'
    if (score >= 75) return '良好'
    return '待提升'
  }

  if (loading) {
    return (
      <View className='zhenti-detail-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (!question) {
    return (
      <View className='zhenti-detail-page'>
        <Text className='loading-text'>题目不存在</Text>
      </View>
    )
  }

  const compItems = question.comparison?.comparison || []
  const bestId = question.comparison?.best_answer_id

  return (
    <ScrollView className='zhenti-detail-page' scrollY>
      {/* 题目卡片 */}
      <View className='question-card'>
        <View className='question-header'>
          <View className='question-number'>
            <Text className='number-text'>{question.questionNumber}</Text>
          </View>
          <Text className='question-type'>{question.questionType}</Text>
        </View>
        <Text className='question-text'>{question.questionText}</Text>
      </View>

      {/* 我的作答 */}
      <View className='answer-section'>
        <View className='section-header'>
          <Text className='section-title'>🎤 我的作答</Text>
          {result && (
            <Text className='score-badge' style={{ color: getScoreColor(result.score) }}>
              {result.score}分
            </Text>
          )}
        </View>
        <Textarea
          className='answer-input'
          placeholder='请在此输入你的作答内容，或使用下方语音输入...'
          value={userAnswer}
          onInput={(e) => setUserAnswer(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
        <Text className='answer-count'>{userAnswer.length}/2000</Text>

        {/* 语音输入 */}
        <VoiceInput
          value={userAnswer}
          onTextChange={setUserAnswer}
          placeholder='按住 说话'
        />

        {result && (
          <View className='result-wrap'>
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
              <View className='improved-card'>
                <Text className='improved-title'>✨ 改进版答案</Text>
                <Text className='improved-text'>{result.improvedAnswer}</Text>
              </View>
            )}
          </View>
        )}

        <View className='btn-wrap'>
          <View className='submit-btn' onClick={handleEvaluate}>
            <Text className='submit-text'>
              {evaluateLoading ? '批改中...' : '提交AI批改'}
            </Text>
          </View>
        </View>
      </View>

      {/* 答案 Tab */}
      <View className='answer-tabs'>
        <View className='tab-header'>
          <View
            className={`tab-item ${activeTab === 'final' ? 'active' : ''}`}
            onClick={() => setActiveTab('final')}
          >
            <Text className='tab-text'>汇总答案</Text>
          </View>
          <View
            className={`tab-item ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <Text className='tab-text'>3答对比</Text>
          </View>
        </View>

        {activeTab === 'final' && (
          <View className='tab-content'>
            <View className='final-header'>
              <Text className='final-title'>参考答案</Text>
              <Text className='final-count'>{question.finalWordCount} 字</Text>
            </View>
            <Text className='final-text'>{question.finalAnswer}</Text>
          </View>
        )}

        {activeTab === 'compare' && (
          <View className='tab-content'>
            <View className='compare-overview'>
              {[
                { id: 1, score: question.score1, temp: '0.9' },
                { id: 2, score: question.score2, temp: '0.7' },
                { id: 3, score: question.score3, temp: '0.5' },
              ].map((a) => {
                const isBest = bestId === a.id
                return (
                  <View
                    key={a.id}
                    className={`compare-card ${isBest ? 'best' : ''}`}
                    onClick={() => setExpandedAnswer(expandedAnswer === a.id ? null : a.id)}
                  >
                    <Text className='compare-id'>答案{a.id}</Text>
                    <Text className='compare-score' style={{ color: getScoreColor(a.score) }}>
                      {a.score}
                    </Text>
                    <Text className='compare-temp'>temp={a.temp}</Text>
                    {isBest && <Text className='best-tag'>🏆</Text>}
                  </View>
                )
              })}
            </View>

            {question.comparison?.ranking_reason && (
              <View className='reason-card'>
                <Text className='reason-text'>🏆 最佳答案理由：{question.comparison.ranking_reason}</Text>
              </View>
            )}

            {[
              { id: 1, content: question.answer1 },
              { id: 2, content: question.answer2 },
              { id: 3, content: question.answer3 },
            ].map((a) => (
              expandedAnswer === a.id ? (
                <View key={a.id} className='answer-detail'>
                  <Text className='answer-detail-title'>答案 {a.id} 原文</Text>
                  <Text className='answer-detail-text'>{a.content}</Text>
                </View>
              ) : null
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
