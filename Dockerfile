FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install --production=false

# 复制源码
COPY . .

# 构建前端
RUN cd src && npm install && npm run build

# 构建后端
RUN cd api && npm install && npm run build

# 安装生产依赖
RUN npm prune --production

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# 启动应用
CMD ["npm", "start"]