# EcoHub 项目结构

本文档介绍EcoHub项目的目录结构和关键文件，帮助开发者快速了解和上手项目。

## 主要目录结构

```
EcoHub/
├── docs/                # 项目文档
│   ├── design/          # 设计文档
│   ├── README.md        # 文档说明
│   └── product_backlog.md  # 产品待办事项清单
├── src/                 # 源代码
│   ├── backend/         # 后端服务
│   │   ├── common/      # 共享代码
│   │   ├── gateway/     # API网关
│   │   └── services/    # 微服务
│   │       ├── user/    # 用户服务
│   │       ├── data/    # 数据管理服务
│   │       ├── matching/# 数据匹配服务
│   │       ├── analysis/# 数据分析服务
│   │       ├── marketplace/ # 数据集市服务
│   │       └── ai/      # AI辅助服务
│   └── frontend/        # 前端应用
│       ├── public/      # 静态资源
│       ├── src/         # 前端源代码
│       ├── nginx/       # Nginx配置
│       └── package.json # 依赖配置
├── deploy/              # 部署配置
├── scripts/             # 实用脚本
│   └── start_dev.sh     # 开发环境启动脚本
├── tests/               # 测试代码
├── docker-compose.yml   # Docker组合配置
├── .gitignore           # Git忽略文件配置
├── CONTRIBUTING.md      # 贡献指南
├── LICENSE              # MIT许可证
├── PROJECT_STRUCTURE.md # 项目结构说明
└── README.md            # 项目说明
```

## 核心组件

### 后端服务 (src/backend)

- **gateway**: API网关，处理请求路由、身份认证和日志
- **services**: 微服务组件
  - **user**: 用户管理和权限控制
  - **data**: 数据集和数据表管理
  - **matching**: 数据匹配算法和任务
  - **analysis**: 数据分析和可视化
  - **marketplace**: 数据产品和交易
  - **ai**: AI辅助功能和推荐

### 前端应用 (src/frontend)

- **components**: 可复用UI组件
- **pages**: 页面组件
- **services**: API调用服务
- **hooks**: React自定义钩子
- **utils**: 工具函数
- **styles**: 样式文件
- **assets**: 图像和静态资源

### 文档 (docs)

- **design/**: 包含系统设计文档
  - **architecture.md**: 系统架构设计
  - **data_model.md**: 数据模型设计
  - **api_design.md**: API接口设计
  - **ui_design.md**: 前端UI设计
  - **project_plan.md**: 项目计划
  - **requirements.md**: 需求分析
- **product_backlog.md**: 产品待办事项清单

### 部署与配置

- **docker-compose.yml**: 定义所有服务及其相互关系
- **deploy/**: 包含部署相关的配置文件
- **scripts/start_dev.sh**: 开发环境启动脚本

## 开发环境设置

项目使用Docker进行开发环境管理，主要服务包括：

1. **backend**: Flask后端API服务
2. **frontend**: React前端应用
3. **db**: PostgreSQL数据库
4. **mongo**: MongoDB数据库
5. **redis**: Redis缓存
6. **pgadmin**: PostgreSQL管理工具
7. **mongo-express**: MongoDB管理工具

使用以下命令启动开发环境：

```bash
./scripts/start_dev.sh
```

## 访问地址

开发环境启动后，可通过以下地址访问各个服务：

- 前端: http://localhost:3000
- 后端API: http://localhost:5000
- PostgreSQL管理: http://localhost:8080
- MongoDB管理: http://localhost:8081 