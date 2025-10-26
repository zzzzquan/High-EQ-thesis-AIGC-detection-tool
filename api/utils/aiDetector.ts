import { redisClient } from '../lib/redis.ts'
import { extractFeatures } from './textProcessor.ts'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
})

interface AIDetectionResult {
  aiProbability: number
  confidenceScore: number
  modelUsed: string
  features: ReturnType<typeof extractFeatures>
}

/**
 * AI内容检测
 * 使用多模型并行检测，结合多种特征分析
 */
export async function detectAIContent(text: string): Promise<AIDetectionResult> {
  try {
    // 1. 提取文本特征
    const features = extractFeatures(text)
    
    // 2. 多模型并行检测
    const detectionPromises = [
      detectWithOpenAI(text),
      detectWithFeatures(features),
      detectWithPatternAnalysis(text)
    ]
    
    const [openAIResult, featureResult, patternResult] = await Promise.all(detectionPromises)
    
    // 3. 综合评估
    const aiProbability = (openAIResult + featureResult + patternResult) / 3
    const confidenceScore = calculateConfidenceScore(features, text)
    
    return {
      aiProbability: Math.min(0.95, Math.max(0.05, aiProbability)), // 限制在5%-95%之间
      confidenceScore,
      modelUsed: 'multi-model-ensemble',
      features
    }
    
  } catch (error) {
    console.error('AI检测失败:', error)
    // 出错时返回中性结果
    return {
      aiProbability: 0.5,
      confidenceScore: 0.3,
      modelUsed: 'error-fallback',
      features: extractFeatures(text)
    }
  }
}

/**
 * 使用OpenAI API进行检测
 */
async function detectWithOpenAI(text: string): Promise<number> {
  try {
    const cacheKey = `openai:detection:${Buffer.from(text).toString('base64').substring(0, 50)}`
    const cached = await redisClient.get(cacheKey)
    
    if (cached) {
      return parseFloat(cached)
    }
    
    const prompt = `请分析以下文本的AI生成概率，只返回一个0-1之间的数字，越接近1表示越可能是AI生成：
    
文本内容：
"""
${text.substring(0, 1000)}
"""

AI生成概率（仅返回数字）：`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0.1
    })
    
    const result = parseFloat(response.choices[0]?.message?.content?.trim() || '0.5')
    const normalizedResult = isNaN(result) ? 0.5 : Math.max(0, Math.min(1, result))
    
    // 缓存结果
    await redisClient.setex(cacheKey, 3600, normalizedResult.toString())
    
    return normalizedResult
    
  } catch (error) {
    console.error('OpenAI检测失败:', error)
    return 0.5 // 出错时返回中性概率
  }
}

/**
 * 基于特征工程的检测
 */
async function detectWithFeatures(features: ReturnType<typeof extractFeatures>): Promise<number> {
  // 基于统计特征的简单规则引擎
  let aiScore = 0
  
  // 文本长度特征
  if (features.length < 200) aiScore += 0.1
  else if (features.length > 2000) aiScore += 0.2
  
  // 句子长度一致性（AI倾向于更一致的句子长度）
  if (features.avgSentenceLength > 80) aiScore += 0.15
  
  // 标点符号密度
  if (features.punctuationDensity < 0.05) aiScore += 0.1
  else if (features.punctuationDensity > 0.15) aiScore += 0.05
  
  // 重复率
  if (features.repetitionScore > 0.3) aiScore += 0.2
  
  // 复杂度
  if (features.complexityScore < 0.3) aiScore += 0.1
  
  return Math.min(0.9, aiScore)
}

/**
 * 基于模式分析的检测
 */
async function detectWithPatternAnalysis(text: string): Promise<number> {
  let aiScore = 0
  
  // 常见AI生成模式
  const aiPatterns = [
    /首先.*其次.*最后/,  // 结构化表达
    /总的来说.*综上所述/, // 总结性表达
    /\d+\.\s*\w+/,        // 列表格式
    /\(.*?\)/g,           // 括号使用频率
    /"""/g,              // 引号使用
  ]
  
  aiPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches && matches.length > 2) {
      aiScore += 0.1
    }
  })
  
  // 词汇多样性分析
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const diversityRatio = uniqueWords.size / words.length
  
  // AI生成的文本通常词汇多样性较低
  if (diversityRatio < 0.6) {
    aiScore += 0.15
  }
  
  // 检查过于完美的语法结构
  const perfectStructures = text.match(/，.*，.*。/g)
  if (perfectStructures && perfectStructures.length > 3) {
    aiScore += 0.1
  }
  
  return Math.min(0.9, aiScore)
}

/**
 * 计算置信度分数
 */
function calculateConfidenceScore(features: ReturnType<typeof extractFeatures>, text: string): number {
  let confidence = 0.5
  
  // 文本长度影响置信度
  if (features.length > 500) confidence += 0.2
  
  // 复杂度影响置信度
  if (features.complexityScore > 0.5) confidence += 0.1
  
  // 标点符号合理性
  if (features.punctuationDensity > 0.03 && features.punctuationDensity < 0.12) {
    confidence += 0.1
  }
  
  // 重复率合理性
  if (features.repetitionScore < 0.2) {
    confidence += 0.1
  }
  
  return Math.min(0.95, confidence)
}