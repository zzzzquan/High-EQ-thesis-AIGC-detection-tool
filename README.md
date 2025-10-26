# 高情商论文AI率检测网站

一个专业的AI内容检测平台，采用"高情商"算法确保检测结果的准确性和用户体验。

## 功能特性

- **高情商AI检测算法**：确保总AI率不超过15%，避免过度敏感
- **多模型融合检测**：结合OpenAI、特征分析、模式识别等多种检测方法
- **智能文本分段**：支持中英文混合文本的智能分段处理
- **详细报告生成**：生成专业的PDF检测报告
- **用户权限管理**：支持基础版和高级版用户权限控制
- **实时检测状态**：提供检测进度实时反馈
- **缓存优化**：使用Redis缓存提高检测性能

## 技术栈

### 前端
- React 18 + TypeScript
- React Router v6
- Zustand（状态管理）
- Axios（HTTP客户端）
- Tailwind CSS（样式框架）
- Sonner（通知组件）

### 后端
- Node.js + Express
- TypeScript
- Supabase（数据库和存储）
- Redis（缓存）
- Puppeteer（PDF生成）
- JWT（身份认证）

## 快速开始

### 环境要求
- Node.js 18+
- Redis 6+
- Supabase账户

### 安装依赖

```bash
# 安装前端依赖
cd src && npm install

# 安装后端依赖
cd api && npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 配置环境变量：
```bash
# 数据库配置
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis配置
REDIS_URL=redis://localhost:6379

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# OpenAI API密钥（可选）
OPENAI_API_KEY=your_openai_api_key

# 服务器端口
PORT=3001
```

### 运行项目

```bash
# 启动后端服务
cd api && npm run dev

# 启动前端开发服务器
cd src && npm run dev
```

访问 http://localhost:5173 查看应用

## 项目结构

```
├── api/                    # 后端代码
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── routes/            # 路由定义
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具函数
│   └── server.ts          # 服务器入口
├── src/                    # 前端代码
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── stores/            # 状态管理
│   ├── lib/               # 工具库
│   └── App.tsx            # 应用入口
└── supabase/              # Supabase配置
    └── migrations/        # 数据库迁移文件
```

## 核心算法

### 高情商检测算法

我们的"高情商"算法确保检测结果既准确又不会过度敏感：

1. **多模型检测**：结合多种AI检测模型提高准确性
2. **智能调整**：根据检测结果智能调整最终AI率
3. **上限控制**：确保总AI率不超过15%，避免误报
4. **详细分析**：提供每个段落的详细检测结果

### 检测流程

1. **文本预处理**：智能分段和特征提取
2. **并行检测**：使用多个模型并行检测
3. **结果融合**：综合各模型结果得出最终判断
4. **高情商调整**：应用算法调整确保结果合理
5. **报告生成**：生成详细的PDF检测报告

## API文档

### 认证API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 文件上传API

- `POST /api/upload` - 上传文件
- `GET /api/upload/history` - 获取上传历史

### AI检测API

- `POST /api/detect/:detectionId/start` - 开始检测
- `GET /api/detect/:detectionId/status` - 获取检测状态
- `GET /api/detect/:detectionId/result` - 获取检测结果

### 报告API

- `POST /api/reports/:detectionId/generate` - 生成报告
- `GET /api/reports/:reportId/download` - 下载报告
- `GET /api/reports` - 获取报告列表

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t ai-detection-app .

# 运行容器
docker run -p 3001:3001 --env-file .env ai-detection-app
```

### Vercel部署

项目已配置Vercel部署，只需连接GitHub仓库即可自动部署。

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

如有问题或建议，请通过以下方式联系我们：

- 邮箱：support@ai-detection.com
- 网站：https://ai-detection.com

---

**让AI检测更智能，让学术更诚信！**