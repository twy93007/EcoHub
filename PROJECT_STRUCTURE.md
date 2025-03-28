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
│       │   ├── assets/          # 图像和静态资源
│       │   ├── components/      # 可复用UI组件
│       │   │   ├── layout/      # 布局组件
│       │   │   │   ├── AppHeader.tsx    # 页面顶部导航栏
│       │   │   │   ├── AppSidebar.tsx   # 页面侧边栏
│       │   │   │   ├── AppLayout.tsx    # 主布局组件
│       │   │   │   └── AppBreadcrumb.tsx # 面包屑导航
│       │   │   ├── common/      # 通用组件
│       │   │   │   ├── DataTable/       # 数据表格组件
│       │   │   │   ├── DataForm/        # 数据表单组件
│       │   │   │   └── DataChart/       # 数据图表组件
│       │   │   └── admin/       # 管理员组件
│       │   ├── context/         # React上下文
│       │   │   ├── AppContext.tsx       # 应用全局上下文
│       │   │   └── AuthContext.tsx      # 认证上下文
│       │   ├── hooks/           # React自定义钩子
│       │   │   ├── useAuth.ts          # 认证相关钩子
│       │   │   ├── useData.ts          # 数据相关钩子
│       │   │   └── useUI.ts            # UI相关钩子
│       │   ├── pages/           # 页面组件
│       │   │   ├── admin/       # 管理员页面
│       │   │   │   ├── UserManagement.tsx    # 用户管理
│       │   │   │   ├── RoleManagement.tsx    # 角色管理
│       │   │   │   └── SystemSettings.tsx    # 系统设置
│       │   │   ├── auth/        # 认证相关页面
│       │   │   │   ├── Login.tsx             # 登录
│       │   │   │   ├── Register.tsx          # 注册
│       │   │   │   └── ForgotPassword.tsx    # 找回密码
│       │   │   ├── data/        # 数据管理页面
│       │   │   │   ├── DataTablesPage.tsx    # 数据表管理
│       │   │   │   ├── DataSetsPage.tsx      # 数据集管理
│       │   │   │   └── DataTemplatesPage.tsx # 数据模板
│       │   │   ├── matching/    # 数据匹配页面
│       │   │   │   ├── MatchingTasksPage.tsx # 匹配任务
│       │   │   │   └── MatchingResultsPage.tsx # 匹配结果
│       │   │   ├── analysis/    # 数据分析页面
│       │   │   │   ├── AnalysisToolsPage.tsx # 分析工具
│       │   │   │   ├── DataVisualizationPage.tsx # 数据可视化
│       │   │   │   └── DashboardsPage.tsx    # 仪表盘
│       │   │   ├── marketplace/ # 数据集市页面
│       │   │   │   ├── MarketplaceBrowsePage.tsx    # 浏览市场
│       │   │   │   ├── MarketplaceMyProductsPage.tsx # 我的产品
│       │   │   │   └── MarketplaceMyPurchasesPage.tsx # 我的购买
│       │   │   ├── Home.tsx     # 首页
│       │   │   ├── Profile.tsx  # 用户资料
│       │   │   ├── Projects.tsx # 项目管理
│       │   │   └── NotFound.tsx # 404页面
│       │   ├── router/          # 路由配置
│       │   │   └── index.tsx    # 路由定义
│       │   ├── services/        # API调用服务
│       │   │   ├── api.ts       # API请求封装
│       │   │   ├── auth.ts      # 认证相关API
│       │   │   ├── data.ts      # 数据相关API
│       │   │   └── user.ts      # 用户相关API
│       │   ├── styles/          # 样式文件
│       │   │   ├── global.css   # 全局样式
│       │   │   └── themes/      # 主题样式
│       │   ├── utils/           # 工具函数
│       │   │   ├── config.ts    # 全局配置
│       │   │   ├── auth.ts      # 认证工具
│       │   │   └── format.ts    # 格式化工具
│       │   └── main.tsx         # 应用入口文件
│       ├── nginx/         # Nginx配置
│       ├── dist/          # 构建输出目录
│       ├── index.html     # HTML入口文件
│       ├── tsconfig.json  # TypeScript配置
│       ├── vite.config.ts # Vite构建配置
│       ├── Dockerfile     # Docker构建配置
│       └── package.json   # 依赖配置
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

#### 目录结构详情
- **src/**: 前端源代码
  - **components/**: 可复用UI组件
    - **layout/**: 页面布局组件
      - **AppHeader.tsx**: 页面顶部导航栏组件
      - **AppSidebar.tsx**: 页面侧边栏导航组件 
      - **AppLayout.tsx**: 主布局组件，整合侧边栏、头部和内容区
      - **AppBreadcrumb.tsx**: 面包屑导航组件
    - **common/**: 通用组件
      - **DataTable/**: 数据表格组件
      - **DataForm/**: 数据表单组件
      - **DataChart/**: 数据图表组件
    - **admin/**: 管理员组件
  - **context/**: React上下文
    - **AppContext.tsx**: 应用全局上下文，管理用户状态和主题
    - **AuthContext.tsx**: 认证上下文，管理认证状态
  - **hooks/**: React自定义钩子
    - **useAuth.ts**: 认证相关钩子
    - **useData.ts**: 数据相关钩子
    - **useUI.ts**: UI相关钩子
  - **pages/**: 页面组件
    - **admin/**: 管理员页面
      - **UserManagement.tsx**: 用户管理页面
      - **RoleManagement.tsx**: 角色管理页面
      - **SystemSettings.tsx**: 系统设置页面
    - **auth/**: 认证相关页面
      - **Login.tsx**: 登录页面
      - **Register.tsx**: 注册页面
      - **ForgotPassword.tsx**: 找回密码页面
    - **data/**: 数据管理页面
      - **DataTablesPage.tsx**: 数据表管理页面
      - **DataSetsPage.tsx**: 数据集管理页面
      - **DataTemplatesPage.tsx**: 数据模板页面
    - **matching/**: 数据匹配页面
      - **MatchingTasksPage.tsx**: 匹配任务页面
      - **MatchingResultsPage.tsx**: 匹配结果页面
    - **analysis/**: 数据分析页面
      - **AnalysisToolsPage.tsx**: 分析工具页面
      - **DataVisualizationPage.tsx**: 数据可视化页面
      - **DashboardsPage.tsx**: 仪表盘页面
    - **marketplace/**: 数据集市页面
      - **MarketplaceBrowsePage.tsx**: 市场浏览页面
      - **MarketplaceMyProductsPage.tsx**: 我的产品页面
      - **MarketplaceMyPurchasesPage.tsx**: 我的购买页面
    - **Home.tsx**: 首页
    - **Profile.tsx**: 用户资料页面
    - **Projects.tsx**: 项目管理页面
    - **NotFound.tsx**: 404页面
  - **router/**: 路由配置
    - **index.tsx**: 路由定义，包含路由守卫
  - **services/**: API调用服务
    - **api.ts**: API请求封装
    - **auth.ts**: 认证相关API
    - **data.ts**: 数据相关API
    - **user.ts**: 用户相关API
  - **utils/**: 工具函数
    - **config.ts**: 全局配置
    - **auth.ts**: 认证工具
    - **format.ts**: 格式化工具
  - **main.tsx**: 应用入口文件
- **nginx/**: Nginx配置文件，用于生产环境部署
  - **default.conf**: Nginx服务器配置，处理SPA路由和API代理
- **Dockerfile**: 前端Docker构建文件，包含构建和生产两个阶段
- **vite.config.ts**: Vite构建工具配置

#### 技术栈
- **React 18**: UI库
- **TypeScript**: 类型系统
- **Ant Design 5**: UI组件库
- **React Router 6**: 路由管理
- **Axios**: HTTP客户端
- **Vite**: 构建工具

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

## Docker配置详情

项目使用Docker进行容器化部署，主要配置文件包括：

### docker-compose.yml

主要服务配置：

```yaml
services:
  # 后端API服务
  backend:
    build: ./src/backend
    ports: ["5000:5000"]
    environment:
      - FLASK_APP=gateway/app.py
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ecohub
      - MONGO_URI=mongodb://mongo:27017/ecohub
    depends_on: [db, mongo, redis]

  # 前端服务
  frontend:
    build: ./src/frontend
    volumes:
      - ./src/frontend:/app
      - /app/node_modules
    ports: ["3000:80"]
    depends_on: [backend]

  # 数据库和其他支持服务
  db: # PostgreSQL
  mongo: # MongoDB
  redis: # Redis
  pgadmin: # PostgreSQL管理工具
  mongo-express: # MongoDB管理工具
  redis-commander: # Redis管理工具
```

### 前端Dockerfile

前端采用多阶段构建：

```dockerfile
# 构建阶段
FROM node:16-alpine as build
WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Nginx配置

前端使用Nginx提供静态文件服务并处理SPA路由：

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://backend:5000/api/;
    }
}
```

## 开发环境设置

项目使用Docker进行开发环境管理，主要服务包括：

1. **backend**: Flask后端API服务
2. **frontend**: React前端应用
3. **db**: PostgreSQL数据库
4. **mongo**: MongoDB数据库
5. **redis**: Redis缓存
6. **pgadmin**: PostgreSQL管理工具
7. **mongo-express**: MongoDB管理工具
8. **redis-commander**: Redis管理工具

使用以下命令启动开发环境：

```bash
docker-compose up -d
```

## 访问地址

开发环境启动后，可通过以下地址访问各个服务：

- 前端: http://localhost:3000
- 后端API: http://localhost:5000
- PostgreSQL管理: http://localhost:8080
- MongoDB管理: http://localhost:8081
- Redis管理: http://localhost:8082

## 常见问题与解决方案

### 前端构建问题
如果在Docker环境中遇到"vite: command not found"错误，可能需要重新安装npm依赖或者修复Docker镜像。可以尝试的解决方案：

```bash
# 进入前端容器
docker exec -it ecohub-frontend-1 /bin/sh

# 重新安装依赖
npm install

# 或者使用npx运行vite
npx vite --host 0.0.0.0
```

### 登录跳转问题
如果登录后无法正确跳转，可能需要检查：
1. 浏览器控制台是否有错误信息
2. 确保token存储键名一致（config.ts和路由守卫使用相同键名）
3. 查看路由守卫逻辑是否正确

### Docker容器访问问题
如果需要修改容器内的文件或查看日志：

```bash
# 查看容器日志
docker logs ecohub-frontend-1

# 进入容器内部
docker exec -it ecohub-frontend-1 /bin/sh

# 重启前端容器
docker restart ecohub-frontend-1
``` 