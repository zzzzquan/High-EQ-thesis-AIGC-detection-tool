import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { AuthRequest } from '../middleware/auth.ts'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

// 用户注册
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: '缺少必填字段' })
    }

    // 检查用户是否已存在
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({ error: '用户已存在' })
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        name,
        plan: 'free',
        usage_count: 0,
        max_usage: 3
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    // 生成JWT令牌
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      plan: user.plan 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageCount: user.usage_count,
        maxUsage: user.max_usage
      },
      token
    })

  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '注册失败' })
  }
}

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '缺少邮箱或密码' })
    }

    // 查找用户
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: '密码错误' })
    }

    // 生成JWT令牌
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      plan: user.plan 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageCount: user.usage_count,
        maxUsage: user.max_usage
      },
      token
    })

  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '登录失败' })
  }
}

// 获取用户信息
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, plan, usage_count, max_usage, created_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageCount: user.usage_count,
        maxUsage: user.max_usage,
        createdAt: user.created_at
      }
    })

  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
}