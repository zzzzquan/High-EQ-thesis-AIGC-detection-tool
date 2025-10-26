import { Request, Response } from 'express'
import multer from 'multer'
import { supabaseAdmin } from '../lib/supabase.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { randomUUID } from 'crypto'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只接受PDF和文本文件
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型，只接受PDF、TXT和Markdown文件'))
    }
  }
})

// 上传文件
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: '未授权' })
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({ error: '未上传文件' })
    }

    // 检查用户使用次数
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('usage_count, max_usage')
      .eq('id', userId)
      .single()

    if (!user || user.usage_count >= user.max_usage) {
      return res.status(403).json({ 
        error: '使用次数已达上限', 
        usageCount: user?.usage_count || 0,
        maxUsage: user?.max_usage || 3
      })
    }

    // 生成唯一文件名
    const fileName = `${randomUUID()}_${file.originalname}`
    const filePath = `uploads/${userId}/${fileName}`

    // 上传到Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('thesis-files')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      throw error
    }

    // 获取文件URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('thesis-files')
      .getPublicUrl(filePath)

    // 创建检测记录
    const { data: detection } = await supabaseAdmin
      .from('detections')
      .insert([{
        user_id: userId,
        file_name: file.originalname,
        file_url: publicUrl,
        file_path: filePath,
        file_size: file.size,
        file_type: file.mimetype,
        status: 'pending'
      }])
      .select()
      .single()

    // 更新用户使用次数
    await supabaseAdmin
      .from('users')
      .update({ usage_count: user.usage_count + 1 })
      .eq('id', userId)

    res.json({
      detectionId: detection.id,
      fileName: file.originalname,
      fileSize: file.size,
      fileUrl: publicUrl,
      status: 'pending',
      usageCount: user.usage_count + 1,
      maxUsage: user.max_usage
    })

  } catch (error) {
    console.error('文件上传错误:', error)
    res.status(500).json({ error: '文件上传失败' })
  }
}

// 获取上传历史
export const getUploadHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data: detections, error } = await supabaseAdmin
      .from('detections')
      .select(`
        *,
        reports (
          id,
          ai_rate,
          confidence_score,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    res.json({ detections })

  } catch (error) {
    console.error('获取上传历史错误:', error)
    res.status(500).json({ error: '获取上传历史失败' })
  }
}

export { upload }