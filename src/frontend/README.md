# EcoHub 前端

这是EcoHub生态系统管理平台的前端项目，基于React + TypeScript + Ant Design开发。

## 技术栈

- React 18
- TypeScript
- Ant Design 5.x
- React Router 6
- Axios
- Vite

## 开发环境设置

### 前提条件

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本（或者使用yarn/pnpm）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 运行

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/        # 共享组件
│   └── layout/        # 布局相关组件
├── pages/             # 页面组件
│   └── auth/          # 认证相关页面
├── services/          # API服务
├── styles/            # 全局样式
├── utils/             # 工具函数和常量
├── router/            # 路由配置
├── main.tsx           # 应用入口
└── ...
```

## 功能模块

- 用户认证（登录、注册、密码重置）
- 个人中心（个人资料、密码修改、活动记录）
- 项目管理（项目列表、创建、编辑）
- 数据分析（报表、图表）
- 系统管理（仅管理员可见）

## 开发指南

### 编码规范

- 遵循TypeScript和React的最佳实践
- 使用函数组件和Hooks而不是类组件
- 使用CSS模块或styled-components进行样式管理

### 提交规范

提交信息格式：`类型(范围): 描述`

类型包括：
- feat: 新功能
- fix: 修复Bug
- docs: 文档更新
- style: 样式更新
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### 分支管理

- main: 主分支，用于生产环境
- develop: 开发分支
- feature/*: 功能分支
- bugfix/*: Bug修复分支

## 部署

项目使用Docker进行容器化部署，详情请参考项目根目录的Docker相关文件。

## 许可证

[MIT](LICENSE) 