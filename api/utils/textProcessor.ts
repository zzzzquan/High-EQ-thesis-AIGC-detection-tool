/**
 * 文本处理工具函数
 */

interface TextSegment {
  content: string
  startIndex: number
  endIndex: number
  type: string
}

/**
 * 智能文本分段
 * 根据段落、句子结构和语义边界进行分段
 */
export function segmentText(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  const minSegmentLength = 100 // 最小段长度
  const maxSegmentLength = 800 // 最大段长度
  
  // 按段落分割
  const paragraphs = text.split(/\n\s*\n/)
  
  paragraphs.forEach((paragraph, paraIndex) => {
    if (!paragraph.trim()) return
    
    const paraStart = text.indexOf(paragraph)
    const paraEnd = paraStart + paragraph.length
    
    // 如果段落长度合适，直接作为一个段
    if (paragraph.length >= minSegmentLength && paragraph.length <= maxSegmentLength) {
      segments.push({
        content: paragraph.trim(),
        startIndex: paraStart,
        endIndex: paraEnd,
        type: 'paragraph'
      })
      return
    }
    
    // 如果段落太短，合并相邻段落
    if (paragraph.length < minSegmentLength) {
      // 尝试与下一个段落合并
      if (paraIndex < paragraphs.length - 1) {
        const combined = paragraph + '\n\n' + paragraphs[paraIndex + 1]
        if (combined.length <= maxSegmentLength) {
          segments.push({
            content: combined.trim(),
            startIndex: paraStart,
            endIndex: text.indexOf(paragraphs[paraIndex + 1]) + paragraphs[paraIndex + 1].length,
            type: 'combined'
          })
          // 跳过下一个段落
          paragraphs[paraIndex + 1] = ''
          return
        }
      }
      
      // 如果无法合并，按句子分割
      const sentences = splitIntoSentences(paragraph)
      segments.push(...sentences.map(sentence => ({
        content: sentence.text.trim(),
        startIndex: paraStart + sentence.start,
        endIndex: paraStart + sentence.end,
        type: 'sentence'
      })))
      return
    }
    
    // 如果段落太长，按句子分割并智能组合
    if (paragraph.length > maxSegmentLength) {
      const sentences = splitIntoSentences(paragraph)
      let currentSegment = ''
      let segmentStart = 0
      
      sentences.forEach((sentence, index) => {
        if (currentSegment.length + sentence.text.length <= maxSegmentLength) {
          currentSegment += (currentSegment ? ' ' : '') + sentence.text
        } else {
          if (currentSegment) {
            segments.push({
              content: currentSegment.trim(),
              startIndex: paraStart + segmentStart,
              endIndex: paraStart + sentence.start,
              type: 'sentence_group'
            })
          }
          currentSegment = sentence.text
          segmentStart = sentence.start
        }
      })
      
      // 添加最后一段
      if (currentSegment) {
        segments.push({
          content: currentSegment.trim(),
          startIndex: paraStart + segmentStart,
          endIndex: paraEnd,
          type: 'sentence_group'
        })
      }
    }
  })
  
  // 过滤掉太短的段
  return segments.filter(segment => segment.content.length >= 50)
}

/**
 * 将文本分割成句子
 */
function splitIntoSentences(text: string): Array<{text: string, start: number, end: number}> {
  const sentences: Array<{text: string, start: number, end: number}> = []
  
  // 中文句子分割
  const chineseSentenceEnd = /[。！？；]/g
  // 英文句子分割
  const englishSentenceEnd = /[.!?]/g
  
  let lastEnd = 0
  let match
  
  // 优先使用中文标点分割
  while ((match = chineseSentenceEnd.exec(text)) !== null) {
    const sentence = text.substring(lastEnd, match.index + 1).trim()
    if (sentence.length > 10) {
      sentences.push({
        text: sentence,
        start: lastEnd,
        end: match.index + 1
      })
    }
    lastEnd = match.index + 1
  }
  
  // 处理剩余文本
  if (lastEnd < text.length) {
    const remaining = text.substring(lastEnd).trim()
    if (remaining.length > 10) {
      sentences.push({
        text: remaining,
        start: lastEnd,
        end: text.length
      })
    }
  }
  
  // 如果没有中文标点，使用英文标点
  if (sentences.length === 0) {
    lastEnd = 0
    while ((match = englishSentenceEnd.exec(text)) !== null) {
      const sentence = text.substring(lastEnd, match.index + 1).trim()
      if (sentence.length > 10) {
        sentences.push({
          text: sentence,
          start: lastEnd,
          end: match.index + 1
        })
      }
      lastEnd = match.index + 1
    }
    
    if (lastEnd < text.length) {
      const remaining = text.substring(lastEnd).trim()
      if (remaining.length > 10) {
        sentences.push({
          text: remaining,
          start: lastEnd,
          end: text.length
        })
      }
    }
  }
  
  return sentences
}

/**
 * 提取文本特征
 */
export function extractFeatures(text: string): {
  length: number
  avgSentenceLength: number
  punctuationDensity: number
  uniqueWords: number
  repetitionScore: number
  complexityScore: number
} {
  const length = text.length
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.length > 0 ? length / sentences.length : 0
  
  const punctuationMarks = text.match(/[，。！？：；""''（）【】《》]/g)
  const punctuationDensity = punctuationMarks ? punctuationMarks.length / length : 0
  
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words).size
  const repetitionScore = words.length > 0 ? (words.length - uniqueWords) / words.length : 0
  
  // 复杂度评分（基于词汇多样性和句子长度）
  const complexityScore = (uniqueWords / words.length) * 0.5 + 
                         (avgSentenceLength / 100) * 0.5
  
  return {
    length,
    avgSentenceLength,
    punctuationDensity,
    uniqueWords,
    repetitionScore,
    complexityScore
  }
}