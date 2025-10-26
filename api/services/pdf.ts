import puppeteer from 'puppeteer'
import { supabaseAdmin } from '../lib/supabase.ts'

/**
 * 生成PDF检测报告
 */
export async function generatePDFReport(detection: any): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // 设置页面内容
    const htmlContent = await generateReportHTML(detection)
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // 生成PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    const pdfBuffer = Buffer.from(pdf)
    return pdfBuffer
    
  } finally {
    await browser.close()
  }
}

/**
 * 生成报告HTML内容
 */
async function generateReportHTML(detection: any): Promise<string> {
  const report = detection.reports?.[0]
  const segments = detection.segments || []
  
  // 计算统计信息
  const aiSegments = segments.filter((s: any) => s.ai_probability > 0.5)
  const avgConfidence = segments.reduce((sum: number, s: any) => sum + s.confidence_score, 0) / segments.length
  
  const analysis = report?.detailed_analysis || {
    totalSegments: segments.length,
    aiSegments: aiSegments.length,
    humanSegments: segments.length - aiSegments.length,
    averageConfidence: avgConfidence,
    keyFindings: [],
    recommendations: []
  }
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI率检测报告</title>
    <style>
        body {
            font-family: 'SimSun', serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 28px;
            margin: 0;
        }
        .header .subtitle {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 10px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 25px;
            text-align: center;
        }
        .ai-rate-display {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        .ai-rate-label {
            font-size: 16px;
            opacity: 0.9;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #2c3e50;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-bottom: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }
        .segments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .segments-table th,
        .segments-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .segments-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .ai-high {
            background-color: #ffebee;
            color: #c62828;
        }
        .ai-medium {
            background-color: #fff3e0;
            color: #ef6c00;
        }
        .ai-low {
            background-color: #e8f5e8;
            color: #2e7d32;
        }
        .findings-list {
            list-style: none;
            padding: 0;
        }
        .findings-list li {
            background: #f8f9fa;
            margin: 8px 0;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #28a745;
        }
        .recommendations-list {
            list-style: none;
            padding: 0;
        }
        .recommendations-list li {
            background: #e3f2fd;
            margin: 8px 0;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #2196f3;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        .confidence-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .confidence-high {
            background-color: #d4edda;
            color: #155724;
        }
        .confidence-medium {
            background-color: #fff3cd;
            color: #856404;
        }
        .confidence-low {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 论文AI率检测报告</h1>
            <div class="subtitle">高情商AI检测系统 - 专业版报告</div>
        </div>
        
        <div class="summary-card">
            <div class="ai-rate-label">AI生成概率</div>
            <div class="ai-rate-display">${report?.ai_rate?.toFixed(1) || 0}%</div>
            <div style="font-size: 14px; margin-top: 10px;">
                置信度: ${(report?.confidence_score * 100 || 0).toFixed(1)}%
            </div>
        </div>
        
        <div class="section">
            <h2>📋 基本信息</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">文件名</div>
                    <div class="stat-value">${detection.file_name}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">文件大小</div>
                    <div class="stat-value">${(detection.file_size / 1024).toFixed(1)} KB</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">检测时间</div>
                    <div class="stat-value">${new Date(detection.created_at).toLocaleString('zh-CN')}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">检测模型</div>
                    <div class="stat-value">高情商多模型融合</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>📈 统计分析</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">总片段数</div>
                    <div class="stat-value">${analysis.totalSegments}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">AI疑似片段</div>
                    <div class="stat-value" style="color: #e74c3c;">${analysis.aiSegments}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">人工撰写片段</div>
                    <div class="stat-value" style="color: #27ae60;">${analysis.humanSegments}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">平均置信度</div>
                    <div class="stat-value">${(analysis.averageConfidence * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔍 关键发现</h2>
            <ul class="findings-list">
                ${analysis.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
                ${analysis.keyFindings.length === 0 ? '<li>文本结构良好，未发现明显异常模式</li>' : ''}
            </ul>
        </div>
        
        <div class="section">
            <h2>💡 优化建议</h2>
            <ul class="recommendations-list">
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                ${analysis.recommendations.length === 0 ? '<li>继续保持良好的写作习惯</li>' : ''}
            </ul>
        </div>
        
        ${segments.length > 0 ? `
        <div class="section">
            <h2>📄 片段分析详情</h2>
            <p style="color: #6c757d; font-size: 14px;">显示前10个片段的详细分析结果</p>
            <table class="segments-table">
                <thead>
                    <tr>
                        <th>片段</th>
                        <th>AI概率</th>
                        <th>置信度</th>
                        <th>类型</th>
                    </tr>
                </thead>
                <tbody>
                    ${segments.slice(0, 10).map((segment: any, index: number) => {
                      const aiClass = segment.ai_probability > 0.7 ? 'ai-high' : 
                                    segment.ai_probability > 0.5 ? 'ai-medium' : 'ai-low'
                      const confClass = segment.confidence_score > 0.8 ? 'confidence-high' :
                                       segment.confidence_score > 0.6 ? 'confidence-medium' : 'confidence-low'
                      return `
                        <tr class="${aiClass}">
                            <td>${segment.content.substring(0, 50)}...</td>
                            <td>${(segment.ai_probability * 100).toFixed(1)}%</td>
                            <td><span class="confidence-indicator ${confClass}">${(segment.confidence_score * 100).toFixed(1)}%</span></td>
                            <td>${segment.segment_type}</td>
                        </tr>
                      `
                    }).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>本报告由高情商AI检测系统生成，仅供参考</p>
            <p>检测时间：${new Date().toLocaleString('zh-CN')} | 报告编号：${detection.id}</p>
            <p>© 2024 高情商AI检测系统 - 专业的学术诚信检测服务</p>
        </div>
    </div>
</body>
</html>
  `
}