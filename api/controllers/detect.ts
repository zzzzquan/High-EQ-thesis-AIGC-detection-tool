import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'
import { highEQDetection } from '../services/detection.ts'
import { AuthRequest } from '../middleware/auth.ts'

// 开始检测
export const startDetection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { detectionId } = req.body

    if (!userId || !detectionId) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 检查检测记录是否存在且属于当前用户
    const { data: detection, error } = await supabaseAdmin
      .from('detections')
      .select('*')
      .eq('id', detectionId)
      .eq('user_id', userId)
      .single()

    if (error || !detection) {
      return res.status(404).json({ error: '检测记录不存在' })
    }

    if (detection.status !== 'pending') {
      return res.status(400).json({ error: '检测状态无效' })
    }

    // 更新状态为处理中
    await supabaseAdmin
      .from('detections')
      .update({ status: 'processing' })
      .eq('id', detectionId)

    // 异步执行检测
    setImmediate(async () => {
      try {
        const result = await highEQDetection(detection)
        
        // 保存检测结果
        await supabaseAdmin
          .from('detections')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', detectionId)

        console.log(`检测完成: ${detectionId}, AI率: ${result.overallAIRate}%`)
      } catch (error) {
        console.error('检测失败:', error)
        
        await supabaseAdmin
          .from('detections')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', detectionId)
      }
    })

    res.json({ 
      message: '检测已开始',
      detectionId,
      status: 'processing'
    })

  } catch (error) {
    console.error('开始检测错误:', error)
    res.status(500).json({ error: '开始检测失败' })
  }
}

// 获取检测状态
export const getDetectionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { detectionId } = req.params

    if (!userId || !detectionId) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const { data: detection, error } = await supabaseAdmin
      .from('detections')
      .select(`
        *,
        segments (
          id,
          content,
          ai_probability,
          confidence_score,
          segment_type,
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

    if (error || !detection) {
      return res.status(404).json({ error: '检测记录不存在' })
    }

    res.json({ detection })

  } catch (error) {
    console.error('获取检测状态错误:', error)
    res.status(500).json({ error: '获取检测状态失败' })
  }
}

// 获取检测结果
export const getDetectionResult = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { detectionId } = req.params

    if (!userId || !detectionId) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        detection:detections (
          id,
          file_name,
          file_size,
          created_at
        )
      `)
      .eq('detection_id', detectionId)
      .single()

    if (error || !report) {
      return res.status(404).json({ error: '检测报告不存在' })
    }

    // 验证权限
    if (report.detection.user_id !== userId) {
      return res.status(403).json({ error: '无权访问此报告' })
    }

    res.json({ report })

  } catch (error) {
    console.error('获取检测结果错误:', error)
    res.status(500).json({ error: '获取检测结果失败' })
  }
}