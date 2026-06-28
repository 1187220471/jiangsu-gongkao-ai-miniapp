import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import './index.scss'

const API_BASE = 'https://www.mianshidati.xyz'

export default function ShenlunList() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ year: '', category: '', type: '' })
  const [filterOptions, setFilterOptions] = useState({ years: [], categories: [], types: [] })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchQuestions(1, true)
  }, [filters])

  const fetchQuestions = async (p: number, reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('pageSize', '20')
      if (filters.year) params.set('year', filters.year)
      if (filters.category) params.set('category', filters.category)
      if (filters.type) params.set('type', filters.type)

      const res = await Taro.request({
        url: `${API_BASE}/api/shenlun/list?${params.toString()}`,
        method: 'GET',
        header: { Authorization: `Bearer ${token}` },
      })

      if (res.statusCode === 200 && res.data) {
        const data = res.data
        if (reset) {
          setQuestions(data.questions || [])
          setFilterOptions(data.filters || { years: [], categories: [], types: [] })
        } else {
          setQuestions((prev) => [...prev, ...(data.questions || [])])
        }
        setHasMore(data.questions?.length === 20)
      }
    } catch (err) {
      console.error('Fetch shenlun list error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!hasMore || loading) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchQuestions(nextPage)
  }

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === prev[key as keyof typeof prev] ? '' : value }))
    setPage(1)
  }

  const filteredQuestions = keyword
    ? questions.filter((q) => q.questionText?.includes(keyword) || q.examTitle?.includes(keyword))
    : questions

  const groupedQuestions = filteredQuestions.reduce((groups: any, q: any) => {
    const year = q.examYear
    if (!groups[year]) groups[year] = []
    groups[year].push(q)
    return groups
  }, {})

  const yearKeys = Object.keys(groupedQuestions).sort((a, b) => Number(b) - Number(a))

  const typeMap: Record<string, string> = {
    '归纳概括': '归纳',
    '综合分析': '分析',
    '提出对策': '对策',
    '贯彻执行/公文写作': '贯彻',
    '大作文': '作文',
    '经验总结': '经验',
  }

  const typeColorMap: Record<string, string> = {
    '归纳概括': '#3b82f6',
    '综合分析': '#8b5cf6',
    '提出对策': '#10b981',
    '贯彻执行/公文写作': '#f59e0b',
    '大作文': '#ef4444',
    '经验总结': '#06b6d4',
  }

  return (
    <View className='shenlun-list'>
      {/* 头部 */}
      <View className='header'>
        <Text className='header-title'>申论真题</Text>
        <Text className='header-subtitle'>2018-2025 江苏申论真题</Text>
      </View>

      {/* 搜索 */}
      <View className='search-bar'>
        <Input
          className='search-input'
          placeholder='搜索题目关键词...'
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
      </View>

      {/* 筛选器 */}
      <View className='filter-section'>
        {/* 年份筛选 */}
        <ScrollView scrollX className='filter-scroll' showScrollbar={false}>
          <View className='filter-row'>
            <Text
              className={`filter-chip ${filters.year === '' ? 'filter-active' : ''}`}
              onClick={() => handleFilter('year', '')}
            >
              全部年份
            </Text>
            {filterOptions.years.map((y: any) => (
              <Text
                key={y}
                className={`filter-chip ${filters.year === String(y) ? 'filter-active' : ''}`}
                onClick={() => handleFilter('year', String(y))}
              >
                {y}年
              </Text>
            ))}
          </View>
        </ScrollView>
        {/* 种类筛选 */}
        <ScrollView scrollX className='filter-scroll' showScrollbar={false}>
          <View className='filter-row'>
            <Text
              className={`filter-chip ${filters.category === '' ? 'filter-active' : ''}`}
              onClick={() => handleFilter('category', '')}
            >
              全部种类
            </Text>
            {filterOptions.categories.map((c: any) => (
              <Text
                key={c}
                className={`filter-chip ${filters.category === c ? 'filter-active' : ''}`}
                onClick={() => handleFilter('category', c)}
              >
                {c}
              </Text>
            ))}
          </View>
        </ScrollView>
        {/* 题型筛选 */}
        <ScrollView scrollX className='filter-scroll' showScrollbar={false}>
          <View className='filter-row'>
            <Text
              className={`filter-chip ${filters.type === '' ? 'filter-active' : ''}`}
              onClick={() => handleFilter('type', '')}
            >
              全部题型
            </Text>
            {filterOptions.types.map((t: any) => (
              <Text
                key={t}
                className={`filter-chip ${filters.type === t ? 'filter-active' : ''}`}
                onClick={() => handleFilter('type', t)}
              >
                {t}
              </Text>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 列表 */}
      <ScrollView scrollY className='list-scroll' onScrollToLower={handleLoadMore}>
        {yearKeys.map((year) => (
          <View key={year} className='year-group'>
            <View className='year-header'>
              <Text className='year-text'>{year}年</Text>
              <Text className='year-count'>{groupedQuestions[year].length} 题</Text>
            </View>
            {groupedQuestions[year].map((q: any) => (
              <View
                key={q.id}
                className='question-card'
                onClick={() => Taro.navigateTo({ url: `/subpkg-shenlun/pages/detail/index?id=${q.id}` })}
              >
                <View className='card-header'>
                  <Text className='question-number'>第{q.questionNumber}题</Text>
                  <View
                    className='type-tag'
                    style={{ borderColor: typeColorMap[q.questionType] || '#94a3b8' }}
                  >
                    <Text className='type-tag-text' style={{ color: typeColorMap[q.questionType] || '#94a3b8' }}>
                      {typeMap[q.questionType] || q.questionType}
                    </Text>
                  </View>
                </View>
                <Text className='question-text'>{q.questionText}</Text>
                <View className='card-footer'>
                  <Text className='footer-info'>{q.score}分 · {q.wordLimit}字</Text>
                  <Text className='footer-info'>{q.answerCount}个答案</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {loading && (
          <View className='loading'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        )}

        {!hasMore && filteredQuestions.length > 0 && (
          <View className='no-more'>
            <Text className='no-more-text'>没有更多了</Text>
          </View>
        )}

        {filteredQuestions.length === 0 && !loading && (
          <View className='empty'>
            <Text className='empty-text'>暂无题目</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
