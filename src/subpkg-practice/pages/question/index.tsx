import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'
import { completeDailyTask } from '../../../utils/dailyTask'
import { earnPoints } from '../../../utils/supply'

export default function Question() {
  const router = useRouter()
  const question = decodeURIComponent(router.params.question || '')
  const type = router.params.type || ''

  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [referenceAnswer, setReferenceAnswer] = useState('')
  const [generatingRef, setGeneratingRef] = useState(false)

  const handleGetReference = async () => {
    if (referenceAnswer) {
      // 已有参考答案，直接展示/隐藏切换
      return
    }

    setGeneratingRef(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: 'https://www.mianshidati.xyz/api/answers/generate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { question },
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
      setGeneratingRef(false)
    }
  }

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Taro.showToast({ title: '请输入作答内容', icon: 'none' })
      return
    }

    setLoading(true)
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
          question,
          userAnswer: answer.trim(),
          type,
        },
      })

      if (res.data.evaluation) {
        // 完成一次练习，计入每日任务
        completeDailyTask()
        // 发放学习点奖励
        earnPoints('answer', `answer-${Date.now()}`).catch((err) => {
          console.error('发放学习点失败:', err)
        })
        // 跳转到结果页面
        Taro.navigateTo({
          url: `/subpkg-practice/pages/result/index?result=${encodeURIComponent(JSON.stringify(res.data))}`,
        })
      } else {
        Taro.showToast({ title: res.data.error || '批改失败', icon: 'none' })
      }
    } catch (err) {
      console.error('批改失败:', err)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className='question-page' scrollY>
      {/* 题目区域 */}
      <View className='question-section'>
        <View className='question-header'>
          <View className='question-tag'>
            <Text className='tag-text'>面试题</Text>
          </View>
        </View>
        <Text className='question-text'>{question}</Text>
      </View>

      {/* 作答区域 */}
      <View className='answer-section'>
        <Text className='answer-label'>你的作答</Text>
        <Textarea
          className='answer-input'
          placeholder='请在此输入你的作答内容...'
          value={answer}
          onInput={(e) => setAnswer(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
        <Text className='answer-count'>{answer.length}/2000</Text>
      </View>

      {/* 参考答案区域 */}
      {referenceAnswer && (
        <View className='reference-section'>
          <View className='reference-header'>
            <Text className='reference-label'>参考答案</Text>
          </View>
          <Text className='reference-text'>{referenceAnswer}</Text>
        </View>
      )}

      {/* 底部按钮 */}
      <View className='footer'>
        <View className='btn-group'>
          <View
            className={`ref-btn ${referenceAnswer ? 'active' : ''}`}
            onClick={handleGetReference}
          >
            <Text className='ref-text'>
              {generatingRef ? '生成中...' : referenceAnswer ? '已显示参考答案' : '查看参考答案'}
            </Text>
          </View>
          <View
            className={`submit-btn ${answer.trim() ? 'active' : ''}`}
            onClick={handleSubmit}
          >
            <Text className='submit-text'>
              {loading ? 'AI批改中...' : '提交作答'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
