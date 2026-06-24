import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface ZhentiItem {
  id: number
  examTitle: string
  examYear: number
  examCategory: string
  questionNumber: number
  questionText: string
  questionType: string
  finalWordCount: number
  isBookmarked: boolean
}

interface FilterOptions {
  years: number[]
  categories: string[]
  types: string[]
}

export default function ZhentiList() {
  const [questions, setQuestions] = useState<ZhentiItem[]>([])
  const [filters, setFilters] = useState<FilterOptions>({ years: [], categories: [], types: [] })
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchQuestions = async (p = 1, append = false) => {
    if (loading) return
    setLoading(true)

    const params = new URLSearchParams({ page: String(p), pageSize: '20' })
    if (selectedYear) params.set('year', String(selectedYear))
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedType) params.set('type', selectedType)

    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: `https://www.mianshidati.xyz/api/zhenti/list?${params.toString()}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = res.data
      const list = data.questions || []
      setQuestions((prev) => (append ? [...prev, ...list] : list))
      setFilters(data.filters || { years: [], categories: [], types: [] })
      setHasMore(list.length === 20 && (page * 20) < (data.total || 0))
    } catch (err) {
      console.error('获取真题列表失败:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions(1, false)
  }, [selectedYear, selectedCategory, selectedType])

  const loadMore = () => {
    if (!hasMore || loading) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchQuestions(nextPage, true)
  }

  const handleDetail = (id: number) => {
    Taro.navigateTo({
      url: `/subpkg-zhenti/pages/detail/index?id=${id}`,
    })
  }

  const grouped = questions.reduce<Record<string, ZhentiItem[]>>((acc, q) => {
    if (!acc[q.examTitle]) acc[q.examTitle] = []
    acc[q.examTitle].push(q)
    return acc
  }, {})

  return (
    <View className='zhenti-list-page'>
      {/* Header */}
      <View className='header'>
        <Text className='header-title'>面试真题参考</Text>
        <Text className='header-subtitle'>江苏省考历年真题 · AI三答对比</Text>
      </View>

      {/* 筛选器 */}
      <ScrollView className='filter-bar' scrollX>
        <View className='filter-list'>
          <View
            className={`filter-item ${selectedYear === null ? 'active' : ''}`}
            onClick={() => setSelectedYear(null)}
          >
            <Text className='filter-text'>全部年份</Text>
          </View>
          {filters.years.map((y) => (
            <View
              key={y}
              className={`filter-item ${selectedYear === y ? 'active' : ''}`}
              onClick={() => setSelectedYear(y)}
            >
              <Text className='filter-text'>{y}年</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView className='filter-bar' scrollX>
        <View className='filter-list'>
          <View
            className={`filter-item ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            <Text className='filter-text'>全部类别</Text>
          </View>
          {filters.categories.map((c) => (
            <View
              key={c}
              className={`filter-item ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c)}
            >
              <Text className='filter-text'>{c}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView className='filter-bar' scrollX>
        <View className='filter-list'>
          <View
            className={`filter-item ${selectedType === null ? 'active' : ''}`}
            onClick={() => setSelectedType(null)}
          >
            <Text className='filter-text'>全部题型</Text>
          </View>
          {filters.types.map((t) => (
            <View
              key={t}
              className={`filter-item ${selectedType === t ? 'active' : ''}`}
              onClick={() => setSelectedType(t)}
            >
              <Text className='filter-text'>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 题目列表 */}
      <ScrollView className='question-list' scrollY onScrollToLower={loadMore}>
        {loading && questions.length === 0 ? (
          <View className='loading-wrap'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : questions.length === 0 ? (
          <View className='empty-wrap'>
            <Text className='empty-text'>暂无数据</Text>
          </View>
        ) : (
          <View className='list-container'>
            {Object.entries(grouped).map(([examTitle, qs]) => (
              <View key={examTitle} className='exam-group'>
                <View className='exam-header'>
                  <Text className='exam-year'>{qs[0].examYear}年</Text>
                  {qs[0].examCategory && <Text className='exam-category'>{qs[0].examCategory}</Text>}
                  <Text className='exam-title'>{examTitle}</Text>
                  <Text className='exam-count'>{qs.length}题</Text>
                </View>
                {qs.sort((a, b) => a.questionNumber - b.questionNumber).map((q) => (
                  <View key={q.id} className='question-item' onClick={() => handleDetail(q.id)}>
                    <View className='question-number'>
                      <Text className='number-text'>{q.questionNumber}</Text>
                    </View>
                    <View className='question-content'>
                      <Text className='question-text'>{q.questionText}</Text>
                      <View className='question-meta'>
                        <Text className='meta-type'>{q.questionType}</Text>
                        <Text className='meta-count'>参考答案 {q.finalWordCount} 字</Text>
                        {q.isBookmarked && <Text className='meta-bookmark'>⭐</Text>}
                      </View>
                    </View>
                    <Text className='question-arrow'>›</Text>
                  </View>
                ))}
              </View>
            ))}
            {hasMore && (
              <View className='load-more'>
                <Text className='load-more-text'>{loading ? '加载中...' : '上拉加载更多'}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
