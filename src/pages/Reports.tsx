import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { reportAPI } from '../lib/api'
import { toast } from 'sonner'
import { FileText, Download, Eye, Clock, Calendar, BarChart3, ArrowLeft } from 'lucide-react'

const Reports: React.FC = () => {
  const { user } = useAuthStore()
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await reportAPI.getReports()
      setReports(response.data.reports)
    } catch (error) {
      toast.error('获取报告列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewReport = async (report: any) => {
    try {
      setSelectedReport(report)
      setShowModal(true)
    } catch (error) {
      toast.error('查看报告失败')
    }
  }

  const handleDownloadReport = async (reportId: string, filename: string) => {
    try {
      const response = await reportAPI.downloadReport(reportId)
      
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('报告下载成功！')
    } catch (error) {
      toast.error('下载报告失败')
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">检测报告</h1>
              <p className="text-gray-600">查看和管理您的所有AI检测报告</p>
            </div>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回首页
            </Link>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总报告数</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均AI率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length > 0 
                    ? (reports.reduce((sum: number, report: any) => 
                        sum + (report.detection?.report?.ai_rate || 0), 0) / reports.length
                      ).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月报告</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((report: any) => {
                    const reportDate = new Date(report.created_at)
                    const now = new Date()
                    return reportDate.getMonth() === now.getMonth() && 
                           reportDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 报告列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">报告列表</h2>
            <button
              onClick={fetchReports}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              刷新
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 mx-auto text-blue-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">还没有检测报告</p>
              <p className="text-sm text-gray-500 mt-1">
                完成AI检测后，您可以在这里生成和查看报告。
              </p>
              <Link
                to="/detect"
                className="inline-block mt-4 text-blue-600 hover:text-blue-500 font-medium"
              >
                前往检测页面
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report: any) => (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {report.detection?.filename || '未知文件'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              生成时间：{formatDate(report.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {report.detection?.report?.ai_rate !== undefined && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getAIStatusColor(report.detection.report.ai_rate)
                              }`}>
                                AI率：{report.detection.report.ai_rate.toFixed(1)}%
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : '未知大小'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report.id, report.filename || `report_${report.id}.pdf`)}
                        className="text-green-600 hover:text-green-500 text-sm font-medium flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 报告详情模态框 */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  报告详情 - {selectedReport.detection?.filename || '未知文件'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {selectedReport.detection?.report ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">整体AI率</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedReport.detection.report.ai_rate?.toFixed(1) || 0}%
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">检测段落数</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedReport.detection.report.segment_count || 0}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">平均置信度</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedReport.detection.report.average_confidence?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </div>

                    {selectedReport.detection.report.analysis && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">分析总结</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-gray-700">{selectedReport.detection.report.analysis}</p>
                        </div>
                      </div>
                    )}

                    {selectedReport.detection.report.recommendations && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">建议</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-gray-700">{selectedReport.detection.report.recommendations}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          报告生成时间：{formatDate(selectedReport.created_at)}
                        </div>
                        <button
                          onClick={() => {
                            handleDownloadReport(selectedReport.id, selectedReport.filename || `report_${selectedReport.id}.pdf`)
                            setShowModal(false)
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          下载报告
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">暂无详细报告数据</p>
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

export default Reports