#!/bin/bash

# 显示彩色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}     EcoHub 服务启动脚本     ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装。请先安装Docker!${NC}"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装。请先安装Docker Compose!${NC}"
    exit 1
fi

# 进入项目根目录
cd $(dirname "$0")/..
ROOT_DIR=$(pwd)
echo -e "${GREEN}项目根目录: ${ROOT_DIR}${NC}"

# 检查docker-compose.yml是否存在
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: docker-compose.yml未找到!${NC}"
    exit 1
fi

echo -e "${YELLOW}正在检查服务状态...${NC}"
# 检查现有容器是否运行
RUNNING_CONTAINERS=$(docker-compose ps -q)
if [ ! -z "$RUNNING_CONTAINERS" ]; then
    echo -e "${YELLOW}发现正在运行的容器，正在停止...${NC}"
    docker-compose down
    echo -e "${GREEN}所有容器已停止${NC}"
fi

# 重新构建并启动所有服务
echo -e "${YELLOW}正在构建并启动所有服务...${NC}"
docker-compose up -d --build

# 检查服务是否成功启动
if [ $? -eq 0 ]; then
    echo -e "${GREEN}所有服务已成功启动!${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}服务状态:${NC}"
    docker-compose ps
    
    # 获取API网关端口
    API_PORT=$(docker-compose port backend 5000 | cut -d':' -f2)
    
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}API网关可在以下地址访问:${NC}"
    echo -e "${YELLOW}http://localhost:${API_PORT}/api/health${NC}"
    
    # 运行测试
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${YELLOW}是否运行测试? (y/n)${NC}"
    read -r run_tests
    
    if [[ "$run_tests" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}运行测试脚本...${NC}"
        python3 scripts/test_gateway.py
    fi
else
    echo -e "${RED}启动服务时发生错误${NC}"
    docker-compose logs
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}使用以下命令停止服务:${NC}"
echo -e "${YELLOW}docker-compose down${NC}"
echo -e "${BLUE}=======================================${NC}" 