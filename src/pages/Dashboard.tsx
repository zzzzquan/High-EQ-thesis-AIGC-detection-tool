import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { uploadAPI, detectionAPI } from '../lib/api'
import { toast } from 'sonner'
import { Upload, FileText, Clock, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await uploadAPI.getHistory()
      setHistory(response.data.detections)
    } catch (error) {
      toast.error('获取历史记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.name.match(/\.(txt|docx|pdf)$/i)) {
      toast.error('请上传 .txt, .docx 或 .pdf 文件')
      return
    }

    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过10MB')
      return
    }

    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await uploadAPI.uploadFile(formData)
      toast.success('文件上传成功！正在开始检测...')
      
      // 开始检测
      await startDetection(response.data.detectionId)
      
      // 刷新历史记录
      await fetchHistory()
    } catch (error: any) {
      toast.error(error.response?.data?.error || '文件上传失败')
    } finally {
      setUploadingFile(false)
      event.target.value = ''
    }
  }

  const startDetection = async (detectionId: string) => {
    try {
      await detectionAPI.startDetection(detectionId)
      toast.success('AI检测已启动，请稍候...')
    } catch (error) {
      toast.error('启动检测失败')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待检测'
      case 'processing':
        return '检测中...'
      case 'completed':
        return '检测完成'
      case 'failed':
        return '检测失败'
      default:
        return '未知状态'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                欢迎回来，{user?.name}！
              </h1>
              <p className="text-gray-600">
                您当前的使用情况：{user?.usageCount || 0} / {user?.maxUsage || 10} 次检测
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">账户类型</div>
              <div className="text-lg font-semibold text-blue-600">
                {user?.plan === 'premium' ? '高级版' : '基础版'}
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">上传检测</h3>
            </div>
            <p className="text-gray-600 mb-4">
              上传您的论文文档，开始AI率检测
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingFile || (user?.usageCount || 0) >= (user?.maxUsage || 10)}
              />
              <div className={`w-full text-center py-2 px-4 border border-transparent rounded-lg font-medium transition-colors ${
                uploadingFile || (user?.usageCount || 0) >= (user?.maxUsage || 10)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {uploadingFile ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    上传中...
                  </div>
                ) : (user?.usageCount || 0) >= (user?.maxUsage || 10) ? (
                  '使用次数已满'
                ) : (
                  '选择文件'
                )}
              </div>
            </label>
          </div>

          <Link to="/detect" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">检测管理</h3>
            </div>
            <p className="text-gray-600 mb-4">
              查看和管理您的检测任务
            </p>
            <div className="text-blue-600 font-medium flex items-center">
              立即查看 <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>

          <Link to="/reports" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">报告中心</h3>
            </div>
            <p className="text-gray-600 mb-4">
              查看和下载检测报告
            </p>
            <div className="text-blue-600 font-medium flex items-center">
              查看报告 <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </div>

        {/* 检测历史 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">最近检测历史</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">还没有检测记录</p>
              <p className="text-sm text-gray-500 mt-1">上传您的第一个文件开始检测吧！</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {history.slice(0, 5).map((item: any) => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.filename}
                          </h3>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'completed' && item.report?.ai_rate !== undefined
                                ? item.report.ai_rate <= 5 
                                  ? 'bg-green-100 text-green-800'
                                  : item.report.ai_rate <= 10
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status === 'completed' && item.report?.ai_rate !== undefined
                                ? `AI率: ${item.report.ai_rate.toFixed(1)}%`
                                : getStatusText(item.status)
                              }
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>
                        {item.status === 'completed' && item.report && (
                          <div className="mt-2 text-sm text-gray-600">
                            检测到 {item.report.segment_count} 个段落，
                            平均置信度 {item.report.average_confidence?.toFixed(1) || 0}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {history.length > 5 && (
            <div className="px-6 py-4 border-t border-gray-200 text-center">
              <Link to="/detect" className="text-blue-600 hover:text-blue-500 font-medium">
                查看全部历史记录
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard