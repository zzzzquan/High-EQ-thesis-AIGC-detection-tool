import { Router } from 'express'
import { register, login, getProfile } from '../controllers/auth.ts'
import { authMiddleware } from '../middleware/auth.ts'

const router = Router()

// 公开路由
router.post('/register', register)
router.post('/login', login)

// 需要认证的路由
router.get('/profile', authMiddleware, getProfile)

export { router as authRouter }