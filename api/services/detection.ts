import { supabaseAdmin } from '../lib/supabase.ts'
import { redisClient } from '../lib/redis.ts'
import { segmentText } from '../utils/textProcessor.ts'
import { detectAIContent } from '../utils/aiDetector.ts'
import { applyHighEQAdjustment } from '../utils/highEQAlgorithm.ts'

interface DetectionResult {
  overallAIRate: number
  confidenceScore: number
  segments: Array<{
    content: string
    aiProbability: number
    confidenceScore: number
    segmentType: string
    startIndex: number
    endIndex: number
  }>
  detailedAnalysis: {
    totalSegments: number
    aiSegments: number
    humanSegments: number
    averageConfidence: number
    keyFindings: string[]
    recommendations: string[]
  }
}

export async function highEQDetection(detection: any): Promise<DetectionResult> {
  try {
    console.log(`开始高情商检测: ${detection.id}`)
    
    // 1. 下载文件内容
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('thesis-files')
      .download(detection.file_path)

    if (downloadError) {
      throw downloadError
    }

    const fileContent = await fileData.text()
    
    // 2. 智能分段
    console.log('智能分段处理...')
    const segments = segmentText(fileContent)
    
    // 3. 并行AI检测
    console.log('并行AI检测...')
    const detectionPromises = segments.map(async (segment, index) => {
      // 检查缓存
      const cacheKey = `detection:${detection.id}:segment:${index}`
      const cached = await redisClient.get(cacheKey)
      
      if (cached) {
        return JSON.parse(cached)
      }
      
      // 执行AI检测
      const aiResult = await detectAIContent(segment.content)
      
      // 缓存结果（1小时）
      await redisClient.setex(cacheKey, 3600, JSON.stringify(aiResult))
      
      return {
        ...aiResult,
        startIndex: segment.startIndex,
        endIndex: segment.endIndex,
        segmentType: segment.type
      }
    })
    
    const rawResults = await Promise.all(detectionPromises)
    
    // 4. 高情商调整
    console.log('应用高情商调整算法...')
    const adjustedResults = applyHighEQAdjustment(rawResults)
    
    // 5. 计算总体AI率
    const totalSegments = adjustedResults.length
    const aiSegments = adjustedResults.filter(r => r.aiProbability > 0.5).length
    const overallAIRate = Math.min(15, (aiSegments / totalSegments) * 100) // 确保不超过15%
    
    // 6. 保存分段结果
    console.log('保存分段结果...')
    const segmentRecords = adjustedResults.map((result, index) => ({
      detection_id: detection.id,
      content: segments[index].content.substring(0, 1000), // 限制内容长度
      ai_probability: result.aiProbability,
      confidence_score: result.confidenceScore,
      segment_type: result.segmentType,
      start_index: result.startIndex,
      end_index: result.endIndex
    }))
    
    await supabaseAdmin.from('segments').insert(segmentRecords)
    
    // 7. 生成详细分析
    const detailedAnalysis = {
      totalSegments,
      aiSegments,
      humanSegments: totalSegments - aiSegments,
      averageConfidence: adjustedResults.reduce((sum, r) => sum + r.confidenceScore, 0) / totalSegments,
      keyFindings: generateKeyFindings(adjustedResults),
      recommendations: generateRecommendations(overallAIRate)
    }
    
    // 8. 保存报告
    await supabaseAdmin.from('reports').insert([{
      detection_id: detection.id,
      ai_rate: overallAIRate,
      confidence_score: detailedAnalysis.averageConfidence,
      detailed_analysis: detailedAnalysis
    }])
    
    console.log(`高情商检测完成: ${detection.id}, AI率: ${overallAIRate}%`)
    
    return {
      overallAIRate,
      confidenceScore: detailedAnalysis.averageConfidence,
      segments: adjustedResults,
      detailedAnalysis
    }
    
  } catch (error) {
    console.error('高情商检测失败:', error)
    throw error
  }
}

function generateKeyFindings(segments: any[]): string[] {
  const findings = []
  
  const highAISegments = segments.filter(s => s.aiProbability > 0.8)
  const lowConfidenceSegments = segments.filter(s => s.confidenceScore < 0.6)
  
  if (highAISegments.length > 0) {
    findings.push(`发现${highAISegments.length}个高AI概率片段`)
  }
  
  if (lowConfidenceSegments.length > 0) {
    findings.push(`${lowConfidenceSegments.length}个片段的检测置信度较低`)
  }
  
  const avgProbability = segments.reduce((sum, s) => sum + s.aiProbability, 0) / segments.length
  if (avgProbability < 0.3) {
    findings.push('整体文本显示出较低的AI生成特征')
  } else if (avgProbability > 0.7) {
    findings.push('文本中存在明显的AI生成模式')
  }
  
  return findings
}

function generateRecommendations(aiRate: number): string[] {
  const recommendations = []
  
  if (aiRate > 10) {
    recommendations.push('建议增加更多原创性内容')
    recommendations.push('考虑使用更多个人经验和观点')
  } else {
    recommendations.push('文本原创性良好，继续保持')
  }
  
  recommendations.push('定期使用多种工具进行交叉验证')
  recommendations.push('关注学术诚信，确保引用规范')
  
  return recommendations
}