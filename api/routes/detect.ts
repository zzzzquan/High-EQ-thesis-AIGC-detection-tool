import { Router } from 'express'
import { startDetection, getDetectionStatus, getDetectionResult } from '../controllers/detect.ts'
import { authMiddleware } from '../middleware/auth.ts'

const router = Router()

// 开始检测
router.post('/start', authMiddleware, startDetection)

// 获取检测状态
router.get('/status/:detectionId', authMiddleware, getDetectionStatus)

// 获取检测结果
router.get('/result/:detectionId', authMiddleware, getDetectionResult)

export { router as detectRouter }