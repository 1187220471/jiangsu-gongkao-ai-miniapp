import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components'
import VoiceInput from '../../../components/VoiceInput'
import './index.scss'

const API_BASE = 'https://www.mianshidati.xyz'

export default function ShenlunDetail() {
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('material')
  const [answerTab, setAnswerTab] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showAllMaterials, setShowAllMaterials] = useState(false)
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({})
  const [expandedWrite, setExpandedWrite] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)

  const router = Taro.getCurrentInstance().router
  const id = router?.params?.id

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: `${API_BASE}/api/shenlun/detail/${id}`,
        method: 'GET',
        header: { Authorization: `Bearer ${token}` },
      })

      if (res.statusCode === 200 && res.data?.question) {
        setQuestion(res.data.question)
      }
    } catch (err) {
      console.error('Fetch detail error:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      Taro.showToast({ title: '请输入作答内容', icon: 'none' })
      return
    }
    setEvaluating(true)
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: `${API_BASE}/api/shenlun/evaluate`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: { questionId: Number(id), userAnswer: userAnswer.trim() },
      })

      if (res.statusCode === 200 && res.data) {
        setResult(res.data)
        setActiveTab('result')
        Taro.showToast({ title: '批改完成', icon: 'success' })
      } else {
        Taro.showToast({ title: res.data?.error || '批改失败', icon: 'none' })
      }
    } catch (err) {
      console.error('Evaluate error:', err)
      Taro.showToast({ title: '批改失败', icon: 'none' })
    } finally {
      setEvaluating(false)
    }
  }

  const handleOcr = async () => {
    try {
      const { tempFiles } = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      })
      if (!tempFiles || tempFiles.length === 0) return

      setOcrLoading(true)
      let filePath = tempFiles[0].tempFilePath

      // 压缩图片：长边 max 2000px，质量 0.85，与网页端一致
      try {
        const compressRes = await Taro.compressImage({
          src: filePath,
          quality: 85,
          compressedWidth: 2000,
        })
        filePath = compressRes.tempFilePath
      } catch (compressErr) {
        console.warn('压缩图片失败，使用原图:', compressErr)
      }

      // 读取压缩后的图片为 base64
      const fs = Taro.getFileSystemManager()
      const base64 = fs.readFileSync(filePath, 'base64')

      // 发送 base64 到后端 OCR 接口
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: `${API_BASE}/api/shenlun/ocr`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: { image: `data:image/jpeg;base64,${base64}` },
      })

      if (res.statusCode === 200 && res.data?.text) {
        setUserAnswer(res.data.text)
        setExpandedWrite(true)
        Taro.showToast({ title: '识别成功', icon: 'success' })
      } else {
        Taro.showToast({ title: res.data?.error || '识别失败', icon: 'none' })
      }
    } catch (err) {
      console.error('OCR error:', err)
      Taro.showToast({ title: '识别失败', icon: 'none' })
    } finally {
      setOcrLoading(false)
    }
  }
  const toggleMaterial = (num: string) => {
    setExpandedMaterials((prev) => ({ ...prev, [num]: !prev[num] }))
  }

  if (loading) {
    return (
      <View className='shenlun-detail'>
        <View className='loading'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!question) {
    return (
      <View className='shenlun-detail'>
        <View className='empty'>
          <Text className='empty-text'>题目不存在</Text>
        </View>
      </View>
    )
  }

  const materials = question.materials || []
  const answers = question.answers || []
  const aiAnswer = answers.find((a: any) => a.teacherName === 'AI参考答案')
  const teacherAnswers = answers.filter((a: any) => a.teacherName !== 'AI参考答案')

  const tabs = [
    { key: 'material', label: '材料' },
    { key: 'question', label: '题目' },
    { key: 'answer', label: '答案' },
    { key: 'write', label: '作答' },
  ]

  if (result) {
    tabs.push({ key: 'result', label: '批改' })
  }

  return (
    <View className='shenlun-detail'>
      {/* 顶部信息 */}
      <View className='header'>
        <Text className='header-title'>{question.examTitle}</Text>
        <View className='header-meta'>
          <Text className='meta-text'>{question.examYear}年</Text>
          <Text className='meta-text'>{question.questionType}</Text>
          <Text className='meta-text'>{question.score}分</Text>
          <Text className='meta-text'>{question.wordLimit}字</Text>
        </View>
      </View>

      {/* Tab 导航 */}
      <View className='tab-nav'>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'tab-active' : ''}`}
            onTap={() => {
              setActiveTab(tab.key)
              if (tab.key === 'write') {
                setExpandedWrite(true)
              }
            }}
          >
            <Text className='tab-text'>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 内容区 */}
      <ScrollView scrollY className='content-scroll'>
        {/* 材料 */}
        {activeTab === 'material' && (
          <View className='section'>
            <Text className='section-title'>给定材料</Text>
            {materials.map((m: any) => (
              <View key={m.materialNum} className='material-item'>
                <View className='material-header' onClick={() => toggleMaterial(String(m.materialNum))}>
                  <Text className='material-num'>材料 {m.materialNum}</Text>
                  <Text className='material-toggle'>{expandedMaterials[String(m.materialNum)] ? '收起' : '展开'}</Text>
                </View>
                {expandedMaterials[String(m.materialNum)] && (
                  <Text className='material-content'>{m.content}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 题目 */}
        {activeTab === 'question' && (
          <View className='section'>
            <Text className='section-title'>题目</Text>
            <View className='question-box'>
              <Text className='question-text'>{question.questionText}</Text>
            </View>
            {question.materialRange && (
              <Text className='range-text'>作答范围：{question.materialRange}</Text>
            )}
          </View>
        )}

        {/* 答案 */}
        {activeTab === 'answer' && (
          <View className='section'>
            <Text className='section-title'>参考答案</Text>
            {/* 答案 Tab 切换 */}
            <View className='answer-tabs'>
              {answers.map((a: any, idx: number) => (
                <View
                  key={a.id}
                  className={`answer-tab ${answerTab === idx ? 'answer-tab-active' : ''}`}
                  onClick={() => setAnswerTab(idx)}
                >
                  <Text className='answer-tab-text'>{a.teacherName}</Text>
                </View>
              ))}
            </View>
            {answers[answerTab] && (
              <View className='answer-content'>
                <Text className='answer-text'>{answers[answerTab].answerText}</Text>
              </View>
            )}
          </View>
        )}

        {/* 作答 */}
        {activeTab === 'write' && (
          <View className='section'>
            <View className='write-header' onClick={() => setExpandedWrite(!expandedWrite)}>
              <Text className='section-title'>我的作答</Text>
              <Text className='write-toggle'>{expandedWrite ? '收起' : '展开'}</Text>
            </View>
            
            {expandedWrite && (
              <>
                <Text className='word-limit'>字数限制：{question.wordLimit}字</Text>
                
                {/* OCR 识别按钮 */}
                <View className='ocr-btn' onClick={handleOcr}>
                  <Text className='ocr-icon'>📷</Text>
                  <Text className='ocr-text'>{ocrLoading ? '识别中...' : '拍照识别作答'}</Text>
                </View>
                
                <Textarea
                  className='answer-input'
                  placeholder='请输入你的作答内容，或点击上方拍照识别/语音输入...'
                  value={userAnswer}
                  onInput={(e) => setUserAnswer(e.detail.value)}
                  maxlength={5000}
                />
                <Text className='word-count'>已输入 {userAnswer.length} 字</Text>

                {/* 语音输入 */}
                <VoiceInput
                  value={userAnswer}
                  onTextChange={setUserAnswer}
                  placeholder='按住 说话'
                />

                <Button
                  className='submit-btn'
                  onClick={handleEvaluate}
                  disabled={evaluating}
                >
                  {evaluating ? '批改中...' : '提交AI批改'}
                </Button>
              </>
            )}
          </View>
        )}

        {/* 批改结果 */}
        {activeTab === 'result' && result && (
          <View className='section'>
            <Text className='section-title'>AI 批改结果</Text>

            {/* 总分 */}
            <View className='score-card'>
              <Text className='score-value'>{result.score}</Text>
              <Text className='score-label'>总分</Text>
            </View>

            {/* 维度得分 */}
            {result.dimensions && (
              <View className='dimensions'>
                {Object.entries(result.dimensions).map(([key, val]: [string, any]) => (
                  <View key={key} className='dimension-item'>
                    <Text className='dimension-name'>{key}</Text>
                    <Text className='dimension-score'>{val}分</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI 点评 */}
            {result.evaluation && (
              <View className='result-block'>
                <Text className='block-title'>点评</Text>
                <Text className='block-text'>{result.evaluation}</Text>
              </View>
            )}

            {/* 改进版 */}
            {result.improvedAnswer && (
              <View className='result-block'>
                <Text className='block-title'>改进版答案</Text>
                <Text className='block-text'>{result.improvedAnswer}</Text>
              </View>
            )}

            {/* 逐句批改 */}
            {result.sentenceComments && result.sentenceComments.length > 0 && (
              <View className='result-block'>
                <Text className='block-title'>逐句批改</Text>
                {result.sentenceComments.map((item: any, idx: number) => (
                  <View key={idx} className='sentence-item'>
                    <Text className='sentence-text'>{item.sentence}</Text>
                    <Text className={`sentence-comment ${item.type === 'error' ? 'comment-error' : item.type === 'warning' ? 'comment-warning' : 'comment-good'}`}>
                      {item.comment}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
