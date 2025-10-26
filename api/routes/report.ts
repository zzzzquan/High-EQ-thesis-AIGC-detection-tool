import { Router } from 'express'
import { generateReport, downloadReport, getReports } from '../controllers/report.ts'
import { authMiddleware } from '../middleware/auth.ts'

const router = Router()

// 生成报告
router.post('/generate', authMiddleware, generateReport)

// 下载报告
router.get('/download/:reportId', authMiddleware, downloadReport)

// 获取报告列表
router.get('/list', authMiddleware, getReports)

export { router as reportRouter }