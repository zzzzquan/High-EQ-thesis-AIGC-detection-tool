import { Request, Response, NextFunction } from 'express'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    plan: string
  }
  file?: Express.Multer.File
  params: Record<string, string>
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    req.user = {
      userId: payload.userId as string,
      email: payload.email as string,
      plan: payload.plan as string
    }

    next()
  } catch (error) {
    console.error('认证中间件错误:', error)
    res.status(401).json({ error: '认证失败' })
  }
}