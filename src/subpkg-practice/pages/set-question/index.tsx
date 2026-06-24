import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface SetQuestion {
  index: number
  type: string
  typeName: string
  question: string
}

interface SetData {
  mode: string
  name: string
  time: string
  questions: SetQuestion[]
}

interface EvaluationResult {
  score: number
  evaluation: string
  improvedAnswer: string
  referenceAnswer: string
}

export default function SetQuestionPage() {
  const router = useRouter()
  const [setData, setSetData] = useState<SetData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [evaluating, setEvaluating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    try {
      const data = JSON.parse(decodeURIComponent(router.params.data || '{}'))
      if (data.questions) {
        setSetData(data)
        setAnswers(new Array(data.questions.length).fill(''))
      }
    } catch (err) {
      console.error('解析套题数据失败:', err)
      Taro.showToast({ title: '数据加载失败', icon: 'none' })
    }
  }, [])

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = value
    setAnswers(newAnswers)
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (!setData) return
    if (currentIndex < setData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmitAll = async () => {
    if (!setData) return

    // 检查是否所有题都作答
    const emptyIndexes = answers
      .map((a, i) => (a.trim() ? -1 : i + 1))
      .filter((i) => i !== -1)

    if (emptyIndexes.length > 0) {
      Taro.showModal({
        title: '还有题目未作答',
        content: `第 ${emptyIndexes.join('、')} 题尚未作答，是否继续提交？`,
        confirmText: '继续提交',
        cancelText: '去作答',
        success: (res) => {
          if (res.confirm) {
            doEvaluate()
          }
        },
      })
    } else {
      doEvaluate()
    }
  }

  const doEvaluate = async () => {
    if (!setData) return

    setEvaluating(true)
    setProgress(0)

    const results: EvaluationResult[] = []
    const token = Taro.getStorageSync('token')

    for (let i = 0; i < setData.questions.length; i++) {
      const q = setData.questions[i]
      const userAnswer = answers[i] || ''

      try {
        const res = await Taro.request({
          url: 'https://www.mianshidati.xyz/api/evaluate',
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: {
            question: q.question,
            userAnswer: userAnswer.trim(),
            type: q.type,
          },
        })

        if (res.data.evaluation) {
          results.push({
            score: res.data.score,
            evaluation: res.data.evaluation,
            improvedAnswer: res.data.improvedAnswer || '',
            referenceAnswer: res.data.referenceAnswer || '',
          })
        } else {
          results.push({
            score: 0,
            evaluation: res.data.error || '批改失败',
            improvedAnswer: '',
            referenceAnswer: '',
          })
        }
      } catch (err) {
        console.error(`第${i + 1}题批改失败:`, err)
        results.push({
          score: 0,
          evaluation: '网络错误，批改失败',
          improvedAnswer: '',
          referenceAnswer: '',
        })
      }

      setProgress(Math.round(((i + 1) / setData.questions.length) * 100))
    }

    setEvaluating(false)

    // 跳转到结果页
    Taro.navigateTo({
      url: `/subpkg-practice/pages/set-result/index?results=${encodeURIComponent(JSON.stringify(results))}&questions=${encodeURIComponent(JSON.stringify(setData.questions))}&answers=${encodeURIComponent(JSON.stringify(answers))}`,
    })
  }

  if (!setData) {
    return (
      <View className='set-question-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  const currentQuestion = setData.questions[currentIndex]
  const answeredCount = answers.filter((a) => a.trim()).length

  return (
    <ScrollView className='set-question-page' scrollY>
      {/* 顶部信息 */}
      <View className='set-header'>
        <Text className='set-name'>{setData.name}</Text>
        <Text className='set-progress'>
          第 {currentIndex + 1}/{setData.questions.length} 题 · 已答 {answeredCount}/{setData.questions.length}
        </Text>
      </View>

      {/* 题目导航 */}
      <View className='question-nav'>
        {setData.questions.map((q, i) => (
          <View
            key={q.index}
            className={`nav-item ${i === currentIndex ? 'active' : ''} ${answers[i]?.trim() ? 'answered' : ''}`}
            onClick={() => setCurrentIndex(i)}
          >
            <Text className='nav-text'>{i + 1}</Text>
          </View>
        ))}
      </View>

      {/* 当前题目 */}
      <View className='question-card'>
        <View className='question-meta'>
          <Text className='question-type'>{currentQuestion.typeName}</Text>
          <Text className='question-index'>第 {currentQuestion.index} 题</Text>
        </View>
        <Text className='question-text'>{currentQuestion.question}</Text>
      </View>

      {/* 作答区 */}
      <View className='answer-section'>
        <Text className='answer-label'>你的作答</Text>
        <Textarea
          className='answer-input'
          placeholder='请在此输入你的作答内容...'
          value={answers[currentIndex] || ''}
          onInput={(e) => handleAnswerChange(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
        <Text className='answer-count'>{(answers[currentIndex] || '').length}/2000</Text>
      </View>

      {/* 导航按钮 */}
      <View className='nav-buttons'>
        <View
          className={`nav-btn ${currentIndex === 0 ? 'disabled' : ''}`}
          onClick={handlePrev}
        >
          <Text className='nav-btn-text'>上一题</Text>
        </View>
        {currentIndex < setData.questions.length - 1 ? (
          <View className='nav-btn primary' onClick={handleNext}>
            <Text className='nav-btn-text'>下一题</Text>
          </View>
        ) : (
          <View className='nav-btn submit' onClick={handleSubmitAll}>
            <Text className='nav-btn-text'>提交整套</Text>
          </View>
        )}
      </View>

      {/* 批改中弹窗 */}
      {evaluating && (
        <View className='evaluating-mask'>
          <View className='evaluating-content'>
            <Text className='evaluating-title'>AI正在批改</Text>
            <View className='progress-bar'>
              <View className='progress-fill' style={{ width: `${progress}%` }} />
            </View>
            <Text className='evaluating-text'>{progress}%</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}
