#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}   启动 EcoHub 开发环境   ${NC}"
echo -e "${GREEN}=======================================${NC}"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker 和 Docker Compose 必须安装.${NC}"
    echo -e "${YELLOW}请参考官方文档安装: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

echo -e "${YELLOW}正在构建并启动容器...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

# 检查容器是否启动成功
if [ $? -eq 0 ]; then
    echo -e "${GREEN}开发环境已成功启动!${NC}"
    echo -e "${YELLOW}服务访问地址:${NC}"
    echo -e "  ${GREEN}前端: ${NC}http://localhost:3000"
    echo -e "  ${GREEN}后端API: ${NC}http://localhost:5000"
    echo -e "  ${GREEN}PostgreSQL管理: ${NC}http://localhost:8080"
    echo -e "  ${GREEN}MongoDB管理: ${NC}http://localhost:8081"
    
    echo -e "\n${YELLOW}使用以下命令查看日志:${NC}"
    echo -e "  ${GREEN}docker-compose logs -f${NC}"
    
    echo -e "\n${YELLOW}使用以下命令停止环境:${NC}"
    echo -e "  ${GREEN}docker-compose down${NC}"
else
    echo -e "${RED}启动过程中出现错误. 请检查日志文件.${NC}"
    docker-compose logs
    exit 1
fi

exit 0 