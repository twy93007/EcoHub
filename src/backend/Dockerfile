FROM ubuntu:22.04

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 使用腾讯云 Ubuntu 镜像源
RUN sed -i 's/archive.ubuntu.com/mirrors.cloud.tencent.com/g' /etc/apt/sources.list && \
    sed -i 's/security.ubuntu.com/mirrors.cloud.tencent.com/g' /etc/apt/sources.list

# 创建ubuntu用户
RUN useradd -m -u 1000 ubuntu

WORKDIR /app

# 安装 Python 和必要的包
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-venv \
    python3-pip \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 设置pip使用腾讯云镜像
RUN pip3 config set global.index-url https://mirrors.cloud.tencent.com/pypi/simple/

# 复制requirements.txt
COPY requirements.txt .

# 安装所有依赖
RUN pip3 install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 设置目录权限
RUN chown -R ubuntu:ubuntu /app && \
    chmod +x /app/init.sh

# 切换到ubuntu用户
USER ubuntu

# 暴露端口
EXPOSE 5000

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=gateway/app.py
ENV FLASK_ENV=development
ENV PYTHONPATH=/app

# 启动命令
CMD ["/bin/bash", "-c", "/app/init.sh && python3 -m flask run --host=0.0.0.0"] 