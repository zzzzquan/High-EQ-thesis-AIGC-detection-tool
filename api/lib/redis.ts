import Redis from 'ioredis'

// 允许通过环境变量强制禁用 Redis
const disableRedis = process.env.DISABLE_REDIS === 'true'

// 判定是否使用内存缓存回退：当未提供 REDIS_URL/REDIS_HOST 或明确禁用时启用
const shouldUseMemoryCache = disableRedis || !(process.env.REDIS_URL || process.env.REDIS_HOST)

type RedisLike = {
  get: (key: string) => Promise<string | null>
  setex: (key: string, seconds: number, value: string) => Promise<'OK' | null>
  quit: () => Promise<void>
  on: (event: string, handler: (...args: any[]) => void) => void
}

let redisClient: RedisLike

if (shouldUseMemoryCache) {
  const store = new Map<string, { value: string; expireAt: number }>()

  redisClient = {
    async get(key: string) {
      const data = store.get(key)
      if (!data) return null
      if (Date.now() > data.expireAt) {
        store.delete(key)
        return null
      }
      return data.value
    },
    async setex(key: string, seconds: number, value: string) {
      const expireAt = Date.now() + seconds * 1000
      store.set(key, { value, expireAt })
      return 'OK'
    },
    async quit() {
      store.clear()
    },
    on() {
      // 内存缓存不需要事件监听
    },
  }

  console.log('⚠️ Redis 未启用，使用内存缓存替代（开发环境用途）')
} else {
  const options = process.env.REDIS_URL
    ? process.env.REDIS_URL
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times: number) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3,
      }

  const client = new Redis(options as any)

  // 连接事件监听
  client.on('connect', () => {
    console.log('✅ Redis连接成功')
  })

  client.on('error', (error) => {
    console.error('❌ Redis连接错误:', error)
  })

  client.on('close', () => {
    console.log('🔌 Redis连接关闭')
  })

  // 优雅关闭
  process.on('SIGINT', async () => {
    await client.quit()
    process.exit(0)
  })

  redisClient = client as unknown as RedisLike
}

export { redisClient }
export default redisClient