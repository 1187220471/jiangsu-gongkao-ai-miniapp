import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './news.scss'

interface NewsItem {
  topic: string
  title: string
  date: string
  source: string
  score: number
  intro: string
  url: string
}

interface AllNewsItem {
  title: string
  date: string
  source: string
  score: number
  url: string
}

interface NewsData {
  date: string
  topNews: NewsItem[]
  allNews: AllNewsItem[]
  createdAt: string
}

const TOPIC_COLORS: Record<string, string> = {
  '民生保障': '#ef4444',
  '产业创新': '#3b82f6',
  '经济发展': '#10b981',
  '文化繁荣': '#8b5cf6',
  '社会治理': '#f59e0b',
  '科技创新': '#06b6d4',
  '区域协调': '#6366f1',
  '乡村振兴': '#059669',
  '绿色发展': '#14b8a6',
}

function getTopicColor(topic: string) {
  return TOPIC_COLORS[topic] || '#64748b'
}

function getScoreColor(score: number) {
  if (score >= 8) return '#10b981'
  if (score >= 7) return '#3b82f6'
  if (score >= 6) return '#f59e0b'
  return '#64748b'
}

function getScoreBg(score: number) {
  if (score >= 8) return 'rgba(16, 185, 129, 0.1)'
  if (score >= 7) return 'rgba(59, 130, 246, 0.1)'
  if (score >= 6) return 'rgba(245, 158, 11, 0.1)'
  return 'rgba(100, 116, 139, 0.1)'
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[0]}/${parts[1]}/${parts[2]}`
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}

function getBeijingDateStr(date: Date): string {
  const beijingTime = new Date(date.getTime() + (8 * 60 * 60 * 1000))
  return beijingTime.toISOString().split('T')[0]
}

function getDateRangeDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export default function News() {
  const [news, setNews] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [showAllNews, setShowAllNews] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const today = getBeijingDateStr(new Date())
    setSelectedDate(today)
    fetchNews(today)
  }, [])

  const fetchNews = async (date: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await Taro.request({
        url: `https://www.mianshidati.xyz/api/news/daily?date=${date}`,
        method: 'GET',
      })
      if (res.statusCode === 200) {
        setNews(res.data)
      } else {
        setError(res.data?.error || '获取新闻失败')
        setNews(null)
      }
    } catch (e) {
      setError('网络错误')
      setNews(null)
    }
    setLoading(false)
  }

  const handleDateChange = (e: any) => {
    const date = e.detail.value
    setSelectedDate(date)
    setShowPicker(false)
    if (date) fetchNews(date)
  }

  const goPrevDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    const newDate = getBeijingDateStr(date)
    setSelectedDate(newDate)
    fetchNews(newDate)
  }

  const goNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    const newDate = getBeijingDateStr(date)
    // 不能选择未来日期
    const today = getBeijingDateStr(new Date())
    if (newDate > today) {
      Taro.showToast({ title: '不能选择未来日期', icon: 'none' })
      return
    }
    setSelectedDate(newDate)
    fetchNews(newDate)
  }

  // 生成最近30天的日期列表
  const generateDateList = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(getBeijingDateStr(date))
    }
    return dates
  }

  const dateList = generateDateList()

  // 按主题分组
  const groupedNews = news?.topNews.reduce((acc, item) => {
    if (!acc[item.topic]) acc[item.topic] = []
    acc[item.topic].push(item)
    return acc
  }, {} as Record<string, NewsItem[]>)

  const handleOpenUrl = (url: string) => {
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showModal({
          title: '链接已复制',
          content: '新闻链接已复制到剪贴板，可到浏览器粘贴查看原文',
          showCancel: false,
          confirmText: '知道了',
        })
      }
    })
  }

  return (
    <View className='news-page'>
      {/* 顶部日期选择器 */}
      <View className='news-header'>
        <View className='date-nav'>
          <View className='date-arrow' onClick={goPrevDay}>
            <Text className='arrow-icon'>‹</Text>
          </View>
          <View className='date-display' onClick={() => setShowPicker(true)}>
            <Text className='date-text'>{formatDate(selectedDate)}</Text>
            <Text className='date-icon'>📅</Text>
          </View>
          <View className='date-arrow' onClick={goNextDay}>
            <Text className='arrow-icon'>›</Text>
          </View>
        </View>
        {news && (
          <Text className='news-count'>
            {news.topNews.length} 条精选
          </Text>
        )}
      </View>

      {/* 日期选择器弹层 */}
      {showPicker && (
        <View className='picker-overlay' onClick={() => setShowPicker(false)}>
          <View className='picker-container' onClick={(e) => e.stopPropagation()}>
            <View className='picker-header'>
              <Text className='picker-title'>选择日期</Text>
              <Text className='picker-close' onClick={() => setShowPicker(false)}>✕</Text>
            </View>
            <Picker mode='date' value={selectedDate} onChange={handleDateChange}>
              <View className='picker-trigger'>
                <Text className='picker-value'>{formatDate(selectedDate)}</Text>
                <Text className='picker-hint'>点击选择日期</Text>
              </View>
            </Picker>
          </View>
        </View>
      )}

      {/* 横向日期条 */}
      <ScrollView scrollX className='date-scroll' showScrollbar={false}>
        <View className='date-list'>
          {dateList.map((date) => {
            const isSelected = date === selectedDate
            const isToday = date === getBeijingDateStr(new Date())
            return (
              <View
                key={date}
                className={`date-item ${isSelected ? 'date-item-active' : ''}`}
                onClick={() => {
                  setSelectedDate(date)
                  fetchNews(date)
                }}
              >
                <Text className='date-item-week'>
                  {isToday ? '今天' : ['日', '一', '二', '三', '四', '五', '六'][new Date(date).getDay()]}
                </Text>
                <Text className='date-item-day'>{formatShortDate(date)}</Text>
                {isToday && <View className='date-item-dot' />}
              </View>
            )
          })}
        </View>
      </ScrollView>

      <ScrollView scrollY className='news-scroll'>
        {/* 说明 */}
        <View className='news-intro'>
          <Text className='intro-title'>公考备考专用精选</Text>
          <Text className='intro-text'>
            每天19:00自动抓取江苏政务新闻，经AI筛选后保留8-12条与申论/面试话题高度相关的内容，并生成备考简介。
          </Text>
        </View>

        {loading && (
          <View className='loading-section'>
            <View className='loading-spinner' />
            <Text className='loading-text'>加载中...</Text>
          </View>
        )}

        {error && !loading && (
          <View className='error-section'>
            <Text className='error-icon'>⚠️</Text>
            <Text className='error-title'>{error}</Text>
            <Text className='error-subtitle'>每日新闻于19:00自动更新，请稍后再试</Text>
          </View>
        )}

        {news && !loading && (
          <>
            {/* 初筛新闻 */}
            {news.allNews && news.allNews.length > 0 && (
              <View className='all-news-section'>
                <View
                  className='all-news-header'
                  onClick={() => setShowAllNews(!showAllNews)}
                >
                  <View className='all-news-title-row'>
                    <Text className='all-news-icon'>📋</Text>
                    <Text className='all-news-title'>初筛新闻（得分6分以上）</Text>
                    <Text className='all-news-count'>共 {news.allNews.length} 条</Text>
                  </View>
                  <Text className={`arrow ${showAllNews ? 'arrow-up' : ''}`}>▼</Text>
                </View>

                {showAllNews && (
                  <View className='all-news-list'>
                    {news.allNews
                      .sort((a, b) => b.score - a.score)
                      .map((item, idx) => (
                        <View key={idx} className='all-news-item'>
                          <View
                            className='score-badge'
                            style={{
                              color: getScoreColor(item.score),
                              backgroundColor: getScoreBg(item.score),
                            }}
                          >
                            <Text>{item.score}</Text>
                          </View>
                          <View className='all-news-content'>
                            <Text
                              className='all-news-item-title'
                              onClick={() => handleOpenUrl(item.url)}
                            >
                              {item.title}
                            </Text>
                            <View className='all-news-meta'>
                              <Text className='meta-text'>{item.date}</Text>
                              <Text className='meta-sep'>|</Text>
                              <Text className='meta-text'>{item.source}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            )}

            {/* 今日精选 - 按主题分组 */}
            <View className='top-news-section'>
              {Object.entries(groupedNews || {}).map(([topic, items]) => (
                <View key={topic} className='topic-group'>
                  <View
                    className='topic-header'
                    style={{ borderLeftColor: getTopicColor(topic) }}
                  >
                    <View
                      className='topic-tag'
                      style={{
                        color: getTopicColor(topic),
                        backgroundColor: getTopicColor(topic) + '15',
                        borderColor: getTopicColor(topic) + '30',
                      }}
                    >
                      <Text>{topic}</Text>
                    </View>
                    <Text className='topic-count'>{items.length} 条</Text>
                  </View>

                  <View className='topic-items'>
                    {items.map((item, idx) => (
                      <View key={idx} className='news-card'>
                        <View className='news-card-header'>
                          <Text
                            className='news-card-title'
                            onClick={() => handleOpenUrl(item.url)}
                          >
                            {item.title}
                          </Text>
                          <Text className='news-card-link' onClick={() => handleOpenUrl(item.url)}>
                            🔗
                          </Text>
                        </View>
                        <View className='news-card-meta'>
                          <Text className='meta-text'>{item.date}</Text>
                          <Text className='meta-sep'>|</Text>
                          <Text className='meta-text'>{item.source}</Text>
                          <Text className='meta-sep'>|</Text>
                          <Text
                            className='score-text'
                            style={{ color: getScoreColor(item.score) }}
                          >
                            {item.score}分
                          </Text>
                        </View>
                        <Text className='news-card-intro'>{item.intro}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}
