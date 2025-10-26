import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'
import { AuthRequest } from '../middleware/auth.ts'
import { generatePDFReport } from '../services/pdf.ts'

// 生成报告
export const generateReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { detectionId } = req.body

    if (!userId || !detectionId) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 检查检测记录是否存在且已完成
    const { data: detection, error: detectionError } = await supabaseAdmin
      .from('detections')
      .select(`
        *,
        segments (
          id,
          content,
          ai_probability,
          confidence_score,
          segment_type,
          start_index,
          end_index,
          created_at
        ),
        reports (
          id,
          ai_rate,
          confidence_score,
          detailed_analysis,
          created_at
        )
      `)
      .eq('id', detectionId)
      .eq('user_id', userId)
      .single()

    if (detectionError || !detection) {
      return res.status(404).json({ error: '检测记录不存在' })
    }

    if (detection.status !== 'completed') {
      return res.status(400).json({ error: '检测未完成，无法生成报告' })
    }

    // 如果已有报告，直接返回
    if (detection.reports && detection.reports.length > 0) {
      const report = detection.reports[0]
      return res.json({
        reportId: report.id,
        downloadUrl: report.file_url,
        aiRate: report.ai_rate,
        confidenceScore: report.confidence_score,
        createdAt: report.created_at
      })
    }

    // 生成PDF报告
    const pdfBuffer = await generatePDFReport(detection)

    // 上传到Supabase Storage
    const fileName = `report_${detectionId}_${Date.now()}.pdf`
    const filePath = `reports/${userId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('reports')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // 获取报告URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('reports')
      .getPublicUrl(filePath)

    // 保存报告记录
    const { data: report } = await supabaseAdmin
      .from('reports')
      .insert([{
        detection_id: detectionId,
        ai_rate: detection.reports?.[0]?.ai_rate || 0,
        confidence_score: detection.reports?.[0]?.confidence_score || 0,
        detailed_analysis: detection.reports?.[0]?.detailed_analysis || {},
        file_url: publicUrl,
        file_path: filePath
      }])
      .select()
      .single()

    res.json({
      reportId: report.id,
      downloadUrl: publicUrl,
      aiRate: report.ai_rate,
      confidenceScore: report.confidence_score,
      createdAt: report.created_at
    })

  } catch (error) {
    console.error('生成报告错误:', error)
    res.status(500).json({ error: '生成报告失败' })
  }
}

// 下载报告
export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { reportId } = req.params

    if (!userId || !reportId) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        detection:detections (
          user_id
        )
      `)
      .eq('id', reportId)
      .single()

    if (error || !report) {
      return res.status(404).json({ error: '报告不存在' })
    }

    // 验证权限
    if (report.detection.user_id !== userId) {
      return res.status(403).json({ error: '无权访问此报告' })
    }

    // 从Supabase下载文件
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('reports')
      .download(report.file_path)

    if (downloadError) {
      throw downloadError
    }

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="AI检测报告_${reportId}.pdf"`)
    
    // 发送文件
    const buffer = Buffer.from(await fileData.arrayBuffer())
    res.send(buffer)

  } catch (error) {
    console.error('下载报告错误:', error)
    res.status(500).json({ error: '下载报告失败' })
  }
}

// 获取报告列表
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        detection:detections (
          file_name,
          file_size,
          created_at
        )
      `)
      .eq('detection.user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    res.json({ reports })

  } catch (error) {
    console.error('获取报告列表错误:', error)
    res.status(500).json({ error: '获取报告列表失败' })
  }
}