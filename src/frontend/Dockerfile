# 开发环境
FROM node:18-alpine

# 创建ubuntu用户
RUN addgroup -S ubuntu && adduser -S ubuntu -G ubuntu

WORKDIR /app

# 设置npm镜像源为淘宝镜像
RUN npm config set registry https://registry.npmmirror.com

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 设置目录权限
RUN chown -R ubuntu:ubuntu /app

# 切换到ubuntu用户
USER ubuntu

# 暴露端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 构建阶段
FROM node:18-alpine as build

# 创建ubuntu用户
RUN addgroup -S ubuntu && adduser -S ubuntu -G ubuntu

WORKDIR /app

# 设置npm镜像源为淘宝镜像
RUN npm config set registry https://registry.npmmirror.com

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（使用--no-optional减少安装包数量）
RUN npm install --legacy-peer-deps --no-optional

# 复制源代码
COPY . .

# 设置目录权限
RUN chown -R ubuntu:ubuntu /app

# 切换到ubuntu用户
USER ubuntu

# 构建应用（添加内存限制）
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 创建必要的目录并设置权限
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /tmp/nginx && \
    chmod -R 777 /var/cache/nginx && \
    chmod -R 777 /tmp/nginx && \
    chmod -R 777 /var/log/nginx && \
    sed -i 's|/var/run/nginx.pid|/tmp/nginx/nginx.pid|' /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]