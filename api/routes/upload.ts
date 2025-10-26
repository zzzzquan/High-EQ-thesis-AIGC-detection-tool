import { Router } from 'express'
import { uploadFile, getUploadHistory, upload } from '../controllers/upload.ts'
import { authMiddleware } from '../middleware/auth.ts'

const router = Router()

// 上传文件
router.post('/', authMiddleware, upload.single('file'), uploadFile)

// 获取上传历史
router.get('/history', authMiddleware, getUploadHistory)

export { router as fileUploadRouter }