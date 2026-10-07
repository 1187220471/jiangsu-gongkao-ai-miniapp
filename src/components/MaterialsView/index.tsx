import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface MaterialArticle {
  topic: string
  title: string
  source: string
  url: string
  publishDate: string
  thesis: string
  subPoints: string[]
  quotes: string[]
  content: string
  analysis: string
}

interface MaterialsData {
  week: string
  articles: MaterialArticle[]
  updatedAt: string
}

const TOPIC_COLORS: Record<string, string> = {
  '基层治理': '#f59e0b',
  '乡村振兴': '#059669',
  '政务服务': '#3b82f6',
  '民生保障': '#ef4444',
  '执法法治': '#d97706',
  '科技数字化': '#06b6d4',
  '文化建设': '#8b5cf6',
  '新业态治理': '#ec4899',
  '安全应急': '#f43f5e',
  '生态环保': '#14b8a6',
  '区域协调': '#6366f1',
  '经济发展': '#10b981',
}

function getTopicColor(topic: string) {
  return TOPIC_COLORS[topic] || '#64748b'
}

export default function MaterialsView() {
  const [data, setData] = useState<MaterialsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTopic, setActiveTopic] = useState('全部')
  const [expandedUrl, setExpandedUrl] = useState('')

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/materials/weekly',
        method: 'GET',
      })
      if (res.statusCode === 200) {
        setData(res.data)
      } else {
        setError(res.data?.error || '获取素材失败')
      }
    } catch (e) {
      setError('网络异常，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = (url: string) => {
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showToast({ title: '原文链接已复制', icon: 'none' })
      },
    })
  }

  if (loading) {
    return (
      <View className='mv-wrap'>
        <View className='mv-status'>
          <Text className='mv-status-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View className='mv-wrap'>
        <View className='mv-status'>
          <Text className='mv-status-text'>{error || '暂无素材数据'}</Text>
          <Text className='mv-retry' onClick={fetchMaterials}>点击重试</Text>
        </View>
      </View>
    )
  }

  const topics = ['全部', ...Array.from(new Set(data.articles.map((a) => a.topic)))]
  const filtered =
    activeTopic === '全部' ? data.articles : data.articles.filter((a) => a.topic === activeTopic)

  return (
    <View className='mv-wrap'>
      {/* 周期信息 */}
      <View className='mv-header'>
        <Text className='mv-header-title'>本周素材（{data.week} 当周）</Text>
        <Text className='mv-header-sub'>共 {data.articles.length} 篇 · 摘录注明来源 · 每周一更新</Text>
      </View>

      {/* 主题筛选 */}
      <ScrollView className='mv-topic-scroll' scrollX enhanced showScrollbar={false}>
        <View className='mv-topic-chips'>
          {topics.map((t) => (
            <View
              key={t}
              className={`mv-topic-chip ${activeTopic === t ? 'active' : ''}`}
              onClick={() => setActiveTopic(t)}
            >
              <Text className='mv-topic-chip-text'>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 素材列表 */}
      <ScrollView className='mv-list' scrollY>
        {filtered.map((a, idx) => (
          <View key={a.url + idx} className='mv-card'>
            <View className='mv-card-head'>
              <Text className='mv-card-title'>{a.title}</Text>
              <View className='mv-card-topic' style={{ background: getTopicColor(a.topic) + '1a', borderColor: getTopicColor(a.topic) }}>
                <Text className='mv-card-topic-text' style={{ color: getTopicColor(a.topic) }}>{a.topic}</Text>
              </View>
            </View>

            <View className='mv-card-meta' onClick={() => handleCopyLink(a.url)}>
              <Text className='mv-meta-text'>来源：{a.source} · {a.publishDate} · 点此复制原文链接</Text>
            </View>

            {(a.thesis || (a.subPoints && a.subPoints.length > 0)) && (
              <View className='mv-block mv-thesis'>
                <Text className='mv-block-label mv-thesis-label'>🧭 论点结构</Text>
                {a.thesis && (
                  <View className='mv-thesis-line'>
                    <Text className='mv-thesis-tag'>总论点：</Text>
                    <Text className='mv-block-text'>{a.thesis}</Text>
                  </View>
                )}
                {a.subPoints.map((sp, si) => (
                  <View className='mv-thesis-line' key={si}>
                    <Text className='mv-thesis-tag'>分论点{si + 1}：</Text>
                    <Text className='mv-block-text'>{sp}</Text>
                  </View>
                ))}
              </View>
            )}

            {a.quotes && a.quotes.length > 0 && (
              <View className='mv-block mv-quotes'>
                <Text className='mv-block-label mv-quotes-label'>✍️ 金句摘录</Text>
                {a.quotes.map((q, qi) => (
                  <Text className='mv-quote-line' key={qi}>「{q}」</Text>
                ))}
              </View>
            )}

            {a.content && (
              <View className='mv-content'>
                <Text
                  className='mv-content-toggle'
                  onClick={() => setExpandedUrl(expandedUrl === a.url ? '' : a.url)}
                >
                  {expandedUrl === a.url ? '▲ 收起全文摘录' : '▼ 展开全文摘录'}
                </Text>
                {expandedUrl === a.url && (
                  <View className='mv-content-body'>
                    {a.content.split('\n').filter((p) => p.trim()).map((para, pi) => (
                      <Text className='mv-content-para' key={pi}>{para}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {a.analysis && (
              <View className='mv-block mv-analysis'>
                <Text className='mv-block-label mv-analysis-label'>🤖 AI 点评 · 申论应用</Text>
                <Text className='mv-block-text'>{a.analysis}</Text>
              </View>
            )}
          </View>
        ))}

        {filtered.length === 0 && (
          <View className='mv-status'>
            <Text className='mv-status-text'>该主题下暂无素材</Text>
          </View>
        )}

        <View className='mv-footer'>
          <Text className='mv-footer-text'>
            内容摘录自共产党员网、甘肃网理论频道、南方网评论频道，版权归原作者所有，仅作学习交流使用
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
