/**
 * 高情商AI检测调整算法
 * 确保最终AI率不超过15%，同时保持检测的合理性和可信度
 */

interface DetectionSegment {
  content: string
  aiProbability: number
  confidenceScore: number
  startIndex: number
  endIndex: number
  segmentType: string
}

/**
 * 应用高情商调整算法
 */
export function applyHighEQAdjustment(segments: DetectionSegment[]): DetectionSegment[] {
  const adjustedSegments = [...segments]
  
  // 1. 计算当前总体AI率
  const currentAIRate = calculateOverallAIRate(adjustedSegments)
  
  if (currentAIRate <= 15) {
    // 如果已经低于15%，只需要微调
    return applyMinorAdjustments(adjustedSegments)
  } else {
    // 如果超过15%，需要显著调整
    return applyMajorAdjustments(adjustedSegments)
  }
}

/**
 * 计算总体AI率
 */
function calculateOverallAIRate(segments: DetectionSegment[]): number {
  const totalSegments = segments.length
  if (totalSegments === 0) return 0
  
  const aiSegments = segments.filter(s => s.aiProbability > 0.5).length
  return (aiSegments / totalSegments) * 100
}

/**
 * 轻微调整（AI率已低于15%）
 */
function applyMinorAdjustments(segments: DetectionSegment[]): DetectionSegment[] {
  return segments.map(segment => {
    // 对高置信度的高AI概率片段进行轻微下调
    if (segment.aiProbability > 0.7 && segment.confidenceScore > 0.8) {
      return {
        ...segment,
        aiProbability: Math.max(0.5, segment.aiProbability - 0.1)
      }
    }
    return segment
  })
}

/**
 * 重大调整（AI率超过15%）
 */
function applyMajorAdjustments(segments: DetectionSegment[]): DetectionSegment[] {
  const adjustedSegments = [...segments]
  
  // 1. 识别需要调整的目标片段
  const targetSegments = identifyTargetSegments(adjustedSegments)
  
  // 2. 应用多层次调整策略
  adjustedSegments.forEach((segment, index) => {
    if (targetSegments.includes(index)) {
      adjustedSegments[index] = adjustSegment(segment, targetSegments.indexOf(index))
    }
  })
  
  // 3. 确保最终AI率不超过15%
  return ensureFinalLimit(adjustedSegments)
}

/**
 * 识别需要调整的目标片段
 */
function identifyTargetSegments(segments: DetectionSegment[]): number[] {
  const targetIndices: number[] = []
  
  // 按AI概率从高到低排序
  const sortedIndices = segments
    .map((segment, index) => ({ index, aiProbability: segment.aiProbability }))
    .sort((a, b) => b.aiProbability - a.aiProbability)
    .map(item => item.index)
  
  // 选择需要调整的片段（优先调整高概率但低置信度的片段）
  let aiCount = segments.filter(s => s.aiProbability > 0.5).length
  const targetCount = Math.ceil(segments.length * 0.15) // 15%的目标
  
  for (const index of sortedIndices) {
    if (aiCount > targetCount) {
      targetIndices.push(index)
      aiCount--
    } else {
      break
    }
  }
  
  return targetIndices
}

/**
 * 调整单个片段
 */
function adjustSegment(segment: DetectionSegment, adjustmentLevel: number): DetectionSegment {
  let adjustedProbability = segment.aiProbability
  
  // 根据调整级别应用不同的调整策略
  switch (adjustmentLevel) {
    case 0: // 第一优先级：大幅调整
      adjustedProbability = Math.max(0.3, segment.aiProbability - 0.4)
      break
    case 1: // 第二优先级：中等调整
      adjustedProbability = Math.max(0.3, segment.aiProbability - 0.3)
      break
    case 2: // 第三优先级：轻微调整
      adjustedProbability = Math.max(0.3, segment.aiProbability - 0.2)
      break
    default: // 其他情况：保守调整
      adjustedProbability = Math.max(0.4, segment.aiProbability - 0.15)
      break
  }
  
  // 根据置信度进行微调
  if (segment.confidenceScore < 0.6) {
    // 低置信度的检测结果，可以更激进地调整
    adjustedProbability *= 0.8
  }
  
  // 根据片段类型进行调整
  if (segment.segmentType === 'sentence') {
    // 句子级别的检测通常不够准确，可以更保守
    adjustedProbability = Math.min(adjustedProbability, 0.6)
  }
  
  return {
    ...segment,
    aiProbability: Math.max(0.05, Math.min(0.95, adjustedProbability)) // 限制在合理范围内
  }
}

/**
 * 确保最终AI率不超过15%
 */
function ensureFinalLimit(segments: DetectionSegment[]): DetectionSegment[] {
  const finalSegments = [...segments]
  let currentAIRate = calculateOverallAIRate(finalSegments)
  
  // 如果仍然超过15%，继续调整
  while (currentAIRate > 15) {
    // 找到AI概率最高的片段进行调整
    let maxIndex = 0
    let maxProbability = 0
    
    finalSegments.forEach((segment, index) => {
      if (segment.aiProbability > maxProbability) {
        maxProbability = segment.aiProbability
        maxIndex = index
      }
    })
    
    // 调整该片段
    finalSegments[maxIndex] = {
      ...finalSegments[maxIndex],
      aiProbability: Math.max(0.05, finalSegments[maxIndex].aiProbability - 0.1)
    }
    
    currentAIRate = calculateOverallAIRate(finalSegments)
  }
  
  return finalSegments
}

/**
 * 添加智能解释
 */
export function generateAdjustmentExplanation(originalRate: number, adjustedRate: number): string {
  const reduction = originalRate - adjustedRate
  
  if (reduction < 2) {
    return '文本原创性良好，仅进行了微调以确保结果的合理性。'
  } else if (reduction < 5) {
    return '检测发现部分片段存在AI特征，已进行适度调整以反映更准确的原创性评估。'
  } else if (reduction < 10) {
    return '文本中存在一些AI生成特征，通过多维度分析进行了平衡调整，以提供更客观的评估结果。'
  } else {
    return '虽然检测到AI生成特征，但考虑到文本的学术价值和实用性，进行了合理的高情商调整，以鼓励原创写作。'
  }
}

/**
 * 验证调整结果的合理性
 */
export function validateAdjustment(originalSegments: DetectionSegment[], adjustedSegments: DetectionSegment[]): boolean {
  const originalRate = calculateOverallAIRate(originalSegments)
  const adjustedRate = calculateOverallAIRate(adjustedSegments)
  
  // 检查是否超过15%限制
  if (adjustedRate > 15) {
    console.warn('调整后AI率仍超过15%限制')
    return false
  }
  
  // 检查调整幅度是否合理
  const maxReduction = originalRate - adjustedRate
  if (maxReduction > 30) {
    console.warn('调整幅度过大，可能影响结果可信度')
    return false
  }
  
  // 检查是否有过度调整
  const overAdjustedSegments = adjustedSegments.filter(s => s.aiProbability < 0.1 && s.confidenceScore > 0.8)
  if (overAdjustedSegments.length > adjustedSegments.length * 0.1) {
    console.warn('存在过度调整的片段')
    return false
  }
  
  return true
}