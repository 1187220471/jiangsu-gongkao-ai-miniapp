import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface RecordItem {
  id: number
  questionType: string
  question: string
  userAnswer: string
  evaluation: string
  improvedAnswer: string
  score: number | null
  createdAt: string
}

const PAGE_SIZE = 10

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

export default function HistoryList() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchRecords(1)
  }, [])

  const fetchRecords = async (nextPage: number) => {
    if (loading) return
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
          page: nextPage,
          pageSize: PAGE_SIZE,
        },
      })

      const data = res.data
      if (data.records) {
        if (nextPage === 1) {
          setRecords(data.records)
        } else {
          setRecords((prev) => [...prev, ...data.records])
        }
        setHasMore(data.records.length === PAGE_SIZE && nextPage < data.totalPages)
        setPage(nextPage)
      }
    } catch (err) {
      console.error('获取记录失败:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchRecords(page + 1)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getQuestionSummary = (text: string) => {
    if (!text) return ''
    return text.length > 60 ? text.slice(0, 60) + '...' : text
  }

  const getScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return '#94a3b8'
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <View className='history-list-page'>
      <View className='header'>
        <Text className='header-title'>练习记录</Text>
        <Text className='header-subtitle'>查看历史答题与AI批改</Text>
      </View>

      <ScrollView
        className='record-list'
        scrollY
        onScrollToLower={handleLoadMore}
        lowerThreshold={50}
      >
        {records.length === 0 && !loading ? (
          <View className='empty-wrap'>
            <Text className='empty-icon'>📝</Text>
            <Text className='empty-text'>还没有练习记录</Text>
            <Text className='empty-tip'>快去开始练习吧</Text>
          </View>
        ) : (
          <View className='list-container'>
            {records.map((record) => (
              <View
                key={record.id}
                className='record-card'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/subpkg-history/pages/detail/index?id=${record.id}`,
                  })
                }}
              >
                <View className='record-header'>
                  <Text className='record-type'>
                    {TYPE_MAP[record.questionType] || record.questionType || '练习'}
                  </Text>
                  <Text className='record-date'>{formatDate(record.createdAt)}</Text>
                </View>
                <Text className='record-question'>{getQuestionSummary(record.question)}</Text>
                <View className='record-footer'>
                  <Text className='record-answer-count'>我的作答 {record.userAnswer?.length || 0} 字</Text>
                  {record.score !== null && record.score !== undefined ? (
                    <View className='record-score' style={{ background: `${getScoreColor(record.score)}15` }}>
                      <Text className='score-text' style={{ color: getScoreColor(record.score) }}>
                        {record.score}分
                      </Text>
                    </View>
                  ) : (
                    <View className='record-score' style={{ background: '#f1f5f9' }}>
                      <Text className='score-text' style={{ color: '#94a3b8' }}>
                        未批改
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {hasMore ? (
              <View className='load-more'>
                <Text className='load-more-text'>{loading ? '加载中...' : '上拉加载更多'}</Text>
              </View>
            ) : (
              <View className='load-more'>
                <Text className='load-more-text'>没有更多了</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
