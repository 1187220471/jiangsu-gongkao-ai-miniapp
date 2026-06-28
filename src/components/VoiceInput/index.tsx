import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState, useEffect, useRef, useCallback } from 'react'

const SpeechTranscription = require('../../utils/aliyun-nls/st')

const NLS_URL = 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1'
const API_BASE = 'https://www.mianshidati.xyz'

interface VoiceInputProps {
  onTextChange: (text: string) => void
  value: string
  placeholder?: string
}

/* ====== 内联样式（Taro 自定义组件样式不会被编译进 wxss，必须内联） ====== */

const STYLES = {
  container: { margin: '12px 0' } as React.CSSProperties,

  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#ef4444',
  } as React.CSSProperties,

  retryText: {
    marginLeft: '8px',
    color: '#dc2626',
    textDecoration: 'underline',
    fontWeight: '500',
  } as React.CSSProperties,

  interimBox: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '8px',
  } as React.CSSProperties,

  interimLabel: {
    fontSize: '12px',
    color: '#0284c7',
    fontWeight: '500',
    marginRight: '4px',
  } as React.CSSProperties,

  interimText: {
    fontSize: '14px',
    color: '#0c4a6e',
  } as React.CSSProperties,

  buttonBase: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '50px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
  } as React.CSSProperties,

  buttonDefault: {
    background: '#f2f2f2',
  } as React.CSSProperties,

  buttonRecording: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
  } as React.CSSProperties,

  buttonDisabled: {
    opacity: 0.6,
    background: '#e5e5e5',
  } as React.CSSProperties,

  buttonText: {
    fontSize: '18px',
    color: '#1a1a1a',
    fontWeight: '500',
    letterSpacing: '2px',
  } as React.CSSProperties,

  buttonTextRecording: {
    color: '#ffffff',
  } as React.CSSProperties,
}

export default function VoiceInput({ onTextChange, value, placeholder = '按住 说话' }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [initing, setIniting] = useState(true)

  const stRef = useRef<any>(null)
  const recorderRef = useRef<any>(null)
  const tokenRef = useRef<string>('')
  const appKeyRef = useRef<string>('')
  const audioBufferRef = useRef<ArrayBuffer[]>([])
  const recordingLockRef = useRef(false)
  const interimTextRef = useRef('')
  const resultAppliedRef = useRef(false)

  const fetchToken = useCallback(async () => {
    setIniting(true)
    setError('')
    try {
      const token = Taro.getStorageSync('token')
      const res = await Taro.request({
        url: `${API_BASE}/api/voice/aliyun-token`,
        header: { Authorization: `Bearer ${token}` },
        timeout: 35000,
      })
      if (res.data && res.data.token && res.data.appKey) {
        tokenRef.current = res.data.token
        appKeyRef.current = res.data.appKey
        setReady(true)
        setError('')
      } else {
        throw new Error(res.data?.error || '获取Token失败')
      }
    } catch (e: any) {
      console.error('获取Token失败:', e)
      setReady(false)
      setError('语音识别服务初始化失败，请检查网络后重试')
    } finally {
      setIniting(false)
    }
  }, [])

  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  useEffect(() => {
    const recorder = Taro.getRecorderManager()
    recorderRef.current = recorder

    const handleFrame = (res: any) => {
      if (!res.frameBuffer) return
      const st = stRef.current
      if (!st || !st.sendAudio(res.frameBuffer)) {
        audioBufferRef.current.push(res.frameBuffer)
      }
    }

    const handleStart = () => setIsRecording(true)

    const handleStop = () => {
      const st = stRef.current
      stRef.current = null
      audioBufferRef.current = []
      if (st) {
        st.close().catch(() => {})
      }
      setIsRecording(false)
      recordingLockRef.current = false
    }

    const handleError = (err: any) => {
      console.error('录音错误:', err)
      setError(`录音失败：${err?.message || '请重试'}`)
      setIsRecording(false)
      recordingLockRef.current = false
    }

    recorder.onFrameRecorded(handleFrame)
    recorder.onStart(handleStart)
    recorder.onStop(handleStop)
    recorder.onError(handleError)

    return () => {
      try { recorder.stop() } catch (e) {}
    }
  }, [])

  const applyFinalText = useCallback((text: string) => {
    if (!text || resultAppliedRef.current) return
    onTextChange((prev) => prev + (prev ? ' ' : '') + text)
    resultAppliedRef.current = true
  }, [onTextChange])

  const initST = useCallback(async () => {
    if (!tokenRef.current || !appKeyRef.current) {
      await fetchToken()
    }
    if (!tokenRef.current || !appKeyRef.current) {
      throw new Error('语音识别服务未就绪')
    }

    const st = new SpeechTranscription({
      url: NLS_URL,
      appkey: appKeyRef.current,
      token: tokenRef.current,
    })

    st.on('started', () => {
      const buffer = audioBufferRef.current
      audioBufferRef.current = []
      buffer.forEach((frame) => st.sendAudio(frame))
    })

    st.on('changed', (msg: string) => {
      try {
        const obj = JSON.parse(msg)
        if (obj.payload && obj.payload.result) {
          setInterimText(obj.payload.result)
          interimTextRef.current = obj.payload.result
        }
      } catch (e) {}
    })

    st.on('completed', (msg: string) => {
      try {
        const obj = JSON.parse(msg)
        const finalText = (obj.payload && obj.payload.result) || interimTextRef.current
        applyFinalText(finalText)
      } catch (e) {}
      setInterimText('')
      interimTextRef.current = ''
      setIsRecording(false)
      recordingLockRef.current = false
    })

    st.on('failed', (msg: string) => {
      console.error('语音识别失败:', msg)
      applyFinalText(interimTextRef.current)
      setInterimText('')
      interimTextRef.current = ''
      setError('语音识别失败，请重试')
      setIsRecording(false)
      recordingLockRef.current = false
    })

    st.on('closed', () => {
      applyFinalText(interimTextRef.current)
      setInterimText('')
      interimTextRef.current = ''
      setIsRecording(false)
      recordingLockRef.current = false
    })

    return st
  }, [fetchToken, applyFinalText])

  const startRecording = useCallback(async () => {
    if (recordingLockRef.current) return

    if (!ready) {
      setError('语音识别服务未就绪，请稍后重试')
      return
    }

    setError('')
    recordingLockRef.current = true

    try {
      const { authSetting } = await Taro.getSetting()
      if (!authSetting['scope.record']) {
        await Taro.authorize({ scope: 'scope.record' })
      }

      audioBufferRef.current = []
      interimTextRef.current = ''
      resultAppliedRef.current = false
      setInterimText('')

      recorderRef.current.start({
        duration: 600000,
        numberOfChannels: 1,
        sampleRate: 16000,
        format: 'PCM',
        frameSize: 8,
      })

      const st = await initST()
      stRef.current = st
      await st.start(st.defaultStartParams())
    } catch (e: any) {
      console.error('启动录音失败:', e)
      setError(`启动录音失败：${e?.message || '请检查权限'}`)
      setIsRecording(false)
      recordingLockRef.current = false
      try { recorderRef.current?.stop() } catch (err) {}
    }
  }, [initST, ready])

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop()
    }
  }, [])

  const buttonText = isRecording
    ? '松开 结束'
    : initing
      ? '服务初始化中'
      : ready
        ? placeholder
        : '服务不可用，请重试'

  // 按钮样式合并
  const buttonStyle = {
    ...STYLES.buttonBase,
    ...(isRecording ? STYLES.buttonRecording : !ready ? STYLES.buttonDisabled : STYLES.buttonDefault),
  }

  const textStyle = {
    ...STYLES.buttonText,
    ...(isRecording ? STYLES.buttonTextRecording : {}),
  }

  return (
    <View style={STYLES.container}>
      {error && (
        <View style={STYLES.errorBox}>
          <Text>{error}</Text>
          {!ready && (
            <Text style={STYLES.retryText} onTap={fetchToken}>点击重试</Text>
          )}
        </View>
      )}

      {interimText && (
        <View style={STYLES.interimBox}>
          <Text style={STYLES.interimLabel}>识别中：</Text>
          <Text style={STYLES.interimText}>{interimText}</Text>
        </View>
      )}

      <View
        style={buttonStyle}
        onTouchStart={ready ? startRecording : undefined}
        onTouchEnd={stopRecording}
        onTouchCancel={stopRecording}
      >
        <Text style={textStyle}>{buttonText}</Text>
      </View>
    </View>
  )
}
