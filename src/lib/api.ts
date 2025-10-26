import axios, { AxiosInstance } from 'axios'

// API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

// 认证相关类型
interface RegisterData {
  email: string
  password: string
  name: string
}

interface LoginData {
  email: string
  password: string
}

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 认证失败，清除token并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name: string }) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data)
}

// 文件上传相关API
export const uploadAPI = {
  uploadFile: (formData: FormData) => 
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getHistory: () => 
    api.get('/upload/history')
}

// AI检测相关API
export const detectionAPI = {
  startDetection: (detectionId: string) => 
    api.post('/detect/start', { detectionId }),
  
  getStatus: (detectionId: string) => 
    api.get(`/detect/status/${detectionId}`),
  
  getResult: (detectionId: string) => 
    api.get(`/detect/result/${detectionId}`)
}

// 报告相关API
export const reportAPI = {
  generateReport: (detectionId: string) => 
    api.post(`/reports/${detectionId}/generate`),
  
  downloadReport: (reportId: string) => 
    api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    }),
  
  getReports: () => 
    api.get('/reports')
}

export default api