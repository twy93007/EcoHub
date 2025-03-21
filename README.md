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