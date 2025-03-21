# EcoHub 项目文档

本目录包含EcoHub经济数据仓库项目的所有文档。

## 文档结构

- `product_backlog.md` - 产品待办事项清单，按优先级和Sprint计划组织的任务列表
- `design/` - 设计文档目录
  - `architecture.md` - 系统架构设计文档
  - `data_model.md` - 数据模型设计文档
  - `api_design.md` - API设计文档
  - `ui_design.md` - 前端界面设计文档
  - `project_plan.md` - 项目计划与里程碑文档
  - `requirements.md` - 需求分析文档

## 文档使用指南

1. **新成员入职**：首先阅读`requirements.md`了解项目需求，然后查看`architecture.md`了解系统架构。

2. **开发人员**：
   - 后端开发：参考`api_design.md`和`data_model.md`
   - 前端开发：参考`ui_design.md`和`api_design.md`
   - 全栈开发：参考所有设计文档

3. **项目管理**：参考`project_plan.md`和`product_backlog.md`进行任务规划和进度跟踪。

## 文档维护

所有文档应保持更新，当实现与设计发生变更时，相应的文档也应更新。文档更新应遵循以下原则：

1. 文档更改应通过拉取请求(Pull Request)进行
2. 重大更改应经过评审
3. 保持文档格式一致性
4. 更新文档时添加更新日期和简要说明

## 待办文档

未来需要补充的文档：

1. 开发环境搭建指南
2. 测试策略文档
3. 部署手册
4. 用户手册
5. API文档（自动生成） 