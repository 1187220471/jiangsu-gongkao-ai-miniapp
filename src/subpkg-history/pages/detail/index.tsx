import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface RecordDetail {
  id: number
  questionType: string
  question: string
  userAnswer: string
  referenceAnswer: string
  evaluation: string
  improvedAnswer: string
  score: number | null
  createdAt: string
}

const TYPE_MAP: Record<string, string> = {
  comprehensive: '综合分析',
  planning: '组织管理',
  emergency: '应急应变',
  interpersonal: '人际关系',
  self: '自我认知',
  simulation: '情景模拟',
  material: '材料题',
  social: '社会现象',
  attitude: '态度观点',
  organize: '组织管理',
  relationship: '人际关系',
  situational: '情景模拟',
  zhenti: '真题',
}

export default function HistoryDetail() {
  const router = useRouter()
  const id = router.params.id

  const [record, setRecord] = useState<RecordDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/history',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
        },
        data: {
          page: 1,
          pageSize: 100,
        },
      })

      if (res.data.records) {
        const found = res.data.records.find((r: RecordDetail) => String(r.id) === id)
        if (found) {
          setRecord(found)
        } else {
          Taro.showToast({ title: '记录不存在', icon: 'none' })
        }
      }
    } catch (err) {
      console.error('获取记录失败:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return '#94a3b8'
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLevel = (score: number | null) => {
    if (score === null || score === undefined) return '未批改'
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    return '待提升'
  }

  if (loading) {
    return (
      <View className='history-detail-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (!record) {
    return (
      <View className='history-detail-page'>
        <Text className='loading-text'>记录不存在</Text>
      </View>
    )
  }

  return (
    <ScrollView className='history-detail-page' scrollY>
      {/* 题目 */}
      <View className='question-card'>
        <View className='question-header'>
          <Text className='question-type'>
            {TYPE_MAP[record.questionType] || record.questionType || '练习'}
          </Text>
          <Text className='question-score' style={{ color: getScoreColor(record.score) }}>
            {record.score !== null && record.score !== undefined ? `${record.score}分 · ${getScoreLevel(record.score)}` : '未批改'}
          </Text>
        </View>
        <Text className='question-text'>{record.question}</Text>
      </View>

      {/* 我的答案 */}
      <View className='answer-section'>
        <Text className='section-title'>📝 我的答案</Text>
        <View className='answer-card'>
          <Text className='answer-text'>{record.userAnswer || '无作答内容'}</Text>
        </View>
      </View>

      {/* AI点评 */}
      {record.evaluation && (
        <View className='evaluation-section'>
          <Text className='section-title'>📊 AI点评</Text>
          <View className='evaluation-card'>
            <Text className='evaluation-text'>{record.evaluation}</Text>
          </View>
        </View>
      )}

      {/* 改进版答案 */}
      {record.improvedAnswer && (
        <View className='improved-section'>
          <Text className='section-title'>✨ 改进版答案</Text>
          <View className='improved-card'>
            <Text className='improved-text'>{record.improvedAnswer}</Text>
          </View>
        </View>
      )}

      {/* 参考答案 */}
      {record.referenceAnswer && (
        <View className='reference-section'>
          <Text className='section-title'>✅ 参考答案</Text>
          <View className='reference-card'>
            <Text className='reference-text'>{record.referenceAnswer}</Text>
          </View>
        </View>
      )}

      {/* 底部按钮 */}
      <View className='footer'>
        <View className='action-btn primary' onClick={() => Taro.navigateBack()}>
          <Text className='action-text'>返回列表</Text>
        </View>
      </View>
    </ScrollView>
  )
}
