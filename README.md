# EcoHub - 经济数据仓库平台

## 项目介绍

EcoHub是一个综合性经济数据仓库平台，旨在提供经济数据的收集、处理、分析和可视化解决方案。平台支持多源数据的匹配、整合，并提供强大的分析工具和数据市场功能。

### 核心功能

- **数据管理**：支持多种数据格式的导入、存储和管理
- **数据匹配**：提供灵活的数据匹配算法，支持跨表和跨库匹配
- **数据分析**：内置多种统计分析和预测模型工具
- **数据可视化**：自定义仪表板和报表生成
- **数据市场**：数据产品的发布、订阅和交易
- **AI辅助功能**：智能数据处理和自然语言查询

## 技术栈

### 后端
- Python
- Flask (微服务架构)
- PostgreSQL (关系型数据)
- MongoDB (非结构化数据)
- Redis (缓存)
- Docker & Kubernetes (容器化和编排)

### 前端
- TypeScript
- React
- Ant Design
- ECharts (数据可视化)

## 项目结构

```
EcoHub/
├── docs/               # 项目文档
├── src/                # 源代码
│   ├── backend/        # 后端服务
│   ├── frontend/       # 前端应用
│   └── common/         # 共享代码
├── deploy/             # 部署配置
├── scripts/            # 实用脚本
└── tests/              # 测试代码
```

## 环境要求

- Python 3.8+
- Node.js 14+
- Docker & Docker Compose
- PostgreSQL 13+
- MongoDB 4.4+
- Redis 6+

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/yourusername/ecohub.git
cd ecohub
```

2. 创建并激活Python虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. 安装依赖
```bash
cd src/backend
pip install -r requirements.txt
cd ../frontend
npm install
```

4. 使用Docker Compose启动开发环境
```bash
docker-compose -f deploy/docker-compose.dev.yml up -d
```

5. 启动后端服务
```bash
cd src/backend
python run.py
```

6. 启动前端开发服务器
```bash
cd src/frontend
npm start
```

## 贡献指南

请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 文件了解如何参与贡献。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 项目进展

截至目前，我们已经完成了以下工作：

### 基础设施
- 创建项目代码库 ✓
- 搭建本地开发环境 ✓
- 配置Docker开发环境 ✓
- 设置CI/CD流水线 ✓
- 部署PostgreSQL数据库 ✓
- 部署MongoDB数据库 ✓
- 配置Redis缓存 ✓

### 核心框架
- 创建API网关 ✓
  - 实现请求路由功能
  - 添加身份验证中间件
  - 设置日志记录
- 开发用户认证服务 ✓
  - 实现JWT认证
  - 创建用户注册API
  - 创建用户登录API
  - 实现密码重置功能
- 开发基础权限系统 ✓
  - 创建角色模型
  - 实现权限检查中间件

## 如何启动服务

### 使用Docker Compose

```bash
# 在项目根目录下运行
cd /home/ubuntu/EcoHub
sudo docker-compose up -d --build
```

### 使用启动脚本

```bash
# 给脚本添加执行权限
chmod +x scripts/start_services.sh

# 运行启动脚本
./scripts/start_services.sh
```

### 测试API网关

```bash
# 测试健康检查端点
curl http://localhost:5000/api/health

# 运行测试脚本
python3 scripts/test_gateway.py
```

## 下一步计划

1. 创建前端基础框架
2. 实现API客户端
3. 开发用户管理模块

更多详情请查看 [项目进度报告](docs/sprint_report.md) 和 [产品待办事项清单](docs/product_backlog.md)。 