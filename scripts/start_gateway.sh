#!/bin/bash
# API网关启动脚本

# 设置工作目录为项目根目录
cd "$(dirname "$0")/.."

echo "启动API网关服务..."
echo "时间: $(date)"

# 使用Docker Compose启动服务
docker-compose up -d backend

echo "API网关已启动，可以通过 http://localhost:5000 访问"
echo "使用以下命令查看日志:"
echo "  docker-compose logs -f backend"
echo ""
echo "使用以下命令测试API网关:"
echo "  python3 scripts/test_gateway.py" 