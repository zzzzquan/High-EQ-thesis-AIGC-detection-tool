import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Upload, BarChart3, Shield, Zap, Star } from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: '高情商算法',
      description: '智能调整检测结果，确保AI率不超过15%，保护用户创作积极性'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: '多模型检测',
      description: '融合多种AI检测模型，提供全面准确的检测结果'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: '快速处理',
      description: '高效的处理引擎，几分钟内完成长篇论文检测'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: '详细报告',
      description: '生成专业的PDF检测报告，包含详细分析和改进建议'
    }
  ]

  const stats = [
    { label: '检测准确率', value: '98%', suffix: '+' },
    { label: '处理速度', value: '3', suffix: '分钟/万字' },
    { label: '用户满意度', value: '4.9', suffix: '/5.0' },
    { label: '服务用户', value: '10K', suffix: '+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <Brain className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                高情商
                <span className="text-blue-600">AI检测</span>
              </h1>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            专业的论文AI率检测服务，采用独特的高情商算法，
            <br className="hidden md:block" />
            智能调整检测结果，保护您的学术创作积极性
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/detect"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              开始检测
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              免费注册
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择我们？
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们不仅提供准确的AI检测服务，更注重用户体验和学术诚信的平衡
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              简单易用的检测流程
            </h2>
            <p className="text-xl text-gray-600">
              只需3个简单步骤，即可获得专业的AI率检测报告
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: '上传论文', desc: '支持PDF、TXT、Markdown格式', icon: '📄' },
              { step: 2, title: '智能检测', desc: '多模型并行分析，高情商调整', icon: '🧠' },
              { step: 3, title: '获取报告', desc: '详细的PDF检测报告和改进建议', icon: '📊' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-blue-600 font-bold text-lg mb-2">
                  步骤 {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            立即开始您的AI检测之旅
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            注册即获得3次免费检测机会，体验高情商AI检测服务
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Star className="h-5 w-5 mr-2" />
            免费注册体验
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home