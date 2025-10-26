import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { uploadAPI, detectionAPI, reportAPI } from '../lib/api'
import { toast } from 'sonner'
import { FileText, Download, Eye, Clock, CheckCircle, AlertCircle, Loader2, BarChart3, ArrowRight } from 'lucide-react'

const Detect: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [detections, setDetections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDetection, setSelectedDetection] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchDetections()
  }, [])

  const fetchDetections = async () => {
    try {
      const response = await uploadAPI.getHistory()
      setDetections(response.data.detections)
    } catch (error) {
      toast.error('获取检测列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (detection: any) => {
    if (detection.status !== 'completed') {
      toast.info('检测尚未完成，请稍后再查看')
      return
    }

    try {
      const response = await detectionAPI.getResult(detection.id)
      setSelectedDetection(response.data)
      setShowModal(true)
    } catch (error) {
      toast.error('获取检测详情失败')
    }
  }

  const handleGenerateReport = async (detectionId: string) => {
    try {
      await reportAPI.generateReport(detectionId)
      toast.success('报告生成成功！')
      fetchDetections()
    } catch (error) {
      toast.error('生成报告失败')
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await reportAPI.downloadReport(reportId)
      
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `AI检测报告_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('下载报告失败')
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

  const getAIStatusColor = (aiRate: number) => {
    if (aiRate <= 5) return 'text-green-600 bg-green-100'
    if (aiRate <= 10) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI检测管理</h1>
          <p className="text-gray-600">管理和查看您的所有AI检测任务</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总检测数</p>
                <p className="text-2xl font-bold text-gray-900">{detections.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">
                  {detections.filter((d: any) => d.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {detections.filter((d: any) => d.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 检测列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">检测历史</h2>
            <button
              onClick={fetchDetections}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              刷新
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : detections.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">还没有检测记录</p>
              <p className="text-sm text-gray-500 mt-1">
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-500">
                  返回首页
                </Link>
                上传您的第一个文件开始检测吧！
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {detections.map((detection: any) => (
                <div key={detection.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(detection.status)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {detection.filename}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              上传时间：{formatDate(detection.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {detection.status === 'completed' && detection.report?.ai_rate !== undefined && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getAIStatusColor(detection.report.ai_rate)
                              }`}>
                                AI率：{detection.report.ai_rate.toFixed(1)}%
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              detection.status === 'completed' ? 'bg-green-100 text-green-800' :
                              detection.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              detection.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusText(detection.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(detection)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {detection.status === 'completed' && !detection.reports?.length && (
                        <button
                          onClick={() => handleGenerateReport(detection.id)}
                          className="text-green-600 hover:text-green-500 text-sm font-medium"
                        >
                          生成报告
                        </button>
                      )}
                      {detection.reports?.length > 0 && (
                        <button
                          onClick={() => handleDownloadReport(detection.reports[0].id)}
                          className="text-purple-600 hover:text-purple-500 text-sm font-medium flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          下载报告
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 详情模态框 */}
        {showModal && selectedDetection && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  检测详情 - {selectedDetection.filename}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {selectedDetection.report ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">整体AI率</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDetection.report.ai_rate?.toFixed(1) || 0}%
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">检测段落数</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDetection.report.segment_count || 0}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">平均置信度</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDetection.report.average_confidence?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </div>

                    {selectedDetection.report.analysis && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">分析总结</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-gray-700">{selectedDetection.report.analysis}</p>
                        </div>
                      </div>
                    )}

                    {selectedDetection.report.recommendations && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">建议</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-gray-700">{selectedDetection.report.recommendations}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">暂无详细检测数据</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Detect