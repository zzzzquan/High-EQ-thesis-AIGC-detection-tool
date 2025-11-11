import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fileUploadRouter } from './routes/upload.ts'
import { detectRouter } from './routes/detect.ts'
import { reportRouter } from './routes/report.ts'
import { authRouter } from './routes/auth.ts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
})
app.use('/api/', limiter)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API路由
app.use('/api/auth', authRouter)
app.use('/api/upload', fileUploadRouter)
app.use('/api/detect', detectRouter)
app.use('/api/report', reportRouter)

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后再试'
  })
})

// 404处理（Express 5 兼容写法）
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`🌐 内网访问地址: http://10.1.114.89:${PORT}/api/health`)
})