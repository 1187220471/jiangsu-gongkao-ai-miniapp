import Taro from '@tarojs/taro'

const API_BASE = 'https://www.mianshidati.xyz'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  auth?: boolean
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.auth !== false && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await Taro.request({
    url: options.url.startsWith('http') ? options.url : `${API_BASE}${options.url}`,
    method: options.method || 'GET',
    header: headers,
    data: options.data,
  })

  if (res.statusCode >= 400 || res.data.error) {
    throw new Error(res.data.error || `请求失败: ${res.statusCode}`)
  }

  return res.data as T
}
