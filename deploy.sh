#!/bin/bash

# 高情商论文AI率检测网站部署脚本
# 目标服务器: chai02 (10.1.114.89:13022)

set -e

echo "🚀 开始部署高情商论文AI率检测网站..."

# 配置变量
SERVER_IP="10.1.114.89"
SERVER_PORT="13022"
SERVER_USER="zhangquan"
SERVER_HOST="chai02"
PROJECT_DIR="~/ai-detection-platform"

# 检查SSH连接
echo "🔍 检查SSH连接..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} "echo 'SSH连接成功'"

# 创建远程目录
echo "📁 创建远程项目目录..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} "mkdir -p ${PROJECT_DIR}"

# 复制项目文件
echo "📦 复制项目文件到服务器..."
rsync -avz --progress -e "ssh -p ${SERVER_PORT}" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  ./ ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/

# 远程执行部署命令
echo "⚙️ 远程部署..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << EOF
cd ${PROJECT_DIR}

# 安装依赖
echo "📥 安装依赖..."
npm install

# 复制生产环境配置
cp .env.production .env

# 构建前端
echo "🏗️ 构建前端..."
npm run build

# 启动服务
echo "🚀 启动服务..."
# 停止旧服务（如果存在）
killall node || true

# 启动后端服务（后台运行）
nohup npm start > server.log 2>&1 &

# 等待服务启动
sleep 5

# 检查服务状态
curl -s http://localhost:3001/api/health || echo "服务启动检查失败"

echo "✅ 部署完成！"
EOF

echo "🎉 部署完成！"
echo "访问地址: http://${SERVER_IP}:5173"
echo "API地址: http://${SERVER_IP}:3001"