FROM node:16-alpine as build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制所有文件
COPY . .

# 构建应用
RUN npm run build

# 使用 nginx 作为生产服务器
FROM nginx:alpine

# 复制构建产物到 nginx 服务目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 